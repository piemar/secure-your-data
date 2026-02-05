import { WorkshopLabDefinition } from '@/types';

/**
 * Ingest Rate: Bulk Operations for Maximum Performance
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/03/README.md
 * This lab focuses on optimizing bulk insert operations to achieve maximum
 * ingestion rates using ordered operations, write concern tuning, and batching strategies.
 */
export const labIngestRateBulkOperationsDefinition: WorkshopLabDefinition = {
  id: 'lab-ingest-rate-bulk-operations',
  topicId: 'scalability',
  title: 'Ingest Rate: Optimizing Bulk Operations',
  description:
    'Learn advanced techniques for maximizing MongoDB ingestion rates: ordered vs unordered operations, write concern tuning, batch sizing, and connection pooling.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['ingest-rate', 'bulk-operations', 'performance', 'optimization', 'write-concern'],
  prerequisites: [
    'Lab: Ingest Rate Basics (recommended)',
    'MongoDB Atlas M40+ cluster',
    'Understanding of write concern and replication'
  ],
  povCapabilities: ['INGEST-RATE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/03',
  dataRequirements: [
    {
      id: 'target-collection',
      description: 'Target collection for bulk insert operations',
      type: 'collection',
      namespace: 'INGEST-RATE.records',
      sizeHint: 'grows during test',
    },
  ],
  steps: [
    {
      id: 'lab-ingest-rate-bulk-operations-step-1',
      title: 'Step 1: Compare Ordered vs Unordered Bulk Operations',
      narrative:
        'Understand the performance difference between ordered and unordered bulk operations. Ordered operations stop on first error but may be slower; unordered operations continue on errors and can be faster.',
      instructions:
        '- Create two test scripts:\n  - Script 1: Use insertMany() with ordered: true\n  - Script 2: Use insertMany() with ordered: false\n- Insert 10,000 documents with both approaches\n- Measure time and rate for each\n- Compare results: unordered should be faster\n- Explain when to use each approach',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyBulkComparison',
      points: 15,
      enhancementId: 'ingest-rate.ordered-vs-unordered',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-ingest-rate-bulk-operations-step-2',
      title: 'Step 2: Optimize Batch Size for Maximum Throughput',
      narrative:
        'Find the optimal batch size for your workload. Too small batches waste network round-trips; too large batches may cause memory issues. Test different batch sizes to find the sweet spot.',
      instructions:
        '- Test batch sizes: 100, 500, 1000, 5000, 10000 documents\n- For each batch size:\n  - Insert 50,000 documents\n  - Measure total time and calculate rate\n  - Monitor memory usage\n- Identify the batch size that gives best throughput\n- Consider your document size when choosing batch size',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyBatchOptimization',
      points: 15,
      enhancementId: 'ingest-rate.batch-sizing',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-ingest-rate-bulk-operations-step-3',
      title: 'Step 3: Tune Write Concern for Performance vs Durability',
      narrative:
        'Balance write concern settings between performance and durability. w: 1 is faster but less durable; w: "majority" ensures replication but may be slower. Understand the trade-offs.',
      instructions:
        '- Test different write concern settings:\n  - {w: 1} - fastest, no replication guarantee\n  - {w: "majority"} - ensures replication, slightly slower\n  - {w: 2} - waits for 2 nodes\n- Insert 20,000 documents with each setting\n- Measure insertion rate for each\n- Verify replication status after each test\n- Choose appropriate write concern for your use case',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyWriteConcern',
      points: 15,
      enhancementId: 'ingest-rate.write-concern',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Execution',
    },
  ],
};
