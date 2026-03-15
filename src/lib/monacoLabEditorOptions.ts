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
 * C# token colors for lab-dark.
 * Same principle as mongosh: keywords/types/strings/comments/numbers + distinct color for method calls.
 * Method/function calls use a distinct color (DCDCAA) so they are visible; identifiers stay grey (D4D4D4).
 */
const LAB_DARK_CSHARP_RULES: Array<{ token: string; foreground: string; fontStyle?: string }> = [
  { token: 'keyword.control.mongosh', foreground: '4EC9B0', fontStyle: 'bold' },
  { token: 'type', foreground: '4EC9B0' },
  { token: 'type.cs', foreground: '4EC9B0' },
  { token: 'keyword', foreground: '569CD6' },
  { token: 'keyword.cs', foreground: '569CD6' },
  { token: 'string', foreground: 'CE9178' },
  { token: 'string.cs', foreground: 'CE9178' },
  { token: 'comment', foreground: '6A9955' },
  { token: 'comment.cs', foreground: '6A9955' },
  { token: 'comment.line', foreground: '6A9955' },
  { token: 'comment.block', foreground: '6A9955' },
  { token: 'number', foreground: 'B5CEA8' },
  { token: 'number.cs', foreground: 'B5CEA8' },
  { token: 'number.float', foreground: 'B5CEA8' },
  { token: 'number.float.cs', foreground: 'B5CEA8' },
  { token: 'entity.name.function', foreground: 'DCDCAA' },
  { token: 'entity.name.function.cs', foreground: 'DCDCAA' },
  { token: 'identifier', foreground: 'D4D4D4' },
  { token: 'identifier.cs', foreground: 'D4D4D4' },
  { token: 'delimiter', foreground: 'D4D4D4' },
  { token: 'delimiter.cs', foreground: 'D4D4D4' },
  { token: 'operator', foreground: 'D4D4D4' },
  { token: 'operator.cs', foreground: 'D4D4D4' },
  { token: '@brackets', foreground: 'D4D4D4' },
  { token: 'brackets.cs', foreground: 'D4D4D4' },
];

/** C# token colors for lab-light (readable on white); method calls in dark brown for contrast. */
const LAB_LIGHT_CSHARP_RULES: Array<{ token: string; foreground: string; fontStyle?: string }> = [
  { token: 'keyword.control.mongosh', foreground: '0d652d', fontStyle: 'bold' },
  { token: 'type', foreground: '0d652d' },
  { token: 'type.cs', foreground: '0d652d' },
  { token: 'keyword', foreground: '0000FF' },
  { token: 'keyword.cs', foreground: '0000FF' },
  { token: 'string', foreground: LAB_LIGHT_STRING },
  { token: 'string.cs', foreground: LAB_LIGHT_STRING },
  { token: 'comment', foreground: LAB_LIGHT_COMMENT },
  { token: 'comment.cs', foreground: LAB_LIGHT_COMMENT },
  { token: 'comment.line', foreground: LAB_LIGHT_COMMENT },
  { token: 'comment.block', foreground: LAB_LIGHT_COMMENT },
  { token: 'number', foreground: '098658' },
  { token: 'number.cs', foreground: '098658' },
  { token: 'number.float', foreground: '098658' },
  { token: 'number.float.cs', foreground: '098658' },
  { token: 'entity.name.function', foreground: '795E26' },
  { token: 'entity.name.function.cs', foreground: '795E26' },
  { token: 'identifier', foreground: '1f1f1f' },
  { token: 'identifier.cs', foreground: '1f1f1f' },
  { token: 'delimiter', foreground: '1f1f1f' },
  { token: 'delimiter.cs', foreground: '1f1f1f' },
  { token: 'operator', foreground: '1f1f1f' },
  { token: 'operator.cs', foreground: '1f1f1f' },
  { token: '@brackets', foreground: '1f1f1f' },
  { token: 'brackets.cs', foreground: '1f1f1f' },
];

/**
 * Define custom Monaco themes that match the app's dark and light backgrounds.
 * Includes C# token rules so the built-in C# language (language id "csharp") is colored correctly in the lab.
 * Call from Editor beforeMount so all lab editors can use either theme.
 */
