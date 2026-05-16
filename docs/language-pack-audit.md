# Language Pack Audit (LANG-0)

Date: 2026-05-13
Branch: `phase/i18n-8`
Source locale baseline: `en`

## Current baseline

- Web locales in `src/i18n/locales.ts`: `tr`, `en`, `de`, `ar`
- Web message files in `src/messages`: `tr.json`, `en.json`, `de.json`, `ar.json`
- Existing flattened key count per locale: `434`
- Mobile locales in `mobile/src/i18n/config.ts`: `tr`, `en`, `de`, `ar`
- Notification template locales: `tr`, `en`, `de`, `ar`

## Audit updates in this phase

- Translation parity checker source locale changed from `tr` to `en`.
- Checker now validates:
  - message key parity against `en.json`
  - `src/i18n/locales.ts` locale list and `src/messages/*.json` file parity
  - JSON parse validity (implicit parse fail on invalid files)
- Script aliases available:
  - `npm run check:translations`
  - `npm run i18n:check`

## Notes

- The repository path includes `&`, which can break some `npm run` wrappers in this environment.
- For stable execution, direct binary commands are preferred during phase gates.
