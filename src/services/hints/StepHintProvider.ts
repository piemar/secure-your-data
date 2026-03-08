/**
 * Hint provider for lab steps: suggests "Run current step" when step has code blocks.
 * Phase 5. See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md.
 */
import type { HintProvider, HintContext, SuggestedAction } from '@/types/ide';

export const stepHintProvider: HintProvider = {
  getId: () => 'step-hint-provider',
  getHints(context: HintContext): SuggestedAction[] {
    if (!context.labStepId) return [];
    return [
      {
        id: 'run-current-step',
        label: 'Run current step',
        description: 'Run all code blocks in the current lab step',
        kind: 'run',
        source: 'editor',
        priority: 60,
        payload: { labStepId: context.labStepId },
      },
    ];
  },
};
