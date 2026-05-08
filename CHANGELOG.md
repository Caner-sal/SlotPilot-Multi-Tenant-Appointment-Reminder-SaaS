# Changelog

All notable changes to SlotPilot are documented here.

## [Unreleased] — v1.1.0-turkiye

### Phase TR-0 — Türkiye Baseline ve Araştırma Notları
- Added 13 Turkey localization agent files under `.claude/agents/`
- Added `docs/turkiye-product-strategy.md` with Turkish market strategy, pricing, and requirements

### Phase TR-1 — Türkçe UI ve i18n *(planned)*
### Phase TR-2 — İl/İlçe, Adres ve Telefon *(planned)*
### Phase TR-3 — TRY Fiyatlandırma *(planned)*
### Phase TR-4 — Yerel Ödeme Sağlayıcıları *(planned)*
### Phase TR-5 — KVKK Consent *(planned)*
### Phase TR-6 — Türkçe Bildirimler *(planned)*
### Phase TR-7 — Türkiye Marketplace *(planned)*
### Phase TR-8 — e-Fatura Export *(planned)*
### Phase TR-9 — Resmi Tatiller + Final QA *(planned)*

---

## [1.0.0-post-mvp] — 2026-05-08

### Phase 33 — Final Hardening
- Added `CHANGELOG.md`
- Updated `docs/deployment.md` with provider setup guides (SMS, WhatsApp, Calendar, AI)
- Updated `README.md` with all post-MVP features, updated test count (95 tests), and revised tech stack
- `.nvmrc` and `package.json#engines` enforce Node.js `>=20 <27`

### Phase 32 — Node.js Version Integration
- Added `.nvmrc` pinning Node.js 20
- Added `engines` field to `package.json` (`node >=20 <27`, `npm >=10`)
- Added `scripts/check-node.js` with colored warning output
- Added `check:node` script to `package.json`

### Phase 31 — Accounting Integration
- Added `RevenueLedger` model to Prisma schema with `organizationId`, `appointmentId`, `paymentId`, `type`, `amountCents`, `currency`, `recordedAt`
- `GET /api/revenue` — filtered ledger entries with aggregate total
- `GET /api/revenue/export` — CSV download with `Content-Disposition` header
- Stripe webhook `checkout.session.completed` now creates a `RevenueLedger` entry inside the payment transaction (idempotent)
- 3 tests: payment creates ledger, duplicate webhook skipped, tenant isolation

### Phase 30 — AI Booking Assistant
- Added `Organization.aiChatbotEnabled` and `Organization.faqText` fields
- `POST /api/booking/[slug]/chat` — per-business AI chatbot using Anthropic `claude-haiku-4-5-20251001`
- In-memory rate limiter: 30 req/min per slug
- Graceful fallback to mock response when `AI_PROVIDER=DISABLED` or API key missing
- System prompt includes org info, FAQ text, and strict guardrails (no customer data, no booking without confirmation)
- 3 tests: disabled org → 404, AI disabled → mock reply, missing message → 400

### Phase 29 — React Native Mobile App
- Added `mobile/` directory with Expo blank-typescript template
- Login, Dashboard, Appointments, and Appointment Detail screens
- State-based navigation (no external router library)
- All data fetched from existing API routes — no duplicated backend logic

### Phase 28 — Public Marketplace
- Added `Organization.marketplaceEnabled`, `category`, `city`, `coverImageUrl` fields
- `GET /api/marketplace` — public listing with category/city/text search filters
- `src/app/marketplace/page.tsx` — client-side filtered business grid
- `src/app/marketplace/[slug]/page.tsx` — public business profile with booking CTA
- 5 tests: filtering, empty results, always guards `marketplaceEnabled`/`suspended`

### Phase 27 — Google Calendar Sync
- Added `Appointment.calendarEventId` field and `CalendarConnection` model
- Provider abstraction: `CalendarProvider` interface, `FakeCalendarProvider`, `GoogleCalendarProvider`
- `GET /api/calendar/connect` — generates OAuth URL
- `GET /api/calendar/callback` — exchanges code for tokens, saves connection
- `DELETE /api/calendar/disconnect` — deactivates connection
- Calendar event created on appointment confirmation (errors isolated, don't break booking)
- 10 tests: fake provider, factory singleton, appointment survives calendar failure

### Phase 26 — WhatsApp Integration
- Added `Organization.whatsappEnabled`, `Customer.whatsappOptIn`, `Reminder.channel` fields
- Provider abstraction: `WhatsAppProvider` interface, `FakeWhatsAppProvider`, `MetaWhatsAppProvider`
- `POST /api/webhooks/whatsapp` — Meta webhook verify + incoming message handler
- Opt-in guard prevents messages when `customer.whatsappOptIn=false`
- 9 tests: fake provider, factory singleton, opt-in guard, webhook verify

---

## [0.1.0] — MVP

### Phase 25 — Superadmin Panel
- Superadmin-only routes (`/api/superadmin/*`) with `platformRole: SUPERADMIN` guard
- User listing, organization suspension toggle, audit log view

### Phase 24 — Staff Portal
- Staff-specific routes and pages (`/staff/*`)
- Staff invite flow with expiring tokens

### Phase 23 — Deposit Payments (Stripe)
- `Service.depositRequired` + `depositAmountCents`
- Stripe Checkout session for deposit flow
- `Payment` model with idempotency via `stripeEventId`

### Phase 22 — Multi-Location Support
- `Location` model with default location support
- `Appointment.locationId` optional FK

### Phase 21 — SMS Reminders (Twilio)
- Provider abstraction: `SmsProvider` interface, `FakeSmsProvider`, `TwilioSmsProvider`
- Reminder worker dispatches SMS when `SMS_PROVIDER=TWILIO`

### Phases 1–20 — Core MVP
- Multi-tenant booking engine with slot generation and conflict prevention
- Public booking page (`/booking/[slug]`) with multi-step form
- Dashboard: appointments, services, staff, availability, analytics, billing
- Stripe subscription billing (FREE/STARTER/PRO) with webhook handling
- Email reminders (fake log + Resend)
- Audit logging
- NextAuth v5 credentials auth with JWT sessions
