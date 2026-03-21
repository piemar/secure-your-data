import { Db } from 'mongodb';
import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, hashToUnitInterval } from '../../../sandbox/seeding/helpers.js';

export const mission18SeedData: SeedDefinition = {
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
        temperature: 20 + hashToUnitInterval(`mission-18-temp-${i}`) * 15 + (i % 20 === 0 ? 30 : 0),
        humidity: 40 + hashToUnitInterval(`mission-18-humidity-${i}`) * 30,
        pressure: 1000 + hashToUnitInterval(`mission-18-pressure-${i}`) * 50,
      })),
    },
  ],
  setup: async (_db: Db) => {
    // Raw seeded readings are used as source data; mission objective is to create/aggregate TS collection.
  },
};
