import { WorkshopLabDefinition } from '@/types';

/**
 * Portable Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/10/README.md (PORTABLE)
 * Execute cloud-to-cloud Live Migration: load data, initiate migration, cutover, verify.
 */
export const labPortableExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-portable-execute',
  topicId: 'deployment',
  title: 'Portable: Execute Migration and Cutover',
  description:
    'Run the Live Migration from Atlas (AWS) to Atlas (Azure), perform cutover with minimal downtime, and verify data continuity.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['migration', 'live-migration', 'cutover', 'mgeneratejs', 'aws', 'azure'],
  prerequisites: [
    'lab-portable-setup completed (AWSTestCluster, AzureTestCluster, mgeneratejs)',
    'CustomerSingleView.json in working directory',
  ],
  povCapabilities: ['PORTABLE'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/10',
  dataRequirements: [
    {
      id: 'test-customers',
      description: 'test.customers collection (insurance customer records)',
      type: 'collection',
      namespace: 'test.customers',
      sizeHint: '~200k documents after initial load',
    },
    {
      id: 'customer-single-view',
      description: 'CustomerSingleView.json template for mgeneratejs',
      type: 'file',
      path: 'CustomerSingleView.json',
      sizeHint: '~2KB',
    },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-portable-execute-step-1',
      title: 'Step 1: Load Initial Data and Start Live Migration',
      narrative:
        'Generate 200k insurance customer records into the source (AWS) cluster using mgeneratejs and mongoimport. Then initiate Live Migration from the Azure target cluster. The migration performs initial sync, then continuously tails the oplog.',
      instructions:
        'Run: mgeneratejs CustomerSingleView.json -n 200000 | mongoimport --uri "mongodb+srv://main_user:PASSWORD@awstestcluster-xxxx.mongodb.net/test" --collection customers. Wait ~10 min. In Atlas: AzureTestCluster → Migrate Data to this Cluster. Hostname: primary hostname (non-SRV). Username: main_user, Password, SSL: YES. Validate, Start Migration. In Metrics | Collections, verify both clusters show data. Restart load: mgeneratejs CustomerSingleView.json -n 200000 | mongoimport ... (same command). Wait for replication lag near zero.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'portable.initiate',
      sourceProof: 'proofs/10/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-portable-execute-step-2',
      title: 'Step 2: Perform Cutover',
      narrative:
        'Stop the mgeneratejs process, start the stopwatch, trigger Start Cutover in Atlas, update the mongoimport URI to point to AzureTestCluster, restart the load, stop the stopwatch. Elapsed time should be less than 1 minute.',
      instructions:
        'STOP mgeneratejs (Ctrl+C). START STOPWATCH. In Atlas: AzureTestCluster → Start Cutover. Update URI to: mongodb+srv://main_user:PASSWORD@azuretestcluster-xxxx.mongodb.net/test. Restart: mgeneratejs CustomerSingleView.json -n 200000 | mongoimport --uri "..." --collection customers. STOP STOPWATCH. Record elapsed time (target: < 1 minute).',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'portable.cutover-execute',
      sourceProof: 'proofs/10/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-portable-execute-step-3',
      title: 'Step 3: Verify Migration Success',
      narrative:
        'Confirm that the load generator is now writing directly to the Azure cluster. The source (AWS) document count should stop increasing; the target (Azure) count should continue increasing. The stopwatch time proves minimal downtime.',
      instructions:
        'In Atlas Metrics | Collections for both clusters: Refresh. Verify AWSTestCluster test.customers count is NOT increasing. Verify AzureTestCluster test.customers count IS increasing. Confirm stopwatch time < 1 minute. Record for proof report.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'portable.verify',
      sourceProof: 'proofs/10/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
