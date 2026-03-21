import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Connection Storm
// Handle 10,000 simultaneous connections

// Step 1: Diagnose connection pool
db.serverStatus().___BLANK___;
db.adminCommand({ ___BLANK___: 1 });

// Step 2: Configure optimal pool size
const uri = "mongodb+srv://cluster.example.net/mydb?" +
  "maxPoolSize=___BLANK___" +
  "&minPoolSize=___BLANK___" +
  "&maxIdleTimeMS=___BLANK___";

// Step 3: Implement exponential backoff
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      const backoff = Math.___BLANK___(2, attempt) * 100;
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

// Step 4: Set timeouts
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: ___BLANK___,
  socketTimeoutMS: ___BLANK___,
  connectTimeoutMS: ___BLANK___,
});
`,
    challenge: `// MISSION: Connection Storm
// Manage 10K concurrent connections

// Diagnose current connection pool state
// YOUR CODE HERE

// Build a connection string with pool size limits
// YOUR CODE HERE

// Write a retry function with exponential backoff
// YOUR CODE HERE

// Create MongoClient with proper timeout settings
// YOUR CODE HERE
`,
    expert: `// MISSION: Connection Storm
// Design a connection management strategy for 10K concurrent clients.
// Include: pool configuration, exponential backoff retry,
// and timeout settings.
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'serverStatus() field for connection info', answer: 'connections', xpPenalty: 20 },
        { line: 6, blankText: '___BLANK___', hint: 'Admin command for connection pool stats', answer: 'connPoolStats', xpPenalty: 20 },
        { line: 10, blankText: '___BLANK___', hint: 'Max connections per pool (50-200 is typical)', answer: '100', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Minimum connections to keep warm (5-25)', answer: '10', xpPenalty: 20 },
        { line: 12, blankText: '___BLANK___', hint: 'Idle timeout in ms (30000-60000)', answer: '30000', xpPenalty: 20 },
        { line: 20, blankText: '___BLANK___', hint: 'Math method for exponentiation: pow', answer: 'pow', xpPenalty: 25 },
        { line: 27, blankText: '___BLANK___', hint: 'Server selection timeout (5000-30000ms)', answer: '5000', xpPenalty: 20 },
        { line: 28, blankText: '___BLANK___', hint: 'Socket timeout (10000-45000ms)', answer: '30000', xpPenalty: 20 },
        { line: 29, blankText: '___BLANK___', hint: 'Connect timeout (5000-10000ms)', answer: '10000', xpPenalty: 20 },
      ],
      challenge: [],
    },
  };
