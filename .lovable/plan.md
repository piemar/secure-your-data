# MongoDB Mayhem: Complete Editor + Terminal Strategy

## Current Implementation (Must Be Preserved or Replicated)

The Monaco-based editor has custom features that any replacement must support:

- **`___BLANK___` markers**: Placeholders in mission skeletons that users fill in
- **Gutter hint markers**: Interactive `?`/`!` buttons positioned at blank lines using `getScrolledVisiblePosition()`
- **Hint/Answer reveal popovers**: Two-step reveal (hint → answer) with XP penalties per blank
- **Combo streaks**: Real-time pattern matching on code changes
- **Custom "heist-terminal" theme**: Dark green terminal aesthetic with specific token colors
- **MongoDB autocomplete**: Custom completion provider for MongoDB shell commands
- **Blank highlight decorations**: `deltaDecorations` to highlight `___BLANK___` with hover messages
- **Difficulty tiers**: Guided (fill blanks), Challenge (comments only), Expert (minimal prompts)
- **Validation feedback**: Client-side pattern matching + server-side sandbox execution results

---

## Three-Tier Validation System

| Tier | What | Where it runs | % of objectives |
|---|---|---|---|
| 1: Pattern + Semantic | Regex + structural checks | Client + server-side duplicate | ~50% |
| 2: Sandboxed Execution | Real MongoDB commands against isolated DB | Server → ephemeral DB per user | ~35% |
| 3: Simulated / Cloud-Proxy | Mock output OR proxied cloud API call | Server with mock engine or API proxy | ~15% |

### Sandbox Implementation Detail

The Express backend connects to a **single MongoDB instance** (Atlas or self-hosted). When a user starts a Tier 2 mission, the backend:

1. **Creates** a database: `sandbox_{sessionId}_{userId}` — MongoDB creates it lazily on first write
2. **Seeds** it with that mission's predefined collections and documents
3. **Executes** the user's code string against that database using the MongoDB driver programmatically (NOT `eval`)
4. **Inspects** the result — checks return values, runs verification queries
5. **Drops** the database on completion, failure, or timeout

### Code Execution Approach (Safe, No eval)

User code is NOT run as raw JavaScript. The backend **parses the user's MongoDB command** and maps it to driver calls:

```text
User writes:        db.agents.insertOne({ name: "Bond", level: 5 })
Backend parses:     collection="agents", operation="insertOne", args=[{name:"Bond",level:5}]
Backend executes:   sandboxDb.collection("agents").insertOne({name:"Bond",level:5})
Backend returns:    { acknowledged: true, insertedId: "..." }
```

### Multi-tenancy Isolation

```text
MongoDB Instance
├── mongodb_mayhem              ← platform DB (never touched by sandboxes)
├── sandbox_sess01_user_abc     ← User A, Session 1
├── sandbox_sess01_user_def     ← User B, Session 1
└── ...
```

### Seed Data per Mission

```text
mission-12 (CRUD):       agents (10 docs), missions (5 docs)
mission-1  (Index):      events (1000 docs, no indexes)
mission-3  (Aggregation): orders (200 docs with nested arrays), products (50 docs)
mission-5  (Schema):     users/transactions/sessions with broken validators
mission-13 (Geospatial): locations (100 docs with GeoJSON coordinates)
mission-16 (Transactions): accounts (10 docs for transfer scenarios)
mission-18 (Time Series): sensor_readings (500 timestamped docs)
```

### Verification after Execution

| Mission | What gets checked |
|---|---|
| CRUD (12) | `countDocuments()` changed, specific doc exists |
| Index (1) | `listIndexes()` contains expected index, `explain()` shows IXSCAN |
| Aggregation (3) | Output collection exists with expected doc count |
| Schema (5) | Invalid insert throws validation error |
| Geospatial (13) | `listIndexes()` includes 2dsphere, `$geoNear` returns results |
| Transactions (16) | Both accounts updated atomically, balances correct |

---

## Editor + Terminal Options

### Option A: Safe REPL (Lightweight, No Containers)

A pseudo-terminal UI using `xterm.js` that sends commands to `/api/execute/repl`. Reuses the existing `code-parser.ts` — no raw shell.

| Aspect | Detail |
|---|---|
| Editor | Current Monaco (unchanged) |
| Terminal | Fake terminal, parsed commands only |
| Shell access | No bash, no filesystem |
| MongoDB | Parsed subset via code-parser |
| Container needed | No |
| Hosting | Any platform |
| Cost per 30 users | Minimal |
| Startup | Instant |

**Best for**: Budget deployments, platforms without Docker.

