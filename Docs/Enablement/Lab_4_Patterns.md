# Lab 3: Migration & Multi-Tenant Patterns

**Duration:** 30 minutes  
**Difficulty:** Advanced  
**Prerequisites:** Completed Labs 1 & 2

---

## Overview

This lab covers real-world implementation patterns:
- Migrating existing plaintext data to encrypted
- Multi-tenant encryption with per-tenant DEKs
- Key rotation procedures

---

## Part 1: Data Migration (15 minutes)

### Scenario
You have existing plaintext patient data that needs encryption.

### Step 1.1: Setup Migration Script

**Node.js - migrate.js:**

```javascript
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");

const config = {
  mongoUri: "mongodb+srv://USER:PASSWORD@cluster.mongodb.net/",
  keyVaultNamespace: "encryption.__keyVault",
  awsAccessKeyId: "YOUR_ACCESS_KEY_ID",
  awsSecretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  awsKeyArn: "arn:aws:kms:eu-central-1:YOUR_ACCOUNT:key/YOUR_KEY_ID",
  awsKeyRegion: "eu-central-1",
  cryptSharedPath: "/path/to/mongo_crypt_v1.so"
};

async function migrateData() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    // Setup encryption client for explicit encryption
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: config.keyVaultNamespace,
      kmsProviders: {
        aws: {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey
        }
      }
    });
    
    // Get or create DEK
    const keyVaultDb = client.db("encryption");
    let dataKey = await keyVaultDb.collection("__keyVault").findOne({
      keyAltNames: "migrationKey"
    });
    
    if (!dataKey) {
      const keyId = await encryption.createDataKey("aws", {
        masterKey: { key: config.awsKeyArn, region: config.awsKeyRegion },
        keyAltNames: ["migrationKey"]
      });
      console.log("Created migration DEK:", keyId.toString("hex"));
      dataKey = { _id: keyId };
    }
    
    // Source: plaintext collection
    const sourceDb = client.db("legacy");
    const sourceColl = sourceDb.collection("patients_plaintext");
    
    // Target: encrypted collection
    const targetDb = client.db("secure");
    const targetColl = targetDb.collection("patients_encrypted");
    
    // Migration with progress tracking
    const cursor = sourceColl.find({});
    let migrated = 0;
    let errors = 0;
    
    console.log("Starting migration...");
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      
      try {
        // Encrypt sensitive fields
        const encryptedSSN = await encryption.encrypt(doc.ssn, {
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          keyId: dataKey._id
        });
        
        const encryptedMedical = await encryption.encrypt(doc.medicalRecords, {
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          keyId: dataKey._id
        });
        
        // Build encrypted document
        const encryptedDoc = {
          ...doc,
          ssn: encryptedSSN,
          medicalRecords: encryptedMedical,
          _migrated: new Date(),
          _sourceId: doc._id
        };
        delete encryptedDoc._id;
        
        // Insert into target
        await targetColl.insertOne(encryptedDoc);
        migrated++;
        
        if (migrated % 100 === 0) {
          console.log(`Migrated ${migrated} documents...`);
        }
      } catch (err) {
        console.error(`Error migrating doc ${doc._id}:`, err.message);
        errors++;
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Errors: ${errors}`);
    
  } finally {
    await client.close();
  }
}

migrateData().catch(console.error);
```

### Step 1.2: Validation Script

```javascript
// validate-migration.js
async function validateMigration() {
  // Create encrypted client for reading
  const encryptedClient = new MongoClient(config.mongoUri, {
    autoEncryption: {
      keyVaultNamespace: config.keyVaultNamespace,
      kmsProviders: {
        aws: {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey
        }
      },
      extraOptions: { cryptSharedLibPath: config.cryptSharedPath }
    }
  });
  
  await encryptedClient.connect();
  
  // Sample validation
  const sample = await encryptedClient
    .db("secure")
    .collection("patients_encrypted")
    .findOne({});
  
  console.log("Sample decrypted document:");
  console.log("  Name:", sample.firstName, sample.lastName);
  console.log("  SSN:", sample.ssn); // Should be decrypted
  console.log("  Records:", sample.medicalRecords?.length, "entries");
  
  await encryptedClient.close();
}
```

---

## Part 2: Multi-Tenant Encryption (15 minutes)

### Scenario
SaaS application with per-tenant encryption keys for data isolation.

### Step 2.1: Tenant Key Management

**Node.js - tenant-setup.js:**

```javascript
const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");

