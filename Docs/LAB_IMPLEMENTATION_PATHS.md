# Lab Implementation Paths: Component vs Content-Driven

## Current state: all labs are content-driven

All labs, including Lab 1 (CSFLE) and Lab 2 (Queryable Encryption), are rendered via **`LabRunner`** with a `labId`. Step content is loaded from **topic POV enhancement files** by `enhancementId`; no dedicated TSX component is required for step content. This aligns with `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` and `Docs/LAB_MIGRATION_GUIDE.md`.

### Content-driven path (all labs)

- **Used for:** `lab-csfle-fundamentals` (Lab 1), `lab-queryable-encryption` (Lab 2), `lab-right-to-erasure` (Lab 3), `lab-flexible-*`, `lab-rich-query-*`, and every other lab.
- **Where:** Lab definition in `src/content/topics/<topic>/<pov>/lab-*.ts`; step content in `src/content/topics/<topic>/<pov>/enhancements.ts`.
- **How:** `Index.tsx` (or router) renders `<LabRunner labNumber={…} labId="lab-…" />`. LabRunner loads the lab definition from ContentService, then for each step with an `enhancementId` loads enhancement metadata via `loadEnhancementMetadata(enhancementId)` from the loader. The loader’s `moduleMap` maps the enhancementId **prefix** (e.g. `csfle`, `queryable-encryption`) to the POV’s `enhancements.ts` module. The mapper merges the enhancement into the Step (codeBlocks, skeleton, inlineHints, tips, etc.) and StepView renders it. Verification is via step `verificationId`, resolved by the verification service.

### Legacy components (optional)

- **`Lab1CSFLE.tsx`** and **`Lab2QueryableEncryption.tsx`** are no longer used in the render path for Lab 1 and Lab 2. They can be removed or kept for reference. Step content for those labs lives in:
  - `src/content/topics/encryption/csfle/enhancements.ts`
  - `src/content/topics/encryption/queryable-encryption/enhancements.ts`

## Summary table

| Lab / topic              | Rendered by   | Step content source                          |
|--------------------------|---------------|----------------------------------------------|
| Lab 1 (CSFLE)            | `LabRunner`   | `encryption/csfle/enhancements.ts`           |
| Lab 2 (Queryable Enc.)   | `LabRunner`   | `encryption/queryable-encryption/enhancements.ts` |
| Lab 3 (Right-to-erasure) | `LabRunner`   | `encryption/right-to-erasure/enhancements.ts` |
| Flexible, rich-query, …  | `LabRunner`   | Corresponding `enhancements.ts` under topic  |

## Standardized approach (Lab 1 Step 3)

All labs and steps (new or updated) must follow the **standardized approach** implemented for Lab 1 Step 3: no Terminal block that only runs node; Node + Mongosh steps use exactly two blocks (Node, then Mongosh) **only when the same functionality can run in mongosh**—otherwise one block and no mongosh tab; execution via Run all / Run selection; skeleton + inlineHints for all code blocks. See **`Docs/ADD_LAB_MASTER_PROMPT.md`** and **`Docs/CONTENT_STANDARDS.md`**.

## See also

- **`Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md`** – Enhancement schema, loader, and paths
- **`Docs/LAB_MIGRATION_GUIDE.md`** – How to add or migrate labs (content definition + enhancements)
- **`Docs/ADD_LAB_MASTER_PROMPT.md`** – Standardized approach and quality bar for new/updated labs
- **`Docs/VALIDATE_LABS_MASTER_PROMPT.md`** – Quality audit against ADD_LAB_MASTER_PROMPT
- **`Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md`** – Future improvements to hints/skeletons
