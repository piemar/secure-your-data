import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission1VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-1-1',
    description: 'Verify explain was run',
    successMessage: 'Query explain() output analyzed',
    failMessage: 'Run explain() on a query to see the execution plan',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.explain\s*\(/) ||
      traceContains(context, 'queryplanner') ||
      traceContains(context, 'executionstats'),
  },
  {
    objectiveId: 'obj-1-2',
    description: 'Verify COLLSCAN was identified',
    successMessage: 'Collection scan (COLLSCAN) identified correctly',
    failMessage: 'Identify the COLLSCAN in the explain output',
    verify: async (_db, context) => traceContains(context, 'collscan'),
  },
  {
    objectiveId: 'obj-1-3',
    description: 'Verify an index was created',
    successMessage: 'Compound index created successfully',
    failMessage: 'Create a compound index using createIndex()',
    verify: async (db) => {
      const indexes = await db.collection('events').listIndexes().toArray();
      return indexes.length > 1;
    },
  },
  {
    objectiveId: 'obj-1-4',
    description: 'Verify IXSCAN is used after index creation',
    successMessage: 'Query now uses index scan (IXSCAN) — performance improved!',
    failMessage: 'Run explain() again to verify the index is being used',
    verify: async (db, context) => {
      const indexes = await db.collection('events').listIndexes().toArray();
      const hasCompound = indexes.some(idx => {
        const keys = Object.keys(idx.key);
        return keys.length >= 2 && !keys.includes('_id');
      });
      return hasCompound && traceContains(context, 'ixscan');
    },
  },
];
