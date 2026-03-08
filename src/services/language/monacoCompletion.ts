/**
 * Register completion item providers for lab languages. Phase 4.
 * Provides extension point; Monaco built-in still supplies most completions.
 */
export function registerLabCompletionProviders(monaco: typeof import('monaco-editor')) {
  const languages = ['javascript', 'typescript', 'mongosh', 'python', 'java', 'csharp'] as const;
  languages.forEach((lang) => {
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.', '('],
      provideCompletionItems: (_model, _position) => {
        return { suggestions: [] };
      },
    });
  });
}
