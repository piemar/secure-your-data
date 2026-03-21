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

function normalizeEmailDomains(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input
        .filter((d): d is string => typeof d === 'string')
        .map(d => d.trim().toLowerCase().replace(/^@+/, ''))
        .filter(Boolean)
    )
  );
}

function extractEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const idx = normalized.lastIndexOf('@');
  if (idx <= 0 || idx === normalized.length - 1) return null;
  return normalized.slice(idx + 1);
}

/** POST /api/workshops — create workshop session from template */
router.post('/', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const {
      name,
      templateId,
      missionIds,
      timeLimit,
      sandboxCollectionPrefixMode,
      cloudExecutionAllowed,
      customerName,
      technicalChampionName,
      technicalChampionEmail,
      salesforceOpportunityId,
      allowedEmailDomains,
      logoUrl,
      scheduledFor,
    } = req.body;
    const db = getDb();

    const normalizedTechnicalChampionEmail =
      typeof technicalChampionEmail === 'string' && technicalChampionEmail.trim()
        ? technicalChampionEmail.trim().toLowerCase()
        : undefined;
    const normalizedDomains = normalizeEmailDomains(allowedEmailDomains);
    const derivedChampionDomain = normalizedTechnicalChampionEmail
      ? extractEmailDomain(normalizedTechnicalChampionEmail)
      : null;
    const effectiveDomains =
      normalizedDomains.length > 0
        ? normalizedDomains
        : (derivedChampionDomain ? [derivedChampionDomain] : []);

    const session = {
      tenantId: req.user!.tenantId,
      name,
      templateId: templateId || null,
      missionIds: missionIds || [],
      pin: generatePIN(),
      status: 'active' as const,
      moderatorId: req.user!.userId,
      participants: [],
      timeLimit: timeLimit || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(typeof customerName === 'string' && customerName.trim() ? { customerName: customerName.trim() } : {}),
      ...(typeof technicalChampionName === 'string' && technicalChampionName.trim()
        ? { technicalChampionName: technicalChampionName.trim() }
        : {}),
      ...(normalizedTechnicalChampionEmail ? { technicalChampionEmail: normalizedTechnicalChampionEmail } : {}),
      ...(typeof salesforceOpportunityId === 'string' && salesforceOpportunityId.trim()
        ? { salesforceOpportunityId: salesforceOpportunityId.trim() }
        : {}),
      ...(typeof logoUrl === 'string' && logoUrl.trim() ? { logoUrl: logoUrl.trim() } : {}),
      ...(typeof scheduledFor === 'string' && scheduledFor.trim() ? { scheduledFor: scheduledFor.trim() } : {}),
      ...(effectiveDomains.length > 0 ? { allowedEmailDomains: effectiveDomains } : {}),
      ...(typeof sandboxCollectionPrefixMode === 'boolean' ? { sandboxCollectionPrefixMode } : {}),
      ...(typeof cloudExecutionAllowed === 'boolean' ? { cloudExecutionAllowed } : {}),
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
    const includeArchived =
      typeof req.query.includeArchived === 'string' && req.query.includeArchived === 'true';
    const filter: Record<string, unknown> = {
      moderatorId: req.user!.userId,
      tenantId: req.user!.tenantId,
    };
    if (!includeArchived) {
      filter.$or = [{ archivedAt: { $exists: false } }, { archivedAt: null }];
    }
    const sessions = await db
      .collection(COLLECTIONS.WORKSHOP_SESSIONS)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(sessions);
  } catch (err) {
    console.error('List workshops error:', err);
    res.status(500).json({ error: 'Failed to list workshops' });
  }
});

