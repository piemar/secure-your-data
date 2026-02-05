# Content Templates Reference

This document provides template examples and references for creating workshop content.

## Lab Template

### Basic Lab Structure

```typescript
import { WorkshopLabDefinition } from '@/types';

/**
 * Lab {N}: {Title}
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/{N}/README.md
 * {Brief description of what this lab covers}
 */
export const {labId}Definition: WorkshopLabDefinition = {
  id: 'lab-{kebab-case}',
  topicId: '{topic-id}',
  title: 'Lab {N}: {Descriptive Title}',
  description: '{20-200 character description}',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  estimatedTotalTimeMinutes: {number},
  tags: ['tag1', 'tag2'],
  prerequisites: [
    'Prerequisite 1',
    'Prerequisite 2'
  ],
  povCapabilities: ['POV-ID-1', 'POV-ID-2'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: '{lab-id}-step-{step-name}',
      title: 'Step Title',
      narrative: 'Context and explanation for this step',
      instructions: 'Clear instructions on what to do (minimum 20 chars)',
      estimatedTimeMinutes: {number},
      modes: ['lab', 'demo', 'challenge'],
      verificationId: '{verification.id}',
      points: {number},
      hints: [
        'Hint 1',
        'Hint 2'
      ]
    }
    // Minimum 3 steps
  ]
};
```

### Complete Example

See: `src/content/labs/lab-csfle-fundamentals.ts`

## Quest Template

### Basic Quest Structure

```typescript
import { WorkshopQuest } from '@/types';

/**
 * Quest: {Title}
 * 
 * Part of the {context} challenge.
 * {Brief description}
 */
export const {questId}Quest: WorkshopQuest = {
  id: 'quest-{kebab-case}',
  title: '{Quest Title}',
  storyContext: `{Markdown-formatted story context (minimum 50 chars)}
  
**The Situation:**
- Point 1
- Point 2

**Your Objective:**
{Objective description}`,
  objectiveSummary: '{20-200 character summary}',
  labIds: ['lab-id-1', 'lab-id-2'],
  requiredFlagIds: ['flag-id-1', 'flag-id-2'],
  optionalFlagIds: ['flag-id-3'],
  modes: ['challenge', 'lab'],
  labContextOverlays: [
    {
      labId: 'lab-id-1',
      introNarrative: 'Quest-specific introduction',
      outroNarrative: 'Quest-specific conclusion',
      stepNarrativeOverrides: {
        'step-id': 'Quest-specific step narrative'
      }
    }
  ]
};
```

### Complete Example

See: `src/content/quests/stop-the-leak.ts`

## Demo Script Template

### Basic Demo Script Structure (JSON)

```json
{
  "id": "demo-{kebab-case}",
  "title": "{Demo Script Title}",
  "povCapabilities": ["POV-ID-1", "POV-ID-2"],
  "beats": [
    {
      "id": "beat-1",
      "title": "Beat 1: {Title}",
      "narrative": "Scripted narrative describing the key 'wow' moment (minimum 50 chars)",
      "labId": "lab-{lab-id}",
      "stepId": "{step-id}",
      "durationMinutes": {number},
      "competitiveNotes": "Key differentiators and competitive comparison notes"
    }
  ]
}
```

### Complete Example

See: `src/content/demo-scripts/test-demo.json`

## JSON Schema Templates

For validation and IDE support, use the JSON schema templates:

- **Lab Config**: `templates/lab-config.template.json`
- **Quest Config**: `templates/quest-config.template.json`
- **Demo Script Config**: `templates/demo-script-config.template.json`

These schemas provide:
- Type validation
- Required field checking
- Pattern validation (IDs, formats)
- Examples

## Using Templates with Creation Scripts

The creation scripts (`create-lab.js`, `create-quest.js`, `create-demo-script.js`) generate files based on these templates. You can:

1. **Use the script** to generate the basic structure
2. **Edit the generated file** to add your content
3. **Validate** using the JSON schemas or validation scripts

## Template Variables

When creating content manually, use these variable placeholders:

- `{lab-id}`: Lab identifier (kebab-case, starts with `lab-`)
- `{quest-id}`: Quest identifier (kebab-case, starts with `quest-`)
- `{demo-id}`: Demo script identifier (kebab-case, starts with `demo-`)
- `{topic-id}`: Topic identifier (one of: query, encryption, analytics, etc.)
- `{pov-id}`: POV capability ID (e.g., `ENCRYPT-FIELDS`)
- `{step-id}`: Step identifier (`{lab-id}-step-{step-name}`)
- `{flag-id}`: Flag identifier (kebab-case, starts with `flag-`)

## Quick Reference

### Available Topics

- `query`
- `encryption`
- `analytics`
- `scalability`
- `operations`
- `data-management`
- `security`
- `integration`
- `deployment`

### Available Modes

- `demo`: Presentation mode
- `lab`: Hands-on mode
- `challenge`: Story-driven quest mode

### Difficulty Levels

- `beginner`
- `intermediate`
- `advanced`

## Validation

After creating content, validate it:

```bash
# Validate structure and references
node scripts/validate-content.js

# Check quality and conventions
node scripts/lint-content.js
```

## Registration

Register new content:

```bash
# Auto-register (dry run first)
node scripts/register-content.js --dry-run=true

# Register specific file
node scripts/register-content.js --file=src/content/labs/lab-new.ts --type=lab

# Auto-discover and register all new content
node scripts/register-content.js
```

## Next Steps

1. Review `Docs/CONTENT_STANDARDS.md` for detailed guidelines
2. Check `Docs/CONTENT_CREATOR_QUICK_START.md` for workflow
3. Look at existing content for examples
4. Use creation scripts to get started quickly
