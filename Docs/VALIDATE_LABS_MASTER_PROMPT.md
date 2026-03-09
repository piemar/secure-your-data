# Master Template Prompt: Validate Existing Labs Against ADD_LAB_MASTER_PROMPT

Use this prompt to **audit all existing labs and steps** against the principles and quality bar defined in **`Docs/ADD_LAB_MASTER_PROMPT.md`**, including the **standardized approach (Lab 1 Step 3)**. The output is a **fix plan** listing what each lab is missing or below the bar, and what to do to fix it.

**Validation must be exhaustive:** The audit is performed **from scratch** for **every lab** and **every step**. Do not sample or summarize. For each lab you must load its definition, then for **each step** in that lab load the corresponding enhancement (via `step.enhancementId`) and apply the full checklist to that step and its enhancement. Record every gap for every step/enhancement that fails a criterion.

**Consistency with other docs:** This prompt assumes the same content model as `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` and `Docs/LAB_MIGRATION_GUIDE.md`: lab definitions live under `src/content/topics/<topic>/<pov>/lab-*.ts`, and step content (code blocks, skeletons, hints, tips) lives in `src/content/topics/<topic>/<pov>/enhancements.ts`, loaded by `enhancementId` via the loader’s `moduleMap`. Verification is step-level `verificationId`, not `onVerify` in enhancements.

**Output file:** The fix plan must be written to a single markdown file named **`YYYY-MM-DD_FIX_PLAN.md`** where **YYYY-MM-DD is the date when this prompt is invoked** (e.g. if you run the prompt on 2026-02-05, the file is `2026-02-05_FIX_PLAN.md`). Save it under **`Docs/`** (e.g. `Docs/2026-02-05_FIX_PLAN.md`). If the user provides a specific date, use that; otherwise use **today's date** at the time you run the validation.

---

## What to validate (criteria from ADD_LAB_MASTER_PROMPT)

Use the following checklist for **each lab** and, where applicable, **each step** and **each enhancement**. Treat **Lab 1: CSFLE Fundamentals** and **Lab 2: Queryable Encryption** as the principal reference (they define the target level).

### Lab-level

| Criterion | Requirement | How to check |
|-----------|-------------|--------------|
| **Steps per lab** | Minimum 3; for hands-on labs prefer **5–7 steps**. Overview-only labs may have 3. | Count `steps.length`. If lab has code/verification and only 3 steps, note “consider 5–7 steps for hands-on”. |
| **Key concepts** | **4+ terms** with clear explanations. | Count `keyConcepts?.length`. If missing or &lt; 4, list as gap. |
| **Prerequisites** | Concrete list (Atlas M10+, tools, etc.). **When the lab has any step with a Mongosh block:** prerequisites must include **mongosh** (or "MongoDB Shell") so attendees know Run requires mongosh installed and path set in Workshop Settings; otherwise "mongosh missing" or Run failures occur. | `prerequisites` present and non-empty. If any step's enhancement has a block with `language: 'mongosh'`, check that prerequisites mention mongosh; if missing, list as gap. |
| **dataRequirements** | Present when the lab uses collections, scripts, or files. **For labs that require pre-loaded data** (steps run queries/aggregations that expect existing collections to return sensible results): must include at least one `dataRequirements` entry with `type: 'collection'` (and `namespace`) or `type: 'script'` (and `path` to seed script). See **`Docs/LAB_SAMPLE_DATA_PLAN.md`**. | If lab references keyVault, collections, or scripts but has no `dataRequirements`, list as gap. If lab steps clearly require pre-loaded data (e.g. Rich Query, in-place analytics, workload isolation) but dataRequirements is missing or has no collection/script entry with namespace or path, list as gap: "Add dataRequirements with type 'collection' (namespace) or type 'script' (path to seed); see LAB_SAMPLE_DATA_PLAN.md." |
| **Lab metadata** | `estimatedTotalTimeMinutes`, `tags`, `povCapabilities`, `modes`, `labFolderPath` when proof folder used. | Missing fields noted. |

### Step-level

