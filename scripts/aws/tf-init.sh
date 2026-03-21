#!/usr/bin/env bash
set -euo pipefail

STACK="${1:-}"
if [[ -z "${STACK}" ]]; then
  echo "Usage: bash scripts/aws/tf-init.sh <control-plane|sandbox-base|workshop>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STACK_DIR="${ROOT_DIR}/infra/terraform/live/${STACK}"
BACKEND_FILE="${STACK_DIR}/backend.hcl"

if [[ ! -d "${STACK_DIR}" ]]; then
  echo "Unknown stack: ${STACK}"
  exit 1
fi

if [[ ! -f "${BACKEND_FILE}" ]]; then
  echo "Missing backend config: ${BACKEND_FILE}"
  exit 1
fi

terraform -chdir="${STACK_DIR}" init -backend-config="${BACKEND_FILE}"
echo "Initialized ${STACK}."

