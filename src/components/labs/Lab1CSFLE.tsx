import { LabView } from './LabView';

const lab1Steps = [
  {
    title: 'Configure AWS KMS and Create CMK',
    estimatedTime: '10 min',
    description: 'Create a Customer Master Key (CMK) in AWS KMS that will be used to encrypt your Data Encryption Keys (DEKs).',
    tips: [
      'Use a dedicated KMS key for MongoDB encryption - don\'t reuse existing keys',
      'Note down the Key ARN - you\'ll need it in the next steps',
      'Ensure your IAM user has kms:Encrypt and kms:Decrypt permissions',
    ],
    codeBlocks: [
      {
        filename: 'AWS CLI - Create CMK',
        language: 'bash',
        code: `# Create a symmetric CMK for MongoDB encryption
aws kms create-key \\
  --description "MongoDB CSFLE Master Key" \\
  --key-usage ENCRYPT_DECRYPT \\
  --key-spec SYMMETRIC_DEFAULT \\
  --region us-east-1

# Note the KeyId from the output, then create an alias
aws kms create-alias \\
  --alias-name alias/mongodb-csfle-key \\
  --target-key-id <YOUR_KEY_ID> \\
  --region us-east-1

# Verify the key
aws kms describe-key --key-id alias/mongodb-csfle-key --region us-east-1`,
      },
      {
        filename: 'IAM Policy (mongodb-csfle-policy.json)',
        language: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:YOUR_ACCOUNT:key/YOUR_KEY_ID"
    }
  ]
}`,
      },
    ],
    expectedOutput: `{
  "KeyMetadata": {
    "KeyId": "12345678-1234-1234-1234-123456789012",
    "Arn": "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",
    "KeyState": "Enabled",
    "KeyUsage": "ENCRYPT_DECRYPT"
  }
}`,
    troubleshooting: [
      'If you get "AccessDeniedException", ensure your IAM user has the kms:CreateKey permission',
      'Make sure you\'re in the correct AWS region',
    ],
  },
  {
    title: 'Set Up Project and Dependencies',
    estimatedTime: '5 min',
    description: 'Initialize a Node.js project and install the required dependencies including the MongoDB driver and encryption libraries.',
    codeBlocks: [
      {
        filename: 'Terminal',
        language: 'bash',
        code: `# Create project directory
mkdir mongodb-csfle-lab && cd mongodb-csfle-lab

# Initialize npm project
npm init -y

# Install dependencies
npm install mongodb mongodb-client-encryption aws-sdk

# Download the crypt_shared library (CRITICAL!)
# For macOS:
curl -O https://downloads.mongodb.com/osx/mongo_crypt_shared_v1-macos-x86_64-enterprise-7.0.0.tgz
tar -xzf mongo_crypt_shared_v1-macos-x86_64-enterprise-7.0.0.tgz

# For Linux:
# curl -O https://downloads.mongodb.com/linux/mongo_crypt_shared_v1-linux-x86_64-enterprise-rhel80-7.0.0.tgz

# Note the path to the extracted library - you'll need it!
echo "crypt_shared path: $(pwd)/lib/mongo_crypt_v1.dylib"`,
      },
    ],
    tips: [
      'The crypt_shared library is REQUIRED for automatic encryption',
      'Store the absolute path to crypt_shared - relative paths cause issues',
      'Use the correct version matching your MongoDB server version',
    ],
    troubleshooting: [
      'If npm install fails, ensure you have Node.js 18+ installed',
      'The crypt_shared library must match your OS architecture (x86_64 vs arm64)',
    ],
  },
  {
    title: 'Create Configuration File',
    estimatedTime: '3 min',
    description: 'Create a configuration file with your MongoDB connection string and AWS KMS credentials.',
    codeBlocks: [
      {
        filename: 'config.js',
        language: 'javascript',
        code: `// config.js - CSFLE Configuration
module.exports = {
  // MongoDB Atlas connection string
  mongoUri: process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@cluster.mongodb.net/",
  
  // Database and collection names
  keyVaultDb: "encryption",
  keyVaultColl: "__keyVault",
  encryptedDb: "medicalRecords",
  encryptedColl: "patients",

  // AWS KMS Configuration
  kmsProviders: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },

  // AWS Master Key configuration
  masterKey: {
    region: "us-east-1",
    key: "arn:aws:kms:us-east-1:YOUR_ACCOUNT:key/YOUR_KEY_ID",
  },

  // CRITICAL: Path to crypt_shared library
  // This must be an ABSOLUTE path!
  cryptSharedPath: "/full/path/to/lib/mongo_crypt_v1.dylib",
};`,
      },
    ],
    tips: [
      'Use environment variables for sensitive data in production',
      'The cryptSharedPath MUST be an absolute path, not relative',
      'Test your connection string separately before adding encryption',
    ],
  },
  {
    title: 'Create Key Vault and Generate DEK',
    estimatedTime: '5 min',
    description: 'Set up the key vault collection with a unique index and generate a Data Encryption Key (DEK) using your AWS CMK.',
    codeBlocks: [
      {
        filename: 'setup-keys.js',
        language: 'javascript',
        code: `// setup-keys.js - Create Key Vault and DEK
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const config = require("./config");

