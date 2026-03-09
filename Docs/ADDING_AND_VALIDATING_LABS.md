# Adding and Validating Labs – Step-by-Step

This document walks through **how to add a new lab** (using the ADD_LAB prompt) and **how to validate existing labs** (using the VALIDATE_LABS prompt). For the full prompt text and rules, see [ADD_LAB_MASTER_PROMPT.md](./ADD_LAB_MASTER_PROMPT.md) and [VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md).

---

## Part 1: Adding a new lab (ADD_LAB_MASTER_PROMPT)

### When to use

- You want to create a **new lab** (new topic/POV or new lab under an existing POV).
- You want the AI to generate: lab definition file, enhancements file, plan document, index/loader registration, and enhancement tests in one go.

### How to run (Cursor or any LLM)

1. **Open the prompt**  
   Open [ADD_LAB_MASTER_PROMPT.md](./ADD_LAB_MASTER_PROMPT.md) and copy the **Master prompt** (the block under “Master prompt (copy from here)”).

2. **Provide inputs**  
   You can use either **minimal** or **full** input:
   - **Minimal (recommended):** In the same chat, provide at least:
     - **Description** (required): One sentence describing what the lab is about.
     - **Source** (optional): Proof number (e.g. `17`) or path to a guide (e.g. `Docs/Guides/Lab_1_CSFLE.md`). If provided, the AI infers steps and content from it; otherwise it infers from the description.
     - **Topic** (optional): e.g. `query`, `encryption`, `operations`.
     - **POV folder** (optional): e.g. `auto-ha`, `rich-query`.
     - **Lab name** (optional): Human-readable title.
   - If you don’t paste a full User input block, the AI will ask for these in a checklist; reply with your answers.
   - **Full structured:** Paste the User input block from the doc with every field filled (lab name, topic, POV folder, steps, key concepts, etc.). The AI then uses your values as-is.

3. **What the AI does**  
   - Creates a **feature branch** (e.g. `feature/lab-<slug>`) if you’re in a git repo.
   - Generates **Docs/PLAN_<lab-slug>.md** (lab plan: scope, steps, implementation order).
   - Generates the **lab file**, **enhancements file**, **index registration**, **loader registration** (if new POV), and **enhancement tests**.
   - Tells you to run: `node scripts/validate-content.js`, the enhancement tests, and (if the lab has skeleton + hints) `npm test -- --run src/test/labs/validate-hint-rendering.test.ts`.

4. **What you do after**  
   - Apply the suggested file edits (create/update lab file, enhancements, index, loader, test file).
   - Run the commands the AI suggests (validate-content, vitest for the new lab’s enhancements, validate-hint-rendering if applicable).
   - Open the app and confirm the new lab appears and steps load.

**Optional:** If you only want a **plan** and no code yet, ask for “plan only” or “create plan before code”; the AI will output only **Docs/PLAN_<lab-slug>.md** and stop.

---

## Part 2: Validating existing labs (VALIDATE_LABS_MASTER_PROMPT)

### When to use

- You want to **audit all labs** (or a single topic/lab) against the quality bar in ADD_LAB_MASTER_PROMPT (e.g. mongosh when applicable, no Terminal block for node, skeleton + inlineHints, keyConcepts 4+, prerequisites).
- You want a **fix plan** listing gaps and recommended fixes so you can bring labs in line with the standard.

### Option A: Full audit (all labs)

1. **Open the prompt**  
   Open [VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md) and copy the **Master prompt** (under “Master prompt (copy from here)”).

2. **Run it**  
   Paste the prompt in Cursor (or your LLM). You can add: “Output the fix plan to **Docs/YYYY-MM-DD_FIX_PLAN.md** where YYYY-MM-DD is today’s date.”

3. **Result**  
   The AI produces **Docs/YYYY-MM-DD_FIX_PLAN.md** with:
   - Summary (labs audited, with/without gaps).
   - Per-lab findings (criteria, status, action).
   - Step-level and enhancement-level gaps.
   - **Hint rendering test failures** (if any) from `npm test -- --run src/test/labs/validate-hint-rendering.test.ts`.
   - Recommended order of fixes.

4. **What you do after**  
   Work through the fix plan: fix each lab’s gaps (e.g. add keyConcepts, add mongosh to prerequisites, remove Terminal blocks, fix hint/skeleton line/blankText). Re-run validation after changes to confirm gaps are closed.

### Option B: Validate one topic or one lab (scoped)

1. **Use the “Validate by topic and lab name” prompt** in [VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md).

2. **In your message, provide:**
   - **Topic id** (required): e.g. `query`, `encryption`, `operations`.
   - **Lab id** (optional): e.g. `lab-text-search-basics`. If omitted, all labs in that topic are validated.

3. **Result**  
   The AI outputs a **short report** in the chat: either “OK – no gaps for [topic/lab]” or a bullet list of gaps with lab id, step/enhancement id, and the exact fix. No fix plan file is created.

4. **What you do after**  
   Apply the suggested fixes for that topic/lab.

---

## Quick reference

| Goal | Doc to use | What you get |
|------|------------|--------------|
| Add a new lab | [ADD_LAB_MASTER_PROMPT.md](./ADD_LAB_MASTER_PROMPT.md) | Plan doc + lab file + enhancements + registration + tests (and branch) |
| Plan only (no code yet) | ADD_LAB_MASTER_PROMPT with “plan only” | Docs/PLAN_<lab-slug>.md |
| Audit all labs | [VALIDATE_LABS_MASTER_PROMPT.md](./VALIDATE_LABS_MASTER_PROMPT.md) (full Master prompt) | Docs/YYYY-MM-DD_FIX_PLAN.md |
| Audit one topic or lab | VALIDATE_LABS_MASTER_PROMPT (“Validate by topic and lab name” prompt) | Short report in chat (OK or list of fixes) |

---

## Related docs

- **[ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** – Checklist and flow (create lab file, enhancements, register, validate) and diagrams.
- **[CONTENT_STANDARDS.md](./CONTENT_STANDARDS.md)** – Lab and step standards (standardized approach, Run all / Run selection, skeleton + hints).
- **[LAB_FOLDER_STRUCTURE_GUIDELINE.md](./LAB_FOLDER_STRUCTURE_GUIDELINE.md)** – Where labs and enhancements live: `src/content/topics/<topic>/<pov>/`.
- **[HINT_AND_SKELETON_REFACTOR_PLAN.md](./HINT_AND_SKELETON_REFACTOR_PLAN.md)** – Authoring rules for placeholders and inline hints (when fixing hint-rendering failures).
