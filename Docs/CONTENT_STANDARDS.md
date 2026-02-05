# Content Standards

This document defines the standards and best practices for creating workshop content.

## Lab Standards

### ID Naming Convention

- **Format**: `lab-{kebab-case-description}`
- **Examples**: 
  - ✅ `lab-csfle-fundamentals`
  - ✅ `lab-queryable-encryption`
  - ❌ `lab1` (too generic)
  - ❌ `CSFLE-Lab` (wrong case, no prefix)

### Title Standards

- **Format**: `Lab {N}: {Descriptive Title}`
- **Length**: 10-100 characters
- **Examples**:
  - ✅ `Lab 1: CSFLE Fundamentals with AWS KMS`
  - ✅ `Lab 2: Queryable Encryption & Range Queries`
  - ❌ `CSFLE` (too short)
  - ❌ `Lab: A Comprehensive Guide to Client-Side Field Level Encryption with AWS Key Management Service Integration` (too long)

### Description Standards

- **Length**: 20-200 characters
- **Should**: Clearly explain what the lab teaches
- **Should**: Be compelling and action-oriented
- **Should NOT**: Contain TODO/FIXME comments
- **Examples**:
  - ✅ `Master the rollout of KMS infrastructure and Client-Side Field Level Encryption`
  - ✅ `Implement Queryable Encryption with range queries on salary and equality queries on taxId`
  - ❌ `Learn encryption` (too vague)
  - ❌ `TODO: Add description` (unfinished)

### Step Requirements

- **Minimum**: 3 steps per lab
- **Maximum**: 15 steps (consider splitting if more)
- **Each step must have**:
  - Unique ID: `{lab-id}-step-{step-name}`
  - Clear title
  - Narrative (context and explanation)
  - Instructions (what to do, minimum 20 characters)
  - Estimated time
  - Modes array (at least 1 mode)

### Mode Coverage

- **Minimum**: Support 2 modes for reusability
- **Recommended**: Support all 3 modes (`demo`, `lab`, `challenge`)
- **Mode-specific considerations**:
  - **Demo Mode**: Skip setup steps, highlight "wow" moments
  - **Lab Mode**: Include all steps with full instructions
  - **Challenge Mode**: Include story context, verification steps

### POV Capability Mapping

- **Required**: At least 1 POV capability per lab
- **Format**: Array of POV IDs (e.g., `['ENCRYPT-FIELDS', 'FLE-QUERYABLE-KMIP']`)
- **Reference**: Must reference proof exercise in comments
- **Example**:
  ```typescript
  // Source PoV proof exercise
  // See Docs/pov-proof-exercises/proofs/46/README.md
  povCapabilities: ['ENCRYPT-FIELDS', 'ENCRYPTION']
  ```

### Proof Exercise References

- **Required**: Reference the proof exercise in comments
- **Format**: `proofs/{N}/README.md`
- **Location**: In lab file header or near `povCapabilities`
- **Example**:
  ```typescript
  /**
   * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md
   * This lab covers Client-Side Field Level Encryption fundamentals.
   */
  ```

## Quest Standards

### ID Naming Convention

- **Format**: `quest-{kebab-case-description}`
- **Examples**:
  - ✅ `quest-stop-the-leak`
  - ✅ `quest-harden-the-system`
  - ❌ `quest1` (too generic)

### Story Context Standards

- **Length**: Minimum 50 characters
- **Should**: Explain the situation/problem
- **Should**: Describe the objective
- **Should**: Be compelling and story-driven
- **Format**: Markdown supported

### Lab Context Overlays

- **Purpose**: Customize lab narratives for quest context without duplicating labs
- **Use when**: Same lab appears in multiple quests with different contexts
- **Structure**:
  ```typescript
  labContextOverlays: [
    {
      labId: 'lab-csfle-fundamentals',
      introNarrative: 'Quest-specific introduction',
      outroNarrative: 'Quest-specific conclusion',
      stepNarrativeOverrides: {
        'step-id': 'Quest-specific step narrative'
      }
    }
  ]
  ```

## Demo Script Standards

### ID Naming Convention

- **Format**: `demo-{kebab-case-description}`
- **Examples**:
  - ✅ `demo-encryption-workshop`
  - ✅ `demo-query-capabilities`

### Beat Standards

- **Minimum**: 1 beat per script
- **Each beat must have**:
  - Unique ID: `beat-{N}`
  - Compelling title
  - Narrative describing the "wow" moment
  - Lab ID reference
  - Duration estimate
  - Competitive notes (key differentiators)

### Narrative Standards

- **Length**: Minimum 50 characters
- **Should**: Describe the key "wow" moment
- **Should**: Explain why this matters
- **Should**: Be presentation-ready

## Code Block Standards

### Syntax Validation

- **JavaScript/TypeScript**: Must be valid syntax
- **No TODOs**: Code blocks should be complete
- **Brace matching**: All braces must be closed
- **Testing**: Code should be tested before including

### Formatting

- Use proper indentation
- Include comments for complex logic
- Follow language-specific conventions

## Quality Checklist

Before submitting content, ensure:

- [ ] Lab ID follows naming convention
- [ ] Lab has minimum 3 steps
- [ ] All steps have narratives and instructions
- [ ] POV capabilities are mapped correctly
- [ ] Proof exercise is referenced
- [ ] Lab supports at least 2 modes
- [ ] Description is 20-200 characters
- [ ] No TODO/FIXME comments
- [ ] Validation passes: `node scripts/validate-content.js`
- [ ] Linting passes: `node scripts/lint-content.js`
- [ ] Content is registered in `contentService.ts`

## Common Mistakes to Avoid

1. **Too few steps**: Labs with less than 3 steps don't provide enough depth
2. **Missing modes**: Labs that only support 1 mode limit reusability
3. **No proof reference**: Makes it hard to verify alignment with PoV requirements
4. **Vague descriptions**: Users won't understand what they're learning
5. **Incomplete code**: Code blocks with TODOs confuse users
6. **Wrong topic**: Lab in wrong topic category breaks navigation
7. **Duplicate IDs**: Causes conflicts and breaks references

## Examples

See existing content for reference:
- **Lab Example**: `src/content/labs/lab-csfle-fundamentals.ts`
- **Quest Example**: `src/content/quests/stop-the-leak.ts`
- **Demo Script Example**: `src/content/demo-scripts/test-demo.json`
