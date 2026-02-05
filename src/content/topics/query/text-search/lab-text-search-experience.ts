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
  steps: [
    {
      id: 'lab-text-search-experience-step-1',
      title: 'Step 1: Add Filters and Facets',
      narrative:
        'Augment text search with structured filters (facets) so users can narrow down large result sets.',
      instructions:
        '- Identify 2–3 fields to use as structured filters (e.g., category, price band).\n- Extend your queries to accept structured filter parameters.\n- Return both hits and facet counts to drive a UI.',
      estimatedTimeMinutes: 12,
      verificationId: 'text-search.verifyFacetedSearch',
      points: 10,
    },
    {
      id: 'lab-text-search-experience-step-2',
      title: 'Step 2: Highlight Matching Terms',
      narrative:
        'Use highlighting metadata to show why a particular document matched the query.',
      instructions:
        '- Enable highlighting in your search queries.\n- Return highlight snippets alongside documents.\n- Discuss how this increases user trust in the results.',
      estimatedTimeMinutes: 10,
      verificationId: 'text-search.verifyHighlighting',
      points: 10,
    },
    {
      id: 'lab-text-search-experience-step-3',
      title: 'Step 3: Tune Relevance and Sort Order',
      narrative:
        'Adjust relevance scoring and sort rules to promote the most important results for your scenario.',
      instructions:
        '- Experiment with boosting fields or using compound scoring.\n- Compare search output before and after tuning.\n- Capture recommended defaults for the SA playbook.',
      estimatedTimeMinutes: 13,
      verificationId: 'text-search.verifyRelevanceTuning',
      points: 10,
    },
  ],
};

