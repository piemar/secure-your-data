import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';

const CLOUD_ALLOWED_WORKSHOP_MODES = new Set(['atlas_connected', 'hybrid']);

/**
 * Enforce workshop cloud policy on Tier-3 proxy execution.
 */
export async function shouldBlockCloudExecutionForWorkshop(req: Request): Promise<boolean> {
  const raw = [req.user?.sessionId, req.user?.workshopId]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean);
  if (!raw) return false;
  if (!ObjectId.isValid(raw)) return false;

  const tenantId = req.user?.tenantId;
  const filter: { _id: ObjectId; tenantId?: string } = { _id: new ObjectId(raw) };
  if (typeof tenantId === 'string' && tenantId.trim()) {
    filter.tenantId = tenantId.trim();
  }

  const doc = await getDb().collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne(filter, {
    projection: { executionMode: 1, cloudExecutionAllowed: 1 },
  });
  if (!doc) return false;
  if (doc.cloudExecutionAllowed === false) return true;
  if (doc.cloudExecutionAllowed === true) return false;

  const mode = doc.executionMode as string | undefined;
  if (mode === 'sandbox_only') return true;
  if (mode === undefined || mode === null) return false;
  return !CLOUD_ALLOWED_WORKSHOP_MODES.has(mode);
}
