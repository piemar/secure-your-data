import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

const testAuthUser = vi.hoisted(() => ({
  userId: '507f1f77bcf86cd799439011',
  handle: 'player1',
  role: 'attendee' as const,
  tenantId: 'tenant-1',
  sessionId: undefined as string | undefined,
  workshopId: undefined as string | undefined,
}));

const progressFindOne = vi.hoisted(() => vi.fn());
const progressFindOneAndUpdate = vi.hoisted(() => vi.fn());
const progressFind = vi.hoisted(() => vi.fn());
const progressSort = vi.hoisted(() => vi.fn());
const progressLimit = vi.hoisted(() => vi.fn());
const progressProject = vi.hoisted(() => vi.fn());
const progressToArray = vi.hoisted(() => vi.fn());
const usersFindOne = vi.hoisted(() => vi.fn());

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user?: unknown }).user = { ...testAuthUser };
    next();
  },
}));

vi.mock('../config/db.js', () => ({
  getDb: () => ({
    collection: (name: string) => {
      if (name === 'player_progress')
        return {
          findOne: progressFindOne,
          findOneAndUpdate: progressFindOneAndUpdate,
          find: progressFind,
        };
      if (name === 'users') return { findOne: usersFindOne };
      return { findOne: vi.fn() };
    },
  }),
}));

import playersRoutes from './players.js';

