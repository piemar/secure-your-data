import { getLeaderboardEntries, type LeaderboardEntry } from './leaderboardUtils';

export interface ArchivedLeaderboard {
  sessionId: string;
  customerName: string;
  workshopDate: string;
  entries: LeaderboardEntry[];
}

export interface WorkshopSession {
  id: string;
  customerName: string;
  workshopDate: string;
  startedAt: number;
  labsEnabled: boolean;
  archivedLeaderboards: ArchivedLeaderboard[];
}

const WORKSHOP_SESSION_KEY = 'workshop_session';
const LEADERBOARD_KEY = 'workshop_leaderboard';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the current workshop session from localStorage
 */
export function getWorkshopSession(): WorkshopSession | null {
  try {
    const stored = localStorage.getItem(WORKSHOP_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read workshop session:', error);
    return null;
  }
}

/**
 * Save workshop session to localStorage and sync to Atlas
 */
async function saveWorkshopSession(session: WorkshopSession): Promise<void> {
  try {
    localStorage.setItem(WORKSHOP_SESSION_KEY, JSON.stringify(session));

    // Sync to Atlas backend
    await fetch('/api/workshop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
  } catch (error) {
    console.error('Failed to save workshop session:', error);
  }
}

/**
 * Check if labs are enabled for the current workshop
 * Returns false if no workshop session exists (labs disabled by default)
 */
export function areLabsEnabled(): boolean {
  const session = getWorkshopSession();
  return session?.labsEnabled ?? false;
}

/**
 * Enable or disable labs for the current workshop
 */
export async function setLabsEnabled(enabled: boolean): Promise<void> {
  let session = getWorkshopSession();

  if (!session) {
    // Create a default session if none exists
    session = {
      id: generateSessionId(),
      customerName: 'Workshop',
      workshopDate: new Date().toISOString().split('T')[0],
      startedAt: Date.now(),
      labsEnabled: enabled,
      archivedLeaderboards: []
    };
  } else {
    session.labsEnabled = enabled;
  }

  await saveWorkshopSession(session);
}

/**
 * Start a new workshop session
 * This archives the current leaderboard and creates a fresh session
 */
export async function startNewWorkshop(customerName: string, workshopDate: string): Promise<WorkshopSession> {
  const currentSession = getWorkshopSession();
  const currentLeaderboard = getLeaderboardEntries();

  // Archive current session data if it exists
  const archivedLeaderboards: ArchivedLeaderboard[] = currentSession?.archivedLeaderboards || [];

  if (currentSession && currentLeaderboard.length > 0) {
    archivedLeaderboards.push({
      sessionId: currentSession.id,
      customerName: currentSession.customerName,
      workshopDate: currentSession.workshopDate,
      entries: currentLeaderboard
    });
  }

  // Clear current leaderboard locally (will be cleared on Atlas too on next sync)
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));

  // Create new session
  const newSession: WorkshopSession = {
    id: generateSessionId(),
    customerName,
    workshopDate,
    startedAt: Date.now(),
    labsEnabled: true, // Enable labs when starting a new workshop
    archivedLeaderboards
  };

  await saveWorkshopSession(newSession);
  return newSession;
}

/**
 * Reset the current leaderboard without starting a new session
 */
export function resetLeaderboard(): void {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
  // Note: Atlas leaderboard reset handled via sync or direct leaderboardUtils
}

/**
 * Get the workshop history (archived leaderboards)
 */
export function getWorkshopHistory(): ArchivedLeaderboard[] {
  const session = getWorkshopSession();
  return session?.archivedLeaderboards || [];
}

/**
 * Get participant count from current leaderboard
 */
export function getParticipantCount(): number {
  return getLeaderboardEntries().length;
}

/**
 * Update the current workshop session details
 */
export async function updateWorkshopSession(updates: Partial<Pick<WorkshopSession, 'customerName' | 'workshopDate'>>): Promise<void> {
  const session = getWorkshopSession();
  if (session) {
    await saveWorkshopSession({
      ...session,
      ...updates
    });
  }
}

/**
 * Sync workshop session from Atlas backend
 */
export async function syncWorkshopSession(): Promise<void> {
  try {
    const response = await fetch('/api/workshop-session');
    const data = await response.json();
    if (data.session) {
      // Merge logic: in a real app we'd compare startedAt or IDs
      // For the lab, Atlas is the source of truth for the session
      localStorage.setItem(WORKSHOP_SESSION_KEY, JSON.stringify(data.session));
    }
  } catch (error) {
    console.warn('Background workshop sync failed:', error);
  }
}
