import type { RunResult } from '@/types/ide';

/**
 * Single line suitable for summary badge (e.g. "Node completed", "mongosh failed").
 */
export function getRunSummary(result: RunResult, fallbacks: { node?: string; mongosh?: string; bash?: string } = {}): string {
  if (result.success) {
    if (result.message && /completed|success/i.test(result.message)) return result.message;
    return fallbacks.node ?? fallbacks.mongosh ?? fallbacks.bash ?? 'Completed';
  }
  const firstLine = result.message?.split('\n')[0];
  if (firstLine) return firstLine;
  if (result.exitCode != null && result.exitCode !== 0) return `Exit code: ${result.exitCode}`;
  return 'Failed';
}

/**
 * Full output string for console log (stderr + stdout, or message).
 */
export function getDisplayOutput(result: RunResult): string {
  const stderr = (result.stderr ?? '').trim();
  const stdout = (result.stdout ?? '').trim();
  const combined = [stderr, stdout].filter(Boolean).join('\n');
  if (combined) return combined;
  return result.message ?? '(no output)';
}
