import { describe, expect, it } from 'vitest';
import {
  buildGeneratedLanguageCode,
  buildGeneratedLanguageRunCommand,
  buildMongoshRunCommandExecMode,
  type MissionCodeLanguage,
} from '@/lib/mission-language-runtime';

const MONGOSH_SAMPLE = [
  'db.agents.insertOne({ name: "Shadow", level: 3 });',
  'db.agents.find({ level: { $gte: 3 } });',
].join('\n');

describe('mission language runtime code generation', () => {
  it('injects db prelude for every non-mongosh language', () => {
    const languages: MissionCodeLanguage[] = ['nodejs', 'go', 'java', 'csharp'];
    for (const language of languages) {
      const generated = buildGeneratedLanguageCode(language, MONGOSH_SAMPLE, 'sandbox_acme');
      expect(generated).toContain("db = db.getSiblingDB('sandbox_acme');");
      expect(generated).toContain('db.agents.insertOne');
    }
  });

  it('escapes single quotes in db name safely', () => {
    const generated = buildGeneratedLanguageCode('nodejs', MONGOSH_SAMPLE, "sandbox_o'reilly");
    expect(generated).toContain("sandbox_o\\\\'reilly");
  });

  it('generates robust go wrapper with exit propagation', () => {
    const generated = buildGeneratedLanguageCode('go', MONGOSH_SAMPLE, 'sandbox_acme');
    expect(generated).toContain('if exitErr, ok := err.(*exec.ExitError); ok {');
    expect(generated).toContain('os.Exit(exitErr.ExitCode())');
  });

  it('generates csharp wrapper with quoted mongosh args', () => {
    const generated = buildGeneratedLanguageCode('csharp', MONGOSH_SAMPLE, 'sandbox_acme');
    expect(generated).toContain('p.StartInfo.Arguments = $"{uri} --file {scriptPath}";');
  });
});

describe('mission language runtime shell command generation', () => {
  it('builds mongosh exec command with db pinning in script', () => {
    const cmd = buildMongoshRunCommandExecMode(MONGOSH_SAMPLE, 'sandbox_acme', false);
    expect(cmd).toContain("db = db.getSiblingDB('sandbox_acme');");
    expect(cmd).toContain('mongosh "$MONGOSH_URI" --file "/tmp/mayhem-run.js"');
  });

  it('builds language run command for each runtime', () => {
    const cases: Array<[MissionCodeLanguage, string]> = [
      ['nodejs', 'node "/tmp/mayhem-runner-node.js"'],
      ['go', 'go run "/tmp/mayhem-runner-go.go"'],
      ['java', 'javac -d "/tmp" "/tmp/MayhemRunner.java" && java -cp "/tmp" MayhemRunner'],
      ['csharp', 'mcs "/tmp/MayhemRunner.cs" -out:/tmp/MayhemRunner.exe && mono /tmp/MayhemRunner.exe'],
    ];
    for (const [language, expectedRunner] of cases) {
      const cmd = buildGeneratedLanguageRunCommand(language, MONGOSH_SAMPLE, 'sandbox_acme');
      expect(cmd).toContain(expectedRunner);
      expect(cmd).toMatch(/__MAYHEM_LANG_RUNNER_EOF__/);
      expect(cmd).toContain('exit $EXIT_CODE');
    }
  });

  it('includes full runtime wrapper lifecycle for each non-mongosh language', () => {
    const cases: Array<{
      language: MissionCodeLanguage;
      runtimeCheckSnippet: string;
      cleanupSnippet: string;
      runnerSnippet: string;
      generatedCodeSnippet: string;
    }> = [
      {
        language: 'nodejs',
        runtimeCheckSnippet: "command -v node",
        cleanupSnippet: 'rm -f "/tmp/mayhem-runner-node.js"',
        runnerSnippet: 'node "/tmp/mayhem-runner-node.js"',
        generatedCodeSnippet: "spawnSync('mongosh', [uri, '--file', scriptPath], { stdio: 'inherit' })",
      },
      {
        language: 'go',
        runtimeCheckSnippet: "command -v go",
        cleanupSnippet: 'rm -f "/tmp/mayhem-runner-go.go"',
        runnerSnippet: 'go run "/tmp/mayhem-runner-go.go"',
        generatedCodeSnippet: 'exec.Command("mongosh", uri, "--file", scriptPath)',
      },
      {
        language: 'java',
        runtimeCheckSnippet: "command -v javac",
        cleanupSnippet: 'rm -f "/tmp/MayhemRunner.class" "/tmp/MayhemRunner.java"',
        runnerSnippet: 'javac -d "/tmp" "/tmp/MayhemRunner.java" && java -cp "/tmp" MayhemRunner',
        generatedCodeSnippet: 'new ProcessBuilder("mongosh", uri, "--file", scriptPath.toString())',
      },
      {
        language: 'csharp',
        runtimeCheckSnippet: "command -v mcs",
        cleanupSnippet: 'rm -f "/tmp/MayhemRunner.exe" "/tmp/MayhemRunner.cs"',
        runnerSnippet: 'mcs "/tmp/MayhemRunner.cs" -out:/tmp/MayhemRunner.exe && mono /tmp/MayhemRunner.exe',
        generatedCodeSnippet: 'p.StartInfo.FileName = "mongosh";',
      },
    ];

    for (const c of cases) {
      const cmd = buildGeneratedLanguageRunCommand(c.language, MONGOSH_SAMPLE, 'sandbox_acme');
      const generated = buildGeneratedLanguageCode(c.language, MONGOSH_SAMPLE, 'sandbox_acme');

      // 1) preflight check
      expect(cmd).toContain(c.runtimeCheckSnippet);
      expect(cmd).toContain('exit 127');

      // 2) generated source is embedded as heredoc payload
      expect(cmd).toContain(`cat > "/tmp/`);
      expect(cmd).toMatch(/__MAYHEM_LANG_RUNNER_EOF__/);
      expect(cmd).toContain(generated);

      // 3) script executes and propagates status
      expect(cmd).toContain(c.runnerSnippet);
      expect(cmd).toContain('EXIT_CODE=$?');
      expect(cmd).toContain('exit $EXIT_CODE');

      // 4) cleanup runs afterward
      expect(cmd).toContain(c.cleanupSnippet);

      // 5) generated source itself calls mongosh with file mode
      expect(generated).toContain(c.generatedCodeSnippet);
      expect(generated).toContain("db = db.getSiblingDB('sandbox_acme');");
    }
  });

  it('uses collision-resistant heredoc markers for embedded code', () => {
    const command = buildGeneratedLanguageRunCommand(
      'nodejs',
      [
        'db.agents.insertOne({ name: "A" });',
        '__MAYHEM_LANG_RUNNER_EOF__',
        'db.agents.find({});',
      ].join('\n'),
      'sandbox_acme'
    );

    expect(command).toMatch(/__MAYHEM_LANG_RUNNER_EOF__/);
    expect(command).not.toContain("<<'__MAYHEM_LANG_RUNNER_EOF__'");
  });
});
