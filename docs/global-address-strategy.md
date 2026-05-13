# SlotPilot Global Address Strategy

## Current Turkey-Centric Baseline
- `Organization`, `Location`, `Customer` currently store flat address fields (`address`, `province`, `district`, `postalCode`).
- Public booking collects customer province/district from Turkey datasets (`src/data/turkey-provinces.ts`).
- Marketplace filters primarily by `province` and `city`.
- Reminder and notification systems consume formatted address strings from organization/location records.

## Globalization Direction
- Keep existing Turkey fields for backward compatibility.
- Introduce provider-backed global address flow:
  - Address autocomplete (provider abstraction).
  - Provider result normalization into a single cross-country model.
  - Country-specific form labels/validation surfaces.
- Persist normalized address snapshots in `NormalizedAddress` for `CUSTOMER`, `ORGANIZATION`, `LOCATION`, and future marketplace records.

## Data Model Decisions
- `NormalizedAddress` stores country/admin/locality/postal/lat-lng and provider metadata.
- `CountryConfig` stores rollout configuration (`defaultLocale`, `defaultCurrency`, `marketplaceEnabled`, phone code).
- `AddressProviderLog` stores query-level observability for provider cost/quality/error tracking.

## Provider Strategy
- Primary provider for first rollout: **Google Places**.
- Safe fallback provider: **ManualAddressProvider**.
- Skeleton adapters kept for Mapbox/Apple/OSM to avoid vendor lock-in in service contracts.

## Compatibility Guarantees
- Existing Turkey form behavior remains active when `countryCode=TR`.
- Existing DB columns (`province`, `district`) are still populated from new form admin levels.
- New normalized records are additive and do not remove legacy reads.

## Rollout Notes
- Tier-1 country defaults are seeded in `CountryConfig`.
- Locale auto-selection runs before route redirect and writes `NEXT_LOCALE` when needed.
- Build/test gate is standardized with `npm run phase:gate`.

