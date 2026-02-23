# Lab Sample Data: Plan for Supportive Data and Reset Behavior

**Last updated:** 2026-02-23

This document analyses the codebase and proposes an approach for labs that require pre-loaded collections and data (e.g. Rich Query Basics, in-place analytics, workload isolation) so that queries and steps return sensible results. A key requirement is that **resetting the lab restores the original dataset** as when loaded for the first time.

---

## 1. Current State (Analysis)

### 1.1 Data requirements are metadata-only

- **Type:** `LabDataRequirement` in `src/types/index.ts`: `id`, `description`, `type: 'collection' | 'file' | 'script'`, `path?`, `namespace?`, `sizeHint?`.
- **Usage:** Many labs define `dataRequirements` on the lab definition (e.g. `lab-rich-query-basics.ts`, `lab-in-place-analytics-basics.ts`, CSFLE, QE, RTE, scalability, operations, deployment, integration). See `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md`: *"The LabRunner or setup wizard can use dataRequirements to: 1) Show a 'Data setup' step before the lab starts, 2) Offer to load sample data into MongoDB, 3) Copy script templates to a workspace, 4) Validate that required collections exist. **Implementation is deferred to a future phase.**"*
- **Reality:** No code today uses `dataRequirements` to load data or gate the lab. LabRunner and LabViewWithTabs do not read `dataRequirements` for UI or behaviour.

### 1.2 Lab start and reset

- **Start:** `LabViewWithTabs` → `LabIntroTab` shows a single **"Start Lab"** button. `handleStartLab()` only switches the active tab to `steps`. There is no data-load step or "Load Sample Data" action.
- **Reset:**  
  - `useProgress.resetLabProgress(labId)` clears `completedSteps` and timers only.  
  - `labWorkspaceStorage`: "Reset" in the step toolbar clears editor state and log entries for that lab via `clearLabWorkspace` (or equivalent).  
  - **No** "restore dataset" behaviour exists, because no mechanism loads or snapshots the lab’s sample data.

### 1.3 How data could be loaded today (technical)

- The app already has **`/api/run-node`**, **`/api/run-mongosh`**, **`/api/run-bash`** (Vite dev server in `vite.config.ts`). The server can run Node scripts or mongosh against the lab MongoDB (using `labMongoUri`).
- So a "Load Sample Data" action could:
  - Call a new endpoint (e.g. `/api/lab-load-sample-data`) that runs a **seed script** (Node or mongosh) that inserts the canonical dataset into the required namespace(s), or
  - Reuse existing run-node/run-mongosh by having the UI execute a dedicated "seed" code block or script referenced by `dataRequirements` (e.g. `type: 'script'`, `path: 'scripts/seed.cjs'`).

### 1.4 Labs that need supportive data (examples)

| Lab / area | What’s needed | Source in code |
|------------|----------------|----------------|
| Rich Query Basics | `RICH-QUERY.customers` (e.g. 1M docs); template file | `lab-rich-query-basics.ts` dataRequirements |
| Rich Query Aggregations | Same or similar collection | `lab-rich-query-aggregations.ts` |
| In-place analytics | `FAST-ANALYTICS.customers` (mongorestore .bson.gz) | Step 1 "Load Sample Data"; instructions use mongorestore |
| Workload isolation | 1M customer docs (mgeneratejs + mongoimport) | `workload-isolation.data-load` enhancement |
| Consistency (sharded) | 1M people in `world.people` | `lab-consistency-sharded-setup.ts` |
| Reporting | Airlines on-time data (~1.3M) via import_data.sh | `reporting.load-data` |
| Partial recovery | 100 customers in `test.customers` | mgeneratejs + Customer360Data.json |
| Full recovery RTO | 10 GB into test.customers | load-data step |
| Flexible / other | Various collections per proof | dataRequirements in lab defs |

So the need is real and already documented in steps and `dataRequirements`; only the **execution** of loading (and reset = restore) is missing.

---

## 2. Requirements (Summary)

- **Supportive data:** For labs that require pre-loaded data, the app should support loading a **canonical dataset** so that steps (queries, aggregations, verification) produce sensible results.
- **Reset = original dataset:** When the user **resets the lab**, the dataset should return to the **original** state (same as after first load). So either:
  - **Re-load:** Reset triggers the same load again (drop + insert canonical data), or  
  - **Snapshot/restore:** After first load we snapshot the DB/collections and restore that snapshot on reset (harder in Atlas; easier in local Docker).
- **UX:** Decide whether:
  - **Option A:** Data is loaded **automatically when clicking "Start Lab"** (one click; user waits for load then lands on steps), or  
  - **Option B:** A separate **"Load Sample Data"** button; **"Start Lab" is disabled** until sample data is loaded (explicit step; user sees load state and can retry).

---

