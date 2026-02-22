export interface LeaderboardEntry {
  email: string;
  score: number;
  completedLabs: number[];
  labTimes: Record<number, number>; // lab number -> time spent in ms
  lastActive: number;
  hintsUsed: number; // Total hints revealed
  solutionsRevealed: number; // Total solutions revealed early
}

const LEADERBOARD_STORAGE_KEY = 'workshop_leaderboard';

/**
 * Get all leaderboard entries from localStorage
 */
export function getLeaderboardEntries(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read leaderboard from localStorage:', error);
    return [];
  }
}

/**
 * Save leaderboard entries to localStorage
 */
function saveLeaderboardEntries(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save leaderboard to localStorage:', error);
  }
}

/**
 * Get or create a leaderboard entry for a user
 */
function getOrCreateEntry(email: string): LeaderboardEntry {
  const entries = getLeaderboardEntries();
  let entry = entries.find(e => e.email === email);

  if (!entry) {
    entry = {
      email,
      score: 0,
      completedLabs: [],
      labTimes: {},
      lastActive: Date.now(),
      hintsUsed: 0,
      solutionsRevealed: 0
    };
    entries.push(entry);
    saveLeaderboardEntries(entries);
  }

  return entry;
}

/**
 * Update a leaderboard entry
 */
function updateEntry(email: string, updates: Partial<LeaderboardEntry>): void {
  const entries = getLeaderboardEntries();
  const index = entries.findIndex(e => e.email === email);

  if (index === -1) {
    // Create new entry
    const newEntry: LeaderboardEntry = {
      email,
      score: 0,
      completedLabs: [],
      labTimes: {},
      lastActive: Date.now(),
      hintsUsed: 0,
      solutionsRevealed: 0,
      ...updates
    };
    entries.push(newEntry);
  } else {
    // Update existing entry
    entries[index] = {
      ...entries[index],
      ...updates,
      lastActive: Date.now()
    };
  }

  saveLeaderboardEntries(entries);
}

/**
 * Add points to a user's score
 */
export async function addPoints(email: string, points: number, labNumber: number, stepId: string = 'unknown', assisted: boolean = false): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const newScore = entry.score + points;

  updateEntry(email, {
    score: newScore
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('workshop-leaderboard-update'));
  }

  // Sync to Atlas
  try {
    await fetch('/api/leaderboard/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, stepId, labNumber, points, assisted })
    });
  } catch (error) {
    console.warn('Failed to sync points to Atlas:', error);
  }
}

/**
 * Mark a lab as completed
 */
export async function completeLab(email: string, labNumber: number, score: number): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const completedLabs = entry.completedLabs.includes(labNumber)
    ? entry.completedLabs
    : [...entry.completedLabs, labNumber];

  // Calculate lab time from LabContext's labStartTimes
  const labTimes = { ...entry.labTimes };
  const timestamp = Date.now();

  try {
    const savedStartTimes = localStorage.getItem('labStartTimes');
    if (savedStartTimes) {
      const startTimes = JSON.parse(savedStartTimes);
      if (startTimes[labNumber]) {
        const start = startTimes[labNumber];
        const elapsed = timestamp - start;
        labTimes[labNumber] = (labTimes[labNumber] || 0) + elapsed;
      }
    }
  } catch (error) {
    console.error('Failed to read lab start times:', error);
  }

  const finalScore = Math.max(entry.score, score);
  updateEntry(email, {
    completedLabs,
    score: finalScore,
    labTimes
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('workshop-leaderboard-update'));
  }

  // Sync to Atlas
  try {
    await fetch('/api/leaderboard/complete-lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, labNumber, score: finalScore, timestamp })
    });
  } catch (error) {
    console.warn('Failed to sync lab completion to Atlas:', error);
  }
}

/**
 * Record when a lab is started
 */
export async function startLab(email: string, labNumber: number): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const timestamp = Date.now();

  // Initialize lab time if not exists
  if (!entry.labTimes[labNumber]) {
    updateEntry(email, {
      labTimes: { ...entry.labTimes, [labNumber]: 0 }
    });
  }

  // Sync to Atlas
  try {
    await fetch('/api/leaderboard/start-lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, labNumber, timestamp })
    });
  } catch (error) {
    console.warn('Failed to sync lab start to Atlas:', error);
  }
}

/**
 * Send heartbeat to update lastActive timestamp and track lab time
 */
export async function heartbeat(email: string, labNumber?: number): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const updates: Partial<LeaderboardEntry> = {
    lastActive: Date.now()
  };

  // If labNumber is provided, update the lab time
  if (labNumber !== undefined) {
    try {
      const savedStartTimes = localStorage.getItem('labStartTimes');
      if (savedStartTimes) {
        const startTimes = JSON.parse(savedStartTimes);
        if (startTimes[labNumber]) {
          const start = startTimes[labNumber];
          const now = Date.now();
          const elapsed = now - start;
          // Add elapsed time to existing lab time
          const labTimes = { ...entry.labTimes };
          labTimes[labNumber] = (labTimes[labNumber] || 0) + elapsed;
          updates.labTimes = labTimes;
        }
      }
    } catch (error) {
      console.error('Failed to update lab time:', error);
    }
  }

  updateEntry(email, updates);

  // Sync to Atlas
  try {
    await fetch('/api/leaderboard/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, labNumber })
    });
  } catch (error) {
    // Suppress heartbeat errors to avoid spamming console
  }
}

/**
 * Sync the entire leaderboard from Atlas
 */
export async function syncLeaderboard(): Promise<void> {
  try {
    const response = await fetch('/api/leaderboard');
    const data = await response.json();
    if (data.entries) {
      saveLeaderboardEntries(data.entries);
    }
  } catch (error) {
    console.warn('Failed to sync leaderboard from Atlas:', error);
  }
}

/**
 * Track when a user reveals a hint
 */
export async function trackHintUsage(email: string, hintPenalty: number): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const newHintsUsed = (entry.hintsUsed || 0) + 1;
  const newScore = Math.max(0, entry.score - hintPenalty);

  updateEntry(email, {
    hintsUsed: newHintsUsed,
    score: newScore
  });

  // Sync to Atlas (using general update for fields not having specific endpoints)
  // Actually, we can use the score update if we want, or just let heartbeat/other calls eventually sync.
  // But for immediate consistency, let's just make a heartbeat call that includes the state.
  // Or better, let's assume we want a generic update endpoint eventually.
  // For now, these fields will be synced via the next specific endpoint call or we add one.
  // Let's just update the score via addPoints with negative points if we want it immediate.
  await addPoints(email, -hintPenalty, 0, 'hint-usage');
}

/**
 * Track when a user reveals a solution early
 */
export async function trackSolutionReveal(email: string, solutionPenalty: number = 5): Promise<void> {
  if (!email) return;

  const entry = getOrCreateEntry(email);
  const newSolutionsRevealed = (entry.solutionsRevealed || 0) + 1;
  const newScore = Math.max(0, entry.score - solutionPenalty);

  updateEntry(email, {
    solutionsRevealed: newSolutionsRevealed,
    score: newScore
  });

  await addPoints(email, -solutionPenalty, 0, 'solution-reveal');
}

/**
 * Get leaderboard entries sorted by score
 */
export function getSortedLeaderboard(): LeaderboardEntry[] {
  const entries = getLeaderboardEntries();
  return [...entries].sort((a, b) => {
    // Sort by score first, then by completed labs count
    if (b.score !== a.score) return b.score - a.score;
    return b.completedLabs.length - a.completedLabs.length;
  });
}
