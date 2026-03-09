/**
 * C# executor. Runs C# code via /api/run-csharp (temp project with MongoDB.Driver, dotnet run).
 */
import type { RunResult, RunOptions } from '@/types/ide';

export interface CSharpRunParams {
  code: string;
  /** MongoDB connection string; set as MONGODB_URI when running dotnet run. */
  uri?: string;
  /** Inline editor filename (e.g. connect-insert.cs) for temp path. */
  filename?: string;
  /** Lab user suffix for temp dir. */
  userSuffix?: string;
}

export interface CSharpPrepareResult {
  success: boolean;
  projectPath?: string;
}

/**
 * Prepares a C# project (creates temp dir with Program.cs and .csproj) and returns the project path.
 * Use when running in the terminal: echo `dotnet run --project "<projectPath>"` so execution and output appear in the PTY.
 */
export async function prepareCSharpProject(
  params: CSharpRunParams,
  options?: RunOptions
): Promise<CSharpPrepareResult> {
  const { code, uri, filename, userSuffix } = params;
  const body: Record<string, unknown> = {
    code,
    prepareOnly: true,
    ...(uri != null && uri !== '' && { uri }),
    ...(filename && { filename }),
    ...(userSuffix != null && userSuffix !== '' && { userSuffix }),
  };
  if (options?.sessionContext) {
    body.sessionContext = options.sessionContext;
  }
  const res = await fetch('/api/run-csharp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  const data = await res.json();
  if (data.success !== true || typeof data.projectPath !== 'string') {
    return { success: false };
  }
  return { success: true, projectPath: data.projectPath };
}

/**
 * Runs C# code via /api/run-csharp API.
 * Server creates a temp directory with Program.cs and a .csproj referencing MongoDB.Driver, then runs dotnet run.
 */
export async function runCSharp(
  params: CSharpRunParams,
  options?: RunOptions
): Promise<RunResult> {
  const { code, uri, filename, userSuffix } = params;
  const body: Record<string, unknown> = {
    code,
    ...(uri != null && uri !== '' && { uri }),
    ...(filename && { filename }),
    ...(userSuffix != null && userSuffix !== '' && { userSuffix }),
  };
  if (options?.sessionContext) {
    body.sessionContext = options.sessionContext;
  }
  const res = await fetch('/api/run-csharp', {
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
