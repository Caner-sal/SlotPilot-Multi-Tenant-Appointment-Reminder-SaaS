# Changelog

All notable changes to SlotPilot are documented here.

## [1.2.0-district-skills-mcp] — 2026-05-09

### Phase DS-0 — Baseline, Repo Scan ve Risk Raporu
- 10 new agent files added to `.claude/agents/`: turkey-district-auditor-agent, turkey-district-fixer-agent, slotpilot-skill-architect-agent, slotpilot-skill-builder-agent, mcp-research-agent, mcp-integration-agent, mcp-security-agent, regression-merge-agent, compact-state-agent, github-push-agent
- `docs/repo-scan-report.md`: anthropics/skills and modelcontextprotocol/servers analysis
- `docs/qa/ds-0-baseline.md`: 188-test baseline QA report

### Phase DS-1 — Türkiye İlçe Data Audit
- `scripts/audit-turkey-districts.ts`: audit script for 81 provinces + all districts
- `docs/turkiye-district-audit.md`: audit findings (7 provinces had data, 74 missing)
- `package.json`: `audit:districts` script added

### Phase DS-2 — Eksik İlçeleri Tamamlama
- `src/data/turkey-provinces.ts`: complete district data for all 81 Turkish provinces (~970+ districts)
- Previously only 7 provinces had district data; now 81/81 complete
- `src/tests/turkey-districts.test.ts`: 15 new tests (province count, district completeness, slug validation)
- Audit result: PASS — all 81 provinces have districts, no duplicate slugs within provinces

### Phase DS-3 — İl/İlçe UI Validation
- Booking form province/district dropdowns already use `getDistrictsByProvince()` — now fully functional for all 81 provinces with no code changes required

### Phase DS-4 — Skills Mimari Planı
- `docs/slotpilot-skills-architecture.md`: 5-skill catalog with triggers, workflows, and eval strategy

### Phase DS-5 — SlotPilot Skills Implementasyonu
- `.claude/skills/slotpilot-booking-regression/SKILL.md`
- `.claude/skills/slotpilot-turkey-data/SKILL.md`
- `.claude/skills/slotpilot-mcp-integration/SKILL.md`
- `.claude/skills/slotpilot-payment-safety/SKILL.md`
- `.claude/skills/slotpilot-release-manager/SKILL.md`
- `evals/skills/`: 5 JSON eval prompt files
- `scripts/validate-skills.js`: skill validation script
- `package.json`: `validate:skills` script added

### Phase DS-6 — MCP Servers Araştırma ve Güvenlik Tasarımı
- `docs/mcp-research-report.md`: 6 safe + 6 risky MCP server classifications
- `docs/mcp-security-checklist.md`: pre-commit security checklist for MCP integrations

### Phase DS-7 — Güvenli MCP Local Dev Entegrasyonu
- `.mcp.json.example`: safe local-dev MCP config (filesystem/git/time/fetch/memory/sequential-thinking)
- `docs/mcp-local-setup.md`: setup guide for Mac/Linux/Windows
- `scripts/check-no-secrets.js`: secret scanner (skips test files, checks for Stripe/GitHub/AWS keys)
- `package.json`: `check:secrets` script added
- `.gitignore`: `.mcp.json` added (example file committed; real config never should be)

### Phase DS-8 — Güvenlik Testleri
- `src/tests/security.test.ts`: 24 new security tests covering:
  - bookingSchema: rejects invalid email, malformed datetime, missing KVKK consent, short name
  - loginSchema: rejects SQL injection attempt in email, invalid email format, empty password
  - registerSchema: rejects short password, invalid email, short name
  - serviceSchema: rejects empty name, negative price, zero duration
  - OWASP posture: Prisma ORM SQL injection prevention, KVKK consent bypass prevention
- All 227 tests passing (188 original + 15 district tests + 24 security tests)
- Secret scan: PASS

---

## [1.1.0-turkiye] — 2026-05-09

### Phase TR-0 — Türkiye Baseline
- 13 localization agent files added under `.claude/agents/`
- `docs/turkiye-product-strategy.md`: Turkish market strategy, pricing, and requirements

### Phase TR-1 — Türkçe UI ve i18n
- All dashboard, auth, booking, and marketplace pages translated to Turkish
- `src/i18n/tr.ts` flat dictionary for UI strings
- `src/lib/formatters.ts`: `formatCurrencyTRY`, `formatDateTR`, `formatTimeTR`, `formatDateTimeTR`, `formatDurationTR`
- TRY pricing in billing page (₺0/₺40/₺249), all dates use `tr-TR` locale

### Phase TR-2 — İl/İlçe, Adres ve Telefon
- `src/data/turkey-provinces.ts`: 81 provinces + districts for 7 major cities
- `src/lib/phone.ts`: `normalizeTRPhone`, `displayTRPhone` with +90 format validation
- Prisma: `province`, `district`, `postalCode` added to Organization, Location, Customer
- Booking form: province/district cascaded dropdowns (optional)

### Phase TR-3 — TRY Fiyatlandırma ve Abonelik Paketleri
- `src/config/pricing.tr.ts`: FREE ₺0, STARTER ₺40, PRO ₺249, ENTERPRISE özel fiyat
- `billing.ts` updated to read limits from TURKEY_PLANS (PRO: 2000 appts/month)

### Phase TR-4 — Yerel Ödeme Sağlayıcıları
- Payment provider interface with ManualBankTransfer, iyzico, PayTR, Param, Stripe
- Default: MANUAL_BANK_TRANSFER (generates EFT instructions)
- POST /api/payment/manual route

### Phase TR-5 — KVKK Açık Rıza
- `ConsentLog` and `DataDeletionRequest` Prisma models
- Booking schema: `privacyNoticeAcknowledged` required, marketing/notification consent optional
- Booking form: 3 KVKK checkboxes; submit disabled until privacy accepted
- POST /api/gdpr/deletion-request public endpoint

### Phase TR-6 — Türkçe Bildirim Şablonları
- Turkish SMS/email templates: appointment-reminder, appointment-confirmation, marketing
- Marketing gate: `getMarketingTemplate` returns null when consent missing (IYS)

### Phase TR-7 — Türkiye Marketplace
- 12 Turkish service categories (`src/data/turkey-categories.ts`)
- Marketplace: category dropdown + province dropdown (81 il)
- Province-specific pages: `/marketplace/[province]` with Turkish SEO metadata

### Phase TR-8 — e-Arşiv/e-Fatura Export Hazırlığı
- `InvoiceProfile` model: invoiceType, taxOffice, taxNumber, identityNumber, address fields
- GET/POST/PATCH /api/invoice-profile
- Revenue export: invoice profile columns in CSV, JSON format option

### Phase TR-9 — Resmi Tatiller ve Final QA
- `src/data/turkey-holidays.ts`: 2025-2027 Turkey public holidays (statik liste)
- `BusinessClosedDay` model with unique constraint per org+date
- `generateAvailableSlots` checks holidays and closed days → returns `[]`
- GET/POST/DELETE /api/business-closed-days
- 188 tests passing, clean build, secret scan clean
- Tagged v1.1.0-turkiye

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
