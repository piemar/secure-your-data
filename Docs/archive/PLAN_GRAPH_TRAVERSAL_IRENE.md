# Plan: Graph Traversal Irene Lab

**Description:** MongoDB Graph Traversal  
**Lab name (title):** Graph Traversal Irene  
**Source:** ADD_LAB_MASTER_PROMPT.md (minimal mode: description + lab name)

---

## 1. Objective and scope

- **Goal:** Implement the lab to the full ADD_LAB_MASTER_PROMPT standard: 5–6 hands-on steps, lab overview (whatYouWillBuild, keyInsight, keyConcepts), enhancements with runnable code (mongosh + Node where applicable), skeleton + inlineHints, multi-tenancy (YOUR_SUFFIX), no Terminal-only blocks, optional verification.
- **Current state:** `src/content/topics/query/graph/lab-graph-traversal.ts` exists as a stub (3 steps, no overview, no enhancementIds, no enhancements file). Verification IDs exist but return NOT_IMPLEMENTED. Loader has no `graph` prefix.
- **Out of scope (for this plan):** Competitor equivalents, elevated preview (table/chart) — can be added later if desired.

---

## 2. Topic, POV, naming

| Item | Value |
|------|--------|
| **Topic** | `query` |
| **POV folder** | `graph` |
| **Lab id** | `lab-graph-traversal` (keep) or `lab-graph-traversal-irene` (if you want a distinct id) |
| **Lab title** | **Graph Traversal Irene** |
| **Description** | MongoDB Graph Traversal — model relationships and traverse them with `$graphLookup`. |
| **POV capability** | `GRAPH` |
| **EnhancementId prefix** | `graph.` (e.g. `graph.model-data`, `graph.basic-lookup`, …) |

---

## 3. Overview content (intro tab)

