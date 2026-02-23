# Run All / Run Selection Tip – Validation Summary

**Date:** 2026-02-05  
**Scope:** All labs and steps – standardized approach (Lab 1 Step 3)  
**Criterion:** Every enhancement that has at least one **runnable** code block (`javascript`, `mongosh`, or `python`) must include a tip that mentions **"Run all"** or **"Run selection"** (or equivalent) so learners run code from the editor, not from a Terminal block.

---

## Summary

- **No Terminal blocks** that only run `node file.cjs` / `node file.js` remain; execution is via Run all / Run selection in the editor.
- **Run all / Run selection tips** were added to every enhancement that has a runnable JS, mongosh, or Python block and was missing such a tip.

---

## Enhancements Updated (tip added)

### Query

| Topic / POV | Enhancement IDs |
|-------------|------------------|
| **query/text-search** | `text-search.projectionSort`, `text-search.typeaheadQuery`, `text-search.facetedSearch`, `text-search.highlighting`, `text-search.relevanceTuning` (already had: `text-search.queries`) |
| **query/rich-query** | `rich-query.projection-sort`, `rich-query.pagination`, `rich-query.index-explain`, `rich-query.basic-aggregation`, `rich-query.projection-aggregation`, `rich-query.facets`, `rich-query.encrypted-vs-plain` (setup), `rich-query.encrypted-vs-plain` (queries), `rich-query.encrypted-vs-plain` (design) (already had: `rich-query.compound-query`) |

### Scalability

| Topic / POV | Enhancement IDs |
|-------------|------------------|
| **scalability/ingest-rate** | `ingest-rate.cluster-setup`, `ingest-rate.measure-rate`, `ingest-rate.ordered-vs-unordered`, `ingest-rate.batch-sizing`, `ingest-rate.write-concern`, `ingest-rate.monitor-replication`, `ingest-rate.verify-nodes`, `ingest-rate.failover-test` (already had: `ingest-rate.small-records`) |
| **scalability/scale-up** | `scale-up.verify` |
| **scalability/scale-out** | `scale-out.inspect-results` |
| **scalability/consistency** | `consistency.shard-config`, `consistency.driver-settings` (Python) |

### Data management

| Topic / POV | Enhancement IDs |
|-------------|------------------|
| **data-management/flexible** | All 9: `flexible.initial-collection`, `flexible.add-fields`, `flexible.mixed-queries`, `flexible.nested-subdoc`, `flexible.add-arrays`, `flexible.nested-queries`, `flexible.microservice-one`, `flexible.schema-evolution`, `flexible.microservice-two` (Python) |

### Operations

| Topic / POV | Enhancement IDs |
|-------------|------------------|
| **operations/partial-recovery** | `partial-recovery.verify-present`, `partial-recovery.delete-docs` |

### Analytics

| Topic / POV | Enhancement IDs |
|-------------|------------------|
| **analytics/workload-isolation** | `workload-isolation.read-preference-tags`, `workload-isolation.print-repset-conf`, `workload-isolation.inspect-tags`, `workload-isolation.update-script`, `workload-isolation.query-script` |
| **analytics/in-place-analytics** | `in-place-analytics.data-setup` (mongosh verify), `in-place-analytics.index-creation`, `in-place-analytics.basic-aggregation`, `in-place-analytics.explain-performance`, `in-place-analytics.unwind-aggregation`, `in-place-analytics.group-sort`, `in-place-analytics.project-aggregation`, `in-place-analytics.performance-analysis`, `in-place-analytics.overview-report`, `in-place-analytics.overview-time-series` |

### Encryption (already compliant)

- **encryption/csfle**, **encryption/queryable-encryption**, **encryption/right-to-erasure**: Tips already mentioned Run all / Run selection; no Terminal-only node blocks.

---

## Not changed (by design)

- **Enhancements with only JSON** (e.g. index definitions, API examples): No runnable block in editor → no Run all tip required.
- **Enhancements with only `bash`** (e.g. AWS CLI, mongoimport, mongorestore, install steps): Execution is from a real terminal → tip not added (or kept as "run in terminal" where appropriate).
- **Enhancements with only `text`**: No runnable code → no tip.

---

## Tip wording used

- **JavaScript/Node:** "Use Run all or Run selection in the editor to run the script."
- **Mongosh / shell-style JS:** "Use Run all or Run selection in the editor to run the query (mongosh-style)." or "...to run the commands (mongosh-style)."
- **Python:** "Use Run all or Run selection in the editor to run the script."
- **Compass / mixed:** "Use Run all or Run selection in the editor to run the query (e.g. in Compass or mongosh)."
- **Verify only (mongosh):** "Use Run all or Run selection in the editor to run the mongosh verify commands."

---

## Follow-up

1. **Hint placement:** Run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` and fix any hint/blank mismatches.
2. **Visual check:** In the app, open steps with runnable blocks and confirm the Run all / Run selection tip is visible and the hint marker aligns with blanks where applicable.
3. **New content:** When adding labs or steps, follow `Docs/ADD_LAB_MASTER_PROMPT.md` and `Docs/VALIDATE_LABS_MASTER_PROMPT.md` so new enhancements include the Run all / Run selection tip where they have runnable JS/mongosh/Python blocks.
