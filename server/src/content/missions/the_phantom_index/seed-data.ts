import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicMoney } from '../../../sandbox/seeding/helpers.js';

export const mission1SeedData: SeedDefinition = {
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
        amount: i % 5 === 1 ? deterministicMoney(`mission-1-events-amount-${i}`, 10000) : undefined,
      })),
    },
  ],
};
