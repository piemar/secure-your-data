# MongoDB CSFLE & QE Security Deep-Dive Cheat Sheet

## 1. Decision Tree: CSFLE vs. QE
**Do you need Range queries ($gt, $lt)?**
- **YES** ➔ Use **Queryable Encryption** (MongoDB 7.0+)
  - *Key requirement*: Separate DEK per encrypted field.
  - *Sizing*: Account for 2-3x storage factor for Range indexes.
- **NO** ➔ **Do you need Equality queries ($eq)?**
  - **YES** ➔ Use **CSFLE Deterministic**
    - *Pros*: Mature, low overhead, shared DEKs possible.
  - **NO** ➔ Use **CSFLE Randomized**
    - *Pros*: Maximum security, no pattern leakage.

---

## 2. Query Operator Support Matrix
| Operation | CSFLE Det | CSFLE Rand | QE Eq | QE Range |
| :--- | :---: | :---: | :---: | :---: |
| **$eq, $ne** | ✅ | ❌ | ✅ | ✅ |
| **$gt, $lt** | ❌ | ❌ | ❌ | ✅ |
| **$in** | ✅ | ❌ | ✅ | ✅ |
| **Sorting** | ❌ | ❌ | ❌ | ❌ |
| **$group / $sum** | ❌ | ❌ | ❌ | ❌ |
| **$regex / $text** | ❌ | ❌ | ❌ | ❌ |

---

## 3. The "Right to Erasure" GDPR Pattern
**Workflow**: 1 User ➔ 1 Unique DEK ➔ All PII encrypted with that DEK.
**Action**: Delete user's DEK from `encryption.__keyVault`.
**Outcome**: Data becomes cryptographically indecipherable garbage in secondary indices, logs, and backups.

---

## 4. Key Architectural Tips
- **The "DBA Admin" Question**: "Should your DBAs be able to see customer SSNs?" (Answer is always No ➔ positions in-use encryption over TDE).
- **QE Parameters**: 
  - `min`/`max`: Define bounds to minimize token storage.
  - `sparsity`: Increase (1-4) to reduce storage at the cost of query precision.
  - `contention`: Higher (0-16) increases security vs frequency analysis but adds write overhead.
- **Maintenance**: schedule **monthly compaction** for `.ecoc` collections to reclaim space.
- **Key Rotation**: Use `rewrapManyDataKey()` for zero-downtime CMK rotation. Actual data is never re-encrypted.

---

## 5. Differentiating from Competition
- **vs Oracle/MSSQL TDE**: TDE decrypts in memory. DBAs see plaintext. MongoDB **NEVER** sees plaintext.
- **vs Azure Cosmos DB**: Cosmos is deterministic-only (pattern leakage) and lacks searchable range capabilities.
- **vs PostgreSQL**: MongoDB has native, driver-level enterprise KMS integration.
