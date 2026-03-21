import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission15SeedData: SeedDefinition = {
  missionId: 'mission-15',
  collections: [
    {
      name: 'surveillance_transactions',
      documents: generate(50, i => ({
        transactionId: `STX_${String(i).padStart(5, '0')}`,
        type: ['deposit', 'withdrawal', 'transfer'][i % 3],
        amount: deterministicInt(`mission-15-surveillance-amount-${i}`, 0, 10000),
        accountId: `ACC_${String(i % 10).padStart(4, '0')}`,
        timestamp: new Date(2024, 3, i + 1),
        flagged: i % 10 === 0,
      })),
    },
  ],
};
