# Onboarding Growth Checklist

## Demo Workspace Baseline
- Demo provisioning is seed-only (no public provisioning endpoint).
- Seed one canonical demo workspace using fixed ids/slugs from `prisma/demo-workspace.ts`.
- Keep demo workspace payment-safe (FREE+ACTIVE subscription, no Stripe ids, payment delta = 0).
- Verify public booking route is reachable and has active services.
- Seed run should print deterministic smoke summary for CI/staging checks.

## Product Events
- `signup_started`
- `organization_created`
- `service_created`
- `first_booking_created`
- `plan_upgrade_clicked`

## Read-Side Visibility Contracts
- Owner dashboard checklist API:
  - `GET /api/dashboard/onboarding-checklist`
  - Stable JSON shape: `organizationId`, `items[]`, `completedCount`, `totalCount`, `progressPercent`
  - Owner/Admin only for active tenant membership.
- Superadmin events API:
  - `GET /api/admin/product-events?eventName=&organizationId=&limit=&cursor=`
  - Stable pagination object: `{ limit, nextCursor }`
  - Superadmin-only with `x-request-id` response header.

## Dashboard Checklist Card Rules
- `organization_created`: organization exists or matching product event exists.
- `service_created`: at least one service exists or matching product event exists.
- `first_booking_created`: at least one appointment exists or matching product event exists.
- `plan_upgrade_clicked`: matching product event exists.

## Event QA
- Events are written with safe payloads only.
- No secret/PII leakage in event payload.
- Event writes do not block primary user flow.

## Final Gate Evidence
- `npm run check:node`
- `npm run check:secrets`
- `npm run validate:skills`
- `npm run lint`
- `npm test`
- `npm run build`
- `node ./node_modules/prisma/build/index.js validate`
- `node ./node_modules/prisma/build/index.js generate`
- `npm run test:e2e`
- `cd mobile && npm run typecheck`
