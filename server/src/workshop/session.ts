import { Request } from 'express';

/**
 * Workshop/session key for sandbox isolation: explicit body/query wins,
 * then JWT workshop session, else solo.
 */
export function resolveSessionId(req: Request, explicit?: unknown): string {
  let fromExplicit = '';
  if (typeof explicit === 'string') fromExplicit = explicit.trim();
  else if (Array.isArray(explicit) && typeof explicit[0] === 'string') fromExplicit = explicit[0].trim();
  if (fromExplicit) return fromExplicit;

  const jwtSid = req.user?.sessionId;
  if (jwtSid && String(jwtSid).trim()) return String(jwtSid).trim();

  return 'solo';
}