/** GET /api/workshops/:id — get workshop detail (tenant scoped) */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id as string;
    if (!ObjectId.isValid(workshopId)) {
      res.status(400).json({ error: 'Invalid workshop id' });
      return;
    }
    const db = getDb();
    const filter: Record<string, unknown> = {
      _id: new ObjectId(workshopId),
      tenantId: req.user!.tenantId,
    };
    if (req.user!.role === 'moderator') {
      filter.moderatorId = req.user!.userId;
    }
    const workshop = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(filter);
    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    const participants = Array.isArray((workshop as unknown as { participants?: unknown }).participants)
      ? (workshop as unknown as { participants: string[] }).participants
      : [];
    const isParticipant = participants.includes(req.user!.userId);
    if (
      req.user!.role !== 'moderator' &&
      req.user!.workshopId !== workshopId &&
      req.user!.sessionId !== workshopId &&
      !isParticipant
    ) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(workshop);
  } catch (err) {
    console.error('Get workshop detail error:', err);
    res.status(500).json({ error: 'Failed to fetch workshop' });
  }
});

/** PATCH /api/workshops/:id/status — update session status */
router.patch('/:id/status', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id as string;
    const { status } = req.body;
    if (!['active', 'paused', 'ended'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const db = getDb();
    await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(
      { _id: new ObjectId(workshopId), moderatorId: req.user!.userId, tenantId: req.user!.tenantId },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ status });
  } catch (err) {
    console.error('Update workshop status error:', err);
    res.status(500).json({ error: 'Failed to update workshop status' });
  }
});

/** PATCH /api/workshops/:id/config — update execution mode, prefix sandbox override, and cloud policy */
router.patch('/:id/config', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id as string;
    const { executionMode, sandboxCollectionPrefixMode, cloudExecutionAllowed } = req.body;

    const hasField =
      executionMode !== undefined ||
      sandboxCollectionPrefixMode !== undefined ||
      cloudExecutionAllowed !== undefined;
    if (!hasField) {
      res.status(400).json({ error: 'No config fields provided' });
      return;
    }

    if (
      executionMode !== undefined &&
      !['sandbox_only', 'atlas_connected', 'hybrid'].includes(executionMode)
    ) {
      res.status(400).json({ error: 'Invalid execution mode' });
      return;
    }

    if (
      sandboxCollectionPrefixMode !== undefined &&
      sandboxCollectionPrefixMode !== null &&
      typeof sandboxCollectionPrefixMode !== 'boolean'
    ) {
      res.status(400).json({ error: 'sandboxCollectionPrefixMode must be a boolean or null' });
      return;
    }

    if (
      cloudExecutionAllowed !== undefined &&
      cloudExecutionAllowed !== null &&
      typeof cloudExecutionAllowed !== 'boolean'
    ) {
      res.status(400).json({ error: 'cloudExecutionAllowed must be a boolean or null' });
      return;
    }

    const $set: Record<string, unknown> = { updatedAt: new Date() };
    const $unset: Record<string, ''> = {};

    if (executionMode !== undefined) {
      $set.executionMode = executionMode;
    }
    if (sandboxCollectionPrefixMode === null) {
      $unset.sandboxCollectionPrefixMode = '';
    } else if (typeof sandboxCollectionPrefixMode === 'boolean') {
      $set.sandboxCollectionPrefixMode = sandboxCollectionPrefixMode;
    }
    if (cloudExecutionAllowed === null) {
      $unset.cloudExecutionAllowed = '';
    } else if (typeof cloudExecutionAllowed === 'boolean') {
      $set.cloudExecutionAllowed = cloudExecutionAllowed;
    }

    const db = getDb();
    const updateDoc: { $set: typeof $set; $unset?: typeof $unset } = { $set };
    if (Object.keys($unset).length > 0) {
      updateDoc.$unset = $unset;
    }

    const filter = {
      _id: new ObjectId(workshopId),
      moderatorId: req.user!.userId,
      tenantId: req.user!.tenantId,
    };

    const { matchedCount } = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(filter, updateDoc);

    if (!matchedCount) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }

    const updated = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(filter, {
      projection: { executionMode: 1, sandboxCollectionPrefixMode: 1, cloudExecutionAllowed: 1 },
    });

    res.json({
      executionMode: updated?.executionMode,
      sandboxCollectionPrefixMode: updated?.sandboxCollectionPrefixMode,
      cloudExecutionAllowed: updated?.cloudExecutionAllowed,
    });
  } catch (err) {
    console.error('Update workshop config error:', err);
    res.status(500).json({ error: 'Failed to update workshop config' });
  }
});

