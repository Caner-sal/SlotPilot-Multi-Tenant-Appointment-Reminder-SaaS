# Randevo — MCP Security Checklist

> Phase DS-7: Security review checklist for all MCP integrations.

---

## Pre-Commit Checklist

### Secret Safety
- [ ] `.mcp.json` is listed in `.gitignore`
- [ ] `.mcp.json.example` contains only PLACEHOLDER values (no real tokens)
- [ ] No real API keys in any MCP config file
- [ ] `scripts/check-no-secrets.js` passes (exit 0)

### Filesystem Scope
- [ ] Filesystem MCP `allowedDirectories` is project root only
- [ ] No `/` (Unix root) or `C:\` (Windows root) in allowed paths
- [ ] No `/etc/`, `/var/`, `~/.ssh/`, or similar sensitive paths

### Git Tool Safety
- [ ] No `git push --force` tool enabled in Git MCP
- [ ] No `git reset --hard` tool enabled without approval
- [ ] No branch deletion tools enabled

### Database Safety
- [ ] No production database connection string in MCP config
- [ ] No PostgreSQL MCP connected to production DB
- [ ] SQLite dev database is acceptable for read-only local debugging only

### Payment/External Service Safety
- [ ] No Stripe secret keys (sk_live_, sk_test_) in MCP config
- [ ] No Twilio, Resend, or WhatsApp tokens in MCP config
- [ ] No Google OAuth secrets in MCP config

### Production Safety
- [ ] MCP config is local-dev only (not deployed to production)
- [ ] CI/CD pipelines do not use .mcp.json
- [ ] .mcp.json.example is the only MCP file committed to git

---

## Automated Checks

Run: `node scripts/check-no-secrets.js`

This script scans for:
- Stripe live keys: `sk_live_`, `pk_live_`
- GitHub tokens: `ghp_`, `gho_`
- Generic API keys: `api_key`, `apikey` with values
- Hardcoded passwords: `password = "..."`
- JWT secrets with values

---

## Incident Response

If a secret is accidentally committed:
1. Immediately revoke the exposed key in the provider dashboard.
2. Run: `git log --all --full-history -- path/to/file` to find all commits containing the secret.
3. Use `git filter-repo` or `BFG Repo Cleaner` to rewrite history.
4. Force push the cleaned history (requires team approval).
5. Notify affected service providers.
