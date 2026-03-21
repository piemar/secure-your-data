---
name: Sandbox Docs Consolidation
overview: Compare [docs/sandbox-plan.md](mongodb-mayhem-master/docs/sandbox-plan.md) and [docs/sandbox-additons.md](mongodb-mayhem-master/docs/sandbox-additons.md), identify critical content from the latter that must ride alongside Option F in a single authoritative plan document, then produce that new file in-repo.
todos:
  - id: outline-final-doc
    content: Draft sandbox-strategy-final.md structure merging Option F + three-tier model + workshop modes
    status: completed
  - id: embed-additions-critical
    content: Integrate parser/driver, Atlas limits, isolation, mission tables, proxy diagram from sandbox-additons
    status: completed
  - id: unify-file-manifest
    content: Merge file lists; annotate existing server files vs net-new (Terminal, container-manager, IDE)
    status: completed
  - id: dual-track-timeline
    content: Add parallel UX/infra phases + core-engine phases with integration points
    status: completed
  - id: deprecate-pointer
    content: Add short pointers at top of sandbox-plan.md and sandbox-additons.md to final doc (optional)
    status: completed
isProject: false
---

# Consolidated sandbox strategy document

## Relationship between the two sources


| Dimension                               | [sandbox-plan.md](mongodb-mayhem-master/docs/sandbox-plan.md)                                                                                           | [sandbox-additons.md](mongodb-mayhem-master/docs/sandbox-additons.md)                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary goal**                        | Choose and sequence **editor + terminal** delivery (Options A–F, Option F recommended).                                                                 | Explain **three-tier validation**, **real sandbox semantics**, **Atlas/cloud constraints**, and **moderator modes**.                           |
| **Audience**                            | Product/architecture for “how we ship REPL vs Docker vs code-server”.                                                                                   | Implementers and operators: *what* Tier 2 does, *how* code runs safely, *where* it deploys.                                                    |
| **Overlap**                             | Workshop config mentions `sandbox_only`, `atlas_connected` (in Option F block).                                                                         | Same trio `sandbox_only` / `atlas_connected` / `hybrid` plus cloud-proxy diagram; file list for `sandbox.ts`, `code-parser`, `execute` routes. |
| **Gap if you only follow sandbox-plan** | Option F file list does **not** spell out parser→driver model, DB limits, prefix strategy, per-mission cloud requirements, or Tier 3 proxy vs simulate. | Does **not** own Option E extension layout, `TerminalPanel`, `ide-proxy`, or explicit Phase 1–3 ordering for REPL → container → IDE.           |


**Conclusion:** Keep [sandbox-plan.md](mongodb-mayhem-master/docs/sandbox-plan.md) as the **structural spine** (Option F phases, file manifest for A/B/E). Treat [sandbox-additons.md](mongodb-mayhem-master/docs/sandbox-additons.md) as **required operational and validation depth** that must be embedded so implementers do not treat “sandbox” as generic Docker or raw `eval`.

---

## Critical content to pull from sandbox-additons (do not drop)

1. **Three-tier validation model** (Tier 1 pattern/semantic, Tier 2 sandboxed execution, Tier 3 simulate vs cloud-proxy) — maps directly to routing inside `/api/execute/*` and UI behavior on [MissionPage](mongodb-mayhem-master/src/pages/MissionPage.tsx).
2. **Safe execution contract** — user code parsed to `db.collection.method` → driver calls; **no `eval`**; multi-line sequential execution. This is the semantic definition of what Option A’s “REPL” and Option B’s “mongosh” must preserve or wrap consistently.
3. **Production sandbox lifecycle** — create DB `sandbox_{sessionId}_{userId}`, seed, execute, verify, drop; 15m TTL; hourly sweep — aligns Tier 2 with [server/src/services/sandbox.ts](mongodb-mayhem-master/server/src/services/sandbox.ts) patterns already in repo.
4. **Atlas / hosting constraints** — M0–M5 ~100 DB limit → **collection-prefix strategy** inside one DB; M10+ many DBs; sidecar `mongo:7` vs Atlas string for Railway/Render/Fly.
5. **Isolation and security** — MongoDB role scoped to `sandbox_`* only; platform DB `mongodb_mayhem` never used for user execution.
6. **Per-mission operational truth** — seed/verification matrix (CRUD, index/explain, aggregation output, schema validation, geo, transactions, time series); table of missions that **require** Atlas-only features vs cluster infra vs pattern-only fallback.
7. **Cloud proxy architecture** — moderator-configured path: sandbox vs Atlas API proxy vs simulated Tier 3; ties workshop modes to **routing** after parse step (diagram from additions doc).
8. **Implementation order for validation stack** — parser → executor → lifecycle → seeds → verification → `/api/execute` → simulation → missions 21–25 → optional Atlas proxy. This **complements** sandbox-plan Phase 1–3 (REPL/container/IDE) and should be **cross-referenced** (e.g. Phase 1 REPL must call the same parser/executor contract as Tier 2).

