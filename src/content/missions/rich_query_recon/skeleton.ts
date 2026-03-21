import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
