import { WorkshopLabDefinition } from '@/types';

export const labTextSearchBasicsDefinition: WorkshopLabDefinition = {
  id: 'lab-text-search-basics',
  topicId: 'query',
  title: 'Text Search Basics',
  description:
    'Create a basic Atlas Search index and run text search queries with scoring and projections.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['query', 'text-search', 'atlas-search'],
  prerequisites: ['lab-rich-query-basics'],
  povCapabilities: ['TEXT-SEARCH'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-text-search-basics-step-1',
      title: 'Step 1: Create a Simple Search Index',
      narrative:
        'Use Atlas Search to create a simple index on a text field so you can search using human-friendly queries.',
      instructions:
        '- Identify a collection with text fields (e.g., product name and description).\n- Create a basic Atlas Search index on the main text fields.\n- Verify the index is built and ready for queries.',
      estimatedTimeMinutes: 8,
      enhancementId: 'text-search.indexCreated',
      verificationId: 'text-search.verifyIndexCreated',
      points: 10,
    },
    {
      id: 'lab-text-search-basics-step-2',
      title: 'Step 2: Run Text Search Queries',
      narrative:
        'Run $search queries with different operators and observe how results are scored.',
      instructions:
        '- Use the $search stage with a simple text operator.\n- Compare results for different search terms.\n- Inspect score metadata to understand relevance.',
      estimatedTimeMinutes: 9,
      enhancementId: 'text-search.queries',
      verificationId: 'text-search.verifyQueries',
      points: 10,
    },
    {
      id: 'lab-text-search-basics-step-3',
      title: 'Step 3: Project and Sort by Score',
      narrative:
        'Control which fields are returned and ensure the most relevant results appear first using score-based sorting.',
      instructions:
        '- Use $project to include name, description, and score.\n- Sort by score descending.\n- Discuss how this differs from simple regex matches on indexes.',
      estimatedTimeMinutes: 8,
      enhancementId: 'text-search.projectionSort',
      verificationId: 'text-search.verifyProjectionAndSort',
      points: 10,
    },
  ],
};

