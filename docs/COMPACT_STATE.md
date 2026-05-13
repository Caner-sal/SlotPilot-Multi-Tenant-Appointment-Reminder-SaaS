# Randevo Compact State

_Last updated: 2026-05-14_

## 2026-05-14 PROD-12/13/14 Closeout (Current Pass)

### PROD-12 Functional Completion
- Demo workspace remains seed-only and deterministic via `prisma/demo-workspace.ts`.
- Demo seed safety is enforced:
  - FREE + ACTIVE subscription only
  - no Stripe customer/subscription ids
  - `paymentCountDelta` must remain `0`.
- Owner dashboard onboarding checklist completed:
  - `GET /api/dashboard/onboarding-checklist`
  - deterministic completion rules for org/service/first-booking/plan-click.
- Superadmin product event read visibility completed:
  - `GET /api/admin/product-events`
  - filters: `eventName`, `organizationId`
  - stable `limit/cursor` pagination.

### PROD-13/14 Hardening and Validation
- Added route/service/safety test coverage:
  - `src/tests/onboarding-checklist.service.test.ts`
  - `src/tests/dashboard-onboarding-checklist-route.test.ts`
  - `src/tests/admin-product-events-route.test.ts`
  - `src/tests/demo-workspace-safety.test.ts`
- Updated deployment and release docs for demo seed invariants and new API smoke steps.
- Full gate rerun completed successfully:
  - `npm run check:node`
  - `npm run check:secrets`
  - `npm run validate:skills`
  - `npm run lint`
  - `npm test` (53 files, 358 tests)
  - `npm run build`
  - `node ./node_modules/prisma/build/index.js validate`
  - `node ./node_modules/prisma/build/index.js generate`
  - `npm run test:e2e` (7 passed)
  - `cd mobile && npm run typecheck`

## Expanded Language Pack Status (10 Locales)

Plan file: `SLOTPILOT_EXTRA_LANGUAGE_PACKS_EXPANDED_UPDATE_PLAN.md`

| Phase | Status | Notes |
|-------|--------|-------|
| LANG-0 | Complete | Baseline audit completed, `en` set as source baseline |
| LANG-1 | Complete | Locale list expanded to 10, web language switcher now includes new locales |
| LANG-2 | Complete | Spanish + French language packs completed and validated |
| LANG-3 | Complete | Italian + Persian language packs completed and validated |
| LANG-4 | Complete | Russian + Dutch language packs completed with locale smoke checks |
| LANG-5 | Complete | Mobile + notifications + E2E + docs completed, release tag prepared |

## Current Branch
- `phase/i18n-8` → ready to merge into `main`

## Global I18N Plan Status — COMPLETE ✓

All phases completed and pushed:

| Phase | Tag | Summary |
|-------|-----|---------|
| i18n-0 | — | Architecture audit, agent setup |
| i18n-1 | — | Locale routing, message bootstrap |
| i18n-2 | — | Web language switcher |
| i18n-3 | — | Translation migration (core surfaces) |
| i18n-4 | — | Locale-aware formatting helpers + tests |
| i18n-5 | — | Mobile language support |
| i18n-6 | — | RTL handling, language switcher accessibility |
| i18n-7 | — | Locale-aware notification templates + fallback |
| i18n-8 | `v1.3.9-global-i18n-phase-8` | SEO helpers, sitemap, robots, Playwright E2E |
| i18n-9 | — | Full UI translation coverage — ALL 21 pages |

## I18N-9 Summary (latest commit: 76c5436)
- **21 page files** updated to use `useTranslations()` / `getTranslations()`
- **4 locale JSON files** expanded to **434 keys × 4 locales** across **21 namespaces**
- Namespaces: `common`, `landing`, `auth`, `booking`, `dashboard`, `appointments`, `services`, `staffPage`, `availability`, `billing`, `settings`, `analytics`, `locations`, `reminders`, `whatsapp`, `auditLogs`, `marketplace`, `staffPortal`, `nav`, `dashboardHeader`, `bookingLayout`
- Locale-aware date formatting via `localeMetadata[locale].dateLocale`
- Module-level arrays (featureCards, plans, DAYS, steps) moved inside component bodies
- `vitest.config.ts` updated to exclude Playwright E2E from vitest runs

