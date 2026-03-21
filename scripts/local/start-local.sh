#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.local/dev"
LOG_DIR="${RUNTIME_DIR}/logs"
PID_FILE="${RUNTIME_DIR}/pids.env"
META_FILE="${RUNTIME_DIR}/meta.env"
COMPOSE_FILE="${ROOT_DIR}/server/docker-compose.yml"

WITH_SANDBOX_TOOLS=0
WITH_IDE=0
NO_DOCKER_MONGO=0
AUTO_INSTALL_RUNTIME=1
YES_INSTALL_RUNTIME=0
LOCAL_CONTAINER_RUNTIME="${LOCAL_CONTAINER_RUNTIME:-auto}"
LOCAL_RESOURCE_PROFILE="${LOCAL_RESOURCE_PROFILE:-dev}"
CONTAINER_RUNTIME="none"
COMPOSE_PROVIDER="none"

for arg in "$@"; do
  case "$arg" in
    --with-sandbox-tools)
      WITH_SANDBOX_TOOLS=1
      ;;
    --with-ide)
      WITH_IDE=1
      ;;
    --no-docker-mongo)
      NO_DOCKER_MONGO=1
      ;;
    --no-auto-install-runtime)
      AUTO_INSTALL_RUNTIME=0
      ;;
    --yes-install-runtime)
      YES_INSTALL_RUNTIME=1
      ;;
    --resource-profile=*)
      LOCAL_RESOURCE_PROFILE="${arg#*=}"
      ;;
    *)
      echo "Unknown flag: ${arg}"
      echo "Usage: $0 [--with-sandbox-tools] [--with-ide] [--no-docker-mongo] [--no-auto-install-runtime] [--yes-install-runtime] [--resource-profile=dev|standard|high]"
      exit 1
      ;;
  esac
done

mkdir -p "${LOG_DIR}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"${port}" || true
  fi
}

is_pid_running() {
  local pid="$1"
  if [[ -z "${pid}" ]]; then
    return 1
  fi
  kill -0 "${pid}" >/dev/null 2>&1
}

