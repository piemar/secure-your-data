# MongoDB CSFLE & Queryable Encryption - Ultra-Detailed SA Enablement Prompt

## IMPORTANT CONTEXT FOR LLM
You are creating training material for **Senior MongoDB Solutions Architects**. This is NOT beginner content. The audience already understands MongoDB basics and needs **deep architectural knowledge** to handle complex customer conversations about:
- "Day 2" operations (key rotation, compaction, monitoring)
- Regulatory compliance (GDPR Article 17, HIPAA, PCI-DSS)
- Performance trade-offs and capacity planning
- Competitive differentiation (vs Oracle TDE, AWS, Azure Cosmos DB)

---

## DELIVERABLES REQUIRED

### 1. PowerPoint Presentation (25 Slides)
- Export format: .pptx
- Each slide MUST have detailed speaker notes (200-400 words per slide)
- Include diagrams, code samples, and comparison tables
- MongoDB branding: Use green (#00684A) as accent color

### 2. Three Hands-On Lab Guides (34 minutes each)
- Step-by-step instructions with code snippets
- AWS KMS integration (not local keys)
- Verification checkpoints every 5-7 minutes
- Troubleshooting sections

### 3. SA Cheat Sheet (2 pages max)
- Quick reference for customer conversations
- Flowcharts, matrices, and key talking points

---

## SLIDE-BY-SLIDE DETAILED CONTENT

### SLIDE 1: Title Slide
**Title**: MongoDB Client-Side Field Level Encryption & Queryable Encryption
**Subtitle**: SA Technical Enablement Deep-Dive
**Footer**: 45-minute presentation + 3 hands-on labs

**Speaker Notes**:
Welcome to the CSFLE & Queryable Encryption deep-dive. This session is designed for senior SAs who need to handle complex "Day 2" architectural discussions with customers.

By the end, you will be able to:
- Explain HOW Queryable Encryption works under the hood (not just what it does)
- Design multi-cloud security architectures using AWS, Azure, or GCP KMS
- Handle GDPR/HIPAA compliance questions with confidence
- Differentiate our solution from competitors like Oracle TDE and Cosmos DB

---

### SLIDE 2: Agenda
**Content**:
| Time | Topic |
|------|-------|
| 0-5 min | The "Why" & Compliance Hook |
| 5-15 min | Cryptographic Fundamentals & Internals |
| 15-25 min | GDPR & Multi-Cloud Patterns |
| 25-35 min | CSFLE vs QE Architecture Differences |
| 35-45 min | Competitive "Kill" Tracks |

**Speaker Notes**:
We start with the business case - why customers need this. Then we go deep into cryptographic internals - this is the "how it works" content that will set you apart in technical discussions. GDPR patterns are critical for European customers. The CSFLE vs QE comparison is where customers often get confused. Finally, competitive positioning so you can handle objections about Oracle, AWS, and Azure alternatives.

---

### SLIDE 3: The Cost of Getting It Wrong
**Content**:
- €4.4B+ in GDPR fines issued to date (as of 2024)
- $1.3M average HIPAA penalty per violation
- GDPR Article 32: "Encryption of personal data" explicitly required
- HIPAA: ePHI must be encrypted at rest AND in transit
- PCI-DSS Requirement 3: Encrypt cardholder data, manage crypto keys
- SOX: Audit trail + access controls for financial data

**Visual**: Table mapping Regulation → Encryption Requirement → MongoDB Solution

| Regulation | Requirement | MongoDB Solution |
|------------|-------------|------------------|
| GDPR Art. 32 | Encrypt personal data | CSFLE/QE field-level encryption |
| GDPR Art. 17 | Right to erasure | 1 DEK per user (crypto-shredding) |
| HIPAA | Encrypt ePHI | CSFLE on PHI fields |
| PCI-DSS | Encrypt cardholder data | QE for searchable PAN |
| SOX | Audit trail | KMS audit logs (CloudTrail) |

**Speaker Notes**:
These are not theoretical risks. €4.4 billion in GDPR fines have been issued. GDPR Article 32 specifically calls out encryption, but more importantly, Article 17 - the "Right to be Forgotten" - requires you to be able to delete ALL user data. We'll show how CSFLE enables "crypto-shredding" to address this.

HIPAA requires encryption of electronic Protected Health Information (ePHI). CSFLE is perfect for encrypting specific PHI fields while leaving non-sensitive data queryable.

PCI-DSS is interesting because you need to encrypt cardholder data BUT also need to search it (for fraud detection). This is where Queryable Encryption shines.

The key message: Encryption is no longer optional. The question is HOW to do it without breaking application functionality.

---

### SLIDE 4: Use Cases by Industry
**Content**: Three columns

**Healthcare (HIPAA)**:
- Patient records (ePHI)
- Insurance IDs
- Prescription data
- Diagnosis codes

**Financial Services (PCI-DSS, SOX)**:
- Account numbers
- SSN/Tax IDs
- Transaction amounts
- Credit card PANs

**Gaming & Social (COPPA, GDPR)**:
- Payment details
- Chat logs (especially minors)
- Location data
- User profiles

**Speaker Notes**:
The pattern across all industries is **selective encryption of sensitive fields while maintaining application functionality on non-sensitive data**.

Healthcare: Encrypt patient_name, SSN, diagnosis codes - but leave timestamps and department codes queryable for analytics.

Financial Services: QE is perfect here because you can do range queries on encrypted transaction amounts for fraud detection. "Find all transactions over $10,000" works on encrypted data.

Gaming: Often overlooked, but gaming companies handle massive amounts of payment data AND data from minors. COPPA (Children's Online Privacy Protection Act) has strict requirements.

---

### SLIDE 5: CSFLE vs Queryable Encryption Overview
**Visual**: Two-column comparison

**CSFLE (MongoDB 4.2+)**:
- Deterministic OR Random encryption
- Equality queries on deterministic fields only
- Mature, battle-tested since 4.2
- Lower storage overhead
- **Can share 1 DEK across multiple fields**

**Queryable Encryption (MongoDB 7.0+)**:
- Always random encryption (more secure)
- Equality AND Range queries on encrypted data
- Latest cryptographic innovation
- 2-3x storage overhead for Range indexes
- **CRITICAL: Requires separate DEK for EACH encrypted field**

**Callout Box (Warning)**: 
> ⚠️ QE requires a separate DEK for each encrypted field due to metadata binding. This is different from CSFLE where one DEK can encrypt multiple fields.

**Speaker Notes**:
This is the fundamental choice customers face: CSFLE or Queryable Encryption.

**CSFLE** is more mature, available since 4.2. It supports deterministic encryption (same input = same output) which enables equality queries. One DEK CAN be used for multiple fields. Lower overhead, simpler architecture.

**Queryable Encryption** always uses randomized encryption (more secure - same input = different output each time). The breakthrough is that it supports RANGE queries on encrypted data. However, it requires a SEPARATE DEK for EACH encrypted field because of how the metadata collections work.

That last point is often missed and causes confusion. In CSFLE, you might use one DEK for all sensitive fields. In QE, each field needs its own DEK.

---

### SLIDE 6: Envelope Encryption Architecture
**Visual**: Diagram showing three layers

```
┌─────────────────────────────────────┐
│         KMS Provider                │
│    (AWS KMS / Azure / GCP / KMIP)   │
│         [CMK Lives Here]            │
│         Never leaves KMS            │
└───────────────┬─────────────────────┘
                │ protects
                ▼
┌─────────────────────────────────────┐
│      MongoDB Key Vault Collection   │
│   [Encrypted DEKs stored here]      │
│   DEK is encrypted BY the CMK       │
└───────────────┬─────────────────────┘
                │ encrypts
                ▼
┌─────────────────────────────────────┐
│       Application Data              │
│   [BSON Subtype 6 in documents]     │
│   Encrypted BY the DEK              │
└─────────────────────────────────────┘
```

**Speaker Notes**:
This is the envelope encryption model - fundamental to understanding CSFLE and QE.

**Three layers**:
1. **Customer Master Key (CMK)** - Lives in KMS (AWS, Azure, GCP, KMIP). NEVER leaves the KMS. This is your "key to all keys."

2. **Data Encryption Key (DEK)** - The actual key that encrypts your data. Stored in the MongoDB Key Vault collection, BUT it's stored encrypted (by the CMK). Client must call KMS to decrypt it before use.

3. **Encrypted Data** - Stored as BSON Subtype 6 in your documents.

**The flow**:
1. Client needs to encrypt data
2. Client retrieves encrypted DEK from Key Vault
3. Client sends encrypted DEK to KMS
4. KMS decrypts DEK using CMK, returns plaintext DEK
5. Client uses plaintext DEK to encrypt data
6. Encrypted data stored in MongoDB

**Why envelope encryption?**
- CMK rotation only requires re-encrypting DEKs, not all data
- CMK never touches your infrastructure
- Defense in depth

---

### SLIDE 7: Structured Encryption & EMMs
**Title**: How QE Enables Range Queries on Ciphertext

**Content**:
- **Encrypted Multi-Maps (EMMs)** enable server-side computation
- Client generates encrypted "tokens" at insert time
- Tokens encode order relationships mathematically
- Server can test $gt, $lt, $eq without seeing plaintext values
- **Private Querying**: Query patterns are redacted from server logs

**Code Example**:
```javascript
// Conceptually, the client generates range tokens
token_gt_50000 = encrypt(range_token(50000, GT))
token_lt_100000 = encrypt(range_token(100000, LT))

// Server can compute intersection without knowing actual values
// Result: "salary > 50000 AND salary < 100000"
```

**Supported Operators**:
- ✅ $eq - Equality matches
- ✅ $gt, $gte - Greater than
- ✅ $lt, $lte - Less than
- ✅ $in - Set membership

**Speaker Notes**:
This is the deep technical content that sets you apart in customer conversations.

**How can a server compute $gt on encrypted data?** The answer is Structured Encryption using Encrypted Multi-Maps (EMMs).

**Conceptually**:
1. Client generates special "range tokens" at encryption time
2. These tokens encode order relationships mathematically
3. Server can test token relationships without knowing values
4. Result: Server finds "salary > 50000" without ever seeing "50000" or actual salaries

**Technical details for deep conversations**:
- Uses Order-Preserving Encryption (OPE) principles
- Tokens are stored in .esc and .ecoc collections
- Each insert generates multiple tokens for range capability

**Private Querying is a bonus**:
- Query patterns are redacted from server logs
- A DBA can't even tell WHICH field you're querying
- Provides protection against insider threats

This is why storage overhead is 2-3x - those tokens take space.

---

### SLIDE 8: .esc and .ecoc Collections
**Title**: QE Internal Metadata Collections

**Visual**: Diagram showing relationship

```
┌────────────────────────────┐
│    Your Collection         │
│    (e.g., "employees")     │
└────────────┬───────────────┘
             │ creates
    ┌────────┴────────┐
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ enxcol_      │  │ enxcol_      │
│ employees    │  │ employees    │
│ .esc         │  │ .ecoc        │
│              │  │              │
│ System       │  │ Context      │
│ Catalog      │  │ Cache        │
└──────────────┘  └──────────────┘
```

**Content**:

**.esc (Encrypted State Collection / System Catalog)**:
- Named: `enxcol_.<collection>.esc`
- Stores metadata about encrypted fields
- Maps each field to its DEK
- Tracks token counts for compaction decisions

**.ecoc (Encrypted Compaction Collection / Context Cache)**:
- Named: `enxcol_.<collection>.ecoc`
- Stores query tokens generated during inserts
- Enables server-side range operations
- **Grows with each insert - requires periodic compaction**

**Speaker Notes**:
When you enable Queryable Encryption, MongoDB automatically creates these metadata collections.

**.esc (Encrypted State Collection / System Catalog)**:
- Named: enxcol_.<collectionName>.esc
- Stores metadata about encrypted fields
- Maps each field to its DEK
- Tracks counts for compaction decisions

**.ecoc (Encrypted Compaction Collection / Context Cache)**:
- Named: enxcol_.<collectionName>.ecoc
- Stores the query tokens generated during inserts
- These tokens enable the server to compute range comparisons
- **Grows with each insert - needs periodic compaction**

**Why this matters for customers**:
1. **Storage planning** - these collections add to storage overhead
2. **Operational procedures** - compaction should be scheduled monthly
3. **Backup considerations** - these collections MUST be backed up with your data

In Lab 2, participants will actually explore these collections in MongoDB Compass to see the structure.

---

### SLIDE 9: Storage Factor Challenge (Interactive)
**Title**: Quick Challenge: What's the Storage Overhead?

**Content**:
Question: For a **Range-indexed encrypted field**, what storage overhead should you plan for?

A) 1.2x (minimal overhead)
B) 1.5x (moderate overhead)
C) 2-3x (significant overhead)
D) 5x+ (extreme overhead)

