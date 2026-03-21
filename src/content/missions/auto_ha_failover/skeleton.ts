import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Auto-HA Failover
// Test automatic high availability

// Step 1: Check replica set status
rs.___BLANK___();
// Note: which member is PRIMARY? which are SECONDARY?

// Step 2: Connect WITHOUT retryable writes
const uriNoRetry = "mongodb+srv://cluster.example.net/mydb?" +
  "retryWrites=___BLANK___&retryReads=___BLANK___";

// Step 3: Enable retryable writes
const uriRetry = "mongodb+srv://cluster.example.net/mydb?" +
  "retryWrites=___BLANK___&retryReads=___BLANK___";

// Step 4: Trigger failover
db.adminCommand({ ___BLANK___: 60 });

// Step 5: Verify recovery
rs.status();
// Confirm: new PRIMARY elected, members healthy
`,
    challenge: `// MISSION: Auto-HA Failover
// Prove retryable writes make failover transparent

// Check replica set status and identify PRIMARY
// YOUR CODE HERE

// Build connection string WITHOUT retry (baseline)
// YOUR CODE HERE

// Build connection string WITH retryWrites and retryReads enabled
// YOUR CODE HERE

// Trigger a failover and verify recovery
// YOUR CODE HERE
`,
    expert: `// MISSION: Auto-HA Failover
// Demonstrate automatic failover with and without retryable writes.
// Trigger a step-down and prove zero-disruption recovery.
`,
    hints: {
      guided: [
        { line: 4, blankText: '___BLANK___', hint: 'Replica set command to check status', answer: 'status', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'Disable retries: false', answer: 'false', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'Disable retries: false', answer: 'false', xpPenalty: 15 },
        { line: 13, blankText: '___BLANK___', hint: 'Enable retries: true', answer: 'true', xpPenalty: 15 },
        { line: 13, blankText: '___BLANK___', hint: 'Enable retries: true', answer: 'true', xpPenalty: 15 },
        { line: 16, blankText: '___BLANK___', hint: 'Admin command to force primary to step down', answer: 'replSetStepDown', xpPenalty: 30 },
      ],
      challenge: [],
    },
  };
