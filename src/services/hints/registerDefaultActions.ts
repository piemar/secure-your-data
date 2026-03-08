/**
 * Register default command-palette actions and hint providers. Phase 5.
 * Run once at app init (e.g. from main or App).
 */
import { registerAction } from './ActionRegistry';
import { hintOrchestrator } from './HintOrchestrator';
import { stepHintProvider } from './StepHintProvider';
import { editorHintProvider } from './EditorHintProvider';
import { terminalHintProvider } from './TerminalHintProvider';
import { workspaceHintProvider } from './WorkspaceHintProvider';

export function registerDefaultActions(): void {
  hintOrchestrator.register(stepHintProvider);
  hintOrchestrator.register(editorHintProvider);
  hintOrchestrator.register(terminalHintProvider);
  hintOrchestrator.register(workspaceHintProvider);
  registerAction({
    id: 'run.node',
    label: 'Run: Node (current step)',
    category: 'Run',
    run: () => {
      // Placeholder: in lab context this could trigger "Run all" for current step.
      document.dispatchEvent(new CustomEvent('ide:run', { detail: { language: 'node' } }));
    },
  });
  registerAction({
    id: 'run.mongosh',
    label: 'Run: Mongosh (current step)',
    category: 'Run',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:run', { detail: { language: 'mongosh' } }));
    },
  });
  registerAction({
    id: 'run.bash',
    label: 'Run: Bash (current step)',
    category: 'Run',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:run', { detail: { language: 'bash' } }));
    },
  });
  // Prompt 2 — Advanced Interactive: command palette actions
  registerAction({
    id: 'notebook.run-cell',
    label: 'Run Cell',
    category: 'Notebook',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:run-cell'));
    },
  });
  registerAction({
    id: 'terminal.open',
    label: 'Open Terminal',
    category: 'Terminal',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:open-terminal'));
    },
  });
  registerAction({
    id: 'runtime.switch',
    label: 'Switch Runtime',
    category: 'Runtime',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:switch-runtime'));
    },
  });
  registerAction({
    id: 'output.clear',
    label: 'Clear Output',
    category: 'Output',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:clear-output'));
    },
  });
  registerAction({
    id: 'runtime.restart',
    label: 'Restart Runtime',
    category: 'Runtime',
    run: () => {
      document.dispatchEvent(new CustomEvent('ide:restart-runtime'));
    },
  });
}
