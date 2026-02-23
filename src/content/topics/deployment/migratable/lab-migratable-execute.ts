import { WorkshopLabDefinition } from '@/types';

/**
 * Migratable Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/09/README.md (MIGRATABLE)
 * Execute Live Migration: generate data, initiate migration, cutover, verify.
 */
export const labMigratableExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-migratable-execute',
  topicId: 'deployment',
  title: 'Migratable: Execute Migration and Cutover',
  description:
    'Run the Live Migration from on-prem source to Atlas, perform cutover with minimal downtime, and verify data continuity.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['migration', 'live-migration', 'cutover', 'pocdriver'],
  prerequisites: [
    'lab-migratable-setup completed (Atlas cluster, source EC2, POCDriver)',
    'Source replica set running and reachable',
  ],
  povCapabilities: ['MIGRATABLE'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/09',
  dataRequirements: [
    {
      id: 'pocdb-poccoll',
      description: 'POCDB.POCCOLL collection (created by POCDriver)',
      type: 'collection',
      namespace: 'POCDB.POCCOLL',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '~900MB after initial load',
    },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-migratable-execute-step-1',
      title: 'Step 1: Generate Sample Data and Start Live Migration',
      narrative:
        'Run POCDriver against the source cluster to generate ~900MB of data. Then initiate Live Migration from Atlas Console. The migration tool performs initial sync, then continuously tails the oplog.',
      instructions:
        'Run POCDriver: java -jar POCDriver.jar -c "mongodb://SOURCE-DNS:27017/?replicaSet=rsMigration" -t 1 -e -d 60 -f 25 -a 5:5 --depth 2 -x 3. In Atlas: Migrate Data to this Cluster. Enter source hostname:port, no auth. Validate, then Start Migration. In Atlas Metrics | Collections, watch POCDB.POCCOLL size increase. Restart POCDriver without -e, add -q 100 for live tailing. Wait for replication lag near zero.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'migratable.initiate',
      sourceProof: 'proofs/09/README.md',
      sourceSection: 'Execution',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-migratable-execute-step-2',
      title: 'Step 2: Perform Cutover',
      narrative:
        'Stop POCDriver, start the stopwatch, trigger Start Cutover in Atlas, update POCDriver connection string to Atlas, restart POCDriver, stop the stopwatch. Elapsed time should be less than 1 minute.',
      instructions:
        'STOP POCDriver (Ctrl+C). START STOPWATCH. In Atlas: Start Cutover. Update POCDriver connection string to Atlas URI. Restart POCDriver: java -jar POCDriver.jar -c "mongodb+srv://..." -t 1 -d 600 -f 25 -a 5:5 --depth 2 -x 3. STOP STOPWATCH. Record elapsed time (target: < 1 minute).',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'migratable.cutover-execute',
      sourceProof: 'proofs/09/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-migratable-execute-step-3',
      title: 'Step 3: Verify Migration Success',
      narrative:
        'Confirm that POCDriver is now writing directly to Atlas. The collection count should continue increasing. The stopwatch time proves minimal downtime.',
      instructions:
        'In Atlas Metrics | Collections, refresh POCDB.POCCOLL. Verify document count is increasing (POCDriver now writes to Atlas). Confirm stopwatch time < 1 minute. Optional: Connect with Compass to Atlas cluster and inspect POCDB.POCCOLL documents.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'migratable.verify',
      sourceProof: 'proofs/09/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