## Gate Status (Full i18n)
- Build (Next.js): **PASS** — 66 routes, 0 TypeScript errors
- Tests (vitest): **PASS** — 294/294
- Locale switching: TR/EN/DE/AR all pages respond correctly
- RTL: Arabic layout preserved
- Playwright E2E: Configured (playwright.config.ts)

## Architecture Summary
- Middleware: locale extracted from URL prefix, sets `x-app-locale` header
- Server components: `getTranslations("ns")` from `next-intl/server`
- Client components: `useTranslations("ns")` from `next-intl`
- `NextIntlClientProvider` wraps app in `src/app/layout.tsx`
- Route pattern: `/tr/`, `/en/`, `/de/`, `/ar/` — no `[locale]` folder segment

## Key Files
- `src/i18n/locales.ts` — locale config, metadata, flags
- `src/i18n/request.ts` — server-side locale resolution
- `src/middleware.ts` — locale routing + redirect
- `src/messages/{tr,en,de,ar}.json` — 434 keys × 4 locales
- `src/app/layout.tsx` — NextIntlClientProvider + hreflang

## Next Phase Candidates
- Merge `phase/i18n-8` → `main`
- Mobile app i18n sync (mobile/ folder already has i18n-js setup from phase-5)
- New language addition (docs/adding-new-language.md guide ready)
- Feature work: deposit payments, AI assistant expansion, marketplace enhancements

## 2026-05-13 Global Address + Auto Locale Progress
- COMPAT-0: typecheck and phase:gate scripts added; node-module bin paths used to avoid '&' path breakage.
- LOC-0/1: request locale resolver added (src/i18n/request-locale.ts) with precedence route > cookie > user > country > accept-language > fallback(en).
- Middleware now writes x-app-locale-source and x-app-country-code headers for telemetry.
- Global address abstraction added: AddressProvider interface, ManualAddressProvider, GoogleAddressProvider, provider factory + normalizer.
- Global address API endpoints added: GET /api/address/autocomplete and POST /api/address/retrieve.
- Prisma global models added: NormalizedAddress, CountryConfig, AddressProviderLog.
- Booking flow upgraded with country-aware form + reusable AddressAutocomplete component.
- Marketplace API supports countryCode/locality filters and new route /marketplace/location/[country]/[city].

## 2026-05-13 Production Readiness Sprint-1+ Foundations
- Added strict CI gates in `.github/workflows/ci.yml` (no silent skip, fail-fast quality checks, e2e-smoke, mobile-quality).
- Added root runbooks and review docs: `AGENTS.md`, `CLAUDE.md`, `docs/agent-runbook.md`, `docs/code-review.md`, `docs/phase-execution-rules.md`, `docs/ci-quality-gates.md`, `docs/product-gap-analysis.md`.
- Added production-readiness docs: `docs/database-production-readiness.md`, `docs/security-hardening.md`, `docs/observability.md`, `docs/e2e-testing-guide.md`.
- Introduced payment domain foundation in Prisma: `provider`, `purpose`, `providerEventId`, `externalReference`, `metadata`, `confirmedAt`, `updatedAt`, plus new models `PaymentAttempt` and `WebhookEvent`.
- Added request correlation and observability foundation: `x-request-id` in middleware, `src/lib/logger.ts`, `src/lib/request-id.ts`, admin health API and page (`/api/admin/health`, `/admin/health`).
- Hardened webhook/job flows with idempotency contracts and safer logging.
- Added E2E smoke for critical guard/entry paths (`tests/e2e/critical-guards.spec.ts`).
- Added mobile typecheck script compatible with Windows path constraints.