/** PATCH /api/workshops/:id — update workshop metadata and mission assignment */
router.patch('/:id', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id as string;
    if (!ObjectId.isValid(workshopId)) {
      res.status(400).json({ error: 'Invalid workshop id' });
      return;
    }
    const {
      name,
      missionIds,
      timeLimit,
      customerName,
      technicalChampionName,
      technicalChampionEmail,
      salesforceOpportunityId,
      allowedEmailDomains,
      logoUrl,
      scheduledFor,
    } = req.body || {};

    const $set: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === 'string' && name.trim()) $set.name = name.trim();
    if (Array.isArray(missionIds) && missionIds.every((m) => typeof m === 'string')) $set.missionIds = missionIds;
    if (typeof timeLimit === 'number' || timeLimit === null) $set.timeLimit = timeLimit;
    if (typeof customerName === 'string') $set.customerName = customerName.trim();
    if (typeof technicalChampionName === 'string') $set.technicalChampionName = technicalChampionName.trim();
    if (typeof technicalChampionEmail === 'string') {
      $set.technicalChampionEmail = technicalChampionEmail.trim().toLowerCase();
    }
    if (typeof salesforceOpportunityId === 'string') {
      $set.salesforceOpportunityId = salesforceOpportunityId.trim();
    }
    if (typeof logoUrl === 'string') $set.logoUrl = logoUrl.trim();
    if (typeof scheduledFor === 'string' || scheduledFor === null) $set.scheduledFor = scheduledFor;
    if (allowedEmailDomains !== undefined) {
      $set.allowedEmailDomains = normalizeEmailDomains(allowedEmailDomains);
    }

    if (Object.keys($set).length === 1) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    const db = getDb();
    const filter = {
      _id: new ObjectId(workshopId),
      moderatorId: req.user!.userId,
      tenantId: req.user!.tenantId,
    };
    const result = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOneAndUpdate(
      filter,
      { $set },
      { returnDocument: 'after' }
    );
    if (!result) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error('Update workshop error:', err);
    res.status(500).json({ error: 'Failed to update workshop' });
  }
});

/** GET /api/workshops/:id/metrics — live session metrics */
router.get('/:id/metrics', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const sessionId = req.params.id as string;

    const [participantCount, completions, recentEvents] = await Promise.all([
      db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(
        { _id: new ObjectId(sessionId), tenantId: req.user!.tenantId },
        { projection: { participants: 1 } }
      ),
      db.collection(COLLECTIONS.METRICS_EVENTS).aggregate([
        { $match: { sessionId, type: 'mission_complete', tenantId: req.user!.tenantId } },
        { $group: { _id: '$missionId', count: { $sum: 1 } } },
      ]).toArray(),
      db.collection(COLLECTIONS.METRICS_EVENTS)
        .find({ sessionId, tenantId: req.user!.tenantId })
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

/** DELETE /api/workshops/:id — archive workshop session (soft delete) */
router.delete('/:id', authenticateToken, requireModerator, async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id as string;
    if (!ObjectId.isValid(workshopId)) {
      res.status(400).json({ error: 'Invalid workshop id' });
      return;
    }
    const archiveReason =
      typeof req.body?.archiveReason === 'string' && req.body.archiveReason.trim()
        ? req.body.archiveReason.trim()
        : null;

    const db = getDb();
    const result = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOneAndUpdate(
      {
        _id: new ObjectId(workshopId),
        moderatorId: req.user!.userId,
        tenantId: req.user!.tenantId,
      },
      {
        $set: {
          status: 'ended',
          archivedAt: new Date(),
          archivedBy: req.user!.userId,
          archiveReason,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    if (!result) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json({ archived: true, workshop: result });
  } catch (err) {
    console.error('Archive workshop error:', err);
    res.status(500).json({ error: 'Failed to archive workshop' });
  }
});

export default router;
