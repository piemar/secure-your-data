import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission3VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-3-1',
    description: 'Verify document schema was explored',
    successMessage: 'Document structure analyzed',
    failMessage: 'Explore the collection with find() or findOne()',
    verify: async (_db, context) =>
      hasTraceCommand(context, /\.find\s*\(/) ||
      hasTraceCommand(context, /\.findone\s*\(/) ||
      hasTraceCommand(context, /\.aggregate\s*\(/),
  },
  {
    objectiveId: 'obj-3-2',
    description: 'Verify $unwind and $match used',
    successMessage: '$unwind and $match stages executed',
    failMessage: 'Build pipeline with $unwind and $match',
    verify: async (_db, context) =>
      traceContains(context, '$unwind') && traceContains(context, '$match'),
  },
  {
    objectiveId: 'obj-3-3',
    description: 'Verify $lookup was used',
    successMessage: '$lookup cross-collection join executed',
    failMessage: 'Add $lookup to join with another collection',
    verify: async (_db, context) =>
      traceContains(context, '$lookup') &&
      traceContains(context, 'from') &&
      traceContains(context, 'localfield') &&
      traceContains(context, 'foreignfield'),
  },
  {
    objectiveId: 'obj-3-4',
    description: 'Verify $facet was used',
    successMessage: '$facet parallel aggregation executed',
    failMessage: 'Add $facet for parallel aggregations',
    verify: async (_db, context) => traceContains(context, '$facet'),
  },
  {
    objectiveId: 'obj-3-5',
    description: 'Verify output collection was created',
    successMessage: 'Results output with $merge/$out — collection created',
    failMessage: 'Use $merge or $out to write results to a collection',
    verify: async (db) => {
      const colls = await db.listCollections().toArray();
      const seedColls = new Set(['orders', 'products']);
      return colls.some(c => !seedColls.has(c.name) && !c.name.startsWith('system.'));
    },
  },
];
