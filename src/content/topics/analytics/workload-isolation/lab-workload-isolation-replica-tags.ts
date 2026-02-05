import { WorkshopLabDefinition } from '@/types';

/**
 * Workload Isolation: Replica Set Tags
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/05/README.md (WORKLOAD-ISOLATION)
 * Covers loading data, viewing replica set configuration, and verifying analytics node tags.
 */
export const labWorkloadIsolationReplicaTagsDefinition: WorkshopLabDefinition = {
  id: 'lab-workload-isolation-replica-tags',
  topicId: 'analytics',
  title: 'Workload Isolation: Replica Set Tags',
  description:
    'Configure your Atlas cluster with analytical nodes, load sample data, and verify the replica set topology with node tags using mongosh.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 50,
  tags: ['workload-isolation', 'replica-set', 'analytics-nodes', 'tags'],
  prerequisites: [
    'MongoDB Atlas M30+ cluster with 3 electable + 2 analytical nodes',
    'mgeneratejs and mongoimport installed',
    'mongosh or mongo shell',
  ],
  povCapabilities: ['WORKLOAD-ISOLATION'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/05',
  dataRequirements: [
    {
      id: 'customer-single-view',
      description: 'mgeneratejs template for 1M customer documents',
      type: 'file',
      path: 'CustomerSingleView.json',
      sizeHint: '2KB',
    },
    {
      id: 'print-repset-conf',
      description: 'Script to view replica set configuration',
      type: 'script',
      path: 'print_repset_conf.js',
      sizeHint: '2KB',
    },
    {
      id: 'customers-collection',
      description: 'Customer data (1M docs) loaded via mgeneratejs + mongoimport',
      type: 'collection',
      namespace: 'acme_inc.customers',
      sizeHint: '~500MB',
    },
  ],
  steps: [
    {
      id: 'lab-workload-isolation-replica-tags-step-1',
      title: 'Step 1: Load Sample Data into Atlas',
      narrative:
        'Generate and load 1 million customer documents using mgeneratejs and mongoimport. This dataset will be used for both the operational (update) and analytical (aggregation) workloads.',
      instructions:
        '- Install mgeneratejs: `npm install -g mgeneratejs`\n- From the proof folder, generate and import: `mgeneratejs CustomerSingleView.json -n 1000000 | mongoimport --uri "mongodb+srv://USER:PASS@cluster.mongodb.net/acme_inc" --collection customers`\n- Replace USER, PASS, and cluster address with your Atlas credentials\n- Verify: connect with mongosh and run `db.customers.countDocuments()` in acme_inc database\n- Note: Load may take up to an hour for 1M records',
      estimatedTimeMinutes: 25,
      modes: ['lab', 'challenge'],
      verificationId: 'workload-isolation.verifyDataLoad',
      points: 15,
      enhancementId: 'workload-isolation.data-load',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Setup - Load Data',
    },
    {
      id: 'lab-workload-isolation-replica-tags-step-2',
      title: 'Step 2: View Replica Set Configuration',
      narrative:
        'Use a mongosh script to print the replica set configuration and verify which nodes are tagged for analytics. This confirms your cluster has the correct topology for workload isolation.',
      instructions:
        '- Connect with mongosh: `mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net/test" --username USER`\n- Run the print_repset_conf.js script (or equivalent) to view rs.conf()\n- Inspect each member: host and tags (e.g., nodeType:ANALYTICS or nodeType:ELECTABLE)\n- Verify: 2 nodes should have nodeType:ANALYTICS, 3 should be electable',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'workload-isolation.verifyReplicaConfig',
      points: 15,
      enhancementId: 'workload-isolation.print-repset-conf',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Setup - View Replica Set Topology',
    },
    {
      id: 'lab-workload-isolation-replica-tags-step-3',
      title: 'Step 3: Inspect Tags in rs.conf()',
      narrative:
        'Understand the structure of rs.conf() and how tags are applied to replica set members. Tags are used by read preference to route queries to specific nodes.',
      instructions:
        '- In mongosh, run: `rs.conf()` to see the full configuration\n- For each member, check the `tags` object (e.g., `tags: { nodeType: "ANALYTICS" }`)\n- Electable nodes typically have `tags: { nodeType: "ELECTABLE" }` or similar\n- Analytics nodes have `tags: { nodeType: "ANALYTICS" }`\n- Document the hostnames of your analytics nodes for the next lab',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'workload-isolation.inspect-tags',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Setup - View Replica Set Topology',
    },
  ],
};
