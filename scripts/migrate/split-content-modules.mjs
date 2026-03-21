import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = '/Users/pierre.petersson/labs-work/clean/secure-your-data';
const SRC = path.join(ROOT, 'src');

const gameDataPath = path.join(SRC, 'lib', 'game-data.ts');
const skeletonsPath = path.join(SRC, 'lib', 'mission-skeletons.ts');
const validationsPath = path.join(SRC, 'lib', 'mission-validations.ts');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function parseSource(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return { text, sf };
}

function findVarInit(sf, text, varName) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== varName || !decl.initializer) continue;
      return decl.initializer.getText(sf);
    }
  }
  throw new Error(`Variable ${varName} not found`);
}

function findVarDeclNode(sf, varName) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === varName) return decl;
    }
  }
  throw new Error(`Variable ${varName} not found`);
}

function findVarStatementText(sf, varName) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === varName) {
        return stmt.getText(sf);
      }
    }
  }
  throw new Error(`Variable statement for ${varName} not found`);
}

function findFunctionNode(sf, fnName) {
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === fnName) return stmt;
  }
  throw new Error(`Function ${fnName} not found`);
}

function getObjectPropertyByName(obj, name) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) {
      const n = p.name;
      if (ts.isIdentifier(n) && n.text === name) return p;
      if (ts.isStringLiteral(n) && n.text === name) return p;
    }
  }
  return null;
}

