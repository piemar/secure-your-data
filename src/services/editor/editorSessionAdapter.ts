/**
 * Wraps a Monaco editor instance as IEditorSession. Phase 1 optional.
 * Use in InlineHintEditor onMount to expose session to StepView or other consumers.
 */
import type { IEditorSession } from '@/types/ide';

export type MonacoEditorLike = {
  getValue(): string;
  setValue(value: string): void;
  deltaDecorations?(oldDecorations: string[], newDecorations: unknown[]): string[];
  focus?(): void;
};

/**
 * Create an IEditorSession that delegates to the given Monaco editor instance.
 */
export function createEditorSession(editor: MonacoEditorLike): IEditorSession {
  let decorationIds: string[] = [];
  return {
    getContent() {
      return editor.getValue();
    },
    setContent(content: string) {
      editor.setValue(content);
    },
    setDecorations(decorations: unknown) {
      if (editor.deltaDecorations && Array.isArray(decorations)) {
        decorationIds = editor.deltaDecorations(decorationIds, decorations as unknown[]) ?? [];
      }
    },
    focus() {
      editor.focus?.();
    },
  };
}
