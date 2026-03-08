/**
 * Factory for IOutputSurface implementation. StepView uses this to abstract append/clear.
 * See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md Phase 1.
 */
import type { IOutputSurface } from '@/types/ide';

export interface OutputSurfaceSetters {
  setLastOutput: (s: string) => void;
  setLastOutputTime: (d: Date | null) => void;
  setLogEntries: (updater: (prev: Array<{ time: Date; output: string }>) => Array<{ time: Date; output: string }>) => void;
  setOutputSummary: (s: string) => void;
  setOutputSuccess: (b: boolean) => void;
}

/**
 * Create an IOutputSurface that updates the given React state setters.
 */
export function createOutputSurface(setters: OutputSurfaceSetters): IOutputSurface {
  return {
    append(output: string, options?: { success?: boolean; summary?: string }) {
      const now = new Date();
      setters.setLogEntries((prev) => [...prev, { time: now, output }]);
      setters.setLastOutput(output);
      setters.setLastOutputTime(now);
      setters.setOutputSummary(options?.summary ?? '');
      setters.setOutputSuccess(options?.success ?? true);
    },
    clear() {
      setters.setLogEntries([]);
      setters.setLastOutput('');
      setters.setLastOutputTime(null);
      setters.setOutputSummary('');
      setters.setOutputSuccess(true);
    },
  };
}
