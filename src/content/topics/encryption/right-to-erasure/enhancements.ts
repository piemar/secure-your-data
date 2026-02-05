import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Right to Erasure (Lab 3) Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md (CSFLE - advanced patterns)
 *
 * Replace placeholders with values from the Setup Wizard:
 * - YOUR_MONGO_URI: Connection string from Lab Setup
 * - YOUR_SUFFIX: User suffix from Lab Setup (e.g., test-suffix)
 * - alias/mongodb-lab-key-YOUR_SUFFIX: KMS alias from Lab 1
 * - YOUR_AWS_REGION: AWS region (e.g., eu-central-1)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'right-to-erasure.explicit-encryption': {
    id: 'right-to-erasure.explicit-encryption',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'CSFLE - Migration',
    codeBlocks: [
      {
        filename: 'migrateToCSFLE.cjs (Node.js)',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "YOUR_MONGO_URI";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const keyVaultDB = client.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: "user-YOUR_SUFFIX-ssn-key"
  });

  if (!keyDoc) {
    throw new Error("DEK not found! Run createKey.cjs from Lab 1 first.");
  }
  const dekId = keyDoc._id;

  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const legacyDB = client.db("medical");
  const legacyCollection = legacyDB.collection("patients_legacy");
  const secureCollection = legacyDB.collection("patients_secure");

  const legacyCount = await legacyCollection.countDocuments();
  if (legacyCount === 0) {
    await legacyCollection.insertMany([
      { name: "John Doe", ssn: "111-22-3333", dob: "1980-01-01" },
      { name: "Jane Smith", ssn: "444-55-6666", dob: "1985-05-15" },
      { name: "Bob Johnson", ssn: "777-88-9999", dob: "1990-10-20" }
    ]);
  }

  const legacyDocs = await legacyCollection.find({}).toArray();
  for (const doc of legacyDocs) {
    const encryptedSSN = await encryption.encrypt(doc.ssn, {
      algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      keyId: dekId
    });
    await secureCollection.insertOne({ ...doc, ssn: encryptedSSN });
  }

  console.log("Migration complete!");
  await client.close();
}
run().catch(console.error);`,
        skeleton: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "YOUR_MONGO_URI";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };
  const client = await MongoClient.connect(uri);

  const keyVaultDB = client.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: "user-YOUR_SUFFIX-ssn-key"
  });
  const dekId = keyDoc._id;

  const encryption = new ________________(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const legacyCollection = client.db("medical").collection("patients_legacy");
  const secureCollection = client.db("medical").collection("patients_secure");
  const legacyDocs = await legacyCollection.find({}).toArray();

  for (const doc of legacyDocs) {
    const encryptedSSN = await encryption._________(doc.ssn, {
      algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-____________",
      keyId: dekId
    });
    await secureCollection.insertOne({ ...doc, ssn: encryptedSSN });
  }
  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 18, blankText: '______', hint: 'Method to retrieve a single document', answer: 'findOne' },
          { line: 23, blankText: '________________', hint: 'Class for manual encryption operations', answer: 'ClientEncryption' },
          { line: 33, blankText: '_________', hint: 'Method to encrypt a value manually', answer: 'encrypt' },
          { line: 34, blankText: '____________', hint: 'Algorithm suffix for queryable encryption', answer: 'Deterministic' },
        ],
      },
      {
        filename: 'Terminal - Run the script',
        language: 'bash',
        code: `# Replace placeholders in migrateToCSFLE.cjs, then run:
node migrateToCSFLE.cjs

