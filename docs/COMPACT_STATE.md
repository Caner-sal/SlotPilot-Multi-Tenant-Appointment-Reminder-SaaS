# Randevo Compact State

_Last updated: 2026-05-17_

## 2026-05-17 BILLUI-6+7 — iyzico Checkout & Webhook Checkpoint

Branch: `feature/global-address-locale`

### Tamamlanan Phaseler

- **BILLUI-6:** `IyzicoProvider.createSubscriptionCheckout()` implement edildi. HMAC-SHA256 IYZWSv2 auth header. iyzico Subscription Checkout Form API entegrasyonu. `src/config/payment-provider-mapping.ts` (STARTER/PRO planları için iyzico referansları).
- **BILLUI-7:** `/api/webhooks/iyzico` oluşturuldu: HMAC-SHA256 imza doğrulama, `WebhookEvent` idempotency (payloadHash unique), amount/currency server-side doğrulama, SUCCESS → SubscriptionPaymentTransaction.PAID + Subscription.ACTIVE, FAILURE → FAILED. `/api/billing/confirm` (GET): OWNER/ADMIN guard, transactionStatus+subscriptionStatus döndürür, dev/test fake=1 ile auto-aktivasyon.

### Verification Snapshot (BILLUI-7 Final)

- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS (73 dosya, 518 test)
- `npm run check:secrets` PASS

### Kalan Phaseler

BILLUI-8 → BILLUI-9 (success/failure/history sayfaları, E2E testler, release)

---

## 2026-05-17 BILLUI-3+4+5 — Billing Data Model & Checkout API Checkpoint

Branch: `feature/global-address-locale`

### Tamamlanan Phaseler

- **BILLUI-3:** `SubscriptionPaymentTransaction` Prisma modeli eklendi (organizationId, provider, conversationId UNIQUE, planId, amountCents, currency, status, vb.). `src/config/billing-plans.ts` oluşturuldu (UPGRADABLE_PLANS, isUpgradablePlan, getCheckoutUrl).
- **BILLUI-4:** `/dashboard/billing/checkout?plan=STARTER|PRO` sayfası oluşturuldu. Plan özet kartı, güvenlik notu, "Ödemeye devam et" butonu. Staff kullanıcı redirected. Billing page'deki handleUpgrade artık checkout sayfasına yönlendiriyor. 16 yeni i18n anahtarı (10 locale).
- **BILLUI-5:** PaymentProvider interface `createSubscriptionCheckout?` method'u eklendi. FakePaymentProvider oluşturuldu (dev/test). Factory'ye FAKE provider eklendi. `/api/billing/checkout` route refactor: SubscriptionPaymentTransaction INITIATED kaydı oluşturuyor, amount/currency server-side plan config'den geliyor, STRIPE ve generic provider path desteği, production fail-fast.

### Verification Snapshot (BILLUI-5 Final)

- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS (73 dosya, 518 test)
- `npm run check:secrets` PASS
- `npm run prisma:validate` PASS
- `npm run prisma:dbpush` PASS

### Kalan Phaseler

BILLUI-6 → BILLUI-9 (iyzico checkout, webhook/aktivasyon, success/failure/history, E2E)

---

## 2026-05-17 BILLUI-0+1+2 — Billing UI Cleanup Checkpoint

Branch: `feature/global-address-locale`

### Tamamlanan Phaseler

- **BILLUI-0 (Audit):** `docs/billing-ui-audit.md` oluşturuldu. Native select, açık renkli kartlar, eksik checkout sayfaları belgelendi.
- **BILLUI-1 (UI Cleanup):** Analytics highlight kartları (`bg-blue-50/indigo-50` → `bg-*/500/10`), Billing plan badge renkleri (`bg-blue-100/purple-100` → `bg-*/500/15`), Billing alert mesajları (`bg-green-50/yellow-50/amber-50` → `bg-*/500/10`) dark token ile değiştirildi.
- **BILLUI-2 (Themed Select):** WhatsApp `/dashboard/whatsapp` sayfasındaki native `<select>` → Radix UI `Select` bileşenine taşındı. Beyaz dropdown bug'ı giderildi.

