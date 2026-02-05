## Vision: What This Framework Becomes

Imagine you arrive at a customer with just your laptop. You clone a repo, run one command, and open a URL.

Instead of a flat list of labs, you see:

- A **story-driven challenge**: “Retail customer suffers a PII exposure incident. You are the MongoDB specialist called in to fix it.”
- A set of **quests** that guide you through:
  - Understanding the problem.
  - Modeling data and security in MongoDB.
  - Comparing this to how it would look on an RDBMS or DocumentDB competitor.
- **Flags** and **achievements** that make the experience feel like a capture‑the‑flag game: discover a misconfigured index, enforce encryption end-to-end, or fix a slow query.
- A **moderator dashboard** for the SA: they can flip between demo mode (telling the story) and hands‑on mode (letting attendees solve it), see team progress in real time, and adapt on the fly.
- Everything **configurable via content** (YAML/JSON/Markdown) so new topics, industries, and challenges can be added without touching core code.

This plan describes how to get from the current single‑topic CSFLE/QE app to that framework, **without breaking today’s UX** and always working on a **separate branch**.

---

## Guiding Principles & Constraints

### Branching & Safety

- All implementation happens on a **dedicated feature branch**, for example `feature/workshop-framework-refactor`.
- `main` remains untouched until you explicitly approve merges; it always reflects the current, working workshop.
- Each phase can end in a **PR into the feature branch**, and later phases can be merged into `main` when you’re satisfied.

### UX Preservation

- Phases 0–4 are primarily **structural and architectural**, not visual redesigns.
- The rule of thumb: **“If a user knows the current app, they should not feel lost after these phases.”**
- Any new UI (for example, game dashboards, story overlays) is:
  - Either hidden behind **feature flags**, or
  - Exposed via **separate routes/views**, so we can test them without disrupting the existing flow.

### Content-First, Code-Second

- Labs, topics, stories, and challenges should be **content-driven**, not baked into large TSX files.
- The framework’s superpower is: **“Adding a new customer challenge is mostly editing content, not writing React.”**

### Story & Game Mode Are First-Class, Not Afterthoughts

- The plan treats **narrative and gamification** as real design elements:
  - Quests.
  - Flags.
  - Customer challenge templates.
  - Team and individual scoring.
- They are optional for any given workshop, but the architecture is designed with them in mind from day one.

---

## Core Concepts (Domain Model with Narrative)

These will be defined as TypeScript types and JSON Schemas, but here is the conceptual model.

### Topics & Labs

- **Topic**: A conceptual area, like `encryption`, `schema-design`, or `search`.
  - Think of it as a chapter in a book.
- **Lab**: A structured, step-by-step exercise under a topic.
  - Today’s CSFLE/QE/GDPR labs become **labs within the `encryption` topic**.
  - Labs have difficulty, time estimates, prerequisites, and tags (for example `developer`, `DBA`).

### Steps

- **Step**: The smallest unit of guided activity.
  - Contains narrative, instructions, code snippets, and expectations.
  - Each step can trigger a **verification** (for example, “Is this index created?”, “Is this collection encrypted?”).

### Workshops, Templates & Instances

- **WorkshopTemplate**: A reusable recipe.
  - Example: `retail-encryption-quickstart` or `financial-services-regulatory-data`.
  - Specifies:
    - Which topics and labs are included.
    - Which **mode mix** is recommended (how much demo, how much lab, whether challenge mode is enabled).
    - Gamification and competitor comparison options.
- **WorkshopInstance**: A concrete run of a template.
  - Example: “Retailer X – 2026-03-10 – Stockholm”.
  - Tracks who joined, progress, scores, and which flags they captured.

### Roles & Modes

- **Role**:
  - `moderator` (SA or facilitator).
  - `attendee` (hands-on participant).
  - `observer` (for example a stakeholder watching).
- **Mode**:
  - `demo`: SA talks through the material; slides and live demo.
  - `lab`: hands-on guided steps.
  - `challenge`: story and game mode (quest-driven, flags, customer challenge).

