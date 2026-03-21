import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
  guided: `// MISSION: CSFLE Key Vault Bootstrap
// Goal: protect orthogonal_matrix using Client-Side Field Level Encryption

// Step 1: Key vault and encrypted path
const keyVaultNamespace = "___BLANK___";
const encryptedPath = "___BLANK___";

// Step 2: Data key creation
const keyId = await clientEncryption.createDataKey("___BLANK___", {
  keyAltNames: ["___BLANK___"]
});

// Step 3: Schema map (automatic encryption)
const schemaMap = {
  "obfuscation_db.obfuscation_config": {
    bsonType: "object",
    properties: {
      orthogonal_matrix: {
        encrypt: {
          keyId: [keyId],
          bsonType: "___BLANK___",
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-___BLANK___"
        }
      }
    }
  }
};

// Step 4: Write + read (driver decrypts transparently)
await db.obfuscation_config.insertOne({
  _id: "matrix-v1",
  orthogonal_matrix: ___BLANK___,
  keyAltName: "vector-matrix-key"
});
db.obfuscation_config.findOne({ _id: "___BLANK___" });
`,
  challenge: `// MISSION: CSFLE Key Vault Bootstrap
// Configure CSFLE for obfuscation_config.orthogonal_matrix.
// Include: key vault namespace, data key alias, schema map, encrypted write + read.
`,
  expert: `// MISSION: CSFLE Key Vault Bootstrap
// Implement end-to-end CSFLE setup for orthogonal_matrix using key vault + schema map.
`,
  hints: {
    guided: [
      { line: 5, blankText: '___BLANK___', hint: 'Use encryption_vault.keyVault from the reference architecture', answer: 'encryption_vault.keyVault', xpPenalty: 20 },
      { line: 6, blankText: '___BLANK___', hint: 'Encrypt the matrix field in obfuscation_config', answer: 'orthogonal_matrix', xpPenalty: 20 },
      { line: 9, blankText: '___BLANK___', hint: 'CSFLE examples typically use local KMS for demos', answer: 'local', xpPenalty: 20 },
      { line: 10, blankText: '___BLANK___', hint: 'Key alias used by your app for matrix encryption', answer: 'vector-matrix-key', xpPenalty: 15 },
      { line: 21, blankText: '___BLANK___', hint: 'A matrix is stored as an array-of-arrays', answer: 'array', xpPenalty: 25 },
      { line: 22, blankText: '___BLANK___', hint: 'Algorithm suffix in README is Random', answer: 'Random', xpPenalty: 20 },
      { line: 31, blankText: '___BLANK___', hint: 'Use a nested numeric matrix value', answer: '[[0.0, 1.0], [1.0, 0.0]]', xpPenalty: 15 },
      { line: 34, blankText: '___BLANK___', hint: 'Use the same _id you inserted', answer: 'matrix-v1', xpPenalty: 10 },
    ],
    challenge: [
      { line: 2, blankText: '', hint: 'Model the same flow as README: key vault -> data key -> schema map -> encrypted write', answer: '', xpPenalty: 30 },
      { line: 3, blankText: '', hint: 'Field to encrypt is orthogonal_matrix in obfuscation_config', answer: '', xpPenalty: 25 },
    ],
  },
};
