#!/usr/bin/env node

/**
 * Content validation script for runnable code examples
 * Validates that code examples follow required structure and are properly formatted
 */

const fs = require('fs');
const path = require('path');

// Define the modules to check
const modules = ['module1', 'module2', 'module3', 'module4'];
const baseDir = 'code-examples';

console.log('Starting code example validation...');

let totalErrors = 0;

// Check each module
for (const module of modules) {
  const modulePath = path.join(baseDir, module);

  if (!fs.existsSync(modulePath)) {
    console.log(`⚠️  Module ${module} directory does not exist: ${modulePath}`);
    continue;
  }

  console.log(`\nValidating ${module}...`);

  const examples = fs.readdirSync(modulePath).filter(file =>
    file.endsWith('.py') || file.endsWith('.cpp') || file.endsWith('.sh') || file.endsWith('.js') || file.endsWith('.ts')
  );

  for (const example of examples) {
    const examplePath = path.join(modulePath, example);
    const content = fs.readFileSync(examplePath, 'utf8');

    // Basic validation checks
    let hasComments = content.includes('#') || content.includes('//') || content.includes('/*');
    let hasExecutableCode = content.trim().length > 0 && !content.trim().startsWith('#!/usr/bin/env');

    console.log(`  - ${example}: ${hasComments ? '✓ Comments present' : '⚠️  No comments'} | ${hasExecutableCode ? '✓ Code present' : '⚠️  No executable code'}`);
  }
}

// Check for README files in each module
console.log('\nChecking for README files in each module...');
for (const module of modules) {
  const readmePath = path.join(baseDir, module, 'README.md');
  if (fs.existsSync(readmePath)) {
    console.log(`  - ${module}: ✓ README.md exists`);
  } else {
    console.log(`  - ${module}: ⚠️  README.md missing`);
    totalErrors++;
  }
}

// Check for requirements.txt or similar dependency files
console.log('\nChecking for dependency files...');
for (const module of modules) {
  const reqPath = path.join(baseDir, module, 'requirements.txt');
  const pkgPath = path.join(baseDir, module, 'package.json');
  const depsPath = path.join(baseDir, module, 'dependencies.yaml');

  if (fs.existsSync(reqPath) || fs.existsSync(pkgPath) || fs.existsSync(depsPath)) {
    console.log(`  - ${module}: ✓ Dependency file exists`);
  } else {
    console.log(`  - ${module}: ⚠️  No dependency file (requirements.txt, package.json, or dependencies.yaml)`);
  }
}

console.log('\nValidation complete.');
if (totalErrors === 0) {
  console.log('✓ All validations passed!');
} else {
  console.log(`⚠️  ${totalErrors} issues found that should be addressed.`);
}

// Exit with error code if there are critical issues
process.exit(totalErrors > 0 ? 1 : 0);