## 2026-05-13 Sprint-3 Ops Progress (Jobs + Observability)
- Fixed i18n onboarding warning source by moving onboarding action labels to `common` namespace usage (`back`/`next`), and added onboarding i18n coverage regression test.
- Added reminder retry/backoff behavior (5/15/60 minutes, max retry 3) without schema change:
  - temporary failures return to `PENDING` with incremented `retryCount`
  - permanent failures remain `FAILED`.
- Expanded reminder process stats contract:
  - `processed`, `sent`, `failed`, `retried`, `permanentFailed`, `skipped`.
- Extended admin observability:
  - `/api/admin/health` now includes trend windows (`last24h`, `last7d`)
  - new `/api/admin/failures` endpoint with source filter and cursor pagination
  - `/admin/health` UI now reads health/failure APIs directly.
- Standardized route-level logging metadata in critical ops routes:
  - `route` and `outcome` now included consistently with `requestId`.
- Strengthened redaction policy to include PII-oriented keys (`email`, `phone`, `fullName`).
- Added tests:
  - `src/tests/admin-failures-route.test.ts`
  - extended `src/tests/reminder.test.ts` for retry/backoff
  - updated `src/tests/reminders-process-route.test.ts`
  - updated `src/tests/admin-health-route.test.ts`
  - updated `src/tests/logger-redaction.test.ts`

## Validation Snapshot
- `npm run check:node` ✅
- `npm run check:secrets` ✅
- `npm run validate:skills` ✅
- `npm run lint` ✅
- `npm test` ✅ (44 files, 334 tests)
- `npm run build` ✅
- `node ./node_modules/prisma/build/index.js validate` ✅
- `node ./node_modules/prisma/build/index.js generate` ✅
- `npm run test:e2e` ✅ (7 tests)
- `cd mobile && npm run typecheck` ✅


## 2026-05-14 PROD-10 to PROD-14 Final Status

### Wave-1 (PROD-10 Mobile + PROD-11 Legal/KVKK)
- Mobile JWT Bridge implemented:
  - `POST /api/mobile/auth/login`
  - `POST /api/mobile/auth/refresh`
  - `POST /api/mobile/auth/logout`
- Refresh token rotation and revoke lifecycle added with Prisma model `MobileRefreshToken`.
- Mobile app moved to React Navigation stack flow (auth/app).
- Mobile role-aware behavior added (owner vs staff capability split).
- Mobile appointments now use offline read-cache fallback (stale-while-revalidate style, no write queue).
- Mobile calendar day/week view added (`CalendarScreen`).
- Push foundation added:
  - `POST /api/mobile/push/register`
  - `POST /api/mobile/push/dev-trigger` (non-production only)
- Legal pages added and footer links are now real routes:
  - `/legal/privacy`
  - `/legal/kvkk`
  - `/legal/terms`
  - `/legal/cookies`
- GDPR export flow added:
  - `POST /api/gdpr/export-request`
- GDPR admin visibility added:
  - `GET /api/admin/gdpr/requests`

### Wave-2 (PROD-12 Growth + PROD-13 Release Hardening) - Complete
- Product event foundation added via `ProductEvent` model and service.
- Event hooks added:
  - `signup_started`
  - `organization_created`
  - `service_created`
  - `first_booking_created`
  - `plan_upgrade_clicked`
- Owner onboarding checklist read contract completed:
  - `GET /api/dashboard/onboarding-checklist`
- Superadmin product event read contract completed:
  - `GET /api/admin/product-events?eventName=&organizationId=&limit=&cursor=`
- Deployment/release docs aligned to final contracts and staging gate evidence.

### Wave-3 (PROD-14 Final QA/Release) - Final Validation Snapshot
- `npm run check:node` PASS
- `npm run check:secrets` PASS
- `npm run validate:skills` PASS
- `npm run lint` PASS
- `npm test` PASS (53 files, 358 tests)
- `npm run build` PASS
- `node ./node_modules/prisma/build/index.js validate` PASS
- `node ./node_modules/prisma/build/index.js generate` PASS
- `npm run test:e2e` PASS (7 tests)
- `cd mobile && npm run typecheck` PASS
