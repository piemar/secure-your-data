# Documentation Cleanup Plan – What’s No Longer Needed

This document analyzes repo docs and recommends which can be removed, archived, or consolidated. It does **not** delete anything; it’s a plan for you to approve and run.

---

## Implemented (2026-03-05)

- **Docs/archive/phases/** – 26 phase completion summary files moved here.
- **Docs/archive/** – Dated fix/validation summaries and implementation plans moved here: `2026-02-05_RUN_ALL_TIP_VALIDATION_SUMMARY.md`, `2026-02-23_FIX_PLAN.md`, `COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md`, `WORKSHOP_FRAMEWORK_PLAN.md`, `TOPIC_CENTRIC_STRUCTURE_PROPOSAL.md`.
- **WHATS_NEXT.md** – Quick Start section now points to README § Getting Started; fix-plan reference updated to mention `Docs/archive/` for past plans.
- **START.md** – Not present in repo; no action taken.

---

## 1. Summary

| Category | Action | Count |
|----------|--------|-------|
| **Phase completion summaries & one-time plans** | Archive or remove | ~25 files |
| **Dated fix/validation summaries** | Archive or remove | 2 files |
| **Obsolete proposals / completed implementation plans** | Archive or remove | 3–4 files |
| **Root duplicates** | Consolidate into README | 1–2 files |
| **Keep** | No change | All Guides, Enablement, active process docs |

---

## 2. Safe to Remove or Archive (no code references)

These are **historical or one-time** and are not imported or linked from code. They are only cross-referenced by other docs (e.g. WHATS_NEXT, COMPREHENSIVE_POV).

### 2.1 Phase completion summaries (recommend: move to `Docs/archive/phases/` or delete)

One-time “Phase N done” writeups. Useful only for history; COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN already tracks status.

- `Docs/PHASE_0_VALIDATION_SUMMARY.md`
- `Docs/PHASE_0A_0B_COMPLETION_SUMMARY.md`
- `Docs/PHASE_0C_COMPLETION_SUMMARY.md`
- `Docs/PHASE_0.5_POV_FOLDER_REORGANIZATION_COMPLETION.md`
- `Docs/PHASE_1_COMPLETION_SUMMARY.md`
- `Docs/PHASE_2_COMPLETE.md`
- `Docs/PHASE_2_FLEXIBLE_COMPLETION_SUMMARY.md`
- `Docs/PHASE_3_COMPLETE.md`
- `Docs/PHASE_3_INGEST_RATE_COMPLETION_SUMMARY.md`
- `Docs/PHASE_4_IN_PLACE_ANALYTICS_COMPLETION_SUMMARY.md`
- `Docs/PHASE_46_COMPLETION_SUMMARY.md`
- `Docs/PHASE_5_WORKLOAD_ISOLATION_COMPLETION_SUMMARY.md`
- `Docs/PHASE_6_COMPLETION_SUMMARY.md`
- `Docs/PHASE_6_CONSISTENCY_COMPLETION_SUMMARY.md`
- `Docs/PHASE_7_COMPLETION_SUMMARY.md`
- `Docs/PHASE_7_SCALE_OUT_COMPLETION_SUMMARY.md`
- `Docs/PHASE_7_TESTING_SUMMARY.md`
- `Docs/PHASE_8_SCALE_UP_COMPLETION_SUMMARY.md`
- `Docs/PHASE_9_MIGRATABLE_COMPLETION_SUMMARY.md`
- `Docs/PHASE_10_PORTABLE_COMPLETION_SUMMARY.md`
- `Docs/PHASE_11_AUTO_DEPLOY_COMPLETION_SUMMARY.md`
- `Docs/PHASE_12_ROLLING_UPDATES_COMPLETION_SUMMARY.md`
- `Docs/PHASE_14_FULL_RECOVERY_RTO_COMPLETION_SUMMARY.md`
- `Docs/PHASE_15_PARTIAL_RECOVERY_COMPLETION_SUMMARY.md`
- `Docs/PHASE_16_REPORTING_COMPLETION_SUMMARY.md`
- `Docs/PHASE_17_AUTO_HA_COMPLETION_SUMMARY.md`

### 2.2 Dated fix / validation summaries (recommend: archive or delete)

- `Docs/2026-02-05_RUN_ALL_TIP_VALIDATION_SUMMARY.md` – one-time validation run.
- `Docs/2026-02-23_FIX_PLAN.md` – dated fix plan. **Keep until fixes are applied**, then archive or remove. VALIDATE_LABS_MASTER_PROMPT says to produce *new* dated fix plans (e.g. `YYYY-MM-DD_FIX_PLAN.md`), so old ones are historical.

### 2.3 Implementation plans that are “done” or superseded (recommend: archive)

- `Docs/COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md` – side-by-side competitor feature; if implemented, this is historical.
- `Docs/WORKSHOP_FRAMEWORK_PLAN.md` – referenced by WORKSHOP_FRAMEWORK_ARCHITECTURE; if the framework is built, the *plan* can live in `Docs/archive/` and keep only the architecture doc as current.
- `Docs/TOPIC_CENTRIC_STRUCTURE_PROPOSAL.md` – proposal; if structure is adopted, archive; if not, remove.

---

## 3. Consolidate (reduce duplication)

### 3.1 START.md vs README.md

- **START.md** – Quick start (dev server, Docker) with paths like `/Users/.../csfle-new/secure-your-data`.
- **README.md** – Full “Getting Started”, prerequisites, Docker, AWS SSO, etc.

**Recommendation:** Fold START.md’s “Quick Start” into README (or a “Quick start” subsection) and **delete START.md**, or make START.md a one-line redirect to README § Getting Started. Update WHATS_NEXT “Quick Start Tomorrow” to point at README.

### 3.2 WHATS_NEXT.md

- Tracks “what’s next” and phase status; references COMPREHENSIVE_POV, VALIDATE_LABS_MASTER_PROMPT, etc.
- **Keep** as the single “current status & next steps” doc; optionally add a short “Docs to keep vs archive” pointer (e.g. to this plan).

---

## 4. Docs to keep (actively referenced or user-facing)

Do **not** remove these; they are linked from code, CONTRIBUTING, or validation/authoring workflows.

| Doc | Why keep |
|-----|----------|
| **README.md** | Main project entry. |
| **CONTRIBUTING.md** | Contributor guide; points to ARCHITECTURE_AND_ADDING_LABS, ADD_LAB_MASTER_PROMPT, CONTENT_CREATOR_QUICK_START. |
| **Docs/Guides/** (Lab_1_CSFLE, Lab_2_QE, Lab_3_GDPR, Security_Best_Practices_Guide, etc.) | sourceProof / reference for lab steps and content. |
| **Docs/Enablement/** | Enablement materials. |
| **Docs/README_WORKSHOP.md** | Workshop-level readme. |
| **Docs/Docker_Troubleshooting.md** | User-facing troubleshooting. |
| **Docs/Reset_And_Cleanup.md** | Describes app reset/cleanup behavior. |
| **Docs/ARCHITECTURE_AND_ADDING_LABS.md** | CONTRIBUTING + lab-adding checklist. |
| **Docs/ADD_LAB_MASTER_PROMPT.md** | Lab authoring + CONTRIBUTING. |
| **Docs/CONTENT_CREATOR_QUICK_START.md** | CONTRIBUTING workflow. |
| **Docs/CONTENT_STANDARDS.md** | ADD_LAB, VALIDATE, CONTENT_TEMPLATES. |
| **Docs/VALIDATE_LABS_MASTER_PROMPT.md** | Validation workflow; produces dated fix plans. |
| **Docs/LAB_SAMPLE_DATA_PLAN.md** | Referenced by VALIDATE, ADD_LAB, CONTENT_STANDARDS, fix plans. |
| **Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md** | VALIDATE, ADD_LAB, LAB_IMPLEMENTATION_PATHS, fix plans (hint/skeleton). |
| **Docs/LAB_IMPLEMENTATION_PATHS.md** | How labs are loaded/rendered. |
| **Docs/LAB_MIGRATION_GUIDE.md** | Migration + validation references. |
| **Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md** | Validation / fix-plan references. |
| **Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md** | WHATS_NEXT, ADD_LAB, phase tracking. |
| **Docs/WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md** | ADD_LAB, WHATS_NEXT. |
| **Docs/POV.txt** | WHATS_NEXT, phase list. |
| **Docs/TESTING.md** | Testing instructions. |
| **Docs/WORKSHOP_FRAMEWORK_ARCHITECTURE.md** | Current architecture (keep even if WORKSHOP_FRAMEWORK_PLAN is archived). |
| **Docs/LAB_LIBRARY_ARCHITECTURE.md** | Lab library design. |
| **Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md** | WHATS_NEXT, structure. |
| **Docs/LAB_APP_PREVIEW_AND_VISUALIZATION.md** | Feature doc; keep if the feature is in use. |
| **Docs/CONTENT_TEMPLATES.md** | Content creation. |
| **Docs/MODERATOR_DYNAMIC_TEMPLATE_GUIDE.md** | Moderator workflow. |
| **Docs/WORKSHOP_LAB_MAPPING.md** | Workshop planning. |
| **Docs/WORKSHOP_PREPARATION_EMAIL.md** | Outreach / prep. |
| **Docs/SA_MUST_KNOW_CONCEPTS.md** | Enablement/concepts. |
| **content/README.md** | Content folder. |

---

## 5. Suggested execution order

1. **Create archive (optional)**  
   - `Docs/archive/` or `Docs/archive/phases/`  
   - Move (don’t delete) phase completion summaries and dated fix/validation summaries there if you want to keep history.

2. **Remove or archive**  
   - Phase completion summaries (delete or move to archive).  
   - `2026-02-05_RUN_ALL_TIP_VALIDATION_SUMMARY.md` (archive or delete).  
   - `2026-02-23_FIX_PLAN.md` only after its fixes are done (then archive or delete).  
   - COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN, WORKSHOP_FRAMEWORK_PLAN, TOPIC_CENTRIC_STRUCTURE_PROPOSAL (archive if work is done/superseded).

3. **Consolidate**  
   - Merge START.md into README (or redirect), then delete START.md.  
   - Update WHATS_NEXT “Quick Start” to point at README.

4. **Update references (if you archive)**  
   - Search for links to moved files (e.g. `PHASE_17_AUTO_HA_COMPLETION_SUMMARY`) and point them to `Docs/archive/...` or remove the links if the doc is deleted.

---

## 6. Quick reference – “can I delete this?”

| Doc | Safe to delete? | Note |
|-----|-----------------|------|
| Any `PHASE_*_COMPLETION_SUMMARY.md` or `PHASE_*_COMPLETE.md` | Yes (or archive) | Historical only. |
| `2026-02-05_RUN_ALL_TIP_VALIDATION_SUMMARY.md` | Yes (or archive) | One-time run. |
| `2026-02-23_FIX_PLAN.md` | After fixes applied | Then archive/delete. |
| `COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md` | If feature is done | Archive. |
| `WORKSHOP_FRAMEWORK_PLAN.md` | If framework is done | Archive; keep WORKSHOP_FRAMEWORK_ARCHITECTURE. |
| `TOPIC_CENTRIC_STRUCTURE_PROPOSAL.md` | Yes if not adopted | Archive or delete. |
| `START.md` | After merging into README | Consolidate first. |
| Anything in §4 “Docs to keep” | No | Referenced by code or workflows. |
