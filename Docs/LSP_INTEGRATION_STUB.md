# LSP integration stub (Phase 4 optional)

**Purpose:** Document where to plug in a Language Server Protocol (LSP) backend so Monaco can get diagnostics, completions, and other language features from a real language server.

## Current state

- **Monaco:** `InlineHintEditor` uses Monarch tokenizers (see `src/lib/monacoLabEditorOptions.ts`) and optional `documentPath` for diagnostics/completion.
- **Diagnostics:** `src/services/language/monacoDiagnostics.ts` provides `applyDiagnosticsToModel(monaco, model, provider, path)` and `clearDiagnosticsFromModel`. A no-op provider is used when no LSP is connected.
- **Completion:** `src/services/language/monacoCompletion.ts` registers empty completion providers for js/ts/mongosh/python/java/csharp as an extension point.
- **No LSP yet:** There is no WebSocket or stdio connection to a language server.

## Where to plug in LSP

1. **Monaco Language Client**
   - Use [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) (or similar) to connect Monaco to an LSP server.
   - Typical flow: create a `MonacoLanguageClient` with a transport (WebSocket or stdio). The client turns LSP messages (e.g. `textDocument/publishDiagnostics`, `textDocument/completion`) into Monaco API calls.

2. **Transport**
   - **WebSocket:** Run a small proxy in the Vite dev server (or a separate process) that spawns the language server (e.g. `pylsp`, `typescript-language-server`) and forwards LSP JSON-RPC between browser and server over WebSocket. The browser connects to `ws://.../api/lsp` (or a dedicated port).
   - **stdio:** Not directly from the browser; use a backend that runs the LSP server and exposes it via WebSocket to the client.

3. **Wiring in the app**
   - When an editor is created with a `documentPath`, optionally start or reuse an LSP client for that language (e.g. path `*.py` → Python LSP). Replace the no-op `DiagnosticsProvider` with one that returns diagnostics from the LSP client’s latest `publishDiagnostics` payload.
   - Register Monaco completion items from LSP `textDocument/completion` responses (monaco-languageclient does this when the client is connected).

4. **Files to touch**
   - `src/services/language/`: add an LSP client wrapper (e.g. `lspClient.ts`) that holds the WebSocket connection and exposes `getDiagnostics(uri)` and a way to feed completions into Monaco.
   - `src/components/labs/InlineHintEditor.tsx`: when `documentPath` is set and an LSP client exists for the document language, pass the LSP-backed diagnostics provider to `applyDiagnosticsToModel` instead of `noopDiagnosticsProvider`.
   - Backend: add `/api/lsp` WebSocket endpoint that spawns the appropriate language server and proxies LSP messages (or document this as a separate service).

## Summary

| Piece              | Current                         | Plug point                                      |
| ------------------ | ------------------------------- | ----------------------------------------------- |
| Diagnostics        | No-op provider per document     | LSP client → DiagnosticsProvider by URI         |
| Completion         | Empty Monaco providers          | LSP client → Monaco completion API             |
| Transport          | None                            | WebSocket proxy to language server process      |
| Monaco integration | applyDiagnosticsToModel + registerLabCompletionProviders | Swap no-op for LSP-backed provider when client exists |

No code in this repo currently starts an LSP server or uses monaco-languageclient; this doc is the stub for that work.
