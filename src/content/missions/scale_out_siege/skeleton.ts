import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Scale-Out Siege
// Scale the cluster horizontally

// Step 1: Enable sharding
sh.enableSharding("___BLANK___");
sh.shardCollection("loadtest.events", {
  ___BLANK___: "___BLANK___"
});

// Step 2: Generate sustained load
for (let i = 0; i < 1000; i++) {
  db.events.insertMany(
    Array.from({ length: 100 }, (_, j) => ({
      timestamp: new Date(),
      value: Math.random() * 1000,
      category: ["web", "mobile", "api"][i % 3]
    }))
  );
}

// Step 3: Check distribution
sh.___BLANK___();
db.events.___BLANK___();

// Step 4: Add a new shard
sh.___BLANK___("newShard/host:27017");

sh.status();
`,
    challenge: `// MISSION: Scale-Out Siege
// Enable sharding, load data, verify distribution, add shard

// Enable sharding on a database and shard the events collection
// YOUR CODE HERE

// Generate load with insertMany in a loop
// YOUR CODE HERE

// Check shard distribution
// YOUR CODE HERE

// Add a new shard to the cluster
// YOUR CODE HERE
`,
    expert: `// MISSION: Scale-Out Siege
// Implement horizontal scaling: enable sharding, choose a shard key,
// generate load, verify distribution, and dynamically add shards.
`,
    hints: {
      guided: [
        { line: 4, blankText: '___BLANK___', hint: 'Database name to enable sharding on', answer: 'loadtest', xpPenalty: 15 },
        { line: 6, blankText: '___BLANK___', hint: 'Shard key field — _id is a good default', answer: '_id', xpPenalty: 25 },
        { line: 6, blankText: '___BLANK___', hint: 'Shard key strategy: "hashed" or 1 for ranged', answer: 'hashed', xpPenalty: 25 },
        { line: 21, blankText: '___BLANK___', hint: 'View shard status', answer: 'status', xpPenalty: 15 },
        { line: 22, blankText: '___BLANK___', hint: 'Check distribution per shard', answer: 'getShardDistribution', xpPenalty: 20 },
        { line: 25, blankText: '___BLANK___', hint: 'Command to add a shard', answer: 'addShard', xpPenalty: 20 },
      ],
      challenge: [],
    },
  };
