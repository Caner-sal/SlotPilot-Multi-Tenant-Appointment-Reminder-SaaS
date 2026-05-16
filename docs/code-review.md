# Code Review Checklist

## Critical Findings First

Reviewers must prioritize:

1. Security regressions
2. Tenant isolation leaks
3. Payment correctness/idempotency issues
4. Authz/authn regressions
5. Data loss or migration risk

## Must-Check Areas

- API routes derive tenant from session, not client payload.
- Webhooks enforce signature verification and idempotency.
- Payment states are backend-controlled.
- CI fails on lint/test/build/schema errors.
- New behavior includes tests (unit/integration/e2e as needed).

## Quick Commands

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