function extractMissions() {
  const { sf } = parseSource(gameDataPath);
  const decl = findVarDeclNode(sf, 'MISSIONS');
  if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) {
    throw new Error('MISSIONS is not an array literal');
  }

  const missions = [];
  for (const el of decl.initializer.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue;
    const idProp = getObjectPropertyByName(el, 'id');
    const titleProp = getObjectPropertyByName(el, 'title');
    if (!idProp || !titleProp) continue;
    const id = idProp.initializer.getText(sf).replace(/^['"]|['"]$/g, '');
    const title = titleProp.initializer.getText(sf).replace(/^['"]|['"]$/g, '');
    const slug = slugify(title);
    missions.push({
      id,
      title,
      slug,
      objectText: el.getText(sf),
    });
  }
  return missions;
}

function extractQuestEntries() {
  const { sf } = parseSource(gameDataPath);
  const decl = findVarDeclNode(sf, 'QUESTS');
  if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) {
    throw new Error('QUESTS is not an array literal');
  }
  const quests = [];
  for (const el of decl.initializer.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue;
    const titleProp = getObjectPropertyByName(el, 'title');
    if (!titleProp) continue;
    const title = titleProp.initializer.getText(sf).replace(/^['"]|['"]$/g, '');
    quests.push({
      slug: slugify(title),
      objectText: el.getText(sf),
    });
  }
  return quests;
}

function extractMapEntries(filePath, varName) {
  const { sf } = parseSource(filePath);
  const decl = findVarDeclNode(sf, varName);
  if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) {
    throw new Error(`${varName} is not an object literal`);
  }
  const entries = new Map();
  for (const p of decl.initializer.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const n = p.name;
    if (!ts.isStringLiteral(n) && !ts.isIdentifier(n)) continue;
    const key = ts.isStringLiteral(n) ? n.text : n.text;
    entries.set(key, p.initializer.getText(sf));
  }
  return entries;
}

function extractSupportSymbols() {
  const { sf } = parseSource(gameDataPath);
  const declText = (name) => findVarStatementText(sf, name);
  const fnText = (name) => findFunctionNode(sf, name).getText(sf);
  return {
    achievementsDecl: declText('ACHIEVEMENTS'),
    ranksDecl: declText('RANK_THRESHOLDS'),
    adjectivesDecl: declText('HACKER_ADJECTIVES'),
    nounsDecl: declText('HACKER_NOUNS'),
    generateHandleFn: fnText('generateHandle'),
    mockLeaderboardDecl: declText('MOCK_LEADERBOARD_PLAYERS'),
  };
}

function main() {
  const missions = extractMissions();
  const quests = extractQuestEntries();
  const skeletonMap = extractMapEntries(skeletonsPath, 'MISSION_SKELETONS');
  const validationMap = extractMapEntries(validationsPath, 'MISSION_VALIDATIONS');
  const support = extractSupportSymbols();

  const contentMissionsDir = path.join(SRC, 'content', 'missions');
  const contentQuestsDir = path.join(SRC, 'content', 'quests');
  ensureDir(contentMissionsDir);
  ensureDir(contentQuestsDir);

  const missionImports = [];
  const missionRefs = [];
  const skeletonImports = [];
  const skeletonRefs = [];
  const validationImports = [];
  const validationRefs = [];

  for (const m of missions) {
    const dir = path.join(contentMissionsDir, m.slug);
    ensureDir(dir);

    writeFile(
      path.join(dir, 'mission.ts'),
      `import { Mission } from '@/lib/types';\n\nexport const mission: Mission = ${m.objectText};\n`
    );
    const skelText = skeletonMap.get(m.id);
    if (!skelText) {
      throw new Error(`Missing skeleton for ${m.id}`);
    }
    writeFile(
      path.join(dir, 'skeleton.ts'),
      `import { MissionSkeleton } from '@/lib/types';\n\nexport const skeleton: MissionSkeleton = ${skelText};\n`
    );
    const valText = validationMap.get(m.id);
    if (!valText) {
      throw new Error(`Missing validation for ${m.id}`);
    }
    writeFile(
      path.join(dir, 'validation.ts'),
      `import { ObjectiveValidation } from '@/lib/validation';\n\nexport const validations: ObjectiveValidation[] = ${valText};\n`
    );

    missionImports.push(`import { mission as ${m.slug}Mission } from './${m.slug}/mission';`);
    missionRefs.push(`${m.slug}Mission`);
    skeletonImports.push(`import { skeleton as ${m.slug}Skeleton } from './${m.slug}/skeleton';`);
    skeletonRefs.push(`  '${m.id}': ${m.slug}Skeleton,`);
    validationImports.push(`import { validations as ${m.slug}Validations } from './${m.slug}/validation';`);
    validationRefs.push(`  '${m.id}': ${m.slug}Validations,`);
  }

  writeFile(
    path.join(contentMissionsDir, 'index.ts'),
    `import { MissionSkeleton } from '@/lib/types';\nimport { ObjectiveValidation } from '@/lib/validation';\n${missionImports.join('\n')}\n${skeletonImports.join('\n')}\n${validationImports.join('\n')}\n\nexport const MISSIONS = [\n  ${missionRefs.join(',\n  ')},\n];\n\nexport const MISSION_SKELETONS: Record<string, MissionSkeleton> = {\n${skeletonRefs.join('\n')}\n};\n\nexport const MISSION_VALIDATIONS: Record<string, ObjectiveValidation[]> = {\n${validationRefs.join('\n')}\n};\n\nexport function getSkeletonForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert'): string {\n  const skeleton = MISSION_SKELETONS[missionId];\n  if (!skeleton) return '// Mission skeleton not found';\n  return skeleton[difficulty];\n}\n\nexport function getHintsForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert') {\n  const skeleton = MISSION_SKELETONS[missionId];\n  if (!skeleton) return [];\n  if (difficulty === 'expert') return [];\n  return skeleton.hints[difficulty] || [];\n}\n`
  );

  const questImports = [];
  const questRefs = [];
  for (let i = 0; i < quests.length; i += 1) {
    const q = quests[i];
    const varName = `quest${i + 1}`;
    const dir = path.join(contentQuestsDir, q.slug);
    ensureDir(dir);
    writeFile(
      path.join(dir, 'quest.ts'),
      `import { Quest } from '@/lib/types';\nimport { MISSIONS } from '@/content/missions';\n\nexport const quest: Quest = ${q.objectText};\n`
    );
    questImports.push(`import { quest as ${varName} } from './${q.slug}/quest';`);
    questRefs.push(varName);
  }

  writeFile(
    path.join(contentQuestsDir, 'index.ts'),
    `${questImports.join('\n')}\n\nexport const QUESTS = [\n  ${questRefs.join(',\n  ')},\n];\n`
  );

  writeFile(
    path.join(contentMissionsDir, 'support.ts'),
    `import { Achievement } from '@/lib/types';\n\n${support.achievementsDecl}\n\n${support.ranksDecl}\n\n${support.adjectivesDecl}\n\n${support.nounsDecl}\n\n${support.generateHandleFn}\n\n${support.mockLeaderboardDecl}\n`
  );

  writeFile(
    path.join(contentMissionsDir, 'mission.ts'),
    `export { MISSIONS } from './index';\nexport {\n  ACHIEVEMENTS,\n  RANK_THRESHOLDS,\n  HACKER_ADJECTIVES,\n  HACKER_NOUNS,\n  generateHandle,\n  MOCK_LEADERBOARD_PLAYERS,\n} from './support';\n`
  );

  writeFile(
    path.join(contentMissionsDir, 'skeletons.ts'),
    `export { MISSION_SKELETONS, getSkeletonForDifficulty, getHintsForDifficulty } from './index';\n`
  );

  writeFile(
    path.join(contentMissionsDir, 'validation.ts'),
    `export { MISSION_VALIDATIONS } from './index';\n`
  );

  writeFile(
    path.join(contentQuestsDir, 'quest.ts'),
    `export { QUESTS } from './index';\n`
  );

  writeFile(
    path.join(SRC, 'lib', 'game-data.ts'),
    `export {\n  MISSIONS,\n  ACHIEVEMENTS,\n  RANK_THRESHOLDS,\n  HACKER_ADJECTIVES,\n  HACKER_NOUNS,\n  generateHandle,\n  MOCK_LEADERBOARD_PLAYERS,\n} from '@/content/missions/mission';\n\nexport { QUESTS } from '@/content/quests/quest';\n`
  );

  writeFile(
    path.join(SRC, 'lib', 'mission-skeletons.ts'),
    `export {\n  MISSION_SKELETONS,\n  getSkeletonForDifficulty,\n  getHintsForDifficulty,\n} from '@/content/missions/skeletons';\n`
  );

  writeFile(
    path.join(SRC, 'lib', 'mission-validations.ts'),
    `export {\n  MISSION_VALIDATIONS,\n} from '@/content/missions/validation';\n`
  );
}

try {
  main();
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('Variable MISSIONS not found') || msg.includes('Variable QUESTS not found')) {
    console.log('Split source already migrated; no-op.');
    process.exit(0);
  }
  throw error;
}
