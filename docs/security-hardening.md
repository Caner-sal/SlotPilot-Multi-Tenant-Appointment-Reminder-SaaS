# Security Hardening Notes

## In Place

- Session-based auth and route guards.
- Tenant membership checks in server-side helpers.
- Stripe webhook signature verification.
- Webhook and internal job idempotency guards.
- Secret scanning script in CI.

## Hardened in Sprint-2/Sprint-3

- Strict CI gates (no silent skip).
- Request-level correlation (`x-request-id`) for investigations.
- In-memory rate limiting on critical endpoints:
  - auth login
  - booking chat
  - Stripe webhook ingress
  - reminder process
- Internal job endpoint contract:
  - `x-worker-key` + `x-idempotency-key`
- Structured logging with route/outcome fields in payment/webhook/reminder/admin-health paths.
- Redaction includes secret fields and PII-oriented keys (`email`, `phone`, etc.).

## Acceptance Checklist (Security + Ops)

- Health endpoints are superadmin-only.
- Duplicate idempotency keys do not create second processing impact.
- Logs include `requestId` and do not leak secret/PII values.
- Critical endpoints preserve `x-request-id` in responses.

## Next Hardening Steps

- Redis-backed distributed rate limiting.
- Login brute-force thresholds and lockout telemetry.
- Provider-agnostic webhook verification for non-Stripe providers.
- Expanded tenant isolation regression coverage for edge API routes.

## 2026-05-13 Security Delta (Mobile + Legal)

- Mobile auth is token-based and decoupled from web cookie/session auth.
- Refresh tokens are stored as hashed values (`sha256`) and support revoke + rotation.
- Staff restrictions are enforced on mobile status mutation route (`appointments:write` scope required).
- GDPR request administration is superadmin-only via `/api/admin/gdpr/requests`.
- Legal pages are now routable and no longer linked to placeholders.
