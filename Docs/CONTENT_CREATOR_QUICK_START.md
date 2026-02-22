# Content Creator Quick Start Guide

Welcome! This guide will help you quickly create new labs, quests, and demo scripts for the workshop framework.

## Prerequisites

- Node.js installed (v18+)
- Basic understanding of TypeScript/JavaScript
- Access to MongoDB PoV proof exercises (`Docs/pov-proof-exercises/`)

## Quick Start: Creating a Lab

Labs live under **topic-centric paths**: `src/content/topics/<topic>/<pov>/lab-*.ts`. Each step uses an **enhancementId** (e.g. `full-recovery-rpo.concepts`); code blocks and tips live in **enhancements.ts** in the same folder. Registration is in **src/content/topics/index.ts** (and, for new POVs, **src/labs/enhancements/loader.ts**).

**Recommended:** Use the [Master Template Prompt](ADD_LAB_MASTER_PROMPT.md) to generate a full lab plus enhancements and registration in one go. For architecture and a step-by-step checklist, see [ARCHITECTURE_AND_ADDING_LABS.md](ARCHITECTURE_AND_ADDING_LABS.md).

### Step 1: Use the Creation Script (scaffold only)

The script creates the correct **path** and a lab scaffold. Use `--pov-folder` when the topic has POV subfolders (e.g. operations, query):

```bash
node scripts/create-lab.js \
  --name="My New Lab" \
  --topic=operations \
  --pov-folder=full-recovery-rpo \
  --pov=FULL-RECOVERY-RPO \
  --modes=demo,lab,challenge \
  --proof=13
```

This creates a lab file at **src/content/topics/operations/full-recovery-rpo/lab-my-new-lab.ts** (topic + pov-folder). The generated steps use **enhancementId**; you must add matching entries in **enhancements.ts** in the same folder.

### Step 2: Add or update enhancements

In the **same folder** as the lab, create or edit `enhancements.ts`. Each step’s `enhancementId` (e.g. `full-recovery-rpo.concepts`) must have a corresponding entry with `id`, `povCapability`, `sourceProof`, `sourceSection`, `codeBlocks`, and `tips`. See `src/content/topics/operations/full-recovery-rpo/enhancements.ts` for the shape.

### Step 3: Fill in lab content

In the generated lab file:

1. **Update the description** – Clear and compelling (20–200 characters).
2. **Add prerequisites** – What users need before starting.
3. **Steps** – Each step already references an `enhancementId`. Ensure titles, narrative, instructions, estimated time, and points are correct. Add `keyConcepts` and `tags` if needed.

### Step 4: Register your lab

Labs are registered in **src/content/topics/index.ts** (not contentService.ts):

1. Add an import: `import { labMyNewLabDefinition } from './operations/full-recovery-rpo/lab-my-new-lab';`
2. Add the export to the **allLabs** array: `labMyNewLabDefinition,`

If the POV prefix (e.g. `full-recovery-rpo`) is **new**, also update **src/labs/enhancements/loader.ts**:

- In **moduleMap**, add: `'full-recovery-rpo': () => import('@/content/topics/operations/full-recovery-rpo/enhancements'),`
- In **preloadAllEnhancements**, add `'full-recovery-rpo'` to the prefixes array.

You can use `node scripts/register-lab.js --file=src/content/topics/operations/full-recovery-rpo/lab-my-new-lab.ts` to add the lab to index and loader automatically (if that script is available).

### Step 5: Validate and test

```bash
node scripts/validate-content.js
```

Then run the app and confirm the new lab appears and steps load enhancement content.

### CLI caveats

- **create-lab.js** – Creates the correct path and a lab with enhancementId-based steps. You still must add/update **enhancements.ts**, register in **index.ts**, and (for new POVs) **loader.ts**.
- **create-enhancement.js** – Writes to `src/labs/enhancements/metadata/`, which the runtime **does not use**. Enhancements for labs are defined in **src/content/topics/.../enhancements.ts**. Prefer the master prompt or copying from an existing POV’s enhancements file.
- **register-content.js** – Targets contentService and old paths. For labs, registration is done in **src/content/topics/index.ts** and **src/labs/enhancements/loader.ts** (see above).

