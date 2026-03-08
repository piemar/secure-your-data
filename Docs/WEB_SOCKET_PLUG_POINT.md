# WebSocket plug point for PTY / terminal (Phase 6)

**Purpose:** Document where a WebSocket client would plug in to enable a real in-browser terminal (xterm.js + backend PTY). See [BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md](./BROWSER_IDE_TERMINAL_REFACTOR_ARCHITECTURE.md) Phase 6.

## Current state

- **Frontend:** `src/components/terminal/XtermTerminal.tsx` renders an xterm.js terminal; it accepts `onData(data: string)` to send input somewhere. It is rendered in the lab view under a "Terminal" tab (no live session yet).
- **Session lifecycle:** `src/services/session/SessionManager.ts` provides `createSession()`, `getSession(id)`, `destroySession(id)`. The implementation is a **placeholder**: `createSession()` returns a no-op `TerminalSession` (write/resize/kill/onData/onClose are no-ops).
- **Execution:** `ExecutionService` (runNode, runMongosh, runBash, runPython, runJava, runCSharp) uses **HTTP** request/response to `/api/run-*`. No streaming.

## Where WebSocket plugs in

1. **Backend**
   - Add a WebSocket endpoint (e.g. `/api/pty` or `/ws/pty`) that:
     - Accepts a new connection and optionally a `sessionId` (for reconnect).
     - Spawns a PTY (e.g. via `node-pty`) and stores it in a `Map<sessionId, pty>`.
     - Streams PTY stdout/stderr to the client over the WebSocket.
     - Receives client messages (input, resize, kill) and writes to the PTY or calls `pty.resize()` / `pty.kill()`.
   - Reconnect: if client sends `sessionId`, look up existing PTY and reattach; if not found, return error so client creates a new session.

2. **Frontend – SessionManager**
   - Replace the placeholder in `SessionManager.ts` with an implementation that:
     - Calls the backend WebSocket URL (e.g. `ws://.../api/pty`).
     - Sends "create" or "reconnect" + sessionId.
     - Returns a `TerminalSession` whose:
       - `write(data)` sends data over the WebSocket to the backend (backend writes to PTY).
       - `resize(cols, rows)` sends a resize message; backend calls `pty.resize(cols, rows)`.
       - `kill()` sends a kill message; backend calls `pty.kill()`.
       - `onData(cb)` / `onClose(cb)` register listeners for messages received from the WebSocket (stdout/stderr and close events).
   - SessionManager remains the single place that "creates" or "reconnects" a session; the WebSocket client lives inside this implementation.

3. **Frontend – XtermTerminal**
   - When a lab (or app) wants a live terminal:
     - Call `sessionManager.createSession()` (or reconnect with stored sessionId).
     - Pass the session’s `onData` output to XtermTerminal (so it can `term.write(data)`), and pass `session.write` as `onData` to XtermTerminal (so keypresses go to the session).
   - No change to XtermTerminal’s public API; it already has `onData`. The parent connects SessionManager’s session to XtermTerminal’s props.

4. **ExecutionService**
   - ExecutionService stays HTTP-based for "run code block" (run-node, run-mongosh, etc.). The WebSocket is only for the **interactive terminal** (shell). Optional: a "run in terminal" action could send a command to the active session via `session.write(command + '\n')` instead of calling ExecutionService.

## Summary

| Layer           | Current                    | Plug point for Phase 6                                      |
|----------------|----------------------------|------------------------------------------------------------|
| Backend        | No PTY WebSocket           | Add `/api/pty` (or similar) WebSocket server + node-pty    |
| SessionManager | No-op TerminalSession      | Implement create/reconnect with WebSocket client           |
| XtermTerminal  | Local echo / placeholder   | Parent wires session’s write/onData to XtermTerminal props |
| ExecutionService | HTTP only                | Unchanged; terminal is separate channel                   |
