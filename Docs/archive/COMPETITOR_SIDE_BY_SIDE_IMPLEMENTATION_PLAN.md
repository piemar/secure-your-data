# Competitor Side-by-Side Implementation Plan

This document describes what needs to be done to support **side-by-side competitor code** in demo mode: per-step comparison (MongoDB vs selected competitor), configurable default and dropdown to switch competitor, and lab-creation support for generating and specifying competitor code (e.g. PostgreSQL, Cosmos DB VCore, DynamoDB) via the ADD_LAB_MASTER_PROMPT flow.

It aligns with **COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md §5.2** (Side-by-Side MongoDB vs PostgreSQL, Demo Presenter Mode Only) and extends it to **multiple competitors** and **lab-creation workflow**.

---

## 1. Current State (Analysis Summary)

### 1.1 Demo mode and lab steps

- **Demo mode** is when `currentMode === 'demo'` (WorkshopSessionContext). In that case, **Index.tsx** renders **DemoScriptView** (script beats on the left, beat details on the right). Clicking **"Go to Lab"** sets `currentLabId` and switches section to `'lab'`, so the user then sees the **lab** (LabRunner → LabViewWithTabs → **StepView**).
- **StepView** renders each step’s code in **InlineHintEditor** (Monaco). It does **not** receive `currentMode` or `isModerator` today; **LabViewWithTabs** and **LabRunner** do not pass them. So the condition “demo + moderator” cannot be enforced in StepView yet.
- **Plan §5.1** is already reflected: in demo mode the UI shows full solution with no hint markers (content/behavior is correct); **§5.2** (side-by-side competitor view) is **not implemented**.

### 1.2 Competitor comparison today

- **WorkshopCompetitorScenario** (and **WorkshopCompetitorImplementation**) exist in **src/types/index.ts**. Scenarios are **lab-scoped** with optional **stepId**; each competitor has **codeSnippets** (array of `language`, `code`, `description`) and **painPoints**.
- **ContentService** has **getCompetitorScenariosForLab(labId)**; scenarios are registered in **contentService** (e.g. `encryption-comparison.ts`, `queryable-encryption-comparison.ts`).
- **CompetitorComparisonView** (tabs: MongoDB | RDBMS | DocumentDB, with descriptions and code snippets) exists but is **never used** in the app (not imported in Index or any page). So it’s a standalone component, not wired into the step-by-step demo flow.
- **WorkshopTemplate** has **includeCompetitorComparisons?: boolean** but no code path uses it to show competitor content next to steps.

### 1.3 Enhancement metadata

- **src/labs/enhancements/schema.ts**: **CodeBlockMetadata** has `filename`, `language`, `code`, `skeleton`, `challengeSkeleton`, `expertSkeleton`, `inlineHints`. There is **no** `relationalEquivalent` or per-competitor equivalent yet (as suggested in plan §5.2).

### 1.4 Lab creation (ADD_LAB_MASTER_PROMPT)

- **Docs/ADD_LAB_MASTER_PROMPT.md** defines minimal and full modes for creating labs (lab file + enhancements + registration + tests). It does **not** mention competitor code, default competitor, or “generate competitor code for PostgreSQL / Cosmos DB VCore / DynamoDB”.

---

## 2. Goals (Requirements)

1. **Demo mode + moderator only:** When viewing a **lab step** in **demo mode** and the user is a **moderator**, show a **side-by-side** layout: **MongoDB code on the left**, **competitor code on the right** for that step’s code block(s).
2. **Select competing product:**  
   - **Default product:** Configurable (e.g. PostgreSQL) so the right panel shows that product by default.  
   - **Dropdown in the side-by-side view:** User can switch to another product (e.g. Cosmos DB VCore, DynamoDB); the **right-hand editor/content** updates to that product’s code for the current step.
3. **Lab creation:** When creating a lab via **ADD_LAB_MASTER_PROMPT**:  
   - Allow specifying **for which competitors** the lab should include equivalent code (e.g. PostgreSQL, Cosmos DB VCore, DynamoDB).  
   - Allow specifying the **default competitor** to show in the side-by-side view.  
   - Generated **enhancements** should include **competitor equivalents per code block** for those products (so the framework can render them in the competitor panel).
4. **Backward compatibility:** Labs/enhancements without competitor code continue to work; the side-by-side panel is optional and only shown when competitor data exists and conditions (demo + moderator) are met.

---

## 3. Data Model Changes

### 3.1 Competitor product registry

- Introduce a **small registry** of supported competitor products (ids and display names) so the UI dropdown and lab defaults use consistent ids.  
- Suggested ids (examples): `postgresql`, `cosmosdb-vcore`, `dynamodb`.  
- Location: e.g. **src/content/competitor-products.ts** or a slice of **contentService** / types.  
- Used by: template/lab default, enhancement schema, StepView dropdown.

### 3.2 Enhancement metadata (per code block)

- Extend **CodeBlockMetadata** in **src/labs/enhancements/schema.ts** with an optional field, e.g.:

```ts
/** Optional competitor equivalents for demo side-by-side view. Key = competitor product id. */
competitorEquivalents?: Record<string, {
  language: string;
  code: string;
  workaroundNote?: string;
}>;
```

- Keys = competitor product ids (e.g. `postgresql`, `cosmosdb-vcore`, `dynamodb`).  
- One entry per competitor for which this block has equivalent code.  
- **Loader / step enhancement:** No change to loader keying; enhancements already expose `codeBlocks`; each block may now carry `competitorEquivalents`. The mapper (**labContentMapper**) can pass through these if Step’s **CodeBlock** type is extended (see below).

### 3.3 Step / CodeBlock type (UI)

- **LabViewWithTabs** (and/or **StepView**) currently use a **CodeBlock**-like shape with `filename`, `language`, `code`, `skeleton`, etc.  
- Extend that shape so each code block can carry **competitorEquivalents** (same structure as in CodeBlockMetadata) so StepView can render the right-hand panel from it.

### 3.4 Lab definition and template (default + supported competitors)

- **WorkshopLabDefinition** (or template, or both):  
  - **defaultCompetitorId?: string** — which competitor to show by default in the side-by-side view when this lab (or template) is used.  
  - **competitorIds?: string[]** — which competitors this lab has code for (optional; can be inferred from enhancement blocks if needed).  
- **WorkshopTemplate** already has **includeCompetitorComparisons?: boolean**; keep it. Optionally: **defaultCompetitorId** at template level to override lab default when present.

### 3.5 WorkshopCompetitorScenario (existing)

- Keep **WorkshopCompetitorScenario** for **lab-level** comparison (high-level descriptions, pain points). It can remain separate from **per-step, per-code-block** competitor code.  
- Optionally: link scenario’s **competitorId** to the same product registry so dropdown labels are consistent.  
- No requirement to use CompetitorComparisonView in the new flow; the new flow is **per-step side-by-side inside StepView**.

---

## 4. UI / UX Behavior

### 4.1 When the side-by-side is shown

- **Conditions:** `currentMode === 'demo'` **and** `isModerator === true` **and** current step has at least one code block that has **competitorEquivalents** (for at least one product).  
- If the template has **includeCompetitorComparisons === false**, the product may hide the competitor panel (optional product decision).

### 4.2 Layout (StepView)

- In the **code area** of StepView (where InlineHintEditor and ResizablePanelGroup live):  
  - **Left:** Existing MongoDB code panel (unchanged: full solution in demo, no hint markers per §5.1).  
  - **Right:** **Competitor panel** (new):  
    - **Dropdown:** “Compare with: [PostgreSQL ▼]” (or current default). Options = products that have **competitorEquivalents** for the current step (or for the current code block when there are multiple blocks — see below).  
    - **Content:** For the selected competitor, show the **code** (and optional **workaroundNote**) for the **current** code block. If the step has **multiple code blocks**, either show one block’s competitor equivalent at a time (e.g. tab or selector by block) or show the first block’s competitor code and a simple way to switch (e.g. “Block 1 / Block 2” tabs).  
- **Collapsible:** Per plan §5.2, the competitor panel can be **collapsible** so the presenter can show/hide it.

### 4.3 Default product and dropdown

- **Default product:** From (in order of precedence) template’s **defaultCompetitorId**, lab’s **defaultCompetitorId**, or first product in **competitorIds** (or first product present in the current step’s **competitorEquivalents**).  
- **Dropdown options:** Only products that appear in **competitorEquivalents** for the current step (or current code block).  
- On change: re-render the right-hand panel with the selected product’s **language**, **code**, and **workaroundNote** (no full page reload).

### 4.4 Where to get mode and role

- **LabRunner** already has `currentMode` from **useWorkshopSession()**.  
- **LabRunner** must pass **currentMode** and **isModerator** (from **useRole()**) into **LabViewWithTabs**, which passes them to **StepView**.  
- **StepView** then uses these to decide whether to render the competitor panel and to respect “demo + moderator only”.

---

## 5. ADD_LAB_MASTER_PROMPT Extensions

### 5.1 New user inputs (optional)

Add to the “User inputs” table and to the Master prompt’s list:

| Input | Your value | Minimal mode |
|-------|------------|--------------|
| **Competitor products** | [USER_INPUT: e.g. ['postgresql','cosmosdb-vcore','dynamodb'] or "none"] | Optional; default "none" |
| **Default competitor** | [USER_INPUT: e.g. postgresql] | Optional; only if competitor products are specified |

- If **Competitor products** is non-empty, the AI should generate **competitorEquivalents** for each enhancement **code block** for each listed product (inference from proof or user-provided equivalents).  
- **Default competitor** is the id to set as **defaultCompetitorId** on the lab (and/or to document for template).

### 5.2 Generated outputs

- **Lab file:** Set **defaultCompetitorId** and **competitorIds** when the user requested competitor code.  
- **Enhancements file:** For each **codeBlock**, add **competitorEquivalents** keyed by product id, with **language**, **code**, and optionally **workaroundNote**.  
- **Master prompt text:** Add one short paragraph explaining that when “Competitor products” is specified, the AI must produce equivalent code (and optional workaround notes) per code block for each product, and set the lab’s default competitor when “Default competitor” is provided.