## Quick Start: Creating a Quest

### Step 1: Use the Creation Script

```bash
node scripts/create-quest.js \
  --name="My Quest" \
  --labs=lab-csfle-fundamentals,lab-queryable-encryption \
  --flags=flag-1,flag-2 \
  --modes=challenge,lab
```

### Step 2: Add Story Context

Fill in the `storyContext` field with a compelling narrative that explains:
- The situation/problem
- The objective
- Why it matters

### Step 3: Add Lab Context Overlays (Optional)

Customize lab narratives for this quest using `labContextOverlays`:

```typescript
labContextOverlays: [
  {
    labId: 'lab-csfle-fundamentals',
    introNarrative: '**Quest Context:** In this quest, you are...',
    stepNarrativeOverrides: {
      'lab-csfle-fundamentals-step-create-cmk': 'Quest-specific narrative for this step'
    }
  }
]
```

## Quick Start: Creating a Demo Script

### Step 1: Use the Creation Script

```bash
node scripts/create-demo-script.js \
  --name="Encryption Demo" \
  --pov=ENCRYPT-FIELDS \
  --labs=lab-csfle-fundamentals,lab-queryable-encryption
```

### Step 2: Refine Demo Beats

Edit the generated JSON file to:
- Add compelling narratives for each beat
- Specify exact step IDs to jump to
- Add competitive comparison notes
- Adjust durations

### Step 3: Use in Demo Mode

Demo scripts are automatically loaded in Demo Mode when a template includes the referenced labs.

## Common Workflows

### Creating a Complete POV Implementation

1. **Read the proof exercise**: `Docs/pov-proof-exercises/proofs/{N}/README.md`
2. **Design 3+ labs** covering:
   - Lab 1: Setup & Foundation
   - Lab 2: Core Capability Demonstration
   - Lab 3: Advanced/Real-World Application
3. **Create labs** using the creation script
4. **Create a quest** that chains the labs together
5. **Create a demo script** highlighting key moments
6. **Validate everything**: `node scripts/validate-content.js`
7. **Lint for quality**: `node scripts/lint-content.js`

### Adding a Lab to an Existing Topic

1. Create the lab using the creation script (use `--pov-folder` if the topic has POV subfolders).
2. Ensure `topicId` matches the existing topic.
3. Add or update `enhancements.ts` in the same folder with entries for each step’s `enhancementId`.
4. Register the lab in `src/content/topics/index.ts` (import + allLabs). If the POV prefix is new, add it to `src/labs/enhancements/loader.ts` (moduleMap + preloadAllEnhancements).
5. The lab will then appear in topic-based navigation.

## Validation & Quality Checks

### Run Validation

```bash
node scripts/validate-content.js
```

This checks for:
- Schema compliance
- Valid POV mappings
- Valid topic references
- Valid modes
- ID uniqueness
- Reference integrity

### Run Linting

```bash
node scripts/lint-content.js
```

This checks for:
- Naming conventions
- Description quality
- Step count (minimum 3)
- Mode coverage
- Proof exercise references
- Code block syntax

## Getting Help

- **Architecture and adding labs**: See [ARCHITECTURE_AND_ADDING_LABS.md](ARCHITECTURE_AND_ADDING_LABS.md)
- **Master prompt (add a lab in one go)**: See [ADD_LAB_MASTER_PROMPT.md](ADD_LAB_MASTER_PROMPT.md)
- **Content Standards**: See `Docs/CONTENT_STANDARDS.md`
- **Templates**: See `Docs/CONTENT_TEMPLATES.md`
- **Folder structure**: See `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md`
- **Existing lab example**: `src/content/topics/operations/full-recovery-rpo/lab-full-recovery-rpo-overview.ts`
- **Existing enhancements example**: `src/content/topics/operations/full-recovery-rpo/enhancements.ts`

## Next Steps

1. Read `Docs/CONTENT_STANDARDS.md` for detailed guidelines
2. Review `Docs/CONTENT_TEMPLATES.md` for template examples
3. Look at existing labs for inspiration
4. Start creating!
