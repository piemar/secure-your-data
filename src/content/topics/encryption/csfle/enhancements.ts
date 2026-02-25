import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * CSFLE (Lab 1) Enhancement Metadata
 *
 * This file is the content-driven source for lab-csfle-fundamentals when rendered via LabRunner
 * (see Docs/LAB_IMPLEMENTATION_PATHS.md). Placeholders substituted at load time: ALIAS_NAME,
 * YOUR_SUFFIX, AWS_REGION, CRYPT_SHARED_LIB_PATH. Source: Docs/pov-proof-exercises/proofs/46 (CSFLE).
 */

export const enhancements: EnhancementMetadataRegistry = {
  'csfle.create-cmk': {
    id: 'csfle.create-cmk',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Terminal',
        language: 'bash',
        code: `# 1. Create the CMK (backslash continues to next line; run as one script)
KMS_KEY_ID=$(aws kms create-key \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata.KeyId' \\
    --output text)

# 2. Create a human-readable alias (uses $KMS_KEY_ID from above)
aws kms create-alias \\
    --alias-name "ALIAS_NAME" \\
    --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ALIAS_NAME"`,
        skeleton: `# ══════════════════════════════════════════════════════════════
# STEP 1: Create a Customer Master Key (CMK)
# ══════════════════════════════════════════════════════════════
# The CMK is your "root of trust" - it wraps all your Data Encryption Keys.
# It NEVER leaves AWS KMS (protected by hardware security modules).
# If you see "Token has expired", run: aws sso login
#
# TASK: Complete the AWS KMS command below (backslash continues the line).

KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# ══════════════════════════════════════════════════════════════
# STEP 2: Create a Human-Readable Alias
# ══════════════════════════════════════════════════════════════
# Aliases make keys easier to reference and enable key rotation without
# changing your application code.
#
# TASK: Complete the AWS KMS command to link an alias to your key.

aws kms _____________ \\
    --alias-name "ALIAS_NAME" \\
    --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ALIAS_NAME"`,
        challengeSkeleton: `# ══════════════════════════════════════════════════════════════
# CHALLENGE MODE - AWS KMS Setup for MongoDB Encryption
# ══════════════════════════════════════════════════════════════

# TASK 1: Create a Customer Master Key (CMK)
# ──────────────────────────────────────────
# Requirements:
#   • Use the AWS KMS CLI (aws kms <command>)
#   • Store the KeyId in a variable called KMS_KEY_ID
#   • Add description: "Lab 1 MongoDB Encryption Key"
#   • Use --query to extract only the KeyId
#
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-key.html

# Write your command:


# TASK 2: Create an Alias for Easy Reference
# ──────────────────────────────────────────
# Requirements:
#   • Create alias named: ALIAS_NAME
#   • Link it to your CMK using its KeyId
#
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-alias.html

# Write your command:


# Verification (run after completing above):
echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ALIAS_NAME"`,
        expertSkeleton: `# ══════════════════════════════════════════════════════════════
# EXPERT MODE - AWS KMS Infrastructure
# ══════════════════════════════════════════════════════════════
#
# OBJECTIVE: Prepare AWS KMS for MongoDB Client-Side Field Level Encryption
#
# Your solution must:
#   1. Create a symmetric Customer Master Key (CMK) in AWS KMS
#   2. Store its KeyId in variable: KMS_KEY_ID  
#   3. Create an alias pointing to this key: ALIAS_NAME
#
# Reference: AWS KMS CLI documentation
# Points available: 25 (if no hints used)
#
# ══════════════════════════════════════════════════════════════

# YOUR SOLUTION:


`,
        inlineHints: [
          { line: 10, blankText: '_________', hint: 'The AWS KMS command to create a new symmetric key', answer: 'create-key' },
          { line: 12, blankText: '_______', hint: 'JMESPath query to extract the key identifier', answer: 'KeyId' },
          { line: 23, blankText: '_____________', hint: 'AWS KMS command to assign a friendly name to a key', answer: 'create-alias' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No managed KMS. Encryption keys are application-managed.
-- Use pgcrypto or application-level keys; no envelope encryption built-in.
-- Keys typically stored in app config or external vault (custom integration).`,
            workaroundNote: 'PostgreSQL has no managed KMS. Use application-managed keys or integrate a third-party HSM/KMS yourself.',
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB (MongoDB vCore): Use Azure Key Vault for key management.
// Create key in Azure Portal or Azure CLI, then reference in app.
// No built-in envelope encryption; app must implement DEK wrap/unwrap with Key Vault.`,
            workaroundNote: 'Cosmos DB uses encryption at rest (Azure-managed). For client-side encryption, integrate Azure Key Vault and implement envelope encryption in application code.',
          },
        },
      },
    ],
    tips: [
      'The CMK never leaves the KMS Hardware Security Module (HSM). In customer conversations, you will explain that the CMK is the only key that never leaves the HSM.',
      'Use aliases for keys to allow easier rotation without code changes.',
    ],
  },

  'csfle.apply-key-policy': {
    id: 'csfle.apply-key-policy',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Terminal',
        language: 'bash',
        code: `# Run these commands in your terminal (AWS CLI must be configured).
KMS_KEY_ID=$(aws kms describe-key --key-id ALIAS_NAME --query 'KeyMetadata.KeyId' --output text)
IAM_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Create a policy allowing YOU full access
cat <<EOF > policy.json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "Enable IAM User Permissions",
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::\${ACCOUNT_ID}:root"},
        "Action": "kms:*",
        "Resource": "*"
    }, {
        "Sid": "Allow My User",
        "Effect": "Allow",
        "Principal": {"AWS": "$IAM_ARN"},
        "Action": "kms:*",
        "Resource": "*"
    }]
}
EOF

aws kms put-key-policy --key-id $KMS_KEY_ID --policy-name default --policy file://policy.json`,
        skeleton: `# ══════════════════════════════════════════════════════════════
# Apply a Key Policy to Allow Your IAM User
# ══════════════════════════════════════════════════════════════
# Even if your IAM User has permissions, the Key itself must *trust* you.
#
# TASK: Fill in the AWS CLI commands to get your identity and apply the policy.

# Get the Key ID from your alias
KMS_KEY_ID=$(aws kms ____________ --key-id ALIAS_NAME --query 'KeyMetadata.KeyId' --output text)

# Get your IAM ARN and Account ID
IAM_ARN=$(aws sts ___________________ --query 'Arn' --output text)
ACCOUNT_ID=$(aws sts get-caller-identity --query '________' --output text)

# Create a policy allowing YOU full access
cat <<EOF > policy.json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "Enable IAM User Permissions",
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::\${ACCOUNT_ID}:root"},
        "Action": "kms:*",
        "Resource": "*"
    }, {
        "Sid": "Allow My User",
        "Effect": "Allow",
        "Principal": {"AWS": "$IAM_ARN"},
        "Action": "kms:*",
        "Resource": "*"
    }]
}
EOF

# Apply the policy to your CMK
aws kms ______________ --key-id $KMS_KEY_ID --policy-name default --policy file://policy.json`,
        challengeSkeleton: `# ══════════════════════════════════════════════════════════════
# CHALLENGE MODE - Apply KMS Key Policy
# ══════════════════════════════════════════════════════════════

# TASK 1: Get your Key ID and IAM identity
# Requirements: Look up KeyId using alias ALIAS_NAME; get IAM ARN and Account ID.
# Write your commands:

# TASK 2: Create a Key Policy JSON file (allow account root and your IAM user).
# Write your heredoc or echo command:

# TASK 3: Apply the policy to your CMK
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/put-key-policy.html
# Write your command:
`,
        expertSkeleton: `# EXPERT MODE - Secure Your KMS Key
# OBJECTIVE: Apply a resource-based policy to your KMS CMK
# 1. Look up KeyId using alias ALIAS_NAME
# 2. Create a policy that allows your IAM identity to use the key
# 3. Apply the policy to the CMK
# YOUR SOLUTION:
`,
        inlineHints: [
          { line: 9, blankText: '____________', hint: 'AWS KMS command to get details about an existing key', answer: 'describe-key' },
          { line: 12, blankText: '___________________', hint: 'AWS STS command to get information about your identity', answer: 'get-caller-identity' },
          { line: 13, blankText: '________', hint: 'JMESPath query to extract your AWS Account ID', answer: 'Account' },
          { line: 36, blankText: '______________', hint: 'AWS KMS command to attach a policy to a key', answer: 'put-key-policy' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No key policy concept. Permissions via roles/grants.
-- Access control is at table/column level, not key level.`,
            workaroundNote: 'PostgreSQL has no KMS or key policy; key access is application-managed.',
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: Azure Key Vault access is via IAM (RBAC) and Key Vault access policies.
// Set Key Vault access policy for your app's managed identity or service principal.`,
            workaroundNote: 'Key access is controlled by Azure Key Vault access policies and IAM, not a single policy file.',
          },
        },
      },
    ],
    tips: [
      'KMS keys use resource-based policies (like S3). The key must explicitly trust your IAM principal.',
      'In production, separate "Key Admin" vs "Key User" permissions. For this lab, you are both.',
    ],
  },

  'csfle.init-keyvault': {
    id: 'csfle.init-keyvault',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'keyvault-setup.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  await db.collection("__keyVault").createIndex(
    { keyAltNames: 1 },
    { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
  );
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("_________");
  await db.collection("__keyVault").____________(
    { ___________: 1 },
    { unique: true, partialFilterExpression: { keyAltNames: { $_______: true } } }
  );
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
        challengeSkeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  // TASK: Create unique partial index on __keyVault for keyAltNames
  await db.collection("__keyVault").createIndex(/* ... */);
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
        expertSkeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
async function run() {
  const client = await MongoClient.connect(uri);
  // TASK: Create unique partial index on encryption.__keyVault (keyAltNames)
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 7, blankText: '_________', hint: 'Database name for encryption key vault', answer: 'encryption' },
          { line: 8, blankText: '____________', hint: 'Method to create an index on a collection', answer: 'createIndex' },
          { line: 9, blankText: '___________', hint: 'Field that stores alternate names for DEKs', answer: 'keyAltNames' },
          { line: 10, blankText: '$_______', hint: 'Operator to check if a field exists', answer: '$exists' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No key vault collection. Keys in app config or external vault.
-- Application must enforce uniqueness and secure access.`,
            workaroundNote: 'No built-in key vault; implement your own key store and uniqueness constraints.',
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No __keyVault collection. Keys in Azure Key Vault.
// No driver-managed key vault; no unique index on keyAltNames.`,
            workaroundNote: 'Key storage is in Azure Key Vault; no MongoDB-style key vault collection.',
          },
        },
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `db.getSiblingDB("encryption").getCollection("__keyVault").createIndex(
  { keyAltNames: 1 },
  { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
);
print("Key Vault index created.");`,
        skeleton: `db.getSiblingDB("_________").getCollection("___________").createIndex(
  { ___________: 1 },
  { unique: true, partialFilterExpression: { keyAltNames: { $_______: true } } }
);
print("Key Vault index created.");`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Database name for the key vault', answer: 'encryption' },
          { line: 1, blankText: '___________', hint: 'Key vault collection name (special MongoDB collection)', answer: '__keyVault' },
          { line: 2, blankText: '___________', hint: 'Field that stores alternate names for DEKs', answer: 'keyAltNames' },
          { line: 3, blankText: '$_______', hint: 'Operator to check if a field exists', answer: '$exists' },
        ],
      },
    ],
    tips: [
      'Best practice: The unique partial index on keyAltNames is required by CSFLE. Use $exists (not exists) in partialFilterExpression.',
      'You can run the Key Vault setup either with node or via the Mongosh block. Use Run all or Run selection; no separate terminal needed.',
      'Mongosh return values (e.g. createIndex result) are always printed to the console. Shorthand commands (show dbs, show collections, use mydb, help) work when run in an interactive shell.',
    ],
  },

  'csfle.create-deks': {
    id: 'csfle.create-deks',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'createKey.cjs',
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-YOUR_SUFFIX-ssn-key";
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });

  if (existingKey) {
    console.log("✓ DEK already exists with keyAltName:", keyAltName);
    await client.close();
    return;
  }

  const dekId = await encryption.createDataKey("aws", {
    masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
    keyAltNames: [keyAltName]
  });

  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Generate Data Encryption Key (DEK) using Node.js
