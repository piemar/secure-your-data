# Master Template Prompt: Validate Existing Labs Against ADD_LAB_MASTER_PROMPT

Use this prompt to **audit all existing labs and steps** against the principles and quality bar defined in **`Docs/ADD_LAB_MASTER_PROMPT.md`**. The output is a **fix plan** listing what each lab is missing or below the bar, and what to do to fix it.

**Output file:** The fix plan must be written to a single markdown file named **`YYYY-MM-DD_FIX_PLAN.md`** where **YYYY-MM-DD is the date when this prompt is invoked** (e.g. if you run the prompt on 2026-02-05, the file is `2026-02-05_FIX_PLAN.md`). Save it under **`Docs/`** (e.g. `Docs/2026-02-05_FIX_PLAN.md`). If the user provides a specific date, use that; otherwise use **today's date** at the time you run the validation.

---

## What to validate (criteria from ADD_LAB_MASTER_PROMPT)

Use the following checklist for **each lab** and, where applicable, **each step** and **each enhancement**. Treat **Lab 1: CSFLE Fundamentals** and **Lab 2: Queryable Encryption** as the principal reference (they define the target level).

### Lab-level

| Criterion | Requirement | How to check |
|-----------|-------------|--------------|
| **Steps per lab** | Minimum 3; for hands-on labs prefer **5–7 steps**. Overview-only labs may have 3. | Count `steps.length`. If lab has code/verification and only 3 steps, note “consider 5–7 steps for hands-on”. |
| **Key concepts** | **4+ terms** with clear explanations. | Count `keyConcepts?.length`. If missing or &lt; 4, list as gap. |
| **Prerequisites** | Concrete list (Atlas M10+, tools, etc.). | `prerequisites` array present and non-empty for hands-on labs. |
| **dataRequirements** | Present when the lab uses collections, scripts, or files. | If lab references keyVault, collections, or scripts but has no `dataRequirements`, list as gap. |
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
| **Tips** | **2–4 tips** per enhancement. | Count `tips?.length`; if &lt; 2 or missing, list as gap. |
| **Metadata** | `id`, `povCapability`, `sourceProof`, `sourceSection`. | Missing fields. |

### General (from ADD_LAB_MASTER_PROMPT)

- **Avoid:** One-sentence narratives, steps without hints where guidance is needed, missing keyConcepts or prerequisites, labs that feel sparse compared to CSFLE/QE.
- **MongoDB docs:** Key concepts and terminology should align with MongoDB official documentation where relevant (not automatically checkable; note in plan if concepts seem vague or non-standard).

---

## Scope of the audit

1. **Discover all labs**  
   From `src/content/topics/index.ts` (allLabs array) or by scanning `src/content/topics/**/lab-*.ts`. Include every lab that is registered and used in the app.

2. **For each lab**  
   - Load the lab definition (steps, keyConcepts, prerequisites, dataRequirements, etc.).  
   - For each step, load the corresponding enhancement from the POV folder’s `enhancements.ts` (via `enhancementId`). If the enhancement is in a different path (e.g. loader moduleMap), resolve it.  
   - Apply the checklist above and record gaps.

3. **Exclude (optional)**  
   You may skip or mark as “reference only” the **encryption CSFLE and Queryable Encryption** labs (lab-csfle-fundamentals, lab-queryable-encryption) if they are the principal template; still list them in the report with “Reference – no fixes required” or note any minor gaps.

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
3. For each lab in scope, load its definition and, for each step, the corresponding enhancement (step.enhancementId) from the loader/enhancements.
4. Apply the same criteria as in Docs/VALIDATE_LABS_MASTER_PROMPT.md: lab (steps count, keyConcepts, prerequisites, dataRequirements, metadata), step (narrative, instructions, hints, enhancementId, metadata), enhancement (code blocks, tips, metadata).
5. Output a short report: either "OK – no gaps for [topic/lab]" or a bullet list of gaps with lab id, step id or enhancementId, and the exact fix (e.g. "Add 2 key concepts", "Add enhancementId and enhancements for step X"). Do not produce a full fix plan file; output the result in your response.
```

---

## How to run this validation

1. **Open** `Docs/VALIDATE_LABS_MASTER_PROMPT.md` and **copy the full prompt** below (or the whole doc).
2. **Provide context** so the AI can read lab files and enhancements:
   - Either: “Audit all labs in `src/content/topics/` against ADD_LAB_MASTER_PROMPT. Use the criteria in VALIDATE_LABS_MASTER_PROMPT.md. Output the fix plan to **Docs/YYYY-MM-DD_FIX_PLAN.md** where YYYY-MM-DD is today’s date.”
   - Or: Invoke the master prompt below and let the AI discover labs from the codebase.
3. **Run** the prompt (Cursor, or your LLM). The AI will need access to:
   - `Docs/ADD_LAB_MASTER_PROMPT.md`
   - `src/content/topics/index.ts` (or list of lab files)
   - Lab definition files under `src/content/topics/**/lab-*.ts`
   - Enhancement files under `src/content/topics/**/enhancements.ts`
4. **Result:** A single file **`Docs/YYYY-MM-DD_FIX_PLAN.md`** (date = date of run) with per-lab gaps and actionable fix list.

---

## Master prompt (copy from here)

```
You are validating all existing workshop labs against the quality bar and principles in Docs/ADD_LAB_MASTER_PROMPT.md.

**Task:**
1. Discover every lab that is registered and used (from src/content/topics/index.ts allLabs, or by scanning src/content/topics/**/lab-*.ts).
2. For each lab, load its definition and, for each step, the corresponding enhancement from the POV folder’s enhancements.ts (using step.enhancementId).
3. Audit each lab (and its steps and enhancements) against the criteria in Docs/VALIDATE_LABS_MASTER_PROMPT.md (which mirrors ADD_LAB_MASTER_PROMPT.md):
   - Lab: steps count (min 3; prefer 5–7 for hands-on), keyConcepts (4+), prerequisites, dataRequirements, lab metadata.
   - Step: narrative (2–4 sentences), instructions (concrete), hints (3–5 where step has code/verification), per-step metadata (estimatedTimeMinutes, points, sourceProof, sourceSection, verificationId when applicable, modes), enhancementId.
   - Enhancement: code blocks, tips (2–4), metadata (id, povCapability, sourceProof, sourceSection).
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

## After running

- Open **`Docs/YYYY-MM-DD_FIX_PLAN.md`** and work through the recommended fixes (by lab or by theme).
- Re-run this validation after making changes to confirm gaps are closed.
- Optionally, run **`node scripts/validate-content.js`** for schema/reference validation in addition to this quality audit.
