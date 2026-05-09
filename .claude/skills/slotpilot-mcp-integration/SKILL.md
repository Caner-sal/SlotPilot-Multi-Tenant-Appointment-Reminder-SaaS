# randevo-mcp-integration

## name
randevo-mcp-integration

## description
Review and validate MCP configuration for security issues, secret leakage, and scope creep before enabling any MCP server.

## When to use
- Before committing .mcp.json changes
- After adding a new MCP server to configuration
- During security review of development environment

## Workflow
1. Run: node scripts/check-no-secrets.js
2. Check: .mcp.json.example has no real tokens (only PLACEHOLDER values)
3. Check: filesystem MCP scope is project root only
4. Check: no production DB connection strings
5. Check: no force-push git tools enabled
6. Report: SAFE or list of issues

## Expected Output
- check-no-secrets.js: PASS — no secrets found
- .mcp.json.example: contains only placeholder tokens
- Filesystem scope: project root only

## Forbidden Actions
- Do not commit real API tokens or passwords
- Do not enable production database write access via MCP
- Do not enable broad filesystem access (no / or C:\)
- Do not enable force-push git operations
