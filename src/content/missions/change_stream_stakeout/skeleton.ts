import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
