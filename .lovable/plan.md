

# Lab 2 UI Restructure Plan

## Analysis Summary

After reviewing Lab 2 (987 lines) and StepView (1054 lines), I identified several UX issues:

### Current Problems

1. **Toolbar Redundancy**: There are TWO control rows:
   - Row 1: "Read-only mode (show solutions)" toggle in a separate strip
   - Row 2: "Guided | Challenge | Expert" difficulty selector + score in the editor footer
   
2. **Inconsistent Editor Patterns**: Lab 2 has 4 steps, each with 2 code blocks, but the pattern varies:
   - Step 1: `.cjs file` + `Terminal command` (correct)
   - Step 2: `.cjs file` + `Terminal command` (correct)
   - Step 3: `.cjs file` + `Terminal command` (correct)
   - Step 4: `.cjs file (150 lines!)` + `Terminal command` (very long main editor)

3. **Visual Gap**: The gap you noticed comes from the ResizablePanel stretching to fill space - the content-fit fix was applied but the overall layout still has dead zones.

4. **Long Code Blocks**: Step 4's `queryQERange.cjs` is ~150 lines - too much for a single skeleton. It overwhelms the learner.

---

## User's Requested Pattern

### Alternative A: CLI/mongosh Commands
```
┌────────────────────────────────────────┐
│ Editor 1: aws cli / mongosh command    │
│ (Interactive, with Challenge Mode)     │
├────────────────────────────────────────┤
│ Editor 2: NOT REQUIRED                 │
└────────────────────────────────────────┘
```

### Alternative B: Node.js Scripts
```
┌────────────────────────────────────────┐
│ Editor 1: .cjs file to create          │
│ (Interactive, with Challenge Mode)     │
├────────────────────────────────────────┤
│ Editor 2: Terminal command to run it   │
│ (Read-only, no Challenge Mode)         │
└────────────────────────────────────────┘
```

---

## Proposed Changes

### 1. Merge Toolbar into Single Row

Combine the "Read-only mode" toggle with the difficulty selector toolbar.

**Before (2 rows):**
```
┌─────────────────────────────────────────────────────────┐
│ [Read-only mode toggle] show solutions                  │  ← Row 1
├─────────────────────────────────────────────────────────┤
│ [filename.cjs]                          [Copy]          │
│ ...code...                                              │
├─────────────────────────────────────────────────────────┤
│ [Guided][Challenge][Expert]  Score: 10/10   [Solution]  │  ← Row 2
└─────────────────────────────────────────────────────────┘
```

**After (1 row - in editor header):**
```
┌─────────────────────────────────────────────────────────┐
│ [filename.cjs] [Guided|Challenge|Expert] Score:10/10   │
│ [Show Solutions] [Copy]                                 │
├─────────────────────────────────────────────────────────┤
│ ...code...                                              │
└─────────────────────────────────────────────────────────┘
```

Remove the separate "Read-only mode" row entirely. Use the "Show Full Solution" button as the mechanism to reveal solutions per-block.

### 2. Simplify Step 4 (queryQERange.cjs)

Current: 150-line script with 6 inline hint blanks.

Split into two smaller, focused sub-steps or use a more guided approach:
- **Part A**: Standard client query (shows Binary)
- **Part B**: QE-enabled client query (shows decrypted)

Alternatively, mark this as a "Reference/Demo" step (no skeleton) since the comparison is the learning goal, not fill-in-the-blanks.

### 3. Ensure Consistent 2-Block Pattern

Audit all Lab 2 steps to follow Alternative B pattern:
- Block 1: Interactive `.cjs` file (with skeleton if applicable)
- Block 2: Read-only terminal command (no skeleton, no challenge UI)

---

## Technical Implementation

### File: `src/components/labs/StepView.tsx`

#### Change 1: Remove separate Read-only toggle row (lines 738-752)

Delete the entire conditional block that renders the "Read-only mode" toggle strip:

