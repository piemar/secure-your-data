---
name: Groundswell Kickoff and Manifesto
overview: "A structured approach for your first Groundswell peer kickoff: agenda, onboarding essentials, and a short \"ways of working\" manifesto everyone can commit to, plus how to introduce people and set the tone."
todos: []
isProject: false
---

# Groundswell Peer Kickoff — Structure, Onboarding, and Ways of Working

## 1. Kickoff call structure (recommended flow)

Keep the first call to **60–75 minutes** so it stays focused and leaves energy for follow-up.


| Block                           | Duration  | Purpose                                                                                                                                                                                    |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Welcome and intros**          | 10–15 min | Who’s in the room, why they’re here, one hope for the project                                                                                                                              |
| **The “why” in one slide**      | 5–10 min  | Groundswell in one slide: trust before transactions, optional, engineer-first; this app is one way we deliver that                                                                         |
| **What we’re building**         | 10–15 min | Workshop app: purpose, main features (labs, leaderboard, verification), where it lives ([README.md](README.md), [Docs/](Docs/)), and how it fits “delivery + team” (slide 8 of your pitch) |
| **Ways of working (manifesto)** | 10–15 min | Walk through the short manifesto; invite questions and one change each; agree we’ll live by it and revisit in 60–90 days                                                                   |
| **How to contribute**           | 10–15 min | Branches, adding/validating labs ([Docs/ADDING_AND_VALIDATING_LABS.md](Docs/ADDING_AND_VALIDATING_LABS.md)), docs index ([Docs/INDEX.md](Docs/INDEX.md)), and who does what next           |
| **Next steps and close**        | 5–10 min  | Concrete next actions, next sync (e.g. bi-weekly), and one async “first win” (e.g. run the app once, or pick a lab to own)                                                                 |


**Tip:** Send a short pre-read (e.g. “Groundswell in one slide” + link to repo README) 1–2 days before so people arrive with context.

---

## 2. What to cover for onboarding (so people can contribute quickly)

- **Vision:** Groundswell = presence → enablement → community → opportunity. The workshop app is part of **enablement**: hands-on, low-friction, memorable. Not the only option (demos, docs, hackathons too), but a core delivery asset.
- **Repo and docs:**  
  - [README.md](README.md): what the app does, how to run it (Docker vs local), structure (`src/content/topics/`, `Docs/`).  
  - [Docs/INDEX.md](Docs/INDEX.md): doc index.  
  - [Docs/ADDING_AND_VALIDATING_LABS.md](Docs/ADDING_AND_VALIDATING_LABS.md): how to add/validate labs (branching, prompts, validation commands).
- **First run:** Everyone runs the app once before or right after the kickoff (Docker: `docker compose up app` → [http://localhost:8080](http://localhost:8080); complete Lab Setup). Optionally do a 2–3 min live demo during the call.
- **First contribution:** Each person picks one concrete “first win”: e.g. run one full lab, add a small doc fix, or own one lab/topic to improve. Assign a single “go-to” for repo/DevRel handoff (if applicable).

This keeps onboarding scoped and actionable.

---

## 3. Should there be a manifesto? **Yes — keep it short and aligned with Groundswell.**

A **short manifesto** (ways of working) is useful because:

- You’re turning a one-person initiative into a **team asset** (slide 9); a shared set of principles reduces ambiguity and builds alignment.
- Groundswell already has clear principles (trust first, optional, no disruption); the manifesto can mirror those for **how the team works** on the tool and with each other.
- Enthusiastic peers benefit from a light “contract” so energy goes in the same direction (e.g. “we don’t disrupt delivery,” “we default to async and document decisions”).

**Suggested content (to adapt with the group):**

- **Trust and relevance first** — We build trust and technical credibility; we don’t push pipeline or commitments. Same spirit for how we work together: assume good intent, give feedback in the open.
- **Optional by design** — Contribution is voluntary; if someone’s capacity drops, we adapt without guilt. We don’t create mandatory overhead.
- **Reduce load, don’t add it** — We don’t disrupt delivery or add unnecessary process. If our way of working creates more friction, we change it.
- **Document and share** — Decisions and “how we do X” live in the repo or shared docs so anyone can onboard and so we don’t depend on one person.
- **Ship small, iterate** — We prefer small, shippable improvements (a lab, a doc, a fix) over big, long-running plans. We refine together in 60–90 day check-ins.

**Format:** One page (or a short Confluence/Notion page + link in the repo). At the kickoff: walk through it, ask “what would you add or change?”, agree on a v1, and schedule a 60–90 day revisit.

---

## 4. How to introduce people (enthusiastic peers)

Because people are **already enthusiastic**, the goal is to **channel that energy** and make everyone feel part of the same mission without over-formalizing.

- **Intros (10–15 min):** For each person: name, region/role, and **one sentence on why they wanted to join** (or one hope for Groundswell/the app). You go first and keep it personal and brief. This surfaces shared motivation and makes the “why” visible.
- **Acknowledge the moment:** One line from you: e.g. “This used to be a one-person thing; now it’s ours. Today we’re making that official and deciding how we work together.” That frames the kickoff as the start of a team, not a one-off meeting.
- **Make it safe to opt in at their pace:** State explicitly that there’s no minimum commitment — they can contribute when it fits. That matches “optional by design” and prevents enthusiasm from turning into implied obligation.
- **End with a clear “what happens next”:** One next call (e.g. in 2 weeks), one shared channel or place for async updates, and one “first win” per person (or per pair). That gives enthusiasm a concrete outlet.

Avoid: long slides, heavy process, or too many decisions in the first call. Do: one clear narrative (why → what we build → how we work → how to contribute → next steps), the manifesto as a living doc, and a few concrete next actions.

---

## 5. Optional: one-page manifesto doc

If you want a tangible artifact, add a short **“Ways of working”** doc (e.g. `Docs/GROUNDSWELL_WAYS_OF_WORKING.md` or in the same place as your pitch materials) with the five bullets above, a line that “we revisit this every 60–90 days,” and a place for “v1 agreed on [date].” You can then link it from the README or from the Groundswell pitch so new joiners see it.

---

## Summary

- **Structure:** 60–75 min with clear blocks: intros → why (one slide) → what we build → manifesto → how to contribute → next steps.
- **Onboarding:** Vision, README + Docs/INDEX + ADDING_AND_VALIDATING_LABS, first run of the app, and one “first win” per person.
- **Manifesto:** Yes — one page, aligned with Groundswell (trust first, optional, reduce load, document, ship small); agree at kickoff and revisit in 60–90 days.
- **Intros:** Short “why I’m here / one hope,” acknowledge that this is now a team, stress optional contribution, and end with one next sync and one concrete first win per person.

If you want, the next step can be drafting the exact one-page manifesto text and a 1-page kickoff agenda (copy-paste for the call).