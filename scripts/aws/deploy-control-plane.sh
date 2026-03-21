#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STACK_DIR="${ROOT_DIR}/infra/terraform/live/control-plane"

terraform -chdir="${STACK_DIR}" plan -var-file="terraform.tfvars"
terraform -chdir="${STACK_DIR}" apply -var-file="terraform.tfvars"

