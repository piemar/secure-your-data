import { WorkshopLabDefinition } from '@/types';

/**
 * AUTO-HA Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/17/README.md (AUTO-HA)
 * Configure Atlas cluster, user, IP whitelist, and local Python environment for the failover proof.
 */
export const labAutoHaSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-ha-setup',
  topicId: 'operations',
  title: 'AUTO-HA Setup',
  description:
    'Create an M10 replica set in Atlas, add a database user and IP whitelist, and prepare your laptop with Python and the connection string for the AUTO-HA proof.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 15,
  tags: ['operations', 'ha', 'atlas', 'replica-set', 'setup'],
  prerequisites: ['Lab: AUTO-HA Overview', 'MongoDB Atlas account'],
  povCapabilities: ['AUTO-HA'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/17',
  steps: [
    {
      id: 'lab-auto-ha-setup-step-1',
      title: 'Step 1: Create Atlas cluster and user',
      narrative:
        'In your Atlas project, create an M10-based 3-node replica set in a single region. Add a database user (e.g. main_user) with read and write to any database, and note the password.',
      instructions:
        '- Log in to cloud.mongodb.com and open your SA project\n- Create cluster: M10, 3 nodes, single region (default settings)\n- Security → Add Database User: main_user, Read and write to any database; save password',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-ha.atlas-cluster',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-ha-setup-step-2',
      title: 'Step 2: Get connection string',
      narrative:
        'Add an IP whitelist entry for your laptop, then use Connect → Connect your application → Python to copy the connection string (SRV URI). You will use this in the next lab with retryWrites and retryReads parameters.',
      instructions:
        '- Security → Network Access: Add IP Address (current laptop IP)\n- Cluster → Connect → Connect your application → Python → copy Connection string only\n- Save the SRV URI for use in the Execute lab',
      estimatedTimeMinutes: 4,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'auto-ha.connection-string',
      sourceProof: 'proofs/17/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-auto-ha-setup-step-3',
      title: 'Step 3: Configure Python environment',
      narrative:
        'Install Python 3 and the pymongo and dnspython libraries. Ensure you have the continuous-insert.py and continuous-read.py scripts from the proof (or equivalent) to run in the Execute lab.',
      instructions:
        '- Install Python 3 if needed\n- pip3 install pymongo dnspython\n- Obtain continuous-insert.py and continuous-read.py from proof 17 (Docs/pov-proof-exercises/proofs/17) or use the commands shown in the enhancement',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'auto-ha.python-env',
      sourceProof: 'proofs/17/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
