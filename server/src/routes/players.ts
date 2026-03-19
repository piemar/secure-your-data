import { Router, Request, Response } from 'express';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/** GET /api/players/me — current player profile */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const progress = await db.collection(COLLECTIONS.PLAYER_PROGRESS).findOne({
      userId: req.user!.userId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    res.json(progress);
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
      { userId: req.user!.userId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (err) {
    console.error('Update player error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

/** GET /api/players/leaderboard */
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const leaders = await db
      .collection(COLLECTIONS.PLAYER_PROGRESS)
      .find({})
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
