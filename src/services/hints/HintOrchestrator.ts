/**
 * Aggregates hint providers, ranks and suppresses suggestions.
 * Phase 5. See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md.
 */
import type { HintContext, HintProvider, SuggestedAction } from '@/types/ide';

export class HintOrchestrator {
  private providers: HintProvider[] = [];

  register(provider: HintProvider): void {
    if (!this.providers.some(p => p.getId() === provider.getId())) {
      this.providers.push(provider);
    }
  }

  unregister(providerId: string): void {
    this.providers = this.providers.filter(p => p.getId() !== providerId);
  }

  async getHints(context: HintContext): Promise<SuggestedAction[]> {
    const all: SuggestedAction[] = [];
    for (const p of this.providers) {
      const hints = await Promise.resolve(p.getHints(context));
      all.push(...hints);
    }
    return this.rankAndSuppress(all, context);
  }

  private rankAndSuppress(actions: SuggestedAction[], context: HintContext): SuggestedAction[] {
    const sorted = [...actions].sort((a, b) => b.priority - a.priority);
    const seenLabels = new Set<string>();
    const deduped = sorted.filter(a => {
      if (seenLabels.has(a.label)) return false;
      seenLabels.add(a.label);
      return true;
    });
    return deduped;
  }
}

export const hintOrchestrator = new HintOrchestrator();
