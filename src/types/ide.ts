/**
 * Core IDE/workspace abstractions for browser-based dev environment.
 * See Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md.
 */

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  /** Optional message from backend (e.g. error description). */
  message?: string;
  /** For future streaming. */
  streamId?: string;
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Optional session context for logging (Phase 2). */
  sessionContext?: SessionContext;
}

/** Optional context for execution/session (e.g. workshop session, user). Phase 2 optional. */
export interface SessionContext {
  sessionId?: string;
  workshopId?: string;
  userEmail?: string;
}

export type RuntimeLanguage = 'node' | 'python' | 'java' | 'csharp' | 'mongosh' | 'bash';

export interface RuntimeExecutor {
  readonly language: RuntimeLanguage;
  run(code: string, options?: RunOptions): Promise<RunResult>;
  runFile?(path: string, options?: RunOptions): Promise<RunResult>;
  canRunFile?(path: string): boolean;
}

/** Abstraction for the "console" / log panel: append output, clear, mark success/fail. */
export interface IOutputSurface {
  append(output: string, options?: { success?: boolean; summary?: string }): void;
  clear(): void;
}

/** One editor instance: content, decorations, focus. Used to wrap Monaco behind a stable API. */
export interface IEditorSession {
  getContent(): string;
  setContent(content: string): void;
  setDecorations?(decorations: unknown): void;
  focus?(): void;
}

export interface EditorDocument {
  path: string;
  language: string;
  getContent(): string;
  setContent(content: string): void;
  onDidChangeContent(cb: (content: string) => void): () => void;
}

export interface WorkspaceFile {
  path: string;
  kind: 'file' | 'directory';
  children?: WorkspaceFile[];
}

export interface TerminalSession {
  id: string;
  ptyId: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onData(cb: (data: string) => void): () => void;
  onClose(cb: () => void): () => void;
}

export interface SessionTransport {
  connect(sessionId: string): Promise<void>;
  send(data: string): void;
  onMessage(cb: (data: string) => void): () => void;
  disconnect(): void;
}

export interface DocumentStoreLike {
  get(path: string): string | undefined;
  set(path: string, content: string): void;
  has(path: string): boolean;
  list(): string[];
}

export interface HintContext {
  currentFilePath?: string;
  currentLanguage?: string;
  lastRunCommand?: string;
  lastRunResult?: RunResult;
  labStepId?: string;
  labNumber?: number;
  labTitle?: string;
  stepIndex?: number;
  workspaceRunnables?: { label: string; script: string }[];
  /** When set, hint providers can read current document content. */
  documentStore?: DocumentStoreLike;
}

export interface SuggestedAction {
  id: string;
  label: string;
  description?: string;
  kind: 'run' | 'insert' | 'open' | 'command';
  payload?: string | object;
  source: 'terminal' | 'editor' | 'workspace' | 'language' | 'ai';
  priority: number;
}

export interface HintProvider {
  getId(): string;
  getHints(context: HintContext): Promise<SuggestedAction[]> | SuggestedAction[];
}

export interface CommandPaletteAction {
  id: string;
  label: string;
  category?: string;
  run(): Promise<void> | void;
  when?(context: HintContext): boolean;
}

export interface Diagnostic {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface DiagnosticsProvider {
  getDiagnostics(path: string): Promise<Diagnostic[]> | Diagnostic[];
}
