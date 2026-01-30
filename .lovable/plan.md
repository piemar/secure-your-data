
# Compact Lab Step Header Design

## Problem Analysis

The current lab step header uses approximately **272px** of vertical space before the code editor appears:

| Element | Height | Location |
|---------|--------|----------|
| Tab bar (Overview/Steps) | ~48px | LabViewWithTabs.tsx |
| Lab header (Lab 01, Title, Description, Atlas Capability) | ~80px | StepView.tsx |
| Business Value banner | ~44px | StepView.tsx |
| Step header (title, buttons) | ~64px | StepView.tsx |
| Read-only toggle | ~36px | StepView.tsx |
| **Total** | **~272px** | |

On smaller screens, this leaves minimal space for the actual code content.

---

## Proposed Solution: Single-Row Condensed Header

Redesign to use a **single compact header row** with essential info inline:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Lab 01 │ Basic │ Step 1/7: Create CMK (5min) │ ⏱️ │ ✓ Check │ ? Help │
└─────────────────────────────────────────────────────────────────────┘
│ [Read-only toggle]                                                  │
└─────────────────────────────────────────────────────────────────────┘
│                                                                     │
│                    CODE EDITOR (maximized)                          │
│                                                                     │
```

**Expected height reduction: ~120px saved** (from ~272px to ~152px)

---

## Implementation Details

### Changes to StepView.tsx

**1. Merge Lab Header + Step Header into single row**
- Remove full `labTitle` and `labDescription` text (available on Overview tab)
- Show only: `Lab XX` | Difficulty badge | `Step X/Y: [Step Title]` | Buttons
- Move Atlas Capability to a tooltip on hover

**2. Relocate Business Value**
- Move from permanent banner to:
  - Option A: Tooltip on an info icon
  - Option B: Part of the Help & Tips drawer content
  - Option C: Collapsible section that starts collapsed

**3. Inline step title with step counter**
- Instead of separate "Step 1/7" and step title rows
- Use: `Step 1/7: Create Customer Master Key (CMK)` 

**4. Condense buttons**
- Keep only: Check My Progress | Help & Tips
- Remove separate Info icon (merge into Help & Tips)

### New Compact Layout Structure

```tsx
{/* Compact Header - Single Row */}
<div className="flex items-center justify-between px-4 py-2 border-b">
  {/* Left: Lab info + Step info */}
  <div className="flex items-center gap-3">
    <span className="text-xs font-mono border px-2 py-0.5 rounded">
      Lab {labNumber}
    </span>
    {difficulty && <DifficultyBadge level={difficulty} size="sm" />}
    <div className="text-sm">
      <span className="text-muted-foreground">Step {n}/{total}:</span>
      <span className="font-medium ml-1">{stepTitle}</span>
      <span className="text-muted-foreground ml-2">⏱️ {time}</span>
    </div>
  </div>
  
  {/* Right: Actions */}
  <div className="flex items-center gap-2">
    <Button size="sm">Check</Button>
    <StepContextDrawer />
  </div>
</div>
```

### Atlas Capability & Business Value

Both will be accessible via the Help & Tips drawer:
- Add "Context" section at top of drawer
- Display: Atlas Capability badge, Business Value text
- This removes ~124px from always-visible header

---

## Visual Comparison

**Before (current):**
```
┌──────────────────────────────────────────────────────────────┐ 
│  📖 Overview    🔧 Steps (1/7)                  👑 Moderator │  48px
├──────────────────────────────────────────────────────────────┤
│  Lab 01  ● Basic                     Atlas Capability        │
│  CSFLE Fundamentals with AWS KMS    [Client-Side Field...]  │  80px
│  Master the rollout of KMS infrastructure...                 │
├──────────────────────────────────────────────────────────────┤
│  💡 Business Value: Protect PII at the application layer... │  44px
├──────────────────────────────────────────────────────────────┤
│  Create Customer Master Key (CMK)     Step 1/7  ✓ Check  ? │  64px
│  Create your Customer Master Key (CMK) in AWS KMS...        │
├──────────────────────────────────────────────────────────────┤
│  🔓 Read-only mode (show all solutions)                      │  36px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                      CODE EDITOR                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                        Total: ~272px header
```

**After (proposed):**
```
┌──────────────────────────────────────────────────────────────┐
│  📖 Overview    🔧 Steps (1/7)                  👑 Moderator │  48px
├──────────────────────────────────────────────────────────────┤
│  Lab 01 │ ● Basic │ Step 1/7: Create CMK (5min) │ ✓ │ 📖    │  40px
├──────────────────────────────────────────────────────────────┤
│  🔓 Read-only mode                                           │  28px
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                      CODE EDITOR                             │
│                     (much taller!)                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                        Total: ~116px header
```

**Space saved: ~156px** - significantly more room for code!

---

## Files to Modify

1. **`src/components/labs/StepView.tsx`**
   - Merge Lab header and Step header into single compact row
   - Remove Business Value permanent banner
   - Remove inline Atlas Capability display
   - Condense step title into step counter line

2. **`src/components/labs/StepContextDrawer.tsx`**
   - Add new "Context" section at top
   - Accept and display `businessValue` and `atlasCapability` props

3. **`src/components/labs/DifficultyBadge.tsx`** (optional)
   - Add a `size="sm"` variant for compact display

---

## Technical Notes

- The Overview tab already contains the full lab title, description, and detailed intro content
- Moving Business Value and Atlas Capability to Help & Tips keeps them accessible without cluttering the always-visible header
- The step description can be shown in a tooltip on step title hover for those who want more context
- Mobile will benefit most from this change due to limited viewport height
