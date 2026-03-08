/**
 * Inline output for a notebook cell. Prompt 2 — Advanced Interactive.
 * Renders below the cell after run.
 */
import { cn } from '@/lib/utils';

export interface CellOutputProps {
  output: string;
  /** Optional success state for styling (e.g. green/red border). */
  success?: boolean;
  className?: string;
}

export function CellOutput({ output, success, className }: CellOutputProps) {
  return (
    <div
      className={cn(
        'border-t border-border px-2 py-2 font-mono text-xs whitespace-pre-wrap break-words bg-muted/30 max-h-[200px] overflow-auto',
        success === true && 'border-l-4 border-l-green-600',
        success === false && 'border-l-4 border-l-red-600',
        className
      )}
      data-cell-output
    >
      {output || '(no output)'}
    </div>
  );
}
