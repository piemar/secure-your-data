import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import { mkdirSync, statSync } from 'fs';
import os from 'os';

/** Master switch for streamed shell over Socket.IO (requires CONTAINER_TERMINAL_ENABLED). */
export function terminalWebsocketShellEnabled(): boolean {
  return (
    process.env.CONTAINER_TERMINAL_ENABLED === 'true' &&
    process.env.TERMINAL_WS_SHELL_ENABLED === 'true'
  );
}

export type TerminalWsExecutorKind = 'local_shell' | 'docker_run' | 'docker_persistent';

/**
 * When the websocket shell is enabled, chooses how each command runs:
 * - `local` (default): host `SHELL` / `sh` (existing behavior)
 * - `docker`: persistent per-session container, command via `docker exec`
 * - `docker_oneshot`: legacy `docker run --rm` one-shot per command
 */
export function terminalWsExecutorKind(): TerminalWsExecutorKind {
  const v = (process.env.TERMINAL_WS_EXECUTOR || 'local').trim().toLowerCase();
  if (v === 'docker' || v === 'docker_persistent') return 'docker_persistent';
  if (v === 'docker_oneshot') return 'docker_run';
  return 'local_shell';
}

const DEFAULT_MAX_OUTPUT = 512 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_COMMAND_LEN = 16_384;

