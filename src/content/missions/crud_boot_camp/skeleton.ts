import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
