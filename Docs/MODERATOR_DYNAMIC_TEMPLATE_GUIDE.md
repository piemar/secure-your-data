# Moderator Guide: Dynamic Workshop Template Builder

This guide explains how workshop moderators use the **Dynamic Template Builder** to configure topics, capabilities, lab bundles, modes, and POV coverage—and how each feature works.

---

## 1. Dynamic Topic Selection with Capability Coverage Visualization

**What it is:** The top level of the workshop is the **topic**. You choose one or more MongoDB topics (e.g. Encryption, Analytics, Scalability). Each topic is linked to **POV capabilities** (proof points from `POV.txt`).

**How the moderator uses it:**

1. In **Step 1: Select Topics**, you see all available topics (Encryption, Analytics, Scalability, Operations, Data Management, Security, Integration, Deployment).
2. Select the topics you want to cover in this workshop (e.g. only **Encryption**, or **Encryption** + **Security**).
3. In **Step 2: Review Capabilities**, you see which **POV capabilities** are covered by your topic selection:
   - **Covered**: capabilities that at least one selected topic (and its labs) addresses.
   - **Uncovered**: capabilities from the full POV set that your selection does not yet cover.
4. Capabilities are grouped by category (query, security, scalability, analytics, operations, data-management, integration, deployment). This helps you decide if you need to add another topic or if your current set is enough for your audience.

**Why it matters:** You can align the workshop to sales/technical proof points (POV) and see coverage at a glance before committing to labs.

---

## 2. Topic–Lab Bundles (Select Topic, Then Configure What’s in the Bundle)

**What it is:** For each topic, the app has a **bundle of labs**. For example, the **Encryption** topic bundles: CSFLE Fundamentals, Queryable Encryption, and Right to Erasure. The **top level is the topic**; under it you choose **which labs in the bundle** are included.

**How the moderator uses it:**

1. After selecting topics (Step 1) and reviewing capabilities (Step 2), you go to **Step 3: Select Labs**.
2. You see one **card per selected topic** (e.g. “Encryption”, “Security”). Each card lists the **labs in that topic’s bundle**.
3. By default, **all labs in the bundle are included** (all checkboxes checked). You can:
   - **Uncheck** a lab to **exclude it** from the workshop (e.g. include only CSFLE and QE, exclude Right to Erasure).
   - Use **All** / **None** to include or exclude the whole bundle for that topic.
4. You cannot add labs from a topic you did not select; lab choice is **topic-based**. Order is preserved by topic and prerequisites.

**Why it matters:** Topics with several labs (e.g. CSFLE/QE) are selected as one topic, then you configure exactly what in that bundle is included—no need to manage unrelated labs from other topics.

---

## 3. Hybrid Lab Selection (Auto-Suggested with Manual Override)

**What it is:** Labs are **suggested by the system** (from the topic bundles) but you **override** by including/excluding labs in each bundle.

**How the moderator uses it:**

1. **Auto-suggested:** When you move from Step 2 to Step 3, the builder **defaults to the full bundle** for each selected topic (all labs in that topic are selected). The system also orders labs by prerequisites and difficulty where relevant.
2. **Manual override:** In Step 3 you **uncheck** labs you don’t want (e.g. drop “Right to Erasure”) or use **None** for a topic and then re-enable only the labs you want. So the “suggestion” is “full bundle”; the “override” is your include/exclude choices per topic.

**Why it matters:** You get a safe default (full topic coverage) with full control to shorten or focus the workshop.

---

## 4. Mode Configuration (Demo / Lab / Challenge) with Preview

**What it is:** You set the **default mode** and **allowed modes** for the workshop, and see a short **preview** of how each mode behaves with your selected labs.

**How the moderator uses it:**

1. In **Step 4: Configure Modes** you set:
   - **Default mode:** Demo, Lab, or Challenge (what attendees see when they open the workshop).
   - **Allowed modes:** Which of the three are available (e.g. only Lab + Demo, or all three).
   - **Gamification:** On/off (points, achievements, leaderboard).
   - **Industry** (optional): e.g. retail, healthcare.
2. **Mode preview** (when labs are selected) shows per mode:
   - How many labs are available in that mode.
   - How many steps total.
   - A short description of the mode (e.g. “Presentation-focused”, “Full hands-on”, “Story-driven with quests and flags”).

**Why it matters:** You can lock the workshop to “demo only” for a sales pitch or enable “lab + challenge” for a technical deep-dive without changing topic/lab selection.

---

## 5. Template Validation (Prerequisites, Mode Compatibility)

**What it is:** Before the template is applied, the system **validates** it (e.g. all labs exist, prerequisites and mode compatibility are respected).

**How the moderator uses it:**

1. When you click **Generate Template** (Step 5), the builder:
   - Checks that every selected lab exists and belongs to a selected topic.
   - Ensures prerequisite labs are included where required.
   - Checks that labs support the chosen **allowed modes** (e.g. if a lab is demo-only, it won’t be offered in challenge mode).
2. If validation fails, you see **errors** (e.g. “Missing prerequisite lab X”). You then go back to Step 3 (labs) or Step 4 (modes) and fix the selection.
3. **Warnings** (e.g. “Lab X has no steps for demo mode”) may be shown without blocking; the template can still be used.

**Why it matters:** Prevents broken or inconsistent workshops (e.g. a lab that requires another lab that wasn’t included).

---

## 6. POV Capability Mapping (57 Capabilities Mapped to Labs/Topics)

**What it is:** The app has a fixed set of **57 POV capabilities** (from `POV.txt`), each with an id, label, description, and category. **Topics** and **labs** declare which of these they cover (e.g. `ENCRYPT-FIELDS`, `FLE-QUERYABLE-KMIP`). The builder uses this to show **coverage** and to **suggest/filter** content.

**How the moderator uses it:**

1. **Step 2 – Capability coverage:** After selecting topics, you see how many POV capabilities are **covered** vs **total**, and which are covered/uncovered by category. This is driven by the mapping: topic + its labs → list of POV capability IDs.
2. **Step 3 – Lab cards:** Each lab can show how many POV capabilities it covers (e.g. “3 POV” badge), so you can prioritize labs that cover the proof points you need.
3. **Filtering/sorting:** Internally, the system can suggest labs by topic and by capability; the UI surfaces this as “topic bundles” and “capability coverage” rather than raw capability IDs.

**Why it matters:** You can design a workshop that explicitly maps to POV proof points and see gaps (e.g. “we’re not covering any ‘query’ capabilities”) before finalizing.

---

## Quick Reference: Builder Steps

| Step | Purpose |
|------|--------|
| **1. Topics** | Select one or more topics (top level). |
| **2. Capabilities** | Review POV coverage (covered vs uncovered by category). |
| **3. Labs** | For each selected topic, choose which labs in the bundle to include (default: all). |
| **4. Modes** | Set default mode, allowed modes, gamification, industry; preview per mode. |
| **5. Review** | Optional name/description; generate template; validation runs automatically. |

---

## Topic → Bundle → Labs Summary

- **Top level = topic.** You select topics first.
- **Each topic has a bundle of labs** (e.g. Encryption → CSFLE, QE, Right to Erasure).
- You **configure what in the bundle is included** by checking/unchecking labs in Step 3.
- You do **not** add labs from topics you didn’t select; everything is topic-based with optional exclude within the bundle.

This keeps the flow simple: choose topics → see capabilities → refine labs per topic → set modes → generate and validate.
