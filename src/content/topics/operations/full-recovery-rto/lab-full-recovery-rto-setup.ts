import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RTO Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/14/README.md (FULL-RECOVERY-RTO)
 * Environment setup: mgeneratejs, M40 cluster, load 10 GB, enable backup.
 */
export const labFullRecoveryRtoSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rto-setup',
  topicId: 'operations',
  title: 'Full Recovery RTO: Environment Setup',
  description:
    'Configure mgeneratejs, create an M40 Atlas cluster, load 10 GB of data, and enable Continuous Backup with at least one snapshot.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 90,
  tags: ['operations', 'backup', 'rto', 'mgeneratejs', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
  ],
  povCapabilities: ['FULL-RECOVERY-RTO'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/14',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-full-recovery-rto-setup-step-1',
      title: 'Step 1: Install mgeneratejs',
      narrative:
        'mgeneratejs generates JSON documents from templates. The proof uses Customer360Data.json to create insurance customer records. Install globally for use with mongoimport.',
      instructions:
        'Install: npm install -g mgeneratejs. Verify: mgeneratejs --help. Copy Customer360Data.json from proofs/14/ to working directory.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rto.mgeneratejs',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-full-recovery-rto-setup-step-2',
      title: 'Step 2: Create M40 Atlas Cluster',
      narrative:
        'Create an M40 3-node replica set with 400 GB storage. Do NOT enable backup yet—we enable it after loading data so the snapshot contains our test data.',
      instructions:
        'Create M40 3-node replica set. Storage: 400 GB. Backup: OFF initially. Add user main_user with readWriteAnyDatabase. Add IP whitelist. Copy connection string.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'full-recovery-rto.atlas-setup',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-full-recovery-rto-setup-step-3',
      title: 'Step 3: Load 10 GB of Data',
      narrative:
        'Generate 8,370,000 documents with mgeneratejs and import into test.customers. This produces ~10 GB uncompressed. May take up to an hour.',
      instructions:
        'Run: mgeneratejs Customer360Data.json -n 8370000 | mongoimport --uri "..." --collection customers. Target: test.customers, ~10 GB. Wait for completion.',
      estimatedTimeMinutes: 60,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'full-recovery-rto.load-data',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-full-recovery-rto-setup-step-4',
      title: 'Step 4: Enable Backup and Wait for Snapshot',
      narrative:
        'Enable Continuous Backup on the cluster. Wait until at least one snapshot exists. This snapshot will be used for the restore in the execute phase.',
      instructions:
        'Cluster → Edit Configuration → Enable Backup (Continuous). Apply. Backup tab → View All Snapshots. Wait for at least 1 snapshot to complete.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rto.enable-backup',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Setup',
    },
  ],
};
