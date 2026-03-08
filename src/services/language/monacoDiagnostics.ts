/**
 * Wire DiagnosticsProvider to Monaco model markers. Phase 4.
 * Call when editor model is ready; re-run when path or provider changes.
 */
import type { editor } from 'monaco-editor';
import type { DiagnosticsProvider, Diagnostic } from '@/types/ide';

const SOURCE = 'lab-diagnostics';

export async function applyDiagnosticsToModel(
  monaco: typeof import('monaco-editor'),
  model: editor.ITextModel,
  provider: DiagnosticsProvider,
  path: string
): Promise<void> {
  const diagnostics = await provider.getDiagnostics(path);
  const markers: editor.IMarkerData[] = diagnostics.map((d: Diagnostic) => ({
    severity: d.severity === 'error' ? monaco.MarkerSeverity.Error
      : d.severity === 'warning' ? monaco.MarkerSeverity.Warning
      : monaco.MarkerSeverity.Info,
    startLineNumber: d.line,
    startColumn: d.column ?? 1,
    endLineNumber: d.line,
    endColumn: d.column ?? 1,
    message: d.message,
  }));
  monaco.editor.setModelMarkers(model, SOURCE, markers);
}

/**
 * Clear diagnostics from a model (e.g. on unmount).
 */
export function clearDiagnosticsFromModel(
  monaco: typeof import('monaco-editor'),
  model: editor.ITextModel
): void {
  monaco.editor.setModelMarkers(model, SOURCE, []);
}
