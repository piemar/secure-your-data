/**
 * Notebook component: multiple cells with edit → run → output. Prompt 2 — Advanced Interactive.
 * Architecture: Notebook → NotebookCell → CellOutput.
 */
import { useState } from 'react';
import { NotebookCell } from './NotebookCell';
import { cn } from '@/lib/utils';

export interface NotebookCellDef {
  id: string;
  code: string;
  language?: string;
}

export interface NotebookProps {
  /** Initial cells. */
  cells?: NotebookCellDef[];
  /** Callback when a cell is run (optional; for custom execution). */
  onRunCell?: (index: number, code: string, language: string) => Promise<{ output: string; success?: boolean }>;
  className?: string;
}

const defaultCells: NotebookCellDef[] = [
  { id: '1', code: 'echo hello', language: 'bash' },
  { id: '2', code: '# python script.py', language: 'python' },
  { id: '3', code: '# curl api', language: 'bash' },
];

export function Notebook({
  cells = defaultCells,
  onRunCell,
  className,
}: NotebookProps) {
  const [cellList, setCellList] = useState<NotebookCellDef[]>(cells);

  const handleRun = (index: number) => {
    return async (code: string) => {
      if (onRunCell) {
        const lang = cellList[index]?.language ?? 'bash';
        return onRunCell(index, code, lang);
      }
      return { output: `(Run cell ${index + 1}: no execution backend connected)\n${code.slice(0, 100)}…`, success: true };
    };
  };

  return (
    <div className={cn('flex flex-col gap-3 p-2', className)} data-notebook>
      {cellList.map((cell, i) => (
        <NotebookCell
          key={cell.id}
          index={i}
          code={cell.code}
          language={cell.language}
          onCodeChange={(code) => {
            setCellList((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], code };
              return next;
            });
          }}
          onRun={handleRun(i)}
        />
      ))}
    </div>
  );
}
