#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.local/dev"
PID_FILE="${RUNTIME_DIR}/pids.env"
META_FILE="${RUNTIME_DIR}/meta.env"
LOG_DIR="${RUNTIME_DIR}/logs"
COMPOSE_FILE="${ROOT_DIR}/server/docker-compose.yml"

is_pid_running() {
  local pid="$1"
  if [[ -z "${pid}" ]]; then
    return 1
  fi
  kill -0 "${pid}" >/dev/null 2>&1
}

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"${port}" || true
  fi
}

WEB_PID=""
API_PID=""
MONGO_STARTED=0
SANDBOX_TOOLS_STARTED=0
IDE_STARTED=0
STARTED_AT=""
COMPOSE_PROVIDER="none"
CONTAINER_RUNTIME="none"
RESOURCE_PROFILE="unknown"
MONGO_MEM_LIMIT=""
MONGO_CPUS=""
MONGO_WT_CACHE_GB=""

if [[ -f "${PID_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${PID_FILE}"
fi
if [[ -f "${META_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${META_FILE}"
fi

echo "Local stack status"
echo "=================="
if [[ -n "${STARTED_AT}" ]]; then
  echo "Started at: ${STARTED_AT}"
fi
echo "Container runtime: ${CONTAINER_RUNTIME:-none}"
echo "Compose provider: ${COMPOSE_PROVIDER:-none}"
echo "Resource profile: ${RESOURCE_PROFILE:-unknown}"
if [[ -n "${MONGO_MEM_LIMIT}" || -n "${MONGO_CPUS}" ]]; then
  echo "Mongo resources: mem=${MONGO_MEM_LIMIT:-n/a}, cpu=${MONGO_CPUS:-n/a}, wtCacheGB=${MONGO_WT_CACHE_GB:-n/a}"
fi
echo

if is_pid_running "${WEB_PID:-}"; then
  echo "Web: RUNNING (PID ${WEB_PID}) http://localhost:8080"
else
  WEB_EXTERNAL_PIDS="$(port_pids 8080)"
  if [[ -n "${WEB_EXTERNAL_PIDS}" ]]; then
    echo "Web: RUNNING (external PID(s): ${WEB_EXTERNAL_PIDS}) http://localhost:8080"
  else
    echo "Web: STOPPED"
  fi
fi

if is_pid_running "${API_PID:-}"; then
  echo "API: RUNNING (PID ${API_PID}) http://localhost:3001"
else
  API_EXTERNAL_PIDS="$(port_pids 3001)"
  if [[ -n "${API_EXTERNAL_PIDS}" ]]; then
    echo "API: RUNNING (external PID(s): ${API_EXTERNAL_PIDS}) http://localhost:3001"
  else
    echo "API: STOPPED"
  fi
fi

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
  return 1
}

if [[ "${COMPOSE_PROVIDER}" != "none" && ( "${MONGO_STARTED}" -eq 1 || "${SANDBOX_TOOLS_STARTED}" -eq 1 || "${IDE_STARTED}" -eq 1 ) ]]; then
  echo
  echo "Container services (${COMPOSE_PROVIDER}):"
  compose_exec ps || true
fi

echo
ide_container_running=0
if [[ "${COMPOSE_PROVIDER}" != "none" ]]; then
  if ide_ids="$(compose_exec --profile ide ps -q ide 2>/dev/null)" && [[ -n "${ide_ids// }" ]]; then
    ide_container_running=1
  fi
fi
if [[ "${IDE_STARTED:-0}" -eq 1 ]]; then
  if [[ "${ide_container_running}" -eq 1 ]]; then
    echo "IDE (code-server): RUNNING — http://localhost:13337 (started with last orchestrator run)"
  else
    echo "IDE (code-server): STOPPED — last start used --with-ide, but the ide container is not running"
  fi
else
  if [[ "${ide_container_running}" -eq 1 ]]; then
    echo "IDE (code-server): RUNNING — http://localhost:13337 (container up; not recorded on last orchestrator start)"
  elif [[ "${COMPOSE_PROVIDER}" == "none" ]]; then
    echo "IDE (code-server): not used — no compose-backed services in last orchestrator run (e.g. pure no-container without IDE)"
  else
    echo "IDE (code-server): not enabled in last orchestrator run"
  fi
fi

echo
echo "Logs:"
echo "- ${LOG_DIR}/web.log"
echo "- ${LOG_DIR}/api.log"
