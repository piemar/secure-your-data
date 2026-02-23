import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Up: Environment Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/08/README.md (SCALE-UP)
 * Covers laptop setup, Atlas cluster configuration, and proof script deployment.
 */
export const labScaleUpSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-up-setup',
  topicId: 'scalability',
  title: 'Scale-Up: Environment Setup',
  description:
    'Configure your laptop with Python and Compass, create an M20 Atlas cluster, and deploy the scale-up proof scripts (params.py, monitor.py, insert_data.py).',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 20,
  tags: ['scale-up', 'atlas', 'setup', 'monitoring'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
    'Python 3',
  ],
  povCapabilities: ['SCALE-UP'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/08',
  dataRequirements: [
    {
      id: 'params-py',
      description: 'Connection string config (params.py)',
      type: 'file',
      path: 'params.py',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '1KB',
    },
    {
      id: 'monitor-py',
      description: 'Real-time node monitoring script',
      type: 'script',
      path: 'monitor.py',
      sizeHint: '3KB',
    },
    {
      id: 'insert-data-py',
      description: 'Continuous insert workload script',
      type: 'script',
      path: 'insert_data.py',
      sizeHint: '1KB',
    },
    {
      id: 'reset-data-py',
      description: 'Optional: clear records for fresh run',
      type: 'script',
      path: 'reset_data.py',
      sizeHint: '1KB',
    },
  ],
  steps: [
    {
      id: 'lab-scale-up-setup-step-1',
      title: 'Step 1: Configure Laptop',
      narrative:
        'Install Python 3 and required libraries (pymongo, asyncio, dnspython). Download and install MongoDB Compass for verifying records after the scale-up.',
      instructions:
        '- Ensure Python 3 is installed: `python3 --version`\n- Install libraries: `pip3 install pymongo asyncio dnspython`\n- Download and install MongoDB Compass from mongodb.com/download-center/compass\n- Compass will be used to verify no records were lost during scale-up',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'challenge'],
      points: 5,
      enhancementId: 'scale-up.laptop-setup',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Setup - Configure Laptop',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-scale-up-setup-step-2',
      title: 'Step 2: Configure Atlas Environment',
      narrative:
        'Create an M20 3-node replica set in Atlas, add main_user with Atlas admin role, and whitelist your laptop IP. Obtain the Application Short SRV connection string for the proof scripts.',
      instructions:
        '- Log into Atlas (cloud.mongodb.com), navigate to your SA project\n- Security → Database Access: add main_user, Built-in Role: Atlas admin (note password)\n- Create M20 3-node replica set in a single region (default settings)\n- Security → Network Access: add IP Access List entry for your laptop IP\n- Connect → Connect Your Application → Python → copy Connection String Only',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-up.atlas-config',
      sourceProof: 'proofs/08/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup - Configure Atlas Environment',
    },
    {
      id: 'lab-scale-up-setup-step-3',
      title: 'Step 3: Configure params.py and Start Monitor',
      narrative:
        'Set the connection string in params.py (replace <PASSWORD> with main_user password). Run monitor.py to watch node status, RAM, and record count in real time. Optionally run reset_data.py if reusing from a prior execution.',
      instructions:
        '- Clone or copy proof 08 scripts to your machine\n- Edit params.py: set conn_string to your Atlas SRV connection string\n- Replace <PASSWORD> in conn_string with main_user password\n- Run: `./monitor.py` (keep running for duration of proof)\n- If reusing: run `./reset_data.py` first to clear records collection',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'challenge'],
      points: 10,
      enhancementId: 'scale-up.params-config',
      sourceProof: 'proofs/08/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup - Start the Monitoring Script',
    },
  ],
};
