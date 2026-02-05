import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RPO Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/13/README.md (FULL-RECOVERY-RPO)
 * Introduces point-in-time recovery with zero data loss (RPO=0).
 */
export const labFullRecoveryRpoOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rpo-overview',
  topicId: 'operations',
  title: 'Full Recovery RPO Overview',
  description:
    'Learn how MongoDB Atlas Continuous Backup provides point-in-time recovery with zero data loss (RPO=0), restoring to the last known good state before corruption.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['operations', 'backup', 'recovery', 'rpo', 'point-in-time'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of backup concepts',
  ],
  povCapabilities: ['FULL-RECOVERY-RPO'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'RPO (Recovery Point Objective)', explanation: 'How much data you can afford to lose. RPO=0 means zero data loss.' },
    { term: 'Point-in-Time Recovery', explanation: 'Restore to any point in time before corruption or accidental deletion.' },
    { term: 'Continuous Backup', explanation: 'Atlas streams the oplog continuously to the backup service for real-time capture.' },
    { term: 'Oplog', explanation: "MongoDB's operation log records all write operations for replication and recovery." },
  ],
  steps: [
    {
      id: 'lab-full-recovery-rpo-overview-step-1',
      title: 'Step 1: Understand RPO and Point-in-Time Recovery',
      narrative:
        'RPO (Recovery Point Objective) measures how much data you can afford to lose. RPO=0 means zero data loss. Atlas Continuous Backup captures oplog continuously, enabling restore to any point in time.',
      instructions:
        '- RPO=0: recover to exact moment before incident\n- Continuous Backup: oplog streamed to Atlas backup service\n- Point-in-time restore: pick date and time, restore cluster to that state\n- Use case: accidental delete, corruption, ransomware',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'full-recovery-rpo.concepts',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Description',
    },
    {
      id: 'lab-full-recovery-rpo-overview-step-2',
      title: 'Step 2: Simulate Corruption and Restore',
      narrative:
        'The proof loads "good" documents (docType: BEFORE_CORRUPTION), notes the time, loads "bad" documents (docType: AFTER_CORRUPTION), then restores to the point before the bad data. Result: only good data remains.',
      instructions:
        '- Load 1000 good docs, note timestamp\n- Load 100 bad docs (simulated corruption)\n- Point-in-time restore to timestamp before bad load\n- Verify: 1000 docs, all BEFORE_CORRUPTION, none AFTER_CORRUPTION',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'full-recovery-rpo.flow',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rpo-overview-step-3',
      title: 'Step 3: Continuous Backup Requirements',
      narrative:
        'Continuous Backup must be enabled on the cluster. Atlas takes snapshots and continuously backs up the oplog. Without it, point-in-time restore is not available.',
      instructions:
        '- Create cluster with Continuous Backup enabled\n- Or: Cluster → Backup tab → enable if not already\n- Snapshots + oplog = point-in-time restore window\n- M10+ supports Continuous Backup',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'full-recovery-rpo.requirements',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Setup',
    },
  ],
};
