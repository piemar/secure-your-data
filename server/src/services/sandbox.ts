/**
 * Sandbox Service — manages per-user ephemeral databases for Tier 2 mission execution.
 *
 * Lifecycle: create → seed → execute → verify → destroy
 *
 * Each sandbox gets a unique database: sandbox_{sessionId}_{userId}
 * Databases are dropped on completion, failure, or timeout (15 min).
 */

import { MongoClient, Db } from 'mongodb';
import { SEED_DATA, SeedDefinition } from '../config/seed-data.js';
import { VERIFICATION_CHECKS, VerificationCheck } from '../config/verification-checks.js';
import { executeCode, ExecutionResult } from './code-executor.js';

const SANDBOX_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface SandboxEntry {
  db: Db;
  dbName: string;
  missionId: string;
  userId: string;
  sessionId: string;
  createdAt: number;
  timer: ReturnType<typeof setTimeout>;
}

// Active sandboxes indexed by key: `${sessionId}_${userId}`
const activeSandboxes = new Map<string, SandboxEntry>();

let sandboxClient: MongoClient | null = null;

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

  // Periodic cleanup of orphaned sandbox databases
  setInterval(cleanupOrphans, 60 * 60 * 1000); // Every hour
}

function getClient(): MongoClient {
  if (!sandboxClient) throw new Error('Sandbox client not initialized — call initSandboxClient()');
  return sandboxClient;
}

function sandboxKey(sessionId: string, userId: string): string {
  return `${sessionId}_${userId}`;
}

function sandboxDbName(sessionId: string, userId: string): string {
  // Shorten IDs to keep DB name under MongoDB's 64-char limit
  const sessShort = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const userShort = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return `sandbox_${sessShort}_${userShort}`;
}

/**
 * Create a sandbox database and seed it with mission-specific data.
 */
export async function createSandbox(
  sessionId: string,
  userId: string,
  missionId: string
): Promise<{ dbName: string; seeded: boolean }> {
  const key = sandboxKey(sessionId, userId);

  // Destroy existing sandbox for this user if any
  if (activeSandboxes.has(key)) {
    await destroySandbox(sessionId, userId);
  }

  const dbName = sandboxDbName(sessionId, userId);
  const client = getClient();
  const db = client.db(dbName);

  // Seed data for this mission
  const seedDef = SEED_DATA[missionId];
  let seeded = false;
  if (seedDef) {
    await seedDatabase(db, seedDef);
    seeded = true;
  }

  // Set up auto-cleanup timer
  const timer = setTimeout(async () => {
    console.log(`⏰ Sandbox TTL expired: ${dbName}`);
    await destroySandbox(sessionId, userId);
  }, SANDBOX_TTL_MS);

  activeSandboxes.set(key, {
    db,
    dbName,
    missionId,
    userId,
    sessionId,
    createdAt: Date.now(),
    timer,
  });

  console.log(`🏗️ Sandbox created: ${dbName} for mission ${missionId}`);
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
  const key = sandboxKey(sessionId, userId);
  const entry = activeSandboxes.get(key);

  if (!entry) {
    return {
      success: false,
      output: [],
      error: 'No active sandbox. Start the mission first.',
      executionTimeMs: 0,
    };
  }

  return executeCode(entry.db, code);
}

/**
 * Run verification checks against a sandbox after code execution.
 */
export async function verifySandbox(
  sessionId: string,
  userId: string,
  missionId: string
): Promise<VerificationResult[]> {
  const key = sandboxKey(sessionId, userId);
  const entry = activeSandboxes.get(key);

  if (!entry) {
    return [{ objectiveId: '*', passed: false, message: 'No active sandbox' }];
  }

  const checks = VERIFICATION_CHECKS[missionId];
  if (!checks || checks.length === 0) {
    return [{ objectiveId: '*', passed: true, message: 'No server-side checks defined (pattern-only mission)' }];
  }

  const results: VerificationResult[] = [];

  for (const check of checks) {
    try {
      const passed = await check.verify(entry.db);
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
  const entry = activeSandboxes.get(key);

  if (!entry) return;

  clearTimeout(entry.timer);
  try {
    await entry.db.dropDatabase();
    console.log(`🗑️ Sandbox destroyed: ${entry.dbName}`);
  } catch (err) {
    console.error(`Failed to drop sandbox ${entry.dbName}:`, err);
  }

  activeSandboxes.delete(key);
}

/**
 * Get sandbox status for a user.
 */
export function getSandboxStatus(sessionId: string, userId: string): {
  active: boolean;
  dbName?: string;
  missionId?: string;
  ageMs?: number;
} {
  const key = sandboxKey(sessionId, userId);
  const entry = activeSandboxes.get(key);
  if (!entry) return { active: false };

  return {
    active: true,
    dbName: entry.dbName,
    missionId: entry.missionId,
    ageMs: Date.now() - entry.createdAt,
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

/**
 * Clean up orphaned sandbox databases (hourly sweep).
 */
async function cleanupOrphans(): Promise<void> {
  try {
    const client = getClient();
    const admin = client.db('admin');
    const dbs = await admin.admin().listDatabases();
    const now = Date.now();

    for (const dbInfo of dbs.databases) {
      if (!dbInfo.name.startsWith('sandbox_')) continue;

      // Check if this sandbox is tracked
      let tracked = false;
      for (const entry of activeSandboxes.values()) {
        if (entry.dbName === dbInfo.name) {
          tracked = true;
          break;
        }
      }

      // If not tracked, it's orphaned — drop it
      if (!tracked) {
        console.log(`🧹 Dropping orphaned sandbox: ${dbInfo.name}`);
        await client.db(dbInfo.name).dropDatabase();
      }
    }
  } catch (err) {
    console.error('Sandbox cleanup error:', err);
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
  for (const [key, entry] of activeSandboxes) {
    clearTimeout(entry.timer);
    try {
      await entry.db.dropDatabase();
    } catch { /* ignore */ }
  }
  activeSandboxes.clear();

  if (sandboxClient) {
    await sandboxClient.close();
    sandboxClient = null;
  }
}
