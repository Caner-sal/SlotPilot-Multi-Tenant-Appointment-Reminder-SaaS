# Randevo — MCP Local Setup Guide

> Phase DS-7: Safe local development MCP configuration.

---

## Prerequisites

- Node.js >= 20 (see `.nvmrc`)
- Claude Code CLI installed
- Randevo project cloned locally

---

## Setup Steps

### 1. Copy the example config

```bash
cp .mcp.json.example .mcp.json
```

### 2. Edit .mcp.json

Replace `/REPLACE/WITH/YOUR/PROJECT/ROOT/PATH` with your actual project root:

**Mac/Linux example:**
```
/Users/yourname/Randevo
```

**Windows example (use forward slashes):**
```
C:/Users/yourname/Randevo
```

### 3. Add .mcp.json to .gitignore

```bash
echo ".mcp.json" >> .gitignore
```

### 4. Enable in Claude Code

In Claude Code settings, enable the MCP servers you want to use.

---

## Security Notes

- `.mcp.json` must NEVER be committed to git.
- Only `.mcp.json.example` is in the repository.
- All placeholder values must be replaced before use.
- Do NOT add production database connections.
- Do NOT add Stripe live keys or any secrets.

---

## Example Prompts

Once MCP is configured:

```
"Read the district data file and summarize what provinces have complete district data."
"Check git diff and summarize what changed in this phase."
"What time is it in Istanbul right now?"
"Read the Next.js docs page on dynamic routes."
```

---

## Troubleshooting

- If filesystem MCP is too broad, narrow the `allowedDirectories` to specific subdirectories.
- If git MCP shows too many tools, remove destructive ones from the config.
- Run `node scripts/check-no-secrets.js` after any config change to verify no secrets leaked.
