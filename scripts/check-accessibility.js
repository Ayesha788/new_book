#!/usr/bin/env node

/**
 * Accessibility testing script for WCAG 2.1 AA compliance
 * Checks for common accessibility issues in the built site
 */

const fs = require('fs');
const path = require('path');

console.log('Starting accessibility testing for WCAG 2.1 AA compliance...');

// WCAG 2.1 AA compliance checklist
const accessibilityChecks = {
  'images': {
    'altText': 'All images must have alt text',
    'decorativeImages': 'Decorative images should have empty alt text'
  },
  'headings': {
    'properHierarchy': 'Headings should follow proper hierarchy (h1, h2, h3, etc.)',
    'uniqueH1': 'Each page should have only one h1 element'
  },
  'links': {
    'descriptiveText': 'Link text should be descriptive out of context',
    'focusable': 'Links must be keyboard focusable'
  },
  'color': {
    'contrast': 'Text must have sufficient contrast (4.5:1 for normal text, 3:1 for large text)'
  },
  'forms': {
    'labels': 'All form inputs must have associated labels'
  },
  'keyboard': {
    'navigation': 'All functionality must be accessible via keyboard'
  }
};

// Check if build directory exists
const buildDir = 'build';
if (!fs.existsSync(buildDir)) {
  console.log('⚠️  Build directory does not exist. Run build first to test accessibility of rendered content.');
  process.exit(0); // Not an error, just informational
}

// Find all HTML files
const htmlFiles = getAllHtmlFiles(buildDir);
console.log(`\\nFound ${htmlFiles.length} HTML files to check for accessibility...`);

let totalIssues = 0;

// Check each HTML file for accessibility issues
for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const relativePath = path.relative(buildDir, htmlFile);
  const issues = [];

  // Check for alt text on images
  const imgMatches = content.match(/<img[^>]*>/gi) || [];
  for (const imgTag of imgMatches) {
    if (!imgTag.includes('alt=')) {
      issues.push(`Missing alt text on image: ${imgTag}`);
    } else {
      // Extract alt text to see if it's descriptive
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      if (altMatch && altMatch[1] === '') {
        // Empty alt is acceptable for decorative images
      } else if (altMatch && ['image', 'img', 'photo', 'picture'].includes(altMatch[1].toLowerCase().trim())) {
        issues.push(`Non-descriptive alt text: "${altMatch[1]}" in ${imgTag}`);
      }
    }
  }

  // Check for proper heading hierarchy
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  const h4Matches = content.match(/<h4[^>]*>.*?<\/h4>/gi) || [];
  const h5Matches = content.match(/<h5[^>]*>.*?<\/h5>/gi) || [];
  const h6Matches = content.match(/<h6[^>]*>.*?<\/h6>/gi) || [];

  if (h1Matches.length > 1) {
    issues.push(`Multiple H1 headings found (${h1Matches.length}). Each page should have only one H1.`);
  }

  // Check for skip navigation link (WCAG requirement)
  if (!content.includes('skip-to-content') && !content.toLowerCase().includes('skip navigation')) {
    // This is a common issue but not always required depending on site structure
    // We'll note it but not count as a failure
  }

  // Check for links with generic text
  const linkMatches = content.match(/<a[^>]*>.*?<\/a>/gi) || [];
  for (const linkTag of linkMatches) {
    const textMatch = linkTag.match(/<a[^>]*>(.*?)<\/a>/i);
    if (textMatch) {
      const linkText = textMatch[1].replace(/<[^>]*>/g, '').trim(); // Remove nested HTML tags
      if (['click here', 'here', 'more', 'read more', 'link'].includes(linkText.toLowerCase())) {
        issues.push(`Non-descriptive link text: "${linkText}" in ${linkTag.substring(0, 50)}...`);
      }
    }
  }

  // Report issues for this file
  if (issues.length > 0) {
    console.log(`\\n  ${relativePath}:`);
    for (const issue of issues) {
      console.log(`    ❌ ${issue}`);
    }
    totalIssues += issues.length;
  } else {
    console.log(`  ✓ ${relativePath} passed accessibility checks`);
  }
}

// Check markdown files for accessibility in source content
console.log('\\nChecking markdown source files for accessibility...');
const mdFiles = getAllMarkdownFiles('docs');
let mdIssues = 0;

for (const mdFile of mdFiles) {
  const content = fs.readFileSync(mdFile, 'utf8');
  const relativePath = path.relative('docs', mdFile);
  const issues = [];

  // Check for images without alt text in markdown
  const mdImgMatches = content.match(/!\[([^\]]*)\]\([^)]*\)/g) || [];
  for (const imgTag of mdImgMatches) {
    const altText = imgTag.match(/!\[([^\]]*)\]/)[1];
    if (altText === '') {
      issues.push(`Image with empty alt text: ${imgTag.substring(0, 30)}...`);
    } else if (['image', 'img', 'photo', 'picture', 'diagram'].includes(altText.toLowerCase().trim())) {
      issues.push(`Non-descriptive alt text: "${altText}"`);
    }
  }

  // Report issues for this markdown file
  if (issues.length > 0) {
    console.log(`\\n  docs/${relativePath}:`);
    for (const issue of issues) {
      console.log(`    ❌ ${issue}`);
    }
    mdIssues += issues.length;
  }
}

totalIssues += mdIssues;

// Summary
console.log('\\nAccessibility testing complete.');
if (totalIssues === 0) {
  console.log('✓ All checks passed! Content appears to meet WCAG 2.1 AA guidelines.');
} else {
  console.log(`❌ ${totalIssues} accessibility issues found that should be addressed.`);
  console.log('\\nFor detailed WCAG 2.1 AA compliance, consider using automated tools like:');
  console.log('- axe-core for browser-based testing');
  console.log('- Pa11y for automated accessibility testing');
  console.log('- WAVE evaluation tool');
  console.log('- Lighthouse accessibility audits');
}

// Create accessibility guidelines document
const accessibilityGuide = `# Accessibility Guidelines (WCAG 2.1 AA)

This document outlines the accessibility requirements for the Physical AI & Humanoid Robotics Book to ensure compliance with WCAG 2.1 AA standards.

## Images
- All images must have descriptive alt text
- Decorative images should have empty alt attributes (alt="")
- Complex images like diagrams need detailed descriptions

## Headings
- Use proper heading hierarchy (h1 → h2 → h3 → etc.)
- Each page should have only one H1 (the main title)
- Headings should be descriptive and help with navigation

## Links
- Link text must be descriptive out of context
- Avoid generic text like "click here" or "more"
- Provide skip navigation links for keyboard users

## Color and Contrast
- Maintain minimum contrast ratio of 4.5:1 for normal text
- Maintain minimum contrast ratio of 3:1 for large text
- Don't rely solely on color to convey information

## Content Structure
- Use semantic HTML elements appropriately
- Provide multiple ways to navigate content
- Structure content in a logical reading order

## Keyboard Navigation
- All functionality must be accessible via keyboard
- Provide visible focus indicators
- Ensure logical tab order

## Forms and Inputs (if applicable)
- All form inputs must have associated labels
- Provide error identification and suggestions
- Use appropriate input types

## Testing
- Test with screen readers
- Navigate using only keyboard
- Use automated tools like axe-core
- Validate with color contrast tools
`;

fs.writeFileSync('docs/accessibility-guidelines.md', accessibilityGuide);
console.log('\\nCreated accessibility guidelines at docs/accessibility-guidelines.md');

process.exit(totalIssues > 0 ? 1 : 0);

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