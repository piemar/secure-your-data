# Presentation Content Validation Prompt: MongoDB CSFLE & Queryable Encryption SA Enablement

## Overview
This document describes a **21-slide technical presentation** for MongoDB Solutions Architects covering Client-Side Field Level Encryption (CSFLE) and Queryable Encryption (QE). The presentation is designed for a **45-minute deep-dive** followed by **hands-on labs**.

## Target Audience
- Senior Solutions Architects (Technical Pre-sales & Post-sales)
- Persona: Needs to explain *how* QE works under the hood and design multi-cloud security architectures
- Focus on "Day 2" architectural discussions, regulatory compliance (GDPR/HIPAA), and performance tuning

---

## Slide-by-Slide Content Specification

### SLIDE 1: Title Slide
**Section**: Title  
**Title**: Client-Side Field Level Encryption & Queryable Encryption  
**Content**:
- Shield icon with glow effect (hero visual)
- Main title: "Client-Side Field Level Encryption"
- Subtitle: "& Queryable Encryption"
- Tagline: "Protecting Sensitive Data at the Application Layer"
- Badge: "SA Enablement Session"
- Stats row: "45 min Presentation | 3 Labs | Day 2 Architecture Focus"

**Speaker Notes**:
- Welcome to the CSFLE & QE deep-dive session
- Designed for senior SAs handling complex "Day 2" architectural discussions
- Learning objectives: Explain HOW QE works under the hood, design multi-cloud security architectures, handle GDPR/HIPAA compliance questions, differentiate from competitors

---

### SLIDE 2: Agenda
**Section**: Agenda  
**Title**: Today's Session  
**Content**: 8-item agenda in 2x4 grid layout:
1. **01 The Challenge** - Why customers need this
2. **02 Use Cases** - Where this wins deals
3. **03 Architecture Deep Dive** - How it works under the hood
4. **04 CSFLE vs Queryable Encryption** - When to use which
5. **05 Key Management & KMS** - Envelope encryption, rotation
6. **06 Competitive Positioning** - vs Oracle, PostgreSQL, cloud DBs
7. **07 Discovery & Objection Handling** - Questions to ask, FAQs
8. **08 Hands-On Lab** - AWS KMS + Azure Key Vault

**Speaker Notes**:
- Cover business case, technical architecture, hands-on labs, and sales enablement

---

### SLIDE 3: The Challenge - Why Should You Care?
**Section**: The Challenge (Section 01)  
**Title**: Why Should You Care?  
**Content**:
- Stat cards: **$4.88M** average breach cost, **277 days** to identify & contain
- "The Encryption Gap" callout: Traditional encryption protects data at rest and in transit, but DBAs, cloud admins, and backup systems still see plaintext
- Customer triggers to listen for:
  - "We're moving to cloud but security won't approve"
  - "Our DBAs shouldn't see PII"
  - "We need to meet GDPR / HIPAA / PCI-DSS"
  - "Insider threat is a board-level concern"

**Speaker Notes**:
- IBM Cost of a Data Breach 2023 statistics
- Key insight: "encryption gap" - traditional encryption (TDE) still exposes data to anyone with database access

---

### SLIDE 4: Use Cases - Where This Wins Deals
**Section**: Use Cases (Section 02)  
**Title**: Where This Wins Deals  
**Content**: 3-column use case cards:

| Healthcare 🏥 | Financial Services 💳 | Gaming & Gambling 🎰 |
|--------------|----------------------|---------------------|
| PHI protection, HIPAA compliance | PCI-DSS compliance | Regulatory compliance |
| Patient records encryption | Account numbers, balances | Fraud detection |
| SSN, DOB, diagnosis codes | Trading data privacy | Player privacy, betting patterns |
| *Regulation: HIPAA* | *Regulation: PCI-DSS, SOX* | *Regulation: Gaming Regulations* |

- Info callout: "Common Thread: Separation of duties between app owners and infrastructure operators"

**Speaker Notes**:
- Healthcare: HIPAA requires encryption of ePHI - perfect for patient records
- Financial Services: PCI-DSS requires encryption of cardholder data
- Gaming: Often overlooked but handles massive payment data and regulatory requirements

---

### SLIDE 5: The Solution - Client-Side Encryption
**Section**: Architecture (Section 03)  
**Title**: Client-Side Encryption  
**Content**:
- Core principle callout: "Data is encrypted by the application BEFORE it reaches MongoDB. The database never sees plaintext for protected fields."
- Who can't see the data (with X icons): Database Admins, Cloud Operators, Backup Systems, Network Sniffers
- Two approaches comparison:
  - **CSFLE**: Deterministic or random encryption. Equality queries only. Available since MongoDB 4.2.
  - **Queryable Encryption**: Equality, range, prefix, suffix queries. Stronger security. GA in MongoDB 8.0.

