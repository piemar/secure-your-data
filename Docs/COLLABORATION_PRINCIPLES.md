## Collaboration Principles – Groundswell Workshop Framework

This document captures how we collaborate on the **Groundswell workshop framework** and this repo: workflow, how to make changes, and the mindset and culture we want to protect.

It is intentionally lightweight. If any part of it starts to create friction, we change it.

---

## 1. Branching and workflow

- **Always use feature branches**: do not commit directly to `main`.
- **Branch naming**:
  - Features: `feature/<short-description>`  
    - Examples: `feature/lab-graph-traversal`, `feature/doc-collab-principles`
  - Fixes: `fix/<short-description>`
- **Pull requests**:
  - Open a PR before merging to `main`.
  - Keep PRs as small and focused as practical.
  - Prefer clear titles that describe the change and the why, not just the file names.

---

## 2. Making changes and additions

### 2.1 Labs

- Follow **[Docs/ADDING_AND_VALIDATING_LABS.md](./ADDING_AND_VALIDATING_LABS.md)** for adding or validating labs.
- Use the **ADD_LAB master prompt** to generate:
  - A plan doc
  - Lab definition file
  - Enhancements
  - Index/loader registration
  - Tests
- Use **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)** for the exact flow:
  - Lab definitions and enhancements under `src/content/topics/<topic>/<pov>/`
  - Registration in `src/content/topics/index.ts`
  - Loader registration when a POV prefix is new
  - Validation (`node scripts/validate-content.js`) and enhancement tests.

### 2.2 Docs

- Edit docs in a feature branch (same branching rules as code).
- When adding a new doc, link it from **[Docs/INDEX.md](./INDEX.md)** so others can discover it.
- Keep INDEX up to date when docs move or are archived.

### 2.3 Code (components, services, utilities)

- Follow the same branching and PR process as for labs:
  - Small, focused branches and PRs.
  - Explain *why* the change is needed in the PR description.
- Align with the existing structure and patterns:
  - See the **Application Structure** section in `README.md`.
  - Use the content-driven lab model: labs as data (definitions + enhancements), rendered by shared runtime components.

---

## 3. Mindset and culture

These principles mirror Groundswell itself (trust before transactions, optional by design, no disruption).

- **Trust and relevance first**  
  Assume good intent. Give feedback in the open. Focus on building technical credibility and usefulness for the field and for customers.

- **Optional by design**  
  Contribution is voluntary. People’s capacity will vary; if someone needs to step back, we adapt without guilt or pressure.

- **Reduce load, don’t add it**  
  We do not introduce heavy process for its own sake. If a workflow or rule creates more friction than value, we change or remove it.

- **Document and share**  
  Decisions and “how we do X” live in the repo or shared docs, not in individual heads. This keeps onboarding easy and avoids single points of failure.

- **Ship small, iterate**  
  Prefer small, shippable improvements (a lab, a doc tweak, an enhancement) over big, long-running efforts with no visible progress. Revisit these principles every **60–90 days** and adjust as we learn.

---

## 4. Where to find things

- **`README.md`**  
  High-level purpose, how to run the app (Docker and local), and **Application Structure**.

- **[Docs/INDEX.md](./INDEX.md)**  
  Documentation index – start here to find adding/validating labs, architecture docs, guides, enablement materials, and archived plans.

- **[Docs/ARCHITECTURE_AND_ADDING_LABS.md](./ARCHITECTURE_AND_ADDING_LABS.md)**  
  Workshop framework architecture and step-by-step flow for adding labs.

- **[Docs/README_WORKSHOP.md](./README_WORKSHOP.md)**  
  Full workshop guide: presentation content, labs, code examples, troubleshooting, and quick references.

If you are unsure how to approach a change, open a small branch, start a draft PR, and ask for comments. We optimize for clarity, trust, and sustainable pace over perfect process.

