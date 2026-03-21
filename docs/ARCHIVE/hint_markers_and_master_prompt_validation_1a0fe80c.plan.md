---
name: Hint markers and master prompt validation
overview: The master prompt does require running the hint-rendering test and aligning placeholders with hints, but the test is global and blankText must exactly match the test's extracted placeholder (including a leading $ when the blank is inside a string like "$_________"). Missing hint markers are likely due to blankText/line mismatches or the test not being enforced for the new lab only. This plan proposes clarifying the prompt, optionally scoping validation, and fixing timeseries (and any similar) enhancements.
todos: []
isProject: false
---

# Hint markers and master prompt validation

## Current behavior

**Hint markers** are the "?" buttons rendered by [InlineHintEditor.tsx](src/components/labs/InlineHintEditor.tsx) next to each skeleton blank. They appear only when:

1. `**inlineHints`** are passed to the editor (from the step’s enhancement `codeBlocks`).
2. `**findBlankPositions(content, inlineHints)`** finds at least one position: for each hint it does `lineText.indexOf(blankText)` on the skeleton line. If `blankText` does not exactly match the substring in the skeleton (including a leading `$` when the blank is inside `"$_________"`), no position is added and no marker is shown.

**Validation test** [validate-hint-rendering.test.ts](src/test/labs/validate-hint-rendering.test.ts):

- Runs over **all** labs and all steps with an `enhancementId`.
- Uses **raw** metadata from `loadEnhancementMetadata(enhancementId)` (no placeholder substitution).
- Extracts placeholders with regex: `/(\$?)_{5,}(\.\w+)?/g` → e.g. `"_________"`, `"$_________"`, or `"_________.state"`.
- Requires that **every** placeholder have a matching hint with the **exact** `line` and **exact** `blankText` (the full extracted string, including `$` when present).
- Fails with `placeholder_has_no_matching_hint` or `blank_not_found_on_line` when `blankText` or `line` is wrong.

So: **the test does check placeholders and hints**, but (1) it is global (any failing lab fails the whole run), and (2) the prompt does not explicitly say that **blankText must equal the extracted placeholder** (including `$`), so generated hints can use `'_________'` where the skeleton has `"$_________"`, which fails the test and can also prevent the UI from finding the blank.

## Why timeseries hint markers can be missing

- **blankText vs extracted placeholder:** In [timeseries enhancements](src/content/topics/timeseries/timeseries/enhancements.ts), e.g. aggregate-basics Mongosh skeleton has `_id: "$_________"` and `$_________: "$temperature"`. The test extracts `"$_________"` (with dollar). The hints use `blankText: '_________'`. So:
  - Test: placeholder `"$_________"` has no matching hint → `placeholder_has_no_matching_hint`.
  - UI: `lineText.indexOf("_________")` can still match inside `"$_________"`, so markers may appear in some cases, but the test and UI are inconsistent and the test fails.
- **Global test:** When running the full suite, many **other** labs already fail (csfle, rich-query-aggregations, flexible, ingest-rate, etc.). So the run fails regardless of timeseries; the prompt’s “run the test and fix” step doesn’t say “at least fix the **new** lab,” so the new lab’s hint issues may never be fixed.

## What the master prompt already says

- [ADD_LAB_MASTER_PROMPT_V2.md](Docs/ADD_LAB_MASTER_PROMPT_V2.md) (Placeholders section): run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` and fix reported (lab, step, enhancementId, block, hint) by adjusting `line` and/or `blankText`.
- It also says: “each hint’s `blankText` must equal one of the placeholders the test **extracts** on that line (optional `$` + 5+ underscores + optional `.\w+`).”
- So the prompt **does** require the test and that blankText match the extracted placeholder, but the nuance (include `$` when the blank is inside `"$_________"`) is easy to miss, and there is no instruction to **at least** fix failures for the newly added lab when the full suite fails elsewhere.

## Proposed changes

### 1. Strengthen the master prompt (placeholder and hint verification)

- In the **Placeholders** subsection and in the **“After writing enhancements”** bullet, state explicitly:
  - **blankText** must be the **exact** string extracted by the test’s placeholder regex for that line (e.g. use `"$_________"` when the skeleton line contains `"$_________"`, not `"_________"`).
  - After generating, run `validate-hint-rendering.test.ts` and **fix every failure that references the lab(s) you added** (by lab id or enhancement id). If other, pre-existing labs also fail, note them but do not block; ensure the **new** lab’s steps pass.
- In the **Enhancements shape** bullet (Mode B), repeat that the test must pass for the new lab and that blankText must match the extracted placeholder (including `$` when present).

### 2. (Optional) Scoped validation for new labs

- Add a way to run hint validation **only** for a given lab id or enhancement prefix (e.g. env var or CLI arg), so that:
  - The AI or user can run “validate hints for lab-timeseries-fundamentals” and get a pass/fail without fixing every other lab.
- Implementation options: extend the test to accept a filter (e.g. `LAB_ID=lab-timeseries-fundamentals npm test -- validate-hint-rendering`) or add a small script that calls the same validation logic for a subset of labs.

### 3. Fix timeseries enhancements so markers and test agree

- In [src/content/topics/timeseries/timeseries/enhancements.ts](src/content/topics/timeseries/timeseries/enhancements.ts), for every block:
  - For each skeleton line that contains a placeholder, set **blankText** to the **exact** substring that the test’s regex would extract (e.g. `"$_________"` when the line has `"$_________"`, and `"_________"` when the line has only `_______`__).
  - Ensure **line** numbers match the skeleton (1-based, counting every line of the skeleton string).
- Specifically: aggregate-basics Mongosh (and any other block where the blank is inside `"$..."`) should use `blankText: "$_________"` so both the test and `findBlankPositions` (UI) use the same string.

### 4. (Optional) Document “visual check” in prompt

- Keep or add an explicit step: “Then do a quick **visual check** in the browser for that step (open the lab, go to the step, confirm each ‘?’ marker appears on the correct blank).” This reinforces that passing the test is necessary but not sufficient if the UI still doesn’t show markers (e.g. due to a different bug).

## Summary


| Item                         | Action                                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master prompt                | State that blankText must match extracted placeholder (including `$`); require fixing hint failures for the **new** lab even when the full test suite fails elsewhere. |
| Optional                     | Add scoped hint validation (by lab id or enhancement prefix) so new labs can be verified in isolation.                                                                 |
| Timeseries (and any new lab) | Set blankText to the exact extracted placeholder (e.g. `"$_________"` where the skeleton has `"$_________"`); fix line numbers if needed.                              |
| Optional                     | Explicit “visual check in browser” step in the prompt.                                                                                                                 |


The master prompt **does** require that placeholders and hint markers be correct (via the hint-rendering test and the blankText rule), but the test is global and the “exact extracted string including `$`” rule can be missed, so strengthening the prompt and fixing timeseries (and any similar enhancements) will align the test, the UI, and future generated labs.