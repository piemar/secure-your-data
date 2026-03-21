---
name: ADD and VALIDATE Labs Prompts Analysis
overview: "Deep analysis of ADD_LAB and VALIDATE_LABS master prompts and dependencies: correctness, efficiency, consistency, missing aspects, and—new in this pass—artifacts and docs that should be created so the prompts and ecosystem are complete and maintainable."
todos: []
isProject: false
---

# ADD_LAB and VALIDATE_LABS Master Prompts – Deep Analysis and Improvement Plan (v2)

## Scope

- **Primary docs:** [Docs/ADD_LAB_MASTER_PROMPT.md](Docs/ADD_LAB_MASTER_PROMPT.md), [Docs/VALIDATE_LABS_MASTER_PROMPT.md](Docs/VALIDATE_LABS_MASTER_PROMPT.md)
- **Dependencies:** ADDING_AND_VALIDATING_LABS.md, CONTENT_STANDARDS.md, WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md, HINT_AND_SKELETON_REFACTOR_PLAN.md, LAB_SAMPLE_DATA_PLAN.md, METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md, LAB_MIGRATION_GUIDE.md, ARCHITECTURE_AND_ADDING_LABS.md, CONTENT_CREATOR_QUICK_START.md, COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md, validate-hint-rendering.test.ts, verificationService.ts, enhancement schema, scripts in `scripts/`

---

## Part A: Correctness, efficiency, consistency (from first analysis)

- **Step count:** Unify to "5–7 for hands-on (prefer 6)" in ADD_LAB, VALIDATE, WORKSHOP_SESSION.
- **blankText:** In ADD_LAB and VALIDATE, state that `blankText` must match the hint-rendering test’s extracted placeholder (cite regex in `validate-hint-rendering.test.ts`).
- **Enhancements merge:** In ADD_LAB Master prompt, state "merge with existing enhancements in same POV; do not overwrite other labs’ entries".
- **Quick reference:** Add a short Quick reference table at top of ADD_LAB; in Master prompt reference "Principal quality template" instead of repeating.
- **Criterion IDs:** In VALIDATE, add short IDs (L1, S1, E1, …) and use in fix plan tables.
- **Post-gen checklist:** In ADD_LAB, require "run full solution once per step; run hint test; run verification test".
- **Content variation:** In ADD_LAB, add "Content variation" / avoid cookie-cutter wording.
- **requiredPrereqIds:** ADD_LAB: add to "Generate the following" and Master prompt; VALIDATE: add to lab-level checklist.
- **Lab plan sections:** In ADD_LAB, add explicit "Lab plan sections" list matching plan template.
- **Validate-by-topic + hint test:** In VALIDATE "Validate by topic and lab name", add running (or simulating) hint-rendering test for that scope.
- **Stubbed verifications:** In VALIDATE, add "Stubbed verifications" subsection to fix plan format.
- **Optional:** Single LAB_QUALITY_CRITERIA.md; one line in CONTENT_STANDARDS on 5–7 steps and requiredPrereqIds.

---

## Part B: Artifacts and docs that should be created (deep analysis)

These are **new deliverables** (templates, guides, schemas, or doc fixes) so the prompts and ecosystem are complete and the plan is not missing "things that should be created."

### B.1 Plan template (non-archived)

