# Lab Migration Guide: From TSX to Content-Driven

This guide explains how to migrate existing labs from monolithic TSX components to the content-driven `WorkshopLabDefinition` format while preserving all rich content. It aligns with `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` and `Docs/LAB_IMPLEMENTATION_PATHS.md`.

## Migration Overview

**Goal**: Separate lab **structure** (what to teach) from **implementation details** (how to display it), enabling:
- Reusability across quests/challenges
- Content-driven architecture
- Easier maintenance
- Future YAML/JSON migration

**Strategy**: 
- Lab structure → Content definition (`WorkshopLabDefinition`) under `src/content/topics/<topic>/<pov>/lab-*.ts`
- Rich content (code blocks, skeletons, hints, tips) → Step enhancements in **topic POV folder**: `src/content/topics/<topic>/<pov>/enhancements.ts`, keyed by `enhancementId`
- Rendering → `LabRunner` with `labId`; enhancements loaded by the loader from `enhancements.ts` (no component required for step content)

## Migration Steps

### Step 1: Create Content Definition

Create the lab definition under the **topic POV folder**: `src/content/topics/<topic>/<pov>/lab-{name}.ts`. Example: `src/content/topics/encryption/my-pov/lab-my-lab.ts`.

```typescript
import { WorkshopLabDefinition } from '@/types';

export const labMyLabDefinition: WorkshopLabDefinition = {
  id: 'lab-my-lab',
  topicId: 'encryption',
  title: 'Lab X: My Lab',
  description: 'What this lab teaches',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  prerequisites: ['lab-csfle-fundamentals'],
  steps: [
    {
      id: 'lab-my-lab-step-1',  // Use format: lab-{lab-name}-step-{step-name}
      title: 'Step 1 Title',
      narrative: 'Context and background',
      instructions: 'What to do',
      estimatedTimeMinutes: 10,
      verificationId: 'myLab.verifyStep1',  // Resolved by verification service
      points: 10,
      enhancementId: 'my-pov.step-1',       // Links to enhancements.ts entry
      sourceProof: 'proofs/XX/README.md',
      sourceSection: 'Setup',
      hints: ['Basic hint 1', 'Basic hint 2']
    }
    // ... more steps
  ],
  modes: ['lab', 'demo'],
  audience: 'all'
};
```

**What goes in the lab definition:**
- ✅ Step structure (IDs, titles, narrative, instructions)
- ✅ Basic metadata (time, difficulty, verificationId, enhancementId, sourceProof, sourceSection)
- ✅ Basic hints
- ❌ Code blocks, skeletons, tips, exercises → these go in **`enhancements.ts`** in the same POV folder (see Step 2)

### Step 2: Add Enhancement Metadata (content-driven path)

Create or extend `src/content/topics/<topic>/<pov>/enhancements.ts`. Each step’s `enhancementId` (e.g. `my-pov.step-1`) must have a matching entry with code blocks, skeleton, inlineHints, tips, and optionally competitorEquivalents. The loader (`src/labs/enhancements/loader.ts`) resolves enhancements by the **prefix** of `enhancementId` (e.g. `my-pov` → module for that POV); the prefix must be registered in the loader’s `moduleMap` if the POV is new.

**Preferred (full content-driven):** No TSX component for step content. The app renders the lab via:

```tsx
<LabRunner labNumber={1} labId="lab-my-lab" />
```

LabRunner loads the lab definition from ContentService and, for each step with an `enhancementId`, loads the enhancement from the POV’s `enhancements.ts`. Verification is done via `verificationId` on the step (resolved by the verification service), not via `onVerify` in the enhancement.

**Legacy (hybrid):** If you still pass `stepEnhancements` from a component, those override the async-loaded enhancements. Prefer migrating that content into `enhancements.ts` so the lab is fully content-driven (see `Docs/LAB_IMPLEMENTATION_PATHS.md`).

### Step 3: Align Step IDs

**Critical**: Step IDs in component **must match** step IDs in content definition!

**Example**:
```typescript
// Content definition
{
  id: 'lab-my-lab-step-create-key',  // ✅
  title: 'Create Key'
}

// Component step
{
  id: 'lab-my-lab-step-create-key',  // ✅ Matches!
  title: 'Create Key',
  codeBlocks: [...]
}
```

