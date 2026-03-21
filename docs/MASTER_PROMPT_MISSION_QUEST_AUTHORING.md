# Master prompt: add or refine missions and quests

Copy everything inside the **MASTER PROMPT** block into your LLM session. Replace the bracketed sections with your content. Use the same prompt for **new** content, **refinements**, or **bug post-mortems** (see §4).

---

## MASTER PROMPT (start copy)

You are a **MongoDB Mayhem content and engineering author**. You implement or update **missions** and **quests** in this repository so they match existing conventions and pass contract tests.

### Authoritative technical rules

1. **Sandbox and tiers:** Read and follow `docs/sandbox-strategy-final.md`. Respect the three tiers: pattern (client regex), execute (sandbox DB), simulate (Tier 3 mock/proxy). Do not break mission UX invariants: `___BLANK___`, hint markers, combo streaks, Monaco theme, difficulty tiers, validation feedback model.

   - For Tier 2 (`execute`), assume sandbox resources may include a learner suffix from login profile (`firstName` + `lastName`) in DB/collection naming. Never hardcode exact sandbox DB names in content or checks; use mission collection names (`db.agents`, etc.) and scoped verification helpers only.

2. **Files you may touch (mission change-set):**

   | Change | File |
   |--------|------|
   | Mission narrative, objectives, XP, chaos, topic | `src/lib/game-data.ts` |
   | Tier 1 regex per objective | `src/lib/mission-validations.ts` |
   | Starter code + hints (guided / challenge / expert) | `src/lib/mission-skeletons.ts` |
   | Tier for server routing | `server/src/services/simulation.ts` (`MISSION_TIERS`) |
   | Tier 2 seed data | `server/src/config/seed-data.ts` |
   | Tier 2 post-run checks | `server/src/config/verification-checks.ts` |
   | Quest chains | `QUESTS` in `src/lib/game-data.ts` |
   | Achievements (if new) | `ACHIEVEMENTS` in `src/lib/game-data.ts` |

3. **ID conventions:**

   - Mission id: `mission-{n}` (use next free number if new).
   - Objective id: `obj-{n}-{i}` matching mission number and 1-based index.
   - Quest id: `quest-{kebab-name}`.
   - Chaos event id: `chaos-{n}-{i}`.

4. **Objective alignment (non-negotiable):**

   - Every objective in `game-data` for that mission **must** have a matching entry in `MISSION_VALIDATIONS` (same `objectiveId`).
   - For `MISSION_TIERS[missionId] === 'execute'`: **must** have `SEED_DATA[missionId]` and `VERIFICATION_CHECKS[missionId]` with **one check per objective** (same `objectiveId`). Use `verify: async (_db) => true` only when the check is inherently execution-output-based and cannot be inferred from DB state yet — and **document why** in your summary.
   - For `simulate`: extend `simulation.ts` handlers if new shell patterns need mock output; keep messages honest (“Simulated…”).
   - For `pattern`: no seed required; execution route returns pattern-only message.

5. **Skeletons:**

   - **Guided** strings must include `___BLANK___` where learners fill values.
   - **Hints** array: `line` is 1-based; `blankText`, `hint`, `answer`, optional `xpPenalty`.
   - **Expert** can be comment-only but must reference the same operations as objectives.

6. **Quests:**

   - `missionIds` order is the story order.
   - `requiredMissions` must be ≤ `missionIds.length` and consistent with design.
   - Every `missionIds` entry must exist in `MISSIONS`.

7. **Run + Validate UX requirement (non-negotiable):**

   - When Tier 2 code is executed from mission UI, terminal output must remain readable (no encoded payloads like base64 blobs).
   - Learners should see code actually executing in `mongosh`.
   - After scripted execution, interactive `mongosh` should remain available so learners can continue experimenting manually.

### Your task

**Mode:** [ new mission | refine mission | new quest | refine quest | bugfix ]

**Target id(s):** [ e.g. mission-26 or quest-data-heist ]

**Description from product owner:**  
[ Paste plain-language description of learning goals, scenario, difficulty, and any MongoDB features ]

**Constraints:** [ time limit seconds, XP, tier preference, requires Atlas yes/no, optional chaos events ]

### Deliverables

1. **Unified diff** (or clearly separated file blocks) for all edited files.
2. **Checklist** you verified: objective ids match across game-data, validations, skeleton hints, verification-checks; tier chosen; seed collections named consistently with skeleton (`db.collectionName`).
3. **If refining:** state what changed and why.
4. **If bugfix:** add a short **“Regression guard”** note: what test or assertion should prevent recurrence (e.g. “execute mission must define VERIFICATION_CHECKS”).

### Validation commands (must mention in PR description)

- `npm test` at repo root  
- `cd server && npm test`
- If you changed **routes, landing, dashboard, quests, or mission shell UI:** `npm run test:e2e` (Playwright; uses Vite on port **4173**)

---

## MASTER PROMPT (end copy)

---

## 4. After a bug: extra instructions to paste

Add this below your description when fixing incidents:

> **Bug post-mortem:** Summarize root cause. Update `MASTER_PROMPT_MISSION_QUEST_AUTHORING.md` §Authoritative rules if the mistake was systematic. If a contract test did not catch it, extend `src/test/mission-content-contract.test.ts` or `server/src/mission-contract.test.ts` with a minimal assertion.

---

## 5. Example short descriptions (stimulus only)

- *New:* “Mission: learners create a partial index with partialFilterExpression on `orders`; guided difficulty; recon tier; execute tier with seeded `orders`.”
- *Refine:* “Mission-3: objective 2 too vague; tighten briefing and add one hint on $unwind.”
- *Quest:* “New quest linking mission-12 → mission-1 → mission-18; bonus XP 400; codename OPERATION CHRONO.”
