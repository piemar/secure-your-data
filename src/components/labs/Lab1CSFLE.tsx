import { LabView } from './LabView';
import { validatorUtils } from '@/utils/validatorUtils';
import { useLab } from '@/context/LabContext';

export function Lab1CSFLE() {
  const { mongoUri, awsAccessKeyId, awsSecretAccessKey, awsRegion, verifiedTools } = useLab();
  const suffix = verifiedTools['suffix']?.path || 'suffix';
  const aliasName = `alias/mongodb-lab-key-${suffix}`;
  const cryptSharedLibPath = verifiedTools['mongoCryptShared']?.path || '';

  const lab1Steps = [

    {
      id: 'l1s1',
      title: 'Infrastructure: Create Customer Master Key (CMK)',
      estimatedTime: '10 min',
      description: 'The CMK is the root of trust in Envelope Encryption. In this step, you will create a CMK and an alias using the AWS CLI. This key will "wrap" the Data Encryption Keys (DEKs) that MongoDB stores.',
      tips: [
        'ROOT OF TRUST: The CMK never leaves the KMS Hardware Security Module (HSM).',
        'SA TIP: Use aliases for your keys to make them application-agnostic. Referencing a key by alias allows for easier rotation.'
      ],
      codeBlocks: [
        {
          filename: 'AWS CLI - Create Key & Alias',
          language: 'bash',
          code: `# 1. Create the CMK
KMS_KEY_ID=$(aws kms create-key --description "Lab 1 MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)

# 2. Create a human-readable alias (Unique to you)
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`,
          skeleton: `# Use 'aws kms create-key' to create a new Symmetric key
# Use 'aws kms create-alias' to assign it a friendly name like '${aliasName}'`
        }
      ],
      onVerify: async () => validatorUtils.checkKmsAlias(aliasName)
    },
    {
      id: 'l1s2',
      title: 'Infrastructure: Apply KMS Key Policy',
      estimatedTime: '5 min',
      description: 'A Common Pitfall: Even if your IAM User has permissions, the Key itself must *trust* you. You must explicity attach a Key Policy to the CMK to allow your IAM User to administer and use it.',
      tips: [
        'RESOURCE-BASED POLICY: KMS Keys use resource policies similar to S3 buckets.',
        'SA TIP: In production, separate "Key Admin" vs "Key User" permissions. For this lab, you are both.'
      ],
      codeBlocks: [
        {
          filename: 'AWS CLI - Put Key Policy',
          language: 'bash',
          code: `# Re-run to get ID if needed
KMS_KEY_ID=$(aws kms describe-key --key-id ${aliasName} --query 'KeyMetadata.KeyId' --output text)
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
          skeleton: `# Define a JSON policy enabling your IAM Principal
# Run 'aws kms put-key-policy'`
        }
      ],
      onVerify: async () => validatorUtils.checkKeyPolicy(aliasName)
    },
    {
      id: 'l1s3',
      title: 'Initialize Key Vault with Unique Index',
      estimatedTime: '5 min',
      description: 'The Key Vault collection stores your encrypted DEKs. You MUST create a unique index manually. The driver does NOT do this for you.',
      tips: [
        'IMPORTANT: Run this command in your MONGODB SHELL (mongosh) connected to Atlas.',
        'Architecture: Usually stored in a database named "encryption" and collection "__keyVault".'
      ],
      codeBlocks: [
        {
          filename: 'mongosh (MongoDB Shell - NOT Node.js)',
          language: 'javascript',
          code: `// Run this in mongosh (MongoDB Shell), NOT in Node.js

// 1. Connect to your Atlas Cluster first:
mongosh "${mongoUri}"

use encryption
db.getCollection("__keyVault").createIndex(
  { keyAltNames: 1 },
  { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
);`,
          skeleton: `// Run in mongosh (MongoDB Shell)
use encryption
db.getCollection("__keyVault").createIndex(
  { keyAltNames: 1 },
  { unique: true, /* partialFilterExpression */ }
);`
        }
      ],
      onVerify: async () => validatorUtils.checkKeyVault(mongoUri, 'encryption.__keyVault')
    },
    {
      id: 'l1s5',
      title: 'Generate Data Encryption Keys (DEKs)',
      estimatedTime: '8 min',
      description: 'Generate the actual keys used to encrypt data using a Node.js script with the mongodb-client-encryption library.',
      tips: [
        'RUN WITH NODE.JS: This is a Node.js script. Run with: node createKey.cjs',
        'NOT MONGOSH: This is NOT a mongosh command - it must run in your terminal with Node.js.',
        'DEPENDENCIES: Ensure you run npm install first (see step 1 below).',
        'MULTI-DEK: In production, create different keys for different sensitivity levels.'
      ],
      codeBlocks: [
        {
          filename: '1. Terminal: Install Deps',
          language: 'bash',
          code: `npm install mongodb mongodb-client-encryption @aws-sdk/credential-providers`
        },
        {
          filename: '2. createKey.cjs (Node.js - Create this file in your project root)',
          language: 'javascript',
          code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

// 1. Configuration
const uri = "${mongoUri}";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  // Get credentials from SSO session - explicitly use SSO to avoid picking up IAM user credentials
  const credentials = await fromSSO()();

  // MongoDB client encryption expects only: accessKeyId, secretAccessKey, sessionToken
  // Filter out expiration and other fields that AWS SDK includes
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

  const keyAltName = "user-${suffix}-ssn-key";
  
  // Check if DEK already exists
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: keyAltName 
  });

  if (existingKey) {
    console.log("✓ DEK already exists with keyAltName:", keyAltName);
    console.log("  DEK UUID:", existingKey._id.toString());
    console.log("  Reusing existing key. No new key created.");
    await client.close();
    return;
  }

  // 2. Create the Data Key
  const dekId = await encryption.createDataKey("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion}" },
    keyAltNames: [keyAltName]
  });

  console.log("✓ Created new DEK UUID:", dekId.toString());
  console.log("  keyAltName:", keyAltName);
  await client.close();
}

