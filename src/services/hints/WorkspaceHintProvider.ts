/**
 * Workspace-scoped hints: suggest viewing document list when documentStore has content. Phase 5.
 */
import type { HintProvider, HintContext, SuggestedAction } from '@/types/ide';

export const workspaceHintProvider: HintProvider = {
  getId: () => 'workspace-hint-provider',
  getHints(context: HintContext): SuggestedAction[] {
    const store = context.documentStore;
    if (!store?.list) return [];
    const paths = store.list();
    if (paths.length === 0) return [];
    return [
      {
        id: 'view-workspace-docs',
        label: 'View step code in workspace',
        description: paths.length === 1 ? `Document: ${paths[0]}` : `${paths.length} documents in workspace`,
        kind: 'open',
        source: 'workspace',
        priority: 30,
        payload: { paths },
      },
    ];
  },
};
