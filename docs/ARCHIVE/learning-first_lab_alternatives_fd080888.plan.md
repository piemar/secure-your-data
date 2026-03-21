---
name: Learning-first lab alternatives
overview: Address distinguished engineer feedback that fill-in-the-blank (skeleton + hints) does not require real understanding or thought, especially with AI. Propose alternative learning approaches and how Quest/challenge mode and the existing codebase could support them.
todos: []
isProject: false
---

# Learning-first lab alternatives (beyond fill-in-the-blank)

## The feedback in context

**Current model:** Labs use **skeleton + inlineHints**: code with blanks (`_________`) that learners fill in; hints give clues and answers. Challenge mode reuses the same content with **challengeSkeleton** (fewer clues) or **expertSkeleton** (minimal scaffolding) — see [StepView.tsx](src/components/labs/StepView.tsx) (e.g. lines 791–805). So even in challenge, the activity is still “complete this code,” which can be done by pattern-matching or AI without understanding.

**Core concern:** Fill-in-the-blank does not require understanding or thought; with AI it becomes trivial to get “correct” blanks. A better approach should require **reasoning, design, or implementation from a problem statement** rather than completing pre-shaped code.

---

## Alternative learning approaches

### 1. Outcome-only (objective + verification, no starter code)

**Idea:** Step shows only the **objective** and **constraints** (e.g. “Encrypt the `ssn` field in the `patients` collection using CSFLE and a key in the key vault”). No skeleton with blanks; optionally **reference docs** or a “reference solution” tab (read-only). Learner writes or assembles the solution. **Verification** (existing [VerificationService](src/services/verificationService.ts)) checks the outcome (e.g. field encrypted, key exists).

**Why it helps:** Success depends on achieving the outcome, not on filling blanks. Multiple valid implementations; understanding is needed to pass verification.

**Fit with today:** Verification is already outcome-based for many steps (e.g. `csfle.verifyEncryptionWorking`, `csfle.verifyDekCreated`). The gap is **content authoring**: most steps today ship skeleton+hints and optional verification. This approach would make **verification mandatory** for such steps and make the **primary content** the objective + constraints (+ docs), with full solution only as “reference” or after attempt.

### 2. Quest / Challenge as the primary “understanding” path

**Idea:** Position **Challenge mode + Quests** as the path for “real” learning: narrative → **mission** (problem statement) → labs as **problems to solve** with **flags** as success criteria. In challenge mode, prefer **expertSkeleton** (or no code at all) so the learner sees the goal, not the solution shape. **Flags** (e.g. [stop-the-leak](src/content/quests/stop-the-leak.ts): `flag-encrypted-pii-collections`) are already tied to `verificationId`; capturing a flag = passing outcome-based verification.

**Why it helps:** Quest narrative frames *why*; flags define *what success looks like* in observable terms. If the only way to capture a flag is to achieve the outcome (verified), and we don’t hand out solution-shaped code, learners must reason and implement.

**What’s needed:**  

- **Content:** For challenge mode, ensure steps have **expertSkeleton** (or an “objective-only” variant) that states the task without giving code structure.  
- **Product/UX:** Present Challenge/Quest as the recommended path for “learn by doing” and Lab as “guided walkthrough” (demo/onboarding).  
- **Flags:** Ensure every flag has **real verification** (no stub “run the code to verify”); see [verificationService.ts](src/services/verificationService.ts) (e.g. rich-query steps return a generic message; those don’t prove outcome).

### 3. Explain / reason steps (concept checks)

**Idea:** Insert steps that ask for **explanation or reasoning** (short text or multiple choice): e.g. “Why do we keep the key vault separate from the application DB?” or “What happens if you query on an unindexed encrypted field?” No code to fill in; understanding is checked by answer (manual review, or simple auto-check if multiple choice).

**Why it helps:** Forces articulation of understanding; not solvable by pasting code.

**Fit with today:** Would require a **step type** or **block type** (e.g. `type: 'concept-check'`) and optional **answer validation** (MCQ or keyword match). Not currently in the enhancement schema; would be an extension.

### 4. Fix broken code (debug / correct)

**Idea:** Give **incorrect or incomplete code** and ask the learner to fix it so that verification passes. No blanks; the learner must find and fix the bug or missing part.

**Why it helps:** Requires understanding what’s wrong and how the API or concept should be used.

