> **Superseded for planning:** Use **[sandbox-strategy-final.md](./sandbox-strategy-final.md)** as the authoritative sandbox and execution document. This file remains as a detailed breakdown of Options A–F.

# Complete Editor + Terminal Strategy: All Options

## Current Implementation (What Must Be Preserved or Replicated)

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

## Option A: Safe REPL (Lightweight, No Containers)

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

## Option B: Container-per-User (Real bash + mongosh, No IDE)

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

## Option C: code-server (Full VS Code) — Standalone

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

**Problem**: Loses all custom mission UX — no `___BLANK___` markers, no hint popovers, no combo streaks, no XP tracking. Would need a **custom VS Code extension** to replicate these features, which is a significant effort (see Option E below).

---

## Option D: Hybrid — Monaco Editor + code-server On Demand

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

## Option E: code-server Configured as Mission IDE (NEW — Your Question)

Run code-server but **lock it down** to show only: MongoDB extension, terminal, output panel. Build a **custom VS Code extension** that replicates the current Monaco mission UX inside VS Code.

### What the user sees

```text
┌────────────────────────────────────────────────────┐
│  VS Code (code-server) — locked layout             │
│                                                    │
│  ┌─ Sidebar (MongoDB Extension only) ─┐ ┌─ Editor ─────────────────┐ │
│  │  ▸ sandbox_abc.agents (10 docs)    │ │ // MISSION: CRUD Boot    │ │
│  │  ▸ sandbox_abc.events (1000 docs)  │ │ db.agents.insertOne({    │ │
│  │  ▸ sandbox_abc.orders (200 docs)   │ │   name: "___BLANK___",   │ │
│  │                                    │ │ ?←gutter hint marker     │ │
│  │  [Run Query] [Refresh]             │ │   level: ___BLANK___     │ │
│  └────────────────────────────────────┘ └──────────────────────────┘ │
│  ┌─ Terminal ──────────────────────────────────────┐                 │
│  │ sandbox> db.agents.find()                       │                 │
│  │ { _id: ObjectId("..."), name: "Bond", ... }     │                 │
│  └─────────────────────────────────────────────────┘                 │
│  ┌─ Output Panel ──────────────────────────────────┐                 │
│  │ ✓ Objective 1: PASSED   ✗ Objective 2: PENDING  │                 │
│  └─────────────────────────────────────────────────┘                 │
└────────────────────────────────────────────────────┘
```

### Is it possible to replicate hint markers in VS Code?

**Yes**, via a custom VS Code extension using these APIs:

| Monaco Feature | VS Code Extension API Equivalent |
|---|---|
| `___BLANK___` highlighting | `TextEditorDecorationType` with `backgroundColor`, `border` |
| Gutter hint markers (`?`/`!`) | `DecorationRenderOptions.gutterIconPath` — custom SVG icons per line |
| Hint/Answer popovers | `CodeLens` above blank lines with "Show Hint" / "Show Answer" actions, OR a `HoverProvider` that returns markdown with command links |
| XP penalty tracking | Extension state + WebSocket to game server |
| Combo streaks | `onDidChangeTextDocument` listener with pattern matching |
| Custom theme | Ship a bundled color theme in the extension |
| MongoDB autocomplete | `CompletionItemProvider` (same patterns, different API shape) |
| Validation feedback | Custom `WebviewPanel` or `DiagnosticCollection` (squiggly underlines) |
| Answer reveal (replace blank) | `WorkspaceEdit` to programmatically replace `___BLANK___` text |

### How to lock down VS Code to mission-only UI

code-server supports `--disable-workspace-trust` and product.json overrides:

```json
{
  "extensionAllowedProposedApi": ["mongodb-mayhem.mission-extension"],
  "disabledExtensions": ["*"],
  "enabledExtensions": ["mongodb.mongodb-vscode", "mongodb-mayhem.mission-extension"]
}
```

Additional lockdown via settings:
- Hide Activity Bar items except MongoDB explorer
- Disable Settings, Extensions marketplace, Source Control panels
- Set `"workbench.startupEditor": "none"` — open mission file directly
- Read-only filesystem except mission working files
- Hide menu bar items via `"window.menuBarVisibility": "hidden"`
- Use `"workbench.colorTheme": "Heist Terminal"` (bundled in extension)

### Custom extension structure