function maxOutputBytes(): number {
  const n = parseInt(process.env.TERMINAL_WS_MAX_OUTPUT_BYTES || '', 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_OUTPUT;
}

function cmdTimeoutMs(): number {
  const n = parseInt(process.env.TERMINAL_WS_CMD_TIMEOUT_MS || '', 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
}

/** Reject obvious host-escape / destructive one-liners (MVP guardrail, not a sandbox). */
export function isCommandBlocked(command: string): string | null {
  const t = command.trim();
  if (!t) return 'Empty command';
  if (t.length > MAX_COMMAND_LEN) return 'Command too long';
  if (t.includes('\0')) return 'Invalid command';
  const lower = t.toLowerCase();
  const risky = ['mkfs', 'dd if=', ':(){', 'chmod -r 777 /', 'chmod 777 /', '> /dev/sd'];
  for (const p of risky) {
    if (lower.includes(p)) return 'Command blocked by server policy';
  }
  return null;
}

export interface ShellStreamHandlers {
  onStdout: (chunk: string) => void;
  onStderr: (chunk: string) => void;
}

export interface TerminalShellSession {
  getCwd(): string;
  isRunning(): boolean;
  killChild(): void;
  runCommand(
    command: string,
    handlers: ShellStreamHandlers
  ): Promise<{ code: number | null; signal: NodeJS.Signals | null; truncated: boolean }>;
  tryChdir(command: string): boolean;
  getExecutionBackend(): TerminalWsExecutorKind;
}

function sanitizeSessionKeyForPath(sessionKey: string): string {
  return sessionKey.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'session';
}

function sanitizeSessionKeyForName(sessionKey: string): string {
  return sessionKey
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 42) || 'session';
}

function hashSessionKey(sessionKey: string): string {
  let hash = 2166136261;
  for (let i = 0; i < sessionKey.length; i += 1) {
    hash ^= sessionKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function containerNameForSession(sessionKey: string): string {
  return `sy-term-${sanitizeSessionKeyForName(sessionKey)}-${hashSessionKey(sessionKey)}`;
}

/** Build `docker run` argv (after `docker`) for tests and inspection. */
export function buildDockerRunArgs(hostWorkdirAbs: string, userCommand: string): string[] {
  const image = process.env.TERMINAL_DOCKER_IMAGE || 'alpine:3.19';
  const network = process.env.TERMINAL_DOCKER_NETWORK || 'none';
  const memory = process.env.TERMINAL_DOCKER_MEMORY || '256m';
  const cpus = process.env.TERMINAL_DOCKER_CPUS || '1';
  const pids = process.env.TERMINAL_DOCKER_PIDS_LIMIT || '256';
  const abs = path.resolve(hostWorkdirAbs);
  const args = [
    'run',
    '--rm',
    '--network',
    network,
    '--memory',
    memory,
    '--cpus',
    cpus,
    '-w',
    '/work',
    '-v',
    `${abs}:/work`,
  ];
  if (pids.trim()) {
    args.push('--pids-limit', pids.trim());
  }
  args.push(image, 'sh', '-c', userCommand);
  return args;
}

export function terminalRuntimeEnv(baseEnv: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...baseEnv };

  const awsRegion = (env.AWS_REGION || env.AWS_DEFAULT_REGION || '').trim();
  if (awsRegion) {
    env.AWS_REGION = awsRegion;
    env.AWS_DEFAULT_REGION = awsRegion;
  }

  const mongoUri = (
    env.MONGOSH_CONNECTION_STRING ||
    env.MDB_CONNECTION_STRING ||
    env.MONGODB_CONNECTION_STRING ||
    env.MONGODB_URI ||
    ''
  ).trim();
  if (mongoUri) {
    env.MONGOSH_CONNECTION_STRING = mongoUri;
    env.MDB_CONNECTION_STRING = mongoUri;
    env.MONGODB_CONNECTION_STRING = mongoUri;
    env.MONGODB_URI = mongoUri;
  }

  // Encourage ANSI colors in CLI output for xterm.js rendering.
  env.TERM = env.TERM || 'xterm-256color';
  env.CI = env.CI || '0';
  env.FORCE_COLOR = env.FORCE_COLOR || '1';
  env.CLICOLOR = env.CLICOLOR || '1';
  env.CLICOLOR_FORCE = env.CLICOLOR_FORCE || '1';

  return env;
}

function dockerTerminalEnvArgs(env: NodeJS.ProcessEnv): string[] {
  const allowlist = [
    'TERM',
    'FORCE_COLOR',
    'CLICOLOR',
    'CLICOLOR_FORCE',
    'AWS_REGION',
    'AWS_DEFAULT_REGION',
    'MONGOSH_CONNECTION_STRING',
    'MDB_CONNECTION_STRING',
    'MONGODB_CONNECTION_STRING',
    'MONGODB_URI',
  ] as const;
  const args: string[] = [];
  for (const key of allowlist) {
    const value = env[key];
    if (typeof value === 'string' && value.trim()) {
      args.push('--env', `${key}=${value}`);
    }
  }
  return args;
}

/** Build persistent container boot argv (after `docker`). */
export function buildDockerPersistentBootArgs(
  hostWorkdirAbs: string,
  containerName: string,
  env?: NodeJS.ProcessEnv
): string[] {
  const image = process.env.TERMINAL_DOCKER_IMAGE || 'alpine:3.19';
  const network = process.env.TERMINAL_DOCKER_NETWORK || 'none';
  const memory = process.env.TERMINAL_DOCKER_MEMORY || '256m';
  const cpus = process.env.TERMINAL_DOCKER_CPUS || '1';
  const pids = process.env.TERMINAL_DOCKER_PIDS_LIMIT || '256';
  const abs = path.resolve(hostWorkdirAbs);
  const args = [
    'run',
    '-d',
    '--name',
    containerName,
    '--network',
    network,
    '--memory',
    memory,
    '--cpus',
    cpus,
    '-w',
    '/work',
    '-v',
    `${abs}:/work`,
  ];
  if (pids.trim()) {
    args.push('--pids-limit', pids.trim());
  }
  if (env) {
    args.push(...dockerTerminalEnvArgs(env));
  }
  args.push(image, 'sh', '-lc', 'while true; do sleep 3600; done');
  return args;
}

/** Build `docker exec` argv (after `docker`) for persistent session containers. */
export function buildDockerExecArgs(
  containerName: string,
  containerCwd: string,
  userCommand: string,
  env?: NodeJS.ProcessEnv
): string[] {
  const args = ['exec', '-i'];
  if (env) {
    for (const item of dockerTerminalEnvArgs(env)) {
      // docker exec uses -e/--env before container name
      args.push(item === '--env' ? '-e' : item);
    }
  }
  args.push('-w', containerCwd, containerName, 'sh', '-lc', userCommand);
  return args;
}

function dockerCli(): string {
  return process.env.TERMINAL_DOCKER_CLI || 'docker';
}

async function runChildWithCaps(
  child: ChildProcess,
  handlers: ShellStreamHandlers
): Promise<{ code: number | null; signal: NodeJS.Signals | null; truncated: boolean }> {
  const stdout = child.stdout;
  const stderr = child.stderr;
  if (!stdout || !stderr) {
    handlers.onStderr('Failed to spawn process\n');
    return { code: 1, signal: null, truncated: false };
  }

  const maxOut = maxOutputBytes();
  let totalBytes = 0;
  let truncated = false;

  const capStream = (chunk: Buffer, emit: (s: string) => void) => {
    if (truncated) return;
    if (totalBytes + chunk.length > maxOut) {
      truncated = true;
      const rest = maxOut - totalBytes;
      if (rest > 0) emit(chunk.subarray(0, rest).toString('utf8'));
      emit('\n[output truncated]\n');
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
      return;
    }
    totalBytes += chunk.length;
    emit(chunk.toString('utf8'));
  };

  stdout.on('data', (c: Buffer) => capStream(c, handlers.onStdout));
  stderr.on('data', (c: Buffer) => capStream(c, handlers.onStderr));

  const timeout = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      handlers.onStderr('\n[command timed out]\n');
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    }
  }, cmdTimeoutMs());

  let settled = false;
  const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolve) => {
      const finish = (r: { code: number | null; signal: NodeJS.Signals | null }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(r);
      };
      child.on('error', (err) => {
        handlers.onStderr(String(err.message) + '\n');
        finish({ code: 1, signal: null });
      });
      child.on('close', (code, signal) => {
        finish({ code, signal });
      });
    }
  );
  return { ...result, truncated };
}

