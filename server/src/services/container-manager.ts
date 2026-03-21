import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import type { JwtPayload } from '../middleware/auth.js';
import { signIdeAccessToken } from './ide-access-token.js';

/** Workshop scope for terminal/IDE session keys (matches `/api/terminal/session` body). */
export function workshopScopeFromJwt(user: Pick<JwtPayload, 'workshopId' | 'sessionId'>): string | undefined {
  return user.workshopId || user.sessionId;
}

export function buildTerminalSessionKey(params: {
  tenantId: string;
  userId: string;
  workshopId?: string;
}): string {
  return `${params.tenantId}:${params.userId}:${params.workshopId || 'solo'}`;
}

export function buildTerminalSessionKeyFromJwt(user: JwtPayload): string {
  return buildTerminalSessionKey({
    tenantId: user.tenantId,
    userId: user.userId,
    workshopId: workshopScopeFromJwt(user),
  });
}

function terminalEnabled(): boolean {
  return process.env.CONTAINER_TERMINAL_ENABLED === 'true';
}

function ideEnabled(): boolean {
  return process.env.FULL_IDE_ENABLED === 'true';
}

/** Optional absolute prefix for `workspaceUrl` (e.g. https://api.example.com). Omit for same-origin relative paths. */
function publicApiUrlPrefix(): string {
  return (process.env.API_PUBLIC_URL || '').trim().replace(/\/+$/, '');
}

export interface ContainerSessionStatus {
  enabled: boolean;
  created: boolean;
  mode: 'terminal' | 'ide';
  sessionId?: string;
  workspaceUrl?: string;
  message: string;
}

export async function ensureTerminalSession(params: {
  tenantId: string;
  userId: string;
  workshopId?: string;
}): Promise<ContainerSessionStatus> {
  if (!terminalEnabled()) {
    return {
      enabled: false,
      created: false,
      mode: 'terminal',
      message: 'Container terminal mode is disabled',
    };
  }

  const db = getDb();
  const now = new Date();
  const sessionKey = buildTerminalSessionKey({
    tenantId: params.tenantId,
    userId: params.userId,
    workshopId: params.workshopId,
  });
  await db.collection(COLLECTIONS.TERMINAL_SESSIONS).updateOne(
    { sessionKey },
    {
      $setOnInsert: {
        tenantId: params.tenantId,
        userId: params.userId,
        workshopId: params.workshopId || null,
        createdAt: now,
      },
      $set: { updatedAt: now, status: 'ready' },
    },
    { upsert: true }
  );

  return {
    enabled: true,
    created: true,
    mode: 'terminal',
    sessionId: sessionKey,
    message: 'Terminal session prepared',
  };
}

export async function ensureIdeSession(params: {
  tenantId: string;
  userId: string;
  workshopId?: string;
}): Promise<ContainerSessionStatus> {
  if (!ideEnabled()) {
    return {
      enabled: false,
      created: false,
      mode: 'ide',
      message: 'Full IDE mode is disabled',
    };
  }

  const db = getDb();
  const now = new Date();
  const sessionKey = buildTerminalSessionKey({
    tenantId: params.tenantId,
    userId: params.userId,
    workshopId: params.workshopId,
  });
  const workspaceBasePath = `/ide/${encodeURIComponent(sessionKey)}`;
  const accessToken = signIdeAccessToken({
    sessionId: sessionKey,
    tenantId: params.tenantId,
    userId: params.userId,
  });
  const workspaceUrl = `${publicApiUrlPrefix()}${workspaceBasePath}?access_token=${encodeURIComponent(accessToken)}`;
  await db.collection(COLLECTIONS.IDE_SESSIONS).updateOne(
    { sessionKey },
    {
      $setOnInsert: {
        tenantId: params.tenantId,
        userId: params.userId,
        workshopId: params.workshopId || null,
        createdAt: now,
      },
      $set: { updatedAt: now, status: 'ready', workspaceUrl: workspaceBasePath },
    },
    { upsert: true }
  );

  return {
    enabled: true,
    created: true,
    mode: 'ide',
    sessionId: sessionKey,
    workspaceUrl,
    message: 'IDE session prepared',
  };
}
