# Workshop Session & Quality Principles

This document captures the architecture and principles for workshop sessions, modes, templates, data storage, and lab quality so that workshops are consistent, high quality, and "bedazzling" for peers.

---

## 1. The 15 POVs (Implemented / Partially Implemented)

The following POVs are in scope for quality review and must be engaging and fun across **Demo**, **Lab**, and **Challenge** modes:

| # | Label | Labs (content IDs) | Notes |
|---|--------|---------------------|--------|
| 1 | RICH-QUERY | lab-rich-query-basics, lab-rich-query-aggregations, lab-rich-query-encrypted-vs-plain | Query topic |
| 2 | FLEXIBLE | lab-flexible-basic-evolution, lab-flexible-nested-documents, lab-flexible-microservice-compat | Data management |
| 3 | INGEST-RATE | lab-ingest-rate-basics, lab-ingest-rate-bulk-operations, lab-ingest-rate-replication-verify | Scalability |
| 4 | IN-PLACE-ANALYTICS | lab-analytics-overview, lab-in-place-analytics-basics, lab-in-place-analytics-advanced | Analytics |
| 5 | WORKLOAD-ISOLATION | lab-workload-isolation-overview, lab-workload-isolation-replica-tags, lab-workload-isolation-read-preference | Analytics |
| 6 | CONSISTENCY | lab-consistency-overview, lab-consistency-sharded-setup, lab-consistency-verify | Scalability |
| 7 | SCALE-OUT | lab-scale-out-overview, lab-scale-out-setup, lab-scale-out-execute | Scalability |
| 8 | SCALE-UP | lab-scale-up-overview, lab-scale-up-setup, lab-scale-up-execute | Scalability |
| 9 | MIGRATABLE | lab-migratable-overview, lab-migratable-setup, lab-migratable-execute | Deployment |
| 10 | PORTABLE | lab-portable-overview, lab-portable-setup, lab-portable-execute | Deployment |
| 11 | AUTO-DEPLOY | lab-auto-deploy-overview, lab-auto-deploy-setup, lab-auto-deploy-execute | Deployment |
| 12 | ROLLING-UPDATES | lab-rolling-updates-overview, lab-rolling-updates-setup, lab-rolling-updates-execute | Operations |
| 13 | FULL-RECOVERY-RPO | lab-full-recovery-rpo-overview, lab-full-recovery-rpo-setup, lab-full-recovery-rpo-execute | Operations |
| 14 | FULL-RECOVERY-RTO | lab-full-recovery-rto-overview, lab-full-recovery-rto-setup, lab-full-recovery-rto-execute | Operations |
| 15 | PARTIAL-RECOVERY | lab-partial-recovery-overview, lab-partial-recovery-setup, lab-partial-recovery-execute | Operations |

Additional implemented labs (Query & Search, Encryption, etc.): TEXT-SEARCH, AUTO-COMPLETE, GEOSPATIAL, GRAPH, CHANGE-CAPTURE, MONITORING, CSFLE, QUERYABLE-ENCRYPTION, RIGHT-TO-ERASURE, REPORTING, AUTO-HA.

**Quality bar for all 15+ POVs:**

- **Demo mode:** Side-by-side MongoDB vs competitor for key concepts and code; presentation adapts to selected template/labs.
- **Lab mode:** Full step-by-step with code blocks, hints, verification where applicable; each lab manages DB spin-up and cleanup when needed.
- **Challenge mode:** Same content with challenge skeletons / reduced hints; timing and scoring for engagement.
- Labs must meet ADD_LAB_MASTER_PROMPT: 3+ steps (5–7 for hands-on), keyConcepts (4+), hints (3–5 per step), enhancementId and enhancements for every step that shows code.

---

## 2. Three Modes: Demo, Labs, Challenge

| Mode | Purpose | Key behavior |
|------|--------|----------------|
| **Demo** | SA-led presentation; minimal typing by attendees | Intro and key concepts with **MongoDB vs competitor side-by-side**; steps can be shown with full solution; competitor panel 50/50 when applicable. |
| **Labs** | Hands-on; attendees run code and complete steps | Full narratives, instructions, code blocks (skeleton + hints), verification; DB per lab (default local MongoDB Community). |
| **Challenge** | Timed, scored, gamified | Same lab content with challenge skeletons; leaderboard, flags, quests; session stores all stats and metrics. |

**Mode is chosen at session creation.** If the moderator needs a different mode later, they **clone the workshop session** and go through the wizard again to select the new mode. Sessions are immutable for mode; clone preserves history and allows a new session with the same or different template/labs.

---

## 3. Workshop Session Lifecycle

