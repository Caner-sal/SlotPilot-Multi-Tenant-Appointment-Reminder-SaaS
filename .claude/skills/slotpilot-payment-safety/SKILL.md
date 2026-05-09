# slotpilot-payment-safety

## name
slotpilot-payment-safety

## description
Review payment integration for security issues after any Stripe, billing, or webhook changes.

## When to use
- After editing src/app/api/billing/ routes
- After editing src/app/api/webhooks/stripe/ routes
- After editing src/lib/billing.ts
- After any Stripe key or webhook configuration change

## Workflow
1. Run: node "node_modules/vitest/vitest.mjs" run src/tests/deposit-payment.test.ts
2. Run: node "node_modules/vitest/vitest.mjs" run src/tests/plan-limits.test.ts
3. Run: node "node_modules/vitest/vitest.mjs" run src/tests/accounting.test.ts
4. Run: node scripts/check-no-secrets.js
5. Check: no hardcoded Stripe keys in source code
6. Check: webhook handler uses stripe.constructEvent() for verification
7. Report: SAFE or list of issues

## Expected Output
- All 3 payment test files PASS
- check-no-secrets.js: PASS
- No hardcoded stripe_live_ keys in source

## Forbidden Actions
- Do not log raw Stripe webhook payloads
- Do not skip webhook signature verification
- Do not hardcode Stripe keys in source files
- Do not commit test mode keys to production config
