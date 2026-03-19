import { useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { InlineHint } from '@/lib/types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  hints?: InlineHint[];
  revealedHints?: Set<number>;
  onRevealHint?: (index: number) => void;
}

export function CodeEditor({ value, onChange, language = 'javascript', readOnly = false, hints = [], revealedHints = new Set(), onRevealHint }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Update inline hint decorations whenever value, hints, or revealedHints change
  useEffect(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco || hints.length === 0) return;

    const model = ed.getModel();
    if (!model) return;

    const newDecorations: editor.IModelDeltaDecoration[] = [];
    const content = model.getValue();
    const lines = content.split('\n');

    // Find all ___BLANK___ markers in the code
    lines.forEach((lineContent, lineIdx) => {
      const blankRegex = /___BLANK___/g;
      let match;
      while ((match = blankRegex.exec(lineContent)) !== null) {
        // Find corresponding hint
        const hintIndex = hints.findIndex((h, i) => {
          // Match by line proximity and blank marker
          const hintLine = h.line - 1; // Convert to 0-based
          return Math.abs(hintLine - lineIdx) <= 2 && h.blankText === '___BLANK___' && !newDecorations.some(d => d.range.startLineNumber === lineIdx + 1 && d.range.startColumn === match!.index + 1);
        });

        // Highlight the blank marker
        newDecorations.push({
          range: new monaco.Range(lineIdx + 1, match.index + 1, lineIdx + 1, match.index + 12),
          options: {
            inlineClassName: 'blank-marker-highlight',
            hoverMessage: { value: '**💡 Click a hint in the panel to fill this in**' },
          },
        });
      }
    });

    // Add revealed hint annotations as inline after-content
    hints.forEach((hint, i) => {
      if (revealedHints.has(i) && hint.answer) {
        // Find the line with ___BLANK___ near this hint's line
        const targetLine = Math.min(hint.line, lines.length);
        if (targetLine > 0 && targetLine <= lines.length) {
          newDecorations.push({
            range: new monaco.Range(targetLine, 1, targetLine, 1),
            options: {
              after: {
                content: ` 💡 ${hint.answer}`,
                inlineClassName: 'hint-answer-inline',
              },
              isWholeLine: false,
            },
          });
        }
      }
    });

    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, newDecorations);
  }, [value, hints, revealedHints]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define MongoDB/mongosh theme
    monaco.editor.defineTheme('heist-terminal', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '3d6b59', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00ED64' },
        { token: 'string', foreground: '7dc97d' },
        { token: 'number', foreground: '8B5CF6' },
        { token: 'type', foreground: '00ED64' },
        { token: 'function', foreground: '5ce6a1' },
        { token: 'variable', foreground: 'b8e6cc' },
        { token: 'operator', foreground: '00ED64' },
      ],
      colors: {
        'editor.background': '#061a14',
        'editor.foreground': '#b8e6cc',
        'editor.lineHighlightBackground': '#0a2e22',
        'editor.selectionBackground': '#00ED6430',
        'editorLineNumber.foreground': '#2d5c47',
        'editorLineNumber.activeForeground': '#00ED64',
        'editorCursor.foreground': '#00ED64',
        'editor.inactiveSelectionBackground': '#00ED6415',
        'editorIndentGuide.background': '#1a3d2e',
        'editorIndentGuide.activeBackground': '#2d5c47',
        'editorWidget.background': '#0a2218',
        'editorWidget.border': '#1a3d2e',
        'input.background': '#0a2218',
        'input.border': '#1a3d2e',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#00ED6420',
        'scrollbarSlider.hoverBackground': '#00ED6440',
        'scrollbarSlider.activeBackground': '#00ED6460',
      },
    });

    monaco.editor.setTheme('heist-terminal');

    // Add MongoDB/mongosh completions
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          'db', 'find', 'findOne', 'insertOne', 'insertMany', 'updateOne', 'updateMany',
          'deleteOne', 'deleteMany', 'aggregate', 'createIndex', 'explain',
          'sh.status', 'sh.enableSharding', 'sh.shardCollection', 'sh.moveChunk', 'sh.addShard',
          'rs.status', 'rs.conf', 'rs.initiate',
          '$match', '$group', '$sort', '$project', '$unwind', '$lookup', '$facet',
          '$merge', '$out', '$sum', '$avg', '$count', '$min', '$max',
          '$elemMatch', '$and', '$or', '$gte', '$lte', '$gt', '$lt',
          'collMod', 'validator', '$jsonSchema', 'bsonType',
          'retryWrites', 'retryReads', 'maxPoolSize', 'serverSelectionTimeoutMS',
          'MongoClient', 'ClientEncryption', 'createDataKey', 'autoEncryption',
          '$vectorSearch', '$dateTrunc', 'timeseries', '$rename', '$unset', '$exists', '$type',
        ].map(label => ({
          label,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: label,
          range,
        }));

        return { suggestions };
      },
    });
  }, []);

  return (
    <div className="h-full w-full rounded-b-lg overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v || '')}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true },
          suggest: { showKeywords: true },
          tabSize: 2,
          glyphMargin: true,
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-[#061a14]">
            <span className="font-mono text-xs text-primary animate-pulse">LOADING TERMINAL...</span>
          </div>
        }
      />
    </div>
  );
}
