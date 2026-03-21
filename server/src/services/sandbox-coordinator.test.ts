import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { COLLECTIONS } from '../config/collections.js';
import {
  tryAcquireOrRenewSandboxExpiryLeaseForDb,
  SANDBOX_EXPIRY_LOCK_ID,
} from './sandbox-coordinator.js';

describe('tryAcquireOrRenewSandboxExpiryLeaseForDb', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: ReturnType<MongoClient['db']>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    client = new MongoClient(mongod.getUri());
    await client.connect();
    db = client.db('test_sandbox_coordinator');
  }, 120_000);

  afterAll(async () => {
    await client?.close();
    await mongod?.stop();
  });

  beforeEach(async () => {
    await db.collection(COLLECTIONS.SANDBOX_COORDINATOR_LOCK).deleteMany({});
  });

  it('grants lease when coordinator doc is missing', async () => {
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-a', 60_000)).toBe(true);
    const doc = await db
      .collection(COLLECTIONS.SANDBOX_COORDINATOR_LOCK)
      .findOne({ _id: SANDBOX_EXPIRY_LOCK_ID } as unknown as import('mongodb').Filter<import('mongodb').Document>);
    expect(doc?.holderId).toBe('replica-a');
  });

  it('denies a different instance while lease is valid', async () => {
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-a', 60_000)).toBe(true);
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-b', 60_000)).toBe(false);
  });

  it('allows takeover after leaseUntil is in the past', async () => {
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-a', 2)).toBe(true);
    await new Promise(r => setTimeout(r, 25));
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-b', 60_000)).toBe(true);
    const doc = await db
      .collection(COLLECTIONS.SANDBOX_COORDINATOR_LOCK)
      .findOne({ _id: SANDBOX_EXPIRY_LOCK_ID } as unknown as import('mongodb').Filter<import('mongodb').Document>);
    expect(doc?.holderId).toBe('replica-b');
  });

  it('lets the current holder renew before expiry', async () => {
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-a', 60_000)).toBe(true);
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-a', 60_000)).toBe(true);
    expect(await tryAcquireOrRenewSandboxExpiryLeaseForDb(db, 'replica-b', 60_000)).toBe(false);
  });
});
