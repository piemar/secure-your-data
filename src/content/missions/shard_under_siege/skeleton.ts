import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Shard Under Siege
// Rebalance data across the cluster

// Step 1: Assess shard distribution
sh.___BLANK___();

// Step 2: Identify the hot shard
// Look for shard with disproportionate chunk count
// Hot shard: ___BLANK___ (note it in a comment)

// Step 3: Move chunks to balance
sh.moveChunk("mydb.orders",
  { orderId: MinKey },
  "___BLANK___"
);

// Step 4: Verify distribution
sh.status();
db.orders.___BLANK___();

// Step 5: Confirm services
db.adminCommand({ ___BLANK___: 1 });
`,
    challenge: `// MISSION: Shard Under Siege
// A shard is overloaded — rebalance the cluster

// Check shard distribution status
// YOUR CODE HERE

// Identify the hot shard and move chunks to underloaded shards
// YOUR CODE HERE

// Verify balanced distribution
// YOUR CODE HERE

// Confirm all services responding
// YOUR CODE HERE
`,
    expert: `// MISSION: Shard Under Siege
// Diagnose an overloaded shard, manually migrate chunks,
// verify balanced distribution, and confirm cluster health.
`,
    hints: {
      guided: [
        { line: 4, blankText: '___BLANK___', hint: 'Command to see shard status', answer: 'status', xpPenalty: 15 },
        { line: 8, blankText: '___BLANK___', hint: 'Name the overloaded shard — e.g. "shard-rs2"', answer: 'shard-rs2', xpPenalty: 20 },
        { line: 13, blankText: '___BLANK___', hint: 'Target shard to move chunks TO — the underloaded one', answer: 'shard-rs1', xpPenalty: 25 },
        { line: 18, blankText: '___BLANK___', hint: 'Method to check distribution balance', answer: 'getShardDistribution', xpPenalty: 25 },
        { line: 21, blankText: '___BLANK___', hint: 'Simple health check command', answer: 'ping', xpPenalty: 15 },
      ],
      challenge: [],
    },
  };