**[PAUSE FOR AUDIENCE RESPONSE]**

**Answer**: C) 2-3x for Range-indexed fields

**Why?**
- Each value generates multiple tokens for range capability
- Tokens stored in .esc and .ecoc collections
- More granular ranges = more tokens

**Factors affecting overhead**:
- Number of encrypted fields
- Range index sparsity setting
- Cardinality of values
- Query precision requirements

**Speaker Notes**:
Let participants guess before revealing the answer.

**The answer is 2-3x for Range-indexed fields.**

Explain why:
- Each value generates multiple tokens for range capability
- Tokens stored in .esc and .ecoc collections
- More granular ranges = more tokens

Factors affecting overhead:
- Number of encrypted fields (each adds overhead)
- Range index sparsity setting (higher sparsity = fewer tokens but less precision)
- Cardinality of values (more unique values = more metadata)
- Query precision requirements (tighter ranges = more tokens)

This is critical for capacity planning discussions. Always factor in this overhead when sizing clusters. For Atlas, this affects your tier selection.

---

### SLIDE 10: Key Hierarchy Visualization
**Visual**: Vertical stack diagram

```
┌─────────────────────────────────────────────┐
│  ☁️  KMS Provider (AWS/Azure/GCP/KMIP)      │
│     "Company's Key Management Service"      │
└─────────────────┬───────────────────────────┘
                  │ protects
                  ▼
┌─────────────────────────────────────────────┐
│  🔐  CMK (Customer Master Key)              │
│     "Never leaves the KMS"                  │
│     "Your master key to all keys"           │
└─────────────────┬───────────────────────────┘
                  │ encrypts
                  ▼
┌─────────────────────────────────────────────┐
│  🔑  DEK(s) (Data Encryption Keys)          │
│     "Stored encrypted in Key Vault"         │
│     "One per encrypted field (QE)"          │
└─────────────────┬───────────────────────────┘
                  │ encrypts
                  ▼
┌─────────────────────────────────────────────┐
│  📄  Field Data (BSON Subtype 6)            │
│     "Your actual encrypted data"            │
└─────────────────────────────────────────────┘
```

