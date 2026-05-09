# SlotPilot — Repo Scan Report

> Phase DS-0 baseline scan of anthropics/skills and modelcontextprotocol/servers for SlotPilot applicability.
> Date: 2026-05-09

---

## 1. anthropics/skills Repo Analysis

### What the repo provides
- A collection of reusable Claude skill patterns for agentic workflows.
- Skills define trigger conditions, step-by-step instructions, and expected outputs.
- Skills are markdown-based SKILL.md files, not executable code.

### License / Sourcing risk
- Skills are documentation, not executable source code.
- Content is meant to be adapted, not copy-pasted verbatim.
- SlotPilot will create original skills inspired by the patterns, not vendor the files directly.

### Applicable skill patterns for SlotPilot
| Skill Pattern | SlotPilot Adaptation |
|---|---|
| webapp-testing | Booking flow regression, district UI validation |
| mcp-builder | Safe local MCP config design |
| skill-creator | SlotPilot-specific skill creation workflow |
| frontend-design | Turkish SaaS dashboard UI polish |
| doc-coauthoring | README, KVKK docs, deployment guide improvement |

### Patterns NOT applicable
- Generic SaaS skills without Turkish localization awareness.
- Skills that assume English-only UI.

---

## 2. modelcontextprotocol/servers Repo Analysis

### What the repo provides
- Reference implementations of MCP servers for common development tools.
- **These are examples/references, not production-ready services.**

### Useful MCP Server Ideas for SlotPilot

| MCP Server | Use Case | Safety Level |
|---|---|---|
| filesystem | Read project source files, write docs | Safe if scoped to project root |
| git | Status, diff, branch, commit helpers | Safe with no force-push tool |
| time | Europe/Istanbul timezone for slot tests | Safe, no auth required |
| fetch | Read public documentation | Safe, no sensitive data |
| memory | Agent working notes, project decisions | Safe, local only |
| sequential-thinking | Plan complex migrations or debug flows | Safe, reasoning only |

### Archived / Risky Servers (do NOT use directly)

| MCP Server | Risk |
|---|---|
| GitHub (archived) | Broad repo access, token exposure risk |
| PostgreSQL (archived) | Production DB write access risk |
| Google Maps (archived) | API key required, Turkish address data incomplete |
| Puppeteer (archived) | Use Playwright instead for browser testing |

---

## 3. SlotPilot Action Plan

Based on this scan:

1. Create 10 new agent files for DS phase work.
2. Design 5 SlotPilot-specific skills (booking-regression, turkey-data, mcp-integration, payment-safety, release-manager).
3. Add safe local-only MCP configuration example (.mcp.json.example).
4. Never add production DB, payment provider, or broad filesystem MCP access.
5. All MCP configs stay in .mcp.json.example — not committed as real .mcp.json.

---

## 4. Security Posture

- Prisma ORM: parametric queries → SQL injection not possible.
- Zod validation: input validation at API boundaries.
- NextAuth v5: JWT session, server-side auth checks.
- Tenant isolation: organizationId FK on all multi-tenant queries.
- MCP will be local-dev only, no production secrets.

---

## 5. Next Steps

- Phase DS-1: Turkey district audit.
- Phase DS-2: Complete district data.
- Phase DS-4: Skills architecture.
- Phase DS-6: MCP research and security design.
