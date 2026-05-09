#!/usr/bin/env node
/**
 * Secret scanner for SlotPilot
 * Scans source files for hardcoded credentials and API keys.
 * Run: node scripts/check-no-secrets.js
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  { name: 'Stripe live secret key',   regex: /sk_live_[a-zA-Z0-9]{20,}/g },
  { name: 'Stripe live publishable',  regex: /pk_live_[a-zA-Z0-9]{20,}/g },
  { name: 'GitHub token (ghp_)',      regex: /ghp_[a-zA-Z0-9]{30,}/g },
  { name: 'GitHub token (gho_)',      regex: /gho_[a-zA-Z0-9]{30,}/g },
  { name: 'GitHub token (github_pat)',regex: /github_pat_[a-zA-Z0-9_]{50,}/g },
  { name: 'AWS Access Key',           regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Twilio Account SID',       regex: /AC[a-f0-9]{32}/g },
  { name: 'Generic API key pattern',  regex: /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9_\-]{20,}["']/gi },
  { name: 'Hardcoded password',       regex: /password\s*[:=]\s*["'][^"']{8,}["']/gi },
  { name: 'Hardcoded secret',         regex: /secret\s*[:=]\s*["'][a-zA-Z0-9_\-]{16,}["']/gi },
  { name: 'Bearer token (long)',      regex: /Bearer\s+[a-zA-Z0-9_\-\.]{40,}/g },
];

// Directories and files to scan
const SCAN_DIRS = ['src', 'scripts', 'prisma', 'docs'];
const SCAN_FILES = ['.mcp.json', '.mcp.json.example'];

// Files/patterns to skip (these are expected to have patterns)
const SKIP_FILES = [
  'check-no-secrets.js',  // This file itself contains the patterns as strings
  'node_modules',
  '.next',
  '.git',
  '.test.ts',   // Test fixture files use mock passwords/secrets intentionally
  '.test.tsx',
  '.test.js',
  'setup.ts',
];

const ALLOWED_VALUES = [
  'PLACEHOLDER',
  'your-secret-here',
  'your_secret_key',
  'test_secret',
  'changeme',
  '••••••••',
  'example',
  'REPLACE',
];

function shouldSkip(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function isAllowedValue(match) {
  return ALLOWED_VALUES.some(v => match.toLowerCase().includes(v.toLowerCase()));
}

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  for (const pattern of SECRET_PATTERNS) {
    const matches = content.match(pattern.regex);
    if (matches) {
      for (const match of matches) {
        if (!isAllowedValue(match)) {
          findings.push({ file: filePath, pattern: pattern.name, match: match.substring(0, 40) + '...' });
        }
      }
    }
  }

  return findings;
}

function scanDirectory(dir) {
  const findings = [];
  if (!fs.existsSync(dir)) return findings;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(fullPath)) continue;

    if (entry.isDirectory()) {
      findings.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json|env\.example|md)$/.test(entry.name)) {
      findings.push(...scanFile(fullPath));
    }
  }

  return findings;
}

// Main scan
const rootDir = path.join(__dirname, '..');
let allFindings = [];

// Scan directories
for (const dir of SCAN_DIRS) {
  const dirPath = path.join(rootDir, dir);
  allFindings.push(...scanDirectory(dirPath));
}

// Scan specific files in root
for (const file of SCAN_FILES) {
  const filePath = path.join(rootDir, file);
  if (!shouldSkip(filePath)) {
    allFindings.push(...scanFile(filePath));
  }
}

// Report
if (allFindings.length === 0) {
  console.log('✓ Secret scan PASS — no hardcoded secrets found.');
  process.exit(0);
} else {
  console.error('✗ Secret scan FAIL — potential secrets found:');
  for (const f of allFindings) {
    console.error(`  [${f.pattern}] in ${f.file}`);
    console.error(`    Match: ${f.match}`);
  }
  console.error(`\n${allFindings.length} issue(s) found. Please review and remove secrets.`);
  process.exit(1);
}
