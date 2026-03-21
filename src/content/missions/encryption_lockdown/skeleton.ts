import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
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
  };
