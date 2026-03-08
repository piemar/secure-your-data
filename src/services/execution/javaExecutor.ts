/**
 * Java executor placeholder. Phase 6.
 */
import type { RunResult, RunOptions } from '@/types/ide';

export async function runJava(
  _code: string,
  _options?: RunOptions
): Promise<RunResult> {
  return {
    stdout: '',
    stderr: 'Java execution not yet implemented.',
    exitCode: 1,
    success: false,
    message: 'Java executor not configured',
  };
}
