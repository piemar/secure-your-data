# Phase Implementation Status

This file tracks implementation progress against `docs/ARCHITECTURE_PRODUCT_MULTI_TENANT_PLAN.md` and is intended as a **resume checkpoint** if work is interrupted.

## Current branch

- `review/workshop-scalability-and-admin-architecture`

## How to resume quickly

1. `git status` && `git branch --show-current`
2. Re-run verification baseline: `npm test && npm run test:server && npm run test:e2e && npm run build && cd server && npm run build`
3. Start dev stack: repo root `npm run dev` (Vite **:8080**) + `cd server && npm run dev` (API **:3001**)
4. Continue at **Known follow-ups** (all roadmap phases are now implemented at MVP level)

## Phase status

| Phase | Goal | Status | Notes |
|---|---|---|---|
| P0 | Contract tests + E2E smoke + docs | ✅ Done | Added mission contract tests, server contract tests, Playwright smoke, README/architecture docs |
| P1 | Server-owned progress; tenant/workshop id | ✅ Done | Tenant/workshop propagated through auth/workshops/metrics/missions + `/api/players/sync` + frontend sync integration |
| P2 | `POST /api/execute/repl` + TerminalPanel | ✅ Done | Added backend REPL route (`/api/execute/repl`) with shared tiered semantics, frontend `TerminalPanel` + `useTerminal`, MissionPage REPL tab, API client typing/method, and route/unit coverage |
| P3 | Atlas small-tier prefix remapping | ✅ Done (MVP) | Env-gated collection-prefix sandbox mode (`SANDBOX_COLLECTION_PREFIX_MODE`) with scoped seeding/execution/verification/cleanup and prefixed executor mapping |
| P4 | Atlas proxy for Tier 3 | ✅ Done (MVP) | Added `/api/execute/cloud` + `atlas-proxy` service with safety checks, read-only guard, and simulation fallback when proxy disabled |
| P5 | Container shell / full IDE | ✅ Done (MVP+) | `/api/terminal/session` + `/api/ide/session` + **Socket.IO `/terminal`** (JWT + session key). Webshell: **pluggable executor** — host shell by default, plus **persistent per-session Docker** (`TERMINAL_WS_EXECUTOR=docker`) and optional one-shot mode (`TERMINAL_WS_EXECUTOR=docker_oneshot`) with caps/timeouts + `shellStream.executor` in API response + `IDELauncher` UI |
| P6 | Stateless API for multi-replica | ✅ Done (MVP) | Sandbox metadata in `sandbox_sessions`, hydration from DB, and **DB-leased coordinator** (`sandbox_coordinator_lock`) so only one replica runs expiry/orphan sweeps |

## P1 completed checklist

- [x] JWT payload now includes `tenantId` and optional `workshopId`
- [x] Workshop sessions created with `tenantId`; moderator-scoped queries include tenant
- [x] Metric and mission-complete events include `tenantId`/`workshopId`
- [x] `server/src/routes/execute.ts` now uses `req.user.userId` (not `id`) and validates auth user presence
- [x] New `POST /api/players/sync` merges local progress into server profile
- [x] Frontend sync utilities added: `src/lib/player-sync.ts`
- [x] Role auth flow now attempts server sync after token acquisition
- [x] Mission completion now persists to server when authenticated and rehydrates local player from server

## P2 checklist (crash-resumable)

Spec reference: [sandbox-strategy-final.md §8](./sandbox-strategy-final.md) (Track UX **1a–1b**). Response shape should stay aligned with `/api/execute/run` where feasible.

### Backend

- [x] `POST /api/execute/repl` on `server/src/routes/execute.ts` (JWT auth, `missionId` / `sessionId`, body accepts `command` or `code`)
- [x] REPL execution uses existing tiered/sandbox path (`handleTieredExecute` + `executeSandboxCode` — no raw `eval`)
- [x] Error handling consistent with `/api/execute/run` (shared handler)

### Frontend

- [x] `TerminalPanel` + `useTerminal` (history, submit to REPL API, auth headers via existing API client)
- [x] Mission UI integration ([MissionPage.tsx](../src/pages/MissionPage.tsx) tabs: `MISSION CODE` + `REPL`)
- [x] `src/services/api.ts` client for `/api/execute/repl` and shared execute response typing
- [x] Optional enhancement: swap current lightweight terminal UI to `@xterm/xterm` for richer shell feel

### Tests

- [x] Server Vitest: REPL route coverage (`server/src/routes/execute-routes.test.ts`) including pattern/simulate/execute and 400 path
- [x] Frontend unit test: `src/hooks/useTerminal.test.ts`
- [x] Regression suites re-run: `npm test`, `npm run test:server`, `npm run test:e2e`, frontend+server builds
- [x] E2E enhancement: explicit assertion that REPL tab mounts and executes command output (`e2e/mission-repl-auth.spec.ts`)

## P3 checklist (crash-resumable)

- [x] Add env-gated prefix mode in sandbox service (`SANDBOX_COLLECTION_PREFIX_MODE`, `SANDBOX_SHARED_DB_NAME`)
- [x] Use prefixed collection mapping for execution path (`executeCode(..., { collectionPrefix })`)
- [x] Seed + verify through scoped DB view in prefix mode
- [x] Prefix-mode destroy path drops prefixed collections instead of dropping shared DB
- [x] Keep existing per-database sandbox mode as default (no behavior break)
- [x] Add focused tests for prefix mode mapping (`code-executor-prefix.test.ts`)
- [x] Document env toggles in README
- [x] Add workshop-level toggle (instead of process env only) for dynamic routing (`sandboxCollectionPrefixMode` on `workshop_sessions`, `POST/PATCH` workshops)

