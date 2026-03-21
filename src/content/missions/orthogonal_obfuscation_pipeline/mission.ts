import { Mission } from '@/lib/types';

export const mission: Mission = {
  id: 'mission-22',
  title: 'Orthogonal Obfuscation Pipeline',
  codename: 'MATRIXMASK',
  tier: 'exfiltration',
  description: 'Implement the embedding -> orthogonal transform -> storage pipeline while preserving similarity behavior.',
  briefing: `HIDE THE VECTORS, KEEP THE SIGNAL

You now have encrypted key material. Next, wire the vector obfuscation pipeline itself: generate embeddings, apply the orthogonal matrix transformation, and store only obfuscated vectors.

The retrieval quality must survive the transformation. Distances should remain meaningful.`,
  objectives: [
    { id: 'obj-22-1', text: 'Generate embeddings from transaction descriptions', completed: false },
    { id: 'obj-22-2', text: 'Apply orthogonal matrix multiplication to produce obfuscated vectors', completed: false },
    { id: 'obj-22-3', text: 'Persist only obfuscated vectors with metadata fields', completed: false },
    { id: 'obj-22-4', text: 'Record pipeline telemetry (latency + dimensions) for diagnostics', completed: false },
  ],
  timeLimit: 660,
  xpReward: 900,
  difficulty: 4,
  topic: 'analytics',
  povCapabilities: ['RETRIEVAL-AUGMENTED-GENERATION', 'IN-PLACE-ANALYTICS'],
  chaosEvents: [
    {
      id: 'chaos-22-1',
      title: '📉 DIMENSION MISMATCH',
      description: 'Embedding and matrix dimensions diverged. Add validation before persistence.',
      triggerAt: 300,
      penalty: 130,
      duration: 60,
    },
  ],
};
