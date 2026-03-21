import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Vector Heist
// Build Atlas Vector Search for semantic document retrieval

// Step 1: Define vector search index (Atlas UI/API)
/*
{
  "fields": [{
    "type": "vector",
    "path": "___BLANK___",
    "numDimensions": ___BLANK___,
    "similarity": "___BLANK___"
  }]
}
*/

// Step 2: Generate and store embeddings
// (Assume getEmbedding() returns a vector array)
const docs = [
  { title: "MongoDB Sharding", content: "...", embedding: await getEmbedding("MongoDB Sharding") },
  { title: "___BLANK___", content: "...", embedding: await getEmbedding("___BLANK___") }
];
db.documents.insertMany(docs);

// Step 3: Perform $vectorSearch
db.documents.aggregate([
  { $vectorSearch: {
    index: "___BLANK___",
    path: "___BLANK___",
    queryVector: await getEmbedding("how to scale a database"),
    numCandidates: ___BLANK___,
    limit: ___BLANK___
  }},
  { $project: { title: 1, score: { $meta: "___BLANK___" } } }
]);

// Step 4: Vector search with pre-filter
db.documents.aggregate([
  { $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector: await getEmbedding("encryption best practices"),
    numCandidates: 100,
    limit: 5,
    filter: { "category": "___BLANK___" }
  }}
]);
`,
    challenge: `// MISSION: Vector Heist
// Implement semantic search with Atlas Vector Search

// Define a vector search index definition (as JSON comment)
// YOUR CODE HERE

// Insert documents with embedding vectors
// YOUR CODE HERE

// Perform a $vectorSearch query with numCandidates and limit
// YOUR CODE HERE

// Add a pre-filter to vector search to narrow results by category
// YOUR CODE HERE
`,
    expert: `// MISSION: Vector Heist
// Implement Atlas Vector Search: define index, store embeddings,
// run $vectorSearch queries, and combine with pre-filters.
`,
    hints: {
      guided: [
        { line: 9, blankText: '___BLANK___', hint: 'Path to the vector field in documents', answer: 'embedding', xpPenalty: 20 },
        { line: 10, blankText: '___BLANK___', hint: 'Number of dimensions (common: 768, 1536)', answer: '1536', xpPenalty: 25 },
        { line: 11, blankText: '___BLANK___', hint: 'Similarity function: "cosine", "euclidean", or "dotProduct"', answer: 'cosine', xpPenalty: 25 },
        { line: 18, blankText: '___BLANK___', hint: 'A document title — any topic', answer: 'ACID Transactions', xpPenalty: 15 },
        { line: 25, blankText: '___BLANK___', hint: 'Name of your search index', answer: 'vector_index', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Path to embedding field', answer: 'embedding', xpPenalty: 15 },
        { line: 28, blankText: '___BLANK___', hint: 'How many candidates to consider (50-200)', answer: '100', xpPenalty: 20 },
        { line: 29, blankText: '___BLANK___', hint: 'Max results to return (5-10)', answer: '5', xpPenalty: 15 },
        { line: 31, blankText: '___BLANK___', hint: 'Score metadata field name', answer: 'vectorSearchScore', xpPenalty: 25 },
        { line: 41, blankText: '___BLANK___', hint: 'Category to filter on — e.g. "security"', answer: 'security', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'Index needs: type "vector", path to embedding field, numDimensions, similarity', answer: '', xpPenalty: 35 },
        { line: 10, blankText: '', hint: '$vectorSearch: { index, path, queryVector, numCandidates, limit }', answer: '', xpPenalty: 35 },
      ],
    },
  };