---

### Option B: Container-per-User (Real bash + mongosh, No IDE)

Docker container per user with bash shell and mongosh. I/O streamed via WebSocket + `xterm.js`.

| Aspect | Detail |
|---|---|
| Editor | Current Monaco (unchanged) |
| Terminal | Real bash + mongosh in container |
| Shell access | Full bash — `ls`, `grep`, `cat`, pipes, scripts |
| MongoDB | Full mongosh with all features |
| Container needed | Yes (~100MB each) |
| Hosting | Docker socket required |
| Cost per 30 users | ~3GB RAM |
| Startup | ~2 seconds |

**Best for**: Self-hosted with Docker but no need for full IDE.

---

### Option C: code-server (Full VS Code) — Standalone

Each user gets a full VS Code instance via code-server in a container. Replaces the current Monaco editor entirely.

| Aspect | Detail |
|---|---|
| Editor | VS Code (code-server) |
| Terminal | Real integrated terminal (bash + mongosh) |
| Shell access | Full bash |
| MongoDB extension | Yes — browse collections, run queries, see schema |
| Container needed | Yes (~500MB each) |
| Hosting | Docker socket + more RAM |
| Cost per 30 users | ~15GB RAM |
| Startup | ~5-10 seconds |

**Problem**: Loses all custom mission UX — no `___BLANK___` markers, no hint popovers, no combo streaks, no XP tracking without a custom VS Code extension.

---

### Option D: Hybrid — Monaco Editor + code-server On Demand

Keep the current Monaco editor for guided missions. Add an "Open Full IDE" button that spawns a code-server instance for free-form exploration.

| Aspect | Detail |
|---|---|
| Editor | Monaco for missions, VS Code for exploration |
| Terminal | Safe REPL in-app + real terminal in VS Code |
| Guided missions | Full hint/blank/combo UX preserved |
| Free exploration | Full VS Code + terminal + MongoDB extension |
| Container needed | Only when IDE launched |
| Cost per 30 users | ~5-8GB (partial container usage) |

**Best for**: Balanced approach — guided learning stays lightweight, exploration gets full IDE.

---

### Option E: code-server Configured as Mission IDE

Run code-server but **lock it down** to show only: MongoDB extension, terminal, output panel. Build a **custom VS Code extension** that replicates the current Monaco mission UX inside VS Code.

#### What the user sees

```text
┌────────────────────────────────────────────────────┐
│  VS Code (code-server) — locked layout             │
│                                                    │
│  ┌─ Sidebar (MongoDB Extension only) ─┐ ┌─ Editor ─────────────────┐
│  │  ▸ sandbox_abc.agents (10 docs)    │ │ // MISSION: CRUD Boot    │
│  │  ▸ sandbox_abc.events (1000 docs)  │ │ db.agents.insertOne({    │
│  │  ▸ sandbox_abc.orders (200 docs)   │ │   name: "___BLANK___",   │
│  │                                    │ │ ?←gutter hint marker     │
│  │  [Run Query] [Refresh]             │ │   level: ___BLANK___     │
│  └────────────────────────────────────┘ └──────────────────────────┘
│  ┌─ Terminal ──────────────────────────────────────┐
│  │ sandbox> db.agents.find()                       │
│  └─────────────────────────────────────────────────┘
│  ┌─ Output Panel ──────────────────────────────────┐
│  │ ✓ Objective 1: PASSED   ✗ Objective 2: PENDING  │
│  └─────────────────────────────────────────────────┘
└────────────────────────────────────────────────────┘
```

#### Replicating Monaco Features in VS Code Extension

| Monaco Feature | VS Code Extension API Equivalent |
|---|---|
| `___BLANK___` highlighting | `TextEditorDecorationType` with `backgroundColor`, `border` |
| Gutter hint markers (`?`/`!`) | `DecorationRenderOptions.gutterIconPath` — custom SVG icons per line |
| Hint/Answer popovers | `CodeLens` above blank lines with "Show Hint" / "Show Answer" actions |
| XP penalty tracking | Extension state + WebSocket to game server |
| Combo streaks | `onDidChangeTextDocument` listener with pattern matching |
| Custom theme | Ship a bundled color theme in the extension |
| MongoDB autocomplete | `CompletionItemProvider` (same patterns, different API shape) |
| Validation feedback | `DiagnosticCollection` (squiggly underlines) |
| Answer reveal (replace blank) | `WorkspaceEdit` to programmatically replace `___BLANK___` text |

#### Locking Down VS Code

