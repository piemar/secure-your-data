/**
 * Three-tier mission skeletons with inline hints.
 * Guided: fill-in-the-blank with ___BLANK___ markers
 * Challenge: structural comments + empty bodies
 * Expert: just the objective as a comment
 */
import { MissionSkeleton } from './types';

export const MISSION_SKELETONS: Record<string, MissionSkeleton> = {
  // ─── Mission 12: CRUD Boot Camp ───
  'mission-12': {
    guided: `// MISSION: CRUD Boot Camp
// Master insert, find, update, and delete operations

// Step 1: Insert a single document
db.agents.insertOne({
  name: "___BLANK___",
  role: "operative",
  level: ___BLANK___,
  active: true
});

// Step 2: Bulk insert multiple documents
db.agents.insertMany([
  { name: "Agent Alpha", role: "___BLANK___", level: 2 },
  { name: "Agent Beta", role: "analyst", level: ___BLANK___ }
]);

// Step 3: Query documents
db.agents.findOne({ name: "___BLANK___" });
db.agents.find({ role: "operative" });

// Step 4: Update a document using $set
db.agents.updateOne(
  { name: "Agent Alpha" },
  { ___BLANK___: { level: 5, active: true } }
);

// Step 5: Delete a document
db.agents.deleteOne({ name: "___BLANK___" });
`,
    challenge: `// MISSION: CRUD Boot Camp
// Perform all CRUD operations on the agents collection

// Insert a single agent document with name, role, level, and active fields
// YOUR CODE HERE

// Bulk insert at least 2 agent documents
// YOUR CODE HERE

// Query: find one agent by name, then find all with a specific role
// YOUR CODE HERE

// Update one agent's level using $set
// YOUR CODE HERE

// Delete one agent by name
// YOUR CODE HERE
`,
    expert: `// MISSION: CRUD Boot Camp
// Demonstrate mastery of all MongoDB CRUD operations
// Requirements:
//   - insertOne and insertMany
//   - findOne and find
//   - updateOne with $set
//   - deleteOne
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'Give your agent a name — any string like "Shadow"', answer: 'Shadow', xpPenalty: 15 },
        { line: 7, blankText: '___BLANK___', hint: 'Level is a number — try 1, 3, or 5', answer: '3', xpPenalty: 15 },
        { line: 13, blankText: '___BLANK___', hint: 'What role? "recon", "operative", or "analyst"', answer: 'recon', xpPenalty: 15 },
        { line: 14, blankText: '___BLANK___', hint: 'Pick a number for the level', answer: '3', xpPenalty: 15 },
        { line: 18, blankText: '___BLANK___', hint: 'Which agent do you want to find? Use a name you inserted', answer: 'Shadow', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'The operator to set fields is $set', answer: '$set', xpPenalty: 25 },
        { line: 28, blankText: '___BLANK___', hint: 'Which agent to delete? Use a name', answer: 'Agent Beta', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'insertOne takes a single document object: db.collection.insertOne({ field: value })', answer: 'db.agents.insertOne({ name: "Shadow", role: "operative", level: 3, active: true });', xpPenalty: 30 },
        { line: 7, blankText: '', hint: 'insertMany takes an array of documents: db.collection.insertMany([{...}, {...}])', answer: 'db.agents.insertMany([{ name: "Alpha", role: "recon", level: 2 }, { name: "Beta", role: "analyst", level: 1 }]);', xpPenalty: 30 },
      ],
    },
  },

  // ─── Mission 1: The Phantom Index ───
  'mission-1': {
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
  },

  // ─── Mission 3: The Aggregation Heist ───
  'mission-3': {
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
  },

  // ─── Mission 6: Rich Query Recon ───
  'mission-6': {
    guided: `// MISSION: Rich Query Recon
// Collection: customers (1M insurance records)

// Step 1: Compound query with nested fields
db.customers.find({
  gender: "___BLANK___",
  dob: {
    $gte: ISODate("1990-01-01"),
    $lte: ISODate("___BLANK___")
  },
  "address.state": "___BLANK___",
  policies: {
    $elemMatch: {
      policyType: "___BLANK___",
      "insured_person.smoker": ___BLANK___
    }
  }
});

// Step 2: Projections — return only needed fields
db.customers.find(
  { gender: "Female", "address.state": "UT" },
  { _id: 0, ___BLANK___ }
);

// Step 3: Sort and paginate
db.customers.find({ "address.state": "UT" })
  .sort({ ___BLANK___: ___BLANK___ })
  .limit(___BLANK___)
  .skip(___BLANK___);

// Step 4: Create compound index and verify
db.customers.createIndex({
  ___BLANK___
});

db.customers.find({
  gender: "Female",
  "address.state": "UT",
  dob: { $gte: ISODate("1990-01-01") }
}).explain("executionStats");
`,
    challenge: `// MISSION: Rich Query Recon
// Collection: customers — 1M insurance records
// Target: Female customers in Utah, born 1990+, life insurance, smoker

// Build compound query with $elemMatch on nested policies array
// YOUR CODE HERE

// Add projections to return only firstName, lastName, dob
// YOUR CODE HERE

// Sort by dob descending, paginate: page 2, 20 per page
// YOUR CODE HERE

// Create compound index and verify IXSCAN
// YOUR CODE HERE
`,
    expert: `// MISSION: Rich Query Recon
// Query 1M customer records efficiently.
// Requirements: compound query with $elemMatch, projections,
// sort/limit/skip pagination, compound index, explain verification.
`,
    hints: {
      guided: [
        { line: 6, blankText: '___BLANK___', hint: 'Target gender from the briefing', answer: 'Female', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'End date for the DOB range — e.g. "2000-12-31"', answer: '2000-12-31', xpPenalty: 15 },
        { line: 11, blankText: '___BLANK___', hint: 'Utah abbreviation', answer: 'UT', xpPenalty: 15 },
        { line: 14, blankText: '___BLANK___', hint: 'Insurance type from the briefing', answer: 'life', xpPenalty: 15 },
        { line: 15, blankText: '___BLANK___', hint: 'Boolean: is the person a smoker?', answer: 'true', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'List fields to include: firstName: 1, lastName: 1, dob: 1', answer: 'firstName: 1, lastName: 1, dob: 1', xpPenalty: 25 },
        { line: 28, blankText: '___BLANK___', hint: 'Sort by date of birth', answer: 'dob', xpPenalty: 15 },
        { line: 28, blankText: '___BLANK___', hint: '-1 for descending, 1 for ascending', answer: '-1', xpPenalty: 15 },
        { line: 29, blankText: '___BLANK___', hint: 'Page size — how many per page?', answer: '20', xpPenalty: 15 },
        { line: 30, blankText: '___BLANK___', hint: 'Skip = (page - 1) * pageSize. Page 2 = skip 20', answer: '20', xpPenalty: 15 },
        { line: 34, blankText: '___BLANK___', hint: 'Equality fields first (gender, address.state), range last (dob)', answer: 'gender: 1, "address.state": 1, dob: 1', xpPenalty: 40 },
      ],
      challenge: [
        { line: 5, blankText: '', hint: 'db.customers.find({ gender: "...", policies: { $elemMatch: { policyType: "...", ... } } })', answer: '', xpPenalty: 30 },
        { line: 14, blankText: '', hint: 'db.customers.createIndex({ equality1: 1, equality2: 1, range: 1 })', answer: '', xpPenalty: 40 },
      ],
    },
  },

  // ─── Mission 8: Analytics Extraction ───
  'mission-8': {
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
  },

  // ─── Mission 13: Geospatial Pursuit ───
  'mission-13': {
    guided: `// MISSION: Geospatial Pursuit
// Collection: assets — track operatives with GPS coordinates

// Step 1: Create a 2dsphere index
db.assets.createIndex({ ___BLANK___: "___BLANK___" });

// Step 2: Find assets within 5km of target point
db.assets.aggregate([
  { $geoNear: {
    near: { type: "Point", coordinates: [___BLANK___, ___BLANK___] },
    distanceField: "___BLANK___",
    maxDistance: ___BLANK___,
    spherical: true
  }}
]);

// Step 3: Find all assets within a polygon zone
db.assets.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "___BLANK___",
        coordinates: [[
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___]
        ]]
      }
    }
  }
});

