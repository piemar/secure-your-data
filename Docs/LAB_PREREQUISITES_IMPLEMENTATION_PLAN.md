# Lab Prerequisites – Implementation Plan

**Goal:** When a lab depends on another (e.g. Lab 2 Queryable Encryption needs KMS from Lab 1 CSFLE), the workshop/template builder should (1) know the dependency, (2) auto-include prerequisite labs when the user selects a dependent lab, and (3) order labs so prerequisites come first.

**POV unchanged:** POV stays the capability label (e.g. CSFLE, Queryable Encryption). Dependencies are between **labs** via a new field `prerequisiteLabIds`. Existing `prerequisites` (display strings like "Lab 1: CSFLE Fundamentals completed") remain for the intro/checklist UI.

---

## 1. Type change

**File:** `src/types/index.ts`

- Add to `WorkshopLabDefinition`:
  - **`prerequisiteLabIds?: string[]`** – Lab ids that must be included and completed before this lab (e.g. `['lab-csfle-fundamentals']`). Used for ordering and auto-include only. Optional.
- Keep **`prerequisites?: string[]`** as-is (human-readable list for display in Lab Intro / setup checklist).

---

## 2. Lab definitions: set prerequisiteLabIds

**Lab 2 (Queryable Encryption)** – depends on Lab 1 (KMS key, key vault, DEK setup).

- **File:** `src/content/topics/encryption/queryable-encryption/lab-queryable-encryption.ts`
- Add: `prerequisiteLabIds: ['lab-csfle-fundamentals']`
- Keep existing `prerequisites` array for display text.

**Lab 3 (Right to Erasure)** – depends on Lab 1 (KMS, DEK).

- **File:** `src/content/topics/encryption/right-to-erasure/lab-right-to-erasure.ts`
- Add: `prerequisiteLabIds: ['lab-csfle-fundamentals']`
- Keep existing `prerequisites` array.

**Other labs (optional follow-up):** Some labs already use `prerequisites` with lab-like ids (e.g. `lab-geospatial-polygons` has `prerequisites: ['lab-geospatial-near']`). Those can later get `prerequisiteLabIds` and, if desired, keep `prerequisites` as display-only text. Not required for the first slice.

---

## 3. ADD_LAB_MASTER_PROMPT changes

**File:** `Docs/ADD_LAB_MASTER_PROMPT.md`

- **Required level of elaboration (table):** Add a row:
  - **Prerequisite labs** – When this lab depends on another lab (e.g. needs KMS/DEK from another lab), set **prerequisiteLabIds** to an array of lab ids (e.g. `['lab-csfle-fundamentals']`). Use the source doc and external research to identify dependencies. Omit or empty array when the lab stands alone.
- **Master prompt (output 1 – Lab file):** In the lab file output, require **prerequisiteLabIds** (array of lab ids or empty). Example: "If the lab requires setup from another lab (e.g. KMS from Lab 1), include prerequisiteLabIds: ['lab-…']."
- **User inputs (reference):** Add optional row **Prerequisite lab ids** – [USER_INPUT: e.g. ['lab-csfle-fundamentals'] or "none"]; in minimal mode infer from source doc.
- **Mode A (minimal):** In the inference step, include "prerequisiteLabIds (from source doc: which lab(s) must be completed first)."

---

## 4. Resolve prerequisites + sort – where and how

The codebase **already** has logic that assumes lab ids in `prerequisites` for ordering and inclusion. We will switch that to use **prerequisiteLabIds** and add UI-side resolution when selecting labs.

### 4.1 Use prerequisiteLabIds in services (not prerequisites)

**File:** `src/services/templateGeneratorService.ts`

- **orderLabsByPrerequisites:** Use **`lab.prerequisiteLabIds`** instead of `lab.prerequisites`. (If undefined, treat as no lab prerequisites.) This keeps topological sort; only the property name changes for the “lab dependency” concept.
- **validateTemplate:** When checking “required prerequisite not included”, use **`lab.prerequisiteLabIds`**. For each labId in template.labIds, if lab has prerequisiteLabIds, ensure those ids are in template.labIds and (optionally) appear earlier in the list. Emit warnings for missing prerequisites.

**File:** `src/services/contentService.ts`

- **getLabsByTopic** (or the method that suggests labs and adds prerequisites): When auto-including “prerequisite labs”, use **`lab.prerequisiteLabIds`** instead of `lab.prerequisites`. Resolve transitively: if Lab 2 has prerequisiteLabIds = [Lab 1], and user selected Lab 2, add Lab 1. If in the future a lab has multiple prerequisites, add all and rely on templateGeneratorService to order. The existing logic that pushes prerequisite labs into the list and sorts should use prerequisiteLabIds; the sort that uses “labs without prerequisites first” can stay but interpret “prerequisites” as “prerequisiteLabIds” for that purpose (so labs with no prerequisiteLabIds come first).

### 4.2 Dynamic Template Builder – auto-include when selecting a lab

**File:** `src/components/settings/DynamicTemplateBuilder.tsx`