```typescript
// DELETE this entire block
{hasSkeletons && (
  <div className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-1 border-b border-border bg-muted/20">
    <Switch ... />
    <Label ...>Read-only mode (show solutions)</Label>
  </div>
)}
```

#### Change 2: Move controls to editor header (lines 773-800)

Update the editor header to include difficulty selector inline:

```typescript
<div className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 border-b border-border">
  <div className="flex items-center justify-between gap-2">
    {/* Left: filename + difficulty selector */}
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span className="text-xs font-mono text-muted-foreground truncate">{block.filename}</span>
      
      {/* Inline difficulty selector (only for skeleton blocks) */}
      {hasSkeleton && !isSolutionRevealed && (
        <div className="flex gap-0.5 bg-background rounded p-0.5 border border-border">
          <button onClick={() => setTier('guided')} className={...}>Guided</button>
          <button onClick={() => setTier('challenge')} className={...}>Challenge</button>
          <button onClick={() => setTier('expert')} className={...}>Expert</button>
        </div>
      )}
      
      {/* Score display */}
      {hasSkeleton && !isSolutionRevealed && (
        <span className="text-xs">Score: {currentScore}/{maxPoints}</span>
      )}
    </div>
    
    {/* Right: Solution + Copy buttons */}
    <div className="flex items-center gap-1">
      {hasSkeleton && !isSolutionRevealed && (
        <Button variant="ghost" size="sm" onClick={revealSolution}>
          <Eye className="w-3 h-3" /> Solution (-5pts)
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        <Copy className="w-3 h-3" /> Copy
      </Button>
    </div>
  </div>
</div>
```

#### Change 3: Remove footer toolbar (lines 819-902)

Remove the entire "Simplified Challenge Mode Footer" since controls are now in the header.

### File: `src/components/labs/Lab2QueryableEncryption.tsx`

#### Change 4: Simplify Step 4

Option A: Mark as "Reference/Demo" step by removing the `skeleton` property - this will show the full solution and skip Challenge Mode UI entirely.

Option B: Keep skeleton but with fewer blanks (3-4 max) and add clear section comments.

Recommendation: Use Option A for Step 4 since its value is the side-by-side comparison demo, not fill-in-the-blanks.

---

## Updated Layout Visualization

### After Restructure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Lab 2 | Step 3 of 4: Insert Test Data                    ⏱️ 8 min    │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ insertQEData.cjs  [Guided|Challenge|Expert] 10/10  [👁 Solution]│ │
│ │                                                          [Copy]│ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 1  const { MongoClient } = require("mongodb");                  │ │
│ │ 2  const { fromSSO } = require("@aws-sdk/credential-providers");│ │
│ │ 3  ...                                                      [?] │ │
│ │ 4  const salaryKeyDoc = await ...findOne(______);           [?] │ │
│ │ ...                                                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Terminal - Run the script                                [Copy]│ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ node insertQEData.cjs                                           │ │
│ │ # Expected Output: Inserted 5 test documents...                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════ │
│ ▼ Output                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

Key improvements:
- Single-row header with all controls
- No separate "Read-only mode" toggle row
- Terminal block has no Challenge UI (read-only)
- Compact, scrollable layout

---

## Summary of Changes

| File | Change |
|------|--------|
| `StepView.tsx` | Remove "Read-only mode" toggle row (~15 lines) |
| `StepView.tsx` | Move difficulty selector + score to editor header (~30 lines) |
| `StepView.tsx` | Remove challenge mode footer block (~80 lines) |
| `Lab2QueryableEncryption.tsx` | Remove skeleton from Step 4 to make it a Reference step |

---

## Testing Checklist

1. Navigate through all 4 Lab 2 steps
2. Verify difficulty selector appears only on first editor (the `.cjs` file)
3. Verify terminal blocks are read-only with no challenge UI
4. Verify Step 4 shows full code immediately (Reference mode)
5. Verify hint markers work on Steps 1-3
6. Check mobile responsive behavior

