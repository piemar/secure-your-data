/**
 * Single entry point for running code. All run requests go through this service;
 * no component calls /api/run-* directly.
 * See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md Phase 2.
 */
import type { RunResult, RunOptions } from '@/types/ide';
import { runNode as runNodeApi, type NodeRunParams } from './nodeExecutor';
import { runMongosh as runMongoshApi, type MongoshRunParams } from './mongoshExecutor';
import { runBash as runBashApi, type BashRunParams } from './bashExecutor';
import { runPython as runPythonApi } from './pythonExecutor';
import { runJava as runJavaApi } from './javaExecutor';
import { runCSharp as runCSharpApi } from './csharpExecutor';
import { getDisplayOutput, getRunSummary } from './runResultUtils';

export type { NodeRunParams, MongoshRunParams, BashRunParams };
export { getDisplayOutput, getRunSummary } from './runResultUtils';

export interface CodeRunParams {
  code: string;
}

export const executionService = {
  runNode(params: NodeRunParams, options?: RunOptions): Promise<RunResult> {
    return runNodeApi(params, options);
  },

  runMongosh(params: MongoshRunParams, options?: RunOptions): Promise<RunResult> {
    return runMongoshApi(params, options);
  },

  runBash(params: BashRunParams, options?: RunOptions): Promise<RunResult> {
    return runBashApi(params, options);
  },

  runPython(params: CodeRunParams & { filename?: string; userSuffix?: string }, options?: RunOptions): Promise<RunResult> {
    return runPythonApi({ code: params.code, filename: params.filename, userSuffix: params.userSuffix }, options);
  },

  runJava(params: CodeRunParams, options?: RunOptions): Promise<RunResult> {
    return runJavaApi(params.code, options);
  },

  runCSharp(params: CodeRunParams & { uri?: string; filename?: string; userSuffix?: string }, options?: RunOptions): Promise<RunResult> {
    return runCSharpApi(params, options);
  },
};

export type RuntimeKind = 'node' | 'mongosh' | 'bash' | 'python' | 'java' | 'csharp';

const DEFAULT_SUMMARIES: Record<RuntimeKind, { ok: string; fail: string }> = {
  node: { ok: 'Node completed', fail: 'Node failed' },
  mongosh: { ok: 'mongosh completed', fail: 'mongosh failed' },
  bash: { ok: 'Command completed', fail: 'Command failed' },
  python: { ok: 'Python completed', fail: 'Python failed' },
  java: { ok: 'Java completed', fail: 'Java failed' },
  csharp: { ok: 'C# completed', fail: 'C# failed' },
};

/**
 * Format a RunResult for appending to the console (single string + summary).
 * @param runtime - Optional hint so summary uses the right label (e.g. "Node completed" vs "mongosh completed").
 */
export function formatForConsole(
  result: RunResult,
  runtime?: RuntimeKind
): { output: string; summary: string; success: boolean } {
  const fallbacks = runtime ? DEFAULT_SUMMARIES[runtime] : undefined;
  const summary = result.success
    ? (fallbacks?.ok ?? getRunSummary(result))
    : (result.message?.split('\n')[0] ?? fallbacks?.fail ?? getRunSummary(result));
  return {
    output: getDisplayOutput(result),
    summary,
    success: result.success,
  };
}
