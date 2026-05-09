# randevo-turkey-data

## name
randevo-turkey-data

## description
Validate Turkey province and district data integrity after any change to turkey-provinces.ts or related localization files.

## When to use
- After editing src/data/turkey-provinces.ts
- After adding new provinces or districts
- After changing district slugs or display names
- After Turkey localization updates

## Workflow
1. Run: node "node_modules/tsx/dist/cli.mjs" scripts/audit-turkey-districts.ts
2. Run: node "node_modules/vitest/vitest.mjs" run src/tests/turkey-districts.test.ts
3. Run: node "node_modules/vitest/vitest.mjs" run src/tests/turkey-data.test.ts
4. Check: 81 provinces, all with districts, no duplicate slugs
5. Report: PASS or list of failures

## Expected Output
- audit-turkey-districts.ts: OVERALL STATUS: PASS
- turkey-districts.test.ts: 15/15 PASS
- turkey-data.test.ts: all PASS

## Forbidden Actions
- Do not add fake or placeholder districts
- Do not use Turkish characters in slugs
- Do not break existing province slugs used by organizations
