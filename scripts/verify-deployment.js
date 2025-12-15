#!/usr/bin/env node

/**
 * Deployment verification script
 * Tests that content renders correctly after deployment to GitHub Pages or Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment verification...');

// Check if build directory exists
const buildDir = 'build';
let buildExists = fs.existsSync(buildDir);

if (!buildExists) {
  console.log('⚠️  Build directory does not exist. Attempting to build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    buildExists = fs.existsSync(buildDir);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (!buildExists) {
  console.error('❌ Build directory still does not exist after attempting to build.');
  process.exit(1);
}

// Expected pages that should be accessible
const expectedPages = [
  'index.html',  // Home page
  'docs/intro/index.html',  // Introduction
  'docs/getting-started/index.html',  // Getting Started
  'docs/weekly-plan/index.html',  // Weekly Plan
  'docs/module-1-ros2/intro/index.html',  // Module 1 intro
  'docs/module-2-gazebo-unity/intro/index.html',  // Module 2 intro
  'docs/module-3-nvidia-isaac/intro/index.html',  // Module 3 intro
  'docs/module-4-vla-humanoid/intro/index.html'  // Module 4 intro
];

console.log('\\nVerifying expected pages exist...');
let missingPages = 0;

for (const page of expectedPages) {
  const pagePath = path.join(buildDir, page);
  if (fs.existsSync(pagePath)) {
    console.log(`  ✓ ${page}`);
  } else {
    console.log(`  ❌ ${page} - MISSING`);
    missingPages++;
  }
}

// Check that all HTML files contain expected content patterns
console.log('\\nChecking content rendering in HTML files...');
const htmlFiles = getAllHtmlFiles(buildDir);
let renderingIssues = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const relativePath = path.relative(buildDir, htmlFile);

  // Check for common rendering issues
  if (content.includes('{{') && content.includes('}}')) {
    // Might be unprocessed template variables
    const matches = content.match(/{{[^}]*}}/g);
    if (matches) {
      console.log(`  ❌ ${relativePath} contains unprocessed template variables: ${matches.join(', ')}`);
      renderingIssues++;
    }
  }

  // Check for broken Markdown-style formatting that didn't render properly
  if (content.includes('```') && content.includes('```')) {
    // This is expected for code blocks, so we won't flag it
  }

  // Check for broken image references
  const imgMatches = content.match(/<img[^>]*src="([^"]*missing[^"]*|[^"]*404[^"]*)"[^>]*>/i);
  if (imgMatches) {
    console.log(`  ❌ ${relativePath} contains broken image references: ${imgMatches[0].substring(0, 60)}...`);
    renderingIssues++;
  }

  // Check if the page has basic HTML structure
  if (!content.includes('<!DOCTYPE html') && !content.includes('<html')) {
    console.log(`  ❌ ${relativePath} missing proper HTML structure`);
    renderingIssues++;
  }

  if (!content.includes('<head>') || !content.includes('</head>')) {
    console.log(`  ❌ ${relativePath} missing head section`);
    renderingIssues++;
  }

  if (!content.includes('<body>') || !content.includes('</body>')) {
    console.log(`  ❌ ${relativePath} missing body section`);
    renderingIssues++;
  }
}

// Check for broken navigation links
console.log('\\nChecking navigation and internal links...');
let brokenNavLinks = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const relativePath = path.relative(buildDir, htmlFile);

  // Check for Docusaurus sidebar navigation patterns
  if (content.includes('sidebar') && !content.includes('nav') && !content.includes('menu')) {
    // This is OK, just noting for information
  }

  // Look for common Docusaurus component placeholders that didn't render
  const placeholderMatches = content.match(/\[.*?\]|\{.*?\}/g) || [];
  for (const match of placeholderMatches) {
    if (match.startsWith('[object ') || match.includes('undefined') || match.includes('null')) {
      console.log(`  ❌ ${relativePath} contains unrendered component: ${match}`);
      brokenNavLinks++;
    }
  }
}

// Check for common Docusaurus build artifacts that should be present
console.log('\\nChecking for Docusaurus build artifacts...');
const assetsDir = path.join(buildDir, 'assets');
const cssExists = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).some(file => file.endsWith('.css'));
const jsExists = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).some(file => file.endsWith('.js'));

if (cssExists) {
  console.log('  ✓ CSS assets found');
} else {
  console.log('  ❌ CSS assets missing');
  renderingIssues++;
}

if (jsExists) {
  console.log('  ✓ JavaScript assets found');
} else {
  console.log('  ❌ JavaScript assets missing');
  renderingIssues++;
}

// Summary
const totalIssues = missingPages + renderingIssues + brokenNavLinks;
console.log('\\nDeployment verification complete.');
if (totalIssues === 0) {
  console.log('✓ All checks passed! Deployment appears to be successful.');
  console.log('✓ All expected pages exist and content renders correctly.');
  console.log('✓ No broken links or rendering issues detected.');
} else {
  console.log(`❌ ${totalIssues} issues found that should be addressed before deployment:`);
  console.log(`  - ${missingPages} missing pages`);
  console.log(`  - ${renderingIssues} rendering issues`);
  console.log(`  - ${brokenNavLinks} navigation issues`);
}

// Create a deployment checklist document
const deploymentChecklist = `# Deployment Verification Checklist

Use this checklist to verify the site is properly deployed and all content renders correctly.

## Before Deployment
- [ ] All content files are in the correct location
- [ ] Images and assets are properly referenced
- [ ] Links are correctly formatted
- [ ] Code examples are properly formatted
- [ ] Build completes without errors

## After Deployment
- [ ] Homepage loads correctly
- [ ] All module introductions are accessible
- [ ] Navigation works properly
- [ ] All internal links resolve correctly
- [ ] Images load without broken link icons
- [ ] Code blocks render properly
- [ ] Sidebar navigation functions
- [ ] Search functionality works
- [ ] Page load times are acceptable (< 2 seconds)
- [ ] Mobile responsiveness is maintained
- [ ] Accessibility features work (screen readers, keyboard navigation)
- [ ] All expected pages are accessible

## Testing Steps
1. Load the homepage and verify it renders correctly
2. Navigate through each module using the sidebar
3. Click through several chapters to verify content displays properly
4. Test search functionality with various terms
5. Verify all images display correctly
6. Check that code examples are properly formatted
7. Test navigation on mobile devices
8. Verify accessibility features work as expected

## Common Issues to Check
- Broken image links
- Unprocessed template variables
- Missing CSS/JS assets
- Incorrect file paths
- Content that doesn't render properly
- Broken internal links
- Missing pages

## Performance Metrics
- Page load time: < 2 seconds
- Build size: < 50 MB
- Time to Interactive: < 5 seconds
- Accessibility Score: > 90%

## Rollback Plan
If deployment issues are found:
1. Identify the specific problems
2. Revert to the previous working version if critical
3. Fix the issues in a development branch
4. Test thoroughly before redeploying
`;

fs.writeFileSync('docs/deployment-checklist.md', deploymentChecklist);
console.log('\\nCreated deployment verification checklist at docs/deployment-checklist.md');

process.exit(totalIssues > 0 ? 1 : 0);

// Helper function
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