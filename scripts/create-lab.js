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

// Enhancement prefix: same as POV folder when present, else derived from lab id (e.g. lab-my-lab -> my-lab)
const enhancementPrefix = povFolder || labId.replace(/^lab-/, '');
const povCapability = povArg ? povArg.split(',')[0].trim() : 'TODO-POV';

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

const sourceProofPath = proofNumber ? `proofs/${proofNumber}/README.md` : 'proofs/{X}/README.md';

// Export name: labTestRegisterLabDefinition (camelCase + Definition)
const slugParts = labId.replace(/^lab-/, '').split('-');
const pascalSuffix = slugParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
const exportName = 'lab' + pascalSuffix + 'Definition';
const stepIds = [
  `${labId}-step-1`,
  `${labId}-step-2`,
  `${labId}-step-3`,
];
const enhancementIds = [
  `${enhancementPrefix}.step-1`,
  `${enhancementPrefix}.step-2`,
  `${enhancementPrefix}.step-3`,
];

const labTemplate = `import { WorkshopLabDefinition } from '@/types';

/**
 * ${labName}
 *
 * Source PoV proof exercise: Docs/pov-proof-exercises/proofs/${proofNumber || '{N}'}/README.md
 * Description of what this lab teaches and why it matters.
 */
export const ${exportName}: WorkshopLabDefinition = {
  id: '${labId}',
  title: '${labName}',
  description: 'Description of what participants will learn in this lab',
  topicId: '${topicId}',
  difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
  estimatedTotalTimeMinutes: 45,
  prerequisites: [], // e.g., ['lab-csfle-fundamentals']
${povCapabilitiesSnippet}
  modes: [${modesArraySnippet}],
  steps: [
    {
      id: '${stepIds[0]}',
      title: 'Step 1: Introduction',
      narrative: 'Story context for this step.',
      instructions: 'What participants need to do in this step. Use clear, actionable instructions.',
      estimatedTimeMinutes: 10,
      modes: [${modesArraySnippet}],
      points: 5,
      enhancementId: '${enhancementIds[0]}',
      sourceProof: '${sourceProofPath}',
      sourceSection: 'Description',
    },
    {
      id: '${stepIds[1]}',
      title: 'Step 2: Core exercise',
      narrative: 'Context and explanation for this step.',
      instructions: 'Instructions for completing this step.',
      estimatedTimeMinutes: 15,
      modes: [${modesArraySnippet}],
      points: 10,
      enhancementId: '${enhancementIds[1]}',
      sourceProof: '${sourceProofPath}',
      sourceSection: 'Execution',
    },
    {
      id: '${stepIds[2]}',
      title: 'Step 3: Wrap-up',
      narrative: 'Summary and next steps.',
      instructions: 'Final instructions or verification steps.',
      estimatedTimeMinutes: 10,
      modes: [${modesArraySnippet}],
      points: 5,
      enhancementId: '${enhancementIds[2]}',
      sourceProof: '${sourceProofPath}',
      sourceSection: 'Setup',
    },
  ],
};
`;

const enhancementsPath = path.join(targetDir, 'enhancements.ts');
const enhancementsExist = fs.existsSync(enhancementsPath);

const enhancementEntries = enhancementIds
  .map(
    (eid, i) => `  '${eid}': {
    id: '${eid}',
    povCapability: '${povCapability}',
    sourceProof: '${sourceProofPath}',
    sourceSection: '${i === 0 ? 'Description' : i === 1 ? 'Execution' : 'Setup'}',
    codeBlocks: [
      {
        filename: 'step-${i + 1}.txt',
        language: 'text',
        code: \`TODO: Add content for step ${i + 1}\`,
      },
    ],
    tips: ['Tip for step ${i + 1}.'],
  },`
  )
  .join('\n\n');

const enhancementsTemplate = `import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * ${labName} – Enhancement metadata
 *
 * Source PoV proof: Docs/pov-proof-exercises/proofs/${proofNumber || '{N}'}/README.md
 */

export const enhancements: EnhancementMetadataRegistry = {
${enhancementEntries}
};
`;

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filename} already exists at ${filePath}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(filePath, labTemplate, 'utf8');
console.log(`✅ Created lab scaffold: ${filePath}`);

if (!enhancementsExist) {
  fs.writeFileSync(enhancementsPath, enhancementsTemplate, 'utf8');
  console.log(`✅ Created stub enhancements: ${enhancementsPath}`);
} else {
  console.log(`⚠️  enhancements.ts already exists in ${targetDir} – add entries for: ${enhancementIds.join(', ')}`);
}

console.log('\nNext steps:');
console.log('1. Edit the lab file and enhancements.ts to add your content.');
console.log('2. Register the lab in src/content/topics/index.ts (import and add to allLabs array).');
console.log('3. If this POV prefix is new, add it to src/labs/enhancements/loader.ts (moduleMap and preloadAllEnhancements).');
console.log('4. Run: node scripts/validate-content.js');
console.log('\nSee Docs/ARCHITECTURE_AND_ADDING_LABS.md and Docs/ADD_LAB_MASTER_PROMPT.md for details.');