| Criterion | Requirement | How to check |
|-----------|-------------|--------------|
| **Narrative** | **2–4 sentences** (not one line). | Word count or sentence count; if narrative is a single short sentence, list as “expand narrative”. |
| **Instructions** | Concrete, actionable (bullet or numbered). | If instructions are vague or one line, list as “make instructions concrete”. |
| **Hints** | **3–5 hints** where the step has code or verification. | Count `hints?.length`. If step has `enhancementId` with code/verification and hints &lt; 3 or missing, list as gap. |
| **Per-step metadata** | Each step: `estimatedTimeMinutes`, `points`, `sourceProof`, `sourceSection`, `verificationId` (when verification exists), `modes`. | Missing fields per step. |
| **enhancementId** | Every step that shows code or structured content must have `enhancementId` (prefix matches POV folder). | Step has no `enhancementId` but needs one, or prefix mismatch. |

### Enhancement-level (per enhancementId used by the lab)

| Criterion | Requirement | How to check |
|-----------|-------------|--------------|
| **Code blocks** | At least one block with `filename`, `language`, `code`. Optional `skeleton` + `inlineHints` (with matching `blankText`). | Missing code block; or skeleton without matching inlineHints. |
| **\*.cjs / \*.js steps = Lab 1 Step 3 (north star)** | **Any step whose enhancement has a code block with `filename` ending in `.cjs` or `.js`** (i.e. the editor heading shows a Node script) **must** follow the Lab 1 Step 3 pattern: (1) **No** Terminal (bash) block that runs `node file.cjs` or `node file.js`—execution is via **Run all** and **Run selection** in the editor only. (2) **When the step can be expressed in mongosh** (CRUD, queries, aggregations, index creation, key vault index), **include a Mongosh block** that is the equivalent of the Node code (same logic, mongosh syntax) so the UI shows the **mongosh tab** and users can run or echo to Terminal. For driver-only steps (create DEK, auto-encrypt, rewrap, etc.) have **one block only**—no mongosh tab. (3) If the step has both Node and Mongosh: **exactly two blocks**—Node block first, then Mongosh block (`filename: 'Mongosh'`, `language: 'mongosh'`); **no Terminal block**. (4) Tips must mention Run all or Run selection. Reference: `csfle.init-keyvault`, CRUD lab `src/content/topics/query/crud/enhancements.ts`. | For **every** enhancement that has at least one block with `filename` matching `*.cjs` or `*.js`: check for a Terminal block whose code runs `node`; **if the step can be done in mongosh (CRUD, queries, aggregations, indexes), check that a Mongosh block exists**—if missing, list as gap: "Add Mongosh block (convert Node code to mongosh equivalent) so the step has a mongosh tab."; for driver-only steps, one block only; check block count and order when both exist; check tips. List every violating step in the fix plan with lab id, step id, enhancementId, and exact fix. |
| **No Terminal block (standardized approach)** | **No** Terminal (bash) block that only runs `node file.cjs` or `node file.js`. Execution is via Run all / Run selection in the editor. Steps with only a Node script have one block; steps with Node + Mongosh have two blocks (Node, then Mongosh)—no Terminal block. | If enhancement has a block with `filename: 'Terminal'` (or similar) and `language: 'bash'` and code like `node *.cjs`, list as gap: "Remove Terminal block; execution via Run all / Run selection; update tips to say use Run all or Run selection." |
| **Inline hints vs skeleton** | Every `inlineHints` entry: `line` must be a valid 1-based line in `skeleton`, and that line must contain the exact `blankText` (so the "?" marker can be placed correctly). **At most one placeholder and one hint per row/code line:** no two `inlineHints` may share the same `line`; no skeleton line may contain more than one placeholder. Applies to **all** blocks including Mongosh. | Run **hint rendering validation test** (see below). For each block, group hints by `line`; if any line has more than one hint, list as gap: "Split so at most one hint per line (move one blank to another line)." |
| **Node + Mongosh composite** | When a step has both a Node (`.cjs`/`.js`) block and a Mongosh block: **exactly two blocks** (Node first, then Mongosh); no Terminal block. UI shows one slot **"mongosh ! node"**; mongosh first and default; Run all / Run selection run the active tab. **Only include a Mongosh block when the same functionality can be executed in mongosh** (e.g. key vault index); do not add Mongosh for driver-only steps (create DEK, auto-encrypt, rewrap, etc.)—those steps have one block and no mongosh tab. | If step has Node + Terminal + Mongosh or Terminal between Node and Mongosh, list as gap: remove Terminal; ensure order is Node block then Mongosh block only. If step has a Mongosh block for a driver-only action (e.g. create DEK, explicit encrypt), list as gap: remove Mongosh block so the step shows only the driver filename with no mongosh tab. |
| **When to include Mongosh** | **Add a Mongosh block for every step that can be expressed in mongosh:** CRUD (insert, find, update, replace, upsert, delete, bulkWrite), queries, aggregations, index creation, key vault index. The Mongosh block must be the **equivalent of the Node code** (same logic, mongosh syntax) so users get a **mongosh tab** and can run or echo to Terminal. **Do not add a Mongosh block** only for driver-only actions that cannot be run in mongosh (e.g. create DEK, auto-encrypt on insert, rewrapManyDataKey, create collection with encryptedFields, explicit encrypt for migration). Those steps have **one block** and no mongosh tab. Reference: CRUD lab and Rich Query labs have Node + Mongosh for each step; CSFLE has Mongosh for `csfle.init-keyvault` only; create-deks, verify-dek, test-csfle, complete-application are Node-only. | For each enhancement with a Node (`.cjs`/`.js`) block: **if the step can be done in mongosh (CRUD, queries, aggregations, indexes)** and there is **no** Mongosh block, list as gap: "Add Mongosh block (convert Node code to mongosh) so the step has a mongosh tab." If the step has a Mongosh block but is driver-only, list as gap: "Remove Mongosh block; step is driver-only." |
| **Mongosh blocks** | Mongosh blocks must follow the same content rigour as Node/JS blocks: when the step has guided fill-in-the-blank, provide `skeleton` and `inlineHints` (with correct `line` and `blankText`) so hint markers align. Use `$exists` (not `exists`) in operators where required. **Solution display:** When solution is revealed, the UI shows the shell command first (e.g. `mongosh "<URI>"`) then the script; enhancement `code`/`skeleton` must be script-only (no connection line in content). **Database names (suffix):** For CRUD and any lab using per-user DB substitution, enhancement content must use the plain name (e.g. `crud_lab`) so the framework can substitute to `crud_lab_<suffix>`; do not hardcode a suffixed DB name in enhancements. | If a step has a Mongosh block without skeleton/inlineHints where other blocks in the step have them, list as gap. If enhancement code includes a connection line (e.g. `mongosh "..."` at top of script), list as "Remove connection line from code/skeleton; UI prepends it when solution is revealed." If CRUD (or similar) enhancement hardcodes a DB name with a suffix instead of plain `crud_lab`, list as "Use plain crud_lab in content; framework substitutes suffix." |
| **Tips** | **2–4 tips** per enhancement. Tips should mention Run all / Run selection where execution is from the editor (no separate terminal). **For enhancements that include a Mongosh block:** at least one tip should mention that Run requires mongosh to be installed and its path set in Workshop Settings (e.g. "Run uses the mongosh path from Workshop Settings; set it if Run fails or you see mongosh missing."). | Count `tips?.length`; if &lt; 2 or missing, list as gap. If tips still say "run in terminal" for node/mongosh steps, list as "Update tips: use Run all or Run selection." If enhancement has a Mongosh block but no tip mentions mongosh path / Workshop Settings, list as "Add tip: Run requires mongosh path in Workshop Settings." |
| **Metadata** | `id`, `povCapability`, `sourceProof`, `sourceSection`. | Missing fields. |

