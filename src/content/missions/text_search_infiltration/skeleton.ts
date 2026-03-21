import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Text Search Infiltration
// Build Atlas Search indexes and queries

// Step 1: Define the search index (Atlas UI or API)
/*
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": { "type": "___BLANK___" },
      "content": { "type": "string", "analyzer": "___BLANK___" },
      "tags": { "type": "___BLANK___" }
    }
  }
}
*/

// Step 2: Fuzzy search query
db.documents.aggregate([
  { $search: {
    "text": {
      "query": "___BLANK___",
      "path": "___BLANK___",
      "fuzzy": { "maxEdits": ___BLANK___ }
    }
  }},
  { $limit: 10 }
]);

// Step 3: Autocomplete
db.documents.aggregate([
  { $search: {
    "autocomplete": {
      "query": "___BLANK___",
      "path": "title"
    }
  }},
  { $limit: 5 },
  { $project: { title: 1, score: { $meta: "searchScore" } } }
]);

// Step 4: Faceted search
db.documents.aggregate([
  { $searchMeta: {
    "facet": {
      "operator": { "text": { "query": "intelligence", "path": "content" } },
      "facets": {
        "___BLANK___": { "type": "string", "path": "___BLANK___" }
      }
    }
  }}
]);
`,
    challenge: `// MISSION: Text Search Infiltration
// Build Atlas Search: index definition, fuzzy search, autocomplete, facets

// Define a search index mapping for title, content, tags
// YOUR CODE HERE (as a JSON comment)

// Fuzzy text search on the content field
// YOUR CODE HERE

// Autocomplete on the title field
// YOUR CODE HERE

// Faceted search with $searchMeta
// YOUR CODE HERE
`,
    expert: `// MISSION: Text Search Infiltration
// Implement Atlas Search: define index mappings, build fuzzy text queries,
// autocomplete, and faceted search with $searchMeta.
`,
    hints: {
      guided: [
        { line: 10, blankText: '___BLANK___', hint: 'Atlas Search type for searchable text', answer: 'string', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Standard analyzer: "lucene.standard"', answer: 'lucene.standard', xpPenalty: 25 },
        { line: 12, blankText: '___BLANK___', hint: 'Type for array of strings', answer: 'string', xpPenalty: 15 },
        { line: 22, blankText: '___BLANK___', hint: 'Search term — e.g. "intelligense" (misspelled on purpose)', answer: 'intelligense', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'Which field to search in', answer: 'content', xpPenalty: 15 },
        { line: 24, blankText: '___BLANK___', hint: 'Max edit distance for fuzzy (1 or 2)', answer: '2', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Partial text to autocomplete — e.g. "intel"', answer: 'intel', xpPenalty: 15 },
        { line: 46, blankText: '___BLANK___', hint: 'Facet name — e.g. "byTag"', answer: 'byTag', xpPenalty: 20 },
        { line: 46, blankText: '___BLANK___', hint: 'Path to facet on — "tags"', answer: 'tags', xpPenalty: 20 },
      ],
      challenge: [],
    },
  };
