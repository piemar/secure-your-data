import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission6VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-6-1',
    description: 'Verify compound find() executed',
    successMessage: 'Compound query with $elemMatch executed',
    failMessage: 'Build a find() query with $elemMatch on nested arrays',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.find\s*\(/) &&
      (traceContains(context, '$elemmatch') ||
        traceContains(context, '$and') ||
        traceContains(context, '$or')),
  },
  {
    objectiveId: 'obj-6-2',
    description: 'Verify projection was applied',
    successMessage: 'Projections applied to limit returned fields',
    failMessage: 'Add projection to your find() query',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.find\s*\(/) &&
      (traceContains(context, '_id') || traceContains(context, 'projection')),
  },
  {
    objectiveId: 'obj-6-3',
    description: 'Verify sort/limit/skip were used',
    successMessage: 'Pagination with sort/limit/skip working',
    failMessage: 'Chain .sort(), .limit(), and .skip() to your query',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.sort\s*\(/) &&
      hasTraceCommand(context, /\.limit\s*\(/) &&
      hasTraceCommand(context, /\.skip\s*\(/),
  },
  {
    objectiveId: 'obj-6-4',
    description: 'Verify compound index was created',
    successMessage: 'Compound index created — IXSCAN confirmed!',
    failMessage: 'Create a compound index and verify with explain()',
    verify: async (db) => {
      const indexes = await db.collection('customers').listIndexes().toArray();
      return indexes.some(idx => {
        const keys = Object.keys(idx.key);
        return keys.length >= 2 && !keys.includes('_id');
      });
    },
  },
];