### Hint placement verification (required for labs with skeleton + inlineHints)

**Placeholders and hint markers must be correct:** For every step that uses a skeleton with fill-in-the-blank placeholders, validation must confirm that (1) each placeholder has a matching `inlineHint` (correct `line` and `blankText`), (2) hint markers render (no missing markers), and (3) the "?" hint marker is positioned so it aligns with or is centered on the placeholder. Run the hint rendering test and perform a visual check so placeholders and hint markers are correct.

Applies to **all** code blocks that use skeleton + inlineHints, including **Mongosh** blocks.

1. **Programmatic:** Run the hint rendering test so every hint’s line and `blankText` match the skeleton:
   ```bash
   npm test -- --run src/test/labs/validate-hint-rendering.test.ts
   ```
   Fix any reported mismatches by correcting `line` and/or `blankText` in the enhancement’s `inlineHints` so each blank exists on the given skeleton line. See `Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md` (Section 7) and `src/test/labs/validate-hint-rendering.test.ts`.

2. **One hint per line:** For each block, ensure **at most one** `inlineHint` per skeleton line (no two hints with the same `line`). No skeleton line may contain more than one placeholder. If a block has multiple hints on the same line, list as gap: "Split so at most one placeholder and one hint per line."
3. **Visual:** In the browser, open each step that has skeleton + inline hints and confirm the "?" hint marker appears **exactly where** the placeholder (e.g. `_____________`) is rendered in the editor. If it is misaligned, fix the enhancement’s `inlineHints` (line numbers and `blankText` length) until the marker aligns.

