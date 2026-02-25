import { getLeaderboardEntries, type LeaderboardEntry } from './leaderboardUtils';
import { getMetricsService } from '@/services/metricsService';

export interface ArchivedLeaderboard {
  sessionId: string;
  customerName: string;
  workshopDate: string;
  entries: LeaderboardEntry[];
}

export type ProgrammingLanguage = 'python' | 'node' | 'java';
export type WorkshopSessionMode = 'demo' | 'lab' | 'challenge';

export interface WorkshopSession {
  id: string;
  customerName: string;
  workshopDate: string;
  startedAt: number;
  labsEnabled: boolean;
  archivedLeaderboards: ArchivedLeaderboard[];
  mongodbSource: 'local' | 'atlas';
  atlasConnectionString?: string; // Only set if mongodbSource is 'atlas'
  /** Wizard fields (optional for backward compatibility) */
  salesforceWorkloadName?: string;
  technicalChampionName?: string;
  technicalChampionEmail?: string;
  currentDatabase?: string;
  mode?: WorkshopSessionMode;
  programmingLanguage?: ProgrammingLanguage;
  templateId?: string;
  labIds?: string[];
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
 * Get the current workshop session from localStorage (with Atlas sync on first load)
 */
export function getWorkshopSession(): WorkshopSession | null {
  try {
    const stored = localStorage.getItem(WORKSHOP_SESSION_KEY);
    if (!stored) {
      // Try to load from Atlas on first access (async, non-blocking)
      loadWorkshopSessionFromAtlas().catch(() => {
        // Already logged in loadWorkshopSessionFromAtlas
      });
      return null;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read workshop session:', error);
    return null;
  }
}

/**
 * Sync workshop session to Atlas (via API)
 */
async function syncWorkshopSessionToAtlas(session: WorkshopSession): Promise<void> {
  try {
    const response = await fetch('/api/workshop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to sync session to Atlas');
    }
  } catch (error) {
    // Log but don't throw - localStorage fallback is acceptable
    console.warn('Failed to sync workshop session to Atlas:', error);
  }
}

/**
 * Load workshop session from API (Atlas) and cache in localStorage.
 * Call on app load so attendees see the moderator's session and labs-enabled state.
 */
export async function loadWorkshopSessionFromAtlas(): Promise<WorkshopSession | null> {
  try {
    const response = await fetch('/api/workshop-session');
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.success && data.session) {
      // Also cache in localStorage for fast reads
      localStorage.setItem(WORKSHOP_SESSION_KEY, JSON.stringify(data.session));
      return data.session;
    }
  } catch (error) {
    console.warn('Failed to load workshop session from Atlas:', error);
  }
  
  return null;
}

/**
 * Save workshop session to localStorage and sync to Atlas
 */
async function saveWorkshopSession(session: WorkshopSession): Promise<void> {
  try {
    localStorage.setItem(WORKSHOP_SESSION_KEY, JSON.stringify(session));
    // Sync to Atlas in background (don't block on this)
    syncWorkshopSessionToAtlas(session).catch(() => {
      // Already logged in syncWorkshopSessionToAtlas
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
      archivedLeaderboards: [],
      mongodbSource: 'local'
    };
  } else {
    session.labsEnabled = enabled;
  }
  
  await saveWorkshopSession(session);
}

export interface StartNewWorkshopOptions {
  customerName: string;
  workshopDate: string;
  mongodbSource?: 'local' | 'atlas';
  atlasConnectionString?: string;
  salesforceWorkloadName?: string;
  technicalChampionName?: string;
  technicalChampionEmail?: string;
  currentDatabase?: string;
  mode?: WorkshopSessionMode;
  programmingLanguage?: ProgrammingLanguage;
  templateId?: string;
  labIds?: string[];
}

/**
 * Start a new workshop session
 * This archives the current leaderboard and creates a fresh session
 */
export async function startNewWorkshop(
  customerNameOrOptions: string | StartNewWorkshopOptions,
  workshopDate?: string,
  mongodbSource: 'local' | 'atlas' = 'local',
  atlasConnectionString?: string
): Promise<WorkshopSession> {
  const options: StartNewWorkshopOptions =
    typeof customerNameOrOptions === 'object'
      ? customerNameOrOptions
      : {
          customerName: customerNameOrOptions,
          workshopDate: workshopDate!,
          mongodbSource,
          atlasConnectionString,
        };

  const {
    customerName,
    workshopDate: dateStr,
    mongodbSource: source = 'local',
    atlasConnectionString: atlasUri,
    salesforceWorkloadName,
    technicalChampionName,
    technicalChampionEmail,
    currentDatabase,
    mode,
    programmingLanguage,
    templateId,
    labIds,
  } = options;

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

  // Clear current leaderboard
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));

  // Create new session
  const newSession: WorkshopSession = {
    id: generateSessionId(),
    customerName,
    workshopDate: dateStr,
    startedAt: Date.now(),
    labsEnabled: true,
    archivedLeaderboards,
    mongodbSource: source,
    ...(source === 'atlas' && atlasUri ? { atlasConnectionString: atlasUri } : {}),
    ...(salesforceWorkloadName !== undefined && { salesforceWorkloadName }),
    ...(technicalChampionName !== undefined && { technicalChampionName }),
    ...(technicalChampionEmail !== undefined && { technicalChampionEmail }),
    ...(currentDatabase !== undefined && { currentDatabase }),
    ...(mode !== undefined && { mode }),
    ...(programmingLanguage !== undefined && { programmingLanguage }),
    ...(templateId !== undefined && { templateId }),
    ...(labIds !== undefined && { labIds }),
  };

  await saveWorkshopSession(newSession);

  const metricsService = getMetricsService();
  metricsService.recordEvent({
    type: 'workshop_started',
    metadata: {
      workshopId: newSession.id,
      customerName: newSession.customerName,
      workshopDate: newSession.workshopDate,
      mode: newSession.mode,
    }
  });

  return newSession;
}

