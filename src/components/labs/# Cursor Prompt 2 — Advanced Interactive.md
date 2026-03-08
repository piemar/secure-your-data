# Cursor Prompt 2 — Advanced Interactive Runtime

Extend the Monaco + xterm architecture to support an advanced interactive execution environment similar to Replit, Jupyter, and VS Code Web.

The system should allow users to:

* write commands or scripts inline
* receive inline hints and placeholders
* run multiple languages
* stream output in real time
* run individual notebook cells
* interact with a terminal

---

# Execution Modes

## Mode 1 — Inline Script Execution

User writes commands:

```
echo "hello"
ls -la
```

Click **Run** → code executes → terminal opens → output streams.

## Mode 2 — Notebook Cells

Support multiple code blocks.

Example:

```
Cell 1
 echo hello

Cell 2
 python script.py

Cell 3
 curl api
```

Each cell should run independently.

## Mode 3 — Interactive Terminal

Users open a full shell session and interact directly with bash.

---

# Editor Enhancements

Upgrade Monaco editor configuration.

## Placeholders

Example:

```
echo {{message}}
curl {{url}}
```

Requirements:

* visually distinct
* tab navigation
* optional hint text

Use Monaco snippet functionality.

## Inline Hints

Example concept:

```
curl https://api.example.com
         suggestion: GET /users
```

Hints may include:

* command documentation
* API hints
* syntax suggestions

## Autocomplete

Autocomplete should support:

### Shell Commands

```
git
npm
docker
kubectl
```

### Filesystem

```
./src
./scripts
```

### Variables

```
$USER
$PATH
```

Use Monaco completion providers.

---

# Multi‑Language Runtime

System must support execution of:

```
bash
python
node
java
csharp
```

Language detection methods:

* shebang
* cell prefix
* file extension

Example:

```
#!/usr/bin/env python
```

or

```
%%python
```

---

# Runtime Architecture

Implement runtime manager.

```
Runtime Manager
 ├ Bash Runtime (node‑pty)
 ├ Python Runtime (container)
 ├ Node Runtime (vm sandbox)
 ├ Java Runtime (container)
 └ C# Runtime (container)
```

---

# Sandboxing

Execution must be sandboxed using containers.

Recommended approach:

Docker containers.

Architecture:

```
Browser
 ↓
Execution API
 ↓
Runtime Manager
 ↓
Container Sandbox
```

Container restrictions:

* CPU limits
* memory limits
* network restrictions
* execution timeout

---

# Streaming Output

All runtimes must stream:

* stdout
* stderr
* logs

Use WebSocket transport.

---

# Notebook Architecture

Add components:

```
components/
  Notebook.tsx
  NotebookCell.tsx
  CellOutput.tsx
```

Cell lifecycle:

```
edit → run → output → rerun
```

UI example:

```
+----------------------+
| code cell            |
| echo hello           |
| [Run]                |
+----------------------+
| output               |
| hello                |
+----------------------+
```

---

# Inline Output

Cell output should appear directly below the cell.

Example:

```
Cell
print("hello")

Output
hello
```

---

# Command Palette

Add simple command palette.

Shortcut:

CMD + K

Commands:

* Run Cell
* Open Terminal
* Switch Runtime
* Clear Output
* Restart Runtime

---

# Runtime Persistence

Runtimes must maintain session state.

Example:

```
Cell 1
x = 5

Cell 2
print(x)
```

Python runtime should remember variables.

---

# Execution Manager

Add service:

```
services/
  runtimeManager.ts
```

Responsibilities:

* start runtimes
* route execution
* manage sessions
* manage container lifecycle

---

# Security Requirements

Execution must enforce:

* execution timeout
* memory limits
* filesystem isolation
* restricted networking

---

# Terminal Improvements

Enhance xterm with:

* command history
* copy paste
* search
* resize
* ANSI color support

Add addons:

```
xterm-addon-search
xterm-addon-web-links
```

---

# Final Component Architecture

```
components/
  TerminalContainer.tsx
  InlineEditor.tsx
  TerminalView.tsx
  Notebook.tsx
  NotebookCell.tsx
  CellOutput.tsx

hooks/
  useRuntimeSession.ts
  useTerminal.ts

services/
  runtimeManager.ts
  terminalSocket.ts

server/
  runtimeManager.ts
  containerRunner.ts
  websocketServer.ts
```

---

# Implementation Quality

Code must be:

* TypeScript
* modular
* well commented
* extensible

Avoid shortcuts.

---

# Expected Result

Final system should support:

* inline script execution
* streaming terminal
* notebook style execution
* multi‑language runtimes
* sandboxed execution

Architecture should resemble modern browser IDE platforms such as Replit, VS Code Web, and Jupyter.
