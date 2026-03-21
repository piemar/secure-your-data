import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createSandbox,
  executeSandboxCode,
  verifySandbox,
  destroySandbox,
  getSandboxStatus,
} from '../sandbox/runtime/sandbox.js';
import { MISSION_TIERS } from '../config/mission-tiers.js';
import { simulateCommand } from '../services/simulation.js';
import { runAtlasProxy } from '../services/atlas-proxy.js';
import { resolveSessionId } from '../workshop/session.js';
import { shouldBlockCloudExecutionForWorkshop } from '../workshop/policy.js';

const router = Router();

/**
 * Shared Tier 1 / 2 / 3 execution semantics for batch run and REPL (parser → executor, no eval).
 */
async function handleTieredExecute(req: Request, res: Response): Promise<void> {
  const { missionId, sessionId } = req.body;
  const userId = req.user?.userId;
  const raw = req.body.code ?? req.body.command;
  const code = typeof raw === 'string' ? raw.trim() : '';

  if (!code || !missionId || !userId) {
    res.status(400).json({ error: 'code (or command), missionId, and authenticated user are required' });
    return;
  }

  const sessionKey = resolveSessionId(req, sessionId);
  const tier = MISSION_TIERS[missionId] || 'pattern';

  if (tier === 'hold') {
    res.status(409).json({
      tier: 'hold',
      success: false,
      output: [],
      error: 'This mission is temporarily on hold while Tier 3 cloud/simulation validations are being rebuilt.',
      code: 'MISSION_ON_HOLD',
      message: 'Choose a Tier 1 or Tier 2 mission for full run + validate support.',
    });
    return;
  }

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

  const result = await executeSandboxCode(sessionKey, userId, code);
  res.json({
    tier,
    ...result,
    message: result.success
      ? 'Code executed against your sandbox database.'
      : `Execution failed: ${result.error || 'unknown error'}`,
  });
}

/**
 * POST /api/execute/sandbox — Create a sandbox for a mission.
 */
router.post('/sandbox', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { missionId, sessionId } = req.body;
    const userId = req.user?.userId;

    if (!missionId || !userId) {
      res.status(400).json({ error: 'missionId is required' });
      return;
    }

    const tier = MISSION_TIERS[missionId] || 'pattern';
    if (tier === 'hold') {
      res.status(409).json({
        created: false,
        tier,
        error: 'This mission is currently on hold and sandbox creation is disabled.',
        code: 'MISSION_ON_HOLD',
      });
      return;
    }

    if (tier === 'simulate') {
      res.json({ created: false, tier, message: `Mission ${missionId} uses ${tier} validation — no sandbox needed` });
      return;
    }

    const result = await createSandbox(resolveSessionId(req, sessionId), userId, missionId, {
      tenantId: req.user?.tenantId,
      firstName: req.user?.firstName,
      lastName: req.user?.lastName,
    });
    res.json({
      created: true,
      tier,
      ...result,
      message: result.seeded
        ? 'Sandbox created and mission dataset loaded.'
        : 'Sandbox created; this mission currently has no predefined dataset seed.',
    });
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
    await handleTieredExecute(req, res);
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

/**
 * POST /api/execute/repl — Same contract as /run; body may use `command` (REPL) or `code` (batch).
 */
router.post('/repl', authenticateToken, async (req: Request, res: Response) => {
  try {
    await handleTieredExecute(req, res);
  } catch (err) {
    console.error('REPL execution error:', err);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

/**
 * POST /api/execute/cloud — Atlas proxy execution (with simulation fallback).
 * Intended for cloud-only/Tier-3 workshop objectives.
 */
router.post('/cloud', authenticateToken, async (req: Request, res: Response) => {
  try {
    const code = typeof req.body?.code === 'string' ? req.body.code : '';
    const dbName = typeof req.body?.dbName === 'string' ? req.body.dbName : undefined;
    const allowWrites = req.user?.role === 'moderator' && req.body?.allowWrites === true;

    if (!code.trim()) {
      res.status(400).json({ error: 'code is required' });
      return;
    }

    if (await shouldBlockCloudExecutionForWorkshop(req)) {
      res.status(403).json({
        error: 'Cloud execution is not allowed for this workshop (sandbox-only mode)',
        code: 'WORKSHOP_EXECUTION_MODE',
      });
      return;
    }

    const result = await runAtlasProxy(code, { dbName, allowWrites });
    res.json(result);
  } catch (err) {
    console.error('Cloud execution error:', err);
    res.status(500).json({ error: 'Cloud execution failed' });
  }
});

/**
 * POST /api/execute/verify — Run verification checks against sandbox.
 */
router.post('/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { missionId, sessionId } = req.body;
    const userId = req.user?.userId;

    if (!missionId || !userId) {
      res.status(400).json({ error: 'missionId and authenticated user are required' });
      return;
    }

    const tier = MISSION_TIERS[missionId] || 'pattern';

    if (tier === 'hold') {
      res.status(409).json({
        tier,
        results: [],
        error: 'This mission is temporarily on hold and cannot be verified right now.',
        code: 'MISSION_ON_HOLD',
      });
      return;
    }

    if (tier === 'simulate') {
      res.json({
        tier,
        results: [],
        message: `Mission uses ${tier} validation — no sandbox verification`,
      });
      return;
    }

    const results = await verifySandbox(resolveSessionId(req, sessionId), userId, missionId);
    const passed = results.filter(r => r.passed).length;
    res.json({
      tier,
      results,
      message: `Verification completed: ${passed}/${results.length} objective checks passed.`,
    });
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
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ error: 'Authenticated user is required' });
      return;
    }
    await destroySandbox(resolveSessionId(req, sessionId), userId);
    res.json({ destroyed: true });
  } catch (err) {
    console.error('Sandbox destroy error:', err);
    res.status(500).json({ error: 'Failed to destroy sandbox' });
  }
});

/**
 * GET /api/execute/status — Get sandbox status.
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(400).json({ error: 'Authenticated user is required' });
    return;
  }
  const sessionKey = resolveSessionId(req, req.query.sessionId);
  const status = await getSandboxStatus(sessionKey, userId);
  res.json(status);
});

export default router;
