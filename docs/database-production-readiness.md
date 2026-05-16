# Database Production Readiness (SQLite -> PostgreSQL)

## Current State

- Development datasource: SQLite
- Production target: PostgreSQL
- Prisma migrations are present and active.

## Migration Strategy

1. Keep local development on SQLite for low-friction setup.
2. Add staging PostgreSQL environment and run migrations there first.
3. Validate critical queries and indexes under staging load.
4. Promote same migration set to production with rollback notes.
5. Use forward-only migration policy (no in-place down migration in production).

## PostgreSQL Cutover Checklist

- `DATABASE_URL` points to PostgreSQL in staging.
- `node ./node_modules/prisma/build/index.js migrate deploy` succeeds.
- `node ./node_modules/prisma/build/index.js validate` and `node ./node_modules/prisma/build/index.js generate` succeed.
- Smoke tests pass: auth, booking, payment webhook, reminders.
- Backup snapshot taken before production deploy.

## Staging Smoke Procedure

1. Prepare staging env vars:
   - `DATABASE_URL=postgresql://...`
   - app auth/payment/webhook secrets
2. Run migration and schema checks:
   - `node ./node_modules/prisma/build/index.js migrate deploy`
   - `node ./node_modules/prisma/build/index.js validate`
   - `node ./node_modules/prisma/build/index.js generate`
3. Run app gates on staging config:
   - `npm run lint`
   - `npm test`
   - `npm run build`
4. Run targeted runtime smoke:
   - public booking create
   - deposit checkout init
   - webhook duplicate-event idempotency
   - reminder process endpoint (`x-worker-key` + `x-idempotency-key`)

## Rollback Guidance

- Keep pre-deploy DB backup.
- If migration causes critical regression:
  - Freeze writes.
  - Restore backup.
  - Re-deploy previous app version.
  - Re-run smoke checks.

## Forward-Only Policy

- New migration files must be additive and reviewed before merge.
- Rollback is operational (backup restore + app rollback), not schema down scripts in production.
- Any destructive schema change must be split into:
  1. additive compatibility phase
  2. cleanup phase after production confirmation

## Suggested Index Focus

- `Appointment(organizationId, startTime, status)`
- `Payment(organizationId, status, createdAt)`
- `AuditLog(organizationId, createdAt)`
- `Reminder(status, scheduledAt)`
