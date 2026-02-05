## Workshop Framework Architecture & Module Boundaries

This document explains the high-level architecture and module boundaries for the workshop framework, and how they relate to the current codebase. It is the companion to `Docs/WORKSHOP_FRAMEWORK_PLAN.md` and the new domain model types in `src/types/index.ts`.

The goals are:

- Keep the **current UX and flows** intact while we refactor.
- Make the system **content-driven** so new topics, labs, and challenges can be added with minimal code.
- Support **multiple modes** (demo, lab, challenge) and **gamification** (points, quests, flags) in a clean, modular way.

---

## 1. Current Implementation (Snapshot)

This section is descriptive only; it is not a prescription.

- **Frontend stack**:
  - React + TypeScript + Vite.
  - UI built on shadcn/ui components.
  - Routing via `src/pages/Index.tsx`.
- **Key areas**:
  - `src/components/labs/`
    - `Lab1CSFLE.tsx`, `Lab2QueryableEncryption.tsx`, `Lab3RightToErasure.tsx`: monolithic lab implementations with inline step definitions and verification hooks.
    - Shared lab UI components: `LabStep.tsx`, `LabView.tsx`, `LabViewWithTabs.tsx`, `StepView.tsx`, `DifficultyBadge.tsx`, `HintSystem.tsx`, etc.
  - `src/components/presentation/`
    - `slidesData.tsx`, `slidesPPTXData.tsx`, `PresentationView.tsx`, `SlideViewer.tsx`, etc.
  - `src/context/LabContext.tsx`
    - Handles lab selection, prerequisites, completion state, basic progress tracking.
  - `src/contexts/RoleContext.tsx`, `src/contexts/NavigationContext.tsx`
    - Store current role (moderator/attendee) and navigation section.
  - `src/utils/validatorUtils.ts`
    - Contains various validation helpers used by labs (for example, checking collections, indexes, key vault, tool availability).
  - `vite.config.ts`
    - Configures Vite dev server and embeds some API endpoints / middleware for verifications and leaderboard operations.
  - `src/utils/leaderboardUtils.ts`
    - Utilities around the leaderboard during workshops.

Currently, lab content (steps, descriptions, code snippets) and logic are closely entwined in large TSX files. There is no explicit concept of topics, quests, flags, or templates.

---

## 2. Target Domain Model (Summary)

The core domain model is defined in `src/types/index.ts`. This is a summary of the key types that matter for architecture; see the code for full details.

- **WorkshopMode**: `'demo' | 'lab' | 'challenge'`
- **WorkshopRole**: `'moderator' | 'attendee' | 'observer'`
- **WorkshopTopic**: topic (for example, `encryption`, `schema-design`) with metadata and default labs.
- **WorkshopLabDefinition**: a lab described entirely in data (id, topicId, title, description, difficulty, tags, steps, supported modes).
- **WorkshopLabStep**: an individual step in a lab (narrative, instructions, code snippets, verificationId, points, hints).
- **WorkshopGamificationConfig**: configurable scoring rules (base points per step, flags, quests, teams).
- **WorkshopQuest**: a story arc that spans labs and steps, with required and optional flags.
- **WorkshopFlag**: a concrete, verifiable objective (CTF-style) with a verificationId and possible bonus points.
- **WorkshopCompetitorScenario**: structured description of MongoDB vs competitor implementations for a given lab or step.
- **WorkshopTemplate**: a reusable workshop recipe (topics, labs, quests, story intro/outro, industry tag, gamification settings).
- **WorkshopInstance**: a concrete run of a template for a specific customer/date.
- **WorkshopTeam** and **WorkshopScoreEntry**: building blocks for team-based scoring and leaderboards.

These types are designed to be neutral with respect to UI and storage, so that both frontend and backend can use them consistently.

---

## 3. Module Boundaries (Target)

Below are the intended modules and their responsibilities. This is the target shape; we will move towards it incrementally.

### 3.1 Content Module

**Responsibility**:

- Owns the **shape and storage** of workshop content:
  - Topics, labs, steps.
  - Quests and flags.
  - Templates and industry presets.
  - Competitor scenarios and shared snippets.
- Ensures content is valid and well-structured via schemas.

**Implementation notes**:

- Files in `content/` (not yet created at the time of writing) will hold YAML/JSON/Markdown for:
  - `content/topics/*.yaml`
  - `content/labs/*.yaml`
  - `content/quests/*.yaml`
  - `content/flags/*.yaml`
  - `content/workshop-templates/*.yaml`
  - `content/industries/*.yaml`
  - `content/competitor-scenarios/*.yaml`
