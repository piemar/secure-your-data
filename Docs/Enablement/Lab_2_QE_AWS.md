# Lab 2: Queryable Encryption & Range Queries (45 Minutes)

## Learning Objectives
- Configure Queryable Encryption (QE) schema.
- Implement Range queries on encrypted numeric fields.
- Understand `min`, `max`, and `contention` parameters.
- Inspect internal `.esc` and `.ecoc` collections.
- Contrast QE capabilities with CSFLE.

---

## 1. Prerequisites (5 min)
- MongoDB 8.0+ Cluster.
- CMK from Lab 1.
- Latest MongoDB Driver (Node.js 6.0+ or Python 4.8+).

---

## 2. Implementation: Node.js (20 min)

### Script: `lab2-qe.js`
```javascript
const { MongoClient, ClientEncryption } = require('mongodb');

// Same config as Lab 1
const kmsProviders = { ... };
const keyVaultNamespace = "encryption.__keyVault";

async function main() {
  const client = new MongoClient(uri);
  const encryption = new ClientEncryption(client, { keyVaultNamespace, kmsProviders });

  // 1. Create DEK for QE
  const dekId = await encryption.createDataKey("aws", {
    masterKey: { key: "...", region: "..." }
  });

  // 2. Define QE Encrypted Fields (Modern approach)
  const encryptedFields = {
    fields: [
      {
        path: "salary",
        bsonType: "int",
        keyId: dekId,
        queries: { 
          queryType: "range", 
          min: 0, 
          max: 1000000, 
          contention: 4, 
          sparsity: 2 
        }
      }
    ]
  };

  // 3. Create Collection with QE Schema
  const db = client.db("hr");
  await db.createCollection("employees", { encryptedFields });

  // 4. Secure Client for CRUD
  const secureClient = new MongoClient(uri, {
    autoEncryption: { keyVaultNamespace, kmsProviders }
  });
  const coll = secureClient.db("hr").collection("employees");

  // 5. Insert Data
  await coll.insertMany([
    { name: "Alice", salary: 75000 },
    { name: "Bob", salary: 120000 },
    { name: "Charlie", salary: 45000 }
  ]);

  // 6. Range Query!
  const results = await coll.find({ salary: { $gt: 50000, $lt: 100000 } }).toArray();
  console.log("Salary between 50k and 100k:", results);
}
main();
```

---

## 3. Implementation: Python (20 min)

### Script: `lab2_qe.py`
```python
# Similar setup to Lab 1
# ... kms_providers and client initialization ...

# 1. Create DEK
dek_id = encryption.create_data_key("aws", master_key={ ... })

# 2. Define QE Schema
encrypted_fields = {
    "fields": [
        {
            "path": "salary",
            "bsonType": "int",
            "keyId": dek_id,
            "queries": {
                "queryType": "range",
                "min": 0,
                "max": 1000000,
                "contention": 4
            }
        }
    ]
}

# 3. Create QE Collection
db = client.hr
db.create_collection("employees", encrypted_fields=encrypted_fields)

# 4. Range Query
secure_coll = secure_client.hr.employees
results = secure_coll.find({"salary": {"$gt": 50000, "$lt": 100000}})
for doc in results:
    print(doc)
```

---

## 4. Internal Deep Dive (5 min)

### Viewing Metadata Collections
1.  Open **MongoDB Compass**.
2.  Navigate to the `hr` database.
3.  Note the collections named:
    - `enxcol_.employees.esc` (System Catalog)
    - `enxcol_.employees.ecoc` (Context Cache)
4.  **Experiment**: Perform more inserts. Watch the document count in `.ecoc` grow—this is the encrypted index metadata that enables searching without decryption.

### Key Observation
Unlike CSFLE, QE metadata is "bound" to specific fields. In the `.esc` collection, you can see how each field maps to its required unique DEK.
