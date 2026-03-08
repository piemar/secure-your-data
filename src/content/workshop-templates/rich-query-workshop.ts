import { WorkshopTemplate } from '@/types';

/**
 * Rich Query Workshop Template
 *
 * Query & Search topic: CRUD Operations plus the three Rich Query labs
 * (Basics: Filtering & Projections, Aggregations: Grouping & Facets, Advanced: $bucket, $lookup, $merge).
 */
export const richQueryWorkshopTemplate: WorkshopTemplate = {
  id: 'rich-query-workshop',
  name: 'Rich Query Workshop',
  description:
    'Hands-on workshop on Query & Search: CRUD operations, rich query basics (filtering and projections), aggregations (grouping and facets), and advanced aggregation concepts ($bucket, $lookup, $merge).',
  topicIds: ['query'],
  labIds: [
    'lab-mongodb-crud',
    'lab-rich-query-basics',
    'lab-rich-query-aggregations',
    'lab-rich-query-advanced',
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
