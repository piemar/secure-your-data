import type { editor } from 'monaco-editor';

/** Background matching app theme (--background: 220 13% 5% → dark) */
const LAB_EDITOR_BACKGROUND = '#0c0e12';

/**
 * Define a custom Monaco theme that matches the app's dark background.
 * Call from Editor beforeMount so all lab editors use the same background.
 */
export function defineLabDarkTheme(monaco: typeof import('monaco-editor')) {
  monaco.editor.defineTheme('lab-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': LAB_EDITOR_BACKGROUND,
    },
  });
}

/**
 * Theme name to use for lab editors (matches app background).
 * Use with <Editor theme={LAB_EDITOR_THEME} /> and defineLabDarkTheme(monaco) in beforeMount.
 */
export const LAB_EDITOR_THEME = 'lab-dark';

/**
 * Shared Monaco Editor options for lab and playground editors.
 * Enables code completion (IntelliSense), consistent look, and a framework-like
 * experience so suggestions, parameter hints, and trigger characters work.
 */
export const MONACO_LAB_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 10,
  lineNumbers: 'on',
  lineNumbersMinChars: 2,
  scrollBeyondLastLine: true,
  wordWrap: 'on',
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 6, bottom: 48 },
  folding: true,
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  // Code completion (IntelliSense)
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: 'matchingDocuments',
  parameterHints: { enabled: true, cycle: true },
  suggest: {
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showSnippets: true,
    showIcons: true,
    showStatusBar: true,
    preview: true,
    previewMode: 'subword',
    insertMode: 'insert',
  },
};

/**
 * Base options for a read-only lab editor (e.g. competitor panel).
 * Keeps completion/hover but disables editing.
 */
export function getReadOnlyLabOptions(
  overrides?: Partial<editor.IStandaloneEditorConstructionOptions>
): editor.IStandaloneEditorConstructionOptions {
  return {
    ...MONACO_LAB_EDITOR_OPTIONS,
    readOnly: true,
    domReadOnly: true,
    ...overrides,
  };
}

/**
 * Base options for an editable lab/playground editor with full IntelliSense.
 */
export function getEditableLabOptions(
  overrides?: Partial<editor.IStandaloneEditorConstructionOptions>
): editor.IStandaloneEditorConstructionOptions {
  return {
    ...MONACO_LAB_EDITOR_OPTIONS,
    readOnly: false,
    ...overrides,
  };
}
