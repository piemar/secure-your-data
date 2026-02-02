
# Plan: Fix Editor Height Distribution and Lab Consistency Audit

## Problem Summary

From your screenshot and the code analysis, I can see that:
1. **Editor 2 (Terminal) is nearly hidden** - takes only a tiny strip at the bottom
2. The dynamic height calculation (`Math.max(150, Math.min(500, lineCount * lineHeight + 16))`) causes short terminal blocks to get minimal height
3. When Editor 1 is large (many lines), it pushes Editor 2 out of view

## Root Cause

In `InlineHintEditor.tsx` (lines 233-242), the height calculation is based purely on line count:

```text
calculatedHeight = Math.max(150, Math.min(500, lineCount * lineHeight + 16))
```

For a 5-line terminal block: `5 * 19 + 16 = 111px` -> clamped to `150px`
For a 40-line .cjs file: `40 * 19 + 16 = 776px` -> clamped to `500px`

This means Editor 1 gets 500px and Editor 2 gets 150px, which is a 77%/23% split - not the 50/50 you want.

---

## Solution: Equal Height Distribution for 2-Block Pattern

### Option A: 50/50 Split with Scroll (Recommended)

For steps with exactly 2 code blocks, split the available height equally between them. Each editor scrolls internally if needed.

**Implementation Approach:**
1. In `StepView.tsx`, detect when a step has exactly 2 code blocks
2. Pass an `equalSplit` prop to `InlineHintEditor`
3. When `equalSplit` is true, use `50%` height with CSS flex instead of calculated pixel height
4. Each editor scrolls internally if content exceeds its half

**Resulting Layout:**
```text
+--------------------------------------------------+
| Editor 1: createKey.cjs (50% height, scrollable) |
| [Guided] [Challenge] [Expert]  10/10pts  [Copy]  |
|--------------------------------------------------|
| const { MongoClient, ClientEncryption } = ...    |
| const { fromSSO } = require("@aws-sdk/...");     |
| ...                                  (scrollable)|
+==================================================+
| Editor 2: Terminal (50% height, scrollable)      |
|                                           [Copy] |
|--------------------------------------------------|
| # First, install dependencies:                   |
| npm install mongodb mongodb-client-encryption    |
| node createKey.cjs                               |
| # Expected Output:                               |
+--------------------------------------------------+
```

### Option B: Minimum Height Guarantee for Terminal

Guarantee the terminal block always gets at least 200px (or 30% of container), while Editor 1 gets the rest.

---

## Lab Consistency Audit

I audited all 3 labs for the 2-block pattern. Here's the current state:

### Lab 1 (CSFLE) - 8 Steps

| Step | Block 1 | Block 2 | Pattern | Status |
|------|---------|---------|---------|--------|
| l1s1 | Terminal - AWS CLI (skeleton) | - | A: CLI only | Consistent |
| l1s2 | AWS CLI - Put Key Policy (skeleton) | - | A: CLI only | Consistent |
| l1s3 | mongosh (skeleton) | - | A: mongosh only | Consistent |
| l1s5 | createKey.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l1s5verify | mongosh | - | A: mongosh only | Consistent |
| l1s6 | testCSFLE.cjs (no skeleton) | Terminal - Run | B: File + Run | Reference step |
| l1s7 | app.js (no skeleton) | Terminal - Run | B: File + Run | Reference step |

### Lab 2 (QE) - 4 Steps

| Step | Block 1 | Block 2 | Pattern | Status |
|------|---------|---------|---------|--------|
| l2s1 | createQEDeks.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l2s2 | createQECollection.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l2s3 | insertQEData.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l2s4 | queryQERange.cjs (no skeleton) | Terminal - Run | B: File + Run | Reference step |

### Lab 3 (Right to Erasure) - 4 Steps

| Step | Block 1 | Block 2 | Pattern | Status |
|------|---------|---------|---------|--------|
| l3s1 | migrateToCSFLE.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l3s2 | multiTenantIsolation.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l3s3 | rotateCMK.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |
| l3s4 | cryptoShred.cjs (skeleton) | Terminal - Run | B: File + Run | Consistent |

**Audit Result**: All labs follow the expected patterns consistently. No restructuring needed in lab data files.

---

## Technical Implementation

### File 1: `src/components/labs/StepView.tsx`

**Change**: Pass block count info to enable 50/50 split

