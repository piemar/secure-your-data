# Master Template Prompt: Add a New Lab

Use this prompt to generate a complete new lab (lab file, enhancements, and registration) for the workshop framework. You can use it in **two ways**: give a short **description** of what the lab should cover (and proof number), and the AI will infer structure and content from the proof README; or provide **full structured inputs** and the AI will format them into the correct files.

This prompt follows the rules and principles in **`Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`** (minimum 3 steps per lab, enhancementId-based steps, enhancement metadata, tests, and—when completing a full phase—phase docs and full test suite). It also aligns with **`Docs/WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md`** (workshop session wizard, modes Demo/Lab/Challenge, templates in Atlas, session data in provided URI, clone session to change mode, key concepts side-by-side MongoDB vs competitor, combining topics with full lab steps, programming language and DB-per-lab).

### Standardized approach (Lab 1 Step 3 – canonical pattern for all labs)

**All new labs, new steps, and updates to existing steps or labs must follow the approach implemented for Lab 1 (CSFLE) Step 3 (Key Vault setup).** This is the single source of truth for:

- **Execution:** There is **no Terminal block** that only runs `node file.cjs` (or similar). Users run code via **Run all** and **Run selection** in the editor header; the app executes the current tab’s content (node → run-node, mongosh → run-mongosh) using temp files when needed.
- **Node + Mongosh steps:** When a step offers both a Node (`.cjs`/`.js`) script and a Mongosh alternative, define **exactly two blocks** in the enhancement: (1) the Node block (e.g. `keyvault-setup.cjs`), (2) the Mongosh block (`filename: 'Mongosh'`, `language: 'mongosh'`). **Do not add a third Terminal block.** The UI shows one composite slot with header **"mongosh ! node"**; mongosh is the first and default tab; Run all and Run selection run the active tab’s content.
- **When to include Mongosh:** **Only add a Mongosh block when the same functionality can be executed in mongosh** (e.g. creating the key vault index, or listing/counting key vault documents). **Do not add a Mongosh block** for steps where the action must be run with a driver (Node, Python, etc.) and cannot be run the same way in mongosh in the lab (e.g. creating DEKs via `ClientEncryption.createDataKey`, auto-encrypt on insert, rewrapManyDataKey, explicit encrypt for migration). In those cases the step has **one block only** (the driver script); the editor shows the filename only and **no mongosh tab**. Reference: CSFLE keeps Mongosh only for `csfle.init-keyvault` (key vault index); create-deks, verify-dek, test-csfle, complete-application are Node-only. QE and Right to Erasure steps are Node-only.
- **Skeleton and hints:** Both Node and Mongosh blocks use the same rigour: `skeleton` with placeholders and `inlineHints` with `line`, `blankText`, `hint`, `answer`. Hint placement verification applies to all blocks (run the hint rendering test and do a visual check).
- **Tips:** Mention using Run all or Run selection to execute (no separate terminal). For Mongosh, note that return values are printed to the console.

**\*.cjs / \*.js steps (north star):** **Any step where the editor heading shows a filename ending in `.cjs` or `.js`** (i.e. the enhancement has at least one code block with such a `filename`) **must** follow the pattern above: no Terminal block that runs node; execution only via Run all / Run selection; if the step has both Node and Mongosh content, exactly two blocks (Node first, then Mongosh). When validating existing labs, every such step must be checked and fixed to match Lab 1 Step 3. Reference: `csfle.init-keyvault` in `src/content/topics/encryption/csfle/enhancements.ts`.

**Reference implementation:** `src/content/topics/encryption/csfle/enhancements.ts` → `csfle.init-keyvault` (Lab 1 Step 3).

---

### Principal quality template: Encryption labs (CSFLE & Queryable Encryption)

Use **Lab 1: CSFLE Fundamentals** and **Lab 2: Queryable Encryption** as the principal reference for how elaborate and comprehensive labs and steps should be. Match their level of detail and structure. **Step structure and code-block patterns must follow the standardized approach above (Lab 1 Step 3).**

**Lab definitions to reference:**
- `src/content/topics/encryption/csfle/lab-csfle-fundamentals.ts` (Lab 1: CSFLE Fundamentals with AWS KMS)
- `src/content/topics/encryption/queryable-encryption/lab-queryable-encryption.ts` (Lab 2: Queryable Encryption & Range Queries)

