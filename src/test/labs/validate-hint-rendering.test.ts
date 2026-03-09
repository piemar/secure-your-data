/**
 * Validates that all inline hints across lab steps render correctly.
 *
 * For each enhancement code block that has a skeleton and inlineHints, checks:
 * - Each hint's line is within the skeleton line range (1-based).
 * - The skeleton line at that index contains the hint's blankText (so the marker
 *   can be positioned; see InlineHintEditor findBlankPositions and HINT_AND_SKELETON_REFACTOR_PLAN.md).
 * - At most one placeholder and one hint per row/code line (no two inlineHints with the same line).
 *
 * Visual validation: The "?" marker must appear exactly where the placeholder (_______) is rendered.
 * After running this test, validate in the browser: open Lab 1 Step 2 (CSFLE Apply Key Policy) and
 * confirm each "?" sits on the blank. Positioning uses Monaco's getScrolledVisiblePosition when
 * available so the marker aligns with the actual text.
 *
 * Run: npm test -- validate-hint-rendering
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { allLabs } from '@/content/topics';
import { loadEnhancementMetadata } from '@/labs/enhancements/loader';

type HintLike = { line: number; blankText: string; hint: string; answer: string };
type BlockLike = { skeleton?: string; inlineHints?: HintLike[]; filename?: string };

interface ValidationFailure {
  labId: string;
  stepId: string;
  enhancementId: string;
  blockIndex: number;
  blockFilename?: string;
  hintIndex?: number;
  hintLine: number;
  blankText: string;
  reason:
    | 'line_out_of_range'
    | 'blank_not_found_on_line'
    | 'multiple_hints_on_same_line'
    | 'skeleton_has_no_placeholders_but_has_hints'
    | 'placeholder_has_no_matching_hint'
    | 'multiple_placeholders_on_same_line';
  skeletonLineCount?: number;
  linePreview?: string;
}

/** Placeholder = optional $ + run of 5+ underscores + optional .suffix (e.g. _________ or $_________ or _________.state). Avoids matching stray __ in code. */
const PLACEHOLDER_REGEX = /(\$?)_{5,}(\.\w+)?/g;

/** Collect (1-based line number, exact placeholder string) from skeleton; at most one per line. */
function getPlaceholdersInSkeleton(skeleton: string): Array<{ line: number; blankText: string }> {
  const result: Array<{ line: number; blankText: string }> = [];
  const lines = skeleton.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    PLACEHOLDER_REGEX.lastIndex = 0;
    while ((m = PLACEHOLDER_REGEX.exec(line)) !== null) {
      matches.push(m[0]); // full match e.g. "_________" or "$_________" or "_________.state"
    }
    if (matches.length > 1) {
      matches.forEach((blankText) => result.push({ line: i + 1, blankText }));
    } else if (matches.length === 1) {
      result.push({ line: i + 1, blankText: matches[0] });
    }
  }
  return result;
}

