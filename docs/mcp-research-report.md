# SlotPilot — MCP Research Report

> Phase DS-6: Research modelcontextprotocol/servers for safe SlotPilot dev workflow integration.
> Date: 2026-05-09

---

## 1. Overview

MCP (Model Context Protocol) reference servers provide tools that Claude agents can call during development workflows. These are **examples for development use only** — not production-ready services.

This report classifies each MCP server by safety level for SlotPilot local development.

---

## 2. Recommended Safe MCP Servers (Local Dev Only)

### 2.1 Filesystem MCP
- **Use case:** Read project source files, write documentation.
- **Safety:** SAFE when scoped to project root only.
- **Config:** `allowedDirectories: ["/path/to/project"]` — never `/` or `C:\`.
- **SlotPilot use:** Read src/, docs/, prisma/ for context. Write docs only.

### 2.2 Git MCP  
- **Use case:** Status, diff, branch, log, commit helpers.
- **Safety:** SAFE with no force-push or destructive tools.
- **Config:** Enable read tools (status, diff, log, branch) only.
- **SlotPilot use:** Summarize what changed before commits, review diffs.

### 2.3 Time MCP
- **Use case:** Current time in Europe/Istanbul timezone.
- **Safety:** SAFE — no auth, no data access.
- **Config:** Set default timezone to `Europe/Istanbul`.
- **SlotPilot use:** Verify appointment slot times in Turkey timezone tests.

### 2.4 Fetch MCP
- **Use case:** Read public documentation and open web pages.
- **Safety:** SAFE for public URLs only.
- **Config:** No authentication — public docs only.
- **SlotPilot use:** Read Next.js, Prisma, Stripe docs when debugging.

### 2.5 Memory MCP
- **Use case:** Persistent working notes and project decisions.
- **Safety:** SAFE — local storage only, no external service.
- **Config:** Local file-based storage in project or temp dir.
- **SlotPilot use:** Remember phase decisions, open issues, context between sessions.

### 2.6 Sequential Thinking MCP
- **Use case:** Plan complex multi-step reasoning flows.
- **Safety:** SAFE — reasoning only, no file/network access.
- **Config:** None required.
- **SlotPilot use:** Plan district data migrations, debug complex booking logic.

---

## 3. Archived / Risky Servers (Do NOT Use)

| Server | Status | Risk | Decision |
|---|---|---|---|
| GitHub | Archived | Broad repo access, token exposure | Avoid direct use |
| PostgreSQL | Archived | Production DB write access | Never for production |
| Google Maps | Archived | API key required, Turkish data incomplete | Avoid |
| Puppeteer | Archived | Use Playwright instead | Avoid, use Playwright |
| Brave Search | Active | Search API key required | Optional, low priority |
| AWS KB | Active | AWS credentials required | Avoid for local dev |

---

## 4. Security Principles

1. **No production credentials in MCP config.** Use PLACEHOLDER values in .mcp.json.example.
2. **Filesystem scope must be narrow.** Only project root — never OS root or user home.
3. **No write access to production DB.** PostgreSQL MCP (archived) is read-only even for debugging only with explicit approval.
4. **No force-push git tool.** Git MCP should be configured read-heavy.
5. **Always gitignore .mcp.json.** Example files only go into .mcp.json.example.

---

## 5. Recommended Local Setup

See `.mcp.json.example` for the full configuration example.
See `docs/mcp-local-setup.md` for setup instructions.
