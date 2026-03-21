import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
  {
    objectiveId: 'obj-23-1',
    rules: [
      { pattern: /(embed|queryVector|queryText)/, description: 'Embed incoming query text', required: true },
      { pattern: /(obfuscat|multiplyVectorByMatrix)/, description: 'Obfuscate the query vector', required: true },
    ],
  },
  {
    objectiveId: 'obj-23-2',
    rules: [
      { pattern: /cosineSimilarity/, description: 'Compute cosine similarity', required: true },
      { pattern: /obfuscated_vector/, description: 'Score against stored obfuscated vectors', required: true },
    ],
  },
  {
    objectiveId: 'obj-23-3',
    rules: [
      { pattern: /threshold/, description: 'Use configurable threshold filtering', required: true },
      { pattern: /(sort|slice|top|limit)/, description: 'Return top-ranked candidates', required: true },
    ],
  },
  {
    objectiveId: 'obj-23-4',
    rules: [
      { pattern: /audit_logs/, description: 'Write search audit events', required: true },
      { pattern: /(VECTOR_SEARCH_MATCH|relevancyScore|latencyMs)/, description: 'Persist score + latency for observability', required: true },
    ],
  },
];
