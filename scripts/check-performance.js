#!/usr/bin/env node

/**
 * Performance monitoring script
 * Checks page load times and other performance metrics
 * Note: This is a simplified version - in practice, you'd use tools like Lighthouse, WebPageTest, etc.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting performance monitoring setup...');

// Performance thresholds
const MAX_LOAD_TIME = 2000; // 2 seconds in milliseconds
const MAX_BUILD_SIZE = 50 * 1024 * 1024; // 50 MB in bytes
const MAX_JS_SIZE = 5 * 1024 * 1024; // 5 MB for JavaScript
const MAX_CSS_SIZE = 2 * 1024 * 1024; // 2 MB for CSS

// Check if build directory exists
const buildDir = 'build';
if (!fs.existsSync(buildDir)) {
  console.log('⚠️  Build directory does not exist. You may need to run build first.');
  // We won't exit here as this script might be run as part of a CI process
}

// Calculate build size
if (fs.existsSync(buildDir)) {
  const totalSize = getDirSize(buildDir);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log(`\\nBuild size analysis:`);
  console.log(`  - Total build size: ${sizeInMB} MB`);

  if (totalSize > MAX_BUILD_SIZE) {
    console.log(`  - ❌ Build size exceeds limit of ${(MAX_BUILD_SIZE / (1024 * 1024))} MB`);
  } else {
    console.log(`  - ✓ Build size is within limit (${(MAX_BUILD_SIZE / (1024 * 1024))} MB)`);
  }

  // Check JS and CSS sizes
  const jsSize = getAssetSize(buildDir, '.js');
  const cssSize = getAssetSize(buildDir, '.css');

  const jsSizeMB = (jsSize / (1024 * 1024)).toFixed(2);
  const cssSizeMB = (cssSize / (1024 * 1024)).toFixed(2);

  console.log(`  - JavaScript size: ${jsSizeMB} MB`);
  console.log(`  - CSS size: ${cssSizeMB} MB`);

  if (jsSize > MAX_JS_SIZE) {
    console.log(`  - ⚠️  JavaScript size exceeds limit of ${(MAX_JS_SIZE / (1024 * 1024))} MB`);
  } else {
    console.log(`  - ✓ JavaScript size is within limit`);
  }

  if (cssSize > MAX_CSS_SIZE) {
    console.log(`  - ⚠️  CSS size exceeds limit of ${(MAX_CSS_SIZE / (1024 * 1024))} MB`);
  } else {
    console.log(`  - ✓ CSS size is within limit`);
  }
} else {
  console.log('\\n⚠️  Build directory not found. Cannot analyze build size.');
}

// Performance recommendations file
const perfRecommendations = `# Performance Optimization Guidelines

## Load Time Optimization (< 2s target)

### Image Optimization
- Use WebP format for images when possible
- Implement lazy loading for images below the fold
- Compress images using tools like ImageOptim or TinyPNG
- Use appropriate image dimensions (avoid large images scaled down with CSS)

### Asset Optimization
- Minimize and compress JavaScript and CSS files
- Implement code splitting for large bundles
- Use tree-shaking to remove unused code
- Implement caching strategies with proper headers

### Content Delivery
- Use a Content Delivery Network (CDN)
- Enable Gzip/Brotli compression
- Optimize critical rendering path
- Preload critical resources

### Docusaurus-Specific Optimizations
- Use MDX components sparingly
- Optimize sidebar loading for large documentation sets
- Implement dynamic imports for heavy components
- Use Docusaurus' built-in optimization features

## Monitoring Tools

### For Development
- Use browser dev tools to analyze performance
- Run Lighthouse audits regularly
- Monitor bundle size with webpack-bundle-analyzer

### For Production
- Set up synthetic monitoring to track page load times
- Use Real User Monitoring (RUM) tools
- Monitor server response times
- Track performance across different geographies

## Performance Budget

- Total build size: < 50 MB
- JavaScript: < 5 MB
- CSS: < 2 MB
- Page load time: < 2 seconds (90th percentile)
- Time to Interactive: < 5 seconds
- Largest Contentful Paint: < 2.5 seconds
`;

const perfGuidePath = 'docs/performance-monitoring.md';
fs.writeFileSync(perfGuidePath, perfRecommendations);

console.log('\\nCreated performance monitoring guidelines at docs/performance-monitoring.md');

// Create a simple performance test configuration
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add performance scripts if not already present
  if (!packageJson.scripts['perf:check']) {
    packageJson.scripts['perf:check'] = 'node scripts/check-performance.js';
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Added performance check script to package.json');
}

console.log('\\nPerformance monitoring setup complete.');
console.log('✓ Created performance guidelines');
console.log('✓ Set up basic size monitoring');
console.log('✓ Added performance script to package.json');

// Helper functions
function getDirSize(dir) {
  if (!fs.existsSync(dir)) return 0;

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

function getAssetSize(dir, extension) {
  if (!fs.existsSync(dir)) return 0;

  let size = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      size += getAssetSize(fullPath, extension);
    } else if (item.endsWith(extension)) {
      size += stat.size;
    }
  }

  return size;
}

console.log('\\nNote: For actual page load time monitoring under 2 seconds,');
console.log('consider using browser automation tools like Puppeteer with Lighthouse,');
console.log('or services like WebPageTest, GTmetrix, or Google PageSpeed Insights.');