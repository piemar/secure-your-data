import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Up Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/08/README.md (SCALE-UP)
 * Introduces MongoDB's ability to scale up vertically by increasing CPU, RAM, and
 * storage dynamically without database downtime.
 */
export const labScaleUpOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-up-overview',
  topicId: 'scalability',
  title: 'Scale-Up Overview',
  description:
    'Learn how MongoDB scales up vertically by increasing underlying host compute resources (CPU/RAM/Storage) dynamically while the cluster continues serving traffic—no planned downtime.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['scale-up', 'vertical-scaling', 'rolling-update', 'atlas'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of replica sets',
  ],
  povCapabilities: ['SCALE-UP'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Vertical Scaling', explanation: 'Increase CPU, RAM, and storage per node; bigger machines instead of more machines.' },
    { term: 'Cluster Tier', explanation: 'Atlas tiers (M10, M20, M30, etc.) define compute resources per node.' },
    { term: 'Rolling Update', explanation: 'Members upgraded one at a time; primary steps down, upgraded secondary promoted.' },
    { term: 'Retryable Writes', explanation: 'Driver retries writes during brief election; no lost inserts during scale-up.' },
  ],
  steps: [
    {
      id: 'lab-scale-up-overview-step-1',
      title: 'Step 1: Understand Vertical Scale-Up',
      narrative:
        'Vertical scale-up increases the compute resources (CPU, RAM, storage) of each node in a replica set. Unlike scale-out (adding shards), scale-up makes existing nodes more powerful. MongoDB Atlas supports changing cluster tier (e.g., M20 → M30) with no application downtime.',
      instructions:
        '- Review vertical vs horizontal scaling: scale-up = bigger machines, scale-out = more machines\n- Understand that Atlas cluster tiers (M10, M20, M30, etc.) define CPU, RAM, and storage\n- Learn that scale-up is useful when a single node needs more capacity\n- Identify the benefit: zero downtime, rolling update across replica set members',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'scale-up.concepts',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Description',
    },
    {
      id: 'lab-scale-up-overview-step-2',
      title: 'Step 2: Rolling Update During Sustained Load',
      narrative:
        'The proof runs continuous inserts while scaling up from M20 to M30. MongoDB performs a rolling update: one secondary at a time is upgraded, then the primary steps down and an upgraded secondary becomes primary. Inserts continue throughout with minimal interruption.',
      instructions:
        '- Start with M20 3-node replica set under insert load\n- Trigger scale-up via Atlas Console: Edit Configuration → M20 to M30 → Apply Changes\n- Observe: secondaries upgrade first (rolling fashion)\n- Observe: primary steps down; upgraded secondary elected primary\n- Observe: brief pause during election; inserts resume automatically via retryable writes',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-up.rolling-update',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-scale-up-overview-step-3',
      title: 'Step 3: Metrics and Verification',
      narrative:
        'The monitor script reports each node\'s role (PRIMARY/SECONDARY), RAM (in GB), and record count. During scale-up, RAM increases from 4GB to 8GB per node. After completion, verify in Compass that no inserts were lost during the failover.',
      instructions:
        '- monitor.py: shows Node 1/2/3 status, RAM, Records count (updates every 0.5s)\n- During scale-up: RAM per node increases (M20: 4GB → M30: 8GB)\n- Note record number just before primary step-down\n- Compass: filter {val: {$gt: N}} and sort by val to verify no gaps\n- Retryable writes ensure no lost inserts during brief election',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-up.metrics',
      sourceProof: 'proofs/08/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