**Speaker Notes**:
- Core principle: data encrypted BEFORE reaching MongoDB
- MongoDB stores only ciphertext - never sees plaintext

---

### SLIDE 6: Architecture - How It Works
**Section**: Architecture (Section 03)  
**Title**: How It Works  
**Content**: Architecture diagram showing 4-component flow:
1. **APPLICATION** - MongoDB Driver + libmongocrypt (Encryption happens here)
2. → Arrow →
3. **MONGODB** - Stores ciphertext, never sees plaintext
4. **KMS PROVIDER** - AWS / Azure / GCP / KMIP / Local

- Key Vault Collection: "Stores encrypted Data Encryption Keys (DEKs). DEKs are wrapped by CMK in KMS."
- Customer-Controlled Keys: "You keep the master keys. Even MongoDB/Atlas can never see your plaintext data."

**Speaker Notes**:
- The flow: Application encrypts → MongoDB stores ciphertext → KMS stores master key
- Key talking point: "You keep the master keys. Even MongoDB/Atlas can never see your plaintext data."

---

### SLIDE 7: CSFLE vs Queryable Encryption
**Section**: Comparison (Section 04)  
**Title**: CSFLE vs Queryable Encryption  
**Content**: Side-by-side comparison:

| Aspect | CSFLE | Queryable Encryption |
|--------|-------|---------------------|
| Availability | MongoDB 4.2+ | MongoDB 8.0 GA |
| Encryption Type | Deterministic: Same plaintext → same ciphertext<br>Random: Different ciphertext each time | Always randomized encryption<br>Same plaintext → different ciphertext |
| Query Support | Equality only (deterministic fields)<br>No range, prefix, or suffix queries | Equality, Range, Prefix, Suffix<br>Rich query capabilities on encrypted data |
| Security | Deterministic encryption reveals patterns | No frequency analysis vulnerability |

- Recommendation callout: "Use QE for new implementations on MongoDB 8.0+. CSFLE for older versions or when storage overhead is a concern."

**Speaker Notes**:
- CSFLE: More mature, since 4.2, lower overhead
- QE: Always randomized (more secure), supports RANGE queries - this is the breakthrough
- Higher storage overhead (2-3x)

---

### SLIDE 8: Automatic vs Explicit Encryption
**Section**: Implementation (Section 04)  
**Title**: Implementation Modes  
**Content**: Two-column comparison:

| Automatic Encryption | Explicit Encryption |
|---------------------|---------------------|
| *Enterprise Advanced / Atlas required* | *Community Edition compatible* |
| Schema defines which fields to encrypt. Driver handles encryption/decryption transparently. | Application code explicitly calls encrypt/decrypt methods on specific fields. |
| **Pros**: Minimal code changes, Schema enforcement, Reduced developer error | **Pros**: Works with Community, Full control, Flexible implementation |
| **Cons**: Requires Enterprise/Atlas, Less granular control | **Cons**: More code changes, Developer must remember |

**Speaker Notes**:
- Automatic: Schema-driven, minimal code changes
- Explicit: More control but more code changes
- Many customers use both: Automatic for main path, Explicit for edge cases

---

### SLIDE 9: Supported Query Types
**Section**: Query Capabilities (Section 04)  
**Title**: Query Capabilities  
**Content**: Query operator support table:

| Equality | Range | Prefix | Suffix |
|----------|-------|--------|--------|
| $eq, $ne, $in, $nin | $gt, $gte, $lt, $lte | Starts with matching | Ends with matching |
| `{ ssn: "123-45-6789" }` | `{ salary: { $gte: 50000 } }` | `{ email: /^john/ }` | `{ domain: /@corp.com$/ }` |

- Supported Data Types: String, Int (32/64), Double, Decimal128, Date, ObjectId, UUID, BinData
- Note: "Range, prefix, and suffix queries require Queryable Encryption. CSFLE only supports equality on deterministic fields."

**Speaker Notes**:
- Range queries are the breakthrough with QE
- CSFLE only supports equality on deterministic fields

---

### SLIDE 10: What You CAN'T Do - Critical Knowledge
**Section**: Limitations (Section 04)  
**Title**: Critical Knowledge  
**Content**: Two-column limitations:

