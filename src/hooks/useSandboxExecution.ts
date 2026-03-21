/**
 * Hook that manages sandbox lifecycle + execution for a mission.
 * Handles createSandbox on start, run on validate, verify after run,
 * and destroySandbox on cleanup.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { api, type ExecuteCommandOutput, type ExecuteRunResponse } from '@/services/api';
import { getMissionTier, ValidationTier } from '@/lib/mission-tiers';
import { mergeValidationResults, ServerVerificationResult, ValidationResult } from '@/lib/validation';

export type ExecutionOutput = ExecuteCommandOutput;

export interface SandboxState {
  tier: ValidationTier;
  sandboxActive: boolean;
  sandboxDbName: string | null;
  isCreating: boolean;
  isExecuting: boolean;
  isVerifying: boolean;
  executionOutput: ExecutionOutput[];
  executionError: string | null;
  serverResults: ServerVerificationResult[];
  totalExecutionTimeMs: number | null;
}

function normalizeExecutionOutput(result: ExecuteRunResponse): ExecuteCommandOutput[] {
  const raw = Array.isArray(result.output) ? result.output : [];
  if (raw.length > 0) return raw;
  return [
    {
      command: '(summary)',
      result: {
        success: result.success,
        tier: result.tier,
        message: result.message || 'Execution completed with no explicit payload output.',
        executionTimeMs: result.executionTimeMs ?? null,
      },
      ...(result.error ? { error: result.error } : {}),
    },
  ];
}

export function useSandboxExecution(missionId: string | undefined, sessionId?: string) {
  const [state, setState] = useState<SandboxState>({
    tier: missionId ? getMissionTier(missionId) : 'pattern',
    sandboxActive: false,
    sandboxDbName: null,
    isCreating: false,
    isExecuting: false,
    isVerifying: false,
    executionOutput: [],
    executionError: null,
    serverResults: [],
    totalExecutionTimeMs: null,
  });

  const sandboxActiveRef = useRef(false);

  // Update tier when missionId changes
  useEffect(() => {
    if (missionId) {
      setState(prev => ({ ...prev, tier: getMissionTier(missionId) }));
    }
  }, [missionId]);

  // Cleanup sandbox on unmount
  useEffect(() => {
    return () => {
      if (sandboxActiveRef.current) {
        api.execute.destroySandbox(sessionId).catch(() => {});
      }
    };
  }, [sessionId]);

  const createSandbox = useCallback(async () => {
    if (!missionId) return;
    const tier = getMissionTier(missionId);
    if (tier === 'simulate' || tier === 'hold') return;

    setState(prev => ({ ...prev, isCreating: true, executionError: null }));
    try {
      const result = await api.execute.createSandbox(missionId, sessionId);
      sandboxActiveRef.current = result.created;
      setState(prev => ({
        ...prev,
        sandboxActive: result.created,
        sandboxDbName: result.created && result.dbName ? result.dbName : prev.sandboxDbName,
        isCreating: false,
        executionError: result.created ? null : (result.message || null),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create sandbox';
      setState(prev => ({
        ...prev,
        isCreating: false,
        executionError: message,
      }));
    }
  }, [missionId, sessionId]);

  const executeCode = useCallback(async (code: string): Promise<ExecutionOutput[]> => {
    if (!missionId) return [];
    const tier = getMissionTier(missionId);
    if (tier === 'hold') {
      setState(prev => ({
        ...prev,
        executionError: 'This mission is on hold while Tier 3 validations are being rebuilt.',
      }));
      return [];
    }
    if (tier === 'simulate') return [];

    setState(prev => ({
      ...prev,
      isExecuting: true,
      executionError: null,
      executionOutput: [],
      totalExecutionTimeMs: null,
    }));

    try {
      const result = await api.execute.run(code, missionId, sessionId);
      const output = normalizeExecutionOutput(result);
      const error = result.error || null;
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionOutput: output,
        totalExecutionTimeMs: result.executionTimeMs || null,
        executionError: error,
      }));
      return output;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionError: message,
      }));
      return [];
    }
  }, [missionId, sessionId]);

  const verifyExecution = useCallback(async (): Promise<ServerVerificationResult[]> => {
    if (!missionId) return [];
    const tier = getMissionTier(missionId);
    if (tier === 'hold') {
      setState(prev => ({
        ...prev,
        executionError: 'Verification is disabled because this mission is currently on hold.',
      }));
      return [];
    }
    if (tier !== 'execute') return [];

    setState(prev => ({ ...prev, isVerifying: true }));
    try {
      const result = await api.execute.verify(missionId, sessionId);
      const serverResults = result.results || [];
      setState(prev => ({
        ...prev,
        isVerifying: false,
        serverResults,
      }));
      return serverResults;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setState(prev => ({
        ...prev,
        isVerifying: false,
        executionError: message,
      }));
      return [];
    }
  }, [missionId, sessionId]);

  /**
   * Full validate flow: pattern check → execute → verify → merge results.
   */
  const runFullValidation = useCallback(async (
    code: string,
    patternResults: ValidationResult[],
    options?: { skipExecute?: boolean }
  ): Promise<ValidationResult[]> => {
    if (!missionId) return patternResults;
    const tier = getMissionTier(missionId);

    if (tier === 'hold') return patternResults;

    // Execute user code unless caller already executed externally (e.g. PTY statement runner)
    if (!options?.skipExecute) {
      await executeCode(code);
    }

    if (tier === 'simulate') {
      // For simulation, execution output is the result — no further verification
      return patternResults;
    }

    // Tier 2: verify the sandbox state
    const serverResults = await verifyExecution();
    return mergeValidationResults(patternResults, serverResults);
  }, [missionId, executeCode, verifyExecution]);

  const destroySandbox = useCallback(async () => {
    if (!sandboxActiveRef.current) return;
    try {
      await api.execute.destroySandbox(sessionId);
      sandboxActiveRef.current = false;
      setState(prev => ({ ...prev, sandboxActive: false, sandboxDbName: null }));
    } catch {
      // Best effort
    }
  }, [sessionId]);

  const clearOutput = useCallback(() => {
    setState(prev => ({
      ...prev,
      executionOutput: [],
      executionError: null,
      serverResults: [],
      totalExecutionTimeMs: null,
      sandboxDbName: prev.sandboxDbName,
    }));
  }, []);

  return {
    ...state,
    createSandbox,
    executeCode,
    verifyExecution,
    runFullValidation,
    destroySandbox,
    clearOutput,
  };
}
