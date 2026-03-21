import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission6SeedData: SeedDefinition = {
  missionId: 'mission-6',
  collections: [
    {
      name: 'customers',
      documents: generate(500, i => ({
        name: `Customer ${i}`,
        gender: i % 2 === 0 ? 'F' : 'M',
        birthYear: 1970 + (i % 50),
        state: ['UT', 'CA', 'NY', 'TX', 'FL'][i % 5],
        policies: generate(deterministicInt(`mission-6-policies-length-${i}`, 1, 3), j => ({
          type: ['life', 'auto', 'home', 'health'][j % 4],
          premium: deterministicInt(`mission-6-policy-premium-${i}-${j}`, 100, 600),
          insuredPerson: {
            name: `Insured ${i}_${j}`,
            smoker: j % 3 === 0,
            age: 25 + (i % 40),
          },
        })),
        createdAt: new Date(2024, 0, (i % 28) + 1),
      })),
    },
  ],
};