**Required level of elaboration (align with CSFLE/QE):**

| Aspect | Minimum / style |
|--------|------------------|
| **Steps per lab** | Minimum 3; for hands-on labs prefer **5–7 steps** (CSFLE has 7, QE has 4+). Overview-only labs may have 3. |
| **Step narrative** | **2–4 sentences** explaining the *why* and *what* (not one line). Example: "The CMK is the root of trust in Envelope Encryption. It never leaves the KMS Hardware Security Module (HSM). This key will \"wrap\" (encrypt) the Data Encryption Keys (DEKs) that MongoDB stores." |
| **Step instructions** | **Concrete, actionable** (bullet or numbered). Tell the user exactly what to run, create, or do—e.g. "Run the AWS CLI command to create a new symmetric key, create an alias for easier reference, and save the Key ID for the next step." |
| **Hints per step** | **3–5 hints** where the step has code or verification (CSFLE steps have 3–4 hints each). Hints should guide without giving the answer away (e.g. "The AWS KMS command to create a new key is \"create-key\" (no space)."). |
| **Key concepts** | **4+ terms** with clear explanations (e.g. CSFLE, Envelope Encryption, DEK, CMK). |
| **Prerequisites** | List concrete prerequisites (Atlas M10+, AWS IAM, Node.js, etc.). |
| **dataRequirements** | Include when the lab uses collections, scripts, or files (keyVault, encrypted collection, etc.). **For labs that require pre-loaded data** (e.g. Rich Query Basics, in-place analytics, workload isolation)—so that steps can run queries/aggregations and get sensible results—include a `dataRequirements` array with at least one entry of `type: 'collection'` (with `namespace`, e.g. `RICH-QUERY.customers`) or `type: 'script'` (with `path` to a seed script). When implemented, the UI will show "Load Sample Data" before Start; reset will restore the original dataset. See **`Docs/LAB_SAMPLE_DATA_PLAN.md`**. |
| **Per-step metadata** | Each step: `estimatedTimeMinutes`, `points`, `sourceProof`, `sourceSection`, `verificationId` (when verification exists), `modes` (e.g. `['lab','demo','challenge']`). |
| **Enhancement code blocks** | Full working code (or clear text/shell); optional `skeleton` with `inlineHints` for fill-in-the-blank; `tips` array (2–4 tips per enhancement). |
| **No Terminal block** | **Do not** add a Terminal (bash) block that only runs `node file.cjs` or `node file.js`. Execution is via **Run all** and **Run selection** in the editor; the app runs the current tab’s content. Steps that only have a Node script have one block; steps with Node + Mongosh have two blocks (no Terminal). |
| **Node + Mongosh composite** | When a step offers both a Node (`.cjs`/`.js`) script and a Mongosh alternative, define **exactly two blocks**: (1) Node block (e.g. `keyvault-setup.cjs`), (2) `filename: 'Mongosh'`, `language: 'mongosh'`. **No Terminal block.** UI shows one slot **"mongosh ! node"**; mongosh first and default; Run all / Run selection run the active tab (node → run-node, mongosh → run-mongosh). **Only add a Mongosh block when the same functionality can be executed in mongosh** (e.g. key vault index); do not add Mongosh for driver-only actions (create DEK, auto-encrypt, rewrap, etc.)—those steps have one block and no mongosh tab. |
| **Mongosh blocks** | Same rigour as Node blocks: `skeleton` with placeholders and `inlineHints` (`line`, `blankText`, `hint`, `answer`). Run hint rendering validation and visual check so "?" aligns with each placeholder. Use `$exists` (not `exists`) in MongoDB operators where required (e.g. partialFilterExpression). |

**Avoid:** One-sentence narratives, steps without hints where guidance is needed, missing keyConcepts or prerequisites, **Terminal blocks that only run node**, or labs that feel sparse compared to the encryption labs.

### Use MongoDB official documentation and other sources

When inferring or elaborating lab content (what to implement, key concepts, correct terminology, code patterns), use **MongoDB official documentation** as the primary source. Use other sources when needed (e.g. driver docs, Atlas docs, cloud provider docs for KMS).

