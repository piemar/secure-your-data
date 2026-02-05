import { WorkshopLabDefinition } from '@/types';

/**
 * Ingest Rate: Replication Verification & Redundancy
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/03/README.md
 * This lab demonstrates that high-volume ingestion maintains replication
 * and data redundancy across all replica set members, ensuring safety and availability.
 */
export const labIngestRateReplicationVerifyDefinition: WorkshopLabDefinition = {
  id: 'lab-ingest-rate-replication-verify',
  topicId: 'scalability',
  title: 'Ingest Rate: Verify Replication During High-Volume Ingestion',
  description:
    'Verify that MongoDB maintains replication and data redundancy even during high-volume ingestion. Learn how to monitor replication lag and ensure data safety.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['ingest-rate', 'replication', 'redundancy', 'monitoring', 'high-availability'],
  prerequisites: [
    'Lab: Ingest Rate Basics (recommended)',
    'MongoDB Atlas M40+ cluster with 3-node replica set',
    'Understanding of MongoDB replica sets'
  ],
  povCapabilities: ['INGEST-RATE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/03',
  dataRequirements: [
    {
      id: 'replicated-collection',
      description: 'Collection with replication enforced (2+ copies)',
      type: 'collection',
      namespace: 'INGEST-RATE.records',
      sizeHint: 'verify on secondaries',
    },
  ],
  steps: [
    {
      id: 'lab-ingest-rate-replication-verify-step-1',
      title: 'Step 1: Monitor Replication During Ingestion',
      narrative:
        'While ingesting data at high rates, monitor replication lag and ensure all secondary nodes are keeping up. Use mongostat, rs.printSlaveReplicationInfo(), or Atlas metrics.',
      instructions:
        '- Start ingesting data at high rate (use insertMany with large batches)\n- In parallel, monitor replication:\n  - Use rs.printSlaveReplicationInfo() in mongosh\n  - Check Atlas Replication Lag metrics\n  - Use mongostat to see oplog activity\n- Verify that replication lag stays low (< 1 second ideally)\n- Observe that secondaries are processing oplog entries',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyReplicationLag',
      points: 15,
      enhancementId: 'ingest-rate.monitor-replication',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-ingest-rate-replication-verify-step-2',
      title: 'Step 2: Verify Data on All Replica Set Members',
      narrative:
        'After ingestion completes, verify that all documents are present on all replica set members. This proves that replication is working correctly even under high load.',
      instructions:
        '- Connect to primary node and count documents: db.collection.countDocuments()\n- Connect to each secondary node (read preference: secondary)\n- Count documents on each secondary\n- Verify counts match across all nodes\n- Sample random documents from each node to verify data integrity\n- Use rs.status() to check replica set health',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyDataOnAllNodes',
      points: 15,
      enhancementId: 'ingest-rate.verify-nodes',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Measurement',
    },
    {
      id: 'lab-ingest-rate-replication-verify-step-3',
      title: 'Step 3: Test Failover During High-Volume Ingestion',
      narrative:
        'Simulate a primary node failure during high-volume ingestion to verify that replication ensures no data loss and automatic failover works correctly.',
      instructions:
        '- Start high-volume ingestion (insertMany in a loop)\n- While ingestion is running, simulate primary failure:\n  - In Atlas: Step down the primary (or stop the primary node)\n  - Or use rs.stepDown() in mongosh\n- Observe automatic failover to a secondary\n- Verify that ingestion continues (may pause briefly during election)\n- After failover, verify all data is present on new primary\n- Check that no documents were lost during failover',
      estimatedTimeMinutes: 13,
      modes: ['lab', 'challenge'],
      verificationId: 'ingest-rate.verifyFailover',
      points: 20,
      enhancementId: 'ingest-rate.failover-test',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Execution',
    },
  ],
};
