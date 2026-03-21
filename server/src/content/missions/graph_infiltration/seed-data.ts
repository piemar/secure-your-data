import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission14SeedData: SeedDefinition = {
  missionId: 'mission-14',
  collections: [
    {
      name: 'people',
      documents: [
        ...generate(50, i => ({
          name: `Person_${String(i).padStart(3, '0')}`,
          role: i < 5 ? 'suspect' : 'civilian',
          connections: [
            `Person_${String((i + 1) % 50).padStart(3, '0')}`,
            `Person_${String((i + 3) % 50).padStart(3, '0')}`,
            ...(i < 10 ? [`Person_${String((i + 7) % 10).padStart(3, '0')}`] : []),
          ],
          accountBalance: deterministicInt(`mission-14-account-balance-${i}`, 0, 50000),
          flagged: i < 5,
        })),
      ],
    },
    {
      name: 'transactions_graph',
      documents: generate(200, i => ({
        from: `Person_${String(i % 50).padStart(3, '0')}`,
        to: `Person_${String((i * 3 + 7) % 50).padStart(3, '0')}`,
        amount: deterministicInt(`mission-14-graph-amount-${i}`, 0, 5000),
        timestamp: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
        suspicious: i % 15 === 0,
      })),
    },
  ],
};
