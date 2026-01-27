import { LabViewWithTabs } from './LabViewWithTabs';
import { validatorUtils } from '@/utils/validatorUtils';
import { useLab } from '@/context/LabContext';
import { DifficultyLevel } from './DifficultyBadge';

export function Lab3RightToErasure() {
  const { mongoUri, awsRegion, verifiedTools } = useLab();
  const suffix = verifiedTools['suffix']?.path || 'suffix';
  const aliasName = `alias/mongodb-lab-key-${suffix}`;
  const cryptSharedLibPath = verifiedTools['mongoCryptShared']?.path || '';

  const lab3Steps = [
    {
      id: 'l3s1',
      title: 'Step 1: Explicit Encryption for Migration',
      estimatedTime: '15 min',
      description: 'When migrating existing plaintext data to CSFLE, you cannot use automatic encryption because the driver expects to find ciphertext. You must use the "Explicit Encryption" API to encrypt each field manually. This step demonstrates migrating data from a legacy collection to a secure, encrypted collection.',
      tips: [
        'ACTION REQUIRED: Run the Node.js script below to migrate plaintext data to encrypted format.',
        'MIGRATION STRATEGY: Read from legacy collection → Encrypt each field explicitly → Write to secure collection.',
        'EXPLICIT ENCRYPTION: Use `encryption.encrypt()` for each field that needs encryption during migration.',
        'SA NUANCE: Deterministic encryption is critical during migration if you intend to maintain existing query capabilities on PII.',
        'VERIFICATION: After migration, query the secure collection without CSFLE to see Binary ciphertext - proving encryption worked!'
      ],
      codeBlocks: [
        {
          filename: 'migrateToCSFLE.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

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
  
  // Get the DEK (from Lab 1)
  const keyVaultDB = client.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "user-${suffix}-ssn-key" 
  });

  if (!keyDoc) {
    throw new Error("DEK not found! Run createKey.cjs from Lab 1 first.");
  }

  const dekId = keyDoc._id;
  console.log(\`Using DEK: \${dekId.toString()}\`);

  // Initialize ClientEncryption for explicit encryption
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  // Source collection (plaintext)
  const legacyDB = client.db("medical");
  const legacyCollection = legacyDB.collection("patients_legacy");
  
  // Create sample legacy data if it doesn't exist
  const legacyCount = await legacyCollection.countDocuments();
  if (legacyCount === 0) {
    console.log("Creating sample legacy data...");
    await legacyCollection.insertMany([
      { name: "John Doe", ssn: "111-22-3333", dob: "1980-01-01" },
      { name: "Jane Smith", ssn: "444-55-6666", dob: "1985-05-15" },
      { name: "Bob Johnson", ssn: "777-88-9999", dob: "1990-10-20" }
    ]);
    console.log("Created 3 sample documents in patients_legacy collection");
  }

  // Target collection (encrypted)
  const secureCollection = legacyDB.collection("patients_secure");

  // Migration: Read plaintext, encrypt explicitly, write to secure collection
  console.log("\\n=== Migrating data with Explicit Encryption ===");
  const legacyDocs = await legacyCollection.find({}).toArray();
  
  let migratedCount = 0;
  for (const doc of legacyDocs) {
    // Explicit encryption: encrypt the SSN field
    const encryptedSSN = await encryption.encrypt(doc.ssn, {
  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
  keyId: dekId
});

    // Insert into secure collection with encrypted SSN
    await secureCollection.insertOne({
      ...doc,
      ssn: encryptedSSN
    });
    migratedCount++;
    console.log(\`Migrated: \${doc.name} (SSN encrypted)\`);
  }

  console.log(\`\\n✓ Migration complete! Migrated \${migratedCount} documents.\`);
  console.log(\`✓ Legacy collection: medical.patients_legacy (plaintext)\`);
  console.log(\`✓ Secure collection: medical.patients_secure (encrypted)\`);

  // Verify: Query secure collection without CSFLE to show ciphertext
  console.log("\\n=== Verification: Querying secure collection (no CSFLE) ===");
  const sampleDoc = await secureCollection.findOne({ name: "John Doe" });
  console.log(\`Name: \${sampleDoc.name}\`);
  console.log(\`SSN (encrypted): \${sampleDoc.ssn.constructor.name} - Binary ciphertext\`);
  console.log(\`✓ Data is encrypted in the database!\`);

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// 1. Connect to MongoDB and get SSO credentials
// 2. Look up the DEK by keyAltName from Lab 1
// 3. Initialize ClientEncryption for explicit encryption
// 4. Read documents from legacy collection (plaintext)
// 5. For each document, encrypt the SSN field using encryption.encrypt()
// 6. Insert encrypted documents into secure collection
// 7. Verify encryption by querying without CSFLE (should see Binary)`
        },
        {
          filename: 'Terminal - Run the script',
          language: 'bash',
          code: `# Run in your terminal:
node migrateToCSFLE.cjs

# Expected Output:
# Using DEK: <UUID>
# Created 3 sample documents in patients_legacy collection
# === Migrating data with Explicit Encryption ===
# Migrated: John Doe (SSN encrypted)
# Migrated: Jane Smith (SSN encrypted)
# Migrated: Bob Johnson (SSN encrypted)
# ✓ Migration complete! Migrated 3 documents.
# ✓ Legacy collection: medical.patients_legacy (plaintext)
# ✓ Secure collection: medical.patients_secure (encrypted)
# === Verification: Querying secure collection (no CSFLE) ===
# Name: John Doe
# SSN (encrypted): Binary - Binary ciphertext
# ✓ Data is encrypted in the database!`
        }
      ],
      onVerify: async () => validatorUtils.checkMigration(mongoUri)
    },
    {
      id: 'l3s2',
      title: 'Step 2: Multi-Tenant Isolation with KeyAltNames',
      estimatedTime: '12 min',
      description: 'Implement a SaaS-safe architecture where each tenant has their own DEK. Use the KeyAltName field to programmatically retrieve the correct key for each tenant request. This ensures complete data isolation between tenants - a key compromise for one tenant does not affect others.',
      tips: [
        'ACTION REQUIRED: Run the Node.js script below to create tenant-specific DEKs and demonstrate multi-tenant data isolation.',
        'TENANT ISOLATION: By using 1 DEK per Tenant, you ensure that a key compromise for one customer does not affect others.',
        'KEY LOOKUP: Use keyAltNames like "tenant-{tenantId}" to dynamically retrieve the correct DEK for each tenant.',
        'SCALABILITY: The __keyVault can store millions of keys. Ensure the unique index is present (Verified in Lab 1).',
        'BEST PRACTICE: Use template literals in schemaMap to dynamically set keyAltName based on the current tenant context.'
      ],
      codeBlocks: [
        {
          filename: 'multiTenantIsolation.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

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

  // Create DEKs for different tenants
  const tenants = ["acme", "contoso", "fabrikam"];
  
  console.log("=== Creating Tenant-Specific DEKs ===");
  for (const tenantId of tenants) {
    const keyAltName = \`tenant-\${tenantId}\`;
    
    // Check if DEK already exists
    const keyVaultDB = client.db("encryption");
    const existingKey = await keyVaultDB.collection("__keyVault").findOne({ 
      keyAltNames: keyAltName 
    });

    if (existingKey) {
      console.log(\`✓ DEK already exists for tenant: \${tenantId}\`);
    } else {
      const dekId = await encryption.createDataKey("aws", {
        masterKey: { 
          key: "${aliasName}", 
          region: "${awsRegion || 'eu-central-1'}" 
        },
        keyAltNames: [keyAltName]
      });
      console.log(\`✓ Created DEK for tenant: \${tenantId} (UUID: \${dekId.toString()})\`);
    }
  }

  // Demonstrate multi-tenant data insertion
  console.log("\\n=== Multi-Tenant Data Insertion ===");
  const saasDB = client.db("saas");
  
  for (const tenantId of tenants) {
    const keyAltName = \`tenant-\${tenantId}\`;
    
    // Look up the tenant's DEK
    const keyVaultDB = client.db("encryption");
    const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
      keyAltNames: keyAltName 
    });

    if (!keyDoc) {
      throw new Error(\`DEK not found for tenant: \${tenantId}\`);
    }

    const dekId = keyDoc._id;

    // Create schema map for this tenant
const schemaMap = {
  "saas.app": {
        bsonType: "object",
        encryptMetadata: {
          keyId: [dekId],
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
        },
        properties: {
          customerData: {
            encrypt: {
              bsonType: "string",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyId: [dekId]
            }
          }
        }
      }
    };

    // Insert data for this tenant using CSFLE${cryptSharedLibPath ? `
    const extraOptions = {
      cryptSharedLibPath: "${cryptSharedLibPath}",
      cryptSharedLibRequired: false
    };` : ''}

    const tenantClient = new MongoClient(uri, {
      autoEncryption: {
        keyVaultNamespace,
        kmsProviders,
        schemaMap${cryptSharedLibPath ? ',\n        ...extraOptions' : ''}
      }
    });

    await tenantClient.connect();
    const tenantCollection = tenantClient.db("saas").collection("app");
    
    await tenantCollection.insertOne({
      tenantId: tenantId,
      customerData: \`Sensitive data for \${tenantId}\`,
      timestamp: new Date()
    });

    console.log(\`✓ Inserted encrypted data for tenant: \${tenantId}\`);
    await tenantClient.close();
  }

  // Verify tenant isolation: Query each tenant's data
  console.log("\\n=== Verifying Tenant Isolation ===");
  const keyVaultDB = client.db("encryption");
  
  for (const tenantId of tenants) {
    const keyAltName = \`tenant-\${tenantId}\`;
    const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
      keyAltNames: keyAltName 
    });
    
    if (keyDoc) {
      console.log(\`✓ Tenant \${tenantId}: DEK exists (\${keyDoc._id.toString()})\`);
    }
  }

  console.log("\\n✓ Multi-tenant isolation setup complete!");
  console.log("✓ Each tenant has its own DEK, ensuring data isolation");

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// 1. Connect to MongoDB and get SSO credentials
// 2. Create DEKs for multiple tenants (acme, contoso, fabrikam)
// 3. For each tenant:
//    - Look up their DEK by keyAltName
//    - Create a schemaMap with that tenant's DEK
//    - Insert encrypted data using CSFLE client
// 4. Verify that each tenant has their own DEK in the key vault`
        },
        {
          filename: 'Terminal - Run the script',
          language: 'bash',
          code: `# Run in your terminal:
node multiTenantIsolation.cjs

# Expected Output:
# === Creating Tenant-Specific DEKs ===
# ✓ Created DEK for tenant: acme (UUID: ...)
# ✓ Created DEK for tenant: contoso (UUID: ...)
# ✓ Created DEK for tenant: fabrikam (UUID: ...)
# === Multi-Tenant Data Insertion ===
# ✓ Inserted encrypted data for tenant: acme
# ✓ Inserted encrypted data for tenant: contoso
# ✓ Inserted encrypted data for tenant: fabrikam
# === Verifying Tenant Isolation ===
# ✓ Tenant acme: DEK exists (...)
# ✓ Tenant contoso: DEK exists (...)
# ✓ Tenant fabrikam: DEK exists (...)
# ✓ Multi-tenant isolation setup complete!`
        }
      ],
      onVerify: async () => validatorUtils.checkTenantDEKs(mongoUri)
    },
    {
      id: 'l3s3',
      title: 'Step 3: Key Rotation (RewrapManyDataKey)',
      estimatedTime: '15 min',
      description: 'Rotate the Customer Master Key (CMK) without re-encrypting the actual data. This "Envelope Rotation" is a preferred compliance strategy for SAs. The rewrapManyDataKey() operation updates the DEK metadata to use a new CMK, but the encrypted data itself never changes - this is the power of envelope encryption!',
      tips: [
        'ACTION REQUIRED: Run the Node.js script below to rotate a DEK to use a new CMK.',
        'SA TIP: Use rewrapManyDataKey() to update the DEKs with a new CMK. This is a metadata-only operation and is extremely fast.',
        'COMPLIANCE: Regularly rotating the CMK is a standard requirement for SOC2 and PCI-DSS.',
        'ENVELOPE ENCRYPTION: The actual encrypted data never changes - only the DEK\'s CMK reference is updated.',
        'PREREQUISITE: Before rotation, ensure the NEW CMK exists and is accessible (see Step 4).',
        'IMPORTANT: The old CMK must still be accessible during rotation (to decrypt the DEK for rewrapping).'
      ],
      codeBlocks: [
        {
          filename: 'rotateCMK.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

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

  // Rotate the DEK from Lab 1
  const keyAltName = "user-${suffix}-ssn-key";
  
  console.log("=== Key Rotation: RewrapManyDataKey ===");
  console.log(\`Rotating DEK with keyAltName: \${keyAltName}\`);

  // Check if DEK exists
  const keyVaultDB = client.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: keyAltName 
  });

  if (!keyDoc) {
    throw new Error(\`DEK with keyAltName "\${keyAltName}" not found. Run createKey.cjs first.\`);
  }

  console.log(\`Found DEK: \${keyDoc._id.toString()}\`);

  // NOTE: In production, you would use a NEW CMK alias here
  // For this lab, we'll use the same CMK to demonstrate the rewrap operation
  // In real scenarios, create a new CMK first: alias/mongodb-lab-key-v2
  const newCMKAlias = "${aliasName}"; // Same key for demo
  
  console.log(\`\\nRotating DEK to use CMK: \${newCMKAlias}\`);
  console.log("NOTE: In production, use a NEW CMK alias here!");

  try {
    // RewrapManyDataKey: Updates the DEK's CMK without re-encrypting data
    const result = await encryption.rewrapManyDataKey(
      { keyAltNames: keyAltName }, // Filter: which DEKs to rotate
      {
        provider: "aws",
        masterKey: {
          key: newCMKAlias,
          region: "${awsRegion || 'eu-central-1'}"
        }
      }
    );

    console.log(\`\\n✓ Rotation complete!\`);
    console.log(\`  - Matched DEKs: \${result.bulkWriteResult.matchedCount}\`);
    console.log(\`  - Modified DEKs: \${result.bulkWriteResult.modifiedCount}\`);
    
    if (result.bulkWriteResult.modifiedCount > 0) {
      console.log(\`\\n✓ DEK successfully rewrapped with new CMK\`);
      console.log(\`✓ No data re-encryption required - this is envelope encryption!\`);
    } else {
      console.log(\`\\n⚠️  No DEKs were modified. They may already be using this CMK.\`);
    }

  } catch (error) {
    console.error("\\n✗ Rotation failed:", error.message);
    console.error("Common causes:");
    console.error("  - New CMK doesn't exist or isn't accessible");
    console.error("  - IAM permissions missing for new CMK");
    console.error("  - Old CMK access lost (can't decrypt DEK to rewrap)");
    throw error;
  }

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// 1. Connect to MongoDB and get SSO credentials
// 2. Initialize ClientEncryption
// 3. Look up the DEK by keyAltName that you want to rotate
// 4. Call rewrapManyDataKey() with:
//    - Filter: { keyAltNames: "..." } to select which DEKs to rotate
//    - New CMK configuration: { provider: "aws", masterKey: { key: "NEW_ALIAS", region: "..." } }
// 5. Check the result to see how many DEKs were modified
// Note: This is a metadata-only operation - encrypted data never changes!`
        },
        {
          filename: 'Terminal - Run the script',
          language: 'bash',
          code: `# Run in your terminal:
node rotateCMK.cjs

# Expected Output:
# === Key Rotation: RewrapManyDataKey ===
# Rotating DEK with keyAltName: user-<suffix>-ssn-key
# Found DEK: <UUID>
# Rotating DEK to use CMK: alias/mongodb-lab-key-<suffix>
# ✓ Rotation complete!
#   - Matched DEKs: 1
#   - Modified DEKs: 1
# ✓ DEK successfully rewrapped with new CMK
# ✓ No data re-encryption required - this is envelope encryption!`
        }
      ],
      onVerify: async () => validatorUtils.checkKeyRotation(mongoUri, `user-${suffix}-ssn-key`)
    },
    {
      id: 'l3s4',
      title: 'Step 4: Infrastructure: Rotation Readiness Check',
      estimatedTime: '8 min',
      description: 'Before rotating keys in MongoDB, you must verify that the new CMK exists and is accessible. Use the AWS CLI to check infrastructure readiness. This step ensures that rotation will succeed and helps prevent production issues.',
      tips: [
        'ACTION REQUIRED: Run the AWS CLI commands below to verify the new CMK exists and is accessible.',
        'SA NUANCE: Rotation will fail if the driver cannot "Decrypt" with the old key or "Encrypt" with the new one.',
        'PREREQUISITE: Create a new CMK in AWS KMS before attempting rotation in production.',
        'VERIFICATION: Check that the new CMK alias exists, is enabled, and your IAM user has access.',
        'MONITORING: SAs should recommend checking CloudWatch logs for KMS usage during a rewrap operation.',
        'BEST PRACTICE: Always verify infrastructure readiness before performing key rotation in production.'
      ],
      codeBlocks: [
        {
          filename: 'AWS CLI - Verify New CMK Exists',
          language: 'bash',
          code: `# 1. List all KMS aliases to find your new CMK
aws kms list-aliases --query "Aliases[?contains(AliasName, 'mongodb')].AliasName" --output table

# 2. Verify the NEW key exists and is enabled
aws kms describe-key --key-id "${aliasName}"

# Expected Output: Should show KeyState: "Enabled"

# 3. Check key policy to ensure your IAM user has access
# First, get the key ID from the alias:
KEY_ID=$(aws kms describe-key --key-id "${aliasName}" --region eu-central-1 --query 'KeyMetadata.KeyId' --output text)

# Then use the key ID to get the policy:
aws kms get-key-policy --key-id $KEY_ID --policy-name default --region eu-central-1

# 4. Verify you can use the key (test encryption/decryption)
aws kms encrypt --key-id "${aliasName}" --plaintext "test" --output text --query CiphertextBlob

# Expected Output: Base64-encoded ciphertext (proves you can encrypt)

# 5. Test decryption
aws kms decrypt --ciphertext-blob <paste-ciphertext-from-step-4> --output text --query Plaintext

# Expected Output: "dGVzdA==" (base64 for "test") - proves you can decrypt

# ✓ If all steps succeed, your infrastructure is ready for rotation!`,
          skeleton: `# 1. List KMS aliases to find your CMK
# 2. Describe the key to verify it's enabled
# 3. Get key policy to check IAM permissions
# 4. Test encryption with the new key
# 5. Test decryption with the new key
# If all succeed, infrastructure is ready!`
        },
        {
          filename: 'Note: Creating a New CMK for Rotation',
          language: 'markdown',
          code: `**For Production Rotation:**

Before running rotateCMK.cjs, create a NEW CMK in AWS:

\`\`\`bash
# Create a new CMK for rotation
aws kms create-key --description "MongoDB Lab Key V2" --region eu-central-1

# Create an alias for the new key
aws kms create-alias --alias-name alias/mongodb-lab-key-v2 --target-key-id <KEY_ID>

# Update rotateCMK.cjs to use: alias/mongodb-lab-key-v2
\`\`\`

For this lab demo, we use the same CMK to demonstrate the rewrap operation.`
        }
      ],
      onVerify: async () => validatorUtils.checkKmsAlias(aliasName)
    }
  ];

  const introContent = {
    whatYouWillBuild: [
      'Implement explicit encryption for data migration',
      'Design multi-tenant isolation with per-tenant DEKs',
      'Execute CMK rotation without re-encrypting data',
      'Understand the "Right to Erasure" pattern via crypto-shredding'
    ],
    keyConcepts: [
      {
        term: 'Explicit Encryption',
        explanation: 'Manually encrypt/decrypt fields using the ClientEncryption API. Required for migrating existing plaintext data to encrypted format.'
      },
      {
        term: 'Multi-Tenant Isolation',
        explanation: 'Assign one DEK per tenant. If a tenant\'s key is compromised, only their data is at risk - other tenants remain secure.'
      },
      {
        term: 'Crypto-Shredding (Right to Erasure)',
        explanation: 'Delete the DEK to make all associated data cryptographically unreadable. Fulfills GDPR Article 17 without finding/deleting every record.'
      }
    ],
    keyInsight: 'When a user requests deletion under GDPR, instead of finding and deleting all their data across collections, simply delete their DEK. All their data becomes cryptographically unreadable garbage.',
    architectureDiagram: (
      <pre className="text-xs font-mono text-muted-foreground whitespace-pre overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    1 DEK per User Pattern                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User A Data ──encrypted with──▶ DEK-A ──wrapped by──▶ CMK │
│  User B Data ──encrypted with──▶ DEK-B ──wrapped by──▶ CMK │
│  User C Data ──encrypted with──▶ DEK-C ──wrapped by──▶ CMK │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  DELETE DEK-A ═══▶ User A's data is now unreadable garbage │
│                                                             │
│  ✓ No need to find every User A record                     │
│  ✓ Instant compliance with GDPR Article 17                 │
│  ✓ Audit log shows key deletion timestamp                  │
└─────────────────────────────────────────────────────────────┘`}
      </pre>
    )
  };

  // Exercises for Lab 3
  const exercises = [
    {
      id: 'lab3-quiz-1',
      type: 'quiz' as const,
      title: 'GDPR Right to Erasure',
      description: 'Understanding crypto-shredding for compliance',
      points: 10,
      question: 'How does crypto-shredding help with GDPR Article 17 (Right to Erasure)?',
      options: [
        { id: 'a', label: 'It permanently deletes all user documents from the database', isCorrect: false },
        { id: 'b', label: 'It deletes the user\'s DEK, making all their encrypted data unreadable', isCorrect: true },
        { id: 'c', label: 'It encrypts the deletion request for audit purposes', isCorrect: false },
        { id: 'd', label: 'It creates a backup before deleting user data', isCorrect: false },
      ]
    },
    {
      id: 'lab3-quiz-2',
      type: 'quiz' as const,
      title: 'Multi-Tenant Key Strategy',
      description: 'Understanding tenant isolation patterns',
      points: 10,
      question: 'Why should each tenant have their own DEK in a multi-tenant application?',
      options: [
        { id: 'a', label: 'To reduce storage costs', isCorrect: false },
        { id: 'b', label: 'To improve query performance', isCorrect: false },
        { id: 'c', label: 'To isolate blast radius if a key is compromised', isCorrect: true },
        { id: 'd', label: 'MongoDB requires separate DEKs per tenant', isCorrect: false },
      ]
    },
    {
      id: 'lab3-challenge',
      type: 'challenge' as const,
      title: 'Migration Verification',
      description: 'Verify your migration was successful',
      points: 20,
      challengeSteps: [
        { instruction: 'Query the legacy collection to see plaintext SSNs', hint: 'db.legacy.findOne()' },
        { instruction: 'Query the secure collection WITHOUT CSFLE to see BinData ciphertext', hint: 'Connect without autoEncryption options' },
        { instruction: 'Query the secure collection WITH CSFLE to see decrypted SSNs', hint: 'Use the encrypted client from your script' },
        { instruction: 'Verify the record count matches between legacy and secure collections', hint: 'Use countDocuments() on both' },
      ]
    }
  ];

  return (
    <LabViewWithTabs
      labNumber={3}
      title="Right to Erasure & Migration Patterns"
      description="Elevate your SA skills by mastering complex production patterns. Learn to migrate legacy data explicitly, manage per-tenant key isolation, and perform lifecycle rotations for enterprise compliance."
      duration="15 min"
      prerequisites={[
        'Successful completion of Lab 1 & 2',
        'Familiarity with JS Async/Await',
        'Understanding of Envelope Encryption principles'
      ]}
      objectives={[
        'Implement Explicit Encryption API for bulk migration',
        'Design Multi-Tenant schemas using KeyAltNames',
        'Execute high-compliance CMK rotations',
        'Defend the "One DEK per compliance category" architecture'
      ]}
      steps={lab3Steps}
      introContent={introContent}
      exercises={exercises}
    />
  );
}
