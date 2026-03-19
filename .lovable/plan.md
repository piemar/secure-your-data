

# Fix: Replace "Answer Sheet" Skeletons with Interactive Fill-in-the-Blank System

## The Problem
The current skeletons are essentially **answer sheets** — most of the working code is already written. Mission 1 shows the full `find()` query; missions 7, 8, 10, 11 are near-complete reference implementations. Missions 12-19 have no skeleton at all (generic 2-line stub). Attendees have nothing meaningful to do.

## The Solution: Three-Tier Difficulty Skeletons with Blanks

The types already define `MissionSkeleton` with `guided`, `challenge`, and `expert` variants plus `InlineHint[]` — but none of it is implemented. We'll build this out fully.

### How Each Difficulty Works

- **Guided**: Full structure visible, but key values replaced with `___BLANK___` markers (e.g., `createIndex({ ___BLANK___ })`) plus heavy comment hints. Attendees fill in 3-5 blanks per mission.
- **Challenge**: Less scaffolding — only step comments and empty function bodies. Attendees write 50-70% of the code. Fewer hints available.
- **Expert**: Just the mission objective as a comment and an empty editor. Write everything from scratch. No hints.

### Difficulty Selector UI
- Add a 3-button selector on the mission briefing screen (before "BEGIN MISSION")
- Shows difficulty name, description, and hint count
- Defaults to player's `preferredDifficulty` or "guided"
- Selection is saved to player profile

### Inline Hint System (the `?` markers)
- In Guided/Challenge modes, `___BLANK___` placeholders in the code have a `?` button in the editor gutter (or a floating button near the blank)
- Clicking reveals a progressive hint: first a nudge, then more specific, then the answer
- Each hint reveal deducts XP (default 25 per hint, shown in HUD)
- Hints are defined per-mission per-difficulty in the skeleton data

## Technical Changes

### 1. Replace `mission-skeletons.ts` → new `mission-skeletons-v2.ts`
- Export `MISSION_SKELETONS_V2: Record<string, MissionSkeleton>` using the existing type
- Each mission gets 3 skeleton strings + hint arrays for guided/challenge
- Example for Mission 1 (Phantom Index):
  - **Guided**: Shows the `find()` query but `createIndex({ ___BLANK___ })` — attendee fills in `status: 1, category: 1, timestamp: 1`
  - **Challenge**: Shows step comments only, attendee writes both the query and the index
  - **Expert**: Just `// Create an optimal compound index for the given query pattern`

### 2. Rewrite all 19 mission skeletons
- Every mission gets meaningful blanks at the right difficulty level
- Guided has ~3-5 blanks, Challenge has ~1-2 structural hints, Expert is near-empty

### 3. Add `DifficultySelector` component
- 3 cards (Guided/Challenge/Expert) with icons, descriptions, hint counts
- Shown on briefing screen before "BEGIN MISSION"
- Stores selection in game store

### 4. Update `MissionPage.tsx`
- Load skeleton based on selected difficulty instead of flat `MISSION_SKELETONS[id]`
- Track hints used and XP penalties in player state
- Add hint reveal UI (button near `___BLANK___` markers or in objective panel)

### 5. Update `HUDBar.tsx`
- Show "Hints: X used (−Y XP)" indicator

### 6. Update validation
- Validation rules stay the same (they check for correct patterns regardless of difficulty)
- Blanks are just starting points — the regex validators confirm the final code is correct

## File Changes Summary
| File | Action |
|------|--------|
| `src/lib/mission-skeletons.ts` | Rewrite with 3-tier skeletons + hints for all 19 missions |
| `src/components/DifficultySelector.tsx` | New — 3-card selector component |
| `src/pages/MissionPage.tsx` | Load skeleton by difficulty, add hint UI, track hint XP |
| `src/components/HUDBar.tsx` | Add hints-used indicator |
| `src/lib/game-store.ts` | Add `setPreferredDifficulty()` helper |

