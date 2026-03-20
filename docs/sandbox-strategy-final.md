# Sandbox and execution strategy (authoritative)

This document merges the editor/terminal roadmap from `sandbox-plan.md` with the validation, sandbox semantics, and cloud guidance from `sandbox-additons.md`. Use **this file** for implementation and operations planning; the older docs remain as historical detail.

---

## 1. Purpose and scope

- **What this covers:** How missions are validated and executed (three tiers), how the UI delivers a terminal/IDE experience (Options A/B/E and Option F fallback), workshop configuration, deployment constraints (Atlas vs self-hosted), and a unified file/phase checklist.
- **What this does not replace:** In-app mission content (`game-data`, `mission-skeletons`, etc.) and client-only Heist flows when the API is offline.

---

## 2. Mission UX invariants (non-negotiable)

Any editor or terminal replacement must preserve or reimplement:

- `___BLANK___` markers in mission skeletons
- Gutter hint markers (`?` / `!`) and two-step hint → answer reveals with XP penalties
- Combo streaks (real-time pattern matching on code changes)
- Custom “heist-terminal” Monaco theme and MongoDB autocomplete
- Blank highlight decorations (`deltaDecorations`) with hover context
- Difficulty tiers: Guided, Challenge, Expert
- Validation feedback: client-side pattern checks **plus** server-side sandbox/simulation/cloud results where applicable

---

## 3. Execution and validation model (three tiers)

| Tier | What | Where it runs | Rough share of objectives |
|------|------|---------------|---------------------------|
| **1** | Pattern + semantic (regex/structure) | Client + optional server duplicate | ~50% |
| **2** | Sandboxed execution | Server: isolated DB (or remapped collections) per user/session | ~35% |
| **3** | Simulated output **or** proxied cloud API | Server: mock engine or Atlas/admin/KMS proxy | ~15% |

**UI expectation:** `MissionPage` (or equivalent) should show execution spinners for Tier 2, simulated or proxied output for Tier 3, and keep Tier 1 feedback snappy on the client.

### Safe execution contract (Tier 2)

User shell-style code is **not** passed to `eval`. The backend:

1. Parses MongoDB shell grammar subset: `db.collection.method(args)`, pipelines, index ops, multi-statement as sequential lines.
2. Maps to Node driver calls on the user’s sandbox database (or prefixed collections).
3. Returns structured results (e.g. `acknowledged`, `insertedId`, cursor summaries).

This contract must be shared by:

- `/api/execute/run` (existing Tier 2 path)
- Future `/api/execute/repl` (Option A safe REPL)
- Any containerized `mongosh` path (Option B) if results are normalized to the same JSON shape for the client

---

## 4. Option F: hybrid fallback chain (recommended UX/infra)

Infrastructure and moderator policy choose the **highest** experience available:

```text
Docker + code-server image available?
  yes → Option E: locked VS Code + MongoDB extension + mission extension
  no → Docker socket available?
         yes → Option B: per-user container (bash + mongosh) + Monaco
         no → Option A: safe REPL (xterm + /api/execute/repl) + Monaco
```

| Option | Terminal / IDE | Containers | Best for |
|--------|----------------|------------|----------|
| **A** | Pseudo-terminal; commands via `code-parser` | No | Railway/Render, minimal ops |
| **B** | Real bash + mongosh over WebSocket | Yes (~100MB/user) | Self-hosted Docker |
| **E** | code-server, locked UI + custom extension | Yes (~500MB/user) | Full IDE parity with mission UX in extension |

**Incremental delivery:** Implement A first (everywhere), then B, then E—each layer optional at runtime.

---

## 5. Workshop configuration

### Implemented today (client + API)

- `sandbox_only` — local/ephemeral sandbox MongoDB usage; Tier 2 on server; Tier 3 simulated where needed.
- `atlas_connected` — moderator Atlas cluster; full cloud-facing missions where wired.
- `hybrid` — sandbox for most missions; Atlas (or proxy) only for cloud-specific missions.

See: `src/components/WorkshopConfigPanel.tsx`, `server/src/routes/workshops.ts`.

### Planned (align with Option F)

| Mode | Maps to | Notes |
|------|---------|-------|
| `container_bash` | Option B | Real shell + mongosh; Monaco mission editor unchanged |
| `full_ide` | Option E | code-server + mission extension |

**Matrix (target):**

