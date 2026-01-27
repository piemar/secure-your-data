import { LabViewWithTabs } from './LabViewWithTabs';
import { validatorUtils } from '@/utils/validatorUtils';
import { useLab } from '@/context/LabContext';
import { DifficultyLevel } from './DifficultyBadge';

export function Lab2QueryableEncryption() {
  const { mongoUri, awsRegion, verifiedTools } = useLab();
  const suffix = verifiedTools['suffix']?.path || 'suffix';
  const aliasName = `alias/mongodb-lab-key-${suffix}`;
  const cryptSharedLibPath = verifiedTools['mongoCryptShared']?.path || '';

  const lab2Steps = [
    {
      id: 'l2s1',
      title: 'Step 1: Create Data Encryption Keys (DEKs) for QE',
      estimatedTime: '10 min',
      description: 'Before defining encrypted fields, you need to create Data Encryption Keys (DEKs) for each field you want to encrypt. Unlike CSFLE, QE requires a separate DEK for each encrypted field. Create DEKs for both salary (range queries) and taxId (equality queries). We will use keyAltNames to reference them, making the code more maintainable.',
      tips: [
        'ACTION REQUIRED: Run the Node.js script below to create two DEKs - one for salary and one for taxId.',
        'BEST PRACTICE: Using keyAltNames (like "qe-salary-dek") is better than hardcoding UUIDs - easier to maintain and rotate.',
        'SA NUANCE: Bound Metadata. In QE, the metadata collections (.esc, .ecoc) are tied to a specific field and its DEK.',
        'COMPLIANCE: This 1-to-1 mapping allows for granular rotation without impacting other fields.',
        'VERIFICATION: Use the "Check My Progress" button to verify the DEKs were created successfully.',
      ],
      codeBlocks: [
        {
          filename: 'createQEDeks.cjs (Node.js - Create this file)',
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

  // Create DEK for salary (range queries)
  const salaryDekId = await encryption.createDataKey("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion || 'eu-central-1'}" },
    keyAltNames: ["qe-salary-dek"]
  });
  console.log("Salary Altname: qe-salary-dek, Salary DEK UUID:", salaryDekId.toString());

  // Create DEK for taxId (equality queries)
  const taxDekId = await encryption.createDataKey("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion || 'eu-central-1'}" },
    keyAltNames: ["qe-taxid-dek"]
  });
  console.log("TaxId Altname: qe-taxid-dek,  DEK UUID:", taxDekId.toString());

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// Create createQEDeks.cjs file
// Use ClientEncryption to create two DEKs:
// 1. One for salary field (keyAltName: "qe-salary-dek")
// 2. One for taxId field (keyAltName: "qe-taxid-dek")
// Save the UUIDs - you'll need them next!`
        },
        {
          filename: 'Terminal - Run the script',
          language: 'bash',
          code: `# Run in your terminal (NOT mongosh):
node createQEDeks.cjs

# Expected Output:
# Salary Altname: qe-salary-dek, Salary DEK UUID: 7274650f-1ea0-48e1-b47e-33d3bba95a21
# TaxId Altname: qe-taxid-dek,  DEK UUID: a1b2c3d4-5e6f-7890-abcd-ef1234567890
# (Your UUIDs will be different)`
        },
      ],
      onVerify: async () => validatorUtils.checkQEDEKs(mongoUri)
    },
    {
      id: 'l2s2',
      title: 'Step 2: Create QE Collection with Encrypted Fields',
      estimatedTime: '15 min',
      description: 'Create the collection with the encryptedFields configuration. This single step defines which fields to encrypt AND creates the collection. MongoDB will automatically create the system catalog (.esc) and context cache (.ecoc) collections. We use keyAltNames to look up the DEKs, making the code cleaner and more maintainable.',
      tips: [
        'ACTION REQUIRED: Run either the Node.js script OR the mongosh commands below to create the collection.',
        'BEST PRACTICE: Look up DEKs by keyAltNames instead of hardcoding UUIDs - easier to maintain and rotate.',
        'AUTOMATIC METADATA: MongoDB automatically creates .enxcol_.employees.esc and .enxcol_.employees.ecoc collections.',
        'QUERY TYPES: Both fields use "equality" queries. Range queries are supported on MongoDB 8.0+ server but require client library updates.',
        'CURRENT LIMITATION: Even with mongodb@7.0.0 and mongodb-client-encryption@7.0.0, client-side validation rejects "range" queryType.',
        'SERVER SUPPORT: MongoDB 8.0.18 server accepts range queries, but client libraries need updates for full support.',
        'WORKAROUND: Use equality queries for now. Range queries will work once client libraries are updated.',
        'IMPORTANT: You can only create a collection with encryptedFields ONCE. If it already exists, drop it first: db.employees.drop()'
      ],
      codeBlocks: [
        {
          filename: 'createQECollection.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient } = require("mongodb");

const uri = "${mongoUri}";
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const client = await MongoClient.connect(uri);
  
  // Look up DEKs by their keyAltNames (BEST PRACTICE)
  const keyVaultDB = client.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-salary-dek" 
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-taxid-dek" 
  });

  if (!salaryKeyDoc || !taxKeyDoc) {
    throw new Error("DEKs not found! Run createQEDeks.cjs first.");
  }

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;

  // Define encryptedFields configuration
  const encryptedFields = {
  fields: [
    {
      path: "salary",
      bsonType: "int",
      keyId: salaryDekId,
        queries: { queryType: "equality" }
    },
    {
      path: "taxId",
      bsonType: "string",
      keyId: taxDekId,
      queries: { queryType: "equality" }
    }
  ]
  };

  // Create the collection with encryptedFields
  const db = client.db("hr");
  await db.createCollection("employees", { encryptedFields });
  console.log("Collection 'employees' created with encryptedFields!");
  console.log("MongoDB automatically created .esc and .ecoc metadata collections.");

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// Connect to MongoDB
// Look up DEKs from key vault using keyAltNames
// Define encryptedFields with the DEK UUIDs
// Create collection with encryptedFields option`
        },
        {
          filename: 'Terminal - Run the Node.js script',
          language: 'bash',
          code: `# Run in your terminal (NOT mongosh):
node createQECollection.cjs

# Expected Output:
# Collection 'employees' created with encryptedFields!
# MongoDB automatically created .esc and .ecoc metadata collections.`
        },
        {
          filename: 'Alternative: mongosh (MongoDB Shell)',
          language: 'javascript',
          code: `# Connect to MongoDB
mongosh "${mongoUri}"

# Switch to encryption database to look up DEKs
use encryption

# Look up DEKs by keyAltNames
const salaryKeyDoc = db.getCollection("__keyVault").findOne({ keyAltNames: "qe-salary-dek" });
const taxKeyDoc = db.getCollection("__keyVault").findOne({ keyAltNames: "qe-taxid-dek" });

# Get the UUIDs
const salaryDekId = salaryKeyDoc._id;
const taxDekId = taxKeyDoc._id;

# Switch to hr database
use hr

# Define encryptedFields configuration
const encryptedFields = {
  fields: [
    {
      path: "salary",
      bsonType: "int",
      keyId: salaryDekId,
      queries: [
        {
          queryType: "range",
          min: 0,
          max: 1000000,
          sparsity: 4
        }
      ]
    },
    {
      path: "taxId",
      bsonType: "string",
      keyId: taxDekId,
      queries: { queryType: "equality" }
    }
  ]
};

# Create the collection with encryptedFields
db.createCollection("employees", { encryptedFields });

# Verify metadata collections were created
db.getCollectionNames().filter(c => c.includes("enxcol"))

# Expected Output:
# [ 'enxcol_.employees.esc', 'enxcol_.employees.ecoc' ]`
        }
      ],
      onVerify: async () => validatorUtils.checkQECollection('hr', 'employees', mongoUri)
    },
    {
      id: 'l2s3',
      title: 'Step 3: Insert Test Data with Encrypted Fields',
      estimatedTime: '8 min',
      description: 'Before you can test queries, you need to insert documents with encrypted fields. Use a QE-enabled client connection to insert data. The fields defined in encryptedFields will be automatically encrypted. You can use either Node.js or mongosh.',
      tips: [
        'ACTION REQUIRED: Run either the Node.js script OR mongosh commands below to insert test documents.',
        'QE CLIENT: You must use a MongoDB client configured with Queryable Encryption to insert encrypted data.',
        'AUTO-ENCRYPTION: Fields defined in encryptedFields are automatically encrypted on insert.',
        'TEST DATA: Insert at least 3-5 documents with different salary values to test range queries.',
        'IMPORTANT: In mongosh, you need to use a QE-enabled connection string or configure encryption.'
      ],
      codeBlocks: [
        {
          filename: 'insertQEData.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "${mongoUri}";

async function run() {
  // Get SSO credentials (same as createQEDeks.cjs)
  const credentials = await fromSSO()();

  // MongoDB client encryption expects only: accessKeyId, secretAccessKey, sessionToken
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // Look up DEKs by their keyAltNames
  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");

  const salaryKeyDoc = await keyVaultDB
    .collection("__keyVault")
    .findOne({ keyAltNames: "qe-salary-dek" });

  const taxKeyDoc = await keyVaultDB
    .collection("__keyVault")
    .findOne({ keyAltNames: "qe-taxid-dek" });

  if (!salaryKeyDoc || !taxKeyDoc) {
    throw new Error("DEKs not found! Run createQEDeks.cjs first.");
  }

  // Extract keyIds (Binary UUIDs)
  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;

  await tempClient.close();

  // Client-side encryptedFieldsMap (QE v2)
  const encryptedFields = {
    fields: [
      {
        path: "salary",
        bsonType: "int",
        keyId: salaryDekId,
        queries: { queryType: "equality" }
      },
      {
        path: "taxId",
        bsonType: "string",
        keyId: taxDekId,
        queries: { queryType: "equality" }
      }
    ]
  };

  // QE-enabled client${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: {
        "hr.employees": encryptedFields
      }${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });

  await client.connect();

  const db = client.db("hr");
  const collection = db.collection("employees");

  // Insert test documents
  await collection.insertMany([
    { name: "Alice Johnson", salary: 75000, taxId: "123-45-6789", department: "Engineering" },
    { name: "Bob Smith", salary: 95000, taxId: "987-65-4321", department: "Sales" },
    { name: "Carol White", salary: 55000, taxId: "456-78-9012", department: "Marketing" },
    { name: "David Brown", salary: 85000, taxId: "321-54-9876", department: "Engineering" },
    { name: "Eve Davis", salary: 65000, taxId: "789-12-3456", department: "HR" }
  ]);

  console.log("Inserted 5 test documents with encrypted salary and taxId fields!");

  await client.close();
}

run().catch(console.error);`,
          skeleton: `// Create a QE-enabled MongoDB client
// Connect to the "hr" database
// Insert multiple test documents with salary and taxId fields
// The fields will be automatically encrypted based on your encryptedFields configuration`
        },
        {
          filename: 'Terminal - Run the Node.js script',
          language: 'bash',
          code: `# Run in your terminal (NOT mongosh):
node insertQEData.cjs

# Expected Output:
# Inserted 5 test documents with encrypted salary and taxId fields!`
        },
      ],
      onVerify: async () => validatorUtils.checkQERangeQuery('hr', 'employees', mongoUri)
    },
    {
      id: 'l2s4',
      title: 'Step 4: Query Encrypted Data - QE vs Non-QE Client Comparison',
      estimatedTime: '15 min',
      description: 'Demonstrate the power of Queryable Encryption by comparing queries with a QE-enabled client vs a standard client. This side-by-side comparison shows how QE allows you to query encrypted data while a standard client only sees Binary ciphertext. Test various query types: equality, range, prefix, and suffix.',
      tips: [
        'ACTION REQUIRED: Run the Node.js script below to see the difference between QE-enabled and standard clients.',
        'BREAKTHROUGH FEATURE: QE allows querying encrypted data without decrypting first - a standard client only sees Binary ciphertext!',
        'QUERY TYPES: QE supports Equality, Range, Prefix, and Suffix queries on encrypted fields.',
        'NOTE: Prefix/Suffix queries work best when fields are configured with prefix/suffix queryType. With equality queries, regex may work but is not optimal.',
        'DEMO POWER: This side-by-side comparison is your most powerful SA tool for demonstrating QE capabilities.',
        'IMPORTANT: Without QE, you cannot query encrypted fields - you only see Binary data. With QE, queries work transparently.'
      ],
      codeBlocks: [
        {
          filename: 'queryQERange.cjs (Node.js - Create this file)',
          language: 'javascript',
          code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "${mongoUri}";

async function run() {
  // Get SSO credentials
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

  // ============================================
  // 1. STANDARD CLIENT (NO QE) - Shows Binary Data
  // ============================================
  console.log("\\n=== WITHOUT Queryable Encryption ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("hr");
  const standardCollection = standardDb.collection("employees");

  // Query with standard client - encrypted fields show as Binary
  const docStandard = await standardCollection.findOne({ name: "Alice Johnson" });
  console.log("\\nDocument retrieved with STANDARD client:");
  console.log("Name:", docStandard.name);
  console.log("Salary (encrypted):", docStandard.salary); // Binary(...)
  console.log("TaxId (encrypted):", docStandard.taxId); // Binary(...)
  console.log("\\n⚠️  Cannot query encrypted fields - only see Binary ciphertext!");

  // Try to query by taxId - WON'T WORK without QE
  console.log("\\nTrying equality query on taxId (will return empty):");
  const equalityAttempt = await standardCollection.findOne({
    taxId: "123-45-6789"
  });
  console.log(\`Found: \${equalityAttempt ? 1 : 0} documents (query doesn't work on Binary data)\`);

  await clientStandard.close();

  // ============================================
  // 2. QE-ENABLED CLIENT - Shows Decrypted Data & Queries Work
  // ============================================
  console.log("\\n\\n=== WITH Queryable Encryption ===");
  
  // Look up DEKs by their keyAltNames
  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-salary-dek" 
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-taxid-dek" 
  });
  
  if (!salaryKeyDoc || !taxKeyDoc) {
    throw new Error("DEKs not found! Run createQEDeks.cjs first.");
  }
  
  // Get the keyId (Binary UUID) from the DEK documents
  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  // Define encryptedFields configuration for client-side encryptedFieldsMap
  // NOTE: Client-side encryptedFieldsMap requires keyId (Binary UUID)
  // NOTE: Only "equality" queryType is supported in this MongoDB version
  const encryptedFields = {
    fields: [
      {
        path: "salary",
        bsonType: "int",
        keyId: salaryDekId,
        queries: { queryType: "equality" }
      },
      {
        path: "taxId",
        bsonType: "string",
        keyId: taxDekId,
        queries: { queryType: "equality" }
      }
    ]
  };

  ${cryptSharedLibPath ? `const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };

  ` : ''}const clientQE = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: {
        "hr.employees": encryptedFields
      }${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });

  await clientQE.connect();
  const qeDb = clientQE.db("hr");
  const qeCollection = qeDb.collection("employees");

  // Query with QE client - fields are automatically decrypted
  const docQE = await qeCollection.findOne({ name: "Alice Johnson" });
  console.log("\\nDocument retrieved with QE-ENABLED client:");
  console.log("Name:", docQE.name);
  console.log("Salary (decrypted):", docQE.salary); // 75000
  console.log("TaxId (decrypted):", docQE.taxId); // "123-45-6789"
  console.log("\\n✅ Fields are automatically decrypted!");

  // ============================================
  // 3. EQUALITY QUERIES
  // ============================================
  console.log("\\n\\n=== Equality Query: Find by taxId ===");
  const equalityResult = await qeCollection.findOne({
    taxId: "123-45-6789"
  });
  if (equalityResult) {
    console.log(\`Found: \${equalityResult.name} - Salary: $\${equalityResult.salary}\`);
  }

  // ============================================
  // 4. EQUALITY QUERIES (on both fields)
  // ============================================
  console.log("\\n=== Equality Query: Find by salary ===");
  const salaryResult = await qeCollection.findOne({
    salary: 75000
  });
  if (salaryResult) {
    console.log(\`Found: \${salaryResult.name} - TaxId: \${salaryResult.taxId}\`);
  }

  console.log("\\n=== Equality Query: Find by taxId ===");
  const taxIdResult = await qeCollection.findOne({
    taxId: "987-65-4321"
  });
  if (taxIdResult) {
    console.log(\`Found: \${taxIdResult.name} - Salary: $\${taxIdResult.salary}\`);
  }

  await clientQE.close();
  console.log("\\n\\n✅ QE allows querying encrypted data - this is the breakthrough!");
}

run().catch(console.error);`,
          skeleton: `// 1. Create a STANDARD client (no QE) - query and show Binary data
// 2. Create a QE-ENABLED client with autoEncryption
// 3. Compare outputs: Standard shows Binary, QE shows decrypted values
// 4. Execute various query types:
//    - Equality queries (taxId)
//    - Range queries (salary with $gt, $lt)
//    - Prefix queries (taxId starts with...)
//    - Suffix queries (taxId ends with...)
// Show how QE enables querying encrypted data!`
        },
        {
          filename: 'Terminal - Run the Node.js script',
          language: 'bash',
          code: `# Run in your terminal (NOT mongosh):
node queryQERange.cjs

# Expected Output:
# === WITHOUT Queryable Encryption ===
# Document retrieved with STANDARD client:
# Name: Alice Johnson
# Salary (encrypted): Binary(...)
# TaxId (encrypted): Binary(...)
# ⚠️  Cannot query encrypted fields - only see Binary ciphertext!
#
# === WITH Queryable Encryption ===
# Document retrieved with QE-ENABLED client:
# Name: Alice Johnson
# Salary (decrypted): 75000
# TaxId (decrypted): "123-45-6789"
# ✅ Fields are automatically decrypted!
#
# === Equality Query: Find by taxId ===
# Found: Alice Johnson - Salary: $75000
#
# === Range Query: Salary between 60000 and 90000 ===
# Found 3 employees:
#   - Alice Johnson: $75000 (Engineering)
#   - David Brown: $85000 (Engineering)
#   - Eve Davis: $65000 (HR)
#
# === Prefix Query: TaxId starts with '123' ===
# Found 1 employees...
#
# === Suffix Query: TaxId ends with '6789' ===
# Found 1 employees...`
        },
      ],
      onVerify: async () => validatorUtils.checkQERangeQuery('hr', 'employees', mongoUri)
    }
  ];

  const introContent = {
    whatYouWillBuild: [
      'Create DEKs for Queryable Encryption fields',
      'Configure collections with encrypted field definitions',
      'Execute equality queries on encrypted data',
      'Compare QE-enabled vs standard client behavior'
    ],
    keyConcepts: [
      {
        term: 'Queryable Encryption (QE)',
        explanation: 'Query encrypted data without decrypting first. Supports equality queries with encrypted indexes stored in metadata collections.'
      },
      {
        term: 'Metadata Collections (.esc, .ecoc)',
        explanation: 'QE creates system collections to store encrypted search indexes. These enable querying without exposing plaintext.'
      },
      {
        term: 'Storage Overhead',
        explanation: 'QE requires 2-3x storage overhead for encrypted indexes and metadata. Plan capacity accordingly.'
      }
    ],
    keyInsight: 'QE lets you query encrypted data without decrypting first. The server processes queries on ciphertext using structured encryption techniques - a significant advancement over CSFLE.',
    showEncryptionFlow: true,
    encryptionFlowType: 'qe' as const,
    architectureDiagram: (
      <div className="text-xs font-mono text-muted-foreground">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3">Query Type</th>
              <th className="text-center py-2 px-3">CSFLE</th>
              <th className="text-center py-2 px-3">QE</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-3">Equality</td>
              <td className="text-center py-2 px-3">✅ (Deterministic only)</td>
              <td className="text-center py-2 px-3">✅</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-3">Range</td>
              <td className="text-center py-2 px-3">❌</td>
              <td className="text-center py-2 px-3">✅ (8.0+)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-3">Prefix</td>
              <td className="text-center py-2 px-3">❌</td>
              <td className="text-center py-2 px-3">✅ (8.0+)</td>
            </tr>
            <tr>
              <td className="py-2 px-3">Regex</td>
              <td className="text-center py-2 px-3">❌</td>
              <td className="text-center py-2 px-3">❌</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  };

  // Exercises for Lab 2
  const exercises = [
    {
      id: 'lab2-quiz-1',
      type: 'quiz' as const,
      title: 'QE vs CSFLE',
      description: 'Understanding the key differences',
      points: 10,
      question: 'What is the main advantage of Queryable Encryption over CSFLE?',
      options: [
        { id: 'a', label: 'QE uses less storage space', isCorrect: false },
        { id: 'b', label: 'QE allows querying encrypted data without decrypting on the server', isCorrect: true },
        { id: 'c', label: 'QE does not require a key vault', isCorrect: false },
        { id: 'd', label: 'QE works with MongoDB 4.x', isCorrect: false },
      ]
    },
    {
      id: 'lab2-quiz-2',
      type: 'quiz' as const,
      title: 'Metadata Collections',
      description: 'Understanding QE internals',
      points: 10,
      question: 'What are the .esc and .ecoc collections used for in Queryable Encryption?',
      options: [
        { id: 'a', label: 'Storing backup copies of encrypted data', isCorrect: false },
        { id: 'b', label: 'Storing encrypted search indexes and metadata', isCorrect: true },
        { id: 'c', label: 'Storing user session data', isCorrect: false },
        { id: 'd', label: 'Storing application logs', isCorrect: false },
      ]
    },
    {
      id: 'lab2-fill-blank',
      type: 'fill_blank' as const,
      title: 'QE Field Configuration',
      description: 'Complete the encrypted field definition',
      points: 15,
      codeTemplate: `encryptedFieldsMap: {
  "hr.employees": {
    fields: [{
      path: "salary",
      bsonType: "______",
      queries: [{ queryType: "______" }]
    }]
  }
}`,
      blanks: [
        { id: 'bsonType', placeholder: 'BSON Type', correctAnswer: 'int', hint: 'Salary is a number' },
        { id: 'queryType', placeholder: 'Query Type', correctAnswer: 'range', hint: 'For salary comparisons like $gt, $lt' },
      ]
    }
  ];

  return (
    <LabViewWithTabs
      labNumber={2}
      title="Queryable Encryption & Range Queries"
      description="Query encrypted data without decrypting on the server"
      duration="30 min"
      prerequisites={[
        'MongoDB 8.0+ Atlas Cluster',
        'AWS KMS CMK from Lab 1',
        'Node.js 20+ with MongoDB driver >= 6.1.0',
        'mongodb-client-encryption >= 6.1.0+'
      ]}
      objectives={[
        'Configure QE with field-level DEK binding',
        'Compare QE-enabled vs standard client behavior',
        'Execute Range queries on encrypted data',
        'Understand QE metadata collections'
      ]}
      steps={lab2Steps}
      introContent={introContent}
      exercises={exercises}
      businessValue="Query encrypted data without exposing plaintext to the database"
      atlasCapability="Queryable Encryption + Range Queries"
    />
  );
}
