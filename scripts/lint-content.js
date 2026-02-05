#!/usr/bin/env node

/**
 * Content Linting Script
 * 
 * Lints workshop content for:
 * - Naming convention enforcement
 * - Description quality checks
 * - Step count warnings
 * - Mode coverage warnings
 * - Proof exercise coverage checks
 * - Code block syntax validation
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
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
      if (entry.name.startsWith('_')) continue;
      findLabFiles(fullPath, baseDir, files);
    } else if (entry.name.endsWith('.ts') && entry.name.startsWith('lab-') && !entry.name.includes('test')) {
      files.push({ fullPath, relPath, file: path.basename(relPath) });
    }
  }
  return files;
}

// Load labs from topic-centric structure (content/topics/<topic>/<pov?>/lab-*.ts)
function loadLabs() {
  const topicsPath = path.join(__dirname, '../src/content/topics');
  const labEntries = findLabFiles(topicsPath, topicsPath);
  const labs = [];
  
  for (const { fullPath, file } of labEntries) {
    const filePath = fullPath;
    const content = fs.readFileSync(filePath, 'utf8');
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    
    if (idMatch) {
      const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
      const stepsMatch = content.match(/steps:\s*\[(.*?)\]/s);
      const modesMatch = content.match(/modes:\s*\[(.*?)\]/s);
      const povMatch = content.match(/povCapabilities:\s*\[(.*?)\]/s);
      
      // Count steps - look for step objects with id fields
      let stepCount = 0;
      if (stepsMatch) {
        // Count step objects by looking for step id patterns
        const stepIdPattern = /id:\s*['"]([^'"]+)['"]/g;
        const stepMatches = [...stepsMatch[1].matchAll(stepIdPattern)];
        stepCount = stepMatches.length;
        // If no matches, try counting by opening braces (simpler fallback)
        if (stepCount === 0) {
          const braceCount = (stepsMatch[1].match(/{/g) || []).length;
          stepCount = braceCount > 0 ? braceCount : 0;
        }
      }
      
      // Extract modes
      let modes = [];
      if (modesMatch) {
        const modesArrayContent = modesMatch[1];
        const modeMatches = [...modesArrayContent.matchAll(/['"]([^'"]+)['"]/g)];
        modes = modeMatches.map(m => m[1]);
      }
      
      // Extract POV capabilities
      let povCapabilities = [];
      if (povMatch) {
        const povArrayContent = povMatch[1];
        const povIdMatches = [...povArrayContent.matchAll(/['"]([^'"]+)['"]/g)];
        povCapabilities = povIdMatches.map(m => m[1]);
      }
      
      labs.push({
        id: idMatch[1],
        file: file,
        filePath: filePath,
        title: titleMatch ? titleMatch[1] : '',
        description: descMatch ? descMatch[1] : '',
        stepCount: stepCount,
        modes: modes,
        povCapabilities: povCapabilities,
        content: content,
      });
    }
  }
  
  return labs;
}

// Linting functions
function checkNamingConventions(labs) {
  const warnings = [];
  
  for (const lab of labs) {
    // Check lab ID follows convention: lab-{kebab-case}
    if (!lab.id.startsWith('lab-')) {
      warnings.push(`Lab ${lab.id} doesn't follow naming convention (should start with 'lab-')`);
    }
    
    // Check lab ID matches filename (lab.file is basename, e.g. lab-csfle-fundamentals.ts)
    const baseName = lab.file.replace('.ts', '');
    const expectedId = baseName.startsWith('lab-') ? baseName : `lab-${baseName}`;
    if (lab.id !== expectedId && lab.id !== baseName) {
      warnings.push(`Lab ${lab.id} ID doesn't match filename ${lab.file}`);
    }
    
    // Check title starts with "Lab" or descriptive name
    if (!lab.title.match(/^(Lab \d+:|Lab:)/i) && lab.title.length < 10) {
      warnings.push(`Lab ${lab.id} title might be too short or doesn't follow convention`);
    }
  }
  
  return warnings;
}

function checkDescriptionQuality(labs) {
  const warnings = [];
  
  for (const lab of labs) {
    // Check description length
    if (lab.description.length < 20) {
      warnings.push(`Lab ${lab.id} description is too short (${lab.description.length} chars, minimum 20)`);
    }
    
    if (lab.description.length > 200) {
      warnings.push(`Lab ${lab.id} description is very long (${lab.description.length} chars, consider shortening)`);
    }
    
    // Check for common issues
    if (lab.description.toLowerCase().includes('todo') || lab.description.toLowerCase().includes('fixme')) {
      warnings.push(`Lab ${lab.id} description contains TODO/FIXME`);
    }
  }
  
  return warnings;
}

function checkStepCount(labs) {
  const warnings = [];
  
  for (const lab of labs) {
    // Minimum 3 steps per lab
    if (lab.stepCount < 3) {
      warnings.push(`Lab ${lab.id} has only ${lab.stepCount} step(s), minimum recommended is 3`);
    }
    
    // Warn if too many steps (might be overwhelming)
    if (lab.stepCount > 15) {
      warnings.push(`Lab ${lab.id} has ${lab.stepCount} steps, consider splitting into multiple labs`);
    }
  }
  
  return warnings;
}

function checkModeCoverage(labs) {
  const warnings = [];
  const validModes = ['demo', 'lab', 'challenge'];
  
  for (const lab of labs) {
    // Check if lab supports all modes
    if (!lab.modes || lab.modes.length === 0) {
      warnings.push(`Lab ${lab.id} has no modes specified`);
    } else {
      // Check if lab supports at least 2 modes (for reusability)
      if (lab.modes.length < 2) {
        warnings.push(`Lab ${lab.id} only supports ${lab.modes.length} mode(s), consider adding more for better reusability`);
      }
      
      // Check for invalid modes
      for (const mode of lab.modes) {
        if (!validModes.includes(mode)) {
          warnings.push(`Lab ${lab.id} has invalid mode: ${mode}`);
        }
      }
    }
  }
  
  return warnings;
}

function checkProofExerciseCoverage(labs) {
  const warnings = [];
  const proofPath = path.join(__dirname, '../Docs/pov-proof-exercises/proofs');
  
  for (const lab of labs) {
    // Check if lab has proof reference
    if (!lab.content.includes('proofs/') && !lab.content.includes('proof exercise')) {
      warnings.push(`Lab ${lab.id} has no proof exercise reference`);
    }
    
    // Check if POV capabilities are mapped
    if (lab.povCapabilities.length === 0) {
      warnings.push(`Lab ${lab.id} has no POV capabilities mapped`);
    }
    
    // Check if proof files exist for POV capabilities
    for (const povId of lab.povCapabilities) {
      // Try to find proof number from POV ID (this is a simplified check)
      // In a real implementation, we'd look up the proof number from pov-capabilities.ts
      const proofDir = path.join(proofPath);
      if (fs.existsSync(proofDir)) {
        // Check if any proof directory exists (simplified)
        // Full implementation would map POV ID to proof number
      }
    }
  }
  
  return warnings;
}

function checkCodeBlockSyntax(labs) {
  const warnings = [];
  
  for (const lab of labs) {
    // Check for code blocks in content
    const codeBlockMatches = [...lab.content.matchAll(/```(\w+)?\n([\s\S]*?)```/g)];
    
    for (const match of codeBlockMatches) {
      const language = match[1] || 'unknown';
      const code = match[2];
      
      // Basic syntax checks
      if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
        // Check for common issues
        if (code.includes('TODO') || code.includes('FIXME')) {
          warnings.push(`Lab ${lab.id} contains TODO/FIXME in code block`);
        }
        
        // Check for unclosed brackets (basic check)
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          warnings.push(`Lab ${lab.id} code block may have unclosed braces (${openBraces} open, ${closeBraces} close)`);
        }
      }
    }
  }
  
  return warnings;
}

// Main linting function
async function lint() {
  logInfo('Starting content linting...\n');
  
  const labs = loadLabs();
  logInfo(`Loaded ${labs.length} labs\n`);
  
  const allWarnings = [];
  
  // Run all linting checks
  logInfo('Checking naming conventions...');
  allWarnings.push(...checkNamingConventions(labs));
  
  logInfo('Checking description quality...');
  allWarnings.push(...checkDescriptionQuality(labs));
  
  logInfo('Checking step counts...');
  allWarnings.push(...checkStepCount(labs));
  
  logInfo('Checking mode coverage...');
  allWarnings.push(...checkModeCoverage(labs));
  
  logInfo('Checking proof exercise coverage...');
  allWarnings.push(...checkProofExerciseCoverage(labs));
  
  logInfo('Checking code block syntax...');
  allWarnings.push(...checkCodeBlockSyntax(labs));
  
  // Report results
  console.log('\n' + '='.repeat(60));
  logInfo('Linting Results:');
  console.log('='.repeat(60) + '\n');
  
  if (allWarnings.length === 0) {
    log('✅ All linting checks passed!', 'green');
    process.exit(0);
  }
  
  logWarning(`Found ${allWarnings.length} warning(s):`);
  allWarnings.forEach(warn => logWarning(`  - ${warn}`));
  console.log('');
  
  process.exit(0);
}

// Run linting
lint().catch(err => {
  log(`❌ Linting failed: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
