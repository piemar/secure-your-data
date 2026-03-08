/**
 * Container that shows either the inline editor or the terminal in the same slot.
 * When the user clicks Run, the view can switch to terminal and stream output (Prompt 1).
 * State: editing | running | terminal.
 *
 * Layout:
 *   TerminalContainer
 *    ├─ EditorView (when mode === 'editing')
 *    └─ TerminalView (when mode === 'terminal' or 'running')
 *
 * Parent can call ref.current.switchToTerminalAndRun(code) to capture editor content,
 * switch to terminal, and write code to the PTY (e.g. on Run button click).
 */
import { forwardRef, useImperativeHandle } from 'react';
import { useTerminalSession, type TerminalMode } from './hooks/useTerminalSession';
import { EditorView } from './EditorView';
import { TerminalView } from './TerminalView';
import { Button } from '@/components/ui/button';
import { Pencil, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TerminalContainerHandle {
  /** Switch to terminal view and write code to the session (call from Run button). */
  switchToTerminalAndRun(code: string): void;
  /** Current mode. */
  mode: TerminalMode;
}

interface TerminalContainerProps {
  /** Editor content (Monaco or similar). Shown when mode is 'editing'. */
  children: React.ReactNode;
  className?: string;
  /** When true, show "Edit Again" button in terminal view. */
  showEditAgain?: boolean;
  /** Welcome line when terminal has no session yet. */
  terminalWelcome?: string;
}

export const TerminalContainer = forwardRef<TerminalContainerHandle, TerminalContainerProps>(
  function TerminalContainer(
    { children, className, showEditAgain = true, terminalWelcome },
    ref
  ) {
    const {
      session,
      mode,
      switchToTerminal,
      switchToEditor,
    } = useTerminalSession({ createOnMount: false });

    useImperativeHandle(ref, () => ({
      switchToTerminalAndRun(code: string) {
        switchToTerminal(code);
      },
      mode,
    }), [mode, switchToTerminal]);

    const showEditor = mode === 'editing';
    const showTerminal = mode === 'running' || mode === 'terminal';

    return (
      <div className={cn('h-full min-h-0 flex flex-col', className)} data-terminal-container>
        {showEditor && (
          <EditorView visible>
            {children}
          </EditorView>
        )}
        {showTerminal && (
          <div className="h-full min-h-0 flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between gap-2 border-b border-border px-2 py-1 bg-muted/50">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Terminal className="w-3.5 h-3.5" />
                Terminal
              </span>
              {showEditAgain && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={switchToEditor}
                  className="h-7 text-xs gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit again
                </Button>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <TerminalView
                session={session}
                visible
                welcome={mode === 'running' ? 'Connecting…' : (terminalWelcome ?? 'Lab terminal. Run your code here.')}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);
