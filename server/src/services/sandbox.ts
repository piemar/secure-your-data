/**
 * Sandbox Service — manages per-user ephemeral databases for Tier 2 mission execution.
 *
 * Lifecycle: create → seed → execute → verify → destroy
 *
 * Each sandbox gets a unique database: sandbox_{sessionId}_{userId}
 * Databases are dropped on completion, failure, or after persisted TTL (15 min), enforced by a
 * DB-leased coordinator sweep (multi-replica safe) rather than per-process timers.
 */

import { randomUUID } from 'crypto';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { SEED_DATA, SeedDefinition } from '../config/seed-data.js';
import {
  VERIFICATION_CHECKS,
  VerificationCheck,
  VerificationContext,
} from '../config/verification-checks.js';
import { executeCode, ExecutionResult } from './code-executor.js';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import {
  tryAcquireOrRenewSandboxExpiryLease,
  DEFAULT_SANDBOX_COORDINATOR_LEASE_MS,
} from './sandbox-coordinator.js';

const SANDBOX_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface SandboxEntry {
  db: Db;
  dbName: string;
  collectionPrefix?: string;
  sharedDbMode?: boolean;
  missionId: string;
  userId: string;
  sessionId: string;
  createdAt: number;
  lastCommandTrace?: ExecutionResult['output'];
}