run().catch(console.dir);`,
          skeleton: `// This is a Node.js script - create createKey.cjs in your project root`
        },
        {
          filename: '3. Terminal (NOT mongosh) - Run with Node.js',
          language: 'bash',
          code: `# Run in your terminal (NOT in mongosh):
node createKey.cjs

# Expected Output:
# Created DEK UUID: 7274650f-1ea0-48e1-b47e-33d3bba95a21
# (Your UUID will be different - save it for the next step!)`
        }
      ],
      onVerify: async () => validatorUtils.checkDataKey(mongoUri, `user-${suffix}-ssn-key`)
    },
    {
      id: 'l1s5verify',
      title: 'Verify DEK Creation in Key Vault',
      estimatedTime: '5 min',
      description: 'Connect to MongoDB Atlas using mongosh and query the key vault to verify that exactly one Data Encryption Key has been created. This is a critical verification step.',
      tips: [
        'VERIFICATION: This step confirms the DEK was successfully created and stored.',
        'ARCHITECTURE: The key vault stores encrypted DEKs - the CMK encrypts these DEKs at rest.',
        'DEBUGGING: If you see 0 keys, re-run the createKey.cjs script. If you see multiple keys, you may have run it more than once.'
      ],
      codeBlocks: [
        {
          filename: 'mongosh (MongoDB Shell - NOT Node.js)',
          language: 'javascript',
          code: `// Run this in mongosh (MongoDB Shell), NOT in Node.js

// 1. Connect to Atlas
mongosh "${mongoUri}"

// 2. Switch to encryption database
use encryption

// 3. Query the key vault collection
db.getCollection("__keyVault").find({}).pretty()

// Expected Output:
// You should see exactly 1 document with:
// - _id: Binary UUID
// - keyAltNames: ["user-${suffix}-ssn-key"]
// - masterKey: { provider: "aws", key: "${aliasName}", region: "${awsRegion}" }
// - creationDate and updateDate timestamps

// 4. Count total keys (should return 1)
db.getCollection("__keyVault").countDocuments()`,
          skeleton: `// Run these commands in mongosh (MongoDB Shell), NOT in Node.js
use encryption
db.getCollection("__keyVault").find({}).pretty()
db.getCollection("__keyVault").countDocuments()`
        }
      ],
      onVerify: async () => validatorUtils.checkKeyVaultCount(1)
    },
    {
      id: 'l1s6',
      title: 'Test CSFLE: Insert & Query with Encryption',
      estimatedTime: '15 min',
      description: 'Create and run a Node.js test script that demonstrates the difference between encrypted and non-encrypted connections. This proves that CSFLE is working by showing ciphertext vs plaintext side-by-side.',
      tips: [
        'RUN WITH NODE.JS: This is a Node.js script, NOT mongosh. Run it with: node testCSFLE.cjs',
        'DEMO POWER: This side-by-side comparison is your most powerful SA tool for showing CSFLE in action.',
        'ARCHITECTURE: The encrypted client automatically encrypts on write and decrypts on read.',
        'BEST PRACTICE: Use keyAltNames instead of keyId for better maintainability and key rotation support.'
      ],
      codeBlocks: [
        {
          filename: '1. testCSFLE.cjs (Node.js - Create this file in your project root)',
          language: 'javascript',
          code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "${mongoUri}";
const keyAltName = "user-${suffix}-ssn-key";

async function run() {
  // Get credentials from SSO session - explicitly use SSO to avoid picking up IAM user credentials
  const credentials = await fromSSO()();

  // MongoDB client encryption expects only: accessKeyId, secretAccessKey, sessionToken
  // Filter out expiration and other fields that AWS SDK includes
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // Look up DEK by keyAltName (BEST PRACTICE - use altName instead of hardcoding UUID)
  // Then use the keyId in schemaMap (CSFLE requires keyId, not keyAltName)
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });

  if (!keyDoc) {
    throw new Error(\`Key with altName "\${keyAltName}" not found. Run createKey.cjs first to create the DEK.\`);
  }

  const dekId = keyDoc._id; // This is already a Binary UUID
  console.log(\`Found DEK by altName "\${keyAltName}": \${dekId.toString('base64')}\`);
  await keyVaultClient.close();

  // Schema Map for CSFLE
  // NOTE: CSFLE schemaMap uses keyId (array of Binary UUIDs), NOT keyAltName
  // Queryable Encryption uses keyAltName, but CSFLE uses keyId
  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId] // CSFLE requires keyId (Binary UUID), not keyAltName
          }
        }
      }
    }
  };

  // 1. STANDARD CONNECTION (No CSFLE)
  console.log("\\n=== WITHOUT CSFLE ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("medical");

  // Clean up any existing test data to avoid conflicts
  await standardDb.collection("patients").deleteMany({ 
    $or: [
      { name: "Alice Johnson" },
      { name: "Bob Smith" }
    ]
  });

  // Insert with standard client
  await standardDb.collection("patients").insertOne({
    name: "Alice Johnson",
    ssn: "123-45-6789",
    dob: "1990-01-15"
  });

  // Query with standard client - SSN will be PLAINTEXT in DB
  const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
  console.log("Data in Database (Unencrypted):", docStandard);
  console.log("SSN stored as:", docStandard.ssn); // Plain text!

  await clientStandard.close();

  // 2. CSFLE-ENABLED CONNECTION${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}
  console.log("\\n=== WITH CSFLE ===");
  const clientEncrypted = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      schemaMap,
      bypassQueryAnalysis: false${cryptSharedLibPath ? ',\n      ...extraOptions' : ''} // Allow query analysis for deterministic encryption
    }
  });
  await clientEncrypted.connect();
  const encryptedDb = clientEncrypted.db("medical");

  // Insert with CSFLE client - SSN auto-encrypted
  await encryptedDb.collection("patients").insertOne({
    name: "Bob Smith",
    ssn: "987-65-4321",
    dob: "1985-06-20"
  });
  console.log("Inserted Bob Smith with CSFLE (SSN encrypted before sending to DB)");

  // Query with CSFLE client - SSN auto-decrypted
  // Use a more specific query to avoid MongoDB trying to decrypt Alice's plaintext document
  // Query by the encrypted SSN value (deterministic encryption allows equality queries)
  try {
    const docEncrypted = await encryptedDb.collection("patients").findOne({ 
      name: "Bob Smith"
    });
    
    if (docEncrypted) {
      console.log("Data retrieved (Auto-decrypted):", docEncrypted);
      console.log("SSN returned as:", docEncrypted.ssn); // Decrypted!
    } else {
      console.log("⚠️  Document not found");
    }
  } catch (error) {
    console.error("❌ Error during decryption:", error.message);
    console.log("\\n💡 Troubleshooting:");
    console.log("1. Verify KMS key policy allows kms:Decrypt for your SSO role");
    console.log("2. Check if AWS SSO session is still valid: aws sso login");
    console.log("3. Verify DEK exists: Check encryption.__keyVault collection");
    console.log("4. The error might occur if MongoDB tries to decrypt Alice's plaintext document");
    console.log("   Try deleting Alice's document first or query only Bob's document");
    throw error;
  }

  await clientEncrypted.close();

  // 3. THE PROOF: Query encrypted data WITHOUT CSFLE
  console.log("\\n=== PROOF: Query Bob's record WITHOUT CSFLE ===");
  const clientProof = new MongoClient(uri);
  await clientProof.connect();
  const proofDb = clientProof.db("medical");

  const docProof = await proofDb.collection("patients").findOne({ name: "Bob Smith" });
  console.log("Bob's data WITHOUT CSFLE client:", docProof);
  console.log("SSN field type:", docProof.ssn.constructor.name); // Binary!
  console.log("This is ciphertext - unreadable without the DEK!");

  await clientProof.close();
}

run().catch(console.error);`,
          skeleton: `// Create testCSFLE.cjs with CSFLE-enabled and standard clients
// Compare the output when querying encrypted vs non-encrypted`
        },
        {
          filename: '2. Terminal (NOT mongosh) - Run with Node.js',
          language: 'bash',
          code: `# Run in your terminal (NOT in mongosh):
node testCSFLE.cjs

# Expected Output:
# === WITHOUT CSFLE ===
# Data in Database (Unencrypted): { name: 'Alice Johnson', ssn: '123-45-6789', ... }
# SSN stored as: 123-45-6789
#
# === WITH CSFLE ===
# Inserted Bob Smith with CSFLE (SSN encrypted before sending to DB)
# Data retrieved (Auto-decrypted): { name: 'Bob Smith', ssn: '987-65-4321', ... }
# SSN returned as: 987-65-4321
#
# === PROOF: Query Bob's record WITHOUT CSFLE ===
# Bob's data WITHOUT CSFLE client: { name: 'Bob Smith', ssn: Binary(...), ... }
# SSN field type: Binary
# This is ciphertext - unreadable without the DEK!`
        }
      ],
      onVerify: async () => { return { success: true, message: 'CSFLE demonstration complete!' }; }
    },
    {
      id: 'l1s7',
      title: 'The Complete Application',
      estimatedTime: '10 min',
      description: 'Bringing it all together. Here is the full, clean code for a production-ready CSFLE application. Notice it is only ~50 lines of code!',
      tips: [
        'BEST PRACTICE: Use keyAltNames instead of keyId for easier key rotation and management.',
        'SIMPLICITY: Once configured, the rest of your app code (Insert/Find) is unchanged.',
        'PRODUCTION TIP: Keep your schemaMap external or generated dynamically.'
      ],
      codeBlocks: [
        {
          filename: 'app.js (The Final Product)',
          language: 'javascript',
          code: `import { MongoClient } from "mongodb";

// --- CONFIGURATION ---
const uri = "${mongoUri}";
const keyVaultNamespace = "encryption.__keyVault";
const kmsProviders = { aws: {} }; // Use implicit AWS credentials
const keyAltName = "user-${suffix}-ssn-key";

async function main() {
  // BEST PRACTICE: Look up DEK by alternative name
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
            "keyId": [dekId] // Looked up by altName
          }
        }
      }
    }
  };

  // 1. Initialize Client with AutoEncryption${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      schemaMap${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });

  try {
    await client.connect();
    const db = client.db("medical");
    
    // 2. Insert (Transparently Encrypted)
    await db.collection("patients").insertOne({
      name: "Alice",
      ssn: "987-65-4321" // Becomes BinData in Atlas
    });
    console.log("Document inserted (Encrypted in Atlas).");

    // 3. Query (Transparently Decrypted)
    const doc = await db.collection("patients").findOne({ ssn: "987-65-4321" });
    console.log("Decrypted Document:", doc);

  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
          skeleton: `// Full application structure`
        }
      ],
      onVerify: async () => { return { success: true, message: 'Lab 1 Complete! You have built a secure app.' }; }
    }
  ];

  return (
    <LabView
      labNumber={1}
      title="CSFLE Fundamentals with AWS KMS"
      description="The journey starts with the Foundation. Master the rollout of KMS infrastructure, CLI automation, and the critical IAM requirements that power MongoDB's Client-Side Encryption."
      duration="45 min"
      prerequisites={[
        'MongoDB Atlas M10+ running MongoDB 7.0+',
        'AWS IAM User with KMS Management Permissions',
        'Working Terminal with AWS CLI access'
      ]}
      objectives={[
        'Automate Key creation via AWS CLI',
        'Audit IAM policies for Decrypt & GenerateDataKey permissions',
        'Initialize Key Vault namespaces with high-availability indexes',
        'Map PII fields to unique compliance-bound DEKs'
      ]}
      steps={lab1Steps}
    />
  );
}
