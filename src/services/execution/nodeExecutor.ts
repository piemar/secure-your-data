import type { RunResult, RunOptions } from '@/types/ide';

export interface NodeRunParams {
  code: string;
  uri?: string;
  region?: string;
  profile?: string;
  /** Inline editor heading / code block filename (e.g. keyvault-setup.cjs) for temp file name. */
  filename?: string;
  /** Lab user suffix for temp dir (workshop/<userSuffix>/). */
  userSuffix?: string;
}

const DEFAULT_PROFILE = 'default';

/**
 * Runs Node.js code via existing /api/run-node API.
 * Used by ExecutionService; no direct fetch in UI.
 */
export async function runNode(
  params: NodeRunParams,
  options?: RunOptions
): Promise<RunResult> {
  const { code, uri = '', region, profile = DEFAULT_PROFILE, filename, userSuffix } = params;
  const body: Record<string, unknown> = {
    code,
    uri,
    ...(region && { region }),
    profile,
    ...(filename && { filename }),
    ...(userSuffix != null && userSuffix !== '' && { userSuffix }),
  };
  if (options?.sessionContext) {
    body.sessionContext = options.sessionContext;
  }
  const res = await fetch('/api/run-node', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  const data = await res.json();
  const stdout = (data.stdout ?? '').trim();
  const stderr = (data.stderr ?? '').trim();
  const out = [stderr, stdout].filter(Boolean).join('\n') || data.message || '(no output)';
  let output = out;
  if (data.success !== true && data.exitCode != null && data.exitCode !== 0 && !output.includes('exit code')) {
    output += `\nExit code: ${data.exitCode}`;
  }
  return {
    stdout: data.stdout ?? '',
    stderr: data.stderr ?? '',
    exitCode: data.exitCode ?? (data.success === true ? 0 : 1),
    success: data.success === true,
    message: data.message,
  };
}
