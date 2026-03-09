# Labs Catalog

This document lists all labs available in the workshop application, grouped by topic. Each lab is a guided, step-by-step experience with runnable code (Node, mongosh, C#, or Python where supported) and optional verification.

---

## Query & Search

| Lab | Description | Status |
|-----|-------------|--------|
| **CRUD Operations** | Learn Create, Read, Update, and Delete with the Node.js driver: insertOne/insertMany, find/findOne, updateOne/updateMany, replaceOne, upserts, deleteOne/deleteMany, bulkWrite. | <span style="color:green">Live</span> |
| **Rich Query Basics: Filtering & Projections** | Express rich document queries with filters, projections, and sort on nested documents and arrays; compound indexes and explain. | <span style="color:green">Live</span> |
| **Rich Query Aggregations: Grouping & Facets** | Aggregation pipelines: $match, $group, $sort, $project, $unwind, $facet, $count over operational data. | <span style="color:green">Live</span> |
| **Rich Query: Aggregation Advanced** | Advanced aggregation patterns (e.g. $lookup, multi-stage pipelines). | <span style="color:green">Live</span> |
| **Rich Queries on Encrypted vs Plain Data** | Compare rich query capabilities on encrypted vs plain collections; design query patterns for encrypted data. | <span style="color:red">Work In progress</span> |
| **Search with Auto-Complete Suggestions** | Configure Atlas Search auto-complete index and implement typeahead queries. | <span style="color:red">Work In progress</span> |
| **Text Search Basics** | Full-text search with Atlas Search; index and query text fields. | <span style="color:red">Work In progress</span> |
| **Search Experience** | End-to-end search experience (e.g. facets, highlighting). | <span style="color:red">Work In progress</span> |
| **Geospatial: Near** | Geospatial queries for “near” and distance. | <span style="color:red">Work In progress</span> |
| **Geospatial: Polygons & Regions** | $geoWithin, $geoIntersects, and region-based queries. | <span style="color:red">Work In progress</span> |
| **Geospatial: Performance** | Geospatial index and query performance. | <span style="color:red">Work In progress</span> |
| **Graph Traversal** | Graph-style traversals with $graphLookup. | <span style="color:red">Work In progress</span> |
| **Graph Recommendations** | Recommendation-style use cases with graph queries. | <span style="color:red">Work In progress</span> |
| **Graph-Based Fraud Detection** | Model fraud-relevant relationships and write suspicious-pattern queries. | <span style="color:red">Work In progress</span> |

---

## Encryption

| Lab | Description | Status |
|-----|-------------|--------|
| **Lab 1: CSFLE Fundamentals with AWS KMS** | Master KMS setup and Client-Side Field Level Encryption: key vault, DEKs, insert and query with encryption. | <span style="color:red">Work In progress</span> |
| **Lab 2: Queryable Encryption & Range Queries** | Implement Queryable Encryption with range and equality queries; understand QE vs CSFLE. | <span style="color:red">Work In progress</span> |
| **Lab 3: Right to Erasure & Multi-Tenant Patterns** | Data migration plaintext→encrypted, per-tenant key isolation, key rotation, GDPR/crypto-shredding. | <span style="color:red">Work In progress</span> |

---

## Analytics

| Lab | Description | Status |
|-----|-------------|--------|
| **Analytics Overview** | Overview of in-place analytics and workload isolation. | <span style="color:red">Work In progress</span> |
| **In-Place Analytics: Setup & Basic Aggregations** | Configure environment, load sample data, indexes, and run $match/$group aggregations. | <span style="color:red">Work In progress</span> |
| **In-Place Analytics: Advanced Aggregations & Performance** | $unwind, multi-stage pipelines, performance analysis. | <span style="color:red">Work In progress</span> |
| **Workload Isolation Overview** | Concepts and topology for workload isolation. | <span style="color:red">Work In progress</span> |
| **Workload Isolation: Replica Set Tags** | Configure replica set tags and route queries by tag. | <span style="color:red">Work In progress</span> |
| **Workload Isolation: Read Preference** | Use read preference and tags for analytics vs transactional workloads. | <span style="color:red">Work In progress</span> |

---

## Scalability

| Lab | Description | Status |
|-----|-------------|--------|
| **Ingest Rate: Basics** | Introduction to ingest rate and bulk insert patterns. | <span style="color:red">Work In progress</span> |
| **Ingest Rate: Optimizing Bulk Operations** | Ordered vs unordered bulk ops, batch size, write concern tuning. | <span style="color:red">Work In progress</span> |
| **Ingest Rate: Replication Verify** | Verify replication lag and durability. | <span style="color:red">Work In progress</span> |
| **Consistency: Overview** | Consistency and read-your-writes in sharded clusters. | <span style="color:red">Work In progress</span> |
| **Consistency: Sharded Cluster Setup** | Create sharded cluster and load sample data. | <span style="color:red">Work In progress</span> |
| **Consistency: Verification & Failover Test** | Run consistency checks and induce failover. | <span style="color:red">Work In progress</span> |
| **Scale-Out Overview** | Horizontal scale-out concepts and metrics. | <span style="color:red">Work In progress</span> |
| **Scale-Out: Setup** | Environment setup for scale-out exercises. | <span style="color:red">Work In progress</span> |
| **Scale-Out: Execute** | Run scale-out during sustained load. | <span style="color:red">Work In progress</span> |
| **Scale-Up: Overview** | Vertical scale-up concepts. | <span style="color:red">Work In progress</span> |
| **Scale-Up: Environment Setup** | Configure Atlas and scripts for scale-up. | <span style="color:red">Work In progress</span> |
| **Scale-Up: Execute** | Run scale-up and measure impact. | <span style="color:red">Work In progress</span> |

---

## Data Management

| Lab | Description | Status |
|-----|-------------|--------|
| **Flexible Schema: Basic Evolution** | Schema evolution patterns with the flexible document model. | <span style="color:red">Work In progress</span> |
| **Flexible Schema: Adding Nested Documents & Arrays** | Add nested subdocuments and arrays; query nested structures. | <span style="color:red">Work In progress</span> |
| **Flexible Schema: Microservice Compatibility** | Evolve schema for microservice compatibility. | <span style="color:red">Work In progress</span> |
| **Data Change Streams** | Change streams for real-time change capture. | <span style="color:red">Work In progress</span> |

---

## Operations

| Lab | Description | Status |
|-----|-------------|--------|
| **Operations Monitoring** | Monitor MongoDB deployments (e.g. Atlas metrics, alerts). | <span style="color:red">Work In progress</span> |
| **AUTO-HA Overview** | Automatic failover concepts and flow. | <span style="color:red">Work In progress</span> |
| **AUTO-HA Setup** | Create Atlas cluster and configure environment. | <span style="color:red">Work In progress</span> |
| **AUTO-HA Execute** | Run failover and observe behavior. | <span style="color:red">Work In progress</span> |
| **Rolling Updates Overview** | Rolling upgrade concepts. | <span style="color:red">Work In progress</span> |
| **Rolling Updates: Setup** | Environment for rolling updates. | <span style="color:red">Work In progress</span> |
| **Rolling Updates: Execute** | Perform rolling update. | <span style="color:red">Work In progress</span> |
| **Full Recovery RPO Overview** | Full backup and point-in-time recovery concepts. | <span style="color:red">Work In progress</span> |
| **Full Recovery RPO: Environment Setup** | Atlas cluster, backup, snapshots. | <span style="color:red">Work In progress</span> |
| **Full Recovery RPO: Execute Restore and Verify** | Restore and verify after simulated corruption. | <span style="color:red">Work In progress</span> |
| **Full Recovery RTO Overview** | RTO and full restore concepts. | <span style="color:red">Work In progress</span> |
| **Full Recovery RTO: Environment Setup** | Install tools, create cluster, load data, enable backup. | <span style="color:red">Work In progress</span> |
| **Full Recovery RTO: Execute Restore and Measure** | Simulate disaster, restore, measure RTO. | <span style="color:red">Work In progress</span> |
| **Test Register Lab** | Placeholder/test lab for registration. | <span style="color:red">Work In progress</span> |
| **Partial Recovery Overview** | Partial recovery and PITR concepts. | <span style="color:red">Work In progress</span> |
| **Partial Recovery: Environment Setup** | Configure main and temp clusters, load data. | <span style="color:red">Work In progress</span> |
| **Partial Recovery: Execute Restore and Verify** | Delete subset, PITR to temp, export/import back. | <span style="color:red">Work In progress</span> |

---

## Deployment

| Lab | Description | Status |
|-----|-------------|--------|
| **Portable Overview** | Cloud-to-cloud migration and cutover. | <span style="color:red">Work In progress</span> |
| **Portable: Environment Setup** | Create clusters (e.g. AWS, Azure), record connection strings. | <span style="color:red">Work In progress</span> |
| **Portable: Execute Migration and Cutover** | Load data, run live migration, cutover. | <span style="color:red">Work In progress</span> |
| **Migratable Overview** | Live migration concepts and switchover. | <span style="color:red">Work In progress</span> |
| **Migratable: Setup** | Environment for migratable workflow. | <span style="color:red">Work In progress</span> |
| **Migratable: Execute** | Run migration and cutover. | <span style="color:red">Work In progress</span> |
| **Auto-Deploy Overview** | Atlas API and single-command deployment. | <span style="color:red">Work In progress</span> |
| **Auto-Deploy: Environment Setup** | Python, Atlas org/project, API key. | <span style="color:red">Work In progress</span> |
| **Auto-Deploy: Execute** | Provision and configure cluster via API. | <span style="color:red">Work In progress</span> |

---

## Integration

| Lab | Description | Status |
|-----|-------------|--------|
| **Reporting with BI Connector Overview** | BI Connector and reporting flow. | <span style="color:red">Work In progress</span> |
| **Reporting: Setup** | Configure BI Connector and connectivity. | <span style="color:red">Work In progress</span> |
| **Reporting: Run SQL Queries via BI Connector** | Connect and run SQL-style queries against MongoDB. | <span style="color:red">Work In progress</span> |

---

*Labs are loaded from `src/content/topics` and registered in `src/content/topics/index.ts`. To add or change a lab, see [Docs/ADD_LAB_MASTER_PROMPT.md](ADD_LAB_MASTER_PROMPT.md).*
