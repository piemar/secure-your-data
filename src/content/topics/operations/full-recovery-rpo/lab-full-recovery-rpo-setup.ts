import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RPO Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/13/README.md (FULL-RECOVERY-RPO)
 * Environment setup: mgeneratejs, Atlas cluster with Continuous Backup, templates.
 */
export const labFullRecoveryRpoSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rpo-setup',
  topicId: 'operations',
  title: 'Full Recovery RPO: Environment Setup',
  description:
    'Configure mgeneratejs, create an Atlas cluster with Continuous Backup enabled, and prepare the mgenerateBefore.json and mgenerateAfter.json templates.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 25,
  tags: ['operations', 'backup', 'rpo', 'mgeneratejs', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
  ],
  povCapabilities: ['FULL-RECOVERY-RPO'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/13',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-full-recovery-rpo-setup-step-1',
      title: 'Step 1: Install mgeneratejs',
      narrative:
        'mgeneratejs generates JSON documents from templates. The proof uses mgenerateBefore.json (docType: BEFORE_CORRUPTION) and mgenerateAfter.json (docType: AFTER_CORRUPTION).',
      instructions:
        'Install: npm install -g mgeneratejs. Verify: mgeneratejs --help. Copy mgenerateBefore.json and mgenerateAfter.json from proofs/13/ to working directory.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rpo.mgeneratejs',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-full-recovery-rpo-setup-step-2',
      title: 'Step 2: Create Atlas Cluster with Continuous Backup',
      narrative:
        'Create an M10 3-node replica set. Ensure Continuous Backup is enabled—this is required for point-in-time restore. Add user and IP whitelist.',
      instructions:
        'Create M10 3-node replica set. Enable Continuous Backup (default on M10+). Add user main_user with readWriteAnyDatabase. Add IP whitelist. Copy connection string.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'full-recovery-rpo.atlas-setup',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-full-recovery-rpo-setup-step-3',
      title: 'Step 3: Verify Backup Tab and Snapshots',
      narrative:
        'Navigate to the Backup tab. If no snapshots exist, take one manually. Point-in-time restore requires at least one snapshot plus continuous oplog.',
      instructions:
        'Cluster → Metrics → Backup tab. Review snapshots. If none: Take Snapshot Now, description "Good Snapshot", wait for completion. Note: snapshots are automatic; manual snapshot optional for demo.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rpo.snapshots',
      sourceProof: 'proofs/13/README.md',
      sourceSection: 'Execution',
    },
  ],
};
