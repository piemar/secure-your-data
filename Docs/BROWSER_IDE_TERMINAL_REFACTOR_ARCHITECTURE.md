# Browser IDE / Terminal Refactor Architecture

**Document purpose:** Incremental modernization plan for an existing browser-based developer/workshop environment toward a VS Code–like architecture with a Warp-style AI terminal + editor hybrid, multi-language support, and a first-class placeholder/hint/guidance system.

**Assumptions:** React + TypeScript; production system; incremental refactor (no greenfield rewrite); support for Python, Node/JS/TS, Java, C#; long-lived terminal sessions; Monaco-based editing; extensible hint/command-palette UX.

---

## 1. Executive summary

The existing application is a **workshop/lab platform** with Monaco-based code editors for lab steps (Node.js, mongosh), inline hints and skeleton placeholders, and **request/response execution** via Vite dev-server API routes (`/api/run-node`, `/api/run-mongosh`, `/api/run-bash`) using `node-pty` where needed. There is **no** in-browser terminal (no xterm.js), no WebSocket streaming, no LSP, and no persistent PTY sessions.

The refactor plan evolves this into a **browser-based developer workspace** with:

- **Terminal:** Real long-lived PTY sessions in the browser (xterm.js + WebSocket to a session backend), with optional Warp-style guidance (ghost text, command chips, suggestions) implemented as overlays or line-attached UI.
- **Editor:** Strengthened Monaco integration (theming, languages, optional LSP), with placeholders, inline hints, CodeLens-style Run/Debug/Test, and a clear boundary between “editor content” and “guidance UI.”
- **Orchestration:** A clear session/workspace/execution layer so terminal, editor, and runners share context (workspace, language, runnable file) without tight coupling.
- **Guidance system:** A first-class **hint/assistant layer** (terminal hints, editor hints, command palette, suggested next steps) with explicit decisions on what is terminal-native vs React overlay vs backend-driven vs AI-assisted.
- **Languages:** A practical path to Python, Node/TS, Java, and C# (editing, run/debug, diagnostics) with honest split: what runs in-browser vs backend/containers.

The plan is **phased** (assess → isolate abstractions → session/transport → Monaco upgrade → language tooling → hints/palette → multi-runtime → optional extensibility/AI) to avoid big-bang rewrites and keep the existing app shippable at each step.

---

## 2. Likely current-state assessment

Inferred from the codebase (Monaco, node-pty, run-* APIs, lab steps, inline hints):

### What probably exists today

| Area | Current implementation | Notes |
|------|-------------------------|--------|
| **Editor** | `@monaco-editor/react` in `InlineHintEditor`, `StepView`, `CodePlayground` | Single editor instance per step/block; custom theme (`lab-dark`/`lab-light`), custom `mongosh` language (Monarch). No LSP. |
| **Terminal / execution** | No in-browser terminal. Execution via HTTP POST to `/api/run-node`, `/api/run-mongosh`, `/api/run-bash`; Vite dev server runs `node`, `mongosh`, or bash via `child_process`/`execFile`/`node-pty`. | One-shot run: send code → get stdout/stderr back. PTY used for mongosh when path is not absolute. |
| **Output surface** | Console/log panel in `StepView` that appends run output and validation messages. | Not a real terminal; no cursor, no interactive shell, no tabs. |
| **Placeholders / hints** | Skeleton code with `_________` blanks; `inlineHints` (line, blankText, hint, answer); Monaco decorations for “?” and reveal-on-click. | Editor-only; no terminal placeholders or command suggestions. |
| **Workspace / files** | Lab content is enhancement metadata (code blocks, skeletons); no generic file tree or workspace abstraction. | Content is step-centric, not file-centric. |
| **Session** | Workshop session (template, labs, MongoDB URI, etc.); no PTY session identity or reconnect. | Session = app state + storage; not “terminal session.” |
| **Backend** | Vite plugin middleware: many `/api/*` routes for verification, run-node, run-mongosh, run-bash, AWS, etc. | All in-process; no separate execution server or WebSocket. |

### Likely technical debt and limitations

1. **Execution model**  
   - Request/response only: no streaming, no long-lived process visibility, no cancellation except timeout.  
   - Run is “fire and forget” from UI perspective; no process handle or session to reconnect to.  
   - PTY is used only for mongosh in dev; bash/node use execFile. No unified “session” abstraction.

2. **Editor architecture**  
   - Monaco is used as a rich text control with custom theme/language, not as an IDE core: no document model, no multi-tab, no “editor instance manager.”  
   - Hints are lab-content–driven (inlineHints + decorations); no generic diagnostics provider or language service.  
   - Each step owns its editor state; no shared workspace document store.

3. **Terminal vs editor split**  
   - There is no real terminal; “terminal” is “run button + log panel.” So there is no split to confuse yet—but also no place for terminal-native hints, command history, or Warp-style UX without adding a real terminal.

4. **Integration gaps**  
   - Run flows are hard-wired (detect language from block, choose run-node vs run-mongosh vs run-bash). Adding Python/Java/C# would require more ad-hoc branches unless an execution abstraction is introduced.  
   - No shared “workspace context” (current file, project type, runnable targets) for hints or command palette.  
   - Verification/lab validation is separate from “run”; no unified “last run result” or “diagnostics” that both terminal and editor could consume.

5. **Scalability of hints**  
   - Hints are defined per enhancement (skeleton + inlineHints). To add command suggestions, “suggest next step,” or AI-assisted hints, there is no provider abstraction—only content-driven blanks.