To be researched from [MongoDB $graphLookup docs](https://www.mongodb.com/docs/manual/reference/operator/aggregation/graphLookup/) and written into the lab definition.

- **whatYouWillBuild** (3–6 bullets), e.g.:
  - Model hierarchical or network relationships in documents (e.g. employees → manager, reports).
  - Run a basic `$graphLookup` aggregation to traverse from a starting node.
  - Use `maxDepth` and `depthField` to control and inspect traversal depth.
  - Restrict traversal with `restrictSearchWithMatch`.
  - Interpret results and explain when to use `$graphLookup` vs dedicated graph DBs.
- **keyInsight:** One–two sentences: e.g. MongoDB’s `$graphLookup` lets you run recursive, multi-hop traversals directly in the aggregation pipeline without a separate graph database.
- **keyConcepts** (4+ terms), e.g.:
  - **$graphLookup** — Aggregation stage that recursively matches `connectFromField` to `connectToField` and returns an array of connected documents.
  - **startWith** — Expression for the initial value(s) to begin the recursive search.
  - **connectFromField / connectToField** — Fields that define the edge (from current doc → to next doc).
  - **maxDepth** — Optional limit on recursion depth.
  - **depthField** — Optional output field storing the depth at which each document was found.

---

## 4. Data model and dataRequirements

- **Domain:** Employee / reporting hierarchy (or similar) so that “manager” and “reports” form a clear graph. Each document has e.g. `_id`, `name`, `managerId` (reference to another document’s `_id`). Root has no manager or `managerId: null`.
- **Database/collection:** Use **multi-tenancy**: e.g. database `graph_traversal_YOUR_SUFFIX` and collection `employees` (or `graph_traversal_YOUR_SUFFIX.employees`). Substitute YOUR_SUFFIX at runtime.
- **dataRequirements:** Add to lab definition:
  - Either **type: 'collection'** with namespace `graph_traversal_<suffix>.employees` and description that sample data is created in Step 1, or **type: 'script'** with path to a seed script if we add one. Per ADD_LAB, labs that need pre-loaded data should declare it; here the first step will create the data (drop + insert 200+ docs), so one option is a single requirement describing “Employees collection created in Step 1 (200+ docs).”
- **Sample data creation (Step 1):** Drop collection, then insert a small set of fixed hierarchy docs (e.g. CEO → directors → team leads → employees) plus a loop to reach **at least 200 documents**. Use YOUR_SUFFIX in DB/collection names.

---

## 5. Steps (5–6 steps, hands-on)

| # | Step title | enhancementId | Narrative (2–4 sentences) | Main tasks | verificationId |
|---|------------|---------------|---------------------------|------------|----------------|
| 1 | Step 1: Create graph data (employees hierarchy) | `graph.traversal-seed-data` | Model a reporting hierarchy: each document has name and managerId pointing to another document’s _id. Drop the collection and insert 200+ employees so later steps have a real graph to traverse. | Drop collection, define helper to create employee docs, insert root + hierarchy + loop to 200+, print count. | Omit or implement `graph.verifySeedData` (e.g. count >= 200). |
| 2 | Step 2: Basic $graphLookup traversal | `graph.traversal-basic-lookup` | Use $graphLookup to start from one employee (startWith) and follow managerId → _id to collect all reports (direct and indirect). | aggregate with $match (one employee) then $graphLookup: from same collection, startWith that doc’s _id, connectFromField/connectToField, as. Print result. | Omit or implement `graph.verifyBasicLookup`. |
| 3 | Step 3: Limit depth and add depthField | `graph.traversal-depth` | Control how many hops to follow with maxDepth and record the depth of each reached document with depthField. | Add maxDepth (e.g. 2) and depthField to $graphLookup; print array with depth. | Omit or implement. |
| 4 | Step 4: Restrict traversal with restrictSearchWithMatch | `graph.traversal-restrict` | Restrict which documents are considered during traversal (e.g. only certain roles or departments). | Use restrictSearchWithMatch in $graphLookup; run and print. | Omit or implement. |
| 5 | Step 5: Multi-hop use case (e.g. “all reports under X”) | `graph.traversal-reports-under` | Answer a business question: “all direct and indirect reports under a given manager.” | Pipeline: $match manager by name or _id, $graphLookup with connectFromField = _id, connectToField = managerId (or inverse depending on direction), as. Print. | Omit or implement. |
| 6 | Step 6: Explain graph queries to a customer | `graph.traversal-explain` | Summarize when to use $graphLookup vs a dedicated graph DB; supported use cases and limitations. | No code block, or a short text/markdown block: bullet list or 2–3 sentences. Per ADD_LAB, “every step must be actual code”; if we keep this step, make it a minimal “print key points” script or move the narrative to keyInsight/overview and merge into 5 steps. | Omit verification. |

**Recommendation:** Prefer **5 steps** with real code: drop Step 6 as a separate “explain” step and fold the messaging into the lab overview (keyInsight/keyConcepts) and a short tip in Step 5. Then steps are: 1) Seed data, 2) Basic $graphLookup, 3) maxDepth/depthField, 4) restrictSearchWithMatch, 5) Full “reports under X” use case.

---

## 6. Enhancements (code blocks)

- **File to create:** `src/content/topics/query/graph/enhancements.ts`.
- **Pattern:** One entry per enhancementId; each entry has `id`, `povCapability: 'GRAPH'`, `sourceProof`, `sourceSection`, `codeBlocks`, `tips` (2–4).
- **Code blocks:**
  - **Node (`.cjs`):** Use `client.db("graph_traversal_YOUR_SUFFIX")` (or similar); run aggregation with `collection.aggregate([...]).toArray()` and `console.log(JSON.stringify(..., null, 2))`.
  - **Mongosh:** Use `use("graph_traversal_YOUR_SUFFIX");` (or equivalent); run same logic with `db.employees.aggregate([...])` and `printjson(...)` so output is visible. Per ADD_LAB: prefer mongosh when possible; Node + Mongosh steps = two blocks (Node first, then Mongosh), no Terminal block.
- **Skeleton + inlineHints:** Every Node and Mongosh block gets a skeleton with 2–4 placeholders (e.g. `_________`) and matching inlineHints (line, blankText, hint, answer). One placeholder per line. TASK header at top of each block (e.g. `// STEP 1: Create graph data`).
- **Step 6 (if kept):** If we retain an “explain” step, use a single block (e.g. Mongosh) that only prints a short bullet list (no blanks), or a text-only enhancement; otherwise omit enhancementId for that step.

---

## 7. Verification