### Verification Snapshot (BILLUI-2 Final)

- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS (73 dosya, 518 test)

### Kalan Phaseler

BILLUI-3 → BILLUI-9 (Billing data model, checkout page, provider abstraction, iyzico, webhook, history, E2E)

---

## 2026-05-17 UCF-1+UCF-2 — Nationwide Turkey District Dataset Checkpoint

Branch: `feature/global-address-locale` | Tag: `v1.8.0`

### Tamamlanan İşler

- **UCF-1 (81-Province Audit):** `docs/turkey-district-data-audit.md` kapsamlı şekilde yeniden yazıldı. 13 ilde eksik/hatalı veri tespit edildi.
- **UCF-2 (Dataset Fix):** `src/data/turkey-provinces.ts` güncellemeleri (903 → 991 ilçe):
  - Ankara: +17 ilçe (Akyurt, Ayaş, Bala, Beypazarı, Çamlıdere, Çubuk, Elmadağ, Evren, Gölbaşı, Güdül, Haymana, Kahramankazan, Kalecik, Kızılcahamam, Nallıhan, Polatlı, Şereflikoçhisar)
  - İzmir: +21 ilçe (Aliağa, Balçova, Bayındır, Bayraklı, Bergama, Beydağ, Çeşme, Dikili, Foça, Güzelbahçe, Karaburun, Kemalpaşa, Kınık, Kiraz, Menderes, Narlıdere, Ödemiş, Seferihisar, Selçuk, Tire, Urla)
  - Bursa: +13 ilçe (Büyükorhan, Gemlik, Gürsu, Harmancık, İnegöl, İznik, Karacabey, Keles, Kestel, Mudanya, Mustafakemalpaşa, Orhaneli, Orhangazi, Yenişehir)
  - Antalya: +14 ilçe (Akseki, Alanya, Demre, Elmalı, Finike, Gazipaşa, Gündoğmuş, İbradı, Kaş, Kemer, Korkuteli, Kumluca, Manavgat, Serik)
  - Mersin: +9 ilçe (Anamur, Aydıncık, Bozyazı, Çamlıyayla, Erdemli, Gülnar, Mut, Silifke, Tarsus)
  - Konya: +4 ilçe (Ahırlı, Çeltik, Tuzlukçu, Yalıhüyük)
  - Çankırı +2, Manisa +2, Rize +1, Aksaray +1, Hakkari +1, Trabzon +1, Sakarya +1
  - Slug düzeltme: `hacibiktas` → `hacibektas` (Nevşehir), `akincolar` → `akincilar` (Sivas)
- **UCF-2 Yeni Script:** `scripts/validate-turkey-location-data.ts` — strict validation (exit 1 on fail)
- **UCF-2 Yeni npm Scripti:** `check:turkey-locations` → `package.json`
- **UCF-2 Yeni Döküman:** `docs/turkey-location-data-source.md` — kaynak, slug standardı, güncelleme prosedürü
- **UCF-2 Test Genişletme:** `src/tests/turkey-districts.test.ts` — 31 test; büyük il threshold + slug bug regression

### Verification Snapshot (UCF-2 Final)

- `npm run check:turkey-locations` PASS (0 FAIL, 26 WARN)
- `npm run typecheck` PASS
- `npm test` PASS (73 dosya, 518 test)
- `npm run build` PASS

---

## 2026-05-16 Production Audit PH-0 → PH-9 Checkpoint

Branch: `feature/global-address-locale` | Tag: `v1.6.4`

### Tamamlanan Phaseler