### Storytelling & Game Concepts

- **Quest**:
  - A story arc that spans multiple labs or steps.
  - Example: “Lock down PII in the retail customer database”.
  - Contains:
    - A narrative intro (“Your mission…”).
    - A set of **required and optional objectives**.
    - A win condition (for example, all critical flags captured).
- **Flag**:
  - A concrete, verifiable objective, CTF-style.
  - Could be:
    - “Encrypt all sensitive fields.”
    - “Ensure no document in this collection violates the PII policy.”
    - “Optimize this query to meet an SLA.”
  - Flags are sometimes visible (you know what to aim for), sometimes partially hidden (hinted at in the story).
- **CustomerChallengeTemplate**:
  - A `WorkshopTemplate` with a **realistic narrative scenario**:
    - Problem statement, constraints, target metrics.
    - One or more quests and flags that represent “solving the customer’s problem”.

### Gamification & Competitors

- **GamificationConfig**:
  - Points for:
    - Completing steps.
    - Capturing flags.
    - Finishing quests under time or with minimal hints.
  - Achievements (for example “Index Whisperer”, “Encryption Guardian”).
  - Individual versus team scoring.
- **CompetitorScenario**:
  - A step- or lab-level description of how the same problem is handled on:
    - RDBMS, DocumentDB, or other competitors.
  - Includes:
    - Code, schema, and process.
    - Factual annotations about friction or limitations.

---

## Target Architecture

### Frontend

- Stack: **React + Vite + shadcn** (same as today).
- Key frontend modules:
  - **`LabRunner`**: generic component that renders any lab described in content (steps, hints, flags, verifications).
  - **Topic & Lab Catalog**: browse and select topics, labs, and templates.
  - **Modes UI**:
    - **Demo mode**: presenter view, speaker notes, controlled pacing.
    - **Lab mode**: guided steps and checks for attendees.
    - **Challenge mode**: narrative, quests, flags, score, and progress.
  - **Gamification & Dashboards**: scores, achievements, leaderboards (individual and team).
  - **Competitor Comparison Views**: MongoDB versus competitor (side-by-side code, schema, pain points).
  - **Role-aware UI**: moderator versus attendee versus observer.

### Backend

- Stack: Node.js (Express or NestJS).
- Services:
  - **ContentService**: load, cache, and validate content (topics, labs, templates, quests, flags).
  - **VerificationService**: step, lab, and flag verifiers using the MongoDB driver, Atlas APIs, and KMS SDKs.
  - **Session & RoleService**: manage workshop instances, roles, authentication, and mode.
  - **GamificationService**: scoring, achievements, quests, team scores.
  - **TemplateService**: industries, customer challenge templates.
  - **Metrics & Logging**: track usage, completion, and errors.

### Content Layer

- `content/` (Git-versioned) containing:
  - `topics/` – topic metadata and grouping.
  - `labs/` – lab definitions (steps, verifications, story context).
  - `quests/` – narrative quest and challenge definitions across labs and steps.
  - `flags/` – hidden or semi-hidden objectives.
  - `workshop-templates/` – standard configurations, including customer challenges.
  - `industries/` – domain-specific templates and scenarios.
  - `competitor-scenarios/` – MongoDB vs competitor definitions.
  - `shared-snippets/` – reusable code, datasets, diagrams.
- All validated via **JSON Schema** and **TypeScript types**.

### Runtime

- **Docker Compose** providing:
  - `frontend`, `backend`, `mongo` (and auxiliary services as needed).
- Profiles:
  - `local-sandbox` – ships with local MongoDB and demo data.
  - `byo-atlas` – connects to customer Atlas (configurable).
- Target: **clone → docker compose up → open browser** in a few minutes on both Windows and macOS.

---

## Phase 0 – Codebase Audit & UX Baseline (Read-Only)

**Narrative**: Before touching a line of code, walk the “museum” of the current app: how labs are structured, how the UI feels, and where the pain points are.

### Goals

