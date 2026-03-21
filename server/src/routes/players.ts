import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/** GET /api/players/me — current player profile */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userObjectId = ObjectId.isValid(req.user!.userId) ? new ObjectId(req.user!.userId) : null;
    const [progress, user] = await Promise.all([
      db.collection(COLLECTIONS.PLAYER_PROGRESS).findOne({
        userId: req.user!.userId,
      }),
      userObjectId
        ? db.collection(COLLECTIONS.USERS).findOne(
            { _id: userObjectId },
            { projection: { role: 1, workshopId: 1, tenantId: 1, email: 1, firstName: 1, lastName: 1 } }
          ).catch(() => null)
        : Promise.resolve(null),
    ]);

    if (!progress) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    const pickFirstNonEmpty = (...candidates: unknown[]): string | null => {
      for (const c of candidates) {
        if (typeof c === 'string' && c.trim()) return c.trim();
      }
      return null;
    };

    const workshopSessionId = pickFirstNonEmpty(
      progress.workshopId,
      user?.workshopId,
      req.user!.workshopId,
      req.user!.sessionId
    );

    res.json({
      ...progress,
      role: user?.role || req.user!.role,
      tenantId: progress.tenantId || user?.tenantId || req.user!.tenantId,
      workshopId: workshopSessionId,
      sessionId: workshopSessionId,
      email: typeof user?.email === 'string' ? user.email : undefined,
      firstName: typeof user?.firstName === 'string' ? user.firstName : undefined,
      lastName: typeof user?.lastName === 'string' ? user.lastName : undefined,
    });
  } catch (err) {
    console.error('Get player error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/** PUT /api/players/me — update player profile */
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const allowedFields = ['avatarId', 'preferredDifficulty'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const result = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOneAndUpdate(
      { userId: req.user!.userId, tenantId: req.user!.tenantId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (err) {
    console.error('Update player error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

/** POST /api/players/sync — merge local player cache into server profile */
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const local = req.body?.player || {};

    const toNumber = (value: unknown, fallback = 0): number =>
      typeof value === 'number' && Number.isFinite(value) ? value : fallback;
    const toStringArray = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];

    const current = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOne({
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
    });

    if (!current) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    const merged = {
      xp: Math.max(toNumber(current.xp), toNumber(local.xp)),
      totalScore: Math.max(toNumber(current.totalScore), toNumber(local.totalScore)),
      hintsUsed: Math.max(toNumber(current.hintsUsed), toNumber(local.hintsUsed)),
      hintXpPenalty: Math.max(toNumber(current.hintXpPenalty), toNumber(local.hintXpPenalty)),
      chaosEventsSurvived: Math.max(toNumber(current.chaosEventsSurvived), toNumber(local.chaosEventsSurvived)),
      avatarId: typeof local.avatarId === 'string' ? local.avatarId : current.avatarId,
      preferredDifficulty:
        local.preferredDifficulty === 'guided' ||
        local.preferredDifficulty === 'challenge' ||
        local.preferredDifficulty === 'expert'
          ? local.preferredDifficulty
          : current.preferredDifficulty,
      completedMissions: Array.from(new Set([
        ...toStringArray(current.completedMissions),
        ...toStringArray(local.completedMissions),
      ])),
      achievements: Array.from(new Set([
        ...toStringArray(current.achievements),
        ...toStringArray(local.achievements),
      ])),
    };

    const level = Math.floor(merged.xp / 250) + 1;

    const rankThresholds = [
      { minXP: 0, rank: 'Script Kiddie' },
      { minXP: 500, rank: 'Query Cadet' },
      { minXP: 1500, rank: 'Replica Ranger' },
      { minXP: 3500, rank: 'Shard Commander' },
      { minXP: 7000, rank: 'Atlas Overlord' },
    ];
    let rank = 'Script Kiddie';
    for (const t of rankThresholds) {
      if (merged.xp >= t.minXP) rank = t.rank;
    }

    const result = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOneAndUpdate(
      { userId: req.user!.userId, tenantId: req.user!.tenantId },
      {
        $set: {
          ...merged,
          rank,
          level,
          workshopId: req.user!.workshopId || req.user!.sessionId || current.workshopId || null,
          tenantId: req.user!.tenantId,
        },
      },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (err) {
    console.error('Player sync error:', err);
    res.status(500).json({ error: 'Failed to sync player' });
  }
});

/** GET /api/players/leaderboard — tenant scoped, optionally workshop scoped */
router.get('/leaderboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const workshopIdFromQuery =
      typeof req.query.workshopId === 'string' && req.query.workshopId.trim()
        ? req.query.workshopId.trim()
        : null;
    const workshopId =
      workshopIdFromQuery ||
      (typeof req.user?.workshopId === 'string' && req.user.workshopId.trim()
        ? req.user.workshopId.trim()
        : null) ||
      (typeof req.user?.sessionId === 'string' && req.user.sessionId.trim()
        ? req.user.sessionId.trim()
        : null);
    const filter: Record<string, unknown> = { tenantId: req.user!.tenantId };
    if (workshopId) filter.workshopId = workshopId;

    const leaders = await db
      .collection(COLLECTIONS.PLAYER_PROGRESS)
      .find(filter)
      .sort({ totalScore: -1 })
      .limit(50)
      .project({ password: 0 })
      .toArray();

    res.json(leaders.map((p, i) => ({ ...p, position: i + 1 })));
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
