# Topic-Centric Content Structure Proposal

**Date:** 2026-02-05

---

## Problem

Currently we have two separate trees that are conceptually related but physically split:

- **`content/labs/`** – POV-based folders (change-capture, consistency, encryption, flexible, …) with lab files
- **`content/topics/`** – Flat topic definition files (encryption.ts, data-management.ts, query.ts, …)

This is confusing because:
1. Labs and topics live in different places
2. Folder names in labs (POVs) don’t match topic names
3. One topic can span multiple POV folders (e.g. data-management → change-capture, flexible, ingest-rate)

---

## Proposed Structure

Unify under **topics** as the top level. Each topic folder contains:
- `topic.ts` – topic definition
- POV subfolders (when needed) – lab files grouped by capability

```
content/topics/
├── encryption/
│   ├── topic.ts
│   ├── lab-csfle-fundamentals.ts
│   ├── lab-queryable-encryption.ts
│   └── lab-right-to-erasure.ts
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
│   └── monitoring/
├── deployment/
│   ├── topic.ts
│   └── migratable/
├── integration/
│   └── topic.ts
├── security/
│   └── topic.ts
└── index.ts          # Barrel: allTopics, allLabs
```

---

## Topic → Lab Mapping

| Topic            | POV subfolders              | Lab count |
|------------------|----------------------------|-----------|
| encryption       | (flat)                     | 3         |
| data-management  | change-capture, flexible   | 4         |
| query            | rich-query, text-search, geospatial, graph | 12 |
| scalability      | consistency, ingest-rate, scale-out, scale-up | 12 |
| analytics        | in-place-analytics, workload-isolation | 6 |
| operations       | monitoring                 | 1         |
| deployment       | migratable                 | 3         |
| integration      | —                          | 0         |
| security         | —                          | 0         |

---

## Benefits

1. **Single source of truth** – topic definition and its labs live together
2. **Clear hierarchy** – topic → POV → labs
3. **Easier discovery** – browse by topic, then by capability
4. **Simpler imports** – one `content/topics/` tree instead of labs + topics

---

## Migration Steps

1. Create topic folders under `content/topics/`
2. Move each `topics/<name>.ts` → `topics/<name>/topic.ts`
3. Move labs from `content/labs/<pov>/` into the correct topic folder (using `topicId` on each lab)
4. Create `content/topics/index.ts` that exports `allTopics` and `allLabs`
5. Update `contentService` to import from `content/topics`
6. Remove `content/labs/` (except `test-lab.ts` – keep in a `_fixtures/` or similar)
7. Update `LAB_FOLDER_STRUCTURE_GUIDELINE.md`
