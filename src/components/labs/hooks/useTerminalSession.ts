/**
 * Hook to create and manage a PTY terminal session for the inline editor → terminal flow.
 * Session is created lazily when first needed (e.g. when switching to terminal mode).
 * See: Cursor Prompt 1 — Refactor Inline Edit (useTerminalSession).
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { sessionManager } from '@/services/session/SessionManager';
import type { TerminalSession } from '@/types/ide';

export type TerminalMode = 'editing' | 'running' | 'terminal';

export function useTerminalSession(options?: {
  /** When true, create session as soon as hook mounts (e.g. when terminal tab is active). */
  createOnMount?: boolean;
}) {
  const [session, setSession] = useState<TerminalSession | null>(null);
  const [mode, setMode] = useState<TerminalMode>('editing');
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const createSession = useCallback(async (): Promise<TerminalSession | null> => {
    try {
      const s = await sessionManager.createSession();
      sessionIdRef.current = s.id;
      setSession(s);
      return s;
    } catch {
      sessionIdRef.current = null;
      setSession(null);
      return null;
    }
  }, []);

  const destroySession = useCallback((sessionId: string) => {
    sessionManager.destroySession(sessionId);
    if (session?.id === sessionId) setSession(null);
  }, [session?.id]);

  /** Ensure session exists; create if needed. Returns current session. */
  const ensureSession = useCallback(async (): Promise<TerminalSession | null> => {
    if (session) return session;
    return createSession();
  }, [session, createSession]);

  /** Switch to terminal mode and optionally write code to the session. */
  const switchToTerminal = useCallback(async (codeToRun?: string) => {
    setMode('running');
    const s = await ensureSession();
    if (codeToRun != null) setPendingCode(codeToRun);
    setMode('terminal');
    return s;
  }, [ensureSession]);

  /** Write pending or provided code to the session (call after switchToTerminal when session is ready). */
  const writeCode = useCallback((s: TerminalSession | null, code?: string) => {
    const toWrite = code ?? pendingCode;
    if (s && toWrite) {
      s.write(toWrite + '\n');
      setPendingCode(null);
    }
  }, [pendingCode]);

  /** Switch back to editing mode. Session is kept for "Edit Again" → Run again flow. */
  const switchToEditor = useCallback(() => {
    setMode('editing');
    setPendingCode(null);
  }, []);

  useEffect(() => {
    if (options?.createOnMount) {
      createSession();
    }
    return () => {
      const id = sessionIdRef.current;
      if (id) {
        sessionManager.destroySession(id);
        sessionIdRef.current = null;
      }
    };
  }, [options?.createOnMount]); // eslint-disable-line react-hooks/exhaustive-deps -- cleanup on unmount only

  /** Flush pending code into session when session becomes available in terminal mode. */
  useEffect(() => {
    if (mode === 'terminal' && session && pendingCode) {
      writeCode(session, pendingCode);
    }
  }, [mode, session, pendingCode, writeCode]);

  return {
    session,
    mode,
    createSession,
    destroySession,
    ensureSession,
    switchToTerminal,
    switchToEditor,
    writeCode,
    setMode,
  };
}
