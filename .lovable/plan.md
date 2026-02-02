
# Plan: Lab 1 Consistency and UI Fixes

## Overview

Fix Lab 1 to match the quality and consistency of Lab 2 by addressing:
1. Empty section rendering below code blocks without skeletons
2. Step 4 (now visible as Step 5 in the UI based on step indices) with multiple code blocks appearing cluttered
3. Steps 6 and 7 having useless skeletons - convert them to "Summary/Demo" steps
4. Ensure consistent hint coverage across all interactive steps

---

## Issues Identified

| Step | ID | Issue | Fix |
|------|----|-------|-----|
| Step 1 | l1s1 | Works correctly | None |
| Step 2 | l1s2 | Works correctly | None |
| Step 3 | l1s3 | Works correctly | None |
| Step 4 | l1s4 | Renamed as l1s5 - has 3 code blocks, first block has NO skeleton but footer shows | Only show Challenge Mode footer for blocks that HAVE skeletons |
| Step 5 | l1s5verify | Demo step, no skeleton needed | Mark as reference step (no Challenge Mode) |
| Step 6 | l1s6 | Skeleton is just 2-line comment - not useful | Convert to Demo/Reference step (remove skeleton) |
| Step 7 | l1s7 | Skeleton is just 1 line - not useful | Convert to "Summary" step (remove skeleton, add summary tag) |

---

## Part 1: Fix StepView.tsx - Only Show Footer for Blocks with Skeletons

**File:** `src/components/labs/StepView.tsx`

**Current Problem:** The Challenge Mode footer renders for ALL code blocks if ANY block in the step has a skeleton.

**Solution:** Check per-block whether it has a skeleton, not just step-level.

```typescript
// Current logic (line ~820):
{hasSkeleton && !isSolutionRevealed && (
  <div className="flex-shrink-0 px-2 sm:px-4 py-1.5...">
    {/* Footer content */}
  </div>
)}

// Fix: Check THIS block's skeleton, not step-level
{hasAnySkeleton(block) && !isSolutionRevealed && (
  <div className="flex-shrink-0 px-2 sm:px-4 py-1.5...">
    {/* Footer content */}
  </div>
)}
```

Also update the Solution Revealed Banner similarly.

---

## Part 2: Convert Lab 1 Steps 6 & 7 to Reference/Summary Steps

**File:** `src/components/labs/Lab1CSFLE.tsx`

### Step 6 (l1s6) - "Test CSFLE: Insert & Query with Encryption"

This is a demonstration step - the user copies a large script, runs it, and observes the output. It's not suitable for fill-in-the-blank because:
- The skeleton is just 2 lines: `// Create testCSFLE.cjs with CSFLE-enabled and standard clients...`
- The actual code is 100+ lines - not practical for blanks
- It's meant to demonstrate the concept, not test understanding

**Change:**
- Remove the `skeleton` property from the code block
- Keep the full code visible (Read-only/Demo mode by default)
- Add a `isDemo: true` or just remove skeleton entirely

### Step 7 (l1s7) - "The Complete Application"

This is a summary/reference step - shows the final clean code. Not for challenge mode.

**Change:**
- Remove the `skeleton` property (`skeleton: '// Full application structure'`)
- Keep the full code visible
- This step is a reference, not a challenge

---

## Part 3: Add Visual Indicator for "Reference/Demo" Steps

To make it clear that some steps are for reference/demonstration rather than challenge mode, we can add a visual badge.

**Option A:** Just remove skeletons (simplest) - steps without skeletons automatically show full code.

**Option B:** Add a step-level flag like `isReference: true` that displays a "Reference" badge instead of Challenge Mode controls.

Recommend **Option A** for simplicity - removing skeletons naturally hides Challenge Mode UI.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/labs/StepView.tsx` | Modify | Fix footer/banner to only show for blocks WITH skeletons |
| `src/components/labs/Lab1CSFLE.tsx` | Modify | Remove useless skeletons from Steps 6 & 7 |

---

## Technical Details

### StepView.tsx Changes (Lines ~820-915)

**Change 1:** Footer check (around line 820)
```typescript
// Before:
{hasSkeleton && !isSolutionRevealed && (

// After - check this specific block:
{hasAnySkeleton(block) && !isSolutionRevealed && (
```

**Change 2:** Solution Revealed Banner (around line 905)
```typescript
// Before:
{hasSkeleton && isSolutionRevealed && !alwaysShowSolutions && showSolution[blockKey] && (

// After:
{hasAnySkeleton(block) && isSolutionRevealed && !alwaysShowSolutions && showSolution[blockKey] && (
```

### Lab1CSFLE.tsx Changes

**Step 6 (l1s6)** - Around line 882:
Remove the skeleton property:
```javascript
// Before:
skeleton: `// Create testCSFLE.cjs with CSFLE-enabled and standard clients
// Compare the output when querying encrypted vs non-encrypted`

// After:
// Remove skeleton property entirely - code shows in full by default
```

**Step 7 (l1s7)** - Around line 990:
Remove the skeleton property:
```javascript
// Before:
skeleton: `// Full application structure`

// After:
// Remove skeleton property entirely
```

---

## Expected Outcome

After these changes:

1. **Lab 1 Step 4 (Generate DEKs)**: 
   - "Install Deps" block shows WITHOUT Challenge Mode footer (no skeleton)
   - "createKey.cjs" block shows WITH Challenge Mode footer (has skeleton)
   - "Run command" block shows WITHOUT Challenge Mode footer (no skeleton)

2. **Lab 1 Step 6 (Test CSFLE)**:
   - Shows full code immediately (no Challenge Mode)
   - Clear that it's a demo/reference step

3. **Lab 1 Step 7 (Complete Application)**:
   - Shows full code immediately (no Challenge Mode)  
   - Acts as a summary/reference

4. **No more empty sections** below code blocks

---

## Visual Representation

```text
BEFORE (Step 4):
┌─────────────────────────────────────────┐
│ 1. Terminal: Install Deps  ⏱️ 8 min     │
├─────────────────────────────────────────┤
│ npm install mongodb...                  │
├─────────────────────────────────────────┤
│ [Guided] [Challenge] [Expert]  Score: X │  ← WRONG: No skeleton
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 2. createKey.cjs  🔒 Guided (10pts)     │
├─────────────────────────────────────────┤
│ const { MongoClient, ____ } = ...       │
├─────────────────────────────────────────┤
│ [Guided] [Challenge] [Expert]  Score: X │  ← CORRECT: Has skeleton
└─────────────────────────────────────────┘

AFTER (Step 4):
┌─────────────────────────────────────────┐
│ 1. Terminal: Install Deps  ⏱️ 8 min     │
├─────────────────────────────────────────┤
│ npm install mongodb...                  │
└─────────────────────────────────────────┘  ← Clean: No footer
┌─────────────────────────────────────────┐
│ 2. createKey.cjs  🔒 Guided (10pts)     │
├─────────────────────────────────────────┤
│ const { MongoClient, ____ } = ...       │
├─────────────────────────────────────────┤
│ [Guided] [Challenge] [Expert]  Score: X │
└─────────────────────────────────────────┘
```
