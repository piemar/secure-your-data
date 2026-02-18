// ══════════════════════════════════════════════════════════════
// Generate Data Encryption Key (DEK) using Node.js
// ══════════════════════════════════════════════════════════════
// The DEK is what actually encrypts your data. The CMK "wraps" the DEK.
//
// Create a file called "createKey.cjs" and run with: node createKey.cjs

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

    // TASK: Initialize ClientEncryption with the correct options
    const encryption = new ClientEncryption(client, {
        keyVaultNamespace,
        kmsProviders,
    });

    const keyAltName = "user-lollo-olsson-ssn-key";

    // Check if DEK already exists (idempotent operation)
    const keyVaultDB = client.db("encryption");
    const existingKey = await keyVaultDB.collection("__keyVault").findOne({
        keyAltNames: keyAltName
    });

    if (existingKey) {
        console.log("✓ DEK already exists with keyAltName:", keyAltName);
        console.log("  DEK UUID:", existingKey._id.toString());
        await client.close();
        return;
    }

    // TASK: Create the Data Encryption Key using the correct method
    const dekId = await encryption.createDataKey("aws", {
        masterKey: { key: "alias/mongodb-lab-key-lollo-olsson", region: "eu-central-1" },
        keyAltNames: [keyAltName]
    });

    console.log("✓ Created new DEK UUID:", dekId.toString());
    await client.close();
}

run().catch(console.dir);