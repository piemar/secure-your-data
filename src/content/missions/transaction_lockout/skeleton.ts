import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
