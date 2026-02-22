# Lab App Preview & Visualization

**Goal:** When demonstrating a capability, show how it would look or behave in a real app—not only code and terminal output. For example, in an Atlas Search lab, when the user clicks **Run** (or a dedicated **Try it**), render an actual search UI: search field, results, facets, autocomplete. The user can type, change filters, and see the experience. Code in the editor can still be changed to test different pipelines.

**Question:** Would this be possible for **all** labs?

**Short answer:** **Not literally all**—but we can support it for **many** labs by defining a small taxonomy and adding optional preview components per step or per lab.

---

## 1. Taxonomy: When to Show What

| Category | Description | Example labs | What we show |
|----------|-------------|-------------|--------------|
| **Interactive app preview** | Capability is best shown as an app the user can use (search, form, dashboard). | Atlas Search (text-search, autocomplete, facets), maybe Encryption (insert/query with “encrypted vs plain” toggle). | Real UI: search box, results list, facets, autocomplete dropdown. User types and sees results. Code can drive the behavior. |
| **Visualization** | Capability is about infrastructure or flow; “how it looks in an app” is less relevant than “how it works.” | HA failover, scale-out, backup/RPO/RTO, migration. | Diagrams, timelines, before/after state (e.g. topology, failover timeline, shard distribution). Not necessarily a full app. |
| **Terminal / code only** | Execution is CLI or script-heavy; output is the main artifact. | CSFLE setup (AWS KMS, key vault), reporting (ODBC), some ops. | Keep current Run + console/terminal output. Optional: small “what this means” callout or diagram. |

So: **all labs** can have an improved experience, but not all need a **full app UI**. Many get **interactive preview** or **visualization**; the rest stay **terminal + code** with optional visuals.

---

## 2. Atlas Search: Concrete “Search Experience” Preview

**Idea:** For Atlas Search labs (text-search basics, autocomplete, facets, highlighting), add an optional **Search experience** preview.

- **When:** User clicks **Run** (or a separate **Try it** / **Open search UI**).
- **What:** A panel or modal with a real search UI:
  - Search input (user can type).
  - Optional: autocomplete dropdown (for autocomplete steps).
  - Optional: facet filters (category, etc.) for faceted-search steps.
  - Results list (title, snippet, score or highlight).
- **How:**
  - **Option A – Backend runs pipeline:** Frontend sends the current step’s pipeline (or a parameterized version) to an API (e.g. `/api/run-search-preview`). Backend runs the aggregation against the lab MongoDB and returns results. Frontend renders them in the Search UI.
  - **Option B – Frontend only (no DB):** Use sample/mock results for the preview so it works without a live DB; code in the editor is still the “real” pipeline for copy-paste.
- **Code:** The code in the editor can remain the source of truth. User can edit the pipeline (e.g. change `$search` text query or facets) and click Run again to see updated behavior in the same Search UI.

**Deliverables for Atlas Search:**

1. A **SearchExperience** (or **AtlasSearchPreview**) component: search input, results list, optional facets, optional autocomplete.
2. Step or block metadata: e.g. `previewType: 'search'` or `previewComponent: 'SearchExperience'`.
3. When `previewType === 'search'` and user clicks Run (or **Try it**):
   - Run the pipeline (existing run-mongosh or a dedicated search-preview API).
   - Pass results (and facet counts if any) into **SearchExperience**.
   - Show the preview panel alongside or instead of raw terminal output (configurable).
4. Optionally: **Try it** only shows the UI; **Run** shows terminal output; or both.

---

## 3. Extending to Other Labs

- **Encryption (CSFLE / QE):** Small “app” UI: form to “insert” a document, then show “stored view” (encrypted fields as binary) vs “decrypted view” (plaintext). Or a simple query box that runs a query and shows encrypted vs decrypted. This is an **interactive app preview** with a narrow scope.
- **Analytics / reporting:** Chart or table driven by the aggregation from the step (e.g. bar chart of counts). **Visualization** + optional table.
- **HA / failover / scale-out / backup:** Topology diagram, timeline (e.g. “primary down → election → new primary”), or before/after state. **Visualization** only.
- **Rich query:** Could re-use a small “query builder” or “results table” preview that runs the step’s `find`/aggregation and shows documents. **Interactive app preview** (simpler than Search).