- **Start a new workshop session:** Moderator can start **multiple** workshop sessions. "Start new workshop session" opens a **wizard** (step-by-step).
- **Wizard steps (target):**
  1. **Customer & context:** Customer name, Salesforce workload name, technical champion name and email, current database used.
  2. **Mode & tech:** Pick mode (Demo / Lab / Challenge), target programming language (Python, Node, Java), default DB for labs (default: **local MongoDB Community**). Each lab is responsible for spinning up the database service it needs and cleaning it up afterwards.
  3. **Content selection:** Choose by **predefined template** (industry: e.g. Retail, FSI, Automotive; or use case: e.g. analytics, high availability) **or** select **specific labs**. Templates are fixed; editing is done with caution (see §5). User can **combine topics** (e.g. Encryption + Analytics); when selecting labs, **all steps within each chosen lab** are always included (no partial labs).
- **Session storage:** All stats and metrics for the session are stored with the session. Moderator can **delete older sessions** when no longer needed.
- **Clone session:** To change mode (or other wizard choices), moderator clones the workshop session and runs the wizard again with the new options; the new session gets a new ID and stores its own stats.

---

## 4. Data Storage: Central vs Per-Session

| Data | Stored where | Rationale |
|------|--------------|------------|
| **Predefined workshop templates** and **all workshop template metadata** | **MongoDB Atlas** (obfuscated URI) | Reused across sessions and visible to more than a single workshop attendee; central source of truth. |
| **Workshop session data** (session id, customer, date, mode, template ref, stats, metrics, leaderboard) | **Provided MongoDB URI** (default: **local MongoDB**) | Data belongs to that workshop/user session only; can be local or tenant-specific. |

- **Predefined templates** are only changed by **editing the existing template**, and must be done with caution.
- Anything that is **reused or seen by more than the workshop attendee** (e.g. templates, shared playbooks) → **central (Atlas)**.
- Anything that is **per workshop user session** → **session store (provided URI, default local)**.

---

## 5. Templates and Lab Selection

- **Predefined templates** are stored in Atlas and keyed by industry segment (e.g. Retail, FSI, Automotive) or use case (e.g. analytics, high availability). They are fixed; moderator can pick one when creating a session.
- Moderator can **instead (or in addition)** select **specific labs**. It must be possible to **combine labs from different topics** (e.g. Encryption + Analytics). When a lab is selected, **all steps of that lab** are included (no partial lab).
- The **presentation and demo** must **adapt to what is selected**: intro and key concepts should reflect the chosen template/labs. Key concepts view must show **side-by-side: MongoDB vs competitor** so the value is clear.

---

## 6. Dynamic Presentation and Key Concepts

- A workshop typically starts with an **intro** where the SA explains **key concepts** for the selected topic/labs.
- **Key concepts** must be shown **side-by-side: how MongoDB does it vs how the competitor does it**, so attendees see the difference immediately.
- The content (intro, key concepts, steps) must **adapt to the selected template and labs** (dynamic, not one-size-fits-all).

---

## 7. Labs and Database

- **Default for labs:** Local MongoDB Community when a database is needed for lab steps.
- **Each lab** that requires a DB should **manage spinning up the database service** and **cleaning it up afterwards** (e.g. via scripts or Docker Compose per lab).
- Session wizard allows overriding the default DB (e.g. Atlas connection string) when needed.

---

## 8. CSFLE / Queryable Encryption Lab Structure

- Keep the **current class/component structure** used in this branch (e.g. `Lab1CSFLE`, `Lab2QueryableEncryption` where they are still used).
- Align **editors and all CSFLE/queryable lab behavior** with these principles: content-driven steps, enhancementId-based code blocks, side-by-side competitor in Demo mode, and consistent use of templates and session storage. Where possible, route through the same content-driven LabRunner and StepView used by other POVs so that CSFLE/QE labs benefit from the same quality bar and dynamic presentation.

---

## 9. Critical Review Checklist (15 POVs)

When auditing the 15 POVs for quality and engagement:

- [ ] **Demo:** Key concepts and code show MongoDB vs competitor side-by-side; no missing competitor panel where applicable.
- [ ] **Lab:** Every step that should show code has `enhancementId` and a matching enhancement with code blocks and tips; 3–5 hints per step where appropriate.
- [ ] **Challenge:** Challenge skeletons and scoring work; session metrics and leaderboard persist.
- [ ] **Narratives:** 2–4 sentences per step; keyConcepts 4+; prerequisites and dataRequirements where needed.
- [ ] **Query & Search:** Text-search (and rich-query) labs are fully working: enhancements loaded, steps render code, verification wired if applicable.

Use **ADD_LAB_MASTER_PROMPT.md** and **VALIDATE_LABS_MASTER_PROMPT.md** (including validate-by-topic-and-lab) to close gaps and keep the bar consistent.
