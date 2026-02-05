import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RPO Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/13/README.md (FULL-RECOVERY-RPO)
 * Load good data, corrupt, perform point-in-time restore, verify.
 */
export const labFullRecoveryRpoExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rpo-execute',
  topicId: 'operations',
  title: 'Full Recovery RPO: Execute Restore and Verify',
  description:
    'Load good documents, note the time, load corrupt documents, perform point-in-time restore to before corruption, and verify zero data loss.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['operations', 'backup', 'recovery', 'rpo', 'point-in-time'],
  prerequisites: [
    'lab-full-recovery-rpo-setup completed',
    'mgenerateBefore.json, mgenerateAfter.json in working directory',
  ],
  povCapabilities: ['FULL-RECOVERY-RPO'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/13',
  dataRequirements: [
    { id: 'mgenerate-before', type: 'file', path: 'mgenerateBefore.json', description: 'Template for good docs', sizeHint: '~1KB' },
    { id: 'mgenerate-after', type: 'file', path: 'mgenerateAfter.json', description: 'Template for corrupt docs', sizeHint: '~1KB' },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-full-recovery-rpo-execute-step-1',
      title: 'Step 1: Load Good Documents and Note Time',
      narrative:
        'Load 1000 documents with docType BEFORE_CORRUPTION. Record the exact time (date command). This timestamp is the restore target.',
      instructions:
        'Run: date; mgeneratejs mgenerateBefore.json -n 1000 | mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/test" --collection RPO; date. Record the time between the two date outputs (or use first date as "before" timestamp).',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'full-recovery-rpo.load-good',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rpo-execute-step-2',
      title: 'Step 2: Corrupt the Collection',
      narrative:
        'Load 100 documents with docType AFTER_CORRUPTION. This simulates a program error or corruption. The collection now has 1100 docs, 100 of which are "bad".',
      instructions:
        'Run: mgeneratejs mgenerateAfter.json -n 100 | mongoimport --uri "..." --collection RPO. Verify in Compass: 1100 docs, 100 with docType AFTER_CORRUPTION.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rpo.corrupt',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rpo-execute-step-3',
      title: 'Step 3: Point-in-Time Restore and Verify',
      narrative:
        'In Atlas Backup tab, select Point in Time Restore. Enter the date and time from step 1 (before corrupt load). Restore to current cluster. After restore: 1000 docs, all BEFORE_CORRUPTION, none AFTER_CORRUPTION.',
      instructions:
        'Backup tab → Point in Time Restore. Date: today. Time: from step 1 (before corrupt load). Next → Select current cluster. Restore. When complete: Compass or Atlas Data Explorer. Verify: count 1000, all docType BEFORE_CORRUPTION, zero AFTER_CORRUPTION.',
      estimatedTimeMinutes: 25,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'full-recovery-rpo.restore',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Execution',
    },
  ],
};
