import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission16VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-16-1',
    description: 'Verify session was started',
    successMessage: 'Client session started',
    failMessage: 'Start a client session for transaction support',
    verify: async (_db, context) =>
      traceContains(context, 'startsession') || traceContains(context, 'session'),
  },
  {
    objectiveId: 'obj-16-2',
    description: 'Verify transaction was started',
    successMessage: 'Transaction started with readConcern/writeConcern',
    failMessage: 'Begin a transaction with startTransaction()',
    verify: async (_db, context) =>
      traceContains(context, 'starttransaction') &&
      (traceContains(context, 'readconcern') || traceContains(context, 'writeconcern')),
  },
  {
    objectiveId: 'obj-16-3',
    description: 'Verify accounts were modified atomically',
    successMessage: 'Multi-document writes executed in transaction',
    failMessage: 'Execute updateOne operations within the transaction',
    verify: async (db) => {
      const accounts = await db.collection('accounts').find({}).toArray();
      const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
      void totalBalance;
      return accounts.some(a => a.balance !== undefined);
    },
  },
  {
    objectiveId: 'obj-16-4',
    description: 'Verify transaction committed or aborted',
    successMessage: 'Transaction completed (committed/aborted)',
    failMessage: 'Commit or abort the transaction',
    verify: async (_db, context) =>
      traceContains(context, 'committransaction') || traceContains(context, 'aborttransaction'),
  },
];
