# Hint Placeholders, Skeleton, and Lab State – Refactor Plan

## 1. Current Pain Points

### 1.1 Unstable hint markers and placeholders

- **Line/column drift**: Hints are defined with `line` (1-based) and `blankText` (e.g. `"_________"`). Blank positions are computed by searching for `blankText` in the skeleton. If the skeleton is edited (extra line, different underscore length), markers misalign or disappear.
- **Position calculation**: Marker pixel position uses Monaco’s `getScrolledVisiblePosition` for non-terminal and a manual fallback for terminal/shell. Terminal fallback is fragile (scroll, line height, font), so markers can appear above/wrong line.
- **Multiple blanks per line**: `applyRevealedAnswersToCode` uses `lineText.replace(/_{5,}/, hint.answer)`, which always replaces the **first** run of 5+ underscores on that line. If a line has two blanks, revealing the second hint replaces the first blank.
- **Two sources of truth**: Editor content is derived from (1) skeleton + string replace for revealed answers in StepView, and (2) `findBlankPositions(code, hints)` in InlineHintEditor. If persisted content or sync logic shows different text (e.g. solution from previous session), blanks don’t match and markers break.

### 1.2 “Solution” and skeleton alignment (implemented)

- **Implemented**: Clicking **Solution** now shows the **skeleton with all blanks filled** from `inlineHints` (via `fillAllBlanksInSkeleton`), not `block.code`. The full solution displayed is exactly the same lines as the skeleton, with every placeholder replaced by its answer.
- **Authoring rule**: The skeleton should contain every line of the intended solution, with blanks where the user fills in; `inlineHints` must list each blank with matching `line`, `blankText`, and `answer`. Then the revealed "Solution" is that skeleton with all answers applied.
- _Obsolete._ Previously: keep the same skeleton structure and only **fill all placeholder blanks** with their answers (same as “reveal all hints”), so the user still sees the same layout with answers in place instead of a full swap to `block.code`.

### 1.3 State not persisted or reset correctly

- **Revealed state**: `revealedAnswers` and `revealedHints` (and `showSolution`) are React state only. They are **not** saved in `labWorkspaceStorage`, so when the user returns they see blanks again even if they had revealed hints.
- **Persisted editors**: Only `editors: Record<string, string>` (raw code per block) is persisted. That conflicts with “always show skeleton + revealed”: we either overwrite with skeleton+revealed (losing real edits) or keep persisted content (which can be solution/filled and break blanks).
- **Reset**: “Reset” currently only clears **current step** output (logs, console). It does **not** clear:
  - Editor content (skeleton vs solution)
  - Revealed hints/answers or “Solution” state
  - Any other per-step or per-lab progress state.

---

## 2. Alternative Approaches (How others define hints/skeletons)

### 2.1 Current approach: “Skeleton string + hint list”

- **Definition**: One skeleton string with literal blanks (e.g. `_________`) and an array of hints `{ line, blankText, hint, answer }`.
- **Pros**: Simple to author in TS/JSON.  
- **Cons**: Line numbers and `blankText` must stay in sync; string replace is ambiguous with multiple blanks per line; positioning depends on runtime text.

### 2.2 Structured blanks (single source of truth)

- **Definition**: Don’t infer blanks from the skeleton string. Define an ordered array of **blanks** with explicit positions and content:
  - Option A: `{ line, columnStart, length, answer, hint }` (column = 1-based character index).
  - Option B: `{ startOffset, endOffset, answer, hint }` (character offsets in the skeleton string).
- **Rendering**: Build the “display” string by taking the skeleton (with a single canonical placeholder per blank, e.g. `{{0}}`, `{{1}}`) and substituting `revealedAnswers[blankId] ?? placeholder`. Marker position: from `line`/`column` or from offset (then derive line/column from skeleton).
- **Pros**: One source of truth; no regex; multiple blanks per line work; positioning is deterministic.  
- **Cons**: Authors must keep skeleton placeholders and blank list in sync (could be validated or generated from a single spec).

### 2.3 Segment-based skeleton (like VS Code snippets)