- **PH-0**: `docs/production-audit-2026-05-16.md` oluşturuldu (F-001..F-008 tablosu)
- **PH-1**: Middleware Edge-safe yapıldı — `auth()` wrapper kaldırıldı, `getEdgeSession()` eklendi (`src/lib/auth-edge.ts`)
- **PH-2**: Mobile JWT secret fail-fast — `"dev-mobile-secret-change-me"` fallback kaldırıldı; `src/lib/env/validate-env.ts`, `scripts/check-production-env.ts`
- **PH-3**: Active organization context — cookie-based org seçimi + membership doğrulama; `OrganizationSwitcher` UI; `GET /api/organizations`
- **PH-4**: E2E stability — `tests/e2e/helpers/` klasörü oluşturuldu; onboarding required field fix; `playwright.config.ts` CI retries eklendi
- **PH-5**: PII logger fix — `staff/invite/route.ts:70` console.log kaldırıldı; `audit.service.ts` logger.error kullanımı; `scripts/check-console-usage.ts`
- **PH-6**: Encoding fix — `billing/page.tsx:64,77` mojibake düzeltildi (`yapılandırılmamış`, `₺0/ay`); `scripts/check-encoding.ts`
- **PH-7**: Provider fail-fast — `calendar.factory.ts` + `whatsapp.factory.ts` production FAKE guard; `src/lib/providers/provider-health.ts`
- **PH-8**: Invite rate limit — `accept-invite/route.ts` POST+GET rate limiting (10/30 req per 15min per IP)
- **PH-9**: Auth guard helpers — `src/lib/auth/guards.ts`, `src/lib/tenant/require-membership.ts`, `docs/auth-tenant-helper-strategy.md`

### Yeni Scriptler

| Script | Dosya |
|--------|-------|
| `env:check` | `scripts/check-production-env.ts` |
| `check:logs` | `scripts/check-console-usage.ts` |
| `check:encoding` | `scripts/check-encoding.ts` |

### Verification Snapshot (PH-10 Final)

- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS (72 files, 488 tests)
- `npm run build` PASS
- `npm run env:check` PASS (WARN: MOBILE_JWT_SECRET önerilen)
- `npm run check:logs` PASS (0 FAIL, 66 WARN)
- `npm run check:encoding` PASS (test dosyaları skip edildi)
- `node ./node_modules/prisma/build/index.js validate` PASS
- `node ./node_modules/prisma/build/index.js generate` PASS

---

## 2026-05-16 UCF-4 → UCF-7 Checkpoint

Branch: `feature/global-address-locale` | Hedef tag: `v1.7.0`

- **UCF-4 (Forgot Password UI):**
  - `src/app/(auth)/forgot-password/page.tsx` — email form, generic success, rate limit error
  - `src/app/(auth)/reset-password/[token]/page.tsx` — yeni şifre + onay, redirect to /login
  - `src/app/(auth)/login/page.tsx` — `href="#"` → `Link href="/forgot-password"`
- **UCF-5 (UI Cleanup):**
  - `src/app/booking/[slug]/page.tsx` — `bg-red-50` → `bg-destructive/10`, `bg-green-100` → `bg-green-500/10`, `hover:border-blue-300` → `hover:border-primary/50`
  - `src/app/marketplace/location/[country]/[city]/page.tsx` — tüm gray/white/blue kalıntılar design token'larına taşındı
  - `src/app/dashboard/page.tsx` + `OnboardingChecklistCard.tsx` — inline `#111120` → `bg-card`
  - `docs/ui-remnant-cleanup-report.md` oluşturuldu
- **UCF-6 (Customer Discover MVP):**
  - `src/app/api/discover/search/route.ts` — public endpoint, TR province/district + non-TR locality filter
  - `src/app/discover/page.tsx` — arama formu (category, country, province/district, locality)
  - `src/components/discover/BusinessCard.tsx` — işletme kartı, Randevu Al CTA
- **UCF-7 (Customer Booking & Appointment Panel):**
  - `src/app/discover/business/[slug]/page.tsx` — işletme detay sayfası, booking CTA
  - `src/app/api/customer/appointments/route.ts` — email-scoped, 401 guard
  - `src/app/customer/appointments/page.tsx` — yaklaşan/geçmiş sekmeleri, durum badge

### Verification Snapshot (UCF-7)

- `npm run typecheck` PASS
- `npm test` PASS (73 dosya, 505 test)

---

## 2026-05-16 UCF-0 → UCF-3 Checkpoint

Branch: `feature/global-address-locale` | Hedef tag: `v1.7.0`