So: **possible for many labs**, with a clear split:

- **App-like preview:** Search, (optionally) Encryption, Rich query.
- **Visualization:** HA, scale-out, backup, migration, reporting (charts/tables).
- **Terminal-only:** Where execution is inherently CLI/script (e.g. AWS KMS, ODBC setup).

---

## 4. Implementation Hooks (minimal)

- **Step/block metadata** (in lab definition or enhancements):
  - `previewType?: 'search' | 'chart' | 'table' | 'encryption-demo' | 'terminal'`
  - Or `previewComponent?: string` (e.g. `'SearchExperience'`) and a registry of components.
- **StepView** (or LabRunner):
  - When rendering a step, if `previewType === 'search'` (or equivalent), render **SearchExperience** in a panel.
  - On Run: call existing run-mongosh (or search-preview API), get results, pass to **SearchExperience**.
- **SearchExperience** component:
  - Props: `results`, `facets?`, `onSearch?(query)`, `onFacetChange?(filter)`, `autocompleteSuggestions?`.
  - Renders: input, optional autocomplete, results list, optional facets. Can be reused across text-search basics, autocomplete, and faceted-search steps.

---

## 5. Generic Elevated Experience (Prompt-Creatable)

So that **any POV** (current or future) can get an app-like preview from prompt-generated content, we use a **generic component** and a **schema-driven config**.

### 5.1 Contract

- **Step-level field:** `preview?: LabStepPreviewConfig` on `WorkshopLabStep` (see `src/types/index.ts`).
- **Config shape:** Discriminated union by `type` with type-specific `config`:
  - `type: 'search'` → `SearchPreviewConfig` (searchField, autocomplete, facetFields, resultFields, showScore, highlight)
  - `type: 'table'` → `TablePreviewConfig` (columns, maxRows)
  - `type: 'chart'` → `ChartPreviewConfig` (chartType, xField, yField, title)
  - `type: 'encryption-demo'` → `EncryptionDemoPreviewConfig` (mode, fields)
  - `type: 'diagram'` → `DiagramPreviewConfig` (variant, title)
  - `type: 'terminal'` → no config; output stays in Console only

- **Data:** After Run, the app passes `LabPreviewData` (rawOutput, documents, facets, suggestions) into the generic component. Documents can be parsed from raw terminal output (trailing JSON array) when the run returns aggregation-style results.

### 5.2 Generic Component

- **`GenericLabPreview`** (`src/components/labs/GenericLabPreview.tsx`): accepts `preview` (config) and `data` (run result). It dispatches to the right renderer (Search, Table, Chart, EncryptionDemo, Diagram) by `preview.type`. New POVs can add new types and register a renderer in the same file.
- **StepView:** When a step has `preview`, it renders `GenericLabPreview` above the Console panel and passes `{ rawOutput: lastOutput }` (and in the future, parsed documents/facets from a dedicated run API if needed).

### 5.3 Prompt Usage

- **ADD_LAB_MASTER_PROMPT** (or a POV-specific prompt) can instruct the AI to add an **elevated experience** for a step by emitting `preview` in the lab definition.
- Example: for an Atlas Search step, add `preview: { type: 'search', config: { searchField: true, resultFields: ['name', 'description'], showScore: true } }`.
- Example: for an analytics step, add `preview: { type: 'chart', config: { chartType: 'bar', xField: '_id', yField: 'count', title: 'Count by category' } }`.
- The same generic component then renders the experience; no one-off UI per POV is required.

### 5.4 Summary

- **Yes, we can demonstrate capability by actually visualizing or implementing how it would look in an app**—especially for Atlas Search (search UI with input, results, facets, autocomplete).
- **Not for every lab in the same way:** use **interactive app preview** (Search, optional Encryption/Rich query), **visualization** (HA, scale, backup, reporting), or **terminal/code** (CLI-heavy steps).
- **Generic system:** One component (`GenericLabPreview`) and a small schema (`LabStepPreviewConfig` + per-type config) let the **prompt create** an elevated experience for any POV. Add `preview` to a step in the lab definition; the app renders the right UI from type + config + run result.
