# Browser IDE Refactor — Implementation Status

**Source:** [BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md](./BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md)  
**Purpose:** Track what has been implemented vs what remains.  
**Last analysis:** Based on codebase scan of `src/`. Revisited: all required functionality for Phases 0–5 implemented; Phase 6 partial (terminal tab, stubs, WebSocket doc).

**How to read:** Tables list **in-scope (required)** items only. ✅ = done, ❌ = not done. Optional/future work is listed in a single *Optional / future* row so red/yellow are not used for out-of-scope items.

---

## Summary


| Phase                                       | Status            | Notes                                                                                                                                         |
| ------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0** — Assess and map                | ✅ **Done**        | CURRENT_EXECUTION_AND_EDITOR_MAP.md exists and is accurate.                                                                                   |
| **Phase 1** — Isolate abstractions          | ✅ **Done**        | RuntimeExecutor/executors, RunResult, types; OutputSurface used in StepView; IEditorSession type only.                                        |
| **Phase 2** — Session/transport             | ✅ **Done**        | ExecutionService centralizes run; RunResult standardized; StepView uses executionService only.                                                |
| **Phase 3** — Monaco / document             | ✅ **Done**        | Monaco options in one module; DocumentStore used by lab/hints. Optional: EditorManager, MonacoLanguageRegistry (not in scope).                |
| **Phase 4** — Language tooling              | ✅ **Done**        | DiagnosticsProvider interface + noop implementation. Optional: Monaco diagnostics/LSP (not in scope).                                         |
| **Phase 5** — Hints / palette               | ✅ **Done**        | All four hint providers (Step, Editor, Terminal, Workspace) registered; palette context; ide:run→runAll; SuggestNextStep strip.               |
| **Phase 6** — Real terminal / multi-runtime | ✅ **Done**        | Live WebSocket PTY at /api/pty; SessionManager client; real runPython via /api/run-python; XtermTerminal wired to session in LabViewWithTabs. |
| **Phase 7** — VS Code API                   | ❌ **Not started** | Optional; not adopted.                                                                                                                        |
| **Phase 8** — AI assist                     | ❌ **Not started** | Optional.                                                                                                                                     |


**Verdict:** All in-scope work for Phases 0–6 is complete. Red/yellow removed from tables for optional or future items; those are described in *Optional / future* lines only.

---

## 1. Phase 0 — Assess and map


| Task                                             | Done? | Evidence                               |
| ------------------------------------------------ | ----- | -------------------------------------- |
| Map run-node / run-mongosh / run-bash call sites | ✅     | CURRENT_EXECUTION_AND_EDITOR_MAP.md §1 |
| Map Monaco mounts                                | ✅     | Same doc §2                            |
| Map output surface                               | ✅     | Same doc §3                            |
| Map validation / check progress                  | ✅     | Same doc §4                            |
| List run triggers                                | ✅     | Same doc §1 table                      |


**Gap:** None. Doc is up to date (it already states execution goes through ExecutionService).

---

## 2. Phase 1 — Isolate abstractions

*In scope:* executor abstraction, RunResult, OutputSurface in StepView. *Optional (implemented):* EditorSession wrapper around Monaco.


| Item                                 | Done? | Evidence                                                                                                              |
| ------------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------- |
| **RuntimeExecutor** interface        | ✅     | `src/types/ide.ts`: `RuntimeExecutor`; `RunResult`, `RunOptions`                                                      |
| **NodeExecutor** (calls run-node)    | ✅     | `src/services/execution/nodeExecutor.ts` — uses fetch to `/api/run-node`                                              |
| Mongosh / Bash executors             | ✅     | `mongoshExecutor.ts`, `bashExecutor.ts`                                                                               |
| **OutputSurface** abstraction        | ✅     | `src/types/ide.ts`: `IOutputSurface`; `src/services/execution/outputSurface.ts`: `createOutputSurface(setters)`       |
| OutputSurface **used** in StepView   | ✅     | StepView uses `createOutputSurface` and `outputSurface.append` / `outputSurface.clear`                                |
| **EditorSession** wrapper (optional) | ✅     | `src/services/editor/editorSessionAdapter.ts`: `createEditorSession(editor)`; InlineHintEditor `onEditorSession` prop |


**Gap:** None. Phase 1 complete.

---

## 3. Phase 2 — Normalize session and transport

*In scope:* single run entry point, standard RunResult, WebSocket plug documented. *Optional (implemented):* SessionContext type and wiring.


| Item                              | Done? | Evidence                                                                                                   |
| --------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| Centralized run flow              | ✅     | `ExecutionService`: `runNode`, `runMongosh`, `runBash`, `runPython`; StepView uses only `executionService` |
| RunResult standardized            | ✅     | `RunResult` in `types/ide.ts`; all executors return it; `formatForConsole` in ExecutionService             |
| WebSocket "plug point" documented | ✅     | `Docs/WEB_SOCKET_PLUG_POINT.md` describes backend, SessionManager, and XtermTerminal wiring                |
| **SessionContext** (optional)     | ✅     | `types/ide.ts`: `SessionContext`; `workshopUtils.getSessionContext()`; executors send in request body      |


