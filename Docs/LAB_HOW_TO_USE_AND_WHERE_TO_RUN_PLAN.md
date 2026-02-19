# Plan: Lab “How to Use” and “Where to Run” Clarity

**Branch:** `docs/lab-how-to-use-and-where-to-run`  
**Goal:** Make it explicit that code is **not** run inside the lab UI; attendees **copy (or type) code and run it in their own terminal/mongosh**, then use **Verify** in the lab. Remove ambiguity about “run from inside the lab” vs “copy to terminal.”

---

## 1. Audit summary (all labs)

### 1.1 Lab Setup

| Area | Current state | Gap |
|------|----------------|-----|
| **Lab Setup wizard** | Prerequisites checklist, URI input, “Check Prerequisites”, “Environment Ready” with “Open Lab 1 from the sidebar”. | No explanation that **in the labs** they will copy code into **their** terminal/mongosh and run it there. |
| **“Get Started” (ready phase)** | Single line: “Open Lab 1: CSFLE Fundamentals from the sidebar to create your first CMK.” | Doesn’t say *how* to use the lab (copy → run locally → Verify). |
| **LabEnvironmentDiagram** | Shows “Your laptop” with Terminal/Node/mongosh. | Could be referenced by a short “How to use the lab” line. |

### 1.2 Lab 1: CSFLE Fundamentals

| Step | Code block(s) | “Where to run” today | Gap |
|------|----------------|----------------------|-----|
| **L1 Step 1** – Create CMK | `Terminal - AWS CLI` | Filename only; `doThisSection`: “Run the AWS CLI command…”. | Doesn’t say “in **your** terminal” or “copy these commands into your terminal”. |
| **L1 Step 2** – KMS Key Policy | `AWS CLI - Put Key Policy` | No “run in terminal” in description. | Same as Step 1. |
| **L1 Step 3** – Key Vault index | `mongosh (MongoDB Shell - NOT Node.js)` | Tips: “Run this command in your MONGODB SHELL (mongosh)”; “use .editor for multiline”. | Good; could add one line in **description** that “you run this in mongosh on your machine”. |
| **L1 Step 5** – Generate DEKs | `createKey.cjs (Node.js)` + `Terminal - Run the script` | Tips: “RUN WITH NODE.JS”, “NOT MONGOSH”, “Run with: node createKey.cjs”. Second block: “Run the script in your terminal (NOT mongosh)”. | Good; description could still say “Copy the script to a file, then in **your** terminal run …”. |
| **L1 Step 5 Verify** – Verify DEK | `mongosh (MongoDB Shell - NOT Node.js)` | “Run this in mongosh … NOT in Node.js”. | Same small improvement as Step 3. |
| **L1 Step 6** – Test CSFLE | `testCSFLE.cjs` + `Terminal (NOT mongosh) - Run with Node.js` | Tips and filename clarify Node vs mongosh. | Optional: one sentence in description. |
| **L1 Step 7** – Complete app | `app.js` + `Terminal - Run the application` | Filename only. | Could add “Run in your terminal” in description. |

### 1.3 Lab 2: Queryable Encryption

| Step | Code block(s) | “Where to run” today | Gap |
|------|----------------|----------------------|-----|
| **L2 Step 1** – Create QE DEKs | `createQEDeks.cjs` + `Terminal - Run the script` | Second block: “Run in your terminal (NOT mongosh)”. | Description could say “Create the file, then run it in **your** terminal.” |
| **L2 Step 2** – Create QE collection | Node script + `Terminal - Run the Node.js script` + mongosh option in tips | “Run in your terminal (NOT mongosh)” in block. | Fine; optional one-liner in step description. |
| **L2 Step 3** – Insert QE data | Node script + `Terminal - Run the Node.js script` | Same pattern. | Same. |
| **L2 Step 4** – Query QE | Node script + `Terminal - Run the Node.js script` | Same. | Same. |

### 1.4 Lab 3: Right to Erasure

