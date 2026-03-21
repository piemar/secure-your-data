# MongoDB Gameday (MongoDB Mayhem)

Hands-on **missions** and **quest chains** for learning MongoDB in a game-style UI: Monaco editor, tiered validation (pattern, sandbox execution, simulation), and workshop modes.

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/ARCHITECTURE_PRODUCT_MULTI_TENANT_PLAN.md](docs/ARCHITECTURE_PRODUCT_MULTI_TENANT_PLAN.md) | Architecture, AWS/Docker deployment, testing, design language |
| [docs/sandbox-strategy-final.md](docs/sandbox-strategy-final.md) | Execution tiers, sandbox lifecycle, Option F (REPL / containers / IDE) |
| [docs/AWS_CONTROL_PLANE_SANDBOX_TERRAFORM_PLAN.md](docs/AWS_CONTROL_PLANE_SANDBOX_TERRAFORM_PLAN.md) | Control plane vs sandbox plane, Terraform artifacts, workshop teardown model |
| [docs/SANDBOX_DATASET_ATLAS_IMPLEMENTATION.md](docs/SANDBOX_DATASET_ATLAS_IMPLEMENTATION.md) | Dataset preload strategy (sandbox + Atlas), local Docker workflow |
| [docs/MASTER_PROMPT_MISSION_QUEST_AUTHORING.md](docs/MASTER_PROMPT_MISSION_QUEST_AUTHORING.md) | Checklist + master prompt to add or refine missions/quests |

## Prerequisites

