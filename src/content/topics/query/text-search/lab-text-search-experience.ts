import { WorkshopLabDefinition } from '@/types';

export const labTextSearchExperienceDefinition: WorkshopLabDefinition = {
  id: 'lab-text-search-experience',
  topicId: 'query',
  title: 'Design a Complete Search Experience',
  description:
    'Bring together ranking, highlighting, and filtering to design a complete search experience for an application.',
  difficulty: 'advanced',
  estimatedTotalTimeMinutes: 35,
  tags: ['query', 'text-search', 'experience', 'ux'],
  prerequisites: ['lab-text-search-basics', 'lab-text-search-with-autocomplete'],
  povCapabilities: ['TEXT-SEARCH', 'AUTO-COMPLETE', 'RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Faceted search', explanation: 'Return both search hits and aggregate counts (facets) so users can filter by category, price, etc.' },
    { term: 'Highlighting', explanation: 'Use $meta: "searchHighlights" to show snippets with matching terms marked (e.g. <em>).' },
    { term: 'Relevance tuning', explanation: 'Use compound.should with score.boost to emphasize certain fields (e.g. title over body).' },
    { term: '$facet', explanation: 'Run multiple pipelines in one request (e.g. hits + facet counts).' },
  ],
  steps: [
    {
      id: 'lab-text-search-experience-step-1',
      title: 'Step 1: Add Filters and Facets',
      narrative:
        'Augment text search with structured filters (facets) so users can narrow down large result sets.',
      instructions:
        '- Identify 2–3 fields to use as structured filters (e.g., category, price band).\n- Extend your queries to accept structured filter parameters.\n- Return both hits and facet counts to drive a UI.',
      estimatedTimeMinutes: 12,
      enhancementId: 'text-search.facetedSearch',
      verificationId: 'text-search.verifyFacetedSearch',
      points: 10,
      hints: [
        'Use $facet to return both a "hits" pipeline (e.g. $limit 20) and a "categoryCounts" $group.',
        'Identify 2–3 structured fields (e.g. category, price band) for filters.',
        'Return facet counts alongside hits so the UI can render filters and result list together.',
      ],
    },
    {
      id: 'lab-text-search-experience-step-2',
      title: 'Step 2: Highlight Matching Terms',
      narrative:
        'Use highlighting metadata to show why a particular document matched the query.',
      instructions:
        '- Enable highlighting in your search queries.\n- Return highlight snippets alongside documents.\n- Discuss how this increases user trust in the results.',
      estimatedTimeMinutes: 10,
      enhancementId: 'text-search.highlighting',
      verificationId: 'text-search.verifyHighlighting',
      points: 10,
      hints: [
        'Add "highlight" to the $search stage with "path" and optionally "maxNumPassages".',
        'Project $meta: "searchHighlights" to get snippets with matching terms marked.',
        'Display highlight snippets next to each result so users see why it matched.',
      ],
    },
    {
      id: 'lab-text-search-experience-step-3',
      title: 'Step 3: Tune Relevance and Sort Order',
      narrative:
        'Adjust relevance scoring and sort rules to promote the most important results for your scenario.',
      instructions:
        '- Experiment with boosting fields or using compound scoring.\n- Compare search output before and after tuning.\n- Capture recommended defaults for the SA playbook.',
      estimatedTimeMinutes: 13,
      enhancementId: 'text-search.relevanceTuning',
      verificationId: 'text-search.verifyRelevanceTuning',
      points: 10,
      hints: [
        'Use compound.should with multiple text clauses and score.boost to emphasize name over description.',
        'Compare result order before and after tuning to validate.',
        'Document the final index and query settings for your playbook.',
      ],
    },
  ],
};

