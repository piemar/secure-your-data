import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const RANK_THRESHOLDS = [
  { minXP: 0, rank: 'Script Kiddie' },
  { minXP: 500, rank: 'Query Cadet' },
  { minXP: 1500, rank: 'Replica Ranger' },
  { minXP: 3500, rank: 'Shard Commander' },
  { minXP: 7000, rank: 'Atlas Overlord' },
];

function getRank(xp: number): string {
  let rank = 'Script Kiddie';
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXP) rank = t.rank;
  }
  return rank;
}

/** POST /api/missions/:missionId/complete */
router.post('/:missionId/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const { xpEarned } = req.body;
    const db = getDb();
    const workshopId = req.user?.workshopId || req.user?.sessionId;

    if (typeof workshopId === 'string' && ObjectId.isValid(workshopId)) {
      const workshop = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(
        { _id: new ObjectId(workshopId), tenantId: req.user!.tenantId, archivedAt: { $exists: false } },
        { projection: { missionIds: 1 } }
      );
      if (workshop && Array.isArray(workshop.missionIds) && !workshop.missionIds.includes(missionId)) {
        res.status(403).json({ error: 'Mission is not enabled for this workshop session' });
        return;
      }
    }

    const result = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOneAndUpdate(
      { userId: req.user!.userId, tenantId: req.user!.tenantId },
      {
        $addToSet: { completedMissions: missionId },
        $inc: { xp: xpEarned, totalScore: xpEarned },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    // Update rank and level
    const newRank = getRank(result.xp as number);
    const newLevel = Math.floor((result.xp as number) / 250) + 1;

    await db.collection(COLLECTIONS.PLAYER_PROGRESS).updateOne(
      { userId: req.user!.userId, tenantId: req.user!.tenantId },
      { $set: { rank: newRank, level: newLevel } }
    );

    // Track metric event
    await db.collection(COLLECTIONS.METRICS_EVENTS).insertOne({
      type: 'mission_complete',
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
      workshopId: req.user!.workshopId || req.user!.sessionId || null,
      missionId,
      xpEarned,
      timestamp: new Date(),
      sessionId: req.user!.sessionId || null,
    });

    res.json({ ...result, rank: newRank, level: newLevel });
  } catch (err) {
    console.error('Complete mission error:', err);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
});

/** GET /api/missions/progress — get all progress for current player */
router.get('/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const progress = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOne({
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
    });

    res.json({
      completedMissions: progress?.completedMissions || [],
      achievements: progress?.achievements || [],
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
