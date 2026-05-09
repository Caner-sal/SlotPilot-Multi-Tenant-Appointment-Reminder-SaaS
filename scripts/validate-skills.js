#!/usr/bin/env node
// Validates that all .claude/skills/*/SKILL.md files have required fields

const fs = require('fs');
const path = require('path');

const skillsDir = path.join(__dirname, '..', '.claude', 'skills');
const requiredFields = ['## name', '## description', '## When to use', '## Workflow', '## Expected Output'];

let passCount = 0;
let failCount = 0;

if (!fs.existsSync(skillsDir)) {
  console.error('ERROR: .claude/skills/ directory not found');
  process.exit(1);
}

const skillDirs = fs.readdirSync(skillsDir).filter(d => {
  const fullPath = path.join(skillsDir, d);
  return fs.statSync(fullPath).isDirectory();
});

if (skillDirs.length === 0) {
  console.error('ERROR: No skill directories found under .claude/skills/');
  process.exit(1);
}

for (const dir of skillDirs) {
  const skillFile = path.join(skillsDir, dir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`FAIL: ${dir}/SKILL.md not found`);
    failCount++;
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const missing = requiredFields.filter(f => !content.includes(f));

  if (missing.length > 0) {
    console.error(`FAIL: ${dir}/SKILL.md missing: ${missing.join(', ')}`);
    failCount++;
  } else {
    console.log(`PASS: ${dir}/SKILL.md`);
    passCount++;
  }
}

console.log(`\nSkill validation: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) process.exit(1);
else console.log('All skills valid.');
