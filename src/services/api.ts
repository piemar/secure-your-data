/**
 * Frontend API client for MongoDB Mayhem Express backend.
 * Wraps fetch with JWT auth headers and base URL config.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const AUTH_TOKEN_CHANGED_EVENT = 'mayhem-auth-token-changed';

let authToken: string | null = localStorage.getItem('mayhem-token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('mayhem-token', token);
  } else {
    localStorage.removeItem('mayhem-token');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/** One line of driver output from /api/execute/run and /api/execute/repl */
export type ExecuteCommandOutput = {
  command: string;
  result: unknown;
  error?: string;
  timeMs?: number;
  simulated?: boolean;
  message?: string;
};

export type ExecuteRunResponse = {
  tier: string;
  success: boolean;
  output: ExecuteCommandOutput[];
  error?: string;
  executionTimeMs?: number;
  message?: string;
};

export type ContainerSessionResponse = {
  enabled: boolean;
  created: boolean;
  mode: 'terminal' | 'ide';
  sessionId?: string;
  workspaceUrl?: string;
  message: string;
  shellStream?: {
    namespace: string;
    socketPath: string;
    sessionId?: string;
    executor: 'local_shell' | 'docker_run' | 'docker_persistent';
  };
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ===== Auth =====
export const api = {
  auth: {
    register: (
      handle: string,
      password: string,
      role?: string,
      profile?: { email?: string; firstName?: string; lastName?: string; avatarId?: string }
    ) =>
      request<{ token: string; handle: string; role: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ handle, password, role, ...(profile || {}) }),
      }),

    login: (handle: string, password: string) =>
      request<{ token: string; handle: string; role: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ handle, password }),
      }),

    joinSession: (
      pin: string,
      handle: string,
      email: string,
      profile?: { firstName?: string; lastName?: string; avatarId?: string }
    ) =>
      request<{ token: string; handle: string; role: string; sessionId: string; sessionName: string }>(
        '/api/auth/join-session',
        {
          method: 'POST',
          body: JSON.stringify({ pin, handle, email, ...(profile || {}) }),
        }
      ),
  },

  players: {
    me: () => request<Record<string, unknown>>('/api/players/me'),
    sync: (player: Record<string, unknown>) =>
      request<Record<string, unknown>>('/api/players/sync', {
        method: 'POST',
        body: JSON.stringify({ player }),
      }),
    update: (data: Record<string, unknown>) =>
      request<Record<string, unknown>>('/api/players/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    leaderboard: (workshopId?: string) =>
      request<Record<string, unknown>[]>(
        workshopId
          ? `/api/players/leaderboard?workshopId=${encodeURIComponent(workshopId)}`
          : '/api/players/leaderboard'
      ),
  },

  missions: {
    progress: () =>
      request<{ completedMissions: string[]; achievements: string[] }>('/api/missions/progress'),
    complete: (missionId: string, xpEarned: number) =>
      request<Record<string, unknown>>(`/api/missions/${missionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ xpEarned }),
      }),
  },

  workshops: {
    create: (data: {
      name: string;
      missionIds: string[];
      timeLimit?: number;
      scheduledFor?: string;
      customerName?: string;
      technicalChampionName?: string;
      technicalChampionEmail?: string;
      salesforceOpportunityId?: string;
      allowedEmailDomains?: string[];
      logoUrl?: string;
    }) =>
      request<Record<string, unknown>>('/api/workshops', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (includeArchived = false) =>
      request<Record<string, unknown>[]>(
        includeArchived ? '/api/workshops?includeArchived=true' : '/api/workshops'
      ),
    getById: (id: string) => request<Record<string, unknown>>(`/api/workshops/${id}`),
    updateStatus: (id: string, status: string) =>
      request<{ status: string }>(`/api/workshops/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<Record<string, unknown>>(`/api/workshops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    archive: (id: string, archiveReason?: string) =>
      request<{ archived: boolean; workshop: Record<string, unknown> }>(`/api/workshops/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ archiveReason }),
      }),
    metrics: (id: string) => request<Record<string, unknown>>(`/api/workshops/${id}/metrics`),
    updateConfig: (id: string, config: { executionMode: string }) =>
      request<{ executionMode: string }>(`/api/workshops/${id}/config`, {
        method: 'PATCH',
        body: JSON.stringify(config),
      }),
  },

  metrics: {
    track: (type: string, missionId?: string, data?: Record<string, unknown>) =>
      request<{ ok: boolean }>('/api/metrics/event', {
        method: 'POST',
        body: JSON.stringify({ type, missionId, data }),
      }),
  },

  verify: {
    submit: (code: string, missionId: string, verificationId?: string) =>
      request<{ verified: boolean; message: string }>('/api/verify', {
        method: 'POST',
        body: JSON.stringify({ code, missionId, verificationId }),
      }),
  },

  execute: {
    createSandbox: (missionId: string, sessionId?: string) =>
      request<{ created: boolean; tier: string; dbName?: string; seeded?: boolean; message?: string }>(
        '/api/execute/sandbox',
        { method: 'POST', body: JSON.stringify({ missionId, sessionId }) }
      ),

    run: (code: string, missionId: string, sessionId?: string) =>
      request<ExecuteRunResponse>('/api/execute/run', {
        method: 'POST',
        body: JSON.stringify({ code, missionId, sessionId }),
      }),

    repl: (command: string, missionId: string, sessionId?: string) =>
      request<ExecuteRunResponse>('/api/execute/repl', {
        method: 'POST',
        body: JSON.stringify({ command, missionId, sessionId }),
      }),

    cloud: (code: string, missionId?: string, dbName?: string) =>
      request<{
        tier: 'simulate' | 'proxy';
        success: boolean;
        output: ExecuteCommandOutput[];
        message?: string;
        executionTimeMs?: number;
      }>('/api/execute/cloud', {
        method: 'POST',
        body: JSON.stringify({ code, missionId, dbName }),
      }),

    verify: (missionId: string, sessionId?: string) =>
      request<{
        tier: string;
        results: Array<{ objectiveId: string; passed: boolean; message: string }>;
        message?: string;
      }>('/api/execute/verify', {
        method: 'POST',
        body: JSON.stringify({ missionId, sessionId }),
      }),

    destroySandbox: (sessionId?: string) =>
      request<{ destroyed: boolean }>('/api/execute/sandbox', {
        method: 'DELETE',
        body: JSON.stringify({ sessionId }),
      }),

    status: (sessionId?: string) =>
      request<{ active: boolean; dbName?: string; missionId?: string; ageMs?: number }>(
        `/api/execute/status?sessionId=${sessionId || 'solo'}`
      ),
  },

  health: () => request<{ status: string; db: string }>('/api/health'),
  terminal: {
    createSession: () => request<ContainerSessionResponse>('/api/terminal/session', { method: 'POST' }),
  },
  ide: {
    createSession: () => request<ContainerSessionResponse>('/api/ide/session', { method: 'POST' }),
  },
};
