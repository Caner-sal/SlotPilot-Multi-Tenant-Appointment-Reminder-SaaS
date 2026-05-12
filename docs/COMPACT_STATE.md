# Randevo Compact State

_Last updated: 2026-05-12_

## Current Branch
- `phase/i18n-8`

## Global I18N Plan Status
- Completed and pushed:
  - `phase/i18n-0`
  - `phase/i18n-1`
  - `phase/i18n-2`
  - `phase/i18n-3`
  - `phase/i18n-4`
  - `phase/i18n-5`
  - `phase/i18n-6`
  - `phase/i18n-7`
- In progress:
  - `phase/i18n-8`

## I18N-8 Summary
- Added locale-aware SEO helpers in `src/lib/seo/i18n.ts`.
- Added localized sitemap: `src/app/sitemap.ts`.
- Added robots route: `src/app/robots.ts`.
- Added canonical/hreflang alternates in `src/app/layout.tsx`.
- Added Playwright setup:
  - `playwright.config.ts`
  - `tests/e2e/i18n-flow.spec.ts`
- Added new language onboarding doc: `docs/adding-new-language.md`.

## E2E Coverage
- Locale switch keeps route context (booking slug preserved)
- Arabic route applies `dir=rtl`
- Dashboard auth redirect preserves locale prefix

## Gate Status (I18N-8)
- Typecheck/lint/tests/build: PASS
- Prisma validate/generate/migrate status: PASS
- Security scan (`scripts/check-no-secrets.js`): PASS
- Playwright E2E: PASS
- Local merge test (`origin/main`): pending final phase close