Include in the fix plan: “Run hint validation test; fix any failures; ensure at most one hint per line; perform visual check for hint marker alignment.”

### General (from ADD_LAB_MASTER_PROMPT)

- **Avoid:** One-sentence narratives, steps without hints where guidance is needed, missing keyConcepts or prerequisites, labs that feel sparse compared to CSFLE/QE. **Mongosh labs:** Labs with any Mongosh block must list mongosh in prerequisites and have a tip (per enhancement) that Run requires mongosh path in Workshop Settings—otherwise attendees see "mongosh missing" or Run failures.
- **MongoDB docs:** Key concepts and terminology should align with MongoDB official documentation where relevant (not automatically checkable; note in plan if concepts seem vague or non-standard).
- **Infrastructure:** Leaderboard uses the central obfuscated URI by default; lab content does not depend on a local leaderboard. Run execution for Node/Python uses temp paths with user suffix; Mongosh blocks require mongosh path and MongoDB URI (Workshop Settings).

### Verification and solution tests

- **Test coverage:** Run the lab step verification and solution test so every step with a `verificationId` is handled by `VerificationService` and every step (with or without verification) that has an enhancement with code blocks has at least one block with non-empty full solution code (`block.code`). This ensures "run full solution then verify" is possible for all steps.
  ```bash
  npm test -- --run src/test/labs/lab-step-verification-and-solution.test.ts
  ```
- **Verification quality:** Each step’s verification (when `verificationId` is set) should **validate something useful** (e.g. key vault index exists, DEK created, collection has expected data, query returns expected shape). A stub or `NOT_IMPLEMENTED` return is acceptable only when the backend/API does not yet support that check. In the fix plan, list steps whose verification is still stubbed and recommend implementing a real check in `VerificationService` and `validatorUtils` (and backend endpoints where needed) so the validator asserts meaningful state (e.g. collection exists, index exists, document count, encrypted field type).

Include in the fix plan: "Run lab-step-verification-and-solution test; fix any failures; for steps with stubbed verification, add real checks when backend supports them."

---

## Scope of the audit

1. **Discover all labs**  
   From `src/content/topics/index.ts` (allLabs array) or by scanning `src/content/topics/**/lab-*.ts`. Include **every** lab that is registered and used in the app. Do not skip any lab.

2. **For each lab (every lab)**  
   - Load the full lab definition (steps, keyConcepts, prerequisites, dataRequirements, etc.).  
   - **For each step in that lab** (every step): load the corresponding enhancement from the POV folder's `enhancements.ts` via `step.enhancementId` (loader resolves by prefix). If the step has no enhancementId, still apply step-level criteria and note the gap.  
   - Apply the **full checklist** (lab-level, step-level, enhancement-level, including the **\*.cjs/\*.js = Lab 1 Step 3** rule) to that lab and to **each** step and its enhancement.  
   - Record **every** gap: do not sample or aggregate. Each step that fails any criterion must appear in the fix plan with lab id, step id (or enhancementId), and the exact fix.

