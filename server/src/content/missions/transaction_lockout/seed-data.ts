import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission16SeedData: SeedDefinition = {
  missionId: 'mission-16',
  collections: [
    {
      name: 'accounts',
      documents: generate(10, i => ({
        accountId: `ACC_${String(i).padStart(4, '0')}`,
        owner: `Account Holder ${i}`,
        balance: 10000 + deterministicInt(`mission-16-account-balance-${i}`, 0, 50000),
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
};