async function setupKeyVault() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Create unique index on keyAltNames (REQUIRED)
    const keyVaultColl = client
      .db(config.keyVaultDb)
      .collection(config.keyVaultColl);
    
    await keyVaultColl.createIndex(
      { keyAltNames: 1 },
      {
        unique: true,
        partialFilterExpression: { keyAltNames: { $exists: true } },
      }
    );
    console.log("Created unique index on key vault");

    // Initialize ClientEncryption
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    // Create DEK for patient SSN field
    const dataKeyId = await encryption.createDataKey("aws", {
      masterKey: config.masterKey,
      keyAltNames: ["patientDataKey"],
    });

    console.log("Created Data Encryption Key:");
    console.log("  Key ID (Base64):", dataKeyId.toString("base64"));
    console.log("  Key Alt Name: patientDataKey");

    // Save the key ID for later use
    return dataKeyId;
  } finally {
    await client.close();
  }
}

setupKeyVault().catch(console.error);`,
      },
    ],
    expectedOutput: `Connected to MongoDB
Created unique index on key vault
Created Data Encryption Key:
  Key ID (Base64): abc123...xyz==
  Key Alt Name: patientDataKey`,
    troubleshooting: [
      'If you get "duplicate key error", the index or key already exists - this is OK',
      '"KMS request failed" means check your AWS credentials and key ARN',
      'Ensure your Atlas IP whitelist includes your current IP',
    ],
  },
  {
    title: 'Implement Automatic Encryption',
    estimatedTime: '10 min',
    description: 'Create the main application with automatic encryption using a schema map that defines which fields to encrypt.',
    codeBlocks: [
      {
        filename: 'app.js',
        language: 'javascript',
        code: `// app.js - CSFLE with Automatic Encryption
const { MongoClient } = require("mongodb");
const config = require("./config");