- **UCF-0 (Audit):** `docs/user-customer-fixes-audit.md` oluşturuldu — Kocaeli eksikleri, `href="#"` forgot-password linki, UI kalıntıları ve eksik customer sayfaları belgelendi.
- **UCF-1 (Kocaeli İlçeleri):** `src/data/turkey-provinces.ts` — Kocaeli için 8 eksik ilçe eklendi (Başiskele, Çayırova, Derince, Dilovası, Gölcük, Kandıra, Karamürsel, Kartepe). `src/tests/turkey-districts.test.ts`'e 3 yeni spot-check test eklendi.
- **UCF-2 (UI Binding):** Booking sayfasında TR/non-TR province-district gating doğrulandı (zaten doğru çalışıyordu). `getDistrictsByProvince("kocaeli")` için test eklendi.
- **UCF-3 (Forgot Password Backend):**
  - `prisma/schema.prisma` — `PasswordResetToken` modeli eklendi (hashlenmiş, süreli, tek kullanımlık)
  - `src/lib/email.ts` — `buildPasswordResetEmail()` eklendi
  - `src/app/api/auth/forgot-password/route.ts` — rate limit (5/15dk), account enumeration yok
  - `src/app/api/auth/reset-password/route.ts` — bcrypt, usedAt guard, $transaction
  - `src/tests/auth-reset.test.ts` — 12 test (tümü geçiyor)

### Verification Snapshot (UCF-3)

- `npm run typecheck` PASS
- `npm test` PASS (73 dosya, 505 test)

---

## 2026-05-15 DPD-4 → DPD-5 Checkpoint

Branch: `feature/global-address-locale`

- **DPD-4 (Turkey District Docs):**
  - `src/data/turkey-provinces.ts` — `TURKEY_DISTRICTS`'e JSDoc eklendi (81 il, 903 ilçe, 2026-05-15)
  - `docs/turkey-district-data-audit.md` oluşturuldu
- **DPD-5 (Booking + Settings Select Refactor):**
  - `src/app/booking/[slug]/page.tsx`:
    - Country native `<select>` → `CountrySelect` (line 673)
    - Province native `<select>` → `ProvinceSelect` (line 724)
    - District native `<select>` → `DistrictSelect` (line 744)
    - `TURKEY_PROVINCES`, `getDistrictsByProvince`, `COUNTRY_OPTIONS` importları kaldırıldı
  - `src/app/dashboard/settings/page.tsx`:
    - Country native `<select>` → `CountrySelect` (line 237)
    - `COUNTRY_OPTIONS` import kaldırıldı

Verification (DPD-5 sonrası):
- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS (72 files, 488 tests)

Next: DPD-6 (E2E regression), DPD-7 (CHANGELOG + release tag).

---

## 2026-05-15 DPD-0 → DPD-3 Checkpoint

Branch: `feature/global-address-locale`

- **DPD-0 (Audit):** `docs/dark-select-phone-district-bug-report.md` oluşturuldu. 71 test, 457 test geçiyor (baseline).
- **DPD-1 (Wrapper Components):**
  - `src/components/forms/CountrySelect.tsx` oluşturuldu (Radix UI Select, COUNTRY_OPTIONS)
  - `src/components/forms/ProvinceSelect.tsx` oluşturuldu (Radix UI Select, TURKEY_PROVINCES)
  - `src/components/forms/DistrictSelect.tsx` oluşturuldu (Radix UI Select, getDistrictsByProvince)
- **DPD-2 (Phone Code Data):**
  - `src/data/country-phone-codes.ts` oluşturuldu (180+ ülke ISO → E.164 mapping)
  - `src/lib/phone/country-calling-code.ts` oluşturuldu (`getCallingCodeForCountry` helper, fallback: "")
  - `src/config/country-address-config.ts` düzeltildi: `defaultConfig.phoneCountryCode: ""` (eski: "+90"), NL/GB/CA/AU eklendi
  - `src/tests/country-phone-codes.test.ts` oluşturuldu (24 test)
  - `src/tests/country-address-config.test.ts` genişletildi (6 yeni test)
- **DPD-3 (Phone Binding):**
  - `src/app/(auth)/onboarding/page.tsx` — hardcoded `+90 555 000 00 00` → `getCallingCodeForCountry(countryCode)`
  - Onboarding country native `<select>` → Radix `<Select>` (style prop pass-through)
  - Onboarding timezone native `<select>` → Radix `<Select>`

