# Lab Library Architecture: Reusable Labs Across Quests & Challenges

## Overview

The workshop framework uses a **Lab Library** approach where labs are **generic, reusable building blocks** that can be composed into different quests and challenges with **quest-specific narrative customization**. This eliminates duplication while enabling rich, context-specific storytelling.

## Core Principle: Labs as Atomic Units

**Labs are atomic, reusable units** that define:
- **Steps** (what to do, code examples, verification)
- **Technical content** (code blocks, skeletons, inline hints)
- **Verification logic** (how to check completion)

**Labs are NOT**:
- Quest-specific narratives
- Challenge-specific story contexts
- Mode-specific content (though steps can be filtered by mode)

## Lab Context Overlay System

To enable labs to be reused across different quests/challenges with different narratives, we use **Lab Context Overlays**:

### How It Works

1. **Lab Definition** (`WorkshopLabDefinition`):
   - Generic lab with steps, code, verification
   - Example: `lab-csfle-fundamentals` - teaches CSFLE concepts

2. **Quest Definition** (`WorkshopQuest`):
   - References lab IDs: `labIds: ['lab-csfle-fundamentals']`
   - Provides **lab context overlays** for quest-specific narrative:
     ```typescript
     labContextOverlays: [{
       labId: 'lab-csfle-fundamentals',
       introNarrative: 'Quest-specific intro for this lab...',
       outroNarrative: 'Quest-specific outro...',
       stepNarrativeOverrides: {
         'step-id': 'Quest-specific step narrative'
       }
     }]
     ```

3. **LabRunner** applies overlays:
   - When rendering a lab in quest context, `LabRunner` receives `labContextOverlay`
   - Overlays customize title, description, step narratives
   - **Steps, code, and verification remain unchanged** (no duplication!)

### Example: Same Lab, Different Stories

**Lab**: `lab-csfle-fundamentals` (generic CSFLE lab)

**Quest 1: "Stop the Leak" (Retail Data Breach)**
```typescript
labContextOverlays: [{
  labId: 'lab-csfle-fundamentals',
  introNarrative: 'You're implementing CSFLE to encrypt customer PII in the retail database. The CMK you create will protect all customer data encryption keys. This is critical - a security audit is scheduled in 48 hours.',
  stepNarrativeOverrides: {
    'step-create-cmk': 'Create the root encryption key that will protect all customer PII. This CMK must be properly secured - it's the foundation of your encryption strategy.'
  }
}]
```

**Quest 2: "HIPAA Compliance" (Healthcare)**
```typescript
labContextOverlays: [{
  labId: 'lab-csfle-fundamentals',
  introNarrative: 'You're securing patient health records (PHI) to meet HIPAA requirements. The encryption keys you create will protect sensitive medical data from unauthorized access.',
  stepNarrativeOverrides: {
    'step-create-cmk': 'Create the encryption key that will protect patient PHI. HIPAA requires encryption of PHI at rest - this CMK is your compliance foundation.'
  }
}]
```

**Same lab steps, same code, same verification** - but **different story context**!

## Lab Library Structure

### Recommended Lab Organization

```
src/content/labs/
├── encryption/
│   ├── lab-csfle-fundamentals.ts          # Generic CSFLE lab
│   ├── lab-queryable-encryption.ts        # Generic QE lab
│   ├── lab-right-to-erasure.ts           # Generic GDPR lab
│   └── lab-key-rotation.ts                # Generic key rotation lab
├── analytics/
│   ├── lab-aggregation-pipelines.ts       # Generic aggregation lab
│   ├── lab-time-series.ts                 # Generic time-series lab
│   └── lab-vector-search.ts               # Generic vector search lab
├── scalability/
│   ├── lab-sharding.ts                    # Generic sharding lab
│   └── lab-change-streams.ts              # Generic change streams lab
└── ...
```

### Quest Organization

```
src/content/quests/
├── encryption/
│   ├── quest-stop-the-leak.ts             # Uses: lab-csfle-fundamentals, lab-queryable-encryption
│   ├── quest-hipaa-compliance.ts          # Uses: lab-csfle-fundamentals, lab-right-to-erasure
│   └── quest-pci-compliance.ts           # Uses: lab-csfle-fundamentals, lab-key-rotation
├── analytics/
│   ├── quest-real-time-dashboard.ts       # Uses: lab-aggregation-pipelines, lab-change-streams
│   └── quest-semantic-search.ts           # Uses: lab-vector-search
└── ...
```

### Challenge Template Organization

```
src/content/workshop-templates/
├── retail-data-breach-simulation.ts       # Uses: quest-stop-the-leak, quest-harden-the-system
├── healthcare-hipaa-workshop.ts          # Uses: quest-hipaa-compliance
├── financial-services-compliance.ts      # Uses: quest-pci-compliance, quest-audit-trail
└── ...
```

## POV.txt Coverage Strategy

Based on `Docs/POV.txt`, labs should cover MongoDB's **57 PoV proofs** across categories:

### Encryption & Security (Proofs 21, 22, 23, 24, 46, 54)
- ✅ `lab-csfle-fundamentals` (ENCRYPT-FIELDS, FLE-QUERYABLE-KMIP)
- ✅ `lab-queryable-encryption` (ENCRYPT-FIELDS, FLE-QUERYABLE-KMIP)
- ✅ `lab-right-to-erasure` (ENCRYPT-FIELDS)
- 🔄 `lab-rbac` (RBAC, END-USER-RBAC)
- 🔄 `lab-auditing` (AUDITING)
- 🔄 `lab-ldap-integration` (LDAP)

