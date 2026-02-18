// ══════════════════════════════════════════════════════════════
// Insert Test Data with QE-Enabled Client
// ══════════════════════════════════════════════════════════════
// Fields defined in encryptedFields are automatically encrypted.

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

  // TASK: Look up DEKs by their keyAltNames
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

  // TASK: Configure the encryptedFieldsMap
  const encryptedFields = {
    fields: [
      { path: "salary", bsonType: "int", keyId: salaryDekId, queries: { queryType: "equality" } },
      { path: "taxId", bsonType: "string", keyId: taxDekId, queries: { queryType: "equality" } }
    ]
  };

  // TASK: Create QE-enabled client with autoEncryption
  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      encryptedFieldsMap: { "hr.employees": encryptedFields }
    }
  });

  await client.connect();
  const collection = client.db("hr").collection("employees");
  
  // Insert test documents
  await collection.insertMany([
    { name: "Alice Johnson", salary: 75000, taxId: "123-45-6789" }
  ]);

  console.log("Inserted documents with encrypted fields!");
  await client.close();
}

run().catch(console.error);