| Step | Code block(s) | “Where to run” today | Gap |
|------|----------------|----------------------|-----|
| **L3 Step 1** – Migration | `migrateToCSFLE.cjs` + `Terminal - Run the script` | “Run in your terminal” in terminal block. | Optional description line. |
| **L3 Step 2** – Multi-tenant | `multiTenantIsolation.cjs` + `Terminal - Run the script` | Same. | Same. |
| **L3 Step 3** – Key rotation | `rotateCMK.cjs` + `Terminal - Run the script` | Same. | Same. |
| **L3 Step 4** – KMS readiness | `AWS CLI - Verify New CMK Exists` | Filename only. | No explicit “copy these to **your** terminal and run them”. |

### 1.5 Shared UI (StepView)

| Element | Current state | Gap |
|---------|----------------|-----|
| **Verify tooltip** | “Local execution required: Run `npm run dev` locally with AWS CLI and mongosh.” | Explains *verification* runs locally; doesn’t explain that **all** commands/scripts are run by the user locally. |
| **After “Solution revealed”** | “Solution revealed • Copy the code and run it in your terminal”. | Good; only visible when solution is revealed. |
| **Default (skeleton) view** | No equivalent “copy and run in your terminal” callout. | First-time users may not see the message. |

---

## 2. Recommended changes (by priority)

### Priority 1: Single “How to use the lab” section (everyone sees it)

**Where:** Lab Setup, **before** or immediately after the prerequisites checklist, as a short always-visible block.

**Content (suggested):**

- **Title:** “How to use the labs”
- **Bullets:**
  1. **Code here is for reference and copy-paste.** Nothing runs inside the browser.
  2. **You run everything on your machine:** use **your** terminal for AWS CLI and Node.js scripts, and **mongosh** (MongoDB Shell) where the step says “mongosh”.
  3. **Workflow:** Read the step → copy (or type) the code → run it in the right place (terminal or mongosh) → come back and click **Verify** (then **Continue** when it passes).

**Implementation:**

- Add a small card or alert in `LabSetupWizard.tsx` in the onboarding phase (e.g. above or below `PrerequisitesChecklist`).
- Optional: add a one-line reminder in the “Environment Ready” phase, e.g. “In the labs, copy commands into your terminal or mongosh, run them, then use **Verify**.”

**Files:** `src/components/labs/LabSetupWizard.tsx`

---

### Priority 2: Lab 1 Step 1 – explicit “what to do” and “where to run”

**Where:** Lab 1, first step (Create CMK).

**Changes:**

1. **Step description**  
   Add a short “How to complete this step” sentence, e.g.:  
   *“Copy the commands below into **your** terminal (where AWS CLI is installed and configured), run them, then click **Verify** in this lab.”*

2. **Optional: doThisSection**  
   First bullet could be: “Open **your** terminal and run the AWS CLI commands below (copy or type them).”

**Files:** `src/components/labs/Lab1CSFLE.tsx` (step `l1s1`: `description` and optionally `doThisSection`).

---

### Priority 3: Global “where to run” callout in step view (first code step)

**Where:** StepView, when the current step has code blocks and it’s the **first** step that has code in that lab (e.g. Lab 1 Step 1, Lab 2 Step 1, Lab 3 Step 1).

**Change:**  
Show a single, dismissible (or always-on for first code step) info bar above the code area, e.g.:  
*“Copy the code below into **your** terminal (or mongosh, if the block says mongosh) and run it there. Then click **Verify** to check your progress.”*

**Implementation options:**

- **A)** Pass a prop like `isFirstStepWithCode` from lab to StepView and show the bar only when `true`.
- **B)** Show the bar on **every** step that has code blocks, with a shorter line: “Run this in **your** terminal or mongosh (see block title), then click **Verify**.”

Option B is simpler and reinforces the message on every step with code.

**Files:** `src/components/labs/StepView.tsx`, and optionally `LabViewWithTabs.tsx` (if using `isFirstStepWithCode`).

---

### Priority 4: Consistent code-block labels and first-line comments

**Where:** All labs.

**Current good practice:**  
Filenames like “Terminal - AWS CLI”, “Terminal (NOT mongosh) - Run with Node.js”, “mongosh (MongoDB Shell - NOT Node.js)” and first-line comments like “Run in your terminal (NOT mongosh)” are clear.

**Recommendation:**

- **Audit:** Ensure every block that must be run locally has either:
  - A filename that states the environment (e.g. “Terminal - …” or “mongosh - …”), or
  - A first line in the code that says “Run in your terminal” or “Run in mongosh”.
