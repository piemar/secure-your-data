import { Db } from 'mongodb';
import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicMoney, deterministicToken } from '../../../sandbox/seeding/helpers.js';

export const mission5SeedData: SeedDefinition = {
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
        amount: deterministicMoney(`mission-5-transaction-amount-${i}`, 10000),
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
        token: deterministicToken(`mission-5-session-token-${i}`),
        expiresAt: new Date(2024, 6, i + 1),
        active: i < 10,
      })),
    },
  ],
  setup: async (db: Db) => {
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username'],
          properties: {
            username: { bsonType: 'string' },
            age: { bsonType: 'int' },
          },
        },
      },
    });
    await db.command({
      collMod: 'transactions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['txId', 'amount'],
          properties: {
            amount: { bsonType: 'string' },
          },
        },
      },
    });
  },
};