function tryChdirHost(cwdHolder: { cwd: string }, command: string): boolean {
  const m = command.trim().match(/^cd\s+(.+)$/);
  if (!m) return false;
  let target = m[1].trim();
  if (
    (target.startsWith('"') && target.endsWith('"')) ||
    (target.startsWith("'") && target.endsWith("'"))
  ) {
    target = target.slice(1, -1);
  }
  const next = path.resolve(cwdHolder.cwd, target);
  try {
    const stat = statSync(next);
    if (!stat.isDirectory()) return false;
    cwdHolder.cwd = next;
    return true;
  } catch {
    return false;
  }
}

/** Reject `cd` that leaves `rootDir` (prevents bind-mounting arbitrary host paths in docker mode). */
function tryChdirUnderRoot(
  cwdHolder: { cwd: string },
  rootDir: string,
  command: string
): boolean {
  const m = command.trim().match(/^cd\s+(.+)$/);
  if (!m) return false;
  let target = m[1].trim();
  if (
    (target.startsWith('"') && target.endsWith('"')) ||
    (target.startsWith("'") && target.endsWith("'"))
  ) {
    target = target.slice(1, -1);
  }
  const next = path.resolve(cwdHolder.cwd, target);
  const root = path.resolve(rootDir);
  const rel = path.relative(root, next);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
  try {
    const stat = statSync(next);
    if (!stat.isDirectory()) return false;
    cwdHolder.cwd = next;
    return true;
  } catch {
    return false;
  }
}

type SpawnedShell = ReturnType<typeof spawn>;

export class LocalShellSession implements TerminalShellSession {
  private cwd: string;
  private child: SpawnedShell | null = null;
  private running = false;

  constructor(opts?: { cwd?: string }) {
    this.cwd = opts?.cwd ?? process.cwd();
  }

  getExecutionBackend(): TerminalWsExecutorKind {
    return 'local_shell';
  }

  getCwd(): string {
    return this.cwd;
  }

  isRunning(): boolean {
    return this.running;
  }