- **When user selects a lab (e.g. checks Lab 2):** Before updating `selectedLabIds`, resolve **prerequisiteLabIds** for the newly selected lab (and transitively for those prerequisites). Add any missing prerequisite lab ids to `selectedLabIds` so the workshop always includes them. Then (optionally) sort `selectedLabIds` so that every lab appears after its prerequisiteLabIds (e.g. via a small helper that uses contentService.getLabs() and lab.prerequisiteLabIds to topological sort).
- **When user deselects a lab:** If the deselected lab is in another selected lab’s prerequisiteLabIds, either (a) show a warning (“Lab X requires Lab Y; remove X as well?”) and optionally auto-deselect the dependents, or (b) only warn and leave selection as-is. Prefer (a) or a clear warning so the template stays valid.
- **Where to call this:** In the handler that toggles a lab’s checkbox (e.g. in `TopicLabBundlePanel` or wherever `setSelectedLabIds` is called for “lab selected”). Either:
  - **Option A:** In DynamicTemplateBuilder, when updating selectedLabIds (e.g. in a callback passed to TopicLabBundlePanel), run a “resolve prerequisites and sort” step before setState.
  - **Option B:** In TopicLabBundlePanel, when a lab is toggled on, call a utility that returns “new selected list = current + this lab + its prerequisiteLabIds (transitive), topologically sorted”; when toggled off, return “current minus this lab, and optionally minus dependents” (or warn).

Recommendation: **Option A** – add a helper (e.g. in `templateGeneratorService` or a small `labPrerequisiteUtils.ts`) that takes `(labIds: string[], allLabs: WorkshopLabDefinition[])` and returns `{ resolved: string[], ordered: string[] }` (resolved = labIds + transitive prerequisiteLabIds; ordered = topological order). Call it in DynamicTemplateBuilder whenever selectedLabIds is updated (e.g. in the handler that TopicLabBundlePanel calls when a lab is toggled). Then set selectedLabIds to `ordered` (or to the resolved set if you don’t need to reorder the whole list and templateGeneratorService.generateTemplate already orders).

### 4.3 TopicLabBundlePanel / lab toggle

**File:** `src/components/settings/TopicLabBundlePanel.tsx`

- The panel receives a callback to add/remove labs. Ensure the **parent** (DynamicTemplateBuilder) applies the “resolve prerequisites + sort” logic when that callback runs, so the parent’s state (selectedLabIds) is always “resolved + ordered.” No need to duplicate logic in the panel; the panel just reports “user checked Lab 2” and the parent computes the new selectedLabIds including Lab 1 and the correct order.

### 4.4 Default bundle when entering Labs step

**File:** `src/components/settings/DynamicTemplateBuilder.tsx` (handleNext when next step is 'labs')

- When defaulting to “full bundle” (all labs from selected topics), the code already builds bundleLabIds from getLabsByTopic. After that, run the same “resolve prerequisiteLabIds and sort” step so the default selection is ordered (e.g. Lab 1, Lab 2, Lab 3). So: after building bundleLabIds, call the new helper to add any missing prerequisite labs and topological sort, then setSelectedLabIds(ordered).

---

## 5. Patch list (checklist)

| # | Task | File(s) |
|---|------|--------|
| 1 | Add `prerequisiteLabIds?: string[]` to WorkshopLabDefinition | `src/types/index.ts` |
| 2 | Set `prerequisiteLabIds: ['lab-csfle-fundamentals']` on Lab 2 and Lab 3 | `lab-queryable-encryption.ts`, `lab-right-to-erasure.ts` |
| 3 | Prompt: table row for Prerequisite labs; lab file output and Mode A infer prerequisiteLabIds | `Docs/ADD_LAB_MASTER_PROMPT.md` |
| 4 | Use `prerequisiteLabIds` in orderLabsByPrerequisites and validateTemplate | `src/services/templateGeneratorService.ts` |
| 5 | Use `prerequisiteLabIds` in contentService (suggest labs + auto-include prerequisites, sort) | `src/services/contentService.ts` |
| 6 | Add helper: resolve transitive prerequisiteLabIds + topological sort | `src/services/templateGeneratorService.ts` or `src/utils/labPrerequisiteUtils.ts` |
| 7 | When selecting a lab in builder: resolve prerequisites and sort; set selectedLabIds | `src/components/settings/DynamicTemplateBuilder.tsx` |
| 8 | When deselecting a lab: warn or auto-remove dependents if the lab is in another’s prerequisiteLabIds | `src/components/settings/DynamicTemplateBuilder.tsx` |
| 9 | When defaulting to full bundle (Labs step): resolve + sort before setSelectedLabIds | `src/components/settings/DynamicTemplateBuilder.tsx` |

---

## 6. Backward compatibility

- **Labs without prerequisiteLabIds:** Treat as no lab dependencies; they only participate in ordering as “no prerequisites” (first in topological order).
- **Existing labs that put lab ids in `prerequisites`:** Today templateGeneratorService and contentService treat those as lab ids. After the change, they use only `prerequisiteLabIds`. Migrate those labs (e.g. lab-geospatial-polygons, lab-text-search-with-autocomplete) to set prerequisiteLabIds and, if desired, keep prerequisites as display-only text. Until migrated, those labs will not auto-include or order by dependency unless we add a one-time fallback: “if prerequisiteLabIds is empty and prerequisites contains strings that match lab ids, use those as prerequisiteLabIds for ordering.” Optional; can be a follow-up.

---

## 7. Summary

- **Type:** Add `prerequisiteLabIds`; keep `prerequisites` for display.
- **Content:** Set prerequisiteLabIds on Lab 2 and Lab 3 (and optionally other dependent labs later).
- **Prompt:** Require the LLM to output prerequisiteLabIds for new labs when dependencies exist.
- **Resolve + sort:** Use prerequisiteLabIds in templateGeneratorService (order + validate) and contentService (suggest + auto-include). In DynamicTemplateBuilder, when updating selectedLabIds (toggle lab or default bundle), resolve transitive prerequisiteLabIds and topological sort so the workshop always includes and orders labs correctly.
