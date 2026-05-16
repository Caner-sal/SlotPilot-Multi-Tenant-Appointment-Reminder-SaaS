# NEXT ACTION PRIORITY LIST

Date: 2026-05-15
Basis: `docs/MASTER_IMPLEMENTATION_AUDIT.md`

## 1. Critical fixes first
1. Add missing `agent:check` script and gate in CI/local phase gate.
2. Add missing `mobile` `npm test` script and baseline mobile test suite.
3. Resolve command reliability policy for Prisma in this workspace (use npm prisma scripts in all docs/gates, avoid direct `npx prisma` in local Windows path).
4. Add explicit tests that staff accounts cannot access billing/admin routes or APIs.

## 2. High priority missing features
1. Complete iyzico end-to-end payment flow (or formally de-scope in roadmap/release docs).
2. Add robust reminder/background job retry + backoff + observability controls.
3. Harden WhatsApp inbound security (signature verification and stricter failure handling).
4. Add automated visual/a11y regression checks for calendar/dashboard/localized screens.

## 3. Medium priority improvements
1. Complete or feature-flag unimplemented address providers (Mapbox/Apple/OSM).
2. Add long-text overflow regression tests for NL/DE/AR across key screens.
3. Add richer admin operational dashboards/alerts for webhook/job failures.
4. Expand payment provider test matrix beyond Stripe.

## 4. Low priority nice-to-have items
1. Add mobile address picker if roadmap confirms requirement.
2. Improve design-system consistency (table/card tokens) across dashboard pages.
3. Add additional locale visual snapshots for marketing pages.
4. Create convenience scripts for repeatable audit command bundles.

## 5. Recommended phase order for next work session
1. PROD gate completion (`agent:check`, mobile test script, Prisma command reliability policy)
2. Security/auth hardening tests (staff-denied access, webhook hardening)
3. Job reliability (reminder queue/retry/visibility)
4. Payments expansion (iyzico decision + implementation)
5. UX quality (a11y + visual regression + localization overflow)

## 6. Exact prompt to continue with highest-priority fix
`Please implement only the production-gate gap: add a new npm script named agent:check, wire it into CI and phase gates, create minimal tests for the script behavior, and do not change product runtime behavior. Then run: npm run check:node, npm run check:secrets, npm run validate:skills, npm run agent:check, npm run lint, npm test, npm run build, npm run prisma:validate, npm run prisma:generate. Report exact pass/fail output.`
