# Phase 10: PORTABLE Completion Summary

**Date Completed:** February 5, 2026  
**PoV Capability:** PORTABLE (Proof of Value #10)  
**Status:** ✅ Complete

---

## Objective

Implement comprehensive lab content for the **PORTABLE** proof of value capability, demonstrating MongoDB's ability to migrate a database from one public cloud provider to another (e.g. AWS → Azure) with less than 1 minute of scheduled application downtime, avoiding cloud vendor lock-in.

---

## Proof Summary

The PORTABLE proof demonstrates:

- **Cloud-to-Cloud Migration** – Source: Atlas in AWS (AWSTestCluster); Target: Atlas in Azure (AzureTestCluster)
- **Live Migration** – Same flow as MIGRATABLE: initial sync + continuous oplog tailing + cutover
- **Load Generator** – mgeneratejs + mongoimport (insurance customer records via CustomerSingleView.json)
- **Minimal downtime** – Typically < 1 minute measured with stopwatch
- **Hostname** – Migration tool requires non-SRV format for source primary

**Source:** `Docs/pov-proof-exercises/proofs/10/README.md`

---

## Labs Implemented

### 1. **lab-portable-overview** (`lab-portable-overview.ts`)
**Title:** Portable Overview  
**Steps:** 3  
**Total Time:** ~25 minutes

- **Step 1:** Understand Cloud-to-Cloud Migration
  - AWS → Azure, same Live Migration flow
  - Enhancement ID: `portable.concepts`

- **Step 2:** Cutover and Application Switchover
  - Stopwatch measurement, connection string change
  - Enhancement ID: `portable.cutover`

- **Step 3:** Prerequisites and CIDR Blocks
  - IP whitelist, non-SRV hostname for migration tool
  - Enhancement ID: `portable.prerequisites`

### 2. **lab-portable-setup** (`lab-portable-setup.ts`)
**Title:** Portable: Environment Setup  
**Steps:** 3  
**Total Time:** ~45 minutes

- **Step 1:** Create Atlas Clusters in AWS and Azure
  - M30 in AWS, M30 in Azure, CIDR blocks
  - Enhancement ID: `portable.atlas-setup`

- **Step 2:** Record Connection Strings and Hostname
  - SRV for app, non-SRV for migration tool
  - Enhancement ID: `portable.connection-strings`

- **Step 3:** Install mgeneratejs
  - npm install -g mgeneratejs, CustomerSingleView.json
  - Enhancement ID: `portable.mgeneratejs-setup`

### 3. **lab-portable-execute** (`lab-portable-execute.ts`)
**Title:** Portable: Execute Migration and Cutover  
**Steps:** 3  
**Total Time:** ~35 minutes

- **Step 1:** Load Initial Data and Start Live Migration
  - 200k docs, initiate migration, live tailing
  - Enhancement ID: `portable.initiate`

- **Step 2:** Perform Cutover
  - Stop mgeneratejs, Start Cutover, switch URI, restart
  - Enhancement ID: `portable.cutover-execute`

- **Step 3:** Verify Migration Success
  - AWS count stops, Azure count increases, stopwatch
  - Enhancement ID: `portable.verify`

---

## Enhancement Metadata

9 enhancements in `src/labs/enhancements/metadata/portable.ts`:
- portable.concepts, portable.cutover, portable.prerequisites
- portable.atlas-setup, portable.connection-strings, portable.mgeneratejs-setup
- portable.initiate, portable.cutover-execute, portable.verify

---

## Files Created

1. `src/content/topics/deployment/portable/lab-portable-overview.ts`
2. `src/content/topics/deployment/portable/lab-portable-setup.ts`
3. `src/content/topics/deployment/portable/lab-portable-execute.ts`
4. `src/labs/enhancements/metadata/portable.ts`
5. `src/test/labs/PortableEnhancements.test.ts`
6. `Docs/PHASE_10_PORTABLE_COMPLETION_SUMMARY.md`

---

## Files Modified

1. `src/content/topics/index.ts` – Registered 3 labs
2. `src/labs/enhancements/loader.ts` – Added portable module
3. `src/content/topics/deployment/topic.ts` – Added PORTABLE to povCapabilities, updated description

---

## Key Concepts

- **Cloud-to-Cloud** – Both source and target are Atlas clusters in different clouds
- **mgeneratejs** – JSON document generator; CustomerSingleView.json for insurance customer records
- **test.customers** – Collection used in the proof (200k documents)
- **Non-SRV hostname** – Migration tool cannot use SRV; use first primary hostname
- **CIDR blocks** – Same as MIGRATABLE; add to IP whitelist from Migrate Data dialog

---

## Next Steps

**Phase 11:** AUTO-DEPLOY (PoV #11) – automate deployment & configuration of production-ready cluster within X minutes

---

**Phase 10 Status:** ✅ **COMPLETE**