// Step 4: Combine geo + regular filters
db.assets.find({
  location: { $geoWithin: { $centerSphere: [[___BLANK___, ___BLANK___], ___BLANK___] } },
  status: "___BLANK___"
});
`,
    challenge: `// MISSION: Geospatial Pursuit
// Collection: assets with location field (GeoJSON Point)

// Create a 2dsphere index on the location field
// YOUR CODE HERE

// Use $geoNear in an aggregation to find assets within 5km of a point
// YOUR CODE HERE

// Use $geoWithin with a $geometry Polygon to find assets in a zone
// YOUR CODE HERE

// Combine geo query with a status filter
// YOUR CODE HERE
`,
    expert: `// MISSION: Geospatial Pursuit
// Demonstrate 2dsphere indexing, $geoNear, $geoWithin with Polygon,
// and combined geo + non-geo queries on the assets collection.
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'The field containing GeoJSON data', answer: 'location', xpPenalty: 20 },
        { line: 5, blankText: '___BLANK___', hint: 'Index type for geographic data', answer: '2dsphere', xpPenalty: 25 },
        { line: 10, blankText: '___BLANK___', hint: 'Longitude, Latitude — e.g. -73.97, 40.77 (NYC)', answer: '-73.97, 40.77', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Field name to store calculated distance', answer: 'dist.calculated', xpPenalty: 20 },
        { line: 12, blankText: '___BLANK___', hint: '5km in meters = 5000', answer: '5000', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'GeoJSON shape type for an area', answer: 'Polygon', xpPenalty: 25 },
      ],
      challenge: [
        { line: 7, blankText: '', hint: '$geoNear: { near: { type: "Point", coordinates: [lng, lat] }, distanceField: "...", maxDistance: N }', answer: '', xpPenalty: 35 },
      ],
    },
  },

  // ─── Mission 14: Graph Infiltration ───
  'mission-14': {
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
  },

  // ─── Mission 15: Change Stream Stakeout ───
  'mission-15': {
    guided: `// MISSION: Change Stream Stakeout
// Collection: transactions — real-time surveillance

// Step 1: Open a change stream
const pipeline = [
  { $match: { "operationType": { $in: [___BLANK___] } } }
];
const changeStream = db.transactions.watch(___BLANK___);

// Step 2: Process change events
changeStream.on("change", (event) => {
  console.log("Type:", event.___BLANK___);
  console.log("Document:", event.___BLANK___);

  // Step 3: Store resume token
  const token = event.___BLANK___;
  saveToken(token);
});

// Step 4: Resume from stored token
const savedToken = loadToken();
const resumedStream = db.transactions.watch(pipeline, {
  resumeAfter: ___BLANK___
});
`,
    challenge: `// MISSION: Change Stream Stakeout
// Set up real-time change stream on transactions collection

// Open a change stream filtered for insert and update operations
// YOUR CODE HERE

// Handle change events — log operationType and fullDocument
// YOUR CODE HERE

// Store the resume token from each event
// YOUR CODE HERE

// Resume a stream from a saved token
// YOUR CODE HERE
`,
    expert: `// MISSION: Change Stream Stakeout
// Implement change stream surveillance with filtering,
// event handling, resume token persistence, and recovery.
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'Operation types to watch: "insert", "update", "delete"', answer: '"insert", "update"', xpPenalty: 25 },
        { line: 7, blankText: '___BLANK___', hint: 'Pass the pipeline array to watch()', answer: 'pipeline', xpPenalty: 15 },
        { line: 11, blankText: '___BLANK___', hint: 'Property for the type of change', answer: 'operationType', xpPenalty: 20 },
        { line: 12, blankText: '___BLANK___', hint: 'Property containing the changed document', answer: 'fullDocument', xpPenalty: 20 },
        { line: 15, blankText: '___BLANK___', hint: 'The token field on the event object', answer: '_id', xpPenalty: 25 },
        { line: 22, blankText: '___BLANK___', hint: 'Pass the saved token to resumeAfter', answer: 'savedToken', xpPenalty: 20 },
      ],
      challenge: [],
    },
  },

  // ─── Mission 16: Transaction Lockout ───
  'mission-16': {
    guided: `// MISSION: Transaction Lockout
// Execute ACID transactions across collections

// Step 1: Start a session
const session = client.___BLANK___();

// Step 2: Begin the transaction
session.startTransaction({
  readConcern: { level: "___BLANK___" },
  writeConcern: { w: "___BLANK___" }
});

// Step 3: Execute writes within the transaction
try {
  const accounts = client.db("bank").collection("accounts");

  // Debit source account
  await accounts.updateOne(
    { _id: "___BLANK___" },
    { $inc: { balance: ___BLANK___ } },
    { session }
  );

  // Credit destination account
  await accounts.updateOne(
    { _id: "___BLANK___" },
    { $inc: { balance: ___BLANK___ } },
    { session }
  );

  // Step 4: Commit
  await session.___BLANK___();
  console.log("Transfer complete");
} catch (error) {
  // Abort on failure
  await session.___BLANK___();
  console.log("Transfer aborted:", error);
} finally {
  session.endSession();
}
`,
    challenge: `// MISSION: Transaction Lockout
// Perform an atomic fund transfer using multi-document transactions

// Start a client session
// YOUR CODE HERE

// Begin transaction with snapshot readConcern and majority writeConcern
// YOUR CODE HERE

// Debit one account and credit another within the transaction
// YOUR CODE HERE

// Commit on success, abort on failure
// YOUR CODE HERE
`,
    expert: `// MISSION: Transaction Lockout
// Implement a multi-document ACID transaction for an atomic fund transfer.
// Must use: session, startTransaction, readConcern, writeConcern,
// commitTransaction, abortTransaction.
`,
    hints: {
      guided: [
        { line: 4, blankText: '___BLANK___', hint: 'Method to start a session on the client', answer: 'startSession', xpPenalty: 20 },
        { line: 8, blankText: '___BLANK___', hint: 'Read concern for transactions: "snapshot" gives consistent view', answer: 'snapshot', xpPenalty: 25 },
        { line: 9, blankText: '___BLANK___', hint: 'Write concern: "majority" ensures durability', answer: 'majority', xpPenalty: 25 },
        { line: 15, blankText: '___BLANK___', hint: 'Source account ID, e.g. "acct-001"', answer: 'acct-001', xpPenalty: 15 },
        { line: 16, blankText: '___BLANK___', hint: 'Negative amount for debit, e.g. -500', answer: '-500', xpPenalty: 20 },
        { line: 21, blankText: '___BLANK___', hint: 'Destination account ID', answer: 'acct-002', xpPenalty: 15 },
        { line: 22, blankText: '___BLANK___', hint: 'Positive amount for credit', answer: '500', xpPenalty: 20 },
        { line: 27, blankText: '___BLANK___', hint: 'Finalize the transaction', answer: 'commitTransaction', xpPenalty: 25 },
        { line: 31, blankText: '___BLANK___', hint: 'Roll back the transaction', answer: 'abortTransaction', xpPenalty: 25 },
      ],
      challenge: [],
    },
  },

  // ─── Mission 2: Shard Under Siege ───
  'mission-2': {
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
  },

  // ─── Mission 4: Connection Storm ───
  'mission-4': {
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
  },

  // ─── Mission 9: Scale-Out Siege ───
  'mission-9': {
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
  },

  // ─── Mission 10: Auto-HA Failover ───
  'mission-10': {
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
  },

  // ─── Mission 17: Text Search Infiltration ───
  'mission-17': {
    guided: `// MISSION: Text Search Infiltration
// Build Atlas Search indexes and queries

// Step 1: Define the search index (Atlas UI or API)
/*
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": { "type": "___BLANK___" },
      "content": { "type": "string", "analyzer": "___BLANK___" },
      "tags": { "type": "___BLANK___" }
    }
  }
}
*/

// Step 2: Fuzzy search query
db.documents.aggregate([
  { $search: {
    "text": {
      "query": "___BLANK___",
      "path": "___BLANK___",
      "fuzzy": { "maxEdits": ___BLANK___ }
    }
  }},
  { $limit: 10 }
]);

// Step 3: Autocomplete
db.documents.aggregate([
  { $search: {
    "autocomplete": {
      "query": "___BLANK___",
      "path": "title"
    }
  }},
  { $limit: 5 },
  { $project: { title: 1, score: { $meta: "searchScore" } } }
]);

// Step 4: Faceted search
db.documents.aggregate([
  { $searchMeta: {
    "facet": {
      "operator": { "text": { "query": "intelligence", "path": "content" } },
      "facets": {
        "___BLANK___": { "type": "string", "path": "___BLANK___" }
      }
    }
  }}
]);
`,
    challenge: `// MISSION: Text Search Infiltration
// Build Atlas Search: index definition, fuzzy search, autocomplete, facets

// Define a search index mapping for title, content, tags
// YOUR CODE HERE (as a JSON comment)

// Fuzzy text search on the content field
// YOUR CODE HERE

// Autocomplete on the title field
// YOUR CODE HERE

// Faceted search with $searchMeta
// YOUR CODE HERE
`,
    expert: `// MISSION: Text Search Infiltration
// Implement Atlas Search: define index mappings, build fuzzy text queries,
// autocomplete, and faceted search with $searchMeta.
`,
    hints: {
      guided: [
        { line: 10, blankText: '___BLANK___', hint: 'Atlas Search type for searchable text', answer: 'string', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Standard analyzer: "lucene.standard"', answer: 'lucene.standard', xpPenalty: 25 },
        { line: 12, blankText: '___BLANK___', hint: 'Type for array of strings', answer: 'string', xpPenalty: 15 },
        { line: 22, blankText: '___BLANK___', hint: 'Search term — e.g. "intelligense" (misspelled on purpose)', answer: 'intelligense', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'Which field to search in', answer: 'content', xpPenalty: 15 },
        { line: 24, blankText: '___BLANK___', hint: 'Max edit distance for fuzzy (1 or 2)', answer: '2', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Partial text to autocomplete — e.g. "intel"', answer: 'intel', xpPenalty: 15 },
        { line: 46, blankText: '___BLANK___', hint: 'Facet name — e.g. "byTag"', answer: 'byTag', xpPenalty: 20 },
        { line: 46, blankText: '___BLANK___', hint: 'Path to facet on — "tags"', answer: 'tags', xpPenalty: 20 },
      ],
      challenge: [],
    },
  },

  // ─── Mission 5: The Schema Saboteur ───
  'mission-5': {
    guided: `// MISSION: The Schema Saboteur
// Find and fix tampered validators

// Step 1: Audit all validators
db.getCollectionInfos({ type: "collection" }).forEach(c => {
  printjson({ name: c.name, validator: c.options.___BLANK___ });
});

// Step 2: Fix users collection
db.runCommand({
  collMod: "___BLANK___",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["___BLANK___", "___BLANK___", "___BLANK___"],
      properties: {
        email: { bsonType: "___BLANK___" },
        name: { bsonType: "string" },
        createdAt: { bsonType: "___BLANK___" }
      }
    }
  }
});

