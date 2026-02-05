#!/usr/bin/env node

/**
 * CLI Helper: Create a new challenge template scaffold
 *
 * Usage (basic):
 *   node scripts/create-challenge.js --name="My Challenge" --industry=retail
 *
 * Recommended (with topics, labs, quests, modes):
 *   node scripts/create-challenge.js \\
 *     --name="My Challenge" \\
 *     --industry=retail \\
 *     --topics=encryption,analytics \\
 *     --labs=lab-csfle-fundamentals,lab-queryable-encryption \\
 *     --quests=quest-stop-the-leak \\
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

const challengeName = getArg('name');
const industry = getArg('industry', 'general');
const topicsArg = getArg('topics', 'encryption');
const labsArg = getArg('labs', 'lab-csfle-fundamentals');
const questsArg = getArg('quests', '');
const modesArg = getArg('modes', 'challenge,lab');

if (!challengeName) {
  console.error('Error: --name is required');
  console.log('Usage: node scripts/create-challenge.js --name="My Challenge" --industry=retail');
  process.exit(1);
}

const templateId = `template-${challengeName.toLowerCase().replace(/\s+/g, '-')}`;
const filename = `${templateId.replace('template-', '')}.ts`;
const filePath = path.join(__dirname, '../src/content/workshop-templates', filename);

function csvToArraySnippet(csv, commentIfEmpty) {
  const items = csv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!items.length) {
    return commentIfEmpty;
  }
  return items.map(id => `'${id}'`).join(', ');
}

const topicIdsSnippet = csvToArraySnippet(
  topicsArg,
  `'encryption' // TODO: add topic IDs for this challenge`,
);

const labIdsSnippet = csvToArraySnippet(
  labsArg,
  `'lab-csfle-fundamentals' // TODO: add lab IDs included in this challenge`,
);

const questIdsSnippet = questsArg
  ? csvToArraySnippet(questsArg, '')
  : `// Add quest IDs for this challenge`;

const modesArraySnippet = csvToArraySnippet(
  modesArg,
  `'challenge', 'lab'`,
);

const template = `import { WorkshopTemplate } from '@/types';

/**
 * ${challengeName} Challenge Template
 * 
 * Description of this challenge scenario.
 */
export const ${templateId.replace(/-/g, '')}: WorkshopTemplate = {
  id: '${templateId}',
  name: '${challengeName}',
  description: 'Description of this challenge scenario',
  industry: '${industry}', // 'retail' | 'financial' | 'healthcare' | 'general'
  topicIds: [
    ${topicIdsSnippet}
  ],
  labIds: [
    ${labIdsSnippet}
  ],
  questIds: [
    ${questIdsSnippet}
  ],
  defaultMode: 'challenge',
  allowedModes: [${modesArraySnippet}],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50,
    achievements: [
      {
        id: 'achievement-example',
        name: 'Example Achievement',
        description: 'Description of achievement',
        icon: '🏆'
      }
    ]
  },
  storyIntro: \`# ${challengeName}

## The Challenge

Describe the scenario, situation, and stakes here.

### Your Mission

What participants need to accomplish.\`,
  storyOutro: \`# Challenge Complete! 🎉

Congratulations! You've successfully completed the challenge.

## What You Accomplished

- Achievement 1
- Achievement 2
- Achievement 3

## Impact

Describe the impact and next steps.\`
};
`;

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filename} already exists`);
  process.exit(1);
}

fs.writeFileSync(filePath, template, 'utf8');
console.log(`✅ Created challenge template scaffold: ${filePath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit ${filePath} to customize your challenge`);
console.log(`2. Add the template to src/services/contentService.ts`);
console.log(`3. Create quests and flags referenced in questIds`);
