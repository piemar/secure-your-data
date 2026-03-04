import type { editor } from 'monaco-editor';

/** Background matching app dark theme (--background: 220 13% 5%) */
const LAB_EDITOR_BACKGROUND_DARK = '#0c0e12';
/** Background matching app light theme (--background: 0 0% 98%) */
const LAB_EDITOR_BACKGROUND_LIGHT = '#fafafa';

/** Dark green for comments in light theme – readable on white (vs default light green) */
const LAB_LIGHT_COMMENT = '#1e6b34';
/** Dark orange-brown for strings in light theme – better contrast */
const LAB_LIGHT_STRING = '#af4a0d';

/**
 * Define custom Monaco themes that match the app's dark and light backgrounds.
 * Light theme overrides comment and string colors for clear contrast on white.
 * Call from Editor beforeMount so all lab editors can use either theme.
 */
export function defineLabDarkTheme(monaco: typeof import('monaco-editor')) {
  monaco.editor.defineTheme('lab-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.control.mongosh', foreground: '4EC9B0', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': LAB_EDITOR_BACKGROUND_DARK,
    },
  });
  monaco.editor.defineTheme('lab-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.control.mongosh', foreground: '0d652d', fontStyle: 'bold' },
      { token: 'comment', foreground: LAB_LIGHT_COMMENT },
      { token: 'comment.line', foreground: LAB_LIGHT_COMMENT },
      { token: 'comment.block', foreground: LAB_LIGHT_COMMENT },
      { token: 'string', foreground: LAB_LIGHT_STRING },
    ],
    colors: {
      'editor.background': LAB_EDITOR_BACKGROUND_LIGHT,
    },
  });
}

/**
 * Register the "mongosh" language so Monaco can use it for syntax highlighting.
 * Mongosh is JavaScript + shell helpers; we use JavaScript highlighting and add
 * theme rules so shell keywords (show, use, exit, help) are colored distinctly.
 * Call from Editor beforeMount once.
 */
export function registerMongoshLanguage(monaco: typeof import('monaco-editor')) {
  try {
    monaco.languages.register({ id: 'mongosh' });
    monaco.languages.setMonarchTokensProvider('mongosh', {
      defaultToken: 'source.js',
      tokenPostfix: '.js',
      keywords: [
        'break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function',
        'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void',
        'while', 'with', 'const', 'let', 'async', 'await', 'yield', 'class', 'extends', 'super', 'import',
        'export', 'from', 'as', 'of', 'true', 'false', 'null', 'undefined',
      ],
      tokenizer: {
        root: [
          [/\b(show|use|exit|quit|help|it|rs|sh)\b/, 'keyword.control.mongosh'],
          [/[a-zA-Z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          [/["](?:[^"\\]|\\.)*["]/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/[{}()\[\]]/, '@brackets'],
          [/[.,;]/, 'delimiter'],
          [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
          [/\s+/, 'white'],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment'],
        ],
      },
    });
  } catch (_) {
    // If registration fails, editor will fall back to no highlighting; InlineHintEditor maps mongosh → javascript
  }
}

/**
 * Theme name for dark lab editors (matches app dark background).
 * Use with <Editor theme={...} /> and defineLabDarkTheme(monaco) in beforeMount.
 */
export const LAB_EDITOR_THEME_DARK = 'lab-dark';

/**
 * Theme name for light lab editors (matches app light background).
 */
export const LAB_EDITOR_THEME_LIGHT = 'lab-light';

/**
 * Resolve lab editor theme from next-themes resolved theme.
 * Use: theme={getLabEditorTheme(resolvedTheme)} with resolvedTheme from useTheme().
 */
export function getLabEditorTheme(resolvedTheme: string | undefined): string {
  return resolvedTheme === 'light' ? LAB_EDITOR_THEME_LIGHT : LAB_EDITOR_THEME_DARK;
}

/** @deprecated Use getLabEditorTheme(resolvedTheme) or LAB_EDITOR_THEME_DARK for dark-only. */
export const LAB_EDITOR_THEME = LAB_EDITOR_THEME_DARK;

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