// Step 3: Fix transactions collection
db.runCommand({
  collMod: "transactions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["___BLANK___", "___BLANK___", "___BLANK___"],
      properties: {
        amount: { bsonType: "___BLANK___" },
        currency: { bsonType: "string" },
        timestamp: { bsonType: "date" }
      }
    }
  }
});

// Step 4: Fix sessions collection
db.runCommand({
  collMod: "sessions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["___BLANK___", "___BLANK___"],
      properties: {
        userId: { bsonType: "___BLANK___" },
        expiresAt: { bsonType: "___BLANK___" }
      }
    }
  }
});

// Step 5: Verify — invalid doc should be rejected
try {
  db.users.insertOne({ invalid: true });
  print("ERROR: Should have been rejected!");
} catch (e) {
  print("SUCCESS: " + e.message);
}
`,
    challenge: `// MISSION: The Schema Saboteur
// Audit and repair validators on users, transactions, and sessions

// Audit all collection validators
// YOUR CODE HERE

// Fix users collection — required: email, name, createdAt
// YOUR CODE HERE

// Fix transactions — required: amount, currency, timestamp
// YOUR CODE HERE

// Fix sessions — required: userId, expiresAt
// YOUR CODE HERE

// Verify: try inserting an invalid document
// YOUR CODE HERE
`,
    expert: `// MISSION: The Schema Saboteur
