# What's Next – Workshop Framework

**Last updated:** 2026-02-05

---

## Current Status

### Just Completed (This Session)

- **Lab overview diagrams** – Added flow diagrams to 7 labs:
  - lab-full-recovery-rpo-overview (PITR flow)
  - lab-full-recovery-rto-overview (RTO flow)
  - lab-migratable-overview, lab-portable-overview (Live Migration flow)
  - lab-rolling-updates-overview (Rolling upgrade)
  - lab-scale-out-overview (Shard distribution)
  - lab-workload-isolation-overview (Node topology)
- **Key concepts** – Added `keyConcepts` to lab definitions for overview pages
- **ContentBrowser fix** – Fixed `onTestLabs` ReferenceError
- **Multi-select labs** – Select All, Test Selected in Lab Pool Browser

### Phases Completed (0–16)

Phases 0–16 are done. See `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md` for full tracking.

---

## Just Completed: Phase 16 – REPORTING (PoV #16) ✅

**Scope:** Expose MongoDB data to business analysts using SQL/ODBC-based BI and reporting tools (BI Connector, MySQL Workbench, airline on-time data).

**Delivered:** 3 labs (overview, setup, execute), 9 enhancements, loader + index + integration topic (REPORTING), `ReportingEnhancements.test.ts`, and `Docs/PHASE_16_REPORTING_COMPLETION_SUMMARY.md`.

---

## Next Phase: Phase 17 – AUTO-HA (PoV #17)

| Phase | PoV | Description |
|-------|-----|-------------|
| 17 | AUTO-HA | Single-region failover |
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
