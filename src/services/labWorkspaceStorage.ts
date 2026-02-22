/**
 * Central persistence for lab workspace state: all editor contents and console logs.
 * Stored in localStorage, keyed by user (email) so state survives refresh/restart
 * and can be loaded when the user returns.
 */

const STORAGE_PREFIX = 'workshop_lab_workspace';

export interface LogEntryStored {
  time: string; // ISO date string
  output: string;
}

export interface LabStepWorkspace {
  editors: Record<string, string>; // blockKey (e.g. "0-0", "1-0") -> code
  logEntriesByStep: Record<number, LogEntryStored[]>; // stepIndex -> log entries
}

export interface LabWorkspaceState {
  [labKey: string]: LabStepWorkspace; // labKey = String(labNumber) e.g. "1", "2"
}

function getStorageKey(userEmail?: string | null): string {
  const user = userEmail?.trim() || localStorage.getItem('userEmail')?.trim() || 'default';
  return `${STORAGE_PREFIX}_${user}`;
}

/**
 * Load full workspace state for the current user from localStorage.
 */
export function loadWorkspaceState(userEmail?: string | null): LabWorkspaceState {
  try {
    const key = getStorageKey(userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LabWorkspaceState;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Load workspace for a single lab (editors + log entries by step).
 */
export function loadLabWorkspace(labNumber: number, userEmail?: string | null): LabStepWorkspace {
  const state = loadWorkspaceState(userEmail);
  const labKey = String(labNumber);
  const lab = state[labKey];
  if (!lab || typeof lab !== 'object') {
    return { editors: {}, logEntriesByStep: {} };
  }
  return {
    editors: lab.editors && typeof lab.editors === 'object' ? lab.editors : {},
    logEntriesByStep: lab.logEntriesByStep && typeof lab.logEntriesByStep === 'object' ? lab.logEntriesByStep : {},
  };
}

/**
 * Save workspace for a single lab (merge into existing state for other labs).
 */
export function saveLabWorkspace(
  labNumber: number,
  data: Partial<LabStepWorkspace>,
  userEmail?: string | null
): void {
  try {
    const key = getStorageKey(userEmail);
    const state = loadWorkspaceState(userEmail);
    const labKey = String(labNumber);
    const existing = state[labKey] || { editors: {}, logEntriesByStep: {} };
    state[labKey] = {
      editors: data.editors !== undefined ? data.editors : existing.editors,
      logEntriesByStep: data.logEntriesByStep !== undefined ? data.logEntriesByStep : existing.logEntriesByStep,
    };
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('labWorkspaceStorage: save failed', e);
  }
}

/**
 * Convert in-memory log entries (Date) to stored format (ISO string).
 */
export function logEntriesToStored(entries: Array<{ time: Date; output: string }>): LogEntryStored[] {
  return entries.map(({ time, output }) => ({
    time: time instanceof Date ? time.toISOString() : String(time),
    output,
  }));
}

/**
 * Convert stored log entries back to in-memory format (Date).
 */
export function storedToLogEntries(entries: LogEntryStored[]): Array<{ time: Date; output: string }> {
  if (!Array.isArray(entries)) return [];
  return entries.map(({ time, output }) => ({
    time: new Date(time),
    output: String(output),
  }));
}