// Audit all collection validators, identify tampered rules,
// restore correct $jsonSchema on users, transactions, and sessions,
// then verify rejection of invalid documents.
`,
    hints: {
      guided: [
        { line: 6, blankText: '___BLANK___', hint: 'Property that holds the validation rules', answer: 'validator', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'First collection to fix', answer: 'users', xpPenalty: 15 },
        { line: 15, blankText: '___BLANK___', hint: 'Three required fields for users: email, name, createdAt', answer: 'email", "name", "createdAt', xpPenalty: 30 },
        { line: 17, blankText: '___BLANK___', hint: 'BSON type for email', answer: 'string', xpPenalty: 15 },
        { line: 19, blankText: '___BLANK___', hint: 'BSON type for a date', answer: 'date', xpPenalty: 15 },
        { line: 31, blankText: '___BLANK___', hint: 'Required fields for transactions', answer: 'amount", "currency", "timestamp', xpPenalty: 30 },
        { line: 33, blankText: '___BLANK___', hint: 'BSON type for money amount', answer: 'double', xpPenalty: 20 },
        { line: 45, blankText: '___BLANK___', hint: 'Required fields for sessions', answer: 'userId", "expiresAt', xpPenalty: 25 },
        { line: 47, blankText: '___BLANK___', hint: 'BSON type for a user ID (string or objectId)', answer: 'string', xpPenalty: 15 },
        { line: 48, blankText: '___BLANK___', hint: 'BSON type for expiry', answer: 'date', xpPenalty: 15 },
      ],
      challenge: [],
    },
  },

  // ─── Mission 7: Encryption Lockdown ───
  'mission-7': {
    guided: `// MISSION: Encryption Lockdown (CSFLE)
