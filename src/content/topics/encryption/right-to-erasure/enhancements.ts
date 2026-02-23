import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Right to Erasure (Lab 3) Enhancement Metadata
 *
 * Lab 3 is content-driven: rendered via LabRunner; step content (codeBlocks, skeleton,
 * inlineHints) comes from this file. See Docs/LAB_IMPLEMENTATION_PATHS.md.
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md (CSFLE - advanced patterns)
 *
 * Replace placeholders with values from the Setup Wizard:
 * - YOUR_MONGO_URI: Connection string from Lab Setup
 * - YOUR_SUFFIX: firstname-lastname from Lab Setup (alias format: alias/mongodb-lab-key-<firstname>-<lastname>)
 * - KMS alias in Lab 1 must match: alias/mongodb-lab-key-<firstname>-<lastname> (e.g. alias/mongodb-lab-key-pierre-petersson)
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
        filename: 'migrateToCSFLE.cjs',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";
const keyAltName = "user-YOUR_SUFFIX-ssn-key";

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
    keyAltNames: keyAltName
  });

  let dekId;
  if (!keyDoc) {
    const enc = new ClientEncryption(client, { keyVaultNamespace, kmsProviders });
    const region = process.env.AWS_REGION || "eu-central-1";
    const masterKeyAlias = "alias/mongodb-lab-key-" + keyAltName.replace(/^user-(.+)-ssn-key$/, "$1");
    try {
      dekId = await enc.createDataKey("aws", { masterKey: { key: masterKeyAlias, region }, keyAltNames: [keyAltName] });
      console.log("Created DEK for migration (AWS KMS, keyAltName:", keyAltName + ")");
    } catch (err) {
      throw new Error("DEK not found and could not create with AWS. Create the KMS key and alias in Lab 1 (" + masterKeyAlias + "), run createKey.cjs, then run this script again. " + (err.message || err));
    }
  } else {
    const provider = keyDoc.masterKey && keyDoc.masterKey.provider;
    if (provider === "local") {
      throw new Error(
        "Existing DEK was created with local KMS. Lab 3 uses only AWS. Remove the DEK: in mongosh run " +
        "db.getSiblingDB('encryption').getCollection('__keyVault').deleteOne({ keyAltNames: '" + keyAltName + "' }). " +
        "Then create the KMS alias in Lab 1, run createKey.cjs, and run this script again."
      );
    }
    dekId = keyDoc._id;
  }

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

  await secureCollection.drop().catch(() => {});
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
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No client-side field encryption. Application must encrypt before insert.
-- Using pgcrypto extension for deterministic encryption (allows equality search only).

-- Enable extension once: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Application code (Node.js) would:
-- 1. Encrypt SSN before insert: encrypt(doc.ssn, 'key', 'aes')
-- 2. Store ciphertext in column ssn_encrypted
-- 3. To query: decrypt in application or use deterministic encryption for equality

INSERT INTO patients_secure (name, ssn_encrypted, dob)
SELECT name, encrypt(ssn::bytea, 'key'::bytea, 'aes'), dob
FROM patients_legacy;

