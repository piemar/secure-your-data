#!/usr/bin/env node
/**
 * Lab editor wrapper: used as EDITOR when running mongosh (or shell) in the lab terminal.
 * When mongosh calls .edit(), this script opens the file in the lab's inline Monaco editor
 * (via /api/lab-editor-open and /api/lab-editor-save). Set LAB_EDITOR_SERVER_URL in the PTY env.
 *
 * Usage: node scripts/lab-editor-wrapper.cjs <filepath>
 */
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write('lab-editor-wrapper: missing file path\n');
  process.exit(1);
}

const baseUrl = process.env.LAB_EDITOR_SERVER_URL || 'http://127.0.0.1:5173';

let content = '';
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (e) {
  content = '';
}

async function main() {
  const openRes = await fetch(`${baseUrl}/api/lab-editor-open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, content }),
  });
  if (!openRes.ok) {
    process.stderr.write(`lab-editor-wrapper: open failed ${openRes.status}\n`);
    process.exit(1);
  }
  const { requestId } = await openRes.json();
  if (!requestId) {
    process.stderr.write('lab-editor-wrapper: no requestId\n');
    process.exit(1);
  }

  while (true) {
    await new Promise((r) => setTimeout(r, 500));
    const statusRes = await fetch(`${baseUrl}/api/lab-editor-status?requestId=${encodeURIComponent(requestId)}`);
    if (!statusRes.ok) break;
    const { status } = await statusRes.json();
    if (status === 'saved') break;
  }
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(`lab-editor-wrapper: ${e.message}\n`);
  process.exit(1);
});
