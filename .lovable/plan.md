

# Inline Editor Hint System — Secure-Your-Data Style

## What We're Building

Instead of the current separate hints panel on the left, hints will appear as **floating `?` buttons positioned directly on top of `___BLANK___` markers** inside the Monaco editor. Clicking a `?` opens a popover with two progressive actions: **Show Hint** (conceptual nudge, small XP penalty) and **Show Answer** (exact text, larger XP penalty). When the answer is revealed, the blank text in the editor is automatically replaced with the answer (highlighted green), and the `?` marker disappears.

This matches the pattern from secure-your-data where `InlineHintMarker` popovers float over blank positions tracked via `getScrolledVisiblePosition`.

## Key UX Changes

1. **No more side-panel hints** — remove the HINTS section from the left panel in MissionPage
2. **Floating `?` markers** — small circular buttons appear at each `___BLANK___` position in the editor, tracking scroll position
3. **Two-step reveal** — "Show Hint" first (conceptual, −15 XP), then "Show Answer" (exact text, −25 XP)
4. **Auto-fill on answer reveal** — when answer is shown, the `___BLANK___` text in the editor is replaced with the answer
5. **Marker disappears** — once user types over the blank or reveals the answer, the `?` goes away
6. **Animated markers** — spring animation on mount, color changes (blue → amber → green) based on state

## Technical Plan

### 1. Create `src/components/InlineHintMarker.tsx`
- Popover-based component (using existing shadcn Popover)
- Three states: unrevealed (`?` blue), hint revealed (`!` amber pulse), answer revealed (`✓` green)
- Two buttons: "Show Hint (−15 XP)" and "Show Answer (−25 XP)"
- After answer revealed, shows instruction: "Type `answer` in place of the blank"

### 2. Rewrite `src/components/CodeEditor.tsx`
- Track blank positions by scanning editor content for `___BLANK___` patterns and matching to hints by line number
- Use Monaco's `getScrolledVisiblePosition()` to convert line/column to pixel coordinates
- Track `scrollTop`/`scrollLeft` via `editor.onDidScrollChange` to reposition markers on scroll
- Overlay a `pointer-events-none` div with `pointer-events-auto` marker buttons at calculated positions
- When answer is revealed, replace the blank text in the editor value programmatically
- Remove the old `deltaDecorations`-based hint display (keep blank highlighting decorations)
- Add `revealedAnswers` tracking (separate from `revealedHints`)

### 3. Update `src/lib/types.ts`
- Keep `InlineHint` as-is but ensure `xpPenalty` is split into `hintPenalty` and `answerPenalty` (or compute from single value: hint = 60% of penalty, answer = 40%)

### 4. Update `src/pages/MissionPage.tsx`
- Remove the entire "Inline Hints Panel" section from the left panel
- Add `revealedAnswers` state (separate Set)
- Pass `onRevealHint` and `onRevealAnswer` callbacks to CodeEditor
- When answer is revealed, update the `code` state to replace `___BLANK___` with the answer text
- Adjust XP penalty calculation for two-tier reveals

### 5. Update `src/index.css`
- Add `.revealed-answer-green` class for Monaco decoration on filled-in answers
- Keep existing `blank-marker-highlight` for unrevealed blanks

## File Changes

| File | Action |
|------|--------|
| `src/components/InlineHintMarker.tsx` | New — popover hint marker component |
| `src/components/CodeEditor.tsx` | Rewrite — add blank position tracking, scroll-aware floating markers, auto-fill |
| `src/pages/MissionPage.tsx` | Update — remove side hints panel, add two-tier reveal state, auto-fill code |
| `src/index.css` | Update — add revealed-answer-green class |

