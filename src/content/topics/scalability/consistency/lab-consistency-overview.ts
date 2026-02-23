import { WorkshopLabDefinition } from '@/types';

/**
 * Consistency Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/06/README.md (CONSISTENCY)
 * Introduces MongoDB's ability to enforce strong consistency across a distributed
 * (sharded) database using write concern, read concern, and causal consistency.
 */
export const labConsistencyOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-consistency-overview',
  topicId: 'scalability',
  title: 'Strong Consistency Overview',
  description:
    'Learn how MongoDB enforces strong consistency across a sharded cluster so applications always see the most up-to-date data, even when reading from secondaries.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['consistency', 'sharding', 'read-concern', 'write-concern', 'causal-consistency'],
  prerequisites: [
    'MongoDB Atlas M30+ cluster (sharded or replica set)',
    'Basic understanding of replication and sharding',
  ],
  povCapabilities: ['CONSISTENCY'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Write Concern', explanation: 'w:"majority" ensures writes are acknowledged by a majority before returning.' },
    { term: 'Read Concern', explanation: 'readConcern:"majority" ensures reads only return majority-committed data.' },
    { term: 'Causal Consistency', explanation: 'Guarantees read-your-writes semantics across primary and secondaries.' },
    { term: 'Read Preference', explanation: 'secondaryPreferred routes reads to secondaries while maintaining consistency.' },
  ],
  steps: [
    {
      id: 'lab-consistency-overview-step-1',
      title: 'Step 1: Understand Strong Consistency Concepts',
      narrative:
        'In a distributed database, writes may replicate asynchronously to secondaries. Without proper settings, a read from a secondary could return stale data. MongoDB provides write concern, read concern, and causal consistency to guarantee applications see the most up-to-date data.',
      instructions:
        '- Review write concern: w:"majority" ensures writes are acknowledged by a majority of replica set members\n- Review read concern: readConcernLevel:"majority" ensures reads only return data committed to a majority\n- Understand causal consistency: guarantees read-your-writes semantics across primary and secondary\n- Identify the benefit: applications can safely read from secondaries and still see latest writes',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'consistency.concepts',
      sourceProof: 'proofs/06/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-consistency-overview-step-2',
      title: 'Step 2: Driver Settings for Strong Consistency',
      narrative:
        'To achieve strong consistency, configure the MongoDB driver with writeConcern:majority, readConcern:majority, readPreference:secondaryPreferred, retryableWrites:true, and causal consistency enabled.',
      instructions:
        '- writeConcern: w:"majority" - writes acknowledged by majority before returning\n- readConcernLevel: "majority" - reads only return majority-committed data\n- readPreference: "secondaryPreferred" - prefer secondaries for reads (load distribution)\n- retryableWrites: true - automatic retry on transient failures\n- causal_consistency: true - use sessions for read-your-writes guarantees',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'consistency.driver-settings',
      sourceProof: 'proofs/06/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Description',
    },
    {
      id: 'lab-consistency-overview-step-3',
      title: 'Step 3: Consistency Under Failover',
      narrative:
        'MongoDB maintains strong consistency even during replica set elections. When a failover occurs, the driver detects primary changes, retries operations, and the consistency guarantees hold once the new primary is elected.',
      instructions:
        '- Run a consistency verification script while inducing Atlas Test Failover\n- Observe: connection errors during failover are expected (reads/writes pause briefly)\n- Observe: after failover, the script continues and consistency is maintained\n- Result: no CONSISTENCY ERROR entries in the log when using proper settings',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'consistency.failover',
      sourceProof: 'proofs/06/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
  ],
};