### 5.3 Content standards / examples

- In **CONTENT_STANDARDS.md** or **CONTENT_TEMPLATES.md** (or ADD_LAB_MASTER_PROMPT itself), add a small example of **competitorEquivalents** in an enhancement code block (e.g. one block with `postgresql` and `cosmosdb-vcore`).  
- Optionally: add an example in ADD_LAB_MASTER_PROMPT “Example 2” (full structured) with competitor products and default competitor so the AI has a clear pattern.

---

## 6. Implementation Steps (Ordered)

1. **Types and registry**  
   - Add competitor product registry (ids + labels).  
   - Extend **CodeBlockMetadata** with **competitorEquivalents**.  
   - Extend **Step** / **CodeBlock** (UI) with **competitorEquivalents**.  
   - Add **defaultCompetitorId** and **competitorIds** to **WorkshopLabDefinition** (and optionally to **WorkshopTemplate**).

2. **Data flow**  
   - Ensure **buildStepEnhancementsAsync** / **stepEnhancementRegistry** and **labContentMapper** pass **competitorEquivalents** from enhancement metadata into the Step’s codeBlocks so StepView receives them.

3. **LabRunner / LabViewWithTabs**  
   - Pass **currentMode** and **isModerator** from LabRunner into LabViewWithTabs, then into StepView.  
   - Pass **defaultCompetitorId** and **competitorIds** (from lab def or template) into StepView so it can set default and filter dropdown options.

4. **StepView**  
   - When `currentMode === 'demo' && isModerator` and current step has at least one block with **competitorEquivalents**:  
     - Render the competitor panel (right side or below code, with resizable/collapsible behavior).  
     - Implement dropdown “Compare with: [Product ▼]” (options = products present in current step’s competitor data).  
     - Default selection = **defaultCompetitorId** or first available.  
     - On change, show that product’s **code** (and **workaroundNote**) for the current block; if multiple blocks, define simple rule (e.g. show first block’s competitor code, or add block selector).  
   - Use read-only code display (e.g. Monaco read-only or pre/code) for the competitor side.

5. **ADD_LAB_MASTER_PROMPT**  
   - Add “Competitor products” and “Default competitor” to User inputs and Master prompt.  
   - Update “Generate the following” so lab file includes defaultCompetitorId/competitorIds and enhancements file includes competitorEquivalents per code block when requested.  
   - Add one example (full or minimal) that shows competitor code generation.

6. **Docs**  
   - Update **COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md §5.2** to state that the side-by-side supports multiple competitors (PostgreSQL, Cosmos DB VCore, DynamoDB, etc.), default product, and dropdown, and that competitor code is stored per code block in enhancement metadata.  
   - Optionally add **COMPETITOR_SIDE_BY_SIDE_IMPLEMENTATION_PLAN.md** to the plan’s “See also” or reference it from §5.2.

7. **Testing**  
   - Unit/test: StepView receives competitorEquivalents and mode/role; dropdown switches content (no need for full E2E in plan).  
   - Optional: one enhancement test that asserts **competitorEquivalents** presence when generated by ADD_LAB flow.

8. **Optional follow-ups**  
   - Wire **CompetitorComparisonView** somewhere (e.g. a “Comparison” tab in lab intro or in DemoScriptView) using **getCompetitorScenariosForLab**, if you want to keep the lab-level comparison in addition to per-step side-by-side.  
   - **Template** UI: allow moderator to pick **defaultCompetitorId** and **includeCompetitorComparisons** when building a template.

---

## 7. Out of Scope for This Plan

- **PostgreSQL (or other DB) running locally** for live execution of competitor code (plan §5.2 mentioned optional Docker + pgAdmin). That can be a separate “demo environment” task.  
- Changing **DemoScriptView** layout (e.g. embedding StepView inside it) — the plan assumes “Go to Lab” continues to open the lab and StepView; the side-by-side lives inside StepView.  
- **Verification** of competitor code (only MongoDB side is verified).

---

## 8. Summary

| Area | Action |
|------|--------|
| **Schema** | Add competitor product registry; add **competitorEquivalents** to CodeBlockMetadata and Step code blocks; add **defaultCompetitorId** / **competitorIds** to lab (and optionally template). |
| **Data flow** | Pass competitor data from enhancements into StepView; pass **currentMode**, **isModerator**, and default/supported competitors from LabRunner → LabViewWithTabs → StepView. |
| **UI** | In StepView, when demo + moderator and step has competitor data: show side-by-side with MongoDB left, competitor right; dropdown to switch product; collapsible panel. |
| **Lab creation** | Extend ADD_LAB_MASTER_PROMPT with “Competitor products” and “Default competitor”; generate **competitorEquivalents** per code block and set lab default. |
| **Docs** | Update §5.2 and ADD_LAB_MASTER_PROMPT; add optional example and content standards for competitor code. |

After this plan is implemented, you can **decide whether to do this next or continue with the next batch of labs** (e.g. Phase 17). No implementation is started in this document; it is analysis and plan only.