- Understand **exactly** how the current workshop works, end-to-end.
- Capture the **current UX** as a baseline to preserve.
- Identify architectural and operational risks.

### Activities

- Map structure:
  - `src/components`, `context`, `vite.config`, custom middleware, docs, and scripts.
  - Identify where labs are defined (large TSX files) and how routing ties them together.
- Environment and tools:
  - List external tools and their usage (AWS CLI, `mongosh`, Node).
  - Note OS-specific behavior (for example `.dylib` paths vs what Windows would need).
- Security and robustness:
  - Find shell `exec` calls, localStorage usage, and hard-coded secrets or PINs.
  - See how errors are handled when verifications fail.
- UX baseline:
  - Walk through:
    - Moderator login.
    - Lab selection.
    - Steps and verification flows.
    - Leaderboard views.
  - Capture screenshots or notes about layout, colors, and navigation.

### Deliverables

- **Audit document**:
  - Architecture overview.
  - Risks and technical debt.
  - UX baseline description.
- **Updated assumptions**:
  - Confirm stack (React, Vite, Node).
  - Confirm feasibility of Dockerization and backend split.

No code or content changes happen in this phase.

---

## Phase 1 – Domain Model & Module Boundaries (Including Story/Game)

**Narrative**: Define the “language” of the platform: what a topic, lab, quest, and flag mean, and which parts of the system own which responsibilities.

### Goals

- Turn the conceptual model into **concrete types and schemas**.
- Draw **clean lines between modules**, so future work is not tightly coupled.

### Activities

- Define TypeScript types and JSON Schemas for:
  - `Topic`, `Lab`, `Step`.
  - `WorkshopTemplate`, `WorkshopInstance`.
  - `Role`, `Mode`.
  - `Quest`, `Flag`, `CustomerChallengeTemplate`.
  - `GamificationConfig`, `Team`, `CompetitorScenario`.
- Module boundaries:
  - **Content module**:
    - Owns `content/` layout and schemas.
    - No business logic beyond validation.
  - **Backend modules**:
    - `VerificationService`: knows how to check lab, step, and flag criteria.
    - `GamificationService`: scoring and achievements.
    - `StoryService` (conceptual): computes quest and challenge progress.
    - `KmsProvider` abstraction.
    - `TemplateService` for industries and customer challenges.
- Capture these in a short **architecture document**.

### Deliverables

- Types and schemas on the **feature branch**.
- Architecture or README describing the model and module layout.
- No visible change to users yet.

---

## Phase 2 – Content-Driven Labs & `LabRunner` (UX Parity)

**Narrative**: Gently pull the “script” of the workshop out of the code into content files, while keeping the stage, lights, and props looking the same to the audience.

### Goals

- Replace hard-coded lab definitions with **content files**, without changing how the labs appear or behave to users.
- Introduce a reusable **`LabRunner`** that can render any lab described in content.

### Activities

- `content/` structure (first iteration):
  - `content/topics/`: one file per topic.
  - `content/labs/`: one file per lab (CSFLE, QE, GDPR).
  - `content/workshop-templates/`: initial templates that mirror the current workshop.
  - Create placeholder directories for `quests/` and `flags/` for future phases.
- Implement **ContentService**:
  - Loads and validates content at backend startup.
  - Exposes read APIs: `GET /api/topics`, `GET /api/labs/:id`, and similar.
- Implement **`LabRunner`**:
  - A React component that:
    - Receives a lab definition (from content).
    - Renders steps, descriptions, code blocks, and “Verify” actions.
    - Reuses existing UI components as much as possible.
- Migrate existing labs:
  - Move step definitions from large TSX files into content format.
  - Keep any non-trivial React or JavaScript logic as small helper components but hook them up via content (configs and IDs).
- Testing:
  - Write tests ensuring:
    - Content matches expected schemas.
    - `LabRunner` renders the same number of steps, titles, and key text as before.
  - Spot-check visual parity by comparing screenshots or at least the main layout.

### Deliverables

- Labs now defined in `content/` but rendered via `LabRunner`.
- The app feels almost identical to current users.

