#!/usr/bin/env node

const [major] = process.versions.node.split(".").map(Number);
const MIN = 20;
const MAX = 27;

if (major < MIN || major >= MAX) {
  console.warn(
    `\x1b[33m⚠ Warning:\x1b[0m Node.js ${process.versions.node} detected. Randevo requires Node.js >=20 <27.\n` +
    `  Install via: https://nodejs.org or nvm use ${MIN}\n`
  );
  process.exit(1);
}

console.log(`✓ Node.js ${process.versions.node} is compatible.`);