# Expected: Migration complete! Migrated 3 documents.`,
      },
    ],
    tips: [
      'Replace YOUR_MONGO_URI and YOUR_SUFFIX with values from the Setup Wizard.',
      'Use explicit encryption for migration - automatic encryption expects ciphertext.',
      'Deterministic encryption preserves query capabilities on PII.',
      'Verify: Query secure collection without CSFLE to see Binary ciphertext.',
    ],
  },

  'right-to-erasure.multi-tenant-keys': {
    id: 'right-to-erasure.multi-tenant-keys',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'CSFLE - Multi-Tenant',
    codeBlocks: [
      {
        filename: 'multiTenantIsolation.cjs (Node.js)',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "YOUR_MONGO_URI";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const tenants = ["acme", "contoso", "fabrikam"];
  for (const tenantId of tenants) {
    const keyAltName = \`tenant-\${tenantId}\`;
    const existingKey = await keyVaultDB.collection("__keyVault").findOne({
      keyAltNames: keyAltName
    });
    if (!existingKey) {
      const dekId = await encryption.createDataKey("aws", {
        masterKey: {
          key: "alias/mongodb-lab-key-YOUR_SUFFIX",
          region: "YOUR_AWS_REGION"
        },
        keyAltNames: [keyAltName]
      });
      console.log(\`Created DEK for tenant: \${tenantId}\`);
    }
  }
  await client.close();
}
run().catch(console.error);`,
        skeleton: `const tenants = ["acme", "contoso", "fabrikam"];
for (const tenantId of tenants) {
  const keyAltName = \`_______-\${tenantId}\`;
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({
    ___________: keyAltName
  });
  if (!existingKey) {
    const dekId = await encryption.____________("aws", {
      masterKey: { key: "alias/mongodb-lab-key-YOUR_SUFFIX", region: "YOUR_AWS_REGION" },
      keyAltNames: [keyAltName]
    });
  }
}`,
        inlineHints: [
          { line: 3, blankText: '_______', hint: 'Prefix for tenant-specific key names', answer: 'tenant' },
          { line: 7, blankText: '___________', hint: 'Field to query for existing DEK names', answer: 'keyAltNames' },
          { line: 10, blankText: '____________', hint: 'Method to generate a new Data Encryption Key', answer: 'createDataKey' },
        ],
      },
    ],
    tips: [
      'One DEK per tenant ensures blast radius isolation if a key is compromised.',
      'Use keyAltNames like "tenant-{tenantId}" for dynamic DEK lookup.',
      'Enables per-tenant crypto-shredding for GDPR compliance.',
    ],
  },

  'right-to-erasure.key-rotation': {
    id: 'right-to-erasure.key-rotation',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'CSFLE - Key Rotation',
    codeBlocks: [
      {
        filename: 'rotateCMK.cjs (Node.js)',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "YOUR_MONGO_URI";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = { aws: { ... } };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-YOUR_SUFFIX-ssn-key";
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: keyAltName
  });
  if (!keyDoc) throw new Error("DEK not found");

  const newCMKAlias = "alias/mongodb-lab-key-YOUR_SUFFIX";
  const result = await encryption.rewrapManyDataKey(
    { keyAltNames: keyAltName },
    {
      provider: "aws",
      masterKey: { key: newCMKAlias, region: "YOUR_AWS_REGION" }
    }
  );

  console.log("Rotation complete! Modified:", result.bulkWriteResult.modifiedCount);
  await client.close();
}
run().catch(console.error);`,
        skeleton: `const keyAltName = "user-YOUR_SUFFIX-___-key";
const keyDoc = await keyVaultDB.collection("__keyVault").______({
  keyAltNames: keyAltName
});

const result = await encryption.___________________(
  { ___________: keyAltName },
  {
    provider: "aws",
    masterKey: { key: newCMKAlias, region: "YOUR_AWS_REGION" }
  }
);`,
        inlineHints: [
          { line: 1, blankText: '___', hint: 'Field name in keyAltName pattern', answer: 'ssn' },
          { line: 3, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 6, blankText: '___________________', hint: 'Method to rotate DEKs to a new CMK', answer: 'rewrapManyDataKey' },
          { line: 7, blankText: '___________', hint: 'Field to filter which DEKs to rotate', answer: 'keyAltNames' },
        ],
      },
    ],
    tips: [
      'rewrapManyDataKey is metadata-only - no data re-encryption required.',
      'Old CMK must be accessible during rotation to decrypt the DEK.',
      'In production, use a NEW CMK alias (e.g., alias/mongodb-lab-key-v2).',
    ],
  },

  'right-to-erasure.rotation-readiness': {
    id: 'right-to-erasure.rotation-readiness',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'CSFLE - Infrastructure',
    codeBlocks: [
      {
        filename: 'AWS CLI - Verify CMK',
        language: 'bash',
        code: `# 1. List KMS aliases
aws kms list-aliases --query "Aliases[?contains(AliasName, 'mongodb')].AliasName" --output table

# 2. Verify key exists and is enabled
aws kms describe-key --key-id "alias/mongodb-lab-key-YOUR_SUFFIX"

# 3. Get key policy
KEY_ID=$(aws kms describe-key --key-id "alias/mongodb-lab-key-YOUR_SUFFIX" --query 'KeyMetadata.KeyId' --output text)
aws kms get-key-policy --key-id $KEY_ID --policy-name default

# 4. Test encrypt/decrypt
aws kms encrypt --key-id "alias/mongodb-lab-key-YOUR_SUFFIX" --plaintext "test" --output text --query CiphertextBlob`,
        skeleton: `# List KMS aliases
aws kms ____________ --query "Aliases[?contains(AliasName, 'mongodb')].AliasName" --output table

# Verify key
aws kms ____________ --key-id "alias/mongodb-lab-key-YOUR_SUFFIX"

# Get key ID
KEY_ID=$(aws kms describe-key --key-id "alias/mongodb-lab-key-YOUR_SUFFIX" --query 'KeyMetadata._______' --output text)

# Get policy
aws kms ______________ --key-id $KEY_ID --policy-name default

# Test encrypt
aws kms _______ --key-id "alias/mongodb-lab-key-YOUR_SUFFIX" --plaintext "test" --output text --query CiphertextBlob`,
        inlineHints: [
          { line: 3, blankText: '____________', hint: 'AWS KMS command to list aliases', answer: 'list-aliases' },
          { line: 6, blankText: '____________', hint: 'AWS KMS command to get key details', answer: 'describe-key' },
          { line: 9, blankText: '_______', hint: 'JMESPath query for key identifier', answer: 'KeyId' },
          { line: 12, blankText: '______________', hint: 'AWS KMS command to get key policy', answer: 'get-key-policy' },
          { line: 15, blankText: '_______', hint: 'AWS KMS command to encrypt', answer: 'encrypt' },
        ],
      },
    ],
    tips: [
      'Verify KeyState is "Enabled" before rotation.',
      'Ensure IAM principal has Encrypt and Decrypt permissions.',
      'Run a test encrypt/decrypt round trip to validate access.',
    ],
  },
};