**Benefits Box**:
- ✅ CMK rotation = only re-encrypt DEKs (not all data)
- ✅ CMK never touches your infrastructure
- ✅ Separation of concerns (KMS team vs App team)
- ✅ Audit trail at every layer
- ✅ Cloud-agnostic (can switch KMS providers)

**Speaker Notes**:
The key hierarchy provides defense in depth.

**Top to bottom**:
1. **KMS Provider** - Enterprise-grade key management (AWS KMS, Azure Key Vault, GCP KMS, KMIP)
2. **CMK** - Your master key, never leaves the KMS
3. **DEKs** - Encrypted by CMK, stored in Key Vault collection
4. **Data** - Encrypted by DEKs, stored as BSON Subtype 6

**Benefits of this architecture**:
- CMK rotation is cheap (only re-encrypt DEKs, not all data)
- Separation of concerns (KMS team manages CMK, app team uses DEKs)
- Audit trail at every layer
- Cloud-agnostic (can switch KMS providers)

**Key rotation workflow using rewrapManyDataKey()**:
1. Create new CMK in KMS
2. Use rewrapManyDataKey() to re-encrypt all DEKs
3. Retire old CMK
4. **No data re-encryption needed!**

---

### SLIDE 11: Right to Erasure Pattern (GDPR Art. 17)
**Title**: Crypto-Shredding at Scale

**Visual**: Flowchart

```
┌──────────────────────────────────────────────────────────────┐
│  USER SIGNUP                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌────────────┐ │
│  │ Create User │ ───▶  │ Generate    │ ───▶  │ Store DEK  │ │
│  │ Account     │       │ Unique DEK  │       │ ID in User │ │
│  └─────────────┘       └─────────────┘       └────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  DATA OPERATIONS                                             │
│  All user's sensitive data encrypted with THEIR unique DEK  │
│  • SSN, Address, Payment Info → Encrypted                   │
│  • Username, Preferences → May be unencrypted               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  ERASURE REQUEST (GDPR Art. 17)                              │
│  ┌─────────────┐       ┌─────────────┐       ┌────────────┐ │
│  │ User        │ ───▶  │ Delete DEK  │ ───▶  │ Data now   │ │
│  │ Requests    │       │ from Key    │       │ UNDECRYPT- │ │
│  │ Deletion    │       │ Vault       │       │ ABLE       │ │
│  └─────────────┘       └─────────────┘       └────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Success Callout**:
> ✅ **Including Backups!** Backups contain encrypted data. Without the DEK, backup data is also undecryptable.

**Speaker Notes**:
GDPR Article 17 - the "Right to be Forgotten" - is a major challenge for customers.

**The problem**:
- User requests deletion of all their data
- But their data is in backups, logs, analytics, replicas
- Traditional deletion doesn't touch backups

**The solution: Crypto-shredding with One DEK Per User**

**Pattern**:
1. When user signs up, generate a unique DEK for them
2. Store DEK ID in their user record
3. All their sensitive data encrypted with THEIR DEK
4. When they request erasure: DELETE their DEK from Key Vault

**Result**:
- All their data becomes undecryptable garbage
- Including data in backups (backups have encrypted data)
- Other users completely unaffected (different DEKs)

**This is Lab 3** - participants will implement this pattern hands-on.

**Limitation to discuss**: Cross-user queries become complex. If you need to query across users (analytics), you may need a separate aggregation approach with anonymized data.

---

### SLIDE 12: Multi-Cloud KMS Architecture
**Visual**: Two-column comparison + provider table

**BYOK (Bring Your Own Key)**:
- Customer owns and manages CMK externally
- Import existing keys to cloud KMS
- Full control over key lifecycle
- Required for some financial regulations (custody)
- More operational complexity

**Managed Identity / Cloud-Generated**:
- Cloud provider generates CMK
- Automatic rotation available
- Simpler operational model
- Sufficient for most compliance requirements

**Provider Comparison Table**:
| Provider | Service | Auth Method | BYOK Support |
|----------|---------|-------------|--------------|
| AWS | AWS KMS | IAM Role / Access Keys | ✅ |
| Azure | Key Vault | Managed Identity / SPN | ✅ |
| GCP | Cloud KMS | Service Account | ✅ |
| On-Prem | KMIP (Thales, Gemalto) | Certificate | ✅ |

**Speaker Notes**:
Multi-cloud and hybrid scenarios are common. Here's how to handle KMS across providers.

**BYOK (Bring Your Own Key)**:
- Customer generates key material externally (often in HSM)
- Imports into cloud KMS
- Maintains control even if they leave the cloud
- Required by some financial regulations (custody requirements)

**Managed Identity / Cloud-Generated**:
- Let the cloud provider generate and manage keys
- Automatic rotation available (easier ops)
- Sufficient for most compliance requirements

**Provider options**:
- **AWS KMS**: Most common, IAM-based auth
- **Azure Key Vault**: Good for Microsoft shops, Managed Identity is excellent
- **GCP Cloud KMS**: Similar to AWS, service account auth
- **KMIP**: For on-prem HSMs or specialized requirements (Thales, Gemalto)

**Architecture tip**: You can use DIFFERENT KMS providers for different DEKs!
- Production data with AWS KMS
- DR data with Azure Key Vault
- This provides true multi-cloud resilience

---

### SLIDE 13: Automatic vs Explicit Encryption
**Visual**: Two-column comparison with code

**🤖 Automatic Encryption**:
Best for: New applications, Queryable Encryption

```javascript
// Define fields to encrypt - driver handles the rest
const encryptedFields = {
  fields: [
    { path: "ssn", bsonType: "string", 
      queries: { queryType: "equality" }},
    { path: "salary", bsonType: "int",
      queries: { queryType: "range", min: 0, max: 1000000 }}
  ]
};