---

## Content from sandbox-plan that stays primary

- **Non-negotiable Monaco mission UX** list at top of sandbox-plan (blanks, gutter hints, combo streak, theme, autocomplete, difficulty, validation feedback).
- **Option F decision tree** and phased delivery (A → B → E).
- **Concrete file checklist** for Terminal, container manager, WebSocket terminal, Dockerfiles, extension skeleton, IDE launcher, [MissionPage](mongodb-mayhem-master/src/pages/MissionPage.tsx) integration.
- **Workshop execution modes** — merge with additions: keep `sandbox_only`, `atlas_connected`, `hybrid` as implemented in [WorkshopConfigPanel](mongodb-mayhem-master/src/components/WorkshopConfigPanel.tsx); add `container_bash` and `full_ide` from sandbox-plan as **future** modes with explicit mapping to Options B and E.

---

## Proposed output artifact

Create a **single new doc** (suggested path): [mongodb-mayhem-master/docs/sandbox-strategy-final.md](mongodb-mayhem-master/docs/sandbox-strategy-final.md) (or `SANDBOX_STRATEGY.md` at repo root if you prefer one obvious entry point).

### Suggested outline for the final doc

1. **Purpose and scope** — Editor/terminal strategy + validation/execution semantics in one place.
2. **Mission UX invariants** (from sandbox-plan intro).
3. **Execution and validation model** — Three tiers; table linking tier → backend path → UI feedback (from additions).
4. **Option F: fallback chain** — Decision tree A/B/E; when each mode is selected (infra + moderator config).
5. **Workshop configuration** — Unified enum: current (`sandbox_only`, `atlas_connected`, `hybrid`) + planned (`container_bash`, `full_ide`) with matrix: which tiers/options apply.
6. **Tier 2: Sandbox implementation spec** — Lifecycle, naming, isolation, Atlas limits, prefix strategy, cleanup (from additions).
7. **Tier 3: Simulation vs cloud proxy** — Missions table (Atlas-only, sharding/RS, proposed 21–25); pattern-only vs proxy (from additions).
8. **Phased delivery plan** — **Two parallel tracks** merged in one timeline:
  - **Track UX/infra** (sandbox-plan Phases 1–3: REPL, containers, code-server).
  - **Track core engine** (additions implementation order: parser, executor, sandbox service, seeds, verification, execute API, simulation, cloud missions).
  - Explicit **integration points**: e.g. Phase 1 `/api/execute/repl` must use `code-parser` + same result shape as Tier 2 `run` for consistency.
9. **File manifest** — Single table: file path, phase/track, purpose (merge sandbox-plan “Files to create” with additions “Files to Create/Modify”; mark already-existing files like `server/src/services/sandbox.ts` as **done** or **extend**).
10. **References** — Short note that `sandbox-plan.md` and `sandbox-additons.md` are superseded for day-to-day work once final doc exists (optional: keep originals as appendices or archive).

---

## Optional follow-up (out of scope unless you ask)

- Fix filename typo `sandbox-additons.md` → `sandbox-additions.md` and add a one-line pointer at top of old files to `sandbox-strategy-final.md`.

---

## Deliverable

One PR-ready markdown file at the path chosen above, produced by **editing the repo** after you approve this plan (Agent mode): no changes to application code, only documentation consolidation.