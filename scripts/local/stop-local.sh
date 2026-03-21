#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.local/dev"
PID_FILE="${RUNTIME_DIR}/pids.env"
META_FILE="${RUNTIME_DIR}/meta.env"
COMPOSE_FILE="${ROOT_DIR}/server/docker-compose.yml"

PURGE_MONGO=0

for arg in "$@"; do
  case "$arg" in
    --purge-mongo)
      PURGE_MONGO=1
      ;;
    *)
      echo "Unknown flag: ${arg}"
      echo "Usage: $0 [--purge-mongo]"
      exit 1
      ;;
  esac
done

is_pid_running() {
  local pid="$1"
  if [[ -z "${pid}" ]]; then
    return 1
  fi
  kill -0 "${pid}" >/dev/null 2>&1
}

stop_pid() {
  local name="$1"
  local pid="$2"
  if ! is_pid_running "${pid}"; then
    echo "${name}: not running"
    return 0
  fi
  echo "${name}: sending SIGTERM to PID ${pid}"
  kill -TERM "${pid}" >/dev/null 2>&1 || true
  for _ in {1..20}; do
    if ! is_pid_running "${pid}"; then
      echo "${name}: stopped"
      return 0
    fi
    sleep 0.25
  done
  echo "${name}: forcing stop (SIGKILL) for PID ${pid}"
  kill -KILL "${pid}" >/dev/null 2>&1 || true
}

WEB_PID=""
API_PID=""
MONGO_STARTED=0
SANDBOX_TOOLS_STARTED=0
IDE_STARTED=0
COMPOSE_PROVIDER="none"

if [[ -f "${PID_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${PID_FILE}"
fi
if [[ -f "${META_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${META_FILE}"
fi

stop_pid "Web dev server" "${WEB_PID:-}"
stop_pid "API dev server" "${API_PID:-}"

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

if [[ "${COMPOSE_PROVIDER}" != "none" ]]; then
  if [[ "${SANDBOX_TOOLS_STARTED}" -eq 1 ]]; then
    echo "Stopping sandbox-tools container..."
    compose_exec stop sandbox-tools >/dev/null || true
  fi
  if [[ "${IDE_STARTED}" -eq 1 ]]; then
    echo "Stopping code-server IDE container..."
    compose_exec --profile ide stop ide >/dev/null || true
  fi
  if [[ "${MONGO_STARTED}" -eq 1 ]]; then
    if [[ "${PURGE_MONGO}" -eq 1 ]]; then
      echo "Stopping and removing MongoDB container + volume..."
      compose_exec down -v >/dev/null || true
    else
      echo "Stopping MongoDB container..."
      compose_exec stop mongo >/dev/null || true
    fi
  fi
fi

rm -f "${PID_FILE}" "${META_FILE}"

echo "Local stack stopped."
