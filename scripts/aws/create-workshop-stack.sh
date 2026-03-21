#!/usr/bin/env bash
set -euo pipefail

WORKSHOP_ID="${1:-}"
TENANT_ID="${2:-}"
EXPIRES_AT="${3:-}"

if [[ -z "${WORKSHOP_ID}" || -z "${TENANT_ID}" ]]; then
  echo "Usage: bash scripts/aws/create-workshop-stack.sh <workshop_id> <tenant_id> [expires_at_iso]"
  exit 1
fi

if [[ -z "${EXPIRES_AT}" ]]; then
  EXPIRES_AT="$(date -u -v+4H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d '+4 hour' +"%Y-%m-%dT%H:%M:%SZ")"
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STACK_DIR="${ROOT_DIR}/infra/terraform/live/workshop"

terraform -chdir="${STACK_DIR}" plan \
  -var-file="terraform.tfvars" \
  -var="workshop_id=${WORKSHOP_ID}" \
  -var="tenant_id=${TENANT_ID}" \
  -var="expires_at=${EXPIRES_AT}"

terraform -chdir="${STACK_DIR}" apply \
  -var-file="terraform.tfvars" \
  -var="workshop_id=${WORKSHOP_ID}" \
  -var="tenant_id=${TENANT_ID}" \
  -var="expires_at=${EXPIRES_AT}"