// ══════════════════════════════════════════════════════════════
// Create a file called "createKey.cjs" and run with: node createKey.cjs

const { MongoClient, ClientEncryption } = require("mongodb");
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
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-YOUR_SUFFIX-ssn-key";
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });

  if (existingKey) {
    console.log("✓ DEK already exists with keyAltName:", keyAltName);
    await client.close();
    return;
  }

  // TASK: Create the Data Encryption Key (fill in the method, provider, and option name)
  const dekId = await encryption.________________('___', {
    masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
    ___________: [keyAltName]
  });

  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 40, blankText: '________________', hint: 'Method to generate a new Data Encryption Key', answer: 'createDataKey' },
          { line: 40, blankText: '___', hint: 'KMS provider name (use "aws" for AWS KMS)', answer: 'aws' },
          { line: 42, blankText: '___________', hint: 'Option to assign a human-readable name to the DEK', answer: 'keyAltNames' },
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No DEK or key vault. Generate keys in application.
-- pgcrypto uses a single key per column or app-managed key derivation.`,
            workaroundNote: 'No envelope encryption or DEK abstraction; keys are application-managed.',
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No ClientEncryption.createDataKey. Use Azure Key Vault.
// Store key ID in app; use for encrypt/decrypt in application code.`,
            workaroundNote: 'Create keys in Azure Key Vault; no MongoDB-style DEK or key vault collection.',
          },
        },
      },
    ],
    tips: [
      'Use Run all or Run selection to execute the Node script (no separate terminal needed).',
      'Region: Use AWS_REGION (e.g. eu-central-1). To use another region, set lab_aws_region in localStorage or use default.',
      'In production, create different DEKs for different sensitivity levels.',
    ],
  },

  'csfle.verify-dek': {
    id: 'csfle.verify-dek',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'keyvault-verify.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  const docs = await db.collection("__keyVault").find({}).toArray();
  console.log("Key Vault documents:", docs.length);
  docs.forEach((d) => console.log(JSON.stringify(d, null, 2)));
  const count = await db.collection("__keyVault").countDocuments();
  console.log("Total keys:", count);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("_________");
  const docs = await db.collection("__keyVault").______({}).toArray();
  console.log("Key Vault documents:", docs.length);
  docs.forEach((d) => console.log(JSON.stringify(d, null, 2)));
  const count = await db.collection("__keyVault").________________();
  console.log("Total keys:", count);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 7, blankText: '_________', hint: 'Database name for encryption key vault', answer: 'encryption' },
          { line: 8, blankText: '______', hint: 'Method to read documents from a collection', answer: 'find' },
          { line: 11, blankText: '________________', hint: 'Method to count documents in a collection', answer: 'countDocuments' },
        ],
        competitorEquivalents: {
          postgresql: { language: 'sql', code: `-- PostgreSQL: No key vault. Query your custom key store if you built one.`, workaroundNote: 'No built-in key vault; verification is application-specific.' },
          'cosmosdb-vcore': { language: 'javascript', code: `// Cosmos DB: Keys live in Azure Key Vault, not in a collection.`, workaroundNote: 'Key verification is via Azure Key Vault API, not a database collection.' },
        },
      },
    ],
    tips: [
      'This step confirms the DEK was successfully created and stored in the key vault. Use Run all or Run selection to execute the script.',
      'If you see 0 keys, re-run createKey.cjs. If you see multiple keys, you may have run it more than once.',
    ],
  },

  'csfle.test-csfle': {
    id: 'csfle.test-csfle',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'testCSFLE.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyAltName = "user-YOUR_SUFFIX-ssn-key";
const cryptSharedLibPath = "CRYPT_SHARED_LIB_PATH";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });
  if (!keyDoc) throw new Error("Key not found. Run createKey.cjs first.");
  const dekId = keyDoc._id;
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId]
          }
        }
      }
    }
  };

  console.log("\\n=== WITHOUT CSFLE ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("medical");
  await standardDb.collection("patients").deleteMany({ name: "Alice Johnson" });
  await standardDb.collection("patients").insertOne({
    name: "Alice Johnson",
    ssn: "123-45-6789",
    dob: "1990-01-15"
  });
  const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
  console.log("SSN stored as:", docStandard.ssn);
  await clientStandard.close();

  console.log("\\n=== WITH CSFLE ===");
  const clientEncrypted = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      schemaMap,
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });
  await clientEncrypted.connect();
  const encryptedDb = clientEncrypted.db("medical");
  await encryptedDb.collection("patients").insertOne({
    name: "Bob Smith",
    ssn: "987-65-4321",
    dob: "1985-06-20"
  });
  const docEncrypted = await encryptedDb.collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN returned as:", docEncrypted.ssn);
  await clientEncrypted.close();

  console.log("\\n=== PROOF: Query WITHOUT CSFLE ===");
  const clientProof = new MongoClient(uri);
  await clientProof.connect();
  const docProof = await clientProof.db("medical").collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN field type:", docProof.ssn.constructor.name);
  await clientProof.close();
}
run().catch(console.error);`,
        skeleton: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyAltName = "user-YOUR_SUFFIX-ssn-key";
const cryptSharedLibPath = "CRYPT_SHARED_LIB_PATH";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ _____________: keyAltName });
  const dekId = keyDoc._id;
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "_______": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-___________",
            "keyId": [dekId]
          }
        }
      }
    }
  };

  console.log("\\n=== WITHOUT CSFLE ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("medical");
  await standardDb.collection("patients").deleteMany({ name: "Alice Johnson" });
  await standardDb.collection("patients").insertOne({
    name: "Alice Johnson",
    ssn: "123-45-6789",
    dob: "1990-01-15"
  });
  const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
  console.log("SSN stored as:", docStandard.ssn);
  await clientStandard.close();

  console.log("\\n=== WITH CSFLE ===");
  const clientEncrypted = new MongoClient(uri, {
    ______________: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      schemaMap,
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });
  await clientEncrypted.connect();
  const encryptedDb = clientEncrypted.db("medical");
  await encryptedDb.collection("patients").insertOne({
    name: "Bob Smith",
    ssn: "987-65-4321",
    dob: "1985-06-20"
  });
  const docEncrypted = await encryptedDb.collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN returned as:", docEncrypted.ssn);
  await clientEncrypted.close();

  console.log("\\n=== PROOF: Query WITHOUT CSFLE ===");
  const clientProof = new MongoClient(uri);
  await clientProof.connect();
  const docProof = await clientProof.db("medical").collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN field type:", docProof.ssn.constructor.name);
  await clientProof.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 22, blankText: '_____________', hint: 'The field in __keyVault that stores human-readable key names', answer: 'keyAltNames' },
          { line: 31, blankText: '_______', hint: 'Schema map keyword to specify field should be encrypted', answer: 'encrypt' },
          { line: 33, blankText: '___________', hint: 'Algorithm suffix for fields that need equality queries', answer: 'Deterministic' },
          { line: 57, blankText: '______________', hint: 'MongoClient option that enables automatic encryption', answer: 'autoEncryption' },
        ],
        competitorEquivalents: {
          postgresql: { language: 'sql', code: `-- PostgreSQL: No automatic field encryption. Encrypt in application before insert.`, workaroundNote: 'Application must encrypt/decrypt; no transparent CSFLE.' },
          'cosmosdb-vcore': { language: 'javascript', code: `// Cosmos DB: Encryption at rest only. No client-side auto encrypt/decrypt.`, workaroundNote: 'No CSFLE; implement encrypt/decrypt in application.' },
        },
      },
    ],
    tips: [
      'Use Run all or Run selection to execute the Node script.',
      'Use keyAltNames instead of keyId for better maintainability and key rotation support.',
      'If you see "Unable to connect to mongocryptd", set the path to mongo_crypt_shared in Lab Setup (Prerequisites) so the driver uses it instead of mongocryptd.',
    ],
  },

  'csfle.complete-application': {
    id: 'csfle.complete-application',
    povCapability: 'ENCRYPT-FIELDS',
    sourceProof: 'proofs/46/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'app.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";
const keyAltName = "user-YOUR_SUFFIX-ssn-key";
const cryptSharedLibPath = "CRYPT_SHARED_LIB_PATH";

async function main() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const [db, coll] = keyVaultNamespace.split('.');
  const keyDoc = await keyVaultClient.db(db).collection(coll).findOne({ keyAltNames: keyAltName });
  const dekId = keyDoc._id;
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId]
          }
        }
      }
    }
  };

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      schemaMap,
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  try {
    await client.connect();
    const db_ = client.db("medical");
    await db_.collection("patients").insertOne({
      name: "Alice",
      ssn: "987-65-4321"
    });
    console.log("Document inserted (Encrypted in Atlas).");
    const doc = await db_.collection("patients").findOne({ ssn: "987-65-4321" });
    console.log("Decrypted Document:", doc);
  } finally {
    await client.close();
  }
}
main().catch(console.error);`,
        skeleton: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";
const keyAltName = "user-YOUR_SUFFIX-ssn-key";
const cryptSharedLibPath = "CRYPT_SHARED_LIB_PATH";

async function main() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const [db, coll] = keyVaultNamespace._____('.');
  const keyDoc = await keyVaultClient.db(db).collection(coll).findOne({ keyAltNames: keyAltName });
  const dekId = keyDoc._____;
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "_______": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId]
          }
        }
      }
    }
  };

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      _____________,
      schemaMap,
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  try {
    await client.connect();
    const db_ = client.db("medical");
    await db_.collection("patients").insertOne({
      name: "Alice",
      ssn: "987-65-4321"
    });
    console.log("Document inserted (Encrypted in Atlas).");
    const doc = await db_.collection("patients").findOne({ ssn: "987-65-4321" });
    console.log("Decrypted Document:", doc);
  } finally {
    await client.close();
  }
}
main().catch(console.error);`,
        inlineHints: [
          { line: 22, blankText: '_____', hint: 'JavaScript string method to divide into array of substrings', answer: 'split' },
          { line: 24, blankText: '_____', hint: 'MongoDB document field that stores the primary key', answer: '_id' },
          { line: 29, blankText: '_______', hint: 'JSON Schema keyword to specify the BSON type', answer: 'bsonType' },
          { line: 45, blankText: '_____________', hint: 'Object that contains AWS KMS credentials configuration', answer: 'kmsProviders' },
        ],
        competitorEquivalents: {
          postgresql: { language: 'sql', code: `-- PostgreSQL: Full app = manual encrypt on write, decrypt on read.`, workaroundNote: 'Complete application must implement encryption pipeline manually.' },
          'cosmosdb-vcore': { language: 'javascript', code: `// Cosmos DB: Full app uses Azure Key Vault + manual encrypt/decrypt.`, workaroundNote: 'No native CSFLE; full application logic for encryption is custom code.' },
        },
      },
    ],
    tips: [
      'BEST PRACTICE: Use keyAltNames instead of keyId for easier key rotation and management.',
      'SIMPLICITY: Once configured, the rest of your app code (Insert/Find) is unchanged.',
    ],
  },
};
