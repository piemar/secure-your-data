/**
 * Manages multiple editor sessions (e.g. for multi-tab or multi-document UI). Phase 3 optional.
 */
import type { IEditorSession } from '@/types/ide';

export interface EditorManager {
  registerSession(docId: string, session: IEditorSession): void;
  getSession(docId: string): IEditorSession | undefined;
  destroySession(docId: string): void;
  listSessionIds(): string[];
}

export function createEditorManager(): EditorManager {
  const sessions = new Map<string, IEditorSession>();
  return {
    registerSession(docId: string, session: IEditorSession) {
      sessions.set(docId, session);
    },
    getSession(docId: string) {
      return sessions.get(docId);
    },
    destroySession(docId: string) {
      sessions.delete(docId);
    },
    listSessionIds() {
      return Array.from(sessions.keys());
    },
  };
}