  killChild(): void {
    if (!this.child) return;
    try {
      this.child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    this.child = null;
    this.running = false;
  }

  async runCommand(command: string, handlers: ShellStreamHandlers): Promise<{
    code: number | null;
    signal: NodeJS.Signals | null;
    truncated: boolean;
  }> {
    const block = isCommandBlocked(command);
    if (block) {
      handlers.onStderr(block + '\n');
      return { code: 1, signal: null, truncated: false };
    }

    this.killChild();
    this.running = true;

    const isWin = process.platform === 'win32';
    const shell = isWin ? process.env.ComSpec || 'cmd.exe' : process.env.SHELL || '/bin/sh';
    const args = isWin ? ['/d', '/s', '/c', command] : ['-c', command];

    const child = spawn(shell, args, {
      cwd: this.cwd,
      env: terminalRuntimeEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.child = child;
    try {
      return await runChildWithCaps(child, handlers);
    } finally {
      this.child = null;
      this.running = false;
    }
  }

  tryChdir(command: string): boolean {
    const holder = { cwd: this.cwd };
    const ok = tryChdirHost(holder, command);
    if (ok) this.cwd = holder.cwd;
    return ok;
  }
}

/**
 * Per-websocket session: host directory is bind-mounted at /work; each command is a fresh `docker run --rm`.
 */
export class DockerOneShotShellSession implements TerminalShellSession {
  private cwd: string;
  private readonly sessionRoot: string;
  private child: SpawnedShell | null = null;
  private running = false;

  constructor(opts: { sessionKey: string }) {
    const dir = path.join(os.tmpdir(), 'sy-terminal-ws', sanitizeSessionKeyForPath(opts.sessionKey));
    mkdirSync(dir, { recursive: true });
    this.sessionRoot = dir;
    this.cwd = dir;
  }

  getExecutionBackend(): TerminalWsExecutorKind {
    return 'docker_run';
  }

  getCwd(): string {
    return this.cwd;
  }

  isRunning(): boolean {
    return this.running;
  }

  killChild(): void {
    if (!this.child) return;
    try {
      this.child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    this.child = null;
    this.running = false;
  }

  async runCommand(command: string, handlers: ShellStreamHandlers): Promise<{
    code: number | null;
    signal: NodeJS.Signals | null;
    truncated: boolean;
  }> {
    const block = isCommandBlocked(command);
    if (block) {
      handlers.onStderr(block + '\n');
      return { code: 1, signal: null, truncated: false };
    }

    this.killChild();
    this.running = true;

    const cli = dockerCli();
    const sessionEnv = terminalRuntimeEnv();
    const args = buildDockerRunArgs(this.cwd, command);
    const envArgs = dockerTerminalEnvArgs(sessionEnv);
    if (envArgs.length > 0) {
      // inject env args just before image to preserve existing defaults
      const imageIdx = Math.max(0, args.length - 4);
      args.splice(imageIdx, 0, ...envArgs);
    }
    const child = spawn(cli, args, {
      env: sessionEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.child = child;
    try {
      return await runChildWithCaps(child, handlers);
    } finally {
      this.child = null;
      this.running = false;
    }
  }

  tryChdir(command: string): boolean {
    const holder = { cwd: this.cwd };
    const ok = tryChdirUnderRoot(holder, this.sessionRoot, command);
    if (ok) this.cwd = holder.cwd;
    return ok;
  }
}

/** Shared persistent docker sessions by `sessionKey` for reconnect-friendly command state. */
const persistentDockerSessions = new Map<string, DockerPersistentShellSession>();

export class DockerPersistentShellSession implements TerminalShellSession {
  private cwd: string;
  private readonly sessionRoot: string;
  private readonly sessionKey: string;
  private readonly containerName: string;
  private child: SpawnedShell | null = null;
  private running = false;
  private containerReady = false;
  private lastUsedAt = Date.now();

  constructor(opts: { sessionKey: string }) {
    const dir = path.join(os.tmpdir(), 'sy-terminal-ws', sanitizeSessionKeyForPath(opts.sessionKey));
    mkdirSync(dir, { recursive: true });
    this.sessionRoot = dir;
    this.cwd = dir;
    this.sessionKey = opts.sessionKey;
    this.containerName = containerNameForSession(opts.sessionKey);
  }

  getExecutionBackend(): TerminalWsExecutorKind {
    return 'docker_persistent';
  }

  getCwd(): string {
    return this.cwd;
  }

  isRunning(): boolean {
    return this.running;
  }

  killChild(): void {
    if (!this.child) return;
    try {
      this.child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    this.child = null;
    this.running = false;
  }

  private containerCwd(): string {
    const rel = path.relative(this.sessionRoot, this.cwd);
    if (!rel || rel === '.') return '/work';
    return `/work/${rel.split(path.sep).join('/')}`;
  }

  private async runDockerCommand(args: string[]): Promise<number> {
    const cli = dockerCli();
    return await new Promise<number>((resolve, reject) => {
      const child = spawn(cli, args, { env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr?.on('data', (c: Buffer) => {
        stderr += c.toString('utf8');
      });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve(0);
        else reject(new Error(stderr.trim() || `docker command failed (exit ${code ?? 'unknown'})`));
      });
    });
  }

  private async ensureContainerStarted(): Promise<void> {
    if (this.containerReady) return;

    try {
      await this.runDockerCommand(['inspect', this.containerName]);
      await this.runDockerCommand(['start', this.containerName]);
    } catch {
      await this.runDockerCommand(
        buildDockerPersistentBootArgs(this.sessionRoot, this.containerName, terminalRuntimeEnv())
      );
    }
    this.containerReady = true;
    this.lastUsedAt = Date.now();
  }

  async runCommand(command: string, handlers: ShellStreamHandlers): Promise<{
    code: number | null;
    signal: NodeJS.Signals | null;
    truncated: boolean;
  }> {
    const block = isCommandBlocked(command);
    if (block) {
      handlers.onStderr(block + '\n');
      return { code: 1, signal: null, truncated: false };
    }

    await this.ensureContainerStarted();
    this.killChild();
    this.running = true;
    this.lastUsedAt = Date.now();

    const cli = dockerCli();
    const args = buildDockerExecArgs(
      this.containerName,
      this.containerCwd(),
      command,
      terminalRuntimeEnv()
    );
    const child = spawn(cli, args, {
      env: terminalRuntimeEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.child = child;
    try {
      return await runChildWithCaps(child, handlers);
    } finally {
      this.child = null;
      this.running = false;
      this.lastUsedAt = Date.now();
    }
  }

  tryChdir(command: string): boolean {
    const holder = { cwd: this.cwd };
    const ok = tryChdirUnderRoot(holder, this.sessionRoot, command);
    if (ok) this.cwd = holder.cwd;
    if (ok) this.lastUsedAt = Date.now();
    return ok;
  }

  /** Best-effort stop/remove when evicted by idle reaper. */
  async dispose(): Promise<void> {
    this.killChild();
    try {
      await this.runDockerCommand(['rm', '-f', this.containerName]);
    } catch {
      /* ignore */
    }
    this.containerReady = false;
  }

  idleForMs(now = Date.now()): number {
    return Math.max(0, now - this.lastUsedAt);
  }

  static getOrCreate(params: { sessionKey: string }): DockerPersistentShellSession {
    const existing = persistentDockerSessions.get(params.sessionKey);
    if (existing) return existing;
    const created = new DockerPersistentShellSession(params);
    persistentDockerSessions.set(params.sessionKey, created);
    return created;
  }
}

function persistentSessionTtlMs(): number {
  const n = parseInt(process.env.TERMINAL_PERSISTENT_IDLE_TTL_MS || '', 10);
  if (Number.isFinite(n) && n > 0) return n;
  return 30 * 60 * 1000;
}

function cleanupPersistentDockerSessions(): void {
  const ttl = persistentSessionTtlMs();
  const now = Date.now();
  for (const [key, session] of persistentDockerSessions.entries()) {
    if (session.isRunning()) continue;
    if (session.idleForMs(now) < ttl) continue;
    persistentDockerSessions.delete(key);
    void session.dispose();
  }
}

let persistentReaperStarted = false;
function ensurePersistentReaperStarted(): void {
  if (persistentReaperStarted) return;
  persistentReaperStarted = true;
  const tickMs = 60_000;
  setInterval(cleanupPersistentDockerSessions, tickMs).unref();
}

export function createTerminalShellSession(params: { sessionKey: string }): TerminalShellSession {
  if (terminalWsExecutorKind() === 'docker_persistent') {
    ensurePersistentReaperStarted();
    return DockerPersistentShellSession.getOrCreate({ sessionKey: params.sessionKey });
  }
  if (terminalWsExecutorKind() === 'docker_run') {
    return new DockerOneShotShellSession({ sessionKey: params.sessionKey });
  }
  return new LocalShellSession();
}
