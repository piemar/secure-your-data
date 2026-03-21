import jwt, { type SignOptions } from 'jsonwebtoken';

export const IDE_ACCESS_TOKEN_TYP = 'ide-access';
export const IDE_ACCESS_SCOPE = 'ide';

export interface IdeAccessTokenPayload {
  typ: typeof IDE_ACCESS_TOKEN_TYP;
  sessionId: string;
  tenantId: string;
  userId: string;
  scope: typeof IDE_ACCESS_SCOPE;
}

/** Short-lived IDE proxy access (seconds). */
const DEFAULT_EXPIRES_SEC = 15 * 60;

export function signIdeAccessToken(params: {
  sessionId: string;
  tenantId: string;
  userId: string;
  /** JWT `expiresIn` seconds (default 15m). */
  expiresInSec?: number;
}): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const payload: IdeAccessTokenPayload = {
    typ: IDE_ACCESS_TOKEN_TYP,
    sessionId: params.sessionId,
    tenantId: params.tenantId,
    userId: params.userId,
    scope: IDE_ACCESS_SCOPE,
  };
  const signOpts: SignOptions = { expiresIn: params.expiresInSec ?? DEFAULT_EXPIRES_SEC };
  return jwt.sign(payload as object, secret, signOpts);
}

export function verifyIdeAccessToken(token: string): IdeAccessTokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & Partial<IdeAccessTokenPayload>;
    if (decoded.typ !== IDE_ACCESS_TOKEN_TYP || decoded.scope !== IDE_ACCESS_SCOPE) return null;
    if (
      typeof decoded.sessionId !== 'string' ||
      typeof decoded.tenantId !== 'string' ||
      typeof decoded.userId !== 'string'
    ) {
      return null;
    }
    return {
      typ: IDE_ACCESS_TOKEN_TYP,
      sessionId: decoded.sessionId,
      tenantId: decoded.tenantId,
      userId: decoded.userId,
      scope: IDE_ACCESS_SCOPE,
    };
  } catch {
    return null;
  }
}
