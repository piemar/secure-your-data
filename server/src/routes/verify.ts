import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/verify — real MongoDB verification endpoint
 * Phase 3: Will port VerificationService from Secure Your Data here.
 * For now, returns a stub that uses regex validation (same as frontend).
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, missionId, verificationId } = req.body;

    if (!code || !missionId) {
      res.status(400).json({ error: 'Code and missionId are required' });
      return;
    }

    // TODO Phase 3: Replace with real MongoDB verification
    // This will execute the user's code against a sandboxed MongoDB instance
    // and verify the results match expected outcomes.
    res.json({
      verified: false,
      message: 'Server-side verification not yet implemented. Using client-side validation.',
      verificationId: verificationId || null,
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