## 3. UX Options

### Option A: Load on Start (single action)

- User clicks **"Start Lab"**.
- If the lab has **sample data requirements** and data is **not yet loaded**:
  - Show a loading state (e.g. "Loading sample data…" with progress or spinner).
  - Run the lab’s load (e.g. call `/api/lab-load-sample-data?labId=lab-rich-query-basics` with current URI).
  - On success: mark "sample data loaded" for this lab + URI, then switch to Steps tab.
  - On failure: show error and allow retry (and optionally "Start anyway" for advanced users).
- If the lab has no data requirements, or data is already loaded: go straight to Steps (current behaviour).
- **Reset lab:** Clear progress and workspace; if the lab has sample data, **re-run the load** (drop target collections and re-insert) so the dataset is back to original.

**Pros:** One click; simple mental model.  
**Cons:** First start can be slow for large datasets; "Start" conflates "load data" and "go to steps."

### Option B: Separate "Load Sample Data" button (recommended)

- On the **Overview** tab, for labs that **require sample data** (derived from `dataRequirements` with `type: 'collection'` or a seed `script`):
  - Show a **"Load Sample Data"** button (and optionally short text: "This lab needs sample data in MongoDB. Load it once before starting.").
  - Show state: **Not loaded** | **Loading…** | **Loaded** (and optionally last load time / doc count).
- **"Start Lab"** is **disabled** until sample data is loaded (with tooltip e.g. "Load sample data first").
- After load, **"Start Lab"** is enabled and works as today (switch to Steps).
- **Reset lab:**  
  - Clears step progress and workspace (as today).  
  - For "dataset" reset, either:  
    - **Option B1:** Reset does **not** auto-reload data; user must click **"Load Sample Data"** again (simple; they get a fresh dataset each time they explicitly load).  
    - **Option B2:** Reset **also** triggers reload of sample data (drop + re-insert) so the lab is fully back to initial state without an extra click.

**Pros:** Clear separation: "load data" vs "start steps"; user sees load state and can retry; Start disabled until ready avoids empty queries.  
**Cons:** Two clicks for data-dependent labs; need to pass `dataRequirements` (or a `requiresSampleData` flag) into the Overview/Intro UI.

**Recommendation:** **Option B** with **Option B2** (reset also reloads sample data so that "Reset" truly restores the original dataset). This matches the requirement that reset restores the original dataset without forcing the user to remember to click "Load Sample Data" again.

---

## 4. Data Model and "Requires Sample Data"

- **Source of truth:** Lab definition’s `dataRequirements` (and optionally step-level).
- **Derived flag:** A lab **requires sample data** if it has at least one `LabDataRequirement` that implies loading into MongoDB, for example:
  - `type === 'collection'` with a `namespace` (we need to ensure that collection is populated), or  
  - `type === 'script'` with a `path` that is a seed script (e.g. `scripts/seed.cjs`).
- **Optional:** Add an explicit `requiresSampleData?: boolean` on `WorkshopLabDefinition` so that not every `dataRequirements` entry means "must load" (e.g. some might be "optional template file"). If we don’t add it, we can derive: e.g. "requires load" iff any requirement has `type === 'collection'` or (`type === 'script'` and path looks like a seed).

**Persistence of "loaded" state:**

- Store per **lab + MongoDB URI** (or lab + "current session"): "sample data loaded at &lt;timestamp&gt;".
- Storage: `localStorage` or existing workshop session (e.g. `workshop_lab_data_loaded_{labId}_{uriHash}`) so that:
  - Same user, same URI: we don’t reload every time they open the lab.
  - Different URI (e.g. they switched Atlas cluster): we treat as "not loaded" and show "Load Sample Data" again.
- **Reset lab** (per lab): clear progress and workspace; set "sample data loaded" to false (or delete the key) so that the next time they open Overview we show "Load Sample Data" again; and optionally **trigger reload in background** (Option B2) so that after reset they already have fresh data.

---

## 5. Reset = Original Dataset (Implementation Choices)

- **Re-load on reset (recommended):** When user clicks "Reset lab":
  1. Clear step progress and workspace (current behaviour).
  2. If the lab has sample data requirements, call the same load API again (e.g. drop the target collections and re-run the seed script). Optionally set "sample data loaded" to true again after success so the UI stays in "Loaded" state.
- **Snapshot/restore:** Only feasible in environments where we can snapshot the DB (e.g. local Docker with volume snapshots). Not recommended for Atlas; re-load is simpler and works everywhere.
- So: **canonical dataset** = output of the **seed script / load procedure**; "original dataset" = run that procedure again on reset.

---

## 6. Implementation Plan (Phased)

### Phase 1: Metadata and UI wiring (no backend load yet)

