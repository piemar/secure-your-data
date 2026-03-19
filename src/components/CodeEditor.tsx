import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { InlineHint } from '@/lib/types';
import { InlineHintMarker } from './InlineHintMarker';

interface BlankPosition {
  lineNumber: number;  // 1-based line where ___BLANK___ currently lives
  hintIndex: number;   // sequential index into hints array
  pixelY: number;      // vertical pixel offset (scroll-aware)
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
  const [gutterWidth, setGutterWidth] = useState(0);

  // Scan content for ___BLANK___ markers and compute gutter-aligned Y positions
  const updateBlankPositions = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || hints.length === 0) {
      setBlankPositions([]);
      return;
    }

    const model = ed.getModel();
    if (!model) return;

    // Get gutter width from layout info
    const layoutInfo = ed.getLayoutInfo();
    const glyphMarginWidth = layoutInfo.glyphMarginWidth || 0;
    const lineNumbersWidth = layoutInfo.lineNumbersWidth || 0;
    setGutterWidth(glyphMarginWidth + lineNumbersWidth);

    const content = model.getValue();
    const lines = content.split('\n');
    const positions: BlankPosition[] = [];
    let blankCount = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineContent = lines[lineIdx];
      if (!lineContent.includes('___BLANK___')) continue;

      // Count all blanks on this line
      const blankRegex = /___BLANK___/g;
      let match;
      while ((match = blankRegex.exec(lineContent)) !== null) {
        const hintIndex = blankCount;
        blankCount++;

        if (hintIndex >= hints.length) break;

        // Skip if answer already shown (blank was replaced)
        const state = hintStates.get(hintIndex) || 'unrevealed';
        if (state === 'answer-shown') continue;

        // Get the Y pixel position for this line (scroll-aware)
        const lineNumber = lineIdx + 1;
        const pos = ed.getScrolledVisiblePosition({ lineNumber, column: 1 });

        if (pos) {
          positions.push({
            lineNumber,
            hintIndex,
            pixelY: pos.top + 9, // center vertically (~18px line height)
          });
        }
      }
    }

    setBlankPositions(positions);
  }, [hints, hintStates]);

  // Re-scan positions on every content change, scroll, or layout change
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    updateBlankPositions();

    const scrollDisposable = ed.onDidScrollChange(() => updateBlankPositions());
    const layoutDisposable = ed.onDidLayoutChange(() => updateBlankPositions());
    const contentDisposable = ed.onDidChangeModelContent(() => updateBlankPositions());

    return () => {
      scrollDisposable.dispose();
      layoutDisposable.dispose();
      contentDisposable.dispose();
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
            hoverMessage: { value: '**💡 Click the ? in the gutter to get a hint**' },
          },
        });
      }
    });

    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, newDecorations);
  }, [value]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

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

    // Initial position calculation after mount
    setTimeout(() => updateBlankPositions(), 150);
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

      {/* Gutter-aligned hint markers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {blankPositions.map((pos) => (
          <InlineHintMarker
            key={`hint-${pos.hintIndex}`}
            hint={hints[pos.hintIndex]}
            index={pos.hintIndex}
            state={hintStates.get(pos.hintIndex) || 'unrevealed'}
            onRevealHint={onRevealHint || (() => {})}
            onRevealAnswer={onRevealAnswer || (() => {})}
            style={{
              left: `${Math.max(4, gutterWidth - 22)}px`,
              top: `${pos.pixelY}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
