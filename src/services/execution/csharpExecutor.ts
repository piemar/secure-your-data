/**
 * C# executor placeholder. Phase 6.
 */
import type { RunResult, RunOptions } from '@/types/ide';

export async function runCSharp(
  _code: string,
  _options?: RunOptions
): Promise<RunResult> {
  return {
    stdout: '',
    stderr: 'C# execution not yet implemented.',
    exitCode: 1,
    success: false,
    message: 'C# executor not configured',
  };
}
