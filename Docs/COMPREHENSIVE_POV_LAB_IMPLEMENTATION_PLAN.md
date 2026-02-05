# Comprehensive PoV Lab Implementation Plan

This document is the single source of truth for the 57 Proof of Value (PoV) capability implementation. It is kept updated as phases complete and requirements evolve.

**Last updated:** 2026-02-05

---

## 1. Overview

- **Source of PoV list:** `Docs/POV.txt` and `Docs/pov-proof-exercises/`
- **Content model:** Labs are `WorkshopLabDefinition` in `src/content/labs/`; steps use `enhancementId` to load code/skeletons/hints from `src/labs/enhancements/metadata/`.
- **Rule:** Each PoV phase has a minimum of 3 labs; each lab has a minimum of 3 steps. Each phase includes documentation, dependent docs, test cases, and cleanup.
- **Principles:** See `Docs/WORKSHOP_FRAMEWORK_PLAN.md` – content-first, UX parity, modes/roles first-class, story & game as design elements.

---

## 2. Plan vs Implementation Sync Analysis (2026-02-05)

### 2.1 What Is in Sync

- **Phases 0–8:** Correctly marked Done. Labs for IN-PLACE-ANALYTICS, WORKLOAD-ISOLATION, CONSISTENCY, SCALE-OUT, SCALE-UP are implemented with enhancements and tests.
- **Encryption labs:** lab-csfle-fundamentals, lab-queryable-encryption, lab-right-to-erasure exist as content definitions. `Lab3RightToErasure.tsx` was removed; labs are content-driven via ContentService.
- **ContentService:** Loads 37 labs from TypeScript modules. All labs are registered.
- **Enhancement loader:** `src/labs/enhancements/loader.ts` has moduleMap for rich-query, flexible, ingest-rate, in-place-analytics, workload-isolation, consistency, scale-out, scale-up, right-to-erasure, csfle, queryable-encryption.

### 2.2 What Is Out of Sync

