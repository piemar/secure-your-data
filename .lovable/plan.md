

# Updated Validation Plan: Sandbox Execution + Cloud Integration Missions

## Three-Tier Validation (Recap with Cloud Additions)

| Tier | What | Where it runs | % of objectives |
|---|---|---|---|
| 1: Pattern + Semantic | Regex + structural checks | Client + server-side duplicate | ~50% |
| 2: Sandboxed Execution | Real MongoDB commands against isolated DB | Server → ephemeral DB per user | ~35% |
| 3: Simulated / Cloud-Proxy | Mock output OR proxied cloud API call | Server with mock engine or API proxy | ~15% |

---

## Sandbox Implementation Detail (Cloud Deployment)

### How it works in production

The Express backend connects to a **single MongoDB instance** (Atlas or self-hosted). When a user starts a Tier 2 mission, the backend:

1. **Creates** a database: `sandbox_{sessionId}_{userId}` using `client.db(name)` — MongoDB creates it lazily on first write
2. **Seeds** it with that mission's predefined collections and documents (e.g., 500 docs in `agents` for the CRUD mission)
3. **Executes** the user's code string against that database using the MongoDB driver programmatically (NOT `eval`)
4. **Inspects** the result — checks return values, runs verification queries (e.g., "did the index get created? does explain show IXSCAN?")
5. **Drops** the database on completion, failure, or timeout

### Code execution approach (safe, no eval)

User code is NOT run as raw JavaScript. Instead, the backend **parses the user's MongoDB command** and maps it to driver calls:

```text
User writes:        db.agents.insertOne({ name: "Bond", level: 5 })
Backend parses:     collection="agents", operation="insertOne", args=[{name:"Bond",level:5}]
Backend executes:   sandboxDb.collection("agents").insertOne({name:"Bond",level:5})
Backend returns:    { acknowledged: true, insertedId: "..." }
```

This avoids arbitrary code execution entirely. The parser handles the MongoDB shell grammar subset that missions use: `db.collection.method(args)`, aggregation pipelines, and index operations.

For more complex code blocks (multi-statement), each line is parsed and executed sequentially.

### Cloud deployment specifics

| Deployment | Sandbox MongoDB | Notes |
|---|---|---|
| **Atlas (recommended)** | Same cluster, ephemeral databases | Atlas M10+ allows thousands of databases. User sandboxes are just databases that get dropped. Cost: minimal — sandbox data is tiny and short-lived |
| **Railway/Render/Fly** | Sidecar MongoDB container OR Atlas connection string | Docker Compose deploys the API + a local `mongo:7` container for sandboxes |
| **Air-gapped** | Local MongoDB in Docker | Everything self-contained |

### Atlas-specific consideration

On Atlas shared tier (M0/M2/M5), you're limited to ~100 databases. For workshops with 30+ users, use **M10+** or use a **prefix-namespace strategy** instead: all sandboxes share one database but use collection prefixes (`user123_agents`, `user123_events`). The backend abstracts this — user code still writes `db.agents`, but the executor remaps to the prefixed collection.

### Multi-tenancy isolation

```text
MongoDB Instance
├── mongodb_mayhem              ← platform DB (never touched by sandboxes)
├── sandbox_sess01_user_abc     ← User A, Session 1
├── sandbox_sess01_user_def     ← User B, Session 1
├── sandbox_sess02_user_ghi     ← User C, Session 2 (different workshop)
└── ...
```

- Each sandbox DB is scoped to session + user
- The MongoClient used for sandbox execution has a **restricted role**: `readWrite` on `sandbox_*` databases only, no access to `mongodb_mayhem`
- Cleanup runs on: mission complete, 15-min inactivity timeout, session end, and a scheduled sweep every hour

### Seed data per mission

Each Tier 2 mission has a seed definition:

```text
mission-12 (CRUD):      agents (10 docs), missions (5 docs)
mission-1  (Index):     events (1000 docs, no indexes) — enough to show COLLSCAN
mission-3  (Aggregation): orders (200 docs with nested arrays), products (50 docs)
mission-5  (Schema):    users/transactions/sessions with broken validators
mission-13 (Geospatial): locations (100 docs with GeoJSON coordinates)
mission-16 (Transactions): accounts (10 docs for transfer scenarios)
mission-18 (Time Series): sensor_readings (500 timestamped docs)
```

### Verification after execution

After the user's code runs, the backend runs **verification queries** against the sandbox:

| Mission | What gets checked |
|---|---|
| CRUD (12) | `countDocuments()` changed, specific doc exists |
| Index (1) | `listIndexes()` contains the expected index, `explain()` shows IXSCAN |
| Aggregation (3) | Output collection exists with expected doc count |
| Schema (5) | Invalid insert throws validation error |
| Geospatial (13) | `listIndexes()` includes 2dsphere, `$geoNear` returns results |
| Transactions (16) | Both accounts updated atomically, balances correct |

---

## Cloud Integration Missions: What Needs Real Cloud APIs

Some MongoDB features only exist on Atlas or require external cloud services. These missions cannot be fully sandboxed.

### Missions requiring Atlas-only features

