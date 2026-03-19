import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { verify, VerificationId } from '../services/verification.js';

const router = Router();

/**
 * POST /api/verify — real MongoDB verification endpoint.
 * Phase 3: Uses VerificationService ported from Secure Your Data.
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, missionId, verificationId } = req.body;

    if (!code || !missionId) {
      res.status(400).json({ error: 'Code and missionId are required' });
      return;
    }

    if (verificationId) {
      const result = await verify(verificationId as VerificationId, {});
      res.json(result);
      return;
    }

    // No verificationId — fallback to client-side validation
    res.json({
      verified: false,
      message: 'No verificationId provided. Using client-side validation.',
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
