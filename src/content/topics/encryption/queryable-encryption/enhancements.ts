import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Queryable Encryption (Lab 2) Enhancement Metadata
 *
 * This file is the content-driven source for lab-queryable-encryption when rendered via LabRunner
 * (see Docs/LAB_IMPLEMENTATION_PATHS.md). Placeholders: ALIAS_NAME, YOUR_SUFFIX, AWS_REGION.
 * See Docs/Guides/Lab_2_QE.md for reference.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'queryable-encryption.create-encrypted-collection': {
    id: 'queryable-encryption.create-encrypted-collection',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'Docs/Guides/Lab_2_QE.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'createQECollectionAuto.cjs',
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

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", queries: { queryType: "equality" } }
    ]
  };

  const db = client.db("hr");
  try {
    await db.collection("employees").drop();
  } catch (e) {
    if (e.code !== 26) throw e;
  }

  const { encryptedFields: createdEncryptedFields } = await encryption.createEncryptedCollection(db, "employees", {
    createCollectionOptions: { encryptedFields },
    provider: "aws",
    masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" }
  });

  const salaryKeyId = createdEncryptedFields.fields[0].keyId;
  const taxKeyId = createdEncryptedFields.fields[1].keyId;
  await encryption.addKeyAltName(salaryKeyId, "qe-salary-dek");
  await encryption.addKeyAltName(taxKeyId, "qe-taxid-dek");

  await client.close();
  console.log("Collection 'employees' created with automatic DEKs; keyAltNames added.");
}
run().catch(console.error);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Create QE collection with automatic DEK creation
// ══════════════════════════════════════════════════════════════
// No keyId in field definitions: the driver creates DEKs and the collection in one call.

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

  const encryptedFields = {
    fields: [
      { path: "___", bsonType: "int", queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", queries: { queryType: "___" } }
    ]
  };

  const db = client.db("hr");
  try {
    await db.collection("employees").drop();
  } catch (e) {
    if (e.code !== 26) throw e;
  }

  const { encryptedFields: createdEncryptedFields } = await encryption.__________________________(db, "employees", {
    _______________________: { encryptedFields },
    provider: "aws",
    masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" }
  });

  const salaryKeyId = createdEncryptedFields.fields[0].keyId;
  const taxKeyId = createdEncryptedFields.fields[1].keyId;
  await encryption._______________(salaryKeyId, "qe-salary-dek");
  await encryption._______________(taxKeyId, "qe-taxid-dek");

  await client.close();
  console.log("Collection created with automatic DEKs; keyAltNames added.");
}
run().catch(console.error);`,
        inlineHints: [
          { line: 31, blankText: '___', hint: 'Field name for salary data', answer: 'salary' },
          { line: 32, blankText: '___', hint: "Query type: use exactly 'equality' or 'range', not the field name", answer: 'equality' },
          { line: 43, blankText: '__________________________', hint: 'Method that creates DEKs and collection in one call', answer: 'createEncryptedCollection' },
          { line: 44, blankText: '_______________________', hint: 'Option key for encryptedFields', answer: 'createCollectionOptions' },
          { line: 51, blankText: '_______________', hint: 'Method to attach a keyAltName to a DEK', answer: 'addKeyAltName' },
          { line: 52, blankText: '_______________', hint: 'Same method for the second DEK', answer: 'addKeyAltName' }
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No createEncryptedCollection; create table and manage keys in application.`,
            workaroundNote: 'No queryable encryption; encrypt in app.'
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No native QE or automatic DEK creation.`,
            workaroundNote: 'No queryable encryption.'
          }
        }
      },
    ],
    tips: [
      'createEncryptedCollection creates DEKs for fields without keyId, then creates the collection.',
      "queries.queryType must be exactly 'equality' or 'range'—do not use the field name (e.g. salary) there.",
      'Adding keyAltNames after creation lets later steps look up DEKs by name (qe-salary-dek, qe-taxid-dek).',
      'Drop hr.employees first if it exists so the script can be re-run.'
    ]
  },

  'queryable-encryption.test-queries': {
    id: 'queryable-encryption.test-queries',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'Docs/Guides/Lab_2_QE.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'insertQEData.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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

  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-salary-dek" });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-taxid-dek" });

  if (!salaryKeyDoc || !taxKeyDoc) {
    throw new Error("DEKs not found! Run the create encrypted collection script (Step 1) first.");
  }

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields },
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  await client.connect();
  const collection = client.db("hr").collection("employees");
  await collection.insertMany([
    { name: "Alice Johnson", salary: 75000, taxId: "123-45-6789" },
    { name: "Bob Smith", salary: 95000, taxId: "987-65-4321" },
    { name: "Carol White", salary: 55000, taxId: "456-78-9012" }
  ]);
  console.log("Inserted documents with encrypted fields!");
  await client.close();
}
run().catch(console.error);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Insert Test Data with QE-Enabled Client
// ══════════════════════════════════════════════════════════════

const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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

  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: "qe-salary-dek"
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: "____________"
  });

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "___", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "______", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  const client = new MongoClient(uri, {
    _______________: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields },
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  await client.connect();
  const collection = client.db("hr").collection("employees");
  await collection.___________([
    { name: "Alice Johnson", salary: 75000, taxId: "123-45-6789" }
  ]);
  console.log("Inserted documents with encrypted fields!");
  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 24, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 28, blankText: '____________', hint: 'The keyAltName for the taxId DEK', answer: 'qe-taxid-dek' },
          { line: 37, blankText: '___', hint: 'BSON type for integer values', answer: 'int' },
          { line: 38, blankText: '______', hint: 'Field name for tax identification', answer: 'taxId' },
          { line: 43, blankText: '_______________', hint: 'Config property to enable automatic encryption', answer: 'autoEncryption' },
          { line: 53, blankText: '___________', hint: 'Method to insert multiple documents', answer: 'insertMany' }
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: Encrypt in application before INSERT. No autoEncryption.`,
            workaroundNote: 'No automatic encryption; application must encrypt each field before insert.'
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: Encrypt in application before insert. No encryptedFieldsMap.`,
            workaroundNote: 'Encrypt fields in application; no driver-level auto-encryption.'
          }
        }
      },
    ],
    tips: [
      'Use a QE-enabled client to insert; fields in encryptedFields are auto-encrypted. Use Run all or Run selection to execute.',
      'Insert at least 3-5 documents to test queries.',
      'If you see "Unable to connect to mongocryptd", set the path to mongo_crypt_shared in Lab Setup (Prerequisites) so the driver uses it instead of mongocryptd.'
    ]
  },

  'queryable-encryption.metadata': {
    id: 'queryable-encryption.metadata',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'Docs/Guides/Lab_2_QE.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'queryQERange.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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

  console.log("\\n=== WITHOUT Queryable Encryption ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardCollection = clientStandard.db("hr").collection("employees");
  const docStandard = await standardCollection.findOne({ name: "Alice Johnson" });
  console.log("Salary (encrypted):", docStandard.salary);
  console.log("⚠️ Cannot query encrypted fields without QE!");
  await clientStandard.close();

  console.log("\\n=== WITH Queryable Encryption ===");
  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-salary-dek" });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-taxid-dek" });
  if (!salaryKeyDoc || !taxKeyDoc) throw new Error("DEKs not found! Run the create encrypted collection script (Step 1) first.");
  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  const clientQE = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields },
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  await clientQE.connect();
  const qeCollection = clientQE.db("hr").collection("employees");
  const docQE = await qeCollection.findOne({ name: "Alice Johnson" });
  console.log("Salary (decrypted):", docQE.salary);
  console.log("✅ Fields are automatically decrypted!");

  const equalityResult = await qeCollection.findOne({ taxId: "123-45-6789" });
  console.log("Found by taxId:", equalityResult?.name);
  await clientQE.close();
}
run().catch(console.error);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Query Encrypted Data - QE vs Non-QE Client Comparison
// ══════════════════════════════════════════════════════════════

const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
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

  console.log("\\n=== WITHOUT Queryable Encryption ===");
  const clientStandard = new ___________(uri);
  await clientStandard._______();
  const standardCollection = clientStandard.db("hr").collection("employees");
  const docStandard = await standardCollection.______({ name: "Alice Johnson" });
  console.log("Salary (encrypted):", docStandard.salary);
  await clientStandard.close();

  console.log("\\n=== WITH Queryable Encryption ===");
  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: "qe-salary-dek"
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: "____________"
  });

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "___", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "______", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  const clientQE = new MongoClient(uri, {
    _______________: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields },
      ...(cryptSharedLibPath ? { extraOptions: { cryptSharedLibPath, mongocryptdBypassSpawn: true } } : {})
    }
  });

  await clientQE.connect();
  const qeCollection = clientQE.db("hr").collection("employees");
  const docQE = await qeCollection.findOne({ name: "Alice Johnson" });
  console.log("Salary (decrypted):", docQE.salary);

  const equalityResult = await qeCollection.______({ taxId: "123-45-6789" });
  console.log("Found by taxId:", equalityResult?.name);
  await clientQE.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 23, blankText: '___________', hint: 'The MongoDB client class', answer: 'MongoClient' },
          { line: 24, blankText: '_______', hint: 'Method to establish a connection', answer: 'connect' },
          { line: 26, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 33, blankText: '______', hint: 'Same method to find a DEK document', answer: 'findOne' },
          { line: 37, blankText: '____________', hint: 'The keyAltName for taxId DEK', answer: 'qe-taxid-dek' },
          { line: 46, blankText: '___', hint: 'BSON type for integer', answer: 'int' },
          { line: 47, blankText: '______', hint: 'BSON type for text values', answer: 'string' },
          { line: 52, blankText: '_______________', hint: 'Config property to enable automatic encryption', answer: 'autoEncryption' },
          { line: 65, blankText: '______', hint: 'Method to find a document by encrypted field', answer: 'findOne' }
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No QE. Standard client returns ciphertext; decrypt in app.`,
            workaroundNote: 'No queryable encryption; decrypt in application.'
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No QE. Standard client returns encrypted bytes; decrypt in app.`,
            workaroundNote: 'No queryable encryption; queries on encrypted fields not supported.'
          }
        }
      },
    ],
    tips: [
      'Use Run all or Run selection to run the script and see QE-enabled vs standard client behavior.',
      'QE allows querying encrypted data without decrypting first.'
    ]
  }
};