Verification (DPD-3 sonrası):
- `npm run typecheck` PASS
- `npm test` PASS (72 files, 488 tests)

Next: DPD-4 (Turkey district docs), DPD-5 (booking+settings select refactor), DPD-6 (E2E), DPD-7 (release).

---

## 2026-05-15 GEOUI-6 / GEOUI-7 / GEOUI-8 Checkpoint (Final)

- GEOUI-6 completed:
  - `src/app/booking/[slug]/page.tsx`: full design token replacement.
    Stepper (`bg-primary`, `ring-primary/20`, `bg-muted`), service/staff cards (`border-primary`,
    `group-hover:text-primary`), slot buttons (`hover:bg-primary/10`), submit buttons
    (`bg-primary hover:bg-primary/90 text-primary-foreground`), chatbot bubbles/header
    (`bg-primary`), typing dots (`bg-muted-foreground`).
    All `ring-blue-*` → `ring-ring`, `bg-blue-*` → `bg-primary`, `text-blue-*` → `text-primary`.

- GEOUI-7 completed:
  - `src/tests/geo-locale.test.ts` expanded to 47 unit tests:
    - source priority chain (9 tests: route > cookie > user > country > accept-language > fallback)
    - Arabic and multi-region country codes (SA, AE, EG, AT, CH, RU → correct locale)
    - `getCountryCodeFromHeaders` extended header precedence (x-country-code, x-geo-country, all-4-header priority)
    - `APP_ENABLE_GEO_LOCALE=false` disables geo, `APP_GEO_FALLBACK_LOCALE=en` overrides fallback
    - `getMarketConfig` extended: FR, ES, AT, CH entries
  - `src/tests/marketplace.test.ts`: 5 new TR market assertions:
    - TR query includes countryCode in org filter
    - Non-TR includes own countryCode (not TR)
    - Non-TR with province param — province NOT applied as filter
    - `q` param filters by name across all markets
    - TR result set includes `province` field
  - `src/config/locale-market.ts`: added AT (de, EUR, +43) and CH (de, CHF, +41) entries.

- GEOUI-8 completed:
  - Created `docs/geo-locale-strategy.md` (priority chain, market variants, cookie table, file map)
  - Updated `CHANGELOG.md` with full `[1.6.2-geo-ui-fix]` entry
  - Tagged `v1.6.2-geo-ui-fix`

- Verification snapshot (GEOUI-8 final):
  - `npm run lint` PASS
  - `npm test` PASS (71 files, 457 tests)
  - `npm run build` PASS
  - `npx prisma validate` FAIL in workspace path context (`&` parsing) — known Windows env issue

## 2026-05-15 GEOUI-0 / GEOUI-1 / GEOUI-2 Checkpoint

- GEOUI-0 completed:
  - Audited all geo locale, UI copy, and design system bugs.
  - Created: `docs/geoui-bug-audit.md` (9 bugs documented with file:line references).
  - No code changes.

- GEOUI-1 completed:
  - Fixed root cause of local dev German locale: `resolveFallback` now returns `"tr"` (was `"en"`).
    File: `src/i18n/request-locale.ts:142`
  - Created `src/config/locale-market.ts`: MARKET_DEFAULTS with `landingVariant` per country.
  - Created `src/lib/geo/detect-country.ts`: server-side country header helper.
  - Created `src/lib/geo/detect-locale.ts`: server component locale resolver.
  - Created `src/lib/geo/market-context.ts`: `getMarketConfig` / `getMarketConfigFromHeaders`.
  - Created `src/tests/geo-locale.test.ts`: 22 unit tests.
  - Updated `src/tests/request-locale.test.ts`: expect `tr` fallback.

- GEOUI-2 completed:
  - `src/middleware.ts`: adds `randevo_country` and `randevo_locale_source` cookies.
    When `randevo_locale_source=manual`, IP geolocation is skipped.
  - `src/components/i18n/LanguageSwitcher.tsx`: sets `randevo_locale_source=manual` on
    manual locale switch, preventing IP from overriding user's choice.