| Query Restrictions (X icons) | Operational Considerations (⚠ icons) |
|-----------------------------|--------------------------------------|
| No regex (Except prefix/suffix patterns) | Field-level, not document-level |
| No aggregation operators ($sum, $avg, $group) | Schema changes require re-encryption |
| No sorting on encrypted fields | Index limitations |
| No text search / Atlas Search | Driver support varies |

- Warning callout: "Know limitations before customer discovers them. Set proper expectations early in discussions."

**Speaker Notes**:
- Be upfront with customers about limitations
- Better they hear it from you than discover it in production
- This is where "Day 2" architecture discussions happen

---

### SLIDE 11: Envelope Encryption
**Section**: Key Management (Section 05)  
**Title**: Envelope Encryption  
**Content**: Vertical hierarchy diagram:
1. **CMK (Customer Master Key)** - Never leaves KMS, Customer controlled
2. ↓ wraps
3. **DEK (Data Encryption Key)** - Stored encrypted in Key Vault
4. ↓ encrypts
5. **Your Sensitive Data** - SSN, PII, PHI, card numbers

- Benefits: CMK rotation doesn't require data re-encryption, Different DEKs for different data classifications, Audit trail in KMS for key access
- Customer Talking Point: "You keep the master keys. Even MongoDB/Atlas can never see your plaintext data."

**Speaker Notes**:
- Three layers: CMK → DEK → Data
- Why envelope encryption: CMK rotation only re-wraps DEKs, not data

---

### SLIDE 12: KMS Providers
**Section**: Key Management (Section 05)  
**Title**: Supported KMS Providers  
**Content**: 4-card grid:

| AWS KMS | Azure Key Vault | GCP Cloud KMS | KMIP |
|---------|-----------------|---------------|------|
| IAM-based auth | Azure AD auth | Service account auth | Certificate auth |
| Regional key management | RBAC, HSM-backed | Key rings, crypto keys | Thales, HashiCorp |
| CloudTrail audit | Managed identity | Cloud Audit Logs | Any KMIP 1.2+ |

- Warning: "Local key provider available for dev/test only. Never use in production."

**Speaker Notes**:
- AWS KMS: Most common in production
- Azure Key Vault: Good for Microsoft shops
- GCP Cloud KMS: For Google Cloud customers
- KMIP: For on-prem HSMs or specialized requirements

---

### SLIDE 13: Key Rotation Strategies
**Section**: Key Management (Section 05)  
**Title**: Key Rotation  
**Content**: Two-column comparison:

| CMK Rotation (Low Impact) ✓ | DEK Rotation (Higher Impact) ⚠ |
|----------------------------|-------------------------------|
| CMK rotation only requires re-wrapping DEKs in the key vault. The encrypted data itself doesn't change. | DEK rotation requires re-encrypting all data protected by that DEK. Plan for downtime or rolling updates. |
| **Process**: 1. Create new CMK in KMS 2. Re-wrap each DEK with new CMK 3. Update key vault collection 4. Optionally decommission old CMK | **When Required**: Suspected key compromise, Compliance mandates, Employee departure with key access |

- Tip: "Many KMS providers support automatic CMK rotation. Use MongoDB's `rewrapManyDataKey()` for bulk DEK updates."

**Speaker Notes**:
- CMK rotation: Low impact, only re-wraps DEKs
- DEK rotation: Higher impact, requires re-encrypting all data

---

### SLIDE 14: Performance Considerations
**Section**: Operations (Section 05)  
**Title**: Operational Performance  
**Content**: 4-card overhead areas + stats:
- **Encryption/Decryption**: CPU cycles in app layer. Modern CPUs with AES-NI make this minimal.
- **KMS Calls**: DEK unwrapping requires KMS round-trip. Cached after first call per session.
- **Storage**: Ciphertext is larger than plaintext. QE metadata adds additional overhead.
- **Query Processing**: QE maintains encrypted indexes. Range queries touch more index entries.

Ballpark numbers:
- **5-15%** CSFLE latency increase
- **2-3x** QE Range storage
- **50-100ms** First query (KMS)

Optimization tips: DEK Caching, KMS Proximity (same region)

**Speaker Notes**:
- First query has 50-100ms KMS overhead, subsequent queries minimal
- Storage planning: Start with 2.5x factor for Range fields

---

### SLIDE 15: Regulatory Alignment
**Section**: Compliance (Section 05)  
**Title**: Compliance Mapping  
**Content**: Compliance table:

