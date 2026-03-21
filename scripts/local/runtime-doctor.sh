#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/server/docker-compose.yml"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

os_name() {
  local raw
  raw="$(uname -s | tr '[:upper:]' '[:lower:]')"
  case "${raw}" in
    darwin*) echo "darwin" ;;
    linux*) echo "linux" ;;
    msys*|mingw*|cygwin*) echo "windows" ;;
    *) echo "${raw}" ;;
  esac
}

log_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "[PASS] $1"
}

log_warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "[WARN] $1"
}

log_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "[FAIL] $1"
}

print_install_hint() {
  local runtime="$1"
  local os="$2"
  echo "       Remediation:"
  case "${runtime}:${os}" in
    docker:darwin)
      echo "       - Install Docker Desktop, then open it once."
      echo "       - Or: brew install colima docker && colima start"
      ;;
    docker:linux)
      echo "       - Install Docker Engine + Compose plugin."
      echo "       - Example: sudo apt-get install -y docker.io docker-compose-plugin"
      ;;
    docker:windows)
      echo "       - Install Docker Desktop and ensure WSL2 backend is enabled."
      ;;
    podman:darwin)
      echo "       - Install Podman: brew install podman"
      echo "       - Initialize machine: podman machine init && podman machine start"
      ;;
    podman:linux)
      echo "       - Install Podman: sudo apt-get install -y podman  (or dnf install podman)"
      ;;
    podman:windows)
      echo "       - Install Podman: winget install -e --id RedHat.Podman"
      echo "       - Initialize machine: podman machine init && podman machine start"
      ;;
    colima:darwin)
      echo "       - Install Colima: brew install colima docker"
      echo "       - Start VM: colima start"
      ;;
    colima:linux)
      echo "       - Optional alternative: use Docker Engine or Podman directly on Linux."
      ;;
    *)
      echo "       - Check the local runtime setup in README."
      ;;
  esac
}

check_docker() {
  local os="$1"
  if ! have_cmd docker; then
    log_warn "docker CLI not found."
    print_install_hint docker "${os}"
    return
  fi
  log_pass "docker CLI is installed ($(docker --version 2>/dev/null || echo 'version unknown'))."

  if docker compose version >/dev/null 2>&1; then
    log_pass "docker compose plugin is available."
  else
    log_warn "docker compose plugin is unavailable."
    echo "       Remediation:"
    echo "       - Install Docker Compose plugin."
  fi

  if docker info >/dev/null 2>&1; then
    log_pass "docker daemon is reachable."
  else
    log_warn "docker daemon is not reachable."
    echo "       Remediation:"
    echo "       - Start Docker Desktop / Docker Engine."
    if [[ "${os}" == "darwin" ]]; then
      echo "       - If using Colima: colima start"
    fi
  fi
}

podman_compose_mode() {
  if have_cmd podman && podman compose version >/dev/null 2>&1; then
    echo "podman_compose"
    return 0
  fi
  if have_cmd podman-compose; then
    echo "podman-compose"
    return 0
  fi
  return 1
}

check_podman() {
  local os="$1"
  if ! have_cmd podman; then
    log_warn "podman CLI not found."
    print_install_hint podman "${os}"
    return
  fi

  log_pass "podman CLI is installed ($(podman --version 2>/dev/null || echo 'version unknown'))."

  if podman info >/dev/null 2>&1; then
    log_pass "podman is reachable."
  else
    log_warn "podman is installed but not reachable (machine/service not started)."
    echo "       Remediation:"
    echo "       - Run: podman machine init  (first time only)"
    echo "       - Run: podman machine start"
  fi

  local mode
  mode="$(podman_compose_mode || true)"
  if [[ -n "${mode}" ]]; then
    log_pass "podman compose provider detected (${mode})."
  else
    log_warn "no podman compose provider found."
    echo "       Remediation:"
    echo "       - Use podman compose (newer Podman) or install podman-compose."
  fi
}

check_colima() {
  local os="$1"
  if [[ "${os}" != "darwin" && "${os}" != "linux" ]]; then
    log_warn "colima check skipped on ${os}."
    return
  fi

  if ! have_cmd colima; then
    log_warn "colima CLI not found."
    print_install_hint colima "${os}"
    return
  fi

  local status
  status="$(colima status 2>/dev/null || true)"
  if echo "${status}" | rg -qi "running"; then
    log_pass "colima VM is running."
  else
    log_warn "colima is installed but VM is not running."
    echo "       Remediation:"
    echo "       - Run: colima start"
  fi
}

recommend_provider() {
  if have_cmd docker && docker compose version >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "docker_compose"
    return
  fi
  if have_cmd podman && podman info >/dev/null 2>&1; then
    local mode
    mode="$(podman_compose_mode || true)"
    if [[ -n "${mode}" ]]; then
      echo "${mode}"
      return
    fi
  fi
  echo "none"
}

check_compose_file() {
  if [[ -f "${COMPOSE_FILE}" ]]; then
    log_pass "compose file found at server/docker-compose.yml."
  else
    log_fail "compose file missing: ${COMPOSE_FILE}"
  fi
}

main() {
  local os
  os="$(os_name)"

  echo "Local Runtime Doctor"
  echo "===================="
  echo "OS: ${os}"
  echo

  check_compose_file
  check_docker "${os}"
  check_podman "${os}"
  check_colima "${os}"

  local provider
  provider="$(recommend_provider)"
  echo
  if [[ "${provider}" == "none" ]]; then
    log_fail "No healthy compose provider detected."
    echo "       Expected by local scripts: docker_compose | podman_compose | podman-compose"
  else
    log_pass "Recommended compose provider: ${provider}"
  fi

  echo
  echo "Summary: ${PASS_COUNT} pass, ${WARN_COUNT} warn, ${FAIL_COUNT} fail"
  if [[ "${FAIL_COUNT}" -gt 0 ]]; then
    exit 1
  fi
}

main "$@"