interface SandboxSessionDoc {
  sessionId: string;
  userId: string;
  missionId: string;
  dbName: string;
  collectionPrefix?: string;
  sharedDbMode?: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Active sandboxes indexed by key: `${sessionId}_${userId}`
const activeSandboxes = new Map<string, SandboxEntry>();

let sandboxClient: MongoClient | null = null;
let sandboxSchedulerInstanceId: string | null = null;
let expirySweepInterval: ReturnType<typeof setInterval> | null = null;
let orphanSweepInterval: ReturnType<typeof setInterval> | null = null;

/** Snapshot at load — orphan DB sweep; per-session resolution uses readEnvCollectionPrefixMode(). */
const COLLECTION_PREFIX_MODE = process.env.SANDBOX_COLLECTION_PREFIX_MODE === 'true';
const SHARED_SANDBOX_DB_NAME = process.env.SANDBOX_SHARED_DB_NAME || process.env.MONGODB_DB_NAME || 'mongodb_mayhem';

function readEnvCollectionPrefixMode(): boolean {
  return process.env.SANDBOX_COLLECTION_PREFIX_MODE === 'true';
}

const SANDBOX_EXPIRY_TICK_MS = Math.max(5_000, parseInt(process.env.SANDBOX_EXPIRY_TICK_MS || '30000', 10));
const SANDBOX_MAINTENANCE_LEASE_MS = Math.max(DEFAULT_SANDBOX_COORDINATOR_LEASE_MS, SANDBOX_EXPIRY_TICK_MS * 2);

/**
 * Whether prefix-mode sandboxes apply for this session key.
 * Workshop `sandboxCollectionPrefixMode` overrides process env when the session id is a workshop in the same tenant.
 */
export async function resolveSandboxCollectionPrefixModeForSession(
  sessionId: string,
  tenantId?: string
): Promise<boolean> {
  if (!ObjectId.isValid(sessionId) || sessionId === 'solo') {
    return readEnvCollectionPrefixMode();
  }
  const filter: { _id: ObjectId; tenantId?: string } = { _id: new ObjectId(sessionId) };
  if (typeof tenantId === 'string' && tenantId.trim()) {
    filter.tenantId = tenantId.trim();
  }
  const doc = await getDb()
    .collection(COLLECTIONS.WORKSHOP_SESSIONS)
    .findOne(filter, { projection: { sandboxCollectionPrefixMode: 1 } });
  const override = (doc as { sandboxCollectionPrefixMode?: unknown } | null)?.sandboxCollectionPrefixMode;
  if (typeof override === 'boolean') return override;
  return readEnvCollectionPrefixMode();
}

/**
 * Initialize the sandbox MongoClient.
 * Should be called once at server startup.
 */
export async function initSandboxClient(uri?: string): Promise<void> {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI required for sandbox service');

  sandboxClient = new MongoClient(mongoUri, {
    maxPoolSize: 50,
    minPoolSize: 5,
  });
  await sandboxClient.connect();
  console.log('✅ Sandbox MongoClient connected');

  await getDb()
    .collection(COLLECTIONS.SANDBOX_SESSIONS)
    .createIndex({ sessionId: 1, userId: 1 }, { unique: true });

  sandboxSchedulerInstanceId = randomUUID();

  const runExpiryTick = () => {
    runLeaseGatedExpirySweep().catch(err => console.error('Sandbox expiry sweep error:', err));
  };
  const runOrphanTick = () => {
    runLeaseGatedOrphanSweep().catch(err => console.error('Sandbox orphan sweep error:', err));
  };

  expirySweepInterval = setInterval(runExpiryTick, SANDBOX_EXPIRY_TICK_MS);
  orphanSweepInterval = setInterval(runOrphanTick, 5 * 60 * 1000);
  expirySweepInterval.unref?.();
  orphanSweepInterval.unref?.();
}

async function runLeaseGatedExpirySweep(): Promise<void> {
  if (!sandboxSchedulerInstanceId) return;
  const got = await tryAcquireOrRenewSandboxExpiryLease(
    sandboxSchedulerInstanceId,
    SANDBOX_MAINTENANCE_LEASE_MS
  );
  if (!got) return;
  await destroyExpiredPersistedSessions();
}

async function runLeaseGatedOrphanSweep(): Promise<void> {
  if (!sandboxSchedulerInstanceId) return;
  const got = await tryAcquireOrRenewSandboxExpiryLease(
    sandboxSchedulerInstanceId,
    SANDBOX_MAINTENANCE_LEASE_MS
  );
  if (!got) return;
  await dropUntrackedSandboxDatabases();
}

/**
 * Destroy sandboxes whose persisted session has passed expiresAt (DB-driven TTL).
 * Exported for tests — production path runs this only when the coordinator lease is held.
 */
export async function destroyExpiredPersistedSessions(): Promise<number> {
  const now = new Date();
  const sessions = await getSandboxSessionsCollection()
    .find({ expiresAt: { $lte: now } })
    .toArray();
  for (const session of sessions) {
    await destroySandbox(session.sessionId, session.userId);
  }
  return sessions.length;
}

/**
 * Exported for unit tests — sequential destroys for a precomputed expired list.
 */
export async function destroySandboxSessionsList(
  expired: Array<{ sessionId: string; userId: string }>,
  destroy: (sessionId: string, userId: string) => Promise<void>
): Promise<number> {
  for (const s of expired) {
    await destroy(s.sessionId, s.userId);
  }
  return expired.length;
}

function getClient(): MongoClient {
  if (!sandboxClient) throw new Error('Sandbox client not initialized — call initSandboxClient()');
  return sandboxClient;
}

function sandboxKey(sessionId: string, userId: string): string {
  return `${sessionId}_${userId}`;
}

function slugToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function learnerSuffix(firstName?: string, lastName?: string): string {
  const parts = [firstName || '', lastName || '']
    .map(v => slugToken(v))
    .filter(Boolean);
  if (parts.length === 0) return '';
  return parts.join('_').slice(0, 18);
}

function sandboxDbName(sessionId: string, userId: string, nameSuffix?: string): string {
  // Shorten IDs to keep DB name under MongoDB's 64-char limit
  const sessShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const userShort = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const suffix = nameSuffix ? `_${nameSuffix}` : '';
  return `sandbox_${sessShort}_${userShort}${suffix}`;
}

function sandboxCollectionPrefix(sessionId: string, userId: string, nameSuffix?: string): string {
  const sessShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  const userShort = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  const suffix = nameSuffix ? `${nameSuffix}_` : '';
  return `sbx_${sessShort}_${userShort}_${suffix}`;
}

function getSandboxSessionsCollection() {
  return getDb().collection<SandboxSessionDoc>(COLLECTIONS.SANDBOX_SESSIONS);
}

async function saveSandboxSession(doc: SandboxSessionDoc): Promise<void> {
  await getSandboxSessionsCollection().updateOne(
    { sessionId: doc.sessionId, userId: doc.userId },
    {
      $set: {
        missionId: doc.missionId,
        dbName: doc.dbName,
        collectionPrefix: doc.collectionPrefix,
        sharedDbMode: doc.sharedDbMode || false,
        updatedAt: doc.updatedAt,
        expiresAt: doc.expiresAt,
      },
      $setOnInsert: {
        createdAt: doc.createdAt,
      },
    },
    { upsert: true }
  );
}

async function loadSandboxSession(sessionId: string, userId: string): Promise<SandboxSessionDoc | null> {
  return getSandboxSessionsCollection().findOne({ sessionId, userId });
}

async function deleteSandboxSession(sessionId: string, userId: string): Promise<void> {
  await getSandboxSessionsCollection().deleteOne({ sessionId, userId });
}

async function getOrHydrateSandboxEntry(sessionId: string, userId: string): Promise<SandboxEntry | null> {
  const key = sandboxKey(sessionId, userId);
  const existing = activeSandboxes.get(key);
  if (existing) return existing;

  const session = await loadSandboxSession(sessionId, userId);
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await destroySandbox(sessionId, userId);
    return null;
  }

