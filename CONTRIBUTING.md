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

### Step 1: Define the Lab Content

Create a new file in `src/content/labs/`:

```typescript
// src/content/labs/my-new-lab.ts
import { WorkshopLabDefinition } from '@/types';

export const myNewLab: WorkshopLabDefinition = {
  id: 'lab-my-new-lab',
  title: 'My New Lab',
  description: 'Description of what this lab teaches',
  topicId: 'encryption', // or another topic
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  prerequisites: ['lab-csfle-fundamentals'],
  steps: [
    {
      id: 'lab-my-new-lab-step-intro',  // Use consistent ID format: lab-{lab-name}-step-{step-name}
      title: 'Introduction',
      narrative: 'Story context for this step',
      instructions: 'What to do in this step',
      estimatedTimeMinutes: 10,
      verificationId: 'csfle.verifyKeyVaultIndex',
      points: 10,
      hints: [
        'Hint 1: Helpful guidance',
        'Hint 2: More specific help'
      ]
      // Note: Rich content (code blocks, skeletons, exercises, verification functions)
      // goes in stepEnhancements in the component, not here
    }
  ],
  modes: ['lab', 'demo'],  // Which modes this lab supports
  audience: 'all'  // or 'moderator', 'attendee'
};
```

**Important**: The content definition contains **structure and basic metadata**. Rich content (code blocks, skeletons, hints, exercises, verification functions) is preserved via `stepEnhancements` in the component (see Step 3).

### Step 2: Register in ContentService

Add your lab to `src/services/contentService.ts`:

```typescript
import { myNewLab } from '../content/labs/my-new-lab';

class InMemoryContentService {
  private labs: WorkshopLabDefinition[] = [
    lab1Definition,
    lab2Definition,
    lab3Definition,
    myNewLab  // Add here
  ];
}
```

### Step 3: Create the Lab Component

Create a component file in `src/components/labs/`:

```typescript
// src/components/labs/MyNewLab.tsx
import { LabRunner } from '@/labs/LabRunner';
import { useLab } from '@/context/LabContext';
import { createStepEnhancements } from '@/utils/labStepEnhancements';
import { Step } from '@/components/labs/LabViewWithTabs';

export function MyNewLab() {
  const { mongoUri, awsRegion, verifiedTools } = useLab();
  
  // Define steps with rich content (code blocks, skeletons, hints, exercises, verification)
  const labSteps: Step[] = [
    {
      id: 'lab-my-new-lab-step-intro',  // Must match step ID in content definition!
      title: 'Introduction',
      estimatedTime: '10 min',
      description: 'Step description',
      difficulty: 'basic',
      understandSection: 'What you need to understand...',
      doThisSection: [
        'Task 1: Do this',
        'Task 2: Do that'
      ],
      tips: [
        'TIP: Helpful guidance',
        'BEST PRACTICE: Recommended approach'
      ],
      codeBlocks: [
        {
          filename: 'script.js',
          language: 'javascript',
          code: `// Full code example
const example = "code";`,
          skeleton: `// Guided mode skeleton with blanks
const example = "_____";`,
          challengeSkeleton: `// Challenge mode skeleton`,
          expertSkeleton: `// Expert mode skeleton`,
          inlineHints: [
            {
              line: 1,
              blankText: '_____',
              hint: 'What should go here?',
              answer: 'code'
            }
          ]
        }
      ],
      hints: [
        'Hint 1: General guidance',
        'Hint 2: More specific help'
      ],
      onVerify: async () => {
        // Verification logic
        return { success: true, message: 'Verified!' };
      },
      exercises: [
        {
          id: 'quiz-1',
          type: 'quiz',
          title: 'Quiz Question',
          question: 'What is the answer?',
          options: [
            { id: 'a', label: 'Option A', isCorrect: false },
            { id: 'b', label: 'Option B', isCorrect: true }
          ],
          points: 10
        }
      ]
    }
  ];

  // Create stepEnhancements Map to preserve rich content
  const stepEnhancements = createStepEnhancements(labSteps);

  // Optional: Custom intro content (with architecture diagrams, etc.)
  const introContent = {
    whatYouWillBuild: [
      'Feature 1',
      'Feature 2'
    ],
    keyConcepts: [
      {
        term: 'Concept 1',
        explanation: 'Explanation...'
      }
    ],
    keyInsight: 'Key insight about this lab...',
    // Optional: architectureDiagram: <MyArchitectureDiagram />
  };

  return (
    <LabRunner
      labNumber={4}  // Next available lab number
      labId="lab-my-new-lab"  // Must match content definition ID!
      stepEnhancements={stepEnhancements}
      introContent={introContent}
      businessValue="Business value proposition"
      atlasCapability="MongoDB capability demonstrated"
    />
  );
}
```

**Key Points**:
- Step IDs in component **must match** step IDs in content definition
- Use `createStepEnhancements()` to extract rich content into a Map
- Pass `stepEnhancements` to `LabRunner` to preserve code blocks, skeletons, hints, exercises, verification
- Custom `introContent` is optional (defaults to content definition)

### Step 4: Register Component in Router

Add your lab component to `src/pages/Index.tsx`:

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
