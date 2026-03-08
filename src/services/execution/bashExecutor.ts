import type { RunResult, RunOptions } from '@/types/ide';

export interface BashRunParams {
  commands: string[];
  profile?: string;
  region?: string;
}

const DEFAULT_PROFILE = 'default';

/**
 * Runs shell commands via existing /api/run-bash API.
 */
export async function runBash(
  params: BashRunParams,
  options?: RunOptions
): Promise<RunResult> {
  const { commands, profile = DEFAULT_PROFILE, region } = params;
  const body: Record<string, unknown> = { commands, profile, ...(region && { region }) };
  if (options?.sessionContext) body.sessionContext = options.sessionContext;
  const res = await fetch('/api/run-bash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  const data = await res.json();
  const stdout = (data.stdout ?? '').trim();
  const stderr = (data.stderr ?? '').trim();
  const combined = [stderr, stdout].filter(Boolean).join('\n') || data.message || '(no output)';
  return {
    stdout: data.stdout ?? '',
    stderr: data.stderr ?? '',
    exitCode: data.exitCode ?? (data.success === true ? 0 : 1),
    success: data.success === true,
    message: data.message,
  };
}

/**
 * Format bash run result for display (used by StepView-style log).
 * When stdout/stderr are empty, returns a clear explanation (e.g. success with no stdout for env vars).
 */
export function formatBashRunOutput(data: {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  success?: boolean;
  message?: string;
}): string {
  const stdout = (data.stdout ?? '').trim();
  const stderr = (data.stderr ?? '').trim();
  const exitCode = data.exitCode ?? (data.success ? 0 : 1);
  const combined = [stderr, stdout].filter(Boolean).join('\n');
  if (combined) return combined;
  return data.success
    ? `Commands completed successfully (exit code ${exitCode}).\nVariable assignments (e.g. KMS_KEY_ID=...) and heredocs (cat <<EOF > policy.json) produce no stdout—values are stored in the shell.`
    : `Command failed (exit code ${exitCode}).${stderr ? `\n\n${stderr}` : ''}`;
}
