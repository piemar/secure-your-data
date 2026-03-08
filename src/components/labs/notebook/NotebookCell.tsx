/**
 * Single cell in a notebook. Prompt 2 — Advanced Interactive.
 * Lifecycle: edit → run → output → rerun.
 */
import { useState } from 'react';
import { CellOutput } from './CellOutput';
import { cn } from '@/lib/utils';

export interface NotebookCellProps {
  /** Cell index (0-based). */
  index: number;
  /** Initial code. */
  code: string;
  /** Language (bash, python, node, etc.). */
  language?: string;
  /** Callback when code changes. */
  onCodeChange?: (code: string) => void;
  /** Callback when Run is clicked; return output to display. */
  onRun?: (code: string) => Promise<{ output: string; success?: boolean }>;
  /** Whether the cell is read-only. */
  readOnly?: boolean;
  className?: string;
}

export function NotebookCell({
  index,
  code,
  language = 'bash',
  onCodeChange,
  onRun,
  readOnly = false,
  className,
}: NotebookCellProps) {
  const [localCode, setLocalCode] = useState(code);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState<boolean | undefined>(undefined);

  const value = onCodeChange != null ? code : localCode;
  const setValue = onCodeChange ?? setLocalCode;

  const handleRun = async () => {
    if (!onRun) return;
    setRunning(true);
    setOutput(null);
    try {
      const result = await onRun(value);
      setOutput(result.output);
      setSuccess(result.success);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={cn('flex flex-col border border-border rounded-md overflow-hidden', className)} data-notebook-cell>
      <div className="flex items-center justify-between gap-2 px-2 py-1 bg-muted/50 border-b border-border">
        <span className="text-xs text-muted-foreground">Cell {index + 1}</span>
        {onRun && (
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {running ? 'Running…' : 'Run'}
          </button>
        )}
      </div>
      <div className="p-2 min-h-[60px]">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={readOnly}
          className="w-full h-full min-h-[56px] resize-y font-mono text-sm bg-background border-0 focus:outline-none focus:ring-0"
          placeholder={`# ${language} code`}
          data-cell-input
        />
      </div>
      {output != null && (
        <CellOutput output={output} success={success} />
      )}
    </div>
  );
}
