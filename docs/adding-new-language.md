# Adding A New Language

This guide explains how to add a new locale to SlotPilot/Randevo global i18n stack.

## 1. Register Locale Metadata

Update `src/i18n/locales.ts`:
- Add the locale code to `locales`.
- Add metadata in `localeMetadata`:
  - `label`
  - `nativeLabel`
  - `flag`
  - `direction` (`ltr` or `rtl`)
  - `currency`
  - `dateLocale`

## 2. Add Web Messages

Create a new message file:
- `src/messages/<locale>.json`

Start from an existing file (`en.json`) and keep key parity.

Run parity check:
- `node .\node_modules\tsx\dist\cli.mjs scripts/check-translations.ts`

## 3. Wire Web UI Strings

Migrate visible text to translation keys using `next-intl`:
- `useTranslations()` in client components
- `getTranslations()` in server components

## 4. Locale Routing Verification

Locale-prefixed routes must work:
- `/<locale>`
- `/<locale>/login`
- `/<locale>/booking/<slug>`

Path-preserving language switch must keep the current route when locale changes.

## 5. Mobile Locale Support

Update mobile dictionaries in:
- `mobile/src/i18n/config.ts`

No additional wiring is needed if provider is already active (`mobile/src/i18n/index.tsx`).

## 6. Notification Templates

Add locale templates under:
- `src/services/notifications/templates/<locale>/appointment-reminder.ts`
- `src/services/notifications/templates/<locale>/appointment-confirmation.ts`
- `src/services/notifications/templates/<locale>/marketing.ts`

Then register builders in:
- `src/lib/notification-templates.ts`

Fallback order remains:
- `customerPreferredLocale > organizationDefaultLocale > userPreferredLocale > tr`

## 7. SEO Coverage

No extra code is needed if locale is in `src/i18n/locales.ts`, because:
- `src/lib/seo/i18n.ts`
- `src/app/sitemap.ts`
- `src/app/layout.tsx` alternates

consume locale list automatically.

## 8. Quality + Security Gates

Run:
- `node .\node_modules\typescript\bin\tsc --noEmit`
- `npm run lint`
- `node .\node_modules\vitest\vitest.mjs run`
- `node .\node_modules\next\dist\bin\next build`
- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run prisma:migrate:status`
- `node scripts/check-no-secrets.js`

## 9. E2E Validation

Playwright scenario:
- locale switch
- booking locale path preservation
- dashboard auth redirect locale consistency

Run:
- `node .\node_modules\playwright\cli.js test`
