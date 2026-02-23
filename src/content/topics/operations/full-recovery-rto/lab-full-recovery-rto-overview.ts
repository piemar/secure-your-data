import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RTO Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/14/README.md (FULL-RECOVERY-RTO)
 * Introduces Restore Time Objective (RTO) - ability to recover within X minutes for Y GB.
 */
export const labFullRecoveryRtoOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rto-overview',
  topicId: 'operations',
  title: 'Full Recovery RTO Overview',
  description:
    'Learn how MongoDB Atlas Backup enables full database restore within a predictable time window (RTO), recovering from complete data loss to a live cluster.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['operations', 'backup', 'recovery', 'rto', 'disaster-recovery'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of backup and disaster recovery',
  ],
  povCapabilities: ['FULL-RECOVERY-RTO'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'RTO (Restore Time Objective)', explanation: 'Time from disaster detection to data fully restored and available.' },
    { term: 'Full Restore', explanation: 'Snapshot replaces cluster data completely; used for disaster recovery.' },
    { term: 'Snapshot', explanation: 'Point-in-time copy of database state stored by Atlas Backup.' },
    { term: 'Atlas Backup', explanation: 'Continuous Backup service that captures snapshots and oplog for Atlas clusters.' },
  ],
  steps: [
    {
      id: 'lab-full-recovery-rto-overview-step-1',
      title: 'Step 1: Understand RTO and Full Restore',
      narrative:
        'RTO (Restore Time Objective) measures how quickly you can recover from a disaster. Atlas Backup enables full restore of a lost or corrupted database back into a live cluster. RTO depends on data size and cluster tier.',
      instructions:
        '- RTO: time from disaster detection to data restored\n- Full restore: snapshot → cluster (replaces data)\n- Atlas tier and data size affect restore time\n- Use case: accidental delete, corruption, ransomware, region failure',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'full-recovery-rto.concepts',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-full-recovery-rto-overview-step-2',
      title: 'Step 2: Simulate Disaster and Measure Restore',
      narrative:
        'The proof loads 10 GB of data, enables backup, deletes all data to simulate disaster, then restores from snapshot. The elapsed time (stopwatch) is the RTO achieved—approximately 5 minutes for 10 GB on M40.',
      instructions:
        '- Load 10 GB (8.37M docs) into test.customers\n- Enable Continuous Backup, wait for snapshot\n- Delete database (simulate disaster)\n- Restore from snapshot to same cluster\n- Measure time: RTO achieved',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'full-recovery-rto.flow',
      sourceProof: 'proofs/14/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rto-overview-step-3',
      title: 'Step 3: RTO by Tier and Data Size',
      narrative:
        'Restore time varies by Atlas tier and data volume. The proof includes a reference table: M30/17GB ~16 min, M40/34GB ~22 min, M40_NVMe/150GB ~165 min. For this proof: M40, 10 GB, ~5 min.',
      instructions:
        '- Backup must be enabled before disaster\n- Restore replaces cluster data\n- Choose cluster tier based on RTO target\n- DirectAttach (same project/region) speeds restore',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'full-recovery-rto.requirements',
      sourceProof: 'proofs/14/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