- Verification snapshot (GEOUI-2):
  - `npm run lint` PASS
  - `npm test` PASS (71 files, 428 tests)
  - `npx prisma validate` FAIL in this workspace path context (`&` parsing) — known issue



## 2026-05-15 GEOUI-4 / GEOUI-5 Checkpoint

- GEOUI-4 completed:
  - Replaced hard-coded light-mode Tailwind classes with semantic tokens.
  - `src/app/booking/[slug]/layout.tsx`: bg-background, bg-card, border-border, text-foreground, text-primary
  - `src/app/marketplace/page.tsx`: full token replacement + input/select dark theme
  - `src/app/marketplace/[slug]/page.tsx`: full token replacement

- GEOUI-5 completed:
  - `src/components/ui/calendar.tsx`: `month_grid` now `table-fixed`, `weekday` and `day` use `flex-1`
  - `src/components/booking/BookingDatePicker.tsx`: removed `w-[14.285%]` overrides, uses `flex-1` from base

- Verification snapshot (GEOUI-5):
  - `npm run lint` PASS
  - `npm test` PASS (71 files, 428 tests)

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

## 2026-05-15 CALUI-4 / CALUI-5 Checkpoint

- CALUI-4 completed:
  - Added strategy doc: `docs/i18n-content-strategy.md`
  - Clarified separation boundary:
    - UI strings are dictionary-driven
    - business-entered data is preserved as-is
  - Updated dashboard services UI labels/formatting on changed surfaces to avoid hard-coded locale assumptions.
  - Added regression test:
    - `src/tests/booking-services-content-preservation.test.ts`
- CALUI-5 completed:
  - Improved booking accessibility and contrast on updated surfaces:
    - Added `aria-live` loading/alert semantics
    - Added visible `focus-visible` ring styles on calendar navigation/day controls and booking slot actions
    - Replaced remaining low-contrast/theme-breaking utility classes in booking flow with tokenized classes
    - Added unavailable-day visual signaling on booking calendar
  - Added QA report:
    - `docs/ui-accessibility-qa.md`
  - Added audit regression test:
    - `src/tests/booking-accessibility-theme-audit.test.ts`
- Verification snapshot (CALUI-5):
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (69 files, 403 tests)
  - `npm run build` PASS
  - `npm run i18n:check` PASS
  - `npm run test:e2e` PASS (9 tests)
  - `npx prisma validate` FAIL in this workspace path context (`&` parsing)
  - `npx prisma generate` FAIL in this workspace path context (`&` parsing)
  - Equivalent Prisma CLI commands PASS:
    - `node .\\node_modules\\prisma\\build\\index.js validate`
    - `node .\\node_modules\\prisma\\build\\index.js generate`


## 2026-05-15 CALUI-6 Final Checkpoint

- Added Playwright CALUI regression suite:
  - `tests/e2e/calui-regression.spec.ts`
  - coverage includes:
    - booking month-navigation/date-selection slot-request contract checks
    - UI locale change vs stable business service-name rendering checks
    - dashboard services route theme smoke
- Added stable test selectors for booking flow:
  - `data-testid` markers on booking service/staff/date/slot controls.
- Updated release docs:
  - `CHANGELOG.md` (`1.6.1-calendar-ui-fix` entry)
  - `README.md` calendar UI update notes
- Final gate snapshot:
  - `npm run check:node` PASS
  - `npm run check:secrets` PASS
  - `npm run validate:skills` PASS
  - `npm run typecheck` PASS
  - `npm run lint` PASS
  - `npm test` PASS (69 files, 403 tests)
  - `npm run build` PASS
  - `npm run i18n:check` PASS
  - `npm run test:e2e` PASS (11 passed, 1 skipped due environment-dependent booking-day availability)
  - `npx prisma validate` FAIL in this workspace path context (`&` parsing)
  - `npx prisma generate` FAIL in this workspace path context (`&` parsing)
  - Equivalent Prisma CLI commands PASS:
    - `node .\\node_modules\\prisma\\build\\index.js validate`
    - `node .\\node_modules\\prisma\\build\\index.js generate`
