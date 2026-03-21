# Product readiness, multi-tenancy, and maintainability plan

This document is the **architecture response** to evolving MongoDB Mayhem from a workshop prototype into a **deployable, multi-tenant** product. It **incorporates and defers to** [Sandbox and execution strategy](./sandbox-strategy-final.md) for validation tiers, sandbox lifecycle, Option F (REPL → Docker → IDE), and the unified execution contract. For the control-plane vs sandbox-plane AWS rollout and Terraform teardown model, use [AWS control-plane + sandbox deployment plan](./AWS_CONTROL_PLANE_SANDBOX_TERRAFORM_PLAN.md).

**Branch:** work is tracked on `feature/multi-tenant-product-roadmap` (created from `mongodb-mayhem-main`, aligned with `mongodb-mayhem-master/main` at time of writing).

---

## 1. Current-state analysis (what is “mocked” vs real)

### 1.1 Intentional simulation (Tier 3)

Per [sandbox-strategy-final.md §3 and §7](./sandbox-strategy-final.md), **~15% of objectives** are designed to use **simulated or proxied** infrastructure. The server implements this in `server/src/services/simulation.ts`: `sh.status()`, replica-set helpers, vector/CSFLE/Terraform-shaped responses, etc. These are **not bugs**; they are placeholders until Atlas/admin/KMS proxies exist.

**Product gap:** Missions marked `simulate` in `MISSION_TIERS` should gain explicit **`requiresAtlas` / `executionMode`** metadata in content and workshop config so moderators know when learners see synthetic output vs real cloud.

### 1.2 Tier 1 pattern-only missions

For missions with tier `pattern`, `/api/execute/run` returns success with **no execution** (`server/src/routes/execute.ts`). Validation is primarily **regex** in `src/lib/mission-validations.ts`. This is fast and cheap but **does not prove** correct shell semantics or DB effects.

**Product gap:** Optional server-side **duplicate pattern check** or **lightweight parse** (same `code-parser` as Tier 2) reduces cheating and aligns with the doc’s “client + optional server duplicate” for Tier 1.

### 1.3 Tier 2 sandbox (real isolated DB per learner)

`server/src/services/sandbox.ts` implements the **multi-tenant isolation model** described in [sandbox-strategy-final.md §6](./sandbox-strategy-final.md): database names `sandbox_{session}_{user}_{learnerSuffix}` (suffix from learner first/last name when available), seed → execute → verify → TTL destroy. This is **real MongoDB**, not mocked, when `MONGODB_URI` is available.

**Product gaps:**

- **Platform DB vs sandbox DB:** Ensure the MongoDB role used at runtime can **only** read/write `sandbox_*` (or prefixed collections on small Atlas tiers), as in §6.
- **Atlas M0/M2/M5:** Implement **collection-prefix remapping** when DB count limits apply (same doc).
- **Verification quality:** Many checks still use `verify: async (_db) => true` (trust pattern + execution side effects). Tighten over time per mission.

### 1.4 Split brain: client `localStorage` vs server persistence

`src/lib/game-store.ts` persists player XP and missions **only in the browser**. Separately, `server/src/routes/missions.ts` stores **completed missions and XP** in MongoDB when the user is authenticated.

**Product gap:** Define a **single source of truth** after login (server), with optional local cache for offline UX. Document behavior when API is down (already noted in sandbox doc §1).

### 1.5 Content scatter (maintainability)

Each mission today touches **multiple files** that must stay aligned:

| Concern | Location |
|--------|-----------|
| Narrative, objectives, rewards | `src/lib/game-data.ts` |
| Tier (pattern / execute / simulate) | `server/src/services/simulation.ts` → `MISSION_TIERS` |
| Tier 1 regex rules | `src/lib/mission-validations.ts` |
| Skeletons + `___BLANK___` + hints | `src/lib/mission-skeletons.ts` |
| Tier 2 seed | `server/src/config/seed-data.ts` |
| Tier 2 verification | `server/src/config/verification-checks.ts` |
| Quest chains | `QUESTS` in `game-data.ts` |

