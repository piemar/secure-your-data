#!/usr/bin/env node

/**
 * CLI Helper: Create a new quest scaffold
 *
 * Usage (basic):
 *   node scripts/create-quest.js --name="My Quest"
 *
 * Recommended (with labs, flags, modes):
 *   node scripts/create-quest.js \\
 *     --name="My Quest" \\
 *     --labs=lab-csfle-fundamentals,lab-queryable-encryption \\
 *     --flags=encrypted-pii-collections,no-plaintext-pii \\
 *     --modes=challenge,lab
 */

import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const raw = args.find(arg => arg.startsWith(`--${name}=`));
  if (!raw) return fallback;
  return raw.split('=')[1].replace(/"/g, '');
}

const questName = getArg('name');
const labsArg = getArg('labs', 'lab-csfle-fundamentals');
const flagsArg = getArg('flags', '');
const modesArg = getArg('modes', 'challenge,lab');

if (!questName) {
  console.error('Error: --name is required');
  console.log('Usage: node scripts/create-quest.js --name="My Quest" --labs=lab-1,lab-2 --flags=flag-1,flag-2 --modes=challenge,lab');
  process.exit(1);
}

const questId = `quest-${questName.toLowerCase().replace(/\s+/g, '-')}`;
const filename = `${questId.replace('quest-', '')}.ts`;
const filePath = path.join(__dirname, '../src/content/quests', filename);

function toArraySnippet(csv, commentIfEmpty) {
  const items = csv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!items.length) {
    return commentIfEmpty;
  }
  return items.map(id => `'${id}'`).join(', ');
}

const labIdsSnippet = toArraySnippet(
  labsArg,
  `'lab-csfle-fundamentals' // TODO: add lab IDs for this quest`,
);

const requiredFlagsSnippet = flagsArg
  ? toArraySnippet(flagsArg, '')
  : `// Add required flag IDs`;

const modesArraySnippet = toArraySnippet(
  modesArg,
  `'challenge', 'lab'`,
);

const template = `import { WorkshopQuest } from '@/types';

/**
 * Quest: ${questName}
 * 
 * Description of what this quest accomplishes.
 */
export const ${questId.replace(/-/g, '')}: WorkshopQuest = {
  id: '${questId}',
  title: '${questName}',
  storyContext: \`Narrative background for this quest.

Describe the situation, stakes, and what participants need to accomplish.\`,
  objectiveSummary: 'Brief summary of the quest objectives',
  labIds: [
    ${labIdsSnippet}
  ],
  requiredFlagIds: [
    ${requiredFlagsSnippet}
  ],
  optionalFlagIds: [
    // Add optional flag IDs (optional)
  ],
  modes: [${modesArraySnippet}] // Modes where this quest is available
};
`;

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filename} already exists`);
  process.exit(1);
}

fs.writeFileSync(filePath, template, 'utf8');
console.log(`✅ Created quest scaffold: ${filePath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit ${filePath} to customize your quest`);
console.log(`2. Add the quest to src/services/contentService.ts`);
console.log(`3. Create flags referenced in requiredFlagIds/optionalFlagIds`);
