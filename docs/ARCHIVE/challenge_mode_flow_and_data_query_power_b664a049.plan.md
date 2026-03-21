---
name: Challenge Mode Flow and Data Query Power
overview: Fix why quests and Challenge Mode fail (mode vs section mismatch, no way to choose "Challenge" when selecting a template), add a clear admin path to start a session by theme, align thematic bundles with POV.txt, and focus on making Data and Query Power the first fully working theme-based flow.
todos: []
isProject: false
---

# Challenge Mode Flow Fix and Data & Query Power Focus

## Critical analysis: why quests don't work

### 1. Mode vs section mismatch (main bug)

Challenge content is only shown when **both** are true:

- `currentMode === 'challenge'`
- `activeTemplate?.questIds?.length > 0`

When you select a template in Workshop Management (e.g. "Rich Query Workshop" or a custom one), the app calls `setActiveTemplate(template)`. In [WorkshopSessionContext.tsx](src/contexts/WorkshopSessionContext.tsx) (lines 85–89), that **always sets `currentMode` to `template.defaultMode`**. Predefined templates use `defaultMode: 'lab'`, so after selection **currentMode becomes `'lab'`**.

When you then click **Challenge Mode** in the sidebar, the app only changes the **section** (what’s on screen), not the **mode**. So you’re still in `currentMode === 'lab'`, and the condition above fails. Result: "Challenge Mode Not Available" even when the template has quests. That explains “first time loading shows something but not the following times” if at any point mode was `'challenge'` (e.g. from a previous session or wizard), then got reset to `'lab'` when a template was selected.

**Fix:** Treat “user is in the Challenge section” as intent to see challenges. If `activeTemplate?.questIds?.length > 0`, show quest content (QuestMapView or ChallengeModeView) **without requiring `currentMode === 'challenge'`**. Optionally, when entering the Challenge section with a template that has quests, set `currentMode` to `'challenge'` so the rest of the app stays consistent.

### 2. No way to choose “Challenge” when selecting a template

Today there is no “start in Challenge mode” when you pick a template. The template’s `defaultMode` is applied and there’s no mode switcher in Workshop Management.

**Fix:** When the user applies a template that has `questIds` (e.g. “Use selected” or “Use selected (1)” in [WorkshopSettings.tsx](src/components/settings/WorkshopSettings.tsx) / ContentBrowser), offer a choice: **“Use as Lab”** vs **“Use as Challenge”**, and call `setMode('lab')` or `setMode('challenge')` (and `setActiveTemplate`) accordingly. That makes “I want to run this as a challenge” explicit.

### 3. Custom template and “combined” template

- **Build Custom Template:** [templateGeneratorService.ts](src/services/templateGeneratorService.ts) already calls `suggestQuestsForLabs(labIds)` and sets `questIds` when the suggested list is non-empty. So custom templates *can* have quests if the chosen labs overlap with a quest (e.g. Data & Query Power).
- **Combined template:** In [WorkshopSettings.tsx](src/components/settings/WorkshopSettings.tsx) (lines 643–649), when combining multiple templates the built object has only `labIds` and `defaultMode`; **questIds are not set**. So “Combine workshops” always produces a template with no quests. Combined template should either preserve questIds from the first selected template or merge quest IDs from all selected templates (and optionally show a warning if quest sets conflict).

### 4. First load vs subsequent (QuestMapView vs ChallengeModeView)

In [Index.tsx](src/pages/Index.tsx) (case `'challenge'`), logic is:

- If `selected_quest_id` is in localStorage → render **ChallengeModeView**
- Else → render **QuestMapView**

So the first time you open Challenge you see the quest map; after you click a quest, `selected_quest_id` is set and you see ChallengeModeView. On later visits, if `selected_quest_id` is still set, you go straight to ChallengeModeView. That’s consistent. The real failure is the `currentMode === 'challenge'` check preventing both views from rendering. Fixing (1) fixes this.

---

## POV.txt and thematic bundles (alignment)

[Docs/POV.txt](Docs/POV.txt) lists 57 proofs. The plan’s “Data & Query Power” bundle maps to:

- **RICH-QUERY (1), TEXT-SEARCH (36), GEOSPATIAL (30), GRAPH (26), TIME-SERIES (53)**  
plus optional: **JOINS (32), IN-PLACE-ANALYTICS (4), AUTO-COMPLETE (37)**.

Existing quest `quest-data-query-power` uses labs that cover RICH-QUERY and TEXT-SEARCH. That’s a correct subset. No need to rename to “Data & Query Performance”; “Data & Query Power” already matches the plan and POV labels. For a focused first implementation we keep this quest and ensure the flow works; later you can add labs for GRAPH, GEOSPATIAL, TIME-SERIES and extend the same quest or add sub-quests.

Other thematic bundles (Stop the Leak, Harden the System, Resilience & Recovery, Scale & Performance, Deploy & Migrate) remain as in the plan; no change to POV numbering or categorization is required.

---

## Best approach for workshop admin (start by theme)

**Option A – “Start by theme” (recommended)**  
In Workshop Management (or Session Management), add a short **“Start challenge by theme”** block:

- List **thematic bundles** that have at least one template/quest: e.g. **Retail Data Breach**, **Data & Query Power**.
- Each row: theme name, short description, one button: **“Use this challenge”**.
- Action: set the corresponding template (e.g. Retail Data Breach Simulation or Rich Query Workshop) as active and set mode to `'challenge'`, then optionally switch to Challenge section or open the first quest.

This gives a single place to “start a session based on different themes” without explaining templates or questIds.