/**
 * Clone the current workshop session: create a new session with a new ID,
 * copying wizard fields from the current session. Does not archive leaderboard;
 * the new session starts with empty leaderboard and same archivedLeaderboards history.
 * Use when moderator wants to change mode or reconfigure (run wizard after clone).
 */
export async function cloneWorkshopSession(): Promise<WorkshopSession | null> {
  const current = getWorkshopSession();
  if (!current) return null;

  const cloned: WorkshopSession = {
    ...current,
    id: generateSessionId(),
    startedAt: Date.now(),
    labsEnabled: current.labsEnabled,
    archivedLeaderboards: current.archivedLeaderboards,
  };
  await saveWorkshopSession(cloned);
  return cloned;
}

/**
 * Reset the current leaderboard without starting a new session
 */
export function resetLeaderboard(): void {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
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
 * Update the current workshop session details.
 * If no session exists (e.g. user went straight to Lab Setup), creates a minimal session so lab Run gets the URI.
 */
export async function updateWorkshopSession(
  updates: Partial<Pick<WorkshopSession, 'customerName' | 'workshopDate' | 'mongodbSource' | 'atlasConnectionString' | 'salesforceWorkloadName' | 'technicalChampionName' | 'technicalChampionEmail' | 'currentDatabase' | 'mode' | 'programmingLanguage' | 'templateId' | 'labIds'>>
): Promise<void> {
  let session = getWorkshopSession();
  if (!session) {
    session = {
      id: generateSessionId(),
      customerName: '',
      workshopDate: new Date().toISOString().slice(0, 10),
      startedAt: Date.now(),
      labsEnabled: true,
      archivedLeaderboards: [],
      mongodbSource: 'local',
    };
  }
  const updatedSession = {
    ...session,
    ...updates,
    ...(updates.mongodbSource === 'local' ? { atlasConnectionString: undefined } : {})
  };
  await saveWorkshopSession(updatedSession);
}

/**
 * Delete a workshop session (moderator only). Clears current session from storage.
 * Call when moderator wants to remove the current session; does not touch archived leaderboards in other sessions.
 */
export async function deleteCurrentWorkshopSession(): Promise<void> {
  localStorage.removeItem(WORKSHOP_SESSION_KEY);
}

/**
 * Get the MongoDB URI to use for lab execution (Run in browser).
 * Used by StepView when calling /api/run-node or /api/run-mongosh.
 * Returns atlas connection string when session uses Atlas, or default local URI when session uses local.
 * For local: use mongo:27017 when running in Docker, 127.0.0.1:27017 when running standalone (e.g. npm run dev).
 */
export function getLabMongoUri(runningInContainer?: boolean): string {
  const session = getWorkshopSession();
  if (!session) return '';
  if (session.mongodbSource === 'atlas' && session.atlasConnectionString) return session.atlasConnectionString;
  if (session.mongodbSource === 'local') {
    return runningInContainer ? 'mongodb://mongo:27017' : 'mongodb://127.0.0.1:27017';
  }
  return '';
}
