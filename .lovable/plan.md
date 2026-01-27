
# Workshop UX Improvement Plan

## Overview
This plan addresses multiple UX issues identified while simulating a workshop attendee experience, with the primary focus on fixing the output panel scroll issue and improving overall information architecture.

## Problem Summary

### Primary Issue: Output Panel Scrolling
The Output panel has a fixed `max-h-64` (256px) height, forcing users to scroll to see full command output. This is particularly problematic for steps like "Create CMK" where the AWS response includes important metadata.

### Secondary Issues Identified
1. **Missing Step Context**: The `hints`, `tips`, `understandSection`, `doThisSection`, and `troubleshooting` data from step definitions are not displayed
2. **No Exercise UI**: The `exercises` array is defined but not rendered
3. **React Warning**: Console shows ref warning for Monaco Editor
4. **Step Navigation**: Step circles are small; no preview of step content on hover

---

## Implementation Plan

### Phase 1: Fix Output Panel Height (Primary Fix)

**File**: `src/components/labs/StepView.tsx`

**Changes**:
1. Remove fixed `max-h-64` constraint on the output panel
2. Use a dynamic height that expands to fill available space (up to 50% of viewport)
3. Add a resizable splitter between code editor and output panel
4. When output is open, allocate more space to it since that's the user's focus

```text
Before:
+------------------+
|     Header       |
+------------------+
|                  |
|   Code Editor    | (flex-1, takes all space)
|   (large)        |
|                  |
+------------------+
| Output (256px)   | <- Fixed, requires scroll
+------------------+
|     Footer       |
+------------------+

After:
+------------------+
|     Header       |
+------------------+
|   Code Editor    |
|   (auto-shrinks) |
+==================+ <- Resizable boundary
|                  |
|   Output Panel   | 
|  (expands fully) | <- Shows full content
|                  |
+------------------+
|     Footer       |
+------------------+
```

### Phase 2: Add Context Drawer/Panel for Tips and Hints

**File**: `src/components/labs/StepView.tsx`

**Changes**:
1. Add an Info button that opens a slide-out drawer or modal
2. Display `understandSection`, `doThisSection`, `hints`, `tips`, and `troubleshooting`
3. Use clear visual hierarchy with icons

**Content Structure**:
- **Understand**: What this step does (understandSection)
- **Do This**: Checklist of actions (doThisSection)
- **Hints**: Expandable hints for stuck users
- **Troubleshooting**: Common issues and fixes
- **Pro Tips**: SA tips for advanced users

### Phase 3: Add Step Preview on Hover

**File**: `src/components/labs/StepView.tsx`

**Changes**:
1. Wrap step navigation circles with Tooltip
2. Show step title, estimated time, and completion status on hover
3. Add keyboard navigation support (arrow keys to move between steps)

### Phase 4: Fix Monaco Editor Ref Warning

**File**: `src/components/labs/StepView.tsx`

**Changes**:
1. Remove any ref forwarding to the Monaco Editor component
2. Wrap Monaco in a stable container div with proper keys

---

## Technical Implementation Details

### Output Panel Improvements (Priority 1)

Current code (lines 436-448):
```tsx
<CollapsibleContent>
  <motion.div
    className="px-6 py-4 bg-[hsl(220,20%,6%)] border-t border-border max-h-64 overflow-auto"
  >
```

New approach:
```tsx
<CollapsibleContent className="flex-shrink-0">
  <motion.div
    className="px-6 py-4 bg-[hsl(220,20%,6%)] border-t border-border overflow-auto"
    style={{ maxHeight: outputOpen ? 'calc(40vh)' : '0' }}
  >
```

Alternative: Use `react-resizable-panels` (already installed) to create a proper split view.

### Context Panel Implementation (Priority 2)

Add a new component `StepContextDrawer`:
```tsx
interface StepContextDrawerProps {
  understandSection?: string;
  doThisSection?: string[];
  hints?: string[];
  tips?: string[];
  troubleshooting?: string[];
}
```

Trigger with an "Info" button next to "Check My Progress".

### Step Tooltip Enhancement (Priority 3)

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.button className="step-circle">
        {index + 1}
      </motion.button>
    </TooltipTrigger>
    <TooltipContent>
      <div>
        <p className="font-medium">{step.title}</p>
        <p className="text-xs text-muted-foreground">{step.estimatedTime}</p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/labs/StepView.tsx` | Output panel height, add context drawer trigger, fix Monaco ref, enhance step tooltips |
| (New) `src/components/labs/StepContextDrawer.tsx` | New component for hints/tips/troubleshooting |

---

## Summary of Improvements

1. **Output Panel**: Remove height constraint, use dynamic sizing (40-50vh max)
2. **Context Access**: Add Info drawer with hints, tips, troubleshooting
3. **Step Navigation**: Add tooltips with step previews
4. **Code Quality**: Fix React ref warning

## Expected Outcome
Workshop attendees will be able to:
- See full command output without scrolling in most cases
- Access contextual help (hints, tips) without leaving the step
- Preview step content before navigating
- Have a cleaner, more focused learning experience