```typescript
// In the code blocks render section (~line 756)
const isTwoBlockPattern = currentStep.codeBlocks?.length === 2;

// Pass to InlineHintEditor
<InlineHintEditor
  // ... existing props
  equalHeightSplit={isTwoBlockPattern}
  totalBlocks={currentStep.codeBlocks?.length || 1}
  blockIndex={idx}
/>
```

### File 2: `src/components/labs/InlineHintEditor.tsx`

**Change 1**: Add new props

```typescript
interface InlineHintEditorProps {
  // ... existing props
  equalHeightSplit?: boolean;
  totalBlocks?: number;
  blockIndex?: number;
}
```

**Change 2**: Update height calculation

```typescript
// Current (line 233-242):
const calculatedHeight = Math.max(150, Math.min(500, lineCount * lineHeight + 16));

// New logic:
const lineCount = displayCode.split('\n').length;
const paddingVertical = 16;

// For 2-block patterns: each block gets equal height within a container
// For single blocks or more: use line-based calculation
let calculatedHeight: number;

if (equalHeightSplit && totalBlocks === 2) {
  // Each block gets minimum 200px, max determined by container
  // The parent container will handle the 50/50 split via CSS
  calculatedHeight = Math.max(200, Math.min(350, lineCount * lineHeight + paddingVertical));
} else {
  calculatedHeight = Math.max(150, Math.min(500, lineCount * lineHeight + paddingVertical));
}
```

**Alternative approach** (simpler): Use CSS flex-1 with min-height

```typescript
// In the Editor container div
<div 
  className={cn(
    "flex-shrink-0 relative",
    equalHeightSplit && "flex-1 min-h-[200px]"
  )} 
  ref={containerRef}
>
  <Editor
    height={equalHeightSplit ? "100%" : `${calculatedHeight}px`}
    // ...
  />
</div>
```

### File 3: `src/components/labs/StepView.tsx` - Container Update

**Change**: Wrap code blocks in a flex container that distributes height equally

```typescript
// Around line 756, wrap the code blocks mapping in a container
<div className={cn(
  "flex flex-col gap-2",
  currentStep.codeBlocks?.length === 2 && "h-full"
)}>
  {currentStep.codeBlocks.map((block, idx) => {
    const isTwoBlockPattern = currentStep.codeBlocks.length === 2;
    
    return (
      <div 
        key={idx} 
        className={cn(
          "flex flex-col flex-shrink-0",
          isTwoBlockPattern && "flex-1 min-h-0"  // Equal distribution
        )}
      >
        {/* Editor header */}
        {/* InlineHintEditor with height="100%" for two-block pattern */}
      </div>
    );
  })}
</div>
```

---

## Expected Visual Result

### Before (Current State)
```text
+--------------------------------------------------+
| createKey.cjs                [Guided][Challenge] |
|--------------------------------------------------|
| (40+ lines of code taking 500px)                 |
|                                                  |
|                                                  |
+==================================================+
| Terminal - Run the script                 [Copy] |
|--------------------------------------------------|
| (5 lines squished into 150px - barely visible)   |
+--------------------------------------------------+
```

### After (50/50 Split)
```text
+--------------------------------------------------+
| createKey.cjs                [Guided][Challenge] |
|--------------------------------------------------|
| const { MongoClient, ClientEncryption } = ...    |
| const { fromSSO } = require("@aws-sdk/...");     |
|                                     (scrollable) |
+==================================================+
| Terminal - Run the script                 [Copy] |
|--------------------------------------------------|
| # First, install dependencies:                   |
| npm install mongodb mongodb-client-encryption    |
| node createKey.cjs                               |
| # Expected Output:                    (equal ht) |
+--------------------------------------------------+
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `StepView.tsx` | Add flex container for 2-block pattern with equal height distribution |
| `StepView.tsx` | Pass `equalHeightSplit` prop to InlineHintEditor |
| `InlineHintEditor.tsx` | Add `equalHeightSplit` prop to interface |
| `InlineHintEditor.tsx` | Use `height="100%"` and `flex-1` when equal split is enabled |
| Lab data files | No changes needed - all labs already follow consistent patterns |

---

## Verification Checklist

After implementation:
1. Navigate to Lab 1 Step 4 (createKey.cjs + Terminal)
2. Verify both editors are visible with approximately equal height
3. Verify scrolling works within each editor
4. Test on Lab 2 Step 1 to confirm the same behavior
5. Check single-block steps (Lab 1 Step 1) still work correctly
6. Verify mobile responsive behavior
