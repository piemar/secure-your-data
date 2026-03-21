import { Router, Request, Response } from 'express';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/** POST /api/metrics/event — track a metric event */
router.post('/event', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type, missionId, data } = req.body;
    const db = getDb();

    await db.collection(COLLECTIONS.METRICS_EVENTS).insertOne({
      type,
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
      workshopId: req.user!.workshopId || req.user!.sessionId || null,
      missionId: missionId || null,
      sessionId: req.user!.sessionId || null,
      data: data || {},
      timestamp: new Date(),
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Track event error:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;
