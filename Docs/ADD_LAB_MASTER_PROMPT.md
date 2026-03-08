# Master Template Prompt: Add a New Lab

Use this prompt to generate a complete new lab (lab file, enhancements, and registration) for the workshop framework. You can use it in **two ways**: give a **description** of what the lab should cover (required) and optionally a **proof number** or **source doc path** so the AI can read that file and infer steps and content; or provide **full structured inputs** and the AI will format them into the correct files.

This prompt follows the rules and principles in `**Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`** (minimum 3 steps per lab, enhancementId-based steps, enhancement metadata, tests, and—when completing a full phase—phase docs and full test suite). It also aligns with `**Docs/WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md**` (workshop session wizard, modes Demo/Lab/Challenge, templates in Atlas, session data in provided URI, clone session to change mode, key concepts side-by-side MongoDB vs competitor, combining topics with full lab steps, programming language and DB-per-lab). Lab steps use the **terminal and inline editor model** and **multi-runtime execution** described in **`Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md`** Phase 6 (inline Monaco editor + Run all / Run selection; real terminal tab for optional shell; Node, Mongosh, Bash, Python, and Java/C# when backends exist).

### Terminal and inline editor model (Phase 6 — multi-runtime execution)

Lab steps use the **browser IDE / terminal refactor** model described in **`Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md`** Phase 6:

- **Inline editor:** Each step’s code runs in the **Monaco-based inline editor** in StepView. Users execute via **Run all** and **Run selection** in the editor header; there is **no** separate “Terminal” code block that only runs `node file.cjs` or `python script.py`. The app sends the active block’s content to the appropriate backend route (`/api/run-node`, `/api/run-mongosh`, `/api/run-bash`, `/api/run-python`, etc.) and shows output in the **Console** panel below the editor.
- **Real terminal (optional):** The lab view has a **Terminal** tab (xterm.js + WebSocket PTY) for an interactive shell when attendees need ad-hoc commands. Lab steps do **not** depend on that tab; step execution is always via the inline editor and Run all / Run selection.
- **Multi-runtime:** Supported block languages include **Node/JS** (`.cjs`/`.js`), **mongosh**, **bash/shell**, **Python** (`.py`), and—when backend routes exist—**Java** (`.java`) and **C#** (`.cs`). Each block’s `language` and `filename` determine which executor runs it. Use the same pattern for all: skeleton + inlineHints, Run all / Run selection, output in Console.

When adding or updating labs, ensure steps use this model: inline editor for runnable code, no Terminal block that only invokes a runtime, and Console for output.

### Standardized approach (Lab 1 Step 3 – canonical pattern for all labs)

**All new labs, new steps, and updates to existing steps or labs must follow the approach implemented for Lab 1 (CSFLE) Step 3 (Key Vault setup).** This is the single source of truth for:

- **Execution:** There is **no Terminal block** that only runs `node file.cjs` (or similar). Users run code via **Run all** and **Run selection** in the editor header; the app executes the current tab’s content (node → run-node, mongosh → run-mongosh, python → run-python, etc.) using temp files when needed.
- **Mongosh flavour — prefer when possible:** **Whenever a step can be expressed in mongosh, include a Mongosh block.** For example: key vault index creation, listing/counting key vault documents, queries, aggregations, collection operations. The UI shows one composite slot **"mongosh ! node"** (or "mongosh ! python" when applicable) with **mongosh as the first and default tab**. Only omit Mongosh when the step **must** use a driver and cannot be done in mongosh (e.g. creating DEKs via `ClientEncryption.createDataKey`, auto-encrypt on insert, rewrapManyDataKey, explicit encrypt for migration). In those cases the step has **one block only** (the driver script); the editor shows the filename only and **no mongosh tab**. Reference: CSFLE uses Mongosh for `csfle.init-keyvault` (key vault index); create-deks, verify-dek, test-csfle, complete-application are Node-only. QE and Right to Erasure steps are Node-only.
- **Node + Mongosh steps:** When a step offers both a Node (`.cjs`/`.js`) script and a Mongosh alternative, define **exactly two blocks** in the enhancement: (1) the Node block (e.g. `keyvault-setup.cjs`), (2) the Mongosh block (`filename: 'Mongosh'`, `language: 'mongosh'`). **Do not add a third Terminal block.** The UI shows one composite slot with header **"mongosh ! node"**; mongosh is the first and default tab; Run all and Run selection run the active tab’s content.
- **Convert Node to Mongosh:** For every step that has Node (`.cjs`/`.js`) code and **can** be expressed in mongosh (CRUD, queries, aggregations, index creation, etc.), **create a Mongosh block that is the equivalent of the Node code**. Convert the existing Node logic to mongosh syntax (e.g. `MongoClient.connect` → `use <db>`; `coll.insertOne(doc)` → `db.collection.insertOne(doc)`; `console.log` → `print` or `printjson`). This gives users the **mongosh tab** so they can run the same step as mongosh or echo to the Terminal tab. **Keep the Node code**; add the Mongosh block as a second block. Reference: CRUD lab (`src/content/topics/query/crud/enhancements.ts`) and Rich Query labs.
- **Python, Java, C# blocks:** For steps that use Python, use `filename` ending in `.py` and `language: 'python'` (or `'py'`). The app runs Python via `/api/run-python`. Use the same rigour: `skeleton` and `inlineHints` for every block. For Java or C#, use `language: 'java'` or `'csharp'` and `.java`/`.cs` filenames; execution is stubbed until backend routes exist—still provide full code, skeleton, and hints so labs are ready when backends are added.
- **Skeleton and hints:** All code blocks (Node, Mongosh, Python, bash, etc.) use the same rigour: `skeleton` with placeholders and `inlineHints` with `line`, `blankText`, `hint`, `answer`. **At most one placeholder and one hint per row/code line**—no multiple blanks or multiple hints on the same line. Hint placement verification applies to all blocks (run the hint rendering test and do a visual check).
- **Tips:** Mention using Run all or Run selection to execute (no separate terminal). For Mongosh, note that return values are printed to the console.

**.cjs / .js steps (north star):** **Any step where the editor heading shows a filename ending in `.cjs` or `.js`** (i.e. the enhancement has at least one code block with such a `filename`) **must** follow the pattern above: no Terminal block that runs node; execution only via Run all / Run selection; **when the step can be done in mongosh, include the Mongosh block** (two blocks: Node first, then Mongosh). When validating existing labs, every such step must be checked and fixed to match Lab 1 Step 3. Reference: `csfle.init-keyvault` in `src/content/topics/encryption/csfle/enhancements.ts`.

**Reference implementation:** `src/content/topics/encryption/csfle/enhancements.ts` → `csfle.init-keyvault` (Lab 1 Step 3).

---

### Principal quality template: Encryption labs (CSFLE & Queryable Encryption)

Use **Lab 1: CSFLE Fundamentals** and **Lab 2: Queryable Encryption** as the principal reference for how elaborate and comprehensive labs and steps should be. Match their level of detail and structure. **Step structure and code-block patterns must follow the standardized approach above (Lab 1 Step 3).**

**Lab definitions to reference:**

- `src/content/topics/encryption/csfle/lab-csfle-fundamentals.ts` (Lab 1: CSFLE Fundamentals with AWS KMS)
- `src/content/topics/encryption/queryable-encryption/lab-queryable-encryption.ts` (Lab 2: Queryable Encryption & Range Queries)

**Required level of elaboration (align with CSFLE/QE):**


| Aspect                       | Minimum / style                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Steps per lab**            | Minimum 3; for **hands-on labs require 5–6 steps** (prefer 6 when the topic supports it). CSFLE has 7, QE has 4+; aggregation and query labs should have at least 5–6. Overview-only labs may have 3. **Every step must be actual code**—no step that only lists resources, links, or “next steps”; put those in keyInsight, keyConcepts, or the lab description.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Step narrative**           | **2–4 sentences** explaining the *why* and *what* (not one line). Example: "The CMK is the root of trust in Envelope Encryption. It never leaves the KMS Hardware Security Module (HSM). This key will wrap (encrypt) the Data Encryption Keys (DEKs) that MongoDB stores."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Step instructions**        | **Concrete, actionable** (bullet or numbered). Tell the user exactly what to run, create, or do—e.g. "Run the AWS CLI command to create a new symmetric key, create an alias for easier reference, and save the Key ID for the next step."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Hints per step**           | **3–5 hints** where the step has code or verification (CSFLE steps have 3–4 hints each). Hints should guide without giving the answer away (e.g. "The AWS KMS command to create a new key is create-key (no space).").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Key concepts**             | **4+ terms** with clear explanations (e.g. CSFLE, Envelope Encryption, DEK, CMK).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Lab overview page**        | **Every lab must have an overview (intro tab)** that attendees see before starting steps. Create it using **external research** and the source doc. Include: **whatYouWillBuild** (array of 3–6 short bullets: what the attendee will build or learn), **keyInsight** (1–2 sentences capturing the main takeaway or "why this matters"), and **keyConcepts** (4+ terms with explanations). Use MongoDB docs and the source to make overview content accurate and engaging. The overview sets expectations and motivates the lab; do not leave it as a one-line description.                                                                                                                                                                                                                                                                                                      |
| **Prerequisites**            | List concrete prerequisites (Atlas M10+, AWS IAM, Node.js, etc.). **When the lab has any step with a Mongosh block:** always include **mongosh** (MongoDB Shell) in prerequisites—e.g. "mongosh installed; path configured in Workshop Settings so Run can execute mongosh blocks." Without this, attendees may see Run fail or "mongosh missing" when the path is not set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **dataRequirements**         | Include when the lab uses collections, scripts, or files (keyVault, encrypted collection, etc.). **For labs that require pre-loaded data** (e.g. Rich Query Basics, in-place analytics, workload isolation)—so that steps can run queries/aggregations and get sensible results—include a `dataRequirements` array with at least one entry of `type: 'collection'` (with `namespace`, e.g. `RICH-QUERY.customers`) or `type: 'script'` (with `path` to a seed script). When implemented, the UI will show "Load Sample Data" before Start; reset will restore the original dataset. See `**Docs/LAB_SAMPLE_DATA_PLAN.md`**. **Multi-tenancy:** For any lab that creates DBs, collections, KMS aliases, key alt names, policy files, or temp paths, always use the suffix (e.g. `YOUR_SUFFIX` in code) so resources are unique per participant; see **Multi-tenancy** subsection. |
| **Per-step metadata**        | Each step: `estimatedTimeMinutes`, `points`, `sourceProof`, `sourceSection`, `verificationId` (when verification exists), `modes` (e.g. `['lab','demo','challenge']`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Verification / validation** | **Mandatory:** For every step that declares a `verificationId`, you **must implement real verification logic** and register it. (1) Add the ID to the `VerificationId` type in `src/services/verificationService.ts`. (2) Add a `case` in `VerificationService.verify()` that runs a concrete check (e.g. `validatorUtils.check...`, or run a reference query/script and assert on the result). **Do not** add a step with `verificationId` that only returns a generic “run the code to verify” message—that is not acceptable. If you cannot implement automated verification for a step, **omit `verificationId`** from that step so the UI does not promise validation. Unregistered IDs cause "Unknown verification id"; stub handlers that do not validate cause confusion. When creating a new lab, implement and register verification for each step that has `verificationId`, or leave `verificationId` out. |
| **Enhancement code blocks**  | Full working code (or clear text/shell); **for every Node, Mongosh, or Python code block always include `skeleton` and `inlineHints`**. `tips` array (2–4 tips per enhancement). See **Placeholders** below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **No Terminal block**        | **Do not** add a Terminal (bash) block that only runs `node file.cjs`, `python script.py`, or similar. Execution is via **Run all** and **Run selection** in the **inline editor** (Phase 6 model); the app runs the current tab’s content. Steps that only have a Node script have one block; steps with Node + Mongosh have two blocks (no Terminal).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Node + Mongosh composite** | When a step offers both a Node (`.cjs`/`.js`) script and a Mongosh alternative, define **exactly two blocks**: (1) Node block (e.g. `keyvault-setup.cjs`), (2) `filename: 'Mongosh'`, `language: 'mongosh'`. **No Terminal block.** UI shows one slot **"mongosh ! node"**; mongosh first and default; Run all / Run selection run the active tab (node → run-node, mongosh → run-mongosh). **Prefer including a Mongosh block whenever the step can be expressed in mongosh** (e.g. key vault index, queries, aggregations, CRUD). **Convert existing Node code to mongosh:** the Mongosh block must implement the same logic as the Node block so users can run either or echo to Terminal. Omit Mongosh only for driver-only actions (create DEK, auto-encrypt, rewrap, etc.)—those steps have one block and no mongosh tab. |
| **Mongosh blocks**           | Same rigour as Node blocks: `skeleton` with placeholders and `inlineHints` (`line`, `blankText`, `hint`, `answer`). Run hint rendering validation and visual check so "?" aligns with each placeholder. Use `$exists` (not `exists`) in MongoDB operators where required (e.g. partialFilterExpression). **Always print query/aggregation output** so the lab console shows results: for `find()` use `printjson(db.collection.find({...}).toArray())` (or assign to a variable then `printjson(variable)`); for `aggregate()` use `printjson(db.collection.aggregate([...]).toArray())`; for `explain()` use `printjson(cursor.explain('executionStats'))`. Do not leave bare `find()` or `aggregate()` with no output—cursors do not auto-print when run from a script. **Mongosh availability:** For steps that include a Mongosh block, add a tip that Run requires mongosh to be installed and its path set in Workshop Settings (e.g. "Run uses the mongosh path from Workshop Settings; ensure it is set if Run fails."). The lab's prerequisites must list mongosh when any step has a Mongosh block. **Solution display:** When the solution is revealed, the UI shows (1) the **shell command first** (e.g. `mongosh "<URI>"` for mongosh blocks), then (2) the script. Authors keep enhancement `code` and `skeleton` as **script only** (no connection line); the framework prepends the shell line when displaying the revealed solution. Run still sends only the script to the executor. |
| **Python / Java / C# blocks** | Use `language: 'python'` (or `'py'`), `'java'`, or `'csharp'` and filenames `.py`, `.java`, `.cs`. Same pattern: skeleton + inlineHints, Run all / Run selection. Python runs via `/api/run-python`; Java/C# are stubbed until backend routes exist—still provide full code and hints. |
| **Console output (Node and Mongosh)** | **Every runnable step must produce visible output in the lab console.** For **Node** blocks: after any `find()`, `aggregate()`, or other query, add `console.log(JSON.stringify(results, null, 2))` (or equivalent) so the captured stdout shows the data. For **Mongosh** blocks: use `printjson(...)` or `print(EJSON.stringify(..., null, 2))` so query/aggregation results appear. Attendees expect to see JSON (or formatted) output when they run a query step; steps that run without printing/logging output are confusing. |
| **Validate query syntax** | **Before shipping a lab, validate that every query and aggregation runs correctly.** Run the **full solution code** (the `code` property of each enhancement block, not just the skeleton) against a real MongoDB instance or the lab environment. This catches syntax errors (e.g. `$unwind` path must be prefixed with `$`, or `$unwind: { path: '$fieldName' }`), wrong stage names, and invalid expressions. If the solution code fails, fix it and re-run until it succeeds. Do not assume that hand-written queries are valid—always test with the complete solution. |


**Avoid:** One-sentence narratives, steps without hints where guidance is needed, missing keyConcepts or prerequisites, **Terminal blocks that only run node**, **a step that only compiles resources/links** (every step must be runnable code), **missing or thin lab overview (intro tab)**—the overview must be created with research and include whatYouWillBuild, keyInsight, and keyConcepts—or labs that feel sparse compared to the encryption labs. **Do not add a `verificationId` unless you implement real verification in `VerificationService`**—unregistered IDs cause "Unknown verification id"; stub “run the code to verify” handlers are not acceptable. **Do not create resources without the suffix:** databases, collections, KMS aliases, key alt names, policy files, temp/file paths, or any other resource that could collide across participants must use the lab user suffix (e.g. `YOUR_SUFFIX` in code so the runtime can substitute); see **Multi-tenancy** above. **Do not omit mongosh from prerequisites when the lab has Mongosh blocks**—attendees need mongosh installed and the path configured in Workshop Settings for Run to work; otherwise they see "mongosh missing" or Run failures.

### Workshop infrastructure (for reference)

- **Leaderboard:** The app uses the **central obfuscated leaderboard** by default (no local leaderboard DB required for lab content). Operators can override with `LEADERBOARD_MONGODB_URI` if needed; lab authors do not configure this.
- **Run execution:** Node and Python blocks run via `/api/run-node` and `/api/run-python` using structured temp paths with the lab user suffix for per-participant isolation. Mongosh blocks require a valid **mongosh** binary path (set in Workshop Settings) and a MongoDB URI for the lab cluster.

### Placeholders (skeleton + inlineHints)

For every enhancement that has a Node, Mongosh, Python, or other runnable code block, always include a **skeleton** and **inlineHints**.

- **Balanced number:** **2–4 blanks per code block** (or 3–5 per step if multiple blocks). Avoid 0 blanks and avoid more than ~5 per block so the step stays focused.
- **Places that make sense:** Put blanks where the learner should reason or look up: **API/method names** (e.g. `insertOne`, `find`, `$set`), **key string literals** (collection name, filter values), **important arguments** (e.g. filter keys, projection fields). Do not put blanks on boilerplate (requires, `async function run`, `client.close()`).
- **One placeholder and hint per line:** **At most one** placeholder and **one** inline hint per row/code line. Do not put two blanks on the same skeleton line and do not assign two `inlineHints` entries to the same `line` number. If you need multiple blanks in a step, put each on its own line (e.g. add a comment line with a single blank, or split the statement across lines so each line has at most one blank). The UI and hint marker placement assume one blank per line.
- **Format:** Skeleton uses a single placeholder per blank (e.g. `_________` or `_______`); each `inlineHint` has `line` (1-based index into the skeleton string split by newlines), `blankText` (exact string in skeleton), `hint`, `answer`. Reference: `csfle.init-keyvault` and `csfle.create-cmk` in `src/content/topics/encryption/csfle/enhancements.ts`; see `**Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md`** for authoring rules.

### Multi-tenancy: unique resource names (suffix)

**The workshop supports multiple participants (and sessions) sharing the same cluster or KMS.** All resources created by lab code must be unique per participant. The runtime provides a **suffix** (from Lab Setup: firstname-lastname or email local part; see `getLabUserSuffix()` and placeholder substitution in `src/labs/stepEnhancementRegistry.ts`).

**Rule: the suffix must always be appended (or used as the unique part) for every resource that the lab creates.** Never hardcode a single database name, collection name, KMS alias, key alt name, policy file path, or temp file path that would be shared by all participants.

**Resources that must use the suffix:**


| Resource type                  | Example                                         | How to make unique                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Databases**                  | Key vault DB, app DBs                           | Use names like `encryption_<suffix>`, `medical_<suffix>`, `hr_<suffix>` (or `YOUR_SUFFIX` in code; runtime substitutes).                                                                                                                                                                                                                         |
| **Collections**                | Key vault collection, app collections           | Use a DB that already includes the suffix, or namespace like `encryption_<suffix>.keyvault`.                                                                                                                                                                                                                                                     |
| **KMS alias**                  | AWS KMS key alias                               | Use `alias/mongodb-lab-key-<suffix>` (placeholder: `YOUR_SUFFIX` in code).                                                                                                                                                                                                                                                                       |
| **Key alt names (DEKs)**       | CSFLE/QE keyAltNames                            | Use e.g. `user-<suffix>-ssn-key` so each participant has their own DEK.                                                                                                                                                                                                                                                                          |
| **Policy files**               | Local KMS policy, config files                  | If the lab writes a policy or config file, the filename or path must include the suffix (e.g. `policy-<suffix>.json`) so multiple participants do not overwrite the same file.                                                                                                                                                                   |
| **Temp / .cjs files**          | Scripts run via Run all                         | The app uses temp files when executing; when lab code or verification writes files (e.g. to disk), use a path that includes the suffix. For code that only runs in the provided execution environment, the run-node/run-mongosh APIs pass the suffix where needed; enhancement code that references DBs/collections/aliases must use the suffix. |
| **Any other created resource** | Indexes, key vault documents, connection config | Any name that could collide across participants must include the suffix.                                                                                                                                                                                                                                                                         |


**In enhancement code:** Use the placeholder `**YOUR_SUFFIX`** in strings that become database names, collection names, KMS aliases, key alt names, or file paths. The runtime replaces `YOUR_SUFFIX` with the actual lab user suffix before execution. Do not hardcode a single value (e.g. `encryption` or `medical`) for a database that participants create or use—always use `encryption_YOUR_SUFFIX`, `medical_YOUR_SUFFIX`, etc., or the equivalent alias/keyAltName pattern. Reference: CSFLE and Right to Erasure enhancements in `src/content/topics/encryption/csfle/enhancements.ts` and `right-to-erasure/enhancements.ts`; `src/labs/stepEnhancementRegistry.ts` (substitution and `getLabUserSuffix()`).

**CRUD and other per-user DB names:** For labs that use a shared per-user database (e.g. CRUD lab), use the **plain name** in enhancement content (e.g. `crud_lab` in `use crud_lab;` and `client.db("crud_lab")`). The framework substitutes `crud_lab` → `crud_lab_<suffix>` at build time (`substitutePlaceholders` in `stepEnhancementRegistry.ts`), so the displayed skeleton and solution show the suffixed name (e.g. `use crud_lab_ll-pp;`). Do not hardcode the suffix in the enhancement; the framework applies it so every participant sees their own DB name.

### TASK comments in code

In each code block (and its skeleton), add a short **step header** and a **TASK** line so learners see what to do at a glance. Use the same block in both `code` and `skeleton` (and adjust `inlineHints` line numbers if the header adds lines).

- **Format:** Start the file with: step title line (e.g. `// STEP 1: Connect and Insert (insertOne & insertMany)` or `# STEP 1: Create a Customer Master Key (CMK)` for shell), a separator line (e.g. `// ═══════════════════════════════════════`), a 1–2 line explanation, then `// TASK: …` (or `# TASK: …`) describing what to complete (e.g. “Complete the connect call and the insert methods (fill the blanks).”). Use `//` for JavaScript/Node, `#` for shell.
- **Example:** See `src/content/topics/query/crud/enhancements.ts` (e.g. `crud.connect-insert`) and CSFLE key-vault/CMK steps in `src/content/topics/encryption/csfle/enhancements.ts`.

### Use MongoDB official documentation and external research (mandatory)

**Before generating or expanding any lab, you MUST do research.** Do not rely only on the user description or a proof README. Use **MongoDB official documentation** and, when relevant, **existing MongoDB tutorials and guides** to decide what should be included and how to explain it.

- **MongoDB Manual:** [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/) (and subpaths such as /manual/reference/aggregation/, /atlas/, /drivers/).
- **Research steps:** (1) Look up the relevant section in the Manual (e.g. Aggregation Pipeline, $group, $lookup). (2) Identify which stages, operators, and patterns are essential for the lab topic. (3) Use the docs to define key concepts with accurate explanations and to ensure code examples follow current best practices. (4) When the source doc or user description is insufficient, **consult the manual and tutorials** to fill in implementation details, key concepts (4+), and prerequisites. **Do not guess; look up when unsure.**
- **Lab overview (intro tab):** Use this research and the source doc to create the **overview page**: **whatYouWillBuild** (3–6 bullets), **keyInsight** (1–2 sentences), and **keyConcepts** (4+). The overview must be accurate and compelling.
- **Step count for hands-on labs:** For any hands-on lab (query, aggregation, CRUD, search, etc.), **aim for at least 5–6 steps** (prefer 6 when the topic supports it). Three steps is the **minimum** only for short overview or conceptual labs. When expanding an existing lab that has only 3 steps, add steps so the lab has **5–6 steps total**, each with real runnable code, narratives, and hints.

---

## When does this apply?

The standardized approach and quality bar apply to **all** of the following:

- **Creating a new lab** (from scratch)
- **Adding a new step** to an existing lab
- **Updating an existing step** (narrative, instructions, or enhancement content)
- **Creating a totally new lab** in a new or existing topic/POV

In every case: no Terminal block for running node/python; **prefer the mongosh flavour when the step can be expressed in mongosh** (Node + Mongosh steps use two blocks; otherwise one block); skeleton + inlineHints for all code blocks (Node, Mongosh, Python, etc.); execution via Run all / Run selection in the inline editor (Phase 6 model). When validating, use `Docs/VALIDATE_LABS_MASTER_PROMPT.md` to audit existing labs against these rules.

---

## How to use this template

**Two modes:**


| Mode                  | You provide                                                                                                                                                                                                                                                       | AI does                                                                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Minimal (default)** | A **description** (required) and optionally a proof number or source doc path. If you provide a source, the AI reads it to infer steps and content; otherwise it infers from your description and may ask for topic/POV. Optionally: topic, POV folder, lab name. | Reads the source if provided; otherwise uses description + external research. Infers steps (min 3; prefer 5–7 for hands-on), narratives, instructions, enhancementIds, and code block content. Generates lab file, enhancements, registration, and tests. Runs validation after generating. |
| **Full structured**   | All inputs in the User inputs table (lab name, topic, POV folder, every step with title, narrative, instructions, enhancementId, etc.).                                                                                                                           | Uses your inputs directly and generates the same outputs (no inference from proof).                                                                                                                                                                                                         |


**When the AI will ask you for input:**

- **Minimal mode:** Only **Description** is required. **Source** (proof number or path to a guide) is optional: if you provide it, the AI reads that file to infer steps and content; if you omit it, the AI infers from your description and may ask for topic or POV folder. The AI prefers inferring topic, POV folder, and steps from description and (when given) source; it asks only when inference is impossible. If a source path was given but the file is not available, the AI will ask you to paste the relevant sections or confirm the path.
- **Full mode:** Only if a required field is missing (e.g. no steps, or enhancementId missing for a step) will the AI ask you to supply it.

**Self-contained labs:** Labs are self-contained with multiple steps the user must complete. The **number of steps** is determined by the LLM from the source doc and topic (minimum 3; prefer 5–7 for hands-on). Do not ask the user how many steps; infer and document the choice.

**Quick start (minimal):** Copy the **Master prompt** and one of the **Examples** below. Replace the example’s description and proof number with yours, paste into Cursor (or your LLM), then apply the generated file edits.

**Quick start (full):** Copy the **Master prompt**, fill every **[USER_INPUT: ...]** in the User inputs section with your values, paste into Cursor (or your LLM), then apply the generated file edits.

**In Cursor:** You can either paste the **User input block** with values filled in, or ask to "run the ADD_LAB prompt". When you run the prompt **without** a full User input block, the AI will **show a structured checklist** in the chat (required + optional items) so you know exactly what to provide; you **reply in the same chat** with your answers. The AI then uses those inputs to generate the lab and runs validation afterward. See **Interactive flow in Cursor** below.

---

## Interactive flow in Cursor (ask first, then generate)

**When the user says "run the ADD_LAB prompt" or "run @Docs/ADD_LAB_MASTER_PROMPT.md" (or similar) and has NOT already provided a full User input block with all key values, you MUST NOT start generating the lab.**

Instead, **present the required inputs as a structured checklist** so the user knows exactly what to provide. Use the format below every time you ask for input (do not substitute a single paragraph or one question at a time). The user will **reply in the same chat** with their answers for each item or paste the User input block with values filled in. Only after the user has provided at least the **required** inputs should you proceed to read the source, do research, and generate.

**Checklist format to use in chat:**

- **Header:** One short line of context, e.g. *"Adding a new lab — please provide these inputs (reply in chat or paste the User input block)."*
- **Required:** A clear list of items the user must fill in, each on its own line with a checkbox-style bullet so the user can provide input for each.
- **Optional:** A separate list of items the user may skip (you will infer or use defaults).

**Template to paste (the AI must output something like this):**

```
Adding a new lab — please provide these inputs.

Reply with your answers below (or paste the User input block from the doc with values filled in). I need at least Description before generating.

Required:
• Description — What is the lab about? (One short sentence.)

Optional — you can skip; I'll infer or use defaults:
• Source — Proof number (e.g. 17) or path to a guide (e.g. Docs/Guides/Lab_1_CSFLE.md). If provided, we use it to infer steps and content; otherwise we infer from your description and may ask for topic/POV.
• Topic (e.g. query, encryption, operations)
• POV folder (e.g. auto-ha, crud-operations)
• Lab name
```

**Fixed behavior (do not ask):** Placeholders (skeleton + inlineHints) are always generated. Validation runs after generating (default). Validation-only and revert-after-completion are not offered in the checklist.

**If the user has already pasted a full User input block** (with Description and optionally Source, Topic, POV folder, etc.), you may use those values and only ask for any missing required fields using the same checklist format. Do not ask for optional fields that are already present or that have sensible defaults.

---

## User input block (alternative: paste pre-filled)

Copy this block into your message when using **minimal** mode **and** you want to provide all values at once (instead of answering in the chat). Replace each `[USER_INPUT: ...]` with your value. If the user pastes this block with values filled in, the AI uses it and only asks for missing required fields. **If the user did NOT paste this block**, the AI must ask for the inputs **in the chat**, and the user **types their answers in the chat**; see **Interactive flow in Cursor** above.

```
- Description: [USER_INPUT: One sentence, what the lab is about]
- Source (optional): [USER_INPUT: Proof number e.g. 17 OR path e.g. Docs/Guides/Lab_1_CSFLE.md — we use it to infer steps; omit to infer from description]
- Topic: [USER_INPUT: e.g. operations — optional]
- POV folder: [USER_INPUT: e.g. auto-ha — optional]
- Lab name: [USER_INPUT: optional]
```

---

## User inputs (reference)

Use this table for **full structured** mode. For **minimal** mode, only the starred items are required in your message; the rest are inferred or asked for if missing.


| Input                                        | Your value                                                                                                                                     | Minimal mode                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Lab name**                                 | [USER_INPUT: Human-readable title, e.g. "Partial Recovery RPO Overview"]                                                                       | Optional; inferred from description or proof title                                                                      |
| **Topic**                                    | [USER_INPUT: topicId, must exist, e.g. operations]                                                                                             | Optional; ask if not inferrable from proof/POV                                                                          |
| **POV folder**                               | [USER_INPUT: kebab-case subfolder under topic, e.g. partial-recovery-rpo]                                                                      | Optional; ask if not inferrable (often kebab-case of POV label)                                                         |
| **POV capability ID(s)**                     | [USER_INPUT: e.g. ['PARTIAL-RECOVERY-RPO']]                                                                                                    | Optional; inferred from proof/POV.txt                                                                                   |
| **Description**                              | [USER_INPUT: One sentence, 20–200 chars]                                                                                                       | **Required** (what the lab is about)                                                                                    |
| **Proof number or Source doc path**          | [USER_INPUT: Proof number, e.g. 14, OR path e.g. Docs/Guides/Lab_1_CSFLE.md]                                                                   | Optional; if provided, AI reads it to infer steps and content; otherwise infers from description.                       |
| **Difficulty**                               | [USER_INPUT: beginner | intermediate | advanced]                                                                                               | Optional; default **intermediate**                                                                                      |
| **Estimated total time (minutes)**           | [USER_INPUT: Number, e.g. 25]                                                                                                                  | Optional; inferred from steps                                                                                           |
| **Modes**                                    | [USER_INPUT: e.g. ['lab','demo','challenge']]                                                                                                  | Optional; default **['lab','demo','challenge']**                                                                        |
| **Steps**                                    | [USER_INPUT: For each step: title, narrative, instructions, enhancementId, estimatedTimeMinutes, points. Min 3.]                               | Inferred from proof/source or description                                                                               |
| **Key concepts (optional)**                  | [USER_INPUT: term + explanation pairs, or "none"]                                                                                              | Optional; can infer from proof                                                                                          |
| **Tags (optional)**                          | [USER_INPUT: e.g. ['operations','backup','rpo'] or "none"]                                                                                     | Optional                                                                                                                |
| **Verification (optional)**                  | [USER_INPUT: verificationId per step or "none"]                                                                                                | Optional                                                                                                                |
| **Data requirements (optional)**             | [USER_INPUT: id, type, path, description; or "none"]                                                                                           | Optional; inferred from proof if needed                                                                                 |
| **Competitor products (optional)**           | [USER_INPUT: e.g. ['postgresql','cosmosdb-vcore','dynamodb'] or "none"]                                                                        | Optional; default "none". When set, generate competitor equivalent code per code block for demo side-by-side.           |
| **Default competitor (optional)**            | [USER_INPUT: e.g. postgresql]                                                                                                                  | Optional; only if competitor products are specified. Product shown by default in demo side-by-side.                     |
| **Elevated experience (preview) (optional)** | [USER_INPUT: For steps that benefit from an app-like preview, specify per step: `preview: { type, config }`. See "Elevated experience" below.] | Optional; infer when the step clearly fits (e.g. Search → type 'search', aggregation counts → type 'chart' or 'table'). |


**Notes:**

- **enhancementId** must use the same prefix as POV folder (e.g. POV folder `partial-recovery-rpo` → enhancementIds like `partial-recovery-rpo.concepts`, `partial-recovery-rpo.flow`).
- **topicId** must be one of: `query`, `encryption`, `analytics`, `scalability`, `operations`, `data-management`, `security`, `integration`, `deployment`.
- **Minimum 3 steps per lab** (per COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN). Each lab in a PoV phase must have at least 3 steps.
- **Minimum 3 labs per phase:** When starting a new PoV phase, the plan expects three labs (e.g. overview, setup, execute). Use this prompt once per lab; run it three times for a full phase.
- **Primary POV:** If the lab covers multiple POV capabilities, put it in the **topic + POV folder** that matches the **primary** capability (the main one the lab teaches). Example: a lab that teaches RICH-QUERY and touches encryption belongs in the RICH-QUERY folder.
- **Proof and capability:** Proof numbers and POV capability labels (e.g. PARTIAL-RECOVERY, REPORTING) are listed in `Docs/POV.txt`; source proof content is in `Docs/pov-proof-exercises/proofs/<n>/README.md`. Use the proof README for sourceSection names (Description, Setup, Execution, Measurement).
- **MongoDB docs:** Use MongoDB official documentation ([https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)) and other sources when needed to determine what to implement, define key concepts, and ensure correct terminology and code patterns.

### Elevated experience (preview) – generic component for any POV

When a step demonstrates a capability that is best shown as an **app-like preview** (search UI, table, chart, encryption demo, or diagram), add a `**preview`** field to that step so the workshop renders an elevated experience above the Console when the user clicks Run. The schema is generic: the same component (`GenericLabPreview`) renders based on `type` + `config`. You can add this for **any** POV—current or future—by emitting the right config.

**Schema (in lab step):** `preview?: LabStepPreviewConfig` — see `src/types/index.ts` for full types. Summary:


| type              | When to use                                                   | config shape (main fields)                                                                                  |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `search`          | Atlas Search, text search, autocomplete, faceted search       | `searchField`, `searchPlaceholder`, `autocomplete`, `facetFields`, `resultFields`, `showScore`, `highlight` |
| `table`           | Any step that returns a list of documents (find, aggregation) | `columns`, `maxRows`                                                                                        |
| `chart`           | Aggregation with counts or metrics (e.g. group by category)   | `chartType`: 'bar' | 'line' | 'pie', `xField`, `yField`, `title`                                            |
| `encryption-demo` | CSFLE/QE insert or query showing encrypted vs decrypted       | `mode`: 'insert' | 'query' | 'both', `fields`                                                               |
| `diagram`         | HA, scale-out, backup flow (topology, timeline)               | `variant`: 'topology' | 'timeline' | 'flow', `title`                                                        |
| `terminal`        | CLI-heavy step; no app preview, keep Console only             | (no config)                                                                                                 |


**Examples:**

- Atlas Search step (text search):  
  `preview: { type: 'search', config: { searchField: true, resultFields: ['name', 'description'], showScore: true } }`
- Aggregation returning counts:  
  `preview: { type: 'chart', config: { chartType: 'bar', xField: '_id', yField: 'count', title: 'Count by category' } }`
- Find/aggregation returning documents:  
  `preview: { type: 'table', config: { columns: ['name', 'price', 'category'], maxRows: 20 } }`

When generating a new lab, **consider** adding `preview` for steps where an app-like view would help (search, tables, charts, encryption demos). Omit it for purely terminal/CLI steps. See `**Docs/LAB_APP_PREVIEW_AND_VISUALIZATION.md`** for the full taxonomy and implementation details.

---

## Examples

**When to use which:** Use **Example 1 (minimal)** when you are happy to describe the lab in a few sentences and let the AI pull structure and content from the proof README. Use **Example 2 (full)** when you have already defined every step and want the AI only to format them.

### Example 1: Minimal input (describe the lab)

Use this when you want the AI to derive steps and content from the proof README. You only need to describe the lab and give the proof number; the AI will read `Docs/pov-proof-exercises/proofs/<n>/README.md` (or ask you to paste it) and create the lab.

**What you send (paste this into Cursor/LLM after the Master prompt):**

```
Using the ADD_LAB_MASTER_PROMPT template with minimal input:

- Proof number: 17
- Description: Create an overview lab for AUTO-HA (single-region failover). The lab should explain what automatic failover is, how Atlas detects failures and promotes a secondary, and what the requirements are (replica set, same region). Keep it conceptual for beginners; no hands-on cluster setup in this lab.

- Topic: operations (if not clear from proof)
- POV folder: auto-ha (if not clear from proof)
```

The AI will then read (or ask for) `Docs/pov-proof-exercises/proofs/17/README.md`, infer at least 3 steps (e.g. concepts, flow, requirements), generate enhancementIds like `auto-ha.concepts`, `auto-ha.flow`, `auto-ha.requirements`, and produce the full lab file, enhancements file, index/loader registration, and test file. If topic or POV folder cannot be inferred, the AI will ask you.

### Example 2: Full structured input (all fields provided)

Use this when you have already decided every step and want the AI to format them into the correct file structure. You supply all inputs; the AI does not read the proof README.

**What you send (paste this into Cursor/LLM after the Master prompt):**

```
Using the ADD_LAB_MASTER_PROMPT template with full structured input:

- Lab name: AUTO-HA Overview
- Topic: operations
- POV folder: auto-ha
- POV capability ID(s): ['AUTO-HA']
- Proof number: 17
- Description: Learn how MongoDB Atlas provides automatic failover in a single region with no manual intervention.
- Difficulty: beginner
- Estimated total time (minutes): 20
- Modes: ['lab','demo','challenge']
- Steps (minimum 3):
  1. Title: Step 1: Understand automatic failover | Narrative: Atlas monitors replica set members and automatically promotes a secondary to primary if the primary fails. | Instructions: Explain RTO and detection; no app changes needed. | enhancementId: auto-ha.concepts | estimatedTimeMinutes: 7 | points: 5
  2. Title: Step 2: Failover flow | Narrative: Failure detection, election, and client reconnection. | Instructions: Describe the sequence: primary down → election → new primary → drivers reconnect. | enhancementId: auto-ha.flow | estimatedTimeMinutes: 7 | points: 10
  3. Title: Step 3: Requirements | Narrative: Replica set, same region, recommended topology. | Instructions: List M10+, 3 nodes, same region for single-region AUTO-HA. | enhancementId: auto-ha.requirements | estimatedTimeMinutes: 6 | points: 10
- Key concepts: (term: Automatic failover, explanation: Atlas promotes a secondary to primary without manual steps) ; (term: RTO, explanation: Recovery time objective)
- Tags: ['operations','ha','failover','atlas']
- Verification: none
- Data requirements: none
```

The AI will use these values as-is and generate the lab file, enhancements (with code blocks and tips derived from your step content), registration, and tests.

---

## Master prompt (copy from here)

```
You are adding a new lab to the workshop framework.

**CRITICAL – Interactive flow:** When the user asks you to "run the ADD_LAB prompt" or run this prompt (e.g. "run @Docs/ADD_LAB_MASTER_PROMPT.md") and has **not** already provided a full User input block with at least Description, you MUST **present a structured checklist** in the chat (see "Interactive flow in Cursor" in this doc). Do NOT use a single run-on sentence or one question at a time. Output:
1. A short header line (e.g. "Adding a new lab — please provide these inputs.")
2. A **Required** section with one item: Description.
3. An **Optional** section: Source (with short explanation: if provided we use it to infer steps; otherwise we infer from description), Topic, POV folder, Lab name.

Do not ask about placeholders (always yes), validation-after (always yes), validation-only, or revert. The user will **reply in the chat** with their answers (or paste the User input block). Do NOT start reading the source or generating until you have at least Description. Only after the user has **replied** should you proceed. For minimal mode, if Topic or POV folder cannot be inferred and are missing, ask. After generating, always run validation.

You must support three modes:

**Mode A – Minimal input:** The user gives a **description** (required) and optionally a proof number or source doc path, topic, POV folder, lab name. In that case:
1. **Research first (mandatory):** Before generating, consult **MongoDB official documentation** (https://www.mongodb.com/docs/) and, when relevant, existing MongoDB tutorials and guides (e.g. aggregation pipeline, CRUD, search). Use this research to decide **what the lab should cover** and which stages/APIs/concepts to include. Do not rely only on the user description or proof README; the docs and tutorials define correct terminology, APIs, and recommended patterns.
2. **Read the source if provided:** If the user gave a source doc path (e.g. Docs/Guides/MyLab.md), read that file. If they gave a proof number, read Docs/pov-proof-exercises/proofs/<proof-number>/README.md. If no source was provided, infer from the description and your research. If a source was given but you cannot access it, ask the user to paste the relevant sections or confirm the path.
3. **Step count:** For hands-on labs (aggregation, query, CRUD, search, etc.), **plan at least 5–6 steps** (prefer 6 when the topic supports it). Minimum 3 steps is only for short overview/conceptual labs. When expanding an existing lab that has only 3 steps, add steps so the lab has **5–6 steps total**.
4. Use the **principal quality template** (CSFLE and Queryable Encryption labs) for elaboration: rich step narratives (2–4 sentences), detailed instructions, 3–5 hints per step where applicable, keyConcepts (4+), prerequisites, dataRequirements when needed. **Create the lab overview (intro page):** whatYouWillBuild (3–6 bullets), keyInsight (1–2 sentences), and keyConcepts (4+), using your research and the source so the overview is accurate and engaging.
5. From the source content, your research, and the user's description, infer: lab name (if not given), topic and POV folder (if not given—ask the user if you cannot infer), POV capability ID(s), **overview content (whatYouWillBuild, keyInsight, keyConcepts)**, steps with titles/narratives/instructions mapped to Description/Setup/Execution, enhancementIds (prefix = POV folder), and code block content for each enhancement.
6. Then generate the same outputs as below (lab file, enhancements file, index registration, loader registration if new prefix, tests). If any required value cannot be inferred (e.g. topic or POV folder), ask the user before generating. **Defaults when not specified:** difficulty = intermediate, modes = ['lab','demo','challenge'], verification = none unless step clearly needs it, data requirements = infer from lab description, competitor products = none.

**Mode B – Full structured input:** The user provides all of the following explicitly. Use their values directly; do not infer from the proof. Then generate the outputs below.

**Mode C – Validation only:** If the user sets **Run validation stand-alone only?** to yes, do **not** generate lab, enhancements, registration, or tests. Instead: (1) Run `node scripts/validate-content.js` and report output. (2) If the user specified a topic or lab id, run validation for that scope (see Docs/VALIDATE_LABS_MASTER_PROMPT). (3) Run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` and report pass/fail. Then stop.

**Quality bar:** Match the elaboration of the encryption labs (CSFLE and Queryable Encryption). **Every step must be actual code**—no step that only lists resources or links; put those in overview/keyInsight. **TASK comments:** In each code block (and skeleton), add a step header (e.g. `// STEP N: Title` or `# STEP N: Title`), a separator line, a 1–2 line explanation, and `// TASK: …` (or `# TASK: …`) stating what to complete; use `//` for JS/Node, `#` for shell. **Terminal and inline editor (Phase 6):** Lab steps use the inline editor (Monaco) and Run all / Run selection; no Terminal block that only runs node/python. Real terminal (xterm.js + PTY) is available in the lab Terminal tab for ad-hoc shell use. See `Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md` Phase 6. **Standardized approach (Lab 1 Step 3):** No Terminal block that only runs node/python; execution via Run all / Run selection. **Prefer mongosh when possible:** include a Mongosh block whenever the step can be expressed in mongosh (queries, key vault index, etc.); Node + Mongosh steps: two blocks (Node, then Mongosh), composite "mongosh ! node", mongosh first and default. For Python/Java/C#, use `language: 'python'`/`'java'`/`'csharp'` and skeleton + inlineHints; Python runs via /api/run-python; Java/C# stubbed until backend. **Always include skeleton and inlineHints** for every Node, Mongosh, or Python code block (do not output full code only). Placeholders: 2–4 blanks per code block in sensible places (API names, key literals, filter/update keys); see Placeholders subsection. Hint placement verification for all. Each step: narrative 2–4 sentences, concrete instructions, 3–5 hints where applicable, estimatedTimeMinutes, points, sourceProof, sourceSection, verificationId when applicable. Lab: keyConcepts (4+), **prerequisites** (when the lab has any Mongosh block, include **mongosh**—e.g. "mongosh installed; path in Workshop Settings for Run"), dataRequirements when needed. Require 5–6 steps for hands-on labs (prefer 6 when the topic supports it). **Mongosh availability:** For steps with a Mongosh block, add a tip that Run requires mongosh to be installed and path set in Workshop Settings so attendees avoid "mongosh missing" or Run failures. **Multi-tenancy (suffix):** All resources created by lab code (databases, collections, KMS aliases, key alt names, policy files, temp/file paths) must use the lab user suffix so they are unique per participant. In enhancement code use the placeholder **YOUR_SUFFIX** (runtime substitutes at execution); e.g. `encryption_YOUR_SUFFIX`, `alias/mongodb-lab-key-YOUR_SUFFIX`, `user-YOUR_SUFFIX-ssn-key`. Never hardcode a single DB/collection/alias/path that would be shared by all participants. See Multi-tenancy subsection in this doc and stepEnhancementRegistry.ts. Reference: Lab 1 Step 3 enhancement `csfle.init-keyvault` in src/content/topics/encryption/csfle/enhancements.ts; lab definitions in lab-csfle-fundamentals.ts and lab-queryable-encryption.ts; CRUD lab for TASK headers in src/content/topics/query/crud/enhancements.ts.

Reference shapes and types:
- Lab definition shape: WorkshopLabDefinition from @/types. Use lab-csfle-fundamentals.ts and lab-queryable-encryption.ts as style reference. **Lab overview (intro tab):** Include whatYouWillBuild (string[], 3–6 items), keyInsight (string, 1–2 sentences), and keyConcepts (4+). Create these using external research and the source doc. Steps use enhancementId only (no inline codeBlocks). Minimum 3 steps; require 5–6 for hands-on labs (prefer 6). Every step: id, title, narrative (2–4 sentences), instructions (concrete), estimatedTimeMinutes, points, modes, enhancementId, sourceProof, sourceSection, hints (3–5 where applicable), verificationId when verification exists. Lab-level: keyConcepts (4+), whatYouWillBuild, keyInsight, prerequisites, dataRequirements when needed (when the lab requires pre-loaded data use type 'collection' with namespace or type 'script' with path; see Docs/LAB_SAMPLE_DATA_PLAN.md), labFolderPath when proof folder is used.
- Enhancements shape: EnhancementMetadataRegistry from @/labs/enhancements/schema. Each entry: id, povCapability, sourceProof, sourceSection, codeBlocks (at least one block: filename, language, code; always include skeleton and inlineHints for Node/Mongosh), tips (2–4). For each code block, include skeleton and inlineHints with 2–4 blanks in sensible places (key API names, important literals, filter/update keys). blankText must match the skeleton placeholder exactly. Each inlineHint: `line` (1-based), `blankText`, `hint`, `answer`. Run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` to verify, and do a visual check in the browser. (In demo mode the UI shows full solution with no hint markers.)
- **Mongosh — prefer when possible:** Whenever a step can be expressed in mongosh (key vault index, queries, aggregations, list/count), include a Mongosh block. Only omit for driver-only actions (create DEK, auto-encrypt, rewrap, etc.).
- **Node + Mongosh composite:** When a step has both a Node (`.cjs`/`.js`) block and a Mongosh block (filename `Mongosh`, language `mongosh`), the UI shows one slot with header **"mongosh ! node"** (no filename shown). The **mongosh** tab is first and is the default view. Run all / Run selection execute the current tab's content (node → run-node, mongosh → run-mongosh; server uses temp files when needed). Both blocks can have skeleton + inlineHints.
- **Mongosh blocks:** Use the same skeleton + inlineHints pattern as Node/JS blocks: skeleton with placeholders, inlineHints with line, blankText, hint, answer. Hint placement verification applies to mongosh blocks too.
- **Python / Java / C# blocks:** Use `language: 'python'` (or `'py'`), `'java'`, or `'csharp'` with filenames `.py`, `.java`, `.cs`. Same pattern: skeleton + inlineHints, Run all / Run selection. Python runs via `/api/run-python`; Java/C# are stubbed until backend routes exist—still provide full code and hints.
- Registration: labs are registered in src/content/topics/index.ts (import + add to allLabs array). If the POV prefix is new, add an entry to the moduleMap in src/labs/enhancements/loader.ts (and to preloadAllEnhancements array if present).
- Enhancement tests: existing tests live in src/test/labs/ and use getStepEnhancement from @/labs/stepEnhancementRegistry. Example: src/test/labs/FullRecoveryRpoEnhancements.test.ts (describe per POV, one it() per enhancementId asserting enh is defined and codeBlocks contain expected content).

User inputs (for Mode B, replace placeholders; for Mode A, user gives description and optionally source, topic, POV folder, lab name):

- Lab name: [USER_INPUT: ...]
- Topic: [USER_INPUT: ...]
- POV folder: [USER_INPUT: ...]
- POV capability ID(s): [USER_INPUT: ...]
- Proof number or Source path: [USER_INPUT: optional]
- Description: [USER_INPUT: ...]
- Difficulty: [USER_INPUT: ...]
- Estimated total time (minutes): [USER_INPUT: ...]
- Modes: [USER_INPUT: ...]
- Steps (each: title, narrative, instructions, enhancementId, estimatedTimeMinutes, points); minimum 3 steps: [USER_INPUT: ...]
- Key concepts (optional): [USER_INPUT: ...]
- Tags (optional): [USER_INPUT: ...]
- Verification (optional): [USER_INPUT: ...]
- Data requirements (optional): [USER_INPUT: ...]
- Competitor products (optional): [USER_INPUT: e.g. ['postgresql','cosmosdb-vcore','dynamodb'] or "none"]
- Default competitor (optional): [USER_INPUT: e.g. postgresql]

Generate the following:

1. **Lab file** – Full content for src/content/topics/<topic>/<pov-folder>/lab-<slug>.ts. Use a valid export name (e.g. labPartialRecoveryRpoOverviewDefinition for "Partial Recovery RPO Overview"). **Include the lab overview (intro page) content:** whatYouWillBuild (array of 3–6 short strings: what the attendee will build/learn), keyInsight (1–2 sentences: main takeaway), and keyConcepts (4+ terms with explanations). Create these using external research and the source doc so the overview tab is accurate and engaging. Steps must reference enhancementId only (no inline codeBlocks). Minimum 3 steps. Step ids: lab-<slug>-step-1, lab-<slug>-step-2, etc. sourceProof: 'proofs/<proof-number>/README.md' or the source doc path, sourceSection per step where relevant. If the lab needs data/scripts/files, include dataRequirements array (id, type: 'file'|'collection'|'script', path, description, optional sizeHint; for type 'collection' include namespace). **When steps require pre-loaded data** (e.g. query/aggregation labs), include at least one requirement of type 'collection' (with namespace) or type 'script' (path to seed script) so the app can support "Load Sample Data" and reset = original dataset (see Docs/LAB_SAMPLE_DATA_PLAN.md). Optionally set labFolderPath to the proof folder (e.g. 'Docs/pov-proof-exercises/proofs/<proof-number>'). When competitor products were specified: add defaultCompetitorId (e.g. 'postgresql') and competitorIds (e.g. ['postgresql','cosmosdb-vcore','dynamodb']) to the lab definition.

2. **Enhancements file** – Full content for src/content/topics/<topic>/<pov-folder>/enhancements.ts. One entry per enhancementId used in the lab. Each entry: id, povCapability (from POV capability IDs), sourceProof: 'proofs/<proof-number>/README.md', sourceSection (e.g. 'Description', 'Execution', 'Setup'), codeBlocks (at least one block with filename, language, code; always add skeleton and inlineHints), tips (string array). **In each code and skeleton, add a TASK header** at the top: step title (e.g. `// STEP N: Title`), separator line, short explanation, then `// TASK: …` (or `# TASK: …` for shell). **For each code block, include skeleton and inlineHints with 2–4 blanks in sensible places** (key API names, important literals, filter/update keys). blankText must match the skeleton placeholder exactly; if the TASK header adds lines, increase all inlineHints line numbers accordingly. **Multi-tenancy:** For any code that creates or references databases, collections, KMS aliases, key alt names, policy files, or file paths, use the placeholder **YOUR_SUFFIX** so the runtime can substitute the lab user suffix (e.g. `encryption_YOUR_SUFFIX`, `alias/mongodb-lab-key-YOUR_SUFFIX`, `user-YOUR_SUFFIX-ssn-key`). Never hardcode a single resource name that would be shared by all participants. **Standardized approach (Lab 1 Step 3):** Do not add any Terminal (bash) block that only runs `node file.cjs`. Execution is via Run all / Run selection in the editor. When a step has both Node and Mongosh: list exactly two blocks—Node block first, then Mongosh block (filename 'Mongosh', language 'mongosh'); no Terminal block. The UI shows one composite slot "mongosh ! node"; mongosh first and default; Run all / Run selection run the active tab. Both Node and Mongosh blocks must have skeleton + inlineHints (line, blankText, hint, answer); blankText must match the skeleton placeholder exactly. Run hint placement verification for all blocks. When competitor products were specified: for each code block add competitorEquivalents (Record<productId, { language, code, workaroundNote? }>) for each product.

3. **Index registration** – Exact import statement to add to src/content/topics/index.ts and the exact line to add to the allLabs array (the export name from step 1).

4. **Loader registration** – If this POV prefix is new (not already in the loader's moduleMap), give the exact line to add to the moduleMap in src/labs/enhancements/loader.ts: 'prefix': () => import('@/content/topics/<topic>/<pov-folder>/enhancements'), and the line to add to preloadAllEnhancements array if that array exists in the file.

5. **Enhancement tests** – Full content for src/test/labs/<PovPascal>Enhancements.test.ts (e.g. PartialRecoveryRpoEnhancements.test.ts for POV folder partial-recovery-rpo). Use getStepEnhancement from @/labs/stepEnhancementRegistry. For each enhancementId used in the lab: one it('provides code block for <suffix> enhancement', async () => { const enh = await getStepEnhancement('<prefix>.<suffix>'); expect(enh).toBeDefined(); expect(enh?.codeBlocks?.length).toBeGreaterThan(0); expect(enh!.codeBlocks![0].code).toContain('<one or two meaningful strings from the enhancement content>'); }); Add one it('returns undefined for unknown enhancement id', ...) that expects getStepEnhancement('<prefix>.unknown-id') to be undefined. The tests must be runnable with: npx vitest run src/test/labs/<PovPascal>Enhancements.test.ts and must pass once the lab and enhancements are in place.
```

---

## After applying the prompt

**Validate existing labs:** To audit all labs against this prompt’s principles and get a dated fix plan, use `**Docs/VALIDATE_LABS_MASTER_PROMPT.md`**. It produces `Docs/YYYY-MM-DD_FIX_PLAN.md` with per-lab gaps and recommended fixes. To validate **a single topic or a single lab by name**, use the **Validate by topic and lab name** prompt in that same doc (provide topic id and optionally lab id; output is a short fix list or OK for that scope).

1. Create or overwrite the lab file at `src/content/topics/<topic>/<pov>/lab-<slug>.ts`.
2. Create or overwrite `src/content/topics/<topic>/<pov>/enhancements.ts` (if the POV folder already had enhancements, merge new entries instead of overwriting).
3. Add the import and allLabs entry in `src/content/topics/index.ts`.
4. If the POV prefix is new, add the moduleMap and preload entry in `src/labs/enhancements/loader.ts`.
5. **Create the enhancement test file** at `src/test/labs/<PovPascal>Enhancements.test.ts` (e.g. `PartialRecoveryRpoEnhancements.test.ts`). Run the tests and fix until they pass:
   ```bash
   npx vitest run src/test/labs/<PovPascal>Enhancements.test.ts
   ```
6. Run `node scripts/validate-content.js` and fix any reported issues.
7. **Run the full test suite** before considering the work complete (per plan): `npm run test -- --run` (or `npx vitest run`). Fix any regressions.
8. **Hint placement verification (required when the lab has skeleton + inlineHints):**
   - Run the hint rendering validation test so every `inlineHints` entry has a matching blank on the correct skeleton line:
   - Fix any failures by correcting `line` and/or `blankText` in the enhancement’s `inlineHints` so each blank exists on the given skeleton line (see `Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md` Section 7).
   - **Visual check:** Open each step that has a skeleton and inline hints in the browser and confirm the "?" hint marker appears **exactly where** the placeholder (e.g. `_____________`) is rendered in the editor. If it is misaligned, adjust the enhancement’s `inlineHints` (line numbers and `blankText` length) until the marker aligns.
9. Open the app and confirm the new lab appears and steps load enhancement content correctly.
10. **Run validation after generating (default):** Run `node scripts/validate-content.js`; run `npx vitest run src/test/labs/<PovPascal>Enhancements.test.ts`; if the lab has skeleton + inlineHints, run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts`. Report any failures and fix or list recommended fixes.

**When completing a full PoV phase (all 3 labs for a new POV):**

- Run the full test suite (required per COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN §6).
- Update `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`: set the phase status to Done, add the lab IDs to the PoV table, set the next phase as Next.
- Create `Docs/PHASE_N_<POV>_COMPLETION_SUMMARY.md` (e.g. PHASE_17_AUTO_HA_COMPLETION_SUMMARY.md) with deliverables, structure, and next phase.
- Cleanup: remove any obsolete files or legacy enhancements if you fully migrated or replaced content.

### Optional (when needed)

- **verificationId** – If any step has automated verification, add `verificationId` to that step and ensure the verification logic exists (e.g. in verificationService or validatorUtils).
- **dataRequirements** – If the lab needs specific data, scripts, or files, include a `dataRequirements` array in the lab definition (or on steps); use type 'file'|'collection'|'script', path, description, and for collections use `namespace` (e.g. `db.collection`). Optionally set `labFolderPath` to the proof folder (e.g. Docs/pov-proof-exercises/proofs/16). **For labs whose steps require pre-loaded collections** (e.g. query/aggregation labs so that Run returns sensible results), include at least one requirement of type 'collection' (with namespace) or type 'script' (with path to seed script). See `**Docs/LAB_SAMPLE_DATA_PLAN.md`** (supportive data, Load Sample Data UX, reset = original dataset).
- **Workshop templates / quests** – To include the lab in a workshop or quest, add its `lab-id` to `labIds` in the relevant file under `src/content/workshop-templates/` or `src/content/quests/`.
- **Intro diagram** – For an overview lab, you can add a diagram component in `src/labs/labIntroComponents.tsx` and reference it from the lab definition.