  const entry: SandboxEntry = {
    db: getClient().db(session.dbName),
    dbName: session.dbName,
    collectionPrefix: session.collectionPrefix,
    sharedDbMode: session.sharedDbMode,
    missionId: session.missionId,
    userId,
    sessionId,
    createdAt: session.createdAt.getTime(),
  };
  activeSandboxes.set(key, entry);
  return entry;
}

/**
 * Create a sandbox database and seed it with mission-specific data.
 */
export async function createSandbox(
  sessionId: string,
  userId: string,
  missionId: string,
  options?: { tenantId?: string; firstName?: string; lastName?: string }
): Promise<{ dbName: string; seeded: boolean }> {
  const key = sandboxKey(sessionId, userId);

  // Destroy existing sandbox for this user if any
  if (activeSandboxes.has(key)) {
    await destroySandbox(sessionId, userId);
  } else {
    const persisted = await loadSandboxSession(sessionId, userId);
    if (persisted) await destroySandbox(sessionId, userId);
  }

  const usePrefixMode = await resolveSandboxCollectionPrefixModeForSession(sessionId, options?.tenantId);
  const nameSuffix = learnerSuffix(options?.firstName, options?.lastName);
  const dbName = usePrefixMode ? SHARED_SANDBOX_DB_NAME : sandboxDbName(sessionId, userId, nameSuffix);
  const collectionPrefix = usePrefixMode ? sandboxCollectionPrefix(sessionId, userId, nameSuffix) : undefined;
  const client = getClient();
  const db = client.db(dbName);
  const scopedDb = getScopedDb(db, collectionPrefix);

  // Seed data for this mission
  const seedDef = SEED_DATA[missionId];
  let seeded = false;
  if (seedDef) {
    await seedDatabase(scopedDb, seedDef);
    seeded = true;
  }

  const expiresAt = new Date(Date.now() + SANDBOX_TTL_MS);

  activeSandboxes.set(key, {
    db,
    dbName,
    collectionPrefix,
    sharedDbMode: usePrefixMode,
    missionId,
    userId,
    sessionId,
    createdAt: Date.now(),
  });

  await saveSandboxSession({
    sessionId,
    userId,
    missionId,
    dbName,
    collectionPrefix,
    sharedDbMode: usePrefixMode,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt,
  });

  if (usePrefixMode) {
    console.log(`🏗️ Sandbox created: ${dbName} (${collectionPrefix}*) for mission ${missionId}`);
  } else {
    console.log(`🏗️ Sandbox created: ${dbName} for mission ${missionId}`);
  }
  return { dbName, seeded };
}

/**
 * Execute user code in their sandbox.
 */