async function createTenantKey(tenantId) {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: config.keyVaultNamespace,
      kmsProviders: {
        aws: {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey
        }
      }
    });
    
    // Create tenant-specific DEK with keyAltName
    const keyAltName = `tenant_${tenantId}`;
    
    // Check if key already exists
    const existing = await client
      .db("encryption")
      .collection("__keyVault")
      .findOne({ keyAltNames: keyAltName });
    
    if (existing) {
      console.log(`Key for tenant ${tenantId} already exists`);
      return existing._id;
    }
    
    // Create new key
    const keyId = await encryption.createDataKey("aws", {
      masterKey: {
        key: config.awsKeyArn,
        region: config.awsKeyRegion
      },
      keyAltNames: [keyAltName]
    });
    
    console.log(`Created key for tenant ${tenantId}:`, keyId.toString("hex"));
    return keyId;
    
  } finally {
    await client.close();
  }
}

// Create keys for multiple tenants
async function setupTenants() {
  const tenants = ["acme-corp", "globex-inc", "initech"];
  
  for (const tenant of tenants) {
    await createTenantKey(tenant);
  }
}

setupTenants().catch(console.error);
```

### Step 2.2: Tenant-Aware Application

```javascript
// tenant-app.js
async function insertTenantData(tenantId, data) {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: config.keyVaultNamespace,
      kmsProviders: {
        aws: {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey
        }
      }
    });
    
    // Encrypt using tenant's key via keyAltName
    const keyAltName = `tenant_${tenantId}`;
    
    const encryptedData = {
      ...data,
      tenantId: tenantId,
      sensitiveField: await encryption.encrypt(data.sensitiveField, {
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        keyAltName: keyAltName  // Uses tenant's specific key
      })
    };
    
    await client
      .db("multitenant")
      .collection("data")
      .insertOne(encryptedData);
    
    console.log(`Inserted data for tenant ${tenantId}`);
    
  } finally {
    await client.close();
  }
}

// Example usage
async function demo() {
  await insertTenantData("acme-corp", {
    sensitiveField: "ACME secret data",
    publicField: "This is visible"
  });
  
  await insertTenantData("globex-inc", {
    sensitiveField: "Globex confidential",
    publicField: "Public info"
  });
}

demo().catch(console.error);
```

### Step 2.3: Tenant Data Isolation Verification

```javascript
// verify-isolation.js
async function verifyIsolation() {
  const client = new MongoClient(config.mongoUri);
  
  try {
    await client.connect();
    
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace: config.keyVaultNamespace,
      kmsProviders: {
        aws: {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey
        }
      }
    });
    
    // Get both tenant's encrypted data
    const docs = await client
      .db("multitenant")
      .collection("data")
      .find({})
      .toArray();
    
    for (const doc of docs) {
      console.log(`\nTenant: ${doc.tenantId}`);
      console.log(`  Public: ${doc.publicField}`);
      
      // Decrypt with correct tenant key
      try {
        const decrypted = await encryption.decrypt(doc.sensitiveField);
        console.log(`  Decrypted: ${decrypted}`);
      } catch (err) {
        console.log(`  Cannot decrypt: ${err.message}`);
      }
    }
    
  } finally {
    await client.close();
  }
}

verifyIsolation().catch(console.error);
```

---

## Key Rotation Checklist

### CMK Rotation (AWS KMS)
- AWS KMS supports automatic annual rotation
- **Low impact**: DEKs remain encrypted, just re-wrapped
- No application changes required

```bash
# Enable automatic rotation
aws kms enable-key-rotation --key-id YOUR_KEY_ID --region eu-central-1
```

### DEK Rotation (High Impact)
1. Create new DEK
2. Re-encrypt all documents using new DEK
3. Update schema map to use new key
4. Delete old DEK after verification

```javascript
// DEK rotation requires re-encryption of all data
// Plan for maintenance window
```

---

## Lab Summary

✅ **Migration** requires explicit encryption API for bulk operations  
✅ **Multi-tenant** uses `keyAltNames` for per-tenant key isolation  
✅ **CMK rotation** is transparent and handled by AWS KMS  
✅ **DEK rotation** requires data re-encryption (plan accordingly)

---

## Complete Package

You've completed all three labs! You now understand:
- CSFLE for deterministic/random encryption
- Queryable Encryption for range queries
- Migration and multi-tenant patterns

**Next steps:**
1. Pass the certification quiz (8/10)
2. Identify 2-3 customer opportunities
3. Schedule a practice demo with your team