import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Request } from 'express';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { ObjectId } from 'mongodb';

const VALID_WORKSHOP_OID = '507f1f77bcf86cd799439011';

const executeSandboxCodeMock = vi.hoisted(() => vi.fn());
const workshopFindOneMock = vi.hoisted(() => vi.fn());

const testAuthUser = vi.hoisted(() => ({
  userId: 'user-jwt',
  handle: 'h',
  role: 'attendee' as const,
  tenantId: 'tenant-1',
  sessionId: 'from-jwt',
  workshopId: undefined as string | undefined,
}));

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user?: unknown }).user = { ...testAuthUser };
    next();
  },
}));

vi.mock('../config/db.js', () => ({
  getDb: () => ({
    collection: () => ({ findOne: workshopFindOneMock }),
  }),
}));

vi.mock('../services/sandbox.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/sandbox.js')>();
  return { ...actual, executeSandboxCode: executeSandboxCodeMock };
});

import executeRoutes from './execute.js';
import { resolveSessionId } from '../workshop/session.js';
import { shouldBlockCloudExecutionForWorkshop } from '../workshop/policy.js';

async function post(app: express.Express, path: string, body: object) {
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
  app.use('/api/execute', executeRoutes);
  return app;
}

describe('resolveSessionId', () => {
  it('uses explicit string when provided', () => {
    const req = { user: { sessionId: 'jwt' } } as Request;
    expect(resolveSessionId(req, '  workshop-1  ')).toBe('workshop-1');
  });

  it('uses first element when explicit is string array', () => {
    const req = { user: {} } as Request;
    expect(resolveSessionId(req, ['arr-sess'])).toBe('arr-sess');
  });

  it('falls back to JWT sessionId then solo', () => {
    expect(resolveSessionId({ user: { sessionId: 'ws' } } as Request, undefined)).toBe('ws');
    expect(resolveSessionId({ user: {} } as Request, '')).toBe('solo');
  });
});

describe('POST /api/execute/repl', () => {
  beforeEach(() => {
    Object.assign(testAuthUser, {
      userId: 'user-jwt',
      sessionId: 'from-jwt',
      workshopId: undefined,
    });
    workshopFindOneMock.mockReset();
    executeSandboxCodeMock.mockReset();
    executeSandboxCodeMock.mockResolvedValue({
      success: true,
      output: [],
      executionTimeMs: 0,
    });
  });

  it('runs pattern-tier missions against sandbox execution path', async () => {
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/repl', {
      code: 'db.test.find()',
      missionId: 'mission-4',
    });
    expect(status).toBe(200);
    expect(json).toMatchObject({ tier: 'pattern', success: true });
    expect(executeSandboxCodeMock).toHaveBeenCalledWith('from-jwt', 'user-jwt', 'db.test.find()');
  });

  it('returns hold response for missions put on hold', async () => {
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/repl', {
      code: 'sh.status()',
      missionId: 'mission-2',
    });
    expect(status).toBe(409);
    expect(json).toMatchObject({ tier: 'hold', success: false, code: 'MISSION_ON_HOLD' });
    expect(executeSandboxCodeMock).not.toHaveBeenCalled();
  });

  it('delegates execute tier to executeSandboxCode with JWT session when body omits sessionId', async () => {
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/repl', {
      code: 'db.coll.find()',
      missionId: 'mission-1',
    });
    expect(status).toBe(200);
    expect(json).toMatchObject({ tier: 'execute', success: true });
    expect(executeSandboxCodeMock).toHaveBeenCalledWith('from-jwt', 'user-jwt', 'db.coll.find()');
  });

  it('prefers body sessionId over JWT for execute tier', async () => {
    const app = makeApp();
    await post(app, '/api/execute/repl', {
      code: 'db.x.find()',
      missionId: 'mission-1',
      sessionId: 'body-sess',
    });
    expect(executeSandboxCodeMock).toHaveBeenCalledWith('body-sess', 'user-jwt', 'db.x.find()');
  });

  it('returns 400 when code or missionId missing', async () => {
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/repl', { missionId: 'mission-1' });
    expect(status).toBe(400);
    expect(json).toMatchObject({ error: expect.any(String) });
  });
});

describe('POST /api/execute/run shares handler with /repl', () => {
  beforeEach(() => {
    Object.assign(testAuthUser, { sessionId: 'from-jwt', workshopId: undefined });
    workshopFindOneMock.mockReset();
    executeSandboxCodeMock.mockReset();
    executeSandboxCodeMock.mockResolvedValue({ success: true, output: [], executionTimeMs: 0 });
  });

  it('calls executeSandboxCode for execute tier', async () => {
    const app = makeApp();
    await post(app, '/api/execute/run', {
      code: 'db.a.find()',
      missionId: 'mission-12',
      sessionId: 's1',
    });
    expect(executeSandboxCodeMock).toHaveBeenCalledWith('s1', 'user-jwt', 'db.a.find()');
  });
});

