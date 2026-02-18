// ══════════════════════════════════════════════════════════════
// Create QE Collection with Encrypted Fields Configuration
// ══════════════════════════════════════════════════════════════
// This defines which fields to encrypt AND creates the collection.
// MongoDB automatically creates .esc and .ecoc metadata collections.

const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0";

async function run() {
  const client = await MongoClient.connect(uri);
  
  // TASK: Look up DEKs by their keyAltNames from the key vault
  const keyVaultDB = client.db("encryption");
  const salaryKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-salary-dek" 
  });
  const taxKeyDoc = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: "qe-taxid-dek" 
  });

  const salaryDekId = salaryKeyDoc._id;
  const taxDekId = taxKeyDoc._id;

  // TASK: Define the encryptedFields configuration
  const encryptedFields = {
    fields: [
      {
        path: "salary",        // Field name to encrypt
        bsonType: "int",
        keyId: salaryDekId,
        queries: { queryType: "equality" }  // Query type
      },
      {
        path: "taxId",
        bsonType: "string",
        keyId: taxDekId,
        queries: { queryType: "equality" }
      }
    ]
  };

  // TASK: Create the collection with encryptedFields option
  const db = client.db("hr");
  await db.createCollection("employees", { encryptedFields });
  
  console.log("Collection created with Queryable Encryption!");
  await client.close();
}

run().catch(console.error);