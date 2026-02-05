import { WorkshopLabDefinition } from '@/types';

export const labGeospatialPerformanceDefinition: WorkshopLabDefinition = {
  id: 'lab-geospatial-performance',
  topicId: 'query',
  title: 'Geospatial Query Performance & Indexing',
  description:
    'Measure and tune the performance of geospatial queries with proper indexing, shapes, and query patterns.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'geospatial', 'performance'],
  prerequisites: ['lab-geospatial-near', 'lab-geospatial-polygons'],
  povCapabilities: ['GEOSPATIAL', 'RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-geospatial-performance-step-1',
      title: 'Step 1: Benchmark Baseline Queries',
      narrative:
        'Run baseline geospatial queries and measure response times and index usage.',
      instructions:
        '- Use explain() to inspect execution plans for $near and $geoWithin queries.\n- Capture metrics such as nReturned and executionTimeMillis.\n- Note any COLLSCAN warnings or missing index hints.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyBaselineExplain',
      points: 10,
    },
    {
      id: 'lab-geospatial-performance-step-2',
      title: 'Step 2: Tune Indexes and Shapes',
      narrative:
        'Adjust index definitions, query shapes, and filters to improve geospatial query performance.',
      instructions:
        '- Experiment with compound indexes combining 2dsphere and filter fields.\n- Restrict queries with additional non-geospatial predicates.\n- Compare explain() output before and after tuning.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyTunedExplain',
      points: 10,
    },
    {
      id: 'lab-geospatial-performance-step-3',
      title: 'Step 3: Capture Best-Practice Guidance',
      narrative:
        'Summarize best practices for geospatial modeling and query design for inclusion in SA playbooks.',
      instructions:
        '- Document 3–5 “dos and don’ts” for geospatial queries.\n- Highlight index choices, coordinate precision, and query bounds.\n- Map recommendations back to the GEOSPATIAL PoV capability.',
      estimatedTimeMinutes: 10,
      verificationId: 'geospatial.verifyBestPractices',
      points: 10,
    },
  ],
};

