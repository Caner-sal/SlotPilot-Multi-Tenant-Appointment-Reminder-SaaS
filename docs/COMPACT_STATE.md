# Randevo Compact State

_Last updated: 2026-05-12_

## Current Branch
- `phase/i18n-5`

## I18N Progress Snapshot
- Completed and pushed branches:
  - `phase/i18n-0`
  - `phase/i18n-1`
  - `phase/i18n-2`
  - `phase/i18n-3`
  - `phase/i18n-4`
- In progress:
  - `phase/i18n-5`

## I18N-4 + I18N-5 Compact Summary
- I18N-4:
  - Added locale formatting helpers in `src/lib/locale/format.ts`.
  - Added tests in `src/tests/locale-formatting.test.ts`.
- I18N-5:
  - Added mobile i18n provider and locale config under `mobile/src/i18n/`.
  - Added locale persistence (`AsyncStorage`) and device locale detection (`expo-localization`).
  - Added `Accept-Language` header handling in `mobile/src/api/client.ts`.
  - Localized mobile login/dashboard/appointments/detail screens.

## Gate Status (I18N-5)
- Mobile typecheck: PASS
- Root typecheck/lint/test/build: PASS
- Prisma validate/generate/migrate status: PASS
- Security scan (`scripts/check-no-secrets.js`): PASS
- Local merge test (`origin/main`): PASS (`Already up to date`)
