import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ensureTerminalSession } from '../services/container-manager.js';
import {
  terminalWebsocketShellEnabled,
  terminalWsExecutorKind,
} from '../services/terminal-shell-session.js';

const router = Router();

router.post('/session', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId || !req.user?.tenantId) {
      res.status(400).json({ error: 'Authenticated user is required' });
      return;
    }

    const result = await ensureTerminalSession({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      workshopId: req.user.workshopId || req.user.sessionId,
    });
    const withStream =
      result.enabled && terminalWebsocketShellEnabled()
        ? {
            ...result,
            shellStream: {
              namespace: '/terminal',
              socketPath: '/socket.io',
              sessionId: result.sessionId,
              executor: terminalWsExecutorKind(),
            },
          }
        : result;
    res.json(withStream);
  } catch (err) {
    console.error('Terminal session error:', err);
    res.status(500).json({ error: 'Failed to prepare terminal session' });
  }
});

export default router;
