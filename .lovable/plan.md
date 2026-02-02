
# Plan: Fix Black Empty Space Below Code Editors

## Problem Analysis

Looking at the screenshot and the code structure, the black area below the first editor is caused by **the ResizablePanel system allocating a fixed percentage of height** regardless of content size.

### Current Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (Lab info, step title)                       │
├─────────────────────────────────────────────────────┤
│ Read-only mode toggle (if hasSkeletons)             │
├─────────────────────────────────────────────────────┤
│ ResizablePanelGroup (vertical)                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ResizablePanel (Code Editor) - defaultSize=85%  │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ Code block (~10 lines)                    │   │ │
│ │ │ Footer (Guided/Challenge/Expert buttons)  │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │                                                 │ │
│ │ ◄── BLACK EMPTY SPACE (unused height) ──►      │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ ═══════════════ ResizableHandle ═══════════════════ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ResizablePanel (Output) - defaultSize=15%       │ │
│ │ "// Run 'Check My Progress' to see output"      │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Footer Navigation (step indicators)                 │
└─────────────────────────────────────────────────────┘
```

### Why This Happens

1. `ResizablePanel` (line 759) uses `defaultSize={outputOpen ? 50 : 85}` - it takes 85% of available height
2. The Monaco editor fills its container with `height="100%"` but has `scrollBeyondLastLine: false`
3. When code is short (10-15 lines), Monaco renders the lines then leaves the rest as empty dark background
4. The container doesn't shrink to fit content - it maintains the 85% panel size

### Lab 2 Comparison

Lab 2 doesn't show this as prominently because:
- Code blocks are typically 40-80 lines (fill more vertical space)
- Multiple code blocks stack, using more of the allocated panel height
- The visual gap is proportionally smaller

---

## Solution Options

### Option A: Content-Fit Editor Height (Recommended)

Change the Monaco editor to use a calculated height based on line count instead of `height="100%"`.

**Benefits:**
- Each code block sizes exactly to its content
- No wasted black space
- Scrolling happens in the outer container if multiple blocks overflow

**Implementation:**
```typescript
// In InlineHintEditor.tsx
const lineCount = displayCode.split('\n').length;
const calculatedHeight = Math.max(150, Math.min(500, lineCount * lineHeight + 32));

<Editor
  height={`${calculatedHeight}px`}  // Instead of "100%"
  ...
/>
```

### Option B: Collapse Empty Space with Flexbox

Keep `height="100%"` but change the code block wrapper to not force minimum heights when content is short.

**Implementation:**
```typescript
// In StepView.tsx line 771
// Change from:
<div key={idx} className="flex flex-col min-h-[200px] sm:min-h-[250px]">

// To:
<div key={idx} className="flex flex-col flex-shrink-0">
```

### Option C: Smart Panel Sizing

Dynamically calculate the defaultSize based on total code block content height.

---

## Recommended Approach: Option A + B Combined

1. **Remove fixed min-heights** from code block wrappers
2. **Calculate editor height** based on line count
3. **Set reasonable min/max bounds** (150px min, 500px max per editor)

---

## File Changes

| File | Change |
|------|--------|
| `src/components/labs/StepView.tsx` | Remove `min-h-[200px]` from code block wrapper |
| `src/components/labs/InlineHintEditor.tsx` | Calculate height based on line count |

---

## Detailed Implementation

### 1. InlineHintEditor.tsx - Dynamic Height

```typescript
// Add height calculation based on content
const lineCount = displayCode.split('\n').length;
const paddingVertical = 16; // 8px top + 8px bottom
const calculatedHeight = Math.max(
  150,  // minimum height
  Math.min(
    500, // maximum height per editor (enables scrolling within)
    lineCount * lineHeight + paddingVertical
  )
);

// Update Editor component
<Editor
  height={`${calculatedHeight}px`}  // Dynamic instead of "100%"
  ...
/>
```

### 2. StepView.tsx - Flexible Code Block Wrapper

```typescript
// Line 771: Remove fixed min-height, allow shrinking
<div key={idx} className="flex flex-col">
  {/* ... editor header ... */}
  <InlineHintEditor ... />
  {/* ... footer ... */}
</div>
```

### 3. Outer Container Adjustment

Change the code blocks container to enable scrolling when multiple blocks exceed panel height:

```typescript
// Line 760: Add overflow-auto to allow scrolling through multiple blocks
<div className="h-full flex flex-col overflow-auto">
```

---

## Expected Result

```
┌─────────────────────────────────────────────────────┐
│ Header (Lab info, step title)                       │
├─────────────────────────────────────────────────────┤
│ Read-only mode toggle                               │
├─────────────────────────────────────────────────────┤
│ ResizablePanelGroup                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Code block (~10 lines) - fits content exactly   │ │
│ │ Footer (Guided/Challenge/Expert)                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│     (Natural space - not black, just background)    │
│                                                     │
│ ═══════════════ ResizableHandle ═══════════════════ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Output Panel                                    │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Footer Navigation                                   │
└─────────────────────────────────────────────────────┘
```

---

## Verification Steps

After implementation:
1. Navigate to Lab 1 Step 1
2. Verify the code editor only takes as much height as needed for its content
3. Verify there's no excessive black space below the code
4. Test with longer code blocks (Lab 1 Step 5/6/7) to ensure they still look good
5. Test Lab 2 steps to ensure no regression
