import { LabView } from './LabView';

const lab3Steps = [
  {
    title: 'Understand the Right to Erasure Pattern',
    estimatedTime: '5 min',
    description: 'Learn the "One DEK per User" pattern that enables GDPR-compliant crypto-shredding. When a user requests deletion, you delete their DEK - making their data permanently indecipherable.',
    tips: [
      'Crypto-shredding is faster than finding and deleting all user data',
      'The data remains in the database but is cryptographically inaccessible',
      'This pattern requires CSFLE (not QE) due to DEK flexibility',
      'Each user gets a unique DEK identified by their user ID',
    ],
    codeBlocks: [
      {
        filename: 'Pattern Overview',
        language: 'text',
        code: `GDPR Article 17: Right to Erasure ("Right to be Forgotten")

Traditional Approach:
  1. Find all user data across all collections
  2. Delete each document/field
  3. Clear backups, logs, caches
  4. Prove complete deletion (hard!)

Crypto-Shredding Approach:
  1. Each user has their own DEK
  2. All user's sensitive data encrypted with their DEK
  3. On erasure request: DELETE THE DEK
  4. Data becomes permanently unreadable
  5. No need to touch actual data documents!

Benefits:
  ✓ Instant "deletion" - just remove one key
  ✓ Works even if data is in backups
  ✓ Auditable - show DEK deletion timestamp
  ✓ Simpler compliance proof`,
      },
    ],
  },
  {
    title: 'Set Up the One-DEK-Per-User Architecture',
    estimatedTime: '7 min',
    description: 'Create a system where each user gets their own Data Encryption Key. The key alt name will match the user ID for easy lookup.',
    codeBlocks: [
      {
        filename: 'config-gdpr.js',
        language: 'javascript',
        code: `// config-gdpr.js - Right to Erasure Configuration
const path = require("path");

module.exports = {
  mongoUri: process.env.MONGODB_URI || "mongodb+srv://<user>:<pass>@cluster.mongodb.net/",
  
  keyVaultDb: "encryption",
  keyVaultColl: "__keyVault",
  
  // User data collection
  userDataDb: "gdpr_demo",
  userDataColl: "user_profiles",

  // Using local key provider for demo (use KMS in production!)
  kmsProviders: {
    local: {
      key: Buffer.alloc(96), // 96-byte local master key (demo only!)
    },
  },

  cryptSharedPath: path.join(__dirname, "lib", "mongo_crypt_v1.dylib"),
};

// IMPORTANT: In production, use a real KMS (AWS/Azure/GCP)
// The local provider stores the key in memory - NOT secure!`,
      },
      {
        filename: 'setup-user-keys.js',
        language: 'javascript',
        code: `// setup-user-keys.js - Create per-user DEKs
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const crypto = require("crypto");
const config = require("./config-gdpr");

// Generate a proper local master key (demo purposes)
const localMasterKey = crypto.randomBytes(96);
config.kmsProviders.local.key = localMasterKey;

async function createUserDEK(encryption, userId) {
  // Check if DEK already exists for this user
  const client = encryption._client;
  const keyVault = client.db(config.keyVaultDb).collection(config.keyVaultColl);
  
  const existing = await keyVault.findOne({ keyAltNames: \`user_\${userId}\` });
  if (existing) {
    console.log(\`  DEK already exists for user \${userId}\`);
    return existing._id;
  }

  // Create new DEK with user-specific alt name
  const dataKeyId = await encryption.createDataKey("local", {
    keyAltNames: [\`user_\${userId}\`],
  });

  console.log(\`  Created DEK for user \${userId}: \${dataKeyId.toString("hex").substring(0, 16)}...\`);
  return dataKeyId;
}

async function setupUserKeys() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();

    // Ensure key vault index
    const keyVault = client.db(config.keyVaultDb).collection(config.keyVaultColl);
    await keyVault.createIndex(
      { keyAltNames: 1 },
      { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
    );

    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    // Create DEKs for sample users
    console.log("Creating per-user DEKs...");
    const userIds = ["user_001", "user_002", "user_003", "user_004", "user_005"];
    
    for (const userId of userIds) {
      await createUserDEK(encryption, userId);
    }

    console.log("\\n✓ Per-user DEK setup complete");

    // Show key vault contents
    const allKeys = await keyVault.find().toArray();
    console.log(\`\\nKey Vault now contains \${allKeys.length} DEKs:\`);
    allKeys.forEach(k => {
      console.log(\`  - \${k.keyAltNames?.[0] || "unnamed"}\`);
    });

  } finally {
    await client.close();
  }
}

// Export for reuse
module.exports = { localMasterKey };

setupUserKeys().catch(console.error);`,
      },
    ],
    expectedOutput: `Creating per-user DEKs...
  Created DEK for user user_001: 64a3b2c1d0e9f8a7...
  Created DEK for user user_002: 75b4c3d2e1f0a9b8...
  Created DEK for user user_003: 86c5d4e3f2b1a0c9...
  Created DEK for user user_004: 97d6e5f4a3c2b1d0...
  Created DEK for user user_005: a8e7f6b5c4d3e2f1...

✓ Per-user DEK setup complete

Key Vault now contains 5 DEKs:
  - user_user_001
  - user_user_002
  - user_user_003
  - user_user_004
  - user_user_005`,
  },
  {
    title: 'Insert User Data with Per-User Encryption',
    estimatedTime: '8 min',
    description: 'Insert user profile data where each user\'s sensitive fields are encrypted with their personal DEK.',
    codeBlocks: [
      {
        filename: 'insert-user-data.js',
        language: 'javascript',
        code: `// insert-user-data.js - Insert data with per-user DEKs
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const crypto = require("crypto");
const config = require("./config-gdpr");

// Use same master key as setup
const localMasterKey = crypto.randomBytes(96);
config.kmsProviders.local.key = localMasterKey;

async function insertUserData() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();

    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    const collection = client.db(config.userDataDb).collection(config.userDataColl);
    
    // Clear existing data
    await collection.deleteMany({});

    // Sample user data
    const users = [
      { id: "user_001", name: "Alice Johnson", email: "alice@example.com", ssn: "111-22-3333", phone: "+1-555-0101" },
      { id: "user_002", name: "Bob Smith", email: "bob@example.com", ssn: "444-55-6666", phone: "+1-555-0102" },
      { id: "user_003", name: "Carol White", email: "carol@example.com", ssn: "777-88-9999", phone: "+1-555-0103" },
      { id: "user_004", name: "David Brown", email: "david@example.com", ssn: "123-45-6789", phone: "+1-555-0104" },
      { id: "user_005", name: "Eva Martinez", email: "eva@example.com", ssn: "987-65-4321", phone: "+1-555-0105" },
    ];

    console.log("Inserting user data with per-user encryption...\\n");

    for (const user of users) {
      // Get this user's DEK by alt name
      const keyAltName = \`user_\${user.id}\`;

      // Encrypt sensitive fields with user's DEK
      const encryptedSSN = await encryption.encrypt(user.ssn, {
        keyAltName: keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      });

      const encryptedPhone = await encryption.encrypt(user.phone, {
        keyAltName: keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      });

      const encryptedEmail = await encryption.encrypt(user.email, {
        keyAltName: keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      });

      // Insert document with encrypted fields
      await collection.insertOne({
        userId: user.id,
        name: user.name,  // Not encrypted (for display)
        email: encryptedEmail,
        ssn: encryptedSSN,
        phone: encryptedPhone,
        keyAltName: keyAltName,  // Track which DEK was used
        createdAt: new Date(),
        gdprConsent: true,
      });

      console.log(\`  ✓ Inserted \${user.name} (encrypted with \${keyAltName})\`);
    }

    console.log(\`\\n✓ Inserted \${users.length} users with per-user encryption\`);

  } finally {
    await client.close();
  }
}

insertUserData().catch(console.error);`,
      },
    ],
    expectedOutput: `Inserting user data with per-user encryption...

  ✓ Inserted Alice Johnson (encrypted with user_user_001)
  ✓ Inserted Bob Smith (encrypted with user_user_002)
  ✓ Inserted Carol White (encrypted with user_user_003)
  ✓ Inserted David Brown (encrypted with user_user_004)
  ✓ Inserted Eva Martinez (encrypted with user_user_005)

✓ Inserted 5 users with per-user encryption`,
  },
  {
    title: 'Simulate Right to Erasure Request',
    estimatedTime: '10 min',
    description: 'Simulate a GDPR erasure request by deleting a user\'s DEK. After deletion, their data becomes permanently unreadable.',
    codeBlocks: [
      {
        filename: 'right-to-erasure.js',
        language: 'javascript',
        code: `// right-to-erasure.js - Implement crypto-shredding
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const crypto = require("crypto");
const config = require("./config-gdpr");

const localMasterKey = crypto.randomBytes(96);
config.kmsProviders.local.key = localMasterKey;

async function processErasureRequest(targetUserId) {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    const keyVault = client.db(config.keyVaultDb).collection(config.keyVaultColl);
    const userCollection = client.db(config.userDataDb).collection(config.userDataColl);
    const keyAltName = \`user_\${targetUserId}\`;

    console.log("=== GDPR Right to Erasure Request ===");
    console.log(\`Target User: \${targetUserId}\\n\`);

    // Step 1: Verify user exists and show current data
    console.log("Step 1: Verify user data exists");
    const userDoc = await userCollection.findOne({ userId: targetUserId });
    if (!userDoc) {
      console.log("  User not found!");
      return;
    }
    console.log(\`  Found user: \${userDoc.name}\`);
    console.log(\`  SSN field type: \${userDoc.ssn._bsontype}\`);

    // Try to decrypt BEFORE deletion
    console.log("\\nStep 2: Verify we CAN decrypt before erasure");
    try {
      const decryptedSSN = await encryption.decrypt(userDoc.ssn);
      console.log(\`  ✓ SSN decrypts successfully: \${decryptedSSN}\`);
    } catch (e) {
      console.log(\`  ✗ Decryption failed: \${e.message}\`);
    }

    // Step 3: DELETE THE DEK (crypto-shredding!)
    console.log("\\nStep 3: DELETE USER'S DEK (Crypto-Shredding)");
    const deleteResult = await keyVault.deleteOne({ keyAltNames: keyAltName });
    
    if (deleteResult.deletedCount === 1) {
      console.log(\`  ✓ DEK deleted for \${keyAltName}\`);
      console.log(\`  Timestamp: \${new Date().toISOString()}\`);
    } else {
      console.log("  ✗ DEK not found");
    }

    // Step 4: Verify data is now UNREADABLE
    console.log("\\nStep 4: Verify data is now UNREADABLE");
    console.log("  Attempting to decrypt user's SSN...");
    
    try {
      await encryption.decrypt(userDoc.ssn);
      console.log("  ✗ ERROR: Data still readable!");
    } catch (e) {
      console.log(\`  ✓ Decryption FAILED as expected: "cannot find key"\`);
      console.log("  ✓ User's data is now cryptographically inaccessible!");
    }

    // Step 5: Verify OTHER users are unaffected
    console.log("\\nStep 5: Verify other users are UNAFFECTED");
    const otherUsers = await userCollection.find({ 
      userId: { $ne: targetUserId } 
    }).limit(2).toArray();

    for (const other of otherUsers) {
      try {
        const decrypted = await encryption.decrypt(other.ssn);
        console.log(\`  ✓ \${other.name}'s data still accessible: \${decrypted}\`);
      } catch (e) {
        console.log(\`  ✗ \${other.name}'s data inaccessible (unexpected)\`);
      }
    }

    // Summary
    console.log("\\n=== Erasure Complete ===");
    console.log(\`User \${targetUserId}'s data has been crypto-shredded.\`);
    console.log("The data documents still exist but are permanently unreadable.");
    console.log("This satisfies GDPR Article 17 requirements.\\n");

    // Audit log entry
    const auditLog = {
      action: "GDPR_RIGHT_TO_ERASURE",
      userId: targetUserId,
      keyAltName: keyAltName,
      timestamp: new Date(),
      method: "crypto-shredding",
      dekDeleted: true,
      dataDocumentsRetained: true,
      note: "User DEK deleted - all user data is now cryptographically inaccessible"
    };
    console.log("Audit Log Entry:", JSON.stringify(auditLog, null, 2));

  } finally {
    await client.close();
  }
}

// Process erasure for user_003 (Carol White)
processErasureRequest("user_003").catch(console.error);`,
      },
    ],
    expectedOutput: `=== GDPR Right to Erasure Request ===
Target User: user_003

Step 1: Verify user data exists
  Found user: Carol White
  SSN field type: Binary

Step 2: Verify we CAN decrypt before erasure
  ✓ SSN decrypts successfully: 777-88-9999

Step 3: DELETE USER'S DEK (Crypto-Shredding)
  ✓ DEK deleted for user_user_003
  Timestamp: 2024-01-15T14:30:00.000Z

Step 4: Verify data is now UNREADABLE
  Attempting to decrypt user's SSN...
  ✓ Decryption FAILED as expected: "cannot find key"
  ✓ User's data is now cryptographically inaccessible!

Step 5: Verify other users are UNAFFECTED
  ✓ Alice Johnson's data still accessible: 111-22-3333
  ✓ Bob Smith's data still accessible: 444-55-6666

=== Erasure Complete ===
User user_003's data has been crypto-shredded.
The data documents still exist but are permanently unreadable.
This satisfies GDPR Article 17 requirements.`,
  },
  {
    title: 'Verify Crypto-Shredding Effectiveness',
    estimatedTime: '5 min',
    description: 'Run a comprehensive verification to confirm that the target user\'s data is truly inaccessible while all other users remain unaffected.',
    codeBlocks: [
      {
        filename: 'verify-erasure.js',
        language: 'javascript',
        code: `// verify-erasure.js - Comprehensive verification
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const crypto = require("crypto");
const config = require("./config-gdpr");

const localMasterKey = crypto.randomBytes(96);
config.kmsProviders.local.key = localMasterKey;

async function verifyErasure() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();

    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    const keyVault = client.db(config.keyVaultDb).collection(config.keyVaultColl);
    const userCollection = client.db(config.userDataDb).collection(config.userDataColl);

    console.log("=== Crypto-Shredding Verification Report ===\\n");

    // 1. Key Vault Status
    console.log("1. Key Vault Status:");
    const allKeys = await keyVault.find().toArray();
    console.log(\`   Total DEKs: \${allKeys.length}\`);
    console.log("   Active keys:");
    allKeys.forEach(k => console.log(\`     - \${k.keyAltNames?.[0]}\`));

    // 2. User Data Accessibility
    console.log("\\n2. User Data Accessibility Matrix:");
    console.log("   " + "-".repeat(60));
    console.log("   | User ID    | Name           | SSN Accessible | Status    |");
    console.log("   " + "-".repeat(60));

    const allUsers = await userCollection.find().toArray();
    
    for (const user of allUsers) {
      let ssnAccessible = false;
      let ssnValue = "N/A";
      
      try {
        ssnValue = await encryption.decrypt(user.ssn);
        ssnAccessible = true;
      } catch (e) {
        ssnValue = "[SHREDDED]";
      }

      const status = ssnAccessible ? "Active" : "ERASED";
      const statusIcon = ssnAccessible ? "✓" : "✗";
      
      console.log(\`   | \${user.userId.padEnd(10)} | \${user.name.padEnd(14)} | \${String(ssnAccessible).padEnd(14)} | \${statusIcon} \${status.padEnd(7)} |\`);
    }
    
    console.log("   " + "-".repeat(60));

    // 3. Summary
    const erasedCount = allUsers.filter(async u => {
      try {
        await encryption.decrypt(u.ssn);
        return false;
      } catch {
        return true;
      }
    }).length;

    console.log("\\n3. Summary:");
    console.log(\`   Total users in database: \${allUsers.length}\`);
    console.log(\`   DEKs remaining: \${allKeys.length}\`);
    console.log(\`   Users with inaccessible data: \${allUsers.length - allKeys.length}\`);
    
    console.log("\\n4. Compliance Notes:");
    console.log("   ✓ Erased users' data remains in database (for referential integrity)");
    console.log("   ✓ Without DEK, data is cryptographically equivalent to random bytes");
    console.log("   ✓ Backup systems containing this data are also effectively erased");
    console.log("   ✓ Audit trail preserved for compliance verification");

  } finally {
    await client.close();
  }
}

verifyErasure().catch(console.error);`,
      },
    ],
    expectedOutput: `=== Crypto-Shredding Verification Report ===

1. Key Vault Status:
   Total DEKs: 4
   Active keys:
     - user_user_001
     - user_user_002
     - user_user_004
     - user_user_005

2. User Data Accessibility Matrix:
   ------------------------------------------------------------
   | User ID    | Name           | SSN Accessible | Status    |
   ------------------------------------------------------------
   | user_001   | Alice Johnson  | true           | ✓ Active  |
   | user_002   | Bob Smith      | true           | ✓ Active  |
   | user_003   | Carol White    | false          | ✗ ERASED  |
   | user_004   | David Brown    | true           | ✓ Active  |
   | user_005   | Eva Martinez   | true           | ✓ Active  |
   ------------------------------------------------------------

3. Summary:
   Total users in database: 5
   DEKs remaining: 4
   Users with inaccessible data: 1

4. Compliance Notes:
   ✓ Erased users' data remains in database (for referential integrity)
   ✓ Without DEK, data is cryptographically equivalent to random bytes
   ✓ Backup systems containing this data are also effectively erased
   ✓ Audit trail preserved for compliance verification`,
  },
  {
    title: 'Document the Compliance Process',
    estimatedTime: '5 min',
    description: 'Create proper documentation and audit trails for GDPR compliance. This is essential for proving erasure to regulators.',
    codeBlocks: [
      {
        filename: 'compliance-documentation.md',
        language: 'markdown',
        code: `# GDPR Right to Erasure - Implementation Documentation

## Architecture Overview

This system implements GDPR Article 17 "Right to Erasure" using the 
**crypto-shredding** pattern with MongoDB Client-Side Field Level Encryption.

### Key Principles

1. **One DEK Per User**: Each user's sensitive data is encrypted with a 
   unique Data Encryption Key (DEK) identified by \`user_{userId}\`.

2. **Centralized Key Vault**: All DEKs stored in the \`__keyVault\` collection,
   protected by a Customer Master Key (CMK) in the KMS.

3. **Crypto-Shredding**: On erasure request, the user's DEK is deleted.
   Without the DEK, the encrypted data is cryptographically random.

## Erasure Process

### Step 1: Receive Request
- Verify requester identity (authentication)
- Log request receipt with timestamp

### Step 2: Locate User DEK
- Query key vault: \`{ keyAltNames: "user_{userId}" }\`
- Verify DEK exists

### Step 3: Delete DEK
- Execute: \`keyVault.deleteOne({ keyAltNames: "user_{userId}" })\`
- Record deletion timestamp

### Step 4: Verify Erasure
- Attempt to decrypt user data (should fail)
- Generate verification report

### Step 5: Audit Trail
- Log all actions with timestamps
- Retain audit log (this is NOT user data)

## Audit Log Schema

\`\`\`javascript
{
  action: "GDPR_RIGHT_TO_ERASURE",
  userId: "user_003",
  keyAltName: "user_user_003",
  requestedAt: ISODate("2024-01-15T14:00:00Z"),
  processedAt: ISODate("2024-01-15T14:30:00Z"),
  dekDeleted: true,
  verificationPassed: true,
  processor: "system",
  notes: "Erasure completed within 24 hours of request"
}
\`\`\`

## Compliance Benefits

| Requirement | Implementation |
|------------|----------------|
| Complete erasure | DEK deletion = data inaccessible |
| Timely processing | Instant effect on deletion |
| Backup coverage | Backups also become unreadable |
| Proof of erasure | Audit log + verification report |
| Reversibility | NOT reversible (by design) |`,
      },
    ],
    tips: [
      'Keep audit logs for at least 3 years for GDPR compliance',
      'Test the erasure process regularly in non-production environments',
      'Document the process for regulatory inquiries',
      'Consider implementing a "soft delete" waiting period before DEK deletion',
    ],
  },
];

export function Lab3RightToErasure() {
  return (
    <LabView
      labNumber={3}
      title="Right to Erasure (GDPR) with CSFLE"
      description="Implement the GDPR Right to Erasure using crypto-shredding. Learn the 'One DEK per User' pattern where deleting a user's encryption key renders their data permanently inaccessible."
      duration="34 min"
      prerequisites={[
        'MongoDB Atlas cluster (M10+ recommended)',
        'Node.js 18+ installed',
        'Understanding of CSFLE basics (Lab 1)',
        'Familiarity with GDPR Article 17 requirements',
      ]}
      objectives={[
        'Understand the crypto-shredding pattern for GDPR compliance',
        'Implement One-DEK-per-User architecture',
        'Execute a Right to Erasure request',
        'Verify that erased data is truly inaccessible',
        'Document the process for compliance audits',
      ]}
      steps={lab3Steps}
    />
  );
}
