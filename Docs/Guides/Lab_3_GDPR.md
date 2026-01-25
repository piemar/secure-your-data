# Lab 3: Right to Erasure & Crypto-Shredding (34 Minutes)

## Goal
Implement the "One Data Encryption Key (DEK) Per User" pattern and simulate cryptographic erasure to satisfy GDPR Article 17 requirements.

## Prerequisites
- Completed Labs 1 & 2
- AWS KMS setup

---

## Step 1: User Signup & DEK Provisioning (8 min)
1.  **Scenario**: A new user signs up. They need a unique DEK for their sensitive data.
2.  **Generate a new DEK** for the user:
    ```javascript
    const userDekId = await clientEncryption.createDataKey("aws", {
      masterKey: { /* AWS KMS details */ }
    });
    ```
3.  **Store the DEK ID** in the user's document in the `users` collection:
    ```javascript
    await db.collection("users").insertOne({
      username: "user123",
      dekId: userDekId,
      status: "active"
    });
    ```

---

## Step 2: Encrypting Personal Data (7 min)
1.  **Insert profile data** using the user's specific DEK:
    ```javascript
    await db.collection("profiles").insertOne({
      username: "user123",
      address: await clientEncryption.encrypt("123 Main St", {
        keyId: userDekId,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
      })
    });
    ```

---

## Step 3: The Erasure Request (7 min)
1.  **Simulate a GDPR Article 17 request**.
2.  **Action**: Delete the DEK associated with "user123" from the `encryption.__keyVault` collection.
    ```javascript
    await db.collection("__keyVault").deleteOne({ _id: userDekId });
    ```

---

## Step 4: Verification of Shredding (12 min)
1.  Attempt to read the user's profile:
    ```javascript
    const profile = await db.collection("profiles").findOne({ username: "user123" });
    try {
      const decrypted = await clientEncryption.decrypt(profile.address);
    } catch (e) {
      console.log("SUCCESS: Data is now indecipherable.");
    }
    ```
2.  **Check other users**: Verify that another user's data (with a different DEK) is still accessible.

**Scaling Warning**: For senior SAs. While "1 DEK per user" is the gold standard for privacy, consider KMS rate limits for operations like bulk rotation. Every user search requires fetching the user's DEK from the KMS if it's not cached locally.

---

## Summary
You have successfully implemented cryptographic erasure. Even if a backup of the `profiles` collection exists, the data for 'user123' is mathematically unrecoverable because the only copy of their key has been destroyed.
