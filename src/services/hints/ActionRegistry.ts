/**
 * Registry of command-palette actions. Phase 5.
 * Actions can be filtered by context (e.g. "Run Python file" only when file is .py).
 */
import type { CommandPaletteAction, HintContext } from '@/types/ide';

const actions: CommandPaletteAction[] = [];

export function registerAction(action: CommandPaletteAction): void {
  if (!actions.some(a => a.id === action.id)) {
    actions.push(action);
  }
}

export function unregisterAction(id: string): void {
  const i = actions.findIndex(a => a.id === id);
  if (i >= 0) actions.splice(i, 1);
}

export function getActions(context: HintContext): CommandPaletteAction[] {
  return actions.filter(a => !a.when || a.when(context));
}

export function getAction(id: string): CommandPaletteAction | undefined {
  return actions.find(a => a.id === id);
}
