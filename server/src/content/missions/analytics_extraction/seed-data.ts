import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicMoney, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission8SeedData: SeedDefinition = {
  missionId: 'mission-8',
  collections: [
    {
      name: 'revenue',
      documents: generate(300, i => ({
        category: ['electronics', 'clothing', 'food', 'tools', 'books'][i % 5],
        amount: deterministicMoney(`mission-8-revenue-amount-${i}`, 1000),
        region: ['us-east', 'eu-west', 'ap-south', 'us-west'][i % 4],
        date: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
        quantity: deterministicInt(`mission-8-revenue-quantity-${i}`, 1, 50),
      })),
    },
  ],
};
