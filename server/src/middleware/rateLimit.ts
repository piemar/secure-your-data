import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

function envBool(name: string, fallback: boolean): boolean {
  const raw = (process.env[name] || '').trim().toLowerCase();
  if (!raw) return fallback;
  return !['0', 'false', 'no', 'off'].includes(raw);
}

function envInt(name: string, fallback: number): number {
  const raw = parseInt(process.env[name] || '', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function isLoopback(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1' ||
    normalized === 'localhost'
  );
}

function shouldBypassForLocalhost(req: Request): boolean {
  const bypassLocalhost = envBool('RATE_LIMIT_BYPASS_LOCALHOST', true);
  const bypassDev = envBool('RATE_LIMIT_BYPASS_DEV', true);
  if (bypassDev && process.env.NODE_ENV !== 'production') return true;
  if (!bypassLocalhost) return false;
  return isLoopback(req.ip) || isLoopback(req.socket.remoteAddress || undefined);
}

/** General API rate limit */
export const apiLimiter = rateLimit({
  windowMs: envInt('API_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: envInt('API_RATE_LIMIT_MAX', 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassForLocalhost,
  message: { error: 'Too many requests, try again later' },
});

/** Strict limit for auth endpoints (PIN brute-force protection) */
export const authLimiter = rateLimit({
  windowMs: envInt('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: envInt('AUTH_RATE_LIMIT_MAX', 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassForLocalhost,
  message: { error: 'Too many auth attempts, try again later' },
});
