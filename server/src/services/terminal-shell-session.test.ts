import { describe, it, expect, vi, afterEach } from 'vitest';
import path from 'path';
import {
  isCommandBlocked,
  LocalShellSession,
  buildDockerRunArgs,
  buildDockerPersistentBootArgs,
  buildDockerExecArgs,
  terminalWsExecutorKind,
  createTerminalShellSession,
  DockerOneShotShellSession,
  DockerPersistentShellSession,
} from './terminal-shell-session.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isCommandBlocked', () => {
  it('allows benign commands', () => {
    expect(isCommandBlocked('echo hello')).toBeNull();
    expect(isCommandBlocked('pwd')).toBeNull();
  });

  it('rejects empty and oversize', () => {
    expect(isCommandBlocked('')).toBeTruthy();
    expect(isCommandBlocked('   ')).toBeTruthy();
    expect(isCommandBlocked('x'.repeat(20000))).toBeTruthy();
  });

  it('rejects null byte', () => {
    expect(isCommandBlocked('echo hi\0')).toBeTruthy();
  });

  it('blocks a few destructive patterns', () => {
    expect(isCommandBlocked('mkfs /dev/sda')).toBeTruthy();
    expect(isCommandBlocked('dd if=/dev/zero')).toBeTruthy();
  });
});

describe('terminalWsExecutorKind', () => {
  it('defaults to local_shell', () => {
    delete process.env.TERMINAL_WS_EXECUTOR;
    expect(terminalWsExecutorKind()).toBe('local_shell');
  });

  it('selects docker_persistent when TERMINAL_WS_EXECUTOR=docker', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker');
    expect(terminalWsExecutorKind()).toBe('docker_persistent');
  });

  it('selects docker_run when TERMINAL_WS_EXECUTOR=docker_oneshot', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker_oneshot');
    expect(terminalWsExecutorKind()).toBe('docker_run');
  });

  it('treats unknown values as local_shell', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'k8s');
    expect(terminalWsExecutorKind()).toBe('local_shell');
  });
});

describe('buildDockerRunArgs', () => {
  it('builds run argv with bind mount, limits, and sh -c command', () => {
    vi.stubEnv('TERMINAL_DOCKER_IMAGE', 'testimg:1');
    vi.stubEnv('TERMINAL_DOCKER_NETWORK', 'none');
    vi.stubEnv('TERMINAL_DOCKER_MEMORY', '128m');
    vi.stubEnv('TERMINAL_DOCKER_CPUS', '0.5');
    vi.stubEnv('TERMINAL_DOCKER_PIDS_LIMIT', '64');
    const args = buildDockerRunArgs('/tmp/sy-work', 'echo x');
    expect(args[0]).toBe('run');
    expect(args).toContain('--rm');
    expect(args).toContain('--network');
    expect(args).toContain('none');
    expect(args).toContain('--memory');
    expect(args).toContain('128m');
    expect(args).toContain('--cpus');
    expect(args).toContain('0.5');
    expect(args).toContain('--pids-limit');
    expect(args).toContain('64');
    expect(args).toContain('-w');
    expect(args).toContain('/work');
    expect(args).toContain('-v');
    const vol = args.find((_, i) => args[i - 1] === '-v');
    expect(vol).toMatch(/:\/work$/);
    expect(args).toContain('testimg:1');
    expect(args).toContain('sh');
    expect(args).toContain('-c');
    expect(args[args.length - 1]).toBe('echo x');
  });

  it('omits pids-limit when TERMINAL_DOCKER_PIDS_LIMIT is empty', () => {
    vi.stubEnv('TERMINAL_DOCKER_PIDS_LIMIT', '   ');
    const args = buildDockerRunArgs('/tmp/x', 'true');
    expect(args).not.toContain('--pids-limit');
  });
});