- **Definition**: Skeleton is an array of segments: `[{ type: 'text', value: 'aws kms ' }, { type: 'blank', id: 0, answer: 'create-alias', hint: '...' }, { type: 'text', value: ' \\' }]`. Full code is the same segments with blanks filled.
- **Rendering**: Editor shows segments; blanks are inline widgets or styled ranges. No string search.
- **Pros**: No line/column drift; perfect for multiple blanks per line; “Solution” = render all segments with blank values.  
- **Cons**: Bigger change to authoring and to the editor (custom rendering or overlay).

### 2.4 Recommendation

- **Short term (stabilize current model)**: Keep skeleton string + hints but:
  - Replace by **blank identity**: when applying revealed answers, replace the **specific** `blankText` for that hint (or the nth occurrence of `_{2,}` on that line) instead of “first 5+ underscores”.
  - Persist and restore **revealed state** (see below).
  - “Solution” = set “all blanks revealed” and apply same logic (fill all placeholders), don’t switch to `block.code`.
- **Medium term (robust, same authoring surface)**: Move to **structured blanks** (2.2): skeleton uses unique placeholders (e.g. `{{0}}`, `{{1}}`); blanks array has `{ line, columnStart, length, answer, hint }` (or offsets). Editor content = substitute placeholders from revealed state; marker position from blank’s line/column only. No dependency on underscore length.

---

## 3. What Should Be Done (Concrete Plan)

### Phase A – Quick wins (current architecture)


| #   | Task                                 | Details                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **Solution = fill all placeholders** | When user clicks “Solution”, do **not** set `showSolution[blockKey]=true` and replace with `block.code`. Instead: set `revealedAnswers[blockKey]` to **all** hint indices for that block and keep showing the skeleton with `applyRevealedAnswersToCode(skeleton, hints, allIndices)`. Optionally set a “solution revealed” flag for scoring/UI only.                                                 |
| A2  | **Apply revealed by blank identity** | In `applyRevealedAnswersToCode`, replace the blank for **that** hint only: e.g. replace `hint.blankText` on the given line, or the nth occurrence of `_{2,}` on that line (n = index of hint among hints on same line). So multiple blanks per line get the correct answer.                                                                                                                           |
| A3  | **Persist revealed state**           | Extend `LabStepWorkspace` (e.g. in `labWorkspaceStorage.ts`) with `revealedAnswersByBlock?: Record<string, number[]>` and `showSolutionByBlock?: Record<string, boolean>` (and optionally `revealedHintsByBlock`). Save these when user reveals hint/answer or solution. On load, restore into StepView state so the same user sees the same revealed state when they return.                         |
| A4  | **Reset = full lab state**           | Add a “Reset lab” (or “Reset all”) that: (1) Clears `editableCodeByBlock` for that lab (or resets to skeleton + empty revealed). (2) Clears `revealedAnswers` / `revealedHints` / `showSolution` for that lab. (3) Clears logs for all steps of that lab. (4) Persists the cleared state. Step-level “Reset” can remain “clear output only” or optionally also clear revealed state for current step. |


### Phase B – Stable placeholder and marker model


| #   | Task                               | Details                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | **Structured blanks (data model)** | Introduce a small **blanks** model: each blank has `id`, `line`, `columnStart`, `length`, `answer`, `hint`. Skeleton uses fixed placeholders (e.g. `{{0}}`, `{{1}}`) or keep underscores but define blanks explicitly so substitution uses `blank.id` and we never rely on “first 5+ underscores” on a line. |
| B2  | **Single substitution function**   | One function: `applyRevealedToSkeleton(skeleton, blanks, revealedIds)` that replaces only the placeholder for each `blank.id` in `revealedIds` with `blank.answer`. No regex over underscore runs.                                                                                                           |
| B3  | **Marker position from data**      | In InlineHintEditor, compute marker position only from `blank.line` and `blank.columnStart` (and optional length). Optionally precompute character offset from skeleton for consistency. Remove dependency on “finding blankText in current code”.                                                           |
| B4  | **Migration**                      | Add a thin adapter: from current `inlineHints` (line + blankText + hint + answer) generate the structured blanks (e.g. by scanning skeleton for blankText on that line). Lab definitions can stay as-is until we switch authoring to the new format.                                                         |


### Phase C – Persistence and UX alignment


