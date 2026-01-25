# Lab 1: CSFLE Fundamentals & Troubleshooting (34 Minutes)

## Goal
Implement Client-Side Field Level Encryption (CSFLE) in a Node.js environment using AWS KMS and troubleshoot common "crypt_shared" pathing issues.

## Prerequisites
- MongoDB Atlas M10+ cluster
- AWS IAM User with `kms:Encrypt`, `kms:Decrypt`, and `kms:DescribeKey` permissions
- Node.js 18+ and `npm`
- `mongodb-crypt-shared` library downloaded

---

## Step 1: Initialize AWS KMS Integration (5 min)
1.  **Configure AWS credentials** in your environment:
    ```bash
    export AWS_ACCESS_KEY_ID="your_access_key"
    export AWS_SECRET_ACCESS_KEY="your_secret_key"
    ```
2.  **Define the KMS Provider map** in your code:
    ```javascript
    const kmsProviders = {
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    };
    ```

**Checkpoint**: Verify that your AWS IAM user has permissions to the CMK ARN you are using.

---

## Step 2: Create a Data Encryption Key (DEK) (7 min)
1.  Use the `ClientEncryption` helper to create a new DEK:
    ```javascript
    const clientEncryption = new ClientEncryption(baseClient, {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
    });

    const dekId = await clientEncryption.createDataKey("aws", {
      masterKey: {
        key: "arn:aws:kms:us-east-1:123456789012:key/your-key-uuid",
        region: "us-east-1",
      }
    });
    ```

**Checkpoint**: Check the `encryption.__keyVault` collection in Compass. You should see one document with BSON Subtype 4 `keyId`.

---

## Step 3: Configure Automatic Encryption (10 min)
1.  **Define the Schema Map**:
    ```javascript
    const schemaMap = {
      "hr.employees": {
        bsonType: "object",
        properties: {
          ssn: {
            encrypt: {
              keyId: [dekId],
              bsonType: "string",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            }
          }
        }
      }
    };
    ```
2.  **Initialize the Secured MongoClient**:
    ```javascript
    const secureClient = new MongoClient(connectionString, {
      autoEncryption: {
        keyVaultNamespace: "encryption.__keyVault",
        kmsProviders,
        schemaMap,
      }
    });
    ```

---

## Step 4: Troubleshooting crypt_shared (12 min)
1.  **Intentional Break**: Omit the `cryptSharedLibPath` in your configuration.
2.  **Observe the error**: Run the app. It should fail with an error about missing the shared library.
3.  **Fix**: Specify the absolute path to the library:
    ```javascript
    autoEncryption: {
      // ... previous options
      extraOptions: {
        cryptSharedLibPath: "/usr/local/lib/mongo_crypt_v1.so"
      }
    }
    ```

**Verification**:
- Insert a document with an `ssn` field.
- Query it back.
- Use `mongosh` or Compass to view the document. The `ssn` should appear as "Binary (Subtype 6)".

---

## Troubleshooting FAQ
- **"KMS Error: AccessDenied"**: Check AWS IAM permissions for `kms:Decrypt`.
- **"Namespace not found"**: Ensure the `keyVaultNamespace` matches exactly in both the creator and the client.
- **"Shared library failed to load"**: Ensure the path is absolute and the file is executable.