## P4 checklist (Atlas proxy)

- [x] Add cloud execution route (`POST /api/execute/cloud`)
- [x] Add proxy service with parser safety validation
- [x] Add read-only operation guard (writes blocked unless moderator + allowWrites flag)
- [x] Add simulation fallback when proxy is disabled
- [x] Add route/service tests (`atlas-proxy.test.ts`, execute cloud route test)
- [x] Add workshop policy enforcement (only atlas-connected/hybrid sessions invoke cloud route; `sandbox_only` → 403 on `POST /api/execute/cloud`)
- [x] Optional explicit `cloudExecutionAllowed` on workshop session overrides executionMode for `/api/execute/cloud`; lookup tenant-scoped

## P5 checklist (container/IDE)

- [x] Add terminal session provisioning route (`/api/terminal/session`)
- [x] Add IDE session provisioning route (`/api/ide/session`)
- [x] Add container session manager service + persistent session docs (`terminal_sessions`, `ide_sessions`)
- [x] Add optional frontend launcher (`IDELauncher`) gated by `VITE_ENABLE_IDE_LAUNCHER`
- [x] Implement websocket shell stream (Socket.IO `/terminal`, `TERMINAL_WS_SHELL_ENABLED` + `CONTAINER_TERMINAL_ENABLED`, streamed `terminal:exec` / `terminal:output` / `terminal:done`)
- [x] Container-backed command path for websocket shell (`TERMINAL_WS_EXECUTOR=docker_oneshot`: `docker run --rm` per command, bind-mounted per-session host workdir, shared output/timeout caps with local executor; `shellStream.executor` on `POST /api/terminal/session`)
- [x] Persistent per-session container command path (`TERMINAL_WS_EXECUTOR=docker`: long-lived container + `docker exec` per command, per-session cwd, idle reaper cleanup)

## P6 checklist (stateless API)

- [x] Add shared sandbox session store (`sandbox_sessions`)
- [x] Persist sandbox metadata on create
- [x] Hydrate sandbox runtime entry from store on execute/verify/status/destroy
- [x] Cleanup expired sessions based on persisted TTL data
- [x] Replace per-sandbox `setTimeout` with DB-leased periodic expiry sweep + coordinator doc (`sandbox_coordinator_lock`; optional `SANDBOX_EXPIRY_TICK_MS`, default 30s)

### Docs

- [x] This file updated for shipped P2 and in-progress P3 state
- [x] README updated with new server env toggles for prefix mode

## Known follow-ups from this checkpoint

- [x] Add targeted tests for `/api/players/sync` merge behavior (`server/src/routes/players-routes.test.ts`)
- [x] Expand E2E to cover REPL tab interaction + authenticated mission completion path hitting API (`e2e/mission-repl-auth.spec.ts`)
- [x] Normalize `sessionId` vs `workshopId` on `GET /api/players/me` (aligned values, backward-compatible fields)
- [x] Enforce workshop execution mode policy on `/api/execute/cloud` at route level
- [x] Docker-backed websocket executor (MVP one-shot runs; host must provide Docker CLI + image)
- [x] Deterministic execute-tier seed dataset generation (reproducible workshop runs and easier troubleshooting)
- [x] Terraform scaffold + helper scripts added (`infra/terraform/*`, `scripts/aws/*`) for control-plane / sandbox-base / workshop split
- [x] Local sandbox tools image scaffold added (`server/sandbox/Dockerfile`) and compose profile (`server/docker-compose.yml`)
- [x] Tenant/workshop-scoped leaderboard (`GET /api/players/leaderboard` now auth-protected + `tenantId`/`workshopId` filter)
- [x] Mission completion guard (attendees cannot complete missions outside workshop `missionIds`)
- [x] Workshop lifecycle API hardening (`GET /api/workshops/:id`, `PATCH /api/workshops/:id`, `DELETE /api/workshops/:id` soft archive)
- [x] Domain-aware join path (`POST /api/auth/join-session` supports email-domain session mapping)
- [x] Moderator workshop wizard page scaffold (`/workshop-admin`) with customer/champion metadata + mission/quest assignment + archive action
- [x] Ignore Terraform local artifacts in VCS (`.gitignore` now includes `.terraform`/`*.tfstate`)
- [x] Stabilize inline hint markers with per-blank token mapping (order-independent reveal + better row tracking in Monaco)
- [x] Harden client-side validation against comment-only regex bypasses (strip comments before rule matching)
- [x] Add server-side command-trace validation context for Tier 2 sandbox verify flow (command evidence + DB evidence)
- [x] Harden verification contracts for `mission-1`, `mission-12`, and `mission-5` (remove key `verify: true` placeholders)
- [x] Harden remaining Tier 2 objective contracts (`mission-3`, `6`, `8`, `13`, `14`, `15`, `16`, `18`, `20`) to require command-trace evidence instead of permissive `verify: true`
- [x] Physically split frontend mission content source-of-truth into per-mission/per-quest modules under `src/content/missions/<mission_slug>/*` and `src/content/quests/<quest_slug>/*`; kept `src/lib/game-data.ts`, `src/lib/mission-skeletons.ts`, and `src/lib/mission-validations.ts` as compatibility re-exports only

## Last verified test run

- `npm test` ✅
- `npm run test:server` ✅
- `npm run test:e2e` ✅ (7 passed)
- `cd server && npm test` ✅ (includes terminal shell executor + sandbox coordinator lease + expiry batch + workshop `/cloud` policy + players `/me` + `/sync`)
- `cd server && npm run build` ✅
- `npm run build` ✅