const { MongoClient, ClientEncryption } = require("mongodb");

// Step 1: Create DEK using ClientEncryption
const encryption = new ClientEncryption(client, {
  keyVaultNamespace: "encryption.___BLANK___",
  kmsProviders: {
    aws: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    }
  }
});

const dekId = await encryption.createDataKey("aws", {
  masterKey: { key: "arn:aws:kms:___BLANK___", region: "___BLANK___" },
  keyAltNames: ["___BLANK___"]
});

// Step 2: Define encryption schema map
const schemaMap = {
  "medical.patients": {
    bsonType: "object",
    encryptMetadata: { keyId: [dekId] },
    properties: {
      ssn: {
        encrypt: {
          bsonType: "string",
          algorithm: "___BLANK___"
        }
      }
    }
  }
};

// Step 3: Create encrypted MongoClient
const encryptedClient = new MongoClient(uri, {
  autoEncryption: {
    keyVaultNamespace: "encryption.__keyVault",
    kmsProviders: { aws: { accessKeyId: process.env.AWS_KEY, secretAccessKey: process.env.AWS_SECRET } },
    schemaMap: ___BLANK___
  }
});

// Step 4: Test insert and query
const patients = encryptedClient.db("medical").collection("patients");
await patients.insertOne({
  name: "Jane Doe",
  ssn: "123-45-6789",
  dob: new Date("1990-01-01")
});

const result = await patients.findOne({ ssn: "___BLANK___" });
console.log("Decrypted:", result);
`,
    challenge: `// MISSION: Encryption Lockdown
// Implement Client-Side Field Level Encryption

// Set up ClientEncryption and generate a Data Encryption Key
// YOUR CODE HERE

// Define an encryption schema map for the patients collection (ssn field)
// YOUR CODE HERE

// Create an encrypted MongoClient with autoEncryption
// YOUR CODE HERE

// Insert a patient document and query it to verify auto-decryption
// YOUR CODE HERE
`,
    expert: `// MISSION: Encryption Lockdown
