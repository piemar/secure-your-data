import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Up: Execution and Verification
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/08/README.md (SCALE-UP)
 * Run insert load, scale up M20→M30 via Atlas Console, and verify no records lost.
 */
export const labScaleUpExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-up-execute',
  topicId: 'scalability',
  title: 'Scale-Up: Execution and Verification',
  description:
    'Run continuous inserts, scale up the cluster from M20 to M30 via Atlas Console while the workload runs, and verify no records were lost during the rolling update.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['scale-up', 'execution', 'verification', 'compass'],
  prerequisites: [
    'Completed lab-scale-up-setup',
    'M20 Atlas cluster running',
    'monitor.py running',
  ],
  povCapabilities: ['SCALE-UP'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/08',
  dataRequirements: [
    {
      id: 'mydb-records',
      description: 'Collection for insert/verify proof (created by insert_data.py)',
      type: 'collection',
      namespace: 'mydb.records',
      sizeHint: 'grows during run',
    },
  ],
  steps: [
    {
      id: 'lab-scale-up-execute-step-1',
      title: 'Step 1: Run Insert Load',
      narrative:
        'With monitor.py running in one terminal, start insert_data.py in another. It inserts documents with incrementing val field continuously. Watch the monitor output as records are inserted and replicated to secondaries.',
      instructions:
        '- Ensure monitor.py is running (shows Node 1/2/3 status, RAM, Records)\n- In a second terminal: `./insert_data.py`\n- Observe: ~10–15 records inserted every 0.5 seconds\n- Monitor shows records replicated to all nodes\n- Let it run until you have a few thousand records before scaling',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'scale-up.run-insert',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-scale-up-execute-step-2',
      title: 'Step 2: Scale Up via Atlas Console',
      narrative:
        'While inserts run, open Atlas Console, click Edit Configuration for your cluster, change tier from M20 to M30, and click Apply Changes. MongoDB performs a rolling update: secondaries upgrade first, then primary steps down and an upgraded secondary is elected.',
      instructions:
        '- Atlas Console → your cluster → Edit Configuration\n- Change cluster tier: M20 → M30\n- Click Apply Changes\n- Watch monitor.py: secondaries upgrade first (RAM 4GB → 8GB)\n- Primary steps down; brief pause at one record number\n- New primary elected; inserts resume automatically (retryable writes)\n- Total scale-up: a few minutes',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      points: 15,
      enhancementId: 'scale-up.run-scale',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-scale-up-execute-step-3',
      title: 'Step 3: Verify No Records Lost',
      narrative:
        'Note the record number from monitor.py just before the primary stepped down. In Compass, connect to mydb.records, filter for {val: {$gt: N}}, and sort by val. Verify there are no gaps—every record from N+1 onward exists.',
      instructions:
        '- Note record number (e.g. 16617) from monitor just before step-down\n- Open Compass, connect with your connection string\n- Database: mydb, Collection: records\n- Filter: {val: {$gt: 16617}}\n- Sort: val ascending\n- Verify: no gaps; records continue sequentially\n- Scale-down proof: repeat with M30 → M20',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      points: 20,
      enhancementId: 'scale-up.verify',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
