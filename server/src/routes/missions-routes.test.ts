import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

const testAuthUser = vi.hoisted(() => ({
  userId: '507f1f77bcf86cd799439011',
  handle: 'player1',
  role: 'attendee' as const,
  tenantId: 'tenant-1',
  workshopId: '507f1f77bcf86cd799439012',
  sessionId: undefined as string | undefined,
}));

const workshopFindOne = vi.hoisted(() => vi.fn());
const progressFindOneAndUpdate = vi.hoisted(() => vi.fn());
const progressUpdateOne = vi.hoisted(() => vi.fn());
const metricsInsertOne = vi.hoisted(() => vi.fn());

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user?: unknown }).user = { ...testAuthUser };
    next();
  },
}));

vi.mock('../config/db.js', () => ({
  getDb: () => ({
    collection: (name: string) => {
      if (name === 'workshop_sessions') return { findOne: workshopFindOne };
      if (name === 'player_progress') {
        return {
          findOneAndUpdate: progressFindOneAndUpdate,
          updateOne: progressUpdateOne,
        };
      }
      if (name === 'metrics_events') return { insertOne: metricsInsertOne };
      return { findOne: vi.fn() };
    },
  }),
}));

import missionsRoutes from './missions.js';

async function postJson(app: express.Express, path: string, body: object) {
  const server = createServer(app);
  return new Promise<{ status: number; json: unknown }>((resolve, reject) => {
    server.listen(0, async () => {
      try {
        const port = (server.address() as AddressInfo).port;
        const res = await fetch(`http://127.0.0.1:${port}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
  app.use('/api/missions', missionsRoutes);
  return app;
}

describe('POST /api/missions/:missionId/complete workshop mission guard', () => {
  beforeEach(() => {
    workshopFindOne.mockReset();
    progressFindOneAndUpdate.mockReset();
    progressUpdateOne.mockReset();
    metricsInsertOne.mockReset();
    Object.assign(testAuthUser, {
      tenantId: 'tenant-1',
      workshopId: '507f1f77bcf86cd799439012',
      sessionId: undefined,
    });
  });

  it('returns 403 when mission is not enabled for workshop', async () => {
    workshopFindOne.mockResolvedValue({ missionIds: ['mission-1', 'mission-2'] });
    const app = makeApp();
    const { status, json } = await postJson(app, '/api/missions/mission-20/complete', { xpEarned: 100 });
    expect(status).toBe(403);
    expect(json).toMatchObject({ error: 'Mission is not enabled for this workshop session' });
    expect(progressFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('completes mission when mission is enabled for workshop', async () => {
    workshopFindOne.mockResolvedValue({ missionIds: ['mission-20'] });
    progressFindOneAndUpdate.mockResolvedValue({
      userId: testAuthUser.userId,
      xp: 100,
      totalScore: 100,
      completedMissions: ['mission-20'],
    });

    const app = makeApp();
    const { status } = await postJson(app, '/api/missions/mission-20/complete', { xpEarned: 100 });
    expect(status).toBe(200);
    expect(progressFindOneAndUpdate).toHaveBeenCalled();
    expect(metricsInsertOne).toHaveBeenCalled();
  });
});

