import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireModerator } from '../middleware/role.js';

const router = Router();

function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** POST /api/workshops — create workshop session from template */
router.post('/', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const { name, templateId, missionIds, timeLimit } = req.body;
    const db = getDb();

    const session = {
      name,
      templateId: templateId || null,
      missionIds: missionIds || [],
      pin: generatePIN(),
      status: 'active' as const,
      moderatorId: req.user!.userId,
      participants: [],
      timeLimit: timeLimit || null,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).insertOne(session);

    res.status(201).json({
      ...session,
      _id: result.insertedId,
    });
  } catch (err) {
    console.error('Create workshop error:', err);
    res.status(500).json({ error: 'Failed to create workshop' });
  }
});

/** GET /api/workshops — list moderator's sessions */
router.get('/', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const sessions = await db
      .collection(COLLECTIONS.WORKSHOP_SESSIONS)
      .find({ moderatorId: req.user!.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(sessions);
  } catch (err) {
    console.error('List workshops error:', err);
    res.status(500).json({ error: 'Failed to list workshops' });
  }
});

/** PATCH /api/workshops/:id/status — update session status */
router.patch('/:id/status', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'ended'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const db = getDb();
    await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(
      { _id: new ObjectId(req.params.id), moderatorId: req.user!.userId },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ status });
  } catch (err) {
    console.error('Update workshop status error:', err);
    res.status(500).json({ error: 'Failed to update workshop status' });
  }
});

/** PATCH /api/workshops/:id/config — update workshop execution config */
router.patch('/:id/config', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const { executionMode } = req.body;
    if (!['sandbox_only', 'atlas_connected', 'hybrid'].includes(executionMode)) {
      res.status(400).json({ error: 'Invalid execution mode' });
      return;
    }

    const db = getDb();
    await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(
      { _id: new ObjectId(req.params.id), moderatorId: req.user!.userId },
      { $set: { executionMode, updatedAt: new Date() } }
    );

    res.json({ executionMode });
  } catch (err) {
    console.error('Update workshop config error:', err);
    res.status(500).json({ error: 'Failed to update workshop config' });
  }
});

/** GET /api/workshops/:id/metrics — live session metrics */
router.get('/:id/metrics', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const sessionId = req.params.id;

    const [participantCount, completions, recentEvents] = await Promise.all([
      db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(
        { _id: new ObjectId(sessionId) },
        { projection: { participants: 1 } }
      ),
      db.collection(COLLECTIONS.METRICS_EVENTS).aggregate([
        { $match: { sessionId, type: 'mission_complete' } },
        { $group: { _id: '$missionId', count: { $sum: 1 } } },
      ]).toArray(),
      db.collection(COLLECTIONS.METRICS_EVENTS)
        .find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray(),
    ]);

    res.json({
      participantCount: participantCount?.participants?.length || 0,
      completionsByMission: completions,
      recentEvents,
    });
  } catch (err) {
    console.error('Get metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