// Create collection with encryption
await db.createCollection("employees", { encryptedFields });

// App code doesn't change! Just insert normally
await collection.insertOne({ 
  name: "John", 
  ssn: "123-45-6789",  // Automatically encrypted
  salary: 75000        // Automatically encrypted
});
```

**👩‍💻 Explicit (Manual) Encryption**:
Best for: Legacy apps, conditional encryption, fine-grained control

```javascript
// Manually encrypt before insert
const encryptedSSN = await clientEncryption.encrypt(
  "123-45-6789",
  {
    keyId: dekId,
    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
  }
);

await collection.insertOne({ ssn: encryptedSSN });

// Manually decrypt after retrieval
const decrypted = await clientEncryption.decrypt(doc.ssn);
```

**Speaker Notes**:
Two ways to integrate CSFLE/QE: Automatic and Explicit.

**Automatic Encryption**:
- Define encryptedFields configuration specifying which fields to encrypt
- Driver intercepts all operations and handles crypto automatically
- App code doesn't change - encryption is invisible
- Best for new applications or major refactors
- **Required for Queryable Encryption Range queries**

**Explicit Encryption**:
- Call clientEncryption.encrypt() and decrypt() manually
- Full control over when/what gets encrypted
- Can encrypt only in specific code paths
- Best for retrofitting existing applications

**In practice, many customers use both**:
- Automatic for the main path
- Explicit for edge cases or conditional encryption

Both use the same underlying crypto - it's just about developer experience.

---

### SLIDE 14: QE Configuration Deep-Dive
**Title**: The encryptedFields Map

**Code Example**:
```javascript
const encryptedFields = {
  fields: [
    // Equality-only field
    {
      path: "ssn",
      bsonType: "string",
      keyId: ssnKeyId,  // Optional - auto-generated if omitted
      queries: { queryType: "equality" }
    },
    
    // Range-queryable field with tuning parameters
    {
      path: "salary",
      bsonType: "int",
      queries: { 
        queryType: "range",
        min: 0,           // Lower bound (required for range)
        max: 1000000,     // Upper bound (required for range)
        sparsity: 2,      // Token density (1-4, default 2)
        contention: 4     // Write concurrency (0-16)
      }
    },
    
    // Encrypted but NOT queryable
    {
      path: "creditCard",
      bsonType: "string"
      // No queries = encrypted but not searchable
    }
  ]
};
```

**Parameter Explanation Table**:
| Parameter | Purpose | Trade-off |
|-----------|---------|-----------|
| min/max | Bounds for range tokens | Tighter = more efficient |
| sparsity | Token density | Higher = fewer tokens, less precision |
| contention | Concurrent write handling | Higher = more parallel writes, larger metadata |

**Speaker Notes**:
This is the heart of QE configuration - the encryptedFields map.

**Key parameters for Range queries**:
- **min/max** (Required for Range): Define the bounds for token generation. If your salary field will be 0-500000, don't set max to 10000000 - you're wasting tokens.
- **sparsity** (1-4, default 2): Higher values = fewer tokens = less storage but less query precision
- **contention** (0-16, default 4): Balances write throughput vs frequency analysis protection. Higher = more parallel writes but larger metadata.

**Important**: 
- Each field gets its own DEK automatically in QE
- Fields without `queries` are encrypted but NOT searchable
- You CANNOT do range queries on a field configured for equality only

---

### SLIDE 15: Query Operator Support Matrix
**Visual**: Comparison table with checkmarks

| Operation | CSFLE Deterministic | CSFLE Random | QE Equality | QE Range |
|-----------|--------------------:|-------------:|------------:|---------:|
| $eq (equality) | ✅ | ❌ | ✅ | ✅ |
| $ne (not equal) | ✅ | ❌ | ✅ | ✅ |
| $gt, $gte | ❌ | ❌ | ❌ | ✅ |
| $lt, $lte | ❌ | ❌ | ❌ | ✅ |
| $in (set) | ✅ | ❌ | ✅ | ✅ |
| $regex | ❌ | ❌ | ❌ | ❌ |
| $text search | ❌ | ❌ | ❌ | ❌ |
| Sorting | ❌ | ❌ | ❌ | ❌ |
| $group/$sum | ❌ | ❌ | ❌ | ❌ |

**Warning Callout**:
> ⚠️ **Current Limitations**: Sorting and aggregations ($group, $sum) are NOT supported on encrypted fields. Design your schema accordingly.

**Info Callout**:
> ℹ️ **Contention Factor**: QE's `contention` parameter (0-16) balances write throughput vs query security. Higher values add "noise" to prevent frequency analysis but increase internal write operations.

**Speaker Notes**:
This is the practical "what works" slide. **Print this for customer conversations.**

**Key points**:
- CSFLE Deterministic: Equality only, but simpler to implement
- CSFLE Random: Maximum security, zero queryability
- QE Equality: Secure equality queries with randomized encryption
- QE Range: **The breakthrough** - range queries on encrypted data

**What you CANNOT do on encrypted fields**:
- Text search ($text, $regex) - can't search inside encrypted strings
- Sorting - would leak order information
- Aggregations ($group, $sum, $avg) - server can't compute on encrypted values

**Schema design implication**:
- Keep sortable/aggregatable fields unencrypted
- Or aggregate on the client side after decryption
- Consider separate analytics store for reporting needs

---

### SLIDE 16: Honest Limitations & Workarounds
**Visual**: Two-column with red X and green checkmarks

**❌ Not Supported**:
- Sorting on encrypted fields
- Full-text search ($text)
- Regex matching ($regex)
- Aggregation operators ($group, $sum, $avg)
- Array operations on encrypted arrays
- Computed fields using encrypted values
- Atlas Search on encrypted fields

**✅ Workarounds**:
- Client-side sorting after decryption
- Tokenized search on separate (hashed) field
- Pre-computed aggregates (anonymized)
- Separate analytics collection
- Encrypt entire array as one value
- Application-layer computed values

**Best Practice Box**:
> 💡 **Design Principle**: Keep sorting, searching, and aggregation operations on non-sensitive fields. Encrypt only what truly needs protection.

**Speaker Notes**:
**Be honest with customers about limitations.** Better they hear it from you than discover it in production.

**Not supported**:
- **Sorting**: Would leak order information. If salary is encrypted, you can't "ORDER BY salary"
- **Text search**: Can't search inside encrypted strings
- **Aggregations**: Can't compute SUM(salary) when salary is encrypted
- **Array ops**: Can't $push to encrypted arrays (encrypt whole array instead)
- **Atlas Search**: Search indexes can't index encrypted content

**Workarounds**:
1. **Client-side processing**: Fetch encrypted data, decrypt, then sort/aggregate in app
2. **Tokenization**: Store searchable tokens in a separate (hashed) field
3. **Pre-computed aggregates**: Maintain anonymized summary statistics
4. **Hybrid approach**: Keep some data unencrypted for analytics

**Schema design is key**:
- Encrypt ONLY sensitive fields
- Keep operational fields (status, timestamps, categories) unencrypted
- Consider separate read models for analytics

This is where "Day 2" architecture discussions happen. Help customers think through the trade-offs.

---

### SLIDE 17: Performance Considerations
**Visual**: Three stat cards + explanation

**Key Metrics**:
| Metric | Value | Notes |
|--------|-------|-------|
| Storage Overhead | 2-3x | For Range-indexed fields |
| Write Latency | ~10% increase | More fields = more overhead |
| Compaction | Monthly | Recommended for active collections |

**Write Path Diagram**:
```
1 User Insert ──▶ 3+ Internal Writes
                   ├── Main document
                   ├── .esc collection update (metadata)
                   ├── .ecoc collection insert (tokens)
                   └── Range tokens (if Range index)
