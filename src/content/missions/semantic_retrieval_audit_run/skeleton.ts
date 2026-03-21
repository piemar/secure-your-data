import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
  guided: `// MISSION: Semantic Retrieval & Audit Run
// Goal: secure semantic search on obfuscated vectors with end-to-end audit logs

// Step 1: Embed + obfuscate query
const queryText = "coffee payment";
const queryVector = await ollama.embed({
  model: "voyage-4-nano",
  input: [queryText]
});
const obfuscatedQuery = multiplyVectorByMatrix(queryVector[0], ___BLANK___);

// Step 2: Candidate scoring (cosine similarity)
const candidates = db.transactions.find({}).toArray().map((doc) => ({
  merchant: doc.merchant,
  score: cosineSimilarity(obfuscatedQuery, doc.___BLANK___),
  description: doc.description
}));

// Step 3: Threshold + top-N selection
const threshold = ___BLANK___;
const matches = candidates
  .filter((c) => c.score >= threshold)
  .sort((a, b) => b.score - a.score)
  .slice(0, ___BLANK___);

// Step 4: Audit each match
matches.forEach((match) => {
  db.audit_logs.insertOne({
    eventType: "___BLANK___",
    merchant: match.merchant,
    relevancyScore: match.score,
    latencyMs: 12
  });
});
`,
  challenge: `// MISSION: Semantic Retrieval & Audit Run
// Build semantic retrieval over obfuscated vectors with threshold filtering and audit logging.
`,
  expert: `// MISSION: Semantic Retrieval & Audit Run
// Implement full vector retrieval flow: embed/obfuscate query, rank, threshold, top-k, and audit score traces.
`,
  hints: {
    guided: [
      { line: 11, blankText: '___BLANK___', hint: 'Use the same orthogonal matrix used at write time', answer: 'loadOrthogonalMatrix()', xpPenalty: 20 },
      { line: 16, blankText: '___BLANK___', hint: 'Compare query against stored obfuscated vectors', answer: 'obfuscated_vector', xpPenalty: 20 },
      { line: 21, blankText: '___BLANK___', hint: 'README defaults to 0.7 as a similarity threshold', answer: '0.7', xpPenalty: 15 },
      { line: 25, blankText: '___BLANK___', hint: 'Return top five results', answer: '5', xpPenalty: 15 },
      { line: 30, blankText: '___BLANK___', hint: 'Audit event name from reference implementation', answer: 'VECTOR_SEARCH_MATCH', xpPenalty: 20 },
    ],
    challenge: [
      { line: 2, blankText: '', hint: 'Flow: obfuscate query -> cosine similarity -> threshold -> top-k -> audit logs', answer: '', xpPenalty: 30 },
      { line: 2, blankText: '', hint: 'Include `relevancyScore` and `latencyMs` in audit records', answer: '', xpPenalty: 25 },
    ],
  },
};
