import { Mission } from '@/lib/types';

export const mission: Mission = {
  id: 'mission-23',
  title: 'Semantic Retrieval & Audit Run',
  codename: 'SCORETRACE',
  tier: 'exfiltration',
  description: 'Execute obfuscated-vector semantic search, threshold filtering, and full audit logging with relevancy scores.',
  briefing: `SEARCH WITHOUT LEAKING INTENT

The final stage is operational search. You will embed a query, obfuscate it with the same matrix, run cosine similarity against stored obfuscated vectors, apply threshold filtering, and return top matches.

Every query must leave an audit trail with relevancy score and latency.`,
  objectives: [
    { id: 'obj-23-1', text: 'Embed and obfuscate the incoming search query', completed: false },
    { id: 'obj-23-2', text: 'Compute cosine similarity against stored obfuscated vectors', completed: false },
    { id: 'obj-23-3', text: 'Filter by threshold and return top-N ranked matches', completed: false },
    { id: 'obj-23-4', text: 'Persist VECTOR_SEARCH_MATCH audit entries with score and latency', completed: false },
  ],
  timeLimit: 720,
  xpReward: 950,
  difficulty: 4,
  topic: 'query',
  povCapabilities: ['RETRIEVAL-AUGMENTED-GENERATION', 'RICH-QUERY'],
  chaosEvents: [
    {
      id: 'chaos-23-1',
      title: '📡 NOISY CANDIDATES',
      description: 'Candidate pool exploded. Tighten threshold and preserve top-k ranking.',
      triggerAt: 340,
      penalty: 140,
      duration: 60,
    },
  ],
};