```text
mongodb-mayhem-extension/
├── package.json          ← extension manifest, contributes theme + commands
├── src/
│   ├── extension.ts      ← activate: register all providers
│   ├── blank-decorator.ts ← TextEditorDecorationType for ___BLANK___
│   ├── hint-codelens.ts  ← CodeLensProvider: "💡 Show Hint (-15 XP)" above blanks
│   ├── hint-hover.ts     ← HoverProvider: hint details on hover
│   ├── completion.ts     ← CompletionItemProvider for MongoDB commands
│   ├── combo-tracker.ts  ← onDidChangeTextDocument → combo streak logic
│   ├── validation.ts     ← DiagnosticCollection for objective pass/fail
│   ├── game-client.ts    ← WebSocket/HTTP to game server for XP, state sync
│   └── output-panel.ts   ← WebviewPanel showing verification results
├── themes/
│   └── heist-terminal.json ← color theme matching current Monaco theme
└── media/
    ├── hint-unrevealed.svg ← gutter icon for ? state
    └── hint-revealed.svg   ← gutter icon for ! state
```

### Effort estimate

| Component | Effort |
|---|---|
| Custom VS Code extension (blank markers, hints, combos, validation) | ~3-4 days |
| code-server Docker image with lockdown config | ~0.5 day |
| Container manager (reuse from Option B/D) | Already planned |
| WebSocket bridge for game state sync | ~1 day |
| Testing + polish | ~1-2 days |
| **Total** | **~6-8 days** |

---

## Option F: Hybrid with Fallback Chain (RECOMMENDED)

Combine Options A + E with automatic degradation:

```text
Infrastructure available?
├── Docker + code-server image → Option E (locked VS Code with mission extension)
├── Docker only (no code-server) → Option B (container bash + mongosh) + Monaco editor
├── No Docker at all → Option A (safe REPL) + Monaco editor
```

### Why this is the best approach

1. **Best experience when infrastructure allows**: Full VS Code with MongoDB extension, real terminal, AND mission hints/blanks/combos via custom extension
2. **Graceful degradation**: Works on any hosting — Railway (no Docker) gets Option A, self-hosted gets Option E
3. **Moderator controls**: Per-workshop config chooses the mode
4. **Incremental build**: Start with Option A (quick), add Option E later

### Implementation phases

**Phase 1 — Safe REPL (Option A)**: Add `/api/execute/repl` endpoint + `xterm.js` terminal tab in MissionPage. Works everywhere, no containers. ~2 days.

**Phase 2 — Container infrastructure (Option B)**: `container-manager.ts` with provider interface, WebSocket terminal handler, sandbox Docker image with mongosh + bash. ~3 days.

**Phase 3 — code-server mission IDE (Option E)**: Custom VS Code extension replicating blank markers, hints, combos, validation. Locked-down code-server image. Reverse proxy routing. ~6-8 days.

### Files to create

| File | Phase | Purpose |
|---|---|---|
| `src/components/TerminalPanel.tsx` | 1 | xterm.js REPL component |
| `src/hooks/useTerminal.ts` | 1 | Command submission + history hook |
| `server/src/routes/execute.ts` (add repl) | 1 | `/api/execute/repl` endpoint |
| `server/src/services/container-manager.ts` | 2 | Docker container lifecycle |
| `server/src/socket/terminal.ts` | 2 | WebSocket terminal I/O |
| `server/sandbox/Dockerfile` | 2 | mongosh + bash sandbox image |
| `server/sandbox/Dockerfile.ide` | 3 | code-server + mongosh + extension |
| `extensions/mongodb-mayhem/` | 3 | Custom VS Code extension (full directory) |
| `server/src/routes/ide.ts` | 3 | IDE launch/status endpoints |
| `server/src/middleware/ide-proxy.ts` | 3 | Reverse proxy to code-server containers |
| `src/components/IDELauncher.tsx` | 3 | "Open IDE" button + iframe/tab launcher |
| `src/pages/MissionPage.tsx` | 1-3 | Add Terminal tab, IDE launcher |
| `server/docker-compose.yml` | 2-3 | Docker socket mount, sandbox network |

### Workshop execution mode config

```text
sandbox_only   → Option A (safe REPL) + Monaco editor
container_bash → Option B (real terminal) + Monaco editor
full_ide       → Option E (locked VS Code with mission extension)
atlas_connected → Any of above + real Atlas API proxy for cloud missions
```

