# Contributing to the Workshop Framework

Thank you for your interest in contributing to the MongoDB Workshop Framework! This guide will help you understand how to add new content, labs, quests, and challenges.

## Table of Contents

- [Content Structure](#content-structure)
- [Creating a New Lab](#creating-a-new-lab)
- [Creating a New Quest](#creating-a-new-quest)
- [Creating a Challenge Template](#creating-a-challenge-template)
- [Adding Competitor Comparisons](#adding-competitor-comparisons)
- [Content Validation](#content-validation)
- [Testing Your Content](#testing-your-content)

## Content Structure

All workshop content lives in the `src/content/` directory:

```
src/content/
├── topics/           # Topic definitions (e.g., encryption, schema-design)
├── labs/             # Lab definitions (CSFLE, Queryable Encryption, etc.)
├── quests/           # Quest definitions (story-driven objectives)
├── flags/            # Flag definitions (CTF-style objectives)
├── workshop-templates/  # Workshop templates (default, industry-specific)
├── competitor-scenarios/  # MongoDB vs competitor comparisons
└── schemas/          # JSON schemas for validation
```

## Creating a New Lab

Labs live under **topic-centric paths**: `src/content/topics/<topic>/<pov>/lab-*.ts`. Each step uses an **enhancementId**; code blocks and tips live in **enhancements.ts** in the same folder. Registration is in **src/content/topics/index.ts** and (for new POVs) **src/labs/enhancements/loader.ts**.

**Recommended path:**

1. **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md)** – Architecture diagrams and a checklist for what’s required to add a lab.
2. **[Docs/ADD_LAB_MASTER_PROMPT.md](Docs/ADD_LAB_MASTER_PROMPT.md)** – A single prompt (with user inputs) to generate the lab file, enhancements file, and registration edits.
3. **Scripts** – `node scripts/create-lab.js` (scaffold) and `node scripts/register-lab.js --file=...` (register in index + loader). See **[Docs/CONTENT_CREATOR_QUICK_START.md](Docs/CONTENT_CREATOR_QUICK_START.md)** for the full workflow and CLI caveats.

### Manual steps (if not using the master prompt or scripts)

1. Create the lab file in `src/content/topics/<topic>/<pov>/lab-<name>.ts` with steps that use **enhancementId** (no inline codeBlocks).
2. Create or update `enhancements.ts` in the same folder with one entry per enhancementId.
3. Add the import and the lab export to the **allLabs** array in `src/content/topics/index.ts`.
4. If the POV prefix is new, add it to the **moduleMap** and **preloadAllEnhancements** array in `src/labs/enhancements/loader.ts`.
5. Run `node scripts/validate-content.js`.

See [Docs/ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md) for a diagram and checklist, and [Docs/CONTENT_CREATOR_QUICK_START.md](Docs/CONTENT_CREATOR_QUICK_START.md) for the full workflow.

### Legacy: Register Component in Router (content-driven labs do not require this)

Labs defined under `src/content/topics/` are loaded by the framework via the topic index; no per-lab component or router registration is needed. If you are extending an older lab that still has a dedicated component, add it to `src/pages/Index.tsx`:

```typescript
import { MyNewLab } from '@/components/labs/MyNewLab';

// In ContentRouter switch statement:
case 'lab4':
  if (!canAccessLabs) {
    return <WorkshopNotStarted />;
  }
  return <MyNewLab />;
```

And add navigation in `src/components/layout/AppSidebar.tsx`:

```typescript
case 'lab4':
  return { label: 'Lab 4: My New Lab', icon: Database };
```

### Step 5: Use Lab in Quests (Optional)

If your lab will be used in quests with quest-specific narrative, create quest overlays:

```typescript
// In your quest definition
labIds: ['lab-my-new-lab'],
labContextOverlays: [{
  labId: 'lab-my-new-lab',
  introNarrative: 'Quest-specific intro for this lab...',
  outroNarrative: 'Quest-specific outro...',
  stepNarrativeOverrides: {
    'step-id': 'Quest-specific step narrative'
  }
}]
```

### Step 6: Add to a Template

Update a template in `src/content/workshop-templates/` to include your lab:

```typescript
labIds: [
  'lab-csfle-fundamentals',
  'lab-my-new-lab'  // Add here
]
```

## Creating a New Quest

### Step 1: Define the Quest

Create a file in `src/content/quests/`:

```typescript
// src/content/quests/my-quest.ts
import { WorkshopQuest } from '@/types';

export const myQuest: WorkshopQuest = {
  id: 'quest-my-quest',
  title: 'My Quest',
  storyContext: 'Narrative background for this quest...',
  objectiveSummary: 'What participants need to accomplish',
  labIds: ['lab-csfle-fundamentals', 'lab-my-new-lab'],
  requiredFlagIds: ['flag-encrypted-pii-collections'],
  optionalFlagIds: ['flag-queryable-encryption-active'],
  modes: ['challenge', 'lab']
};
```

### Step 2: Register in ContentService

Add to `src/services/contentService.ts`:

```typescript
import { myQuest } from '../content/quests/my-quest';

private quests: WorkshopQuest[] = [
  stopTheLeakQuest,
  myQuest  // Add here
];
```

## Creating a Challenge Template

### Step 1: Define the Template

Create a file in `src/content/workshop-templates/`:

```typescript
// src/content/workshop-templates/my-challenge.ts
import { WorkshopTemplate } from '@/types';

export const myChallengeTemplate: WorkshopTemplate = {
  id: 'template-my-challenge',
  name: 'My Challenge',
  description: 'Description of this challenge scenario',
  industry: 'retail', // or 'financial', 'healthcare', etc.
  labIds: ['lab-csfle-fundamentals'],
  questIds: ['quest-my-quest'],
  allowedModes: ['challenge', 'lab'],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50
  },
  storyIntro: `# Challenge Introduction

Your mission brief here...`,
  storyOutro: `# Challenge Complete!

Congratulations message...`
};
```

### Step 2: Register in ContentService

Add to `src/services/contentService.ts`:

```typescript
import { myChallengeTemplate } from '../content/workshop-templates/my-challenge';

private templates: WorkshopTemplate[] = [
  defaultEncryptionWorkshopTemplate,
  myChallengeTemplate  // Add here
];
```

## Adding Competitor Comparisons

### Step 1: Create Competitor Scenario

Create a file in `src/content/competitor-scenarios/`:

```typescript
// src/content/competitor-scenarios/my-comparison.ts
import { WorkshopCompetitorScenario } from '@/types';

export const myComparisonScenario: WorkshopCompetitorScenario = {
  id: 'scenario-my-comparison',
  labId: 'lab-csfle-fundamentals',
  stepId: 'step-1-intro', // Optional: specific step
  mongodbDescription: 'How MongoDB handles this...',
  competitorImplementations: [
    {
      competitorId: 'rdbms',
      title: 'Traditional RDBMS',
      description: 'How RDBMS handles this...',
      codeSnippets: [
        {
          language: 'sql',
          code: 'SELECT * FROM ...',
          description: 'Explanation'
        }
      ],
      painPoints: [
        'Pain point 1',
        'Pain point 2'
      ]
    }
  ]
};
```

### Step 2: Register in ContentService

Add to `src/services/contentService.ts`:

```typescript
import { myComparisonScenario } from '../content/competitor-scenarios/my-comparison';

private competitorScenarios: WorkshopCompetitorScenario[] = [
  encryptionComparisonScenario,
  myComparisonScenario  // Add here
];
```

## Content Validation

### JSON Schema Validation

All content should conform to the schemas in `content/schemas/workshop.schema.json`. You can validate your content using:

```bash
# Install validation tool (if not already installed)
npm install -g ajv-cli

# Validate a lab definition
ajv validate -s content/schemas/workshop.schema.json -d src/content/labs/my-lab.ts
```

### TypeScript Type Checking

The framework uses TypeScript types defined in `src/types/index.ts`. Ensure your content matches these types:

```typescript
import { WorkshopLabDefinition } from '@/types';

// TypeScript will validate your structure
export const myLab: WorkshopLabDefinition = {
  // ... your lab definition
};
```

## Testing Your Content

### 1. Local Development

Start the development server:

```bash
npm run dev
```

Navigate to your new lab/quest/challenge and verify:
- Content loads correctly
- Steps render properly
- Verifications work
- Flags can be captured (if applicable)

### 2. Content Service Testing

Test that your content is loaded by ContentService:

```typescript
import { getContentService } from '@/services/contentService';

const service = getContentService();
const labs = await service.getLabs();
const myLab = labs.find(l => l.id === 'lab-my-new-lab');
console.log(myLab); // Should show your lab
```

## Best Practices

1. **Naming Conventions**:
   - Lab IDs: `lab-{kebab-case-name}`
   - Quest IDs: `quest-{kebab-case-name}`
   - Flag IDs: `flag-{kebab-case-name}`
   - Template IDs: `template-{kebab-case-name}`

2. **Descriptions**:
   - Be clear and concise
   - Include learning objectives
   - Provide context for why this matters

3. **Verification IDs**:
   - Use existing verification IDs from `VerificationService` when possible
   - Add new verification logic to `verificationService.ts` if needed

4. **Story Context**:
   - Make quests and challenges feel realistic
   - Connect to real customer scenarios
   - Include stakes and consequences

5. **Code Examples**:
   - Use realistic, production-ready code
   - Include error handling where appropriate
   - Comment complex logic

## CLI Helpers (Future)

We plan to add CLI helpers for content creation:

```bash
# Create a new lab scaffold
npm run workshop-cli create-lab --name "My Lab"

# Create a new quest scaffold
npm run workshop-cli create-quest --name "My Quest"

# Create a new challenge scaffold
npm run workshop-cli create-challenge --name "My Challenge"
```

## Questions?

If you have questions or need help:
1. Check existing content examples in `src/content/`
2. Review the type definitions in `src/types/index.ts`
3. Look at the JSON schemas in `content/schemas/`

Happy contributing! 🚀
