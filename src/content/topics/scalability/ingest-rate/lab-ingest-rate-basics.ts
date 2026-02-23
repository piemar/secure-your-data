import { WorkshopLabDefinition } from '@/types';

/**
 * Ingest Rate: Basic High-Volume Data Ingestion
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/03/README.md
 * This lab demonstrates MongoDB's ability to ingest large volumes of data
 * at high rates with replication enforced for safety and redundancy.
 */
export const labIngestRateBasicsDefinition: WorkshopLabDefinition = {
  id: 'lab-ingest-rate-basics',
  topicId: 'scalability',
  title: 'Ingest Rate: High-Volume Data Ingestion Basics',
  description:
    'Learn how to achieve high ingest rates with MongoDB using bulk operations and proper configuration. This lab demonstrates ingesting thousands of records per second with replication enabled.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 40,
  tags: ['ingest-rate', 'performance', 'bulk-operations', 'replication', 'scalability'],
  prerequisites: [
    'MongoDB Atlas M40+ cluster (3-node replica set)',
    'Basic understanding of MongoDB operations',
    'Access to AWS EC2 instance (m4.xlarge recommended) or local machine with Java/Maven'
  ],
  povCapabilities: ['INGEST-RATE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/03',
  dataRequirements: [
    {
      id: 'target-collection',
      description: 'Target collection for bulk insert (1KB, 4KB, or 16KB records)',
      type: 'collection',
      namespace: 'INGEST-RATE.records',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: 'grows during test',
    },
  ],
  steps: [
    {
      id: 'lab-ingest-rate-basics-step-1',
      title: 'Step 1: Configure Environment for High-Volume Ingestion',
      narrative:
        'Set up your MongoDB Atlas cluster and load generation environment. For production-like testing, use an M40 cluster with 3-node replica set and backup enabled. Configure proper indexes and connection settings.',
      instructions:
        '- Create an M40 Atlas cluster with 3-node replica set\n- Enable backup on the cluster\n- Create a database user with readWriteAnyDatabase and clusterMonitor roles\n- Configure IP whitelist for your load generator machine\n- Create indexes on the target collection (3 indexes for small records, 6 for medium, 8 for large)\n- Note your connection string for the next step',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyClusterConfig',
      points: 10,
      enhancementId: 'ingest-rate.cluster-setup',
      sourceProof: 'proofs/03/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-ingest-rate-basics-step-2',
      title: 'Step 2: Ingest Small Records (1KB) at High Rate',
      narrative:
        'Use bulk insert operations to ingest small documents (1KB average) at high rates. MongoDB can achieve 20,000+ inserts per second for small records with proper configuration.',
      instructions:
        '- Use insertMany() with ordered: false for parallel processing\n- Batch inserts in groups of 1000-5000 documents\n- Use write concern {w: "majority"} to ensure replication\n- Monitor insert rate using mongostat or Atlas metrics\n- Target: 20,000+ inserts per second for 1KB records\n- Run for at least 1 minute and measure average rate',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifySmallRecordRate',
      points: 15,
      enhancementId: 'ingest-rate.small-records',
      sourceProof: 'proofs/03/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-ingest-rate-basics-step-3',
      title: 'Step 3: Measure and Verify Ingestion Rate',
      narrative:
        'Measure the actual ingestion rate achieved and verify that data is replicated across all replica set members. Compare your results to MongoDB\'s proven capabilities.',
      instructions:
        '- Calculate ingestion rate: total documents / elapsed time\n- Verify replication: check document count on primary and secondaries\n- Use rs.status() or Atlas UI to confirm all nodes have the data\n- Compare your rate to MongoDB benchmarks:\n  - Small (1KB): ~20,000 docs/sec\n  - Medium (10KB): ~3,500 docs/sec\n  - Large (50KB): ~460 docs/sec\n- Document your results and any optimizations applied',
      estimatedTimeMinutes: 13,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'ingest-rate.verifyReplication',
      points: 15,
      enhancementId: 'ingest-rate.measure-rate',
      sourceProof: 'proofs/03/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