- **Gap:** ADD_LAB says "Use the format and structure of **Docs/PLAN_GRAPH_TRAVERSAL_IRENE.md**"; that file lives in **Docs/archive/**.
- **Create:** **Docs/PLAN_TEMPLATE.md** (or `Docs/templates/PLAN_LAB_TEMPLATE.md`) with the same section structure and placeholder text (Objective and scope, Topic/POV/naming, Overview content, Data model and dataRequirements, Steps table, Enhancements pattern, Verification, Loader and registration, Lab definition updates, Tests and validation, Implementation order, File checklist). Update ADD_LAB to say "Use **Docs/PLAN_TEMPLATE.md** (or see Docs/archive/PLAN_GRAPH_TRAVERSAL_IRENE.md for a filled example)."

### B.2 Fix plan template

- **Gap:** Fix plan structure exists only in VALIDATE doc text; no reusable template file.
- **Create (optional):** **Docs/templates/FIX_PLAN_TEMPLATE.md** with the exact markdown structure (Summary, Per-lab findings table, Step-level gaps, Enhancement-level gaps, Recommended order, Hint rendering test failures, Structured fix list, Hint placement verification checkboxes). VALIDATE can reference it for consistent output.

### B.3 Phase completion summary template

- **Gap:** ADD_LAB says "Create Docs/PHASE_N__COMPLETION_SUMMARY.md"; COMPREHENSIVE_POV and phase docs imply structure (Overview, Deliverables, Structure, Flow, Next Phase, Status) but there is no single template.
- **Create:** **Docs/templates/PHASE_COMPLETION_SUMMARY_TEMPLATE.md** (or a "Phase completion summary" section in COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md) with required sections: Overview, Deliverables (labs table, enhancements list, loader/index/topic), Structure (folder tree), Flow (from proof), Next Phase, Phase status. ADD_LAB "When completing a full PoV phase" can point to this.

### B.4 How to add a verification (guide)

- **Gap:** ADD_LAB and VALIDATE say "add ID to VerificationId type" and "add case in VerificationService.verify()" and "validatorUtils"; authors must read `verificationService.ts` and `validatorUtils.ts` to implement.
- **Create:** **Docs/ADD_VERIFICATION_GUIDE.md** (or a section in ARCHITECTURE_AND_ADDING_LABS.md / ADD_LAB) with: (1) Add the ID to `VerificationId` in `src/services/verificationService.ts`; (2) Add a `case` in `VerificationService.verify()` that calls `validatorUtils.check...` or runs a query and asserts; (3) If needed, add a new `validatorUtils.checkXxx` in `src/utils/validatorUtils.ts` and any backend route; (4) Wire step’s `verificationId` in the lab definition. Optionally list existing verification IDs and patterns. ADD_LAB can reference this doc instead of inlining the full list.

### B.5 New language checklist

- **Gap:** ADD_LAB lists many places to touch when adding a new language (ProgrammingLanguage, PREREQ_TOOL_IDS, EXTENDED_PREREQUISITES, LabSetupWizard, LabContext, check-tool, validatorUtils, Dockerfile.full, lab prerequisites). Easy to miss one.
- **Create:** **Docs/NEW_LANGUAGE_CHECKLIST.md** (or a dedicated subsection in ADD_LAB) as a single checklist: file/path + what to add (e.g. "LabSetupWizard.tsx – add to PREREQUISITES array"; "validatorUtils.ts – map label in checkToolInstalled"). Prompts can say "When adding a new runnable language, follow Docs/NEW_LANGUAGE_CHECKLIST.md."

### B.6 Lab and enhancement schema for authors

- **Gap:** Types live in `src/types/index.ts` (WorkshopLabDefinition, WorkshopLabStep, LabDataRequirement, etc.) and `src/labs/enhancements/schema.ts` (EnhancementMetadata, CodeBlockMetadata, InlineHintMetadata). No single author-facing doc with every field, types, and minimal examples.
- **Create:** **Docs/LAB_AND_ENHANCEMENT_SCHEMA.md** (or LAB_AUTHORING_SCHEMA.md) with: (1) WorkshopLabDefinition fields (id, topicId, title, description, steps, keyConcepts, whatYouWillBuild, keyInsight, prerequisites, requiredPrereqIds, dataRequirements, labFolderPath, modes, povCapabilities, defaultCompetitorId, competitorIds, …); (2) WorkshopLabStep fields (id, title, narrative, instructions, enhancementId, verificationId, hints, …); (3) EnhancementMetadata and CodeBlockMetadata (id, codeBlocks with filename, language, code, skeleton, inlineHints, tips, competitorEquivalents); (4) InlineHintMetadata (line, blankText, hint, answer); (5) LabDataRequirement (type, path, namespace, …). One minimal example per shape. ADD_LAB and CONTENT_CREATOR_QUICK_START can reference it.

### B.7 Script references: create-enhancement.js and validate-enhancements.js

- **Gap:** **METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md** references `scripts/create-enhancement.js` and `scripts/validate-enhancements.js`. These scripts **do not exist** in `scripts/` (only validate-content.js, create-lab.js, register-lab.js, create-quest.js, create-demo-script.js, test-run-csharp.mjs, ensure-lab-hints.js, etc.). CONTENT_CREATOR_QUICK_START says "create-enhancement.js writes to src/labs/enhancements/metadata/ which the runtime does not use."
- **Create (choose one):** (a) **Implement** create-enhancement.js and validate-enhancements.js if they are still desired (scaffold enhancement entry for content/topics/.../enhancements.ts and validate metadata), or (b) **Update docs:** In METADATA_DRIVEN and any other references, remove or replace with "Use ADD_LAB_MASTER_PROMPT to generate enhancements, or edit `src/content/topics/<topic>/<pov>/enhancements.ts` manually. For validation use `node scripts/validate-content.js` and `npm test -- validate-hint-rendering`." So the plan is not missing the decision: either create the scripts or document that they are deprecated/unused.

### B.8 Enhancement test boilerplate

- **Gap:** ARCHITECTURE and ADD_LAB describe the pattern for `src/test/labs/<PovPascal>Enhancements.test.ts` (getStepEnhancement, one it() per enhancementId, unknown-id test) but there is no copy-pasteable template file.
- **Create:** Either (a) **Docs/templates/ENHANCEMENT_TEST_BOILERPLATE.md** (or a code block in ADD_LAB / ARCHITECTURE) with the exact describe/it boilerplate and instructions to replace POV prefix and enhancement IDs, or (b) **src/test/labs/_Enhancements.test.template.ts** (or similar) that new POVs can copy and rename. This reduces inconsistency when creating new enhancement tests.

### B.9 Example seed script for dataRequirements

- **Gap:** LAB_SAMPLE_DATA_PLAN and ADD_LAB mention dataRequirements with `type: 'script'` and `path` to a seed script. No example seed script or standard path pattern is documented (e.g. `scripts/seed-<lab-id>.mjs` or under topic/pov).
- **Create:** (1) **One example seed script** (e.g. `scripts/seed-example.mjs` or under a lab folder) that drops a collection and inserts a minimal dataset, with a short comment that labs can reference it via dataRequirements. (2) In **LAB_SAMPLE_DATA_PLAN.md** (or ADD_LAB), add a "Seed script pattern" line: path convention and that `path` in dataRequirements should point to this or a lab-specific script. So authors know what to create when a lab needs pre-loaded data.

### B.10 CONTENT_CREATOR_QUICK_START vs ADD_LAB

- **Gap:** Quick start describes create-lab.js + manual enhancements; ADD_LAB describes the master prompt that generates everything. Create-enhancement.js is mentioned but deprecated/not used. Two workflows can confuse.
- **Create (doc update):** In CONTENT_CREATOR_QUICK_START, add a short "Preferred workflow" at the top: "For new labs, use [ADD_LAB_MASTER_PROMPT](ADD_LAB_MASTER_PROMPT.md) to generate lab + enhancements + registration + tests in one go. The steps below (create-lab.js, then manual enhancements) are an alternative when you prefer to scaffold then edit by hand." Remove or clearly deprecate references to create-enhancement.js and validate-enhancements.js (align with B.7).

---

## Part C: Summary tables

### New artifacts to create


| #    | Artifact                                                                                                                      | Purpose                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| B.1  | Docs/PLAN_TEMPLATE.md (or Docs/templates/PLAN_LAB_TEMPLATE.md)                                                                | Non-archived plan structure; ADD_LAB references it                    |
| B.2  | Docs/templates/FIX_PLAN_TEMPLATE.md                                                                                           | Optional; consistent fix plan output for VALIDATE                     |
| B.3  | Docs/templates/PHASE_COMPLETION_SUMMARY_TEMPLATE.md (or section in COMPREHENSIVE_POV)                                         | Phase completion summary structure                                    |
| B.4  | Docs/ADD_VERIFICATION_GUIDE.md (or section in ARCHITECTURE/ADD_LAB)                                                           | How to add verificationId and implement verification                  |
| B.5  | Docs/NEW_LANGUAGE_CHECKLIST.md (or subsection in ADD_LAB)                                                                     | Single checklist when adding a new runnable language                  |
| B.6  | Docs/LAB_AND_ENHANCEMENT_SCHEMA.md                                                                                            | Author-facing schema: lab, step, enhancement, hints, dataRequirements |
| B.7  | Either implement create-enhancement.js + validate-enhancements.js OR update METADATA_DRIVEN (and related) to remove/deprecate | No dangling script references                                         |
| B.8  | Enhancement test boilerplate (template doc or _Enhancements.test.template.ts)                                                 | Consistent new POV enhancement tests                                  |
| B.9  | Example seed script + path pattern in LAB_SAMPLE_DATA_PLAN                                                                    | Clarify dataRequirements type: 'script'                               |
| B.10 | CONTENT_CREATOR_QUICK_START update: preferred workflow + deprecate create-enhancement                                         | Clear primary path (ADD_LAB) vs alternative                           |


### Existing plan improvements (Part A) – unchanged

- Step count unification, blankText/test alignment, enhancements merge, Quick reference, Criterion IDs, post-gen checklist, content variation, requiredPrereqIds, lab plan sections list, validate-by-topic + hint test, stubbed verifications subsection, optional LAB_QUALITY_CRITERIA and CONTENT_STANDARDS line.

---

## Implementation order (suggested)

1. **Doc fixes and prompt updates (Part A)** – Unify step count, add blankText note, merge rule, requiredPrereqIds, lab plan sections, validate-by-topic hint test, stubbed verifications, criterion IDs, content variation, post-gen checklist; optional Quick reference and LAB_QUALITY_CRITERIA.
2. **Script/doc cleanup (B.7, B.10)** – Decide on create-enhancement/validate-enhancements; update METADATA_DRIVEN and CONTENT_CREATOR_QUICK_START.
3. **Templates (B.1, B.2, B.3)** – Plan template, optional fix plan template, phase completion summary template.
4. **Guides and checklist (B.4, B.5)** – ADD_VERIFICATION_GUIDE, NEW_LANGUAGE_CHECKLIST.
5. **Schema doc (B.6)** – LAB_AND_ENHANCEMENT_SCHEMA.md.
6. **Test and seed (B.8, B.9)** – Enhancement test boilerplate, example seed script and path pattern.

This deep pass ensures the plan explicitly includes **all artifacts that should be created** (templates, guides, schema doc, example script, and doc/script cleanup) and is not missing deliverables.