function validateBlockHints(
  skeleton: string,
  inlineHints: HintLike[],
  context: { labId: string; stepId: string; enhancementId: string; blockIndex: number; blockFilename?: string }
): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const lines = skeleton.split('\n');
  const placeholders = getPlaceholdersInSkeleton(skeleton);

  // No orphaned hints: if skeleton has no placeholders, inlineHints must be empty
  if (placeholders.length === 0 && inlineHints.length > 0) {
    inlineHints.forEach((h, i) => {
      failures.push({
        ...context,
        hintIndex: i,
        hintLine: h.line,
        blankText: h.blankText,
        reason: 'skeleton_has_no_placeholders_but_has_hints',
      });
    });
    return failures;
  }

  // Multiple placeholders on same line (skeleton has 2+ blanks on one line)
  const lineToPlaceholders = new Map<number, string[]>();
  placeholders.forEach(({ line, blankText }) => {
    const list = lineToPlaceholders.get(line) ?? [];
    list.push(blankText);
    lineToPlaceholders.set(line, list);
  });
  lineToPlaceholders.forEach((blankTexts, line) => {
    if (blankTexts.length > 1) {
      blankTexts.forEach((blankText) => {
        failures.push({
          ...context,
          hintLine: line,
          blankText,
          reason: 'multiple_placeholders_on_same_line',
        });
      });
    }
  });

  // Every placeholder must have exactly one matching hint (line + blankText)
  const hintKey = (line: number, blankText: string) => `${line}:${blankText}`;
  const matchedHints = new Set<string>();
  placeholders.forEach(({ line, blankText }) => {
    const key = hintKey(line, blankText);
    const hasMatch = inlineHints.some((h) => h.line === line && h.blankText === blankText);
    if (!hasMatch) {
      failures.push({
        ...context,
        hintLine: line,
        blankText,
        reason: 'placeholder_has_no_matching_hint',
      });
    } else {
      inlineHints.forEach((h) => {
        if (h.line === line && h.blankText === blankText) matchedHints.add(hintKey(h.line, h.blankText));
      });
    }
  });

  // At most one hint per line
  const lineToHintIndices = new Map<number, number[]>();
  inlineHints.forEach((h, i) => {
    const list = lineToHintIndices.get(h.line) ?? [];
    list.push(i);
    lineToHintIndices.set(h.line, list);
  });
  lineToHintIndices.forEach((indices, line) => {
    if (indices.length > 1) {
      indices.forEach((hintIndex) => {
        failures.push({
          ...context,
          hintIndex,
          hintLine: line,
          blankText: inlineHints[hintIndex].blankText,
          reason: 'multiple_hints_on_same_line',
        });
      });
    }
  });

  for (let i = 0; i < inlineHints.length; i++) {
    const h = inlineHints[i];
    const lineIndex = h.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      failures.push({
        ...context,
        hintIndex: i,
        hintLine: h.line,
        blankText: h.blankText,
        reason: 'line_out_of_range',
        skeletonLineCount: lines.length,
      });
      continue;
    }

    const lineText = lines[lineIndex];
    if (!lineText.includes(h.blankText)) {
      failures.push({
        ...context,
        hintIndex: i,
        hintLine: h.line,
        blankText: h.blankText,
        reason: 'blank_not_found_on_line',
        skeletonLineCount: lines.length,
        linePreview: lineText.trim().slice(0, 80),
      });
    }
  }

  return failures;
}

describe('Hint rendering validation (all labs)', () => {
  let allFailures: ValidationFailure[] = [];

  beforeAll(async () => {
    const failures: ValidationFailure[] = [];

    for (const lab of allLabs) {
      for (const step of lab.steps) {
        const enhancementId = step.enhancementId;
        if (!enhancementId) continue;

        const metadata = await loadEnhancementMetadata(enhancementId);
        if (!metadata?.codeBlocks) continue;

        metadata.codeBlocks.forEach((block: BlockLike, blockIndex: number) => {
          const skeleton = block.skeleton;
          const hints = block.inlineHints ?? [];
          if (!skeleton) return;
          // Run validation when there are placeholders and/or hints (catch orphaned hints and missing hints)
          const hasPlaceholders = getPlaceholdersInSkeleton(skeleton).length > 0;
          if (!hasPlaceholders && hints.length === 0) return;

          const blockFailures = validateBlockHints(skeleton, hints, {
            labId: lab.id,
            stepId: step.id,
            enhancementId,
            blockIndex,
            blockFilename: block.filename,
          });
          failures.push(...blockFailures);
        });
      }
    }

    allFailures = failures;
  }, 60000);

  it('every hint has a matching blank on the skeleton line (no line/blankText drift)', () => {
    if (allFailures.length === 0) {
      expect(allFailures).toEqual([]);
      return;
    }

    const report = allFailures
      .map(
        (f) =>
          `  ${f.labId} / ${f.stepId} / ${f.enhancementId} block[${f.blockIndex}]${f.blockFilename ? ` (${f.blockFilename})` : ''}${f.hintIndex != null ? ` hint[${f.hintIndex}]` : ''}: line ${f.hintLine} blankText "${f.blankText}" – ${f.reason}` +
          (f.reason === 'line_out_of_range' && f.skeletonLineCount != null ? ` (skeleton has ${f.skeletonLineCount} lines)` : '') +
          (f.reason === 'multiple_hints_on_same_line' ? ' (at most one hint per line)' : '') +
          (f.reason === 'skeleton_has_no_placeholders_but_has_hints' ? ' (remove inlineHints or add placeholders to skeleton)' : '') +
          (f.reason === 'placeholder_has_no_matching_hint' ? ' (add one inlineHint with this line and blankText)' : '') +
          (f.reason === 'multiple_placeholders_on_same_line' ? ' (at most one placeholder per line)' : '') +
          (f.linePreview != null ? `\n    line preview: "${f.linePreview}..."` : '')
      )
      .join('\n');

    expect(
      allFailures,
      `Hint/skeleton mismatches (fix line numbers or blankText in enhancements so markers render correctly):\n${report}`
    ).toHaveLength(0);
  });
});
