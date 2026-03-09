/**
 * Leaderboard API client.
 * Reads/writes go to the server /api/leaderboard, which stores data in MongoDB Atlas
 * (obfuscated URI in vite.config / LEADERBOARD_MONGODB_URI).
 * Falls back to localStorage if the API is unavailable (e.g. no server or no MongoDB).
 */

import type { LeaderboardEntry } from '@/utils/leaderboardUtils';

const API_BASE = '/api/leaderboard';

/** Fetch leaderboard for a session, or pass 'all' for moderator view (all sessions). */
export async function fetchLeaderboardFromApi(sessionId: string | 'all'): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}?sessionId=${encodeURIComponent(sessionId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || 'Leaderboard unavailable';
    throw new Error(msg);
  }
  return data.entries ?? [];
}

export async function postStartLab(sessionId: string, email: string, labNumber: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/start-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, email, labNumber, timestamp: Date.now() }),
    });
  } catch {
    // Ignore; localStorage fallback will be used
  }
}

export async function postCompleteLab(
  sessionId: string,
  email: string,
  labNumber: number,
  score: number
): Promise<void> {
  try {
    await fetch(`${API_BASE}/complete-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        email,
        labNumber,
        score,
        timestamp: Date.now(),
      }),
    });
  } catch {
    // Ignore
  }
}

export async function postAddPoints(
  sessionId: string,
  email: string,
  stepId: string,
  labNumber: number,
  points: number,
  assisted: boolean
): Promise<void> {
  try {
    await fetch(`${API_BASE}/add-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        email,
        stepId,
        labNumber,
        points,
        assisted,
      }),
    });
  } catch {
    // Ignore
  }
}

export async function postHeartbeat(
  sessionId: string,
  email: string,
  labNumber?: number,
  firstName?: string,
  lastName?: string
): Promise<void> {
  try {
    const body: Record<string, unknown> = { sessionId, email, labNumber };
    if (firstName !== undefined) body.firstName = firstName;
    if (lastName !== undefined) body.lastName = lastName;
    await fetch(`${API_BASE}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Ignore
  }
}

export async function postStepProgress(
  sessionId: string,
  email: string,
  labNumber: number,
  completedSteps: number[]
): Promise<void> {
  try {
    await fetch(`${API_BASE}/step-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, email, labNumber, completedSteps }),
    });
  } catch {
    // Ignore
  }
}

export async function postResetProgress(sessionId: string, email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, email }),
  });
  if (!res.ok) {
    throw new Error(`Reset progress failed: ${res.status}`);
  }
}

export async function postResetLeaderboardAll(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reset-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Reset leaderboard failed: ${res.status}`);
  }
}

export async function postDeleteLeaderboardEntry(sessionId: string, email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/entry`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Delete participant failed: ${res.status}`);
  }
}
