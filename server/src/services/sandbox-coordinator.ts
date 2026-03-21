/**
 * DB-backed lease for sandbox expiry / orphan maintenance.
 * Only the current lease holder should run periodic cleanup (multi-replica safe).
 */

import type { Db } from 'mongodb';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';

export const SANDBOX_EXPIRY_LOCK_ID = 'sandbox_expiry_scheduler' as const;

export interface SandboxCoordinatorLockDoc {
  _id: typeof SANDBOX_EXPIRY_LOCK_ID;
  holderId: string;
  leaseUntil: Date;
  updatedAt: Date;
}

export const DEFAULT_SANDBOX_COORDINATOR_LEASE_MS = 45_000;

/**
 * Try to become or stay the maintenance lease holder using a single coordinator document.
 * Safe under concurrency: at most one non-expired holder at a time.
 */
export async function tryAcquireOrRenewSandboxExpiryLeaseForDb(
  db: Db,
  instanceId: string,
  leaseMs: number = DEFAULT_SANDBOX_COORDINATOR_LEASE_MS
): Promise<boolean> {
  const coll = db.collection<SandboxCoordinatorLockDoc>(COLLECTIONS.SANDBOX_COORDINATOR_LOCK);
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + leaseMs);
  const filter = {
    _id: SANDBOX_EXPIRY_LOCK_ID,
    $or: [
      { leaseUntil: { $lte: now } },
      { leaseUntil: { $exists: false } },
      { holderId: instanceId },
    ],
  };
  const update = { $set: { holderId: instanceId, leaseUntil, updatedAt: now } };

  try {
    const doc = await coll.findOneAndUpdate(filter, update, { upsert: true, returnDocument: 'after' });
    return doc?.holderId === instanceId;
  } catch (e: unknown) {
    const code = (e as { code?: number }).code;
    if (code === 11000) {
      const doc = await coll.findOneAndUpdate(filter, update, { returnDocument: 'after' });
      return doc?.holderId === instanceId;
    }
    throw e;
  }
}

export async function tryAcquireOrRenewSandboxExpiryLease(
  instanceId: string,
  leaseMs?: number
): Promise<boolean> {
  return tryAcquireOrRenewSandboxExpiryLeaseForDb(getDb(), instanceId, leaseMs);
}
