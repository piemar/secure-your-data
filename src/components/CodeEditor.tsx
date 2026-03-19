import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language = 'javascript', readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

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
      provideCompletionItems: (model, position) => {
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