load_existing_pids() {
  if [[ -f "${PID_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${PID_FILE}"
  fi
}

os_name() {
  uname -s | tr '[:upper:]' '[:lower:]'
}

can_prompt_user() {
  [[ -t 0 && -t 1 ]]
}

INSTALL_APPROVED_PODMAN=0
INSTALL_APPROVED_COLIMA=0

confirm_runtime_install() {
  local runtime="$1"
  local human
  local approved_var
  local answer

  if [[ "${AUTO_INSTALL_RUNTIME}" -ne 1 ]]; then
    return 1
  fi
  if [[ "${YES_INSTALL_RUNTIME}" -eq 1 ]]; then
    return 0
  fi

  if [[ "${runtime}" == "podman" ]]; then
    approved_var="INSTALL_APPROVED_PODMAN"
    human="Podman"
  else
    approved_var="INSTALL_APPROVED_COLIMA"
    human="Colima"
  fi

  # shellcheck disable=SC2154
  if [[ "${!approved_var:-0}" -eq 1 ]]; then
    return 0
  fi

  if ! can_prompt_user; then
    echo "Skipping ${human} auto-install (no interactive terminal)."
    echo "Tip: rerun with --yes-install-runtime to auto-approve runtime installation."
    return 1
  fi

  read -r -p "${human} is not installed. Install it now? [y/N]: " answer
  case "${answer}" in
    y|Y|yes|YES)
      if [[ "${runtime}" == "podman" ]]; then
        INSTALL_APPROVED_PODMAN=1
      else
        INSTALL_APPROVED_COLIMA=1
      fi
      return 0
      ;;
  esac
  return 1
}

print_runtime_version_if_available() {
  local tool="$1"
  if command -v "${tool}" >/dev/null 2>&1; then
    local version
    version="$("${tool}" --version 2>/dev/null | head -n 1 || true)"
    if [[ -n "${version}" ]]; then
      echo "${tool} version: ${version}"
    fi
  fi
}

docker_ready() {
  command -v docker >/dev/null 2>&1 &&
    docker compose version >/dev/null 2>&1 &&
    docker info >/dev/null 2>&1
}

podman_ready() {
  command -v podman >/dev/null 2>&1 && podman info >/dev/null 2>&1
}

ensure_podman_machine() {
  if ! command -v podman >/dev/null 2>&1; then
    return 1
  fi
  if podman info >/dev/null 2>&1; then
    return 0
  fi
  local os
  os="$(os_name)"
  if [[ "${os}" != "darwin" && "${os}" != "linux" ]]; then
    return 1
  fi
  if podman machine inspect >/dev/null 2>&1; then
    podman machine start >/dev/null 2>&1 || true
  else
    podman machine init >/dev/null 2>&1 || true
    podman machine start >/dev/null 2>&1 || true
  fi
  podman info >/dev/null 2>&1
}

podman_compose_mode() {
  if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    echo "podman_compose"
    return 0
  fi
  if command -v podman-compose >/dev/null 2>&1; then
    echo "podman-compose"
    return 0
  fi
  return 1
}

maybe_bootstrap_colima() {
  local os
  os="$(os_name)"
  if [[ "${os}" != "darwin" && "${os}" != "linux" ]]; then
    return 1
  fi
  if command -v colima >/dev/null 2>&1; then
    colima start >/dev/null 2>&1 || true
    docker_ready
    return $?
  fi
  if [[ "${os}" == "darwin" && "$(command -v brew || true)" != "" ]] && confirm_runtime_install "colima"; then
    echo "Docker runtime unavailable. Attempting Colima bootstrap via Homebrew..."
    brew install colima docker >/dev/null || true
    if command -v colima >/dev/null 2>&1; then
      colima start >/dev/null 2>&1 || true
      print_runtime_version_if_available "colima"
      print_runtime_version_if_available "docker"
      docker_ready
      return $?
    fi
    echo "Warning: Colima bootstrap attempted but colima is still unavailable."
  fi
  return 1
}

maybe_bootstrap_podman() {
  local os
  os="$(os_name)"
  if [[ "${os}" != "darwin" && "${os}" != "linux" ]]; then
    return 1
  fi
  if podman_ready || ensure_podman_machine; then
    return 0
  fi
  if [[ "${os}" == "darwin" && "$(command -v brew || true)" != "" ]] && confirm_runtime_install "podman"; then
      echo "Podman runtime unavailable. Attempting Podman install via Homebrew..."
      brew install podman >/dev/null || true
    elif [[ "${os}" == "linux" ]] && confirm_runtime_install "podman"; then
      if command -v apt-get >/dev/null 2>&1; then
        echo "Podman runtime unavailable. Attempting Podman install via apt..."
        sudo apt-get update >/dev/null 2>&1 || true
        sudo apt-get install -y podman >/dev/null 2>&1 || true
      elif command -v dnf >/dev/null 2>&1; then
        echo "Podman runtime unavailable. Attempting Podman install via dnf..."
        sudo dnf install -y podman >/dev/null 2>&1 || true
      fi
  fi
  if command -v podman >/dev/null 2>&1; then
    print_runtime_version_if_available "podman"
  fi
  if ! podman_ready && !ensure_podman_machine; then
    echo "Warning: Podman bootstrap attempted but podman is still unavailable."
    return 1
  fi
  return 0
}

configure_compose_runtime() {
  local requested
  requested="$(echo "${LOCAL_CONTAINER_RUNTIME}" | tr '[:upper:]' '[:lower:]')"

  if [[ "${requested}" == "docker" || "${requested}" == "docker-desktop" || "${requested}" == "docker_engine" ]]; then
    if docker_ready; then
      CONTAINER_RUNTIME="docker"
      COMPOSE_PROVIDER="docker_compose"
      return 0
    fi
    if maybe_bootstrap_colima && docker_ready; then
      CONTAINER_RUNTIME="colima"
      COMPOSE_PROVIDER="docker_compose"
      return 0
    fi
    return 1
  fi

  if [[ "${requested}" == "podman" ]]; then
    if podman_ready || ensure_podman_machine || maybe_bootstrap_podman; then
      local mode
      mode="$(podman_compose_mode || true)"
      if [[ -n "${mode}" ]]; then
        CONTAINER_RUNTIME="podman"
        COMPOSE_PROVIDER="${mode}"
        return 0
      fi
    fi
    if maybe_bootstrap_colima && docker_ready; then
      CONTAINER_RUNTIME="colima"
      COMPOSE_PROVIDER="docker_compose"
      return 0
    fi
    if docker_ready; then
      CONTAINER_RUNTIME="docker"
      COMPOSE_PROVIDER="docker_compose"
      return 0
    fi
    return 1
  fi

  # auto mode
  if docker_ready; then
    CONTAINER_RUNTIME="docker"
    COMPOSE_PROVIDER="docker_compose"
    return 0
  fi
  if maybe_bootstrap_colima && docker_ready; then
    CONTAINER_RUNTIME="colima"
    COMPOSE_PROVIDER="docker_compose"
    return 0
  fi
  if podman_ready; then
    local mode
    mode="$(podman_compose_mode || true)"
    if [[ -n "${mode}" ]]; then
      CONTAINER_RUNTIME="podman"
      COMPOSE_PROVIDER="${mode}"
      return 0
    fi
  fi
  return 1
}

configure_resource_profile_defaults() {
  local profile
  profile="$(echo "${LOCAL_RESOURCE_PROFILE}" | tr '[:upper:]' '[:lower:]')"
  case "${profile}" in
    dev)
      export MONGO_MEM_LIMIT="${MONGO_MEM_LIMIT:-384m}"
      export MONGO_CPUS="${MONGO_CPUS:-0.50}"
      export MONGO_PIDS_LIMIT="${MONGO_PIDS_LIMIT:-256}"
      export MONGO_WT_CACHE_GB="${MONGO_WT_CACHE_GB:-0.25}"
      export SANDBOX_TOOLS_MEM_LIMIT="${SANDBOX_TOOLS_MEM_LIMIT:-256m}"
      export SANDBOX_TOOLS_CPUS="${SANDBOX_TOOLS_CPUS:-0.50}"
      export SANDBOX_TOOLS_PIDS_LIMIT="${SANDBOX_TOOLS_PIDS_LIMIT:-256}"
      ;;
    standard)
      export MONGO_MEM_LIMIT="${MONGO_MEM_LIMIT:-1024m}"
      export MONGO_CPUS="${MONGO_CPUS:-1.00}"
      export MONGO_PIDS_LIMIT="${MONGO_PIDS_LIMIT:-512}"
      export MONGO_WT_CACHE_GB="${MONGO_WT_CACHE_GB:-0.50}"
      export SANDBOX_TOOLS_MEM_LIMIT="${SANDBOX_TOOLS_MEM_LIMIT:-512m}"
      export SANDBOX_TOOLS_CPUS="${SANDBOX_TOOLS_CPUS:-1.00}"
      export SANDBOX_TOOLS_PIDS_LIMIT="${SANDBOX_TOOLS_PIDS_LIMIT:-512}"
      ;;
    high)
      export MONGO_MEM_LIMIT="${MONGO_MEM_LIMIT:-2048m}"
      export MONGO_CPUS="${MONGO_CPUS:-2.00}"
      export MONGO_PIDS_LIMIT="${MONGO_PIDS_LIMIT:-1024}"
      export MONGO_WT_CACHE_GB="${MONGO_WT_CACHE_GB:-1.00}"
      export SANDBOX_TOOLS_MEM_LIMIT="${SANDBOX_TOOLS_MEM_LIMIT:-1024m}"
      export SANDBOX_TOOLS_CPUS="${SANDBOX_TOOLS_CPUS:-1.50}"
      export SANDBOX_TOOLS_PIDS_LIMIT="${SANDBOX_TOOLS_PIDS_LIMIT:-1024}"
      ;;
    *)
      echo "Unknown LOCAL_RESOURCE_PROFILE='${LOCAL_RESOURCE_PROFILE}'. Supported: dev | standard | high."
      exit 1
      ;;
  esac
  LOCAL_RESOURCE_PROFILE="${profile}"
}

