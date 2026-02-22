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
  keyConcepts: [
    { term: 'Atlas Search', explanation: 'Full-text and faceted search powered by Lucene; uses the $search aggregation stage.' },
    { term: 'Search index', explanation: 'Defines which fields are searchable and how they are analyzed (e.g. standard, autocomplete).' },
    { term: '$search stage', explanation: 'Aggregation stage that runs a search pipeline; returns documents with relevance scoring.' },
    { term: 'searchScore', explanation: 'Metadata ($meta: "searchScore") that indicates how well a document matched the query.' },
  ],
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
      hints: [
        'In Atlas, go to your cluster → Search → Create Index.',
        'Use "dynamic: false" and list only the fields you need for search.',
        'The index definition uses a "mappings" object with "fields" for each path.',
      ],
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
      hints: [
        'The $search stage takes an "index" (name) and a "text" operator with "query" and "path".',
        'You can pass an array of paths to search multiple fields.',
        'Results are ordered by relevance by default; use $limit to cap the number.',
      ],
      preview: {
        type: 'search',
        config: {
          searchField: true,
          searchPlaceholder: 'Search products…',
          resultFields: ['name', 'description'],
          showScore: true,
        },
      },
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
      hints: [
        'Use { $meta: "searchScore" } in $project to include the score in the pipeline.',
        'Sort by the projected score field descending so the best matches appear first.',
        'Project only the fields your app needs to keep the response small.',
      ],
    },
  ],
};

