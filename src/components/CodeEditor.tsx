import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { InlineHint } from '@/lib/types';
import { InlineHintMarker } from './InlineHintMarker';

interface BlankPosition {
  line: number;       // 1-based
  column: number;     // 1-based start of ___BLANK___
  hintIndex: number;  // index into hints array
  pixelX: number;
  pixelY: number;
}

type HintState = 'unrevealed' | 'hint-shown' | 'answer-shown';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  hints?: InlineHint[];
  hintStates?: Map<number, HintState>;
  onRevealHint?: (index: number) => void;
  onRevealAnswer?: (index: number) => void;
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  hints = [],
  hintStates = new Map(),
  onRevealHint,
  onRevealAnswer,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [blankPositions, setBlankPositions] = useState<BlankPosition[]>([]);

  // Scan for ___BLANK___ markers and compute pixel positions
  const updateBlankPositions = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || hints.length === 0) {
      setBlankPositions([]);
      return;
    }

    const model = ed.getModel();
    if (!model) return;

    const content = model.getValue();
    const lines = content.split('\n');
    const positions: BlankPosition[] = [];
    let blankCount = 0;

    lines.forEach((lineContent, lineIdx) => {
      const blankRegex = /___BLANK___/g;
      let match;
      while ((match = blankRegex.exec(lineContent)) !== null) {
        // Match blank to hint by sequential order
        const hintIndex = blankCount;
        blankCount++;

        if (hintIndex >= hints.length) return;

        // Get state - skip if answer already shown
        const state = hintStates.get(hintIndex) || 'unrevealed';
        if (state === 'answer-shown') return;

        // Get pixel position via Monaco API
        const lineNumber = lineIdx + 1;
        const column = match.index + 6; // center of ___BLANK___ (11 chars / 2)
        const pos = ed.getScrolledVisiblePosition({ lineNumber, column });

        if (pos) {
          // Get the editor's layout to account for content left offset (gutter + line numbers)
          const layoutInfo = ed.getLayoutInfo();
          const contentLeft = layoutInfo.contentLeft || 0;

          positions.push({
            line: lineNumber,
            column,
            hintIndex,
            pixelX: pos.left + contentLeft,
            pixelY: pos.top + 10, // vertically center on line (~18px line height / 2)
          });
        }
      }
    });

    setBlankPositions(positions);
  }, [hints, hintStates]);

  // Update positions on value/scroll changes
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    updateBlankPositions();

    const scrollDisposable = ed.onDidScrollChange(() => updateBlankPositions());
    const layoutDisposable = ed.onDidLayoutChange(() => updateBlankPositions());

    return () => {
      scrollDisposable.dispose();
      layoutDisposable.dispose();
    };
  }, [value, updateBlankPositions]);

  // Update blank highlight decorations
  useEffect(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;

    const model = ed.getModel();
    if (!model) return;

    const newDecorations: editor.IModelDeltaDecoration[] = [];
    const content = model.getValue();
    const lines = content.split('\n');

    lines.forEach((lineContent, lineIdx) => {
      const blankRegex = /___BLANK___/g;
      let match;
      while ((match = blankRegex.exec(lineContent)) !== null) {
        newDecorations.push({
          range: new monaco.Range(lineIdx + 1, match.index + 1, lineIdx + 1, match.index + 12),
          options: {
            inlineClassName: 'blank-marker-highlight',
            hoverMessage: { value: '**💡 Click the ? marker to get a hint**' },
          },
        });
      }
    });

    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, newDecorations);
  }, [value]);

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

    // Trigger initial position calculation after mount
    setTimeout(() => updateBlankPositions(), 100);
  }, [updateBlankPositions]);

  return (
    <div ref={containerRef} className="h-full w-full rounded-b-lg overflow-hidden relative">
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

      {/* Floating hint markers overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {blankPositions.map((pos) => (
          <InlineHintMarker
            key={`hint-${pos.hintIndex}-${pos.line}`}
            hint={hints[pos.hintIndex]}
            index={pos.hintIndex}
            state={hintStates.get(pos.hintIndex) || 'unrevealed'}
            onRevealHint={onRevealHint || (() => {})}
            onRevealAnswer={onRevealAnswer || (() => {})}
            style={{
              left: `${pos.pixelX}px`,
              top: `${pos.pixelY}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
