# Sandbox + Atlas Dataset Implementation

This document turns the current architecture into an implementation checklist for:

1. Mission datasets in sandbox mode (non-Atlas missions)
2. Atlas-backed datasets for cloud-specific missions
3. Local Docker workflow for development

---

## 1) Current behavior in repo

- Execute-tier missions seed from `server/src/config/seed-data.ts`.
- Seeding happens in sandbox creation (`createSandbox` in `server/src/services/sandbox.ts`).
- Data is deterministic/reproducible across workshop runs.
- Tier-3 cloud path is available through `/api/execute/cloud` and `atlas-proxy.ts` when enabled.

---

## 2) Dataset model to implement next

Use two dataset classes:

### Sandbox datasets (per user/session, ephemeral)

- Source: `SEED_DATA` in `server/src/config/seed-data.ts`
- Loaded during sandbox create flow
- Destroyed when sandbox expires or workshop ends

### Atlas datasets (shared central workshop cluster)

- Source: new `ATLAS_SEED_DATA` map (to add) in server config
- Loaded once per workshop into `atlas_workshop_<workshopId>` database namespace
- Reused by all attendees for cloud-only objectives

---

## 3) Atlas provisioning and bootstrap workflow

Use Terraform to provision central Atlas workspace for workshops:

1. Create Atlas project + cluster
2. Create scoped DB user for control-plane API
3. Store Atlas URI in AWS Secrets Manager
4. API reads secret and sets:
   - `ATLAS_PROXY_ENABLED=true`
   - `ATLAS_PROXY_URI=<secret value>`
5. Run a bootstrap seed job (idempotent):
   - `POST /api/workshops/:id/atlas-bootstrap` (future endpoint)
   - Writes only missing atlas seed collections/indexes

Idempotency rule: every seed step uses upsert / create-if-not-exists patterns.

---

## 4) Mission-to-dataset routing rule

- `pattern`: no dataset preload required
- `execute`: sandbox dataset required
- `simulate`: no real dataset required
- `atlas_connected` objectives: atlas dataset required

For mixed/hybrid workshops:

- Default to sandbox datasets
- Enable per-mission `requiresAtlas=true` flag to route to Atlas proxy + atlas seed namespace

---

## 5) Local development workflow

From `server/docker-compose.yml`:

- `mongo` service for API + sandbox execution
- optional `sandbox-tools` profile for shell tooling image

```bash
cd server && docker compose up -d
cd server && docker compose --profile sandbox up -d sandbox-tools
```

To use Docker-backed persistent terminal sessions:

```env
CONTAINER_TERMINAL_ENABLED=true
TERMINAL_WS_SHELL_ENABLED=true
TERMINAL_WS_EXECUTOR=docker
TERMINAL_DOCKER_IMAGE=secure-your-data-sandbox-tools:latest
```

---

## 6) Sandbox tools image requirements

Implemented at `server/sandbox/Dockerfile`:

- `mongosh`
- `awscli`
- `jq`, `python3`, `openssl`, `bash`

Recommended additions for future CSFLE-heavy labs:

- libmongocrypt verification tooling
- KMS policy examples and local test scripts

---

## 7) Acceptance criteria

- Every execute-tier mission starts with expected deterministic data.
- Workshop owners can bootstrap Atlas data once and reuse it safely.
- Local dev can run API + Mongo + sandbox tools with Docker only.
- Docker terminal executor can run workshop shell commands with `mongosh` available.
- Workshop teardown deletes ephemeral workshop infra without deleting control-plane services.

