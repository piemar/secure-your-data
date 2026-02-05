import { WorkshopLabDefinition } from '@/types';

export const labGraphRecommendationsDefinition: WorkshopLabDefinition = {
  id: 'lab-graph-recommendations',
  topicId: 'query',
  title: 'Recommendations from Graph Relationships',
  description:
    'Use relationships between users and items to compute simple “people who liked this also liked…” recommendations.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'graph', 'recommendations'],
  prerequisites: ['lab-graph-traversal'],
  povCapabilities: ['GRAPH', 'RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-graph-recommendations-step-1',
      title: 'Step 1: Model User-Item Interactions',
      narrative:
        'Create collections that capture interactions between users and items (e.g., purchases, likes).',
      instructions:
        '- Insert sample users and items.\n- Create an interactions collection that links users to items.\n- Ensure data reflects overlapping interests across users.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyInteractionsModel',
      points: 10,
    },
    {
      id: 'lab-graph-recommendations-step-2',
      title: 'Step 2: Compute Simple Recommendations',
      narrative:
        'Use aggregations (with $graphLookup or joins) to compute “also liked” recommendations.',
      instructions:
        '- Starting from a given item, traverse to users and then to other items.\n- Count and rank candidate recommendations.\n- Return top N items with scores.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyRecommendations',
      points: 10,
    },
    {
      id: 'lab-graph-recommendations-step-3',
      title: 'Step 3: Package Recommendations for an API',
      narrative:
        'Design a simple API contract that exposes recommendations to a frontend or partner system.',
      instructions:
        '- Define an endpoint such as /items/:id/recommendations.\n- Show sample JSON responses.\n- Discuss how to cache or precompute results for scale.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyRecommendationApi',
      points: 10,
    },
  ],
};

