/**
 * Validates that all inline hints across lab steps render correctly.
 *
 * For each enhancement code block that has a skeleton and inlineHints, checks:
 * - Each hint's line is within the skeleton line range (1-based).
 * - The skeleton line at that index contains the hint's blankText (so the marker
 *   can be positioned; see InlineHintEditor findBlankPositions and HINT_AND_SKELETON_REFACTOR_PLAN.md).
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
  hintIndex: number;
  hintLine: number;
  blankText: string;
  reason: 'line_out_of_range' | 'blank_not_found_on_line';
  skeletonLineCount: number;
  linePreview?: string;
}

function validateBlockHints(
  skeleton: string,
  inlineHints: HintLike[],
  context: { labId: string; stepId: string; enhancementId: string; blockIndex: number; blockFilename?: string }
): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const lines = skeleton.split('\n');

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
          const hints = block.inlineHints;
          if (!skeleton || !hints?.length) return;

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
          `  ${f.labId} / ${f.stepId} / ${f.enhancementId} block[${f.blockIndex}]${f.blockFilename ? ` (${f.blockFilename})` : ''} hint[${f.hintIndex}]: line ${f.hintLine} blankText "${f.blankText}" – ${f.reason}` +
          (f.reason === 'line_out_of_range' ? ` (skeleton has ${f.skeletonLineCount} lines)` : '') +
          (f.linePreview != null ? `\n    line preview: "${f.linePreview}..."` : '')
      )
      .join('\n');

    expect(
      allFailures,
      `Hint/skeleton mismatches (fix line numbers or blankText in enhancements so markers render correctly):\n${report}`
    ).toHaveLength(0);
  });
});
