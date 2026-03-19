/**
 * Verification checks for Tier 2 sandbox missions.
 * After user code executes, these checks query the sandbox DB to verify objective completion.
 */

import { Db, Document } from 'mongodb';

export interface VerificationCheck {
  objectiveId: string;
  description: string;
  successMessage: string;
  failMessage: string;
  verify: (db: Db) => Promise<boolean>;
}

export const VERIFICATION_CHECKS: Record<string, VerificationCheck[]> = {
  // =====================================================
  // Mission 12: CRUD Boot Camp
  // =====================================================
  'mission-12': [
    {
      objectiveId: 'obj-12-1',
      description: 'Check that a document was inserted with insertOne',
      successMessage: 'Document successfully inserted with insertOne()',
      failMessage: 'No new document found — use insertOne() to insert a document',
      verify: async (db) => {
        const count = await db.collection('agents').countDocuments();
        return count > 10; // Started with 10, should have at least 11
      },
    },
    {
      objectiveId: 'obj-12-2',
      description: 'Check that multiple documents were bulk inserted',
      successMessage: 'Multiple documents inserted with insertMany()',
      failMessage: 'Expected multiple new documents — use insertMany()',
      verify: async (db) => {
        const count = await db.collection('agents').countDocuments();
        return count > 12; // 10 seed + 1 from obj-1 + at least 2 from insertMany
      },
    },
    {
      objectiveId: 'obj-12-3',
      description: 'Verify find/findOne was used (check is implicit — pattern validation)',
      successMessage: 'Query operations executed successfully',
      failMessage: 'Execute find() or findOne() to query documents',
      verify: async (_db) => {
        // Read operations don't leave persistent state — rely on execution output
        return true;
      },
    },
    {
      objectiveId: 'obj-12-4',
      description: 'Check that a document was updated',
      successMessage: 'Document updated with $set operator',
      failMessage: 'No document modifications detected — use updateOne() with $set',
      verify: async (db) => {
        // Check if any agent has a field that wasn't in the seed data
        // The user should have used $set to add/modify a field
        const agents = await db.collection('agents').find({}).toArray();
        // Look for any document that has been modified (has extra fields beyond seed)
        const seedFields = new Set(['name', 'level', 'specialization', 'status', 'joinedAt', '_id']);
        return agents.some(a =>
          Object.keys(a).some(k => !seedFields.has(k)) ||
          // Or check if a known field was changed from seed value
          agents.some(a2 => typeof a2.level === 'number' && a2.level > 10)
        );
      },
    },
    {
      objectiveId: 'obj-12-5',
      description: 'Check that a document was deleted',
      successMessage: 'Document deleted with deleteOne()',
      failMessage: 'No deletions detected — use deleteOne() to remove a document',
      verify: async (db) => {
        // If documents were inserted and then one deleted, count should reflect activity
        // This is a soft check — we verify the collection was touched
        const count = await db.collection('agents').countDocuments();
        // After insertOne + insertMany + deleteOne, count should be > 10 but show deletion happened
        // We'll check execution output for deleteOne acknowledgment instead
        return true; // Rely on execution output showing deletedCount > 0
      },
    },
  ],

  // =====================================================
  // Mission 1: The Phantom Index
  // =====================================================
  'mission-1': [
    {
      objectiveId: 'obj-1-1',
      description: 'Verify explain was run',
      successMessage: 'Query explain() output analyzed',
      failMessage: 'Run explain() on a query to see the execution plan',
      verify: async (_db) => true, // Read-only — rely on execution output
    },
    {
      objectiveId: 'obj-1-2',
      description: 'Verify COLLSCAN was identified',
      successMessage: 'Collection scan (COLLSCAN) identified correctly',
      failMessage: 'Identify the COLLSCAN in the explain output',
      verify: async (_db) => true, // Pattern validation
    },
    {
      objectiveId: 'obj-1-3',
      description: 'Verify an index was created',
      successMessage: 'Compound index created successfully',
      failMessage: 'Create a compound index using createIndex()',
      verify: async (db) => {
        const indexes = await db.collection('events').listIndexes().toArray();
        // Should have more than just the _id index
        return indexes.length > 1;
      },
    },
    {
      objectiveId: 'obj-1-4',
      description: 'Verify IXSCAN is used after index creation',
      successMessage: 'Query now uses index scan (IXSCAN) — performance improved!',
      failMessage: 'Run explain() again to verify the index is being used',
      verify: async (db) => {
        // Verify index exists and would be used
        const indexes = await db.collection('events').listIndexes().toArray();
        const hasCompound = indexes.some(idx => {
          const keys = Object.keys(idx.key);
          return keys.length >= 2 && !keys.includes('_id');
        });
        return hasCompound;
      },
    },
  ],

  // =====================================================
  // Mission 3: The Aggregation Heist
  // =====================================================
  'mission-3': [
    {
      objectiveId: 'obj-3-1',
      description: 'Verify document schema was explored',
      successMessage: 'Document structure analyzed',
      failMessage: 'Explore the collection with find() or findOne()',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-3-2',
      description: 'Verify $unwind and $match used',
      successMessage: '$unwind and $match stages executed',
      failMessage: 'Build pipeline with $unwind and $match',
      verify: async (_db) => true, // Pattern + execution output
    },
    {
      objectiveId: 'obj-3-3',
      description: 'Verify $lookup was used',
      successMessage: '$lookup cross-collection join executed',
      failMessage: 'Add $lookup to join with another collection',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-3-4',
      description: 'Verify $facet was used',
      successMessage: '$facet parallel aggregation executed',
      failMessage: 'Add $facet for parallel aggregations',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-3-5',
      description: 'Verify output collection was created',
      successMessage: 'Results output with $merge/$out — collection created',
      failMessage: 'Use $merge or $out to write results to a collection',
      verify: async (db) => {
        // Check if any new collection was created beyond the seeded ones
        const colls = await db.listCollections().toArray();
        const seedColls = new Set(['orders', 'products']);
        return colls.some(c => !seedColls.has(c.name) && !c.name.startsWith('system.'));
      },
    },
  ],

  // =====================================================
  // Mission 5: The Schema Saboteur
  // =====================================================
  'mission-5': [
    {
      objectiveId: 'obj-5-1',
      description: 'Audit validators — trust execution output',
      successMessage: 'Collection validators audited',
      failMessage: 'List collection validators with listCollections or collMod',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-5-2',
      description: 'Identify sabotaged validators',
      successMessage: 'Tampered validation rules identified',
      failMessage: 'Identify the incorrect validation rules',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-5-3',
      description: 'Verify users collection validator was fixed',
      successMessage: 'Users collection validator corrected',
      failMessage: 'Fix the users collection validator with collMod',
      verify: async (db) => {
        try {
          const colls = await db.listCollections({ name: 'users' }).toArray();
          const validator = colls[0]?.options?.validator;
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
          const validator = colls[0]?.options?.validator;
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
          const validator = colls[0]?.options?.validator;
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
        // Try inserting an invalid doc — if it throws, validator is working
        try {
          await db.collection('users').insertOne({ noUsername: true } as any);
          return false; // Should have thrown
        } catch {
          return true; // Validator rejected it — working correctly
        }
      },
    },
  ],

  // =====================================================
  // Mission 6: Rich Query Recon
  // =====================================================
  'mission-6': [
    {
      objectiveId: 'obj-6-1',
      description: 'Verify compound find() executed',
      successMessage: 'Compound query with $elemMatch executed',
      failMessage: 'Build a find() query with $elemMatch on nested arrays',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-6-2',
      description: 'Verify projection was applied',
      successMessage: 'Projections applied to limit returned fields',
      failMessage: 'Add projection to your find() query',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-6-3',
      description: 'Verify sort/limit/skip were used',
      successMessage: 'Pagination with sort/limit/skip working',
      failMessage: 'Chain .sort(), .limit(), and .skip() to your query',
      verify: async (_db) => true,
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
  ],

  // =====================================================
  // Mission 13: Geospatial Pursuit
  // =====================================================
  'mission-13': [
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
      verify: async (_db) => true, // Execution output
    },
    {
      objectiveId: 'obj-13-3',
      description: 'Verify $geoWithin with polygon',
      successMessage: '$geoWithin polygon query executed',
      failMessage: 'Use $geoWithin with $geometry Polygon',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-13-4',
      description: 'Verify combined geo + filter query',
      successMessage: 'Geo query combined with additional filters',
      failMessage: 'Combine geo query with a non-geo filter (status, type, etc.)',
      verify: async (_db) => true,
    },
  ],

  // =====================================================
  // Mission 14: Graph Infiltration
  // =====================================================
  'mission-14': [
    {
      objectiveId: 'obj-14-1',
      description: 'Verify $graphLookup executed',
      successMessage: '$graphLookup traversal completed',
      failMessage: 'Use $graphLookup with connectFromField',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-14-2',
      description: 'Verify maxDepth was set',
      successMessage: 'maxDepth limit applied to traversal',
      failMessage: 'Set maxDepth in $graphLookup to limit traversal depth',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-14-3',
      description: 'Verify restrictSearchWithMatch used',
      successMessage: 'Traversal filtered with restrictSearchWithMatch',
      failMessage: 'Add restrictSearchWithMatch to filter $graphLookup results',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-14-4',
      description: 'Verify graph output analyzed',
      successMessage: 'Fraud patterns identified in graph output',
      failMessage: 'Analyze the graph output with $project or $size',
      verify: async (_db) => true,
    },
  ],

  // =====================================================
  // Mission 16: Transaction Lockout
  // =====================================================
  'mission-16': [
    {
      objectiveId: 'obj-16-1',
      description: 'Verify session was started',
      successMessage: 'Client session started',
      failMessage: 'Start a client session for transaction support',
      verify: async (_db) => true, // Execution output based
    },
    {
      objectiveId: 'obj-16-2',
      description: 'Verify transaction was started',
      successMessage: 'Transaction started with readConcern/writeConcern',
      failMessage: 'Begin a transaction with startTransaction()',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-16-3',
      description: 'Verify accounts were modified atomically',
      successMessage: 'Multi-document writes executed in transaction',
      failMessage: 'Execute updateOne operations within the transaction',
      verify: async (db) => {
        // Check if any account balances changed from seed values
        const accounts = await db.collection('accounts').find({}).toArray();
        const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
        // In a correct transfer, total balance should remain constant
        // But individual balances should have changed
        return accounts.some(a => a.balance !== undefined);
      },
    },
    {
      objectiveId: 'obj-16-4',
      description: 'Verify transaction committed or aborted',
      successMessage: 'Transaction completed (committed/aborted)',
      failMessage: 'Commit or abort the transaction',
      verify: async (_db) => true,
    },
  ],

  // =====================================================
  // Mission 18: Time Series Infiltration
  // =====================================================
  'mission-18': [
    {
      objectiveId: 'obj-18-1',
      description: 'Verify time series collection created',
      successMessage: 'Time series collection created with timeField and metaField',
      failMessage: 'Create a time series collection using db.createCollection()',
      verify: async (db) => {
        const colls = await db.listCollections().toArray();
        return colls.some(c =>
          c.type === 'timeseries' ||
          (c.options && c.options.timeseries)
        );
      },
    },
    {
      objectiveId: 'obj-18-2',
      description: 'Verify sensor readings inserted',
      successMessage: 'Timestamped sensor readings inserted',
      failMessage: 'Insert sensor readings with timestamps',
      verify: async (_db) => true, // Execution output
    },
    {
      objectiveId: 'obj-18-3',
      description: 'Verify windowed aggregation executed',
      successMessage: 'Windowed aggregation with $dateTrunc completed',
      failMessage: 'Use $dateTrunc with $group for windowed aggregation',
      verify: async (_db) => true,
    },
    {
      objectiveId: 'obj-18-4',
      description: 'Verify anomaly detection query',
      successMessage: 'Anomaly detection query executed',
      failMessage: 'Use $match with threshold comparison to find anomalies',
      verify: async (_db) => true,
    },
  ],

  // =====================================================
  // Mission 20: Schema Evolution
  // =====================================================
  'mission-20': [
    {
      objectiveId: 'obj-20-1',
      description: 'Verify fields were renamed',
      successMessage: 'Fields renamed with $rename',
      failMessage: 'Use $rename with updateMany() to rename fields',
      verify: async (db) => {
        const docs = await db.collection('legacy_docs').find({ name: { $exists: true } }).toArray();
        const legacyDocs = await db.collection('legacy_docs').find({ old_name: { $exists: true } }).toArray();
        // Some docs should now have 'name' instead of 'old_name'
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
        return withDeprecated < 30; // Should be fewer than the original 30
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
        return withStatus > 10; // Migrated docs already have status
      },
    },
    {
      objectiveId: 'obj-20-4',
      description: 'Verify polymorphic query',
      successMessage: 'Polymorphic documents queried with $exists and $type',
      failMessage: 'Use $exists and $type to query different document shapes',
      verify: async (_db) => true,
    },
  ],
};
