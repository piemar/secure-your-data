import { WorkshopTemplate } from '@/types';

/**
 * Query Capabilities Workshop Template
 *
 * Focused workshop covering rich queries, text search, geospatial, and graph capabilities.
 */
export const queryCapabilitiesWorkshopTemplate: WorkshopTemplate = {
  id: 'query-capabilities-workshop',
  name: 'Query Capabilities Workshop',
  description:
    'Hands-on workshop showcasing MongoDB rich queries, text search, geospatial queries, and graph-style traversals.',
  topicIds: ['query'],
  labIds: [
    'lab-rich-query-basics',
    'lab-rich-query-aggregations',
    'lab-rich-query-encrypted-vs-plain',
    'lab-text-search-basics',
    'lab-text-search-with-autocomplete',
    'lab-text-search-experience',
    'lab-geospatial-near',
    'lab-geospatial-polygons',
    'lab-geospatial-performance',
    'lab-graph-traversal',
    'lab-graph-recommendations',
    'lab-graph-fraud-detection',
  ],
  defaultMode: 'lab',
  allowedModes: ['demo', 'lab', 'challenge'],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50,
    allowTeams: true,
  },
  includeCompetitorComparisons: false,
};