export async function executeSandboxCode(
  sessionId: string,
  userId: string,
  code: string
): Promise<ExecutionResult> {
  const entry = await getOrHydrateSandboxEntry(sessionId, userId);

  if (!entry) {
    return {
      success: false,
      output: [],
      error: 'No active sandbox. Start the mission first.',
      executionTimeMs: 0,
    };
  }

  const result = await executeCode(entry.db, code, { collectionPrefix: entry.collectionPrefix });
  entry.lastCommandTrace = result.output;
  activeSandboxes.set(sandboxKey(sessionId, userId), entry);
  return result;
}

/**
 * Run verification checks against a sandbox after code execution.
 */
export async function verifySandbox(
  sessionId: string,
  userId: string,
  missionId: string
): Promise<VerificationResult[]> {
  const entry = await getOrHydrateSandboxEntry(sessionId, userId);

  if (!entry) {
    return [{ objectiveId: '*', passed: false, message: 'No active sandbox' }];
  }

  const checks = VERIFICATION_CHECKS[missionId];
  if (!checks || checks.length === 0) {
    return [{ objectiveId: '*', passed: true, message: 'No server-side checks defined (pattern-only mission)' }];
  }

  const results: VerificationResult[] = [];
  const verificationContext: VerificationContext = {
    commandTrace: (entry.lastCommandTrace || []).map((row) => ({
      command: row.command,
      result: row.result,
      error: row.error,
    })),
  };

  for (const check of checks) {
    try {
      const passed = await check.verify(getScopedDb(entry.db, entry.collectionPrefix), verificationContext);
      results.push({
        objectiveId: check.objectiveId,
        passed,
        message: passed ? check.successMessage : check.failMessage,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        objectiveId: check.objectiveId,
        passed: false,
        message: `Verification error: ${msg}`,
      });
    }
  }

  return results;
}

export interface VerificationResult {
  objectiveId: string;
  passed: boolean;
  message: string;
}

/**
 * Destroy a sandbox — drop the database and clean up.
 */
export async function destroySandbox(sessionId: string, userId: string): Promise<void> {
  const key = sandboxKey(sessionId, userId);
  let entry = activeSandboxes.get(key);
  if (!entry) {
    const persisted = await loadSandboxSession(sessionId, userId);
    if (!persisted) return;
    entry = {
      db: getClient().db(persisted.dbName),
      dbName: persisted.dbName,
      collectionPrefix: persisted.collectionPrefix,
      sharedDbMode: persisted.sharedDbMode,
      missionId: persisted.missionId,
      userId,
      sessionId,
      createdAt: persisted.createdAt.getTime(),
    };
  }

  try {
    if (entry.sharedDbMode && entry.collectionPrefix) {
      await dropPrefixedCollections(entry.db, entry.collectionPrefix);
      console.log(`🗑️ Sandbox destroyed: ${entry.dbName} (${entry.collectionPrefix}*)`);
    } else {
      await entry.db.dropDatabase();
      console.log(`🗑️ Sandbox destroyed: ${entry.dbName}`);
    }
  } catch (err) {
    console.error(`Failed to drop sandbox ${entry.dbName}:`, err);
  }

  activeSandboxes.delete(key);
  await deleteSandboxSession(sessionId, userId);
}

/**
 * Get sandbox status for a user.
 */
export async function getSandboxStatus(sessionId: string, userId: string): Promise<{
  active: boolean;
  dbName?: string;
  missionId?: string;
  ageMs?: number;
}> {
  const key = sandboxKey(sessionId, userId);
  const entry = activeSandboxes.get(key);
  if (entry) {
    return {
      active: true,
      dbName: entry.dbName,
      missionId: entry.missionId,
      ageMs: Date.now() - entry.createdAt,
    };
  }

  const session = await loadSandboxSession(sessionId, userId);
  if (!session || session.expiresAt.getTime() <= Date.now()) return { active: false };
  return {
    active: true,
    dbName: session.dbName,
    missionId: session.missionId,
    ageMs: Date.now() - session.createdAt.getTime(),
  };
}

