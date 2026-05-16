# Randevo Agents Guide (Codex)

This file defines how Codex should execute production-readiness phases safely.

## Working Rules

- Execute only the scoped phase for each task.
- Do not mask failing checks.
- Keep multi-tenant boundaries strict (`organizationId` must be server-derived).
- Never trust client-side payment status updates.
- Never commit real secrets.

## Mandatory Gate Before Merge

Run all commands and require success:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npm run prisma:validate
npm run prisma:generate
```

When phase includes browser tests:

```bash
npm run test:e2e
```

When phase includes mobile work:

```bash
cd mobile
npm run typecheck
```

## Review Priorities

1. Tenant data leaks
2. Payment status integrity and webhook idempotency
3. Auth guard regressions (admin/staff/public)
4. Security regressions (rate limiting, secrets, request validation)
5. Missing tests for changed business-critical behavior

## Phase Discipline

- Keep commits phase-focused.
- Update `docs/COMPACT_STATE.md` at least every two phases.
- Record risks and follow-up work in docs when scope is intentionally deferred.
