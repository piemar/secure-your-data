#!/usr/bin/env node

/**
 * CLI Helper: Create a new demo script (beats) configuration.
 *
 * This creates a JSON configuration file under `src/content/demo-scripts/`
 * that can later be wired into a DemoScript view/component.
 *
 * Usage (basic):
 *   node scripts/create-demo-script.js --name="My Demo" --pov=ENCRYPT-FIELDS
 *
 * Recommended:
 *   node scripts/create-demo-script.js \\
 *     --name="My Demo" \\
 *     --pov=ENCRYPT-FIELDS \\
 *     --labs=lab-csfle-fundamentals,lab-queryable-encryption
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

const demoName = getArg('name');
const povArg = getArg('pov', '');
const labsArg = getArg('labs', '');

if (!demoName) {
  console.error('Error: --name is required');
  console.log('Usage: node scripts/create-demo-script.js --name="My Demo" --pov=ENCRYPT-FIELDS --labs=lab-1,lab-2');
  process.exit(1);
}

const demoId = `demo-${demoName.toLowerCase().replace(/\s+/g, '-')}`;
const filename = `${demoId.replace('demo-', '')}.json`;
const dirPath = path.join(__dirname, '../src/content/demo-scripts');
const filePath = path.join(dirPath, filename);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filename} already exists`);
  process.exit(1);
}

const povCapabilities = povArg
  ? povArg
      .split(',')
      .map(id => id.trim())
      .filter(Boolean)
  : [];

const labIds = labsArg
  ? labsArg
      .split(',')
      .map(id => id.trim())
      .filter(Boolean)
  : [];

const config = {
  id: demoId,
  title: demoName,
  povCapabilities,
  beats: labIds.length
    ? labIds.map((labId, index) => ({
        id: `beat-${index + 1}`,
        title: `Beat ${index + 1} for ${labId}`,
        narrative: `Scripted narrative for beat ${index + 1} in lab ${labId}. Describe the key \"wow\" moment here.`,
        labId,
        // stepId can be filled in later when specific steps are chosen
        stepId: '',
        durationMinutes: 5,
        competitiveNotes: 'Add competitive comparison notes here.'
      }))
    : [
        {
          id: 'beat-1',
          title: 'Beat 1',
          narrative: 'Scripted narrative for the first beat. Describe the key \"wow\" moment here.',
          labId: '',
          stepId: '',
          durationMinutes: 5,
          competitiveNotes: 'Add competitive comparison notes here.'
        }
      ]
};

fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
console.log(`✅ Created demo script config: ${filePath}`);
console.log('\nNext steps:');
console.log(`1. Wire demo scripts into a DemoScript view/component (e.g., src/components/workshop/DemoScriptView.tsx).`);
console.log('2. Fill in specific labId/stepId values for each beat as needed.');
console.log('3. Optionally add this demo script to templates or moderator configuration.');

