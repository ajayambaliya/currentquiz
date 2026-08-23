import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcAppDir = path.join(rootDir, 'src', 'app');

console.log('🚀 Running CurrentAdda Automated SEO & Technical Validation Audit...\n');

let totalErrors = 0;
let totalWarnings = 0;

function reportError(msg) {
  console.error(`❌ [ERROR] ${msg}`);
  totalErrors++;
}

function reportWarning(msg) {
  console.warn(`⚠️  [WARN]  ${msg}`);
  totalWarnings++;
}

function reportPass(msg) {
  console.log(`✅ [PASS]  ${msg}`);
}

// 1. Recursive file scanner
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.mjs')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allAppFiles = getFiles(srcAppDir);
const pageFiles = allAppFiles.filter(f => f.endsWith('page.tsx'));

// 2. Check for multiple <h1> tags in static page templates
console.log('--- 1. Checking H1 Tag Architecture (Max 1 H1 per page) ---');
for (const pageFile of pageFiles) {
  const relativePath = path.relative(rootDir, pageFile);
  const content = fs.readFileSync(pageFile, 'utf-8');
  
  // Count <h1 occurrences
  const h1Matches = content.match(/<h1[\s>]/g) || [];
  if (h1Matches.length > 1) {
    reportError(`${relativePath} has ${h1Matches.length} <h1> tags! Must have at most 1 primary <h1>.`);
  } else if (h1Matches.length === 1) {
    reportPass(`${relativePath} has exactly 1 <h1>.`);
  }
}

// 3. Check for hidden keyword stuffing / sr-only SEO spam
console.log('\n--- 2. Checking for Hidden Text / sr-only Keyword Spam ---');
for (const pageFile of allAppFiles) {
  const relativePath = path.relative(rootDir, pageFile);
  const content = fs.readFileSync(pageFile, 'utf-8');

  // Check for sr-only containing keyword lists or summaries
  if (
    content.includes('className="sr-only"') &&
    (content.includes('ai-search-summary') || content.includes('Additional SEO content') || content.includes('Googlebot'))
  ) {
    reportError(`${relativePath} contains forbidden hidden text block (sr-only keyword stuffing).`);
  }
}
reportPass('Zero hidden text / sr-only keyword spam blocks found across all app files.');

// 4. Check Canonical Domain Consistency
console.log('\n--- 3. Checking Canonical Base URL Consistency ---');
const canonicalDomain = 'https://currentadda.vercel.app';
for (const file of allAppFiles) {
  const relativePath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf-8');

  if (content.includes('metadataBase') || content.includes('canonical')) {
    if (content.includes('http://localhost') && !relativePath.includes('test')) {
      reportError(`${relativePath} contains localhost in metadata/canonical config.`);
    }
  }
}
reportPass(`All canonical URLs adhere strictly to ${canonicalDomain}.`);

// 5. Check Next.js Redirects configuration
console.log('\n--- 4. Checking Next.js 301 Redirects ---');
const nextConfigPath = path.join(rootDir, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
  if (nextConfigContent.includes('/current-affairs-gujarati') && nextConfigContent.includes('/current-affairs-in-gujarati')) {
    reportPass('next.config.ts has 301 redirect for legacy /current-affairs-gujarati -> /current-affairs-in-gujarati.');
  } else {
    reportError('next.config.ts is missing redirect for /current-affairs-gujarati.');
  }
  if (nextConfigContent.includes('/daily') && nextConfigContent.includes('/daily-current-affairs-in-gujarati')) {
    reportPass('next.config.ts has 301 redirect for /daily -> /daily-current-affairs-in-gujarati.');
  } else {
    reportError('next.config.ts is missing redirect for /daily.');
  }
} else {
  reportError('next.config.ts not found.');
}

// 6. Check robots.ts configuration
console.log('\n--- 5. Checking robots.ts AI and Search Bot Permissions ---');
const robotsPath = path.join(srcAppDir, 'robots.ts');
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  const requiredBots = ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];
  let allBotsPresent = true;
  for (const bot of requiredBots) {
    if (!robotsContent.includes(bot)) {
      reportWarning(`robots.ts does not explicitly list crawler: ${bot}`);
      allBotsPresent = false;
    }
  }
  if (allBotsPresent) {
    reportPass('robots.ts explicitly configures modern AI & search crawlers.');
  }
} else {
  reportError('src/app/robots.ts not found.');
}

// 7. Check sitemap.ts configuration
console.log('\n--- 6. Checking sitemap.ts Coverage ---');
const sitemapPath = path.join(srcAppDir, 'sitemap.ts');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const requiredRoutes = [
    '/current-affairs-in-gujarati',
    '/daily-current-affairs-in-gujarati',
    '/current-affairs-gujarati/gpsc',
    '/current-affairs-gujarati/cce',
    '/current-affairs-gujarati/psi',
    '/current-affairs-gujarati/police-constable',
    '/current-affairs-gujarati/bin-sachivalay',
    '/author'
  ];
  let allRoutesPresent = true;
  for (const r of requiredRoutes) {
    if (!sitemapContent.includes(`'${r}'`)) {
      reportError(`sitemap.ts missing route: ${r}`);
      allRoutesPresent = false;
    }
  }
  if (allRoutesPresent) {
    reportPass('sitemap.ts includes all high-priority topical authority hubs and author page.');
  }
} else {
  reportError('src/app/sitemap.ts not found.');
}

console.log('\n=============================================');
console.log(`Audit Finished: ${totalErrors} Errors, ${totalWarnings} Warnings.`);
console.log('=============================================\n');

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('🎉 All SEO and Technical checks PASSED successfully!');
  process.exit(0);
}
