import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission20VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-20-1',
    description: 'Verify fields were renamed',
    successMessage: 'Fields renamed with $rename',
    failMessage: 'Use $rename with updateMany() to rename fields',
    verify: async (db) => {
      const docs = await db.collection('legacy_docs').find({ name: { $exists: true } }).toArray();
      const legacyDocs = await db.collection('legacy_docs').find({ old_name: { $exists: true } }).toArray();
      return docs.length > legacyDocs.length;
    },
  },
  {
    objectiveId: 'obj-20-2',
    description: 'Verify deprecated fields removed',
    successMessage: 'Deprecated fields removed with $unset',
    failMessage: 'Use $unset to remove deprecated_field',
    verify: async (db) => {
      const withDeprecated = await db.collection('legacy_docs')
        .countDocuments({ deprecated_field: { $exists: true } });
      return withDeprecated < 30;
    },
  },
  {
    objectiveId: 'obj-20-3',
    description: 'Verify defaults were added',
    successMessage: 'Default values added with $set',
    failMessage: 'Use $set with $exists condition to add defaults',
    verify: async (db) => {
      const withStatus = await db.collection('legacy_docs')
        .countDocuments({ status: { $exists: true } });
      return withStatus > 10;
    },
  },
  {
    objectiveId: 'obj-20-4',
    description: 'Verify polymorphic query',
    successMessage: 'Polymorphic documents queried with $exists and $type',
    failMessage: 'Use $exists and $type to query different document shapes',
    verify: async (_db, context) =>
      traceContains(context, '$exists') && traceContains(context, '$type'),
  },
];
