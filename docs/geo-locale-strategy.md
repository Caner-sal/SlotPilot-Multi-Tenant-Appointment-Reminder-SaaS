# Geo Locale Strategy

_Documented: 2026-05-15 — v1.6.2-geo-ui-fix_

## Overview

Randevo uses a 6-level locale priority chain to determine the correct UI language on every request.
The chain ensures that a user's explicit preference always wins while still providing a sensible
automatic default for first-time visitors.

## Priority Chain

```
Route segment  >  Cookie  >  User profile  >  IP Geolocation  >  Accept-Language  >  Fallback (tr)
```

### Level 1 — Route Segment (`source: "route"`)
Set when the URL contains a locale prefix, e.g. `/de/dashboard`.
Highest priority; overrides everything including explicit cookie.

### Level 2 — Cookie (`source: "cookie"`)
`NEXT_LOCALE` cookie, set by `next-intl` locale routing and by the `LanguageSwitcher` component.
When the user manually selects a language, `randevo_locale_source=manual` is also written so that
IP geolocation is permanently suppressed for this browser.

### Level 3 — User Profile (`source: "user"`)
`userPreferredLocale` from the database session. Authenticated users who have set a language in
their profile always see that language regardless of where they connect from.

### Level 4 — IP Geolocation (`source: "country"`)
Country code extracted from request headers in order of preference:
1. `x-vercel-ip-country` (Vercel edge)
2. `cf-ipcountry` (Cloudflare)
3. `x-country-code` (generic proxy)
4. `x-geo-country` (fallback)

Middleware writes the resolved country code to `randevo_country` cookie (1 year TTL) and records
the resolution source in `randevo_locale_source`.

**Skip condition**: `randevo_locale_source=manual` suppresses geo resolution. This ensures a
user who manually changes locale is never overridden by IP.

### Level 5 — Accept-Language (`source: "accept-language"`)
Browser `Accept-Language` header is parsed for the first known `AppLocale` match.
Multiple values with `q` quality scores are respected (higher q → checked first).

### Level 6 — Fallback (`source: "fallback"`)
Platform default is **Turkish (`tr`)** because Randevo is a Turkey-first product.
Override via env: `APP_GEO_FALLBACK_LOCALE=en`.
Geo resolution can be disabled entirely with `APP_ENABLE_GEO_LOCALE=false`.

## Market Variants

Each request is associated with a `MarketConfig` (see `src/config/locale-market.ts`).
The `landingVariant` field controls market-specific UI copy:

| Variant   | Condition              | Examples                                   |
|-----------|------------------------|--------------------------------------------|
| `"turkey"` | `countryCode === "TR"` | KVKK badge, "81 il" stat, Turkish testimonial, "Türkiye MVP" badge |
| `"global"` | All other countries    | Privacy-ready features, global testimonial |

Turkey-only copy is gated behind `isTurkey === true`. Non-TR visitors never see it.

## Cookies

| Cookie                  | Value             | TTL    | Purpose                                    |
|-------------------------|-------------------|--------|--------------------------------------------|
| `NEXT_LOCALE`           | locale code       | 1 year | Active locale for next-intl routing        |
| `randevo_country`       | ISO country code  | 1 year | Market context for client components       |
| `randevo_locale_source` | `manual` / source | 1 year | Suppress IP geo when user chose manually   |

## Locale ↔ Country Mapping

Full mapping in `src/i18n/request-locale.ts` (`countryLocaleMap`).
Highlights:

- `TR` → `tr`
- `DE`, `AT`, `CH`, `LI` → `de`
- `SA`, `AE`, `EG`, `IQ`, `MA` (Arabic countries set) → `ar`
- `FR`, `BE`, `MC` → `fr`
- Unknown country → `null` → falls through to Accept-Language then fallback

## Supported Locales

`tr`, `en`, `de`, `ar`, `es`, `fr`, `it`, `fa`, `ru`, `nl`

Full locale files at `src/messages/{locale}.json` (493 keys each).

## Local Development

In local dev there are no IP geo headers. The chain resolves:
1. No route prefix
2. No `NEXT_LOCALE` cookie (first run)
3. No user session
4. No geo headers → country = null
5. Accept-Language from browser (e.g. `de` if browser is German)
6. If Accept-Language doesn't match a known locale → fallback `tr`

Result: local dev always shows Turkish unless the browser Accept-Language matches a supported
locale or a `NEXT_LOCALE` cookie is present. To test a specific locale locally, set the cookie
manually or use the in-app `LanguageSwitcher`.

## Files

| File | Role |
|------|------|
| `src/middleware.ts` | Main resolution entry point, cookie writing |
| `src/i18n/request-locale.ts` | `resolveRequestLocale`, country→locale map, `getCountryCodeFromHeaders` |
| `src/i18n/locales.ts` | Supported locale list and type guard |
| `src/config/locale-market.ts` | `MARKET_DEFAULTS`, `getMarketConfig`, `LandingVariant` type |
| `src/lib/geo/detect-country.ts` | `getCountryFromRequestHeaders` (middleware-resolved header preferred) |
| `src/lib/geo/detect-locale.ts` | `detectLocaleFromHeaders` for Server Components |
| `src/lib/geo/market-context.ts` | `getMarketConfigFromHeaders` for Server Components |
| `src/lib/geo/use-market-context.ts` | `useMarketContext()` client hook (reads `randevo_country` cookie) |