async function getJson(app: express.Express, path: string) {
  const server = createServer(app);
  return new Promise<{ status: number; json: unknown }>((resolve, reject) => {
    server.listen(0, async () => {
      try {
        const port = (server.address() as AddressInfo).port;
        const res = await fetch(`http://127.0.0.1:${port}${path}`);
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
  app.use('/api/players', playersRoutes);
  return app;
}

describe('GET /api/players/me', () => {
  beforeEach(() => {
    progressFindOne.mockReset();
    progressFindOneAndUpdate.mockReset();
    progressFind.mockReset();
    progressSort.mockReset();
    progressLimit.mockReset();
    progressProject.mockReset();
    progressToArray.mockReset();
    usersFindOne.mockReset();
    Object.assign(testAuthUser, {
      userId: '507f1f77bcf86cd799439011',
      sessionId: undefined,
      workshopId: undefined,
    });
  });

  const minimalProgress = {
    userId: '507f1f77bcf86cd799439011',
    handle: 'player1',
    tenantId: 'tenant-1',
    xp: 0,
    rank: 'Script Kiddie',
    level: 1,
  };

  it('returns 404 when player progress missing', async () => {
    progressFindOne.mockResolvedValue(null);
    usersFindOne.mockResolvedValue(null);
    const app = makeApp();
    const { status } = await getJson(app, '/api/players/me');
    expect(status).toBe(404);
  });

  it('aligns workshopId and sessionId from JWT workshopId', async () => {
    testAuthUser.workshopId = 'ws-from-jwt';
    testAuthUser.sessionId = undefined;
    progressFindOne.mockResolvedValue({ ...minimalProgress });
    usersFindOne.mockResolvedValue({ role: 'attendee', tenantId: 'tenant-1', workshopId: null });
    const app = makeApp();
    const { status, json } = await getJson(app, '/api/players/me');
    expect(status).toBe(200);
    expect(json).toMatchObject({ workshopId: 'ws-from-jwt', sessionId: 'ws-from-jwt' });
  });

  it('prefers progress.workshopId and mirrors to sessionId', async () => {
    testAuthUser.workshopId = 'jwt-ws';
    progressFindOne.mockResolvedValue({
      ...minimalProgress,
      workshopId: 'progress-ws',
    });
    usersFindOne.mockResolvedValue({ role: 'attendee', tenantId: 'tenant-1' });
    const app = makeApp();
    const { status, json } = await getJson(app, '/api/players/me');
    expect(status).toBe(200);
    expect(json).toMatchObject({ workshopId: 'progress-ws', sessionId: 'progress-ws' });
  });

  it('uses JWT sessionId when progress has no workshop id', async () => {
    testAuthUser.sessionId = 'session-from-jwt';
    testAuthUser.workshopId = undefined;
    progressFindOne.mockResolvedValue({ ...minimalProgress });
    usersFindOne.mockResolvedValue(null);
    const app = makeApp();
    const { status, json } = await getJson(app, '/api/players/me');
    expect(status).toBe(200);
    expect(json).toMatchObject({ workshopId: 'session-from-jwt', sessionId: 'session-from-jwt' });
  });

  it('returns null for both ids when no workshop context', async () => {
    progressFindOne.mockResolvedValue({ ...minimalProgress });
    usersFindOne.mockResolvedValue({ role: 'attendee', tenantId: 'tenant-1' });
    const app = makeApp();
    const { status, json } = await getJson(app, '/api/players/me');
    expect(status).toBe(200);
    expect(json).toMatchObject({ workshopId: null, sessionId: null });
  });
});

describe('POST /api/players/sync', () => {
  beforeEach(() => {
    progressFindOne.mockReset();
    progressFindOneAndUpdate.mockReset();
    usersFindOne.mockReset();
    Object.assign(testAuthUser, {
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      sessionId: undefined,
      workshopId: 'ws-from-jwt',
    });
  });

  it('returns 404 when no server profile exists', async () => {
    progressFindOne.mockResolvedValueOnce(null);
    const app = makeApp();
    const { status, json } = await postJson(app, '/api/players/sync', { player: { xp: 99 } });
    expect(status).toBe(404);
    expect(json).toMatchObject({ error: 'Player not found' });
    expect(progressFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('merges numeric stats with max(server, local) and unions mission lists', async () => {
    progressFindOne.mockResolvedValueOnce({
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      xp: 100,
      totalScore: 200,
      hintsUsed: 2,
      hintXpPenalty: 10,
      chaosEventsSurvived: 1,
      avatarId: 'ghost',
      preferredDifficulty: 'guided',
      completedMissions: ['mission-1'],
      achievements: ['ach-a'],
      workshopId: 'old-ws',
    });

    const mergedDoc = {
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      xp: 300,
      totalScore: 200,
      hintsUsed: 5,
      hintXpPenalty: 10,
      chaosEventsSurvived: 3,
      rank: 'Script Kiddie',
      level: 2,
      completedMissions: ['mission-1', 'mission-2'],
      achievements: ['ach-a', 'ach-b'],
    };
    progressFindOneAndUpdate.mockResolvedValueOnce(mergedDoc);

    const app = makeApp();
    const { status, json } = await postJson(app, '/api/players/sync', {
      player: {
        xp: 300,
        totalScore: 50,
        hintsUsed: 5,
        hintXpPenalty: 5,
        chaosEventsSurvived: 3,
        completedMissions: ['mission-2'],
        achievements: ['ach-b'],
      },
    });

    expect(status).toBe(200);
    expect(json).toEqual(mergedDoc);

    expect(progressFindOne).toHaveBeenCalledWith({
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
    });

    const [, update] = progressFindOneAndUpdate.mock.calls[0] as [
      Record<string, string>,
      { $set: Record<string, unknown> },
      { returnDocument: string },
    ];

    expect(update.$set.xp).toBe(300);
    expect(update.$set.totalScore).toBe(200);
    expect(update.$set.hintsUsed).toBe(5);
    expect(update.$set.hintXpPenalty).toBe(10);
    expect(update.$set.chaosEventsSurvived).toBe(3);
    expect(update.$set.completedMissions).toEqual(expect.arrayContaining(['mission-1', 'mission-2']));
    expect(update.$set.completedMissions).toHaveLength(2);
    expect(update.$set.achievements).toEqual(expect.arrayContaining(['ach-a', 'ach-b']));
    expect(update.$set.workshopId).toBe('ws-from-jwt');
    expect(update.$set.tenantId).toBe('tenant-1');
  });

  it('prefers local avatarId and valid preferredDifficulty', async () => {
    progressFindOne.mockResolvedValueOnce({
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      xp: 0,
      totalScore: 0,
      hintsUsed: 0,
      hintXpPenalty: 0,
      chaosEventsSurvived: 0,
      avatarId: 'ghost',
      preferredDifficulty: 'guided',
      completedMissions: [],
      achievements: [],
    });

    progressFindOneAndUpdate.mockImplementationOnce(async (_f, u: { $set: Record<string, unknown> }) => ({
      ...u.$set,
      userId: '507f1f77bcf86cd799439011',
    }));

    const app = makeApp();
    const { status } = await postJson(app, '/api/players/sync', {
      player: {
        avatarId: 'neon',
        preferredDifficulty: 'expert',
      },
    });

    expect(status).toBe(200);
    const [, update] = progressFindOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
    ];
    expect(update.$set.avatarId).toBe('neon');
    expect(update.$set.preferredDifficulty).toBe('expert');
  });

  it('ignores invalid local preferredDifficulty and coerces non-finite xp for max', async () => {
    progressFindOne.mockResolvedValueOnce({
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      xp: 80,
      totalScore: 0,
      hintsUsed: 0,
      hintXpPenalty: 0,
      chaosEventsSurvived: 0,
      avatarId: 'ghost',
      preferredDifficulty: 'challenge',
      completedMissions: [],
      achievements: [],
    });

    progressFindOneAndUpdate.mockImplementationOnce(async (_f, u: { $set: Record<string, unknown> }) => u.$set);

    const app = makeApp();
    await postJson(app, '/api/players/sync', {
      player: {
        xp: Number.NaN,
        preferredDifficulty: 'not-a-mode',
      },
    });

    const [, update] = progressFindOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
    ];
    expect(update.$set.xp).toBe(80);
    expect(update.$set.preferredDifficulty).toBe('challenge');
    expect(update.$set.rank).toBe('Script Kiddie');
    expect(update.$set.level).toBe(1);
  });

  it('recomputes rank and level from merged xp', async () => {
    progressFindOne.mockResolvedValueOnce({
      userId: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-1',
      xp: 0,
      totalScore: 0,
      hintsUsed: 0,
      hintXpPenalty: 0,
      chaosEventsSurvived: 0,
      avatarId: 'ghost',
      preferredDifficulty: 'guided',
      completedMissions: [],
      achievements: [],
    });

    progressFindOneAndUpdate.mockImplementationOnce(async (_f, u: { $set: Record<string, unknown> }) => u.$set);

    const app = makeApp();
    await postJson(app, '/api/players/sync', {
      player: { xp: 600 },
    });

    const [, update] = progressFindOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
    ];
    expect(update.$set.xp).toBe(600);
    expect(update.$set.rank).toBe('Query Cadet');
    expect(update.$set.level).toBe(3);
  });
});

describe('GET /api/players/leaderboard', () => {
  beforeEach(() => {
    progressFind.mockReset();
    progressSort.mockReset();
    progressLimit.mockReset();
    progressProject.mockReset();
    progressToArray.mockReset();
    Object.assign(testAuthUser, {
      tenantId: 'tenant-1',
      workshopId: 'ws-jwt',
      sessionId: undefined,
    });
    progressFind.mockReturnValue({
      sort: progressSort.mockReturnValue({
        limit: progressLimit.mockReturnValue({
          project: progressProject.mockReturnValue({
            toArray: progressToArray,
          }),
        }),
      }),
    });
  });

  it('filters leaderboard by tenant and JWT workshop scope', async () => {
    progressToArray.mockResolvedValue([{ handle: 'p1', totalScore: 100 }]);
    const app = makeApp();
    const { status, json } = await getJson(app, '/api/players/leaderboard');
    expect(status).toBe(200);
    expect(progressFind).toHaveBeenCalledWith({ tenantId: 'tenant-1', workshopId: 'ws-jwt' });
    expect(json).toMatchObject([{ handle: 'p1', totalScore: 100, position: 1 }]);
  });

  it('allows explicit workshopId query to override JWT workshop scope', async () => {
    progressToArray.mockResolvedValue([{ handle: 'p2', totalScore: 50 }]);
    const app = makeApp();
    const { status } = await getJson(app, '/api/players/leaderboard?workshopId=ws-query');
    expect(status).toBe(200);
    expect(progressFind).toHaveBeenCalledWith({ tenantId: 'tenant-1', workshopId: 'ws-query' });
  });
});
