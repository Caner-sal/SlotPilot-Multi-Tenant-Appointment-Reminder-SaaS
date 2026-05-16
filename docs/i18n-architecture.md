# Global I18N Architecture (Baseline)

## Context
- Project: SlotPilot / Randevo (Next.js App Router + Prisma + mobile Expo client)
- Current default language: Turkish-first product copy across web and mobile
- Goal: Add scalable multi-locale architecture without breaking current Turkish flows

## Initial Locale Decisions
- Supported locales (wave 1): `tr`, `en`, `de`, `ar`
- Default locale: `tr`
- Direction:
  - `tr`: `ltr`
  - `en`: `ltr`
  - `de`: `ltr`
  - `ar`: `rtl`

## Web Architecture
- Library: `next-intl` with App Router locale-prefix strategy
- URL format:
  - `/{locale}/...`
  - examples: `/tr/dashboard`, `/en/booking/{slug}`, `/de/marketplace`
- Middleware responsibilities:
  - locale negotiation (cookie + path + fallback)
  - auth middleware compatibility check
  - protected route behavior unchanged
- Message loading:
  - `src/messages/{locale}.json` for phase-1 bootstrap
  - modular split possible in later phases (`common`, `booking`, `dashboard`, etc.)

## Mobile Architecture
- Library choice: `i18n-js` + `expo-localization`
- Persistence: AsyncStorage
- Transport: send `Accept-Language` on API requests
- Locale codes shared with web (`tr|en|de|ar`)

## Formatting & RTL
- Formatting source of truth: locale metadata (`currency`, `dateLocale`, `direction`)
- Rendering APIs: `Intl.DateTimeFormat`, `Intl.NumberFormat`
- Turkish default timezone behavior remains stable for existing appointment UX
- Arabic routes/screens require `rtl` smoke coverage

## Notifications & Fallback
- Templates localized per locale (email/SMS/WhatsApp)
- Fallback order:
  1. `Customer.preferredLocale`
  2. `Organization.defaultLocale`
  3. `User.preferredLocale`
  4. `tr` (system default)

## Data Model Additions (Planned)
- `User.preferredLocale: String @default("tr")`
- `Organization.defaultLocale: String @default("tr")`
- `Customer.preferredLocale: String @default("tr")`

All locale writes must validate against supported locale list.

## Quality, Merge, Security Gates
- Quality gates use direct node CLI commands (path contains `&`, `npm run` scripts break in this repo path).
- Merge policy per phase:
  - phase branch -> local merge test with `origin/main` -> re-run gates -> commit/push
- Secret safety gate:
  - `node scripts/check-no-secrets.js`
  - staged diff regex scan for live token/api-key patterns

## Non-Goals in Baseline Phase
- No large route migration in phase-0
- No business-logic rewrite
- No multi-currency billing behavior changes (formatting-only at i18n phase)
