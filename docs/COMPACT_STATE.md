# Randevo Compact State

_Last updated: 2026-05-14_

## 2026-05-15 CALUI-0 / CALUI-1 Checkpoint

- CALUI-0 completed:
  - Read `RANDEVO_CALENDAR_UI_THEME_BUGFIX_PLAN.md`.
  - Audited booking date flow, slots contract, dashboard/admin/staff theme mismatches, and i18n/content boundaries.
  - Added report:
    - `docs/ui-calendar-i18n-bug-report.md`
- CALUI-0 gate unblock:
  - `npm run i18n:check` initially failed due key parity (`auth.continue` only in `tr`).
  - Added missing `auth.continue` key to locale packs (`en/de/ar/es/fr/it/fa/ru/nl`) to restore parity.
- CALUI-1 completed:
  - Added reusable calendar wrapper:
    - `src/components/ui/calendar.tsx`
  - Added booking date picker component (month navigation + past-date disable):
    - `src/components/booking/BookingDatePicker.tsx`
  - Replaced fixed 14-day booking cards in:
    - `src/app/booking/[slug]/page.tsx`
  - Added helper coverage:
    - `src/tests/booking-date-picker.test.ts`
- Verification snapshot (CALUI-1):
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (65 files, 397 tests)
  - `npm run build` PASS
  - `npm run i18n:check` PASS
  - `npm run test:e2e` PASS (9 tests)
  - `npx prisma validate` FAIL in this workspace path context (`&` parsing)
  - `npx prisma generate` FAIL in this workspace path context (`&` parsing)
  - Equivalent Prisma CLI commands PASS:
    - `node .\\node_modules\\prisma\\build\\index.js validate`
    - `node .\\node_modules\\prisma\\build\\index.js generate`

## 2026-05-15 CALUI-2 / CALUI-3 Checkpoint

- CALUI-2 completed:
  - Normalized booking slots API date parsing with first-class `YYYY-MM-DD` support and ISO datetime compatibility.
  - Added route response meta (`isUnavailableDay`) and preserved existing booking engine contract.
  - Added client-side unavailable date memory in booking flow to mark known no-slot days on the calendar.
  - Added route tests:
    - `src/tests/booking-slots-route.test.ts`
- CALUI-3 completed:
  - Refactored dashboard/admin/staff surfaces to token-driven theme classes (`card`, `foreground`, `muted`, `border`) and removed hard-coded light-mode classes in target directories.
  - Audited and aligned listed routes under:
    - `/dashboard/*`
    - `/admin/*`
    - `/staff/*`
  - Added guardrail test for theme regressions:
    - `src/tests/dashboard-theme-class-audit.test.ts`
- Verification snapshot (CALUI-3):
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (67 files, 401 tests)
  - `npm run build` PASS
  - `npm run i18n:check` PASS
  - `npm run test:e2e` PASS (9 tests)
  - `npx prisma validate` FAIL in this workspace path context (`&` parsing)
  - `npx prisma generate` FAIL in this workspace path context (`&` parsing)
  - Equivalent Prisma CLI commands PASS:
    - `node .\\node_modules\\prisma\\build\\index.js validate`
    - `node .\\node_modules\\prisma\\build\\index.js generate`

## 2026-05-14 SAP-6 / SAP-7 Checkpoint

- SAP-6 completed:
  - Added superadmin subscriptions surface:
    - API: `GET /api/admin/subscriptions`
    - UI: `/admin/subscriptions`
  - Added superadmin usage surface:
    - API: `GET /api/admin/usage`
    - UI: `/admin/usage`
  - Updated `/admin` overview metrics to include:
    - total organizations
    - active/suspended split
    - current-month appointment total
    - active subscriptions
    - payment-pending accounts
    - plan distribution
    - recent audit logs
  - Updated admin navigation links in `src/app/admin/layout.tsx`.
  - Added route coverage:
    - `src/tests/admin-subscriptions-route.test.ts`
    - `src/tests/admin-usage-route.test.ts`
  - Added public booking regression sequence for suspend/activate compatibility:
    - `src/tests/multi-location.test.ts`
  - Normalized `src/lib/superadmin.ts` error messages (UTF-8).