| #   | Task                     | Details                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **Lab workspace schema** | Extend `LabStepWorkspace` to include: `revealedAnswersByBlock`, `showSolutionByBlock`, and optionally `revealedHintsByBlock`. Key by blockKey (e.g. `"0-0"`). When loading, merge with in-memory state so persisted state wins for that lab/user.                                                                                                             |
| C2  | **Reset lab API**        | Implement `clearLabWorkspace(labNumber, userEmail)` (or merge into `saveLabWorkspace` with a “clear” flag) that sets editors to empty (or to “skeleton only”), clears logs, clears revealed/solution state for that lab, then saves. Wire “Reset” button in UI to this.                                                                                       |
| C3  | **Editor content rule**  | Decide and document: for blocks with skeleton + hints, editor content is **always** “skeleton + applyRevealed(revealedAnswers)”. Do not persist “filled” code for those blocks; persist only `revealedAnswersByBlock`. So on load we reconstruct content from skeleton + persisted revealed. For blocks without skeleton, keep persisting raw editor content. |


---

## 4. Implementation Order

1. **A1 + A2** – Solution fills placeholders; correct replace for multiple blanks per line.
2. **A3 + C1** – Persist and load revealed/solution state.
3. **A4 + C2** – Full lab reset and wire Reset button.
4. **B1–B4** – Structured blanks and single substitution (can be done after A is in and tested).

---

## 5. Files to Touch (Summary)


| Area                         | Files                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| Solution = fill placeholders | `StepView.tsx` (revealSolution, getDisplayCode / editableCode sync)                                    |
| Replace by blank identity    | `StepView.tsx` (`applyRevealedAnswersToCode`)                                                          |
| Persist revealed state       | `labWorkspaceStorage.ts` (schema + load/save), `StepView.tsx` (load on init, save on reveal)           |
| Reset lab                    | `labWorkspaceStorage.ts` (clear helper), `StepView.tsx` or parent (Reset button + clear state)         |
| Structured blanks (Phase B)  | `InlineHintEditor.tsx`, `StepView.tsx`, `InlineHintMarker` types, enhancement schema / lab definitions |


---

## 6. Success Criteria

- **Stability**: Hint markers stay aligned with blanks; no “floating” or wrong-line markers when scrolling or in terminal blocks.
- **Solution**: Clicking “Solution” fills all hint placeholders in the skeleton; editor content is not replaced by a different full solution string.
- **Persistence**: Revealed hints/answers and “Solution” state are saved and restored per user per lab so returning users see their progress.
- **Reset**: One “Reset” action clears all lab state (editors, logs, revealed/solution) for that lab and user and persists the cleared state.

This plan keeps the current authoring format in the short term while fixing behavior and persistence; Phase B then moves to a more robust, single-source-of-truth model for blanks and markers.

---

## 7. Validating that hints render correctly

To ensure hint markers align with blanks (no line/blankText drift) across **all lab steps**:

1. **Run the hint-rendering validation test**
   ```bash
   npm test -- --run src/test/labs/validate-hint-rendering.test.ts
   ```
2. The test loads every lab's enhancements and, for each code block that has a `skeleton` and `inlineHints`, checks that:
   - Each hint's `line` is within the skeleton (1-based).
   - The skeleton line at that index **contains** the hint's `blankText` (so `InlineHintEditor`'s `findBlankPositions` can place the marker).
3. Any mismatch is reported (e.g. `blank_not_found_on_line`, `line_out_of_range`). Fix by updating the enhancement's `inlineHints` so that `line` and `blankText` match the skeleton, or by adjusting the skeleton so the blank text appears on the expected line.

Use this test after changing skeletons or hints, and when adding new labs, so that hints render correctly in the UI.

**Visual check:** The "?" hint marker must appear **exactly where** the placeholder (e.g. `____________`) is rendered in the editor. After fixing hint/skeleton data, validate in the browser: open each lab step that has blanks (e.g. Lab 1 Step 2 – Apply Key Policy) and confirm each "?" sits on the blank. The UI uses Monaco’s `getScrolledVisiblePosition` when available so the marker aligns with the rendered text; if markers are still off, fix line/column in the enhancement or adjust the positioning fallback in `InlineHintEditor.tsx`.