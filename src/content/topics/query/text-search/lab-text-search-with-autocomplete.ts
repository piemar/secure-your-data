import { WorkshopLabDefinition } from '@/types';

export const labTextSearchWithAutocompleteDefinition: WorkshopLabDefinition = {
  id: 'lab-text-search-with-autocomplete',
  topicId: 'query',
  title: 'Search with Auto-Complete Suggestions',
  description:
    'Combine text search with auto-complete-style suggestions to power a typeahead search box.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'text-search', 'autocomplete', 'atlas-search'],
  prerequisites: ['lab-text-search-basics'],
  povCapabilities: ['TEXT-SEARCH', 'AUTO-COMPLETE'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-text-search-autocomplete-step-1',
      title: 'Step 1: Configure an Auto-Complete Index',
      narrative:
        'Extend your Atlas Search index to support auto-complete behavior on a chosen text field.',
      instructions:
        '- Choose a text field (e.g., product name) where suggestions make sense.\n- Add an auto-complete analyzer for that field in the search index definition.\n- Confirm the index deploys successfully.',
      estimatedTimeMinutes: 10,
      enhancementId: 'text-search.autocompleteIndex',
      verificationId: 'text-search.verifyAutocompleteIndex',
      points: 10,
    },
    {
      id: 'lab-text-search-autocomplete-step-2',
      title: 'Step 2: Implement a Typeahead Query',
      narrative:
        'Write a query that returns suggestions as a user types a prefix, simulating a typeahead search box.',
      instructions:
        '- Use the auto-complete operator in a $search stage.\n- Parameterize the prefix value to simulate user input.\n- Return top N suggestions with labels and IDs.',
      estimatedTimeMinutes: 10,
      enhancementId: 'text-search.typeaheadQuery',
      verificationId: 'text-search.verifyTypeahead',
      points: 10,
    },
    {
      id: 'lab-text-search-autocomplete-step-3',
      title: 'Step 3: Wire into a Simple UI or API',
      narrative:
        'Design a simple UI or API contract that calls your typeahead query and renders suggestions as the user types.',
      instructions:
        '- Define an API schema for /search/suggest.\n- Show sample JSON responses from your query.\n- Discuss UX considerations (debounce, minimum length, fallback).',
      estimatedTimeMinutes: 10,
      enhancementId: 'text-search.typeaheadDesign',
      verificationId: 'text-search.verifyTypeaheadDesign',
      points: 10,
    },
  ],
};

