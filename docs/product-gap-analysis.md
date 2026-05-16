# Product Gap Analysis (Production Readiness)

Date: 2026-05-13

## Matrix

| Area | Status | Notes |
|---|---|---|
| CI strict quality gates | Partial | Workflow existed but used skip fallbacks; hardened in current update. |
| Agent runbooks | Partial | `.claude/agents` existed; root runbook docs were missing and now added. |
| i18n production setup | Implemented | Multi-locale packs, routing, switcher, RTL, checks, and i18n E2E are present. |
| Payment provider abstraction | Partial | Provider factory exists, but domain model still Stripe-shaped in DB/webhook path. |
| Postgres production readiness | Missing | SQLite-first schema exists; staged Postgres migration/rollback docs needed. |
| Tenant isolation | Implemented | Tenant helpers and tests exist; keep expanding regression coverage. |
| Webhook hardening | Partial | Stripe signature + idempotent payment event exists; broader provider-agnostic audit still needed. |
| E2E critical business flows | Partial | i18n flow exists; onboarding/booking/payment/staff/admin smoke set expanded in this update. |
| Observability (request ID, health, structured logs) | Partial | Basic logs exist; request-id + health contract and safer logging introduced in this update. |
| Background jobs reliability | Partial | Reminder processing exists; stronger retry/idempotency/visibility controls ongoing. |
| Mobile release readiness | Partial | Expo foundation exists; navigation/offline/staff mode/calendar still pending. |
| Legal/KVKK flow tests | Partial | Consent and deletion endpoints/tests exist; full legal completion still pending. |

## Highest-Risk Open Items

1. Postgres migration readiness and rollback process
2. Payment domain evolution from Stripe-shaped schema
3. Background job durability and operational observability
4. Mobile production maturity features

## Immediate Priority

1. CI strictness and runbook standardization
2. Payment + webhook domain hardening
3. Observability baseline (`x-request-id`, admin health, safer logs)