```

**Sizing Guidance Box**:
- Plan for **2.5x storage factor** for Range-indexed fields
- Plan for **1.5x storage factor** for Equality-only fields
- CSFLE has minimal overhead (just encrypted payload size)

**Speaker Notes**:
Performance is always a customer concern. Here are the facts:

**Storage**:
- QE Range fields: 2-3x overhead (those tokens add up)
- QE Equality: ~1.5x overhead
- CSFLE: Minimal overhead (just encrypted payload)

**Write Latency**:
- Expect ~10% increase for encrypted inserts
- More fields encrypted = more overhead
- Range indexes add more overhead than equality

**Why the overhead?**
- Each insert generates multiple internal writes
- Main doc + .esc update + .ecoc insert + range tokens
- This is atomic (transactional) so adds latency

**Compaction**:
- .ecoc collection grows with each insert
- Periodic compaction reclaims space and improves query perf
- **Recommend monthly for active collections**
- **Can be done online - no downtime required**

**Sizing guidance**:
- Start with 2.5x storage factor for Range fields
- Monitor and adjust based on actual usage
- Consider separate storage tier for encrypted collections if cost-sensitive

---

### SLIDE 18: KMS Providers & Key Rotation
**Visual**: Provider list + code example

**Supported KMS Providers**:
- 🟠 **AWS KMS** - Most common in production
- 🔵 **Azure Key Vault** - Good for Azure-first shops
- 🟢 **GCP Cloud KMS** - For Google Cloud customers
- 🟣 **KMIP** - For on-prem HSMs (Thales, Gemalto, etc.)
- ⚪ **Local Key** - **DEVELOPMENT ONLY** - Never in production!

**Key Rotation Code**:
```javascript
// 1. Create new CMK in KMS (AWS console/CLI)

// 2. Rewrap all DEKs with new CMK
await clientEncryption.rewrapManyDataKey(
  { },  // filter - empty = all keys
  {
    provider: "aws",
    masterKey: {
      key: "arn:aws:kms:us-east-1:123456789:key/NEW-KEY-ID",
      region: "us-east-1"
    }
  }
);

