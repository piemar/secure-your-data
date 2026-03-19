

# Fix Inline Hint Markers — Styling, State Bugs, and Reset

## Problems Identified

1. **Styling mismatch**: Markers use blue/amber colors (generic) instead of the project's green/neon terminal palette (#00ED64, #023430). They look like generic UI buttons, not part of the cyber-heist theme.

2. **"Show Hint" removes subsequent markers**: The `handleRevealAnswer` in `MissionPage.tsx` replaces the Nth `___BLANK___` globally by counting occurrences. But after an answer is filled in (replacing one `___BLANK___`), all subsequent blank indices shift down by one. So hint index 3 now points to what was blank index 4, causing markers to disappear or target wrong blanks.

3. **Reset doesn't restore hint states**: `handleResetCode` resets code and validation but never resets `hintStates`, `hintsUsedCount`, or `hintXpPenalty`. So after reset, markers stay in their revealed state.

## Plan

### 1. Restyle markers to match theme

**`InlineHintMarker.tsx`**: Replace blue/amber palette with the project's green terminal aesthetic:
- Unrevealed: dark green border (#00ED64), subtle green glow, `?` in neon green
- Hint-shown: amber/warning tone but with terminal styling (monospace, dark bg)
- Popover: use `bg-[#0a2218]` with `border-primary/30` to match editor chrome
- Buttons: match the existing `font-mono text-xs` terminal button style used elsewhere

**`src/index.css`**: Update `hint-glow` keyframes to use green (#00ED64) instead of blue.

### 2. Fix blank index tracking after answer fill

The core bug: `handleRevealAnswer` counts `___BLANK___` occurrences sequentially, but after one is replaced, indices shift.

**Fix in `MissionPage.tsx`**: Instead of counting by sequential occurrence, track blanks by a stable identifier. Replace the Nth-occurrence replacement with a **tagged blank** approach:
- When loading skeleton, do NOT change the format (keep `___BLANK___`)
- In `handleRevealAnswer`, instead of counting all remaining `___BLANK___` markers, count ALL positions (including already-answered ones) by iterating through the original skeleton to find the correct replacement offset
- Concretely: maintain a `Map<number, string>` of `answeredBlanks` (hintIndex -> answer text). When replacing, rebuild from original skeleton with all answered blanks applied at once, rather than incrementally replacing one at a time

### 3. Fix reset to restore all hint state

**`MissionPage.tsx` `handleResetCode`**: Add resets for:
- `setHintStates(new Map())`
- `setHintsUsedCount(0)`  
- `setHintXpPenalty(0)`
- `setHasValidated(false)`

## File Changes

| File | Change |
|------|--------|
| `src/components/InlineHintMarker.tsx` | Restyle to green terminal theme, use monospace fonts, dark bg popover |
| `src/index.css` | Update `hint-glow` to green, adjust marker-enter animation |
| `src/pages/MissionPage.tsx` | Fix blank replacement logic (use original skeleton + answered map), fix reset to clear all hint state |

