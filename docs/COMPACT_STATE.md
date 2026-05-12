# Randevo Compact State

_Last updated: 2026-05-12_

## Current Branch
- `phase/i18n-6`

## I18N Progress Snapshot
- Completed and pushed branches:
  - `phase/i18n-0`
  - `phase/i18n-1`
  - `phase/i18n-2`
  - `phase/i18n-3`
  - `phase/i18n-4`
  - `phase/i18n-5`
- In progress:
  - `phase/i18n-6`

## I18N-6 Compact Summary
- Locale metadata normalized for `tr/en/de/ar` with explicit `direction`.
- `LanguageSwitcher` received keyboard and screen-reader accessibility upgrades.
- Middleware now forwards resolved locale via `x-app-locale` request header.
- Root layout resolves locale from middleware header first for correct initial `lang/dir` rendering.
- Added RTL smoke tests in `src/tests/i18n-rtl.test.ts`.

## Gate Status (I18N-6)
- Typecheck/lint/tests/build: PASS
- Prisma validate/generate/migrate status: PASS
- Security scan (`scripts/check-no-secrets.js`): PASS
- Local merge test (`origin/main`): PASS (`Already up to date`)