---

## Phase 3 – Modes, Roles, Base Gamification & Templates (With Story Hooks)

**Narrative**: Give the facilitator a proper control panel—modes, roles, templates—and lay the groundwork for story-driven and gamified experiences, while keeping default behavior unchanged.

### Goals

- Make `demo`, `lab`, and `challenge` modes **first-class**, and roles explicit.
- Add **configurable gamification** and **templates**, including simple story intros and outros.

### Activities

- **Modes and roles**:
  - Extend backend and frontend to understand `mode` and `role`.
  - Map current experience to defaults:
    - Attendees → `lab` mode.
    - Moderators → `demo` (for presentation) plus `lab` (for labs).
  - Replace localStorage or PIN hacks with:
    - Backend-managed sessions.
    - Configurable moderator access that is still simple to use.
- **Base gamification**:
  - Implement **GamificationService** for:
    - Step completion points.
    - Simple achievements, such as finishing all steps of a lab.
    - Leaderboards built from a generic scoring model (reusing existing visual style).
  - Allow templates to turn gamification on and off or choose a profile (for example, “Light”, “Competitive”).
- **Templates and industries**:
  - Create:
    - A default `encryption-workshop` template.
    - At least one industry-specific template, such as `retail-encryption-101`.
  - Build a simple wizard where a moderator can:
    - Pick a template.
    - Optionally tweak which labs are included.
    - Turn gamification on and off.
- **Story hooks**:
  - Add story fields to templates:
    - `storyIntro` (Markdown).
    - `storyOutro`.
  - For one template, define a **basic story**:
    - “You are helping a retail customer secure data before peak season.”
  - Surface this story as a simple intro text before the labs, without yet implementing full quests and flags.

### Deliverables

- Modes and roles are explicit, but the default behavior closely matches today.
- Templates and basic gamification are available and controllable.
- A first simple narrative experience exists, still mostly linear.

---

## Phase 4 – Verification Framework, KMS Abstraction & Docker Runtime

**Narrative**: Make the engine more robust and portable: verifications move into a proper backend layer, and workshops run reliably across OSes with Docker.

### Goals

- Centralize and harden verification logic.
- Remove dependency on fragile, OS-specific shell commands where possible.
- Provide a **one-command local runtime** via Docker.

### Activities

- **VerificationService**:
  - Implement backend endpoints for:
    - Step verification.
    - Later, flag verification.
  - Refactor existing checks (indexes, key vault, data) to:
    - Prefer MongoDB driver, Atlas API, and SDKs over shell.
  - Maintain the same user-facing messages and flow where feasible.
- **KMS abstraction**:
  - Design a `KmsProvider` interface.
  - Implement:
    - AWS KMS.
    - A mock or local provider for offline or demo scenarios.
  - Configure selection via environment variables or config.
- **Docker Compose runtime**:
  - Compose services:
    - `frontend`.
    - `backend`.
    - `mongo` (with seed scripts for sample data).
  - Provide scripts:
    - `run-local.sh` (macOS and Linux).
    - `run-local.ps1` (Windows).
  - Profiles:
    - `local-sandbox`: everything local.
    - `byo-atlas`: configuration points to a real Atlas cluster.

### Deliverables

- A repeatable, OS-agnostic way to run the workshop stack locally.
- A robust verification layer that is easier to extend and maintain.

---

## Phase 5 – Full Story/Game “Challenge Mode”: Quests & Flags

**Narrative**: The app now hosts a real **incident simulation** or **capture-the-flag** experience, not just a linear lab. Attendees can “win” by resolving a customer’s problem.

### Goals

- Turn story and gamification into a full **challenge mode**:
  - Quests with narrative structure.
  - Flags as verifiable objectives.
  - Customer challenges that feel like real incidents.

### Activities

- **Quests**:
  - Use `Quest` content definitions to group labs and steps.
  - Each quest:
    - Has an intro, objectives, and a win condition.
    - Has a recommended set of labs or steps and flags.
  - UI:
    - Moderator can start a **quest-based workshop**.
    - Attendees see:
      - A mission brief.
      - Quest progress (for example, 3 of 5 objectives complete).
