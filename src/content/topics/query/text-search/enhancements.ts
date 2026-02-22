import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Text Search Enhancement Metadata
 * POV: TEXT-SEARCH, AUTO-COMPLETE (Atlas Search)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'text-search.indexCreated': {
    id: 'text-search.indexCreated',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'search-index.json',
        language: 'json',
        code: `{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": { "type": "string" },
      "description": { "type": "string" }
    }
  }
}`,
        tips: [
          'Create the index in Atlas UI under Search → Create Index, or via the Atlas Search index API.',
          'Use dynamic: false and list only the fields you need for search to keep the index lean.',
        ],
      },
    ],
    tips: [
      'Atlas Search indexes are separate from MQL indexes; they power $search aggregation stage.',
      'After creating the index, wait for the build to complete before running $search queries.',
    ],
  },

  'text-search.queries': {
    id: 'text-search.queries',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'text-search-query.js',
        language: 'javascript',
        code: `// Run a text search and inspect scores
db.products.aggregate([
  {
    $search: {
      index: 'default',
      text: {
        query: 'wireless headphones',
        path: ['name', 'description']
      }
    }
  },
  { $limit: 10 }
]);`,
        tips: [
          'The $search stage returns a score in $$SEARCH_META for relevance.',
          'Use different query strings to compare how scoring changes.',
        ],
      },
    ],
    tips: [
      'Text operator searches across the specified paths and returns results ordered by relevance by default.',
      'Scores are relative to the query; use them to compare results within the same search.',
    ],
  },

  'text-search.projectionSort': {
    id: 'text-search.projectionSort',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'project-and-sort.js',
        language: 'javascript',
        code: `db.products.aggregate([
  {
    $search: {
      index: 'default',
      text: { query: 'wireless', path: ['name', 'description'] }
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      score: { $meta: 'searchScore' }
    }
  },
  { $sort: { score: -1 } },
  { $limit: 10 }
]);`,
        tips: [
          'Use $meta: "searchScore" to include the search score in the pipeline.',
          'Sorting by score descending puts the most relevant results first.',
        ],
      },
    ],
    tips: [
      'Project only the fields your app needs to reduce payload size.',
      'Sorting by searchScore is more meaningful than regex-based matches on indexed fields.',
    ],
  },

  'text-search.autocompleteIndex': {
    id: 'text-search.autocompleteIndex',
    povCapability: 'AUTO-COMPLETE',
    sourceProof: 'proofs/37/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'autocomplete-index.json',
        language: 'json',
        code: `{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "name_autocomplete": {
        "type": "autocomplete",
        "tokenization": "edgeGram",
        "minGrams": 2,
        "maxGrams": 15
      }
    }
  }
}`,
        tips: [
          'The autocomplete field type uses edge n-grams for prefix matching.',
          'minGrams and maxGrams control the token size for suggestions.',
        ],
      },
    ],
    tips: [
      'Use a dedicated autocomplete field so you can tune tokenization separately from full-text search.',
      'edgeGram tokenization is typical for typeahead (prefix) suggestions.',
    ],
  },

  'text-search.typeaheadQuery': {
    id: 'text-search.typeaheadQuery',
    povCapability: 'AUTO-COMPLETE',
    sourceProof: 'proofs/37/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'typeahead-query.js',
        language: 'javascript',
        code: `// Typeahead: suggest documents as user types (e.g. prefix "wire")
db.products.aggregate([
  {
    $search: {
      index: 'autocomplete',
      autocomplete: {
        query: 'wire',
        path: 'name_autocomplete'
      }
    }
  },
  { $project: { name: 1, _id: 1 } },
  { $limit: 10 }
]);`,
        tips: [
          'The autocomplete operator matches the query as a prefix against the autocomplete path.',
          'Return a small set (e.g. 10) of suggestions with a label and id for the UI.',
        ],
      },
    ],
    tips: [
      'Parameterize the query value from the user input (with debounce) in your app.',
      'Combine with full-text search: use autocomplete for suggestions, then run a full $search on selection.',
    ],
  },

  'text-search.typeaheadDesign': {
    id: 'text-search.typeaheadDesign',
    povCapability: 'AUTO-COMPLETE',
    sourceProof: 'proofs/37/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'suggest-api.example.json',
        language: 'json',
        code: `{
  "GET /api/search/suggest?q=wire": {
    "suggestions": [
      { "id": "prod1", "label": "Wireless Headphones" },
      { "id": "prod2", "label": "Wire Charger" }
    ]
  }
}`,
        tips: [
          'Expose a single suggest endpoint that runs the autocomplete aggregation.',
          'Debounce (e.g. 150–300 ms) and minimum length (e.g. 2 chars) improve UX.',
        ],
      },
    ],
    tips: [
      'Keep the response small: id and label per suggestion.',
      'Document fallback behavior when there are no suggestions or the service is slow.',
    ],
  },

  'text-search.facetedSearch': {
    id: 'text-search.facetedSearch',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'faceted-search.js',
        language: 'javascript',
        code: `// Text search with facet counts (e.g. by category)
db.products.aggregate([
  {
    $search: {
      index: 'default',
      text: { query: 'headphones', path: ['name', 'description'] }
    }
  },
  {
    $facet: {
      hits: [{ $limit: 20 }],
      categoryCounts: [
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]
    }
  }
]);`,
        tips: [
          'Use $facet to return both search hits and aggregate counts in one request.',
          'Facet counts help the UI show filters (e.g. category buckets) alongside results.',
        ],
      },
    ],
    tips: [
      'Identify 2–3 structured fields (category, price band) for filters.',
      'Return both hits and facet counts so the UI can render filters and result list together.',
    ],
  },

  'text-search.highlighting': {
    id: 'text-search.highlighting',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'highlight-query.js',
        language: 'javascript',
        code: `db.products.aggregate([
  {
    $search: {
      index: 'default',
      text: { query: 'wireless', path: ['name', 'description'] },
      highlight: {
        path: ['description'],
        maxNumPassages: 2
      }
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      highlights: { $meta: 'searchHighlights' }
    }
  },
  { $limit: 5 }
]);`,
        tips: [
          'searchHighlights in $meta contains snippets with matching terms marked.',
          'Use highlights in the UI to show why a document matched (increases trust).',
        ],
      },
    ],
    tips: [
      'Enable highlight in the $search stage and project $$SEARCH_META or searchHighlights.',
      'Display highlight snippets next to each result so users see why it matched.',
    ],
  },

  'text-search.relevanceTuning': {
    id: 'text-search.relevanceTuning',
    povCapability: 'TEXT-SEARCH',
    sourceProof: 'proofs/36/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'boost-query.js',
        language: 'javascript',
        code: `// Boost matches in 'name' higher than in 'description'
db.products.aggregate([
  {
    $search: {
      index: 'default',
      compound: {
        should: [
          { text: { query: 'wireless', path: 'name', score: { boost: { value: 2 } } } },
          { text: { query: 'wireless', path: 'description' } }
        ]
      }
    }
  },
  { $limit: 10 }
]);`,
        tips: [
          'Use compound.should with score.boost to emphasize certain fields.',
          'Compare result order before and after boosting to validate tuning.',
        ],
      },
    ],
    tips: [
      'Experiment with boost values (e.g. 2x for title over body) and capture defaults for your playbook.',
      'Relevance tuning is iterative; document the final index and query settings.',
    ],
  },
};