// Implement CSFLE: create DEK with KMS, define encryption schema,
// build encrypted client, insert/query encrypted documents.
`,
    hints: {
      guided: [
        { line: 6, blankText: '___BLANK___', hint: 'Key vault collection name', answer: '__keyVault', xpPenalty: 25 },
        { line: 16, blankText: '___BLANK___', hint: 'AWS KMS key ARN region part', answer: 'us-east-1:12345', xpPenalty: 20 },
        { line: 16, blankText: '___BLANK___', hint: 'AWS region', answer: 'us-east-1', xpPenalty: 15 },
        { line: 17, blankText: '___BLANK___', hint: 'Key alias name — e.g. "patient-data-key"', answer: 'patient-data-key', xpPenalty: 15 },
        { line: 30, blankText: '___BLANK___', hint: 'For queryable fields use Deterministic; for non-queryable use Random', answer: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic', xpPenalty: 35 },
        { line: 43, blankText: '___BLANK___', hint: 'Pass the schema map variable', answer: 'schemaMap', xpPenalty: 15 },
        { line: 54, blankText: '___BLANK___', hint: 'Query with the SSN value — auto-encrypts for matching', answer: '123-45-6789', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'new ClientEncryption(client, { keyVaultNamespace: "encryption.__keyVault", kmsProviders: { ... } })', answer: '', xpPenalty: 35 },
      ],
    },
  },

  // ─── Mission 11: Deployment Automation ───
  'mission-11': {
    guided: `// MISSION: Deployment Automation (Terraform)

// Step 1: Define the Terraform resource
/*
resource "mongodbatlas_cluster" "heist_cluster" {
  project_id = var.atlas_project_id
  name       = "___BLANK___"

  provider_name = "___BLANK___"
  region_name   = "___BLANK___"

  replication_specs {
    num_shards = 1
    regions_config {
      region_name = "US_EAST_1"
      electable_specs {
        instance_size = "___BLANK___"
        node_count    = ___BLANK___
      }
    }
  }

  cloud_backup = ___BLANK___
}
*/

// Step 2: Run Terraform commands
// terraform ___BLANK___
// terraform ___BLANK___ -out=tfplan
// terraform ___BLANK___ tfplan

// Step 3: Verify deployment
// mongosh "mongodb+srv://heist-production.example.net" --eval "db.adminCommand({hello:1})"
`,
    challenge: `// MISSION: Deployment Automation
// Write Terraform config for an Atlas cluster

// Define mongodbatlas_cluster resource with name, provider, region, specs
// YOUR CODE HERE (as Terraform HCL in a comment block)

// List the 3 Terraform commands to deploy (init, plan, apply)
// YOUR CODE HERE

// Write the verification command
// YOUR CODE HERE
`,
    expert: `// MISSION: Deployment Automation
// Provision a production Atlas cluster using Terraform.
// Define the resource, configure specs, and deploy.
`,
    hints: {
      guided: [
        { line: 7, blankText: '___BLANK___', hint: 'Cluster name — e.g. "heist-production"', answer: 'heist-production', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'Cloud provider: "AWS", "GCP", or "AZURE"', answer: 'AWS', xpPenalty: 15 },
        { line: 10, blankText: '___BLANK___', hint: 'AWS region — e.g. "US_EAST_1"', answer: 'US_EAST_1', xpPenalty: 15 },
        { line: 17, blankText: '___BLANK___', hint: 'Instance tier — M10 is smallest dedicated', answer: 'M10', xpPenalty: 20 },
        { line: 18, blankText: '___BLANK___', hint: 'Number of electable nodes (3 for HA)', answer: '3', xpPenalty: 20 },
        { line: 23, blankText: '___BLANK___', hint: 'Enable cloud backup? true/false', answer: 'true', xpPenalty: 15 },
        { line: 27, blankText: '___BLANK___', hint: 'First Terraform command to initialize', answer: 'init', xpPenalty: 15 },
        { line: 28, blankText: '___BLANK___', hint: 'Second command to preview changes', answer: 'plan', xpPenalty: 15 },
        { line: 29, blankText: '___BLANK___', hint: 'Third command to execute', answer: 'apply', xpPenalty: 15 },
      ],
      challenge: [],
    },
  },

  // ─── Mission 18: Time Series Infiltration ───
  'mission-18': {
    guided: `// MISSION: Time Series Infiltration
// Create and query time series collections for IoT sensor data

// Step 1: Create a time series collection
db.createCollection("sensor_readings", {
  timeseries: {
    timeField: "___BLANK___",
    metaField: "___BLANK___",
    granularity: "___BLANK___"
  }
});

// Step 2: Insert sensor readings
db.sensor_readings.insertMany([
  { timestamp: new Date(), metadata: { deviceId: "___BLANK___", type: "temperature" }, value: 22.5 },
  { timestamp: new Date(), metadata: { deviceId: "sensor-001", type: "___BLANK___" }, value: 1013.25 },
  { timestamp: new Date(), metadata: { deviceId: "sensor-002", type: "temperature" }, value: ___BLANK___ }
]);

// Step 3: Windowed aggregation with $dateTrunc
db.sensor_readings.aggregate([
  { $group: {
    _id: {
      device: "$metadata.deviceId",
      bucket: { $dateTrunc: { date: "$___BLANK___", unit: "___BLANK___" } }
    },
    avgValue: { $___BLANK___: "$value" },
    count: { $sum: 1 }
  }},
  { $sort: { "_id.bucket": 1 } }
]);

