import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

const testAuthUser = vi.hoisted(() => ({
  userId: '507f1f77bcf86cd799439011',
  handle: 'moderator1',
  role: 'moderator' as const,
  tenantId: 'tenant-1',
}));

const sessionsFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user?: unknown }).user = { ...testAuthUser };
    next();
  },
}));

vi.mock('../middleware/role.js', () => ({
  requireModerator: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock('../config/db.js', () => ({
  getDb: () => ({
    collection: () => ({
      findOneAndUpdate: sessionsFindOneAndUpdate,
      findOne: vi.fn(),
      insertOne: vi.fn(),
      find: vi.fn(() => ({ sort: vi.fn(() => ({ toArray: vi.fn() })) })),
      updateOne: vi.fn(),
      aggregate: vi.fn(() => ({ toArray: vi.fn() })),
    }),
  }),
}));

import workshopsRoutes from './workshops.js';

async function requestJson(app: express.Express, method: string, path: string, body?: object) {
  const server = createServer(app);
  return new Promise<{ status: number; json: unknown }>((resolve, reject) => {
    server.listen(0, async () => {
      try {
        const port = (server.address() as AddressInfo).port;
        const res = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const json = (await res.json()) as unknown;
        resolve({ status: res.status, json });
      } catch (e) {
        reject(e);
      } finally {
        server.close();
      }
    });
  });
}

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/workshops', workshopsRoutes);
  return app;
}

describe('DELETE /api/workshops/:id archive', () => {
  beforeEach(() => {
    sessionsFindOneAndUpdate.mockReset();
  });

  it('archives workshop with metadata', async () => {
    sessionsFindOneAndUpdate.mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      status: 'ended',
      archivedBy: testAuthUser.userId,
    });
    const app = makeApp();
    const { status, json } = await requestJson(
      app,
      'DELETE',
      '/api/workshops/507f1f77bcf86cd799439012',
      { archiveReason: 'Workshop completed' }
    );
    expect(status).toBe(200);
    expect(json).toMatchObject({ archived: true });
  });
});

