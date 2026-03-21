import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission12VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-12-1',
    description: 'Check that a document was inserted with insertOne',
    successMessage: 'Document successfully inserted with insertOne()',
    failMessage: 'No new document found — use insertOne() to insert a document',
    verify: async (db) => {
      const count = await db.collection('agents').countDocuments();
      return count > 10;
    },
  },
  {
    objectiveId: 'obj-12-2',
    description: 'Check that multiple documents were bulk inserted',
    successMessage: 'Multiple documents inserted with insertMany()',
    failMessage: 'Expected multiple new documents — use insertMany()',
    verify: async (db) => {
      const count = await db.collection('agents').countDocuments();
      return count > 12;
    },
  },
  {
    objectiveId: 'obj-12-3',
    description: 'Verify find/findOne was actually executed',
    successMessage: 'Query operations executed successfully',
    failMessage: 'Execute find() or findOne() in the sandbox runner',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.find\s*\(/) || hasTraceCommand(context, /\.findone\s*\(/),
  },
  {
    objectiveId: 'obj-12-4',
    description: 'Check that a document was updated',
    successMessage: 'Document updated with $set operator',
    failMessage: 'No document modifications detected — use updateOne() with $set',
    verify: async (db) => {
      const agents = await db.collection('agents').find({}).toArray();
      const seedFields = new Set(['name', 'level', 'specialization', 'status', 'joinedAt', '_id']);
      return agents.some(a =>
        Object.keys(a).some(k => !seedFields.has(k)) ||
        agents.some(a2 => typeof a2.level === 'number' && a2.level > 10)
      );
    },
  },
  {
    objectiveId: 'obj-12-5',
    description: 'Check that a document was deleted',
    successMessage: 'Document deleted with deleteOne()',
    failMessage: 'No deletions detected — use deleteOne() to remove a document',
    verify: async (_db, context) => {
      if (!hasTraceCommand(context, /\.deleteone\s*\(/)) return false;
      return traceContains(context, '"deletedcount":1') || traceContains(context, '"deletedcount": 1');
    },
  },
];
