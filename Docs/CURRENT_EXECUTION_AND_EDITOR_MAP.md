# Current execution and editor map

**Purpose:** Phase 0 deliverable for the browser IDE refactor. Precise map of where execution and editor usage live so refactoring does not miss code paths.

**See:** [BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md](./BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md) Phase 0.

---

## 1. Execution API usage

### Call sites

| API | File | Location | Trigger |
|-----|------|----------|---------|
| `/api/run-mongosh` | `src/components/labs/StepView.tsx` | ~1386, ~1479, ~1577 | `handleRunBlock`: explicit mongosh block or JS with db./.aggregate/$search; `handleRunAll`: mongosh block in slot |
| `/api/run-node` | `src/components/labs/StepView.tsx` | ~1434, ~1495, ~1614, ~1629 | `handleRunBlock`: node-like JS or bash slot with node file substitution; `handleRunAll`: same |
| `/api/run-bash` | `src/components/labs/StepView.tsx` | ~1425, ~1455, ~1609, ~1622 | `handleRunBlock`: bash/shell block (with optional before-node commands); `handleRunAll`: bash block |

**Backend (Vite middleware):** `vite.config.ts` — `run-bash` ~1661, `run-node` ~1732, `run-mongosh` ~1839. All POST; response JSON: `stdout`, `stderr`, `exitCode`, `success`, `message`.

**No other callers** of `/api/run-*` in the repo (only StepView and docs/README references).

### Run triggers

| Trigger | Component | Handler | Notes |
|---------|-----------|---------|--------|
| Run single block | StepView | `handleRunBlock(blockIdx)` | Per-slot "Run" button (icon) on code block |
| Run all | StepView | `handleRunAll()` | "Run all" / "Run selection" button in editor panel; runs display slots in order (node+mongosh uses active tab) |
| Check progress | StepView | `handleCheckProgress()` | After Run all when step has `verificationId` or `onVerify`; calls verification API, not run-* |

**CodePlayground** (`src/components/workshop/CodePlayground.tsx`): has `handleRun` but uses **simulated output** only (no `/api/run-*`). Used in workshop flow, not lab steps.

---

## 2. Monaco editor mounts

| Component | File | What it renders | Options / theme |
|-----------|------|-----------------|------------------|
| InlineHintEditor | `src/components/labs/InlineHintEditor.tsx` | `@monaco-editor/react` Editor | `MONACO_LAB_EDITOR_OPTIONS`, `getLabEditorTheme()`, `defineLabDarkTheme`, `registerMongoshLanguage` from `@/lib/monacoLabEditorOptions` |
| StepView | `src/components/labs/StepView.tsx` | Renders one or more InlineHintEditor per step (per code block in display slots) | Same; passes skeleton/full code, inlineHints, tier, revealed state |
| CodePlayground | `src/components/workshop/CodePlayground.tsx` | Single Monaco Editor for short snippets | Uses same lab options/themes |

**Single source of editor config:** `src/lib/monacoLabEditorOptions.ts` — `MONACO_LAB_EDITOR_OPTIONS`, theme (lab-dark / lab-light), custom `mongosh` language (Monarch).

**No** shared document model or EditorManager; each step owns editor state via `editableCodeByBlock`, `skeletonTier`, `showSolution` in StepView.

---

## 3. Output surface

| Location | State | Component |
|----------|--------|-----------|
| StepView | `logEntries`, `lastOutput`, `outputSummary`, `outputSuccess`, `lastOutputTime` | Console panel (collapsible): `consoleOutputScrollRef`, lines from `logEntries`, summary badge (✓/✗ + outputSummary) |
| StepView | `appendRunOutput(output, summary, success)` → sets lastOutput, appends to logEntries, updates summary/success; `setLogEntries`, `setLastOutput`, etc. | Used after run-block and run-all; also for verification result message |
| Persistence | `loadLabWorkspace` / `saveLabWorkspace` — `logEntriesByStep[currentStepIndex]` | Stored in lab workspace (userEmail, labNumber); loaded on step focus so each step shows only its own output |

**No** xterm.js or real terminal; output is append-only log with timestamped entries.

---

## 4. Validation / check progress

| Mechanism | Location | Dependency on run output |
|-----------|----------|---------------------------|
| `verificationId` | Step enhancement metadata | VerificationService runs **separate** verification (e.g. bridge, API). Not driven by run output content; step may require "run first" by instructions only. |
| `onVerify` | Step callback (e.g. custom verify function) | Can use lab context (URI, step index); may read workspace or run verification script. |
| Check progress button | StepView calls `handleCheckProgress` | Runs verification (VerificationService or onVerify); result message is appended via same output surface (`appendRunOutput` with context line only for encryption-related verification). |

Verification is **separate** from run: run produces stdout/stderr in console; check progress produces a validation message in the same console. Next step enabled when `stepValidatedSuccessByIndex[currentStepIndex] === true`.

---

## 5. Summary for refactor

- **Execution:** ~~All real execution goes through StepView~~ **Done:** All run requests go through `ExecutionService` (`src/services/execution`). StepView calls `executionService.runNode`, `runMongosh`, `runBash`; no direct `fetch('/api/run-*')` in UI.
- **Output:** Single surface in StepView (logEntries + lastOutput + summary/success). Introduce `OutputSurface` abstraction (append, clear, markSuccess/markFail) and one implementation that updates this state (and persistence).
- **Editor:** All Monaco usage behind InlineHintEditor (and CodePlayground). Optionally wrap in `EditorSession`/`EditorInstance`; consolidate options in one module (already largely in monacoLabEditorOptions).
- **Validation:** Leave as-is for Phase 1–2; execution and output abstractions do not change verification flow.