// 3. Retire old CMK after confirmation
// No data re-encryption needed!
```

**Success Callout**:
> ✅ **Zero-Downtime Rotation**: Key rotation only re-encrypts DEKs, not your actual data. A collection with millions of documents can be rotated in seconds.

**Speaker Notes**:
Key rotation is a compliance requirement for many customers. Here's how it works.

**Supported KMS providers**:
- **AWS KMS**: Most common in production deployments
- **Azure Key Vault**: Good for Azure-first shops, Managed Identity works well
- **GCP Cloud KMS**: For Google Cloud customers
- **KMIP**: For on-prem HSMs or specialized requirements (Thales, Gemalto, Entrust)
- **Local Key**: **DEVELOPMENT ONLY** - never in production (no key protection)

**Key rotation with rewrapManyDataKey()**:
1. Create new CMK in your KMS (normal KMS operation)
2. Call rewrapManyDataKey() - this re-encrypts all DEKs with new CMK
3. Retire old CMK after verification

**Why it's fast**:
- Only re-encrypts DEKs (small documents in Key Vault collection)
- **Actual data remains unchanged**
- 1 million documents? Still just re-encrypting a few DEKs

**Best practices**:
- Rotate CMK annually (or per your compliance requirements)
- Test rotation in staging first
- Keep old CMK around briefly for rollback
- Automate rotation in your CI/CD pipeline

---

### SLIDE 19: Regulatory Alignment Matrix
**Visual**: Comprehensive compliance mapping table

| Requirement | Regulation | MongoDB Feature | Evidence/Artifact |
|-------------|------------|-----------------|-------------------|
| Encrypt personal data | GDPR Art. 32 | CSFLE/QE | Field-level encryption |
| Right to erasure | GDPR Art. 17 | 1 DEK per user | Crypto-shredding |
| Encrypt ePHI at rest | HIPAA | CSFLE on PHI fields | BSON Subtype 6 |
| Encrypt ePHI in transit | HIPAA | TLS + CSFLE | Double protection |
| Encrypt cardholder data | PCI-DSS Req 3 | QE for PAN | Searchable encryption |
| Key management | PCI-DSS Req 3 | KMS integration | External key storage |
| Audit trail | SOX, HIPAA | KMS audit logs | CloudTrail, Azure Monitor |
| Access controls | All | RBAC + encryption | Defense in depth |

**Info Callout**:
> ℹ️ **Compliance != Security**: Encryption helps with compliance audits, but real security requires a holistic approach: network controls, access management, monitoring, and encryption working together.

**Success Callout**:
> ✅ **Audit-Ready**: KMS providers offer comprehensive audit logs. Every key access is logged with timestamp, identity, and operation type.

**Speaker Notes**:
This slide maps CSFLE/QE features to specific regulatory requirements. Useful for customer conversations with compliance teams.

**For GDPR**:
- Article 32: Encrypt personal data → CSFLE/QE field-level encryption
- Article 17: Right to erasure → 1 DEK per user pattern (crypto-shredding)

**For HIPAA**:
- ePHI must be encrypted → CSFLE on patient name, SSN, diagnosis
- Access controls → RBAC + field-level encryption provides defense in depth

**For PCI-DSS**:
- Encrypt cardholder data → QE enables searchable encrypted PANs
- Key management requirements → External KMS integration (not MongoDB-managed)

**For SOX**:
- Audit trail → KMS providers log every key operation
- CloudTrail (AWS), Azure Monitor (Azure), GCP Audit Logs

**Key message**: Encryption is one layer of defense. Customers still need network security, access controls, monitoring, etc. We help with the encryption piece, which is increasingly a checkbox requirement.

**Auditor conversations**:
- "Show me the encryption" → BSON Subtype 6 in documents
- "Show me key management" → KMS audit logs
- "Show me access controls" → RBAC + field-level separation

---

### SLIDE 20: Competitive Landscape
**Visual**: Detailed comparison table

| Feature | MongoDB QE | Oracle TDE | Azure Cosmos DB | PostgreSQL |
|---------|-----------|------------|-----------------|------------|
| Encryption Level | **Field-level** | Column/Tablespace | Property-level | Column |
| Client-Side | ✅ Yes | ❌ No (server-side) | ✅ Yes | ❌ No |
| Range Queries | ✅ **Yes** | N/A (unencrypted) | ❌ No | ❌ No |
| Random Encryption | ✅ Yes | N/A | Deterministic only | N/A |
| Server Sees Plaintext | **Never** | Yes (in memory) | **Never** | Yes |

**Key Differentiators Box**:
- **vs TDE (Oracle, SQL Server)**: TDE decrypts in memory for query processing. DBAs can see plaintext. MongoDB server **NEVER** sees plaintext - true zero-trust.
- **vs Cosmos DB Always Encrypted**: Cosmos is deterministic-only (same input = same output = pattern leakage). No range queries. MongoDB QE has random encryption + range queries.
- **vs PostgreSQL Column Encryption**: Server-side encryption means server sees data during processing. No built-in KMS integration. Limited query capability.

**Speaker Notes**:
Competitive positioning - **know this for customer conversations**.

**vs Oracle TDE (Transparent Data Encryption)**:
- TDE encrypts at rest, but **DECRYPTS IN MEMORY** for query processing
- Database admins can see plaintext during operations
- "Encryption at rest" ≠ protection from insider threats
- **MongoDB**: Server NEVER sees plaintext - true zero-trust architecture

**vs Azure Cosmos DB Always Encrypted**:
- Cosmos has "Always Encrypted" but it's **deterministic only**
- Same input = same ciphertext every time (pattern leakage risk)
- **No range queries** on encrypted data at all
- **MongoDB QE**: Randomized encryption (more secure) + range queries

**vs PostgreSQL (column-level encryption)**:
- Server-side encryption - server decrypts for processing
- No built-in KMS integration (DIY)
- Limited query capability on encrypted data
- **MongoDB**: Client-side with enterprise KMS integration

**The key message**: MongoDB is the **only** document database with client-side searchable encryption that supports **range queries** while maintaining **true zero-trust** (server never sees plaintext).

---

### SLIDE 21: Customer Discovery Questions
**Visual**: Two-column question list

**Security Questions**:
1. What data classifications do you have? (PII, PHI, PCI, Confidential)
2. **Who should NOT be able to see sensitive data?** ← Key question
3. Do you have insider threat concerns?
4. What's your current key management strategy?
5. Do you use HSMs or external KMS today?

**Compliance Questions**:
1. Which regulations apply? (GDPR, HIPAA, PCI-DSS, SOX, FedRAMP)
2. Have you had any audit findings related to encryption?
3. Do you need to support "Right to be Forgotten"?
4. What are your data residency requirements?
5. How often do you rotate encryption keys?

**Pro Tip Box**:
> 💡 **The "DBA Admin" Question**: Ask: "Should your database administrators be able to see customer SSNs or credit card numbers?" 
> 
> The answer is almost always "No" - which immediately positions client-side encryption over TDE.

**Speaker Notes**:
Discovery questions to uncover encryption requirements. Use these in customer conversations.

**Security questions**:
- Data classification helps identify what needs encryption
- "Who should NOT see data" identifies insider threat concerns - this is the killer question
- Key management questions reveal maturity level

**Compliance questions**:
- Regulations drive requirements (ask which apply)
- Audit findings indicate urgency (and budget)
- Right to be Forgotten = crypto-shredding opportunity
- Data residency may require regional KMS deployment

**The killer question**:
"Should your database administrators be able to see customer SSNs?"

The answer is almost always "No" - and that's where client-side encryption becomes essential. **TDE doesn't help** because DBAs can still see decrypted data in memory during query processing.

This question separates "encryption at rest" conversations from **true data protection** conversations.

---

### SLIDE 22: Objection Handling
**Visual**: Objection → Response pairs

| Objection | Response |
|-----------|----------|
| "We already have encryption at rest (TDE)" | TDE encrypts on disk but decrypts in memory for processing. Your DBAs can still see plaintext. CSFLE/QE ensures the server **NEVER** sees plaintext - that's true zero-trust. |
| "This will slow down our queries" | QE adds ~10% latency for encrypted operations. But you're trading that for zero-trust security. Also, you only encrypt **sensitive fields** - not everything. |
| "We can't search encrypted data" | That was true **until Queryable Encryption**. Now you can do equality AND range queries on encrypted fields. What specific search patterns do you need? |
| "It's too complex to implement" | Automatic encryption uses a schema definition - your **app code doesn't change**. We have working labs that take 30 minutes to implement. |
| "Our compliance team is fine with TDE" | Ask them about **insider threats**. GDPR specifically mentions protection against unauthorized access - including internal users like DBAs. |

**Speaker Notes**:
Know these objections and responses. Practice them.

**"We have TDE already"**:
- TDE is encryption at rest, not in use
- DBAs see plaintext during query processing
- Doesn't protect against insider threats
- **Counter**: "Can your DBAs see customer SSNs right now?"

**"Too slow"**:
- Yes, there's overhead (~10%)
- But you're protecting against data breaches (avg cost: $4.45M)
- Only encrypt sensitive fields, not everything
- **Counter**: "What's the cost of a breach vs. 10% latency?"

**"Can't search encrypted data"**:
- This WAS true for randomized encryption
- QE changes the game with searchable encryption
- **Counter**: "What specific queries do you need? Let me show you which work."

**"Too complex"**:
- Automatic encryption: define schema, done
- Labs take 30-45 minutes
- We have reference architectures
- **Counter**: "Want to do a quick POC? Takes about an hour."

**"Compliance is OK with TDE"**:
- Involve their security team (not just compliance)
- Ask specifically about insider threat scenarios
- GDPR mentions "unauthorized access" - that includes internal users
- **Counter**: "When was your last penetration test? Did they try SQL injection to dump data?"

---

### SLIDE 23: When NOT to Use (Anti-Patterns)
**Visual**: Two-column with clear red/green indicators

**❌ Don't Use CSFLE/QE When...**:
- Heavy aggregations needed on encrypted fields ($sum, $avg, $group)
- Full-text search is required on sensitive data
- Sorting is critical and must be on encrypted fields
- Sub-millisecond latency requirements on encrypted operations
- Legacy applications that absolutely cannot be modified
- Analytics dashboards that need to aggregate sensitive data

**✅ Consider These Alternatives Instead**:
- Client-side aggregation after decryption (for small datasets)
- Tokenized search with separate hashed index field
- Application-layer sorting after decrypt
- Accept the latency trade-off for security
- Incremental migration path with proxy layer
- Separate anonymized analytics dataset

**Warning Callout**:
> ⚠️ **Honest Qualification**: If a customer needs real-time aggregations or full-text search on the encrypted fields themselves, CSFLE/QE may not be the right fit. Better to be honest upfront than have a failed implementation.

**Speaker Notes**:
**Be honest about when NOT to use CSFLE/QE.** This builds trust and prevents failed implementations.

**Bad fits**:
- Heavy aggregations: SUM, AVG, GROUP BY on encrypted fields simply won't work server-side
- Full-text search: Can't search inside encrypted strings
- Critical sorting: Can't ORDER BY encrypted fields efficiently
- Ultra-low latency: The 10% overhead may be unacceptable for some use cases
- Immutable legacy apps: If code absolutely can't change, automatic encryption won't help

**Workarounds to discuss**:
- Aggregation: Client-side compute after decryption (for smaller datasets), or maintain separate anonymized analytics store
- Search: Tokenized/hashed search field alongside encrypted field
- Sorting: Application-layer sort after decryption, or keep sort key unencrypted
- Latency: Usually acceptable trade-off when you frame as security vs speed
- Legacy: Incremental migration, or application-layer proxy

**The key: Qualify early.** A failed POC is worse than a declined engagement. If the requirements don't fit, say so and explore alternatives.

---

### SLIDE 24: Labs Overview
**Visual**: Three lab cards with timing

**Lab 1: CSFLE & Troubleshooting** (34 min)
- AWS KMS integration setup
- Automatic encryption configuration
- **Intentional Break**: crypt_shared debugging
- Verification: BSON Subtype 6 in Atlas/Compass
- *Difficulty*: Intermediate

**Lab 2: QE Range Queries & Internals** (34 min)
- Range query on encrypted `salary` field
- Explore `.esc` and `.ecoc` collections in Compass
- Profiler analysis of encrypted queries
- Verify DEK-per-field requirement
- *Difficulty*: Advanced

**Lab 3: Right to Erasure / GDPR** (34 min)
- Implement "1 DEK per user" pattern
- Insert data for multiple users
- Crypto-shredding demonstration
- Verify selective erasure works
- *Difficulty*: Advanced

**Speaker Notes**:
Here are the three hands-on labs you'll complete after this presentation.

**Lab 1: CSFLE Fundamentals** (34 min)
- Set up AWS KMS integration with proper IAM permissions
- Implement automatic encryption using schemaMap
- **Intentionally break crypt_shared** to learn debugging and troubleshooting
- Verify encrypted data appears as BSON Subtype 6 in Atlas/Compass

**Lab 2: QE Deep-Dive** (34 min)
- Implement range queries on salary field
- Actually explore the .esc and .ecoc collections in Compass
- Understand how QE stores metadata
- Verify the DEK-per-field requirement (look at Key Vault)
- Use the profiler to see encrypted query execution

**Lab 3: GDPR Implementation** (34 min)
- Implement the "1 DEK per user" pattern
- Insert data for multiple users (each with unique DEK)
- Delete one user's DEK from Key Vault
- Verify that user's data is now undecryptable garbage
- Verify other users' data is completely unaffected

Each lab is 34 minutes with step-by-step instructions, code snippets, and verification checkpoints every 5-7 minutes.

---

### SLIDE 25: Key Takeaways & Resources
**Visual**: Summary bullets + resource links

**Remember These Points**:
- ✅ CSFLE = Deterministic + Equality queries (MongoDB 4.2+)
- ✅ QE = Randomized + Range queries (MongoDB 7.0+)
- ⚠️ QE requires **separate DEK per field** (critical difference!)
- 📊 Plan **2-3x storage** for Range indexes
- 🔧 .esc and .ecoc need **monthly compaction**
- 🗑️ 1 DEK per user = Crypto-shredding for GDPR

**Resources**:
| Resource | URL |
|----------|-----|
| CSFLE Documentation | docs.mongodb.com/manual/core/csfle |
| QE Documentation | docs.mongodb.com/manual/core/queryable-encryption |
| MongoDB University | university.mongodb.com |
| Security Whitepaper | mongodb.com/security |
| This Training | [Internal Link] |

**Questions Box**:
> ❓ **Questions?** Let's discuss before moving to the hands-on labs!

**Speaker Notes**:
Final slide - summarize and open for questions.

**Key takeaways to reinforce**:
1. CSFLE vs QE choice depends on query requirements
2. QE is more secure (randomized) but has storage/performance overhead
3. **The DEK-per-field requirement for QE is critical** - don't miss this
4. Storage planning must account for 2-3x overhead
5. Compaction is an operational requirement (schedule it!)
6. Crypto-shredding enables true GDPR Art. 17 compliance

**Resources**:
- Official docs are the source of truth
- MongoDB University has free courses on security
- Security whitepaper is useful for auditor conversations

**Before moving to labs**:
- Any questions on the architecture?
- Any specific customer scenarios you want to discuss?
- Clarifications on CSFLE vs QE choice?

Then transition to Lab 1!

---

## LAB GUIDES

### Lab 1: CSFLE & Troubleshooting (34 minutes)

**Prerequisites**:
- AWS account with KMS access
- MongoDB Atlas M10+ cluster OR local MongoDB 7.0+
- Node.js 18+ installed
- MongoDB Shell (mongosh) installed

**Lab Objectives**:
1. Configure AWS KMS integration
2. Implement automatic CSFLE encryption
3. Troubleshoot common crypt_shared issues
4. Verify encrypted data in Compass

**Step-by-Step Instructions**:
[Provide detailed 34-minute lab with code snippets, screenshots placeholders, and verification checkpoints]

---

### Lab 2: Queryable Encryption Range Queries (34 minutes)

**Prerequisites**:
- Completed Lab 1
- Same AWS KMS setup

**Lab Objectives**:
1. Create collection with encryptedFields (Range configuration)
2. Insert documents with encrypted salary data
3. Execute range queries ($gt, $lt) on encrypted fields
4. Explore .esc and .ecoc collections
5. Verify DEK-per-field in Key Vault

**Step-by-Step Instructions**:
[Provide detailed 34-minute lab with code snippets, screenshots placeholders, and verification checkpoints]

---

### Lab 3: Right to Erasure / Crypto-Shredding (34 minutes)

**Prerequisites**:
- Completed Labs 1 & 2
- Same AWS KMS setup

**Lab Objectives**:
1. Implement "1 DEK per user" pattern
2. Create multiple users with unique DEKs
3. Encrypt each user's data with their DEK
4. Delete one user's DEK
5. Verify crypto-shredding worked

**Step-by-Step Instructions**:
[Provide detailed 34-minute lab with code snippets, screenshots placeholders, and verification checkpoints]

---

## SA CHEAT SHEET (2 Pages)

### Page 1: Quick Reference

**CSFLE vs QE Decision Tree**:
```
Do you need Range queries ($gt, $lt)?
├── YES → Use Queryable Encryption (7.0+)
│         └── Remember: 1 DEK per field, 2-3x storage
└── NO → Do you need equality queries?
         ├── YES → Use CSFLE Deterministic
         └── NO → Use CSFLE Random (max security)
