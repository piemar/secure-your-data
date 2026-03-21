import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user?: unknown }).user = {
      userId: 'u1',
      tenantId: 't1',
      workshopId: 'w1',
      handle: 'u1',
      role: 'attendee',
    };
    next();
  },
}));

vi.mock('../services/container-manager.js', () => ({
  ensureTerminalSession: vi.fn().mockResolvedValue({
    enabled: true,
    created: true,
    mode: 'terminal',
    sessionId: 't1:u1:w1',
    message: 'Terminal session prepared',
  }),
}));

import terminalRoutes from './terminal.js';

async function postSession(app: express.Express) {
  const server = createServer(app);
  return new Promise<{ status: number; json: Record<string, unknown> }>((resolve, reject) => {
    server.listen(0, async () => {
      try {
        const port = (server.address() as AddressInfo).port;
        const res = await fetch(`http://127.0.0.1:${port}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const json = (await res.json()) as Record<string, unknown>;
        resolve({ status: res.status, json });
      } catch (e) {
        reject(e);
      } finally {
        server.close();
      }
    });
  });
}

describe('POST /api/terminal/session', () => {
  beforeEach(() => {
    vi.stubEnv('CONTAINER_TERMINAL_ENABLED', 'true');
    vi.stubEnv('TERMINAL_WS_SHELL_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes shellStream.executor local_shell by default', async () => {
    delete process.env.TERMINAL_WS_EXECUTOR;
    const app = express();
    app.use(express.json());
    app.use('/', terminalRoutes);
    const { status, json } = await postSession(app);
    expect(status).toBe(200);
    const stream = json.shellStream as Record<string, unknown> | undefined;
    expect(stream?.executor).toBe('local_shell');
    expect(stream?.namespace).toBe('/terminal');
  });

  it('includes shellStream.executor docker_persistent when TERMINAL_WS_EXECUTOR=docker', async () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker');
    const app = express();
    app.use(express.json());
    app.use('/', terminalRoutes);
    const { status, json } = await postSession(app);
    expect(status).toBe(200);
    const stream = json.shellStream as Record<string, unknown> | undefined;
    expect(stream?.executor).toBe('docker_persistent');
  });
});