Concrete next step: **Phase 0** should map every call to `run-node`/`run-mongosh`/`run-bash`, every Monaco mount, and every place that renders “output” or “validation,” and document them in a short “current execution and editor map” so the refactor does not miss a code path.

---

## 3. Target architecture

### High-level layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  UI LAYER                                                                   │
│  (React: Shell, Panels, Command Palette, Hint Overlays, Banners)             │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│  Editor      │  Terminal    │  Workspace   │  Hint/       │  Command        │
│  Surface     │  Surface     │  Explorer   │  Assistant   │  Palette         │
│  (Monaco)    │  (xterm.js)  │  (tree)     │  (overlays) │  (cmdk / custom) │
├──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┤
│  EDITOR LAYER          │  TERMINAL LAYER       │  HINT/ASSISTANT LAYER      │
│  - Document model       │  - PTY client        │  - TerminalHintProvider   │
│  - Monaco instance(s)  │  - xterm.js adapter   │  - EditorHintProvider      │
│  - Language config      │  - Session binding   │  - WorkspaceHintProvider   │
│  - Decorations          │  - Input/output      │  - Action rank/suppress    │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│  WORKSPACE / FILE LAYER │  EXECUTION LAYER     │  LANGUAGE TOOLING LAYER     │
│  - Virtual or real FS  │  - RuntimeExecutor    │  - LSP client (optional)   │
│  - Open documents       │  - Node/Python/Java  │  - DiagnosticsProvider     │
│  - Workspace metadata   │  - Long-run support  │  - Completions (Monaco/LSP)│
├─────────────────────────┴──────────────────────┴────────────────────────────┤
│  SESSION / TRANSPORT LAYER                                                  │
│  - SessionManager (terminal + optional editor sync)                         │
│  - WebSocket to backend PTY + optional file sync                            │
│  - Backend: node-pty, container, or remote execution                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