- **MongoDB Manual:** https://www.mongodb.com/docs/ (and subpaths such as /manual/, /atlas/, /drivers/).
- Use the docs to: identify correct APIs and options, define key concepts with accurate explanations, ensure code examples follow current best practices, and align step narratives with official terminology.
- When the proof README or user description is insufficient, consult the manual (or linked docs) to fill in implementation details, key concepts (4+), and prerequisites.

---

## When does this apply?

The standardized approach and quality bar apply to **all** of the following:

- **Creating a new lab** (from scratch)
- **Adding a new step** to an existing lab
- **Updating an existing step** (narrative, instructions, or enhancement content)
- **Creating a totally new lab** in a new or existing topic/POV

In every case: no Terminal block for running node; Node + Mongosh steps use two blocks only **when the step can run the same in mongosh** (otherwise one block, no mongosh tab); skeleton + inlineHints for all code blocks; execution via Run all / Run selection. When validating, use `Docs/VALIDATE_LABS_MASTER_PROMPT.md` to audit existing labs against these rules.

---

## How to use this template

**Two modes:**

| Mode | You provide | AI does |
|------|-------------|--------|
| **Minimal (default)** | A short description of what the lab is about, the proof number, and (optionally) topic, POV folder, lab name. | Reads the proof README (`Docs/pov-proof-exercises/proofs/<n>/README.md`), infers steps (min 3), narratives, instructions, enhancementIds, and code block content from Description/Setup/Execution/Measurement. Generates lab file, enhancements, registration, and tests. |
| **Full structured** | All inputs in the User inputs table (lab name, topic, POV folder, every step with title, narrative, instructions, enhancementId, etc.). | Uses your inputs directly and generates the same outputs (no inference from proof). |

**When the AI will ask you for input:**

- **Minimal mode:** If topic or POV folder cannot be inferred from the proof or your description, the AI will ask you to specify them. If the proof README is not available to the AI (e.g. not in context), the AI will ask you to paste the relevant sections (Description, Setup, Execution) or the path so it can work from that.
- **Full mode:** Only if a required field is missing (e.g. no steps, or enhancementId missing for a step) will the AI ask you to supply it.

**Quick start (minimal):** Copy the **Master prompt** and one of the **Examples** below. Replace the example’s description and proof number with yours, paste into Cursor (or your LLM), then apply the generated file edits.

**Quick start (full):** Copy the **Master prompt**, fill every **[USER_INPUT: ...]** in the User inputs section with your values, paste into Cursor (or your LLM), then apply the generated file edits.

---

## User inputs (reference)

Use this table for **full structured** mode. For **minimal** mode, only the starred items are required in your message; the rest are inferred or asked for if missing.

| Input | Your value | Minimal mode |
|-------|------------|---------------|
| **Lab name** | [USER_INPUT: Human-readable title, e.g. "Partial Recovery RPO Overview"] | Optional; inferred from description or proof title |
| **Topic** | [USER_INPUT: topicId, must exist, e.g. operations] | Optional; ask if not inferrable from proof/POV |
| **POV folder** | [USER_INPUT: kebab-case subfolder under topic, e.g. partial-recovery-rpo] | Optional; ask if not inferrable (often kebab-case of POV label) |
| **POV capability ID(s)** | [USER_INPUT: e.g. ['PARTIAL-RECOVERY-RPO']] | Optional; inferred from proof/POV.txt |
| **Proof number** | [USER_INPUT: Proof exercise number, e.g. 14] | **Required** (so AI can read proof README) |
| **Description** | [USER_INPUT: One sentence, 20–200 chars] | **Required** (what the lab is about) |
| **Difficulty** | [USER_INPUT: beginner \| intermediate \| advanced] | Optional; default intermediate |
| **Estimated total time (minutes)** | [USER_INPUT: Number, e.g. 25] | Optional; inferred from steps |
| **Modes** | [USER_INPUT: e.g. ['lab','demo','challenge']] | Optional; default lab, demo, challenge |
| **Steps** | [USER_INPUT: For each step: title, narrative, instructions, enhancementId, estimatedTimeMinutes, points. Min 3.] | Inferred from proof sections (Description, Setup, Execution) |
| **Key concepts (optional)** | [USER_INPUT: term + explanation pairs, or "none"] | Optional; can infer from proof |
| **Tags (optional)** | [USER_INPUT: e.g. ['operations','backup','rpo'] or "none"] | Optional |
| **Verification (optional)** | [USER_INPUT: verificationId per step or "none"] | Optional |
| **Data requirements (optional)** | [USER_INPUT: id, type, path, description; or "none"] | Optional; inferred from proof if needed |
| **Competitor products (optional)** | [USER_INPUT: e.g. ['postgresql','cosmosdb-vcore','dynamodb'] or "none"] | Optional; default "none". When set, generate competitor equivalent code per code block for demo side-by-side. |
| **Default competitor (optional)** | [USER_INPUT: e.g. postgresql] | Optional; only if competitor products are specified. Product shown by default in demo side-by-side. |
| **Elevated experience (preview) (optional)** | [USER_INPUT: For steps that benefit from an app-like preview, specify per step: `preview: { type, config }`. See "Elevated experience" below.] | Optional; infer when the step clearly fits (e.g. Search → type 'search', aggregation counts → type 'chart' or 'table'). |