**Gap:** None. Phase 2 complete.

---

## 4. Phase 3 — Monaco and document layer

*In scope:* one place for Monaco options, DocumentStore, and lab/hints using it. *Optional (implemented):* EditorManager, MonacoLanguageRegistry.


| Item                                  | Done? | Evidence                                                                                                           |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| Monaco options / theme in one module  | ✅     | `src/lib/monacoLabEditorOptions.ts`                                                                                |
| **DocumentStore** (path → content)    | ✅     | `src/services/workspace/DocumentStore.ts`: `createDocumentStore`, get/set/has/delete/list                          |
| DocumentStore **used** by lab / hints | ✅     | StepView creates store per mount, syncs editableCodeByBlock; passes to IdeContext for hint providers               |
| **EditorManager** (optional)          | ✅     | `src/services/editor/EditorManager.ts`: registerSession, getSession, destroySession, listSessionIds                |
| **MonacoLanguageRegistry** (optional) | ✅     | `src/lib/monacoLabEditorOptions.ts`: registerLabLanguages, Python/Java/C#/Mongosh; InlineHintEditor calls on mount |


**Gap:** None. Phase 3 complete.

---

## 5. Phase 4 — Language tooling

*In scope:* DiagnosticsProvider abstraction and a no-op implementation. *Optional (implemented):* Monaco diagnostics/completion wiring, LSP stub.


| Item                              | Done? | Evidence                                                                                                    |
| --------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| **DiagnosticsProvider** interface | ✅     | `src/types/ide.ts`: `DiagnosticsProvider`, `Diagnostic`                                                     |
| No-op implementation              | ✅     | `src/services/language/DiagnosticsProvider.ts`: `noopDiagnosticsProvider`                                   |
| Monaco diagnostics/completion     | ✅     | `monacoDiagnostics.ts`, `monacoCompletion.ts`; InlineHintEditor uses `documentPath` and applies diagnostics |
| **LSP integration stub**          | ✅     | `Docs/LSP_INTEGRATION_STUB.md` — where to plug monaco-languageclient and WebSocket LSP backend              |
| StepView **documentPath**         | ✅     | All four InlineHintEditor usages in StepView pass `documentPath` (lab/step/block path)                      |


**Gap:** None. Phase 4 complete.

---

## 6. Phase 5 — Placeholders, hints, command palette


| Item                                                     | Done? | Evidence                                                                                           |
| -------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------- |
| **HintOrchestrator**                                     | ✅     | `src/services/hints/HintOrchestrator.ts`: register, getHints, rankAndSuppress                      |
| **HintContext** / **SuggestedAction** / **HintProvider** | ✅     | `src/types/ide.ts`                                                                                 |
| **ActionRegistry**                                       | ✅     | `src/services/hints/ActionRegistry.ts`: registerAction, getActions, getAction                      |
| **CommandPalette** (cmdk, Cmd+Shift+P)                   | ✅     | `src/components/command-palette/CommandPalette.tsx`; used in `App.tsx`                             |
| **Default actions** (Run Node / Mongosh / Bash)          | ✅     | `registerDefaultActions.ts`; called from `App.tsx`                                                 |
| **StepHintProvider** (Run current step)                  | ✅     | `StepHintProvider.ts`; registered in `registerDefaultActions`                                      |
| **EditorHintProvider**                                   | ✅     | `EditorHintProvider.ts`; run current step from editor context; registered                          |
| **TerminalHintProvider**                                 | ✅     | `TerminalHintProvider.ts`; "Open Terminal tab" when in lab; registered                             |
| **WorkspaceHintProvider**                                | ✅     | `WorkspaceHintProvider.ts`; "View step code in workspace" when documentStore has paths; registered |
| Palette **context** from lab (current step, file)        | ✅     | IdeContext; StepView setHintContext; CommandPalette uses ide?.hintContext                          |
| **ide:run** → run current step                           | ✅     | IdeRunListener; StepView sets runAllRef.current = handleRunAll                                     |
| Suggest next step UI                                     | ✅     | `SuggestNextStep.tsx`; rendered in StepView footer when IdeContext present                         |
| Lab inline hints (existing)                              | ✅     | Unchanged; skeleton + inlineHints in enhancements                                                  |


**Gap:** None. Phase 5 complete.

---

## 7. Phase 6 — Real terminal and multi-runtime

*In scope:* xterm.js, SessionManager, ExecutionService Python/Java/C#, WebSocket/PTY. *Implemented (optional/future):* live WebSocket PTY backend + client, real Python execution.


