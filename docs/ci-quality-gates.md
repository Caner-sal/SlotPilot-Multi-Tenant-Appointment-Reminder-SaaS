# CI Quality Gates

This project uses strict CI. Any failing gate must fail the workflow.

## Web Gates

- `npm ci`
- `npm run check:node`
- `npm run check:secrets`
- `npm run validate:skills`
- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run prisma:dbpush` (CI SQLite)
- `npm run lint`
- `npm test`
- `npm run build`

## E2E Smoke

- Build app
- `npm run test:e2e`

## Mobile Gate

If `mobile/package.json` exists:

- `cd mobile && npm ci`
- `cd mobile && npm run typecheck`

## Policy

- No silent skip fallback.
- No green CI when tests/build are red.
