const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = "mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0";
const keyAltName = "user-lollo-olsson-ssn-key";

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

    // Look up DEK by keyAltName (BEST PRACTICE - use altName instead of hardcoding UUID)
    // Then use the keyId in schemaMap (CSFLE requires keyId, not keyAltName)
    const keyVaultClient = new MongoClient(uri);
    await keyVaultClient.connect();
    const keyVaultDB = keyVaultClient.db("encryption");
    const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });

    if (!keyDoc) {
        throw new Error(`Key with altName "${keyAltName}" not found. Run createKey.cjs first to create the DEK.`);
    }

    const dekId = keyDoc._id; // This is already a Binary UUID
    console.log(`Found DEK by altName "${keyAltName}": ${dekId.toString('base64')}`);
    await keyVaultClient.close();

    // Schema Map for CSFLE
    // NOTE: CSFLE schemaMap uses keyId (array of Binary UUIDs), NOT keyAltName
    // Queryable Encryption uses keyAltName, but CSFLE uses keyId
    const schemaMap = {
        "medical.patients": {
            "bsonType": "object",
            "properties": {
                "ssn": {
                    "encrypt": {
                        "bsonType": "string",
                        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                        "keyId": [dekId] // CSFLE requires keyId (Binary UUID), not keyAltName
                    }
                }
            }
        }
    };

    // 1. STANDARD CONNECTION (No CSFLE)
    console.log("\n=== WITHOUT CSFLE ===");
    const clientStandard = new MongoClient(uri);
    await clientStandard.connect();
    const standardDb = clientStandard.db("medical");

    // Clean up any existing test data to avoid conflicts
    await standardDb.collection("patients").deleteMany({
        $or: [
            { name: "Alice Johnson" },
            { name: "Bob Smith" }
        ]
    });

    // Insert with standard client
    await standardDb.collection("patients").insertOne({
        name: "Alice Johnson",
        ssn: "123-45-6789",
        dob: "1990-01-15"
    });

    // Query with standard client - SSN will be PLAINTEXT in DB
    const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
    console.log("Data in Database (Unencrypted):", docStandard);
    console.log("SSN stored as:", docStandard.ssn); // Plain text!

    await clientStandard.close();

    // 2. CSFLE-ENABLED CONNECTION
    console.log("\n=== WITH CSFLE ===");
    const clientEncrypted = new MongoClient(uri, {
        autoEncryption: {
            keyVaultNamespace: "encryption.__keyVault",
            kmsProviders,
            schemaMap,
            bypassQueryAnalysis: false // Allow query analysis for deterministic encryption
        }
    });
    await clientEncrypted.connect();
    const encryptedDb = clientEncrypted.db("medical");

    // Insert with CSFLE client - SSN auto-encrypted
    await encryptedDb.collection("patients").insertOne({
        name: "Bob Smith",
        ssn: "987-65-4321",
        dob: "1985-06-20"
    });
    console.log("Inserted Bob Smith with CSFLE (SSN encrypted before sending to DB)");

    // Query with CSFLE client - SSN auto-decrypted
    // Use a more specific query to avoid MongoDB trying to decrypt Alice's plaintext document
    // Query by the encrypted SSN value (deterministic encryption allows equality queries)
    try {
        const docEncrypted = await encryptedDb.collection("patients").findOne({
            name: "Bob Smith"
        });

        if (docEncrypted) {
            console.log("Data retrieved (Auto-decrypted):", docEncrypted);
            console.log("SSN returned as:", docEncrypted.ssn); // Decrypted!
        } else {
            console.log("⚠️  Document not found");
        }
    } catch (error) {
        console.error("❌ Error during decryption:", error.message);
        console.log("\n💡 Troubleshooting:");
        console.log("1. Verify KMS key policy allows kms:Decrypt for your SSO role");
        console.log("2. Check if AWS SSO session is still valid: aws sso login");
        console.log("3. Verify DEK exists: Check encryption.__keyVault collection");
        console.log("4. The error might occur if MongoDB tries to decrypt Alice's plaintext document");
        console.log("   Try deleting Alice's document first or query only Bob's document");
        throw error;
    }

    await clientEncrypted.close();

    // 3. THE PROOF: Query encrypted data WITHOUT CSFLE
    console.log("\n=== PROOF: Query Bob's record WITHOUT CSFLE ===");
    const clientProof = new MongoClient(uri);
    await clientProof.connect();
    const proofDb = clientProof.db("medical");

    const docProof = await proofDb.collection("patients").findOne({ name: "Bob Smith" });
    console.log("Bob's data WITHOUT CSFLE client:", docProof);
    console.log("SSN field type:", docProof.ssn.constructor.name); // Binary!
    console.log("This is ciphertext - unreadable without the DEK!");

    await clientProof.close();
}

run().catch(console.error);