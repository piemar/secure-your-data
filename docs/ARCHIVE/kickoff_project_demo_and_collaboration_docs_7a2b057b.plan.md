---
name: Kickoff Project Demo and Collaboration Docs
overview: Enhance the kickoff to center on showing the project and exemplifying how to get started; add a Collaboration Principles document (branching, process, mindset/culture); and add an architecture overview of the workshop framework for the kickoff and for contributors.
todos: []
isProject: false
---

# Kickoff: Show the Project, Collaboration Principles, and Architecture Overview

## 1. Make the actual project central in the kickoff

**Problem:** The current agenda treats "what we're building" and "first run" as two short sections. The project itself should be the star, with a concrete "how to get started" that people can follow during or right after the call.

**Changes:**

- **Reorder the agenda** so "Show the project" and "How to get started" come right after intros and the one-slide "why":
  - Welcome and intros
  - Groundswell in one slide
  - **Show the project** (5–10 min) — Live: open the app, pick a topic, walk through one lab (e.g. pick a step, show Run all / Run selection, verification). Goal: everyone sees the same thing.
  - **How to get started** (5–10 min) — Exemplify, don’t just list: "Step 1: clone and open README. Step 2: run Docker (or npm run dev). Step 3: in the app, complete Lab Setup (URI, AWS profile if needed). Step 4: run one lab end-to-end." Optionally share a 1-page "Get started" cheat sheet (or point to a short section in README/Docs).
  - What we're building (brief recap + where it lives: README, Docs/INDEX)
  - Ways of working (manifesto)
  - How to contribute (branches, process — with link to the new Collaboration Principles doc)
  - Next steps and close
- **Update the slide deck prompt** ([Groundswell_Kickoff_Google_Slides_Prompt.md](Groundswell_Kickoff_Google_Slides_Prompt.md)) accordingly:
  - New slide: "Show the project" — Live demo: open app, one topic, one lab; show Run all / Verify.
  - New slide: "How to get started (4 steps)" — Clone → Run (Docker or npm run dev) → Lab Setup in app → Run one lab. Add a note: "We’ll do this together or right after the call."
  - Keep "What we're building" as a short recap + pointers to README and Docs/INDEX.

This makes the project and get-started the center of the kickoff instead of a brief mention.

---

## 2. Collaboration Principles document

**Add a single document** that covers workflow, how to make changes, and mindset/culture. Suggested name: `**Docs/COLLABORATION_PRINCIPLES.md`** (or `GROUNDSWELL_COLLABORATION.md` if you prefer the Groundswell branding in the filename).

**Suggested sections:**

- **Branching and workflow**
  - Always use feature branches; never commit directly to `main`.
  - Branch naming: `feature/<short-description>` (e.g. `feature/lab-graph-traversal`, `feature/doc-collab-principles`), `fix/<description>` for bugfixes.
  - Open a PR for review before merging to `main`; keep PRs small and focused when possible.
- **Making changes and additions**
  - **Labs:** Follow [ADDING_AND_VALIDATING_LABS.md](Docs/ADDING_AND_VALIDATING_LABS.md). Use the ADD_LAB master prompt; register in index and loader; run validation and tests. Reference [ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md) for the flow.
  - **Docs:** Edit in a feature branch; link from [Docs/INDEX.md](Docs/INDEX.md) if adding a new doc. Keep INDEX up to date.
  - **Code (components, services):** Same branching and PR process; align with existing patterns (see README Application Structure and [ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md)).
- **Mindset and culture** (manifesto-style, so everyone can commit to it)
  - Trust and relevance first — Assume good intent; give feedback in the open; we build credibility, we don’t push pipeline.
  - Optional by design — Contribution is voluntary; if capacity drops, we adapt without guilt.
  - Reduce load, don’t add it — No unnecessary process; if our way of working creates friction, we change it.
  - Document and share — Decisions and "how we do X" live in the repo or shared docs so anyone can onboard.
  - Ship small, iterate — Prefer small, shippable improvements; revisit ways of working every 60–90 days.
- **Where to find things**
  - README: what the app is, how to run it, application structure.
  - [Docs/INDEX.md](Docs/INDEX.md): doc index — start here for all docs.
  - [Docs/ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md): framework architecture and adding-labs flow.

Link this document from the README (e.g. under Contributing or a new "Team & collaboration" subsection) and from the kickoff deck (e.g. "How to contribute" slide: "See Docs/COLLABORATION_PRINCIPLES.md").

