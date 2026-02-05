# Content Creator Quick Start Guide

Welcome! This guide will help you quickly create new labs, quests, and demo scripts for the workshop framework.

## Prerequisites

- Node.js installed (v18+)
- Basic understanding of TypeScript/JavaScript
- Access to MongoDB PoV proof exercises (`Docs/pov-proof-exercises/`)

## Quick Start: Creating a Lab

### Step 1: Use the Creation Script

The easiest way to create a new lab is using the provided script:

```bash
node scripts/create-lab.js \
  --name="My New Lab" \
  --topic=encryption \
  --pov=ENCRYPT-FIELDS,ENCRYPTION \
  --modes=demo,lab,challenge \
  --proof=46
```

This will create a new lab file at `src/content/labs/lab-my-new-lab.ts` with the correct structure.

### Step 2: Fill in Lab Content

Open the generated file and:

1. **Update the description** - Make it clear and compelling (20-200 characters)
2. **Add prerequisites** - List what users need before starting
3. **Define steps** - Minimum 3 steps, each with:
   - Clear title
   - Narrative (context and explanation)
   - Instructions (what to do)
   - Estimated time
   - Modes (which modes this step applies to)
   - Verification ID (if you have a verification function)

### Step 3: Reference Proof Exercise

Add a comment referencing the proof exercise:

```typescript
// Source PoV proof exercise
// See Docs/pov-proof-exercises/proofs/46/README.md
```

### Step 4: Validate Your Lab

Run the validation script to check for errors:

```bash
node scripts/validate-content.js
```

Fix any errors before proceeding.

### Step 5: Register Your Lab

Register your lab in `contentService.ts`:

```bash
node scripts/register-content.js --file=src/content/labs/lab-my-new-lab.ts --type=lab
```

Or manually add the import and add it to the labs array in `src/services/contentService.ts`.

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

1. Create the lab using the creation script
2. Ensure `topicId` matches the existing topic
3. Add POV capabilities that the topic covers
4. Register the lab
5. The lab will automatically appear in topic-based navigation

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

- **Content Standards**: See `Docs/CONTENT_STANDARDS.md`
- **Templates**: See `Docs/CONTENT_TEMPLATES.md`
- **POV Capabilities**: See `src/content/pov-capabilities.ts`
- **Existing Examples**: Check `src/content/labs/lab-csfle-fundamentals.ts`

## Next Steps

1. Read `Docs/CONTENT_STANDARDS.md` for detailed guidelines
2. Review `Docs/CONTENT_TEMPLATES.md` for template examples
3. Look at existing labs for inspiration
4. Start creating!