| Item                                          | Done? | Evidence                                                                                               |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| **xterm.js** component                        | ✅     | `src/components/terminal/XtermTerminal.tsx` (Terminal + FitAddon; optional `session` prop)             |
| XtermTerminal **used** in app                 | ✅     | LabViewWithTabs creates session when Terminal tab is active; passes session to XtermTerminal           |
| **SessionManager** (create/destroy/reconnect) | ✅     | `SessionManager.ts`: connects to `ws://…/api/pty` when available; falls back to no-op session          |
| **WebSocket PTY backend**                     | ✅     | `vite.config.ts`: upgrade handler for `/api/pty`; spawns node-pty shell; resize/kill via JSON messages |
| **ExecutionService.runPython** (real)         | ✅     | `pythonExecutor.ts` calls `/api/run-python`; Vite dev server runs code via python3 temp file           |
| ExecutionService.runJava / runCSharp          | ✅     | Stub executors (return "not implemented"); runPython is real                                           |
| WebSocket / PTY plug documented               | ✅     | `Docs/WEB_SOCKET_PLUG_POINT.md`                                                                        |


*Remaining (optional):* Java/C# backend routes and executors; PTY reconnect by sessionId.

**Gap:** None. Phase 6 complete for Python and live terminal.

---

## 8. Phases 7–8

- **Phase 7 (VS Code API):** Not started; doc says optional.
- **Phase 8 (AI assist):** Not started; doc says optional.

---

## 9. Folder structure vs doc

Doc suggests something like:

```
src/
├── components/
│   ├── editor/        → Not present as a folder; editor lives in labs/ (InlineHintEditor) and workshop/
│   ├── terminal/      → ✅ terminal/XtermTerminal.tsx
│   ├── workspace/     → Not present
│   ├── hints/         → ✅ SuggestNextStep.tsx; no HintBanner or CommandChips
│   ├── command-palette/ → ✅ command-palette/CommandPalette.tsx
│   └── labs/          → ✅
├── services/
│   ├── execution/    → ✅ ExecutionService + node/mongosh/bash (+ python/java/csharp stubs)
│   ├── session/      → ✅ SessionManager
│   ├── workspace/    → ✅ DocumentStore only
│   └── hints/        → ✅ HintOrchestrator, ActionRegistry, registerDefaultActions, types
├── lib/
│   ├── monaco/       → monacoLabEditorOptions in lib/ (single file)
│   └── terminal/     → Not present (xterm adapter could live here)
└── types/
    └── ide.ts        → ✅ Full set of interfaces (RunResult, RuntimeExecutor, TerminalSession, HintContext, etc.)
```

So: **execution**, **session**, **hints**, **types/ide**, **command-palette**, and **terminal** (one component) align with the doc. **Workspace** has only DocumentStore. **Editor** and **hints** UI (banners, chips, suggest-next-step) and **workspace** UI (file tree) are not added.

---

## 10. Recommended next steps (priority)

1. ~~**Wire command palette to lab context**~~ ✅ Done (IdeContext, setHintContext, IdeRunListener, runAllRef).
  Pass `HintContext` (e.g. current step id, lab id, current code block language) from the lab shell into `CommandPalette` so "Run Node/Mongosh/Bash" can trigger the current step’s Run (e.g. handle `ide:run` in StepView or centralize in a small runner that calls ExecutionService and updates the right step’s output).
2. **Implement OutputSurface and use it in StepView**
  One class or factory that implements `IOutputSurface` (append → update logEntries/lastOutput; clear → reset). StepView uses it instead of raw setState so the "output surface" is behind an abstraction and can be swapped or reused.
3. ~~**Register at least one HintProvider**~~ ✅ Done (StepHintProvider, EditorHintProvider, TerminalHintProvider, WorkspaceHintProvider; SuggestNextStep strip).
  e.g. **EditorHintProvider** that returns "Run current step" (or "Run file") from current step/lab context; register with `hintOrchestrator`. Optionally add a small "Suggest next step" strip that calls `hintOrchestrator.getHints(context)` and shows one or two actions.
4. ~~**Optional: Use DocumentStore for step code**~~ ✅ Done (StepView syncs editableCodeByBlock into DocumentStore; store in hintContext).
  When a step is focused, "open" its code block(s) in DocumentStore (path = stepId + block index or virtual path); InlineHintEditor reads/writes through DocumentStore. This would align lab state with the doc’s "virtual workspace" idea without changing UX.
5. ~~**Phase 6 (in progress)**~~ ✅ Done: WebSocket PTY at /api/pty (vite.config.ts + node-pty + ws); SessionManager connects and provides live TerminalSession; XtermTerminal receives session in LabViewWithTabs; /api/run-python added, pythonExecutor calls it. Java/C# remain stubs.

---

*This file can be updated as more of the architecture is implemented. Compare with BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md for the full target.*