/**
 * Terminal view for TerminalContainer.
 * Renders xterm.js in the same slot as the editor when mode is "terminal".
 * See: Cursor Prompt 1 — Refactor Inline Edit (TerminalView in layout).
 */
import { XtermTerminal } from '@/components/terminal/XtermTerminal';
import { cn } from '@/lib/utils';
import type { TerminalSession } from '@/types/ide';

interface TerminalViewProps {
  session: TerminalSession | null;
  className?: string;
  /** When true, terminal is visible. */
  visible?: boolean;
  welcome?: string;
}

export function TerminalView({
  session,
  className,
  visible = true,
  welcome = 'Lab terminal. Run your code here.',
}: TerminalViewProps) {
  if (!visible) return null;
  return (
    <div className={cn('h-full min-h-0 flex flex-col overflow-hidden', className)} data-view="terminal">
      <XtermTerminal
        session={session}
        welcome={welcome}
        className={className}
      />
    </div>
  );
}