**Notes:**

- **enhancementId** must use the same prefix as POV folder (e.g. POV folder `partial-recovery-rpo` → enhancementIds like `partial-recovery-rpo.concepts`, `partial-recovery-rpo.flow`).
- **topicId** must be one of: `query`, `encryption`, `analytics`, `scalability`, `operations`, `data-management`, `security`, `integration`, `deployment`.
- **Minimum 3 steps per lab** (per COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN). Each lab in a PoV phase must have at least 3 steps.
- **Minimum 3 labs per phase:** When starting a new PoV phase, the plan expects three labs (e.g. overview, setup, execute). Use this prompt once per lab; run it three times for a full phase.
- **Primary POV:** If the lab covers multiple POV capabilities, put it in the **topic + POV folder** that matches the **primary** capability (the main one the lab teaches). Example: a lab that teaches RICH-QUERY and touches encryption belongs in the RICH-QUERY folder.
- **Proof and capability:** Proof numbers and POV capability labels (e.g. PARTIAL-RECOVERY, REPORTING) are listed in `Docs/POV.txt`; source proof content is in `Docs/pov-proof-exercises/proofs/<n>/README.md`. Use the proof README for sourceSection names (Description, Setup, Execution, Measurement).
- **MongoDB docs:** Use MongoDB official documentation (https://www.mongodb.com/docs/) and other sources when needed to determine what to implement, define key concepts, and ensure correct terminology and code patterns.

### Elevated experience (preview) – generic component for any POV

When a step demonstrates a capability that is best shown as an **app-like preview** (search UI, table, chart, encryption demo, or diagram), add a **`preview`** field to that step so the workshop renders an elevated experience above the Console when the user clicks Run. The schema is generic: the same component (`GenericLabPreview`) renders based on `type` + `config`. You can add this for **any** POV—current or future—by emitting the right config.

**Schema (in lab step):** `preview?: LabStepPreviewConfig` — see `src/types/index.ts` for full types. Summary:

| type | When to use | config shape (main fields) |
|------|--------------|----------------------------|
| `search` | Atlas Search, text search, autocomplete, faceted search | `searchField`, `searchPlaceholder`, `autocomplete`, `facetFields`, `resultFields`, `showScore`, `highlight` |
| `table` | Any step that returns a list of documents (find, aggregation) | `columns`, `maxRows` |
| `chart` | Aggregation with counts or metrics (e.g. group by category) | `chartType`: 'bar' \| 'line' \| 'pie', `xField`, `yField`, `title` |
| `encryption-demo` | CSFLE/QE insert or query showing encrypted vs decrypted | `mode`: 'insert' \| 'query' \| 'both', `fields` |
| `diagram` | HA, scale-out, backup flow (topology, timeline) | `variant`: 'topology' \| 'timeline' \| 'flow', `title` |
| `terminal` | CLI-heavy step; no app preview, keep Console only | (no config) |

**Examples:**

- Atlas Search step (text search):  
  `preview: { type: 'search', config: { searchField: true, resultFields: ['name', 'description'], showScore: true } }`
- Aggregation returning counts:  
  `preview: { type: 'chart', config: { chartType: 'bar', xField: '_id', yField: 'count', title: 'Count by category' } }`
- Find/aggregation returning documents:  
  `preview: { type: 'table', config: { columns: ['name', 'price', 'category'], maxRows: 20 } }`

When generating a new lab, **consider** adding `preview` for steps where an app-like view would help (search, tables, charts, encryption demos). Omit it for purely terminal/CLI steps. See **`Docs/LAB_APP_PREVIEW_AND_VISUALIZATION.md`** for the full taxonomy and implementation details.

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
You are adding a new lab to the workshop framework. You must support two ways the user can provide input:

**Mode A – Minimal input:** The user gives a short description of what the lab is about and the proof number (and optionally topic, POV folder, lab name). In that case:
1. Read the proof README from Docs/pov-proof-exercises/proofs/<proof-number>/README.md. If you cannot access that file, ask the user to paste the relevant sections (Description, Setup, Execution, Measurement).
2. Use the **principal quality template** (CSFLE and Queryable Encryption labs) for elaboration: rich step narratives (2–4 sentences), detailed instructions, 3–5 hints per step where applicable, keyConcepts (4+), prerequisites, dataRequirements when needed, verificationId and sourceSection on every step. Prefer 5–7 steps for hands-on labs when the proof supports it. Use **MongoDB official documentation** (e.g. https://www.mongodb.com/docs/) to determine what to implement, how to phrase key concepts, and correct APIs/terminology; use other sources (driver docs, Atlas docs, cloud provider docs) when needed.
3. From the proof content and the user's description (and the docs when helpful), infer: lab name (if not given), topic and POV folder (if not given—ask the user if you cannot infer from POV.txt or proof), POV capability ID(s), steps with titles/narratives/instructions mapped to Description/Setup/Execution, enhancementIds (prefix = POV folder), key concepts, and code block content for each enhancement.
4. Then generate the same outputs as below (lab file, enhancements file, index registration, loader registration if new prefix, tests). If any required value cannot be inferred (e.g. topic or POV folder), ask the user before generating.

**Mode B – Full structured input:** The user provides all of the following explicitly. Use their values directly; do not infer from the proof. Then generate the outputs below.

**Quality bar:** Match the elaboration of the encryption labs (CSFLE and Queryable Encryption). **Standardized approach (Lab 1 Step 3):** No Terminal block that only runs node; execution via Run all / Run selection. Node + Mongosh steps: two blocks only (Node, then Mongosh) **when the same can run in mongosh**—otherwise one block, no mongosh tab; no Terminal; composite header "mongosh ! node" when both present, mongosh first and default. Skeleton + inlineHints for both Node and Mongosh blocks when present; hint placement verification for all. Each step: narrative 2–4 sentences, concrete instructions, 3–5 hints where applicable, estimatedTimeMinutes, points, sourceProof, sourceSection, verificationId when applicable. Lab: keyConcepts (4+), prerequisites, dataRequirements when needed. Prefer 5–7 steps for hands-on labs. Reference: Lab 1 Step 3 enhancement `csfle.init-keyvault` in src/content/topics/encryption/csfle/enhancements.ts; lab definitions in lab-csfle-fundamentals.ts and lab-queryable-encryption.ts.

Reference shapes and types:
- Lab definition shape: WorkshopLabDefinition from @/types. Use lab-csfle-fundamentals.ts and lab-queryable-encryption.ts as style reference. Steps use enhancementId only (no inline codeBlocks). Minimum 3 steps; prefer 5–7 for hands-on labs. Every step: id, title, narrative (2–4 sentences), instructions (concrete), estimatedTimeMinutes, points, modes, enhancementId, sourceProof, sourceSection, hints (3–5 where applicable), verificationId when verification exists. Lab-level: keyConcepts (4+), prerequisites, dataRequirements when needed (when the lab requires pre-loaded data use type 'collection' with namespace or type 'script' with path; see Docs/LAB_SAMPLE_DATA_PLAN.md), labFolderPath when proof folder is used.
- Enhancements shape: EnhancementMetadataRegistry from @/labs/enhancements/schema. Each entry: id, povCapability, sourceProof, sourceSection, codeBlocks (at least one block: filename, language, code; optional skeleton, inlineHints), tips (2–4). When using skeleton + inlineHints: each inlineHint must have `line` (1-based index into the skeleton string split by newlines) and `blankText` such that the skeleton line at that index contains that exact blank string; otherwise hint markers ("?") will not align. Run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` to verify, and do a visual check in the browser. (In demo mode the UI shows full solution with no hint markers.)
- **Node + Mongosh composite:** When a step has both a Node (`.cjs`/`.js`) block and a Mongosh block (filename `Mongosh`, language `mongosh`), the UI shows one slot with header **"mongosh ! node"** (no filename shown). The **mongosh** tab is first and is the default view. Run all / Run selection execute the current tab's content (node → run-node, mongosh → run-mongosh; server uses temp files when needed). Both blocks can have skeleton + inlineHints.
- **Mongosh blocks:** Use the same skeleton + inlineHints pattern as Node/JS blocks: skeleton with placeholders, inlineHints with line, blankText, hint, answer. Hint placement verification applies to mongosh blocks too.
- Registration: labs are registered in src/content/topics/index.ts (import + add to allLabs array). If the POV prefix is new, add an entry to the moduleMap in src/labs/enhancements/loader.ts (and to preloadAllEnhancements array if present).
- Enhancement tests: existing tests live in src/test/labs/ and use getStepEnhancement from @/labs/stepEnhancementRegistry. Example: src/test/labs/FullRecoveryRpoEnhancements.test.ts (describe per POV, one it() per enhancementId asserting enh is defined and codeBlocks contain expected content).

User inputs (for Mode B, replace placeholders; for Mode A, user gives description + proof number and optionally topic, POV folder, lab name):

- Lab name: [USER_INPUT: ...]
- Topic: [USER_INPUT: ...]
- POV folder: [USER_INPUT: ...]
- POV capability ID(s): [USER_INPUT: ...]
- Proof number: [USER_INPUT: ...]
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

1. **Lab file** – Full content for src/content/topics/<topic>/<pov-folder>/lab-<slug>.ts. Use a valid export name (e.g. labPartialRecoveryRpoOverviewDefinition for "Partial Recovery RPO Overview"). Steps must reference enhancementId only (no inline codeBlocks). Minimum 3 steps. Step ids: lab-<slug>-step-1, lab-<slug>-step-2, etc. sourceProof: 'proofs/<proof-number>/README.md', sourceSection per step where relevant. If the lab needs data/scripts/files, include dataRequirements array (id, type: 'file'|'collection'|'script', path, description, optional sizeHint; for type 'collection' include namespace). **When steps require pre-loaded data** (e.g. query/aggregation labs), include at least one requirement of type 'collection' (with namespace) or type 'script' (path to seed script) so the app can support "Load Sample Data" and reset = original dataset (see Docs/LAB_SAMPLE_DATA_PLAN.md). Optionally set labFolderPath to the proof folder (e.g. 'Docs/pov-proof-exercises/proofs/<proof-number>'). When competitor products were specified: add defaultCompetitorId (e.g. 'postgresql') and competitorIds (e.g. ['postgresql','cosmosdb-vcore','dynamodb']) to the lab definition.

2. **Enhancements file** – Full content for src/content/topics/<topic>/<pov-folder>/enhancements.ts. One entry per enhancementId used in the lab. Each entry: id, povCapability (from POV capability IDs), sourceProof: 'proofs/<proof-number>/README.md', sourceSection (e.g. 'Description', 'Execution', 'Setup'), codeBlocks (at least one block with filename, language, code; add skeleton/tips as appropriate), tips (string array). **Standardized approach (Lab 1 Step 3):** Do not add any Terminal (bash) block that only runs `node file.cjs`. Execution is via Run all / Run selection in the editor. When a step has both Node and Mongosh: list exactly two blocks—Node block first, then Mongosh block (filename 'Mongosh', language 'mongosh'); no Terminal block. UI shows one composite slot "mongosh ! node"; mongosh first and default; Run all / Run selection run the active tab. Both Node and Mongosh blocks must have skeleton + inlineHints (line, blankText, hint, answer) where the step uses fill-in-the-blank; blankText must match the skeleton placeholder exactly. Run hint placement verification for all blocks. When competitor products were specified: for each code block add competitorEquivalents (Record<productId, { language, code, workaroundNote? }>) for each product.

3. **Index registration** – Exact import statement to add to src/content/topics/index.ts and the exact line to add to the allLabs array (the export name from step 1).

4. **Loader registration** – If this POV prefix is new (not already in the loader's moduleMap), give the exact line to add to the moduleMap in src/labs/enhancements/loader.ts: 'prefix': () => import('@/content/topics/<topic>/<pov-folder>/enhancements'), and the line to add to preloadAllEnhancements array if that array exists in the file.

5. **Enhancement tests** – Full content for src/test/labs/<PovPascal>Enhancements.test.ts (e.g. PartialRecoveryRpoEnhancements.test.ts for POV folder partial-recovery-rpo). Use getStepEnhancement from @/labs/stepEnhancementRegistry. For each enhancementId used in the lab: one it('provides code block for <suffix> enhancement', async () => { const enh = await getStepEnhancement('<prefix>.<suffix>'); expect(enh).toBeDefined(); expect(enh?.codeBlocks?.length).toBeGreaterThan(0); expect(enh!.codeBlocks![0].code).toContain('<one or two meaningful strings from the enhancement content>'); }); Add one it('returns undefined for unknown enhancement id', ...) that expects getStepEnhancement('<prefix>.unknown-id') to be undefined. The tests must be runnable with: npx vitest run src/test/labs/<PovPascal>Enhancements.test.ts and must pass once the lab and enhancements are in place.
```

---

## After applying the prompt

**Validate existing labs:** To audit all labs against this prompt’s principles and get a dated fix plan, use **`Docs/VALIDATE_LABS_MASTER_PROMPT.md`**. It produces `Docs/YYYY-MM-DD_FIX_PLAN.md` with per-lab gaps and recommended fixes. To validate **a single topic or a single lab by name**, use the **Validate by topic and lab name** prompt in that same doc (provide topic id and optionally lab id; output is a short fix list or OK for that scope).

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
     ```bash
     npm test -- --run src/test/labs/validate-hint-rendering.test.ts
     ```
   - Fix any failures by correcting `line` and/or `blankText` in the enhancement’s `inlineHints` so each blank exists on the given skeleton line (see `Docs/HINT_AND_SKELETON_REFACTOR_PLAN.md` Section 7).
   - **Visual check:** Open each step that has a skeleton and inline hints in the browser and confirm the "?" hint marker appears **exactly where** the placeholder (e.g. `_____________`) is rendered in the editor. If it is misaligned, adjust the enhancement’s `inlineHints` (line numbers and `blankText` length) until the marker aligns.
9. Open the app and confirm the new lab appears and steps load enhancement content correctly.

**When completing a full PoV phase (all 3 labs for a new POV):**

- Run the full test suite (required per COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN §6).
- Update `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`: set the phase status to Done, add the lab IDs to the PoV table, set the next phase as Next.
- Create `Docs/PHASE_N_<POV>_COMPLETION_SUMMARY.md` (e.g. PHASE_17_AUTO_HA_COMPLETION_SUMMARY.md) with deliverables, structure, and next phase.
- Cleanup: remove any obsolete files or legacy enhancements if you fully migrated or replaced content.

### Optional (when needed)

- **verificationId** – If any step has automated verification, add `verificationId` to that step and ensure the verification logic exists (e.g. in verificationService or validatorUtils).
- **dataRequirements** – If the lab needs specific data, scripts, or files, include a `dataRequirements` array in the lab definition (or on steps); use type 'file'|'collection'|'script', path, description, and for collections use `namespace` (e.g. `db.collection`). Optionally set `labFolderPath` to the proof folder (e.g. Docs/pov-proof-exercises/proofs/16). **For labs whose steps require pre-loaded collections** (e.g. query/aggregation labs so that Run returns sensible results), include at least one requirement of type 'collection' (with namespace) or type 'script' (with path to seed script). See **`Docs/LAB_SAMPLE_DATA_PLAN.md`** (supportive data, Load Sample Data UX, reset = original dataset).
- **Workshop templates / quests** – To include the lab in a workshop or quest, add its `lab-id` to `labIds` in the relevant file under `src/content/workshop-templates/` or `src/content/quests/`.
- **Intro diagram** – For an overview lab, you can add a diagram component in `src/labs/labIntroComponents.tsx` and reference it from the lab definition.
