#!/usr/bin/env node
/**
 * Agent readiness checks for production gates.
 * Verifies required documentation/config files and MCP gitignore safety.
 */

const fs = require("fs");
const path = require("path");

const REQUIRED_FILES = ["AGENTS.md", "CLAUDE.md", ".mcp.json.example"];
const GITIGNORE_PATH = ".gitignore";
const MCP_IGNORE_RE = /^\s*\.mcp\.json\s*$/m;

let failed = false;

for (const relPath of REQUIRED_FILES) {
  const absPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(absPath)) {
    console.log(`PASS: required file exists -> ${relPath}`);
  } else {
    console.error(`FAIL: required file missing -> ${relPath}`);
    failed = true;
  }
}

const gitignoreAbsPath = path.join(process.cwd(), GITIGNORE_PATH);
if (!fs.existsSync(gitignoreAbsPath)) {
  console.error(`FAIL: ${GITIGNORE_PATH} not found`);
  failed = true;
} else {
  const content = fs.readFileSync(gitignoreAbsPath, "utf8");
  if (MCP_IGNORE_RE.test(content)) {
    console.log("PASS: .gitignore includes .mcp.json safeguard");
  } else {
    console.error("FAIL: .gitignore must include a standalone '.mcp.json' line");
    failed = true;
  }
}

if (failed) {
  console.error("\nAgent readiness check FAILED.");
  process.exit(1);
}

console.log("\nAgent readiness check PASS.");
