import { describe, it, expect } from 'vitest';
import { VERIFICATION_CHECKS } from './verification-checks.js';

function checkFor(missionId: string, objectiveId: string) {
  const check = (VERIFICATION_CHECKS[missionId] || []).find((c) => c.objectiveId === objectiveId);
  if (!check) throw new Error(`Missing check for ${missionId}/${objectiveId}`);
  return check;
}

describe('verification checks command-trace hardening', () => {
  it('mission-12 obj-12-3 requires find/findOne command trace', async () => {
    const check = checkFor('mission-12', 'obj-12-3');
    const fakeDb = {} as any;
    const failed = await check.verify(fakeDb, { commandTrace: [{ command: 'db.agents.insertOne({})', result: {} }] });
    const passed = await check.verify(fakeDb, { commandTrace: [{ command: 'db.agents.find({})', result: [] }] });
    expect(failed).toBe(false);
    expect(passed).toBe(true);
  });

  it('mission-12 obj-12-5 requires deleteOne and deletedCount evidence', async () => {
    const check = checkFor('mission-12', 'obj-12-5');
    const fakeDb = {} as any;
    const failed = await check.verify(fakeDb, {
      commandTrace: [{ command: 'db.agents.deleteOne({ name: "x" })', result: { deletedCount: 0 } }],
    });
    const passed = await check.verify(fakeDb, {
      commandTrace: [{ command: 'db.agents.deleteOne({ name: "x" })', result: { deletedCount: 1 } }],
    });
    expect(failed).toBe(false);
    expect(passed).toBe(true);
  });

  it('mission-1 obj-1-2 requires COLLSCAN evidence in trace', async () => {
    const check = checkFor('mission-1', 'obj-1-2');
    const fakeDb = {} as any;
    const failed = await check.verify(fakeDb, { commandTrace: [{ command: 'db.events.find({})', result: {} }] });
    const passed = await check.verify(fakeDb, {
      commandTrace: [{ command: 'db.events.find({}).explain("executionStats")', result: { stage: 'COLLSCAN' } }],
    });
    expect(failed).toBe(false);
    expect(passed).toBe(true);
  });

  it('mission-1 obj-1-4 requires index creation evidence and IXSCAN trace', async () => {
    const check = checkFor('mission-1', 'obj-1-4');
    const fakeDb = {
      collection: () => ({
        listIndexes: () => ({
          toArray: async () => [{ key: { _id: 1 } }, { key: { status: 1, timestamp: 1 } }],
        }),
      }),
    } as any;
    const failed = await check.verify(fakeDb, {
      commandTrace: [{ command: 'db.events.find({}).explain("executionStats")', result: { stage: 'COLLSCAN' } }],
    });
    const passed = await check.verify(fakeDb, {
      commandTrace: [{ command: 'db.events.find({}).explain("executionStats")', result: { stage: 'IXSCAN' } }],
    });
    expect(failed).toBe(false);
    expect(passed).toBe(true);
  });
});

