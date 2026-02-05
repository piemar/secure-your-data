import { WorkshopLabDefinition } from '@/types';

/**
 * Consistency: Sharded Cluster Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/06/README.md (CONSISTENCY)
 * Covers creating a sharded cluster, configuring the sharded collection, and loading sample data.
 */
export const labConsistencyShardedSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-consistency-sharded-setup',
  topicId: 'scalability',
  title: 'Consistency: Sharded Cluster Setup',
  description:
    'Configure an M30 sharded cluster with 4 shards, create a sharded collection with pre-split chunks, and load 1 million sample records for consistency verification.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['consistency', 'sharding', 'atlas', 'data-load'],
  prerequisites: [
    'MongoDB Atlas M30+ sharded cluster (4 shards, 3 replicas per shard)',
    'Python 3 with faker, pymongo, dnspython, certifi installed',
    'mongosh or mongo shell',
  ],
  povCapabilities: ['CONSISTENCY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/06',
  dataRequirements: [
    {
      id: 'generate-people-script',
      description: 'Script to generate 1M person documents',
      type: 'script',
      path: 'generate1Mpeople.py',
      sizeHint: '5KB',
    },
    {
      id: 'country-codes',
      description: 'Country codes for data generation',
      type: 'file',
      path: 'countryCodes.txt',
      sizeHint: '1KB',
    },
    {
      id: 'people-collection',
      description: '1M person documents in sharded collection',
      type: 'collection',
      namespace: 'world.people',
      sizeHint: '~200MB',
    },
  ],
  steps: [
    {
      id: 'lab-consistency-sharded-setup-step-1',
      title: 'Step 1: Create Sharded Cluster in Atlas',
      narrative:
        'Create an M30-based sharded cluster with 4 shards and 3 replicas per shard in a single region. This topology is required for the consistency proof.',
      instructions:
        '- Log into MongoDB Atlas and navigate to your project\n- Create a new cluster: M30 tier, 4 shards, 3 replicas per shard\n- Choose a single cloud region close to your location\n- Add a database user (e.g., main_user) with Atlas Admin privileges\n- Add IP whitelist for your machine or EC2 VM\n- Note the connection string for later steps',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'consistency.atlas-setup',
      sourceProof: 'proofs/06/README.md',
      sourceSection: 'Setup - Configure Atlas Environment',
    },
    {
      id: 'lab-consistency-sharded-setup-step-2',
      title: 'Step 2: Configure Sharded Collection',
      narrative:
        'Enable sharding on the world database and create the people collection with a compound shard key. Pre-split chunks to promote even distribution across shards.',
      instructions:
        '- Connect with mongosh: `mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net/test" --username main_user`\n- Run: `use world`\n- Enable sharding: `sh.enableSharding(\'world\')`\n- Shard collection: `sh.shardCollection(\'world.people\', {\'process\': 1, \'index\': 1})`\n- Pre-split chunks: `sh.splitAt(\'world.people\', {\'process\':2,\'index\':1250})` (and for process 4, 6)\n- Verify: `sh.status()` - chunks should be evenly spread across 4 shards',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 15,
      enhancementId: 'consistency.shard-config',
      sourceProof: 'proofs/06/README.md',
      sourceSection: 'Setup - Configure Sharded Database Collection',
    },
    {
      id: 'lab-consistency-sharded-setup-step-3',
      title: 'Step 3: Load 1 Million Sample Records',
      narrative:
        'Generate and load 1 million randomly generated person documents into world.people. The data is spread evenly across 4 shards using the process field. Use writeConcern majority for durability.',
      instructions:
        '- Install dependencies: `pip3 install faker pymongo dnspython certifi`\n- From the proof folder, run: `./generate1Mpeople.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"`\n- Wait 5-10 minutes for the load to complete\n- Verify: `db.people.countDocuments()` in world database should return 1000000\n- Do not proceed to execution until the load is fully complete',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'challenge'],
      verificationId: 'consistency.verifyDataLoad',
      points: 15,
      enhancementId: 'consistency.data-load',
      sourceProof: 'proofs/06/README.md',
      sourceSection: 'Setup - Generate 1 Million Sample Records',
    },
  ],
};
