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

### Phases Completed (0–14)

Phases 0–14 are done. See `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md` for full tracking.

---

## Next Phase: Phase 15 – PARTIAL-RECOVERY (PoV #15)

**Scope:** Ability to recover a subset of data to the running live database, without requiring database or application downtime.

**Source proof:** `Docs/pov-proof-exercises/proofs/15/README.md`

### Deliverables for Phase 15

1. **Lab definitions** (3 labs, ~9 steps total)
   - `lab-partial-recovery-overview` – Concepts: PITR to temp, mongoexport, mongoimport
   - `lab-partial-recovery-setup` – Main cluster + temp cluster, load 100 customer docs, continuous insert script
   - `lab-partial-recovery-execute` – Delete 100 docs, PITR to temp, export, import back to live

2. **Enhancement metadata**
   - Create `src/content/topics/operations/partial-recovery/enhancements.ts`
   - Add code blocks, skeletons, inline hints for each step
   - Enhancement IDs: `partial-recovery.concepts`, `partial-recovery.setup`, etc.

3. **Content index & loader**
   - Register labs in `src/content/topics/index.ts`
   - Add `partial-recovery` prefix to enhancement loader

4. **Tests**
   - Add `src/test/labs/PartialRecoveryEnhancements.test.ts`

5. **Documentation**
   - Create `Docs/PHASE_15_PARTIAL_RECOVERY_COMPLETION_SUMMARY.md`
   - Update `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`

6. **Optional: Partial recovery diagram**
   - Add `PartialRecoveryFlowDiagram` to `LabArchitectureDiagrams.tsx`
   - Register in `labIntroComponents` for `lab-partial-recovery-overview`

### Flow (from proof 15)

1. Load 100 customer docs into `test.customers`
2. Run continuous insert script (simulates live app)
3. Take snapshot (ensure PITR available)
4. Delete the 100 customer docs
5. PITR restore to temp cluster (point before delete)
6. mongoexport from temp → `lost_records.json`
7. mongoimport into main cluster
8. Verify 100 docs restored; continuous insert never stopped

---

## After Phase 15: Phase 16–18 (Next Batch)

| Phase | PoV | Description |
|-------|-----|-------------|
| 16 | REPORTING | SQL/ODBC BI tools |
| 17 | AUTO-HA | Single-region failover |
| 18 | MULTI-REGION-HA | Multi-region failover |

---

## Key References

- **Master plan:** `Docs/COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md`
- **PoV list:** `Docs/POV.txt`
- **Proof 15:** `Docs/pov-proof-exercises/proofs/15/README.md`
- **Implementation checklist:** See §6 in COMPREHENSIVE_POV_LAB_IMPLEMENTATION_PLAN.md
- **Lab folder structure:** `Docs/LAB_FOLDER_STRUCTURE_GUIDELINE.md`
- **Content standards:** `Docs/CONTENT_STANDARDS.md`

---

## Quick Start Tomorrow

```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
git checkout feature/phase-15-partial-recovery  # or your branch name
npm run dev
```

Then create `src/content/topics/operations/partial-recovery/` and follow the Phase 15 deliverables above.