- Verification snapshot for SAP-6:
  - `npm run check:node` PASS
  - `npm run check:secrets` PASS
  - `npm run validate:skills` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (61 files, 390 tests)
  - `npm run build` PASS (non-blocking local warning remains for legacy DB without `Organization.status`)
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate` PASS
  - `npm run test:e2e` PASS (9 tests)

## 2026-05-14 SAP-4 / SAP-5 Checkpoint

- SAP-4 completed:
  - Added `src/tests/staff-authorization.test.ts` coverage for staff scope isolation and admin/billing access blocks.
  - Hardened `requireStaffAuth` checks to enforce active `Staff` linkage.
  - Added explicit `OWNER|ADMIN` membership checks on billing APIs.
- SAP-5 completed:
  - Added organization lifecycle fields in Prisma:
    - `Organization.status` (`ACTIVE|SUSPENDED|CANCELLED`)
    - `Organization.suspendedAt`
    - `Organization.suspendedReason`
    - `Organization.suspendedByUserId`
    - compatibility `suspended:boolean` preserved.
  - Added migration:
    - `prisma/migrations/20260514201000_organization_lifecycle_status/migration.sql`
    - legacy `suspended` values are mapped to `status`.
  - Added lifecycle helper:
    - `src/lib/organization-lifecycle.ts`
    - public availability checks now support `status` + legacy fallback.
  - Updated superadmin organization APIs and admin pages:
    - `/api/admin/organizations`, `/api/admin/organizations/[id]`
    - `/admin`, `/admin/organizations`, `/admin/organizations/[id]`
    - suspend/activate now updates lifecycle fields and writes audit logs (`ORGANIZATION_SUSPENDED` / `ORGANIZATION_ACTIVATED`).
  - Public booking and marketplace guards are now lifecycle-aware:
    - `/api/booking/[slug]/appointments`
    - `/api/booking/[slug]/services`
    - `/api/booking/[slug]/slots`
    - `/api/booking/[slug]/profile`
    - `/api/booking/[slug]/locations`
    - `/api/booking/[slug]/checkout-session`
    - `/api/booking/[slug]/chat`
    - `/api/marketplace`
    - `/marketplace/[slug]`
- Verification snapshot for SAP-5:
  - `npm run check:node` PASS
  - `npm run check:secrets` PASS
  - `npm run validate:skills` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (59 files, 383 tests)
  - `npm run build` PASS
  - `node ./node_modules/prisma/build/index.js validate` PASS
  - `node ./node_modules/prisma/build/index.js generate` PASS

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

## 2026-05-14 GLF-Final Checkpoint

- Completed global localization hardening across data model, marketplace filtering, and legacy routing.
- Added persistent geo fields to core models:
  - `Organization`: `countryCode`, `locality`, `formattedAddress`, `latitude`, `longitude`
  - `Location`: `countryCode`, `locality`, `formattedAddress`, `latitude`, `longitude`
- Added migration:
  - `prisma/migrations/20260514235500_add_org_location_geo_fields/migration.sql`
  - Includes legacy backfill (`countryCode=TR`, `formattedAddress` fallback from `address`) and organization normalized-address bootstrap.
- Added organization normalized-address sync service:
  - `src/services/address/organization-address-sync.service.ts`
  - Deterministic `provider="manual"`, `providerPlaceId="organization:<orgId>"`.
- Organization write paths updated to sync normalized address on create/update:
  - `POST /api/organizations`
  - `PATCH /api/organizations/current`
- Marketplace API finalized for country-aware filtering with fallback:
  - `country` / `countryCode` supported
  - `province` applied only when `country=TR`
  - non-TR `locality` filtering uses normalized addresses and organization geo fallback.
- Legacy route split completed:
  - `/marketplace/[slug]` now business-detail only.
  - Legacy province slug requests are redirected to `/marketplace/location/tr/[slug]`.
- Category globalization completed:
  - Added locale-aware canonical category source: `src/data/marketplace-categories.ts`
  - Marketplace category select now uses canonical slugs with locale labels.
- UI forms updated for country-aware organization geo capture:
  - `src/app/(auth)/onboarding/page.tsx`
  - `src/app/dashboard/settings/page.tsx`
- Added/updated tests:
  - `src/tests/marketplace.test.ts`
  - `src/tests/marketplace-categories.test.ts`
  - `src/tests/marketplace-slug-route-contract.test.ts`
  - `src/tests/organization-address-sync.service.test.ts`

### Verification Snapshot (GLF-Final)

- `npm run check:node` PASS
- `npm run check:secrets` PASS
- `npm run validate:skills` PASS
- `npm run lint` PASS
- `npm test` PASS (64 files, 396 tests)
- `npm run build` PASS
- `npm run test:e2e` PASS (9 tests)
- `npx prisma validate` FAIL in this workspace due Windows path `&` shell parsing
- `npx prisma generate` FAIL in this workspace due Windows path `&` shell parsing
- Equivalent Prisma CLI commands PASS:
  - `node .\\node_modules\\prisma\\build\\index.js validate`
  - `node .\\node_modules\\prisma\\build\\index.js generate`
- Applied migrations locally after network-approved run:
  - `node .\\node_modules\\prisma\\build\\index.js migrate deploy` PASS

## 2026-05-15 GLF-6 Release Closeout (v1.6.2)

- Added deterministic screenshot artifact capture to e2e regression:
  - `tests/e2e/marketplace-localization.spec.ts`
- Artifact output directory:
  - `test-results/marketplace-localization/`
- Expected artifact files:
  - `v1.6.2-tr-province-dropdown.png`
  - `v1.6.2-it-locality-input.png`
  - `v1.6.2-en-landing-no-turkey-copy.png`
- Added detailed README section:
  - `Global Address & Marketplace Localization`
  - includes marketplace query contract, TR/non-TR flow, provider fallback, legacy redirect, migration summary, and Windows Prisma command note.
- Release tag finalized:
  - `v1.6.2-global-marketplace-localization`
  - pushed to `origin`

### Verification Snapshot (Release Closeout)

- `npm run check:node` PASS
- `npm run check:secrets` PASS
- `npm run validate:skills` PASS
- `npm run lint` PASS
- `npm test` PASS
- `npm run build` PASS
- `npm run test:e2e` PASS
- `npx prisma validate` fails in this workspace path context (`&` parsing)
- `npx prisma generate` fails in this workspace path context (`&` parsing)
- Equivalent commands PASS:
  - `node .\\node_modules\\prisma\\build\\index.js validate`
  - `node .\\node_modules\\prisma\\build\\index.js generate`
