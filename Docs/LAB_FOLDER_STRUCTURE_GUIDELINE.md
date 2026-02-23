# Lab Folder Structure Guideline

**Last updated:** 2026-02-05

---

## Overview

Labs and topics are **colocated** under `src/content/topics/`. Each topic folder contains:

- `topic.ts` – topic definition (name, description, povCapabilities)
- Lab definitions (`.ts` files), either flat or in POV subfolders
- Optional `data/` and `scripts/` subfolders for shared resources

See `Docs/TOPIC_CENTRIC_STRUCTURE_PROPOSAL.md` for the full rationale and migration details.

---

## Topic-Centric Structure (Current)

```
src/content/topics/
├── encryption/
│   ├── topic.ts
│   ├── csfle/
│   │   ├── enhancements.ts
│   │   └── lab-csfle-fundamentals.ts
│   ├── queryable-encryption/
│   │   ├── enhancements.ts
│   │   └── lab-queryable-encryption.ts
│   └── right-to-erasure/
│       ├── enhancements.ts
│       └── lab-right-to-erasure.ts
├── data-management/
│   ├── topic.ts
│   ├── change-capture/
│   │   └── lab-data-change-streams.ts
│   └── flexible/
│       ├── lab-flexible-basic-evolution.ts
│       ├── lab-flexible-nested-documents.ts
│       └── lab-flexible-microservice-compat.ts
├── query/
│   ├── topic.ts
│   ├── rich-query/
│   │   ├── enhancements.ts      # Code blocks, skeletons, hints for rich-query.*
│   │   ├── lab-rich-query-basics.ts
│   │   ├── lab-rich-query-aggregations.ts
│   │   └── lab-rich-query-encrypted-vs-plain.ts
│   ├── text-search/
│   ├── geospatial/
│   └── graph/
├── scalability/
│   ├── topic.ts
│   ├── consistency/
│   ├── ingest-rate/
│   ├── scale-out/
│   └── scale-up/
├── analytics/
│   ├── topic.ts
│   ├── in-place-analytics/
│   └── workload-isolation/
├── operations/
│   ├── topic.ts
│   ├── monitoring/
│   ├── rolling-updates/
│   ├── full-recovery-rpo/
│   └── full-recovery-rto/
├── deployment/
│   ├── topic.ts
│   └── migratable/
├── integration/
│   └── topic.ts
├── security/
│   └── topic.ts
├── _fixtures/
│   └── test-lab.ts          # Test-only, not in allLabs
└── index.ts                  # Barrel: allTopics, allLabs
```

**Rule:** Labs are grouped by their **topic** (via `topicId`). Topics with multiple POVs use subfolders (e.g. `query/rich-query/`). Topics with a single focus (e.g. encryption) keep labs flat in the topic folder.

---

## Metadata Configuration

### Lab-level data requirements

In `WorkshopLabDefinition`:

```ts
{
  id: 'lab-scale-up-execute',
  labFolderPath: 'Docs/pov-proof-exercises/proofs/08',  // or content/topics/scalability/scale-up
  dataRequirements: [
    {
      id: 'params-template',
      description: 'Connection string config template',
      type: 'file',
      path: 'scripts/params.py.template',
      sizeHint: '1KB'
    },
    ...
  ],
  steps: [...]
}
```

### Step-level data requirements

In `WorkshopLabStep`:

```ts
{
  id: 'step-1',
  title: 'Load sample data',
  dataRequirements: [
    {
      id: 'sample-docs',
      description: 'Sample documents for aggregation',
      type: 'file',
      path: 'data/sample_docs.json',
      sizeHint: '100KB'
    }
  ],
  ...
}
```

### Enhancement metadata

Enhancement metadata lives **with the topic/POV** in `src/content/topics/`:

- **Per-POV:** `content/topics/<topic>/<pov>/enhancements.ts` (e.g. `query/rich-query/enhancements.ts`, `encryption/csfle/enhancements.ts`, `operations/full-recovery-rpo/enhancements.ts`)

Example:

```ts
'scale-up.params-config': {
  id: 'scale-up.params-config',
  dataRequirements: [
    { id: 'params', type: 'file', path: 'scripts/params.py.template', description: 'Config template' }
  ],
  codeBlocks: [...],
  ...
}
```

---

## Creating New Labs

Use the create-lab script with topic and optional POV subfolder:

```bash
# Flat topic (encryption)
node scripts/create-lab.js --name="My Lab" --topic=encryption --pov=ENCRYPT-FIELDS

# Topic with POV subfolder (query)
node scripts/create-lab.js --name="My Lab" --topic=query --pov-folder=rich-query --pov=RICH-QUERY
```

Then add the lab to `src/content/topics/index.ts` in the `allLabs` array.

---

## When to Use

- **Topic folder:** Every topic has its own folder with `topic.ts`.
- **POV subfolder:** Use when a topic spans multiple capabilities (e.g. query → rich-query, text-search, geospatial, graph).
- **Flat labs:** Topics with a single focus (encryption, deployment) keep labs directly in the topic folder.
- **Shared data:** If multiple labs share data, keep it in a shared folder like `content/data/` and reference by path.

---

## Loading Data

The LabRunner or setup wizard can use `dataRequirements` to:

1. Show a "Data setup" step before the lab starts
2. Offer to load sample data into MongoDB
3. Copy script templates to a workspace
4. Validate that required collections exist

**Implementation:** See **`Docs/LAB_SAMPLE_DATA_PLAN.md`** for the approach (Load Sample Data button, Start disabled until loaded, reset = restore original dataset). When a lab requires pre-loaded data, include at least one `dataRequirements` entry with `type: 'collection'` (and `namespace`) or `type: 'script'` (and `path` to seed script).
