#!/usr/bin/env node

/**
 * CLI Helper: Create a new lab scaffold
 *
 * Usage (basic):
 *   node scripts/create-lab.js --name="My Lab" --topic=encryption
 *
 * Recommended (with POV + modes + proof reference):
 *   node scripts/create-lab.js \\
 *     --name="My Lab" \\
 *     --topic=encryption \\
 *     --pov=ENCRYPT-FIELDS,ENCRYPTION \\
 *     --modes=demo,lab,challenge \\
 *     --proof=46
 *
 * This keeps new labs aligned with PoV capabilities and proof exercises.
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

const labName = getArg('name');
const topicId = getArg('topic', 'encryption');
const povFolder = getArg('pov-folder', ''); // e.g. rich-query, scale-up (for topics with POV subfolders)
const povArg = getArg('pov', ''); // e.g. ENCRYPT-FIELDS,ENCRYPTION
const modesArg = getArg('modes', 'lab,challenge'); // sensible default
const proofNumber = getArg('proof', ''); // e.g. 46

if (!labName) {
  console.error('Error: --name is required');
  console.log('Usage: node scripts/create-lab.js --name="My Lab" --topic=encryption [--pov-folder=rich-query] --pov=ENCRYPT-FIELDS --modes=demo,lab,challenge --proof=46');
  process.exit(1);
}

const labId = `lab-${labName.toLowerCase().replace(/\s+/g, '-')}`;
const filename = `${labId}.ts`;
const topicDir = path.join(__dirname, '../src/content/topics', topicId);
const targetDir = povFolder ? path.join(topicDir, povFolder) : topicDir;
const filePath = path.join(targetDir, filename);

const povCapabilitiesSnippet = povArg
  ? `  povCapabilities: [${povArg
      .split(',')
      .map(id => `'${id.trim()}'`)
      .filter(Boolean)
      .join(', ')}], // PoV capabilities covered by this lab`
  : `  // povCapabilities: ['ENCRYPT-FIELDS'], // TODO: map to one or more PoV capabilities`;

const modesArraySnippet = modesArg
  .split(',')
  .map(mode => mode.trim())
  .filter(Boolean)
  .map(mode => `'${mode}'`)
  .join(', ') || `'lab', 'challenge'`;

const sourceProofSnippet = proofNumber
  ? `  // Source PoV proof exercise\n  // See Docs/pov-proof-exercises/proofs/${proofNumber}/README.md\n  // sourceProof: 'proofs/${proofNumber}/README.md',`
  : `  // Source PoV proof exercise (set when known)\n  // sourceProof: 'proofs/{X}/README.md',`;

const template = `import { WorkshopLabDefinition } from '@/types';

/**
 * ${labName}
 * 
 * Description of what this lab teaches and why it matters.
 */
export const ${labId.replace(/-/g, '')}: WorkshopLabDefinition = {
  id: '${labId}',
  title: '${labName}',
  description: 'Description of what participants will learn in this lab',
  topicId: '${topicId}',
  difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
  estimatedTotalTimeMinutes: 45,
  prerequisites: [], // e.g., ['lab-csfle-fundamentals']
${povCapabilitiesSnippet}
  modes: [${modesArraySnippet}],
${sourceProofSnippet}
  steps: [
    {
      id: 'step-1-introduction',
      title: 'Introduction',
      narrative: 'Story context for this step',
      instructions: \`What participants need to do in this step.

Include clear, actionable instructions.\`,
      estimatedTimeMinutes: 10,
      verificationId: 'csfle.verifyKeyVaultIndex', // Or another verification ID
      codeBlocks: [
        {
          filename: 'example.js',
          language: 'javascript',
          code: \`// Example code
const example = 'Hello World';\`,
          skeleton: \`// TODO: Add your code here\`
        }
      ],
      hints: [
        'Hint 1',
        'Hint 2'
      ],
      tips: [
        'Tip 1',
        'Tip 2'
      ]
    }
    // Add more steps as needed
  ]
};
`;

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filename} already exists at ${filePath}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(filePath, template, 'utf8');
console.log(`✅ Created lab scaffold: ${filePath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit ${filePath} to customize your lab`);
console.log(`2. Add the lab to src/content/topics/index.ts (allLabs array)`);
console.log(`3. Add the lab to a template in src/content/workshop-templates/`);
