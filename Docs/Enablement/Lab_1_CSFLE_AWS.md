# Lab 1: CSFLE Fundamentals with AWS KMS (45 Minutes)

## Learning Objectives
- Configure AWS KMS CMK for MongoDB encryption.
- Implement Automatic CSFLE with `schemaMap`.
- Understand the difference between Deterministic and Random algorithms.
- Verify data isolation (DBA vs App view).
- Troubleshoot common configuration pitfalls.

---

## 1. AWS KMS Infrastructure Setup (10 min)

### AWS Console / CLI
1.  **Create a CMK**:
    ```bash
    aws kms create-key --description "MongoDB CSFLE Lab" --region eu-north-1
    ```
2.  **Define IAM Permissions**: Create an IAM user with the following policy:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
          "Resource": "arn:aws:kms:eu-north-1:ACCOUNT_ID:key/KEY_ID"
        }
      ]
    }
    ```
3.  **Credentials**: Export `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

---

## 2. Implementation: Node.js (15 min)

### Setup
```bash
npm install mongodb mongodb-client-encryption
```

### Script: `lab1-csfle.js`
```javascript
const { MongoClient, ClientEncryption } = require('mongodb');

const uri = "mongodb+srv://...";
const keyVaultNamespace = "encryption.__keyVault";
const kmsProviders = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  // 1. Create Data Encryption Key (DEK)
  const dekId = await encryption.createDataKey("aws", {
    masterKey: {
      key: "arn:aws:kms:eu-north-1:ACCOUNT_ID:key/KEY_ID",
      region: "eu-north-1"
    },
    keyAltNames: ["lab1-key"]
  });

  // 2. Configure Automatic Encryption
  const schemaMap = {
    "medical.patients": {
      bsonType: "object",
      properties: {
        ssn: {
          encrypt: {
            keyId: [dekId],
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic", // Searchable
          }
        },
        diagnosis: {
          encrypt: {
            keyId: [dekId],
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random", // Not searchable
          }
        }
      }
    }
  };

  const secureClient = new MongoClient(uri, {
    autoEncryption: { keyVaultNamespace, kmsProviders, schemaMap }
  });

  await secureClient.connect();
  const coll = secureClient.db("medical").collection("patients");

  // 3. Insert & Query
  await coll.insertOne({ name: "John Doe", ssn: "123-45-6789", diagnosis: "Healthy" });
  const result = await coll.findOne({ ssn: "123-45-6789" });
  console.log("App View (Plaintext):", result);

  await secureClient.close();
  await client.close();
}
main();
```

---

## 3. Implementation: Python (15 min)

### Setup
```bash
pip install "pymongo[encryption]"
```

### Script: `lab1_csfle.py`
```python
import os
from pymongo import MongoClient
from pymongo.encryption import ClientEncryption, Algorithm
from bson.codec_options import CodecOptions

uri = "mongodb+srv://..."
key_vault_ns = "encryption.__keyVault"
kms_providers = {
    "aws": {
        "accessKeyId": os.environ["AWS_ACCESS_KEY_ID"],
        "secretAccessKey": os.environ["AWS_SECRET_ACCESS_KEY"],
    }
}

client = MongoClient(uri)
encryption = ClientEncryption(
    kms_providers,
    key_vault_ns,
    client,
    CodecOptions()
)

# 1. Create DEK
dek_id = encryption.create_data_key(
    "aws",
    master_key={
        "key": "arn:aws:kms:eu-north-1:ACCOUNT_ID:key/KEY_ID",
        "region": "eu-north-1"
    },
    key_alt_names=["lab1-key-python"]
)

# 2. Configure Auto Encryption
schema_map = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "keyId": [dek_id],
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }
        }
      }
    }
}

secure_client = MongoClient(uri, auto_encryption_opts={
    "key_vault_namespace": key_vault_ns,
    "kms_providers": kms_providers,
    "schema_map": schema_map
})

# 3. Insert & Query
coll = secure_client.medical.patients
coll.insert_one({"name": "Jane Smith", "ssn": "987-65-4321"})
print("App View:", coll.find_one({"ssn": "987-65-4321"}))
```

---

## 4. Verification & Troubleshooting (5 min)

### DBA Verification
- Connect via `mongosh` without the encryption options.
- Run `db.patients.find()`.
- **Expected**: `ssn` and `diagnosis` fields appear as `Binary` ciphertext.

### Troubleshooting
- **Missing crypt_shared**: Ensure `cryptSharedLibPath` is correctly set if not in standard path.
- **KMS Permissions**: Verify `kms:GenerateDataKey` is present.
- **Namespace Error**: Ensure the Key Vault namespace has a unique index on `keyAltNames`.
