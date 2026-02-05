#!/usr/bin/env node

/**
 * CLI tool to scaffold new enhancement metadata files
 * 
 * Usage:
 *   node scripts/create-enhancement.js --id "text-search.basic" --pov TEXT-SEARCH --proof proofs/36/README.md
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {};

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace('--', '');
  const value = args[i + 1];
  if (key && value) {
    options[key] = value;
  }
}

const { id, pov, proof } = options;

if (!id || !pov || !proof) {
  console.error('Usage: node scripts/create-enhancement.js --id <enhancement-id> --pov <POV-CAPABILITY> --proof <proof-path>');
  console.error('Example: node scripts/create-enhancement.js --id "text-search.basic" --pov TEXT-SEARCH --proof proofs/36/README.md');
  process.exit(1);
}

// Extract prefix from enhancement ID (e.g., "text-search" from "text-search.basic")
const prefix = id.split('.')[0];
const enhancementName = id.split('.').slice(1).join('-');

// Determine metadata file path
const metadataDir = path.join(__dirname, '..', 'src', 'labs', 'enhancements', 'metadata');
const metadataFile = path.join(metadataDir, `${prefix}.ts`);

// Check if file exists
const fileExists = fs.existsSync(metadataFile);

// Template for new enhancement
const enhancementTemplate = `  '${id}': {
    id: '${id}',
    povCapability: '${pov}',
    sourceProof: '${proof}',
    sourceSection: 'Execution - TEST 1', // Update with actual section
    codeBlocks: [
      {
        filename: 'example.js',
        language: 'javascript',
        code: \`// Add your code here
\`,
        skeleton: \`// Add skeleton with blanks here
\`,
        inlineHints: [
          {
            line: 1,
            blankText: '_________',
            hint: 'Hint for the blank',
            answer: 'answer',
          },
        ],
      },
    ],
    tips: [
      'Add helpful tips here',
    ],
  },`;

if (fileExists) {
  // Append to existing file
  console.log(`Appending enhancement to existing file: ${metadataFile}`);
  const content = fs.readFileSync(metadataFile, 'utf8');
  
  // Find the closing brace of the enhancements object
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    console.error('Could not find closing brace in existing file');
    process.exit(1);
  }
  
  // Insert new enhancement before the closing brace
  const newContent = content.slice(0, lastBraceIndex) + enhancementTemplate + '\n' + content.slice(lastBraceIndex);
  fs.writeFileSync(metadataFile, newContent, 'utf8');
  console.log(`✅ Added enhancement '${id}' to ${metadataFile}`);
} else {
  // Create new file
  console.log(`Creating new metadata file: ${metadataFile}`);
  const fileContent = `import type { EnhancementMetadataRegistry } from '../schema';

/**
 * ${pov} Enhancement Metadata
 * 
 * Source PoV Proof Exercise: ${proof}
 */

export const enhancements: EnhancementMetadataRegistry = {
${enhancementTemplate}
};
`;
  
  // Ensure directory exists
  fs.mkdirSync(metadataDir, { recursive: true });
  fs.writeFileSync(metadataFile, fileContent, 'utf8');
  console.log(`✅ Created new metadata file: ${metadataFile}`);
  console.log(`⚠️  Don't forget to register this file in src/labs/enhancements/loader.ts`);
}

// Create test file
const testDir = path.join(__dirname, '..', 'src', 'test', 'labs');
const testFile = path.join(testDir, `${pov}Enhancements.test.ts`);
const testContent = `import { describe, it, expect } from 'vitest';
import { getStepEnhancementSync } from '@/labs/stepEnhancementRegistry';

describe('${pov} step enhancements', () => {
  it('provides code block for ${id} enhancement', () => {
    const enh = getStepEnhancementSync('${id}');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
  });

  it('defines guided skeletons and inline hints for ${id}', () => {
    const enh = getStepEnhancementSync('${id}');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('returns undefined for unknown enhancement id', () => {
    const enh = getStepEnhancementSync('${prefix}.unknown-id');
    expect(enh).toBeUndefined();
  });
});
`;

if (!fs.existsSync(testFile)) {
  fs.writeFileSync(testFile, testContent, 'utf8');
  console.log(`✅ Created test file: ${testFile}`);
} else {
  console.log(`⚠️  Test file already exists: ${testFile}`);
}

console.log('\n📝 Next steps:');
console.log(`1. Edit ${metadataFile} to add your enhancement content`);
console.log(`2. Update sourceSection if needed`);
console.log(`3. Run tests: npx vitest run ${testFile}`);
