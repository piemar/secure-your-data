/**
 * Editor view wrapper for TerminalContainer.
 * Renders the inline editor (Monaco) content in edit mode.
 * See: Cursor Prompt 1 — Refactor Inline Edit (EditorView in layout).
 */
import { cn } from '@/lib/utils';

interface EditorViewProps {
  children: React.ReactNode;
  className?: string;
  /** When true, editor is visible and interactive. */
  visible?: boolean;
}

export function EditorView({ children, className, visible = true }: EditorViewProps) {
  if (!visible) return null;
  return (
    <div className={cn('h-full min-h-0 flex flex-col overflow-hidden', className)} data-view="editor">
      {children}
    </div>
  );
}
