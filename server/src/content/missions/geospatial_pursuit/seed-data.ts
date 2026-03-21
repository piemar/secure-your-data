import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, hashToUnitInterval } from '../../../sandbox/seeding/helpers.js';

export const mission13SeedData: SeedDefinition = {
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
            -180 + hashToUnitInterval(`mission-13-lon-${i}`) * 360,
            -90 + hashToUnitInterval(`mission-13-lat-${i}`) * 180,
          ],
        },
        lastSeen: new Date(2024, 5, (i % 28) + 1),
      })),
    },
  ],
};
