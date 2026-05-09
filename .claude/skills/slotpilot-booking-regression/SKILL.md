# randevo-booking-regression

## name
randevo-booking-regression

## description
Run booking engine regression tests after any change to slot generation, availability rules, conflict detection, or appointment creation. Ensures core booking logic is intact.

## When to use
- After editing booking engine or slot generation logic
- After editing availability API routes
- After changes to appointment creation logic
- After any Prisma schema change affecting the Appointment model

## Workflow
1. Run: node "node_modules/vitest/vitest.mjs" run src/tests/booking-engine.test.ts
2. Run: node "node_modules/vitest/vitest.mjs" run src/tests/tenant-security.test.ts
3. Run: node "node_modules/vitest/vitest.mjs" run src/tests/plan-limits.test.ts
4. Run: node "node_modules/next/dist/bin/next" build
5. Report: pass count, fail count, build status.

## Expected Output
- All 3 test files PASS
- Build completes with 0 errors
- Summary: "Booking regression: PASS"

## Forbidden Actions
- Do not modify test mocks to make tests pass artificially
- Do not skip failing tests
- Do not comment out assertions
