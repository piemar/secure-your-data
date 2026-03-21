---
name: Thematic Bundles Status and Next Steps
overview: Clarifies that only two of the six suggested thematic bundles (Stop the Leak, Harden the System) are implemented as quests; the other four exist only as suggestions in the plan. Provides concrete steps to test the full implementation end-to-end and, optionally, to build one additional quest (e.g. Data & Query Power) as a complete example.
todos: []
isProject: false
---

# Thematic Bundles: What's Implemented and What to Do Next

## 1. Have the 2.1 suggested thematic bundles been implemented?

**Only two of the six** suggested thematic bundles from [Docs/COMPLETE_WORKSHOP_VISUAL_AND_POV_PLAN.md](Docs/COMPLETE_WORKSHOP_VISUAL_AND_POV_PLAN.md) Part 2.1 are implemented as real quests:

| Bundle (from plan) | Implemented? | Where |
|--------------------|--------------|--------|
| **Stop the Leak** | Yes | [src/content/quests/stop-the-leak.ts](src/content/quests/stop-the-leak.ts): storyContext, labIds (csfle-fundamentals, queryable-encryption), required/optional flags, labContextOverlays. POV badges come from those labs (ENCRYPTION, ENCRYPT-FIELDS, etc.). |
| **Harden the System** | Yes | [src/content/quests/harden-the-system.ts](src/content/quests/harden-the-system.ts): storyContext, labIds (lab-right-to-erasure), flags (proper-indexes, access-control-audit, query-optimization). |
| **Resilience & Recovery** | No | No quest file or template references. |
| **Scale & Performance** | No | No quest file. |
| **Data & Query Power** | No | No quest file. |
| **Deploy & Migrate** | No | No quest file. |

So: the **UI and wiring** (visual story intro, POV badges, solo/collaborative scoring, Game Day) are implemented; the **content** for bundles 3–6 (new quest definitions, narratives, and template wiring) was never added. The plan’s Part 2.3 called that out as a “deliverable” (narrative spec and future content), not something already in code.

---

## 2. What to do next: test one quest end-to-end

To **actually test the full implementation** with the existing quests:

### 2.1 Run the app and open the challenge

- Start the app (e.g. `npm run dev`).
- In Workshop Settings, select a template that has quests: **Retail Data Breach Simulation** (it uses `quest-stop-the-leak` and `quest-harden-the-system`).
- Ensure a session is created with mode that allows Challenge (e.g. Challenge or Lab).
- Open the **Challenge** view (or the view that shows the selected challenge template).

### 2.2 Walk through the story intro and journey

- Confirm the **hero** (title, description, optional “Game Day” badge) and **sectioned story** (e.g. The Incident, The Stakes, Your Mission) render from the template’s `storyIntro`.
- Confirm the **journey stepper** (Intro → Quest 1 → Quest 2 → Complete) and **mission objectives** cards (one per quest, Done / Not started) appear and match the two quests.

### 2.3 Run one quest and capture flags

- Select the **Stop the Leak** quest tab.
- Check **Mission Brief** and **“What you’ll prove”** POV badges (should list POVs from the quest’s labs, e.g. ENCRYPTION, ENCRYPT-FIELDS).
- Run the quest’s labs (e.g. CSFLE Fundamentals, Queryable Encryption) in the embedded lab runner; complete steps as needed.
- Use **Capture Flag** on the required (and optional) flags. If the template has collaborative scoring (Retail Data Breach does), after verification succeeds you should see **Solo / With team**; choose one and confirm points/toast.
- Complete the quest (all required flags), then switch to **Harden the System** and repeat if desired.
- When both quests are done, confirm the **story outro** appears.

### 2.4 Prerequisites for a meaningful test

- **MongoDB URI** configured in Lab Setup (needed for running lab steps and for flag verification).
- **Verification** for the flags in [src/content/flags/encryption-flags.ts](src/content/flags/encryption-flags.ts) must be implemented in `VerificationService` for “Capture Flag” to succeed; if any flag’s `verificationId` is missing or stubbed, that flag will not verify. Check [src/services/verificationService.ts](src/services/verificationService.ts) for the IDs used by the encryption flags.

If you hit a “no challenge template” or missing flags/labs, confirm the template’s `questIds` and each quest’s `labIds` / `requiredFlagIds` match the content service’s registered quests and flags (see [src/services/contentService.ts](src/services/contentService.ts) for which quests and flags are loaded).

---

## 3. Optional: build one more quest as a full implementation

To **build and try one additional thematic bundle** end-to-end (e.g. **Data & Query Power**), you would:

1. **Pick a theme and labs**  
   Use “Data & Query Power” (RICH-QUERY, GRAPH, TEXT-SEARCH, GEOSPATIAL, TIME-SERIES). Choose 1–2 existing labs that already have matching `povCapabilities` (e.g. from [src/content/topics/query](src/content/topics/query) or analytics/timeseries).

2. **Add the quest definition**  
   Create e.g. `src/content/quests/data-query-power.ts`: `id`, `title`, `storyContext` (situation + what we prove + success criteria), `objectiveSummary`, `labIds`, `requiredFlagIds`, `optionalFlagIds`, `modes`, and optional `labContextOverlays`.

3. **Define or reuse flags**  
   Either reuse existing flags tied to those labs’ verification (if any) or add new flags in a content flags file and implement (or stub) their `verificationId` in `VerificationService`.

4. **Register the quest**  
   Add the new quest to the content service’s quest list in [src/services/contentService.ts](src/services/contentService.ts) (same pattern as `stopTheLeakQuest` / `hardenTheSystemQuest`).

5. **Wire into a template**  
   Either add the new quest to an existing template’s `questIds` (e.g. a “Query & Analytics” template) or create a small template that uses only this quest for a focused test.

6. **Test**  
   Run the app, select that template, open Challenge mode, and go through story intro, quest Mission Brief, POV badges, labs, and flag capture (solo/collaborative if enabled).

That would give you **one full implementation** of a third thematic bundle and a repeatable pattern for the remaining ones (Resilience & Recovery, Scale & Performance, Deploy & Migrate).

---

## 4. Summary

- **Implemented:** Only **Stop the Leak** and **Harden the System** (first two rows of the plan’s 2.1 table). The other four bundles are not implemented as quests.
- **To test:** Use Retail Data Breach Simulation in Challenge mode; walk story intro, journey, mission objectives, then complete Stop the Leak (and optionally Harden the System) including labs and flag capture (Solo/With team); confirm outro. Ensure MongoDB and flag verification are configured.
- **To build one more:** Add a new quest file (e.g. Data & Query Power), reuse or add flags and verification, register the quest, add it to a template, then test the same flow.