3. **\*.cjs / \*.js steps (north star)**  
   For **every** step whose enhancement contains at least one code block with `filename` ending in `.cjs` or `.js`, verify Lab 1 Step 3: no Terminal block that runs node; execution via Run all / Run selection; if Node + Mongosh, exactly two blocks (Node then Mongosh). List every violation in the fix plan under a dedicated subsection (e.g. "Steps with \*.cjs/\*.js that violate Lab 1 Step 3") with lab id, step id, enhancementId, and the exact change required.

4. **Exclude (optional)**  
   You may skip or mark as "reference only" the **encryption CSFLE and Queryable Encryption** labs (lab-csfle-fundamentals, lab-queryable-encryption) if they are the principal template; still list them in the report with "Reference – no fixes required" or note any minor gaps. All other labs must be fully audited step-by-step.
---

## Output: Fix plan format

Generate a single file **`Docs/YYYY-MM-DD_FIX_PLAN.md`** with the following structure. Use the **actual date** when the prompt is run (e.g. 2026-02-05).

```markdown
# Lab Validation Fix Plan – YYYY-MM-DD

**Generated:** YYYY-MM-DD  
**Source criteria:** Docs/ADD_LAB_MASTER_PROMPT.md (principal template: CSFLE & Queryable Encryption labs)

## Summary

- **Labs audited:** N
- **Labs with no gaps:** M
- **Labs with gaps:** K
- **Priority:** [e.g. "Fix hands-on labs first, then overview labs"]

## Per-lab findings and fix list

### lab-&lt;id&gt; (Lab Title)

| Criterion | Status | Action |
|-----------|--------|--------|
| Steps count | ✅ / ⚠️ / ❌ | e.g. "Add 2 more steps for hands-on coverage" |
| Key concepts | ✅ / ⚠️ / ❌ | e.g. "Add 2 key concepts (current: 2)" |
| Prerequisites | ✅ / ❌ | e.g. "Add prerequisites array" |
| ... | ... | ... |

**Step-level gaps:**

- **Step &lt;title&gt; (step id):** [e.g. "Narrative is one sentence – expand to 2–4. Missing hints (0) – add 3–5."]
- ...

**Enhancement-level gaps:**

- **&lt;enhancementId&gt;:** [e.g. "Tips array missing – add 2–4 tips."]

**Steps with \*.cjs/\*.js that violate Lab 1 Step 3 (if any):**

- **lab-id / step-id / enhancementId:** [e.g. "Remove Terminal block that runs node; execution via Run all / Run selection only; ensure exactly two blocks (Node, Mongosh) if both present; update tips."]

---

### lab-&lt;next-id&gt;
...
```

Add a final section:

```markdown
## Recommended order of fixes

1. [Lab or theme to fix first]
2. ...
```

Then add:

```markdown
## Hint placement verification

- [ ] Run: `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` — all labs pass.
- [ ] Visual check: For each lab step that has a skeleton and inline hints, open the step in the browser and confirm the "?" hint marker is positioned exactly on the placeholder (_______) in the editor.
```

```

---

## Validate by topic and lab name (single scope)

Use this when you want to validate **one topic** or **one specific lab** instead of running a full audit. You provide the **topic id** (e.g. `query`, `encryption`, `operations`) and optionally a **lab id** (e.g. `lab-text-search-basics`). The AI validates only that scope and outputs a short fix list or “OK” for that topic/lab.

**How to run:**

1. Copy the prompt below.
2. In your message, provide:
   - **Topic id** (required): e.g. `query`, `encryption`, `operations`.
   - **Lab id** (optional): e.g. `lab-text-search-basics`. If omitted, all labs under that topic are validated.
3. The AI will read the relevant lab definition(s) and enhancement(s), apply the same criteria as in the full audit (lab-level, step-level, enhancement-level), and produce a short report: either “OK” or a bullet list of gaps and recommended fixes for that topic/lab only.

**Prompt (validate by topic and lab name):**

```
You are validating one or more workshop labs against the quality bar in Docs/ADD_LAB_MASTER_PROMPT.md.

The user has provided:
- Topic id: [USER_INPUT: e.g. query]
- Lab id (optional): [USER_INPUT: e.g. lab-text-search-basics, or "all" to validate every lab in the topic]

