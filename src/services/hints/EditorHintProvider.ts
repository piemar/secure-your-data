/**
 * Editor-scoped hints: "Run current step" when in a lab step. Phase 5.
 * Complements StepHintProvider with source: 'editor' for orchestrator.
 */
import type { HintProvider, HintContext, SuggestedAction } from '@/types/ide';

export const editorHintProvider: HintProvider = {
  getId: () => 'editor-hint-provider',
  getHints(context: HintContext): SuggestedAction[] {
    if (!context.labStepId) return [];
    return [
      {
        id: 'run-current-step-editor',
        label: 'Run current step',
        description: 'Run all code blocks in the current lab step',
        kind: 'run',
        source: 'editor',
        priority: 55,
        payload: { labStepId: context.labStepId },
      },
    ];
  },
};
