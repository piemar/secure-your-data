/**
 * Leaderboard API client.
 * Reads/writes go to the server /api/leaderboard, which stores data in MongoDB Atlas
 * (obfuscated URI in vite.config / LEADERBOARD_MONGODB_URI).
 * Falls back to localStorage if the API is unavailable (e.g. no server or no MongoDB).
 */

import type { LeaderboardEntry } from '@/utils/leaderboardUtils';

const API_BASE = '/api/leaderboard';

export async function fetchLeaderboardFromApi(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries ?? [];
  } catch {
    return [];
  }
}

export async function postStartLab(email: string, labNumber: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/start-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, labNumber, timestamp: Date.now() }),
    });
  } catch {
    // Ignore; localStorage fallback will be used
  }
}

export async function postCompleteLab(
  email: string,
  labNumber: number,
  score: number
): Promise<void> {
  try {
    await fetch(`${API_BASE}/complete-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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

export async function postHeartbeat(email: string, labNumber?: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, labNumber }),
    });
  } catch {
    // Ignore
  }
}

/**
 * Reset only the current user's leaderboard entry (score 0, no completed labs, no lab times).
 * Other participants' data is not modified.
 */
export async function postResetProgress(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(`Reset progress failed: ${res.status}`);
  }
}
