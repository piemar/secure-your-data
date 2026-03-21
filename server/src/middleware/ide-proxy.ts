import { Router, type Request, type Response, type NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage } from 'http';
import type { Socket } from 'net';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { verifyIdeAccessToken, type IdeAccessTokenPayload } from '../services/ide-access-token.js';

function ideFeatureEnabled(): boolean {
  return process.env.FULL_IDE_ENABLED === 'true';
}

function ideProxyTarget(): string {
  const raw = (process.env.FULL_IDE_BASE_URL || 'http://localhost:13337').trim();
  return raw.replace(/\/+$/, '') || 'http://localhost:13337';
}

async function assertIdeSessionOwnership(payload: IdeAccessTokenPayload, routeSessionId: string): Promise<boolean> {
  if (payload.sessionId !== routeSessionId) return false;
  const db = getDb();
  const doc = await db.collection(COLLECTIONS.IDE_SESSIONS).findOne({ sessionKey: routeSessionId });
  if (!doc) return false;
  return doc.tenantId === payload.tenantId && doc.userId === payload.userId;
}

function parseIdeUpgradeUrl(rawUrl: string): {
  sessionId: string;
  remainderPath: string;
  searchParams: URLSearchParams;
} | null {
  const q = rawUrl.indexOf('?');
  const pathPart = q >= 0 ? rawUrl.slice(0, q) : rawUrl;
  const query = q >= 0 ? rawUrl.slice(q) : '';
  if (!pathPart.startsWith('/ide/')) return null;
  const afterPrefix = pathPart.slice('/ide/'.length);
  const slash = afterPrefix.indexOf('/');
  const sessionId = slash === -1 ? afterPrefix : afterPrefix.slice(0, slash);
  const remainderPath = slash === -1 ? '/' : afterPrefix.slice(slash);
  if (!sessionId) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(sessionId);
  } catch {
    return null;
  }
  return { sessionId: decoded, remainderPath: remainderPath || '/', searchParams: new URLSearchParams(query) };
}

function stripAccessTokenFromSearchParams(sp: URLSearchParams): string {
  sp.delete('access_token');
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export async function validateIdeProxyHttp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!ideFeatureEnabled()) {
    res.status(503).json({ error: 'Full IDE mode is disabled' });
    return;
  }
  const rawSid = req.params.sessionId;
  const routeSessionId =
    typeof rawSid === 'string' ? rawSid : Array.isArray(rawSid) ? rawSid[0] : '';
  if (!routeSessionId) {
    res.status(400).json({ error: 'Missing IDE session id' });
    return;
  }
  const rawTok = req.query.access_token;
  const token =
    typeof rawTok === 'string'
      ? rawTok
      : Array.isArray(rawTok) && typeof rawTok[0] === 'string'
        ? rawTok[0]
        : null;
  if (!token) {
    res.status(401).json({ error: 'access_token query parameter is required' });
    return;
  }
  const payload = verifyIdeAccessToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired IDE access token' });
    return;
  }
  const ok = await assertIdeSessionOwnership(payload, routeSessionId);
  if (!ok) {
    res.status(403).json({ error: 'IDE session not found or access denied' });
    return;
  }
  next();
}

let proxySingleton: ReturnType<typeof createProxyMiddleware> | null = null;

function stripAccessTokenFromReqUrl(req: IncomingMessage): string {
  const rel = req.url || '/';
  const base = 'http://127.0.0.1';
  try {
    const u = new URL(rel, base);
    u.searchParams.delete('access_token');
    const q = u.searchParams.toString();
    return u.pathname + (q ? `?${q}` : '');
  } catch {
    return rel;
  }
}

function getIdeProxyMiddleware(): ReturnType<typeof createProxyMiddleware> {
  if (!proxySingleton) {
    proxySingleton = createProxyMiddleware({
      target: ideProxyTarget(),
      changeOrigin: true,
      ws: true,
      on: {
        proxyReq: (proxyReq, req) => {
          proxyReq.path = stripAccessTokenFromReqUrl(req as IncomingMessage);
        },
        proxyReqWs: (proxyReq, req) => {
          proxyReq.path = stripAccessTokenFromReqUrl(req as IncomingMessage);
        },
      },
    });
  }
  return proxySingleton;
}

function validateIdeProxyHttpSync(req: Request, res: Response, next: NextFunction): void {
  void validateIdeProxyHttp(req, res, next).catch(next);
}

export function createIdeProxyRouter(): Router {
  const router = Router({ mergeParams: true });
  router.use('/:sessionId', validateIdeProxyHttpSync, getIdeProxyMiddleware());
  return router;
}

export function attachIdeProxyUpgrade(
  httpServer: { on: (ev: 'upgrade', fn: (req: IncomingMessage, socket: Socket, head: Buffer) => void) => void }
): void {
  httpServer.on('upgrade', (req, socket, head) => {
    const rawUrl = req.url || '';
    if (!rawUrl.startsWith('/ide/')) return;

    void (async () => {
      try {
      if (!ideFeatureEnabled()) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      const parsed = parseIdeUpgradeUrl(rawUrl);
      if (!parsed) {
        socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      const token = parsed.searchParams.get('access_token');
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      const payload = verifyIdeAccessToken(token);
      if (!payload) {
        socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      const ok = await assertIdeSessionOwnership(payload, parsed.sessionId);
      if (!ok) {
        socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      parsed.searchParams.delete('access_token');
      const newQuery = stripAccessTokenFromSearchParams(parsed.searchParams);
      req.url = `${parsed.remainderPath}${newQuery}`;

      const mw = getIdeProxyMiddleware();
      if (typeof mw.upgrade === 'function') {
        mw.upgrade(req, socket, head);
      } else {
        socket.write('HTTP/1.1 501 Not Implemented\r\nConnection: close\r\n\r\n');
        socket.destroy();
      }
      } catch {
        socket.write('HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n');
        socket.destroy();
      }
    })();
  });
}
