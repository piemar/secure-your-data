import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { signToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const DEFAULT_TENANT_ID = 'default';

function extractEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const idx = normalized.lastIndexOf('@');
  if (idx <= 0 || idx === normalized.length - 1) return null;
  return normalized.slice(idx + 1);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeOptionalString(value: unknown, maxLen = 120): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLen);
}

/** POST /api/auth/register */
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { handle, password, role = 'attendee' } = req.body;
    const firstName = normalizeOptionalString(req.body?.firstName, 80);
    const lastName = normalizeOptionalString(req.body?.lastName, 80);
    const avatarId = normalizeOptionalString(req.body?.avatarId, 40);
    const normalizedEmailRaw = normalizeOptionalString(req.body?.email, 200);
    const normalizedEmail = normalizedEmailRaw ? normalizedEmailRaw.toLowerCase() : undefined;
    if (normalizedEmail && !extractEmailDomain(normalizedEmail)) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }

    if (!handle || !password) {
      res.status(400).json({ error: 'Handle and password are required' });
      return;
    }

    const db = getDb();
    const existing = await db.collection(COLLECTIONS.USERS).findOne({ handle });
    if (existing) {
      res.status(409).json({ error: 'Handle already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      handle,
      password: hashedPassword,
      role: role === 'moderator' ? 'moderator' : 'attendee',
      tenantId: DEFAULT_TENANT_ID,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(avatarId ? { avatarId } : {}),
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
    const token = signToken({
      userId: result.insertedId.toString(),
      handle,
      role: user.role as 'moderator' | 'attendee',
      tenantId: user.tenantId,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    });

    // Create initial player progress
    await db.collection(COLLECTIONS.PLAYER_PROGRESS).insertOne({
      userId: result.insertedId.toString(),
      handle,
      tenantId: user.tenantId,
      xp: 0,
      rank: 'Script Kiddie',
      level: 1,
      achievements: [],
      completedMissions: [],
      totalScore: 0,
      chaosEventsSurvived: 0,
      hintsUsed: 0,
      hintXpPenalty: 0,
      avatarId: avatarId || 'ghost',
      createdAt: new Date(),
    });

    res.status(201).json({ token, handle, role: user.role });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/** POST /api/auth/login */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { handle, password } = req.body;

    if (!handle || !password) {
      res.status(400).json({ error: 'Handle and password are required' });
      return;
    }

    const db = getDb();
    const user = await db.collection(COLLECTIONS.USERS).findOne({ handle });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      handle: user.handle,
      role: user.role as 'moderator' | 'attendee',
      tenantId: user.tenantId || DEFAULT_TENANT_ID,
      workshopId: user.workshopId,
      sessionId: user.workshopId,
      ...(typeof user.firstName === 'string' && user.firstName.trim()
        ? { firstName: user.firstName.trim().slice(0, 80) }
        : {}),
      ...(typeof user.lastName === 'string' && user.lastName.trim()
        ? { lastName: user.lastName.trim().slice(0, 80) }
        : {}),
    });

    res.json({ token, handle: user.handle, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/** POST /api/auth/join-session — PIN-based session join */
router.post('/join-session', authLimiter, async (req: Request, res: Response) => {
  try {
    const { pin, handle, email } = req.body;
    const firstName = normalizeOptionalString(req.body?.firstName, 80);
    const lastName = normalizeOptionalString(req.body?.lastName, 80);
    const avatarId = normalizeOptionalString(req.body?.avatarId, 40);

    if (!handle || !email) {
      res.status(400).json({ error: 'Handle and email are required' });
      return;
    }

    const db = getDb();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const emailDomain = normalizedEmail ? extractEmailDomain(normalizedEmail) : null;
    if (!emailDomain) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }

    let session = null;
    if (typeof pin === 'string' && pin.trim()) {
      session = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne({
        pin: pin.trim(),
        status: 'active',
        $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }],
      });
    }
    if (!session && emailDomain) {
      const domainRegex = new RegExp(`@${escapeRegex(emailDomain)}$`, 'i');
      session = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(
        {
          $and: [
            { status: 'active' },
            { $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }] },
            {
              $or: [
                { allowedEmailDomains: emailDomain },
                { technicalChampionEmail: { $regex: domainRegex } },
              ],
            },
          ],
        },
        { sort: { createdAt: -1 } }
      );
    }

    if (!session) {
      res.status(404).json({ error: 'No active session found for provided credentials' });
      return;
    }
    const sessionAllowedDomains = Array.isArray(
      (session as unknown as { allowedEmailDomains?: unknown }).allowedEmailDomains
    )
      ? ((session as unknown as { allowedEmailDomains: string[] }).allowedEmailDomains || [])
      : [];
    if (sessionAllowedDomains.length > 0) {
      if (!emailDomain) {
        res.status(400).json({ error: 'Email is required for this session' });
        return;
      }
      const allowed = sessionAllowedDomains.map(d => d.trim().toLowerCase());
      if (!allowed.includes(emailDomain)) {
        res.status(403).json({ error: 'Email domain is not allowed for this workshop' });
        return;
      }
    }

    // Upsert user as attendee
    const tenantId = session.tenantId || DEFAULT_TENANT_ID;
    const workshopId = session._id.toString();

    const userResult = await db.collection(COLLECTIONS.USERS).findOneAndUpdate(
      { handle },
      {
        $setOnInsert: {
          handle,
          email: normalizedEmail,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(avatarId ? { avatarId } : {}),
          password: '', // PIN-only users don't need passwords
          role: 'attendee',
          tenantId,
          workshopId,
          createdAt: new Date(),
        },
        $set: {
          workshopId,
          tenantId,
          email: normalizedEmail,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(avatarId ? { avatarId } : {}),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const userId = userResult!._id.toString();

    // Add participant to session
    await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(
      { _id: session._id },
      { $addToSet: { participants: userId } }
    );

    await db.collection(COLLECTIONS.PLAYER_PROGRESS).updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          handle,
          tenantId,
          workshopId,
          xp: 0,
          rank: 'Script Kiddie',
          level: 1,
          achievements: [],
          completedMissions: [],
          totalScore: 0,
          chaosEventsSurvived: 0,
          hintsUsed: 0,
          hintXpPenalty: 0,
          avatarId: avatarId || 'ghost',
          createdAt: new Date(),
        },
        $set: {
          tenantId,
          workshopId,
          ...(avatarId ? { avatarId } : {}),
        },
      },
      { upsert: true }
    );

    const token = signToken({
      userId,
      handle,
      role: 'attendee',
      tenantId,
      workshopId,
      sessionId: workshopId,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    });

    res.json({
      token,
      handle,
      role: 'attendee',
      sessionId: workshopId,
      sessionName: session.name,
    });
  } catch (err) {
    console.error('Join session error:', err);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

export default router;
