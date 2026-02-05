## Workshop Content Repository Layout

This directory will hold **all content definitions** for the workshop framework (topics, labs, quests, flags, templates, industries, and competitor scenarios). The goal is that most new workshops and challenges can be created by editing files here, without changing React components.

The structure is intentionally simple and can evolve as needed.

### Directory Structure (Initial)

- `content/topics/`
  - Topic definitions (for example, `encryption`, `schema-design`).
- `content/labs/`
  - Lab definitions (for example, `lab-csfle-fundamentals`, `lab-qe-range-queries`, `lab-gdpr-right-to-erasure`).
- `content/quests/`
  - Story-driven quests that span multiple labs and steps.
- `content/flags/`
  - CTF-style flags (verifiable objectives) used in challenge mode.
- `content/workshop-templates/`
  - Reusable workshop recipes (for example, `retail-encryption-quickstart`, `financial-services-reg-data`).
- `content/industries/`
  - Industry-specific presets and challenge descriptions.
- `content/competitor-scenarios/`
  - Definitions for MongoDB vs competitor comparisons, linked to labs and steps.
- `content/shared-snippets/`
  - Shared code samples, Markdown fragments, and datasets reused across labs.

At the time of writing this file, these subdirectories may not yet exist. They will be created and populated incrementally as part of the implementation of Phase 2 and beyond.

---

## Lab Definition Example (Sketch)

This is an illustrative example of how a lab (for example, the current CSFLE lab) could be represented. The exact schema will be defined via JSON Schema and TypeScript types (`WorkshopLabDefinition` and `WorkshopLabStep` in `src/types/index.ts`).

```yaml
# content/labs/lab-csfle-fundamentals.yaml

id: "lab-csfle-fundamentals"
topicId: "encryption"
title: "Lab 1: CSFLE Fundamentals with AWS KMS"
description: >
  Implement Client-Side Field Level Encryption with AWS KMS,
  initialize the key vault, and verify encrypted fields.
difficulty: "intermediate"
estimatedTotalTimeMinutes: 15
tags:
  - "csfle"
  - "aws-kms"
  - "security"
  - "hands-on"
prerequisites:
  - "aws-kms-set-up"
  - "mongodb-cluster-ready"

steps:
  - id: "csfle-step-create-cmk"
    title: "Create Customer Master Key (CMK) in AWS KMS"
    narrative: >
      In this step, you provision a CMK in AWS KMS that will wrap
      your data encryption keys. This key never leaves AWS.
    instructions: |
      Use the AWS CLI to create a CMK with ENCRYPT_DECRYPT usage.
      Save the returned ARN; you will use it throughout the lab.
    estimatedTimeMinutes: 5
    verificationId: "csfle.verifyCmkExists"
    points: 10

  - id: "csfle-step-init-keyvault"
    title: "Initialize Key Vault with Unique Index"
    narrative: >
      The key vault stores your wrapped data encryption keys (DEKs)
      in the `encryption.__keyVault` collection.
    instructions: |
      Run the provided script to create a partial unique index on
      `keyAltNames` in the `encryption.__keyVault` collection.
    estimatedTimeMinutes: 5
    verificationId: "csfle.verifyKeyVaultIndex"
    points: 10

  - id: "csfle-step-create-deks"
    title: "Generate Data Encryption Keys (DEKs)"
    narrative: >
      Create DEKs for SSN and salary fields using the CMK in AWS KMS.
    instructions: |
      Run the `create-deks.js` script. Confirm that two DEKs are created
      with the expected `keyAltNames`.
    estimatedTimeMinutes: 10
    verificationId: "csfle.verifyDekCount"
    points: 15

  - id: "csfle-step-test-encryption"
    title: "Test CSFLE with Insert and Query"
    narrative: >
      Insert an employee record and verify that sensitive fields are stored
      as encrypted binary data and can be queried deterministically.
    instructions: |
      Run `test-csfle.js` and confirm that:
      - The document is inserted successfully.
      - A query on `ssn` returns the expected record.
      - In Compass, `ssn` and `salary` appear as Binary (Subtype 6).
    estimatedTimeMinutes: 15
    verificationId: "csfle.verifyEncryptedFields"
    points: 20
```

This file is **illustrative only** and will not be loaded by the app until the ContentService is implemented and wired up. It serves as a reference for how the existing Lab 1 content can be mapped into the new content model.

