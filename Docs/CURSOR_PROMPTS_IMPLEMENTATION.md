# Cursor Prompts 1 & 2 — Implementation Summary

## Mongosh “editor” → inline Monaco (Lab Editor)

When you run mongosh in the lab **Terminal** tab and use `.edit()` (or any command that opens an editor), the app can use the **inline Monaco editor in the browser** instead of `vi`/`nano` in the terminal:

1. **Docker:** The image includes **nano** so `EDITOR` works even without the lab editor. The PTY is started with `EDITOR=nano` by default.
2. **Lab editor (optional):** If `scripts/lab-editor-wrapper.cjs` exists, the PTY is started with `EDITOR=node scripts/lab-editor-wrapper.cjs` and `LAB_EDITOR_SERVER_URL=http://127.0.0.1:<port>`. When mongosh invokes the editor:
   - The wrapper POSTs the file path and content to `/api/lab-editor-open`.
   - The frontend **LabEditorModal** polls `/api/lab-editor-pending` and opens a modal with Monaco when a request is pending.
   - You edit in the browser and click **Save** (or **Cancel** to keep the original); the app POSTs to `/api/lab-editor-save`, the server writes the file, and the wrapper exits so mongosh continues.

So you get “editor mode” in mongosh using the same inline editor as the lab steps, without needing `vi` in the container.

---

This document summarizes what was implemented from the two prompt files in `src/components/labs/`:

- **Cursor Prompt 1 — Refactor Inline Edit**: Editor → Terminal architecture in the same container.
- **Cursor Prompt 2 — Advanced Interactive**: Command palette (CMD+K), notebook cells, runtime actions.

---

## Prompt 1 — Refactor Inline Edit

### Implemented

- **TerminalContainer** (`src/components/labs/TerminalContainer.tsx`)
  - Shows either the inline editor or the terminal in the **same slot**.
  - State: `editing` | `running` | `terminal`.
  - Exposes a ref with `switchToTerminalAndRun(code)`: parent can call this when the user clicks Run to switch to terminal and write code to the PTY.
  - "Edit again" button switches back to the editor.

- **EditorView** (`src/components/labs/EditorView.tsx`)
  - Wrapper for the editor content (Monaco) when in edit mode.

- **TerminalView** (`src/components/labs/TerminalView.tsx`)
  - Wraps `XtermTerminal` with a `TerminalSession` when in terminal mode.

- **useTerminalSession** (`src/components/labs/hooks/useTerminalSession.ts`)
  - Creates a PTY session lazily when switching to terminal mode.
  - `switchToTerminal(code)` switches view and writes code to the session.
  - Session is destroyed on unmount.

### Integration

- StepView does **not** yet wrap the editor in `TerminalContainer` by default (to avoid changing existing behaviour).
- To use: wrap the step editor area in `<TerminalContainer ref={containerRef}>{editorContent}</TerminalContainer>` and on Run call `containerRef.current?.switchToTerminalAndRun(editorCode)` to get the "editor becomes terminal" flow.
- Backend: existing WebSocket at `/api/pty` and `SessionManager` are used; no `child_process.exec` — session uses node-pty on the server when available.

### Layout (as in prompt)

```
TerminalContainer
 ├─ EditorView   (when mode === 'editing')
 └─ TerminalView (when mode === 'terminal' or 'running')
```

---

## Prompt 2 — Advanced Interactive

### Implemented

- **Command palette — CMD+K**
  - In addition to **Cmd+Shift+P** / **Ctrl+Shift+P**, the command palette now opens with **Cmd+K** / **Ctrl+K** (`CommandPalette.tsx`).

- **New palette actions** (in `registerDefaultActions.ts`):
  - **Run Cell** — dispatches `ide:run-cell`
  - **Open Terminal** — dispatches `ide:open-terminal`
  - **Switch Runtime** — dispatches `ide:switch-runtime`
  - **Clear Output** — dispatches `ide:clear-output`
  - **Restart Runtime** — dispatches `ide:restart-runtime`

- **Notebook components** (scaffolding)
  - `Notebook.tsx` — container for multiple cells.
  - `NotebookCell.tsx` — single cell: edit → run → output.
  - `CellOutput.tsx` — inline output below the cell.
  - Exported from `src/components/labs/notebook/index.ts`.

### Not implemented (future)

- Monaco placeholders as snippets (tab navigation, hint text).
- Inline hints as suggestion lines (e.g. "suggestion: GET /users").
- Autocomplete for shell/filesystem/variables (Monaco completion providers).
- Multi-language runtime manager (Bash, Python, Node, Java, C#) with containers.
- Sandboxing (Docker, CPU/memory limits).
- Streaming output over WebSocket for run endpoints.
- Runtime persistence (e.g. Python `x = 5` across cells).
- `runtimeManager.ts` service and backend container runner.
- xterm addons: search, web-links (can be added to existing `XtermTerminal`).

---

## Files touched / added

| Path | Action |
|------|--------|
| `src/components/labs/TerminalContainer.tsx` | Added |
| `src/components/labs/EditorView.tsx` | Added |
| `src/components/labs/TerminalView.tsx` | Added |
| `src/components/labs/hooks/useTerminalSession.ts` | Added |
| `src/components/labs/notebook/Notebook.tsx` | Added |
| `src/components/labs/notebook/NotebookCell.tsx` | Added |
| `src/components/labs/notebook/CellOutput.tsx` | Added |
| `src/components/labs/notebook/index.ts` | Added |
| `src/components/command-palette/CommandPalette.tsx` | CMD+K shortcut |
| `src/services/hints/registerDefaultActions.ts` | Run Cell, Open Terminal, etc. |

---

## References

- Prompt 1: `src/components/labs/# Cursor Prompt 1 — Refactor Inline Edit`
- Prompt 2: `src/components/labs/# Cursor Prompt 2 — Advanced Interactive.md`
- Architecture: `Docs/BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md`
