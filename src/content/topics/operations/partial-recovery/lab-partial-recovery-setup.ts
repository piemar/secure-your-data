import { WorkshopLabDefinition } from '@/types';

/**
 * Partial Recovery Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/15/README.md (PARTIAL-RECOVERY)
 * Configure laptop tools, create Main + Temp Atlas clusters, load 100 customers, run continuous insert, take snapshot.
 */
export const labPartialRecoverySetupDefinition: WorkshopLabDefinition = {
  id: 'lab-partial-recovery-setup',
  topicId: 'operations',
  title: 'Partial Recovery: Environment Setup',
  description:
    'Install mgeneratejs and Python/pymongo, create Main and Temp M10 clusters in Atlas, load 100 customer documents, start the continuous-insert script, and take a snapshot for PITR.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['operations', 'backup', 'partial-recovery', 'setup', 'mgeneratejs', 'atlas'],
  prerequisites: ['MongoDB Atlas account with SA credits'],
  povCapabilities: ['PARTIAL-RECOVERY'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/15',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-partial-recovery-setup-step-1',
      title: 'Step 1: Configure Laptop (mgeneratejs, Python, pymongo)',
      narrative:
        'You need MongoDB shell tools (3.6+), mgeneratejs for generating sample customer data, and Python 3 with pymongo to run the continuous-insert script.',
      instructions:
        'Install: npm install -g mgeneratejs. Verify: mgeneratejs --help. Ensure Python 3: python3 --version. Install driver: pip3 install pymongo. No MongoDB server runs on the laptop—only tools and scripts.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'partial-recovery.tools',
      sourceProof: 'proofs/15/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-partial-recovery-setup-step-2',
      title: 'Step 2: Create Main and Temp Clusters in Atlas',
      narrative:
        'Create two M10 replica sets: Main with Continuous Cloud Backup on (100GB), Temp with Cloud Backup off (100GB). Same project, cloud provider, and region. Add main_user and IP whitelist.',
      instructions:
        'Main cluster: M10, 3-node, 100GB, Turn on Cloud Backup, Continuous Cloud Backup on. Temp cluster: M10, 3-node, 100GB, Cloud Backup off. Same project and region. Security: add user main_user (readWriteAnyDatabase), add IP whitelist. Copy SRV connection strings for both.',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'partial-recovery.atlas-clusters',
      sourceProof: 'proofs/15/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-partial-recovery-setup-step-3',
      title: 'Step 3: Load 100 Customers, Start Continuous Insert, Take Snapshot',
      narrative:
        'Load 100 customer records into test.customers using mgeneratejs and Customer360Data.json. Start continuous-insert.py against the main cluster and leave it running. Ensure at least one snapshot exists for PITR.',
      instructions:
        'Load: mgeneratejs Customer360Data.json -n 100 | mongoimport --uri "<main-srv>" --collection customers (db test). Run: ./continuous-insert.py main_user <password> <main-host>. Leave script running. In Atlas Backup for Main cluster: Take snapshot now; wait until snapshot is available.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'partial-recovery.load-and-snapshot',
      sourceProof: 'proofs/15/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
