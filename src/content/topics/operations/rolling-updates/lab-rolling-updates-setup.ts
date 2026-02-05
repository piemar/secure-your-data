import { WorkshopLabDefinition } from '@/types';

/**
 * Rolling Updates Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/12/README.md (ROLLING-UPDATES)
 * Environment setup: Python, srvlookup, dnspython, Atlas cluster, read.py, write.py.
 */
export const labRollingUpdatesSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-rolling-updates-setup',
  topicId: 'operations',
  title: 'Rolling Updates: Environment Setup',
  description:
    'Configure Python, install required libraries, create an Atlas cluster on an older MongoDB version, and prepare the read/write verification scripts.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 25,
  tags: ['operations', 'rolling-updates', 'python', 'atlas', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
  ],
  povCapabilities: ['ROLLING-UPDATES'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/12',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-rolling-updates-setup-step-1',
      title: 'Step 1: Install Python and Libraries',
      narrative:
        'The proof uses read.py and write.py which require srvlookup and dnspython for SRV connection string resolution, plus pymongo for MongoDB connectivity.',
      instructions:
        'Install Python 3. Install: pip3 install srvlookup dnspython pymongo. Verify: python3 -c "import srvlookup, dns.resolver, pymongo; print(\"OK\")".',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'rolling-updates.python-setup',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-rolling-updates-setup-step-2',
      title: 'Step 2: Create Atlas Cluster on Older Version',
      narrative:
        'Create an M10 3-node replica set. Specify an older MongoDB version (e.g. 4.4) so there is a version to upgrade to. Add user main_user and whitelist your laptop IP.',
      instructions:
        'Create M10 3-node replica set. Set MongoDB version to 4.4 (or one version behind current). Add user main_user with readWriteAnyDatabase. Add IP whitelist for your laptop. Copy connection string.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'rolling-updates.atlas-setup',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-rolling-updates-setup-step-3',
      title: 'Step 3: Download read.py and write.py',
      narrative:
        'Copy the read.py and write.py scripts from proofs/12/ to your working directory. Make them executable. The scripts use change streams for verification.',
      instructions:
        'Copy read.py and write.py from Docs/pov-proof-exercises/proofs/12/. chmod +x read.py write.py. Verify: ./read.py -h and ./write.py -h.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'rolling-updates.scripts',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Setup',
    },
  ],
};
