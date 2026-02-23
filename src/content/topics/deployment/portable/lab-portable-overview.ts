import { WorkshopLabDefinition } from '@/types';

/**
 * Portable Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/10/README.md (PORTABLE)
 * Introduces MongoDB's ability to migrate between public cloud providers (e.g. AWS → Azure)
 * with minimal downtime using Live Migration.
 */
export const labPortableOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-portable-overview',
  topicId: 'deployment',
  title: 'Portable Overview',
  description:
    'Learn how MongoDB enables rapid migration between public cloud providers (e.g. AWS to Azure) with less than 1 minute of scheduled application downtime, avoiding cloud vendor lock-in.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['migration', 'live-migration', 'atlas', 'multi-cloud', 'portable', 'cutover'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of replica sets and replication',
  ],
  povCapabilities: ['PORTABLE'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Live Migration', explanation: 'Atlas tool for migrating data between clusters; supports cloud-to-cloud (e.g. AWS → Azure).' },
    { term: 'Cutover', explanation: 'Final switch when writes stop on source and application points to target cluster.' },
    { term: 'Oplog Tailing', explanation: 'Continuous replication of source oplog to keep target in sync until cutover.' },
    { term: 'Vendor Lock-in', explanation: 'Avoiding dependence on a single cloud provider; MongoDB enables multi-cloud portability.' },
  ],
  steps: [
    {
      id: 'lab-portable-overview-step-1',
      title: 'Step 1: Understand Cloud-to-Cloud Migration',
      narrative:
        'MongoDB Atlas Live Migration supports migrating from one cloud provider to another—for example, from an Atlas cluster in AWS to an Atlas cluster in Azure. The same flow applies: initial sync, continuous oplog tailing, and cutover. This avoids cloud vendor lock-in.',
      instructions:
        '- Review the migration flow: source (Atlas in AWS) → target (Atlas in Azure)\n- Understand that both source and target are Atlas clusters in different clouds\n- Learn that Live Migration uses the same replication protocol\n- Identify the benefit: migrate between AWS, Azure, GCP with minimal downtime',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'portable.concepts',
      sourceProof: 'proofs/10/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-portable-overview-step-2',
      title: 'Step 2: Cutover and Application Switchover',
      narrative:
        'During cutover, you stop writes to the source cluster, let the migration tool catch up, then point your application to the target cluster in the new cloud. The proof uses a stopwatch to measure elapsed time—typically under 1 minute.',
      instructions:
        '- Stop the load generator (mgeneratejs + mongoimport) writing to source\n- In Atlas Console: Start Cutover on the target cluster\n- Update connection string to point to target cluster (e.g. Azure)\n- Restart load generator pointing to target\n- Measure elapsed time: should be less than 1 minute\n- Verify: collection count continues increasing in target',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'portable.cutover',
      sourceProof: 'proofs/10/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-portable-overview-step-3',
      title: 'Step 3: Prerequisites and CIDR Blocks',
      narrative:
        'Live Migration requires network connectivity. Atlas provides CIDR blocks that must be added to the IP whitelist. For cloud-to-cloud migration, both clusters are in Atlas—the CIDR blocks allow the migration tool to pull data from the source.',
      instructions:
        '- Source: Atlas cluster in one cloud (e.g. AWS)\n- Target: Atlas cluster in another cloud (e.g. Azure)\n- CIDR blocks: Get from target cluster → Migrate Data to this Cluster\n- IP Whitelist: Add the two CIDR blocks to the project\n- Hostname: Migration tool needs non-SRV hostname for source primary',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'portable.prerequisites',
      sourceProof: 'proofs/10/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
