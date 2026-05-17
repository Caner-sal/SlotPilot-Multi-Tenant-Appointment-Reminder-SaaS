# Changelog

All notable changes to Randevo are documented here.

## [1.9.1] - 2026-05-17

### Checkout Auth + Discover Prisma Error Fix — FIXERR-0 → FIXERR-6

#### Checkout "Oturum Doğrulanamadı" Düzeltmesi

- **Checkout page loading guard** eklendi: `sessionStatus === "loading"` durumunda ödeme butonu pasif, spinner gösterilir
- **Unauthenticated redirect** eklendi: `sessionStatus === "unauthenticated"` durumunda `/login?callbackUrl=...` ile yönlendirilir
- **Staff guard** düzeltildi: artık `sessionStatus === "authenticated"` koşuluna bağlı değil
- **API route 401/403 ayrımı**: TenantError mesajına göre `401 AUTH_REQUIRED` / `403 FORBIDDEN` / `404 ACTIVE_ORGANIZATION_REQUIRED` döner
- **handleProceed error branching**: 401 → login redirect, 403 → yetki mesajı, 404 → org oluştur mesajı
- **3 yeni translation key** (10 locale): `checkoutSessionRequired`, `checkoutForbidden`, `checkoutOrgRequired`

#### Marketplace/Discover Prisma Hatası Düzeltmesi

- **DATABASE_URL protocol validation** eklendi: `env:check` artık `file:`, `sqlite:`, boş değer gibi geçersiz protokolleri `FAIL` olarak yakalar
- **`.env.example`** güncellendi: SQLite URL kaldırıldı, PostgreSQL URL default yapıldı
- **`addressProviderLog.create()` non-blocking** yapıldı: DB log yazma hatası address autocomplete/retrieve akışını artık kırmıyor
- **Raw Prisma error UI'ya sızmıyor**: autocomplete/retrieve error response artık Türkçe kullanıcı dostu mesaj
- **`discover/search` try-catch** eklendi: structured error shape (`DISCOVER_SEARCH_FAILED`) dönüyor
- **Discover page retry butonu** eklendi: error state'te "Tekrar Dene" butonu ile yeniden arama yapılabilir

#### Testler

- 31 yeni regression testi (`src/tests/checkout-discover-error-regression.test.ts`)
- Tüm test suite: **74 dosya, 549 test** — PASS

## [1.9.0] - 2026-05-17

### Billing Checkout & UI Cleanup — BILLUI-0 → BILLUI-9

#### UI Düzeltmeleri

- **WhatsApp yanıt modu** native `<select>` → Radix UI Select ile değiştirildi (beyaz dropdown bug giderildi)
- **Analytics "Öne Çıkanlar"** kartları: `bg-blue-50` / `bg-indigo-50` → `bg-blue-500/10` / `bg-indigo-500/10` (dark theme uyumu)
- **Billing plan badge'leri**: `bg-blue-100` / `bg-purple-100` → `bg-blue-500/15` / `bg-purple-500/15`
- **Billing alert mesajları**: `bg-green-50` / `bg-yellow-50` / `bg-amber-50` → dark-safe `/10` token'larına taşındı

#### Yeni Billing Sayfaları

- `/dashboard/billing/checkout?plan=STARTER|PRO` — Plan detayları, ödeme özeti, güvenlik notu
- `/dashboard/billing/success` — Ödeme doğrulama bekleme, PAID/ACTIVE → başarı mesajı, polling
- `/dashboard/billing/failure` — Hata mesajı, tekrar dene butonu
- `/dashboard/billing/history` — Son 50 subscription payment transaction listesi

#### Yeni API Endpoint'leri

- `GET /api/billing/history` — OWNER/ADMIN guard, SubscriptionPaymentTransaction listesi
- `GET /api/billing/confirm?conversationId=...` — Ödeme durum sorgusu (success sayfası için)
- `POST /api/webhooks/iyzico` — iyzico webhook (signature doğrulama, idempotency, amount kontrolü)

#### Billing Altyapısı

- `SubscriptionPaymentTransaction` Prisma modeli eklendi (subscription ödemeleri için)
- `src/config/billing-plans.ts` — merkezi plan config re-export + checkout URL helper
- `src/config/payment-provider-mapping.ts` — iyzico plan referans kodları
- `PaymentProvider` interface'e `createSubscriptionCheckout?` method eklendi
- `FakePaymentProvider` — dev/test için end-to-end checkout akışı simülasyonu
- `IyzicoProvider.createSubscriptionCheckout()` — iyzico Subscription Checkout Form API entegrasyonu
- `/api/billing/checkout` refactor: multi-provider, SubscriptionPaymentTransaction kaydı, production fail-fast

#### Güvenlik

- Amount/currency her zaman server-side plan config'den alınıyor (client kontrolü yok)
- Staff kullanıcılar billing checkout başlatamıyor (assertMembership guard)
- iyzico webhook: HMAC-SHA256 imza doğrulama + WebhookEvent idempotency
- Subscription sadece webhook/confirm doğrulaması sonrası aktif ediliyor
- FakePaymentProvider sadece `NODE_ENV !== "production"` ortamında kullanılabilir
- `docs/billing-security-review.md` oluşturuldu

#### Testler

