#!/usr/bin/env bash
set -euo pipefail

WORKSHOP_ID="${1:-}"
TENANT_ID="${2:-tenant-default}"
EXPIRES_AT="${3:-2099-01-01T00:00:00Z}"

if [[ -z "${WORKSHOP_ID}" ]]; then
  echo "Usage: bash scripts/aws/destroy-workshop-stack.sh <workshop_id> [tenant_id] [expires_at_iso]"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STACK_DIR="${ROOT_DIR}/infra/terraform/live/workshop"

terraform -chdir="${STACK_DIR}" destroy \
  -var-file="terraform.tfvars" \
  -var="workshop_id=${WORKSHOP_ID}" \
  -var="tenant_id=${TENANT_ID}" \
  -var="expires_at=${EXPIRES_AT}"

