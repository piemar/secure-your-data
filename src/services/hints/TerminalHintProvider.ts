/**
 * Terminal-scoped hints: suggest opening the Terminal tab when in a lab. Phase 5.
 */
import type { HintProvider, HintContext, SuggestedAction } from '@/types/ide';

export const terminalHintProvider: HintProvider = {
  getId: () => 'terminal-hint-provider',
  getHints(context: HintContext): SuggestedAction[] {
    if (context.labNumber == null) return [];
    return [
      {
        id: 'open-terminal-tab',
        label: 'Open Terminal tab',
        description: 'Switch to the Terminal tab in this lab',
        kind: 'open',
        source: 'terminal',
        priority: 40,
        payload: { tab: 'terminal' },
      },
    ];
  },
};
