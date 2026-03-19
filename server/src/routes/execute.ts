import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createSandbox,
  executeSandboxCode,
  verifySandbox,
  destroySandbox,
  getSandboxStatus,
} from '../services/sandbox.js';
import { simulateCommand, MISSION_TIERS } from '../services/simulation.js';

const router = Router();

/**
 * POST /api/execute/sandbox — Create a sandbox for a mission.
 */
router.post('/sandbox', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { missionId, sessionId } = req.body;
    const userId = (req as any).user?.id;

    if (!missionId || !userId) {
      res.status(400).json({ error: 'missionId is required' });
      return;
    }

    const tier = MISSION_TIERS[missionId] || 'pattern';
    if (tier !== 'execute') {
      res.json({ created: false, tier, message: `Mission ${missionId} uses ${tier} validation — no sandbox needed` });
      return;
    }

    const result = await createSandbox(sessionId || 'solo', userId, missionId);
    res.json({ created: true, tier: 'execute', ...result });
  } catch (err) {
    console.error('Sandbox creation error:', err);
    res.status(500).json({ error: 'Failed to create sandbox' });
  }
});

/**
 * POST /api/execute/run — Execute user code in their sandbox.
 */
router.post('/run', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, missionId, sessionId } = req.body;
    const userId = (req as any).user?.id;

    if (!code || !missionId) {
      res.status(400).json({ error: 'code and missionId are required' });
      return;
    }

    const tier = MISSION_TIERS[missionId] || 'pattern';

    // Tier 3: Simulation
    if (tier === 'simulate') {
      const simResults = simulateCommand(code);
      res.json({
        tier: 'simulate',
        success: simResults.length > 0,
        output: simResults,
        message: simResults.length > 0
          ? 'Simulated infrastructure commands executed'
          : 'No infrastructure commands detected in code',
      });
      return;
    }

    // Tier 1: Pattern only — no server execution
    if (tier === 'pattern') {
      res.json({
        tier: 'pattern',
        success: true,
        output: [],
        message: 'This mission uses pattern-only validation — no server execution needed',
      });
      return;
    }

    // Tier 2: Sandbox execution
    const result = await executeSandboxCode(sessionId || 'solo', userId, code);
    res.json({ tier: 'execute', ...result });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

/**
 * POST /api/execute/verify — Run verification checks against sandbox.
 */
router.post('/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { missionId, sessionId } = req.body;
    const userId = (req as any).user?.id;

    if (!missionId) {
      res.status(400).json({ error: 'missionId is required' });
      return;
    }

    const tier = MISSION_TIERS[missionId] || 'pattern';

    if (tier !== 'execute') {
      res.json({
        tier,
        results: [],
        message: `Mission uses ${tier} validation — no sandbox verification`,
      });
      return;
    }

    const results = await verifySandbox(sessionId || 'solo', userId, missionId);
    res.json({ tier: 'execute', results });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * DELETE /api/execute/sandbox — Destroy a user's sandbox.
 */
router.delete('/sandbox', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = (req as any).user?.id;
    await destroySandbox(sessionId || 'solo', userId);
    res.json({ destroyed: true });
  } catch (err) {
    console.error('Sandbox destroy error:', err);
    res.status(500).json({ error: 'Failed to destroy sandbox' });
  }
});

/**
 * GET /api/execute/status — Get sandbox status.
 */
router.get('/status', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const sessionId = (req.query.sessionId as string) || 'solo';
  const status = getSandboxStatus(sessionId, userId);
  res.json(status);
});

export default router;
