import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer, type Server as HttpServer } from 'http';
import type { AddressInfo } from 'net';
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';
import type { Server } from 'socket.io';
import { initSocketIO } from './metrics.js';
import { signToken } from '../middleware/auth.js';

describe('Socket.IO /terminal namespace', () => {
  let httpServer: HttpServer;
  let io: Server;
  let port: number;
  const jwtPayload = {
    userId: 'user-ws',
    handle: 'h',
    role: 'attendee' as const,
    tenantId: 'tenant-ws',
    workshopId: 'workshop-ws',
  };
  const expectedSessionKey = 'tenant-ws:user-ws:workshop-ws';

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'terminal-test-secret');
    vi.stubEnv('CONTAINER_TERMINAL_ENABLED', 'true');
    vi.stubEnv('TERMINAL_WS_SHELL_ENABLED', 'true');
    vi.stubEnv('TERMINAL_WS_PTY_ENABLED', 'false');
    httpServer = createServer((_req, res) => {
      res.statusCode = 404;
      res.end();
    });
    io = initSocketIO(httpServer);
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    port = (httpServer.address() as AddressInfo).port;
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        io.disconnectSockets(true);
        io.close(() => {
          vi.unstubAllEnvs();
          if (httpServer.listening) {
            httpServer.close(() => resolve());
          } else {
            resolve();
          }
        });
      })
  );

  function connect(opts: { token?: string; sessionId?: string }): ClientSocket {
    const url = `http://127.0.0.1:${port}/terminal`;
    return ioClient(url, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: {
        token: opts.token,
        sessionId: opts.sessionId,
      },
      autoConnect: true,
      reconnection: false,
      forceNew: true,
    });
  }

  it('refuses connection when TERMINAL_WS_SHELL_ENABLED is off', async () => {
    vi.stubEnv('TERMINAL_WS_SHELL_ENABLED', 'false');
    const token = signToken(jwtPayload);
    const socket = connect({ token, sessionId: expectedSessionKey });
    const err = await new Promise<Error>((resolve) => {
      socket.on('connect_error', resolve);
    });
    expect(String(err.message)).toMatch(/disabled/i);
    socket.close();
    vi.stubEnv('TERMINAL_WS_SHELL_ENABLED', 'true');
  });

  it('refuses connection without token', async () => {
    const socket = connect({});
    const err = await new Promise<Error>((resolve) => {
      socket.on('connect_error', resolve);
    });
    expect(String(err.message)).toMatch(/Authentication|required/i);
    socket.close();
  });

  it('refuses connection when sessionId does not match JWT', async () => {
    const token = signToken(jwtPayload);
    const socket = connect({ token, sessionId: 'wrong:key:here' });
    const err = await new Promise<Error>((resolve) => {
      socket.on('connect_error', resolve);
    });
    expect(String(err.message)).toMatch(/not authorized|Session/i);
    socket.close();
  });

  it('streams echo output and done', async () => {
    const token = signToken(jwtPayload);
    const socket = connect({ token, sessionId: expectedSessionKey });
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
    });

    const requestId = 'r1';
    const outputs: { channel: string; data: string }[] = [];
    socket.on('terminal:output', (p: { channel: string; data: string }) => {
      outputs.push({ channel: p.channel, data: p.data });
    });
    const done = new Promise<Record<string, unknown>>((resolve) => {
      socket.once('terminal:done', resolve);
    });

    const cmd = process.platform === 'win32' ? 'echo ws-test' : 'echo ws-test';
    socket.emit('terminal:exec', { requestId, command: cmd });

    const d = await done;
    expect(d.requestId).toBe(requestId);
    expect(d.code).toBe(0);
    expect(outputs.map((o) => o.data).join('')).toMatch(/ws-test/);

    socket.close();
  });
});
