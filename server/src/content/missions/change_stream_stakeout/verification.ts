import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission15VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-15-1',
    description: 'Verify surveillance collection exists',
    successMessage: 'Target collection ready for change streams',
    failMessage: 'Open a change stream with collection.watch()',
    verify: async (db) =>
      (await db.collection('surveillance_transactions').estimatedDocumentCount()) > 0,
  },
  {
    objectiveId: 'obj-15-2',
    description: 'Verify $match in change stream pipeline',
    successMessage: 'Change stream filtered with pipeline / $match',
    failMessage: 'Filter the change stream with a $match stage',
    verify: async (_db, context) =>
      traceContains(context, '$match') && traceContains(context, 'operationtype'),
  },
  {
    objectiveId: 'obj-15-3',
    description: 'Verify resume token strategy',
    successMessage: 'Resume token handling present',
    failMessage: 'Use resumeAfter with a stored resume token',
    verify: async (_db, context) =>
      traceContains(context, 'resumeafter') || traceContains(context, 'resumetoken'),
  },
  {
    objectiveId: 'obj-15-4',
    description: 'Verify operationType handling',
    successMessage: 'Change events handled by operationType',
    failMessage: 'Branch on operationType (insert, update, delete, etc.)',
    verify: async (_db, context) =>
      traceContains(context, 'operationtype') && traceContains(context, 'fulldocument'),
  },
];
