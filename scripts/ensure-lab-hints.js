#!/usr/bin/env node

/**
 * Ensures every step in every lab has at least 3 hints.
 * For steps that have no hints, adds three generic hints before the step's closing "},"
 *
 * Run from repo root: node scripts/ensure-lab-hints.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_ROOT = path.join(__dirname, '../src/content/topics');

const DEFAULT_HINTS = [
  'Review the step instructions and narrative above for what to do.',
  'Check the lab folder path or source proof document for detailed guidance.',
  'Use "Check my progress" or verification when available to confirm completion.',
];

const HINTS_INSERT = `
      hints: [
        '${DEFAULT_HINTS[0].replace(/'/g, "\\'")}',
        '${DEFAULT_HINTS[1].replace(/'/g, "\\'")}',
        '${DEFAULT_HINTS[2].replace(/'/g, "\\'")}',
      ],`;

function findLabFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findLabFiles(full, list);
    else if (e.name.startsWith('lab-') && e.name.endsWith('.ts')) list.push(full);
  }
  return list;
}

function ensureHintsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('steps:') || !content.includes("id: 'lab-")) return { changed: false, stepsFixed: 0 };

  const delimiter = '\n    },\n';
  const parts = content.split(delimiter);
  let stepsFixed = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.includes("id: 'lab-") || part.includes('hints:')) continue;

    // Insert at end of step block (before the "    }," that was split off)
    parts[i] = part.trimEnd() + '\n' + HINTS_INSERT;
    stepsFixed++;
  }

  const newContent = parts.join(delimiter);
  if (stepsFixed > 0) fs.writeFileSync(filePath, newContent, 'utf8');
  return { changed: stepsFixed > 0, stepsFixed };
}

const labFiles = findLabFiles(TOPICS_ROOT);
let totalFixed = 0;
const modified = [];

for (const file of labFiles) {
  const rel = path.relative(process.cwd(), file);
  const result = ensureHintsInFile(file);
  if (result.changed) {
    modified.push(rel);
    totalFixed += result.stepsFixed;
  }
}

if (modified.length > 0) {
  console.log('Added hints to steps in', modified.length, 'lab(s)');
  modified.forEach((f) => console.log('  -', f));
  console.log('Total steps updated:', totalFixed);
} else {
  console.log('All lab steps already have at least 3 hints. No files changed.');
}
