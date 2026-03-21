import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission18VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-18-1',
    description: 'Verify time series collection created',
    successMessage: 'Time series collection created with timeField and metaField',
    failMessage: 'Create a time series collection using db.createCollection()',
    verify: async (db) => {
      const colls = await db.listCollections().toArray();
      return colls.some(c =>
        c.type === 'timeseries' ||
        ((c as any).options && (c as any).options.timeseries)
      );
    },
  },
  {
    objectiveId: 'obj-18-2',
    description: 'Verify sensor readings inserted',
    successMessage: 'Timestamped sensor readings inserted',
    failMessage: 'Insert sensor readings with timestamps',
    verify: async (_db, context) =>
      (hasTraceCommand(context, /\.insertone\s*\(/) || hasTraceCommand(context, /\.insertmany\s*\(/)) &&
      (traceContains(context, 'timestamp') || traceContains(context, 'date(')),
  },
  {
    objectiveId: 'obj-18-3',
    description: 'Verify windowed aggregation executed',
    successMessage: 'Windowed aggregation with $dateTrunc completed',
    failMessage: 'Use $dateTrunc with $group for windowed aggregation',
    verify: async (_db, context) =>
      traceContains(context, '$group') && traceContains(context, '$datetrunc'),
  },
  {
    objectiveId: 'obj-18-4',
    description: 'Verify anomaly detection query',
    successMessage: 'Anomaly detection query executed',
    failMessage: 'Use $match with threshold comparison to find anomalies',
    verify: async (_db, context) =>
      traceContains(context, '$match') &&
      (traceContains(context, '$gt') ||
        traceContains(context, '$gte') ||
        traceContains(context, '$lt') ||
        traceContains(context, '$lte')),
  },
];
