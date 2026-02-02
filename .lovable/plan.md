# Lab 2 UI Restructure Plan - COMPLETED ✅

## Changes Made

### 1. Merged Toolbar into Single Row (StepView.tsx)
- Removed the separate "Read-only mode (show solutions)" toggle row
- Moved difficulty selector (Guided/Challenge/Expert) into the editor header
- Moved score display into the header
- Moved "Show Solution" button into the header alongside Copy button

### 2. Removed Footer Toolbar (StepView.tsx)
- Deleted the redundant challenge mode footer block (~84 lines removed)
- All controls now accessible in the compact header row

### 3. Made Lab 2 Step 4 a Reference Step (Lab2QueryableEncryption.tsx)
- Removed `skeleton` and `inlineHints` from Step 4's code block
- Step 4 now shows full solution immediately (Reference/Demo mode)
- The side-by-side QE vs Standard client comparison is the learning goal

## New Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [filename.cjs] [Guided|Challenge|Expert] 10/10pts [Solution] [Copy] │
├─────────────────────────────────────────────────────────────────┤
│ ...code with inline ? markers...                                │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Checklist
- [ ] Navigate through all 4 Lab 2 steps
- [ ] Verify difficulty selector appears only on first editor (the `.cjs` file)
- [ ] Verify terminal blocks are read-only with no challenge UI
- [ ] Verify Step 4 shows full code immediately (Reference mode)
- [ ] Verify hint markers work on Steps 1-3
- [ ] Check mobile responsive behavior