### Query & Analytics (Proofs 1, 4, 16, 32, 36, 37, 42, 43, 44)
- 🔄 `lab-rich-queries` (RICH-QUERY)
- 🔄 `lab-aggregation-pipelines` (IN-PLACE-ANALYTICS, JOINS)
- 🔄 `lab-text-search` (TEXT-SEARCH, AUTO-COMPLETE)
- 🔄 `lab-vector-search` (RETRIEVAL-AUGMENTED-GENERATION, VECTOR-AUTO-EMBEDDING)
- 🔄 `lab-time-series` (TIME-SERIES)
- 🔄 `lab-incremental-analytics` (INCREMENTAL-ANALYTICS)

### Scalability & Performance (Proofs 3, 5, 7, 8, 17, 18, 31, 38, 50)
- 🔄 `lab-sharding` (SCALE-OUT, MULTI-REGION-HA)
- 🔄 `lab-workload-isolation` (WORKLOAD-ISOLATION)
- 🔄 `lab-elastic-scale` (ELASTIC-SCALE, SCALE-UP)
- 🔄 `lab-multi-cloud` (MULTI-CLOUD)

### Data Management (Proofs 2, 6, 9, 10, 11, 12, 13, 14, 15, 19, 20, 25, 26, 27, 28, 29, 30, 33, 34, 35, 39, 40, 41, 45, 47, 48, 49, 51, 52, 56)
- 🔄 `lab-schema-validation` (SCHEMA, FLEXIBLE)
- 🔄 `lab-transactions` (TRANSACTION, CONSISTENCY)
- 🔄 `lab-change-streams` (CHANGE-CAPTURE, STREAM-PROCESSING)
- 🔄 `lab-migration` (MIGRATABLE, PORTABLE)
- 🔄 `lab-backup-recovery` (FULL-RECOVERY-RPO, FULL-RECOVERY-RTO, PARTIAL-RECOVERY)
- 🔄 `lab-monitoring-alerts` (MONITORING, ALERTS, PERF-ADVICE)
- 🔄 `lab-data-api` (DATA-REST-API, DATA-API, GRAPHQL)
- 🔄 `lab-device-sync` (DEVICE-SYNC)
- 🔄 `lab-kafka-integration` (KAFKA)
- 🔄 `lab-archive-storage` (ARCHIVE-STORAGE)

### Deployment & Operations (Proofs 11, 12, 48)
- 🔄 `lab-terraform-deployment` (TERRAFORM, AUTO-DEPLOY)
- 🔄 `lab-rolling-updates` (ROLLING-UPDATES)

## Creating Reusable Labs

### Step 1: Define Generic Lab

```typescript
// src/content/labs/encryption/lab-csfle-fundamentals.ts
export const labCsfleFundamentals: WorkshopLabDefinition = {
  id: 'lab-csfle-fundamentals',
  title: 'CSFLE Fundamentals',
  description: 'Learn Client-Side Field Level Encryption',
  // ... steps, verification, etc.
  // NO quest-specific narrative here!
};
```

### Step 2: Use Lab in Multiple Quests

```typescript
// Quest 1: Retail context
export const stopTheLeakQuest: WorkshopQuest = {
  labIds: ['lab-csfle-fundamentals'],
  labContextOverlays: [{
    labId: 'lab-csfle-fundamentals',
    introNarrative: 'Retail customer PII encryption context...'
  }]
};

// Quest 2: Healthcare context
export const hipaaComplianceQuest: WorkshopQuest = {
  labIds: ['lab-csfle-fundamentals'],
  labContextOverlays: [{
    labId: 'lab-csfle-fundamentals',
    introNarrative: 'HIPAA PHI encryption context...'
  }]
};
```

### Step 3: LabRunner Applies Overlay

When rendering `lab-csfle-fundamentals` in `stopTheLeakQuest` context:
- Uses quest's `introNarrative` instead of generic lab description
- Applies step-level narrative overrides
- **Keeps all steps, code, verification unchanged**

## Benefits

1. **No Duplication**: One lab definition, multiple quest contexts
2. **Consistent Quality**: Same verification logic, same code examples
3. **Easy Updates**: Fix a bug in one place, all quests benefit
4. **Rich Storytelling**: Quest-specific narratives without code duplication
5. **Scalability**: Build library of labs, compose into infinite quests/challenges

## Best Practices

1. **Keep Labs Generic**: Labs should teach concepts, not specific customer scenarios
2. **Use Overlays for Context**: Quest-specific narrative goes in `labContextOverlays`
3. **Step Filtering**: Use `stepFilter` to show/hide steps based on quest needs
4. **Mode Support**: Labs can support multiple modes (`lab`, `demo`, `challenge`)
5. **Documentation**: Each lab should document what it teaches and which PoV proofs it covers

## Example: Building a New Challenge

1. **Identify Labs Needed**: "I need encryption + auditing + monitoring"
2. **Check Lab Library**: Do these labs exist?
   - ✅ `lab-csfle-fundamentals` (encryption)
   - ✅ `lab-auditing` (auditing)
   - ✅ `lab-monitoring-alerts` (monitoring)
3. **Create Quest**: Define quest with `labIds` and `labContextOverlays`
4. **Create Challenge Template**: Compose quests into full challenge
5. **Done!** No need to duplicate lab code or verification logic.

This architecture enables MongoDB to be positioned as **one developer data platform** supporting many use cases, with labs that demonstrate capabilities across all PoV proofs while maintaining minimal cognitive load and maximum reusability.
