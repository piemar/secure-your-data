## Architecture Overview – Groundswell Workshop Framework

This is a short, contributor-focused overview of how the **workshop framework** hangs together. For the full details and checklists, see **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)**.

The key idea: **labs are content, not components**. Lab definitions and enhancements live under `src/content/topics/` and are rendered by shared runtime components (LabRunner, StepView) with an enhancement loader.

---

## 1. High-level flow

In one sentence:

> **Content (topics + labs + enhancements) → Registry → ContentService → Lab runtime (LabRunner + StepView) + Enhancement loader.**

At a glance:

```text
┌───────────────────────────────────────────────────────────────┐
│ CONTENT                                                       │
│ src/content/topics/                                           │
│  - <topic>/topic.ts                                           │
│  - <topic>/<pov>/lab-*.ts        ← Lab definitions            │
│  - <topic>/<pov>/enhancements.ts ← Code blocks, tips          │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ REGISTRY                                                      │
│ src/content/topics/index.ts                                   │
│  - allTopics, allLabs                                         │
│  - imports every lab definition                              │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│ CONTENT SERVICE                                               │
│ src/services/contentService.ts                                │
│  - getLabs(), getLabById(), getTopics(), …                   │
└───────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌────────────────────────────┐   ┌──────────────────────────────┐
│ LAB RUNTIME (UI)           │   │ ENHANCEMENT LOADER           │
│ components/labs/           │   │ labs/enhancements/loader.ts  │
│  - LabRunner, StepView     │   │  - moduleMap (pov → import)  │
│  - Renders steps and uses  │   │  - loadEnhancementMetadata() │
│    enhancementId           │   │    → code blocks, tips       │
└────────────────────────────┘   └──────────────────────────────┘
```

For a more detailed diagram, see **Diagram A** in **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)**.

---

## 2. Key folders and files

- **`src/content/topics/`**  
  - `topic.ts`: topic metadata (id, title, description, etc.).  
  - `<pov>/lab-*.ts`: lab definitions (labs as data) – steps reference `enhancementId`.  
  - `<pov>/enhancements.ts`: enhancement entries keyed by `enhancementId` (code blocks, tips, metadata).

- **`src/content/topics/index.ts`**  
  - Registry for all topics and labs.  
  - Exports `allTopics` and `allLabs`.  
  - Every new lab must be imported and added to `allLabs`.

- **`src/services/contentService.ts`**  
  - Single place to query topics and labs (`getLabs`, `getLabById`, `getLabsByTopic`, etc.).  
  - The UI uses this instead of importing content directly.

- **`src/components/labs/`**  
  - Lab runtime: `LabRunner`, `StepView`, layout components.  
  - Renders labs and steps from `contentService`; resolves enhancements via the loader.

- **`src/labs/enhancements/loader.ts`**  
  - `moduleMap`: maps POV prefixes to their `enhancements.ts` modules.  
  - `loadEnhancementMetadata(enhancementId)`: loads the code blocks, hints, and metadata for each step.

---

## 3. Adding labs in this architecture

Adding a lab means plugging into this pipeline without writing per-lab React components:

1. **Create lab definition and enhancements** under `src/content/topics/<topic>/<pov>/`:
   - `lab-<slug>.ts` – lab metadata and steps (each step uses `enhancementId`).
   - `enhancements.ts` – enhancement entries keyed by `enhancementId`.
2. **Register the lab** in `src/content/topics/index.ts`:
   - Import the lab definition.
   - Add it to the `allLabs` array.
3. **Register the loader** (only if the POV prefix is new) in `src/labs/enhancements/loader.ts`:
   - Add the POV prefix to `moduleMap` and to the preload list.
4. **Validate and test**:
   - Run `node scripts/validate-content.js`.
   - Run the appropriate enhancement tests.
   - Open the app and confirm the lab loads and renders correctly.

The full checklist and diagrams are in **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** and **[Docs/ADDING_AND_VALIDATING_LABS.md](./ADDING_AND_VALIDATING_LABS.md)**.

---

## 4. Where to learn more

- **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** – Detailed architecture plus adding-labs checklist and diagrams.
- **[Docs/ADDING_AND_VALIDATING_LABS.md](./ADDING_AND_VALIDATING_LABS.md)** – Step-by-step guide to add or validate labs (with the ADD_LAB and VALIDATE prompts).
- **[Docs/INDEX.md](./INDEX.md)** – Entry point for all docs (architecture, guides, enablement, archived plans).

This overview is meant to give you a quick mental model. Once that’s clear, you can dive into the more detailed docs as needed.