- **Add where missing:** e.g. Lab 1 Step 2 (“AWS CLI - Put Key Policy”) could have first line: `# Run these commands in your terminal (AWS CLI must be configured).`
- **Lab 3 Step 4:** First line of the AWS CLI block could be: `# Run these in your terminal (AWS CLI with access to KMS).`

**Files:** `Lab1CSFLE.tsx`, `Lab2QueryableEncryption.tsx`, `Lab3RightToErasure.tsx` (only the `code` and, if present, `skeleton` first lines where needed).

---

### Priority 5: Lab intro “How to use this lab” (per-lab reminder)

**Where:** Lab intro tab (Overview), for each lab.

**Change:**  
In `LabIntroTab`, add a short “How to use this lab” box (or a few lines under the description):

- “Code in each step is for you to **copy** and run in **your** terminal or **mongosh** (as indicated). Nothing runs in the browser. After running, click **Verify** (and **Continue** when it passes).”

**Files:** `src/components/labs/LabIntroTab.tsx` (new block or extra paragraph). Content could be passed as an optional prop so only labs that need it show it, or the same text for all.

---

### Priority 6: “Environment Ready” handoff text

**Where:** Lab Setup, “Environment Ready” card.

**Change:**  
In the “Get Started” area, expand the single sentence to two, e.g.:

- “Open **Lab 1: CSFLE Fundamentals** from the sidebar to create your first Customer Master Key (CMK).”
- “In each step you’ll **copy** commands or scripts into **your** terminal or mongosh, run them, then use **Verify** in the lab.”

**Files:** `src/components/labs/LabSetupWizard.tsx` (phase `ready`).

---

## 3. Implementation order (suggested)

1. **Priority 1** – “How to use the labs” in Lab Setup (single source of truth).
2. **Priority 6** – “Environment Ready” handoff (so leaving Setup sets expectations).
3. **Priority 2** – Lab 1 Step 1 description + optional doThisSection (unblocks the reported step).
4. **Priority 3** – StepView callout (reinforces “run in your terminal” on every step with code).
5. **Priority 4** – Audit and add first-line comments/filenames where “where to run” is still implicit.
6. **Priority 5** – Lab intro “How to use this lab” (nice-to-have reminder when starting a lab).

---

## 4. What to leave unchanged (recommendation)

- **Verify tooltip** (“Local execution required…”) – keep as is; it’s about the verification backend.
- **“Solution revealed • Copy the code and run it in your terminal”** – keep; consider making the same idea visible in Priority 3 for skeleton view.
- **Tips** that already say “Run in your terminal” / “NOT mongosh” – keep; they’re helpful for people who read tips.
- **No execution of code in the browser** – no change to architecture; only clarity in copy and UI.

---

## 5. Copy checklist (for implementer)

When editing step descriptions or UI text, use consistent phrasing:

- **Terminal (AWS CLI / Node.js):** “Copy into **your** terminal and run …” or “Run in **your** terminal.”
- **mongosh:** “Copy into **mongosh** (MongoDB Shell) and run …” or “Run in **mongosh** (not Node.js).”
- **Workflow:** “Then click **Verify** in this lab” / “Use **Verify** to check your progress.”
- **Principle:** “Code here is for reference; you run it on your machine.”

---

## 6. Summary

| # | Change | Location | Purpose |
|---|--------|----------|---------|
| 1 | “How to use the labs” section | Lab Setup (onboarding) | Single, clear explanation for everyone. |
| 2 | Lab 1 Step 1 description + doThisSection | Lab1CSFLE.tsx | Remove “what do I do / where do I run?” on first step. |
| 3 | “Run in your terminal / mongosh” callout | StepView (steps with code) | Reinforce on every code step. |
| 4 | First-line comments / filenames | All lab step code blocks | Consistent “where to run” on each block. |
| 5 | “How to use this lab” on Overview | LabIntroTab | Short reminder when starting a lab. |
| 6 | “Environment Ready” handoff | LabSetupWizard (ready phase) | Set expectation: copy → run locally → Verify. |

All of the above are **copy and UI only**; no change to verification logic, routing, or execution environment. After you decide which priorities to implement, the work can be done entirely on the branch `docs/lab-how-to-use-and-where-to-run`.
