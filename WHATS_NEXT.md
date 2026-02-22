# What's Next – Workshop Framework

**Last updated:** 2026-02-05

---

## Current Status

### Just Completed (feature/workshop-session-wizard)

- **Workshop session wizard** – 3-step wizard: (1) Customer & context (name, Salesforce workload, technical champion, current DB, date), (2) Mode & tech (Demo/Lab/Challenge, Python/Node/Java, MongoDB local/Atlas), (3) Template or labs (predefined template picker). Start new session or **clone session** to change mode/template; **delete current session** in Danger Zone.
- **Session model** – `WorkshopSession` extended with `salesforceWorkloadName`, `technicalChampionName`/`Email`, `currentDatabase`, `mode`, `programmingLanguage`, `templateId`, `labIds`. `startNewWorkshop(options)`, `cloneWorkshopSession()`, `deleteCurrentWorkshopSession()`.
- **Query & Search** – Text-search labs (basics, autocomplete, experience) now have `enhancementId` per step, `text-search/enhancements.ts`, loader registration, `TextSearchEnhancements.test.ts`. Query & Search topic is fully working.
- **Docs** – `WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md` (15 POVs, modes, wizard, data storage Atlas vs local, clone, key concepts side-by-side). `ADD_LAB_MASTER_PROMPT.md` updated with principles; `VALIDATE_LABS_MASTER_PROMPT.md` with **validate by topic and lab name** prompt.

### Phases Completed (0–17)

Phases 0–17 are done (including AUTO-HA). See `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md` for full tracking.

---

## Next Steps (pick one or more)

1. **15 POVs quality review** – Run `Docs/VALIDATE_LABS_MASTER_PROMPT.md` (full audit or validate by topic/lab). Fix gaps from `Docs/YYYY-MM-DD_FIX_PLAN.md` so all 15 POVs are high quality and engaging in Demo, Lab, and Challenge modes.
2. **Data storage** – Implement central template store (MongoDB Atlas, obfuscated URI) for predefined templates; keep session data on provided URI (default local). See `Docs/WORKSHOP_SESSION_AND_QUALITY_PRINCIPLES.md` §4.
3. **Key concepts side-by-side** – Ensure intro/key-concepts view shows MongoDB vs competitor side-by-side when content supports it (already in StepView for demo; extend to intro if needed).
4. **Optional: specific labs in wizard** – In wizard step 3, allow “Select specific labs” (e.g. LabPoolBrowser) in addition to predefined templates, and support combining topics (Encryption + Analytics) with full lab steps.
5. **Next phase: Phase 18 – MULTI-REGION-HA** (or next POV in `Docs/POV.txt`).

| Phase | PoV | Description |
|-------|-----|-------------|
| 17 | AUTO-HA | Single-region failover ✅ |
| 18 | MULTI-REGION-HA | Multi-region failover |

---

## Key References

- **Master plan:** `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`
- **PoV list:** `Docs/POV.txt`
- **Proof 15 (Partial Recovery):** `Docs/pov-proof-exercises/proofs/15/README.md`
- **Proof 16 (Reporting):** `Docs/pov-proof-exercises/proofs/16/README.md`
- **Next proof:** See `Docs/POV.txt` for Phase 17 (AUTO-HA) proof number
- **Implementation checklist:** See §6 in COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md
- **Lab folder structure:** `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md`
- **Content standards:** `Docs/CONTENT_STANDARDS.md`

---

## Quick Start Tomorrow

```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
npm run dev
```

For Phase 17 (AUTO-HA), check `Docs/POV.txt` and `Docs/pov-proof-exercises/proofs/` for the proof number and follow the same pattern: create topic folder, 3 labs, enhancements, register, tests, completion summary.
