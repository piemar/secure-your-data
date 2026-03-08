# Lab Validation Fix Plan – CSFLE, Queryable, GDPR, CRUD, Rich Query

**Generated:** 2026-03-07  
**Scope:** lab-csfle-fundamentals, lab-queryable-encryption, lab-right-to-erasure, lab-mongodb-crud, lab-rich-query-basics, lab-rich-query-aggregations, lab-rich-query-advanced, lab-rich-query-encrypted-vs-plain

**Source criteria:** Docs/ADD_LAB_MASTER_PROMPT.md, Docs/VALIDATE_LABS_MASTER_PROMPT.md (mongosh prerequisites/tips, hint placement)

---

## Summary

- **Labs in scope:** 8 (CSFLE, Queryable Encryption, Right to Erasure, CRUD, 4× Rich Query)
- **Fixes applied:** Prerequisites (mongosh where Mongosh blocks exist), mongosh tip for Run path, hint/skeleton line fixes for Rich Query

---

## Fixes applied

### 1. CSFLE (lab-csfle-fundamentals)

| Criterion | Change |
|-----------|--------|
| Prerequisites | Added: "mongosh (MongoDB Shell) installed; path configured in Workshop Settings so Run can execute mongosh blocks" |
| Enhancement csfle.init-keyvault (Mongosh block) | Added tip: "Run uses the mongosh path from Workshop Settings; set it if Run fails or you see \"mongosh missing\"." |

### 2. Queryable Encryption (lab-queryable-encryption)

- No Mongosh blocks; no prerequisite or tip changes. Lab already has prerequisites (Lab 1, Atlas, AWS KMS, Node).

### 3. Right to Erasure / GDPR (lab-right-to-erasure)

- No Mongosh blocks; no changes. Prerequisites already list Lab 1, Atlas, AWS KMS, Node.

### 4. CRUD (lab-mongodb-crud)

- No Mongosh blocks; prerequisites already include MongoDB Atlas, Node.js, MONGODB_URI. No changes.

### 5. Rich Query labs (all 4)

| Lab | Change |
|-----|--------|
| lab-rich-query-basics | prerequisites: was `[]` → added MongoDB Atlas (M0+) or local MongoDB, Node.js 18+, mongosh installed + path in Workshop Settings |
| lab-rich-query-aggregations | prerequisites: added MongoDB Atlas, Node.js 18+, mongosh path in Workshop Settings (in addition to lab-rich-query-basics) |
| lab-rich-query-advanced | prerequisites: added MongoDB Atlas, Node.js 18+, mongosh path in Workshop Settings (in addition to lab-rich-query-aggregations) |
| lab-rich-query-encrypted-vs-plain | prerequisites: added MongoDB Atlas, Node.js 18+, mongosh path in Workshop Settings (in addition to lab-csfle-fundamentals, lab-queryable-encryption) |
| rich-query.compound-query (enhancement) | Added tip: "Run uses the mongosh path from Workshop Settings; set it if Run fails or you see \"mongosh missing\"." |

### 6. Hint/skeleton fixes (Rich Query enhancements)

| Enhancement | Block | Fix |
|-------------|--------|-----|
| rich-query.compound-query | Mongosh | inlineHints line numbers: 9→8, 12→11, 18→17 so blanks match skeleton lines |
| rich-query.projection-sort | Mongosh | inlineHints line numbers: 21→22, 22→23, 26→27 |
| rich-query.bucket | bucket-histogram.cjs | inlineHints: line 22→21 for $sum blank |
| rich-query.bucket | Mongosh | inlineHints: line 11→10 for $sum blank |

---

## Validation

- `node scripts/validate-content.js`: passes (warnings only for proof exercise references).
- `npm test -- --run src/test/labs/validate-hint-rendering.test.ts`: no failures for the 8 labs in scope (remaining failures are in other labs: flexible, ingest-rate, analytics, consistency, migratable, etc.).

---

## Recommended next steps

1. Run full hint rendering validation and fix remaining labs (flexible, ingest-rate, analytics, workload-isolation, consistency, migratable) if desired.
2. Optionally add mongosh tip to other Rich Query enhancements that have a Mongosh block (e.g. projection-sort, pagination, index-use, etc.) for consistency; one tip per lab (compound-query) was added for the basics lab.
