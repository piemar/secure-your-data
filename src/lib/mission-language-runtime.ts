export type MissionCodeLanguage = 'mongosh' | 'nodejs' | 'csharp' | 'go' | 'java';

export const LANGUAGE_LABELS: Record<MissionCodeLanguage, string> = {
  mongosh: 'Mongosh',
  nodejs: 'Node.js',
  csharp: 'C#',
  go: 'Go',
  java: 'Java',
};

export const EDITOR_LANGUAGE_IDS: Record<MissionCodeLanguage, string> = {
  mongosh: 'javascript',
  nodejs: 'javascript',
  csharp: 'csharp',
  go: 'go',
  java: 'java',
};

function escapeSingleQuotedJs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function normalizeCodeForTerminalPaste(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function buildMongoshConnectOnlyCommand(): string {
  const uriExpr =
    '${MONGOSH_CONNECTION_STRING:-${MDB_CONNECTION_STRING:-${MONGODB_CONNECTION_STRING:-${MONGODB_URI:-mongodb://127.0.0.1:27017}}}}';
  return [`MONGOSH_URI="${uriExpr}"`, 'mongosh "$MONGOSH_URI"'].join('\n');
}

export function buildGeneratedLanguageCode(
  language: MissionCodeLanguage,
  mongoshCode: string,
  dbName?: string
): string {
  if (language === 'mongosh') return mongoshCode;
  const uriExpr =
    '${MONGOSH_CONNECTION_STRING:-${MDB_CONNECTION_STRING:-${MONGODB_CONNECTION_STRING:-${MONGODB_URI:-mongodb://127.0.0.1:27017}}}}';
  const normalizedDb = (dbName || '').trim();
  const dbPrelude = normalizedDb
    ? `db = db.getSiblingDB('${escapeSingleQuotedJs(normalizedDb)}');\n`
    : '';
  const scriptWithDb = `${dbPrelude}${mongoshCode}`;

  if (language === 'nodejs') {
    return [
      "const { writeFileSync, unlinkSync } = require('fs');",
      "const { spawnSync } = require('child_process');",
      '',
      "const uri = process.env.MONGOSH_CONNECTION_STRING",
      "  || process.env.MDB_CONNECTION_STRING",
      "  || process.env.MONGODB_CONNECTION_STRING",
      "  || process.env.MONGODB_URI",
      `  || '${uriExpr}';`,
      "const scriptPath = '/tmp/mayhem-node-mongosh.js';",
      `const script = ${JSON.stringify(scriptWithDb)};`,
      '',
      'writeFileSync(scriptPath, script);',
      "const result = spawnSync('mongosh', [uri, '--file', scriptPath], { stdio: 'inherit' });",
      'try { unlinkSync(scriptPath); } catch {}',
      "process.exit(typeof result.status === 'number' ? result.status : 1);",
    ].join('\n');
  }

  if (language === 'go') {
    return [
      'package main',
      '',
      'import (',
      '  "os"',
      '  "os/exec"',
      ')',
      '',
      'func main() {',
      '  uri := os.Getenv("MONGOSH_CONNECTION_STRING")',
      '  if uri == "" { uri = os.Getenv("MDB_CONNECTION_STRING") }',
      '  if uri == "" { uri = os.Getenv("MONGODB_CONNECTION_STRING") }',
      '  if uri == "" { uri = os.Getenv("MONGODB_URI") }',
      `  if uri == "" { uri = "${uriExpr}" }`,
      '  scriptPath := "/tmp/mayhem-go-mongosh.js"',
      `  script := []byte(${JSON.stringify(scriptWithDb)})`,
      '  if err := os.WriteFile(scriptPath, script, 0o600); err != nil { panic(err) }',
      '  cmd := exec.Command("mongosh", uri, "--file", scriptPath)',
      '  cmd.Stdout = os.Stdout',
      '  cmd.Stderr = os.Stderr',
      '  err := cmd.Run()',
      '  _ = os.Remove(scriptPath)',
      '  if err != nil {',
      '    if exitErr, ok := err.(*exec.ExitError); ok {',
      '      os.Exit(exitErr.ExitCode())',
      '    }',
      '    panic(err)',
      '  }',
      '}',
    ].join('\n');
  }

  if (language === 'java') {
    return [
      'import java.nio.file.Files;',
      'import java.nio.file.Path;',
      '',
      'public class MayhemRunner {',
      '  public static void main(String[] args) throws Exception {',
      '    String uri = System.getenv("MONGOSH_CONNECTION_STRING");',
      '    if (uri == null || uri.isBlank()) uri = System.getenv("MDB_CONNECTION_STRING");',
      '    if (uri == null || uri.isBlank()) uri = System.getenv("MONGODB_CONNECTION_STRING");',
      '    if (uri == null || uri.isBlank()) uri = System.getenv("MONGODB_URI");',
      `    if (uri == null || uri.isBlank()) uri = "${uriExpr}";`,
      '    Path scriptPath = Path.of("/tmp/mayhem-java-mongosh.js");',
      `    Files.writeString(scriptPath, ${JSON.stringify(scriptWithDb)});`,
      '    Process p = new ProcessBuilder("mongosh", uri, "--file", scriptPath.toString())',
      '      .inheritIO()',
      '      .start();',
      '    int code = p.waitFor();',
      '    try { Files.deleteIfExists(scriptPath); } catch (Exception ignored) {}',
      '    System.exit(code);',
      '  }',
      '}',
    ].join('\n');
  }

  return [
    'using System;',
    'using System.Diagnostics;',
    'using System.IO;',
    '',
    'class MayhemRunner {',
    '  static int Main() {',
    '    var uri = Environment.GetEnvironmentVariable("MONGOSH_CONNECTION_STRING");',
    '    if (string.IsNullOrWhiteSpace(uri)) uri = Environment.GetEnvironmentVariable("MDB_CONNECTION_STRING");',
    '    if (string.IsNullOrWhiteSpace(uri)) uri = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");',
    '    if (string.IsNullOrWhiteSpace(uri)) uri = Environment.GetEnvironmentVariable("MONGODB_URI");',
    `    if (string.IsNullOrWhiteSpace(uri)) uri = "${uriExpr}";`,
    '    var scriptPath = "/tmp/mayhem-csharp-mongosh.js";',
    `    File.WriteAllText(scriptPath, ${JSON.stringify(scriptWithDb)});`,
    '    var p = new Process();',
    '    p.StartInfo.FileName = "mongosh";',
    '    p.StartInfo.Arguments = $"\\\"{uri}\\\" --file \\\"{scriptPath}\\\"";',
    '    p.StartInfo.UseShellExecute = false;',
    '    p.Start();',
    '    p.WaitForExit();',
    '    try { File.Delete(scriptPath); } catch {}',
    '    return p.ExitCode;',
    '  }',
    '}',
  ].join('\n');
}

export function buildMongoshRunCommandExecMode(
  code: string,
  dbName?: string,
  keepInteractive = false
): string {
  const uriExpr =
    '${MONGOSH_CONNECTION_STRING:-${MDB_CONNECTION_STRING:-${MONGODB_CONNECTION_STRING:-${MONGODB_URI:-mongodb://127.0.0.1:27017}}}}';
  const normalizedDb = (dbName || '').trim();
  const tmpPath = '/tmp/mayhem-run.js';
  const eofMarker = '__MAYHEM_MONGOSH_EOF__';
  const scriptWithDb = normalizedDb
    ? `db = db.getSiblingDB('${escapeSingleQuotedJs(normalizedDb)}');\n${code}`
    : code;

  return [
    'if ! command -v mongosh >/dev/null 2>&1; then',
    "  echo 'mongosh not found in terminal runtime' >&2",
    '  exit 127',
    'fi',
    `MONGOSH_URI="${uriExpr}"`,
    `cat > "${tmpPath}" <<'${eofMarker}'`,
    scriptWithDb,
    eofMarker,
    `cat "${tmpPath}"`,
    `mongosh "$MONGOSH_URI" --file "${tmpPath}"`,
    'EXIT_CODE=$?',
    `rm -f "${tmpPath}" >/dev/null 2>&1 || true`,
    ...(keepInteractive
      ? [
          'if [ "$EXIT_CODE" -eq 0 ]; then',
          '  echo "Script executed. Opening interactive mongosh..."',
          '  mongosh "$MONGOSH_URI"',
          '  EXIT_CODE=$?',
          'fi',
        ]
      : []),
    'exit $EXIT_CODE',
  ].join('\n');
}

export function buildGeneratedLanguageRunCommand(
  language: MissionCodeLanguage,
  mongoshCode: string,
  dbName?: string
): string {
  const tmpDir = '/tmp';
  const sourcePath = (() => {
    if (language === 'nodejs') return `${tmpDir}/mayhem-runner-node.js`;
    if (language === 'go') return `${tmpDir}/mayhem-runner-go.go`;
    if (language === 'java') return `${tmpDir}/MayhemRunner.java`;
    return `${tmpDir}/MayhemRunner.cs`;
  })();
  const generatedCode = buildGeneratedLanguageCode(language, mongoshCode, dbName);
  const runner = (() => {
    if (language === 'nodejs') return `node "${sourcePath}"`;
    if (language === 'go') return `go run "${sourcePath}"`;
    if (language === 'java') {
      return `javac "${sourcePath}" && java -cp "${tmpDir}" MayhemRunner`;
    }
    return `mcs "${sourcePath}" -out:${tmpDir}/MayhemRunner.exe && mono ${tmpDir}/MayhemRunner.exe`;
  })();
  const runtimeCheck = (() => {
    if (language === 'nodejs') return "if ! command -v node >/dev/null 2>&1; then echo 'node runtime not found' >&2; exit 127; fi";
    if (language === 'go') return "if ! command -v go >/dev/null 2>&1; then echo 'go runtime not found' >&2; exit 127; fi";
    if (language === 'java') return "if ! command -v javac >/dev/null 2>&1; then echo 'java compiler not found (javac)' >&2; exit 127; fi";
    return "if ! command -v mcs >/dev/null 2>&1; then echo 'c# compiler not found (mcs/mono-devel)' >&2; exit 127; fi";
  })();
  const cleanup = (() => {
    if (language === 'java') return `rm -f "${tmpDir}/MayhemRunner.class" "${sourcePath}" >/dev/null 2>&1 || true`;
    if (language === 'csharp') return `rm -f "${tmpDir}/MayhemRunner.exe" "${sourcePath}" >/dev/null 2>&1 || true`;
    return `rm -f "${sourcePath}" >/dev/null 2>&1 || true`;
  })();

  return [
    runtimeCheck,
    `cat > "${sourcePath}" <<'__MAYHEM_LANG_RUNNER_EOF__'`,
    generatedCode,
    '__MAYHEM_LANG_RUNNER_EOF__',
    `cat "${sourcePath}"`,
    runner,
    'EXIT_CODE=$?',
    cleanup,
    'exit $EXIT_CODE',
  ].join('\n');
}