| Item | Plan Says | Actual Implementation |
|------|-----------|------------------------|
| **RICH-QUERY labs** | 2 labs: lab-rich-query-basics, lab-rich-query-aggregations | 3 labs: also lab-rich-query-encrypted-vs-plain |
| **TEXT-SEARCH (PoV #36, #37)** | Not listed | 3 labs: lab-text-search-basics, lab-text-search-with-autocomplete, lab-text-search-experience |
| **GEOSPATIAL (PoV #30)** | Not listed | 3 labs: lab-geospatial-near, lab-geospatial-polygons, lab-geospatial-performance |
| **GRAPH (PoV #26)** | Not listed | 3 labs: lab-graph-traversal, lab-graph-recommendations, lab-graph-fraud-detection |
| **CHANGE-CAPTURE (PoV #33)** | Not listed | 1 lab: lab-data-change-streams |
| **MONITORING (PoV #28, #29, #25)** | Not listed | 1 lab: lab-operations-monitoring |
| **Lab folder structure** | Flat or optional data folders | All labs in flat `src/content/labs/` – no POV grouping |
| **ContentService registration** | N/A | Manual imports per lab – not scalable |
| **test-lab.ts** | N/A | Exists but not registered in ContentService |

### 2.3 Action Items from Sync

1. Update §4 PoV Capabilities table to include TEXT-SEARCH, GEOSPATIAL, GRAPH, CHANGE-CAPTURE, MONITORING.
2. Implement POV-based folder structure (see §9) before Phase 9.
3. Add lab discovery/loader to eliminate manual ContentService imports.
4. Decide whether to register or remove test-lab.ts.

### 2.4 Known Pre-existing Test Failures (as of 2026-02-05)

Run `npm test -- --run` before marking each phase complete.

**Fixed (2026-02-05):**
- `Lab1CSFLE.test.tsx` – Added workshopUtils mock, extended waitFor timeout
- `Lab2QueryableEncryption.test.tsx` – Added workshopUtils + LabContext mocks, atomic waitFor for tabs
- `Lab3RightToErasure.test.tsx` – Added workshopUtils mock, atomic waitFor for tabs
- `app-flows.test.tsx` – Added workshopUtils mock (partial, importOriginal)

**Remaining:**
- `full-workshop-flow.test.tsx` (E2E) – Router nesting fixed (removed MemoryRouter); "Not implemented: navigation" when AttendeeRegistration triggers reload; workshopUtils mock needs all exports (importOriginal)

---

## 3. Phase Tracking (Where We Are)

| Phase | Scope | Status | Notes |
|-------|--------|--------|-------|
| 0 | Codebase audit & UX baseline | Done | Architecture, risks, UX baseline captured |
| 1 | Domain model & module boundaries | Done | Types, schemas, ContentService, LabRunner |
| 2 | Content-driven labs & LabRunner | Done | Labs in content/, metadata-driven enhancements |
| 3 | Modes, roles, gamification, templates | Done | Demo/lab/challenge modes, templates |
| 4 | IN-PLACE-ANALYTICS (PoV #4) | Done | 3 labs, 8 enhancements, tests |
| 5 | WORKLOAD-ISOLATION (PoV #5) | Done | 3 labs, 9 enhancements |
| 6 | CONSISTENCY (PoV #6) | Done | 3 labs, 9 enhancements |
| 7 | SCALE-OUT (PoV #7) | Done | 3 labs, 9 enhancements |
| 8 | SCALE-UP (PoV #8) | Done | 3 labs, 9 enhancements |
| **0.5** | **POV-based lab folder reorganization** | **Done** | See §9, `Docs/PHASE_0.5_POV_FOLDER_REORGANIZATION_COMPLETION.md` |
| **9** | **MIGRATABLE (PoV #9)** | **Done** | 3 labs, 9 enhancements, tests |
| **10** | **PORTABLE (PoV #10)** | **Done** | 3 labs, 9 enhancements, tests |
| **11** | **AUTO-DEPLOY (PoV #11)** | **Done** | 3 labs, 9 enhancements, tests |
| **12** | **ROLLING-UPDATES (PoV #12)** | **Done** | 3 labs, 9 enhancements, tests |
| **13** | **FULL-RECOVERY-RPO (PoV #13)** | **Done** | 3 labs, 9 enhancements, tests |
| **14** | **FULL-RECOVERY-RTO (PoV #14)** | **Done** | 3 labs, 10 enhancements, tests |
| **15** | **PARTIAL-RECOVERY (PoV #15)** | **Next** | In numeric order per POV.txt |
| 16–57 | Remaining PoV capabilities | Backlog | In numeric order per POV.txt |

---

## 4. PoV Capabilities and Phase Status

| # | Label | Description | Phase status | Labs (content IDs) |
|---|--------|-------------|--------------|---------------------|
| 1 | RICH-QUERY | Compound criteria, sub-docs, arrays | Done | lab-rich-query-basics, lab-rich-query-aggregations, lab-rich-query-encrypted-vs-plain |
| 2 | FLEXIBLE | In-place schema changes, no downtime | Done | lab-flexible-basic-evolution, lab-flexible-nested-documents, lab-flexible-microservice-compat |
| 3 | INGEST-RATE | High-volume ingest with replication | Done | lab-ingest-rate-basics, lab-ingest-rate-bulk-operations, lab-ingest-rate-replication-verify |
| 4 | IN-PLACE-ANALYTICS | Aggregate totals/counts on indexed subset | Done | lab-analytics-overview, lab-in-place-analytics-basics, lab-in-place-analytics-advanced |
| 5 | WORKLOAD-ISOLATION | Aggregations alongside CRUD, isolation | Done | lab-workload-isolation-overview, lab-workload-isolation-replica-tags, lab-workload-isolation-read-preference |
| 6 | CONSISTENCY | Strong consistency in distributed DB | Done | lab-consistency-overview, lab-consistency-sharded-setup, lab-consistency-verify |
| 7 | SCALE-OUT | Add shards at runtime, no downtime | Done | lab-scale-out-overview, lab-scale-out-setup, lab-scale-out-execute |
| 8 | SCALE-UP | Increase/decrease CPU/RAM/Storage dynamically | Done | lab-scale-up-overview, lab-scale-up-setup, lab-scale-up-execute |
| 9 | MIGRATABLE | On-prem to Atlas migration, < 1 min downtime | Done | lab-migratable-overview, lab-migratable-setup, lab-migratable-execute |
| 10 | PORTABLE | Cloud-to-cloud migration (AWS→Azure), < 1 min downtime | Done | lab-portable-overview, lab-portable-setup, lab-portable-execute |
| 11 | AUTO-DEPLOY | Automated cluster provisioning via API, 5–10 min | Done | lab-auto-deploy-overview, lab-auto-deploy-setup, lab-auto-deploy-execute |
| 12 | ROLLING-UPDATES | Apply patches without scheduled downtime | Done | lab-rolling-updates-overview, lab-rolling-updates-setup, lab-rolling-updates-execute |
| 13 | FULL-RECOVERY-RPO | Point-in-time recovery, RPO=0 | Done | lab-full-recovery-rpo-overview, lab-full-recovery-rpo-setup, lab-full-recovery-rpo-execute |
| 14 | FULL-RECOVERY-RTO | Restore within X min for Y GB (RTO) | Done | lab-full-recovery-rto-overview, lab-full-recovery-rto-setup, lab-full-recovery-rto-execute |
| 15–57 | (see POV.txt) | Various | Backlog | To be added in numeric order |

**Additional implemented labs (not yet in formal phase tracking):**

| POV | Labs |
|-----|------|
| TEXT-SEARCH (#36), AUTO-COMPLETE (#37) | lab-text-search-basics, lab-text-search-with-autocomplete, lab-text-search-experience |
| GEOSPATIAL (#30) | lab-geospatial-near, lab-geospatial-polygons, lab-geospatial-performance |
| GRAPH (#26) | lab-graph-traversal, lab-graph-recommendations, lab-graph-fraud-detection |
| CHANGE-CAPTURE (#33), STREAM-PROCESSING (#56) | lab-data-change-streams |
| MONITORING (#28), ALERTS (#29), PERF-ADVICE (#25) | lab-operations-monitoring |

**Encryption (mapped to PoV #46 ENCRYPT-FIELDS, #54 FLE-QUERYABLE-KMIP, #21 ENCRYPTION):**

- lab-csfle-fundamentals
- lab-queryable-encryption
- lab-right-to-erasure

---

## 5. UX & UI Requirements (Must Hold for All Labs)

- **Hint markers ("?"):** Every step that has a skeleton with placeholders (`_________`) MUST show "?" hint markers when inline hints exist. Markers are shown whenever: skeleton + inlineHints + blanks found + editor ready (no longer tied only to "guided" tier). See `InlineHintEditor.tsx` and `findBlankPositions`. **Open:** Some steps still have missing markers; ensure `blankText` matches skeleton and fallback handles all blanks.
- **Placeholders:** Skeleton code uses consistent blank patterns (e.g. `_________`). Each `inlineHints` entry must have `blankText` matching the skeleton exactly, or fallback matching (e.g. 2+ underscores) is used; multiple blanks per line are supported by hint order.
- **Template / lab selection:** Moderators can select a workshop template, build a custom template, clear template, and use "Test Individual Labs" to run one lab at a time without a template. Reset flow must be obvious (e.g. "Clear Template" in Settings).
- **Grouped lab menu:** When many labs are selected, the sidebar/navigation should group labs by topic to avoid verbosity.
- **Full solution + hints:** When the full solution is shown (in lab/challenge mode), it must be accompanied by hint markers ("?") for guided learning (not blank placeholders only). **Exception:** In demo mode, full solution is shown with **no** hint markers (§5.1).
- **Real-time validation:** "Check progress" should perform real validation against DB state, code, or user input where applicable (not only mock tests).
- **Moderator tools:** Reset template selection; test individual labs from Settings → Template tab → Browse Labs & Workshops → "Test Lab".
- **Template nav mismatch:** Top "Labs in this workshop" bar only shows when the current lab is part of the active template; when testing an individual lab outside the template, show "Testing individual lab" indicator instead.

### 5.1 Demo Mode: Full Solution, No Hint Markers

- **When in demo mode:** The **full solution** for each step must be shown (no skeleton/placeholders). **No hint markers ("?")** are displayed in demo mode.
- **Rationale:** Presenters walk through complete examples; attendees follow along without fill-in-the-blank interaction.

### 5.2 Side-by-Side MongoDB vs PostgreSQL (Demo Presenter Mode Only)

**Requirement:** A side-by-side code view comparing MongoDB with a relational database (PostgreSQL) equivalent.

- **Visibility:** Shown **only** when in **demo mode** and user is a **moderator/presenter**.
- **Layout:** MongoDB code on the left; PostgreSQL (or equivalent relational) code on the right.
- **Content:** For each step, show how the same operation would be done in PostgreSQL. When there is no direct feature parity, show the workaround required (e.g. JSONB, application-level joins, materialized views) with a short explanation.
- **Metadata:** Enhancement metadata should support optional `relationalEquivalent` (or similar) per code block: `{ language: 'sql', code: string, workaroundNote?: string }`.
- **Implementation:** Add to `StepView` / `InlineHintEditor` area when `currentMode === 'demo' && isModerator`; can be a collapsible panel or split view.

**PostgreSQL local environment:**

- **PostgreSQL can be spun up locally** (e.g. via Docker container) so presenters can run the PostgreSQL parts live.
- **pgAdmin** (or similar) can connect to the local PostgreSQL Docker container to execute queries and demonstrate the relational equivalent.
- **Docker Compose** (or equivalent) should include an optional PostgreSQL service for demo mode; connection details (host, port, credentials) should be documented for pgAdmin setup.

### 5.3 Browse UI: Labs vs Workshops, Pagination

**Requirement:** A unified browse area where moderators can switch between searching **Labs** or **Workshops** (templates).

- **Mode selector:** Tabs or toggle: "Labs" | "Workshops". Labs tab: browse and test individual labs. Workshops tab: browse and select workshop templates.
- **Pagination:** Both labs and workshops MUST use pagination (e.g. 10 items per page) to avoid slow rendering when the library grows. Show "Showing X–Y of Z" and Prev/Next controls.
- **Search:** Labs: search by title, description, tags. Workshops: search by name, description, industry.
- **Implementation:** `ContentBrowser` component with `LabPoolBrowser` (labs) and `TemplateBrowser` (workshops); both support `pageSize` and pagination controls.

### 5.4 Lab Data Requirements & Folder Structure

**Requirement:** Labs or steps that need data (collections, sample files, scripts) must declare this in metadata so setup can be configured.

- **Types:** `LabDataRequirement` on `WorkshopLabDefinition` and `WorkshopLabStep`; optional `dataRequirements` on `EnhancementMetadata`. Fields: `id`, `description`, `type` (collection | file | script), `path`, `namespace`, `sizeHint`.
- **Lab folder structure:** With POV-based organization (§9), each POV folder contains labs plus optional `data/`, `scripts/`. Reference via `labFolderPath` and `dataRequirements` in the lab definition.
- **Guideline:** See `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md` for structure and examples.

---

## 6. Implementation Checklist per Phase

For each new PoV phase:

1. **Content:** Add lab definitions under `src/content/labs/<pov-slug>/` with `enhancementId` on every step that should show code. If the lab needs data, add `dataRequirements` and optionally `labFolderPath`; use the POV folder's `data/` and `scripts/` subfolders (see §9).
2. **Metadata:** Add or extend enhancement metadata in `src/labs/enhancements/metadata/<prefix>.ts` (codeBlocks with `code`, `skeleton`, `inlineHints`; ensure each `blankText` matches skeleton). Add `dataRequirements` to enhancements when steps need data.
3. **Loader:** Ensure `src/labs/enhancements/loader.ts` has the correct prefix in `moduleMap` if using a new prefix.
4. **Tests:** Add or extend tests under `src/test/labs/` for the new enhancements.
5. **Full test suite:** Run `npm test -- --run` before marking the phase complete. Fix any regressions introduced by the phase. Document known pre-existing failures separately.
6. **Docs:** Update this plan and any phase completion summary in `Docs/`.
7. **Cleanup:** Remove obsolete files or legacy enhancements if fully migrated.

---

## 7. Technical Notes

- **Hint marker visibility:** `InlineHintEditor` shows "?" when `showMarkers` is true: `hasSkeleton && !isSolutionRevealed && (inlineHints?.length ?? 0) > 0 && blankPositions.length > 0 && isEditorReady`. Tier no longer gates markers. **Demo mode:** Do not show hint markers; always show full solution (§5.1).
- **Blank detection:** `findBlankPositions` tries exact `blankText` first; then fallback to all runs of 2+ underscores per line, assigning by hint order on that line so multiple blanks per line get correct positions.
- **Rich-query aggregations:** Steps use `rich-query.basic-aggregation`, `rich-query.projection-aggregation`, `rich-query.facets` in `lab-rich-query-aggregations.ts` and `rich-query.ts` metadata.

---

## 8. Future Work (Captured for Later Phases)

- **Side-by-side MongoDB vs PostgreSQL:** Implement per §5.2 (demo presenter mode only); include local PostgreSQL Docker + pgAdmin setup.
- **Namespaced datasets:** Per-user or per-session data (separate DBs, collections, or documents) and Atlas primary setup for multi-user.
- **Candy Crush–style map:** Challenge/Quest mode with topics as levels.
- **Inline editable inputs:** Better integration with hint markers (UX refinement).
- **Real verification:** Wire "Check progress" to actual DB/code checks where possible.
- **Hint markers audit:** Review all labs for missing "?" markers; fix `blankText` mismatches and fallback coverage.

---

## 9. POV-Based Lab Folder Structure (Phase 0.5)

### 9.1 Rationale

Grouping labs by **POV (Proof of Value)** instead of a flat structure provides:

- **Maintainability:** All labs for a capability live together with their metadata, data, and scripts.
- **Scalability:** New labs are added to the correct POV folder; no manual ContentService imports.
- **Discoverability:** Lab loader can scan `src/content/labs/<pov>/` to auto-register labs.
- **Dependencies:** Each POV folder can declare its own `data/`, `scripts/`, and enhancement metadata.
- **Consistency:** Aligns with POV.txt and phase tracking.

### 9.2 Proposed Structure

```
src/content/labs/
├── rich-query/
│   ├── lab-rich-query-basics.ts
│   ├── lab-rich-query-aggregations.ts
│   ├── lab-rich-query-encrypted-vs-plain.ts
│   ├── data/                    # optional: shared sample data
│   └── README.md                # optional: POV-specific setup notes
├── flexible/
│   ├── lab-flexible-basic-evolution.ts
│   ├── lab-flexible-nested-documents.ts
│   ├── lab-flexible-microservice-compat.ts
│   └── data/
├── ingest-rate/
│   ├── lab-ingest-rate-basics.ts
│   ├── lab-ingest-rate-bulk-operations.ts
│   ├── lab-ingest-rate-replication-verify.ts
│   └── scripts/
├── in-place-analytics/
│   ├── lab-analytics-overview.ts
│   ├── lab-in-place-analytics-basics.ts
│   ├── lab-in-place-analytics-advanced.ts
│   └── data/
├── workload-isolation/
│   ├── lab-workload-isolation-overview.ts
│   ├── lab-workload-isolation-replica-tags.ts
│   └── lab-workload-isolation-read-preference.ts
├── consistency/
│   ├── lab-consistency-overview.ts
│   ├── lab-consistency-sharded-setup.ts
│   └── lab-consistency-verify.ts
├── scale-out/
│   ├── lab-scale-out-overview.ts
│   ├── lab-scale-out-setup.ts
│   ├── lab-scale-out-execute.ts
│   └── data/
├── scale-up/
│   ├── lab-scale-up-overview.ts
│   ├── lab-scale-up-setup.ts
│   ├── lab-scale-up-execute.ts
│   ├── data/
│   └── scripts/
├── encryption/                   # PoV #46, #54, #21
│   ├── lab-csfle-fundamentals.ts
│   ├── lab-queryable-encryption.ts
│   ├── lab-right-to-erasure.ts
│   └── data/
├── text-search/                  # PoV #36, #37
│   ├── lab-text-search-basics.ts
│   ├── lab-text-search-with-autocomplete.ts
│   └── lab-text-search-experience.ts
├── geospatial/                   # PoV #30
│   ├── lab-geospatial-near.ts
│   ├── lab-geospatial-polygons.ts
│   └── lab-geospatial-performance.ts
├── graph/                        # PoV #26
│   ├── lab-graph-traversal.ts
│   ├── lab-graph-recommendations.ts
│   └── lab-graph-fraud-detection.ts
├── change-capture/               # PoV #33, #56
│   └── lab-data-change-streams.ts
├── monitoring/                   # PoV #28, #29, #25
│   └── lab-operations-monitoring.ts
└── index.ts                     # barrel export or lab discovery
```

### 9.3 Primary POV Rule

Labs that cover multiple POVs (e.g. lab-rich-query-encrypted-vs-plain: RICH-QUERY + ENCRYPT-FIELDS) are placed in the folder of their **primary** POV—the main capability the lab teaches. For lab-rich-query-encrypted-vs-plain, primary is RICH-QUERY → `rich-query/`.

### 9.4 Enhancement Metadata

Enhancement metadata stays in `src/labs/enhancements/metadata/<prefix>.ts` (unchanged). The prefix (e.g. `rich-query`, `flexible`) matches the POV slug. No change to the loader.

### 9.5 ContentService Migration

1. **Option A – Barrel exports:** Each POV folder exports its labs; `src/content/labs/index.ts` re-exports all. ContentService imports from the barrel.
2. **Option B – Dynamic discovery:** ContentService (or a LabRegistry) scans `src/content/labs/**/*.ts` and dynamically imports lab definitions. Requires build-time or runtime glob.

Recommendation: Start with **Option A** (barrel exports) for simplicity; migrate to Option B when the lab count grows significantly.

### 9.6 Migration Steps (Phase 0.5)

1. Create POV folders under `src/content/labs/`.
2. Move each lab file into its POV folder.
3. Update `labFolderPath` in lab definitions to point to the new path (e.g. `content/labs/rich-query`).
4. Create `src/content/labs/index.ts` that exports all labs from POV folders.
5. Update ContentService to import from the barrel instead of individual files.
6. Update `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md` to reflect POV-based structure.
7. Run tests and verify all labs load correctly.

---

## 10. Related Docs

- `Docs/POV.txt` – Full list of 57 PoV proofs and links.
- `Docs/WORKSHOP_FRAMEWORK_PLAN.md` – Vision, phases 0–4, content model, principles.
- `Docs/LAB_LIBRARY_ARCHITECTURE.md` – Lab reusability, overlays, POV coverage.
- `Docs/WORKSHOP_LAB_MAPPING.md` – Current labs to content model.
- `Docs/PHASE_4_IN_PLACE_ANALYTICS_COMPLETION_SUMMARY.md` – Phase 4 summary.
- `Docs/PHASE_5_WORKLOAD_ISOLATION_COMPLETION_SUMMARY.md` – Phase 5 summary.
- `Docs/PHASE_6_CONSISTENCY_COMPLETION_SUMMARY.md` – Phase 6 summary.
- `Docs/PHASE_7_SCALE_OUT_COMPLETION_SUMMARY.md` – Phase 7 summary.
- `Docs/PHASE_8_SCALE_UP_COMPLETION_SUMMARY.md` – Phase 8 summary.
- `Docs/PHASE_0.5_POV_FOLDER_REORGANIZATION_COMPLETION.md` – Phase 0.5 summary.
- `Docs/PHASE_9_MIGRATABLE_COMPLETION_SUMMARY.md` – Phase 9 summary.
- `Docs/PHASE_10_PORTABLE_COMPLETION_SUMMARY.md` – Phase 10 summary.
- `Docs/PHASE_11_AUTO_DEPLOY_COMPLETION_SUMMARY.md` – Phase 11 summary.
- `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md` – Lab data requirements and folder structure.
