import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-9',
    title: 'Scale-Out Siege',
    codename: 'SCALEOUT',
    tier: 'infiltration',
    description: 'Shard a collection, sustain massive load, add shards dynamically, and verify data distributes evenly.',
    briefing: `CAPACITY CRITICAL\n\nThe events collection is growing at 10GB per hour. The single replica set is running out of disk and CPU. You must enable horizontal scaling: shard the collection with the right key, sustain load under pressure, add new shards to the cluster, and prove that the balancer distributes data evenly.\n\nScale or fail.`,
    objectives: [
      { id: 'obj-9-1', text: 'Enable sharding and choose shard key strategy', completed: false },
      { id: 'obj-9-2', text: 'Generate sustained write load', completed: false },
      { id: 'obj-9-3', text: 'Verify shard distribution is balanced', completed: false },
      { id: 'obj-9-4', text: 'Add a new shard to the cluster', completed: false },
    ],
    timeLimit: 720,
    xpReward: 900,
    difficulty: 3,
    topic: 'scalability',
    povCapabilities: ['SCALE-OUT'],
    chaosEvents: [
      { id: 'chaos-9-1', title: '💥 JUMBO CHUNKS', description: 'Chunk too large to migrate! Your shard key may have low cardinality.', triggerAt: 250, penalty: 200, duration: 90 },
    ],
  };