export function defineLabDarkTheme(monaco: typeof import('monaco-editor')) {
  monaco.editor.defineTheme('lab-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: LAB_DARK_CSHARP_RULES,
    colors: {
      'editor.background': LAB_EDITOR_BACKGROUND_DARK,
    },
  });
  monaco.editor.defineTheme('lab-light', {
    base: 'vs',
    inherit: true,
    rules: LAB_LIGHT_CSHARP_RULES,
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

/** Languages supported by the lab (Monaco + registry). Phase 3 optional. */
export const MONACO_LAB_LANGUAGES = ['javascript', 'typescript', 'mongosh', 'bash', 'shell', 'python', 'java', 'csharp'] as const;

/**
 * Register Python language for syntax highlighting. Phase 3 optional.
 */
export function registerPythonLanguage(monaco: typeof import('monaco-editor')) {
  try {
    monaco.languages.register({ id: 'python' });
    monaco.languages.setMonarchTokensProvider('python', {
      defaultToken: '',
      tokenPostfix: '.py',
      keywords: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'],
      tokenizer: {
        root: [
          [/[a-zA-Z_][\w]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/\d+\.\d+/, 'number.float'],
          [/\d+/, 'number'],
          [/""".*"""/, 'string'],
          [/'''.*'''/, 'string'],
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/[{}()\[\]]/, '@brackets'],
          [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
          [/\s+/, 'white'],
        ],
      },
    });
  } catch (_) { /* ignore */ }
}

/**
 * Register Java language for syntax highlighting. Phase 3 optional.
 */
export function registerJavaLanguage(monaco: typeof import('monaco-editor')) {
  try {
    monaco.languages.register({ id: 'java' });
    monaco.languages.setMonarchTokensProvider('java', {
      defaultToken: '',
      tokenPostfix: '.java',
      keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'],
      tokenizer: {
        root: [
          [/[a-zA-Z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/\d+\.\d+[fFdD]?/, 'number.float'],
          [/\d+[lL]?/, 'number'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/"[^"]*"/, 'string'],
          [/'\\.'/, 'string'],
          [/[']/, 'string'],
          [/[{}()\[\];.,]/, '@brackets'],
          [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
          [/\s+/, 'white'],
        ],
        comment: [[/[^\/*]+/, 'comment'], [/\*\//, 'comment', '@pop'], [/[\/*]/, 'comment']],
      },
    });
  } catch (_) { /* ignore */ }
}

/**
 * Register shell (bash/sh) language with Monarch so tokenization runs synchronously at mount.
 * Avoids relying on Monaco's built-in shell (which can tokenize in a worker and paint wrong colors until scroll).
 */
export function registerShellLanguage(monaco: typeof import('monaco-editor')) {
  try {
    monaco.languages.register({ id: 'shell' });
    monaco.languages.setMonarchTokensProvider('shell', {
      defaultToken: '',
      tokenPostfix: '.sh',
      keywords: [
        'if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'while', 'do', 'done', 'case', 'esac',
        'echo', 'exit', 'return', 'export', 'readonly', 'local', 'function', 'true', 'false',
        'alias', 'unalias', 'cd', 'pwd', 'set', 'unset', 'read', 'exec', 'eval', 'shift',
        'break', 'continue', 'test', '[', ']', 'source', '.',
      ],
      tokenizer: {
        root: [
          [/#.*$/, 'comment'],
          [/\$[\w]+/, 'variable'],
          [/\$\{[^}]+\}/, 'variable'],
          [/"(?:[^"\\]|\\.)*"/, 'string'],
          [/'[^']*'/, 'string'],
          [/[a-zA-Z_][\w]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/\d+/, 'number'],
          [/[=<>!&|;\\]+/, 'operator'],
          [/\s+/, 'white'],
        ],
      },
    });
  } catch (_) {
    // Fall back to Monaco built-in shell if any
  }
}

/**
 * Register all lab languages (call from Editor beforeMount). Phase 3 optional.
 */
export function registerLabLanguages(monaco: typeof import('monaco-editor')) {
  registerMongoshLanguage(monaco);
  registerShellLanguage(monaco);
  registerPythonLanguage(monaco);
  registerJavaLanguage(monaco);
  // C# uses Monaco's built-in language (id: csharp); theme rules in defineLabDarkTheme color it.
}

/**
 * Return editor options for a given language (e.g. for dynamic language switch). Phase 3 optional.
 */
export function getEditorOptionsForLanguage(
  _language: string
): Partial<editor.IStandaloneEditorConstructionOptions> {
  return {};
}
