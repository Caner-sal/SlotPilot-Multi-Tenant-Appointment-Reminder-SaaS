# SlotPilot — Billing Flow

## Overview

SlotPilot uses Stripe in test mode for subscription billing. The billing system is architecturally complete but uses test/placeholder keys in the MVP.

## Plan Structure

| Plan | Stripe Price ID env var | Limits |
|------|-------------------------|--------|
| FREE | (no Stripe) | 1 staff, 20 appts/mo |
| STARTER | STRIPE_STARTER_PRICE_ID | 3 staff, 300 appts/mo |
| PRO | STRIPE_PRO_PRICE_ID | Unlimited |

## Checkout Flow

1. User clicks "Upgrade" on `/dashboard/billing`
2. Frontend calls `POST /api/billing/checkout` with `{ plan: "STARTER" }`
3. If Stripe not configured → returns `{ mode: "test", message: "Demo mode" }`
4. If Stripe configured → creates Stripe Checkout Session → returns `{ url: checkoutUrl }`
5. User redirected to Stripe Checkout
6. On success → Stripe sends webhook → subscription updated in DB

## Webhook Flow

```
Stripe → POST /api/webhooks/stripe
  → Verify signature with STRIPE_WEBHOOK_SECRET
  → Handle customer.subscription.updated
      → Find org by stripeCustomerId
      → Update plan based on price ID
      → Update status and period end
  → Handle customer.subscription.deleted
      → Downgrade to FREE plan
```

## Plan Limit Enforcement

Every staff creation and appointment creation calls:
- `canCreateStaff(organizationId)` — checks current staff count vs plan limit
- `canCreateAppointment(organizationId)` — checks monthly appointment count vs plan limit

These functions query the Subscription table for current plan, then check actual counts.

## Setting Up Stripe (Production)

1. Create products in Stripe Dashboard (test mode)
2. Get price IDs for Starter and Pro
3. Set env vars: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
4. Set STRIPE_STARTER_PRICE_ID and STRIPE_PRO_PRICE_ID
5. Add webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
6. Events to subscribe: `customer.subscription.updated`, `customer.subscription.deleted`
