import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
