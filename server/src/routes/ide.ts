import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ensureIdeSession } from '../services/container-manager.js';

const router = Router();

router.post('/session', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId || !req.user?.tenantId) {
      res.status(400).json({ error: 'Authenticated user is required' });
      return;
    }

    const result = await ensureIdeSession({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      workshopId: req.user.workshopId || req.user.sessionId,
    });
    res.json(result);
  } catch (err) {
    console.error('IDE session error:', err);
    res.status(500).json({ error: 'Failed to prepare IDE session' });
  }
});

export default router;
