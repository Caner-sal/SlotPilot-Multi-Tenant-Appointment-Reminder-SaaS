# E2E Testing Guide

## Goal

Protect critical business flows at browser level before production release.

## Commands

```bash
npm run build
npm run test:e2e
```

## Covered Smoke Flows

- Locale switching and persistence
- Auth guard redirects (`/admin`, `/staff/dashboard`, `/dashboard`)
- Public booking page availability
- Registration and onboarding entry points
- Payment fake/sandbox smoke:
  - seed-compatible public booking creation
  - checkout session initialization (`/api/booking/[slug]/checkout-session`)

## Next E2E Additions

- Full owner onboarding with seeded account
- Service/staff/availability setup flow
- Deposit payment fake/sandbox flow
- Staff portal operational flow after login