- **6.1** Add a helper (e.g. `labRequiresSampleData(lab: WorkshopLabDefinition): boolean`) based on `dataRequirements` (e.g. any `type === 'collection'` or `type === 'script'` with path).
- **6.2** Pass from LabRunner → LabViewWithTabs: full lab def or at least `dataRequirements` and `requiresSampleData` (if we add it). LabViewWithTabs passes to LabIntroTab.
- **6.3** LabIntroTab: if `requiresSampleData`:
  - Show **"Load Sample Data"** button and state (Not loaded / Loading / Loaded).
  - **"Start Lab"** disabled until state === Loaded; tooltip when disabled: "Load sample data first."
- **6.4** Persist "sample data loaded" in localStorage (key by lab id + URI hash). Read on mount so we show Loaded when appropriate.

At the end of Phase 1, the UI is in place but "Load Sample Data" can show a toast "Not implemented yet" or call a stub API that returns 501. Start remains disabled until "loaded" is set (e.g. via dev-only button or mock).

### Phase 2: Backend load and reset

- **6.5** Define **per-lab load procedure**: for each lab that requires data, we need a concrete way to load (e.g. a Node script in the repo or an enhancement that holds the seed code). Options:
  - **A:** New API `POST /api/lab-load-sample-data` with `{ labId, uri }`. Server looks up lab’s `dataRequirements`, finds the seed script (or embedded seed code), runs it (e.g. via run-node or run-mongosh) against `uri`. Script is responsible for drop + insert so it’s idempotent.
  - **B:** Seed code lives in enhancements (e.g. `rich-query.seed-data`) and the API runs that code via existing run-node/run-mongosh.
- **6.6** Implement the load API (idempotent: drop target collections, then insert canonical data). Return success/failure and optional counts.
- **6.7** Wire "Load Sample Data" button to call this API; on success set "sample data loaded" and update UI to Loaded; enable "Start Lab."
- **6.8** **Reset lab:** When user resets:
  - Clear progress and workspace (existing behaviour).
  - If lab requires sample data, call the same load API again (re-load dataset). Optionally clear "sample data loaded" and set it again after successful re-load so state is consistent.

### Phase 3: Labs and seed scripts

- **6.9** For each lab that needs data (Rich Query Basics, In-place analytics, Workload isolation, etc.), add or point to a **canonical seed script** (e.g. in proof folder or in `content/topics/.../scripts/`) and ensure `dataRequirements` references it (e.g. `type: 'script'`, `path: 'scripts/seed.cjs'`). For very large datasets (e.g. 10 GB), document that "Load Sample Data" may take several minutes or offer a smaller dataset option.
- **6.10** Optional: add `loadStrategy?: 'script' | 'mongoimport' | 'mongorestore'` and path/filename so the server can choose the right runner (node, mongoimport, mongorestore).

---

## 7. Recommendation Summary

- **UX:** Use **Option B**: separate **"Load Sample Data"** button on Overview; **"Start Lab"** disabled until sample data is loaded. On **Reset**, re-run the load so the dataset is restored to the original state (Option B2).
- **Data model:** Use existing `dataRequirements`; derive "requires sample data" from `type === 'collection'` or seed `script`; persist "loaded" per lab + URI.
- **Implementation:** Phase 1 (UI + metadata + stub), Phase 2 (load API + reset re-load), Phase 3 (per-lab seed scripts and docs).
- **Reset behaviour:** Always re-run the lab’s load procedure on reset when the lab requires sample data, so the user gets the original dataset back without an extra click.

---

## 8. Files to Touch (Checklist)

- **Types:** `src/types/index.ts` – optional `requiresSampleData` on lab def; no change to `LabDataRequirement` if current fields suffice.
- **Content:** Lab definitions already have `dataRequirements`; add or align seed script paths where missing.
- **LabRunner:** Pass lab def (or `dataRequirements` + derived flag) to LabViewWithTabs.
- **LabViewWithTabs:** Accept and pass to LabIntroTab; optionally hold "sample data loaded" state (or read from storage).
- **LabIntroTab:** Add "Load Sample Data" section; disable "Start Lab" until loaded when lab requires sample data.
- **Storage:** New helper or key pattern for "sample data loaded" (lab id + URI hash).
- **API:** New endpoint (e.g. `POST /api/lab-load-sample-data`) in `vite.config.ts` (or separate server); implement per-lab load via run-node/run-mongosh or dedicated seed runner.
- **Reset:** In the component that handles "Reset lab" (e.g. step toolbar or lab menu), after clearing progress/workspace, call load API again if lab requires sample data.
- **Docs:** Update `LAB_FOLDER_STRUCTURE_GUIDELINE.md` to describe that data loading is implemented and that reset restores the original dataset; optionally add a short "Lab sample data" section in `ADD_LAB_MASTER_PROMPT.md` for new labs that need data.