**Fit with today:** Enhancement could have a `brokenCode` (or `buggySkeleton`) block instead of `skeleton` with blanks; same verification. UI would show “Fix this code so that Check progress passes.”

### 5. Open-ended implementation (many valid solutions)

**Idea:** Problem statement only, e.g. “Build an aggregation that returns the top 5 customers by revenue in the last 30 days.” Reference docs only. Verification runs a query or checks result shape/contents (e.g. 5 docs, has `revenue`, date filter). Many valid pipelines.

**Why it helps:** Requires design and implementation choices, not filling a single “right” shape.

**Fit with today:** Verification would need to be **flexible** (e.g. accept any pipeline that returns the right shape/data). Some validators already work on outcome (e.g. encrypted field present); others would need to be outcome-based rather than “run this exact code.”

---

## How Quest / Challenge mode can be the way forward


| Aspect                       | Current                                                | Learning-first direction                                                  |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| **Primary activity**         | Fill blanks in skeleton                                | Achieve objective (outcome); optional reference code                      |
| **Proof of success**         | Run code / optional verification                       | **Flags** = pass outcome-based verification                               |
| **Scaffolding in challenge** | challengeSkeleton / expertSkeleton (still code-shaped) | **Objective-only** or minimal starter (e.g. empty file + instructions)    |
| **Role of narrative**        | Context for labs                                       | **Quest** = mission; labs = problems to solve within that mission         |
| **Hints**                    | Reveal blanks                                          | Conceptual hints only (no “answer” for code); or hints that point to docs |


Concrete steps:

1. **Define an “objective-only” (or “open-ended”) step shape**
  - In enhancement schema/code: allow steps (or blocks) with **no skeleton**, only `objective`, `constraints`, and `verificationId`. Optionally `referenceCode` (read-only) or link to docs.  
  - [Enhancement schema](src/labs/enhancements/schema.ts): today has `skeleton`, `challengeSkeleton`, `expertSkeleton`; could add `objectiveOnly: true` and a text block for objective/constraints, and treat “no skeleton” as “learner writes from scratch.”
2. **Use challenge mode to prefer outcome-based flow**
  - In challenge mode, when a step has **expertSkeleton** or **objective-only**, show only the objective and constraints (and reference docs if any). No fill-in-the-blank.  
  - Ensure **verification** is implemented for those steps so “Check progress” / flag capture is the only way to advance.  
  - [StepView](src/components/labs/StepView.tsx) already chooses expert → challenge → guided; we’d add a path for “objective only” (no code block, or empty editor with “Write your solution” and a Reference tab).
3. **Expand verification coverage**
  - Replace stub verifications (e.g. “run the code to verify”) with **real checks** where possible (e.g. query result shape, collection state).  
  - Tie **flags** strictly to these verifications so capturing a flag means “outcome achieved.”
4. **Content and authoring**
  - **ADD_LAB / content standards:** Add an “understanding-first” track: when to use objective-only, when to provide reference code (read-only), when to use “fix broken code” instead of fill-in-the-blank.  
  - New or refactored labs: for challenge/quest, author **objectives + verification** first; add skeleton/hints only for “guided” or “demo” mode if desired.
5. **Optional: explain and fix-the-bug**
  - **Explain:** New block type or step type for concept checks (text/MCQ); optional.  
  - **Fix-the-bug:** New block variant (`brokenCode` / `buggySkeleton`) with same verification; UI labels it “Fix this code.”

---

## Summary: what needs to change


| Area                                  | Change                                                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content model**                     | Support objective-only (and optionally brokenCode / concept-check) steps; skeleton optional for challenge.                                                     |
| **StepView / LabRunner**              | In challenge mode, show objective-only when no skeleton (or expertSkeleton is “objective text”); optional Reference tab; “Check progress” = verification only. |
| **Verification**                      | Implement real outcome checks for more steps; remove “run code to verify” stubs where possible.                                                                |
| **Quests / flags**                    | Ensure every flag has outcome verification; position Quest as the path for “learn by achieving outcomes.”                                                      |
| **Docs (ADD_LAB, content standards)** | Document when to use objective-only, reference-only code, fix-the-bug, and concept checks; keep fill-in-the-blank as one option (e.g. guided/demo).            |


Quest/challenge mode **can** be the way forward if we (1) treat flags and verification as the proof of learning, (2) stop giving solution-shaped code in challenge (objective or minimal scaffold only), and (3) expand outcome-based verification so that “passing” requires real understanding and implementation.