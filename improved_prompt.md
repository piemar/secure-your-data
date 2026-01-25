# FINAL DEEP-DIVE PROMPT: MongoDB CSFLE & Queryable Encryption SA Enablement

## Context
I am a Solutions Architect at MongoDB. I need to create a **45-minute technical deep-dive presentation** followed by **three 34-minute hands-on labs** for high-level SAs. The goal is to equip them to handle complex "Day 2" architectural discussions, regulatory compliance (GDPR/HIPAA), and performance tuning.

## Target Audience
- Senior Solutions Architects (Technical Pre-sales & Post-sales).
- Persona: Needs to explain *how* QE works under the hood and design multi-cloud security architectures.

---

## 45-Minute Presentation Requirements (Interactive Deep-Dive)

### 1. Structure & Interactive Flow
*   **0-5 min: The "Why" & The Compliance Hook**
    *   *Interaction*: Quick poll on "What's the #1 blocker for cloud migration in your territory?" (Security vs Performance vs Cost).
*   **5-15 min: Cryptographic Fundamentals & Internals**
    *   Deep Dive: Structured Encryption & EMMs (Encrypted Multi-Maps).
    *   QE Internals: Detailed explanation of `.esc` (System Catalog) and `.ecoc` (Context Cache).
    *   *Interaction*: "Guess the storage factor" challenge for Range indexes.
*   **15-25 min: Advanced Patterns (GDPR & Multi-Cloud)**
    *   **Right to Erasure**: The "One DEK per user" pattern. How to implement crypto-shredding at scale.
    *   **Multi-Cloud Architecture**: Managing CMKs across AWS/Azure/GCP. BYOK vs. Managed Identity.
*   **25-35 min: Key Architecture Differences (CSFLE vs. QE)**
    *   **DEK Mapping**: CSFLE supports 1 DEK for multiple fields. **QE REQUIRES separate DEK keys for each encrypted field** (due to metadata binding).
    *   **Searchability**: Randomized (QE) vs. Deterministic (CSFLE).
    *   **Operational Depth**: Why QE metadata collections require compaction/management.
*   **35-45 min: The Competitive SA "Kill" Tracks**
    *   Differentiating from "Encryption at Rest" (TDE).
    *   Differentiating from Cosmos DB (Deterministic-only limits vs. our Searchable QE).

---

## Technical Content Requirements (The "Meat")

### 1. Internals (The "How It Works")
- **Metadata collections**: Explain that `.ecoc` caches tokens/tags while `.esc` stores DEK metadata.
- **Structured Encryption**: How randomized encryption still allows the server to compute $gt/$lt without seeing plaintext.
- **Private Querying**: How QE redacts logs and metadata to hide the *existence* of queries.

### 2. GDPR/Erasure Pattern
- Detail the workflow: 1 User = 1 DEK.
- Deletion of DEK = Cryptographic Erasure of data, index, logs, and backups.
- Note the project limitations (querying across DEKs requires special handling).

### 3. Performance & Design Guidelines
- **Storage**: 2-3x factor for Range fields.
- **Write Path**: Explanation that one insert = writes to multiple collections.
- **Limits**: Sorting, Aggregations ($group/$sum), and Text Search remain unsupported for in-use encrypted fields.

---

## Hands-On Lab Requirements (3 x 34 min)

### Lab 1: CSFLE & Troubleshooting (AWS KMS)
- **Goal**: Implement CSFLE + Fix a broken environment (`crypt_shared` pathing).
- **Verification**: Verify BSON Subtype 6 in Atlas.

### Lab 2: Queryable Encryption & The Profiler (AWS KMS)
- **Goal**: Implement Range Queries on `salary` field.
- **Deep-Dive**: Verify `.esc`/`.ecoc` collections appear in MongoDB.
- **Difference Check**: Highlight that QE metadata is linked to specific DEKs per field.

### Lab 3: Right to Erasure (GDPR) with CSFLE (AWS KMS)
- **Goal**: Implement "One DEK per user" pattern and simulate crypto-shredding.
- **Execution**: Delete a specific user's DEK and verify the data becomes indecipherable while others remain fine.

---

## Your Task
Generate the following:
1.  **Slide Outline (25 Slides)** with detailed speaker notes including the deep-dive internals.
2.  **Lab 1 Guide**: CSFLE & Troubleshooting (34 min).
3.  **Lab 2 Guide**: QE Range & Internals (34 min).
4.  **Lab 3 Guide**: Right to Erasure & Crypto-shredding (34 min).
5.  **SA Cheat Sheet**: Covers the "Right to Erasure" flowchart, "Compatibility Matrix", and "ESC/ECOC Compaction" tips.
