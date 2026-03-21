#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Prefer non-Docker Desktop runtimes.
# start-local.sh now handles fallback order for requested "podman":
# podman -> colima -> docker.
export LOCAL_CONTAINER_RUNTIME="${LOCAL_CONTAINER_RUNTIME:-podman}"

bash "${ROOT_DIR}/scripts/local/start-local.sh" "$@"