- **Current:** `graph.verifyModel`, `graph.verifyTraversal`, `graph.verifyExplanation` (and other graph.*) are registered but return NOT_IMPLEMENTED.
- **Options:**  
  - **A)** Remove verificationId from all steps in this lab so the UI does not promise validation; implement later.  
  - **B)** Implement 1–2 simple checks (e.g. `graph.verifySeedData`: collection exists and count >= 200; `graph.verifyBasicLookup`: aggregation returns non-empty array) in `VerificationService` and `validatorUtils` if needed.
- **Plan recommendation:** Start with **Option A** (omit verificationId) so we don’t add stub verification; add real verification in a follow-up if desired.

---

## 8. Loader and registration

- **Loader:** Add `'graph': () => import('@/content/topics/query/graph/enhancements')` to `moduleMap` in `src/labs/enhancements/loader.ts`. Add `'graph'` to `preloadAllEnhancements` array.
- **Index:** Lab is already imported and listed in `src/content/topics/index.ts` as `labGraphTraversalDefinition`. Ensure the import path and export name stay correct; update the lab definition in place (title, overview, steps with enhancementIds, dataRequirements, prerequisites including mongosh).

---

## 9. Lab definition updates

- **Title:** Set to **Graph Traversal Irene**.
- **Description:** Short line e.g. “MongoDB Graph Traversal — model relationships and traverse them with $graphLookup.”
- **prerequisites:** Include Atlas (or local MongoDB), Node.js, and **mongosh** (path in Workshop Settings). Optionally .NET if we add C# later.
- **requiredPrereqIds:** e.g. `['atlas', 'mongosh', 'node', 'npm']`.
- **whatYouWillBuild, keyInsight, keyConcepts:** As in §3.
- **dataRequirements:** As in §4.
- **steps:** Replace existing 3 steps with 5 (or 6) steps; each step has `enhancementId: 'graph.<suffix>'`, narrative, instructions, estimatedTimeMinutes, points, hints (3–5), and no verificationId (or add when implemented).
- **Multi-tenancy:** All code and docs use DB/collection names with YOUR_SUFFIX.

---

## 10. Tests and validation

- **Enhancement tests:** Create `src/test/labs/GraphEnhancements.test.ts` (or add to existing if present). For each enhancementId used: `getStepEnhancement('graph.<suffix>')` is defined, has codeBlocks length > 0, and code contains a meaningful string. One test: unknown id returns undefined.
- **Hint rendering:** After implementing enhancements, run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` and fix any placeholder/hint mismatches (line, blankText).
- **Content validation:** Run `node scripts/validate-content.js` after all edits.
- **Manual:** Open lab in app; run each step (Run all / Run selection) and confirm output in Console.

---

## 11. Implementation order

1. **Create feature branch** – From repo root: `git checkout -b feature/lab-graph-traversal` (or `feature/lab-graph-traversal-irene`). All lab changes go on this branch.
2. **Research:** Read MongoDB $graphLookup docs to finalize parameters and examples for overview and steps.
3. **Lab definition:** Update `lab-graph-traversal.ts` (title “Graph Traversal Irene”, overview, 5 steps with enhancementIds, dataRequirements, prerequisites; remove or keep verificationIds per §7).
4. **Enhancements:** Create `graph/enhancements.ts` with entries for `graph.traversal-seed-data`, `graph.traversal-basic-lookup`, `graph.traversal-depth`, `graph.traversal-restrict`, `graph.traversal-reports-under` (and optional explain step). Each with Node + Mongosh blocks, skeleton, inlineHints, TASK header, YOUR_SUFFIX.
5. **Loader:** Add graph to loader moduleMap and preload.
6. **Tests:** Add or update GraphEnhancements.test.ts; run and fix.
7. **Validation:** validate-content.js; validate-hint-rendering.test.ts; manual run-through.

---

## 12. File checklist

| Action | Path |
|--------|------|
| Update | `src/content/topics/query/graph/lab-graph-traversal.ts` |
| Create | `src/content/topics/query/graph/enhancements.ts` |
| Update | `src/labs/enhancements/loader.ts` (moduleMap + preload) |
| Create or update | `src/test/labs/GraphEnhancements.test.ts` |
| No change (unless new lab id) | `src/content/topics/index.ts` (already imports graph traversal lab) |

Optional later: implement verification cases in `verificationService.ts` and add verificationId back to steps.