**Common ID Patterns**:
- Lab 1: `lab-csfle-fundamentals-step-{step-name}`
- Lab 2: `lab-queryable-encryption-step-{step-name}`
- Lab 3: `lab-right-to-erasure-step-{step-name}`

### Step 4: Register in ContentService and loader

- **ContentService:** Ensure the lab is included in the labs list (e.g. via `src/content/topics/index.ts` and the `allLabs` array used by the content service).
- **Loader:** If the lab uses a **new** POV prefix for `enhancementId`, add that prefix to the `moduleMap` in `src/labs/enhancements/loader.ts` so it points to the correct `enhancements.ts` module under `src/content/topics/...`.

### Step 5: Test Migration

1. **Verify Lab Loads**: Check that lab loads from content definition
2. **Verify Rich Content**: Ensure code blocks, skeletons, hints render
3. **Verify Verification**: Test that `onVerify` functions work
4. **Verify Exercises**: Test quizzes, fill-in-the-blank, challenges
5. **Verify Navigation**: Test step navigation works correctly

## What Gets Preserved

### ✅ Preserved in enhancement metadata (`enhancements.ts`)

- **Code blocks**: Full code, skeletons (guided/challenge/expert), inline hints
- **Tips**: SA tips, best practices, competitorEquivalents
- **Troubleshooting**: Optional troubleshooting in enhancement
- **Exercises**: Optional in enhancement metadata

### ✅ Preserved in lab definition

- **Step structure**: IDs, titles, narrative, instructions
- **Basic metadata**: Time estimates, difficulty, points, verificationId, enhancementId, sourceProof, sourceSection
- **Basic hints**: Simple text hints (step-level)

### ✅ Preserved via intro / lab-specific overrides

- **Key concepts, architecture diagrams**: Via `labIntroComponents` or intro content from lab definition (see `labIntroComponents.tsx`). Key concepts can also be on the lab definition.
- **Verification**: Step-level `verificationId` is resolved by the verification service; no `onVerify` in enhancement for content-driven labs.

## Standardized approach (Lab 1 Step 3)

When migrating or adding steps, follow the **standardized approach** (see `Docs/ADD_LAB_MASTER_PROMPT.md`):

- **No Terminal block** that only runs `node file.cjs`. Users run code via **Run all** and **Run selection** in the editor.
- **Node + Mongosh steps:** Define exactly two blocks (Node block, then Mongosh block with `filename: 'Mongosh'`, `language: 'mongosh'`) **only when the same functionality can be executed in mongosh** (e.g. key vault index). Do not add a Mongosh block for driver-only steps (create DEK, auto-encrypt, rewrap, etc.); those steps have one block and the editor shows the filename only, no mongosh tab. Do not add a Terminal block. The UI shows one composite slot "mongosh ! node"; mongosh is first and default.
- **Skeleton + inlineHints** for both Node and Mongosh blocks where the step uses fill-in-the-blank; run hint placement verification for all blocks.

Reference: `csfle.init-keyvault` in `src/content/topics/encryption/csfle/enhancements.ts` (Lab 1 Step 3).

## Migration Checklist

- [ ] Create lab definition under topic POV: `src/content/topics/<topic>/<pov>/lab-*.ts`
- [ ] Define all steps with proper IDs, `enhancementId`, `verificationId`, `sourceProof`, `sourceSection`
- [ ] Create or extend `src/content/topics/<topic>/<pov>/enhancements.ts` with matching enhancement entries
- [ ] **No Terminal block** for running node scripts; execution via Run all / Run selection. Node + Mongosh steps: two blocks only (Node, then Mongosh).
- [ ] If new POV prefix: add prefix to `moduleMap` in `src/labs/enhancements/loader.ts`
- [ ] Register lab (e.g. via `src/content/topics/index.ts` / allLabs)
- [ ] Test lab loads via `LabRunner` with `labId`
- [ ] Test code blocks and skeletons render
- [ ] Test verification (via `verificationId`) works
- [ ] Test step navigation and optional exercises
- [ ] Update router/navigation if needed