- `tests/e2e/billing-checkout.spec.ts` — 8 E2E test (UI regression + API guard'ları)
- 41 yeni i18n anahtarı (checkout, success, failure, history) — 10 locale

## [1.8.0] - 2026-05-16

### Türkiye İl/İlçe Datası — Tam 81 İl

- Tüm 81 il için kapsamlı audit gerçekleştirildi (`docs/turkey-district-data-audit.md`)
- Büyük illerde sadece şehir merkezi ilçelerinin mevcut olduğu kritik boşluk giderildi
- **Ankara**: 8 → 25 ilçe (+17: Akyurt, Ayaş, Bala, Beypazarı, Çamlıdere, Çubuk, Elmadağ, Evren, Gölbaşı, Güdül, Haymana, Kahramankazan, Kalecik, Kızılcahamam, Nallıhan, Polatlı, Şereflikoçhisar)
- **İzmir**: 9 → 30 ilçe (+21: Aliağa, Balçova, Bayındır, Bayraklı, Bergama, Beydağ, Çeşme, Dikili, Foça, Güzelbahçe, Karaburun, Kemalpaşa, Kınık, Kiraz, Menderes, Narlıdere, Ödemiş, Seferihisar, Selçuk, Tire, Urla)
- **Bursa**: 4 → 18 ilçe (+13: Büyükorhan, Gemlik, Gürsu, Harmancık, İnegöl, İznik, Karacabey, Keles, Kestel, Mudanya, Mustafakemalpaşa, Orhaneli, Orhangazi, Yenişehir)
- **Antalya**: 5 → 19 ilçe (+14: Akseki, Alanya, Demre, Elmalı, Finike, Gazipaşa, Gündoğmuş, İbradı, Kaş, Kemer, Korkuteli, Kumluca, Manavgat, Serik)
- **Mersin**: 4 → 13 ilçe (+9: Anamur, Aydıncık, Bozyazı, Çamlıyayla, Erdemli, Gülnar, Mut, Silifke, Tarsus)
- **Konya**: 27 → 31 ilçe (+4: Ahırlı, Çeltik, Tuzlukçu, Yalıhüyük)
- **Çankırı**: 10 → 12 ilçe (+2), **Manisa**: 15 → 17 (+2), **Rize**: 11 → 12 (+1), **Aksaray**: 7 → 8 (+1), **Hakkari**: 4 → 5 (+1), **Trabzon**: 17 → 18 (+1), **Sakarya**: 16 → 17 (+1)
- Slug hataları düzeltildi: Nevşehir `hacibiktas` → `hacibektas`, Sivas `akincolar` → `akincilar`
- Toplam ilçe: 903 → 991
- `scripts/validate-turkey-location-data.ts` validation script eklendi — katı threshold ve regression kontrolü
- `npm run check:turkey-locations` scripti eklendi
- `docs/turkey-location-data-source.md` kaynak ve güncelleme prosedürü eklendi
- Tüm büyük iller için threshold testleri eklendi (31 test)

---

## [1.7.0] - 2026-05-16

### Yeni Özellikler

- **Kullanıcı Keşif Sayfası (`/discover`)**: Hizmet, kategori, ülke, il/ilçe filtreleri ile işletme arama.
- **İşletme Detay Sayfası (`/discover/business/[slug]`)**: Hizmet listesi ve tek tıkla randevu alma.
- **Customer Appointment Panel (`/customer/appointments`)**: Yaklaşan ve geçmiş randevuların email-scoped listesi.
- **Şifremi Unuttum Akışı**: `/forgot-password` ve `/reset-password/[token]` sayfaları, güvenli hash/expiry/single-use token sistemi.

### Güvenlik

- `POST /api/auth/forgot-password`: Rate limit (5/15dk/IP), account enumeration yok, SHA-256 token hash.
- `POST /api/auth/reset-password`: `usedAt` guard, expiry kontrolü, bcrypt re-hash, `$transaction` ile atomik güncelleme.
- `GET /api/customer/appointments`: 401 guard, sadece session email'iyle eşleşen randevular.

### Türkiye İlçe Datası

- Kocaeli için 8 eksik ilçe eklendi: Başiskele, Çayırova, Derince, Dilovası, Gölcük, Kandıra, Karamürsel, Kartepe.
- Kocaeli şimdi 12 resmi ilçenin tamamına sahip.
- Regression spot-check testleri eklendi.

### UI / Tema

- Booking sayfasında `bg-red-50` → `bg-destructive/10`, `bg-green-100` → `bg-green-500/10`.
- Marketplace location sayfasındaki tüm light-theme kalıntıları design token'larına taşındı.
- Dashboard metrik kartları ve OnboardingChecklistCard inline stillerden Tailwind class'larına geçirildi.

### Yeni API'ler

- `GET /api/discover/search` — public, `marketplaceEnabled` filtrelidir.
- `GET /api/customer/appointments` — auth-required, email-scoped.
- `POST /api/auth/forgot-password` — rate limited.
- `POST /api/auth/reset-password` — token validate + bcrypt.

### Test

- 12 yeni `auth-reset` unit testi (forgot-password + reset-password).
- 3 yeni Kocaeli district spot-check testi.
- Toplam: 73 test dosyası, 505 test.

---

## [1.6.4-production-audit-hardening] - 2026-05-16

### Production Audit Hardening (PH-0 to PH-9)

#### Security Fixes

- **PH-1**: Middleware Edge runtime güvenliği — NextAuth `auth()` wrapper (Prisma+bcrypt zinciri)
  kaldırıldı, Edge-safe `getEdgeSession()` ile değiştirildi (`src/lib/auth-edge.ts`, `next-auth/jwt` Web Crypto)
- **PH-2**: Mobile JWT secret fail-fast — `"dev-mobile-secret-change-me"` fallback kaldırıldı;
  MOBILE_JWT_SECRET veya AUTH_SECRET yoksa runtime'da throw eder (`src/lib/mobile-jwt.ts`)
- **PH-8**: Invite accept endpoint rate limiting — 10 istek/15 dakika per IP, 429 + Retry-After
  header döner (`src/lib/rate-limit.ts` kullanılır)

#### Bug Fixes

- **PH-5**: Staff invite route PII sızıntısı — `console.log(email, inviteUrl)` kaldırıldı,
  structured logger ile değiştirildi (email + invite URL loglanmaz)
- **PH-5b**: Audit service error leak — `console.error(params)` → `logger.error(...)` (metadata omitted)
- **PH-6**: billing/page.tsx encoding bozukluğu — `yapılandırılmamış` ve `₺0/ay` düzeltildi
  (mojibake UTF-8→Latin-1 karışıklığı)

#### New Features / Hardening

- **PH-3**: Active organization selection — cookie tabanlı aktif org seçimi + membership doğrulama;
  `OrganizationSwitcher` UI component; `GET /api/organizations` endpoint
- **PH-7**: Provider factory fail-fast — calendar ve whatsapp factory'leri production'da FAKE
  provider'a sessizce düşmez, `src/lib/providers/provider-health.ts` utility
- **PH-9**: Auth/tenant guard helpers — `src/lib/auth/guards.ts` ve
  `src/lib/tenant/require-membership.ts` merkezi guard pattern

#### New Scripts

- `env:check` — zorunlu production env değişkenlerini doğrular (`scripts/check-production-env.ts`)
- `check:logs` — API route'larda `console.log` PII sızıntısını tespit eder
- `check:encoding` — kaynak dosyalarda mojibake karakterleri tespit eder

#### New Files (17)

- `docs/production-audit-2026-05-16.md` — audit bulguları tablosu
- `src/lib/auth-edge.ts` — Edge-safe JWT session helper
- `src/lib/auth-server.ts` — server-side auth re-export
- `src/lib/env/validate-env.ts` — env validation utility
- `scripts/check-production-env.ts` — production env check script
- `src/lib/tenant/active-organization.ts` — cookie-based active org resolver
- `src/app/api/organization/active/route.ts` — active org API endpoint
- `src/components/organization/OrganizationSwitcher.tsx` — org switcher UI
- `tests/e2e/helpers/fill-onboarding.ts` — E2E onboarding helper
- `tests/e2e/helpers/test-users.ts` — E2E test user constants
- `tests/e2e/helpers/selectors.ts` — E2E selector constants
- `scripts/check-console-usage.ts` — console PII guard script
- `scripts/check-encoding.ts` — encoding check script
- `src/lib/providers/provider-health.ts` — provider fail-fast utility
- `src/lib/auth/guards.ts` — shared auth guard helpers
- `src/lib/tenant/require-membership.ts` — combined auth+membership guard
- `docs/auth-tenant-helper-strategy.md` — auth split strategy docs

---

## [1.6.3-phone-district-select-fix] - 2026-05-15

### DPD-0 to DPD-7 — Dark Select, Global Phone Codes, Turkey District Fix

#### Bug Fixes

- **Dark theme select dropdown:** Native `<select>` elements replaced with Radix UI themed
  `Select` component (`src/components/ui/select.tsx` — already fully dark-theme aware via
  `bg-popover`/`text-popover-foreground` CSS vars). Affected pages:
  - `src/app/(auth)/onboarding/page.tsx`: country select + timezone select → Radix Select
    (inline `style` prop passed to `SelectTrigger`)
  - `src/app/booking/[slug]/page.tsx`: country, province, and district selects → `CountrySelect`,
    `ProvinceSelect`, `DistrictSelect` wrapper components
  - `src/app/dashboard/settings/page.tsx`: country select → `CountrySelect`

- **Phone dial code not updating on country change:** Root cause was
  `src/config/country-address-config.ts` `defaultConfig.phoneCountryCode: "+90"` causing
  NL, GB, CA, AU to inherit Turkey's dial code. Fixes:
  - `defaultConfig.phoneCountryCode` changed from `"+90"` to `""` (no hardcoded fallback)
  - NL (+31), GB (+44), CA (+1), AU (+61) added to `countryAddressConfigs`
  - `src/app/booking/[slug]/page.tsx` line 666 phone placeholder was already dynamic via
    `addressConfig.phoneCountryCode` — auto-heals with config fix

- **Onboarding hardcoded `+90` placeholder:** `src/app/(auth)/onboarding/page.tsx` line 208
  `placeholder="+90 555 000 00 00"` replaced with dynamic
  `getCallingCodeForCountry(countryCode)` call

#### New Files

- `src/data/country-phone-codes.ts` — 180+ ISO 3166-1 alpha-2 → E.164 dial code mapping
- `src/lib/phone/country-calling-code.ts` — `getCallingCodeForCountry(code): string` helper
  (returns `""` for unknown countries, never `"+90"`)
- `src/components/forms/CountrySelect.tsx` — Radix UI Select + COUNTRY_OPTIONS
- `src/components/forms/ProvinceSelect.tsx` — Radix UI Select + TURKEY_PROVINCES
- `src/components/forms/DistrictSelect.tsx` — Radix UI Select + getDistrictsByProvince
- `tests/e2e/dark-select-phone-regression.spec.ts` — E2E regression guards

#### Documentation

- `docs/dark-select-phone-district-bug-report.md` — bug audit report
- `docs/turkey-district-data-audit.md` — Turkey district completeness report
  (81 provinces, 903 districts, all tests passing)
- `src/data/turkey-provinces.ts` — JSDoc added to `TURKEY_DISTRICTS` constant

#### Tests Added

- `src/tests/country-phone-codes.test.ts` — 24 tests (dial code mapping + helper)
- `src/tests/country-address-config.test.ts` — 6 new assertions (NL/GB/CA/AU + empty default)

---

## [1.6.2-geo-ui-fix] - 2026-05-15

### GEOUI-0 to GEOUI-8 — Geo Locale, Global Copy & Unified UI Fix

#### Bug Fixes
- Fixed local dev opening in German: `resolveFallback` in `src/i18n/request-locale.ts` now
  returns `"tr"` (was `"en"`) — platform default is Turkish.
- Fixed login/landing pages showing hard-coded Turkish copy for non-TR visitors:
  - `src/app/(auth)/login/page.tsx`: branding panel, features list, and testimonial are
    now market-aware (`isTurkey` → TR copy, else global copy).
  - `src/app/page.tsx`: "Türkiye MVP" badge, "81 il" stat, and TR-only feature card are
    gated behind `landingVariant === "turkey"`.
- Fixed booking calendar grid misalignment: `month_grid` now uses `table-fixed`; `weekday`
  and `day` cells use `flex-1` for equal 7-column distribution.

#### Design System Unification
- Replaced all hard-coded light-mode Tailwind utilities (`bg-gray-*`, `bg-white`,
  `text-gray-*`, `border-gray-*`, `text-blue-600`, `bg-blue-600`) with semantic tokens
  (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
  `text-primary`, `bg-primary`, `text-primary-foreground`) across:
  - `src/app/booking/[slug]/layout.tsx`
  - `src/app/booking/[slug]/page.tsx` (stepper, slot buttons, submit, summary, chatbot)
  - `src/app/marketplace/page.tsx`
  - `src/app/marketplace/[slug]/page.tsx`

#### New Features
- Geo locale detection core (`src/lib/geo/`):
  - `detect-country.ts` — server-side country header extraction
  - `detect-locale.ts` — server component locale resolver
  - `market-context.ts` — `getMarketConfigFromHeaders`
  - `use-market-context.ts` — `useMarketContext()` client hook
- Market config registry (`src/config/locale-market.ts`):
  - `MARKET_DEFAULTS` with 14 country entries (TR, DE, AT, CH, IT, US, GB, FR, ES, NL, RU, SA, AE, IR)
  - `getMarketConfig(countryCode)` with null/unknown fallback
  - `LandingVariant` type: `"turkey"` | `"global"`
- Middleware: writes `randevo_country` (1yr) and `randevo_locale_source` cookies.
  When `randevo_locale_source=manual`, IP geolocation is skipped — user's manual choice is permanent.
- LanguageSwitcher: sets `randevo_locale_source=manual` on manual locale switch.

#### Docs
- Added `docs/geoui-bug-audit.md` (9 bugs with file:line references)
- Added `docs/geo-locale-strategy.md` (priority chain, market variants, cookie table, file map)

#### Test Coverage
- Created `src/tests/geo-locale.test.ts`: 47 unit tests
  - `resolveRequestLocale` (9 tests), source priority chain (9), Arabic/multi-region codes (6),
    `getCountryCodeFromHeaders` extended (4 + 3 existing), `APP_ENABLE_GEO_LOCALE` env flag (2),
    `getMarketConfig` (9)
- Updated `src/tests/marketplace.test.ts`: TR market assertions (5 new tests)
- Updated `src/tests/request-locale.test.ts`: expect `tr` fallback

## [1.6.1-calendar-ui-fix] - 2026-05-15

### CALUI-0 to CALUI-6
- Added UI/calendar/i18n audit report:
  - `docs/ui-calendar-i18n-bug-report.md`
- Replaced fixed booking date cards with reusable `react-day-picker` calendar:
  - month navigation + selected date state
  - past-date disable + unavailable-day visual handling
- Normalized booking slots API date parsing:
  - first-class `date=YYYY-MM-DD` support
  - compatibility-safe ISO parsing retained
- Connected selected booking date to backend slot fetch flow with standardized loading/empty/error states.
- Preserved booking integrity:
  - no change to server-side conflict recheck path in `createBooking`
  - no client-side fake slot availability
- Refactored dashboard/admin/staff theme surfaces to tokenized design classes and removed theme-breaking hard-coded gray/white utilities on target pages.
- Documented i18n UI-vs-business-content strategy:
  - UI labels remain dictionary-driven
  - business-entered service content remains unchanged
- Added accessibility QA and focus/contrast improvements:
  - visible focus rings on calendar/day controls and booking actions
  - aria-live/status semantics on updated booking states
- Added/updated regression coverage:
  - `src/tests/booking-date-picker.test.ts`
  - `src/tests/booking-slots-route.test.ts`
  - `src/tests/dashboard-theme-class-audit.test.ts`
  - `src/tests/booking-services-content-preservation.test.ts`
  - `src/tests/booking-accessibility-theme-audit.test.ts`
  - `tests/e2e/calui-regression.spec.ts`
- Updated phase docs:
  - `docs/i18n-content-strategy.md`
  - `docs/ui-accessibility-qa.md`
  - `docs/COMPACT_STATE.md`
## [1.6.2-global-marketplace-localization] - 2026-05-14

### GLF-0 to GLF-6
- Added global localization audit report:
  - `docs/global-localization-bug-report.md`
- Added canonical country helpers:
  - `src/config/countries.ts`
  - `src/lib/address/location-options.ts`
- Refactored marketplace UI filters to be country-aware:
  - TR keeps province dropdown (`TURKEY_PROVINCES`)
  - non-TR uses locality search/manual fallback path
  - country change clears stale `province`/`locality` state
- Updated marketplace API contract and filtering:
  - `GET /api/marketplace` now supports `country` (primary) and `countryCode` (alias)
  - province filtering applies only for `TR`
  - non-TR uses normalized address locality matching and ignores province
- Updated landing copy behavior:
  - Turkey-only messaging remains in `tr`
  - non-TR locale packs now use global copy
  - hardcoded support metric value moved to locale key (`landing.statSupportValue`)
- Hardened provider fallback integration:
  - runtime fallback for `autocomplete`/`retrieve` when primary provider fails
  - manual fallback remains usable when provider env is missing/disabled
- Added regression tests:
  - `src/tests/location-options.test.ts`
  - `src/tests/marketplace-filters.test.ts`
  - `src/tests/marketplace.test.ts` updates for TR/non-TR behavior
  - `src/tests/landing-localization.test.ts`
  - `src/tests/address-provider.test.ts` fallback coverage
  - `src/tests/address-search.service.test.ts` non-TR fallback coverage
  - `tests/e2e/marketplace-localization.spec.ts`

## [1.6.1-prod12-13-14-closeout] - 2026-05-14

### PROD-12 Completion
- Added owner dashboard onboarding checklist API:
  - GET /api/dashboard/onboarding-checklist
  - stable response with items, completedCount, totalCount, progressPercent.
- Added dashboard onboarding checklist card integration.
- Added superadmin product event read API:
  - GET /api/admin/product-events?eventName=&organizationId=&limit=&cursor=
  - superadmin guard, cursor pagination, x-request-id response header.
- Added basic admin product events list page:
  - /admin/product-events.

### Demo Seed Hardening
- Added deterministic demo workspace constants and safety checks in prisma/demo-workspace.ts.
- Updated seed flow to assert payment-safe bootstrap (paymentCountDelta=0) and log smoke summary.
- Replaced hardcoded demo credential literals with env-driven resolution:
  - DEMO_OWNER_PASSWORD
  - DEMO_SUPERADMIN_PASSWORD.

### Test Coverage
- Added tests:
  - src/tests/onboarding-checklist.service.test.ts
  - src/tests/dashboard-onboarding-checklist-route.test.ts
  - src/tests/admin-product-events-route.test.ts
  - src/tests/demo-workspace-safety.test.ts

### Final Validation (PROD-13/14)
- Passed:
  - npm run check:node
  - npm run check:secrets
  - npm run validate:skills
  - npm run lint
  - npm test
  - npm run build
  - node ./node_modules/prisma/build/index.js validate
  - node ./node_modules/prisma/build/index.js generate
  - npm run test:e2e
  - cd mobile && npm run typecheck

## [1.6.0-mobile-legal-release-wave1] - 2026-05-13

### Mobile Maturity (PROD-10)
- Added Mobile JWT Bridge API endpoints for login, refresh, and logout.
- Added refresh token rotation/revoke persistence (`MobileRefreshToken`).
- Added React Navigation stack-based mobile flow with role-aware owner/staff behavior.
- Added offline read-cache fallback and day/week mobile calendar view.
- Added mobile push foundations (`/api/mobile/push/register`, `/api/mobile/push/dev-trigger`).

### Legal/KVKK Completion (PROD-11)
- Added legal pages: `/legal/privacy`, `/legal/kvkk`, `/legal/terms`, `/legal/cookies`.
- Added GDPR export ingestion endpoint: `POST /api/gdpr/export-request`.
- Added superadmin GDPR visibility endpoint: `GET /api/admin/gdpr/requests`.

## [1.5.2-sprint3-ops-hardening] - 2026-05-13

### Background Jobs + Observability
- Added reminder retry/backoff behavior (5/15/60 mins, max retry 3) with permanent failure separation.
- Expanded reminder process stats with `retried`, `permanentFailed`, and `skipped`.
- Extended `GET /api/admin/health` with trend windows (`last24h`, `last7d`).
- Added `GET /api/admin/failures` with source filter and cursor pagination.
- Standardized structured logging fields (`requestId`, `route`, `outcome`) across critical ops routes.

## [1.5.1-production-readiness-sprint2] - 2026-05-13

### Sprint-2 Stabilization
- Applied rate-limiting to critical auth/chat/webhook/internal processing paths.
- Finalized payment status normalization compatibility layer.
- Hardened reminder process internal contract (`x-worker-key` + `x-idempotency-key`).
- Expanded E2E smoke coverage for critical guard and payment flows.

## [1.5.0-global-address-locale] - 2026-05-13

### COMPAT-0
- Added stable phase gate script: `npm run phase:gate`.
- Added official `typecheck` script.
- Updated npm scripts to use `node ./node_modules/...` binaries, preventing command resolution failures on Windows paths containing `&`.
- Removed runtime dependency on Google font fetch in root layout; switched to stable local/system font variables.

### LOC-0 / LOC-1
- Added request locale resolver contract:
  - `resolveRequestLocale(context) -> { locale, source }`
- Added geo-locale inputs:
  - edge country headers (`x-vercel-ip-country`, `cf-ipcountry`, etc.)
  - `Accept-Language` fallback
- Locale precedence now enforced:
  - route > cookie > user > country > accept-language > fallback (`en`)
- Middleware now emits telemetry headers:
  - `x-app-locale-source`
  - `x-app-country-code`
- Added locale resolver tests:
  - `src/tests/request-locale.test.ts`

### ADDR-0 / ADDR-1 / ADDR-2
- Added global address strategy docs:
  - `docs/global-address-strategy.md`
  - `docs/global-address-provider-setup.md`
- Added address provider abstraction:
  - `AddressProvider` interface
  - `ManualAddressProvider`
  - `GoogleAddressProvider` integration
  - Mapbox/Apple/OSM skeleton providers
  - provider factory + normalizer
- Added API surface:
  - `GET /api/address/autocomplete`
  - `POST /api/address/retrieve`
- Added provider-level logging and rate limiting safeguards.
- Added Prisma global address models:
  - `NormalizedAddress`
  - `CountryConfig`
  - `AddressProviderLog`
- Added migration:
  - `prisma/migrations/20260513180000_add_global_address_models`
- Seed now includes Tier-1 `CountryConfig` rows.

### ADDR-3 / ADDR-4 / ADDR-5 / ADDR-6
- Added country-aware booking address form (TR + global variants).
- Added reusable `AddressAutocomplete` component with debounce and manual fallback behavior.
- Booking create flow now accepts and persists global address fields.
- Marketplace API now supports global filters:
  - `countryCode`
  - `locality`
- Added global location route:
  - `/marketplace/location/[country]/[city]`
- Added tests:
  - `src/tests/address-provider.test.ts`
  - `src/tests/address-search.service.test.ts`
  - `src/tests/country-address-config.test.ts`

## [1.4.0-expanded-language-packs] ? 2026-05-13

### LANG-4 ? Russian + Dutch Packs
- Added and finalized `ru` and `nl` message packs for web i18n.
- Added locale smoke coverage:
  - `src/tests/i18n-language-pack-smoke.test.ts`
  - `src/tests/locale-formatting.test.ts` includes `ru`/`nl` date formatting checks.

### LANG-5 ? Mobile + Notifications + Final QA
- Expanded mobile locale coverage to 10 locales in `mobile/src/i18n/config.ts`:
  - `tr,en,de,ar,es,fr,it,fa,ru,nl`
- Added notification templates for new locales (`es/fr/it/fa/ru/nl`) across reminder, confirmation, and marketing categories.
- Refactored `src/lib/notification-templates.ts` to use locale-specific builders for all 10 locales.
- Expanded Playwright i18n E2E flow with multi-locale switch, RTL check (fa), and persistence checks.
- Updated compact state and README language support documentation.

## [1.3.9-global-i18n-phase-8] � 2026-05-12

### Phase I18N-8 � SEO + QA + Release
- Added locale SEO helpers: `src/lib/seo/i18n.ts`.
- Added locale-aware sitemap route: `src/app/sitemap.ts`.
- Added robots route with sitemap reference: `src/app/robots.ts`.
- Added canonical + hreflang alternates in `src/app/layout.tsx` metadata.
- Installed Playwright E2E stack and added config:
  - `@playwright/test`
  - `playwright.config.ts`
- Added E2E flow tests:
  - `tests/e2e/i18n-flow.spec.ts`
  - locale switch path preservation
  - Arabic RTL smoke
  - dashboard auth locale redirect check
- Added language extension documentation:
  - `docs/adding-new-language.md`
- Updated final compact state in `docs/COMPACT_STATE.md`.
## [1.3.8-global-i18n-phase-7] � 2026-05-12

### Phase I18N-7 � Notification I18N
- Added locale preference fields to Prisma models:
  - `User.preferredLocale`
  - `Organization.defaultLocale` (default: `tr`)
  - `Customer.preferredLocale`
- Added migration: `prisma/migrations/20260512164000_add_i18n_locale_columns/migration.sql`.
- Added locale-specific notification templates for `en/de/ar`:
  - reminder, confirmation, marketing templates under `src/services/notifications/templates/{en,de,ar}/`
- Refactored `src/lib/notification-templates.ts` to locale-aware resolver contract:
  - fallback order: `customer > organization > user > tr`
- Updated `src/services/reminder.service.ts` to render reminder emails through locale-aware template resolver.
- Added tests: `src/tests/notification-i18n.test.ts`.
## [1.3.7-global-i18n-phase-6] � 2026-05-12

### Phase I18N-6 � RTL + Accessibility
- Strengthened locale metadata for direction and labels in `src/i18n/locales.ts`.
- Upgraded `src/components/i18n/LanguageSwitcher.tsx` accessibility:
  - `aria-label`, `aria-controls`, `listbox/option` semantics
  - keyboard navigation (`ArrowUp/Down`, `Home`, `End`, `Enter`, `Space`, `Escape`)
  - focus management for option list
- Passed active locale from middleware to app render via request header `x-app-locale` in `src/middleware.ts`.
- Updated `src/app/layout.tsx` to resolve locale from middleware header first, then cookie fallback.
- Added RTL smoke tests in `src/tests/i18n-rtl.test.ts`.
## [1.3.6-global-i18n-phase-5] � 2026-05-12

### Phase I18N-5 � Mobile Language Support
- Added mobile i18n infrastructure:
  - `mobile/src/i18n/config.ts`
  - `mobile/src/i18n/index.tsx`
- Wrapped mobile app with provider in `mobile/App.tsx`.
- Added persistent language selection (`AsyncStorage`) and locale detection (`expo-localization`).
- Added API locale propagation via `Accept-Language` in `mobile/src/api/client.ts`.
- Localized mobile screens:
  - `mobile/src/screens/LoginScreen.tsx`
  - `mobile/src/screens/DashboardScreen.tsx`
  - `mobile/src/screens/AppointmentsScreen.tsx`
  - `mobile/src/screens/AppointmentDetailScreen.tsx`
- Updated Expo-compatible dependencies:
  - `expo-localization` -> `~17.0.8`
  - `@react-native-async-storage/async-storage` -> `2.2.0`
## [1.3.5-global-i18n-phase-4] � 2026-05-12

### Phase I18N-4 � Locale Formatting Helpers
- Added locale-aware formatting module: `src/lib/locale/format.ts`
  - `formatCurrency`, `formatNumber`, `formatDate`, `formatTime`, `formatDateTime`
  - Locale normalization via shared i18n locale config
- Added tests: `src/tests/locale-formatting.test.ts`
  - currency, date, number, timezone-safe formatting checks
- Preserved Turkish-first behavior while enabling locale-aware rendering primitives for upcoming phases
## [1.3.4-global-i18n-phase-3] � 2026-05-12

### Phase I18N-3 � Translation Migration (Core Surface)
- Expanded locale dictionaries (`tr/en/de/ar`) with aligned keys for:
  - `dashboardHeader`
  - `landing`
  - `bookingLayout`
- Migrated core UI strings to translation keys in:
  - `src/components/Header.tsx`
  - `src/app/page.tsx` (navigation + hero CTA)
  - `src/app/booking/[slug]/layout.tsx`
- Added translation parity checker:
  - `scripts/check-translations.ts`
  - `package.json` script: `check:translations`
- Added phase gate for missing translation keys via parity script
## [1.3.3-global-i18n-phase-2] � 2026-05-12

### Phase I18N-2 � Web Dil + Bayrak Se�ici
- Added `src/components/i18n/LanguageSwitcher.tsx`
- Added locale path helper functions in `src/i18n/pathing.ts` for path-preserving locale switch
- Integrated language switcher into:
  - `src/components/Header.tsx` (dashboard topbar)
  - `src/app/page.tsx` (public landing nav)
  - `src/app/booking/[slug]/layout.tsx` (public booking header)
- Updated route helper tests (`src/tests/i18n-routing.test.ts`) with locale replacement scenarios
- Updated `docs/COMPACT_STATE.md` after completing I18N-0 + I18N-1 compact protocol
## [1.3.2-global-i18n-phase-1] � 2026-05-12

### Phase I18N-1 � Web Locale Routing ve Message Yap�s�
- Added `next-intl` dependency and plugin wiring in `next.config.ts`
- Added i18n configuration files:
  - `src/i18n/locales.ts`
  - `src/i18n/routing.ts`
  - `src/i18n/navigation.ts`
  - `src/i18n/request.ts`
  - `src/i18n/pathing.ts`
- Added bootstrap message dictionaries:
  - `src/messages/tr.json`
  - `src/messages/en.json`
  - `src/messages/de.json`
  - `src/messages/ar.json`
- Updated root layout to load locale messages and provide `NextIntlClientProvider`
- Extended middleware with locale prefix handling:
  - redirects non-prefixed routes to `/{locale}/...`
  - rewrites prefixed routes to current route tree
  - keeps auth protection behavior locale-aware
- Added routing helper tests: `src/tests/i18n-routing.test.ts`
## [1.3.1-global-i18n-phase-0] � 2026-05-12

### Phase I18N-0 � Baseline, Audit ve Mimari Karar
- Added i18n-focused agent set under `.claude/agents/`:
  - `i18n-architecture-agent.md`
  - `web-language-switcher-agent.md`
  - `mobile-language-switcher-agent.md`
  - `translation-migration-agent.md`
  - `locale-formatting-agent.md`
  - `rtl-accessibility-agent.md`
  - `notification-i18n-agent.md`
  - `seo-i18n-agent.md`
  - `i18n-qa-agent.md`
- Added architecture baseline doc: `docs/i18n-architecture.md`
- Added hardcoded UI text audit: `docs/i18n-string-audit.md`
- Locked phase gates for this repo path constraint (`&`) via direct CLI commands instead of `npm run` wrappers.
## [1.3.0-whatsapp-auto-reply] — 2026-05-09

### Phase WA-0 — Baseline, Policy Docs, Feature Branch
- 6 new agent files: `whatsapp-auto-link-agent`, `whatsapp-webhook-agent`, `whatsapp-policy-agent`, `whatsapp-dashboard-agent`, `whatsapp-provider-agent`, `whatsapp-qa-agent`
- `docs/whatsapp-auto-reply-policy.md`: 24-hour cooldown rule, opt-out keywords, KVKK notes
- `.env.example`: `WHATSAPP_TEXT_PROVIDER`, `META_WHATSAPP_APP_SECRET`, `TWILIO_*`, `NEXT_PUBLIC_BOOKING_BASE_URL`

### Phase WA-1 — DB Models + Provider Text Abstraction
- `prisma/schema.prisma`: 4 new models — `WhatsAppAutoReplySettings`, `WhatsAppInboundMessage`, `WhatsAppAutoReplyLog`, `WhatsAppContactPreference`
- Provider abstraction: `WhatsAppTextProvider` interface, Fake/Meta/Twilio implementations, factory with singleton + reset
- `prisma/seed.ts`: `WhatsAppAutoReplySettings` demo seed
- `src/tests/setup.ts`: 4 new model mocks
- `src/tests/whatsapp-text-provider.test.ts`: 10 tests

### Phase WA-2 — Webhook Receiver + Inbound Message Logging
- `src/services/whatsapp-webhook.service.ts`: `parseMetaInboundPayload`, `storeInboundMessage` (P2002 dedup), `processInboundWebhook` (fire-and-forget)
- `src/app/api/webhooks/whatsapp/route.ts`: POST handler extended to process inbound messages; always returns 200
- `src/tests/whatsapp-webhook.test.ts`: 14 tests

### Phase WA-3 — Auto Booking Link Reply Service
- `src/services/booking-link.service.ts`: `getBookingUrl()` with `NEXT_PUBLIC_BOOKING_BASE_URL` support
- `src/services/whatsapp-auto-reply.service.ts`: `processAutoReply()` with cooldown, opt-out, keyword, and provider abstraction
- Pure functions: `buildReplyText`, `isOptOutMessage`, `matchesKeywords`, `checkCooldown`
- `src/tests/whatsapp-auto-reply.test.ts`: 25 tests; `src/tests/booking-link.test.ts`: 4 tests

### Phase WA-4 — Dashboard UI + API Routes
- `src/app/api/whatsapp/auto-reply/settings/route.ts`: GET/PATCH with Zod validation and audit log
- `src/app/api/whatsapp/auto-reply/logs/route.ts`: GET paginated logs
- `src/app/api/whatsapp/auto-reply/preview/route.ts`: POST preview without DB write
- `src/app/api/dev/fake-whatsapp/inbound/route.ts`: dev-only inbound message simulator
- `src/app/dashboard/whatsapp/page.tsx`: Turkish dashboard with toggle, mode, cooldown, keywords, template, preview, logs table
- `src/components/dashboard/sidebar.tsx`: WhatsApp nav item added
- `src/lib/validators.ts`: `whatsAppAutoReplySettingsSchema` added

### Phase WA-5 — Final QA + Docs
- `docs/whatsapp-auto-link.md`: full usage guide (setup, fake testing, Meta setup, cooldown/opt-out)
- README.md updated with WhatsApp auto booking link reply feature
- All 280 tests pass; build clean; Prisma validate clean

## [1.2.0-district-skills-mcp] — 2026-05-09

### Phase DS-0 — Baseline, Repo Scan ve Risk Raporu
- 10 new agent files added to `.claude/agents/`: turkey-district-auditor-agent, turkey-district-fixer-agent, randevo-skill-architect-agent, randevo-skill-builder-agent, mcp-research-agent, mcp-integration-agent, mcp-security-agent, regression-merge-agent, compact-state-agent, github-push-agent
- `docs/repo-scan-report.md`: anthropics/skills and modelcontextprotocol/servers analysis
- `docs/qa/ds-0-baseline.md`: 188-test baseline QA report

### Phase DS-1 — Türkiye İlçe Data Audit
- `scripts/audit-turkey-districts.ts`: audit script for 81 provinces + all districts
- `docs/turkiye-district-audit.md`: audit findings (7 provinces had data, 74 missing)
- `package.json`: `audit:districts` script added

### Phase DS-2 — Eksik İlçeleri Tamamlama
- `src/data/turkey-provinces.ts`: complete district data for all 81 Turkish provinces (~970+ districts)
- Previously only 7 provinces had district data; now 81/81 complete
- `src/tests/turkey-districts.test.ts`: 15 new tests (province count, district completeness, slug validation)
- Audit result: PASS — all 81 provinces have districts, no duplicate slugs within provinces

### Phase DS-3 — İl/İlçe UI Validation
- Booking form province/district dropdowns already use `getDistrictsByProvince()` — now fully functional for all 81 provinces with no code changes required

### Phase DS-4 — Skills Mimari Planı
- `docs/randevo-skills-architecture.md`: 5-skill catalog with triggers, workflows, and eval strategy

### Phase DS-5 — Randevo Skills Implementasyonu
- `.claude/skills/randevo-booking-regression/SKILL.md`
- `.claude/skills/randevo-turkey-data/SKILL.md`
- `.claude/skills/randevo-mcp-integration/SKILL.md`
- `.claude/skills/randevo-payment-safety/SKILL.md`
- `.claude/skills/randevo-release-manager/SKILL.md`
- `evals/skills/`: 5 JSON eval prompt files
- `scripts/validate-skills.js`: skill validation script
- `package.json`: `validate:skills` script added

### Phase DS-6 — MCP Servers Araştırma ve Güvenlik Tasarımı
- `docs/mcp-research-report.md`: 6 safe + 6 risky MCP server classifications
- `docs/mcp-security-checklist.md`: pre-commit security checklist for MCP integrations

### Phase DS-7 — Güvenli MCP Local Dev Entegrasyonu
- `.mcp.json.example`: safe local-dev MCP config (filesystem/git/time/fetch/memory/sequential-thinking)
- `docs/mcp-local-setup.md`: setup guide for Mac/Linux/Windows
- `scripts/check-no-secrets.js`: secret scanner (skips test files, checks for Stripe/GitHub/AWS keys)
- `package.json`: `check:secrets` script added
- `.gitignore`: `.mcp.json` added (example file committed; real config never should be)

### Phase DS-8 — Güvenlik Testleri
- `src/tests/security.test.ts`: 24 new security tests covering:
  - bookingSchema: rejects invalid email, malformed datetime, missing KVKK consent, short name
  - loginSchema: rejects SQL injection attempt in email, invalid email format, empty password
  - registerSchema: rejects short password, invalid email, short name
  - serviceSchema: rejects empty name, negative price, zero duration
  - OWASP posture: Prisma ORM SQL injection prevention, KVKK consent bypass prevention
- All 227 tests passing (188 original + 15 district tests + 24 security tests)
- Secret scan: PASS

---

## [1.1.0-turkiye] — 2026-05-09

### Phase TR-0 — Türkiye Baseline
- 13 localization agent files added under `.claude/agents/`
- `docs/turkiye-product-strategy.md`: Turkish market strategy, pricing, and requirements

### Phase TR-1 — Türkçe UI ve i18n
- All dashboard, auth, booking, and marketplace pages translated to Turkish
- `src/i18n/tr.ts` flat dictionary for UI strings
- `src/lib/formatters.ts`: `formatCurrencyTRY`, `formatDateTR`, `formatTimeTR`, `formatDateTimeTR`, `formatDurationTR`
- TRY pricing in billing page (₺0/₺40/₺249), all dates use `tr-TR` locale

### Phase TR-2 — İl/İlçe, Adres ve Telefon
- `src/data/turkey-provinces.ts`: 81 provinces + districts for 7 major cities
- `src/lib/phone.ts`: `normalizeTRPhone`, `displayTRPhone` with +90 format validation
- Prisma: `province`, `district`, `postalCode` added to Organization, Location, Customer
- Booking form: province/district cascaded dropdowns (optional)

### Phase TR-3 — TRY Fiyatlandırma ve Abonelik Paketleri
- `src/config/pricing.tr.ts`: FREE ₺0, STARTER ₺40, PRO ₺249, ENTERPRISE özel fiyat
- `billing.ts` updated to read limits from TURKEY_PLANS (PRO: 2000 appts/month)

### Phase TR-4 — Yerel Ödeme Sağlayıcıları
- Payment provider interface with ManualBankTransfer, iyzico, PayTR, Param, Stripe
- Default: MANUAL_BANK_TRANSFER (generates EFT instructions)
- POST /api/payment/manual route

### Phase TR-5 — KVKK Açık Rıza
- `ConsentLog` and `DataDeletionRequest` Prisma models
- Booking schema: `privacyNoticeAcknowledged` required, marketing/notification consent optional
- Booking form: 3 KVKK checkboxes; submit disabled until privacy accepted
- POST /api/gdpr/deletion-request public endpoint

### Phase TR-6 — Türkçe Bildirim Şablonları
- Turkish SMS/email templates: appointment-reminder, appointment-confirmation, marketing
- Marketing gate: `getMarketingTemplate` returns null when consent missing (IYS)

### Phase TR-7 — Türkiye Marketplace
- 12 Turkish service categories (`src/data/turkey-categories.ts`)
- Marketplace: category dropdown + province dropdown (81 il)
- Province-specific pages: `/marketplace/[province]` with Turkish SEO metadata

### Phase TR-8 — e-Arşiv/e-Fatura Export Hazırlığı
- `InvoiceProfile` model: invoiceType, taxOffice, taxNumber, identityNumber, address fields
- GET/POST/PATCH /api/invoice-profile
- Revenue export: invoice profile columns in CSV, JSON format option

### Phase TR-9 — Resmi Tatiller ve Final QA
- `src/data/turkey-holidays.ts`: 2025-2027 Turkey public holidays (statik liste)
- `BusinessClosedDay` model with unique constraint per org+date
- `generateAvailableSlots` checks holidays and closed days → returns `[]`
- GET/POST/DELETE /api/business-closed-days
- 188 tests passing, clean build, secret scan clean
- Tagged v1.1.0-turkiye

---

## [1.0.0-post-mvp] — 2026-05-08

### Phase 33 — Final Hardening
- Added `CHANGELOG.md`
- Updated `docs/deployment.md` with provider setup guides (SMS, WhatsApp, Calendar, AI)
- Updated `README.md` with all post-MVP features, updated test count (95 tests), and revised tech stack
- `.nvmrc` and `package.json#engines` enforce Node.js `>=20 <27`

### Phase 32 — Node.js Version Integration
- Added `.nvmrc` pinning Node.js 20
- Added `engines` field to `package.json` (`node >=20 <27`, `npm >=10`)
- Added `scripts/check-node.js` with colored warning output
- Added `check:node` script to `package.json`

### Phase 31 — Accounting Integration
- Added `RevenueLedger` model to Prisma schema with `organizationId`, `appointmentId`, `paymentId`, `type`, `amountCents`, `currency`, `recordedAt`
- `GET /api/revenue` — filtered ledger entries with aggregate total
- `GET /api/revenue/export` — CSV download with `Content-Disposition` header
- Stripe webhook `checkout.session.completed` now creates a `RevenueLedger` entry inside the payment transaction (idempotent)
- 3 tests: payment creates ledger, duplicate webhook skipped, tenant isolation

### Phase 30 — AI Booking Assistant
- Added `Organization.aiChatbotEnabled` and `Organization.faqText` fields
- `POST /api/booking/[slug]/chat` — per-business AI chatbot using Anthropic `claude-haiku-4-5-20251001`
- In-memory rate limiter: 30 req/min per slug
- Graceful fallback to mock response when `AI_PROVIDER=DISABLED` or API key missing
- System prompt includes org info, FAQ text, and strict guardrails (no customer data, no booking without confirmation)
- 3 tests: disabled org → 404, AI disabled → mock reply, missing message → 400

### Phase 29 — React Native Mobile App
- Added `mobile/` directory with Expo blank-typescript template
- Login, Dashboard, Appointments, and Appointment Detail screens
- State-based navigation (no external router library)
- All data fetched from existing API routes — no duplicated backend logic

### Phase 28 — Public Marketplace
- Added `Organization.marketplaceEnabled`, `category`, `city`, `coverImageUrl` fields
- `GET /api/marketplace` — public listing with category/city/text search filters
- `src/app/marketplace/page.tsx` — client-side filtered business grid
- `src/app/marketplace/[slug]/page.tsx` — public business profile with booking CTA
- 5 tests: filtering, empty results, always guards `marketplaceEnabled`/`suspended`

### Phase 27 — Google Calendar Sync
- Added `Appointment.calendarEventId` field and `CalendarConnection` model
- Provider abstraction: `CalendarProvider` interface, `FakeCalendarProvider`, `GoogleCalendarProvider`
- `GET /api/calendar/connect` — generates OAuth URL
- `GET /api/calendar/callback` — exchanges code for tokens, saves connection
- `DELETE /api/calendar/disconnect` — deactivates connection
- Calendar event created on appointment confirmation (errors isolated, don't break booking)
- 10 tests: fake provider, factory singleton, appointment survives calendar failure

### Phase 26 — WhatsApp Integration
- Added `Organization.whatsappEnabled`, `Customer.whatsappOptIn`, `Reminder.channel` fields
- Provider abstraction: `WhatsAppProvider` interface, `FakeWhatsAppProvider`, `MetaWhatsAppProvider`
- `POST /api/webhooks/whatsapp` — Meta webhook verify + incoming message handler
- Opt-in guard prevents messages when `customer.whatsappOptIn=false`
- 9 tests: fake provider, factory singleton, opt-in guard, webhook verify

---

## [0.1.0] — MVP

### Phase 25 — Superadmin Panel
- Superadmin-only routes (`/api/superadmin/*`) with `platformRole: SUPERADMIN` guard
- User listing, organization suspension toggle, audit log view

### Phase 24 — Staff Portal
- Staff-specific routes and pages (`/staff/*`)
- Staff invite flow with expiring tokens

### Phase 23 — Deposit Payments (Stripe)
- `Service.depositRequired` + `depositAmountCents`
- Stripe Checkout session for deposit flow
- `Payment` model with idempotency via `stripeEventId`

### Phase 22 — Multi-Location Support
- `Location` model with default location support
- `Appointment.locationId` optional FK

### Phase 21 — SMS Reminders (Twilio)
- Provider abstraction: `SmsProvider` interface, `FakeSmsProvider`, `TwilioSmsProvider`
- Reminder worker dispatches SMS when `SMS_PROVIDER=TWILIO`

### Phases 1–20 — Core MVP
- Multi-tenant booking engine with slot generation and conflict prevention
- Public booking page (`/booking/[slug]`) with multi-step form
- Dashboard: appointments, services, staff, availability, analytics, billing
- Stripe subscription billing (FREE/STARTER/PRO) with webhook handling
- Email reminders (fake log + Resend)
- Audit logging
- NextAuth v5 credentials auth with JWT sessions