| Mission | Feature | Why it needs Atlas |
|---|---|---|
| 17: Text Search | `$search`, `$searchMeta` | Atlas Search is an Atlas-only service — not available on Community mongod |
| 19: Vector Heist | `$vectorSearch` | Atlas Vector Search only |
| 7: Encryption (CSFLE) | KMS integration, `ClientEncryption` | Requires a KMS provider (AWS KMS, Azure Key Vault, or GCP KMS) plus MongoDB Enterprise or Atlas |

### Missions requiring cluster infrastructure

| Mission | Feature | Why |
|---|---|---|
| 2: Shard Under Siege | `sh.status()`, `moveChunk` | Requires a sharded cluster (3+ nodes minimum) |
| 9: Scale-Out Siege | `sh.shardCollection`, `addShard` | Same — sharding commands |
| 10: Auto-HA Failover | `rs.status()`, failover testing | Requires a replica set (Atlas provides this by default, local needs config) |

### How to handle these: Hybrid approach

**Option A: Pattern-only (current, good for workshops without cloud budget)**
- Tier 1 regex validation — user writes correct syntax, gets feedback
- Simulated output for infrastructure commands (Tier 3)
- No real execution, but educational value remains high

**Option B: Atlas API proxy (for workshops with Atlas access)**
- Workshop moderator provides an Atlas connection string with sandbox permissions
- Backend creates sandbox databases on the moderator's Atlas cluster
- Atlas Search and Vector Search indexes can be pre-created on workshop setup
- CSFLE uses a local KMS provider (no AWS/GCP needed) for training purposes

**Option C: New cloud-focused missions (recommended addition)**
- Create missions that specifically teach cloud integrations
- These are explicitly marked as "requires Atlas" in the UI
- Moderator enables them per workshop based on available infrastructure

### Proposed new cloud integration missions

| Mission | Title | Topic | Cloud Requirement |
|---|---|---|---|
| 21: Data Federation Recon | Query across S3 + Atlas in a single pipeline | `$sql`, federated queries | Atlas Data Federation + S3 bucket |
| 22: KMS Key Rotation | Rotate CMKs and re-wrap DEKs without downtime | Key management lifecycle | AWS KMS or Azure Key Vault (free tier works) |
| 23: Online Archive Sweep | Configure archival rules, query hot+cold data seamlessly | Atlas Online Archive | Atlas M10+ with Online Archive enabled |
| 24: Atlas Triggers & Functions | React to database changes with serverless functions | Atlas Triggers | Atlas App Services |
| 25: Search Index Ops | Create, update, and test Atlas Search indexes programmatically | Atlas Search index management | Atlas with Search enabled |

These missions would use **Tier 3 validation** with an optional **cloud proxy mode**:
- Without cloud access: pattern validation + simulated Atlas responses
- With cloud access: real API calls through the backend proxy to the moderator's Atlas project

### Cloud proxy architecture (for Option B/C)

```text
User code → Express backend → parse command
                                ├── Sandbox DB (Tier 2, local)
                                ├── Atlas API proxy (Tier 3 + cloud)
                                │   ├── Atlas Admin API (create indexes, check status)
                                │   ├── Atlas Data API (federated queries)
                                │   └── KMS API (key operations)
                                └── Simulated output (Tier 3, no cloud)
```

The moderator configures which mode is active per workshop:
- `sandbox_only` — local MongoDB, no cloud features
- `atlas_connected` — Atlas cluster provided, full feature set
- `hybrid` — local sandbox for most missions, Atlas for cloud missions only

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `server/src/services/sandbox.ts` | Create | Sandbox lifecycle: create, seed, execute, verify, destroy |
| `server/src/services/code-parser.ts` | Create | Parse `db.collection.method(args)` into driver calls |
| `server/src/services/code-executor.ts` | Create | Execute parsed commands against sandbox DB with timeout |
| `server/src/config/seed-data.ts` | Create | Per-mission seed collections and documents |
| `server/src/config/verification-checks.ts` | Create | Post-execution verification queries per mission |
| `server/src/routes/execute.ts` | Create | `/api/execute` endpoint for Tier 2 missions |
| `server/src/services/simulation.ts` | Create | Mock output engine for Tier 3 (sharding, replica set commands) |
| `src/lib/mission-validations.ts` | Modify | Add `tier` field to each objective's rules |
| `src/lib/validation.ts` | Modify | Support async server-validated results |
| `src/pages/MissionPage.tsx` | Modify | Show execution spinner for Tier 2, simulated output for Tier 3 |
| `src/services/api.ts` | Modify | Add `executeCode()` and `verifyExecution()` methods |
| `server/src/services/verification.ts` | Modify | Wire real verification checks to sandbox query results |
| `src/lib/game-data.ts` | Modify | Add missions 21-25 (cloud integration) with `requiresAtlas` flag |

## Implementation Order

1. Code parser + executor (the core engine)
2. Sandbox lifecycle service
3. Seed data for all Tier 2 missions
4. Verification checks per mission
5. `/api/execute` route + frontend wiring
6. Simulation engine for Tier 3
7. Cloud integration missions (21-25) with pattern-only validation
8. Optional Atlas proxy mode for moderators with cloud access

