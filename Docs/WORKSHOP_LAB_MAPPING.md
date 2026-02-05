## Mapping Current Labs to the New Content Model

This document sketches how the existing labs in `src/components/labs/` map to the new `WorkshopLabDefinition` and `WorkshopLabStep` model defined in `src/types/index.ts`.

The goal is to:

- Preserve the **current UX and flow** of Lab 1, Lab 2, and Lab 3.
- Make it clear how these labs will be expressed as content files in `content/labs/`.
- Provide a reference when we later extract step definitions out of the TSX components.

---

## 1. Current Labs Overview

- **Lab 1**: CSFLE Fundamentals with AWS KMS
  - Implement client-side field level encryption with AWS KMS.
  - Initialize key vault, create DEKs, test encrypted insert and query.
  - Source: `src/components/labs/Lab1CSFLE.tsx`.
- **Lab 2**: Queryable Encryption & Range Queries
  - Implement Queryable Encryption with range queries on salary and equality on taxId.
  - Work with encryptedFields, internal QE collections, and compaction.
  - Source: `src/components/labs/Lab2QueryableEncryption.tsx`.
- **Lab 3**: Migration & Multi-Tenant Patterns / Right to Erasure
  - Data migration from plaintext to encrypted state.
  - Per-tenant key isolation and GDPR right-to-erasure / crypto-shredding patterns.
  - Source: `src/components/labs/Lab3RightToErasure.tsx`.

Each of these labs currently defines its own step array inline, with titles, times, and verification hooks expressed as React props and functions.

---

## 2. Proposed IDs and Metadata

These IDs are examples; they should be stable once chosen because they will be referenced in content, verifiers, and analytics.

| Current Lab Component                 | Proposed Lab ID                    | Topic ID   | Difficulty      |
|--------------------------------------|------------------------------------|------------|-----------------|
| `Lab1CSFLE`                          | `lab-csfle-fundamentals`          | `encryption` | `intermediate` |
| `Lab2QueryableEncryption`            | `lab-qe-range-queries`            | `encryption` | `intermediate` |
| `Lab3RightToErasure`                 | `lab-gdpr-right-to-erasure`       | `encryption` | `advanced`     |

Topic `encryption` will be defined in `content/topics/encryption.yaml` and will reference these three labs as its default lab set.

---

## 3. Step ID Naming Strategy

To make step identifiers meaningful and stable, we will use the following pattern:

```text
<lab-id>-step-<short-slug>
``+

Examples:

- Lab 1:
  - `lab-csfle-fundamentals-step-create-cmk`
  - `lab-csfle-fundamentals-step-init-keyvault`
  - `lab-csfle-fundamentals-step-create-deks`
  - `lab-csfle-fundamentals-step-test-encryption`
- Lab 2:
  - `lab-qe-range-queries-step-create-qe-deks`
  - `lab-qe-range-queries-step-create-qe-collection`
  - `lab-qe-range-queries-step-insert-sample-data`
  - `lab-qe-range-queries-step-execute-range-query`
  - `lab-qe-range-queries-step-inspect-internal-collections`
  - `lab-qe-range-queries-step-compact-metadata`
- Lab 3:
  - `lab-gdpr-right-to-erasure-step-migration-pattern`
  - `lab-gdpr-right-to-erasure-step-multi-tenant-keys`
  - `lab-gdpr-right-to-erasure-step-gdpr-erasure`
  - `lab-gdpr-right-to-erasure-step-verify-erasure`
  - `lab-gdpr-right-to-erasure-step-key-rotation`

These IDs will be used:

- In `WorkshopLabStep.id` fields (content files).
- As part of verification IDs or their parameters for the VerificationService.
- In analytics and metrics to see where participants succeed or struggle.

---

## 4. Example Lab-to-Content Mapping (Lab 1)

The example in `content/README.md` (`lab-csfle-fundamentals.yaml`) is a concrete sketch of how Lab 1’s steps can be represented as `WorkshopLabDefinition` / `WorkshopLabStep` instances.

At a high level:

- `Lab1CSFLE.tsx` will become a thin container that:
  - Asks the ContentService for lab `lab-csfle-fundamentals`.
  - Passes that data to a generic `LabRunner` component.
  - Supplies any lab-specific framing UI if needed, without owning the step definitions.

The same pattern will be applied to Labs 2 and 3, with their own content files living under `content/labs/`.

---

## 5. Next Steps for Lab Migration (When We Reach That Phase)

When we are ready to migrate the labs (later in Phase 2):

1. Extract the existing step definitions from `Lab1CSFLE`, `Lab2QueryableEncryption`, and `Lab3RightToErasure` into YAML or JSON files under `content/labs/`, conforming to the `WorkshopLabDefinition` type.
2. Implement a `LabRunner` component and a minimal ContentService implementation that:
   - Loads lab definitions from `content/labs/`.
   - Returns them as `WorkshopLabDefinition` objects.
3. Update each lab component to:
   - Resolve its lab ID.
   - Render `LabRunner` with the data from the ContentService.
4. Verify that:
   - Titles, descriptions, and steps match the current UI.
   - Any verification or hint behavior is preserved.

This mapping document is intentionally descriptive and preparatory; it does not change runtime behavior on its own.

