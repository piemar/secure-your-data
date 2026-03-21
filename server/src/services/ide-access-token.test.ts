import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signIdeAccessToken,
  verifyIdeAccessToken,
  IDE_ACCESS_TOKEN_TYP,
  IDE_ACCESS_SCOPE,
} from './ide-access-token.js';

describe('ide-access-token', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-for-ide-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('round-trips a signed IDE access token with session, tenant, user, and scope', () => {
    const token = signIdeAccessToken({
      sessionId: 't1:u1:w1',
      tenantId: 't1',
      userId: 'u1',
      expiresInSec: 3600,
    });
    const payload = verifyIdeAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.typ).toBe(IDE_ACCESS_TOKEN_TYP);
    expect(payload?.scope).toBe(IDE_ACCESS_SCOPE);
    expect(payload?.sessionId).toBe('t1:u1:w1');
    expect(payload?.tenantId).toBe('t1');
    expect(payload?.userId).toBe('u1');
  });

  it('rejects login-style JWTs without ide typ/scope', () => {
    const secret = process.env.JWT_SECRET!;
    const wrong = jwt.sign(
      { userId: 'u1', tenantId: 't1', role: 'attendee' },
      secret,
      { expiresIn: 3600 }
    );
    expect(verifyIdeAccessToken(wrong)).toBeNull();
  });

  it('rejects tampered tokens', () => {
    const token = signIdeAccessToken({
      sessionId: 'a:b:c',
      tenantId: 't',
      userId: 'u',
    });
    const broken = `${token.slice(0, -4)}nope`;
    expect(verifyIdeAccessToken(broken)).toBeNull();
  });
});
