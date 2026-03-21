import type { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import type { JwtPayload } from '../middleware/auth.js';
import { buildTerminalSessionKeyFromJwt } from '../services/container-manager.js';
import {
  createTerminalShellSession,
  terminalRuntimeEnv,
  terminalWsExecutorKind,
  terminalWebsocketShellEnabled,
  type TerminalShellSession,
} from '../services/terminal-shell-session.js';

interface TerminalSocketData {
  user: JwtPayload;
  sessionKey: string;
  shell: TerminalShellSession;
}

type PtyMode = 'exec' | 'pty';

type PtyProcess = {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
  onData(listener: (data: string) => void): { dispose: () => void } | void;
  onExit(listener: (evt: { exitCode: number; signal?: number }) => void): { dispose: () => void } | void;
};

type PtySpawn = (
  file: string,
  args?: string[],
  opts?: {
    name?: string;
    cols?: number;
    rows?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  }
) => PtyProcess;

let cachedPtySpawn: PtySpawn | null | undefined;
function ensureNodePtySpawnHelperExecutable(requireFn: NodeRequire): void {
  try {
    const nodePtyPkg = requireFn.resolve('node-pty/package.json');
    const nodePtyRoot = path.dirname(nodePtyPkg);
    const platformArch = `${process.platform}-${process.arch}`;
    const candidates = [
      path.join(nodePtyRoot, 'prebuilds', platformArch, 'spawn-helper'),
      path.join(nodePtyRoot, 'build', 'Release', 'spawn-helper'),
    ];
    for (const helperPath of candidates) {
      if (!fs.existsSync(helperPath)) continue;
      try {
        fs.accessSync(helperPath, fs.constants.X_OK);
      } catch {
        try {
          fs.chmodSync(helperPath, 0o755);
          console.warn(`[terminal][pty] fixed execute permission on ${helperPath}`);
        } catch (chmodErr) {
          const message = chmodErr instanceof Error ? chmodErr.message : String(chmodErr);
          console.warn(`[terminal][pty] failed to chmod spawn-helper: ${message}`);
        }
      }
      // Stop at first existing helper path.
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[terminal][pty] unable to inspect node-pty helper path: ${message}`);
  }
}

function resolvePtySpawn(): PtySpawn | null {
  if (cachedPtySpawn !== undefined) return cachedPtySpawn;
  try {
    const require = createRequire(import.meta.url);
    ensureNodePtySpawnHelperExecutable(require);
    const mod = require('node-pty') as { spawn?: PtySpawn };
    cachedPtySpawn = typeof mod.spawn === 'function' ? mod.spawn : null;
  } catch {
    cachedPtySpawn = null;
  }
  return cachedPtySpawn;
}

function terminalWebsocketPtyEnabled(): boolean {
  if (!terminalWebsocketShellEnabled()) return false;
  return (process.env.TERMINAL_WS_PTY_ENABLED || 'true').trim().toLowerCase() !== 'false';
}

function createPtyForSocket(socket: Socket & { data: TerminalSocketData }): PtyProcess | null {
  if (!terminalWebsocketPtyEnabled()) return null;
  if (terminalWsExecutorKind() !== 'local_shell') return null;
  const spawnPty = resolvePtySpawn();
  if (!spawnPty) return null;
  const isWin = process.platform === 'win32';
  const candidates = isWin
    ? [process.env.ComSpec, 'cmd.exe', 'powershell.exe'].filter(Boolean) as string[]
    : [process.env.SHELL, '/bin/bash', '/bin/zsh', '/bin/sh'].filter(Boolean) as string[];

  for (const shell of candidates) {
    try {
      const args = isWin ? [] : ['-il'];
      return spawnPty(shell, args, {
        name: 'xterm-256color',
        cols: 120,
        rows: 32,
        cwd: socket.data.shell.getCwd(),
        env: terminalRuntimeEnv(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[terminal][pty] failed to spawn shell "${shell}": ${message}`);
    }
  }
  return null;
}

function asTerminalSocket(socket: Socket): Socket & { data: TerminalSocketData } {
  return socket as Socket & { data: TerminalSocketData };
}

/**
 * Namespace `/terminal`: JWT in `handshake.auth.token`, optional `handshake.auth.sessionId`
 * must match the server-derived key from the same JWT (same rules as `POST /api/terminal/session`).
 */
