import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-3',
    title: 'The Aggregation Heist',
    codename: 'PIPELINE',
    tier: 'recon',
    description: 'Build a complex aggregation pipeline to extract critical intel from deeply nested documents.',
    briefing: `DECRYPTION COMPLETE\n\nWe've intercepted a data dump with 2 million nested documents. The intel is buried deep — nested arrays within arrays, polymorphic schemas, and no two documents are alike. Your mission: construct an aggregation pipeline using $unwind, $lookup, $facet, and $merge to extract the target data and prepare it for analysis.\n\nThe data self-destructs in 8 minutes.`,
    objectives: [
      { id: 'obj-3-1', text: 'Analyze the document schema structure', completed: false },
      { id: 'obj-3-2', text: 'Build the $unwind and $match stages', completed: false },
      { id: 'obj-3-3', text: 'Add $lookup for cross-collection joins', completed: false },
      { id: 'obj-3-4', text: 'Implement $facet for parallel aggregations', completed: false },
      { id: 'obj-3-5', text: 'Output results with $merge', completed: false },
    ],
    timeLimit: 480,
    xpReward: 750,
    difficulty: 3,
    topic: 'query',
    povCapabilities: ['IN-PLACE-ANALYTICS'],
    chaosEvents: [
      { id: 'chaos-3-1', title: '💾 MEMORY LIMIT HIT', description: 'Aggregation exceeding 100MB memory limit! Enable allowDiskUse or optimize.', triggerAt: 200, penalty: 100, duration: 45 },
    ],
  };