-- No built-in key vault; key management is application responsibility.
-- No queryable encryption: range/prefix queries on encrypted data not supported.`,
            workaroundNote: 'PostgreSQL has no client-side field encryption. Use pgcrypto or application-level encryption; key vault and queryable encryption are not built-in.',
            challenges: [
              'Key vault and key lifecycle are application responsibility.',
              'No queryable encryption: cannot run range or prefix queries on encrypted fields.',
              'Key rotation and crypto-shredding require custom application logic.',
            ],
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB (MongoDB vCore API): Encryption at rest only.
// No client-side field-level encryption. Application must encrypt sensitive fields.

const legacyDocs = await legacyCollection.find({}).toArray();
for (const doc of legacyDocs) {
  const ssnEncrypted = encryptInApp(doc.ssn); // Manual implementation
  await secureCollection.insertOne({ ...doc, ssn: ssnEncrypted });
}
// No DEK/key vault abstraction; no queryable encryption on encrypted fields.`,
            workaroundNote: 'Cosmos DB for MongoDB vCore offers encryption at rest, not client-side field encryption. Manual app-level encryption required; no queryable encryption.',
            challenges: [
              'No native client-side field-level or queryable encryption.',
              'Encryption keys and DEK management must be implemented in the application.',
              'Right-to-erasure (crypto-shredding) requires custom key deletion and re-encryption.',
            ],
          },
        },
        skeleton: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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
  await secureCollection.drop().catch(() => {});
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
          { line: 20, blankText: '______', hint: 'Method to retrieve a single document', answer: 'findOne' },
          { line: 25, blankText: '________________', hint: 'Class for manual encryption operations', answer: 'ClientEncryption' },
          { line: 36, blankText: '_________', hint: 'Method to encrypt a value manually', answer: 'encrypt' },
          { line: 37, blankText: '____________', hint: 'Algorithm suffix for deterministic encryption', answer: 'Deterministic' },
        ],
      },
    ],
    tips: [
      'Replace placeholders in the script, then use Run all or Run selection to execute. Expected: Migration complete! Migrated 3 documents.',
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
        filename: 'multiTenantIsolation.cjs',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const region = process.env.AWS_REGION || "eu-central-1";
  const masterKeyAlias = "alias/mongodb-lab-key-YOUR_SUFFIX";

  const tenants = ["acme", "contoso", "fabrikam"];
  for (const tenantId of tenants) {
    const keyAltName = \`tenant-\${tenantId}\`;
    const existingKey = await keyVaultDB.collection("__keyVault").findOne({
      keyAltNames: keyAltName
    });
    if (!existingKey) {
      const dekId = await encryption.createDataKey("aws", {
        masterKey: {
          key: masterKeyAlias,
          region: region
        },
        keyAltNames: [keyAltName]
      });
      console.log(\`Created DEK for tenant: \${tenantId}\`);
    }
  }
  await client.close();
}
run().catch(console.error);`,
        skeleton: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const region = process.env.AWS_REGION || "eu-central-1";
  const masterKeyAlias = "alias/mongodb-lab-key-YOUR_SUFFIX";

  const tenants = ["acme", "contoso", "fabrikam"];
  for (const tenantId of tenants) {
    const keyAltName = \`_______-\${tenantId}\`;
    const existingKey = await keyVaultDB.collection("__keyVault").findOne({
      ___________: keyAltName
    });
    if (!existingKey) {
      const dekId = await encryption.____________("aws", {
        masterKey: {
          key: masterKeyAlias,
          region: region
        },
        keyAltNames: [keyAltName]
      });
      console.log(\`Created DEK for tenant: \${tenantId}\`);
    }
  }
  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 30, blankText: '_______', hint: 'Prefix for tenant-specific key names', answer: 'tenant' },
          { line: 32, blankText: '___________', hint: 'Field to query for existing DEK names', answer: 'keyAltNames' },
          { line: 35, blankText: '____________', hint: 'Method to generate a new Data Encryption Key', answer: 'createDataKey' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No built-in key vault or per-tenant DEKs.
-- Isolation is via separate schemas or row-level security (RLS).

-- Option 1: One schema per tenant (strong isolation)
CREATE SCHEMA IF NOT EXISTS tenant_acme;
CREATE SCHEMA IF NOT EXISTS tenant_contoso;
CREATE SCHEMA IF NOT EXISTS tenant_fabrikam;

-- Option 2: Single table with tenant_id + RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON patients
  USING (tenant_id = current_setting('app.tenant_id'));

-- Key management is application-level; no DEK per tenant like MongoDB CSFLE.`,
            workaroundNote: 'RDBMS uses schemas or RLS for tenant isolation; no per-tenant encryption keys. Key rotation and crypto-shredding require application-managed keys.',
          },
        },
      },
    ],
    tips: [
      'Use Run all or Run selection to execute the script. Expected: Created DEK for tenant: acme (and contoso, fabrikam if not already present).',
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
        filename: 'rotateCMK.cjs',
        language: 'javascript',
        code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-YOUR_SUFFIX-ssn-key";
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: keyAltName
  });
  if (!keyDoc) throw new Error("DEK not found");

  const region = process.env.AWS_REGION || "eu-central-1";
  const newCMKAlias = "alias/mongodb-lab-key-YOUR_SUFFIX";
  const result = await encryption.rewrapManyDataKey(
    { keyAltNames: keyAltName },
    {
      provider: "aws",
      masterKey: { key: newCMKAlias, region: region }
    }
  );

  console.log("Rotation complete! Modified:", result.bulkWriteResult.modifiedCount);
  await client.close();
}
run().catch(console.error);`,
        skeleton: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-YOUR_SUFFIX-___-key";
  const keyDoc = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: keyAltName
  });
  if (!keyDoc) throw new Error("DEK not found");

  const region = process.env.AWS_REGION || "eu-central-1";
  const newCMKAlias = "alias/mongodb-lab-key-YOUR_SUFFIX";
  const result = await encryption.___________________(
    { ___________: keyAltName },
    {
      provider: "aws",
      masterKey: { key: newCMKAlias, region: region }
    }
  );

  console.log("Rotation complete! Modified:", result.bulkWriteResult.modifiedCount);
  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 25, blankText: '___', hint: 'Field name in keyAltName pattern', answer: 'ssn' },
          { line: 26, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 33, blankText: '___________________', hint: 'Method to rotate DEKs to a new CMK', answer: 'rewrapManyDataKey' },
          { line: 34, blankText: '___________', hint: 'Field to filter which DEKs to rotate', answer: 'keyAltNames' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No built-in key rotation. Application manages keys;
-- rotation = decrypt with old key, re-encrypt with new key (full scan).

-- 1. Add new key version to app config
-- 2. Full table scan: SELECT id, decrypt(encrypted_col, old_key) AS plain
--    INSERT INTO temp_table SELECT id, encrypt(plain, new_key)
-- 3. Swap tables or update rows in place
-- 4. Retire old key

-- No envelope-style rotation; data must be re-encrypted by application.`,
            workaroundNote: 'Key rotation requires application-level re-encryption; no envelope rotation like MongoDB rewrapManyDataKey.',
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB (MongoDB vCore): Encryption at rest is managed by the service.
// No client-side DEK rotation; key rotation is a platform operation.
// For client-side encrypted fields (if implemented in app), same as PostgreSQL:
// full scan, decrypt with old key, encrypt with new key.`,
            workaroundNote: 'Platform manages encryption keys; no client-side DEK/CMK rotation API.',
          },
        },
      },
    ],
    tips: [
      'Use Run all or Run selection to execute the script. Expected: Rotation complete! Modified: 1.',
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