// Step 4: Anomaly detection — find readings above threshold
db.sensor_readings.aggregate([
  { $match: { value: { $___BLANK___: ___BLANK___ } } },
  { $project: { timestamp: 1, "metadata.deviceId": 1, value: 1, _id: 0 } }
]);
`,
    challenge: `// MISSION: Time Series Infiltration
// Work with time series collections for IoT data

// Create a time series collection with timeField, metaField, and granularity
// YOUR CODE HERE

// Insert at least 3 timestamped sensor readings with metadata
// YOUR CODE HERE

// Build a windowed aggregation grouping by device and time bucket
// YOUR CODE HERE

// Find anomalous readings above a threshold
// YOUR CODE HERE
`,
    expert: `// MISSION: Time Series Infiltration
// Create time series collections, insert IoT sensor data,
// run windowed aggregations with $dateTrunc, and detect anomalies.
`,
    hints: {
      guided: [
        { line: 7, blankText: '___BLANK___', hint: 'The field containing timestamps', answer: 'timestamp', xpPenalty: 20 },
        { line: 8, blankText: '___BLANK___', hint: 'The field containing device metadata', answer: 'metadata', xpPenalty: 20 },
        { line: 9, blankText: '___BLANK___', hint: 'Granularity: "seconds", "minutes", or "hours"', answer: 'minutes', xpPenalty: 20 },
        { line: 14, blankText: '___BLANK___', hint: 'Device identifier, e.g. "sensor-001"', answer: 'sensor-001', xpPenalty: 15 },
        { line: 15, blankText: '___BLANK___', hint: 'Sensor type: "pressure", "humidity", etc.', answer: 'pressure', xpPenalty: 15 },
        { line: 16, blankText: '___BLANK___', hint: 'A temperature value as a number', answer: '25.1', xpPenalty: 15 },
        { line: 24, blankText: '___BLANK___', hint: 'Date field name for $dateTrunc', answer: 'timestamp', xpPenalty: 20 },
        { line: 24, blankText: '___BLANK___', hint: 'Time bucket unit: "hour", "minute", "day"', answer: 'hour', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Accumulator for average', answer: 'avg', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Comparison operator for "greater than"', answer: 'gt', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Threshold value, e.g. 30', answer: '30', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'db.createCollection("name", { timeseries: { timeField: "...", metaField: "...", granularity: "..." } })', answer: '', xpPenalty: 30 },
        { line: 10, blankText: '', hint: 'Use $dateTrunc: { date: "$field", unit: "hour" } inside $group._id', answer: '', xpPenalty: 35 },
      ],
    },
  },

  // ─── Mission 19: Vector Heist ───
  'mission-19': {
    guided: `// MISSION: Vector Heist
// Build Atlas Vector Search for semantic document retrieval

// Step 1: Define vector search index (Atlas UI/API)
/*
{
  "fields": [{
    "type": "vector",
    "path": "___BLANK___",
    "numDimensions": ___BLANK___,
    "similarity": "___BLANK___"
  }]
}
*/

// Step 2: Generate and store embeddings
// (Assume getEmbedding() returns a vector array)
const docs = [
  { title: "MongoDB Sharding", content: "...", embedding: await getEmbedding("MongoDB Sharding") },
  { title: "___BLANK___", content: "...", embedding: await getEmbedding("___BLANK___") }
];
db.documents.insertMany(docs);

// Step 3: Perform $vectorSearch
db.documents.aggregate([
  { $vectorSearch: {
    index: "___BLANK___",
    path: "___BLANK___",
    queryVector: await getEmbedding("how to scale a database"),
    numCandidates: ___BLANK___,
    limit: ___BLANK___
  }},
  { $project: { title: 1, score: { $meta: "___BLANK___" } } }
]);

// Step 4: Vector search with pre-filter
db.documents.aggregate([
  { $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector: await getEmbedding("encryption best practices"),
    numCandidates: 100,
    limit: 5,
    filter: { "category": "___BLANK___" }
  }}
]);
`,
    challenge: `// MISSION: Vector Heist
// Implement semantic search with Atlas Vector Search

// Define a vector search index definition (as JSON comment)
// YOUR CODE HERE

// Insert documents with embedding vectors
// YOUR CODE HERE

// Perform a $vectorSearch query with numCandidates and limit
// YOUR CODE HERE

// Add a pre-filter to vector search to narrow results by category
// YOUR CODE HERE
`,
    expert: `// MISSION: Vector Heist
