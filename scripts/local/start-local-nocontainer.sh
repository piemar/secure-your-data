#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
START_SCRIPT="${ROOT_DIR}/scripts/local/start-local.sh"
SERVER_ENV="${ROOT_DIR}/server/.env"
CHECK_ONLY=0
WITH_IDE_EXPLICIT=0
WITHOUT_IDE=0

PASS_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --check-only)
      CHECK_ONLY=1
      ;;
    --with-ide)
      WITH_IDE_EXPLICIT=1
      PASS_ARGS+=("$arg")
      ;;
    --without-ide)
      WITHOUT_IDE=1
      ;;
    *)
      PASS_ARGS+=("$arg")
      ;;
  esac
done

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "Missing required tool: ${cmd}"
    return 1
  fi
}

resolve_mongo_uri() {
  if [[ -f "${SERVER_ENV}" ]]; then
    local line
    line="$(grep -E '^MONGODB_URI=' "${SERVER_ENV}" | head -n 1 || true)"
    if [[ -n "${line}" ]]; then
      echo "${line#MONGODB_URI=}"
      return 0
    fi
  fi
  echo "mongodb://127.0.0.1:27017"
}

validate_mongo_reachable() {
  local uri="$1"
  local ping_out
  if ! ping_out="$(mongosh "${uri}/admin" --quiet --eval "db.runCommand({ ping: 1 }).ok" 2>/dev/null || true)"; then
    echo "Failed to run mongosh ping against ${uri}"
    return 1
  fi

  if [[ "$(echo "${ping_out}" | tr -d '[:space:]')" != "1" ]]; then
    echo "MongoDB is not reachable at ${uri}"
    echo "Tip: start local MongoDB service or set MONGODB_URI in server/.env to a reachable cluster."
    return 1
  fi
}

redact_mongo_uri() {
  local uri="$1"
  echo "${uri}" | sed -E 's#(mongodb(\+srv)?://)[^/@]+@#\1***:***@#'
}

echo "Validating local no-container prerequisites..."
require_cmd node
require_cmd npm
require_cmd mongosh

MONGO_URI="$(resolve_mongo_uri)"
validate_mongo_reachable "${MONGO_URI}"
echo "Preflight passed. MongoDB reachable at $(redact_mongo_uri "${MONGO_URI}")"

if [[ "${CHECK_ONLY}" -eq 1 ]]; then
  exit 0
fi

# No-container mode defaults to IDE-on so code-server is started without requiring extra flags.
if [[ "${WITHOUT_IDE}" -eq 0 && "${WITH_IDE_EXPLICIT}" -eq 0 ]]; then
  PASS_ARGS+=("--with-ide")
fi

if [[ "${#PASS_ARGS[@]}" -gt 0 ]]; then
  bash "${START_SCRIPT}" --no-docker-mongo "${PASS_ARGS[@]}"
else
  bash "${START_SCRIPT}" --no-docker-mongo
fi
