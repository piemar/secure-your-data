#!/usr/bin/env node

/**
 * Register a new lab in the topic index and (if needed) the enhancement loader.
 *
 * Usage:
 *   node scripts/register-lab.js --file=src/content/topics/operations/full-recovery-rpo/lab-my-lab.ts
 *   node scripts/register-lab.js --file=./src/content/topics/query/rich-query/lab-rich-query-basics.ts
 *
 * - Adds import and allLabs entry in src/content/topics/index.ts
 * - If the POV folder (enhancement prefix) is not in the loader, adds it to
 *   src/labs/enhancements/loader.ts (moduleMap and preloadAllEnhancements)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function getArg(name, fallback = null) {
  const args = process.argv.slice(2);
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.slice(`--${name}=`.length).replace(/^["']|["']$/g, '');
  return fallback;
}

const labFilePath = getArg('file');
if (!labFilePath) {
  console.error('Error: --file is required');
  console.error('Usage: node scripts/register-lab.js --file=src/content/topics/<topic>/<pov>/lab-<name>.ts');
  process.exit(1);
}

const absoluteLabPath = path.isAbsolute(labFilePath)
  ? labFilePath
  : path.join(rootDir, labFilePath.replace(/^\.\//, ''));

if (!fs.existsSync(absoluteLabPath)) {
  console.error(`Error: Lab file not found: ${absoluteLabPath}`);
  process.exit(1);
}

// Path from repo root: e.g. src/content/topics/operations/full-recovery-rpo/lab-my-lab.ts
const relativeFromRoot = path.relative(rootDir, absoluteLabPath).replace(/\\/g, '/');
const match = relativeFromRoot.match(/^src\/content\/topics\/([^/]+)\/([^/]+)\/(lab-[^.]+)\.ts$/);
if (!match) {
  console.error(
    'Error: File path must be src/content/topics/<topic>/<pov>/lab-<name>.ts (e.g. src/content/topics/operations/full-recovery-rpo/lab-my-lab.ts)'
  );
  process.exit(1);
}

const [, topicId, povFolder, labBasename] = match;
const importPathForIndex = `./${topicId}/${povFolder}/${labBasename}`;

// Extract export name from lab file: export const labXxxDefinition: WorkshopLabDefinition
const labContent = fs.readFileSync(absoluteLabPath, 'utf8');
const exportMatch = labContent.match(/export\s+const\s+(\w+)\s*:\s*WorkshopLabDefinition/);
if (!exportMatch) {
  console.error('Error: Could not find "export const X: WorkshopLabDefinition" in lab file');
  process.exit(1);
}
const exportName = exportMatch[1];

const indexPath = path.join(rootDir, 'src/content/topics/index.ts');
const loaderPath = path.join(rootDir, 'src/labs/enhancements/loader.ts');

let indexContent = fs.readFileSync(indexPath, 'utf8');
let loaderContent = fs.readFileSync(loaderPath, 'utf8');

// Check if already registered in index
if (indexContent.includes(exportName) && indexContent.includes(importPathForIndex)) {
  console.log(`Lab ${exportName} is already registered in index.ts.`);
} else {
  // Add import (before "/** All workshop topics */" if not already present)
  const newImport = `import { ${exportName} } from '${importPathForIndex}';\n`;
  if (!indexContent.includes(`from '${importPathForIndex}'`)) {
    indexContent = indexContent.replace(
      /(\n)(\/\*\* All workshop topics \*\*\/)/,
      `$1${newImport.trim()}$1$2`
    );
  }

  // Add to allLabs array (insert new entry before the closing ]; of allLabs)
  if (!indexContent.includes(`${exportName},`) && !indexContent.includes(`${exportName}\n`)) {
    const allLabsStart = indexContent.indexOf('export const allLabs: WorkshopLabDefinition[] = [');
    const allLabsEnd = indexContent.indexOf('\n];', allLabsStart);
    if (allLabsEnd !== -1) {
      const beforeClosing = indexContent.slice(0, allLabsEnd);
      const separator = beforeClosing.trimEnd().endsWith(',') ? '\n  ' : ',\n  ';
      indexContent =
        beforeClosing + separator + exportName + indexContent.slice(allLabsEnd);
    }
  }

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`✅ Registered lab in src/content/topics/index.ts (import + allLabs): ${exportName}`);
}

// Check if prefix is in loader
const loaderPrefixPattern = new RegExp(`['"]${povFolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*:\\s*\\(\\)\\s*=>\\s*import`);
if (loaderContent.match(loaderPrefixPattern)) {
  console.log(`Loader already has prefix '${povFolder}'. No loader changes.`);
} else {
  const importPathForLoader = `@/content/topics/${topicId}/${povFolder}/enhancements`;
  const newLoaderLine = `    '${povFolder}': () => import('${importPathForLoader}'),\n`;

  // Insert in moduleMap: add new line before the closing "  };"
  const closingIdx = loaderContent.lastIndexOf('  };');
  if (closingIdx === -1) {
    console.warn('Could not find moduleMap closing in loader; skipping loader update.');
  } else {
    loaderContent =
      loaderContent.slice(0, closingIdx) + newLoaderLine + loaderContent.slice(closingIdx);
  }

  // Add to preloadAllEnhancements prefixes array
  const preloadMatch = loaderContent.match(/const prefixes = \[([\s\S]*?)\];/);
  if (preloadMatch) {
    const list = preloadMatch[1];
    if (!list.includes(`'${povFolder}'`)) {
      const trimmed = list.trimEnd();
      const newList = trimmed.endsWith(',') ? trimmed + `\n    '${povFolder}'` : trimmed + `,\n    '${povFolder}'`;
      loaderContent = loaderContent.replace(
        /(const prefixes = \[)([\s\S]*?)(\];)/,
        `$1${newList}$3`
      );
    }
  }

  fs.writeFileSync(loaderPath, loaderContent, 'utf8');
  console.log(`✅ Added prefix '${povFolder}' to src/labs/enhancements/loader.ts (moduleMap + preloadAllEnhancements)`);
}

console.log('\nNext: run node scripts/validate-content.js and test the app.');
