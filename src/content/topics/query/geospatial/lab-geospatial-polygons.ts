import { WorkshopLabDefinition } from '@/types';

export const labGeospatialPolygonsDefinition: WorkshopLabDefinition = {
  id: 'lab-geospatial-polygons',
  topicId: 'query',
  title: 'Geospatial Queries: Polygons & Regions',
  description:
    'Use polygon queries to find records inside or outside defined regions such as delivery zones or risk areas.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'geospatial', 'polygons'],
  prerequisites: ['lab-geospatial-near'],
  povCapabilities: ['GEOSPATIAL'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-geospatial-polygons-step-1',
      title: 'Step 1: Define Region Polygons',
      narrative:
        'Create GeoJSON polygons representing regions such as delivery areas, sales territories, or risk zones.',
      instructions:
        '- Define at least two polygon regions.\n- Store them in a regions collection with a 2dsphere index.\n- Visualize or log the polygon coordinates for reference.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyPolygons',
      points: 10,

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-geospatial-polygons-step-2',
      title: 'Step 2: Use $geoWithin and $geoIntersects',
      narrative:
        'Use geospatial operators to find which documents fall within or intersect your defined regions.',
      instructions:
        '- Use $geoWithin to find locations in a given region.\n- Use $geoIntersects to detect overlaps for complex shapes.\n- Compare results across regions.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyWithinIntersects',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
      points: 10,
    },
    {
      id: 'lab-geospatial-polygons-step-3',
      title: 'Step 3: Apply to a Real Scenario',
      narrative:
        'Apply polygon queries to a scenario such as delivery eligibility or compliance zoning.',
      instructions:
        '- Choose a scenario (e.g., “eligible for 1-hour delivery”).\n- Write queries that answer “in zone” vs “out of zone”.\n- Document how SAs should explain this capability to customers.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyScenario',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
      points: 10,
    },
  ],
};