- **UI layer:** React components only. Shell layout, panel visibility, command palette trigger, and any **non-native** hints (banners, chips, overlays) live here. Does not implement terminal escape handling or editor keybindings.
- **Editor layer:** Owns Monaco lifecycle, document open/close, theme/language, decorations, and inline hints that are **editor-native** (e.g. Monaco decorations, inline suggests). Talks to Workspace for document content and to Hint layer for what to show.
- **Terminal layer:** Owns xterm.js, PTY client, and **terminal-native** behavior (cursor, history, resize). Receives stream from Session/Transport; may receive “suggested commands” from Hint layer to render as ghost text or chips (implementation choice).
- **Workspace/file layer:** Abstraction over “current set of files” (virtual or real). Used by editor (open files), execution (which file to run), and hints (context).
- **Hint/assistant layer:** Aggregates TerminalHintProvider, EditorHintProvider, WorkspaceHintProvider, optional AIHintProvider; ranks and suppresses; exposes “suggested actions” and “current hints” to UI and to terminal/editor surfaces.
- **Language tooling layer:** Optional LSP client, Monaco language features, diagnostics. Can be phased in after Monaco and workspace are stable.
- **Execution layer:** RuntimeExecutor abstraction (Node, Python, Java, C#). Used by “Run” actions and by terminal (when user runs a command). Supports long-running processes via session/backend.
- **Session/transport layer:** WebSocket (or HTTP long-poll) to backend; maintains PTY sessions, optional file sync, and reconnect identity.

### Component relationships (ASCII)

```
                    ┌──────────────────┐
                    │   Command        │
                    │   Palette        │
                    └────────┬─────────┘
                             │ triggers actions
                             ▼
┌─────────────┐     ┌─────────────────────────────────────┐     ┌─────────────┐
│  Workspace  │────▶│  Hint/Assistant Orchestrator        │◀────│  Backend    │
│  Explorer   │     │  (context, rank, suggest)           │     │  (sessions)│
└──────┬──────┘     └──────────────┬──────────────────────┘     └──────┬──────┘
       │                          │                                    │
       │ open file                 │ hints / suggested actions         │ PTY I/O
       ▼                          ▼                                    ▼
┌─────────────┐     ┌─────────────────────────────┐     ┌─────────────────────┐
│  Editor     │     │  Terminal (xterm.js)          │     │  Session Manager    │
│  (Monaco)   │     │  - real shell                 │     │  - WebSocket        │
│  - docs     │     │  - ghost text / chips from   │     │  - reconnect         │
│  - hints    │     │    Hint layer                 │     │  - multi-tab        │
└──────┬──────┘     └──────────────┬────────────────┘     └──────────┬──────────┘
       │                          │                                  │
       │ run file / selection      │ run command                     │
       ▼                          ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Runtime Executor (Node, Python, Java, C#)  ←  Backend PTY / containers    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Recommended stack

| Concern | Recommendation | Why | Essential? |
|--------|----------------|------|------------|
| **Terminal rendering** | **xterm.js** (+ xterm-addon-fit, xterm-addon-web-links) | De facto standard; PTY adapters exist; good accessibility and performance. | Yes for real terminal. |
| **Editor rendering** | **Monaco** (keep `@monaco-editor/react`) | Already in use; VS Code quality; multi-language, theming, decorations. | Yes. |
| **File tree / workspace** | **Virtual:** in-memory tree keyed by path (e.g. `Record<path, content>`). **Optional later:** VSCode workspace API or custom server. | Current app is step/content-centric; virtual tree avoids backend FS dependency for MVP. | Virtual tree: yes for multi-file. Real FS: optional. |
| **LSP / language services** | **Monaco built-in** (syntax, basic completions) first; **monaco-languageclient** + LSP backend later for Python/Java/C#. | Built-in is enough for syntax + simple completions; LSP adds diagnostics, go-to-def, real IntelliSense. | Built-in: yes. LSP: Phase 4+. |
| **Session persistence** | **Backend session store** (e.g. Map<sessionId, PTY>) + **WebSocket** per session. Optional: Redis for multi-instance. | Long-lived PTY must live on server; WebSocket streams stdout/stderr and sends input. | Yes for long-lived terminal. |
| **Backend process execution** | **node-pty** for local dev; **containers** (Docker) or **remote runner** for production and isolation. | node-pty already used; containers give isolation for arbitrary code (Python, Java, C#). | node-pty: yes. Containers: for production/multi-runtime. |
| **Terminal multiplexing** | **Not required** for MVP. Optional: **tmux** or **screen** inside PTY for “detach” behavior; or multiple PTY sessions (tabs). | Multiple tabs = multiple PTY sessions; multiplexing inside one PTY is an enhancement. | Optional. |
| **VS Code API in browser** | **Plain Monaco first.** **@codingame/monaco-vscode-api** only if you need extensions or deep VS Code compatibility. | Monaco covers 90% of editor needs; vscode-api adds complexity and bundle size; adopt only if targeting extensions. | Optional; Phase 7. |
| **Hint engine** | **Custom:** provider registry (Terminal, Editor, Workspace, Language, AI), context type, rank/suppress rules, and a single “orchestrator” that merges and returns ordered suggestions. | No off-the-shelf “Warp-style hint” stack; must be designed so terminal vs editor vs overlay is explicit. | Yes for guided UX. |
| **Command palette** | **cmdk** (already in deps) or **custom** (keyboard-first list + fuzzy search). | cmdk is lightweight and fits React; can wrap an ActionRegistry. | Yes. |
| **AI assist** | **Backend API** (e.g. OpenAI/Claude) for “explain command,” “suggest next step,” “generate code”; frontend only sends context and displays results. | Keeps model and secrets off client; allows rules-based fallback. | Optional; Phase 8. |

---

## 5. Language support strategy

### Python

| Capability | In-browser | Backend / container | Notes |
|------------|------------|----------------------|--------|
| Editing, syntax | ✅ Monaco (built-in python) | — | Good enough for labs. |
| Lint/format | ✅ Optional: Monaco diagnostics from backend | ✅ Ruff/Black as subprocess or LSP | LSP (e.g. pyright) gives best UX. |
| IntelliSense | ✅ Basic (Monaco) | ✅ LSP (Pylance/pyright) | Phase 4. |
| Run script | ❌ | ✅ `python3 script.py` in PTY or runner | Must run in backend. |
| REPL/notebook | ❌ | ✅ PTY with `python3` or ipython | Terminal = REPL. |
| Placeholders / onboarding | ✅ Editor: skeleton + inlineHints (existing pattern) | — | e.g. “Fill in the function body.” |
| Run/Debug/Test | ✅ UI: CodeLens or toolbar | ✅ Backend runs pytest / script | Backend executes; UI shows result. |

**Recommendation:** Run/debug via Execution layer (backend PTY or runner); editor provides Run/Test actions that call same layer. Add Python to Monaco and optional Python LSP in Phase 4.

### Node / JavaScript / TypeScript

| Capability | In-browser | Backend | Notes |
|------------|------------|---------|--------|
| Editing, TS/JS | ✅ Monaco (built-in) | — | Already used. |
| Language intelligence | ✅ Monaco | ✅ Optional: ts-server LSP | Current: no LSP; add for TS later. |
| npm workflows | ❌ | ✅ `npm run …` in PTY | Terminal or “Run script” action. |
| Run Node process | ❌ | ✅ Already: run-node API | Keep; later route via Execution layer. |
| Debug | ❌ | ✅ node --inspect; optional Chrome DevTools tunnel | Phase 6. |
| Guided workflows | ✅ Hints + command palette | — | e.g. “Run: npm run dev” chip. |

**Recommendation:** Keep existing run-node; generalize to “NodeRuntimeExecutor” in Execution layer. Add “Run npm script” to command palette and hint layer.

### Java

| Capability | In-browser | Backend | Notes |
|------------|------------|---------|--------|
| Editing | ✅ Monaco (built-in java) | — | Syntax only without LSP. |
| Diagnostics / LSP | ✅ LSP client in browser | ✅ jdtls or similar in container | Must run in backend. |
| Build (Maven/Gradle) | ❌ | ✅ PTY: `./mvnw compile` etc. | Terminal or “Build” action. |
| Run/compile | ❌ | ✅ PTY or runner in container | JVM required. |
| Workspace hints | ✅ “Build project”, “Run main” | — | From WorkspaceHintProvider. |

**Recommendation:** Java support is backend-heavy: container or dedicated runner with JDK + Maven/Gradle. Editor: Monaco + optional LSP over WebSocket. Hints: “Build”, “Run”, “Test” from workspace scan (e.g. detect pom.xml).

### C#

| Capability | In-browser | Backend | Notes |
|------------|------------|---------|--------|
| Editing | ✅ Monaco (built-in csharp) | — | Syntax. |
| Diagnostics / LSP | ✅ LSP client | ✅ OmniSharp in container | Same pattern as Java. |
| Build/run | ❌ | ✅ `dotnet run` in PTY or container | .NET runtime on backend. |
| Guided hints | ✅ “Run project”, “Test” | — | From workspace (.csproj). |

**Recommendation:** Same as Java: backend runner or container with .NET SDK; editor + optional LSP; command palette and hints for dotnet run/test.

**Honest split:** All **execution** (run, test, build) for Python/Java/C# must happen in backend or container. Browser handles editing, hints, and “Run” triggers; backend handles process lifecycle and streaming.

---

## 6. Placeholder and hint strategy

### Terminal UX (no native placeholders)

Terminals don’t have native placeholder text. Options:

| Need | Approach | Terminal-native? | React overlay? | Backend? | AI? |
|------|----------|-------------------|---------------|----------|-----|
| “Suggested command” | Ghost text after prompt or clickable chip above prompt | Optional (custom line with ghost text) | ✅ Chips/banners above terminal | Can suggest from context | Optional |
| Tab completion | Real shell completion (bash, zsh) | ✅ PTY already does it | — | ✅ | — |
| Command history | PTY/shell history | ✅ | Optional: history dropdown | — | — |
| “Next step” suggestion | One-line hint or chip | — | ✅ | ✅ Rules or AI | Optional |
| Explain command | On demand (e.g. click “?”) | — | ✅ Modal or panel | ✅ or AI | Optional |

**Recommendation:**  
- **Terminal-native:** Keep real PTY (tab completion, history). Do **not** fake a chat box.  
- **React overlay:** Banners above terminal (“Suggested: npm run dev”), clickable command chips that insert or run, and optional ghost line (e.g. second line under prompt showing suggestion).  
- **Backend-driven:** “Suggest next step” can be rules-based (e.g. if file is `app.py` and not run yet → suggest `python app.py`).  
- **AI-assisted:** Optional: “Explain this command,” “Suggest command for: run tests.”  

**Presentational vs executable:** Chips/ghost text are **presentational** until user clicks “Run” or “Insert”; then they become **executable** (send to PTY or insert into input). Never auto-execute suggestions without explicit user action.

### Editor UX

| Need | Approach | Where |
|------|----------|--------|
| Placeholders for empty files | Skeleton with blanks (existing pattern) or Monaco placeholder widget | Editor layer |
| Inline suggestions / ghost text | Monaco inline suggest API (optional) or existing “?” + reveal | Editor layer |
| Diagnostics / hints | Monaco markers + optional LSP | Editor + Language layer |
| CodeLens (Run/Debug/Test) | Monaco CodeLens API; provider calls Execution layer | Editor + Execution |
| Hover help | Monaco hover provider (built-in or LSP) | Editor layer |
| Quick fixes | LSP CodeAction or custom provider | Language layer |
| Starter templates | Workspace or Hint layer: “Create from template” in palette | Hint + Workspace |
| AI inline suggestions | Optional: inline suggest provider calling backend | Editor + backend |

**Recommendation:** Keep current skeleton + inlineHints for labs; add a **EditorHintProvider** that can also serve “empty file” onboarding and CodeLens “Run”/“Test” from workspace context. Use Monaco’s native APIs for decorations, CodeLens, hover; keep hints **actionable** (e.g. Run, Insert, Open doc).

### Command palette and guided actions

- **VS Code–style command palette:** One keyboard shortcut (e.g. Cmd+Shift+P); fuzzy search over **ActionRegistry** (Run Python file, Start Node dev server, Build Java project, Run C#, Open workspace file, etc.).  
- **Workspace-aware:** Palette receives current file, language, and workspace metadata so “Run” is “Run current file” when applicable.  
- **Per-language quick actions:** E.g. “Python: Run File”, “Node: Run npm script”, “Java: Build project.” Implement as registered actions that call RuntimeExecutor.  
- **Terminal ↔ editor:** “Run selection in terminal” (editor action) inserts or runs in active terminal; “Open file at cursor” from terminal output (e.g. file path) opens in editor.  
- **“Suggest next step”:** Hint layer computes one or more suggested actions (e.g. after run: “Run tests?”); show in small UI or palette secondary line.

**Discoverability:** Palette shows “Run …”, “Debug …”, “Test …” per language; optional “Guided” category for lab-style next steps. Keep labels consistent (e.g. “Python: Run current file”).

---

## 7. Warp-style hybrid UX architecture

**Principle:** Terminal = real terminal. Editor = real editor. Guidance = layer **around** them, not replacing them.

- **Terminal:** Real PTY, real shell, real history and tab completion. No fake chat.  
- **Editor:** Real Monaco, real files (or virtual docs), real editing.  
- **Guidance:** Banners, chips, ghost text, command palette, and “suggest next step” that **augment** terminal and editor without taking over.

**Unified feel:**

- **Single action registry:** Both “Run from editor” and “Run in terminal” resolve to the same kind of action (e.g. “Run Python file”) so behavior is consistent.  
- **Shared context:** Workspace (current file, language, runnable targets) is available to both terminal hints and editor CodeLens.  
- **No double modality:** Avoid “you’re now in AI chat mode” that disables normal typing. Prefer: user can always type in terminal or editor; suggestions appear as **optional** chips or palette items.

**Implementation:**

- **Contextual guidance above/beside:** A thin “assistant” strip or panel (React) that shows “Suggested: python main.py” or “Next: Run tests.” Click = run or insert.  
- **Terminal:** Optional ghost line under prompt (custom xterm.js line or overlay) showing one suggestion; Enter or click to accept.  
- **Editor:** CodeLens “Run | Debug” and optional inline “Run this” hint.  
- **AI or rules:** Backend or client-side rules compute “suggested next step” from: last command, last run result, current file, lab step. AI can enhance suggestions but rules provide baseline and safety.

**Avoid:** Making the terminal look like a chat window; auto-running commands; hiding the real prompt; disabling normal terminal behavior. **Do:** Keep suggestions dismissible, keyboard-accessible, and clearly “suggestion” not “system message.”

---

## 8. Refactoring roadmap

### Phase 0 — Assess and map current setup

**Objective:** No behavior change; create a precise map of execution and editor usage.

**Tasks:**

- List every call to `/api/run-node`, `/api/run-mongosh`, `/api/run-bash` (and any other execution API).  
- List every Monaco editor mount (InlineHintEditor, StepView, CodePlayground, etc.) and what they render (skeleton, full code, read-only).  
- Document where “output” is shown (which component, which state).  
- Document how “validation” or “check progress” works and whether it depends on run output.  
- Identify all “run” triggers (button, keyboard, etc.).

**Risks:** None. **Migration:** None; deliverable = markdown/ADR + optional small refactors to name “execution” vs “validation” clearly.

---

### Phase 1 — Isolate terminal and editor abstractions

**Objective:** Introduce **interfaces** and **thin wrappers** so the rest of the app depends on abstractions, not Vite API or Monaco directly.

**Tasks:**

- Define **RuntimeExecutor** interface (e.g. `run(codeOrPath, language, options) => Promise<RunResult>`). Implement **NodeExecutor** that calls existing `/api/run-node` (and similarly for mongosh/bash).  
- Introduce **EditorSession** or **EditorInstance** abstraction: “one editor instance” with `setContent`, `getContent`, `setDecorations`, `focus`. Wrap current Monaco usage behind it so StepView/InlineHintEditor use the abstraction.  
- Introduce **OutputSurface** abstraction: “append lines”, “clear”, “mark success/fail”. Current log panel implements it.  
- Do **not** add xterm.js yet; keep “terminal” as “output surface + run buttons.”

**Risks:** Over-abstraction too early. **Mitigation:** Keep implementations thin; one concrete implementation per abstraction. **Migration:** Replace direct fetch/useState with calls to executor and output surface; behavior unchanged.

---

### Phase 2 — Normalize session and transport handling

**Objective:** Single place that “runs” code and receives output; prepare for streaming later.

**Tasks:**

- Centralize “run” flow: UI calls **ExecutionService** (or similar) with language + code/path; service chooses run-node / run-mongosh / run-bash (or future Python/Java) and returns result.  
- Standardize **RunResult** (stdout, stderr, exitCode, success, optional stream handle for future).  
- Optionally add a **SessionContext** (e.g. current workshop session, user) so execution can log or scope correctly.  
- Document where a **WebSocket** would later plug in (same ExecutionService, but stream instead of single response).

**Risks:** Scope creep (e.g. adding WebSocket in Phase 2). **Mitigation:** Keep transport as HTTP in Phase 2; only prepare interfaces. **Migration:** All run triggers go through ExecutionService; existing APIs remain.

---

### Phase 3 — Introduce Monaco and/or upgrade integration

**Objective:** Treat Monaco as the single editor engine; optional multi-tab or document manager.

**Tasks:**

- Consolidate Monaco options and theme in one module (already partly in `monacoLabEditorOptions`); ensure one place for “editor options” and “theme.”  
- If multi-file is a goal: introduce **DocumentManager** or **WorkspaceBuffer** (in-memory map path → content); editor “opens” a document by path and subscribes to content.  
- Add **EditorManager** if you have multiple editor instances (e.g. tabs): create/destroy Monaco instances, track active document.  
- Optional: add **MonacoLanguageRegistry** (register languages and options for python, java, csharp, etc.) so adding a new language is one registration.

**Risks:** Big change if current app is single-editor-per-step. **Mitigation:** Phase 3 can be “Monaco consolidation + document abstraction” without multi-tab UI; tabs can come later. **Migration:** Existing lab steps still “one editor per step”; new abstraction can wrap that as “one document per step.”

---

### Phase 4 — Introduce language tooling

**Objective:** Diagnostics, completions, and (optional) LSP for at least one language beyond current.

**Tasks:**

- Add **DiagnosticsProvider** interface; implement for “none” (MVP) and “from backend” (e.g. backend runs linter, returns diagnostics; frontend displays via Monaco markers).  
- Wire Monaco `languages.registerCompletionItemProvider` (and similar) for JavaScript/TypeScript/Python if using built-in only.  
- Optional: run **LSP** (e.g. pyright, jdtls) in backend; use **monaco-languageclient** (or custom WebSocket) to connect Monaco to LSP; implement **LanguageProvider** that delegates to LSP.  
- Start with one language (e.g. Python) for LSP to validate the pipeline.

**Risks:** LSP in browser is non-trivial (WebSocket, initialization). **Mitigation:** Phase 4 can be “diagnostics from backend” only; LSP in Phase 5 or 6. **Migration:** Editors already use Monaco; add providers without changing step content.

---

### Phase 5 — Placeholders, hints, command palette, and guided UX

**Objective:** First-class hint system and command palette without breaking existing lab hints.

**Tasks:**

- Implement **HintOrchestrator**: registry of **TerminalHintProvider**, **EditorHintProvider**, **WorkspaceHintProvider**; **HintContext** (current file, language, last run, lab step); **rank** and **suppress** (e.g. don’t show “Run” if just ran).  
- **Editor:** Keep existing skeleton + inlineHints; add **EditorHintProvider** that returns “Run”, “Test”, or lab-specific hints from enhancement metadata.  
- **Terminal:** Implement **TerminalHintProvider** (e.g. “suggested command” from context); render as React overlay (banner/chips) above terminal or as ghost line (if you add xterm in same phase).  
- **Command palette:** **ActionRegistry** with actions like “Run current file”, “Run npm script”, “Python: Run file”; palette (cmdk) shows them; actions call ExecutionService and optionally HintOrchestrator.  
- **“Suggest next step”:** Orchestrator returns one or more **SuggestedAction**; UI shows in small strip or as palette suggestion.

**Risks:** Hint overload; conflict with existing lab blanks. **Mitigation:** Lab hints remain “inline in editor”; new hints are “global” or “workspace” and clearly separate. Suppression rules (e.g. after run, don’t suggest “Run” again for 2s). **Migration:** Existing inlineHints unchanged; new providers additive.

---

### Phase 6 — Multi-runtime execution (and real terminal)

**Objective:** Add Python/Java/C# execution and, if not done earlier, real in-browser terminal with PTY.

**Tasks:**

- Implement **PythonExecutor**, **JavaExecutor**, **CSharpExecutor** (or generic **ContainerExecutor**) that call backend; backend runs in container or sandbox.  
- **Terminal:** Add xterm.js; add WebSocket client to backend **PTY endpoint**; **SessionManager** creates/destroys PTY sessions; xterm.js displays stream.  
- **Reconnect:** Session id in URL or storage; on load, reconnect WebSocket to existing PTY if backend supports it.  
- **Long-running:** Support “run and stream” so that “npm run dev” keeps streaming; cancellation = send SIGTERM or close PTY.

**Risks:** Security (arbitrary code in container); backend complexity. **Mitigation:** Containers with resource limits; no privileged mode. **Migration:** Existing run-node/run-mongosh can remain for “quick run”; new runtimes and real terminal are additional capabilities.

---

### Phase 7 — Optional VS Code–like extensibility

**Objective:** Decide whether to adopt `@codingame/monaco-vscode-api` or custom extension points.

**Tasks:**

- Evaluate: need for VS Code extensions in browser vs “custom actions and themes only.”  
- If adopting vscode-api: follow their setup (worker, services); expose a small set of extension APIs (e.g. register command, register run action).  
- If not: define **ActionRegistry** and **ThemeRegistry** as internal “extension points” so new runtimes or hints can register without forking the app.

**Risks:** vscode-api is heavy and may conflict with current Monaco setup. **Mitigation:** Phase 7 is optional; many products ship without it. **Migration:** Only if product requirement is “run VS Code extensions in browser.”

---

### Phase 8 — Optional AI-assisted developer experience

**Objective:** AI explain/suggest without replacing terminal or editor.

**Tasks:**

- **Backend:** API that takes context (selection, last command, file path) and returns “explanation” or “suggested command/code.”  
- **Frontend:** “Explain” action in palette or context menu; optional “Suggest next step” that calls AI and shows result in assistant strip.  
- **Rules-based fallback:** If AI unavailable, use rules (e.g. “if file is test_*.py, suggest pytest”).

**Risks:** Latency, cost, hallucinations. **Mitigation:** Always optional; rules first. **Migration:** Additive; no change to core run or edit flow.

---

## 9. Suggested folder / module structure

```
src/
├── app/                    # Shell, layout, routing (optional)
├── components/
│   ├── editor/             # Monaco wrapper, EditorManager, document tab (if any)
│   │   ├── MonacoEditor.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── EditorCodeLens.tsx
│   ├── terminal/           # xterm.js wrapper, TerminalPanel
│   │   ├── XtermTerminal.tsx
│   │   ├── TerminalHintOverlay.tsx   # React overlay for chips/banners
│   │   └── TerminalTabs.tsx
│   ├── workspace/          # File tree (virtual or real)
│   │   ├── FileTree.tsx
│   │   └── WorkspaceToolbar.tsx
│   ├── hints/              # Shared hint UI
│   │   ├── HintBanner.tsx
│   │   ├── CommandChips.tsx
│   │   └── SuggestNextStep.tsx
│   ├── command-palette/
│   │   ├── CommandPalette.tsx
│   │   └── ActionList.tsx
│   └── labs/               # Existing: StepView, InlineHintEditor, etc.
├── services/
│   ├── execution/
│   │   ├── ExecutionService.ts       # Single entry: run(code/path, lang, opts)
│   │   ├── NodeExecutor.ts
│   │   ├── PythonExecutor.ts
│   │   └── types.ts                  # RunResult, RunOptions
│   ├── session/
│   │   ├── SessionManager.ts         # PTY session create/destroy/reconnect
│   │   └── TransportClient.ts        # WebSocket to backend
│   ├── workspace/
│   │   ├── DocumentStore.ts          # path → content (virtual)
│   │   └── WorkspaceMetadata.ts      # runnables, project type
│   └── hints/
│       ├── HintOrchestrator.ts
│       ├── TerminalHintProvider.ts
│       ├── EditorHintProvider.ts
│       ├── WorkspaceHintProvider.ts
│       └── types.ts                  # HintContext, SuggestedAction
├── lib/
│   ├── monaco/                       # Existing + extensions
│   │   ├── monacoLabEditorOptions.ts
│   │   ├── languages.ts              # Register python, java, csharp
│   │   └── themes.ts
│   └── terminal/
│       └── xtermAdapter.ts           # xterm.js + WebSocket glue
├── stores/                            # Optional: Zustand/Jotai for UI state
│   ├── editorStore.ts
│   └── terminalStore.ts
└── types/
    └── ide.ts                         # TerminalSession, EditorDocument, etc.
```

**Boundaries:**

- **Editor:** Components only mount Monaco and forward events; **EditorManager** or **DocumentStore** holds content and selection.  
- **Terminal:** **XtermTerminal** owns xterm instance; **SessionManager** owns WebSocket and PTY id; **TerminalHintOverlay** is pure React and receives suggestions from HintOrchestrator.  
- **Execution:** All “run” requests go through **ExecutionService**; no component calls `/api/run-node` directly.  
- **Hints:** Providers are stateless functions or classes that take **HintContext** and return **SuggestedAction[]**; **HintOrchestrator** ranks and filters; UI only renders.

---

## 10. TypeScript abstraction examples

```ts
// types/ide.ts (or services/execution/types.ts)

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  streamId?: string;   // for future streaming
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface RuntimeExecutor {
  readonly language: string;  // 'node' | 'python' | 'java' | 'csharp' | 'mongosh' | 'bash'
  run(code: string, options?: RunOptions): Promise<RunResult>;
  runFile(path: string, options?: RunOptions): Promise<RunResult>;
  canRunFile?(path: string): boolean;
}

export interface TerminalSession {
  id: string;
  ptyId: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  onData(cb: (data: string) => void): () => void;
  onClose(cb: () => void): () => void;
}

export interface EditorDocument {
  path: string;
  language: string;
  getContent(): string;
  setContent(content: string): void;
  onDidChangeContent(cb: (content: string) => void): () => void;
}

export interface WorkspaceFile {
  path: string;
  kind: 'file' | 'directory';
  children?: WorkspaceFile[];
}

export interface SessionTransport {
  connect(sessionId: string): Promise<void>;
  send(data: string): void;
  onMessage(cb: (data: string) => void): () => void;
  disconnect(): void;
}

export interface HintContext {
  currentFilePath?: string;
  currentLanguage?: string;
  lastRunCommand?: string;
  lastRunResult?: RunResult;
  labStepId?: string;
  workspaceRunnables?: { label: string; script: string }[];
}

export interface SuggestedAction {
  id: string;
  label: string;
  description?: string;
  kind: 'run' | 'insert' | 'open' | 'command';
  payload?: string | object;   // command to run, text to insert, etc.
  source: 'terminal' | 'editor' | 'workspace' | 'language' | 'ai';
  priority: number;
}

export interface HintProvider {
  getId(): string;
  getHints(context: HintContext): Promise<SuggestedAction[]> | SuggestedAction[];
}

export interface CommandPaletteAction {
  id: string;
  label: string;
  category?: string;
  run(): Promise<void> | void;
  when?: (context: HintContext) => boolean;
}

export interface DiagnosticsProvider {
  getDiagnostics(path: string): Promise<Diagnostic[]> | Diagnostic[];
}

export interface Diagnostic {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}
```

---

## 11. Long-running process support

**Requirements:** Long-lived shell sessions, multiple sessions/tabs, reconnect/resume, streaming stdout/stderr, cancellation, security.

**Approach:**

- **Backend:** One **PTY process** per “terminal tab,” managed by **SessionManager** on server. Store in Map(sessionId → pty). Use **node-pty** (or equivalent) so the process is a real shell.  
- **Streaming:** WebSocket per session: client sends input; server writes to PTY and streams stdout/stderr back.  
- **Reconnect:** On load, client sends “reconnect sessionId”; server looks up PTY and reattaches WebSocket. If PTY died, return error and client creates new session.  
- **Persistence:** Option A: PTY stays alive (no persistence of output; only reattach). Option B: Backend logs output to a buffer and replays last N lines on reconnect (optional). Option C: Use **tmux** or **screen** inside PTY so user can detach/attach; more complex.  
- **Multiple tabs:** Multiple PTYs, each with sessionId; UI switches active tab and sends input to active session’s WebSocket.  
- **Cancellation:** Client sends “kill” message; server calls `pty.kill()` or sends SIGTERM.  
- **Security/isolation:** Run backend in container or VM; one container per user or per workspace if needed. Limit resources (CPU, memory); sanitize input if necessary. **Per-user workspaces:** Each user gets a workspace path or container; PTY cwd is that workspace.

**Concrete choice:**

- **node-pty** for local dev and single-machine deployment.  
- **Containers** (Docker) for production and multi-tenant: one container per session or per user, with shell + runtimes (Node, Python, Java, .NET).  
- **Remote execution:** Optional: PTY runs on a remote runner; WebSocket tunnels to browser. Same client design.  
- **tmux/screen:** Optional later; start with “one PTY per tab” and no persistence of output across refresh.

---

## 12. Incorporating VS Code–like APIs

**When plain Monaco is enough:**

- Theming, syntax highlighting, multiple languages, decorations, CodeLens, hover, inline edits, basic completions.  
- Custom keybindings and commands (handled in React or in a small command registry).  
- No need for full VS Code extension host or vscode-api.

**When @codingame/monaco-vscode-api is worth it:**

- You want to **run VS Code extensions** in the browser (or a subset).  
- You want **VS Code services** (e.g. exactly the same completion API as VS Code).  
- You are building a “VS Code in the browser” product.

**Benefits of vscode-api:** Extension ecosystem, familiar APIs for VS Code developers, theming and language services aligned with VS Code.  
**Costs:** Bundle size, complexity, worker setup, and possible conflicts with existing Monaco usage (e.g. custom languages, lab editors).

**Recommendation:**  
- **Start with plain Monaco.** You already have it; it covers editing, hints, and run/debug UX.  
- **Introduce vscode-api only if** you have a requirement for extensions or deep VS Code compatibility.  
- If you do adopt it: do so in Phase 7, in a dedicated “advanced editor” path (e.g. optional route or feature flag) so the existing lab/workshop editor keeps working.

---

## 13. Hinting architecture (dedicated section)

### Providers

- **TerminalHintProvider:** Input: HintContext (last run, current workspace file). Output: suggested commands (e.g. “python main.py”, “npm test”). Can be rules-based (“if file is .py and not run, suggest python <file>”) or call backend/AI.  
- **EditorHintProvider:** Input: current document, language, selection. Output: “Run file”, “Run selection”, “Debug”, lab-specific hints from enhancement metadata.  
- **WorkspaceHintProvider:** Input: workspace metadata (package.json scripts, pom.xml, etc.). Output: “Run npm script: dev”, “Build Java project.”  
- **LanguageHintProvider:** Input: file path, language. Output: e.g. “Add type hints” (Python), “Implement interface” (TypeScript). Optional; can be LSP-driven.  
- **AIHintProvider:** Input: same as others. Output: suggested command or code. Optional; call backend.  
- **CommandPaletteProvider:** Not a “hint” but an **action source**; palette shows actions from ActionRegistry; can be filtered by “when” (e.g. only show “Run Java” when workspace has Java project).

### Event sources

- **Editor:** On document open, on selection change, on save → push context to HintOrchestrator; orchestrator asks EditorHintProvider and LanguageHintProvider.  
- **Terminal:** On prompt (if detectable), on session start, after run finished → push context; orchestrator asks TerminalHintProvider.  
- **Workspace:** On workspace load or file change (e.g. package.json changed) → refresh WorkspaceHintProvider output.

### Context model

**HintContext** (see TypeScript section) holds: currentFilePath, currentLanguage, lastRunCommand, lastRunResult, labStepId, workspaceRunnables. All providers receive the same context so suggestions are consistent.

### Ranking and prioritization

- **Priority field** on SuggestedAction (e.g. 0–100). Orchestrator sorts by priority.  
- **Source order:** e.g. editor (run file) > workspace (run script) > terminal (generic).  
- **Recency:** “Run” right after a run might be deprioritized or suppressed.

### Suppression rules

- **Time-based:** After “Run,” suppress “Run” for 2–5 seconds.  
- **Step-based:** In lab mode, only show hints for current step.  
- **Dismissal:** User dismisses a hint → don’t show same hint for that context again (session or short TTL).  
- **No duplicate:** If same label/payload from two providers, keep one.

### When hints appear and disappear

- **Terminal:** Show suggestion when prompt is “ready” (e.g. after newline and no pending input) or when user focuses terminal. Hide when user starts typing or runs a command.  
- **Editor:** Show CodeLens “Run” when file is runnable; show inline hint when cursor is on a blank (existing behavior). Hide when user reveals answer or moves away.  
- **Banner/chip:** Show when orchestrator returns non-empty list; hide on dismiss or after action executed.

### Actionable hints

- Every hint is a **SuggestedAction** with `kind` (run, insert, open, command) and optional `payload`.  
- “Run” → ExecutionService.run or terminal.write.  
- “Insert” → editor.insertText or terminal.write.  
- “Open” → open file in editor.  
- Keyboard: palette and chips are focusable; Enter executes; Esc dismisses.

---

## 14. Risks and tradeoffs

| Risk | Mitigation |
|------|------------|
| Scope creep (doing too much in one phase) | Strict phase boundaries; each phase shippable. |
| Breaking existing lab/workshop flows | Phase 1–2 only add abstractions; run paths unchanged. Keep lab steps and enhancements as primary content model. |
| xterm.js + PTY backend complexity | Phase 6; optional “simple terminal” first (single session, no reconnect). |
| LSP in browser (latency, setup) | Optional; start with “diagnostics from backend” and Monaco built-in; LSP only for languages that need it. |
| Hint noise | Suppression rules, priority, and “don’t show more than N at a time.” |
| Security (arbitrary code execution) | Backend in container/VM; resource limits; no privileged mode. |
| VS Code API adoption cost | Defer to Phase 7; use only if product requires extensions. |

---

## 15. Recommended MVP vs later-phase enhancements

**MVP (Phases 0–2 + slice of 5):**

- Phase 0: Map current execution and editor.  
- Phase 1: RuntimeExecutor + EditorSession + OutputSurface abstractions; no new UI.  
- Phase 2: ExecutionService centralizes run; RunResult standardized.  
- Slice of Phase 5: **Command palette** (cmdk) with “Run current file” and existing run-node/run-mongosh actions; **no** real terminal yet, **no** new hint providers.  

**Outcome:** Same UX as today, but “run” and “output” are behind clean abstractions, and user can trigger “Run” from a palette. Delivers value (discoverability) with low risk.

**Later:**

- Phase 3: Monaco consolidation and optional document manager.  
- Phase 4: Diagnostics and optional LSP for one language.  
- Phase 5 full: HintOrchestrator, TerminalHintProvider, EditorHintProvider, “suggest next step.”  
- Phase 6: Real terminal (xterm.js + WebSocket), Python/Java/C# executors, long-running support.  
- Phase 7–8: VS Code API (if needed), AI assist.

---

*End of document. Use this as the basis for implementation planning and ADRs; refine phases and interfaces as the codebase and product requirements evolve.*
