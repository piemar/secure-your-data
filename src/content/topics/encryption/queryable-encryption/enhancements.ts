import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Queryable Encryption (Lab 2) Enhancement Metadata
 *
 * This file is the content-driven source for lab-queryable-encryption when rendered via LabRunner
 * (see Docs/LAB_IMPLEMENTATION_PATHS.md). Placeholders: ALIAS_NAME, YOUR_SUFFIX, AWS_REGION.
 * Source: Docs/pov-proof-exercises/proofs/54 (FLE-QUERYABLE-KMIP).
 */

export const enhancements: EnhancementMetadataRegistry = {
  'queryable-encryption.create-deks': {
    id: 'queryable-encryption.create-deks',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'proofs/54/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'createQEDeks.cjs',
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

  const keyVaultDB = client.db("encryption");
  const keyVaultColl = keyVaultDB.collection("__keyVault");

  const salaryKeyAltName = "qe-salary-dek";
  let existingSalary = await keyVaultColl.findOne({ keyAltNames: salaryKeyAltName });
  let salaryDekId;
  if (existingSalary) {
    salaryDekId = existingSalary._id;
    console.log("Salary Altname: qe-salary-dek, reusing existing DEK UUID:", salaryDekId.toString());
  } else {
    salaryDekId = await encryption.createDataKey("aws", {
      masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
      keyAltNames: [salaryKeyAltName]
    });
    console.log("Salary Altname: qe-salary-dek, Salary DEK UUID:", salaryDekId.toString());
  }

  const taxKeyAltName = "qe-taxid-dek";
  let existingTax = await keyVaultColl.findOne({ keyAltNames: taxKeyAltName });
  let taxDekId;
  if (existingTax) {
    taxDekId = existingTax._id;
    console.log("TaxId Altname: qe-taxid-dek, reusing existing DEK UUID:", taxDekId.toString());
  } else {
    taxDekId = await encryption.createDataKey("aws", {
      masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
      keyAltNames: [taxKeyAltName]
    });
    console.log("TaxId Altname: qe-taxid-dek, DEK UUID:", taxDekId.toString());
  }

  await client.close();
}
run().catch(console.error);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Create DEKs for Queryable Encryption (QE)
// ══════════════════════════════════════════════════════════════
// QE requires a SEPARATE DEK for each encrypted field (unlike CSFLE).

const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      ___________: credentials.accessKeyId,
      _______________: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ___________________(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyVaultDB = client.db("encryption");

  const salaryKeyAltName = "qe-salary-dek";
  const existingSalaryKey = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: salaryKeyAltName
  });

  if (existingSalaryKey) {
    console.log("✓ Salary DEK already exists:", existingSalaryKey._id.toString());
  } else {
    const salaryDekId = await encryption.____________("aws", {
      masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
      ___________: [salaryKeyAltName]
    });
    console.log("Salary DEK created:", salaryDekId.toString());
  }

  const taxKeyAltName = "___________";
  const existingTaxKey = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: taxKeyAltName
  });

  if (existingTaxKey) {
    console.log("✓ TaxId DEK already exists:", existingTaxKey._id.toString());
  } else {
    const taxDekId = await encryption.____________("aws", {
      masterKey: { key: "ALIAS_NAME", region: "AWS_REGION" },
      ___________: [taxKeyAltName]
    });
    console.log("TaxId DEK created:", taxDekId.toString());
  }

  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 17, blankText: '___________', hint: 'AWS credential property for the access key', answer: 'accessKeyId' },
          { line: 18, blankText: '_______________', hint: 'AWS credential property for the secret key', answer: 'secretAccessKey' },
          { line: 24, blankText: '___________________', hint: 'The class that handles encryption operations', answer: 'ClientEncryption' },
          { line: 32, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 39, blankText: '____________', hint: 'Method to generate a new Data Encryption Key', answer: 'createDataKey' },
          { line: 41, blankText: '___________', hint: 'Property for human-readable key identifiers', answer: 'keyAltNames' },
          { line: 46, blankText: '___________', hint: 'The keyAltName for the taxId field DEK', answer: 'qe-taxid-dek' },
          { line: 47, blankText: '______', hint: 'Same method to find a document for existence check', answer: 'findOne' },
          { line: 54, blankText: '____________', hint: 'Same method as above for creating DEKs', answer: 'createDataKey' },
          { line: 56, blankText: '___________', hint: 'Same keyAltNames property for the taxId DEK', answer: 'keyAltNames' }
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No DEK per field. Use pgcrypto or app-level keys; no queryable encryption.`,
            workaroundNote: 'No queryable encryption or per-field DEKs; implement encryption and query patterns in application.'
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No ClientEncryption or per-field DEKs. Use Azure Key Vault.`,
            workaroundNote: 'No queryable encryption; keys in Key Vault, encryption and queries are application-implemented.'
          }
        }
      },
    ],
    tips: [
      'Use Run all or Run selection to execute the Node script. Create two DEKs - one for salary and one for taxId.',
      'Use keyAltNames (qe-salary-dek, qe-taxid-dek) for maintainability.',
      'Use "Check My Progress" to verify the DEKs were created.'
    ]
  },

  'queryable-encryption.create-collection': {
    id: 'queryable-encryption.create-collection',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'proofs/54/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'createQECollection.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const keyVaultDB = client.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-salary-dek" });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: "qe-taxid-dek" });

  if (!salaryKeyDoc || !taxKeyDoc) {
    throw new Error("DEKs not found! Run createQEDeks.cjs first.");
  }

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;

  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  const db = client.db("hr");
  // Drop if exists so we can recreate with current DEKs (e.g. after re-running Step 1)
  try {
    await db.collection("employees").drop();
  } catch (e) {
    if (e.code !== 26) throw e;
  }
  await db.createCollection("employees", { encryptedFields });
  console.log("Collection 'employees' created with encryptedFields!");
  await client.close();
}
run().catch(console.error);`,
        skeleton: `// ══════════════════════════════════════════════════════════════