**Product direction:** Introduce a **mission registry** (see §4) so new missions add rows in one place (or generated JSON) and tests enforce completeness.

---

## 2. Multi-tenancy (deployment model)

### 2.1 Learner isolation (already aligned with sandbox doc)

- **Tenant = workshop / organization** (future): separate config, optional Atlas URI, feature flags.
- **Sub-isolation = session + user** inside sandbox DB naming — already implemented.

### 2.2 Recommended next steps

1. **Workshop-scoped secrets:** Atlas URI and KMS config only on server, scoped by `workshopId` (never shipped to client).
2. **Row-level or DB-level separation** for platform collections (`players`, `workshops`, `metrics`) with `tenantId` / `workshopId` on every document.
3. **Rate limits** already exist (`apiLimiter`); extend per-tenant and per-workshop where needed.
4. **Observability:** structured logs with `sessionId`, `userId`, `missionId`, `workshopId` (PII-safe handles only).

---

## 3. Refactor themes (product-ready code)

Ordered for **risk reduction** and alignment with [sandbox-strategy-final.md §8](./sandbox-strategy-final.md).

1. **Execution contract:** Single TypeScript type for `/api/execute/run` and future `/api/execute/repl` responses; share between client `api.ts` and server routes.
2. **Mission metadata module:** Export `MissionDefinition` including `tier`, `requiresAtlas`, `seedMissionId`, and objective ids — consumed by UI, `MISSION_TIERS` (or replace map with this module).
3. **Simulation registry:** Same pattern as `simulationHandlers` but keyed by mission/command for testability.
4. **Auth + progress:** Merge local and server progress on session start; conflict policy (server wins).
5. **Option F phases:** Implement REPL + TerminalPanel per doc Track UX; keep Monaco mission UX invariants (§2).

---

## 4. Reusable components and duplication

- **Client:** Extract mission header, objective list, validation merge, and execution panel from `MissionPage.tsx` into focused components/hooks (single `useMissionExecution` hook wrapping Tier 1 + 2 + 3).
- **Server:** Shared helpers for “resolve tier for mission”, “require sandbox”, and “normalize execution output”.
- **Content authoring:** Use [MASTER_PROMPT_MISSION_QUEST_AUTHORING.md](./MASTER_PROMPT_MISSION_QUEST_AUTHORING.md) plus **contract tests** (`src/test/mission-content-contract.test.ts`, `server/src/mission-contract.test.ts`) so new missions cannot miss a slice of the matrix.

---

## 5. Testability (mandatory for new missions)

Before merging a new or refined mission:

1. Run **`npm test`** (root) — validates `MISSIONS` ↔ `MISSION_VALIDATIONS` ↔ `MISSION_SKELETONS` ↔ `QUESTS` references.
2. Run **`npm test`** in **`server/`** — validates Tier `execute` missions have **seed + verification** entries and objective coverage.

When a bug is found (e.g. Tier 2 mission missing checks), add a **regression assertion** in the contract test or a focused unit test, and update the master prompt’s “common mistakes” section.

---

## 6. Phased roadmap (merged with sandbox-strategy-final)

| Phase | Outcome | Sandbox doc reference |
|-------|---------|------------------------|
| **P0** | Contract tests + doc + mission registry design | §10 manifest |
| **P1** | Server-owned progress; tenant/workshop id on platform data | §5 workshops |
| **P2** | `POST /api/execute/repl` + TerminalPanel | §8 Track UX 1a–1b |
| **P3** | Prefix remapping for Atlas small tiers | §6 Multi-tenancy |
| **P4** | Optional Atlas proxy for Tier 3 | §7 |
| **P5** | Container bash / IDE (Option B/E) | §4 Option F |

---

## 7. References

- **Authoritative execution UX and infra:** [sandbox-strategy-final.md](./sandbox-strategy-final.md)
- **Mission/quest authoring for humans + LLMs:** [MASTER_PROMPT_MISSION_QUEST_AUTHORING.md](./MASTER_PROMPT_MISSION_QUEST_AUTHORING.md)
