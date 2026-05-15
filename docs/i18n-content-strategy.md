# CALUI-4 i18n Content Strategy: UI Strings vs Business Data

Date: 2026-05-15

## Goal

Define a strict boundary between translatable product UI and business-entered content so multilingual behavior is predictable and intentional.

## Rules

1. UI strings are translated through locale dictionaries.
- Source of truth: `src/messages/*.json`
- Examples: labels, buttons, page titles, status captions, helper/error texts.

2. Business-entered content is preserved exactly as entered.
- Examples: service names, service descriptions, business names, custom notes/messages.
- No automatic runtime translation is applied to these values in booking, dashboard, admin, or staff views.

3. API payloads must return business data in stored form.
- Public booking/service APIs return the stored `service.name` and `service.description`.
- UI decides only surrounding translated labels; it does not mutate business fields.

## Current Implementation Policy (MVP)

- Supported now:
  - Translated UI labels per active locale.
  - Preserved business data in original language.
- Not implemented now:
  - Per-service multilingual content fields (e.g. `ServiceTranslation`).

## Fallback Behavior

- If a UI key is missing, this is a translation/config issue and should fail translation parity checks (`npm run i18n:check`).
- If business data language differs from UI language, this is expected and should be communicated as preserved business content.

## Future Work (Deferred)

- Optional multilingual service content model (future, not part of CALUI):
  - `ServiceTranslation`
    - `serviceId`
    - `locale`
    - `name`
    - `description`
- Fallback chain proposal:
  - requested locale translation -> default locale translation -> original service fields.

## Verification Checklist

- UI labels on booking/dashboard/services/staff surfaces come from translation dictionaries.
- Service/business values are displayed without auto-translation.
- `npm run i18n:check` passes key parity across locales.
