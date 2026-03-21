import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-13',
    title: 'Geospatial Pursuit',
    codename: 'GEOTRACK',
    tier: 'infiltration',
    description: 'Track assets across the globe using 2dsphere indexes, $geoNear, and $geoWithin on location data.',
    briefing: `GEOINT ALERT\n\nAssets are on the move. We have GPS coordinates for every operative and safe house in the network. Your mission: create 2dsphere indexes on location data, use $geoNear to find operatives within a radius of a target point, then use $geoWithin to identify all assets inside a defined polygon zone.\n\nEvery second they're moving. Lock onto their positions NOW.`,
    objectives: [
      { id: 'obj-13-1', text: 'Create a 2dsphere index on location field', completed: false },
      { id: 'obj-13-2', text: 'Use $geoNear to find locations within a radius', completed: false },
      { id: 'obj-13-3', text: 'Use $geoWithin with $geometry polygon', completed: false },
      { id: 'obj-13-4', text: 'Combine geo queries with other filters', completed: false },
    ],
    timeLimit: 600,
    xpReward: 800,
    difficulty: 3,
    topic: 'query',
    povCapabilities: ['GEOSPATIAL'],
    chaosEvents: [
      { id: 'chaos-13-1', title: '📡 GPS DRIFT', description: 'Satellite interference! Coordinates may be inaccurate by up to 500m.', triggerAt: 200, penalty: 150, duration: 60 },
    ],
  };
