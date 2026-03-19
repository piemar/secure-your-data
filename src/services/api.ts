/**
 * Frontend API client for MongoDB Mayhem Express backend.
 * Wraps fetch with JWT auth headers and base URL config.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let authToken: string | null = localStorage.getItem('mayhem-token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('mayhem-token', token);
  } else {
    localStorage.removeItem('mayhem-token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

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
    register: (handle: string, password: string, role?: string) =>
      request<{ token: string; handle: string; role: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ handle, password, role }),
      }),

    login: (handle: string, password: string) =>
      request<{ token: string; handle: string; role: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ handle, password }),
      }),

    joinSession: (pin: string, handle: string) =>
      request<{ token: string; handle: string; role: string; sessionId: string; sessionName: string }>(
        '/api/auth/join-session',
        { method: 'POST', body: JSON.stringify({ pin, handle }) }
      ),
  },

  players: {
    me: () => request<Record<string, unknown>>('/api/players/me'),
    update: (data: Record<string, unknown>) =>
      request<Record<string, unknown>>('/api/players/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    leaderboard: () => request<Record<string, unknown>[]>('/api/players/leaderboard'),
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
    create: (data: { name: string; missionIds: string[]; timeLimit?: number }) =>
      request<Record<string, unknown>>('/api/workshops', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request<Record<string, unknown>[]>('/api/workshops'),
    updateStatus: (id: string, status: string) =>
      request<{ status: string }>(`/api/workshops/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    metrics: (id: string) => request<Record<string, unknown>>(`/api/workshops/${id}/metrics`),
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
      request<{
        tier: string;
        success: boolean;
        output: Array<{ command: string; result: unknown; error?: string; timeMs?: number; simulated?: boolean; message?: string }>;
        error?: string;
        executionTimeMs?: number;
        message?: string;
      }>('/api/execute/run', {
        method: 'POST',
        body: JSON.stringify({ code, missionId, sessionId }),
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
};
