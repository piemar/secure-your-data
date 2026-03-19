/**
 * Seed data definitions for Tier 2 sandbox missions.
 * Each mission defines collections, documents, indexes, and optional setup functions.
 */

import { Db, Document, CreateCollectionOptions, IndexDescription } from 'mongodb';

export interface CollectionSeed {
  name: string;
  documents: Document[];
  options?: CreateCollectionOptions;
  indexes?: Array<{ key: Document; options?: Document }>;
}

export interface SeedDefinition {
  missionId: string;
  collections: CollectionSeed[];
  setup?: (db: Db) => Promise<void>;
}

// Helper: generate N docs with a factory
function generate(n: number, factory: (i: number) => Document): Document[] {
  return Array.from({ length: n }, (_, i) => factory(i));
}

export const SEED_DATA: Record<string, SeedDefinition> = {
  // =====================================================
  // Mission 12: CRUD Boot Camp
  // =====================================================
  'mission-12': {
    missionId: 'mission-12',
    collections: [
      {
        name: 'agents',
        documents: generate(10, i => ({
          name: `Agent_${String(i).padStart(3, '0')}`,
          level: Math.floor(Math.random() * 10) + 1,
          specialization: ['infiltration', 'surveillance', 'crypto', 'demolition'][i % 4],
          status: i < 8 ? 'active' : 'inactive',
          joinedAt: new Date(2024, 0, i + 1),
        })),
      },
      {
        name: 'missions',
        documents: generate(5, i => ({
          codename: `OP_${['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'][i]}`,
          difficulty: (i % 5) + 1,
          assignedAgents: [],
          status: 'pending',
          createdAt: new Date(2024, 1, i + 1),
        })),
      },
    ],
  },

  // =====================================================
  // Mission 1: The Phantom Index
  // =====================================================
  'mission-1': {
    missionId: 'mission-1',
    collections: [
      {
        name: 'events',
        documents: generate(1000, i => ({
          type: ['login', 'purchase', 'logout', 'error', 'signup'][i % 5],
          userId: `user_${String(i % 200).padStart(4, '0')}`,
          timestamp: new Date(2024, 0, 1, Math.floor(i / 42), i % 60),
          metadata: {
            ip: `192.168.${Math.floor(i / 256)}.${i % 256}`,
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][i % 4],
            region: ['us-east', 'eu-west', 'ap-south', 'us-west'][i % 4],
          },
          amount: i % 5 === 1 ? Math.round(Math.random() * 10000) / 100 : undefined,
        })),
        // NO indexes — the point is that there are no indexes and queries are slow
      },
    ],
  },

  // =====================================================
  // Mission 3: The Aggregation Heist
  // =====================================================
  'mission-3': {
    missionId: 'mission-3',
    collections: [
      {
        name: 'orders',
        documents: generate(200, i => ({
          orderId: `ORD_${String(i).padStart(5, '0')}`,
          customerId: `CUST_${String(i % 50).padStart(4, '0')}`,
          items: generate(Math.floor(Math.random() * 4) + 1, j => ({
            productId: `PROD_${String((i * 3 + j) % 50).padStart(3, '0')}`,
            name: ['Widget', 'Gadget', 'Doohickey', 'Thingamajig'][j % 4],
            quantity: Math.floor(Math.random() * 10) + 1,
            price: Math.round(Math.random() * 200 * 100) / 100,
          })),
          status: ['pending', 'shipped', 'delivered', 'returned'][i % 4],
          createdAt: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
          region: ['us-east', 'eu-west', 'ap-south', 'us-west'][i % 4],
        })),
      },
      {
        name: 'products',
        documents: generate(50, i => ({
          productId: `PROD_${String(i).padStart(3, '0')}`,
          name: `Product ${i}`,
          category: ['electronics', 'clothing', 'food', 'tools', 'books'][i % 5],
          price: Math.round(Math.random() * 500 * 100) / 100,
          inStock: i % 3 !== 0,
        })),
      },
    ],
  },

  // =====================================================
  // Mission 5: The Schema Saboteur
  // =====================================================
  'mission-5': {
    missionId: 'mission-5',
    collections: [
      {
        name: 'users',
        documents: generate(20, i => ({
          username: `user_${i}`,
          email: `user_${i}@example.com`,
          age: 20 + (i % 40),
          role: ['admin', 'editor', 'viewer'][i % 3],
          createdAt: new Date(2024, 0, i + 1),
        })),
      },
      {
        name: 'transactions',
        documents: generate(30, i => ({
          txId: `TX_${String(i).padStart(5, '0')}`,
          fromAccount: `ACC_${String(i % 10).padStart(4, '0')}`,
          toAccount: `ACC_${String((i + 5) % 10).padStart(4, '0')}`,
          amount: Math.round(Math.random() * 10000) / 100,
          currency: 'USD',
          status: ['pending', 'completed', 'failed'][i % 3],
          timestamp: new Date(2024, 1, i + 1),
        })),
      },
      {
        name: 'sessions',
        documents: generate(15, i => ({
          sessionId: `SESS_${String(i).padStart(6, '0')}`,
          userId: `user_${i % 20}`,
          token: `tok_${Math.random().toString(36).slice(2)}`,
          expiresAt: new Date(2024, 6, i + 1),
          active: i < 10,
        })),
      },
    ],
    // The "sabotage" — validators with intentional errors for users to find and fix
    setup: async (db: Db) => {
      // Add a broken validator to users (missing 'email' required field)
      await db.command({
        collMod: 'users',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username'], // Missing 'email' — sabotaged
            properties: {
              username: { bsonType: 'string' },
              age: { bsonType: 'int' }, // Should be 'number' — sabotaged
            },
          },
        },
      });
      // Add broken validator to transactions (wrong field name)
      await db.command({
        collMod: 'transactions',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['txId', 'amount'],
            properties: {
              amount: { bsonType: 'string' }, // Should be 'number' — sabotaged
            },
          },
        },
      });
    },
  },

  // =====================================================
  // Mission 6: Rich Query Recon
  // =====================================================
  'mission-6': {
    missionId: 'mission-6',
    collections: [
      {
        name: 'customers',
        documents: generate(500, i => ({
          name: `Customer ${i}`,
          gender: i % 2 === 0 ? 'F' : 'M',
          birthYear: 1970 + (i % 50),
          state: ['UT', 'CA', 'NY', 'TX', 'FL'][i % 5],
          policies: generate(Math.floor(Math.random() * 3) + 1, j => ({
            type: ['life', 'auto', 'home', 'health'][j % 4],
            premium: Math.round(Math.random() * 500) + 100,
            insuredPerson: {
              name: `Insured ${i}_${j}`,
              smoker: j % 3 === 0,
              age: 25 + (i % 40),
            },
          })),
          createdAt: new Date(2024, 0, (i % 28) + 1),
        })),
        // No indexes — user needs to create them
      },
    ],
  },

  // =====================================================
  // Mission 8: Analytics Extraction
  // =====================================================
  'mission-8': {
    missionId: 'mission-8',
    collections: [
      {
        name: 'revenue',
        documents: generate(300, i => ({
          category: ['electronics', 'clothing', 'food', 'tools', 'books'][i % 5],
          amount: Math.round(Math.random() * 1000 * 100) / 100,
          region: ['us-east', 'eu-west', 'ap-south', 'us-west'][i % 4],
          date: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
          quantity: Math.floor(Math.random() * 50) + 1,
        })),
      },
    ],
  },

  // =====================================================
  // Mission 13: Geospatial Pursuit
  // =====================================================
  'mission-13': {
    missionId: 'mission-13',
    collections: [
      {
        name: 'locations',
        documents: generate(100, i => ({
          name: `Asset_${String(i).padStart(3, '0')}`,
          type: ['operative', 'safehouse', 'droppoint', 'surveillance'][i % 4],
          status: i < 80 ? 'active' : 'inactive',
          location: {
            type: 'Point',
            coordinates: [
              -180 + Math.random() * 360,  // longitude
              -90 + Math.random() * 180,    // latitude
            ],
          },
          lastSeen: new Date(2024, 5, (i % 28) + 1),
        })),
        // No 2dsphere index — user must create it
      },
    ],
  },

  // =====================================================
  // Mission 14: Graph Infiltration
  // =====================================================
  'mission-14': {
    missionId: 'mission-14',
    collections: [
      {
        name: 'people',
        documents: [
          // Build a realistic social graph with known fraud ring
          ...generate(50, i => ({
            name: `Person_${String(i).padStart(3, '0')}`,
            role: i < 5 ? 'suspect' : 'civilian',
            connections: [
              `Person_${String((i + 1) % 50).padStart(3, '0')}`,
              `Person_${String((i + 3) % 50).padStart(3, '0')}`,
              ...(i < 10 ? [`Person_${String((i + 7) % 10).padStart(3, '0')}`] : []),
            ],
            accountBalance: Math.round(Math.random() * 50000),
            flagged: i < 5,
          })),
        ],
      },
      {
        name: 'transactions_graph',
        documents: generate(200, i => ({
          from: `Person_${String(i % 50).padStart(3, '0')}`,
          to: `Person_${String((i * 3 + 7) % 50).padStart(3, '0')}`,
          amount: Math.round(Math.random() * 5000),
          timestamp: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
          suspicious: i % 15 === 0,
        })),
      },
    ],
  },

  // =====================================================
  // Mission 15: Change Stream Stakeout
  // =====================================================
  'mission-15': {
    missionId: 'mission-15',
    collections: [
      {
        name: 'surveillance_transactions',
        documents: generate(50, i => ({
          transactionId: `STX_${String(i).padStart(5, '0')}`,
          type: ['deposit', 'withdrawal', 'transfer'][i % 3],
          amount: Math.round(Math.random() * 10000),
          accountId: `ACC_${String(i % 10).padStart(4, '0')}`,
          timestamp: new Date(2024, 3, i + 1),
          flagged: i % 10 === 0,
        })),
      },
    ],
  },

  // =====================================================
  // Mission 16: Transaction Lockout
  // =====================================================
  'mission-16': {
    missionId: 'mission-16',
    collections: [
      {
        name: 'accounts',
        documents: generate(10, i => ({
          accountId: `ACC_${String(i).padStart(4, '0')}`,
          owner: `Account Holder ${i}`,
          balance: 10000 + Math.floor(Math.random() * 50000),
          currency: 'USD',
          type: i < 5 ? 'checking' : 'savings',
          lastUpdated: new Date(2024, 5, 1),
        })),
      },
      {
        name: 'transfer_log',
        documents: [],
      },
    ],
  },

  // =====================================================
  // Mission 18: Time Series Infiltration
  // =====================================================
  'mission-18': {
    missionId: 'mission-18',
    collections: [
      {
        name: 'sensor_readings',
        documents: generate(500, i => ({
          timestamp: new Date(2024, 0, 1, Math.floor(i / 60), i % 60),
          metadata: {
            deviceId: `SENSOR_${String(i % 20).padStart(3, '0')}`,
            location: ['warehouse-A', 'warehouse-B', 'office-1', 'server-room'][i % 4],
          },
          temperature: 20 + Math.random() * 15 + (i % 20 === 0 ? 30 : 0), // Anomaly spikes
          humidity: 40 + Math.random() * 30,
          pressure: 1000 + Math.random() * 50,
        })),
        // Note: this is pre-existing data. The user must create the time series collection
        // and re-insert, or we seed into a regular collection as a data source.
      },
    ],
    setup: async (db: Db) => {
      // Create a source collection with raw data — user needs to create proper TS collection
      // The raw data is already in sensor_readings above
    },
  },

  // =====================================================
  // Mission 20: Schema Evolution
  // =====================================================
  'mission-20': {
    missionId: 'mission-20',
    collections: [
      {
        name: 'legacy_docs',
        documents: [
          // Mix of document shapes (polymorphic)
          ...generate(30, i => {
            const base: Document = {
              old_name: `Item ${i}`,     // needs $rename to 'name'
              deprecated_field: 'remove', // needs $unset
              version: 1,
            };
            if (i % 3 === 0) {
              base.extra_data = { nested: true, value: i };
            }
            if (i % 5 === 0) {
              base.tags = ['legacy', 'v1'];
            }
            return base;
          }),
          // Some already-migrated docs (different shape)
          ...generate(10, i => ({
            name: `Migrated Item ${i}`,  // already renamed
            version: 2,
            status: 'active',
            migratedAt: new Date(2024, 5, i + 1),
          })),
        ],
      },
    ],
  },
};