**Task:**
1. Resolve the topic id to the topic folder under src/content/topics/<topic>/.
2. If lab id is given (and not "all"), load only that lab definition and its steps/enhancements. If lab id is "all" or omitted, load every lab that belongs to this topic (from src/content/topics/index.ts or by scanning the topic folder).
3. For each lab in scope, load its definition and, **for each step**, the corresponding enhancement (step.enhancementId) from the loader/enhancements. Do not skip any step.
4. Apply the same criteria as in Docs/VALIDATE_LABS_MASTER_PROMPT.md: lab (steps count, keyConcepts, prerequisites [**when lab has any Mongosh block**, must include mongosh], dataRequirements [when lab needs pre-loaded data: collection/script with namespace or path per LAB_SAMPLE_DATA_PLAN.md], metadata), step (narrative, instructions, hints, enhancementId, metadata), enhancement (code blocks, **\*.cjs/\*.js = Lab 1 Step 3**: no Terminal block that runs node, Run all / Run selection, two blocks only if Node + Mongosh; tips [for Mongosh blocks: tip about mongosh path in Workshop Settings], metadata).
5. Output a short report: either "OK – no gaps for [topic/lab]" or a bullet list of gaps with lab id, step id or enhancementId, and the exact fix (e.g. "Add 2 key concepts", "Add enhancementId and enhancements for step X", "Remove Terminal block; use Run all / Run selection."). Do not produce a full fix plan file; output the result in your response.
```

---

## How to run this validation

1. **Open** `Docs/VALIDATE_LABS_MASTER_PROMPT.md` and **copy the full prompt** below (or the whole doc).
2. **Provide context** so the AI can read lab files and enhancements:
   - Either: “Audit all labs in `src/content/topics/` against ADD_LAB_MASTER_PROMPT. Use the criteria in VALIDATE_LABS_MASTER_PROMPT.md. Output the fix plan to **Docs/YYYY-MM-DD_FIX_PLAN.md** where YYYY-MM-DD is today’s date.”
   - Or: Invoke the master prompt below and let the AI discover labs from the codebase.
3. **Run** the prompt (Cursor, or your LLM). The AI will need access to:
   - `Docs/ADD_LAB_MASTER_PROMPT.md`
   - `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` and `Docs/LAB_MIGRATION_GUIDE.md` (for paths and enhancement model)
   - `src/content/topics/index.ts` (or list of lab files)
   - Lab definition files under `src/content/topics/**/lab-*.ts`
   - Enhancement files under `src/content/topics/**/enhancements.ts` (resolved by enhancementId prefix via loader)
4. **Result:** A single file **`Docs/YYYY-MM-DD_FIX_PLAN.md`** (date = date of run) with per-lab gaps and actionable fix list.

---

## Master prompt (copy from here)

```
You are validating all existing workshop labs against the quality bar and principles in Docs/ADD_LAB_MASTER_PROMPT.md.

**Task:**
1. Discover every lab that is registered and used (from src/content/topics/index.ts allLabs, or by scanning src/content/topics/**/lab-*.ts).
2. For each lab, load its definition and, for each step, the corresponding enhancement: use step.enhancementId to look up the enhancement in the POV’s enhancements.ts (loader resolves by enhancementId prefix; see Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md and Docs/LAB_MIGRATION_GUIDE.md).
3. Audit each lab (and its steps and enhancements) against the criteria in Docs/VALIDATE_LABS_MASTER_PROMPT.md (which mirrors ADD_LAB_MASTER_PROMPT.md), including the **standardized approach (Lab 1 Step 3)** and **lab sample data (dataRequirements)**:
   - Lab: steps count (min 3; prefer 5–7 for hands-on), keyConcepts (4+), prerequisites (**when the lab has any step with a Mongosh block**, prerequisites must include mongosh so attendees avoid "mongosh missing" / Run failures), **dataRequirements** (when lab uses collections/scripts; when lab requires pre-loaded data for steps to make sense, must have at least one entry with type 'collection' + namespace or type 'script' + path—see Docs/LAB_SAMPLE_DATA_PLAN.md), lab metadata.
   - Step: narrative (2–4 sentences), instructions (concrete), hints (3–5 where step has code/verification), per-step metadata (estimatedTimeMinutes, points, sourceProof, sourceSection, verificationId when applicable, modes), enhancementId.
   - Enhancement: code blocks, **no Terminal block** that only runs node (execution via Run all / Run selection), Node + Mongosh steps have exactly two blocks **only when the step can run the same in mongosh** (otherwise one block, no mongosh tab), no Terminal, tips (2–4) that mention Run all / Run selection where appropriate; **for enhancements with a Mongosh block**, at least one tip must mention that Run requires mongosh path in Workshop Settings (to avoid "mongosh missing" / Run failures), metadata (id, povCapability, sourceProof, sourceSection).
