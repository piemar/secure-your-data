import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-19',
    title: 'Vector Heist',
    codename: 'VECTOROPS',
    tier: 'exfiltration',
    description: 'Build Atlas Vector Search indexes, generate embeddings, and perform semantic search with $vectorSearch.',
    briefing: `SEMANTIC INTELLIGENCE\n\nKeyword search is failing. The intelligence documents use synonyms, jargon, and encoded language that defeats traditional text matching. Your mission: create a vector search index, generate embeddings for documents, then use $vectorSearch to find semantically similar documents regardless of exact wording.\n\nThe meaning is hidden. Find it.`,
    objectives: [
      { id: 'obj-19-1', text: 'Create a vector search index with dimensions and similarity', completed: false },
      { id: 'obj-19-2', text: 'Generate and store document embeddings', completed: false },
      { id: 'obj-19-3', text: 'Perform $vectorSearch query with numCandidates', completed: false },
      { id: 'obj-19-4', text: 'Combine vector search with pre-filter', completed: false },
    ],
    timeLimit: 720,
    xpReward: 1000,
    difficulty: 4,
    topic: 'query',
    povCapabilities: ['RETRIEVAL-AUGMENTED-GENERATION'],
    chaosEvents: [
      { id: 'chaos-19-1', title: '🧠 EMBEDDING DRIFT', description: 'Model embeddings have shifted! Similarity scores may be unreliable.', triggerAt: 300, penalty: 150, duration: 60 },
    ],
  };
