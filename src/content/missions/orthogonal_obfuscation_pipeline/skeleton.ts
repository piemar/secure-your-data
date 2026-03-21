import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
  guided: `// MISSION: Orthogonal Obfuscation Pipeline
// Goal: preserve semantic search quality while storing obfuscated vectors only

// Step 1: Build embedding input from payment descriptions
const descriptions = ["Morning Coffee", "Cloud Infrastructure Upgrade", "Data Security Audit"];
const rawVectors = await ollama.embed({
  model: "___BLANK___",
  input: descriptions
});

// Step 2: Apply obfuscation: v' = v x M
const matrix = loadOrthogonalMatrix();
const obfuscatedVectors = rawVectors.map((v) => multiplyVectorByMatrix(v, ___BLANK___));

// Step 3: Persist transactions with obfuscated vectors only
db.transactions.insertMany([
  {
    merchant: "Starbeans",
    amount: 150,
    description: "Morning Coffee",
    obfuscated_vector: obfuscatedVectors[0],
    vectorDimension: ___BLANK___
  }
]);

// Step 4: Telemetry for observability
db.audit_logs.insertOne({
  eventType: "___BLANK___",
  latencyMs: 14,
  vectorDimension: obfuscatedVectors[0].length,
  model: "voyage-4-nano"
});
`,
  challenge: `// MISSION: Orthogonal Obfuscation Pipeline
// Implement end-to-end embedding + orthogonal obfuscation + obfuscated persistence + telemetry.
`,
  expert: `// MISSION: Orthogonal Obfuscation Pipeline
// Build a production-style obfuscation write path with dimensionality checks and observability.
`,
  hints: {
    guided: [
      { line: 7, blankText: '___BLANK___', hint: 'README uses voyage-4-nano as the embedding model', answer: 'voyage-4-nano', xpPenalty: 20 },
      { line: 13, blankText: '___BLANK___', hint: 'Multiply using the loaded orthogonal matrix', answer: 'matrix', xpPenalty: 20 },
      { line: 23, blankText: '___BLANK___', hint: 'Persist the vector dimension for diagnostics', answer: 'obfuscatedVectors[0].length', xpPenalty: 15 },
      { line: 29, blankText: '___BLANK___', hint: 'Use the audit event type from search pipeline logs', answer: 'VECTOR_OBFUSCATION_WRITE', xpPenalty: 15 },
    ],
    challenge: [
      { line: 2, blankText: '', hint: 'Pipeline order: embed -> obfuscate -> persist obfuscated_vector -> log metrics', answer: '', xpPenalty: 30 },
      { line: 2, blankText: '', hint: 'Never persist plaintext embedding when mission objective says obfuscation-only', answer: '', xpPenalty: 25 },
    ],
  },
};
