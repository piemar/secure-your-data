import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission13VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-13-1',
    description: 'Verify 2dsphere index created',
    successMessage: '2dsphere index created on location field',
    failMessage: 'Create a 2dsphere index on the location field',
    verify: async (db) => {
      const indexes = await db.collection('locations').listIndexes().toArray();
      return indexes.some(idx =>
        Object.values(idx.key).includes('2dsphere')
      );
    },
  },
  {
    objectiveId: 'obj-13-2',
    description: 'Verify $geoNear executed',
    successMessage: '$geoNear query returned nearby locations',
    failMessage: 'Use $geoNear aggregation to find locations within a radius',
    verify: async (_db, context) => traceContains(context, '$geonear'),
  },
  {
    objectiveId: 'obj-13-3',
    description: 'Verify $geoWithin with polygon',
    successMessage: '$geoWithin polygon query executed',
    failMessage: 'Use $geoWithin with $geometry Polygon',
    verify: async (_db, context) =>
      traceContains(context, '$geowithin') &&
      (traceContains(context, 'polygon') || traceContains(context, '$geometry')),
  },
  {
    objectiveId: 'obj-13-4',
    description: 'Verify combined geo + filter query',
    successMessage: 'Geo query combined with additional filters',
    failMessage: 'Combine geo query with a non-geo filter (status, type, etc.)',
    verify: async (_db, context) =>
      (traceContains(context, '$geowithin') || traceContains(context, '$geonear')) &&
      (traceContains(context, 'status') ||
        traceContains(context, 'type') ||
        traceContains(context, 'category') ||
        traceContains(context, 'active')),
  },
];
