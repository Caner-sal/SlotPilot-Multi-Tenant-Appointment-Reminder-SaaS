# Global Address Provider Setup

## Environment Variables

```env
ADDRESS_PROVIDER=manual
ADDRESS_PROVIDER_FALLBACK=manual
GOOGLE_PLACES_API_KEY=
GOOGLE_MAPS_API_KEY=
ADDRESS_AUTOCOMPLETE_MIN_CHARS=3
ADDRESS_AUTOCOMPLETE_DEBOUNCE_MS=350
ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE=30
```

## Provider Selection
- `manual`: no external dependency, returns manual suggestion for entered text.
- `google`: calls Google Places Autocomplete + Place Details APIs.
- fallback is controlled by `ADDRESS_PROVIDER_FALLBACK`.

## Security Notes
- Keep `GOOGLE_PLACES_API_KEY` server-side only.
- `AddressAutocomplete` client component calls internal API routes, not Google directly.
- API routes enforce min-character guard and per-minute IP-based rate limit.

## Endpoints
- `GET /api/address/autocomplete?q=...&countryCode=...&locale=...`
- `POST /api/address/retrieve` with `{ placeId, locale, sessionToken }`

## Cost Guard
- Requests under min chars are dropped.
- Debounce is enabled client-side.
- API-level rate limiting prevents rapid abuse spikes.

