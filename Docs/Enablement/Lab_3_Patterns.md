# Lab 3: Migration & Multi-Tenant Patterns (30 Minutes)

## Learning Objectives
- Migrate existing plaintext data to an encrypted state.
- Implement per-tenant isolation using `keyAltNames`.
- Manage key rotation for a single tenant without impacting others.
- Understand metadata management for large-scale DEK deployments.

---

## 1. Data Migration Pattern (15 min)

**Scenario**: You have 10,000 plaintext records in `legacy.patients`. You need to move them to a secure collection.

### Node.js Migration Snippet
```javascript
async function migrate() {
  const legacy = client.db("legacy").collection("patients");
  const secure = secureClient.db("medical").collection("patients");

  const cursor = legacy.find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    // Driver automatically encrypts during insertion if schemaMap is present
    await secure.insertOne({
      _id: doc._id,
      ssn: doc.ssn, 
      diagnosis: doc.diagnosis,
      name: doc.name
    });
  }
}
```

### Python Migration Snippet
```python
def migrate():
    legacy = client.legacy.patients
    secure = secure_client.medical.patients
    
    for doc in legacy.find():
        secure.insert_one(doc) # Driver handles crypto transparently
```

---

## 2. Multi-Tenant Key Isolation (15 min)

**Scenario**: SaaS app where Tenant A and Tenant B must have separate DEKs.

### Node.js: Dynamic Schema with `keyAltName`
```javascript
async function getTenantClient(tenantId) {
  // Use keyAltNames for easy identification
  const tenantCid = `/tenant-${tenantId}`; 

  const schemaMap = {
    "saas.data": {
      bsonType: "object",
      encryptMetadata: { keyAltName: tenantCid },
      properties: {
        sensitiveData: { 
          encrypt: { 
            bsonType: "string", 
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic" 
          } 
        }
      }
    }
  };

  return new MongoClient(uri, {
    autoEncryption: { keyVaultNamespace, kmsProviders, schemaMap }
  });
}
```

### Python: Multi-Tenant Setup
```python
def get_tenant_client(tenant_id):
    tenant_alt_name = f"tenant-{tenant_id}"
    
    schema_map = {
        "saas.data": {
            "bsonType": "object",
            "encryptMetadata": {"keyAltName": tenant_alt_name},
            "properties": {
                "sensitiveData": {
                    "encrypt": {
                        "bsonType": "string",
                        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
                    }
                }
            }
        }
    }
    # Return client configured with this specific tenant's schema
```

---

## 3. Key Rotation (Discussion & Command)

### Re-wrapping individual keys
For senior SAs: When a tenant requests a key rotation, use `rewrapManyDataKey`.

```javascript
// Node.js
await encryption.rewrapManyDataKey(
  { keyAltNames: "tenant-123" },
  { 
    provider: "aws", 
    masterKey: { key: "new-cmk-arn", region: "eu-central-1" } 
  }
);
```

**Outcome**: This re-encrypts the DEK itself with a new CMK, satisfying annual compliance requirements without rewriting the actual data.

---

## 4. Scaling Considerations
- **KMS Rates**: AWS KMS has request limits. Use connection pooling to avoid redundant DEK retrievals.
- **KMS Regions**: Co-locate your KMS with your compute for lowest latency.
- **Key Count**: Manage key counts carefully. Excess keys in the `__keyVault` can slow down startup times if the unique index is missing.
