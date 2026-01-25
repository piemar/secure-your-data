import { LabView } from './LabView';

const lab2Steps = [
  {
    title: 'Configure Azure Key Vault',
    estimatedTime: '10 min',
    description: 'Create an Azure Key Vault and register an application in Azure AD for authentication. This will store your Customer Master Key.',
    tips: [
      'Use a dedicated Key Vault for MongoDB encryption',
      'Enable soft-delete and purge protection for production',
      'Note down the Vault URI, Tenant ID, Client ID, and Client Secret',
    ],
    codeBlocks: [
      {
        filename: 'Azure CLI - Create Key Vault',
        language: 'bash',
        code: `# Login to Azure
az login

# Create resource group (if needed)
az group create --name mongodb-encryption-rg --location eastus

# Create Key Vault with soft-delete enabled
az keyvault create \\
  --name mongodb-qe-vault \\
  --resource-group mongodb-encryption-rg \\
  --location eastus \\
  --enable-soft-delete true \\
  --enable-purge-protection true

# Create a key for MongoDB encryption
az keyvault key create \\
  --vault-name mongodb-qe-vault \\
  --name mongodb-qe-key \\
  --kty RSA \\
  --size 4096

# Note the key identifier (kid) from the output`,
      },
      {
        filename: 'Azure CLI - Register Application',
        language: 'bash',
        code: `# Register an application in Azure AD
az ad app create --display-name "MongoDB-QE-App"

# Note the appId (this is your Client ID)

# Create a service principal
az ad sp create --id <APP_ID>

# Create a client secret (valid for 2 years)
az ad app credential reset \\
  --id <APP_ID> \\
  --append \\
  --years 2

# Note the password (this is your Client Secret)

# Grant the app access to Key Vault keys
az keyvault set-policy \\
  --name mongodb-qe-vault \\
  --spn <APP_ID> \\
  --key-permissions get unwrapKey wrapKey`,
      },
    ],
    expectedOutput: `{
  "appId": "12345678-1234-1234-1234-123456789012",
  "password": "your-client-secret-here",
  "tenant": "your-tenant-id-here"
}`,
  },
  {
    title: 'Set Up Project for Queryable Encryption',
    estimatedTime: '5 min',
    description: 'Initialize a Node.js project with dependencies for Queryable Encryption. QE requires MongoDB 7.0+ and specific driver versions.',
    codeBlocks: [
      {
        filename: 'Terminal',
        language: 'bash',
        code: `# Create project directory
mkdir mongodb-qe-lab && cd mongodb-qe-lab

# Initialize npm project
npm init -y

# Install dependencies (note: mongodb 6.0+ required for QE)
npm install mongodb@6.3 mongodb-client-encryption

# Download crypt_shared library for your platform
# macOS ARM64:
curl -O https://downloads.mongodb.com/osx/mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.0.tgz

# Extract
tar -xzf mongo_crypt_shared_v1-*.tgz`,
      },
      {
        filename: 'config.js',
        language: 'javascript',
        code: `// config.js - Queryable Encryption Configuration
const path = require("path");

module.exports = {
  mongoUri: process.env.MONGODB_URI || "mongodb+srv://<user>:<pass>@cluster.mongodb.net/",
  
  // Key vault namespace
  keyVaultDb: "encryption",
  keyVaultColl: "__keyVault",
  
  // Encrypted database/collection
  encryptedDb: "hr",
  encryptedColl: "employees",

  // Azure Key Vault configuration
  kmsProviders: {
    azure: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
  },

  // Azure Master Key
  masterKey: {
    keyVaultEndpoint: "https://mongodb-qe-vault.vault.azure.net",
    keyName: "mongodb-qe-key",
  },

  cryptSharedPath: path.join(__dirname, "lib", "mongo_crypt_v1.dylib"),
};`,
      },
    ],
    troubleshooting: [
      'QE requires MongoDB 7.0+ server and driver 6.0+',
      'Ensure your Atlas cluster is M10+ and version 7.0+',
    ],
  },
  {
    title: 'Create Encrypted Collection with QE Schema',
    estimatedTime: '7 min',
    description: 'Use createEncryptedCollection() to set up a collection with Queryable Encryption. This automatically creates the necessary metadata collections (.esc, .ecoc).',
    codeBlocks: [
      {
        filename: 'setup-qe-collection.js',
        language: 'javascript',
        code: `// setup-qe-collection.js - Create QE Encrypted Collection
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const config = require("./config");

async function setupQECollection() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Create key vault index
    const keyVaultColl = client.db(config.keyVaultDb).collection(config.keyVaultColl);
    await keyVaultColl.createIndex(
      { keyAltNames: 1 },
      { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
    );

    // Initialize ClientEncryption
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
    });

    // Define encrypted fields - CRITICAL: Each field needs its own DEK in QE!
    const encryptedFieldsMap = {
      fields: [
        {
          path: "ssn",
          bsonType: "string",
          queries: { queryType: "equality" }, // Equality queries on SSN
        },
        {
          path: "salary",
          bsonType: "int",
          queries: { 
            queryType: "range",  // Range queries on salary!
            contention: 4,       // Balance security vs performance
            min: 0,
            max: 1000000,
          },
        },
        {
          path: "email",
          bsonType: "string",
          queries: { queryType: "equality" },
        },
      ],
    };

    // Drop existing collection if present
    try {
      await client.db(config.encryptedDb).collection(config.encryptedColl).drop();
      console.log("Dropped existing collection");
    } catch (e) {
      // Collection doesn't exist, that's fine
    }

    // Create encrypted collection - this creates DEKs automatically!
    const { collection, encryptedFields } = await encryption.createEncryptedCollection(
      client.db(config.encryptedDb),
      config.encryptedColl,
      {
        provider: "azure",
        createCollectionOptions: { encryptedFields: encryptedFieldsMap },
        masterKey: config.masterKey,
      }
    );

    console.log("✓ Created encrypted collection:", config.encryptedColl);
    console.log("✓ Created metadata collections: .esc, .ecoc, .ecc");
    console.log("\\nEncrypted fields configured:");
    encryptedFields.fields.forEach(f => {
      console.log(\`  - \${f.path}: \${f.queries?.queryType || 'encrypt only'}\`);
    });

  } finally {
    await client.close();
  }
}

setupQECollection().catch(console.error);`,
      },
    ],
    expectedOutput: `Connected to MongoDB
Dropped existing collection
✓ Created encrypted collection: employees
✓ Created metadata collections: .esc, .ecoc, .ecc

Encrypted fields configured:
  - ssn: equality
  - salary: range
  - email: equality`,
    tips: [
      'QE automatically creates a separate DEK for each encrypted field',
      'The contention factor (0-16) affects write throughput - higher prevents frequency analysis but slows writes',
      'Min/Max boundaries are critical for Range indexes to optimize token generation',
      'Sparsity (default 1) can be increased to reduce storage overhead at the cost of query precision',
    ],
  },
  {
    title: 'Insert Data and Execute Range Queries',
    estimatedTime: '10 min',
    description: 'Insert employee records with encrypted fields and demonstrate range queries on the encrypted salary field.',
    codeBlocks: [
      {
        filename: 'app-qe.js',
        language: 'javascript',
        code: `// app-qe.js - QE with Range Queries
const { MongoClient } = require("mongodb");
const config = require("./config");

async function main() {
  // Create auto-encrypting client
  const encryptedClient = new MongoClient(config.mongoUri, {
    autoEncryption: {
      keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
      kmsProviders: config.kmsProviders,
      extraOptions: {
        cryptSharedLibPath: config.cryptSharedPath,
      },
    },
  });

  try {
    await encryptedClient.connect();
    const collection = encryptedClient.db(config.encryptedDb).collection(config.encryptedColl);

    // Clear existing data
    await collection.deleteMany({});

    // Insert sample employees
    const employees = [
      { name: "Alice Johnson", ssn: "111-22-3333", salary: 75000, email: "alice@corp.com", department: "Engineering" },
      { name: "Bob Smith", ssn: "444-55-6666", salary: 85000, email: "bob@corp.com", department: "Engineering" },
      { name: "Carol White", ssn: "777-88-9999", salary: 120000, email: "carol@corp.com", department: "Management" },
      { name: "David Brown", ssn: "123-45-6789", salary: 95000, email: "david@corp.com", department: "Sales" },
      { name: "Eva Martinez", ssn: "987-65-4321", salary: 65000, email: "eva@corp.com", department: "HR" },
    ];

    await collection.insertMany(employees);
    console.log(\`Inserted \${employees.length} employees\\n\`);

    // DEMO 1: Equality query on encrypted SSN
    console.log("=== Query 1: Equality on SSN ===");
    const bySSN = await collection.findOne({ ssn: "123-45-6789" });
    console.log("Found:", bySSN?.name, "- SSN:", bySSN?.ssn);

    // DEMO 2: Range query on encrypted salary! (QE exclusive feature)
    console.log("\\n=== Query 2: Range on Salary ($gte $lte) ===");
    const salaryRange = await collection.find({
      salary: { $gte: 70000, $lte: 100000 }
    }).toArray();
    console.log(\`Employees with salary $70k-$100k (\${salaryRange.length}):\`);
    salaryRange.forEach(e => console.log(\`  - \${e.name}: $\${e.salary}\`));

    // DEMO 3: Greater than on encrypted field
    console.log("\\n=== Query 3: Salary > $90,000 ===");
    const highEarners = await collection.find({
      salary: { $gt: 90000 }
    }).toArray();
    console.log(\`High earners (\${highEarners.length}):\`);
    highEarners.forEach(e => console.log(\`  - \${e.name}: $\${e.salary}\`));

    // DEMO 4: Combined encrypted + plaintext query
    console.log("\\n=== Query 4: Engineering + Salary > $80k ===");
    const engHighEarners = await collection.find({
      department: "Engineering",  // Plaintext field
      salary: { $gt: 80000 }      // Encrypted field with range!
    }).toArray();
    engHighEarners.forEach(e => console.log(\`  - \${e.name}: $\${e.salary}\`));

  } finally {
    await encryptedClient.close();
  }
}

main().catch(console.error);`,
      },
    ],
    expectedOutput: `Inserted 5 employees

=== Query 1: Equality on SSN ===
Found: David Brown - SSN: 123-45-6789

=== Query 2: Range on Salary ($gte $lte) ===
Employees with salary $70k-$100k (3):
  - Alice Johnson: $75000
  - Bob Smith: $85000
  - David Brown: $95000

=== Query 3: Salary > $90,000 ===
High earners (2):
  - Carol White: $120000
  - David Brown: $95000

=== Query 4: Engineering + Salary > $80k ===
  - Bob Smith: $85000`,
  },
  {
    title: 'Explore .esc and .ecoc Collections',
    estimatedTime: '7 min',
    description: 'Dive into the internal metadata collections that power Queryable Encryption. Understanding these is crucial for operations and troubleshooting.',
    codeBlocks: [
      {
        filename: 'inspect-metadata.js',
        language: 'javascript',
        code: `// inspect-metadata.js - Explore QE Internal Collections
const { MongoClient } = require("mongodb");
const config = require("./config");

async function inspectMetadata() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    const db = client.db(config.encryptedDb);

    // List all collections in the database
    console.log("=== Collections in", config.encryptedDb, "===");
    const collections = await db.listCollections().toArray();
    collections.forEach(c => {
      const type = c.name.startsWith("enxcol_") ? "(QE metadata)" : "";
      console.log(\`  - \${c.name} \${type}\`);
    });

    // ESC = Encrypted State Collection
    // Stores encrypted search tokens for equality queries
    console.log("\\n=== ESC (Encrypted State Collection) ===");
    const escName = \`enxcol_.\${config.encryptedColl}.esc\`;
    const escColl = db.collection(escName);
    const escCount = await escColl.countDocuments();
    console.log(\`Document count: \${escCount}\`);
    const escSample = await escColl.findOne();
    if (escSample) {
      console.log("Sample document keys:", Object.keys(escSample));
      console.log("  _id type:", typeof escSample._id);
      console.log("  value type:", escSample.value?._bsontype || typeof escSample.value);
    }

    // ECOC = Encrypted Compaction Collection
    // Tracks metadata for compaction operations
    console.log("\\n=== ECOC (Encrypted Compaction Collection) ===");
    const ecocName = \`enxcol_.\${config.encryptedColl}.ecoc\`;
    const ecocColl = db.collection(ecocName);
    const ecocCount = await ecocColl.countDocuments();
    console.log(\`Document count: \${ecocCount}\`);

    // ECC = Encrypted Counter Collection  
    // Used for range queries
    console.log("\\n=== ECC (Encrypted Counter Collection) ===");
    const eccName = \`enxcol_.\${config.encryptedColl}.ecc\`;
    const eccColl = db.collection(eccName);
    const eccCount = await eccColl.countDocuments();
    console.log(\`Document count: \${eccCount}\`);
    console.log("(ECC is used for range query indexes)");

    // Storage analysis
    console.log("\\n=== Storage Overhead Analysis ===");
    const mainStats = await db.command({ collStats: config.encryptedColl });
    const escStats = await db.command({ collStats: escName });
    
    console.log(\`Main collection size: \${(mainStats.size / 1024).toFixed(2)} KB\`);
    console.log(\`ESC collection size: \${(escStats.size / 1024).toFixed(2)} KB\`);
    console.log(\`Overhead ratio: \${(escStats.size / mainStats.size).toFixed(2)}x\`);

  } finally {
    await client.close();
  }
}

inspectMetadata().catch(console.error);`,
      },
    ],
    expectedOutput: `=== Collections in hr ===
  - employees 
  - enxcol_.employees.esc (QE metadata)
  - enxcol_.employees.ecoc (QE metadata)
  - enxcol_.employees.ecc (QE metadata)

=== ESC (Encrypted State Collection) ===
Document count: 15
Sample document keys: [ '_id', 'value' ]
  _id type: object
  value type: Binary

=== ECOC (Encrypted Compaction Collection) ===
Document count: 5

=== ECC (Encrypted Counter Collection) ===
Document count: 10
(ECC is used for range query indexes)

=== Storage Overhead Analysis ===
Main collection size: 2.34 KB
ESC collection size: 5.67 KB
Overhead ratio: 2.42x`,
    tips: [
      'ESC grows with unique encrypted values - monitor its size',
      'ECOC is used during compaction operations',
      'ECC is specific to range queries - grows with range index usage',
      'Expect 2-3x storage overhead for encrypted fields with range indexes',
    ],
  },
  {
    title: 'Analyze Query Performance with Profiler',
    estimatedTime: '5 min',
    description: 'Use MongoDB profiler to understand how queries on encrypted fields are executed and their performance characteristics.',
    codeBlocks: [
      {
        filename: 'analyze-performance.js',
        language: 'javascript',
        code: `// analyze-performance.js - Profile QE Queries
const { MongoClient } = require("mongodb");
const config = require("./config");

async function analyzePerformance() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    const db = client.db(config.encryptedDb);

    // Enable profiling (level 2 = all operations)
    await db.command({ profile: 2, slowms: 0 });
    console.log("Profiling enabled\\n");

    // Create encrypted client for queries
    const encryptedClient = new MongoClient(config.mongoUri, {
      autoEncryption: {
        keyVaultNamespace: \`\${config.keyVaultDb}.\${config.keyVaultColl}\`,
        kmsProviders: config.kmsProviders,
        extraOptions: { cryptSharedLibPath: config.cryptSharedPath },
      },
    });
    await encryptedClient.connect();
    const collection = encryptedClient.db(config.encryptedDb).collection(config.encryptedColl);

    // Run test queries
    console.log("Running test queries...");
    
    const start1 = Date.now();
    await collection.findOne({ ssn: "123-45-6789" });
    console.log(\`  Equality query: \${Date.now() - start1}ms\`);

    const start2 = Date.now();
    await collection.find({ salary: { $gte: 50000, $lte: 100000 } }).toArray();
    console.log(\`  Range query: \${Date.now() - start2}ms\`);

    // Analyze profile results
    console.log("\\n=== Profile Analysis ===");
    const profiles = await db.collection("system.profile")
      .find({ ns: \`\${config.encryptedDb}.\${config.encryptedColl}\` })
      .sort({ ts: -1 })
      .limit(5)
      .toArray();

    profiles.forEach((p, i) => {
      console.log(\`\\nQuery \${i + 1}:\`);
      console.log(\`  Operation: \${p.op}\`);
      console.log(\`  Duration: \${p.millis}ms\`);
      console.log(\`  Docs examined: \${p.docsExamined}\`);
      console.log(\`  Keys examined: \${p.keysExamined}\`);
      if (p.planSummary) {
        console.log(\`  Plan: \${p.planSummary}\`);
      }
    });

    // Disable profiling
    await db.command({ profile: 0 });
    
    await encryptedClient.close();
  } finally {
    await client.close();
  }
}

analyzePerformance().catch(console.error);`,
      },
    ],
    tips: [
      'Range queries examine more index entries than equality queries',
      'First query is slower due to DEK retrieval from KMS',
      'Subsequent queries benefit from DEK caching',
      'Monitor docsExamined vs nReturned ratio for efficiency',
    ],
  },
  {
    title: 'Verify DEK-per-Field Requirement',
    estimatedTime: '5 min',
    description: 'Confirm that Queryable Encryption creates a separate DEK for each encrypted field, unlike CSFLE which can share DEKs.',
    codeBlocks: [
      {
        filename: 'verify-deks.js',
        language: 'javascript',
        code: `// verify-deks.js - Verify separate DEKs per field
const { MongoClient } = require("mongodb");
const config = require("./config");

async function verifyDEKs() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    // Query the key vault to see all DEKs
    const keyVault = client.db(config.keyVaultDb).collection(config.keyVaultColl);
    const deks = await keyVault.find().toArray();

    console.log("=== Data Encryption Keys in Key Vault ===\\n");
    console.log(\`Total DEKs: \${deks.length}\\n\`);

    deks.forEach((dek, i) => {
      console.log(\`DEK \${i + 1}:\`);
      console.log(\`  Key ID: \${dek._id.toString("hex").substring(0, 16)}...\`);
      console.log(\`  Alt Names: \${dek.keyAltNames?.join(", ") || "(none)"}\`);
      console.log(\`  Created: \${dek.creationDate}\`);
      console.log(\`  KMS Provider: \${Object.keys(dek.masterKey || {})[0] || "unknown"}\`);
      console.log();
    });

    // Important observation
    console.log("=== Key Observation ===");
    console.log("In Queryable Encryption, each encrypted field (ssn, salary, email)");
    console.log("has its own DEK. This is DIFFERENT from CSFLE where you CAN share DEKs.");
    console.log();
    console.log("Why separate DEKs in QE?");
    console.log("  1. Metadata binding - each field's encrypted indexes are tied to its DEK");
    console.log("  2. Security isolation - compromising one field doesn't affect others");
    console.log("  3. Granular key rotation - rotate keys per field as needed");

  } finally {
    await client.close();
  }
}

verifyDEKs().catch(console.error);`,
      },
    ],
    expectedOutput: `=== Data Encryption Keys in Key Vault ===

Total DEKs: 3

DEK 1:
  Key ID: 64a3b2c1d0e9f8...
  Alt Names: (none)
  Created: 2024-01-15T10:30:00.000Z
  KMS Provider: azure

DEK 2:
  Key ID: 75b4c3d2e1f0a9...
  Alt Names: (none)
  Created: 2024-01-15T10:30:00.000Z
  KMS Provider: azure

DEK 3:
  Key ID: 86c5d4e3f2b1a0...
  Alt Names: (none)
  Created: 2024-01-15T10:30:00.000Z
  KMS Provider: azure

=== Key Observation ===
In Queryable Encryption, each encrypted field (ssn, salary, email)
has its own DEK. This is DIFFERENT from CSFLE where you CAN share DEKs.`,
  },
];

export function Lab2QueryableEncryption() {
  return (
    <LabView
      labNumber={2}
      title="Queryable Encryption with Azure Key Vault"
      description="Implement Queryable Encryption with range query support using Azure Key Vault. Learn to configure encrypted collections, execute range queries on encrypted salary data, and explore the internal metadata collections."
      duration="45 min"
      prerequisites={[
        'MongoDB Atlas cluster M10+ on version 7.0+',
        'Azure subscription with Key Vault access',
        'Azure CLI installed and configured',
        'Node.js 18+ installed',
        'Completed Lab 1 (recommended)',
      ]}
      objectives={[
        'Configure Azure Key Vault for MongoDB encryption',
        'Create encrypted collections with range query support',
        'Execute equality and range queries on encrypted fields',
        'Explore .esc, .ecoc, and .ecc metadata collections',
        'Understand DEK-per-field requirement in QE',
      ]}
      steps={lab2Steps}
    />
  );
}
