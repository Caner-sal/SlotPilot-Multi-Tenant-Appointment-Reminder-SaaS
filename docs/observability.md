# Observability Baseline

## Current Capabilities

- Request correlation ID via `x-request-id` across middleware and critical APIs.
- Structured JSON logging with shared schema fields:
  - `ts`, `level`, `message`, `requestId`, `route`, `outcome`.
- Superadmin operational health endpoint: `GET /api/admin/health`.
- Superadmin failure feed endpoint: `GET /api/admin/failures`.
- Admin health UI consumes API responses (health + failures) to reduce contract drift.

## Logging Rules

- Logs must use compact JSON and include `requestId`.
- Sensitive values are redacted (`token`, `secret`, `cookie`, `email`, `phone`, etc.).
- Do not log raw webhook payloads, card-like values, or full user-provided bodies.
- Prefer IDs, counters, and status summaries.

## Health Contract

`GET /api/admin/health` returns:

- `status`: `ok` or `degraded`
- `requestId`
- `checks`:
  - `database`
  - `pendingReminders`
  - `failedReminders`
  - `paymentsPendingReview`
  - `failedWebhookEvents`
  - `failedInternalJobs`
  - `failedPaymentAttempts`
- `windows`:
  - `last24h`: `failedWebhookEvents`, `failedInternalJobs`, `failedPaymentAttempts`, `failedReminders`
  - `last7d`: `failedWebhookEvents`, `failedInternalJobs`, `failedPaymentAttempts`, `failedReminders`
- `recentFailures`:
  - `webhooks` (last 5)
  - `jobs` (last 5)

## Failure Feed Contract

`GET /api/admin/failures?source=webhook|job&limit=&cursor=`

- Superadmin-only.
- `source` defaults to `webhook`.
- `limit` max is `100`.
- Response includes stable pagination object:
  - `pagination.limit`
  - `pagination.nextCursor` (nullable)

## 2026-05-13 Additions (Mobile + GDPR)

- Mobile request surface now emits `x-request-id` on all `/api/mobile/*` auth/data routes.
- Added legal/compliance operational endpoint for request tracking:
  - `GET /api/admin/gdpr/requests`.
- Added mobile push foundation routes for operational readiness:
  - `POST /api/mobile/push/register`
  - `POST /api/mobile/push/dev-trigger` (dev/staging only).
- Mobile auth refresh lifecycle is observable via structured logs in login/refresh/logout routes.
