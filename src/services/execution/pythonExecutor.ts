/**
 * Python executor. Phase 6.
 * Calls /api/run-python (Vite dev server runs code via python3 temp file).
 */
import type { RunResult, RunOptions } from '@/types/ide';

export interface PythonRunParams {
  code: string;
  /** Inline editor heading / code block filename (e.g. script.py) for temp file name. */
  filename?: string;
  /** Lab user suffix for temp dir (workshop/<userSuffix>/). */
  userSuffix?: string;
}

/**
 * Runs Python code via /api/run-python API.
 */
export async function runPython(
  params: PythonRunParams,
  options?: RunOptions
): Promise<RunResult> {
  const { code, filename, userSuffix } = params;
  const body: Record<string, unknown> = {
    code,
    ...(filename && { filename }),
    ...(userSuffix != null && userSuffix !== '' && { userSuffix }),
  };
  if (options?.sessionContext) {
    body.sessionContext = options.sessionContext;
  }
  const res = await fetch('/api/run-python', {
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