// Implement Atlas Vector Search: define index, store embeddings,
// run $vectorSearch queries, and combine with pre-filters.
`,
    hints: {
      guided: [
        { line: 9, blankText: '___BLANK___', hint: 'Path to the vector field in documents', answer: 'embedding', xpPenalty: 20 },
        { line: 10, blankText: '___BLANK___', hint: 'Number of dimensions (common: 768, 1536)', answer: '1536', xpPenalty: 25 },
        { line: 11, blankText: '___BLANK___', hint: 'Similarity function: "cosine", "euclidean", or "dotProduct"', answer: 'cosine', xpPenalty: 25 },
        { line: 18, blankText: '___BLANK___', hint: 'A document title — any topic', answer: 'ACID Transactions', xpPenalty: 15 },
        { line: 25, blankText: '___BLANK___', hint: 'Name of your search index', answer: 'vector_index', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Path to embedding field', answer: 'embedding', xpPenalty: 15 },
        { line: 28, blankText: '___BLANK___', hint: 'How many candidates to consider (50-200)', answer: '100', xpPenalty: 20 },
        { line: 29, blankText: '___BLANK___', hint: 'Max results to return (5-10)', answer: '5', xpPenalty: 15 },
        { line: 31, blankText: '___BLANK___', hint: 'Score metadata field name', answer: 'vectorSearchScore', xpPenalty: 25 },
        { line: 41, blankText: '___BLANK___', hint: 'Category to filter on — e.g. "security"', answer: 'security', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'Index needs: type "vector", path to embedding field, numDimensions, similarity', answer: '', xpPenalty: 35 },
        { line: 10, blankText: '', hint: '$vectorSearch: { index, path, queryVector, numCandidates, limit }', answer: '', xpPenalty: 35 },
      ],
    },
  },

  // ─── Mission 20: Schema Evolution ───
  'mission-20': {
    guided: `// MISSION: Schema Evolution
// In-place schema changes without downtime

// Step 1: Rename fields
db.users.updateMany(
  {},
  { $rename: { "___BLANK___": "___BLANK___" } }
);

// Step 2: Remove deprecated fields
db.users.updateMany(
  {},
  { $unset: { "___BLANK___": "", "___BLANK___": "" } }
);

// Step 3: Add default values to existing documents
db.users.updateMany(
  { ___BLANK___: { $exists: false } },
  { $set: { ___BLANK___: "___BLANK___" } }
);

// Step 4: Query polymorphic documents
// Find documents that have the new field format
db.users.find({
  email: { $exists: true },
  profileVersion: { $___BLANK___: "___BLANK___" }
});

// Find documents with specific field types
db.users.find({
  age: { $type: "___BLANK___" }
});
`,
    challenge: `// MISSION: Schema Evolution
// Perform in-place schema changes on the users collection

// Rename a field (e.g. "userName" -> "handle")
// YOUR CODE HERE

// Remove deprecated fields
// YOUR CODE HERE

// Add default values to documents missing a field
// YOUR CODE HERE

// Query documents by field existence ($exists) and type ($type)
// YOUR CODE HERE
`,
    expert: `// MISSION: Schema Evolution
// Demonstrate in-place schema changes: $rename, $unset, $set defaults,
// and handle polymorphic schemas with $exists and $type queries.
`,
    hints: {
      guided: [
        { line: 6, blankText: '___BLANK___', hint: 'Old field name to rename, e.g. "userName"', answer: 'userName', xpPenalty: 15 },
        { line: 6, blankText: '___BLANK___', hint: 'New field name, e.g. "handle"', answer: 'handle', xpPenalty: 15 },
        { line: 12, blankText: '___BLANK___', hint: 'First deprecated field to remove', answer: 'legacyId', xpPenalty: 15 },
        { line: 12, blankText: '___BLANK___', hint: 'Second deprecated field to remove', answer: 'oldEmail', xpPenalty: 15 },
        { line: 18, blankText: '___BLANK___', hint: 'Field name to check for existence', answer: 'profileVersion', xpPenalty: 20 },
        { line: 19, blankText: '___BLANK___', hint: 'Same field name to set', answer: 'profileVersion', xpPenalty: 15 },
        { line: 19, blankText: '___BLANK___', hint: 'Default value, e.g. "v2"', answer: 'v2', xpPenalty: 15 },
        { line: 25, blankText: '___BLANK___', hint: 'Comparison operator, e.g. "gte"', answer: 'gte', xpPenalty: 20 },
        { line: 25, blankText: '___BLANK___', hint: 'Version to compare, e.g. "v2"', answer: 'v2', xpPenalty: 15 },
        { line: 30, blankText: '___BLANK___', hint: 'BSON type name: "number", "string", "int", "double"', answer: 'number', xpPenalty: 20 },
      ],
      challenge: [],
    },
  },
};

/**
 * Helper: get skeleton code for a mission at a given difficulty.
 * Falls back to guided if difficulty not found.
 */
export function getSkeletonForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert'): string {
  const skeleton = MISSION_SKELETONS[missionId];
  if (!skeleton) return `// Mission: ${missionId}\n// Write your MongoDB commands here\n`;
  return skeleton[difficulty] || skeleton.guided;
}

/**
 * Get hints for a mission at a given difficulty.
 */
export function getHintsForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert') {
  const skeleton = MISSION_SKELETONS[missionId];
  if (!skeleton || difficulty === 'expert') return [];
  return skeleton.hints[difficulty as 'guided' | 'challenge'] || [];
}