## Common Issues & Solutions

### Issue: Step IDs Don't Match

**Symptom**: Rich content doesn't appear

**Solution**: Ensure step IDs in component match content definition exactly:

```typescript
// Content definition
id: 'lab-my-lab-step-1'

// Component - must match!
id: 'lab-my-lab-step-1'  // ✅
id: 'step-1'  // ❌ Won't work!
```

### Issue: Verification doesn't run

**Symptom**: "Check My Progress" button doesn't work

**Solution (content-driven):** Ensure each step has a `verificationId` in the lab definition and that the verification service registers a handler for that ID. No `onVerify` is used when enhancements are loaded from `enhancements.ts`.

### Issue: Code blocks don't render

**Symptom**: Code blocks are missing or empty

**Solution (content-driven):** Ensure the step has an `enhancementId` that matches an entry in the POV’s `enhancements.ts`, and that the enhancement has `codeBlocks` with `filename`, `language`, `code`, and optionally `skeleton` and `inlineHints`. The enhancementId **prefix** must be registered in `src/labs/enhancements/loader.ts` `moduleMap`.

### Issue: Intro Content Missing

**Symptom**: Architecture diagrams or custom intro missing

**Solution**: Pass `introContent` prop to `LabRunner`:

```typescript
<LabRunner
  labId="lab-my-lab"
  introContent={introContent}  // Custom intro with diagrams
/>
```

## Examples

### Example 1: Lab 1 (CSFLE Fundamentals) – content-driven

**Lab definition**: `src/content/topics/encryption/csfle/lab-csfle-fundamentals.ts` – 7 steps, each with `enhancementId` (e.g. `csfle.create-cmk`), `verificationId`, `sourceProof`, `sourceSection`.

**Enhancements**: `src/content/topics/encryption/csfle/enhancements.ts` – full code blocks, skeletons, inline hints, tips, competitorEquivalents for all 7 steps.

**Rendering**: `LabRunner` with `labId="lab-csfle-fundamentals"` (e.g. from Index). No dedicated TSX component; enhancements loaded by loader.

**Result**: ✅ Fully content-driven

### Example 2: Lab 2 (Queryable Encryption) – content-driven

**Lab definition**: `src/content/topics/encryption/queryable-encryption/lab-queryable-encryption.ts` – 4 steps with `enhancementId`, `verificationId`, etc.

**Enhancements**: `src/content/topics/encryption/queryable-encryption/enhancements.ts` – full step content.

**Rendering**: `LabRunner` with `labId="lab-queryable-encryption"`.

**Result**: ✅ Fully content-driven

### Example 3: Lab 3 (Right to Erasure) – content-driven

**Lab definition**: `src/content/topics/encryption/right-to-erasure/lab-right-to-erasure.ts`

**Enhancements**: `src/content/topics/encryption/right-to-erasure/enhancements.ts`

**Rendering**: `LabRunner` with `labId="lab-right-to-erasure"`.

**Result**: ✅ Fully content-driven

## Next Steps After Migration

1. **Test Thoroughly**: Verify all functionality works
2. **Document**: Update lab-specific documentation
3. **Use in Quests**: Add lab to quests with narrative overlays
4. **Future Migration**: Plan YAML/JSON migration for content definitions

## Benefits Achieved

- ✅ **Content-Driven**: Labs defined in reusable content files
- ✅ **Reusable**: Same lab can be used in multiple quests/challenges
- ✅ **Maintainable**: Clear separation of structure and implementation
- ✅ **Preserved**: All rich content (code, skeletons, hints, exercises) preserved
- ✅ **Zero UX Changes**: Users see no difference

## Questions?

See:
- `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` – Enhancement schema, loader, and topic-based paths
- `Docs/LAB_IMPLEMENTATION_PATHS.md` – Content-driven vs legacy component path; all encryption labs now content-driven
- `Docs/VALIDATE_LABS_MASTER_PROMPT.md` – Quality audit against ADD_LAB_MASTER_PROMPT
- `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md` – Topic/POV folder layout
- `CONTRIBUTING.md` – General contribution guide
