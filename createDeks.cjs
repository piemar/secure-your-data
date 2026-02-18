// ══════════════════════════════════════════════════════════════
// Create DEKs for Queryable Encryption (QE)
// ══════════════════════════════════════════════════════════════
// QE requires a SEPARATE DEK for each encrypted field (unlike CSFLE).
// You need one DEK for 'salary' and one for 'taxId'.

const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0";
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

  // TASK: Create DEK for salary field (check if exists first)
  const salaryKeyAltName = "qe-salary-dek";
  const existingSalaryKey = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: salaryKeyAltName
  });

  if (existingSalaryKey) {
    console.log("✓ Salary DEK already exists:", existingSalaryKey._id.toString());
  } else {
    const salaryDekId = await encryption.createDataKey("aws", {
      masterKey: { key: "alias/mongodb-lab-key-lollo-olsson", region: "eu-central-1" },
      keyAltNames: [salaryKeyAltName]
    });
    console.log("Salary DEK created:", salaryDekId.toString());
  }

  // TASK: Create DEK for taxId field (same pattern)
  const taxKeyAltName = "qe-taxid-dek";
  const existingTaxKey = await keyVaultDB.collection("__keyVault").findOne({
    keyAltNames: taxKeyAltName
  });

  if (existingTaxKey) {
    console.log("✓ TaxId DEK already exists:", existingTaxKey._id.toString());
  } else {
    const taxDekId = await encryption.createDataKey("aws", {
      masterKey: { key: "alias/mongodb-lab-key-lollo-olsson", region: "eu-central-1" },
      keyAltNames: [taxKeyAltName]
    });
    console.log("TaxId DEK created:", taxDekId.toString());
  }

  await client.close();
}

run().catch(console.error);