// Create QE Collection with Encrypted Fields Configuration
// ══════════════════════════════════════════════════════════════

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const keyVaultDB = client.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").______({
    keyAltNames: "qe-salary-dek"
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: "____________"
  });

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;

  const encryptedFields = {
    fields: [
      {
        path: "_______",
        bsonType: "int",
        keyId: salaryDekId,
        queries: { queryType: "________" }
      },
      {
        path: "taxId",
        bsonType: "string",
        keyId: taxDekId,
        queries: { queryType: "equality" }
      }
    ]
  };

  const db = client.db("hr");
  try {
    await db.collection("employees").drop();
  } catch (e) {
    if (e.code !== 26) throw e;
  }
  await db.________________("employees", { encryptedFields });
  console.log("Collection created with Queryable Encryption!");
  await client.close();
}
run().catch(console.error);`,
        inlineHints: [
          { line: 12, blankText: '______', hint: 'Method to find a single document by query', answer: 'findOne' },
          { line: 16, blankText: '____________', hint: 'The keyAltName for the taxId DEK', answer: 'qe-taxid-dek' },
          { line: 25, blankText: '_______', hint: 'The field name for salary data', answer: 'salary' },
          { line: 28, blankText: '________', hint: 'Query type for searching encrypted fields', answer: 'equality' },
          { line: 45, blankText: '________________', hint: 'Method to create a new collection', answer: 'createCollection' }
        ],
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: No encryptedFields or .esc/.ecoc. Create table with encrypted columns.`,
            workaroundNote: 'No queryable encryption; encrypted columns are opaque.'
          },
          'cosmosdb-vcore': {
            language: 'javascript',
            code: `// Cosmos DB: No encryptedFields. Create container; encrypt fields in application.`,
            workaroundNote: 'No native QE; encrypt in app, no server-side queries on encrypted fields.'
          }
        }
      },
    ],
    tips: [
      'Look up DEKs by keyAltNames instead of hardcoding UUIDs. Use Run all or Run selection to execute the script.',
      'MongoDB automatically creates .esc and .ecoc metadata collections.',
      'You can only create a collection with encryptedFields ONCE. Drop it first if it exists.'
    ]
  },

  'queryable-encryption.test-queries': {
    id: 'queryable-encryption.test-queries',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'proofs/54/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'insertQEData.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

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
    throw new Error("DEKs not found! Run createQEDeks.cjs first.");
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
      encryptedFieldsMap: { "hr.employees": encryptedFields }
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
      encryptedFieldsMap: { "hr.employees": encryptedFields }
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
          { line: 23, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 27, blankText: '____________', hint: 'The keyAltName for the taxId DEK', answer: 'qe-taxid-dek' },
          { line: 36, blankText: '___', hint: 'BSON type for integer values', answer: 'int' },
          { line: 37, blankText: '______', hint: 'Field name for tax identification', answer: 'taxId' },
          { line: 42, blankText: '_______________', hint: 'Config property to enable automatic encryption', answer: 'autoEncryption' },
          { line: 51, blankText: '___________', hint: 'Method to insert multiple documents', answer: 'insertMany' }
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
      'Insert at least 3-5 documents to test queries.'
    ]
  },

  'queryable-encryption.metadata': {
    id: 'queryable-encryption.metadata',
    povCapability: 'FLE-QUERYABLE-KMIP',
    sourceProof: 'proofs/54/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'queryQERange.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

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
  if (!salaryKeyDoc || !taxKeyDoc) throw new Error("DEKs not found! Run createQEDeks.cjs first.");
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
      encryptedFieldsMap: { "hr.employees": encryptedFields }
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
      encryptedFieldsMap: { "hr.employees": encryptedFields }
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
          { line: 22, blankText: '___________', hint: 'The MongoDB client class', answer: 'MongoClient' },
          { line: 23, blankText: '_______', hint: 'Method to establish a connection', answer: 'connect' },
          { line: 25, blankText: '______', hint: 'Method to find a single document', answer: 'findOne' },
          { line: 32, blankText: '______', hint: 'Same method to find a DEK document', answer: 'findOne' },
          { line: 36, blankText: '____________', hint: 'The keyAltName for taxId DEK', answer: 'qe-taxid-dek' },
          { line: 45, blankText: '___', hint: 'BSON type for integer', answer: 'int' },
          { line: 46, blankText: '______', hint: 'BSON type for text values', answer: 'string' },
          { line: 51, blankText: '_______________', hint: 'Config property to enable automatic encryption', answer: 'autoEncryption' },
          { line: 63, blankText: '______', hint: 'Method to find a document by encrypted field', answer: 'findOne' }
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
