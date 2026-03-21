---
name: Visual Story & POV Quest Plan
overview: A detailed plan for making the Story intro and mission more visual, mapping POV proofs to quest narratives (with bundled quests), and recommending that labs stay as a single library with mode-based presentation.
todos: []
isProject: false
---

# Visual Story Intro, POV-to-Quest Narrative, and Lab Setup

## 1. Making Story Intro and Mission More Visual

**Current state:** Story intro and mission are shown in [ChallengeModeView.tsx](src/components/workshop/ChallengeModeView.tsx) as a single Card with markdown-rendered `template.storyIntro`. Quest mission is in [QuestOverview.tsx](src/components/workshop/QuestOverview.tsx) as a "Mission Brief" block (muted box + `quest.storyContext`).

**Proposed visual enhancements:**

- **Story intro (challenge-level)**
  - **Hero section:** Full-width or prominent header with challenge title, optional tagline, and a subtle background (gradient, pattern, or themed illustration) so it feels like a "briefing" rather than a plain card.
  - **Structured sections with icons:** Render story intro as sections (e.g. "The Incident", "The Stakes", "Your Mission") each with a small icon (e.g. AlertTriangle, Target, Shield) and optional collapsible "Read more" for long text.
  - **Mission objectives as visual list:** Replace or supplement the numbered list in markdown with a row of objective cards or badges (one per quest) with short labels and optional progress (e.g. "Quest 1: Stop the Leak — Not started").
  - **Optional:** A simple "journey" stepper or timeline at the top (e.g. Intro → Quest 1 → Quest 2 → Complete) so the overall flow is visible at a glance.
- **Mission (quest-level)**
  - **Mission Brief card:** Keep the Mission Brief but give it a clearer visual hierarchy: icon, title "Mission Brief", and `storyContext` with improved typography (e.g. slightly larger lead paragraph, bullet styling).
  - **"What you'll prove" strip:** Add an optional list of **POV capabilities** (from the quest or its labs) as small badges/chips (e.g. "ENCRYPTION", "RBAC") so participants see which proofs they're working toward—directly mapped from [Docs/POV.txt](Docs/POV.txt).
  - **Quest progress:** Already present; consider a compact visual (e.g. circular or bar) next to the quest title so completion is visible without opening the tab.

**Implementation notes:** No new data model is strictly required. `storyIntro` and `storyOutro` stay as markdown; optional `template.storyIntroSections` or a convention (e.g. `## Section Name` in markdown) could drive icon + section rendering. POV badges on the quest would come from a small utility that collects `povCapabilities` from the quest’s labs (existing on lab definitions).

---

## 2. POV-to-Quest Mapping and Narrative

[Docs/POV.txt](Docs/POV.txt) lists **57 PoV proofs** (e.g. RICH-QUERY, FLEXIBLE, ENCRYPTION, RBAC, TIME-SERIES). The codebase already tags labs with `povCapabilities` (e.g. [lab-queryable-encryption](src/content/topics/encryption/queryable-encryption/lab-queryable-encryption.ts): `ENCRYPT-FIELDS`, `FLE-QUERYABLE-KMIP`, `ENCRYPTION`). The idea is to **bundle POVs into thematic quests** and write **narratives that map to those POVs**, so each quest clearly states "what we're proving" in SA terms.

**Suggested thematic bundles (aligned with POV labels and existing labs):**


| Quest theme                            | Example POVs (from POV.txt)                                                        | Example narrative angle                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Stop the Leak** (encryption)         | ENCRYPTION (21), ENCRYPT-FIELDS (46), FLE-QUERYABLE-KMIP (54)                      | "Prove field-level and queryable encryption so PII is never plaintext."                                |
| **Harden the System** (access & audit) | RBAC (22), AUDITING (24), SCHEMA (20)                                              | "Prove access control and auditing so only authorized services access data and actions are traceable." |
| **Resilience & Recovery**              | AUTO-HA (17), FULL-RECOVERY-RPO (13), FULL-RECOVERY-RTO (14), ROLLING-UPDATES (12) | "Prove the platform can recover from failure and apply patches with minimal downtime."                 |
| **Scale & Performance**                | SCALE-OUT (07), SCALE-UP (08), WORKLOAD-ISOLATION (05), INGEST-RATE (03)           | "Prove we can scale and isolate analytics from live traffic."                                          |
| **Data & Query Power**                 | RICH-QUERY (01), GRAPH (26), TEXT-SEARCH (36), GEOSPATIAL (30), TIME-SERIES (53)   | "Prove expressive queries, graph, search, and time-series without full scans."                         |
| **Deploy & Migrate**                   | AUTO-DEPLOY (11), MIGRATABLE (09), PORTABLE (10)                                   | "Prove we can deploy and migrate across environments with minimal downtime."                           |


