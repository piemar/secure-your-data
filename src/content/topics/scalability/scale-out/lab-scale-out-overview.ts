import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Out Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/07/README.md (SCALE-OUT)
 * Introduces MongoDB's ability to scale out by adding shards dynamically at runtime
 * without database or application downtime.
 */
export const labScaleOutOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-out-overview',
  topicId: 'scalability',
  title: 'Scale-Out Overview',
  description:
    'Learn how MongoDB scales out horizontally by adding shards dynamically while the cluster is under sustained load, without requiring database or application downtime.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['scale-out', 'sharding', 'horizontal-scaling', 'atlas'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of sharding',
  ],
  povCapabilities: ['SCALE-OUT'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Horizontal Scaling', explanation: 'Add more shards to distribute data and workload; capacity grows without per-operation latency increase.' },
    { term: 'Shard', explanation: 'Each shard is a replica set; data is distributed across shards by shard key.' },
    { term: 'Balancer', explanation: 'Background process that migrates chunks when new shards are added.' },
    { term: 'Chunk', explanation: 'Contiguous range of shard key values; balancer moves chunks between shards.' },
  ],
  steps: [
    {
      id: 'lab-scale-out-overview-step-1',
      title: 'Step 1: Understand Horizontal Scale-Out',
      narrative:
        'When data volume and usage grow, vertical scaling (bigger machines) has limits. Horizontal scale-out adds more shards to distribute data and workload. MongoDB allows adding shards dynamically while the cluster continues serving traffic—no planned downtime.',
      instructions:
        '- Review the concept of sharding: data distributed across multiple shards\n- Understand that each shard is a replica set\n- Learn that the balancer redistributes chunks when new shards are added\n- Identify the benefit: capacity grows without increasing per-operation latency',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'scale-out.concepts',
      sourceProof: 'proofs/07/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-scale-out-overview-step-2',
      title: 'Step 2: Scale-Out During Sustained Load',
      narrative:
        'The proof runs continuous insert load (batches of 100,000 documents) while adding shards. Response times stay roughly constant because new shards absorb the growing data and workload. The balancer migrates chunks in the background.',
      instructions:
        '- Start with a 2-shard cluster under insert load\n- Add a 3rd shard via Atlas API or UI\n- Add a 4th shard later\n- Observe: batch execution times stay roughly constant\n- Observe: chunk counts and disk capacity increase as shards are added',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-out.sustained-load',
      sourceProof: 'proofs/07/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Description',
    },
    {
      id: 'lab-scale-out-overview-step-3',
      title: 'Step 3: Metrics and Visualization',
      narrative:
        'Key metrics to track: batch execution times (insert latency), chunk counts per shard, disk capacity, and disk used. MongoDB Atlas Charts can visualize these to demonstrate that scale-out maintains performance while capacity grows.',
      instructions:
        '- batch_execution_times: time to insert 100K docs per batch (should stay roughly constant)\n- chunk_counts: chunks per shard (balancer activity when shards added)\n- disk_total: total storage capacity (increases when shard added)\n- disk_used: data size (grows continuously with ingest)\n- Use Atlas Charts with filter {latest: true} to visualize',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-out.metrics',
      sourceProof: 'proofs/07/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
