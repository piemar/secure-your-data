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
export function addPoints(email: string, points: number, labNumber: number): void {
  if (!email) return;
  
  const entry = getOrCreateEntry(email);
  const newScore = entry.score + points;
  
  updateEntry(email, {
    score: newScore
  });
}

/**
 * Mark a lab as completed
 */
export function completeLab(email: string, labNumber: number, score: number): void {
  if (!email) return;
  
  const entry = getOrCreateEntry(email);
  const completedLabs = entry.completedLabs.includes(labNumber)
    ? entry.completedLabs
    : [...entry.completedLabs, labNumber];
  
  // Calculate lab time from LabContext's labStartTimes
  const labTimes = { ...entry.labTimes };
  try {
    const savedStartTimes = localStorage.getItem('labStartTimes');
    if (savedStartTimes) {
      const startTimes = JSON.parse(savedStartTimes);
      if (startTimes[labNumber]) {
        const start = startTimes[labNumber];
        const end = Date.now();
        const elapsed = end - start;
        labTimes[labNumber] = (labTimes[labNumber] || 0) + elapsed;
      }
    }
  } catch (error) {
    console.error('Failed to read lab start times:', error);
  }
  
  updateEntry(email, {
    completedLabs,
    score: Math.max(entry.score, score), // Use the higher score
    labTimes
  });
}

/**
 * Record when a lab is started
 */
export function startLab(email: string, labNumber: number): void {
  if (!email) return;
  
  const entry = getOrCreateEntry(email);
  // Initialize lab time if not exists
  if (!entry.labTimes[labNumber]) {
    updateEntry(email, {
      labTimes: { ...entry.labTimes, [labNumber]: 0 }
    });
  }
}

/**
 * Send heartbeat to update lastActive timestamp and track lab time
 */
export function heartbeat(email: string, labNumber?: number): void {
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
}

/**
 * Track when a user reveals a hint
 */
export function trackHintUsage(email: string, hintPenalty: number): void {
  if (!email) return;
  
  const entry = getOrCreateEntry(email);
  updateEntry(email, {
    hintsUsed: (entry.hintsUsed || 0) + 1,
    score: Math.max(0, entry.score - hintPenalty)
  });
}

/**
 * Track when a user reveals a solution early
 */
export function trackSolutionReveal(email: string, solutionPenalty: number = 5): void {
  if (!email) return;
  
  const entry = getOrCreateEntry(email);
  updateEntry(email, {
    solutionsRevealed: (entry.solutionsRevealed || 0) + 1,
    score: Math.max(0, entry.score - solutionPenalty)
  });
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
