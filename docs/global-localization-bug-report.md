# Global Localization Bug Report (GLF-0)

Date: 2026-05-14
Branch: `feature/global-address-locale`
Plan source read: `RANDEVO_GLOBAL_LOCALIZATION_BUGFIX_PLAN (1).md`

## Scope
This report documents the current Turkey hard-code regression in marketplace and landing surfaces, without changing product behavior.

## Required Repo Search Results (src only)

### `TURKEY_PROVINCES`
- `src/app/marketplace/page.tsx`
- `src/app/booking/[slug]/page.tsx` (Turkey booking flow; expected to remain for TR)
- `src/data/turkey-provinces.ts`

### `TURKEY_CATEGORIES`
- `src/app/marketplace/page.tsx`
- `src/data/turkey-categories.ts`

### `Tüm İller`
- `src/app/marketplace/[slug]/page.tsx`
- `src/messages/tr.json`

### `Türkiye MVP`
- `src/messages/tr.json`

### `81 Türkiye`
- No direct `src` hit with this exact string.

### `Turkey`
- `src/messages/en.json` contains Turkey-only landing copy (`heroBadge`, `statSupport`, `f3Title`).
- Additional Turkey-specific data/config files exist by design (holidays/pricing/etc.), not all are localization bugs.

### `Türkiye Desteği`
- `src/messages/tr.json`

## Hard-coded Runtime Issues Confirmed

1. Marketplace filter is Turkey-hardcoded:
- `src/app/marketplace/page.tsx`
- Direct imports and render of `TURKEY_PROVINCES` and `TURKEY_CATEGORIES` are not gated by selected country.
- Country dropdown exists, but province dropdown always shows Turkey provinces.

2. Marketplace province slug page is Turkey-specific:
- `src/app/marketplace/[slug]/page.tsx`
- Turkish province slug resolution (`getProvinceBySlug`) and Turkey-only copy are hardcoded.

3. Marketplace API is only partially country-aware:
- `src/app/api/marketplace/route.ts`
- Supports `countryCode` and `locality`, but still applies `province` filter generically and does not gate province logic to `TR`.

4. Landing page still exposes Turkey-only global copy in non-TR locales:
- `src/messages/en.json` (`heroBadge`, `statSupport`, `f3Title`)
- `src/messages/it.json` and other non-TR locales currently contain Turkey-oriented text.
- `src/app/page.tsx` includes hardcoded support stat number `81` in the hero stats array.

## Baseline Command Matrix (GLF-0)

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | PASS | After precondition fixes |
| `npm run lint` | PASS | No lint errors |
| `npm test` | PASS | Required elevated run due sandbox spawn restrictions |
| `npm run build` | PASS | Required elevated run due sandbox spawn restrictions |
| `npx prisma validate` | FAIL | Windows path with `&` in workspace causes CLI module resolution failure |
| `npx prisma generate` | FAIL | Same path/CLI issue as above |
| `node ./node_modules/prisma/build/index.js validate` | PASS | Required elevated run for engine download |
| `node ./node_modules/prisma/build/index.js generate` | FAIL | Windows `EPERM` file-lock on `query_engine-windows.dll.node` rename |
| `node ./node_modules/prisma/build/index.js generate --no-engine` | PASS | Safe fallback used to complete generation step under lock condition |

## Prisma Windows Path Caveat
Because this workspace path includes `&`, direct `npx prisma ...` is unreliable in this shell context. Use:
- `node ./node_modules/prisma/build/index.js validate`
- `node ./node_modules/prisma/build/index.js generate`

If `generate` hits a Windows engine file lock (`EPERM` on `query_engine-windows.dll.node` rename), `generate --no-engine` is a practical fallback until lock source is removed.

## Phase GLF-0 Status
- Reproduction/audit evidence captured.
- Turkey-hardcoded marketplace and landing paths identified.
- No marketplace/landing behavior was changed in GLF-0.
