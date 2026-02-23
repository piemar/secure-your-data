import { WorkshopLabDefinition } from '@/types';

/**
 * Portable Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/10/README.md (PORTABLE)
 * Environment setup: Atlas cluster in AWS (source), Atlas cluster in Azure (target),
 * mgeneratejs, IP whitelist, and connection strings.
 */
export const labPortableSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-portable-setup',
  topicId: 'deployment',
  title: 'Portable: Environment Setup',
  description:
    'Configure Atlas source cluster in AWS, Atlas target cluster in Azure, and the load generator (mgeneratejs) to prepare for cloud-to-cloud Live Migration.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['migration', 'atlas', 'aws', 'azure', 'live-migration', 'setup', 'multi-cloud'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
    'Node.js and npm installed',
  ],
  povCapabilities: ['PORTABLE'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/10',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-portable-setup-step-1',
      title: 'Step 1: Create Atlas Clusters in AWS and Azure',
      narrative:
        'Create two M30 3-node replica sets: one in an AWS region (source) and one in an Azure region (target). Use descriptive names like AWSTestCluster and AzureTestCluster. Note the CIDR blocks for Live Migration.',
      instructions:
        'Create M30 3-node replica set in AWS (e.g. us-east-1), name AWSTestCluster. Create M30 3-node replica set in Azure (e.g. eastus), name AzureTestCluster. Add user main_user with readWriteAnyDatabase and clusterMonitor. For AzureTestCluster: ... → Migrate Data to this Cluster → I\'m ready to migrate. Copy the two CIDR blocks. Add both CIDR blocks to project IP Whitelist.',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'portable.atlas-setup',
      sourceProof: 'proofs/10/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-portable-setup-step-2',
      title: 'Step 2: Record Connection Strings and Hostname',
      narrative:
        'The Live Migration tool cannot use the SRV connection string format. You must record the hostname of the first primary server in the source cluster (e.g. awstestcluster-shard-00-00-abcd.mongodb.net).',
      instructions:
        'For each cluster: Connect → Connect Your Application → copy Connection String. For AWSTestCluster only: Connect again, select the earliest Node.js version, and record the hostname of just the first primary (e.g. awstestcluster-shard-00-00-xxxx.mongodb.net) for the migration tool.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'portable.connection-strings',
      sourceProof: 'proofs/10/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-portable-setup-step-3',
      title: 'Step 3: Install mgeneratejs',
      narrative:
        'mgeneratejs generates templated JSON documents. Combined with mongoimport, it simulates an application writing insurance customer records. Install it globally on your laptop.',
      instructions:
        'Ensure MongoDB 3.6+ tools and Node.js 6+ are installed. Run: npm install -g mgeneratejs. Verify with: mgeneratejs --help. Download CustomerSingleView.json from proofs/10/ to your working directory.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'portable.mgeneratejs-setup',
      sourceProof: 'proofs/10/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
