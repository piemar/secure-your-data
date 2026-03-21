import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission8VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-8-1',
    description: 'Verify revenue collection ready for $group',
    successMessage: 'Revenue data present — run $group with accumulators',
    failMessage: 'Use $group with accumulators on the revenue collection',
    verify: async (db) => (await db.collection('revenue').estimatedDocumentCount()) > 0,
  },
  {
    objectiveId: 'obj-8-2',
    description: 'Verify time dimensions in pipeline',
    successMessage: 'Time-based grouping ($year/$month) reflected in execution',
    failMessage: 'Add $year/$month (or $dateTrunc) for time-based grouping',
    verify: async (_db, context) =>
      traceContains(context, '$group') &&
      (traceContains(context, '$year') ||
        traceContains(context, '$month') ||
        traceContains(context, '$datetrunc')),
  },
  {
    objectiveId: 'obj-8-3',
    description: 'Verify read preference usage',
    successMessage: 'Read preference configured for workload isolation',
    failMessage: 'Set read preference (e.g. secondary) for analytics reads',
    verify: async (_db, context) =>
      traceContains(context, 'readpreference') ||
      traceContains(context, 'secondarypreferred') ||
      traceContains(context, 'secondary'),
  },
];
