# Lab Migration Guide: From TSX to Content-Driven

This guide explains how to migrate existing labs from monolithic TSX components to the content-driven `WorkshopLabDefinition` format while preserving all rich content.

## Migration Overview

**Goal**: Separate lab **structure** (what to teach) from **implementation details** (how to display it), enabling:
- Reusability across quests/challenges
- Content-driven architecture
- Easier maintenance
- Future YAML/JSON migration

**Strategy**: 
- Lab structure → Content definition (`WorkshopLabDefinition`)
- Rich content → Step enhancements (`Map<string, Partial<Step>>`)
- Component → Thin wrapper using `LabRunner`

## Migration Steps

### Step 1: Create Content Definition

Create `src/content/labs/lab-{name}.ts`:

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
      verificationId: 'myLab.verifyStep1',
      points: 10,
      hints: [
        'Basic hint 1',
        'Basic hint 2'
      ]
    }
    // ... more steps
  ],
  modes: ['lab', 'demo'],
  audience: 'all'
};
```

**What goes in content definition:**
- ✅ Step structure (IDs, titles, narrative, instructions)
- ✅ Basic metadata (time, difficulty, verification IDs)
- ✅ Basic hints
- ❌ Code blocks (goes in stepEnhancements)
- ❌ Skeletons (goes in stepEnhancements)
- ❌ Verification functions (goes in stepEnhancements)
- ❌ Exercises (goes in stepEnhancements)
- ❌ Tips (goes in stepEnhancements)

### Step 2: Update Component to Use Content Definition

**Before (Monolithic)**:
```tsx
<LabRunner
  labNumber={1}
  title="..."
  description="..."
  steps={labSteps}  // All content in TSX
  introContent={introContent}
/>
```

**After (Content-Driven)**:
```tsx
import { createStepEnhancements } from '@/utils/labStepEnhancements';

export function MyLab() {
  const { mongoUri, awsRegion, verifiedTools } = useLab();
  
  // Keep existing step definitions with rich content
  const labSteps: Step[] = [
    {
      id: 'lab-my-lab-step-1',  // Must match content definition!
      title: 'Step 1 Title',
      // ... all rich content (code blocks, skeletons, hints, exercises, verification)
    }
  ];

  // Extract rich content into stepEnhancements Map
  const stepEnhancements = createStepEnhancements(labSteps);

  return (
    <LabRunner
      labNumber={1}
      labId="lab-my-lab"  // Loads from content definition
      stepEnhancements={stepEnhancements}  // Preserves rich content
      introContent={introContent}  // Optional: custom intro
    />
  );
}
```

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

### Step 4: Register in ContentService

Add to `src/services/contentService.ts`:

```typescript
import { labMyLabDefinition } from '../content/labs/lab-my-lab';

class InMemoryContentService {
  private labs: WorkshopLabDefinition[] = [
    lab1Definition,
    lab2Definition,
    lab3Definition,
    labMyLabDefinition  // Add here
  ];
}
```

### Step 5: Test Migration

1. **Verify Lab Loads**: Check that lab loads from content definition
2. **Verify Rich Content**: Ensure code blocks, skeletons, hints render
3. **Verify Verification**: Test that `onVerify` functions work
4. **Verify Exercises**: Test quizzes, fill-in-the-blank, challenges
5. **Verify Navigation**: Test step navigation works correctly

## What Gets Preserved

### ✅ Preserved via stepEnhancements

- **Code Blocks**: Full code, skeletons (guided/challenge/expert), inline hints
- **Tips**: SA tips, best practices, action required notices
- **Exercises**: Quizzes, fill-in-the-blank, challenges
- **Verification Functions**: `onVerify` callbacks
- **Troubleshooting**: Troubleshooting guides
- **Custom Sections**: `understandSection`, `doThisSection`

### ✅ Preserved via introContent

- **Architecture Diagrams**: React components
- **Key Concepts**: Term/explanation pairs
- **Custom Insights**: Lab-specific insights
- **Encryption Flow**: Visual flow diagrams

### ✅ Preserved in Content Definition

- **Step Structure**: IDs, titles, narrative, instructions
- **Basic Metadata**: Time estimates, difficulty, points
- **Verification IDs**: References to verification logic
- **Basic Hints**: Simple text hints

## Migration Checklist

- [ ] Create content definition file (`src/content/labs/lab-{name}.ts`)
- [ ] Define all steps with proper IDs
- [ ] Update component to use `labId` with `stepEnhancements`
- [ ] Align step IDs between content definition and component
- [ ] Register lab in ContentService
- [ ] Test lab loads correctly
- [ ] Test code blocks render
- [ ] Test skeletons display
- [ ] Test verification functions work
- [ ] Test exercises function
- [ ] Test step navigation
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

### Issue: Verification Functions Don't Work

**Symptom**: "Check My Progress" button doesn't work

**Solution**: Ensure `onVerify` is in `stepEnhancements`:

```typescript
const stepEnhancements = createStepEnhancements(labSteps);
// stepEnhancements automatically includes onVerify functions
```

### Issue: Code Blocks Don't Render

**Symptom**: Code blocks are missing or empty

**Solution**: Ensure code blocks are in component step definitions:

```typescript
const labSteps: Step[] = [
  {
    id: 'lab-my-lab-step-1',
    codeBlocks: [
      {
        filename: 'script.js',
        language: 'javascript',
        code: `...`,
        skeleton: `...`
      }
    ]
  }
];
```

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

### Example 1: Lab 1 (CSFLE Fundamentals)

**Content Definition**: `src/content/labs/lab-csfle-fundamentals.ts`
- 7 steps defined
- Basic structure and metadata

**Component**: `src/components/labs/Lab1CSFLE.tsx`
- 7 steps with rich content
- Code blocks with skeletons (guided/challenge/expert)
- Inline hints, tips, exercises
- Verification functions
- Custom intro with architecture diagram

**Result**: ✅ Fully migrated, all content preserved

### Example 2: Lab 2 (Queryable Encryption)

**Content Definition**: `src/content/labs/lab-queryable-encryption.ts`
- 4 steps defined
- QE-specific structure

**Component**: `src/components/labs/Lab2QueryableEncryption.tsx`
- 4 steps with QE code examples
- Range query demonstrations
- Metadata collection exploration

**Result**: ✅ Fully migrated, all content preserved

### Example 3: Lab 3 (Right to Erasure)

**Content Definition**: `src/content/labs/lab-right-to-erasure.ts`
- 4 steps defined
- GDPR/compliance focus

**Component**: `src/components/labs/Lab3RightToErasure.tsx`
- 4 steps with migration patterns
- Multi-tenant key isolation
- Crypto-shredding demonstrations

**Result**: ✅ Fully migrated, all content preserved

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
- `CONTRIBUTING.md` - General contribution guide
- `Docs/LAB_LIBRARY_ARCHITECTURE.md` - Lab library architecture
- `Docs/PHASE_7_COMPLETION_SUMMARY.md` - Phase 7 migration details
