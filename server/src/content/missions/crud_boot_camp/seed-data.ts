import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt } from '../../../sandbox/seeding/helpers.js';

export const mission12SeedData: SeedDefinition = {
  missionId: 'mission-12',
  collections: [
    {
      name: 'agents',
      documents: generate(10, i => ({
        name: `Agent_${String(i).padStart(3, '0')}`,
        level: deterministicInt(`mission-12-agent-level-${i}`, 1, 10),
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
};