compose_exec() {
  if [[ "${COMPOSE_PROVIDER}" == "docker_compose" ]]; then
    docker compose -f "${COMPOSE_FILE}" "$@"
    return $?
  fi
  if [[ "${COMPOSE_PROVIDER}" == "podman_compose" ]]; then
    podman compose -f "${COMPOSE_FILE}" "$@"
    return $?
  fi
  if [[ "${COMPOSE_PROVIDER}" == "podman-compose" ]]; then
    podman-compose -f "${COMPOSE_FILE}" "$@"
    return $?
  fi
  echo "No compose provider configured."
  return 1
}

require_cmd npm
require_cmd node

load_existing_pids
configure_resource_profile_defaults

if is_pid_running "${WEB_PID:-}"; then
  echo "Web dev server already running with PID ${WEB_PID}"
  echo "Use: bash scripts/local/stop-local.sh"
  exit 1
fi
if is_pid_running "${API_PID:-}"; then
  echo "API dev server already running with PID ${API_PID}"
  echo "Use: bash scripts/local/stop-local.sh"
  exit 1
fi

WEB_STARTED=0
API_STARTED=0
WEB_EXTERNAL_PIDS="$(port_pids 8080)"
API_EXTERNAL_PIDS="$(port_pids 3001)"

MONGO_STARTED=0
SANDBOX_TOOLS_STARTED=0
IDE_STARTED=0

