#!/usr/bin/env node

/**
 * Content Auto-Registration Script
 * 
 * Automatically registers new content (labs, quests, topics, templates) into contentService.ts:
 * - Auto-generates import statements
 * - Auto-inserts into contentService.ts arrays
 * - Conflict detection
 * - Backup creation
 * - Dry-run mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes
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

// Parse command line arguments
function getArg(name, fallback = null) {
  const args = process.argv.slice(2);
  const arg = args.find(a => a.startsWith(`--${name}=`));
  if (arg) {
    return arg.split('=')[1];
  }
  const flagIndex = args.indexOf(`--${name}`);
  if (flagIndex !== -1 && args[flagIndex + 1] && !args[flagIndex + 1].startsWith('--')) {
    return args[flagIndex + 1];
  }
  return fallback;
}

// Discover new content files
function discoverNewContent(contentDir, type) {
  const typeDir = path.join(contentDir, type);
  if (!fs.existsSync(typeDir)) {
    return [];
  }
  
  const files = fs.readdirSync(typeDir)
    .filter(f => f.endsWith('.ts') && !f.includes('test'))
    .map(f => ({
      file: f,
      path: path.join(typeDir, f),
      importPath: `../content/${type}/${f.replace('.ts', '')}`,
    }));
  
  return files;
}

// Extract export name from file
function extractExportName(filePath, type) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for export const {name}Definition pattern
  const patterns = {
    lab: /export\s+const\s+(\w+Definition)\s*=/,
    quest: /export\s+const\s+(\w+Quest)\s*=/,
    topic: /export\s+const\s+(\w+Topic)\s*=/,
    template: /export\s+const\s+(\w+Template)\s*=/,
  };
  
  const pattern = patterns[type];
  if (pattern) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Check if import already exists
function importExists(contentServiceContent, importPath, exportName) {
  // Check for import statement
  const importPattern = new RegExp(`import\\s+.*from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
  return importPattern.test(contentServiceContent);
}

// Check if item already in array
function itemInArray(contentServiceContent, arrayName, exportName) {
  // Find the array declaration
  const arrayPattern = new RegExp(`private\\s+${arrayName}:\\s*\\w+\\[\\]\\s*=\\s*\\[(.*?)\\];`, 's');
  const match = contentServiceContent.match(arrayPattern);
  
  if (match) {
    const arrayContent = match[1];
    return arrayContent.includes(exportName);
  }
  
  return false;
}

// Generate import statement
function generateImport(importPath, exportName) {
  return `import { ${exportName} } from '${importPath}';`;
}

// Insert import into contentService
function insertImport(contentServiceContent, importStatement) {
  // Find the last import statement
  const importPattern = /^import\s+.*$/gm;
  const imports = contentServiceContent.match(importPattern) || [];
  
  if (imports.length === 0) {
    // No imports, add at top
    return `${importStatement}\n${contentServiceContent}`;
  }
  
  // Insert after last import
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = contentServiceContent.lastIndexOf(lastImport);
  const insertIndex = lastImportIndex + lastImport.length;
  
  return contentServiceContent.slice(0, insertIndex) + '\n' + importStatement + contentServiceContent.slice(insertIndex);
}

// Insert item into array
function insertIntoArray(contentServiceContent, arrayName, exportName) {
  const arrayPattern = new RegExp(`(private\\s+${arrayName}:\\s*\\w+\\[\\]\\s*=\\s*\\[)(.*?)(\\];)`, 's');
  const match = contentServiceContent.match(arrayPattern);
  
  if (!match) {
    throw new Error(`Could not find ${arrayName} array in contentService.ts`);
  }
  
  const arrayContent = match[2].trim();
  const items = arrayContent.split(',').map(i => i.trim()).filter(Boolean);
  
  // Add new item (alphabetically sorted)
  items.push(exportName);
  items.sort();
  
  const newArrayContent = items.map((item, index) => {
    const indent = '    ';
    const comma = index < items.length - 1 ? ',' : '';
    return `${indent}${item}${comma}`;
  }).join('\n');
  
  return contentServiceContent.replace(arrayPattern, `$1\n${newArrayContent}\n  $3`);
}

// Create backup
function createBackup(filePath) {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Main registration function
async function registerContent() {
  const dryRun = getArg('dry-run', 'false') === 'true';
  const contentType = getArg('type'); // lab, quest, topic, template
  const contentFile = getArg('file'); // specific file to register
  
  logInfo('Content Auto-Registration Tool\n');
  
  if (dryRun) {
    logWarning('DRY RUN MODE - No changes will be made\n');
  }
  
  const contentServicePath = path.join(__dirname, '../src/services/contentService.ts');
  const contentDir = path.join(__dirname, '../src/content');
  
  if (!fs.existsSync(contentServicePath)) {
    logError(`contentService.ts not found at ${contentServicePath}`);
    process.exit(1);
  }
  
  let contentServiceContent = fs.readFileSync(contentServicePath, 'utf8');
  
  // Discover content to register
  let contentToRegister = [];
  
  if (contentFile) {
    // Register specific file
    const filePath = path.resolve(contentFile);
    const type = contentType || 'labs'; // default to labs
    const exportName = extractExportName(filePath, type);
    
    if (!exportName) {
      logError(`Could not extract export name from ${filePath}`);
      process.exit(1);
    }
    
    const relativePath = path.relative(path.dirname(contentServicePath), filePath).replace(/\\/g, '/').replace('.ts', '');
    contentToRegister.push({
      type: type,
      file: path.basename(filePath),
      path: filePath,
      importPath: relativePath.startsWith('.') ? relativePath : `./${relativePath}`,
      exportName: exportName,
    });
  } else {
    // Discover all new content
    const types = ['labs', 'quests', 'topics', 'workshop-templates'];
    
    for (const type of types) {
      const files = discoverNewContent(contentDir, type);
      
      for (const file of files) {
        const exportName = extractExportName(file.path, type.replace('workshop-templates', 'template').replace(/s$/, ''));
        
        if (exportName) {
          // Check if already registered
          const importPath = file.importPath;
          const alreadyImported = importExists(contentServiceContent, importPath, exportName);
          
          const arrayName = type === 'workshop-templates' ? 'templates' : type;
          const alreadyInArray = itemInArray(contentServiceContent, arrayName, exportName);
          
          if (!alreadyImported || !alreadyInArray) {
            contentToRegister.push({
              type: type.replace('workshop-templates', 'template').replace(/s$/, ''),
              file: file.file,
              path: file.path,
              importPath: importPath,
              exportName: exportName,
              needsImport: !alreadyImported,
              needsArrayInsert: !alreadyInArray,
            });
          }
        }
      }
    }
  }
  
  if (contentToRegister.length === 0) {
    logSuccess('No new content to register!');
    process.exit(0);
  }
  
  logInfo(`Found ${contentToRegister.length} item(s) to register:\n`);
  contentToRegister.forEach(item => {
    log(`  - ${item.type}: ${item.exportName} (${item.file})`, 'blue');
  });
  console.log('');
  
  if (dryRun) {
    logWarning('Dry run complete. Use without --dry-run to apply changes.');
    process.exit(0);
  }
  
  // Create backup
  const backupPath = createBackup(contentServicePath);
  logSuccess(`Backup created: ${backupPath}\n`);
  
  // Apply changes
  let changesMade = false;
  
  for (const item of contentToRegister) {
    try {
      // Add import if needed
      if (item.needsImport) {
        const importStatement = generateImport(item.importPath, item.exportName);
        contentServiceContent = insertImport(contentServiceContent, importStatement);
        logSuccess(`Added import: ${item.exportName}`);
        changesMade = true;
      }
      
      // Add to array if needed
      if (item.needsArrayInsert) {
        const arrayName = item.type === 'template' ? 'templates' : `${item.type}s`;
        contentServiceContent = insertIntoArray(contentServiceContent, arrayName, item.exportName);
        logSuccess(`Added ${item.exportName} to ${arrayName} array`);
        changesMade = true;
      }
    } catch (error) {
      logError(`Failed to register ${item.exportName}: ${error.message}`);
      // Restore backup on error
      fs.copyFileSync(backupPath, contentServicePath);
      logError('Changes rolled back. Backup restored.');
      process.exit(1);
    }
  }
  
  if (changesMade) {
    // Write updated contentService
    fs.writeFileSync(contentServicePath, contentServiceContent, 'utf8');
    logSuccess('\n✅ Content registration complete!');
    logInfo(`Backup available at: ${backupPath}`);
  } else {
    logInfo('No changes needed - all content already registered.');
  }
}

// Run registration
registerContent().catch(err => {
  logError(`Registration failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
