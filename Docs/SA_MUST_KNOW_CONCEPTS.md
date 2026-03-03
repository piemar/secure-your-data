# SA Must-Know Concepts (CSFLE, QE, Right to Erasure)

Summary of key concepts Solutions Architects should know for each lab, aligned with the presentation and lab overviews.

---

## Lab 1: CSFLE Fundamentals

- **Envelope encryption:** CMK (in KMS) encrypts DEKs; DEKs (in Key Vault) encrypt data. CMK never leaves KMS.
- **Key Vault:** MongoDB collection (e.g. `encryption.__keyVault`) stores DEKs encrypted by the CMK; unique partial index on `keyAltNames` prevents duplicate key names.
- **Automatic encryption:** Schema defines encrypted fields; driver encrypts/decrypts transparently.
- **AWS KMS:** Create CMK and alias via CLI; use in `AutoEncryptionOpts`; verify encrypted data (BSON Subtype 6) in Atlas/Compass.
- **keyAltNames vs keyId:** Prefer `keyAltNames` over raw `keyId` for maintainability and rotation (referenced in key-management speaker notes).

---

## Lab 2: Queryable Encryption

- **DEK per field:** QE requires a **separate DEK for each encrypted field** (metadata binding); CSFLE can reuse one DEK for multiple fields.
- **Encrypted indexes:** Equality and range query types; range enables `$gt`, `$lt`, etc. on ciphertext.
- **Storage overhead:** ~2–3× for range-indexed fields (tokens in .esc / .ecoc).
- **Internal collections:** `enxcol_.<collectionName>.esc` (system catalog), `enxcol_.<collectionName>.ecoc` (context cache); need periodic compaction.

---

## Lab 3: Right to Erasure (Migration & Multi-Tenant)

- **Explicit encryption for migration:** Required when moving existing plaintext data into CSFLE: read plaintext → encrypt with `ClientEncryption` → write to new collection (Lab 3 Step 1).
- **Crypto-shredding (GDPR Art. 17):** One DEK per user (or per tenant); delete the DEK to make all that user’s/tenant’s ciphertext unrecoverable, including in backups.
- **Multi-tenant key isolation:** One DEK per tenant for isolation and per-tenant erasure; enables compliant “right to be forgotten” without touching every backup.
- **Key rotation:** `rewrapManyDataKey()` re-encrypts DEKs with a new CMK; no data re-encryption; Lab 3 uses this for rotation procedures.

---

## Cross-cutting

- **CSFLE vs QE:** CSFLE deterministic = equality only; QE = equality + range, randomized encryption, DEK-per-field.
- **Limitations:** No sorting, full-text search, or aggregations on encrypted fields; design schema and use client-side or separate analytics where needed.