| Mode | Tier 1 | Tier 2 sandbox | Tier 3 simulate | Tier 3 cloud proxy |
|------|--------|----------------|-----------------|---------------------|
| `sandbox_only` | yes | yes | yes | no |
| `atlas_connected` | yes | yes (on Atlas cluster) | yes | yes (if configured) |
| `hybrid` | yes | yes | yes | selective |
| `container_bash` (future) | yes | yes + optional real shell | yes | per `atlas_connected` rules |
| `full_ide` (future) | extension | same backend contract | extension + server | per moderator |

---

## 6. Tier 2: Sandbox implementation spec

### Lifecycle

1. **Create** database `sandbox_{sessionId}_{userId}` (shortened IDs for MongoDB name limits) — created lazily on first write.
2. **Seed** mission-specific collections/documents from `server/src/config/seed-data.ts`.
3. **Execute** parsed user code via `code-executor` against that DB.
4. **Verify** using `server/src/config/verification-checks.ts` (counts, indexes, `explain`, etc.).
5. **Destroy** on mission complete, failure, **15-minute** idle timeout, session end, and **hourly** orphan sweep.

### Multi-tenancy

```text
MongoDB instance
├── mongodb_mayhem (platform)   ← not used for user code execution
├── sandbox_sess01_userA
├── sandbox_sess01_userB
└── ...
```

- Use a MongoDB user/role with **readWrite only on `sandbox_*`** (or equivalent scoped prefix).
- Never run learner code against the platform database.

### Atlas and hosting

| Deployment | Sandbox data | Notes |
|------------|--------------|-------|
| Atlas (M10+) | Many ephemeral DBs | Preferred for workshops; small, short-lived data |
| Atlas M0/M2/M5 | ~**100 database** limit | Use **single DB + collection prefix** (`user123_agents`); executor remaps `db.agents` → prefixed collections |
| Railway/Render/Fly | Sidecar `mongo:7` **or** Atlas URI | Compose: API + Mongo |
| Air-gapped | Local Mongo in Docker | Self-contained |

### Seed / verification examples (illustrative)

| Mission theme | Seed idea | Verification idea |
|---------------|-----------|-------------------|
| CRUD | `agents`, small doc set | `countDocuments`, doc exists |
| Index | `events`, no indexes | `listIndexes`, `explain` → IXSCAN |
| Aggregation | `orders`, `products` | output collection / counts |
| Schema | collections with validators | invalid insert throws |
| Geospatial | GeoJSON points | 2dsphere index, `$geoNear` |
| Transactions | `accounts` | atomic balance updates |
| Time series | timestamped readings | shape + count |

---

## 7. Tier 3: Simulation vs cloud proxy

### Missions that need real Atlas or external cloud

| Area | Example features | Why not pure sandbox |
|------|------------------|----------------------|
| Atlas Search | `$search`, `$searchMeta` | Atlas-only service |
| Vector | `$vectorSearch` | Atlas Vector Search |
| CSFLE | KMS + `ClientEncryption` | KMS + Enterprise/Atlas patterns |
| Sharding | `sh.status()`, `moveChunk` | Real sharded cluster |
| HA / RS ops | `rs.status()`, failover drills | Real replica set |

### Handling strategies

- **Pattern-only:** Tier 1 + simulated Tier 3 output — valid for budget workshops.
- **Atlas proxy:** Moderator supplies Atlas URI + scoped credentials; backend proxies admin/data APIs where implemented.
- **Explicit “requires Atlas” missions:** New missions (e.g. proposed 21–25: federation, KMS rotation, online archive, triggers, search index ops) — Tier 3 with optional cloud proxy; fall back to simulate if cloud off.

### Routing diagram (conceptual)

```text
User code → Express → parse (code-parser)
                    ├── Tier 2: sandbox DB (sandbox.ts + code-executor)
                    ├── Tier 3 simulate: simulation.ts
                    └── Tier 3 cloud: Atlas / KMS / Data API proxy (moderator-enabled)
```

---

## 8. Phased delivery (two tracks)

Tracks run in parallel where possible; **integration points** keep one execution contract.

### Track UX / infra (from sandbox-plan, Option F)

| Phase | Deliverable | Integration point |
|-------|-------------|-------------------|
| **1a** | `POST /api/execute/repl` | Must use `code-parser` + executor or thin wrapper; **same response shape** as `/api/execute/run` where feasible |
| **1b** | `TerminalPanel.tsx` (xterm), `useTerminal.ts` | MissionPage tab; auth + session headers like existing API |
| **2** | `container-manager.ts`, WebSocket `terminal.ts`, `server/sandbox/Dockerfile` | Optional; normalize output to Tier 2 JSON contract for UI |
| **3** | `Dockerfile.ide`, `extensions/mongodb-mayhem/*`, `routes/ide.ts`, `ide-proxy.ts`, `IDELauncher.tsx` | Extension talks to same backend for validation/XP |