4. Produce a single **fix plan** markdown file.

**Output file name and path:**  
Name the file **YYYY-MM-DD_FIX_PLAN.md** where **YYYY-MM-DD is the current date when this prompt is invoked** (e.g. 2026-02-05). If the user provides a date, use that. Save it under **Docs/** (e.g. Docs/2026-02-05_FIX_PLAN.md).

**Output content:**  
Use the structure in Docs/VALIDATE_LABS_MASTER_PROMPT.md: title, summary (labs audited, with/without gaps), then per-lab findings in tables (criterion, status, action), step-level gaps, enhancement-level gaps, and a final “Recommended order of fixes” section. Be specific: for each gap, state the lab id, step id or enhancementId, and the exact fix (e.g. “Add 2 key concepts”, “Expand narrative to 2–4 sentences”, “Add 3 hints”).

**Reference labs:**  
Treat lab-csfle-fundamentals and lab-queryable-encryption as the principal template; you may mark them as “Reference – no fixes required” or note only minor gaps.

Do not modify any lab or enhancement files; only produce the fix plan document.
```

---

## Test cases: run full solution then verify

For each lab and each step that has a **verificationId** and an **enhancementId**:

1. **Solution code:** The enhancement must provide at least one code block with non-empty **full solution** (`block.code`), not only a skeleton. This is asserted by **`src/test/labs/lab-step-verification-and-solution.test.ts`** (run: `npm test -- lab-step-verification-and-solution`).
2. **Verification implemented:** Every **verificationId** used in any lab step must be handled in **`VerificationService.verify()`** (no "Unknown verification id"). The same test fails if any ID is missing from the service.
3. **Intended test pattern (integration/E2E):** For each step, the test case should: (a) run the step’s **full solution** script (from the enhancement’s code blocks—Node via run-node, Mongosh via run-mongosh, etc.), then (b) call the step’s **verification** with the appropriate context (URI, db, suffix, etc.). The verification result should be **success: true** when the solution was run correctly. This pattern ensures labs are testable and that validation is tied to real execution.
4. **Validation quality:** Each verification handler in **`VerificationService`** and **`validatorUtils`** should validate something **useful** (e.g. key vault index exists, DEK created, collection has expected structure, query returns expected shape). Stub handlers that always return success with a message like "run the code to verify" are acceptable only as a temporary placeholder; the fix plan should list steps whose verification is still a stub and recommend implementing a real check (e.g. backend endpoint + validatorUtils) so the step actually validates the outcome of the solution.

---

## After running

- Open **`Docs/YYYY-MM-DD_FIX_PLAN.md`** and work through the recommended fixes (by lab or by theme).
- Re-run this validation after making changes to confirm gaps are closed.
- Run **`npm test -- lab-step-verification-and-solution`** to ensure every step with verificationId is handled and has solution code.
- Optionally, run **`node scripts/validate-content.js`** for schema/reference validation in addition to this quality audit.

**Related docs:** For the content model (lab definitions, enhancements, loader), see `Docs/METADATA_DRIVEN_ENHANCEMENT_SYSTEM_COMPLETE.md` and `Docs/LAB_MIGRATION_GUIDE.md`. For how labs are rendered (all content-driven via LabRunner), see `Docs/LAB_IMPLEMENTATION_PATHS.md`. For labs that require pre-loaded data (Load Sample Data, reset = original dataset), see **`Docs/LAB_SAMPLE_DATA_PLAN.md`**.