```json
{
  "extensionAllowedProposedApi": ["mongodb-mayhem.mission-extension"],
  "disabledExtensions": ["*"],
  "enabledExtensions": ["mongodb.mongodb-vscode", "mongodb-mayhem.mission-extension"]
}
```

Additional lockdown: hide Activity Bar items except MongoDB explorer, disable Settings/Extensions marketplace/Source Control, set `"workbench.startupEditor": "none"`, read-only filesystem except mission files, hidden menu bar, bundled "Heist Terminal" theme.

#### Custom Extension Structure

```text
extensions/mongodb-mayhem/
├── package.json          ← manifest, contributes theme + commands
├── src/
│   ├── extension.ts      ← activate: register all providers
│   ├── blank-decorator.ts ← TextEditorDecorationType for ___BLANK___
│   ├── hint-codelens.ts  ← CodeLensProvider: "💡 Show Hint (-15 XP)"
│   ├── hint-hover.ts     ← HoverProvider: hint details on hover
│   ├── completion.ts     ← CompletionItemProvider for MongoDB commands
│   ├── combo-tracker.ts  ← onDidChangeTextDocument → combo streak logic
│   ├── validation.ts     ← DiagnosticCollection for objective pass/fail
│   ├── game-client.ts    ← WebSocket/HTTP to game server for XP sync
│   └── output-panel.ts   ← WebviewPanel showing verification results
├── themes/
│   └── heist-terminal.json ← color theme matching current Monaco theme
└── media/
    ├── hint-unrevealed.svg
    └── hint-revealed.svg
```

---

### Option F: Hybrid with Fallback Chain (RECOMMENDED)

Combine Options A + B + E with automatic degradation:

```text
Infrastructure available?
├── Docker + code-server image → Option E (locked VS Code with mission extension)
├── Docker only (no code-server) → Option B (container bash + mongosh) + Monaco editor
├── No Docker at all → Option A (safe REPL) + Monaco editor
```

#### Why This Is the Best Approach

1. **Best experience when infrastructure allows**: Full VS Code with MongoDB extension, real terminal, AND mission hints/blanks/combos via custom extension
2. **Graceful degradation**: Works on any hosting — Railway (no Docker) gets Option A, self-hosted gets Option E
3. **Moderator controls**: Per-workshop config chooses the mode
4. **Incremental build**: Start with Option A (quick), add Option E later

#### Workshop Execution Mode Config

```text
sandbox_only    → Option A (safe REPL) + Monaco editor
container_bash  → Option B (real terminal) + Monaco editor
full_ide        → Option E (locked VS Code with mission extension)
atlas_connected → Any of above + real Atlas API proxy for cloud missions
```

---

## Cloud Integration Missions

### Missions Requiring Atlas-Only Features

| Mission | Feature | Why it needs Atlas |
|---|---|---|
| 17: Text Search | `$search`, `$searchMeta` | Atlas Search is Atlas-only |
| 19: Vector Heist | `$vectorSearch` | Atlas Vector Search only |
| 7: Encryption (CSFLE) | KMS integration | Requires KMS provider + Enterprise/Atlas |

### Missions Requiring Cluster Infrastructure

| Mission | Feature | Why |
|---|---|---|
| 2: Shard Under Siege | `sh.status()`, `moveChunk` | Requires sharded cluster |
| 9: Scale-Out Siege | `sh.shardCollection` | Sharding commands |
| 10: Auto-HA Failover | `rs.status()`, failover | Requires replica set |

### Proposed Cloud Integration Missions (21-25)

| Mission | Title | Topic | Cloud Requirement |
|---|---|---|---|
| 21 | Data Federation Recon | Query across S3 + Atlas | Atlas Data Federation + S3 |
| 22 | KMS Key Rotation | Rotate CMKs and re-wrap DEKs | AWS KMS or Azure Key Vault |
| 23 | Online Archive Sweep | Configure archival rules | Atlas M10+ with Online Archive |
| 24 | Atlas Triggers & Functions | React to DB changes serverless | Atlas App Services |
| 25 | Search Index Ops | Create/update Atlas Search indexes | Atlas with Search enabled |

### Cloud Proxy Architecture

```text
User code → Express backend → parse command
                                ├── Sandbox DB (Tier 2, local)
                                ├── Atlas API proxy (Tier 3 + cloud)
                                │   ├── Atlas Admin API
                                │   ├── Atlas Data API
                                │   └── KMS API
                                └── Simulated output (Tier 3, no cloud)
```

---

## Container Manager Provider Interface

```text
ContainerProvider (interface)
├── DockerProvider      — local Docker socket (self-hosted)
├── FlyMachinesProvider — Fly.io Machines API (cloud)
├── K8sProvider         — Kubernetes pod spawning
└── NoopProvider        — fallback, degrades to Option A
```