### Track core engine (from sandbox-additions)

| Step | Deliverable | Status in repo (check when planning) |
|------|-------------|--------------------------------------|
| 1 | `code-parser.ts` | **Exists** — extend as grammar grows |
| 2 | `code-executor.ts` | **Exists** |
| 3 | `sandbox.ts` lifecycle | **Exists** — align TTL/sweep with doc |
| 4 | `seed-data.ts` | **Exists** — grow per mission |
| 5 | `verification-checks.ts` | **Exists** |
| 6 | `routes/execute.ts` | **Exists** — add `/repl` in Phase 1a |
| 7 | `simulation.ts` | **Exists** — expand Tier 3 |
| 8 | Missions 21–25 + `requiresAtlas` | **Partial / planned** — content + flags |
| 9 | Optional Atlas proxy | **Planned** — moderator config |

**Rule:** Phase 1a REPL is not a second language—it's another front-end on the **same parsing and execution semantics** as Tier 2.

---

## 9. Options A–E summary (reference)

- **A:** Safe REPL + Monaco — no raw shell; `code-parser` subset.
- **B:** Docker per user, real bash/mongosh, WebSocket terminal.
- **C:** code-server only — drops mission UX unless extension (avoid as sole path).
- **D:** Monaco + “Open full IDE” on demand — optional adjunct to A/B.
- **E:** Locked code-server + custom VS Code extension replicating blanks, hints, combos, validation UI; MongoDB extension in sidebar.

---

## 10. Unified file manifest

| File | Track | Status | Purpose |
|------|-------|--------|---------|
| `server/src/services/code-parser.ts` | Core | **Done** | Parse shell subset → structured ops |
| `server/src/services/code-executor.ts` | Core | **Done** | Run ops on sandbox DB |
| `server/src/services/sandbox.ts` | Core | **Done** | Create/seed/execute/verify/destroy |
| `server/src/config/seed-data.ts` | Core | **Done** | Per-mission seeds |
| `server/src/config/verification-checks.ts` | Core | **Done** | Post-run checks |
| `server/src/routes/execute.ts` | Core | **Done** — **extend** | Add `POST /repl` for Option A |
| `server/src/services/simulation.ts` | Core | **Done** — **extend** | Tier 3 mock output |
| `server/src/services/verification.ts` | Core | **Done** — **extend** | Wire checks to routes |
| `src/lib/mission-validations.ts` | Core | **Modify** | Tier metadata per objective |
| `src/lib/validation.ts` | Core | **Modify** | Async server validation |
| `src/pages/MissionPage.tsx` | UX | **Modify** | Terminal tab, spinners, IDE launcher |
| `src/services/api.ts` | UX | **Modify** | `executeCode`, `verifyExecution`, repl helper |
| `src/lib/game-data.ts` | Content | **Modify** | `requiresAtlas`, missions 21–25 |
| `src/components/TerminalPanel.tsx` | UX | **New** | xterm REPL |
| `src/hooks/useTerminal.ts` | UX | **New** | History + submit to `/api/execute/repl` |
| `server/src/services/container-manager.ts` | Infra | **New** | Docker lifecycle (Option B) |
| `server/src/socket/terminal.ts` | Infra | **New** | WebSocket I/O for shell |
| `server/sandbox/Dockerfile` | Infra | **New** | mongosh + bash image |
| `server/sandbox/Dockerfile.ide` | Infra | **New** | code-server + tools (Option E) |
| `extensions/mongodb-mayhem/` | Infra | **New** | Mission extension |
| `server/src/routes/ide.ts` | Infra | **New** | Launch/status for IDE containers |
| `server/src/middleware/ide-proxy.ts` | Infra | **New** | Reverse proxy to code-server |
| `src/components/IDELauncher.tsx` | UX | **New** | Open IDE button / iframe |
| `server/docker-compose.yml` | Infra | **Extend** | Socket mount, networks |

---

## 11. References

- Superseded for **day-to-day planning:** `docs/sandbox-plan.md`, `docs/sandbox-additons.md` (typo in filename noted).
- **Code touchpoints:** `server/src/index.ts` (route mount), `src/components/WorkshopConfigPanel.tsx` (execution modes), `src/pages/MissionPage.tsx` (mission flow).

---

## Document history

| Date | Change |
|------|--------|
| (this version) | Merged sandbox-plan Option F + sandbox-additions three-tier/cloud content into single authoritative doc |