export function attachTerminalShellNamespace(io: Server): void {
  const nsp = io.of('/terminal');

  nsp.use((socket, next) => {
    if (!terminalWebsocketShellEnabled()) {
      next(new Error('Terminal websocket shell is disabled'));
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next(new Error('Server misconfiguration'));
      return;
    }
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string' || !token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const user = jwt.verify(token, secret) as JwtPayload;
      if (!user?.tenantId || !user?.userId) {
        next(new Error('Invalid token payload'));
        return;
      }
      const expected = buildTerminalSessionKeyFromJwt(user);
      const clientKey = socket.handshake.auth?.sessionId;
      if (typeof clientKey === 'string' && clientKey !== expected) {
        next(new Error('Session not authorized'));
        return;
      }
      const s = asTerminalSocket(socket);
      s.data.user = user;
      s.data.sessionKey = expected;
      s.data.shell = createTerminalShellSession({ sessionKey: expected });
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  nsp.on('connection', (socket) => {
    const s = asTerminalSocket(socket);
    const { shell } = s.data;
    const pty = createPtyForSocket(s);
    let mode: PtyMode = pty ? 'pty' : 'exec';

    socket.emit('terminal:ready', { mode });

    if (pty) {
      const dataSub = pty.onData((data: string) => {
        socket.emit('terminal:output', { requestId: '', channel: 'stdout', data });
      });
      const exitSub = pty.onExit((evt: { exitCode: number; signal?: number }) => {
        socket.emit('terminal:output', {
          requestId: '',
          channel: 'stderr',
          data: `\r\n[shell exited with code ${evt.exitCode}${evt.signal ? ` signal ${evt.signal}` : ''}]\r\n`,
        });
        mode = 'exec';
      });

      socket.on('terminal:input', (payload: unknown) => {
        const p = payload as { data?: string };
        const data = typeof p?.data === 'string' ? p.data : '';
        if (!data) return;
        pty.write(data);
      });

      socket.on('terminal:resize', (payload: unknown) => {
        const p = payload as { cols?: number; rows?: number };
        const cols = Number.isFinite(p?.cols) ? Number(p.cols) : 0;
        const rows = Number.isFinite(p?.rows) ? Number(p.rows) : 0;
        if (cols >= 20 && rows >= 5) {
          pty.resize(cols, rows);
        }
      });

      socket.on('terminal:exec', (payload: unknown) => {
        const p = payload as { requestId?: string; command?: string };
        const requestId = typeof p?.requestId === 'string' ? p.requestId : '';
        const command = typeof p?.command === 'string' ? p.command : '';
        if (!requestId) {
          socket.emit('terminal:error', { requestId: '', message: 'requestId required' });
          return;
        }
        if (!command.trim()) {
          socket.emit('terminal:done', { requestId, code: 0, signal: null, truncated: false });
          return;
        }
        pty.write(`${command}\n`);
        socket.emit('terminal:done', { requestId, code: 0, signal: null, truncated: false });
      });

      socket.on('disconnect', () => {
        dataSub?.dispose?.();
        exitSub?.dispose?.();
        try {
          pty.kill();
        } catch {
          /* ignore */
        }
        shell.killChild();
      });
      return;
    }

    socket.on('terminal:exec', async (payload: unknown) => {
      const p = payload as { requestId?: string; command?: string };
      const requestId = typeof p?.requestId === 'string' ? p.requestId : '';
      const command = typeof p?.command === 'string' ? p.command : '';
      if (!requestId) {
        socket.emit('terminal:error', { requestId: '', message: 'requestId required' });
        return;
      }
      if (shell.isRunning()) {
        socket.emit('terminal:error', { requestId, message: 'A command is already running' });
        return;
      }
      if (shell.tryChdir(command)) {
        socket.emit('terminal:output', {
          requestId,
          channel: 'stdout',
          data: shell.getCwd() + '\n',
        });
        socket.emit('terminal:done', { requestId, code: 0, signal: null, truncated: false });
        return;
      }
      try {
        const result = await shell.runCommand(command, {
          onStdout: (data: string) =>
            socket.emit('terminal:output', { requestId, channel: 'stdout', data }),
          onStderr: (data: string) =>
            socket.emit('terminal:output', { requestId, channel: 'stderr', data }),
        });
        socket.emit('terminal:done', {
          requestId,
          code: result.code,
          signal: result.signal,
          truncated: result.truncated,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Execution failed';
        socket.emit('terminal:error', { requestId, message });
      }
    });

    socket.on('disconnect', () => {
      shell.killChild();
    });
  });
}
