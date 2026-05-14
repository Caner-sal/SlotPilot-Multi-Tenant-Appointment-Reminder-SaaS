# Randevo Compact State

_Last updated: 2026-05-14_

## 2026-05-14 SAP-2 / SAP-3 Checkpoint

- SAP-2 completed:
  - Staff invite flow stabilized with secure hash-first accept validation and legacy token fallback.
  - Invite URL target moved to `/staff/invite/[token]`, while `/staff/accept-invite` compatibility remains.
  - Added audit log events for invite create/revoke/accept/expire.
  - Added existing-account compatibility path: invite accept now returns explicit login-required code when invited email already exists and caller is not authenticated as that user.
- SAP-3 completed:
  - Added new staff self-scope APIs:
    - `GET /api/staff/me`
    - `GET /api/staff/me/appointments`
    - `GET /api/staff/me/appointments/[id]`
    - `PATCH /api/staff/me/appointments/[id]/status`
    - `GET/PATCH /api/staff/me/availability`
  - Added `/staff/appointments/[id]` page and updated staff dashboard/appointments/availability pages to consume `/api/staff/me*` endpoints.
  - Existing `/api/staff-portal/*` endpoints were preserved for compatibility.
- Verification snapshot for SAP-3:
  - `npm run check:node` PASS
  - `npm run check:secrets` PASS
  - `npm run validate:skills` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (58 files, 379 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate` PASS

## 2026-05-14 GLF-4 / GLF-5 Checkpoint

- GLF-4 completed:
  - Landing copy was localized for global/non-TR contexts across `en/it/de/fr/es/nl/ru/fa/ar` packs.
  - TR-specific landing copy preserved in `tr` locale.
  - `src/app/page.tsx` no longer hard-codes `"81"`; value now comes from locale key `landing.statSupportValue`.
  - Added regression test `src/tests/landing-localization.test.ts` for TR-only vs non-TR copy boundaries.
- GLF-5 completed:
  - Strengthened address provider fallback in `src/services/address/address-provider.factory.ts`:
    - runtime fallback now applies for `autocomplete` and `retrieve` failures (not only provider selection time).
    - non-TR search path remains usable when primary provider is missing env config (manual fallback).
  - Extended tests:
    - `src/tests/address-provider.test.ts` for runtime fallback on missing Google API key.
    - `src/tests/address-search.service.test.ts` for non-TR (`IT`) locality search fallback behavior.
- Verification snapshot for GLF-5:
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (56 files, 369 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate --no-engine` PASS

## 2026-05-14 GLF-6 Checkpoint

- GLF-6 completed:
  - Added E2E regression file `tests/e2e/marketplace-localization.spec.ts` covering:
    - TR selected -> `Adana` visible in province list
    - IT selected -> no TR province option and locality search flow active (`Roma`)
    - Non-TR landing -> does not show Turkey-only copy markers
  - Updated `CHANGELOG.md` with `1.6.2-global-marketplace-localization` release entry.
- E2E reliability note:
  - Initial E2E run failed due Prisma client being generated in `--no-engine` mode while webserver process held engine lock.
  - Resolved by stopping stale `next start` process and regenerating Prisma client with engines:
    - `node ./node_modules/prisma/build/index.js generate`
- Verification snapshot for GLF-6:
  - `npm run check:node` PASS
  - `npm run check:secrets` PASS
  - `npm run validate:skills` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (56 files, 369 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate` PASS
  - `npm run test:e2e` PASS (9 tests)

## 2026-05-14 GLF-2 / GLF-3 Checkpoint

- GLF-2 completed:
  - Refactored marketplace filter UX in `src/app/marketplace/page.tsx` to be country-aware.
  - `TR` path keeps province dropdown sourced from `TURKEY_PROVINCES`.
  - Non-TR path uses locality search/manual entry flow and no Turkey province list.
  - Country change now clears stale location state (`province`, `locality`) before next query.
  - Added `src/lib/marketplace/filters.ts` and `src/tests/marketplace-filters.test.ts` to lock request-param behavior.
- GLF-3 completed:
  - Updated `GET /api/marketplace` in `src/app/api/marketplace/route.ts` to accept `country` (primary) and `countryCode` (compat alias).
  - Province filter now applies only when resolved country is `TR`.
  - Non-TR behavior ignores province and uses normalized-address country/locality matching.
  - Updated `src/tests/marketplace.test.ts` to cover TR province behavior, non-TR province ignore, compatibility alias, and empty normalized-address path.
- Verification snapshot for GLF-3:
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (55 files, 364 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate --no-engine` PASS (Windows engine file-lock workaround)

## 2026-05-14 GLF-0 / GLF-1 Checkpoint

- GLF-0 completed:
  - Read `RANDEVO_GLOBAL_LOCALIZATION_BUGFIX_PLAN (1).md`.
  - Audited Turkey hard-codes and created `docs/global-localization-bug-report.md`.
  - Confirmed marketplace UI and landing copy regressions for non-TR contexts.
- Baseline gate stabilization completed before GLF-1:
  - Fixed failing test mock typings and enum typo in `src/tests/demo-workspace-safety.test.ts`.
  - Added missing `auth.continue` Turkish key required by i18n test coverage.
- GLF-1 completed:
  - Added `src/config/countries.ts` with canonical typed country config (TR, IT, US, DE, FR, ES, GB, NL).
  - Added `src/lib/address/location-options.ts` (`TURKEY_PROVINCES` now wrapped behind explicit TR check helper).
  - Added `src/tests/location-options.test.ts` to lock TR/non-TR behavior.
- Verification snapshot for GLF-1:
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (54 files, 361 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate --no-engine` PASS (used due Windows engine file lock on standard generate)

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