// Schema map defines which fields to encrypt and how
const schemaMap = {
  [\`\${config.encryptedDb}.\${config.encryptedColl}\`]: {
    bsonType: "object",
    encryptMetadata: {
      keyId: "/keyAltName", // Uses key alt name for lookup
    },
    properties: {
      ssn: {
        encrypt: {
          keyId: "/keyAltName",
          bsonType: "string",
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        },
      },
      medicalRecords: {
        encrypt: {
          keyId: "/keyAltName",
          bsonType: "array",
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        },
      },
      insurance: {
        bsonType: "object",
        properties: {
          policyNumber: {
            encrypt: {
              keyId: "/keyAltName",
              bsonType: "string",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            },
          },
        },
      },
    },
  },
};

async function main() {
  // Create encrypted client with auto encryption
  const encryptedClient = new MongoClient(config.mongoUri, {
    autoEncryption: {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
      schemaMap: schemaMap,
      extraOptions: {
        cryptSharedLibPath: config.cryptSharedPath,
      },
    },
  });

  try {
    await encryptedClient.connect();
    console.log("Connected with automatic encryption enabled");

    const collection = encryptedClient
      .db(config.encryptedDb)
      .collection(config.encryptedColl);

    // Insert a patient record - encryption happens automatically!
    const patient = {
      name: "John Doe",
      ssn: "123-45-6789", // Will be encrypted (deterministic)
      dateOfBirth: new Date("1990-05-15"),
      medicalRecords: [    // Will be encrypted (random)
        { date: new Date(), diagnosis: "Flu", treatment: "Rest" }
      ],
      insurance: {
        provider: "Blue Cross",
        policyNumber: "BC-123456", // Will be encrypted (deterministic)
      },
      keyAltName: "patientDataKey", // References our DEK
    };

    const result = await collection.insertOne(patient);
    console.log("Inserted patient:", result.insertedId);

    // Query by encrypted field (works because SSN is deterministic!)
    const found = await collection.findOne({ ssn: "123-45-6789" });
    console.log("Found patient:", found.name);
    console.log("Decrypted SSN:", found.ssn);

  } finally {
    await encryptedClient.close();
  }
}

main().catch(console.error);`,
      },
    ],
    tips: [
      'Deterministic encryption allows equality queries but reveals patterns',
      'Random encryption is more secure but only supports insert/retrieve',
      'The schema map is the key to automatic encryption - define it carefully',
    ],
  },
  {
    title: 'Fix crypt_shared Path Issues (Troubleshooting)',
    estimatedTime: '5 min',
    description: 'Common issue: The crypt_shared library path is incorrect. Here\'s how to diagnose and fix it.',
    codeBlocks: [
      {
        filename: 'diagnose-crypt-shared.js',
        language: 'javascript',
        code: `// diagnose-crypt-shared.js - Debug crypt_shared issues
const fs = require("fs");
const path = require("path");
const config = require("./config");

console.log("=== crypt_shared Diagnostic ===\\n");

// Check if path is absolute
const isAbsolute = path.isAbsolute(config.cryptSharedPath);
console.log("Path is absolute:", isAbsolute);
if (!isAbsolute) {
  console.log("❌ ERROR: Path must be absolute!");
  console.log("   Current:", config.cryptSharedPath);
  console.log("   Fix: Use full path starting with /");
}

// Check if file exists
const exists = fs.existsSync(config.cryptSharedPath);
console.log("File exists:", exists);
if (!exists) {
  console.log("❌ ERROR: File not found!");
  console.log("   Looking for:", config.cryptSharedPath);
  console.log("   Fix: Download crypt_shared from MongoDB");
}

// Check file permissions
if (exists) {
  try {
    fs.accessSync(config.cryptSharedPath, fs.constants.R_OK);
    console.log("File readable: true ✓");
  } catch {
    console.log("❌ ERROR: File not readable!");
    console.log("   Fix: chmod +r", config.cryptSharedPath);
  }
}

// Check architecture match
const os = require("os");
console.log("\\nSystem architecture:", os.arch());
console.log("Platform:", os.platform());

if (config.cryptSharedPath.includes("x86_64") && os.arch() === "arm64") {
  console.log("❌ WARNING: Architecture mismatch!");
  console.log("   You're on ARM64 but using x86_64 library");
  console.log("   Download the ARM64 version instead");
}

console.log("\\n=== End Diagnostic ===");`,
      },
      {
        filename: 'Fix: Update config.js with correct path',
        language: 'javascript',
        code: `// WRONG - relative path
cryptSharedPath: "./lib/mongo_crypt_v1.dylib",

// WRONG - missing file extension
cryptSharedPath: "/Users/me/project/lib/mongo_crypt_v1",

// CORRECT - absolute path with extension
cryptSharedPath: "/Users/me/mongodb-csfle-lab/lib/mongo_crypt_v1.dylib",

// TIP: Use __dirname for portable absolute paths
const path = require("path");
cryptSharedPath: path.join(__dirname, "lib", "mongo_crypt_v1.dylib"),`,
      },
    ],
    troubleshooting: [
      '"MongoError: mongocrypt_init failed" → crypt_shared path is wrong or file missing',
      '"Cannot find module" → Check the path uses forward slashes, even on Windows',
      '"Unsupported architecture" → Download the correct ARM64 or x86_64 version',
      'On macOS: May need to allow the library in System Preferences > Security',
    ],
  },
  {
    title: 'Verify Encryption in Atlas',
    estimatedTime: '5 min',
    description: 'Confirm that your data is encrypted by viewing it in MongoDB Atlas and comparing encrypted vs unencrypted client views.',
    codeBlocks: [
      {
        filename: 'verify-encryption.js',
        language: 'javascript',
        code: `// verify-encryption.js - Compare encrypted vs plain view
const { MongoClient } = require("mongodb");
const config = require("./config");

async function verify() {
  // Connect WITHOUT encryption to see raw data
  const plainClient = new MongoClient(config.mongoUri);
  
  try {
    await plainClient.connect();
    const collection = plainClient
      .db(config.encryptedDb)
      .collection(config.encryptedColl);

    const doc = await collection.findOne({});
    
    console.log("=== RAW DATA (What Atlas/DBAs see) ===");
    console.log("Name:", doc.name); // Visible (not encrypted)
    console.log("SSN type:", typeof doc.ssn); // Should be Binary
    console.log("SSN value:", doc.ssn); // Binary blob, not readable!
    
    // Check for BSON Binary Subtype 6 (encrypted)
    if (doc.ssn && doc.ssn._bsontype === "Binary" && doc.ssn.sub_type === 6) {
      console.log("\\n✓ SSN is encrypted (BSON Subtype 6)");
    } else {
      console.log("\\n✗ SSN is NOT encrypted - check your schema map!");
    }

  } finally {
    await plainClient.close();
  }
}

verify().catch(console.error);`,
      },
    ],
    expectedOutput: `=== RAW DATA (What Atlas/DBAs see) ===
Name: John Doe
SSN type: object
SSN value: Binary.createFromBase64("AWx...encrypted...data==", 6)

✓ SSN is encrypted (BSON Subtype 6)`,
    tips: [
      'In Atlas UI: Navigate to Collections and look for Binary fields marked "Encrypted"',
      'BSON Subtype 6 is the indicator for encrypted data',
      'If you see plaintext SSN, the schema map configuration is wrong',
    ],
  },
];

export function Lab1CSFLE() {
  return (
    <LabView
      labNumber={1}
      title="CSFLE with AWS KMS"
      description="Implement Client-Side Field Level Encryption using AWS Key Management Service. Learn to configure automatic encryption, troubleshoot common issues, and verify encrypted data."
      duration="45 min"
      prerequisites={[
        'MongoDB Atlas cluster (M10+ for automatic encryption)',
        'AWS account with KMS access',
        'Node.js 18+ installed',
        'mongosh 2.0+ installed',
        'AWS CLI configured with credentials',
      ]}
      objectives={[
        'Configure AWS KMS and create a Customer Master Key',
        'Set up key vault collection with proper indexes',
        'Implement automatic encryption with schema maps',
        'Troubleshoot crypt_shared library issues',
        'Verify encryption using BSON Subtype 6 inspection',
      ]}
      steps={lab1Steps}
    />
  );
}