**Option B – “Use as Lab” / “Use as Challenge” on template select**  
When the user selects a single template that has `questIds`, show two actions: **“Use as Lab”** and **“Use as Challenge”**. “Use as Challenge” sets template and `setMode('challenge')`. No new “themes” list; reuse existing template list and add the mode choice.

**Recommendation:** Do **both**: (1) Fix the Challenge section so it shows quest content when template has quests (and optionally set mode when entering). (2) Add “Use as Lab” / “Use as Challenge” when applying a template that has quests. (3) Add a small “Start challenge by theme” list (Data & Query Power, Retail Data Breach) that applies the right template and mode. That covers both “pick a template then choose mode” and “pick a theme and go.”

---

## Implementation plan (focus: Data & Query Power)

### Phase 1 – Fix Challenge Mode so quests work

1. **Challenge section no longer requires `currentMode === 'challenge'` when template has quests**
  In [Index.tsx](src/pages/Index.tsx), in the `case 'challenge'` block, change the condition from:
  - `currentMode === 'challenge' && activeTemplate?.questIds && activeTemplate.questIds.length > 0`
   to:
  - `activeTemplate?.questIds && activeTemplate.questIds.length > 0`
   so that whenever the user is in the Challenge section and the active template has quests, show QuestMapView or ChallengeModeView (depending on `selected_quest_id`). Optionally, when entering this branch, call `setMode('challenge')` so the rest of the app (sidebar, etc.) reflects challenge mode.
2. **Optional: set mode when entering Challenge section**
  In the same place, when we decide to show QuestMapView or ChallengeModeView, ensure mode is set to `'challenge'` (e.g. via an effect or one-time setMode) so that future logic and sidebar state are consistent.

### Phase 2 – “Use as Lab” / “Use as Challenge” when selecting a template

1. **ContentBrowser / WorkshopSettings: when applying a template that has questIds, show two actions**
  Where “Use selected (1)” (or single-template apply) is used, if the selected template has `questIds` and `questIds.length > 0`, show:
  - **“Use as Lab”** → `setActiveTemplate(template)` (keeps defaultMode, usually lab).
  - **“Use as Challenge”** → `setActiveTemplate(template)` and `setMode('challenge')`.  
   Implement in [WorkshopSettings.tsx](src/components/settings/WorkshopSettings.tsx) (and any shared ContentBrowser callback) so the choice is clear and only appears for quest-capable templates.

### Phase 3 – Start challenge by theme (Data & Query Power first)

1. **“Start challenge by theme” block**
  Add a small section (e.g. in Workshop Management or Workshop Session Management) listing at least:
  - **Data & Query Power** → uses template “Rich Query Workshop” (or a dedicated single-quest template), set template + `setMode('challenge')`, then e.g. switch to Challenge section or set `selected_quest_id` to the Data & Query Power quest so ChallengeModeView opens directly.
  - **Retail Data Breach** → uses “Retail Data Breach Simulation”, same pattern.
   Use the existing templates and quests; no new content model. This is the “easily start a session based on different themes” path.

### Phase 4 – Data & Query Power robustness and discovery

1. **Ensure Rich Query Workshop is clearly a challenge option**
  Confirm [rich-query-workshop.ts](src/content/workshop-templates/rich-query-workshop.ts) has `questIds: ['quest-data-query-power']`, `storyIntro`, and `storyOutro`. Ensure [data-query-power.ts](src/content/quests/data-query-power.ts) and its flags are registered and that verification IDs for the flags exist in VerificationService. No POV or thematic re-categorization needed; keep “Data & Query Power” as the theme name.
2. **Combined template and questIds**
  When building the combined template in WorkshopSettings (multi-select then “Use selected”), set `questIds` on the combined template (e.g. union of all selected templates’ `questIds`, or from the first template) so that combining two challenge templates doesn’t produce a template with no quests.

### Phase 5 – Documentation and testing

1. **Short doc or in-app hint**
  In Workshop Settings or README, document: “To run a challenge, select a template that includes quests (e.g. Rich Query Workshop or Retail Data Breach Simulation) and use ‘Use as Challenge’ or ‘Start challenge by theme’ so the session starts in Challenge mode.”
2. **Manual test flow for Data & Query Power**
  - Select “Data & Query Power” from “Start challenge by theme” (or Rich Query Workshop + “Use as Challenge”).
  - Open Challenge Mode in the sidebar.
  - Confirm story intro, quest “Data & Query Power”, Mission Brief, POV badges, labs (Rich Query Basics, Text Search Basics), and flags.
  - Complete at least one flag and confirm verification and progress.

---

## Summary


| Issue                                                | Root cause                                                                                                     | Fix                                                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Quests “not working” / “first time only”             | Challenge content gated on `currentMode === 'challenge'`; selecting a template sets mode to defaultMode (lab). | Show challenge content when template has quests, regardless of currentMode; optionally set mode to challenge when entering Challenge section. |
| No way to select Challenge when selecting a workshop | No “Use as Challenge” action.                                                                                  | Add “Use as Lab” / “Use as Challenge” when applying a template that has questIds.                                                             |
| Combined template has no quests                      | Combined template object omits questIds.                                                                       | Set questIds on combined template (e.g. merge from selected templates).                                                                       |
| Admin “start by theme”                               | Themes (quest bundles) not exposed in UI.                                                                      | Add “Start challenge by theme” with at least Data & Query Power and Retail Data Breach.                                                       |


POV.txt and thematic bundles are already aligned; Data & Query Power (RICH-QUERY, TEXT-SEARCH, etc.) is the right name and scope. Implementation focus: fix the Challenge flow, add explicit “Use as Challenge” and “Start by theme,” then validate end-to-end with Data & Query Power.