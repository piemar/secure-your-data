import type { RunResult, RunOptions } from '@/types/ide';

export interface MongoshRunParams {
  code: string;
  uri: string;
  mongoshPath?: string | null;
}

/**
 * Runs mongosh code via existing /api/run-mongosh API.
 * Requires URI; caller should check before invoking.
 */
export async function runMongosh(
  params: MongoshRunParams,
  options?: RunOptions
): Promise<RunResult> {
  const { code, uri, mongoshPath } = params;
  const body: Record<string, unknown> = { code, uri, ...(mongoshPath && { mongoshPath }) };
  if (options?.sessionContext) body.sessionContext = options.sessionContext;
  const res = await fetch('/api/run-mongosh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  const data = await res.json();
  const out = [data.stdout, data.stderr].filter(Boolean).join('\n') || data.message || '(no output)';
  return {
    stdout: data.stdout ?? '',
    stderr: data.stderr ?? '',
    exitCode: data.exitCode ?? (data.success === true ? 0 : 1),
    success: data.success === true,
    message: data.message,
  };
}