---

## 3. Architecture overview of the framework

**Recommendation: yes, have an architecture overview.** The repo already has the content; the gap is a **single, short "at a glance" view** for new contributors and for the kickoff.

**Option A (recommended): One-page overview doc + one slide**

- **New doc:** `**Docs/ARCHITECTURE_OVERVIEW.md`** (or `**CONTRIBUTOR_ARCHITECTURE_OVERVIEW.md**`).
  - Purpose: onboarding; "how does the workshop framework hang together?"
  - Content (keep to one page):
    - One paragraph: content-driven labs, no per-lab TSX for step content; labs are data (lab definitions + enhancements), rendered by LabRunner.
    - Diagram: reuse the high-level flow from [ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md) (Content layer → Registry → ContentService → Lab runtime + Enhancement loader), or a simplified 3–4 box version: **Content (topics/pov/lab + enhancements)** → **Registry (index.ts)** → **ContentService** → **LabRunner + Enhancement loader**.
    - Short bullets: key folders (`src/content/topics/`, `src/components/labs/`, `Docs/`), where labs are defined vs where they’re rendered, and "For adding a lab, see ARCHITECTURE_AND_ADDING_LABS and ADDING_AND_VALIDATING_LABS."
  - Add this doc to [Docs/INDEX.md](Docs/INDEX.md) under "Adding and validating labs" or a new "Architecture (quick)" line.
- **Kickoff deck:** Add one slide **"Architecture at a glance"** after "What we're building":
  - Title: Architecture at a glance  
  - Bullets: Content-driven labs (definitions + enhancements in `src/content/topics/`); Registry and ContentService; LabRunner + Enhancement loader render steps; no per-lab TSX for content.  
  - Note: "Full picture: Docs/ARCHITECTURE_OVERVIEW.md and Docs/ARCHITECTURE_AND_ADDING_LABS.md."

**Option B (lighter):** No new doc; add only the "Architecture at a glance" slide to the kickoff deck and point to [ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md) (Diagram A) and [Docs/INDEX.md](Docs/INDEX.md) for the full picture.

Recommendation: **Option A** so there is one place you can send people for a quick mental model, and the kickoff slide stays in sync with that.

---

## 4. Summary of artifacts and deck changes


| Item                                 | Action                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kickoff flow**                     | Reorder to: intros → why → **show project (live)** → **how to get started (4 steps)** → what we're building (recap) → **architecture at a glance** → manifesto → how to contribute → first win → next steps.                                                              |
| **Slide deck prompt**                | Update [Groundswell_Kickoff_Google_Slides_Prompt.md](Groundswell_Kickoff_Google_Slides_Prompt.md): new "Show the project" slide, new "How to get started (4 steps)" slide, new "Architecture at a glance" slide; "How to contribute" references Collaboration Principles. |
| **Docs/COLLABORATION_PRINCIPLES.md** | New doc: branching (always feature branches), making changes (labs, docs, code with links), mindset/culture (manifesto), where to find things. Link from README and from kickoff "How to contribute" slide.                                                               |
| **Docs/ARCHITECTURE_OVERVIEW.md**    | New one-pager: content-driven model, diagram (from or simplified from ARCHITECTURE_AND_ADDING_LABS), key folders and pointers. Add to Docs/INDEX.md.                                                                                                                      |
| **README**                           | Add a short link to COLLABORATION_PRINCIPLES (and optionally to ARCHITECTURE_OVERVIEW) under Contributing or a small "Team & collaboration" subsection.                                                                                                                   |


---

## 5. Implementation order

1. Add **Docs/COLLABORATION_PRINCIPLES.md** (branching, process, mindset/culture, where to find things).
2. Add **Docs/ARCHITECTURE_OVERVIEW.md** (one page + diagram), and add it to **Docs/INDEX.md**.
3. Update **Groundswell_Kickoff_Google_Slides_Prompt.md** (agenda reorder, "Show the project," "How to get started (4 steps)," "Architecture at a glance," "How to contribute" pointing to COLLABORATION_PRINCIPLES).
4. Update **README** to link to COLLABORATION_PRINCIPLES (and optionally ARCHITECTURE_OVERVIEW).

If you want, the next step can be drafting the exact text for COLLABORATION_PRINCIPLES.md, ARCHITECTURE_OVERVIEW.md, and the updated slide prompt.