```

**Query Support Matrix** (memorize this!):
| | CSFLE Det | CSFLE Rand | QE Eq | QE Range |
|-|:---------:|:----------:|:-----:|:--------:|
| $eq | ✅ | ❌ | ✅ | ✅ |
| $gt/$lt | ❌ | ❌ | ❌ | ✅ |
| $in | ✅ | ❌ | ✅ | ✅ |
| Sort | ❌ | ❌ | ❌ | ❌ |
| $text | ❌ | ❌ | ❌ | ❌ |

**The Killer Discovery Question**:
> "Should your DBAs be able to see customer SSNs in production?"
> (Answer is always No → positions client-side encryption)

### Page 2: Architecture & Operations

**Right to Erasure (GDPR Art. 17) Flow**:
```
User Signup → Create Unique DEK → Store DEK ID in User Record
User Data Operations → All sensitive data encrypted with User's DEK
Erasure Request → Delete DEK from Key Vault → All data now garbage
```

**Compaction Schedule**:
- **When**: Monthly for active collections
- **Command**: `db.runCommand({ compactStructuredEncryptionData: "collectionName" })`
- **Impact**: Online operation, no downtime

**Key Rotation**:
```javascript
// Zero-downtime rotation
await clientEncryption.rewrapManyDataKey(
  {},  // all keys
  { provider: "aws", masterKey: { key: "NEW-ARN" } }
);
```

**Storage Planning**:
- CSFLE: ~1.1x (minimal)
- QE Equality: ~1.5x
- QE Range: **2-3x** (tokens!)

---

## OUTPUT FORMAT REQUIREMENTS

For each slide, provide:
1. **Title** (clear, concise)
2. **Visual Description** (what diagram/table/code to show)
3. **Bullet Points** (3-6 per slide)
4. **Speaker Notes** (200-400 words, conversational tone)

For labs, provide:
1. **Step-by-step instructions** with exact commands
2. **Code snippets** that can be copy-pasted
3. **Verification checkpoints** every 5-7 minutes
4. **Troubleshooting tips** for common issues

For cheat sheet, provide:
1. **Dense, scannable format**
2. **Decision trees and matrices**
3. **Key commands and code snippets**
4. **2 pages maximum**
