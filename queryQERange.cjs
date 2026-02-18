// ══════════════════════════════════════════════════════════════
// Query Encrypted Data - QE vs Non-QE Client Comparison
// ══════════════════════════════════════════════════════════════
// This script demonstrates the power of Queryable Encryption

const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0";

async function run() {
  const credentials = await fromSSO()();

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
  console.log("\n=== WITHOUT Queryable Encryption ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardCollection = clientStandard.db("hr").collection("employees");

  // Query - encrypted fields show as Binary ciphertext
  const docStandard = await standardCollection.findOne({ name: "Alice Johnson" });
  console.log("Salary (encrypted):", docStandard.salary); // Binary(...)
  console.log("⚠️ Cannot query encrypted fields without QE!");
  await clientStandard.close();

  // ============================================
  // 2. QE-ENABLED CLIENT - Shows Decrypted Data
  // ============================================
  console.log("\n=== WITH Queryable Encryption ===");

  // Look up DEKs by keyAltNames
  const tempClient = await MongoClient.connect(uri);
  const keyVaultDB = tempClient.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-salary-dek" 
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-taxid-dek" 
  });

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;
  await tempClient.close();

  // Configure encryptedFields
  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  // Create QE-enabled client
  const clientQE = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields }
    }
  });

  await clientQE.connect();
  const qeCollection = clientQE.db("hr").collection("employees");

  // Query with QE - fields auto-decrypted!
  const docQE = await qeCollection.findOne({ name: "Alice Johnson" });
  console.log("Salary (decrypted):", docQE.salary); // 75000
  console.log("✅ Fields are automatically decrypted!");

  // Equality query on encrypted field - THIS IS THE BREAKTHROUGH!
  const equalityResult = await qeCollection.findOne({ taxId: "123-45-6789" });
  console.log("Found by taxId:", equalityResult?.name);

  await clientQE.close();
}

run().catch(console.error);