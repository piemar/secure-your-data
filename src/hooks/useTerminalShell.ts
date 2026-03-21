import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  AUTH_TOKEN_CHANGED_EVENT,
  api,
  getAuthToken,
  type ExecuteCommandOutput,
} from '@/services/api';
import type { TerminalLine } from '@/hooks/useTerminal';

type PendingCommand = {
  command: string;
  stdout: string;
  stderr: string;
  resolve: (result: TerminalShellCommandResult) => void;
};

export type TerminalShellCommandResult = {
  command: string;
  code: number | null;
  signal: string | null;
  truncated: boolean;
  stdout: string;
  stderr: string;
};

export function useTerminalShell(enabled: boolean) {
  const [mode, setMode] = useState<'exec' | 'pty'>('exec');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [streamChunks, setStreamChunks] = useState<Array<{ id: string; data: string }>>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [disabledReason, setDisabledReason] = useState<string | undefined>();
  const [isReady, setIsReady] = useState(false);
  const [authToken, setAuthTokenState] = useState<string | null>(() => getAuthToken());

  const idRef = useRef(0);
  const nextId = () => {
    idRef.current += 1;
    return `sh-${idRef.current}`;
  };

  const historyNavIndex = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingRef = useRef<Map<string, PendingCommand>>(new Map());
  const initRef = useRef<Promise<boolean> | null>(null);
  const modeRef = useRef<'exec' | 'pty'>('exec');
  const streamTextRef = useRef('');
  const streamChunksRef = useRef<Array<{ id: string; data: string }>>([]);
  const promptKickTimersRef = useRef<number[]>([]);

  const clearPromptKickTimers = useCallback(() => {
    for (const id of promptKickTimersRef.current) {
      window.clearTimeout(id);
    }
    promptKickTimersRef.current = [];
  }, []);

  const flushPendingAsError = useCallback((message: string) => {
    const pendings = Array.from(pendingRef.current.values());
    if (pendings.length > 0) {
      for (const p of pendings) {
        p.resolve({
          command: p.command,
          code: 1,
          signal: null,
          truncated: false,
          stdout: p.stdout,
          stderr: `${message}: ${p.command}`,
        });
      }
      setLines(prev => [
        ...prev,
        ...pendings.map((p) => ({
          id: nextId(),
          kind: 'out' as const,
          outputs: [],
          error: `${message}: ${p.command}`,
        })),
      ]);
    }
    pendingRef.current.clear();
    setIsRunning(false);
  }, []);

  const teardownSocket = useCallback(() => {
    if (!socketRef.current) return;
    clearPromptKickTimers();
    socketRef.current.disconnect();
    socketRef.current = null;
    pendingRef.current.clear();
    initRef.current = null;
    setMode('exec');
    modeRef.current = 'exec';
  }, [clearPromptKickTimers]);

  const initialize = useCallback(async () => {
    if (!enabled) return false;
    if (socketRef.current?.connected) {
      setDisabledReason(undefined);
      setIsReady(true);
      return true;
    }
    if (initRef.current) {
      return initRef.current;
    }

    const token = authToken;
    if (!token) {
      setDisabledReason('Shell terminal requires login.');
      setIsReady(false);
      teardownSocket();
      return false;
    }

    initRef.current = (async () => {
      try {
        setDisabledReason('Connecting terminal shell...');
        setIsReady(false);
        const session = await api.terminal.createSession();
        if (!session.enabled || !session.shellStream) {
          setDisabledReason(session.message || 'Shell terminal is disabled on this server.');
          setIsReady(false);
          teardownSocket();
          return false;
        }

        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const socket = io(`${base}${session.shellStream.namespace}`, {
          path: session.shellStream.socketPath || '/socket.io',
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 8,
          reconnectionDelay: 500,
          reconnectionDelayMax: 3000,
          timeout: 8000,
          auth: {
            token,
            sessionId: session.sessionId,
          },
        });

        socket.on('connect', () => {
          setDisabledReason(undefined);
          setIsReady(true);
        });

        socket.on('terminal:ready', (payload: { mode?: string }) => {
          const nextMode = payload?.mode === 'pty' ? 'pty' : 'exec';
          modeRef.current = nextMode;
          setMode(nextMode);
          if (nextMode === 'pty') {
            // Some shells delay initial prompt until first input.
            // Kick once quickly, then again if prompt still absent.
            clearPromptKickTimers();
            const t1 = window.setTimeout(() => {
              if (modeRef.current !== 'pty') return;
              if (streamTextRef.current.trim().length === 0) {
                socket.emit('terminal:input', { data: '\n' });
              }
            }, 120);
            const t2 = window.setTimeout(() => {
              if (modeRef.current !== 'pty') return;
              if (streamTextRef.current.trim().length === 0) {
                socket.emit('terminal:input', { data: '\n' });
              }
            }, 380);
            promptKickTimersRef.current = [t1, t2];
          }
        });

        socket.on('disconnect', (reason) => {
          clearPromptKickTimers();
          setIsReady(false);
          if (!enabled) return;
          setDisabledReason(`Shell disconnected (${reason}). Reconnecting...`);
          flushPendingAsError('Shell connection lost');
        });

        socket.on('connect_error', (err: Error) => {
          setDisabledReason(err.message || 'Failed to connect terminal shell.');
          setIsReady(false);
        });

        socket.on('terminal:output', (payload: { requestId: string; channel: 'stdout' | 'stderr'; data: string }) => {
          if (modeRef.current === 'pty') {
            if (!payload?.data) return;
            streamTextRef.current = `${streamTextRef.current}${payload.data}`.slice(-20000);
            const chunk = { id: nextId(), data: payload.data };
            streamChunksRef.current = [...streamChunksRef.current, chunk];
            setStreamChunks(streamChunksRef.current);
            return;
          }
          const pending = pendingRef.current.get(payload.requestId);
          if (!pending) return;
          if (payload.channel === 'stdout') {
            pending.stdout += payload.data || '';
          } else {
            pending.stderr += payload.data || '';
          }
        });

        socket.on(
          'terminal:done',
          (payload: { requestId: string; code: number | null; signal: string | null; truncated: boolean }) => {
            const pending = pendingRef.current.get(payload.requestId);
            if (!pending) return;
            pendingRef.current.delete(payload.requestId);

            const output: ExecuteCommandOutput = {
              command: pending.command,
              result: pending.stdout.trimEnd() || null,
              ...(pending.stderr.trim() ? { error: pending.stderr.trimEnd() } : {}),
              ...(payload.truncated ? { message: 'Output truncated by server limits.' } : {}),
            };

            const doneMessage =
              payload.code === 0
                ? 'Command finished successfully.'
                : `Command finished with code ${String(payload.code ?? 'null')}${payload.signal ? ` (${payload.signal})` : ''}.`;

            pending.resolve({
              command: pending.command,
              code: payload.code,
              signal: payload.signal,
              truncated: payload.truncated,
              stdout: pending.stdout,
              stderr: pending.stderr,
            });

            setLines(prev => [
              ...prev,
              {
                id: nextId(),
                kind: 'out',
                outputs: [output],
                message: doneMessage,
              },
            ]);
            setIsRunning(false);
          }
        );

        socket.on('terminal:error', (payload: { requestId?: string; message?: string }) => {
          if (payload.requestId) {
            const pending = pendingRef.current.get(payload.requestId);
            if (pending) {
              pending.resolve({
                command: pending.command,
                code: 1,
                signal: null,
                truncated: false,
                stdout: pending.stdout,
                stderr: payload.message || 'Terminal command failed.',
              });
              pendingRef.current.delete(payload.requestId);
            }
          }
          setLines(prev => [
            ...prev,
            {
              id: nextId(),
              kind: 'out',
              outputs: [],
              error: payload.message || 'Terminal command failed.',
            },
          ]);
          setIsRunning(false);
        });

        socketRef.current = socket;
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize shell terminal.';
        setDisabledReason(message);
        setIsReady(false);
        teardownSocket();
        return false;
      } finally {
        initRef.current = null;
      }
    })();

    return initRef.current;
  }, [authToken, enabled, flushPendingAsError, teardownSocket, clearPromptKickTimers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncToken = () => setAuthTokenState(getAuthToken());
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
    window.addEventListener('storage', syncToken);
    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
      window.removeEventListener('storage', syncToken);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setDisabledReason('Shell terminal is only available during an active mission.');
      setIsReady(false);
      teardownSocket();
      return;
    }
    void initialize();
    return () => teardownSocket();
  }, [enabled, initialize, teardownSocket, authToken]);

  const clear = useCallback(() => {
    setLines([]);
    setStreamChunks([]);
    streamChunksRef.current = [];
    streamTextRef.current = '';
    setInput('');
    setCommandHistory([]);
    historyNavIndex.current = null;
  }, []);

  const submit = useCallback(async (commandOverride?: string) => {
    const trimmed = (commandOverride ?? input).trim();
    if (!trimmed || isRunning || !enabled) return null;

    const socket = socketRef.current;
    if (!socket || !isReady) {
      const ok = await initialize();
      if (!ok || !socketRef.current) return null;
    }
    if (!socketRef.current?.connected) {
      setLines(prev => [
        ...prev,
        {
          id: nextId(),
          kind: 'out',
          outputs: [],
          error: 'Terminal shell is connecting. Retry in a moment.',
        },
      ]);
      setIsRunning(false);
      return null;
    }

    historyNavIndex.current = null;
    setCommandHistory(prev => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));
    if (commandOverride === undefined) {
      setInput('');
    }
    setLines(prev => [...prev, { id: nextId(), kind: 'in', text: trimmed }]);
    if (modeRef.current !== 'pty') {
      setIsRunning(true);
    }

    const requestId = `${Date.now()}-${nextId()}`;
    if (modeRef.current === 'pty') {
      socketRef.current!.emit('terminal:exec', { requestId, command: trimmed });
      return null;
    }
    const resultPromise = new Promise<TerminalShellCommandResult>((resolve) => {
      pendingRef.current.set(requestId, {
        command: trimmed,
        stdout: '',
        stderr: '',
        resolve,
      });
      socketRef.current!.emit('terminal:exec', { requestId, command: trimmed });
    });
    return resultPromise;
  }, [enabled, initialize, input, isReady, isRunning]);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down' | 'reverse') => {
      if (commandHistory.length === 0) return;
      const len = commandHistory.length;
      if (direction === 'reverse') {
        const next =
          historyNavIndex.current === null ? len - 1 : Math.max(0, historyNavIndex.current - 1);
        historyNavIndex.current = next;
        setInput(commandHistory[next]);
        return;
      }
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

  const sendInputData = useCallback((data: string) => {
    if (!enabled) return;
    if (modeRef.current !== 'pty') return;
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('terminal:input', { data });
  }, [enabled]);

  const resizeTerminal = useCallback((cols: number, rows: number) => {
    if (!enabled) return;
    if (modeRef.current !== 'pty') return;
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('terminal:resize', { cols, rows });
  }, [enabled]);

  const appendTranscriptInput = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (modeRef.current === 'pty') {
      const chunk = `\r\n$ ${trimmed}\r\n`;
      streamTextRef.current = `${streamTextRef.current}${chunk}`.slice(-20000);
      const item = { id: nextId(), data: chunk };
      streamChunksRef.current = [...streamChunksRef.current, item];
      setStreamChunks(streamChunksRef.current);
      return;
    }
    setLines(prev => [...prev, { id: nextId(), kind: 'in', text: trimmed }]);
  }, []);

  const appendTranscriptMessage = useCallback((message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (modeRef.current === 'pty') {
      const chunk = `\r\n${trimmed}\r\n`;
      streamTextRef.current = `${streamTextRef.current}${chunk}`.slice(-20000);
      const item = { id: nextId(), data: chunk };
      streamChunksRef.current = [...streamChunksRef.current, item];
      setStreamChunks(streamChunksRef.current);
      return;
    }
    setLines(prev => [
      ...prev,
      {
        id: nextId(),
        kind: 'out',
        outputs: [],
        message: trimmed,
      },
    ]);
  }, []);

  const getStreamTail = useCallback((maxChars = 4000) => {
    if (maxChars <= 0) return '';
    const text = streamTextRef.current;
    if (text.length <= maxChars) return text;
    return text.slice(text.length - maxChars);
  }, []);

  return {
    lines,
    streamChunks,
    mode,
    input,
    setInput,
    submit,
    isRunning,
    clear,
    navigateHistory,
    sendInputData,
    resizeTerminal,
    isReady,
    disabledReason,
    appendTranscriptInput,
    appendTranscriptMessage,
    getStreamTail,
  };
}