### Resource Limits per Container

- Memory: 512MB (code-server) / 256MB (bash-only)
- CPU: 1 core (code-server) / 0.5 core (bash-only)
- PIDs: 50 max
- Network: sandbox-only (MongoDB access, no internet)
- Timeout: 15-minute idle auto-destroy + hourly sweep

### Security Guarantees

| Threat | Mitigation |
|---|---|
| Access other users' data | Each container connects only to own sandbox DB |
| Read host files / env vars | No host mounts except Docker socket (API only) |
| Fork bomb / resource abuse | `--memory --cpus --pids-limit` caps |
| Network escape | `--network=sandbox-net` (only MongoDB) |
| Long-running containers | 15-min auto-destroy + hourly sweep |
| Container escape | Read-only root FS, no privileged mode, drop all caps |

---

## Files to Create/Modify

### Phase 1 — Safe REPL (Option A) ~2 days

| File | Action | Purpose |
|---|---|---|
| `src/components/TerminalPanel.tsx` | Create | xterm.js REPL component |
| `src/hooks/useTerminal.ts` | Create | Command submission + history hook |
| `server/src/routes/execute.ts` | Modify | Add `/api/execute/repl` endpoint |
| `src/pages/MissionPage.tsx` | Modify | Add Terminal tab |

### Phase 2 — Container Infrastructure (Option B) ~3 days

| File | Action | Purpose |
|---|---|---|
| `server/src/services/container-manager.ts` | Create | Docker container lifecycle with provider interface |
| `server/src/socket/terminal.ts` | Create | WebSocket terminal I/O handler |
| `server/sandbox/Dockerfile` | Create | mongosh + bash sandbox image |
| `server/docker-compose.yml` | Modify | Docker socket mount, sandbox network |
| `server/package.json` | Modify | Add `dockerode` dependency |

### Phase 3 — code-server Mission IDE (Option E) ~6-8 days

| File | Action | Purpose |
|---|---|---|
| `server/sandbox/Dockerfile.ide` | Create | code-server + mongosh + extensions |
| `extensions/mongodb-mayhem/package.json` | Create | Extension manifest |
| `extensions/mongodb-mayhem/src/extension.ts` | Create | Extension entry point |
| `extensions/mongodb-mayhem/src/blank-decorator.ts` | Create | `___BLANK___` highlighting |
| `extensions/mongodb-mayhem/src/hint-codelens.ts` | Create | Gutter hints via CodeLens |
| `extensions/mongodb-mayhem/src/hint-hover.ts` | Create | Hover provider for hints |
| `extensions/mongodb-mayhem/src/completion.ts` | Create | MongoDB autocomplete |
| `extensions/mongodb-mayhem/src/combo-tracker.ts` | Create | Combo streak tracking |
| `extensions/mongodb-mayhem/src/validation.ts` | Create | Diagnostic feedback |
| `extensions/mongodb-mayhem/src/game-client.ts` | Create | WebSocket to game server |
| `extensions/mongodb-mayhem/src/output-panel.ts` | Create | Verification results webview |
| `extensions/mongodb-mayhem/themes/heist-terminal.json` | Create | Bundled color theme |
| `server/src/routes/ide.ts` | Create | IDE launch/status endpoints |
| `server/src/middleware/ide-proxy.ts` | Create | Reverse proxy to code-server |
| `src/components/IDELauncher.tsx` | Create | "Open IDE" button + iframe launcher |
| `src/pages/MissionPage.tsx` | Modify | Add IDE launcher button |

### Cloud Missions (Independent of Phase)

| File | Action | Purpose |
|---|---|---|
| `src/lib/game-data.ts` | Modify | Add missions 21-25 with `requiresAtlas` flag |
| `src/lib/mission-validations.ts` | Modify | Pattern validations for cloud missions |
| `src/lib/mission-skeletons.ts` | Modify | Code skeletons for cloud missions |
| `server/src/config/seed-data.ts` | Modify | Seed data for Tier 2 missions |
| `server/src/config/verification-checks.ts` | Modify | Post-execution checks per mission |

## Implementation Order

1. **Phase 1**: Safe REPL terminal (Option A) — works everywhere
2. **Phase 2**: Container manager + real terminal (Option B) — requires Docker
3. **Phase 3**: code-server + custom VS Code extension (Option E) — full IDE experience
4. **Cloud missions**: Can be built in parallel with any phase
5. **Atlas proxy mode**: Optional, for workshops with Atlas access