| GDPR | HIPAA | PCI-DSS | SOX / SOC2 |
|------|-------|---------|------------|
| EU Data Protection | Healthcare Data | Payment Card Data | Financial Controls |
| ✓ Art. 32 - Data encryption | ✓ PHI encryption at rest | ✓ Req 3.4 - Render PAN unreadable | ✓ Data integrity controls |
| ✓ Art. 25 - Privacy by design | ✓ Access controls via key mgmt | ✓ Req 3.5 - Key management | ✓ Access segregation |
| ✓ Pseudonymization | ✓ Audit trail through KMS | ✓ Separation of duties | ✓ Encryption key controls |

- Key Message: "Client-side encryption addresses the 'zero trust' requirement - even infrastructure operators can't access plaintext data."

**Speaker Notes**:
- GDPR Article 17 "Right to be Forgotten" - crypto-shredding with 1 DEK per user pattern
- HIPAA: ePHI must be encrypted
- PCI-DSS: Encrypt cardholder data AND search it (QE breakthrough)

---

### SLIDE 16: Competitive Positioning
**Section**: Competitive (Section 06)  
**Title**: How We Compare  
**Content**: 3-card competitive comparison:

| Oracle TDE | PostgreSQL pgcrypto | Azure Cosmos DB |
|------------|---------------------|-----------------|
| **Their approach**: Server-side TDE. DBAs see plaintext. Encryption at tablespace level. | **Their approach**: Manual encrypt/decrypt in SQL. No automatic handling. | **Their approach**: Always Encrypted (preview). Limited data types. Deterministic only. |
| **Our advantage**: DBAs never see plaintext, Field-level granularity, Query on encrypted data (QE) | **Our advantage**: Automatic encryption mode, Built-in KMS integration, Rich query support (QE) | **Our advantage**: GA production-ready, Randomized encryption (QE), Range/prefix/suffix queries |

- Key differentiator: "We're the only document database with production-ready searchable encryption."

**Speaker Notes**:
- Oracle TDE: Server-side, DBAs see plaintext - we're client-side
- PostgreSQL: Manual SQL encrypt/decrypt - we have automatic mode
- Cosmos DB: Preview, deterministic only - we're GA with randomized

---

### SLIDE 17: Discovery Questions
**Section**: Sales Enablement (Section 07)  
**Title**: Discovery Questions  
**Content**: Question categories with discovery questions:

| Data Classification | Compliance | Technical Readiness |
|--------------------|------------|---------------------|
| "What sensitive data do you store? SSN, PHI, PII, payment?" | "What regulations apply? GDPR, HIPAA, PCI-DSS?" | "What's your MongoDB version? Atlas or self-managed?" |
| "Who currently has access to this data?" | "When is your next audit?" | "What languages/drivers do you use?" |
| "Have you had any data incidents?" | "Any data residency requirements?" | "What's your KMS strategy today?" |

- Qualification criteria callout

**Speaker Notes**:
- Use these questions during discovery
- Identify encryption opportunities early
- Qualify for QE vs CSFLE based on version and requirements

---

### SLIDE 18: Common Objections & Responses
**Section**: Sales Enablement (Section 07)  
**Title**: Handling Objections  
**Content**: Objection/Response pairs:

| Objection | Response |
|-----------|----------|
| "We already have TDE/encryption at rest" | "TDE protects against disk theft. It doesn't protect against DBAs, cloud operators, or backups accessing plaintext. CSFLE/QE provides true zero-trust encryption." |
| "This will kill our performance" | "CSFLE adds 5-15% overhead. QE Range is 2-3x storage. For sensitive data, this is acceptable. Selective encryption lets you encrypt only what needs protection." |
| "We can't query encrypted data" | "That was true before. Queryable Encryption enables equality, range, prefix, and suffix queries on encrypted data. This is a breakthrough capability." |
| "Key management is too complex" | "We integrate with AWS KMS, Azure Key Vault, GCP KMS, and KMIP. You use your existing key infrastructure - we just plug in." |

**Speaker Notes**:
- Prepare for these objections in every customer conversation
- Focus on the "zero trust" message
- QE is the breakthrough that changes the encryption conversation

---

### SLIDE 19: Right to Erasure (GDPR) Pattern
**Section**: Advanced Patterns (Section 07)  
**Title**: Crypto-Shredding at Scale  
**Content**: Flowchart diagram:
1. User Registration → Generate unique DEK for user → Store DEK ID in user record
2. All user data encrypted with their DEK
3. Erasure Request → Delete user's DEK from Key Vault
4. Result: All user data becomes cryptographically indecipherable (including backups)