**Narrative pattern per quest:** Start with a **situation** (customer/context), state **what must be proved** (using POV labels in plain language), then **success criteria** (flags). Example for **Stop the Leak** (already close to current copy):

- **Situation:** Post-breach; PII in plaintext.  
- **What we prove:** Ability to provide **field-level and queryable encryption** (ENCRYPTION, ENCRYPT-FIELDS, FLE-QUERYABLE-KMIP) so sensitive data is never exposed at rest or in logs.  
- **Success criteria:** All PII encrypted; no plaintext leakage; flags X, Y captured.

**Deliverable:** A short **narrative spec** (or doc) that:

- Lists 5–8 **quest bundles** with their POV IDs and labels from POV.txt.
- For each bundle, provides 2–4 sentences of **story context** and "What you'll prove" bullets.
- References existing quests (e.g. `quest-stop-the-leak`, `quest-harden-the-system`) where they already align, and suggests new quest names for new bundles (e.g. "Resilience & Recovery", "Data & Query Power") for future content.

---

## 3. Should We Keep Labs as They Are?

**Recommendation: Yes — keep the labs in the current setup.**

- **Single lab library:** Keep one set of lab definitions (steps, enhancements, code blocks, `povCapabilities`) in `src/content/topics/...`. No duplication.
- **Mode-based presentation:** In **Challenge** mode, use **expertSkeleton** (or future **brokenCode** / objective-only) so the *experience* is "solve the problem" rather than "fill in the blanks." In **Lab** (guided) mode, keep the current skeleton + hints. Same lab, different UI/UX by mode.
- **Quests reuse labs:** Quests reference labs via `labIds` and add **quest-specific narrative** via `labContextOverlays` (intro/outro, title override). That stays as-is; no need to duplicate labs per quest.
- **POV mapping:** Continue tagging labs with `povCapabilities`; aggregate at quest level for "What you'll prove" and for narrative consistency with POV.txt.

This matches the "Quest / Challenge as the primary understanding path" from [Docs/LEARNING_FIRST_LAB_ALTERNATIVES_PLAN.md](Docs/LEARNING_FIRST_LAB_ALTERNATIVES_PLAN.md): same content, better presentation and narrative in challenge mode.

---

## 4. Implementation Order (High Level)

1. **Visual story intro/mission (UI only):** Add hero/styling and optional sectioned layout for `storyIntro`; add POV badges to quest Mission Brief; small tweaks to typography and progress display.
2. **POV narrative doc:** Write the narrative spec that maps POV.txt to quest bundles and provides copy for story context and "What you'll prove."
3. **Content:** Optionally add or adjust quests and template `storyIntro`/`storyOutro` to use the new narrative; ensure new quests reference the right labs and POVs.
4. **Challenge-mode content (existing direction):** Add or fill in `expertSkeleton` (or objective/brokenCode) for key labs so challenge mode feels genuinely "solve it" rather than fill-in-blank.

---

## 5. Summary

- **Visual:** Story intro gets a more visual treatment (hero, sections, mission objectives, optional journey stepper); quest mission gets clearer hierarchy and POV capability badges.
- **Narrative:** A dedicated narrative spec maps POV.txt to bundled quests and provides reusable story context and "What you'll prove" text per quest.
- **Labs:** Keep the current lab setup; differentiate learning via mode (challenge vs guided) and narrative (quest overlays + POV framing), not by duplicating labs.

