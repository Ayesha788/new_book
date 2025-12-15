#!/usr/bin/env node

/**
 * Build validation script
 * Validates the Docusaurus build for broken links, formatting issues, and content rendering
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build validation...');

// Check if build directory exists
const buildDir = 'build';
if (!fs.existsSync(buildDir)) {
  console.log('⚠️  Build directory does not exist. Running build first...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Validate that build contains expected files
const expectedFiles = [
  'index.html',
  '404.html',
  'assets/css',
  'assets/js',
  'docs'
];

let validationErrors = 0;

console.log('\\nValidating build structure...');
for (const file of expectedFiles) {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath) || globExists(path.join(buildDir, file.split('/')[0]), file)) {
    console.log(`  - ${file}: ✓ Found`);
  } else {
    console.log(`  - ${file}: ❌ Missing`);
    validationErrors++;
  }
}

// Check for broken internal links
console.log('\\nChecking for broken internal links...');
const htmlFiles = getAllHtmlFiles(buildDir);
let brokenLinks = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');

  // Find all href links
  const linkMatches = content.match(/href="([^"]*)"/g);
  if (linkMatches) {
    for (const match of linkMatches) {
      const link = match.match(/href="([^"]*)"/)[1];

      // Skip external links and anchors
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) {
        continue;
      }

      // Resolve relative links
      const resolvedPath = path.resolve(path.dirname(htmlFile), link.replace(/^\//, ''));
      const fullPath = path.join(buildDir, link.replace(/^\//, ''));

      // For Docusaurus, also check for .html extension if not explicitly provided
      let linkExists = fs.existsSync(fullPath);
      if (!linkExists && !link.includes('.')) {
        linkExists = fs.existsSync(fullPath + '.html');
      }

      if (!linkExists) {
        console.log(`  - Broken link in ${path.relative(buildDir, htmlFile)}: ${link}`);
        brokenLinks++;
      }
    }
  }
}

if (brokenLinks === 0) {
  console.log('  - ✓ No broken internal links found');
} else {
  console.log(`  - ❌ Found ${brokenLinks} broken links`);
  validationErrors += brokenLinks;
}

// Check for common formatting issues
console.log('\\nChecking for formatting issues...');
const markdownFiles = getAllMarkdownFiles('docs');
let formattingIssues = 0;

for (const mdFile of markdownFiles) {
  const content = fs.readFileSync(mdFile, 'utf8');

  // Check for improperly formatted frontmatter
  if (content.startsWith('---') && !content.match(/---\s*\n[\s\S]*?\n---\s*\n/)) {
    console.log(`  - Formatting issue in ${mdFile}: Invalid frontmatter`);
    formattingIssues++;
  }

  // Check for unmatched code blocks
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    console.log(`  - Formatting issue in ${mdFile}: Unmatched code block`);
    formattingIssues++;
  }

  // Check for missing alt text in images
  const imageMatches = content.match(/!\[([^\]]*)\]\([^)]*\)/g) || [];
  for (const img of imageMatches) {
    const altText = img.match(/!\[([^\]]*)\]/)[1];
    if (altText === '') {
      console.log(`  - Formatting issue in ${mdFile}: Image with empty alt text: ${img}`);
      formattingIssues++;
    }
  }
}

if (formattingIssues === 0) {
  console.log('  - ✓ No formatting issues found');
} else {
  console.log(`  - ❌ Found ${formattingIssues} formatting issues`);
  validationErrors += formattingIssues;
}

// Performance check - simulate page load time validation
console.log('\\nPerforming basic performance validation...');
// This would normally require a tool like Lighthouse, but we'll do basic checks
const totalSize = getDirSize(buildDir);
const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`  - Build size: ${sizeInMB} MB`);

if (parseFloat(sizeInMB) > 50) { // 50MB threshold
  console.log('  - ⚠️  Build size is large, may impact load times');
} else {
  console.log('  - ✓ Build size is reasonable');
}

console.log('\\nBuild validation complete.');
if (validationErrors === 0) {
  console.log('✓ All validations passed!');
} else {
  console.log(`❌ ${validationErrors} issues found that need to be addressed.`);
}

// Exit with error code if there are validation errors
process.exit(validationErrors > 0 ? 1 : 0);

// Helper functions
function getAllHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getDirSize(dir) {
  const items = fs.readdirSync(dir);
  let size = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += stat.size;
    }
  }

  return size;
}

function globExists(dir, pattern) {
  // Simple check for directory existence
  return fs.existsSync(dir);
}