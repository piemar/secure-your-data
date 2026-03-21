import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Graph Infiltration
// Collection: people — traverse social connections

// Step 1: Build $graphLookup
db.people.aggregate([
  { $match: { name: "___BLANK___" } },
  { $graphLookup: {
    from: "___BLANK___",
    startWith: "$___BLANK___",
    connectFromField: "___BLANK___",
    connectToField: "___BLANK___",
    as: "___BLANK___",
    maxDepth: ___BLANK___,
    depthField: "depth"
  }}
]);

// Step 2: Add restrictSearchWithMatch to filter traversal
db.people.aggregate([
  { $match: { name: "Target Alpha" } },
  { $graphLookup: {
    from: "people",
    startWith: "$connections",
    connectFromField: "connections",
    connectToField: "name",
    as: "network",
    maxDepth: 4,
    restrictSearchWithMatch: { ___BLANK___: "___BLANK___" }
  }},
  // Step 3: Identify patterns
  { $project: {
    name: 1,
    networkSize: { $size: "$network" },
    network: 1
  }}
]);
`,
    challenge: `// MISSION: Graph Infiltration
// Traverse the people collection's social graph

// Use $graphLookup to find all connections up to 4 degrees deep
// YOUR CODE HERE

// Add restrictSearchWithMatch to filter for active accounts only
// YOUR CODE HERE

// Project results to show network size and connection depths
// YOUR CODE HERE
`,
    expert: `// MISSION: Graph Infiltration
// Use $graphLookup to traverse a social graph, limit depth,
// filter with restrictSearchWithMatch, and analyze the output.
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'Starting person — "Target Alpha"', answer: 'Target Alpha', xpPenalty: 15 },
        { line: 7, blankText: '___BLANK___', hint: '$graphLookup traverses within this collection', answer: 'people', xpPenalty: 20 },
        { line: 8, blankText: '___BLANK___', hint: 'Start traversal from this field on the root document', answer: 'connections', xpPenalty: 25 },
        { line: 9, blankText: '___BLANK___', hint: 'Field on each visited doc that contains next connections', answer: 'connections', xpPenalty: 25 },
        { line: 10, blankText: '___BLANK___', hint: 'Field to match against (usually "name" or "_id")', answer: 'name', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Output array name for discovered connections', answer: 'network', xpPenalty: 15 },
        { line: 12, blankText: '___BLANK___', hint: 'Max degrees of separation (1-6)', answer: '4', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Filter field — e.g. "status"', answer: 'status', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Filter value — e.g. "active"', answer: 'active', xpPenalty: 20 },
      ],
      challenge: [],
    },
  };