- **Node.js 20+**
- **MongoDB** (local, Docker, or [Atlas](https://www.mongodb.com/cloud/atlas)) for the API
- Optional: **Docker** (or Podman/Colima with a Docker-compatible CLI) for `server/docker-compose.yml`
- **Container runtime required** for `npm run local:start:ide`, `npm run local:start:nocontainer:ide`, and `bash scripts/local/start-local.sh --with-ide`: those flows start the **code-server** service from Compose (`--profile ide`). Pure `local:start:nocontainer` without IDE does not need containers.

## Quick start (local)

### 0. One-command local stack (recommended)

From repo root:

```bash
npm run local:start
```

This starts:

- MongoDB in Docker (`server/docker-compose.yml`)
- API dev server on `http://localhost:3001`
- Frontend dev server on `http://localhost:8080`

Useful commands:

```bash
npm run local:status
npm run local:stop
npm run local:doctor
npm run local:runtime:cleanup
npm run local:start:nocontainer
npm run local:start:ide
```

Optional flags (run via bash):

```bash
bash scripts/local/start-local.sh --with-sandbox-tools
bash scripts/local/start-local.sh --with-ide
bash scripts/local/stop-local.sh --purge-mongo
bash scripts/local/start-local.sh --yes-install-runtime
```

Runtime selection (macOS/Linux):

```bash
npm run local:start:docker      # force Docker Desktop/Engine
npm run local:start:alt         # prefer Podman/Colima alternative runtime
LOCAL_CONTAINER_RUNTIME=auto bash scripts/local/start-local.sh
LOCAL_CONTAINER_RUNTIME=podman bash scripts/local/start-local.sh
LOCAL_CONTAINER_RUNTIME=docker bash scripts/local/start-local.sh
```

No-container start (requires local MongoDB reachable via `MONGODB_URI` and `mongosh` installed):

```bash
npm run local:start:nocontainer
npm run local:start:nocontainer:ide

# preflight only
bash scripts/local/start-local-nocontainer.sh --check-only
```

### Full IDE (code-server) and embedded workspace

- **`npm run local:start:ide`** — Mongo in Docker (unless you combine flags), API, web, and **code-server** on [http://localhost:13337](http://localhost:13337). The Compose `ide` service installs the **MongoDB for VS Code** extension on startup (idempotent) and stores **extensions, settings, and code-server data** in the named volume `ide_code_server_data` so they survive container restarts.
- **`npm run local:start:nocontainer:ide`** — Uses MongoDB on the host (same preflight as `local:start:nocontainer`) but still **starts code-server via Docker/Podman/Colima** because the IDE runs in a container.
- **Embedded IDE in the mission UI** — Enable an **IDE** tab on the active mission workspace (session from **`POST /api/ide/session`**, embedded iframe when you launch from the tab):
  - Set **`VITE_ENABLE_IDE_LAUNCHER=true`** when starting Vite (same flag as the sidebar **OPEN FULL IDE** control).
  - Run **`npm run local:start:ide`** (or equivalent), enable **`FULL_IDE_ENABLED`** on the API, and sign in so the session endpoint can run.

**Optional E2E smoke** (off by default): with **`E2E_IDE_EMBED=true`**, `npm run test:e2e` starts Vite with `VITE_ENABLE_IDE_LAUNCHER=true` and runs the gated Playwright spec that asserts the IDE tab and in-app panel are visible. Example:

```bash
E2E_IDE_EMBED=true npm run test:e2e
```

**Note:** `bash scripts/local/stop-local.sh --purge-mongo` runs Compose `down -v` and **removes named volumes**, including IDE persistence, not only Mongo data.

Resource profile selection (smaller local footprint vs higher limits):

```bash
# default is dev (lowest memory/cpu)
LOCAL_RESOURCE_PROFILE=dev bash scripts/local/start-local.sh

# higher local limits (closer to cloud sizing)
LOCAL_RESOURCE_PROFILE=standard bash scripts/local/start-local.sh
LOCAL_RESOURCE_PROFILE=high bash scripts/local/start-local.sh

# fine-grained overrides (take precedence over profile defaults)
MONGO_MEM_LIMIT=768m MONGO_CPUS=1.25 MONGO_WT_CACHE_GB=0.35 bash scripts/local/start-local.sh
```

Windows PowerShell helpers:

```powershell
npm run local:start:windows
npm run local:start:alt:windows
npm run local:start:nocontainer:windows
npm run local:status:windows
npm run local:stop:windows
npm run local:runtime:cleanup:windows

# choose a non-default resource profile
powershell -ExecutionPolicy Bypass -File scripts/local/start-local.ps1 -ResourceProfile standard
powershell -ExecutionPolicy Bypass -File scripts/local/start-local-alt-runtime.ps1 -ResourceProfile high
powershell -ExecutionPolicy Bypass -File scripts/local/start-local-nocontainer.ps1 -CheckOnly
```

The launcher supports these runtimes:

- Docker Desktop / Docker Engine (`docker compose`)
- Colima (macOS/Linux, Docker-compatible CLI)
- Podman (`podman compose` or `podman-compose`)

Default behavior is runtime auto-detect. If a needed runtime is missing, the launcher prompts before installing it. Use `--yes-install-runtime` (or `-YesInstallRuntime` on PowerShell) to auto-approve installs in non-interactive runs. The scripts also print runtime/provider version details when available.

For cloud targets (EKS/ECS), keep local profile as `dev` and scale resources through your deployment manifests (Terraform + Helm/Kubernetes requests/limits or task/container sizing). The app behavior stays the same; only runtime limits change.

Logs are written to:

- `.local/dev/logs/web.log`
- `.local/dev/logs/api.log`

### 1. Front-end (Vite)

```bash
npm install
npm run dev
```

Opens **http://localhost:8080** (see `vite.config.ts`).

### 2. API (Express)

```bash
cd server
npm install
```

Create `server/.env` (minimal):

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=mongodb_mayhem
JWT_SECRET=change-me-in-production
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

Optional (P3 small-tier mode):

```env
SANDBOX_COLLECTION_PREFIX_MODE=false
SANDBOX_SHARED_DB_NAME=mongodb_mayhem
ATLAS_PROXY_ENABLED=false
ATLAS_PROXY_URI=
ATLAS_PROXY_DB_NAME=admin
CONTAINER_TERMINAL_ENABLED=false
TERMINAL_WS_SHELL_ENABLED=false
FULL_IDE_ENABLED=false
```

```bash
npm run dev
```

API: **http://localhost:3001** — health: `GET /api/health`

### 3. API + Mongo with Docker

From repo root:

```bash
cd server && docker compose up
```

Compose sets `MONGODB_URI=mongodb://mongo:27017` and `CORS_ORIGIN=http://localhost:8080`. Run the Vite app separately with `npm run dev` in the repo root.

### 4. Sandbox tools container (mongosh + language runtimes)

The sandbox tools image is defined at `server/sandbox/Dockerfile` and includes:

- `mongosh`
- `node` / `npm`
- `go`
- `javac` / `java`
- `mono` / `mcs` (C# runtime + compiler)
- `awscli`
- `jq`, `python3`, `openssl`, `bash`

Start it with the optional compose profile:

```bash
cd server && docker compose --profile sandbox up -d sandbox-tools
```

Open a shell:

```bash
cd server && docker compose exec sandbox-tools bash
```

You can point websocket Docker executor to this image by setting:

```env
TERMINAL_WS_EXECUTOR=docker
TERMINAL_DOCKER_IMAGE=secure-your-data-sandbox-tools:latest
```

For maintainability, prefer a single sandbox-tools image for multi-language mission execution in terminal mode, rather than per-language images.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 8080) |
| `npm run local:start` | Start local stack orchestrator (Mongo via Docker + API + Web, with graceful fallbacks). Also enables terminal websocket shell for local mission testing. |
| `npm run local:start:docker` | Start local stack forcing Docker runtime |
| `npm run local:start:alt` | Start local stack preferring alternative runtime (Podman/Colima) |
| `npm run local:start:nocontainer` | Start local stack without container MongoDB (preflights `node`, `npm`, `mongosh`, and Mongo ping) |
| `npm run local:start:ide` | Start local stack with code-server (`http://localhost:13337`), MongoDB VS Code extension bootstrap, and **persisted** IDE data via Compose volume `ide_code_server_data` |
| `npm run local:start:nocontainer:ide` | Host MongoDB + **container** code-server (requires Docker/Podman/Colima); IDE data still persisted in `ide_code_server_data` |
| `npm run local:status` | Show local orchestrator status (managed + external processes) |
| `npm run local:doctor` | Runtime diagnostics with OS-specific remediation (Docker/Podman/Colima + compose provider) |
| `npm run local:runtime:cleanup` | Remove Podman/Colima runtimes and local machine assets (with prompt) |
| `npm run local:stop` | Stop local orchestrator processes cleanly |
| `npm run local:restart` | Restart local orchestrator |
| `npm run local:start:windows` | Windows PowerShell local launcher (auto runtime) |
| `npm run local:start:alt:windows` | Windows PowerShell launcher preferring Podman, then Docker fallback |
| `npm run local:start:nocontainer:windows` | Windows no-container launcher with local Mongo preflight |
| `npm run local:status:windows` | Windows PowerShell status |
| `npm run local:stop:windows` | Windows PowerShell stop |
| `npm run local:runtime:cleanup:windows` | Windows runtime cleanup (Podman + machine assets) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest — mission content contract (client) |
| `npm run test:server` | Vitest — execute-tier seed/verification contract |
| `npm run test:e2e` | Playwright — UI smoke (starts Vite on **port 4173** so it does not clash with your usual `:8080` dev server) |
| `npm run test:e2e:ui` | Playwright UI mode |

**First-time E2E:** `npx playwright install chromium`

**Gated IDE panel check:** default runs **skip** the IDE tab spec unless **`E2E_IDE_EMBED=true`** (see [Full IDE (code-server) and embedded workspace](#full-ide-code-server-and-embedded-workspace)).

## Environment (front-end)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (default `http://localhost:3001`) |
| `VITE_DEV_AUTOLOGIN` | Dev-only auth bootstrap toggle for localhost sessions; defaults to enabled in dev unless explicitly set to `false` |
| `VITE_DEV_AUTOLOGIN_HANDLE` | Handle used by dev autologin (default `dev_moderator`) |
| `VITE_DEV_AUTOLOGIN_PASSWORD` | Password used by dev autologin (default `dev-password`) |
| `VITE_DEV_AUTOLOGIN_ROLE` | Role used only when fallback register occurs (`moderator` default, or `attendee`) |
| `VITE_ENABLE_IDE_LAUNCHER` | When `true`, mission workspace shows an **IDE** tab (embedded session + iframe after launch) and the sidebar external IDE launcher |

Set at **build time** for deployed static hosting.

## Environment (server)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string for platform + sandbox services |
| `MONGODB_DB_NAME` | Platform database name |
| `JWT_SECRET` | JWT signing secret |
| `CORS_ORIGIN` | Allowed front-end origin |
| `SANDBOX_COLLECTION_PREFIX_MODE` | `true` = use shared DB with prefixed collections (`sbx_<session>_<user>_...`) |
| `SANDBOX_SHARED_DB_NAME` | Shared DB name when prefix mode is enabled (defaults to `MONGODB_DB_NAME`) |
| `SANDBOX_EXPIRY_TICK_MS` | Interval for DB-leased sandbox expiry sweep (default `30000`; min `5000`) |
| `ATLAS_PROXY_ENABLED` | Enables `/api/execute/cloud` Atlas proxy route (`true`/`false`) |
| `ATLAS_PROXY_URI` | Atlas cluster URI used by cloud proxy route |
| `ATLAS_PROXY_DB_NAME` | Default db used by Atlas proxy route (default `admin`) |
| `CONTAINER_TERMINAL_ENABLED` | Enables container-terminal session provisioning endpoint |
| `TERMINAL_WS_SHELL_ENABLED` | With `CONTAINER_TERMINAL_ENABLED`, enables Socket.IO `/terminal` streamed shell (`terminal:exec` / `terminal:output` / `terminal:done`; JWT in `handshake.auth.token`) |
| `TERMINAL_WS_EXECUTOR` | `local` (default) = host shell; `docker` = persistent per-session container + `docker exec`; `docker_oneshot` = one-shot `docker run --rm` per command. See `POST /api/terminal/session` response `shellStream.executor`. |
| `TERMINAL_WS_MAX_OUTPUT_BYTES` | Max combined stdout+stderr bytes per command (default ~512 KiB) |
| `TERMINAL_WS_CMD_TIMEOUT_MS` | Kill command after this many ms (default 30000) |
| `TERMINAL_DOCKER_CLI` | Docker binary name/path (default `docker`) |
| `TERMINAL_DOCKER_IMAGE` | Image for websocket shell when Docker executor is enabled (default `alpine:3.19`) |
| `TERMINAL_DOCKER_NETWORK` | `docker run --network` value (default `none`) |
| `TERMINAL_DOCKER_MEMORY` | `docker run --memory` (default `256m`) |
| `TERMINAL_DOCKER_CPUS` | `docker run --cpus` (default `1`) |
| `TERMINAL_DOCKER_PIDS_LIMIT` | `docker run --pids-limit` (default `256`; set empty to omit) |
| `FULL_IDE_ENABLED` | Enables full IDE session provisioning endpoint |
| `FULL_IDE_BASE_URL` | Base URL returned to launcher for full IDE sessions (for local `--with-ide`, default `http://localhost:13337`) |
| `TERMINAL_PERSISTENT_IDLE_TTL_MS` | Idle TTL for persistent Docker terminal sessions before reaper removes container/session (default `1800000`) |

## Terraform scaffold

A runnable scaffold is included at `infra/terraform`:

- `live/control-plane` (persistent)
- `live/sandbox-base` (shared sandbox infra)
- `live/workshop` (ephemeral per workshop)

Helper scripts:

- `bash scripts/aws/tf-init.sh <stack>`
- `bash scripts/aws/deploy-control-plane.sh`
- `bash scripts/aws/deploy-sandbox-base.sh`
- `bash scripts/aws/create-workshop-stack.sh <workshop_id> <tenant_id> [expires_at_iso]`
- `bash scripts/aws/destroy-workshop-stack.sh <workshop_id> [tenant_id] [expires_at_iso]`

## GitHub CI/CD

Workflows are split by responsibility:

- `.github/workflows/app-ci.yml` — app CI (test/build + optional E2E smoke).
- `.github/workflows/app-cd.yml` — build/publish images and deploy control-plane/sandbox-base.
- `.github/workflows/infra.yml` — Terraform plan on PR and guarded apply for infra stacks.

### AWS auth (OIDC)

Use GitHub OIDC with an AWS IAM role (recommended) instead of long-lived AWS keys.

Required secret:

- `AWS_DEPLOY_ROLE_ARN`

### GitHub repository variables

- `AWS_REGION` — AWS region used by deploy workflows.
- `ECR_REPO_API` — ECR repository name for API image.
- `ECR_REPO_SANDBOX_TOOLS` — ECR repository name for sandbox tools image.
- `APP_DEPLOY_ENABLED` — set `true` to enable `app-cd` Terraform deploy jobs.
- `INFRA_APPLY_ENABLED` — set `true` to enable `infra.yml` apply jobs.

### GitHub repository secrets

- `TFVARS_CONTROL_PLANE` — content of `infra/terraform/live/control-plane/terraform.tfvars`.
- `TFVARS_SANDBOX_BASE` — content of `infra/terraform/live/sandbox-base/terraform.tfvars`.
- `TFVARS_WORKSHOP` — content of `infra/terraform/live/workshop/terraform.tfvars`.

### Apply safety defaults

- PRs run Terraform plan only.
- Apply jobs are environment-gated (`production`) and require approval in GitHub environment settings.
- Workflows fail fast if backend config files still contain `REPLACE_ME_` placeholders.

## Repository layout (short)

```
src/           React app (pages, components, mission content consumers)
server/        Express API, sandbox, auth, workshops
docs/          Architecture & sandbox strategy
e2e/           Playwright specs
```

## License

Private / team use unless otherwise noted.
