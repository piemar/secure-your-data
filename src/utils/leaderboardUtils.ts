export interface LeaderboardEntry {
  sessionId?: string; // Set when from API; optional for backward compat
  email: string;
  firstName?: string;
  lastName?: string;
  score: number;
  completedLabs: number[];
  completedStepsByLab?: Record<number, number[]>;
  labTimes: Record<number, number>;
  lastActive: number;
  hintsUsed?: number;
  solutionsRevealed?: number;
}

const LEADERBOARD_STORAGE_KEY_PREFIX = 'workshop_leaderboard_';

function getStorageKey(sessionId: string | 'all'): string {
  return `${LEADERBOARD_STORAGE_KEY_PREFIX}${sessionId}`;
}

/** Resolve sessionId for current workshop (from localStorage to avoid circular deps). */
function getCurrentSessionId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('workshop_current_id');
}

/**
 * Sync leaderboard from MongoDB (via /api/leaderboard) into localStorage for the given session (or 'all').
 */
export async function syncLeaderboardFromApi(sessionId: string | 'all'): Promise<void> {
  try {
    const { fetchLeaderboardFromApi } = await import('@/services/leaderboardApi');
    const entries = await fetchLeaderboardFromApi(sessionId);
    try {
      localStorage.setItem(getStorageKey(sessionId), JSON.stringify(entries));
    } catch {
      // Ignore quota or disabled localStorage
    }
  } catch (e) {
    throw e;
  }
}

/**
 * Get leaderboard entries from localStorage for a session. If sessionId is omitted, uses current workshop session.
 */
export function getLeaderboardEntries(sessionId?: string): LeaderboardEntry[] {
  const sid = sessionId ?? getCurrentSessionId() ?? '';
  try {
    const stored = localStorage.getItem(getStorageKey(sid));
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read leaderboard from localStorage:', error);
    return [];
  }
}

function saveLeaderboardEntries(sessionId: string, entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(getStorageKey(sessionId), JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save leaderboard to localStorage:', error);
  }
}

/** Clear cached leaderboard for a session (e.g. after moderator reset). */
export function clearLeaderboardCacheForSession(sessionId: string): void {
  try {
    localStorage.setItem(getStorageKey(sessionId), '[]');
  } catch {
    // ignore
  }
}

function getOrCreateEntry(sessionId: string, email: string): LeaderboardEntry {
  const entries = getLeaderboardEntries(sessionId);
  let entry = entries.find(e => e.email === email);
  if (!entry) {
    entry = {
      email,
      score: 0,
      completedLabs: [],
      labTimes: {},
      lastActive: Date.now(),
      hintsUsed: 0,
      solutionsRevealed: 0,
    };
    entries.push(entry);
    saveLeaderboardEntries(sessionId, entries);
  }
  return entry;
}

function updateEntry(sessionId: string, email: string, updates: Partial<LeaderboardEntry>): void {
  const entries = getLeaderboardEntries(sessionId);
  const index = entries.findIndex(e => e.email === email);
  if (index === -1) {
    const newEntry: LeaderboardEntry = {
      email,
      score: 0,
      completedLabs: [],
      labTimes: {},
      lastActive: Date.now(),
      hintsUsed: 0,
      solutionsRevealed: 0,
      ...updates,
    };
    entries.push(newEntry);
  } else {
    entries[index] = {
      ...entries[index],
      ...updates,
      lastActive: Date.now(),
    };
  }
  saveLeaderboardEntries(sessionId, entries);
}

export function addPoints(email: string, points: number, labNumber: number): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;

  const entry = getOrCreateEntry(sessionId, email);
  const newScore = entry.score + points;
  import('@/services/leaderboardApi').then(({ postAddPoints }) => {
    postAddPoints(sessionId, email, `step-${labNumber}`, labNumber, points, false);
  });
  updateEntry(sessionId, email, { score: newScore });
}

export function completeLab(email: string, labNumber: number, score: number): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;

  const entry = getOrCreateEntry(sessionId, email);
  const completedLabs = entry.completedLabs.includes(labNumber)
    ? entry.completedLabs
    : [...entry.completedLabs, labNumber];
  import('@/services/leaderboardApi').then(({ postCompleteLab }) => {
    postCompleteLab(sessionId, email, labNumber, score);
  });

  const labTimes = { ...entry.labTimes };
  try {
    const savedStartTimes = localStorage.getItem('labStartTimes');
    if (savedStartTimes) {
      const startTimes = JSON.parse(savedStartTimes);
      if (startTimes[labNumber]) {
        const start = startTimes[labNumber];
        const elapsed = Date.now() - start;
        labTimes[labNumber] = (labTimes[labNumber] || 0) + elapsed;
      }
    }
  } catch {
    // ignore
  }
  updateEntry(sessionId, email, {
    completedLabs,
    score: Math.max(entry.score, score),
    labTimes,
  });
}

export function startLab(email: string, labNumber: number): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;

  import('@/services/leaderboardApi').then(({ postStartLab }) => {
    postStartLab(sessionId, email, labNumber);
  });
  const entry = getOrCreateEntry(sessionId, email);
  if (!entry.labTimes[labNumber]) {
    updateEntry(sessionId, email, {
      labTimes: { ...entry.labTimes, [labNumber]: 0 },
    });
  }
}

export function heartbeat(email: string, labNumber?: number): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;

  const attendeeName = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_attendee_name') || '' : '';
  const nameParts = attendeeName.trim().split(/\s+/);
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.slice(1).join(' ') || undefined;

  import('@/services/leaderboardApi').then(({ postHeartbeat }) => {
    postHeartbeat(sessionId, email, labNumber, firstName, lastName);
  });

  const entry = getOrCreateEntry(sessionId, email);
  const updates: Partial<LeaderboardEntry> = {
    lastActive: Date.now(),
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
  };
  if (labNumber !== undefined) {
    try {
      const savedStartTimes = localStorage.getItem('labStartTimes');
      if (savedStartTimes) {
        const startTimes = JSON.parse(savedStartTimes);
        if (startTimes[labNumber]) {
          const elapsed = Date.now() - startTimes[labNumber];
          const labTimes = { ...entry.labTimes };
          labTimes[labNumber] = (labTimes[labNumber] || 0) + elapsed;
          updates.labTimes = labTimes;
        }
      }
    } catch {
      // ignore
    }
  }
  updateEntry(sessionId, email, updates);
}

export function trackHintUsage(email: string, hintPenalty: number): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;
  const entry = getOrCreateEntry(sessionId, email);
  updateEntry(sessionId, email, {
    hintsUsed: (entry.hintsUsed ?? 0) + 1,
    score: entry.score - hintPenalty,
  });
}

export function trackSolutionReveal(email: string, solutionPenalty: number = 5): void {
  if (!email) return;
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;
  const entry = getOrCreateEntry(sessionId, email);
  updateEntry(sessionId, email, {
    solutionsRevealed: (entry.solutionsRevealed ?? 0) + 1,
    score: entry.score - solutionPenalty,
  });
}

/** Get leaderboard entries for a session (default current) sorted by score. */
export function getSortedLeaderboard(sessionId?: string): LeaderboardEntry[] {
  const entries = getLeaderboardEntries(sessionId);
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.completedLabs.length - a.completedLabs.length;
  });
}
