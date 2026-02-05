#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * Validates workshop content (labs, quests, topics, templates) for:
 * - Schema compliance
 * - POV mapping validity
 * - Proof exercise references
 * - Topic validation
 * - Mode validation
 * - ID uniqueness
 * - Reference integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Recursively find lab files in topics/ (topic-centric structure)
function findLabFiles(dir, baseDir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue; // skip _fixtures etc.
      findLabFiles(fullPath, baseDir, files);
    } else if (entry.name.endsWith('.ts') && entry.name.startsWith('lab-') && !entry.name.includes('test')) {
      files.push({ fullPath, relPath, file: relPath });
    }
  }
  return files;
}

// Load content dynamically (topic-centric structure: content/topics/<topic>/topic.ts, <topic>/<pov>/lab-*.ts)
async function loadContent() {
  const contentPath = path.join(__dirname, '../src/content');
  
  // Load POV capabilities
  const povCapabilitiesPath = path.join(contentPath, 'pov-capabilities.ts');
  const povContent = fs.readFileSync(povCapabilitiesPath, 'utf8');
  const povMatches = [...povContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)];
  const povIds = povMatches.map(m => m[1]);
  
  // Load topics from topics/<id>/topic.ts
  const topicsPath = path.join(contentPath, 'topics');
  const topicIds = [];
  const topicDirs = fs.readdirSync(topicsPath, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_'));
  for (const dir of topicDirs) {
    const topicFile = path.join(topicsPath, dir.name, 'topic.ts');
    if (fs.existsSync(topicFile)) {
      const content = fs.readFileSync(topicFile, 'utf8');
      const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch) topicIds.push(idMatch[1]);
    }
  }
  
  // Load labs from topics/ recursively
  const labEntries = findLabFiles(topicsPath, topicsPath);
  const labs = [];
  for (const { fullPath, file } of labEntries) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      const topicMatch = content.match(/topicId:\s*['"]([^'"]+)['"]/);
      const povMatch = content.match(/povCapabilities:\s*\[(.*?)\]/s);
      const modesMatch = content.match(/modes:\s*\[(.*?)\]/s);
      const stepsMatch = content.match(/steps:\s*\[(.*?)\]/s);
      
      let povCapabilities = [];
      if (povMatch) {
        const povArrayContent = povMatch[1];
        const povIdMatches = [...povArrayContent.matchAll(/['"]([^'"]+)['"]/g)];
        povCapabilities = povIdMatches.map(m => m[1]);
      }
      
      let modes = [];
      if (modesMatch) {
        const modesArrayContent = modesMatch[1];
        const modeMatches = [...modesArrayContent.matchAll(/['"]([^'"]+)['"]/g)];
        modes = modeMatches.map(m => m[1]);
      }
      
      labs.push({
        id: idMatch[1],
        file: file,
        filePath: fullPath,
        topicId: topicMatch ? topicMatch[1] : null,
        povCapabilities: povCapabilities,
        modes: modes,
        steps: stepsMatch ? (stepsMatch[1].match(/id:/g) || []).length : 0,
      });
    }
  }
  
  // Load quests
  const questsPath = path.join(contentPath, 'quests');
  const questFiles = fs.readdirSync(questsPath).filter(f => f.endsWith('.ts') && !f.includes('test'));
  const quests = [];
  for (const file of questFiles) {
    const content = fs.readFileSync(path.join(questsPath, file), 'utf8');
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      const labMatches = content.match(/labIds:\s*\[(.*?)\]/s);
      const flagMatches = content.match(/requiredFlagIds:\s*\[(.*?)\]/s);
      
      quests.push({
        id: idMatch[1],
        file: file,
        labIds: labMatches ? [...labMatches[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]) : [],
        requiredFlagIds: flagMatches ? [...flagMatches[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]) : [],
      });
    }
  }
  
  return { povIds, topicIds, labs, quests };
}

// Validation functions
function validateSchema(labs, quests) {
  const errors = [];
  const warnings = [];
  
  // Validate lab schema
  for (const lab of labs) {
    if (!lab.id) errors.push(`Lab missing id: ${lab.file}`);
    if (!lab.topicId) errors.push(`Lab ${lab.id} missing topicId`);
    if (lab.steps === 0) warnings.push(`Lab ${lab.id} has no steps`);
    if (!lab.modes || lab.modes.length === 0) warnings.push(`Lab ${lab.id} has no modes specified`);
  }
  
  // Validate quest schema
  for (const quest of quests) {
    if (!quest.id) errors.push(`Quest missing id: ${quest.file}`);
    if (!quest.labIds || quest.labIds.length === 0) warnings.push(`Quest ${quest.id} has no labIds`);
  }
  
  return { errors, warnings };
}

function validatePovMapping(labs, povIds) {
  const errors = [];
  const warnings = [];
  
  for (const lab of labs) {
    for (const povId of lab.povCapabilities) {
      if (!povIds.includes(povId)) {
        errors.push(`Lab ${lab.id} references invalid POV capability: ${povId}`);
      }
    }
    if (lab.povCapabilities.length === 0) {
      warnings.push(`Lab ${lab.id} has no POV capabilities specified`);
    }
  }
  
  return { errors, warnings };
}