describe('shouldBlockCloudExecutionForWorkshop', () => {
  beforeEach(() => {
    workshopFindOneMock.mockReset();
    Object.assign(testAuthUser, { sessionId: undefined, workshopId: undefined });
  });

  it('returns false when user has no workshop/session ids', async () => {
    const req = { user: { userId: 'u', tenantId: 't', handle: 'h', role: 'attendee' as const } } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
    expect(workshopFindOneMock).not.toHaveBeenCalled();
  });

  it('returns false for non-ObjectId session string (no DB lookup)', async () => {
    const req = {
      user: { userId: 'u', tenantId: 't', handle: 'h', role: 'attendee' as const, sessionId: 'from-jwt' },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
    expect(workshopFindOneMock).not.toHaveBeenCalled();
  });

  it('returns false when workshop doc is missing (stale id)', async () => {
    workshopFindOneMock.mockResolvedValueOnce(null);
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        sessionId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
  });

  it('scopes workshop lookup by tenantId when present', async () => {
    workshopFindOneMock.mockResolvedValueOnce({ executionMode: 'sandbox_only' });
    const req = {
      user: {
        userId: 'u',
        tenantId: 'tenant-abc',
        handle: 'h',
        role: 'attendee' as const,
        workshopId: VALID_WORKSHOP_OID,
      },
    } as Request;
    await shouldBlockCloudExecutionForWorkshop(req);
    expect(workshopFindOneMock).toHaveBeenCalledWith(
      { _id: new ObjectId(VALID_WORKSHOP_OID), tenantId: 'tenant-abc' },
      { projection: { executionMode: 1, cloudExecutionAllowed: 1 } }
    );
  });

  it('returns true when executionMode is sandbox_only', async () => {
    workshopFindOneMock.mockResolvedValueOnce({ executionMode: 'sandbox_only' });
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        workshopId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(true);
  });

  it('returns false when cloudExecutionAllowed true even if executionMode is sandbox_only', async () => {
    workshopFindOneMock.mockResolvedValueOnce({
      executionMode: 'sandbox_only',
      cloudExecutionAllowed: true,
    });
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        sessionId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
  });

  it('returns true when cloudExecutionAllowed false even if executionMode is atlas_connected', async () => {
    workshopFindOneMock.mockResolvedValueOnce({
      executionMode: 'atlas_connected',
      cloudExecutionAllowed: false,
    });
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        sessionId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(true);
  });

  it('returns false for atlas_connected and hybrid', async () => {
    for (const executionMode of ['atlas_connected', 'hybrid'] as const) {
      workshopFindOneMock.mockResolvedValueOnce({ executionMode });
      const req = {
        user: {
          userId: 'u',
          tenantId: 't',
          handle: 'h',
          role: 'attendee' as const,
          sessionId: VALID_WORKSHOP_OID,
        },
      } as Request;
      expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
    }
  });

  it('returns false when executionMode unset (legacy workshop)', async () => {
    workshopFindOneMock.mockResolvedValueOnce({});
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        sessionId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(false);
  });

  it('returns true for unknown executionMode values', async () => {
    workshopFindOneMock.mockResolvedValueOnce({ executionMode: 'future_mode' });
    const req = {
      user: {
        userId: 'u',
        tenantId: 't',
        handle: 'h',
        role: 'attendee' as const,
        sessionId: VALID_WORKSHOP_OID,
      },
    } as Request;
    expect(await shouldBlockCloudExecutionForWorkshop(req)).toBe(true);
  });
});

describe('POST /api/execute/cloud', () => {
  beforeEach(() => {
    Object.assign(testAuthUser, { sessionId: 'from-jwt', workshopId: undefined });
    workshopFindOneMock.mockReset();
  });

  it('returns simulation response when atlas proxy is disabled', async () => {
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/cloud', {
      code: 'sh.status()',
    });
    expect(status).toBe(200);
    expect(json).toMatchObject({ tier: 'simulate', success: true });
  });

  it('returns 403 when workshop is sandbox_only', async () => {
    Object.assign(testAuthUser, { sessionId: VALID_WORKSHOP_OID, workshopId: undefined });
    workshopFindOneMock.mockResolvedValue({ executionMode: 'sandbox_only' });
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/cloud', { code: 'sh.status()' });
    expect(status).toBe(403);
    expect(json).toMatchObject({ code: 'WORKSHOP_EXECUTION_MODE' });
  });

  it('allows cloud when workshop is atlas_connected', async () => {
    Object.assign(testAuthUser, { sessionId: VALID_WORKSHOP_OID, workshopId: undefined });
    workshopFindOneMock.mockResolvedValue({ executionMode: 'atlas_connected' });
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/cloud', { code: 'sh.status()' });
    expect(status).toBe(200);
    expect(json).toMatchObject({ tier: 'simulate', success: true });
  });

  it('returns 403 when cloudExecutionAllowed is false', async () => {
    Object.assign(testAuthUser, { sessionId: VALID_WORKSHOP_OID, workshopId: undefined });
    workshopFindOneMock.mockResolvedValue({
      executionMode: 'atlas_connected',
      cloudExecutionAllowed: false,
    });
    const app = makeApp();
    const { status, json } = await post(app, '/api/execute/cloud', { code: 'sh.status()' });
    expect(status).toBe(403);
    expect(json).toMatchObject({ code: 'WORKSHOP_EXECUTION_MODE' });
  });
});