/**
 * Seed a database with collections and documents.
 */
async function seedDatabase(db: Db, seedDef: SeedDefinition): Promise<void> {
  for (const collSeed of seedDef.collections) {
    // Handle special collection types
    if (collSeed.options) {
      await db.createCollection(collSeed.name, collSeed.options);
    }

    if (collSeed.documents.length > 0) {
      const coll = db.collection(collSeed.name);
      await coll.insertMany(collSeed.documents);
    }

    // Create pre-existing indexes if defined
    if (collSeed.indexes) {
      const coll = db.collection(collSeed.name);
      for (const idx of collSeed.indexes) {
        await coll.createIndex(idx.key, idx.options || {});
      }
    }
  }

  // Run any custom setup commands
  if (seedDef.setup) {
    await seedDef.setup(db);
  }
}

async function dropPrefixedCollections(db: Db, prefix: string): Promise<void> {
  const colls = await db.listCollections({}, { nameOnly: true }).toArray();
  const toDrop = colls.filter(c => c.name.startsWith(prefix)).map(c => c.name);
  for (const name of toDrop) {
    await db.collection(name).drop().catch(() => {});
  }
}

function getScopedDb(db: Db, collectionPrefix?: string): Db {
  if (!collectionPrefix) return db;

  const prefix = collectionPrefix;
  const scoped = {
    ...db,
    collection: (name: string) => db.collection(`${prefix}${name}`),
    createCollection: (name: string, options?: any) => db.createCollection(`${prefix}${name}`, options),
    listCollections: (filter: any = {}, options?: any) => {
      const nextFilter = { ...filter };
      if (typeof nextFilter.name === 'string') {
        nextFilter.name = `${prefix}${nextFilter.name}`;
      }
      const cursor = db.listCollections(nextFilter, options);
      return {
        ...cursor,
        toArray: async () => {
          const rows = await cursor.toArray();
          return rows
            .filter(row => typeof row.name === 'string' && row.name.startsWith(prefix))
            .map(row => ({ ...row, name: row.name.slice(prefix.length) }));
        },
      };
    },
  };

  return scoped as Db;
}

/**
 * Drop per-user sandbox_* databases that are not referenced in sandbox_sessions.
 * Prefix/shared-DB mode skips this (no per-sandbox database names on disk).
 * Only the coordinator lease holder should run this in production.
 */
async function dropUntrackedSandboxDatabases(): Promise<void> {
  try {
    if (COLLECTION_PREFIX_MODE) return;

    const sessions = await getSandboxSessionsCollection().find({}).toArray();
    const client = getClient();
    const admin = client.db('admin');
    const dbs = await admin.admin().listDatabases();

    for (const dbInfo of dbs.databases) {
      if (!dbInfo.name.startsWith('sandbox_')) continue;

      const tracked = sessions.some(s => s.dbName === dbInfo.name);

      if (!tracked) {
        console.log(`🧹 Dropping orphaned sandbox: ${dbInfo.name}`);
        await client.db(dbInfo.name).dropDatabase();
      }
    }
  } catch (err) {
    console.error('Sandbox orphan DB cleanup error:', err);
  }
}

/**
 * Get count of active sandboxes (for monitoring).
 */
export function getActiveSandboxCount(): number {
  return activeSandboxes.size;
}

/**
 * Shutdown — destroy all sandboxes and close client.
 */
export async function shutdownSandboxes(): Promise<void> {
  if (expirySweepInterval) {
    clearInterval(expirySweepInterval);
    expirySweepInterval = null;
  }
  if (orphanSweepInterval) {
    clearInterval(orphanSweepInterval);
    orphanSweepInterval = null;
  }
  sandboxSchedulerInstanceId = null;

  for (const [key, entry] of activeSandboxes) {
    try {
      await entry.db.dropDatabase();
    } catch { /* ignore */ }
  }
  activeSandboxes.clear();
  await getSandboxSessionsCollection().deleteMany({});

  if (sandboxClient) {
    await sandboxClient.close();
    sandboxClient = null;
  }
}