function validateTopics(labs, topicIds) {
  const errors = [];
  
  for (const lab of labs) {
    if (lab.topicId && !topicIds.includes(lab.topicId)) {
      errors.push(`Lab ${lab.id} references invalid topic: ${lab.topicId}`);
    }
  }
  
  return { errors, warnings: [] };
}

function validateModes(labs, quests) {
  const validModes = ['demo', 'lab', 'challenge'];
  const errors = [];
  const warnings = [];
  
  for (const lab of labs) {
    for (const mode of lab.modes) {
      if (!validModes.includes(mode)) {
        errors.push(`Lab ${lab.id} has invalid mode: ${mode}`);
      }
    }
  }
  
  return { errors, warnings };
}

function validateIdUniqueness(labs, quests) {
  const errors = [];
  const labIds = new Set();
  const questIds = new Set();
  
  for (const lab of labs) {
    if (labIds.has(lab.id)) {
      errors.push(`Duplicate lab ID: ${lab.id}`);
    }
    labIds.add(lab.id);
  }
  
  for (const quest of quests) {
    if (questIds.has(quest.id)) {
      errors.push(`Duplicate quest ID: ${quest.id}`);
    }
    questIds.add(quest.id);
  }
  
  return { errors, warnings: [] };
}

function validateReferenceIntegrity(labs, quests) {
  const errors = [];
  const warnings = [];
  const labIds = new Set(labs.map(l => l.id));
  
  for (const quest of quests) {
    for (const labId of quest.labIds) {
      if (!labIds.has(labId)) {
        errors.push(`Quest ${quest.id} references non-existent lab: ${labId}`);
      }
    }
  }
  
  return { errors, warnings };
}

function validateProofReferences(labs) {
  const warnings = [];
  
  for (const lab of labs) {
    const labFilePath = lab.filePath || path.join(__dirname, '../src/content/topics', lab.file);
    const labContent = fs.readFileSync(labFilePath, 'utf8');
    
    if (!labContent.includes('proofs/') && !labContent.includes('proof exercise')) {
      warnings.push(`Lab ${lab.id} has no proof exercise reference in comments`);
    }
  }
  
  return { errors: [], warnings };
}

// Main validation function
async function validate() {
  logInfo('Starting content validation...\n');
  
  const { povIds, topicIds, labs, quests } = await loadContent();
  
  logInfo(`Loaded ${labs.length} labs, ${quests.length} quests, ${topicIds.length} topics, ${povIds.length} POV capabilities\n`);
  
  const allErrors = [];
  const allWarnings = [];
  
  // Run all validations
  logInfo('Validating schema...');
  const schemaResult = validateSchema(labs, quests);
  allErrors.push(...schemaResult.errors);
  allWarnings.push(...schemaResult.warnings);
  
  logInfo('Validating POV mappings...');
  const povResult = validatePovMapping(labs, povIds);
  allErrors.push(...povResult.errors);
  allWarnings.push(...povResult.warnings);
  
  logInfo('Validating topics...');
  const topicResult = validateTopics(labs, topicIds);
  allErrors.push(...topicResult.errors);
  allWarnings.push(...topicResult.warnings);
  
  logInfo('Validating modes...');
  const modeResult = validateModes(labs, quests);
  allErrors.push(...modeResult.errors);
  allWarnings.push(...modeResult.warnings);
  
  logInfo('Validating ID uniqueness...');
  const uniquenessResult = validateIdUniqueness(labs, quests);
  allErrors.push(...uniquenessResult.errors);
  allWarnings.push(...uniquenessResult.warnings);
  
  logInfo('Validating reference integrity...');
  const integrityResult = validateReferenceIntegrity(labs, quests);
  allErrors.push(...integrityResult.errors);
  allWarnings.push(...integrityResult.warnings);
  
  logInfo('Validating proof exercise references...');
  const proofResult = validateProofReferences(labs);
  allErrors.push(...proofResult.errors);
  allWarnings.push(...proofResult.warnings);
  
  // Report results
  console.log('\n' + '='.repeat(60));
  logInfo('Validation Results:');
  console.log('='.repeat(60) + '\n');
  
  if (allErrors.length === 0 && allWarnings.length === 0) {
    logSuccess('All validations passed!');
    process.exit(0);
  }
  
  if (allErrors.length > 0) {
    logError(`Found ${allErrors.length} error(s):`);
    allErrors.forEach(err => logError(`  - ${err}`));
    console.log('');
  }
  
  if (allWarnings.length > 0) {
    logWarning(`Found ${allWarnings.length} warning(s):`);
    allWarnings.forEach(warn => logWarning(`  - ${warn}`));
    console.log('');
  }
  
  // Exit with error code if there are errors
  if (allErrors.length > 0) {
    process.exit(1);
  }
  
  process.exit(0);
}

// Run validation
validate().catch(err => {
  logError(`Validation failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
