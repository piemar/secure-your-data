/**
 * In-memory document store: path → content.
 * Used by editor/workspace layer for future multi-file or virtual workspace.
 * See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md Phase 3.
 */
export interface DocumentStore {
  get(path: string): string | undefined;
  set(path: string, content: string): void;
  has(path: string): boolean;
  delete(path: string): boolean;
  list(): string[];
}

export function createDocumentStore(initial?: Record<string, string>): DocumentStore {
  const map = new Map<string, string>(initial ? Object.entries(initial) : []);
  return {
    get: (path) => map.get(path),
    set: (path, content) => { map.set(path, content); },
    has: (path) => map.has(path),
    delete: (path) => map.delete(path),
    list: () => Array.from(map.keys()),
  };
}