NEEDS_CONTAINER_RUNTIME=0
if [[ "${NO_DOCKER_MONGO}" -eq 0 || "${WITH_SANDBOX_TOOLS}" -eq 1 || "${WITH_IDE}" -eq 1 ]]; then
  NEEDS_CONTAINER_RUNTIME=1
fi

if [[ "${NEEDS_CONTAINER_RUNTIME}" -eq 1 ]]; then
  if configure_compose_runtime; then
    print_runtime_version_if_available "${CONTAINER_RUNTIME}"
    if [[ "${COMPOSE_PROVIDER}" == "docker_compose" ]]; then
      echo "compose provider: $(docker compose version 2>/dev/null | head -n 1 || echo docker compose)"
    elif [[ "${COMPOSE_PROVIDER}" == "podman_compose" ]]; then
      echo "compose provider: $(podman compose version 2>/dev/null | head -n 1 || echo podman compose)"
    elif [[ "${COMPOSE_PROVIDER}" == "podman-compose" ]]; then
      echo "compose provider: $(podman-compose --version 2>/dev/null | head -n 1 || echo podman-compose)"
    fi
    if [[ "${NO_DOCKER_MONGO}" -eq 0 ]]; then
      echo "Starting MongoDB via ${CONTAINER_RUNTIME}/${COMPOSE_PROVIDER}..."
      echo "Resource profile: ${LOCAL_RESOURCE_PROFILE} (mongo ${MONGO_MEM_LIMIT}, ${MONGO_CPUS} CPU, WT cache ${MONGO_WT_CACHE_GB}GB)"
      if compose_exec up -d mongo >/dev/null; then
        MONGO_STARTED=1
      else
        echo "Warning: container runtime detected, but Mongo start failed."
        echo "Make sure MongoDB is available at MONGODB_URI (server/.env) before using API."
      fi
    fi
    if [[ "${WITH_SANDBOX_TOOLS}" -eq 1 ]]; then
      echo "Starting sandbox-tools container..."
      if compose_exec --profile sandbox up -d sandbox-tools >/dev/null; then
        SANDBOX_TOOLS_STARTED=1
      else
        echo "Warning: sandbox-tools container failed to start."
      fi
    fi
    if [[ "${WITH_IDE}" -eq 1 ]]; then
      echo "Starting code-server IDE container..."
      if compose_exec --profile ide up -d ide >/dev/null; then
        IDE_STARTED=1
      else
        echo "Warning: code-server container failed to start."
      fi
    fi
  else
    echo "Warning: no compatible container runtime detected (docker/colima/podman)."
    echo "Make sure MongoDB is available at MONGODB_URI (server/.env) before using API."
  fi
fi

if [[ -n "${API_EXTERNAL_PIDS}" ]]; then
  echo "API port 3001 already in use by PID(s): ${API_EXTERNAL_PIDS}"
  echo "Skipping API start and reusing external process."
  API_PID=""
