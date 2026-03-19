/**
 * Hook that manages sandbox lifecycle + execution for a mission.
 * Handles createSandbox on start, run on validate, verify after run,
 * and destroySandbox on cleanup.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { getMissionTier, ValidationTier } from '@/lib/mission-tiers';
import { mergeValidationResults, ServerVerificationResult, ValidationResult } from '@/lib/validation';

export interface ExecutionOutput {
  command: string;
  result: unknown;
  error?: string;
  timeMs?: number;
  simulated?: boolean;
  message?: string;
}

export interface SandboxState {
  tier: ValidationTier;
  sandboxActive: boolean;
  isCreating: boolean;
  isExecuting: boolean;
  isVerifying: boolean;
  executionOutput: ExecutionOutput[];
  executionError: string | null;
  serverResults: ServerVerificationResult[];
  totalExecutionTimeMs: number | null;
}

export function useSandboxExecution(missionId: string | undefined, sessionId?: string) {
  const [state, setState] = useState<SandboxState>({
    tier: missionId ? getMissionTier(missionId) : 'pattern',
    sandboxActive: false,
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
    if (tier !== 'execute') return; // Only Tier 2 needs sandbox

    setState(prev => ({ ...prev, isCreating: true, executionError: null }));
    try {
      const result = await api.execute.createSandbox(missionId, sessionId);
      sandboxActiveRef.current = result.created;
      setState(prev => ({
        ...prev,
        sandboxActive: result.created,
        isCreating: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        executionError: err.message || 'Failed to create sandbox',
      }));
    }
  }, [missionId, sessionId]);

  const executeCode = useCallback(async (code: string): Promise<ExecutionOutput[]> => {
    if (!missionId) return [];
    const tier = getMissionTier(missionId);
    if (tier === 'pattern') return []; // No server execution for Tier 1

    setState(prev => ({
      ...prev,
      isExecuting: true,
      executionError: null,
      executionOutput: [],
      totalExecutionTimeMs: null,
    }));

    try {
      const result = await api.execute.run(code, missionId, sessionId);
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionOutput: result.output || [],
        totalExecutionTimeMs: result.executionTimeMs || null,
        executionError: result.error || null,
      }));
      return result.output || [];
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionError: err.message || 'Execution failed',
      }));
      return [];
    }
  }, [missionId, sessionId]);

  const verifyExecution = useCallback(async (): Promise<ServerVerificationResult[]> => {
    if (!missionId) return [];
    const tier = getMissionTier(missionId);
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
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        executionError: err.message || 'Verification failed',
      }));
      return [];
    }
  }, [missionId, sessionId]);

  /**
   * Full validate flow: pattern check → execute → verify → merge results.
   */
  const runFullValidation = useCallback(async (
    code: string,
    patternResults: ValidationResult[]
  ): Promise<ValidationResult[]> => {
    if (!missionId) return patternResults;
    const tier = getMissionTier(missionId);

    if (tier === 'pattern') return patternResults;

    // Execute user code
    await executeCode(code);

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
      setState(prev => ({ ...prev, sandboxActive: false }));
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
