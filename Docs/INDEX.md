# Docs Index – Start Here

Quick pointers to the docs you need.

**Archive:** Dated fix plans (e.g. `YYYY-MM-DD_FIX_PLAN.md`) and completed phase summaries live in **[Docs/archive/](./archive/)** and **Docs/archive/phases/**. Current validation produces new fix plans in `Docs/` when run.

---

## Adding and validating labs

- **[ADDING_AND_VALIDATING_LABS.md](./ADDING_AND_VALIDATING_LABS.md)** – **Start here:** step-by-step how to add a new lab (using ADD_LAB prompt) and how to validate existing labs (full audit or by topic/lab).
- **[ADD_LAB_MASTER_PROMPT.md](./ADD_LAB_MASTER_PROMPT.md)** – The prompt to run for adding a lab (generates lab file, enhancements, registration, tests).
- **[VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md)** – The prompt to run for auditing labs (produces dated fix plan or scoped report).
- **[ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** – Checklist and flow: create lab file, enhancements, register in index and loader, validate and test.
- **[LAB_FOLDER_STRUCTURE_GUIDELINE.md](./LAB_FOLDER_STRUCTURE_GUIDELINE.md)** – Where labs and enhancements live: `src/content/topics/<topic>/<pov>/`.
- **[CONTENT_STANDARDS.md](./CONTENT_STANDARDS.md)** – Lab and step standards, standardized approach (Run all / Run selection, no Terminal for node, skeleton + hints).

---

## Moderator / workshop setup

- **[WORKSHOP_TEMPLATE_STORAGE_AND_CUSTOM.md](./WORKSHOP_TEMPLATE_STORAGE_AND_CUSTOM.md)** – Where templates live (repo vs Atlas), custom templates, Predefined vs Custom when creating a session, promotion to default.
- **[MODERATOR_DYNAMIC_TEMPLATE_GUIDE.md](./MODERATOR_DYNAMIC_TEMPLATE_GUIDE.md)** – How to use the Dynamic Template Builder (topics, capabilities, lab bundles, modes).
- **[WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md](./WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md)** – Modes (Demo/Lab/Challenge), session lifecycle, quality bar.

---

## Architecture / refactoring

- **[BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md](./BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md)** – Incremental plan to evolve the app toward a VS Code–like browser IDE with real terminal (xterm.js), Monaco, multi-language execution (Python, Node, Java, C#), placeholders/hints, command palette, and Warp-style hybrid UX.
- **[BROWSER_IDE_REFACTOR_IMPLEMENTATION_STATUS.md](./BROWSER_IDE_REFACTOR_IMPLEMENTATION_STATUS.md)** – Implementation status vs the architecture doc: what’s done (Phases 0–2, execution/hints/palette/types), partial (Phase 3–6), and recommended next steps.
- **[CURRENT_EXECUTION_AND_EDITOR_MAP.md](./CURRENT_EXECUTION_AND_EDITOR_MAP.md)** – Phase 0 map: where run-node/run-mongosh/run-bash are called, Monaco mounts, output surface, and validation.

---

## Reference

- **[LAB_IMPLEMENTATION_PATHS.md](./LAB_IMPLEMENTATION_PATHS.md)** – Content-driven path; all labs rendered via LabRunner; enhancement loader.
- **[METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md](./METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md)** – Enhancement schema, loader, topic-based metadata.
- **[COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md](./COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md)** – PoV phases, 57 capabilities, topic-centric structure.
- **[CONTENT_TEMPLATES.md](./CONTENT_TEMPLATES.md)** – Lab, quest, and demo script template examples.
- **[LAB_MIGRATION_GUIDE.md](./LAB_MIGRATION_GUIDE.md)** – Migrating from TSX to content-driven lab definitions.
- **[LAB_SAMPLE_DATA_PLAN.md](./LAB_SAMPLE_DATA_PLAN.md)** – Pre-loaded data, Load Sample Data UX, reset behaviour.
- **[LAB_UI_LAYOUT_TARGET.md](./LAB_UI_LAYOUT_TARGET.md)** – Target layout: Sidebar | Database Navigator | Editor | Preview.
- **[LAB_PREREQUISITES_IMPLEMENTATION_PLAN.md](./LAB_PREREQUISITES_IMPLEMENTATION_PLAN.md)** – Lab dependencies (prerequisiteLabIds), auto-include and sort in workshop builder.
- **Guides/** – Lab guides (e.g. Lab_1_CSFLE.md, Lab_2_QE.md, Lab_3_GDPR.md), security, migration.
- **Enablement/** – Quick reference, patterns.

---

## Archive / plans (restored and historical)

- **[archive/DOCS_CLEANUP_PLAN.md](./archive/DOCS_CLEANUP_PLAN.md)** – Superseded by INDEX; kept for history.
- **[archive/2026-03-07_FIX_PLAN_CSFLE_QRY_GDPR_CRUD_RICH.md](./archive/2026-03-07_FIX_PLAN_CSFLE_QRY_GDPR_CRUD_RICH.md)** – Dated fix plan (CSFLE, QE, GDPR, CRUD, Rich Query).
- **[archive/LAB_HOW_TO_USE_AND_WHERE_TO_RUN_PLAN.md](./archive/LAB_HOW_TO_USE_AND_WHERE_TO_RUN_PLAN.md)** – Plan for clarifying “copy code → run in your terminal/mongosh → Verify” (restored from git).
- **[archive/WORKSHOP_FRAMEWORK_PLAN.md](./archive/WORKSHOP_FRAMEWORK_PLAN.md)** – Workshop framework and phases.
- **[archive/COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md](./archive/COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md)** – Competitor comparison UX plan.
- **archive/phases/** – Phase completion summaries (PHASE_0 through PHASE_17, etc.).