- A **ContentService** (backend) will:
  - Load and parse these files at startup.
  - Validate them using JSON Schema and the types in `src/types/index.ts`.
  - Expose read-only APIs to the frontend (for example, `GET /api/topics`, `GET /api/labs/:id`).

**Existing integration points**:

- Today, step definitions are inline in:
  - `src/components/labs/Lab1CSFLE.tsx`
  - `src/components/labs/Lab2QueryableEncryption.tsx`
  - `src/components/labs/Lab3RightToErasure.tsx`
- Over time, these step arrays will be migrated into content files, and the TSX components will delegate to `LabRunner` plus content-driven definitions.

---

### 3.2 Verification Module

**Responsibility**:

- Encapsulate all **checks** that prove a step, flag, or quest has been completed correctly.
- Translate high-level verification IDs into concrete operations against:
  - MongoDB (driver or Atlas API).
  - KMS providers (AWS, etc.).
  - Local environment checks (tools, binaries) where needed.

**Implementation notes**:

- A centralized **VerificationService** (backend) will provide endpoints such as:
  - `POST /api/labs/:labId/steps/:stepId/verify`
  - `POST /api/flags/:flagId/verify`
- Each lab step or flag will reference a **`verificationId`**; the service maps this ID to underlying logic.
- Where possible, verifications will avoid shell `exec` and use SDKs/APIs instead.

**Existing integration points**:

- `src/utils/validatorUtils.ts` contains many checks used by labs today.
- `vite.config.ts` currently exposes some verification-related dev server endpoints.
- These will be systematically mapped and migrated into VerificationService functions over time.

---

### 3.3 Gamification Module

**Responsibility**:

- Manage **scores, achievements, leaderboards, and progression**, separately from lab content.
- Support both **individual** and **team-based** scoring.

**Implementation notes**:

- A **GamificationService** (backend) will:
  - Accept events such as:
    - “step completed”
    - “flag captured”
    - “quest completed”
  - Compute points based on `WorkshopGamificationConfig`.
  - Store results in MongoDB collections (for example, `workshop_scores`).
- Frontend components:
  - Reuse or evolve the existing `Leaderboard` UI in `src/components/labs/Leaderboard.tsx`.
  - Add optional dashboards for quests/flags over time.

**Existing integration points**:

- `src/components/labs/Leaderboard.tsx` and `src/utils/leaderboardUtils.ts` implement the current simple leaderboard.
- These will be adapted to use the GamificationService and the new data model while preserving current look-and-feel in the early phases.

---

### 3.4 Story / Challenge Module (Quests & Flags)

**Responsibility**:

- Implement **story-driven “challenge mode”**:
  - Quests that span labs and steps.
  - Flags that are verifiable objectives.
  - Customer challenges that feel like realistic incidents.

**Implementation notes**:

- Content:
  - `WorkshopQuest` and `WorkshopFlag` definitions will live in `content/quests` and `content/flags`.
  - `CustomerChallengeTemplate` is represented as a specialized `WorkshopTemplate`.
- Backend:
  - A **StoryService** (or part of GamificationService) will:
    - Track quest progress per participant or team.
    - Track captured flags.
    - Determine when quests and challenges are “won”.
- Frontend:
  - Additional views for:
    - Quest overview (objectives and progress).
    - Flag captures and bonuses.
    - Story intro/outro screens for customer challenges.

**Existing integration points**:

- Today, narrative primarily lives in:
  - `Docs/README_WORKSHOP.md`.
  - Slide content in `src/components/presentation/slidesData.tsx`.
- These narratives will inform the initial quest and challenge definitions (without removing or duplicating the existing docs).

---

### 3.5 KMS & External Provider Module

**Responsibility**:

- Provide a clean abstraction over different **KMS providers** (AWS, Azure, GCP, local/mock).
- Avoid scattering provider-specific details throughout labs and verifications.

**Implementation notes**:

- A `KmsProvider` interface will define required operations for encryption-related tasks.
- Concrete implementations:
  - AWS KMS (most common today).
  - Additional providers or mock providers as needed.
- Verification and lab logic will call into this abstraction, not into provider SDKs directly.

**Existing integration points**:

- Current labs (especially in `Lab1CSFLE.tsx` and `Lab2QueryableEncryption.tsx`) and scripts under `Docs/Enablement` assume AWS KMS and AWS CLI.
- Over time, verifications and environment checks will use the KMS abstraction where appropriate.

---

### 3.6 Workshop Session & Role Module

**Responsibility**:

- Manage **workshop instances**, roles, and modes:
  - Starting and ending a workshop.
  - Assigning moderator vs attendee roles.
  - Tracking which template and mode is active.

**Implementation notes**:

- Backend:
  - A WorkshopSession service will:
    - Create `WorkshopInstance` records.
    - Track mode (`demo`, `lab`, `challenge`) and status for the current workshop.
  - Authentication/authorization is intentionally kept simple but moves off pure localStorage and hard-coded PINs.
- Frontend:
  - Extend:
    - `RoleContext` to use data from the backend.
    - `NavigationContext` to be aware of the active workshop, topic, and lab.

**Existing integration points**:

- `src/contexts/RoleContext.tsx` and `src/contexts/NavigationContext.tsx` provide today’s role and navigation state.
- `src/components/settings/WorkshopSettings.tsx` interacts with the current “workshop session” concept.
- These will gradually rely on backend-managed workshop instances instead of only localStorage.

---

### 3.7 Presentation / Slide Module

**Responsibility**:

- Handle **presentation mode** content and rendering:
  - Slides.
  - Speaker notes.
  - Interactive checks (polls, etc.).

**Implementation notes**:

- Slides are already mostly data-driven through `slidesData.tsx` and `slidesPPTXData.tsx`.
- Over time:
  - Some slide metadata can be harmonized with workshop topics and templates.
  - A common “topic” model can be used to link presentation content and lab content.

**Existing integration points**:

- `src/components/presentation/` (PresentationView, SlideViewer, InteractivePoll, etc.).
- `src/types/index.ts` already defines `Slide` and `Poll` types that will continue to be used.

---

## 4. Mapping New Model to Existing Code (High-Level)

This section outlines how the new model overlays onto the current implementation. It is intentionally high-level; detailed migration steps are in `WORKSHOP_FRAMEWORK_PLAN.md`.

- **Current labs (`Lab1CSFLE`, `Lab2QueryableEncryption`, `Lab3RightToErasure`) → `WorkshopLabDefinition` + `WorkshopLabStep`**:
  - The step arrays in these components will be migrated into `content/labs/*.yaml` files that conform to `WorkshopLabDefinition`.
  - The lab components will become thin wrappers around `LabRunner`, which take a lab ID and render it using the content.

- **Current lab UI components → LabRunner building blocks**:
  - `LabStep.tsx`, `StepView.tsx`, `LabView.tsx`, `LabViewWithTabs.tsx`, `DifficultyBadge.tsx`, `HintSystem.tsx`, and similar components will remain, but:
    - They will consume `WorkshopLabStep`-shaped data instead of custom inline structures.

- **Validator utilities and middleware → VerificationService**:
  - Logic from `src/utils/validatorUtils.ts` and verification-related Vite middleware will be refactored into backend verification handlers keyed by `verificationId`.
  - Existing labs will be updated to reference these verification IDs via content.

- **Leaderboard and points → GamificationService**:
  - `src/components/labs/Leaderboard.tsx` and `src/utils/leaderboardUtils.ts` will integrate with the GamificationService and the `WorkshopScoreEntry` type.
  - The visual layout of the leaderboard can remain the same in early phases.

- **Role and navigation contexts → WorkshopSession and Mode**:
  - `RoleContext` and `NavigationContext` will be extended to:
    - Know which `WorkshopInstance` and `WorkshopTemplate` are active.
    - Reflect the active `WorkshopMode` (`demo`, `lab`, or `challenge`).
  - LocalStorage usage will be gradually replaced or backed by backend session state.

- **Docs and slide content → Topics, quests, and challenges**:
  - `Docs/README_WORKSHOP.md` and slide content (`slidesData.tsx`) provide narrative and conceptual structure.
  - This narrative will be used to:
    - Define initial `WorkshopTopic` entries (for example, `encryption`).
    - Build `WorkshopQuest` and `CustomerChallengeTemplate` definitions for the first challenge-mode experience.

---

## 5. Non-Goals for Architecture Changes

- No immediate redesign of visual styling or layout; visual evolution is reserved for a later UX-focused phase.
- No forced move away from the current React + Vite + shadcn stack; all changes are designed to work with this stack.
- No requirement to introduce a heavy backend framework up front; the module boundaries are framework-agnostic and can be implemented with lightweight Express first.

---

## 6. How to Use This Document

- When adding new content (topics, labs, quests, flags), consult:
  - The type definitions in `src/types/index.ts`.
  - The directory layout described in the Content Module section.
- When refactoring existing logic:
  - Decide which module it really belongs to (Content, Verification, Gamification, Story, KMS, Session, Presentation).
  - Move it into the appropriate service or content file rather than adding new ad-hoc utilities.
- When designing new features:
  - Check if they can be expressed in terms of:
    - New content definitions (for example, a new quest or template).
    - New VerificationService handlers.
    - Extensions to the Gamification or Story modules.

This architecture is intentionally incremental and designed to preserve the current workshop’s look-and-feel while giving us a path to a richer, more reusable framework.

