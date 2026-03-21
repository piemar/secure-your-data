/**
 * REPL terminal: single-line commands against /api/execute/repl (same result shape as run).
 */
import { useState, useCallback, useRef } from 'react';
import { api, type ExecuteCommandOutput } from '@/services/api';

export type TerminalLine =
  | { id: string; kind: 'in'; text: string }
  | {
      id: string;
      kind: 'out';
      outputs: ExecuteCommandOutput[];
      error?: string;
      message?: string;
      executionTimeMs?: number;
    };

export interface UseTerminalOptions {
  enabled?: boolean;
}

export function useTerminal(
  missionId: string | undefined,
  sessionId?: string,
  options?: UseTerminalOptions
) {
  const enabled = options?.enabled ?? true;
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const historyNavIndex = useRef<number | null>(null);

  const idRef = useRef(0);
  const nextId = () => {
    idRef.current += 1;
    return `t-${idRef.current}`;
  };

  const clear = useCallback(() => {
    setLines([]);
    setInput('');
    setCommandHistory([]);
    historyNavIndex.current = null;
  }, []);

  const submit = useCallback(async (commandOverride?: string) => {
    const trimmed = (commandOverride ?? input).trim();
    if (!trimmed || !missionId || !enabled) return;

    historyNavIndex.current = null;
    setCommandHistory(prev => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));
    if (commandOverride === undefined) {
      setInput('');
    }

    const inId = nextId();
    setLines(prev => [...prev, { id: inId, kind: 'in', text: trimmed }]);
    setIsRunning(true);

    try {
      const result = await api.execute.repl(trimmed, missionId, sessionId);
      setLines(prev => [
        ...prev,
        {
          id: nextId(),
          kind: 'out',
          outputs: result.output || [],
          error: result.error,
          message: result.message,
          executionTimeMs: result.executionTimeMs,
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setLines(prev => [
        ...prev,
        {
          id: nextId(),
          kind: 'out',
          outputs: [],
          error: msg,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [input, missionId, sessionId, enabled]);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      if (commandHistory.length === 0) return;
      const len = commandHistory.length;
      if (direction === 'up') {
        const next =
          historyNavIndex.current === null ? len - 1 : Math.max(0, historyNavIndex.current - 1);
        historyNavIndex.current = next;
        setInput(commandHistory[next]);
      } else {
        if (historyNavIndex.current === null) return;
        if (historyNavIndex.current >= len - 1) {
          historyNavIndex.current = null;
          setInput('');
        } else {
          const next = historyNavIndex.current + 1;
          historyNavIndex.current = next;
          setInput(commandHistory[next]);
        }
      }
    },
    [commandHistory]
  );

  return {
    lines,
    input,
    setInput,
    submit,
    isRunning,
    clear,
    navigateHistory,
  };
}
