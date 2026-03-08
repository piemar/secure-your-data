# Docs Index – Start Here

Quick pointers to the docs you need.

---

## Adding a new lab

- **[ADD_LAB_MASTER_PROMPT.md](./ADD_LAB_MASTER_PROMPT.md)** – Run this prompt in Cursor (or your LLM) with a description and proof number or source doc path; it generates lab file, enhancements, registration, and tests.
- **[ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** – Checklist and flow: create lab file, enhancements, register in index and loader, validate and test.
- **[LAB_FOLDER_STRUCTURE_GUIDELINE.md](./LAB_FOLDER_STRUCTURE_GUIDELINE.md)** – Where labs and enhancements live: `src/content/topics/<topic>/<pov>/`.
- **[CONTENT_STANDARDS.md](./CONTENT_STANDARDS.md)** – Lab and step standards, standardized approach (Run all / Run selection, no Terminal for node, skeleton + hints).

---

## Validating labs

- **[VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md)** – Audit all labs against ADD_LAB_MASTER_PROMPT; produces a dated fix plan.
- **[CONTENT_STANDARDS.md](./CONTENT_STANDARDS.md)** – Quality bar and conventions.

---

## Moderator / workshop setup

- **[WORKSHOP_TEMPLATE_STORAGE_AND_CUSTOM.md](./WORKSHOP_TEMPLATE_STORAGE_AND_CUSTOM.md)** – Where templates live (repo vs Atlas), custom templates, Predefined vs Custom when creating a session, promotion to default.
- **[MODERATOR_DYNAMIC_TEMPLATE_GUIDE.md](./MODERATOR_DYNAMIC_TEMPLATE_GUIDE.md)** – How to use the Dynamic Template Builder (topics, capabilities, lab bundles, modes).
- **[WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md](./WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md)** – Modes (Demo/Lab/Challenge), session lifecycle, quality bar.

---

## Architecture / refactoring

- **[BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md](./BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md)** – Incremental plan to evolve the app toward a VS Code–like browser IDE with real terminal (xterm.js), Monaco, multi-language execution (Python, Node, Java, C#), placeholders/hints, command palette, and Warp-style hybrid UX.

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
- **[SA_MUST_KNOW_CONCEPTS.md](./SA_MUST_KNOW_CONCEPTS.md)** – CSFLE, QE, Right to Erasure concepts for SAs.
- **Guides/** – Lab guides (e.g. Lab_1_CSFLE.md, Lab_2_QE.md, Lab_3_GDPR.md), security, migration.
- **Enablement/** – Quick reference, patterns.
