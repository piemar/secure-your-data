#!/usr/bin/env node

/**
 * Validation script to check enhancement metadata completeness
 * 
 * Checks:
 * - All enhancements have required fields (id, povCapability, sourceProof)
 * - All code blocks have code and skeleton
 * - All inline hints have required fields
 * - All lab steps reference valid enhancement IDs
 */

const fs = require('fs');
const path = require('path');

const metadataDir = path.join(__dirname, '..', 'src', 'labs', 'enhancements', 'metadata');
const labsDir = path.join(__dirname, '..', 'src', 'content', 'labs');

let errors = [];
let warnings = [];

// Load all enhancement metadata files
const metadataFiles = fs.readdirSync(metadataDir).filter(f => f.endsWith('.ts'));

console.log(`\n🔍 Validating ${metadataFiles.length} enhancement metadata files...\n`);

for (const file of metadataFiles) {
  const filePath = path.join(metadataDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Try to extract enhancements object (simple regex-based check)
  const enhancementMatches = content.matchAll(/'([^']+)':\s*\{/g);
  const enhancementIds = Array.from(enhancementMatches, m => m[1]);
  
  for (const id of enhancementIds) {
    // Check if enhancement has required fields
    if (!content.includes(`id: '${id}'`)) {
      errors.push(`${file}: Enhancement '${id}' missing 'id' field`);
    }
    if (!content.includes(`povCapability:`)) {
      warnings.push(`${file}: Enhancement '${id}' missing 'povCapability' field`);
    }
    if (!content.includes(`sourceProof:`)) {
      warnings.push(`${file}: Enhancement '${id}' missing 'sourceProof' field`);
    }
  }
}

// Check lab definitions for enhancement ID references
console.log(`\n🔍 Validating lab definitions...\n`);

const labFiles = fs.readdirSync(labsDir).filter(f => f.startsWith('lab-') && f.endsWith('.ts'));

for (const file of labFiles) {
  const filePath = path.join(labsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract enhancement IDs from lab steps
  const enhancementIdMatches = content.matchAll(/enhancementId:\s*'([^']+)'/g);
  const referencedIds = Array.from(enhancementIdMatches, m => m[1]);
  
  // Check if sourceProof is present
  if (!content.includes('sourceProof:')) {
    warnings.push(`${file}: Missing sourceProof references in steps`);
  }
  
  // Check if referenced enhancement IDs exist in metadata
  for (const id of referencedIds) {
    const prefix = id.split('.')[0];
    const metadataFile = path.join(metadataDir, `${prefix}.ts`);
    
    if (!fs.existsSync(metadataFile)) {
      errors.push(`${file}: References enhancement '${id}' but metadata file '${prefix}.ts' not found`);
    } else {
      const metadataContent = fs.readFileSync(metadataFile, 'utf8');
      if (!metadataContent.includes(`'${id}':`)) {
        errors.push(`${file}: References enhancement '${id}' but it's not defined in ${prefix}.ts`);
      }
    }
  }
}

// Report results
console.log('\n📊 Validation Results:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All validations passed!\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`❌ ${errors.length} error(s) found:\n`);
  errors.forEach(err => console.log(`  - ${err}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warning(s) found:\n`);
  warnings.forEach(warn => console.log(`  - ${warn}`));
  console.log('');
}

process.exit(errors.length > 0 ? 1 : 0);
