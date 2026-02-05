import { WorkshopLabDefinition } from '@/types';

export const labGeospatialNearDefinition: WorkshopLabDefinition = {
  id: 'lab-geospatial-near',
  topicId: 'query',
  title: 'Geospatial Queries: $near & Distance',
  description:
    'Model location data and use geospatial indexes with $near queries to find the closest locations to a point.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['query', 'geospatial', 'near'],
  prerequisites: ['lab-rich-query-basics'],
  povCapabilities: ['GEOSPATIAL'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-geospatial-near-step-1',
      title: 'Step 1: Model and Index Location Data',
      narrative:
        'Store location data using GeoJSON points and create a 2dsphere index to support geospatial queries.',
      instructions:
        '- Insert sample documents with GeoJSON point coordinates.\n- Create a 2dsphere index on the location field.\n- Verify the index is usable for $near queries.',
      estimatedTimeMinutes: 8,
      verificationId: 'geospatial.verifyIndex',
      points: 10,
    },
    {
      id: 'lab-geospatial-near-step-2',
      title: 'Step 2: Run $near Queries',
      narrative:
        'Use $near to find the nearest locations to a given point, with optional distance bounds.',
      instructions:
        '- Use $near with a reference point and a small radius.\n- Return the top N nearest locations and their distances.\n- Experiment with different radii and coordinates.',
      estimatedTimeMinutes: 9,
      verificationId: 'geospatial.verifyNearQueries',
      points: 10,
    },
    {
      id: 'lab-geospatial-near-step-3',
      title: 'Step 3: Design a “Find Nearest Store” Feature',
      narrative:
        'Design how a customer-facing application would call your geospatial queries to implement a “find nearest store” feature.',
      instructions:
        '- Define an API contract for a /stores/near endpoint.\n- Show sample request and response payloads.\n- Capture edge cases (no nearby results, invalid coordinates).',
      estimatedTimeMinutes: 8,
      verificationId: 'geospatial.verifyFeatureDesign',
      points: 10,
    },
  ],
};

