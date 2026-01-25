# SA Quick Reference: MongoDB CSFLE & Queryable Encryption

## 1. Decision Matrix: Which one to use?
| Requirement | Recommend | Why? |
| :--- | :--- | :--- |
| **Range Queries ($gt, $lt)** | **Queryable Encryption** | Only QE supports range on ciphertext. |
| **MongoDB Version < 8.0** | **CSFLE** | QE Range requires 8.0+ GA. |
| **Maximum Security** | **Queryable Encryption** | Randomized encryption prevents frequency analysis. |
| **Minimum Storage** | **CSFLE** | QE indexes add 2-3x storage overhead. |
| **New 8.0 Deployment** | **Queryable Encryption** | Future-proof, most secure, most capable. |

---

## 2. Query Support Matrix
| Query Type | CSFLE Deterministic | CSFLE Random | Queryable Encryption (8.0) |
| :--- | :---: | :---: | :---: |
| **Equality ($eq)** | ✅ | ❌ | ✅ |
| **Range ($gt, $lt)** | ❌ | ❌ | ✅ |
| **Prefix / Suffix** | ❌ | ❌ | ✅ |
| **Regex / Text** | ❌ | ❌ | ❌ |
| **Sorting** | ❌ | ❌ | ❌ |
| **$sum / $avg** | ❌ | ❌ | ❌ |

---

## 3. The "Kill" Track Discovery Questions
- **"Who should NOT see this data?"** (Target: DBAs, Cloud Ops, Insider threats).
- **"Is it acceptable for your DBAs to see customer SSNs?"** (Positions zero-trust).
- **"What's your latency budget?"** (Expect 10-20% overhead; qualify early).
- **"Do you need to aggregate or sort on sensitive fields?"** (Technical disqualifier).
- **"What is blocking your cloud migration?"** (Usually security/privacy unblocker).

---

## 4. Key Management Best Practices
- **Envelope Encryption**: CMK (in KMS) wraps the DEK (in Key Vault).
- **AWS KMS**: Use `eu-north-1` for Nordics; co-locate with compute.
- **Auto-Rotation**: Enable annual CMK rotation in AWS (Zero application impact).
- **Crypto-Shredding**: 1 DEK per User ➔ Delete DEK = Compliance with GDPR Art 17.
- **Rewrap**: Use `rewrapManyDataKey()` to update CMK without data rewrite.

---

## 5. Competitive Edge (The 30-Second Pitch)
- **vs Oracle TDE**: "Oracle TDE decrypts in memory for DBAs. We never do. True zero-trust."
- **vs PostgreSQL**: "Postgres can't search what it encrypts without decrypting first. We can."
- **vs Cosmos DB**: "Their solution is preview with limited types. Ours is GA, battle-tested, with range queries."
- **Value**: Field-Level Encryption is the ultimate insurance policy against the $4.8M average breach cost.

---

## 6. Sizing & Ops
- **Storage Factor**: 1.5x (CSFLE) to 3x (QE Range).
- **Compaction**: Schedule monthly `.ecoc` compaction for production workloads.
- **KMS Permissions**: Ensure `kms:GenerateDataKey` is in the IAM policy.
- **Documentation**: `mongodb.com/docs/manual/core/queryable-encryption`
