/**
 * PTY session lifecycle: create/destroy/reconnect. Phase 6.
 * When backend exposes WebSocket at /api/pty, connects and provides a live TerminalSession.
 * Falls back to no-op session when WebSocket is unavailable.
 */
import type { TerminalSession } from '@/types/ide';

export interface SessionManager {
  createSession(): Promise<TerminalSession>;
  getSession(sessionId: string): TerminalSession | undefined;
  destroySession(sessionId: string): void;
}

function getPtyWebSocketUrl(): string {
  if (typeof window === 'undefined') return '';
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/api/pty`;
}

/** Create a live session backed by WebSocket to /api/pty, or no-op when unavailable. */
export function createSessionManager(): SessionManager {
  const sessions = new Map<string, TerminalSession>();

  return {
    async createSession(): Promise<TerminalSession> {
      const id = `session-${Date.now()}`;
      const ptyId = `pty-${id}`;
      const wsUrl = getPtyWebSocketUrl();

      if (!wsUrl) {
        const noop: TerminalSession = {
          id,
          ptyId,
          write: () => {},
          resize: () => {},
          kill: () => {},
          onData: () => () => {},
          onClose: () => () => {},
        };
        sessions.set(id, noop);
        return noop;
      }

      try {
        const ws = new WebSocket(wsUrl);
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
          ws.onopen = () => {
            clearTimeout(t);
            resolve();
          };
          ws.onerror = () => {
            clearTimeout(t);
            reject(new Error('WebSocket error'));
          };
        });

        const dataListeners: Array<(data: string) => void> = [];
        const closeListeners: Array<() => void> = [];

        ws.onmessage = (event: MessageEvent) => {
          const data = typeof event.data === 'string' ? event.data : '';
          dataListeners.forEach((cb) => {
            try { cb(data); } catch { /* ignore */ }
          });
        };
        ws.onclose = () => {
          closeListeners.forEach((cb) => {
            try { cb(); } catch { /* ignore */ }
          });
        };

        const session: TerminalSession = {
          id,
          ptyId,
          write(data: string) {
            if (ws.readyState === WebSocket.OPEN) ws.send(data);
          },
          resize(cols: number, rows: number) {
            if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          },
          kill() {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'kill' }));
              ws.close();
            }
          },
          onData(cb: (data: string) => void) {
            dataListeners.push(cb);
            return () => {
              const i = dataListeners.indexOf(cb);
              if (i !== -1) dataListeners.splice(i, 1);
            };
          },
          onClose(cb: () => void) {
            closeListeners.push(cb);
            return () => {
              const i = closeListeners.indexOf(cb);
              if (i !== -1) closeListeners.splice(i, 1);
            };
          },
        };
        sessions.set(id, session);
        return session;
      } catch {
        const noop: TerminalSession = {
          id,
          ptyId,
          write: () => {},
          resize: () => {},
          kill: () => {},
          onData: () => () => {},
          onClose: () => () => {},
        };
        sessions.set(id, noop);
        return noop;
      }
    },

    getSession(sessionId: string) {
      return sessions.get(sessionId);
    },

    destroySession(sessionId: string) {
      const s = sessions.get(sessionId);
      if (s && 'kill' in s) s.kill();
      sessions.delete(sessionId);
    },
  };
}

export const sessionManager = createSessionManager();
