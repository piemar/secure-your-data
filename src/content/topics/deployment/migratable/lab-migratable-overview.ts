import { WorkshopLabDefinition } from '@/types';

/**
 * Migratable Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/09/README.md (MIGRATABLE)
 * Introduces MongoDB's ability to migrate from on-prem to Atlas with minimal downtime
 * using Live Migration.
 */
export const labMigratableOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-migratable-overview',
  topicId: 'deployment',
  title: 'Migratable Overview',
  description:
    'Learn how MongoDB enables rapid migration from on-prem deployments to Atlas with less than 1 minute of scheduled application downtime using Live Migration.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['migration', 'live-migration', 'atlas', 'on-prem', 'cutover'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of replica sets and replication',
  ],
  povCapabilities: ['MIGRATABLE'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Live Migration', explanation: 'Migrate from on-prem or self-managed MongoDB to Atlas with minimal downtime.' },
    { term: 'Initial Sync', explanation: 'First full copy of data from source to Atlas; followed by oplog tailing.' },
    { term: 'Cutover', explanation: 'Stop writes on source, finalize sync, switch application to Atlas—typically under 1 minute.' },
    { term: 'Replica Set', explanation: 'Source must be a replica set; Live Migration uses the same replication protocol.' },
  ],
  steps: [
    {
      id: 'lab-migratable-overview-step-1',
      title: 'Step 1: Understand Live Migration Concepts',
      narrative:
        'MongoDB Live Migration allows you to migrate data from an on-prem or self-managed MongoDB cluster to Atlas with minimal downtime. The process performs an initial sync, then continuously tails the source oplog to keep the destination in sync until you perform a cutover.',
      instructions:
        '- Review the migration flow: source cluster → initial sync → continuous oplog tailing → cutover\n- Understand that Live Migration uses the same replication protocol as replica sets\n- Learn that the cutover is the only moment of application downtime\n- Identify the benefit: typically less than 1 minute of scheduled downtime',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'migratable.concepts',
      sourceProof: 'proofs/09/README.md',
      sourceSection: 'Description',
    },
    {
      id: 'lab-migratable-overview-step-2',
      title: 'Step 2: Cutover and Application Switchover',
      narrative:
        'During cutover, you stop writes to the source, let the migration tool catch up, then point your application to the Atlas cluster. The proof uses a stopwatch to measure the elapsed time—typically under 1 minute.',
      instructions:
        '- Stop the application (or load generator) writing to the source cluster\n- In Atlas Console: Start Cutover to finalize the migration\n- Update application connection string to point to Atlas\n- Restart the application writing to Atlas\n- Measure elapsed time: should be less than 1 minute\n- Verify: collection count continues increasing in Atlas',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'migratable.cutover',
      sourceProof: 'proofs/09/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-migratable-overview-step-3',
      title: 'Step 3: Migration Prerequisites and Network',
      narrative:
        'Live Migration requires network connectivity between the source cluster and Atlas. Atlas provides CIDR blocks that must be allowed in the source firewall. The source must be a replica set (or standalone initialized as replica set).',
      instructions:
        '- Source: Must be replica set (rs.initiate() for standalone)\n- Network: Atlas Live Migration tool needs inbound access to source on port 27017\n- CIDR blocks: Get from Atlas → Migrate Data to this Cluster → I\'m ready to migrate\n- Security group / firewall: Allow the two Atlas CIDR blocks + your VPC subnet\n- Authentication: Source can be unauthenticated; Atlas handles auth',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'migratable.prerequisites',
      sourceProof: 'proofs/09/README.md',
      sourceSection: 'Setup',
    },
  ],
};
