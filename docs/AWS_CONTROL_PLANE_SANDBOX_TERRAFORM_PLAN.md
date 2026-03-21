# AWS Deployment Plan: Control Plane + Sandbox Plane

This plan defines how to deploy MongoDB Gameday on AWS with a hard separation between:

1. **Control plane** (persistent application platform)
2. **Sandbox plane** (ephemeral workshop runtime)

Primary goal: **destroy workshop-specific sandbox infrastructure without deleting the core app**.

---

## 1) Target operating model

### Control plane (persistent)

Keep running across customers/workshops:

- Frontend hosting (S3 + CloudFront)
- API runtime (ECS service + ALB)
- Shared observability (CloudWatch, dashboards, alarms, logs)
- Shared secrets/config (Secrets Manager, SSM parameters)
- Shared CI/CD and ECR repositories
- Shared metadata DB collections (users, workshops, metrics, progress)

### Sandbox plane (ephemeral by workshop)

Create per workshop, destroy at workshop end:

- Terminal/IDE execution resources
- Workshop-scoped compute and networking attachments
- Workshop sandbox/session runtime resources
- Workshop-scoped IAM and security groups (if created per workshop)

---

## 2) Infrastructure split (critical for teardown)

Use **separate Terraform states** and stack boundaries:

- `control-plane` state: never destroyed during workshop cleanup
- `sandbox-base` state: shared sandbox capabilities (cluster, AMI, daemon hosts, task defs)
- `workshop-stack` state: one state per workshop (`workshop_id`) for easy destroy

Recommended state keys:

- `tfstate/control-plane/terraform.tfstate`
- `tfstate/sandbox-base/terraform.tfstate`
- `tfstate/workshops/<workshop_id>/terraform.tfstate`

---

## 3) AWS architecture recommendation

For your current codebase and feature set, this is the most practical path:

### Control plane

- **Frontend**: S3 + CloudFront + ACM + Route53
- **API**: ECS Fargate service behind ALB
- **Data**: MongoDB Atlas (recommended) or managed Mongo-compatible alternative
- **Secrets**: AWS Secrets Manager
- **Auth/config**: JWT secret + API env in ECS task definition

### Sandbox base

- ECS cluster for sandbox workloads
- If Docker-executor mode is required, prefer ECS on EC2 capacity (host Docker daemon available)
- ECR repositories for sandbox/terminal images
- Shared IAM roles and baseline security groups

### Workshop stack (ephemeral)

- One logical stack per workshop id:
  - Runtime services/tasks
  - Workshop-specific SG/rules
  - Optional per-workshop queue/registry rows
- Tagged with strict ownership/TTL metadata

---

## 4) Resource tagging and ownership rules

Every sandbox-plane resource must include tags:

- `app = mongodb-gameday`
- `plane = sandbox`
- `workshop_id = <id>`
- `tenant_id = <id>`
- `owner = control-plane-api`
- `expires_at = <iso8601>`
- `managed_by = terraform`

Control-plane resources use:

- `plane = control`
- no `workshop_id` tag

This makes cleanup safe and automatable.

---

## 5) Terraform artifact plan (required outputs)

Create this structure:

```text
infra/terraform/
  modules/
    control-plane/
      app_api_service/
      frontend_cdn/
      observability/
      secrets/
    sandbox-base/
      sandbox_cluster/
      sandbox_images/
      sandbox_roles/
    workshop-stack/
      workshop_runtime/
      workshop_network_overlay/
      workshop_registry_binding/
  live/
    control-plane/
      main.tf
      providers.tf
      versions.tf
      variables.tf
      outputs.tf
      backend.hcl
      terraform.tfvars.example
    sandbox-base/
      main.tf
      providers.tf
      versions.tf
      variables.tf
      outputs.tf
      backend.hcl
      terraform.tfvars.example
    workshop/
      main.tf
      providers.tf
      versions.tf
      variables.tf
      outputs.tf
      backend.hcl
      terraform.tfvars.example
```

Automation scripts:

```text
scripts/aws/
  tf-init.sh
  deploy-control-plane.sh
  deploy-sandbox-base.sh
  create-workshop-stack.sh
  destroy-workshop-stack.sh
  destroy-expired-workshops.sh
```

---

## 6) Teardown strategy (what gets deleted)

### Keep

- `control-plane` stack
- `sandbox-base` stack
- Shared app data and platform services

### Delete

- `workshop-stack` for a specific `workshop_id`
- Any runtime resources with `plane=sandbox` + matching workshop tag

### Destroy flow

1. Mark workshop status ended in app DB.
2. Stop accepting new sessions.
3. Drain/stop workshop runtime services.
4. Run:
   - `terraform -chdir=infra/terraform/live/workshop destroy -var workshop_id=<id>`
5. Verify no resources remain with `workshop_id=<id>`.

---

## 7) Automatic cleanup (recommended)

Implement scheduled cleanup:

- EventBridge Scheduler (e.g., every 15 minutes)
- Lambda (or ECS scheduled task) reads workshop registry and calls teardown for expired workshops
- Use distributed lock to avoid concurrent destroy on same workshop

Registry source options:

- Existing `workshop_sessions` collection
- Dedicated `workshop_registry` table/collection with `expires_at`, `state`, `destroy_requested_at`, `destroyed_at`

---

## 8) Control-plane API changes needed

Add or ensure these endpoints/workflows:

- `POST /api/workshops/:id/finalize` (marks end + enqueues destroy)
- `POST /api/workshops/:id/destroy` (admin/manual destroy)
- `GET /api/workshops/:id/destroy-status`

Emit metrics/audit events:

- destroy started, destroy succeeded, destroy failed, retry count

---

## 9) Security and blast-radius rules

- Separate IAM roles:
  - control-plane deploy role
  - sandbox-base deploy role
  - workshop destroy role (least privilege)
- Terraform workspaces or separate state key prefixes per environment (`dev/stage/prod`)
- Deny wildcard deletes outside `plane=sandbox` scope in destroy role policy where possible

---

## 10) Rollout phases

1. **Phase A**: Deploy control plane only.
2. **Phase B**: Deploy sandbox-base shared components.
3. **Phase C**: Deploy one workshop-stack; validate mission runtime.
4. **Phase D**: Run destroy for that workshop-stack; confirm control plane remains healthy.
5. **Phase E**: Enable scheduled destroy for expired workshops.

---

## 11) Acceptance criteria

- You can deploy app once and keep it running.
- You can create N workshop stacks independently.
- You can destroy one workshop stack with no impact to control plane.
- Re-running destroy on an already removed workshop is safe (idempotent).
- Audit trail exists for create/destroy events.

---

## 12) What I recommend you do first

1. Build Terraform skeleton above with separate states.
2. Deploy control-plane + sandbox-base in a non-prod AWS environment.
3. Implement `create-workshop-stack.sh` and `destroy-workshop-stack.sh`.
4. Wire control-plane API to call those scripts/jobs.
5. Add scheduled expiration cleanup.

## 13) Repository scaffold status

The initial scaffold is now present in this repo:

- `infra/terraform/live/control-plane`
- `infra/terraform/live/sandbox-base`
- `infra/terraform/live/workshop`
- `infra/terraform/modules/*`
- `scripts/aws/tf-init.sh`
- `scripts/aws/deploy-control-plane.sh`
- `scripts/aws/deploy-sandbox-base.sh`
- `scripts/aws/create-workshop-stack.sh`
- `scripts/aws/destroy-workshop-stack.sh`
- `scripts/aws/destroy-expired-workshops.sh`

Next step is filling module internals with concrete AWS and Atlas resources.

