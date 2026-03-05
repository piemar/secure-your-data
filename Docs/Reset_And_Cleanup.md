# Reset Progress and Cleanup

When the user clicks **Reset progress**, the app clears local lab state and runs cleanup of cloud and database resources. This document describes how that cleanup works.

---

## Flow

1. **Before clearing localStorage:** The app reads `lab_mongo_uri`, `lab_kms_alias`, `lab_aws_profile`, and (if no alias) `lab_user_suffix` from localStorage.
2. **Cleanup sequence:** The client calls `runResetCleanup()` in [src/services/resetCleanup.ts](src/services/resetCleanup.ts), which:
   - Calls the KMS cleanup API (alias + key deletion).
   - Calls the MongoDB cleanup API (drop lab databases).
3. **Results:** Each step returns a status (success / skipped / error). Results are shown in the **Reset cleanup status** dialog.
4. **After cleanup:** Local state is cleared (completed steps, hints, editor content, etc.) as in the existing reset flow.

---

## KMS Cleanup

- **API:** `GET /api/cleanup-resources?alias=<alias>&profile=<aws-profile>`
- **Implementation:** Dev server proxy in [vite.config.ts](vite.config.ts) uses the **AWS CLI** (no backend service):
  1. Resolve alias to Key ID: `aws kms list-aliases --profile ... --query "Aliases[?AliasName=='...'].TargetKeyId"`.
  2. Delete the alias: `aws kms delete-alias --alias-name ...`.
  3. Schedule key deletion: `aws kms schedule-key-deletion --key-id ... --pending-window-in-days 7`.
- **Behavior:** AWS KMS keys are scheduled for deletion (7-day minimum pending window); they are not deleted immediately. The alias is removed so the lab can reuse the same alias name.
- **When skipped:** If no `lab_kms_alias` (or derived `alias/mongodb-lab-key-<suffix>`) is stored, KMS cleanup is skipped and reported as “No alias configured”.

---

## MongoDB Cleanup

- **API:** `POST /api/cleanup-lab-collections` with body `{ "uri": "<connection string>" }`
- **Implementation:** Dev server in [vite.config.ts](vite.config.ts) uses the Node.js MongoDB driver to connect and **drop entire databases** (not individual collections):
  - **Databases dropped:** `encryption`, `medical`, `hr`
- **Effect:** All collections in those databases are removed, including:
  - `encryption.__keyVault`
  - `medical.patients`, `medical.patients_legacy`, `medical.patients_secure` (and any other collections in `medical`)
  - `hr.employees` and QE metadata (e.g. `enxcol_.employees.esc`, `enxcol_.employees.ecoc`) and any other collections in `hr`
- **URI handling:** If the client sends a local/no-auth URI (e.g. `mongodb://localhost:27017`) and the server has `MONGODB_URI` set, the server uses `MONGODB_URI` for the connection (e.g. for Docker or remote Atlas).
- **When skipped:** If no URI is provided or stored, MongoDB cleanup is skipped and reported as “No URI configured”.

---

## Status Dialog

The **Reset cleanup status** dialog lists each step (KMS, MongoDB per database or connection) and the outcome: success, skipped, or error (with message). The user can dismiss the dialog after reviewing.

---

## Files

| Purpose | File |
|--------|------|
| Cleanup orchestration | [src/services/resetCleanup.ts](src/services/resetCleanup.ts) |
| KMS + MongoDB API (dev server) | [vite.config.ts](vite.config.ts) (search for `cleanup-resources`, `cleanup-lab-collections`) |
| Reset trigger + dialog | [AppSidebar.tsx](src/components/layout/AppSidebar.tsx), [ResetCleanupStatusDialog.tsx](src/components/labs/ResetCleanupStatusDialog.tsx) |

---

## Troubleshooting

If you see **"Alias not found"** even after creating the key in Step 1, or have **Docker build** issues, see [Docker_Troubleshooting.md](Docker_Troubleshooting.md).
