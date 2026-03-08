/**
 * Diagnostics provider abstraction. Phase 4.
 * Implementations: none (MVP), from-backend (linter), or LSP.
 */
import type { Diagnostic, DiagnosticsProvider } from '@/types/ide';

export type { Diagnostic, DiagnosticsProvider };

/** MVP: no diagnostics. */
export const noopDiagnosticsProvider: DiagnosticsProvider = {
  getDiagnostics: () => Promise.resolve([]),
};