else
  echo "Starting API dev server..."
  DEFAULT_TERMINAL_EXECUTOR="local"
  DEFAULT_TERMINAL_DOCKER_IMAGE=""
  if [[ "${WITH_SANDBOX_TOOLS}" -eq 1 && "${CONTAINER_RUNTIME}" != "none" ]]; then
    DEFAULT_TERMINAL_EXECUTOR="docker"
    DEFAULT_TERMINAL_DOCKER_IMAGE="server-sandbox-tools"
  fi
  (
    cd "${ROOT_DIR}/server"
    CONTAINER_TERMINAL_ENABLED="${CONTAINER_TERMINAL_ENABLED:-true}" \
    TERMINAL_WS_SHELL_ENABLED="${TERMINAL_WS_SHELL_ENABLED:-true}" \
    TERMINAL_WS_EXECUTOR="${TERMINAL_WS_EXECUTOR:-${DEFAULT_TERMINAL_EXECUTOR}}" \
    TERMINAL_DOCKER_IMAGE="${TERMINAL_DOCKER_IMAGE:-${DEFAULT_TERMINAL_DOCKER_IMAGE}}" \
    FULL_IDE_ENABLED="${FULL_IDE_ENABLED:-$([[ "${WITH_IDE}" -eq 1 ]] && echo true || echo false)}" \
    FULL_IDE_BASE_URL="${FULL_IDE_BASE_URL:-http://localhost:13337}" \
    nohup npm run dev >"${LOG_DIR}/api.log" 2>&1 &
    echo "$!" >"${RUNTIME_DIR}/api.pid"
  )
  API_PID="$(cat "${RUNTIME_DIR}/api.pid")"
  rm -f "${RUNTIME_DIR}/api.pid"
  API_STARTED=1
fi

if [[ -n "${WEB_EXTERNAL_PIDS}" ]]; then
  echo "Web port 8080 already in use by PID(s): ${WEB_EXTERNAL_PIDS}"
  echo "Skipping web start and reusing external process."
  WEB_PID=""
else
  echo "Starting web dev server..."
  (
    cd "${ROOT_DIR}"
    nohup npm run dev >"${LOG_DIR}/web.log" 2>&1 &
    echo "$!" >"${RUNTIME_DIR}/web.pid"
  )
  WEB_PID="$(cat "${RUNTIME_DIR}/web.pid")"
  rm -f "${RUNTIME_DIR}/web.pid"
  WEB_STARTED=1
fi

cat >"${PID_FILE}" <<EOF
WEB_PID=${WEB_PID}
API_PID=${API_PID}
EOF

cat >"${META_FILE}" <<EOF
MONGO_STARTED=${MONGO_STARTED}
SANDBOX_TOOLS_STARTED=${SANDBOX_TOOLS_STARTED}
IDE_STARTED=${IDE_STARTED}
WEB_STARTED=${WEB_STARTED}
API_STARTED=${API_STARTED}
CONTAINER_RUNTIME=${CONTAINER_RUNTIME}
COMPOSE_PROVIDER=${COMPOSE_PROVIDER}
RESOURCE_PROFILE=${LOCAL_RESOURCE_PROFILE}
MONGO_MEM_LIMIT=${MONGO_MEM_LIMIT}
MONGO_CPUS=${MONGO_CPUS}
MONGO_WT_CACHE_GB=${MONGO_WT_CACHE_GB}
SANDBOX_TOOLS_MEM_LIMIT=${SANDBOX_TOOLS_MEM_LIMIT}
SANDBOX_TOOLS_CPUS=${SANDBOX_TOOLS_CPUS}
STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo
echo "Local stack started."
if [[ "${WEB_STARTED}" -eq 1 ]]; then
  echo "- Web: http://localhost:8080 (PID ${WEB_PID})"
else
  echo "- Web: http://localhost:8080 (already running externally)"
fi
if [[ "${API_STARTED}" -eq 1 ]]; then
  echo "- API: http://localhost:3001 (PID ${API_PID})"
else
  echo "- API: http://localhost:3001 (already running externally)"
fi
if [[ "${MONGO_STARTED}" -eq 1 ]]; then
  echo "- MongoDB: mongodb://127.0.0.1:27017 (${CONTAINER_RUNTIME})"
fi
if [[ "${SANDBOX_TOOLS_STARTED}" -eq 1 ]]; then
  echo "- Sandbox tools: running (docker profile: sandbox)"
fi
if [[ "${IDE_STARTED}" -eq 1 ]]; then
  echo "- Full IDE (code-server): http://localhost:13337"
fi
echo
echo "Logs:"
echo "- ${LOG_DIR}/web.log"
echo "- ${LOG_DIR}/api.log"
echo
echo "Use 'bash scripts/local/status-local.sh' to inspect status."
echo "Use 'bash scripts/local/stop-local.sh' to stop cleanly."
