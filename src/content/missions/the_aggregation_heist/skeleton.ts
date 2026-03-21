import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: The Aggregation Heist
// Collection: intel (2M nested documents)

// Step 1: Explore the document structure
db.intel.___BLANK___();

// Step 2: Build the pipeline
db.intel.aggregate([
  // Unwind the nested array
  { $unwind: "$___BLANK___" },

  // Match target criteria
  { $match: {
    status: "___BLANK___",
    priority: { $gte: ___BLANK___ }
  }},

  // Cross-collection join
  { $lookup: {
    from: "___BLANK___",
    localField: "___BLANK___",
    foreignField: "_id",
    as: "details"
  }},

  // Parallel aggregations
  { $facet: {
    "byCategory": [
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ],
    "byPriority": [
      { $group: { _id: "$priority", total: { $sum: "$value" } } }
    ]
  }},

  // Output results
  { $merge: {
    into: "___BLANK___",
    whenMatched: "replace",
    whenNotMatched: "insert"
  }}
]);
`,
    challenge: `// MISSION: The Aggregation Heist
// Build a pipeline on the intel collection with nested documents
// Required stages: $unwind, $match, $lookup, $facet, $merge

// Explore document structure first
// YOUR CODE HERE

// Build the complete aggregation pipeline
db.intel.aggregate([
  // Stage 1: Unwind a nested array field
  // YOUR CODE HERE

  // Stage 2: Match on status and priority
  // YOUR CODE HERE

  // Stage 3: $lookup to join with another collection
  // YOUR CODE HERE

  // Stage 4: $facet for parallel group-by operations
  // YOUR CODE HERE

  // Stage 5: $merge results to an output collection
  // YOUR CODE HERE
]);
`,
    expert: `// MISSION: The Aggregation Heist
// Build a multi-stage aggregation pipeline on nested documents.
// Must use: $unwind, $match, $lookup, $facet, $merge
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'To see one document, use findOne', answer: 'findOne', xpPenalty: 15 },
        { line: 10, blankText: '___BLANK___', hint: 'Which array field to unwind? Think about nested data — e.g. "reports" or "entries"', answer: 'reports', xpPenalty: 25 },
        { line: 14, blankText: '___BLANK___', hint: 'Filter for active documents', answer: 'active', xpPenalty: 15 },
        { line: 15, blankText: '___BLANK___', hint: 'Minimum priority level (1-5)', answer: '3', xpPenalty: 15 },
        { line: 20, blankText: '___BLANK___', hint: '$lookup "from" is the target collection name', answer: 'agents', xpPenalty: 25 },
        { line: 21, blankText: '___BLANK___', hint: 'localField is the field in intel docs that matches the foreign key', answer: 'agentId', xpPenalty: 25 },
        { line: 38, blankText: '___BLANK___', hint: 'Name for the output collection', answer: 'intel_summary', xpPenalty: 15 },
      ],
      challenge: [
        { line: 10, blankText: '', hint: '{ $unwind: "$arrayFieldName" }', answer: '', xpPenalty: 25 },
        { line: 16, blankText: '', hint: '$lookup needs: from, localField, foreignField, as', answer: '', xpPenalty: 30 },
      ],
    },
  };
