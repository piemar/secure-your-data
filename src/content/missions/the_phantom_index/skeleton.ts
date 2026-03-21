import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: The Phantom Index
// Database: analytics | Collection: events (50M documents)

// Step 1: Run explain on the slow query
db.events.find({
  status: "active",
  category: "purchase",
  timestamp: { $gte: ISODate("2024-01-01") }
}).explain("___BLANK___");

// Step 2: Identify the problem
// Look at the output: what stage is shown?
// Answer: ___BLANK___ (this means no index is helping)
// How many docsExamined vs docsReturned?

// Step 3: Create the optimal compound index
// Rule: equality fields first, range fields last
db.events.createIndex({
  ___BLANK___
});

// Step 4: Re-run explain to verify
db.events.find({
  status: "active",
  category: "purchase",
  timestamp: { $gte: ISODate("2024-01-01") }
}).explain("executionStats");
// Verify: should show ___BLANK___ stage
`,
    challenge: `// MISSION: The Phantom Index
// Collection: events (50M docs) — queries are running 100x slower than expected
// Fields: status, category, timestamp, userId, value

// Analyze the slow query with explain()
// YOUR CODE HERE

// Identify the scan type and document examination count
// YOUR CODE HERE (add a comment noting what you found)

// Create the optimal compound index for this query pattern
// Remember: equality before range
// YOUR CODE HERE

// Verify improvement with explain()
// YOUR CODE HERE
`,
    expert: `// MISSION: The Phantom Index
// A query on the events collection (status, category, timestamp filters)
// is doing a full collection scan on 50M documents.
// Diagnose, fix, and verify.
`,
    hints: {
      guided: [
        { line: 10, blankText: '___BLANK___', hint: 'explain() verbosity: "queryPlanner", "executionStats", or "allPlansExecution"', answer: 'executionStats', xpPenalty: 25 },
        { line: 14, blankText: '___BLANK___', hint: 'When no index helps, MongoDB does a COLL____', answer: 'COLLSCAN', xpPenalty: 25 },
        { line: 21, blankText: '___BLANK___', hint: 'Equality fields (status, category) first, then range (timestamp). Format: field: 1', answer: 'status: 1, category: 1, timestamp: 1', xpPenalty: 40 },
        { line: 30, blankText: '___BLANK___', hint: 'After adding an index, you want to see IX____', answer: 'IXSCAN', xpPenalty: 25 },
      ],
      challenge: [
        { line: 5, blankText: '', hint: 'Use db.events.find({...}).explain("executionStats") with the status/category/timestamp filters', answer: '', xpPenalty: 30 },
        { line: 12, blankText: '', hint: 'db.events.createIndex({ equality_field: 1, ..., range_field: 1 })', answer: '', xpPenalty: 40 },
      ],
    },
  };
