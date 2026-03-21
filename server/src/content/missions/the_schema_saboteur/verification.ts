import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { hasTraceCommand, traceContains } from '../../../sandbox/verification/helpers.js';

export const mission5VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-5-1',
    description: 'Audit validators via command trace',
    successMessage: 'Collection validators audited',
    failMessage: 'List collection validators with listCollections or collMod',
    verify: async (_db, context) =>
      hasTraceCommand(context, /getcollectioninfos\s*\(/) ||
      hasTraceCommand(context, /listcollections\s*\(/) ||
      hasTraceCommand(context, /collmod\s*\(/),
  },
  {
    objectiveId: 'obj-5-2',
    description: 'Identify sabotaged validators in submitted commands',
    successMessage: 'Tampered validation rules identified',
    failMessage: 'Identify the incorrect validation rules',
    verify: async (_db, context) =>
      traceContains(context, 'validator') || traceContains(context, '$jsonschema'),
  },
  {
    objectiveId: 'obj-5-3',
    description: 'Verify users collection validator was fixed',
    successMessage: 'Users collection validator corrected',
    failMessage: 'Fix the users collection validator with collMod',
    verify: async (db) => {
      try {
        const colls = await db.listCollections({ name: 'users' }).toArray();
        const validator = (colls[0] as any)?.options?.validator;
        if (!validator?.$jsonSchema) return false;
        const required = validator.$jsonSchema.required || [];
        return required.includes('email') && required.includes('username');
      } catch {
        return false;
      }
    },
  },
  {
    objectiveId: 'obj-5-4',
    description: 'Verify transactions collection validator was fixed',
    successMessage: 'Transactions collection validator corrected',
    failMessage: 'Fix the transactions collection validator with collMod',
    verify: async (db) => {
      try {
        const colls = await db.listCollections({ name: 'transactions' }).toArray();
        const validator = (colls[0] as any)?.options?.validator;
        if (!validator?.$jsonSchema) return false;
        const amountType = validator.$jsonSchema.properties?.amount?.bsonType;
        return amountType === 'number' || amountType === 'double';
      } catch {
        return false;
      }
    },
  },
  {
    objectiveId: 'obj-5-5',
    description: 'Verify sessions collection validator was added',
    successMessage: 'Sessions collection validator set',
    failMessage: 'Add a validator to the sessions collection',
    verify: async (db) => {
      try {
        const colls = await db.listCollections({ name: 'sessions' }).toArray();
        const validator = (colls[0] as any)?.options?.validator;
        return !!validator?.$jsonSchema;
      } catch {
        return false;
      }
    },
  },
  {
    objectiveId: 'obj-5-6',
    description: 'Verify validators reject invalid documents',
    successMessage: 'Validators correctly reject invalid documents!',
    failMessage: 'Test inserting an invalid document to verify rejection',
    verify: async (db) => {
      try {
        await db.collection('users').insertOne({ noUsername: true } as any);
        return false;
      } catch {
        return true;
      }
    },
  },
];
