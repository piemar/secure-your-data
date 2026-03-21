import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Analytics Extraction
// Collection: orders — run analytics without killing production

// Step 1: Revenue analytics by category
db.orders.aggregate([
  { $match: { status: "___BLANK___" } },
  { $group: {
    _id: "$___BLANK___",
    totalRevenue: { $sum: "$___BLANK___" },
    avgOrderValue: { ___BLANK___: "$amount" },
    orderCount: { $___BLANK___: {} }
  }},
  { $sort: { totalRevenue: ___BLANK___ } }
]);

// Step 2: Time-based grouping
db.orders.aggregate([
  { $group: {
    _id: {
      year: { $___BLANK___: "$orderDate" },
      month: { $___BLANK___: "$orderDate" }
    },
    revenue: { $sum: "$amount" },
    orders: { $sum: 1 }
  }},
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);

// Step 3: Route to secondary for workload isolation
db.orders.aggregate(
  [ { $group: { _id: "$region", total: { $sum: "$amount" } } } ],
  { readPreference: "___BLANK___" }
);
`,
    challenge: `// MISSION: Analytics Extraction
// Build analytics pipelines on the orders collection

// Pipeline 1: Group by category — total revenue, avg, count. Sort desc.
// YOUR CODE HERE

// Pipeline 2: Group by year+month using date operators
// YOUR CODE HERE

// Pipeline 3: Run analytics on a secondary replica (workload isolation)
// YOUR CODE HERE
`,
    expert: `// MISSION: Analytics Extraction
// Build aggregation analytics on orders: group by category, group by time,
// and demonstrate workload isolation with read preferences.
`,
    hints: {
      guided: [
        { line: 6, blankText: '___BLANK___', hint: 'Filter for completed orders', answer: 'completed', xpPenalty: 15 },
        { line: 8, blankText: '___BLANK___', hint: 'Group by which field? (category)', answer: 'category', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'Which field to sum for revenue?', answer: 'amount', xpPenalty: 15 },
        { line: 10, blankText: '___BLANK___', hint: 'Accumulator for average: $avg', answer: '$avg', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Accumulator to count documents', answer: 'count', xpPenalty: 20 },
        { line: 13, blankText: '___BLANK___', hint: '-1 for descending (highest first)', answer: '-1', xpPenalty: 15 },
        { line: 20, blankText: '___BLANK___', hint: 'Date operator to extract year', answer: 'year', xpPenalty: 20 },
        { line: 21, blankText: '___BLANK___', hint: 'Date operator to extract month', answer: 'month', xpPenalty: 20 },
        { line: 32, blankText: '___BLANK___', hint: 'Read preference: "secondaryPreferred" routes reads to secondaries', answer: 'secondaryPreferred', xpPenalty: 30 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'Use $match, $group with $sum/$avg/$count, then $sort', answer: '', xpPenalty: 30 },
        { line: 11, blankText: '', hint: 'Pass { readPreference: "secondaryPreferred" } as second arg to aggregate()', answer: '', xpPenalty: 30 },
      ],
    },
  };