describe('persistent docker args', () => {
  it('builds boot args for detached session container', () => {
    vi.stubEnv('TERMINAL_DOCKER_IMAGE', 'testimg:1');
    const args = buildDockerPersistentBootArgs('/tmp/sy-work', 'sy-term-demo');
    expect(args[0]).toBe('run');
    expect(args).toContain('-d');
    expect(args).toContain('--name');
    expect(args).toContain('sy-term-demo');
    expect(args).toContain('testimg:1');
    expect(args.join(' ')).toMatch(/sleep 3600/);
  });

  it('builds exec args with container cwd', () => {
    const args = buildDockerExecArgs('sy-term-demo', '/work/subdir', 'pwd');
    expect(args).toEqual(['exec', '-i', '-w', '/work/subdir', 'sy-term-demo', 'sh', '-lc', 'pwd']);
  });

  it('propagates key env vars to docker exec', () => {
    const args = buildDockerExecArgs('sy-term-demo', '/work', 'env', {
      AWS_REGION: 'eu-north-1',
      MONGOSH_CONNECTION_STRING: 'mongodb://example:27017',
    });
    expect(args).toContain('-e');
    expect(args).toContain('AWS_REGION=eu-north-1');
    expect(args).toContain('MONGOSH_CONNECTION_STRING=mongodb://example:27017');
  });
});

describe('createTerminalShellSession', () => {
  it('returns local backend by default', () => {
    delete process.env.TERMINAL_WS_EXECUTOR;
    const s = createTerminalShellSession({ sessionKey: 't:u:w' });
    expect(s.getExecutionBackend()).toBe('local_shell');
  });

  it('returns docker backend when configured', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker');
    const s = createTerminalShellSession({ sessionKey: 't:u:w' });
    expect(s.getExecutionBackend()).toBe('docker_persistent');
  });

  it('returns docker oneshot backend when explicitly configured', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker_oneshot');
    const s = createTerminalShellSession({ sessionKey: 't:u:w' });
    expect(s.getExecutionBackend()).toBe('docker_run');
  });

  it('reuses persistent docker session object by sessionKey', () => {
    vi.stubEnv('TERMINAL_WS_EXECUTOR', 'docker');
    const a = createTerminalShellSession({ sessionKey: 't:u:w' });
    const b = createTerminalShellSession({ sessionKey: 't:u:w' });
    expect(a).toBeInstanceOf(DockerPersistentShellSession);
    expect(a).toBe(b);
  });
});

describe('DockerOneShotShellSession', () => {
  it('uses isolated workspace dir and docker_run backend', () => {
    const shell = new DockerOneShotShellSession({ sessionKey: 'tenant:user:ws' });
    expect(shell.getCwd()).toMatch(/sy-terminal-ws/);
    expect(shell.getExecutionBackend()).toBe('docker_run');
  });

  it('bind-mount volume uses resolved session cwd', () => {
    const shell = new DockerOneShotShellSession({ sessionKey: 't:u:w' });
    const args = buildDockerRunArgs(shell.getCwd(), 'echo hi');
    const vIdx = args.indexOf('-v');
    expect(args[vIdx + 1]).toBe(`${path.resolve(shell.getCwd())}:/work`);
  });

  it('blocks risky commands without invoking docker', async () => {
    const shell = new DockerOneShotShellSession({ sessionKey: 't:u:w' });
    const err: string[] = [];
    const r = await shell.runCommand('dd if=/dev/zero', {
      onStdout: () => {},
      onStderr: (s) => err.push(s),
    });
    expect(r.code).toBe(1);
    expect(err.join('')).toMatch(/blocked/i);
  });

  it('rejects cd outside the session workspace (no host path escape)', () => {
    const shell = new DockerOneShotShellSession({ sessionKey: 'escape:test' });
    const before = shell.getCwd();
    expect(shell.tryChdir('cd ..')).toBe(false);
    expect(shell.getCwd()).toBe(before);
  });
});

describe('LocalShellSession', () => {
  it('runs echo with streamed stdout', async () => {
    const shell = new LocalShellSession();
    const chunks: string[] = [];
    const r = await shell.runCommand(process.platform === 'win32' ? 'echo hi' : 'echo hi', {
      onStdout: (s) => chunks.push(s),
      onStderr: (s) => chunks.push(`ERR:${s}`),
    });
    expect(r.code).toBe(0);
    expect(chunks.join('')).toMatch(/hi/);
  });
});