- **Flags**:
  - Implement `Flag` entities in content and backend verifiers.
  - Flags correspond to deeper objectives such as:
    - “All PII fields encrypted using CSFLE; no plaintext PII remains.”
  - Attendee flow:
    - They complete steps as usual.
    - Certain actions cause flag checks.
    - If criteria are met, they get a **flag capture** event, extra points, and a visual confirmation.
- **Customer challenge templates**:
  - Build at least **one full challenge**, for example:
    - `retail-data-breach-simulation`.
    - Narrative:
      - Background, stakeholders, constraints.
      - Potential consequences if not fixed.
    - Quests:
      - “Stop the Leak” (encrypt data).
      - “Harden the System” (indexes and access control).
    - Flags:
      - “Encrypted All PII Collections”.
      - “No Queries Returning Plaintext PII”.
  - Challenge mode UI:
    - Moderator selects the challenge.
    - Attendees enter with a story brief and quest list.
- **Gamification integration**:
  - Score:
    - Points for steps, extra for flags, big rewards for completing quests.
  - Teams (optional):
    - SAs can put attendees into teams.
    - Team scoreboard shows which team is closest to resolving the “incident”.

### Deliverables

- A fully playable challenge mode for at least one realistic customer scenario.
- A pattern that can be reused for new challenges in new industries.

---

## Phase 6 – Competitor Comparisons, Extensibility & Metrics

**Narrative**: On top of everything else, add **factual, ethical competitor comparisons**, make the framework easy to extend by others, and gain visibility into how workshops actually perform.

### Goals

- Integrate MongoDB vs competitor scenarios into labs and quests.
- Make it easy for others to author and validate content.
- Capture metrics to inform future improvements.

### Activities

- **Competitor scenarios**:
  - Use `CompetitorScenario` content to define:
    - MongoDB implementation.
    - One or more competitor implementations.
    - Objective, measurable pain points (for example number of steps, complexity, query limitations).
  - UI:
    - Tabs or side-by-side views in steps or labs.
    - Clear but respectful annotations of competitor friction.
- **Contribution workflow**:
  - Authoring documentation:
    - `CONTRIBUTING.md` and a content authoring guide.
  - CLI helpers:
    - `workshop-cli create-lab`.
    - `workshop-cli create-quest`.
    - `workshop-cli create-challenge`.
  - CI:
    - Validates content against schemas.
    - Runs a basic test suite (unit, integration, and E2E).
- **Metrics and observability**:
  - Log key events:
    - Workshop creation.
    - Lab, quest, and flag completion.
    - Failed verifications.
  - Metrics:
    - Time to first successful lab after starting Docker.
    - Percentage of attendees who complete:
      - At least one lab.
      - At least one quest.
    - Where participants stall (which steps, which verifications).
  - Dashboards (can start simple):
    - For internal teams to see which labs and challenges are working best.

### Deliverables

- At least one lab or quest showing MongoDB vs competitor side-by-side.
- A solid authoring and validation workflow so the framework can grow.
- Basic analytics to guide iteration.

---

## Phase 7 – UX Evolution (Optional, Intentional Redesign)

**Narrative**: Once the foundation is stable and the experiences are powerful, polish the UI for delight, not just function.

### Goals

- Improve readability, navigation, and aesthetics based on real usage.
- Keep everything accessible and usable in high-pressure workshop settings.

### Activities

- Collect feedback from:
  - SAs who run workshops.
  - Attendees (post-workshop surveys).
- Identify UX pain points:
  - Areas where users get lost.
  - Overly dense screens or confusing navigation.
- Prototype improvements:
  - Better progress overviews for quests and labs.
  - More intuitive mode switching for moderators.
  - Cleaner comparison views.
- Incrementally roll out:
  - Start with low-risk areas and ensure metrics improve.

### Deliverables

- A more polished, consistent UI layered on top of a robust, flexible framework.