- One DEK Per User Pattern callout: "Assign each user their own DEK. When erasure is requested, simply delete their DEK from the Key Vault. All their data becomes cryptographically indecipherable - including in backups."

**Speaker Notes**:
- GDPR Article 17 - "Right to be Forgotten" implementation
- Traditional deletion doesn't touch backups
- Crypto-shredding: delete DEK, data becomes undecryptable garbage
- This is Lab 3 hands-on exercise

---

### SLIDE 20: QE Internal Collections (.esc/.ecoc)
**Section**: Internals (Section 07)  
**Title**: QE Internal Collections  
**Content**: Diagram showing metadata collections:

| .esc (System Catalog) | .ecoc (Context Cache) |
|-----------------------|-----------------------|
| Tracks encrypted field metadata | Stores query tokens |
| Maps fields to their DEKs | Enables server-side operations |
| Stores token counts for compaction | Requires periodic compaction |
| *Named: enxcol_.<collection>.esc* | *Named: enxcol_.<collection>.ecoc* |

**Speaker Notes**:
- When QE is enabled, MongoDB creates these metadata collections automatically
- .esc stores metadata about encrypted fields
- .ecoc stores query tokens - grows with each insert, needs periodic compaction
- Important for storage planning and operational procedures
- Lab 2 explores these collections in detail

---

### SLIDE 21: Next Steps & Labs
**Section**: Labs (Section 08)  
**Title**: Hands-On Labs  
**Content**: 3-column lab summary:

| Lab 1: CSFLE & Troubleshooting | Lab 2: Queryable Encryption | Lab 3: Right to Erasure |
|-------------------------------|----------------------------|------------------------|
| *34 minutes - AWS KMS* | *34 minutes - Azure Key Vault* | *34 minutes - AWS KMS* |
| Implement CSFLE | Implement Range Queries | Implement 1 DEK per user |
| Fix broken environment (crypt_shared pathing) | Verify .esc/.ecoc collections | Simulate crypto-shredding |
| Verify BSON Subtype 6 in Atlas | Highlight DEK per field requirement | Delete DEK, verify data indecipherable |

- Resources section with links to documentation
- Q&A callout

**Speaker Notes**:
- Lab 1: CSFLE fundamentals with AWS KMS
- Lab 2: QE with Range queries, Azure Key Vault, explore internal collections
- Lab 3: GDPR Right to Erasure pattern implementation

---

## Technical Accuracy Requirements

### Key Technical Points to Validate:
1. **DEK Mapping Difference**: CSFLE can use 1 DEK for multiple fields. QE REQUIRES separate DEK per encrypted field (due to metadata binding).
2. **Version Requirements**: CSFLE - MongoDB 4.2+. QE Equality - MongoDB 7.0. QE Range - MongoDB 8.0 GA.
3. **Storage Overhead**: QE Range indexes have 2-3x storage overhead.
4. **Query Limitations**: No sorting, aggregation ($group/$sum), or text search on encrypted fields.
5. **Envelope Encryption**: CMK → wraps → DEK → encrypts → Data. CMK never leaves KMS.
6. **Key Rotation**: CMK rotation is low-impact (re-wrap DEKs). DEK rotation requires re-encrypting data.

### Terminology Consistency:
- CSFLE = Client-Side Field Level Encryption
- QE = Queryable Encryption
- CMK = Customer Master Key
- DEK = Data Encryption Key
- .esc = Encrypted State Collection / System Catalog
- .ecoc = Encrypted Compaction Collection / Context Cache
- BSON Subtype 6 = Encrypted field indicator in documents

---

## Content Validation Checklist

- [ ] All 21 slides are present with correct section assignments
- [ ] Statistics are accurate ($4.88M breach cost, 277 days)
- [ ] Version requirements are correct (4.2+, 7.0, 8.0 GA)
- [ ] DEK per field requirement for QE is emphasized
- [ ] Limitations are clearly stated (no sorting, aggregation, text search)
- [ ] Competitive positioning is accurate (TDE vs CSFLE difference)
- [ ] Compliance mappings are correct (GDPR Art. 32/17, HIPAA, PCI-DSS)
- [ ] Lab descriptions match curriculum (Lab 1: AWS, Lab 2: Azure, Lab 3: GDPR)
- [ ] Speaker notes provide actionable talking points
- [ ] Technical diagrams (envelope encryption, architecture, .esc/.ecoc) are included
