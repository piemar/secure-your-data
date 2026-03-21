import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
