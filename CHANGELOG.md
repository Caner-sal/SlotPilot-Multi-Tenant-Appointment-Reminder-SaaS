# Changelog

All notable changes to Randevo are documented here.

## [1.3.7-global-i18n-phase-6] — 2026-05-12

### Phase I18N-6 — RTL + Accessibility
- Strengthened locale metadata for direction and labels in `src/i18n/locales.ts`.
- Upgraded `src/components/i18n/LanguageSwitcher.tsx` accessibility:
  - `aria-label`, `aria-controls`, `listbox/option` semantics
  - keyboard navigation (`ArrowUp/Down`, `Home`, `End`, `Enter`, `Space`, `Escape`)
  - focus management for option list
- Passed active locale from middleware to app render via request header `x-app-locale` in `src/middleware.ts`.
- Updated `src/app/layout.tsx` to resolve locale from middleware header first, then cookie fallback.
- Added RTL smoke tests in `src/tests/i18n-rtl.test.ts`.
## [1.3.6-global-i18n-phase-5] — 2026-05-12

### Phase I18N-5 — Mobile Language Support
- Added mobile i18n infrastructure:
  - `mobile/src/i18n/config.ts`
  - `mobile/src/i18n/index.tsx`
- Wrapped mobile app with provider in `mobile/App.tsx`.
- Added persistent language selection (`AsyncStorage`) and locale detection (`expo-localization`).
- Added API locale propagation via `Accept-Language` in `mobile/src/api/client.ts`.
- Localized mobile screens:
  - `mobile/src/screens/LoginScreen.tsx`
  - `mobile/src/screens/DashboardScreen.tsx`
  - `mobile/src/screens/AppointmentsScreen.tsx`
  - `mobile/src/screens/AppointmentDetailScreen.tsx`
- Updated Expo-compatible dependencies:
  - `expo-localization` -> `~17.0.8`
  - `@react-native-async-storage/async-storage` -> `2.2.0`
## [1.3.5-global-i18n-phase-4] — 2026-05-12

### Phase I18N-4 — Locale Formatting Helpers
- Added locale-aware formatting module: `src/lib/locale/format.ts`
  - `formatCurrency`, `formatNumber`, `formatDate`, `formatTime`, `formatDateTime`
  - Locale normalization via shared i18n locale config
- Added tests: `src/tests/locale-formatting.test.ts`
  - currency, date, number, timezone-safe formatting checks
- Preserved Turkish-first behavior while enabling locale-aware rendering primitives for upcoming phases
## [1.3.4-global-i18n-phase-3] — 2026-05-12

### Phase I18N-3 — Translation Migration (Core Surface)
- Expanded locale dictionaries (`tr/en/de/ar`) with aligned keys for:
  - `dashboardHeader`
  - `landing`
  - `bookingLayout`
- Migrated core UI strings to translation keys in:
  - `src/components/Header.tsx`
  - `src/app/page.tsx` (navigation + hero CTA)
  - `src/app/booking/[slug]/layout.tsx`
- Added translation parity checker:
  - `scripts/check-translations.ts`
  - `package.json` script: `check:translations`
- Added phase gate for missing translation keys via parity script
## [1.3.3-global-i18n-phase-2] — 2026-05-12

### Phase I18N-2 — Web Dil + Bayrak Seçici
- Added `src/components/i18n/LanguageSwitcher.tsx`
- Added locale path helper functions in `src/i18n/pathing.ts` for path-preserving locale switch
- Integrated language switcher into:
  - `src/components/Header.tsx` (dashboard topbar)
  - `src/app/page.tsx` (public landing nav)
  - `src/app/booking/[slug]/layout.tsx` (public booking header)
- Updated route helper tests (`src/tests/i18n-routing.test.ts`) with locale replacement scenarios
- Updated `docs/COMPACT_STATE.md` after completing I18N-0 + I18N-1 compact protocol
## [1.3.2-global-i18n-phase-1] — 2026-05-12

### Phase I18N-1 — Web Locale Routing ve Message Yapısı
- Added `next-intl` dependency and plugin wiring in `next.config.ts`
- Added i18n configuration files:
  - `src/i18n/locales.ts`
  - `src/i18n/routing.ts`
  - `src/i18n/navigation.ts`
  - `src/i18n/request.ts`
  - `src/i18n/pathing.ts`
- Added bootstrap message dictionaries:
  - `src/messages/tr.json`
  - `src/messages/en.json`
  - `src/messages/de.json`
  - `src/messages/ar.json`
- Updated root layout to load locale messages and provide `NextIntlClientProvider`
- Extended middleware with locale prefix handling:
  - redirects non-prefixed routes to `/{locale}/...`
  - rewrites prefixed routes to current route tree
  - keeps auth protection behavior locale-aware
- Added routing helper tests: `src/tests/i18n-routing.test.ts`
## [1.3.1-global-i18n-phase-0] — 2026-05-12

### Phase I18N-0 — Baseline, Audit ve Mimari Karar
- Added i18n-focused agent set under `.claude/agents/`:
  - `i18n-architecture-agent.md`
  - `web-language-switcher-agent.md`
  - `mobile-language-switcher-agent.md`
  - `translation-migration-agent.md`
  - `locale-formatting-agent.md`
  - `rtl-accessibility-agent.md`
  - `notification-i18n-agent.md`
  - `seo-i18n-agent.md`
  - `i18n-qa-agent.md`
- Added architecture baseline doc: `docs/i18n-architecture.md`
- Added hardcoded UI text audit: `docs/i18n-string-audit.md`
- Locked phase gates for this repo path constraint (`&`) via direct CLI commands instead of `npm run` wrappers.
## [1.3.0-whatsapp-auto-reply] â€” 2026-05-09

### Phase WA-0 â€” Baseline, Policy Docs, Feature Branch
- 6 new agent files: `whatsapp-auto-link-agent`, `whatsapp-webhook-agent`, `whatsapp-policy-agent`, `whatsapp-dashboard-agent`, `whatsapp-provider-agent`, `whatsapp-qa-agent`
- `docs/whatsapp-auto-reply-policy.md`: 24-hour cooldown rule, opt-out keywords, KVKK notes
- `.env.example`: `WHATSAPP_TEXT_PROVIDER`, `META_WHATSAPP_APP_SECRET`, `TWILIO_*`, `NEXT_PUBLIC_BOOKING_BASE_URL`

### Phase WA-1 â€” DB Models + Provider Text Abstraction
- `prisma/schema.prisma`: 4 new models â€” `WhatsAppAutoReplySettings`, `WhatsAppInboundMessage`, `WhatsAppAutoReplyLog`, `WhatsAppContactPreference`
- Provider abstraction: `WhatsAppTextProvider` interface, Fake/Meta/Twilio implementations, factory with singleton + reset
- `prisma/seed.ts`: `WhatsAppAutoReplySettings` demo seed
- `src/tests/setup.ts`: 4 new model mocks
- `src/tests/whatsapp-text-provider.test.ts`: 10 tests

### Phase WA-2 â€” Webhook Receiver + Inbound Message Logging
- `src/services/whatsapp-webhook.service.ts`: `parseMetaInboundPayload`, `storeInboundMessage` (P2002 dedup), `processInboundWebhook` (fire-and-forget)
- `src/app/api/webhooks/whatsapp/route.ts`: POST handler extended to process inbound messages; always returns 200
- `src/tests/whatsapp-webhook.test.ts`: 14 tests

### Phase WA-3 â€” Auto Booking Link Reply Service
- `src/services/booking-link.service.ts`: `getBookingUrl()` with `NEXT_PUBLIC_BOOKING_BASE_URL` support
- `src/services/whatsapp-auto-reply.service.ts`: `processAutoReply()` with cooldown, opt-out, keyword, and provider abstraction
- Pure functions: `buildReplyText`, `isOptOutMessage`, `matchesKeywords`, `checkCooldown`
- `src/tests/whatsapp-auto-reply.test.ts`: 25 tests; `src/tests/booking-link.test.ts`: 4 tests

### Phase WA-4 â€” Dashboard UI + API Routes
- `src/app/api/whatsapp/auto-reply/settings/route.ts`: GET/PATCH with Zod validation and audit log
- `src/app/api/whatsapp/auto-reply/logs/route.ts`: GET paginated logs
- `src/app/api/whatsapp/auto-reply/preview/route.ts`: POST preview without DB write
- `src/app/api/dev/fake-whatsapp/inbound/route.ts`: dev-only inbound message simulator
- `src/app/dashboard/whatsapp/page.tsx`: Turkish dashboard with toggle, mode, cooldown, keywords, template, preview, logs table
- `src/components/dashboard/sidebar.tsx`: WhatsApp nav item added
- `src/lib/validators.ts`: `whatsAppAutoReplySettingsSchema` added

### Phase WA-5 â€” Final QA + Docs
- `docs/whatsapp-auto-link.md`: full usage guide (setup, fake testing, Meta setup, cooldown/opt-out)
- README.md updated with WhatsApp auto booking link reply feature
- All 280 tests pass; build clean; Prisma validate clean

## [1.2.0-district-skills-mcp] â€” 2026-05-09

### Phase DS-0 â€” Baseline, Repo Scan ve Risk Raporu
- 10 new agent files added to `.claude/agents/`: turkey-district-auditor-agent, turkey-district-fixer-agent, randevo-skill-architect-agent, randevo-skill-builder-agent, mcp-research-agent, mcp-integration-agent, mcp-security-agent, regression-merge-agent, compact-state-agent, github-push-agent
- `docs/repo-scan-report.md`: anthropics/skills and modelcontextprotocol/servers analysis
- `docs/qa/ds-0-baseline.md`: 188-test baseline QA report

### Phase DS-1 â€” TÃ¼rkiye Ä°lÃ§e Data Audit
- `scripts/audit-turkey-districts.ts`: audit script for 81 provinces + all districts
- `docs/turkiye-district-audit.md`: audit findings (7 provinces had data, 74 missing)
- `package.json`: `audit:districts` script added

### Phase DS-2 â€” Eksik Ä°lÃ§eleri Tamamlama
- `src/data/turkey-provinces.ts`: complete district data for all 81 Turkish provinces (~970+ districts)
- Previously only 7 provinces had district data; now 81/81 complete
- `src/tests/turkey-districts.test.ts`: 15 new tests (province count, district completeness, slug validation)
- Audit result: PASS â€” all 81 provinces have districts, no duplicate slugs within provinces

### Phase DS-3 â€” Ä°l/Ä°lÃ§e UI Validation
- Booking form province/district dropdowns already use `getDistrictsByProvince()` â€” now fully functional for all 81 provinces with no code changes required

### Phase DS-4 â€” Skills Mimari PlanÄ±
- `docs/randevo-skills-architecture.md`: 5-skill catalog with triggers, workflows, and eval strategy

### Phase DS-5 â€” Randevo Skills Implementasyonu
- `.claude/skills/randevo-booking-regression/SKILL.md`
- `.claude/skills/randevo-turkey-data/SKILL.md`
- `.claude/skills/randevo-mcp-integration/SKILL.md`
- `.claude/skills/randevo-payment-safety/SKILL.md`
- `.claude/skills/randevo-release-manager/SKILL.md`
- `evals/skills/`: 5 JSON eval prompt files
- `scripts/validate-skills.js`: skill validation script
- `package.json`: `validate:skills` script added

### Phase DS-6 â€” MCP Servers AraÅŸtÄ±rma ve GÃ¼venlik TasarÄ±mÄ±
- `docs/mcp-research-report.md`: 6 safe + 6 risky MCP server classifications
- `docs/mcp-security-checklist.md`: pre-commit security checklist for MCP integrations

### Phase DS-7 â€” GÃ¼venli MCP Local Dev Entegrasyonu
- `.mcp.json.example`: safe local-dev MCP config (filesystem/git/time/fetch/memory/sequential-thinking)
- `docs/mcp-local-setup.md`: setup guide for Mac/Linux/Windows
- `scripts/check-no-secrets.js`: secret scanner (skips test files, checks for Stripe/GitHub/AWS keys)
- `package.json`: `check:secrets` script added
- `.gitignore`: `.mcp.json` added (example file committed; real config never should be)

### Phase DS-8 â€” GÃ¼venlik Testleri
- `src/tests/security.test.ts`: 24 new security tests covering:
  - bookingSchema: rejects invalid email, malformed datetime, missing KVKK consent, short name
  - loginSchema: rejects SQL injection attempt in email, invalid email format, empty password
  - registerSchema: rejects short password, invalid email, short name
  - serviceSchema: rejects empty name, negative price, zero duration
  - OWASP posture: Prisma ORM SQL injection prevention, KVKK consent bypass prevention
- All 227 tests passing (188 original + 15 district tests + 24 security tests)
- Secret scan: PASS

---

## [1.1.0-turkiye] â€” 2026-05-09

### Phase TR-0 â€” TÃ¼rkiye Baseline
- 13 localization agent files added under `.claude/agents/`
- `docs/turkiye-product-strategy.md`: Turkish market strategy, pricing, and requirements

### Phase TR-1 â€” TÃ¼rkÃ§e UI ve i18n
- All dashboard, auth, booking, and marketplace pages translated to Turkish
- `src/i18n/tr.ts` flat dictionary for UI strings
- `src/lib/formatters.ts`: `formatCurrencyTRY`, `formatDateTR`, `formatTimeTR`, `formatDateTimeTR`, `formatDurationTR`
- TRY pricing in billing page (â‚º0/â‚º40/â‚º249), all dates use `tr-TR` locale

### Phase TR-2 â€” Ä°l/Ä°lÃ§e, Adres ve Telefon
- `src/data/turkey-provinces.ts`: 81 provinces + districts for 7 major cities
- `src/lib/phone.ts`: `normalizeTRPhone`, `displayTRPhone` with +90 format validation
- Prisma: `province`, `district`, `postalCode` added to Organization, Location, Customer
- Booking form: province/district cascaded dropdowns (optional)

### Phase TR-3 â€” TRY FiyatlandÄ±rma ve Abonelik Paketleri
- `src/config/pricing.tr.ts`: FREE â‚º0, STARTER â‚º40, PRO â‚º249, ENTERPRISE Ã¶zel fiyat
- `billing.ts` updated to read limits from TURKEY_PLANS (PRO: 2000 appts/month)

### Phase TR-4 â€” Yerel Ã–deme SaÄŸlayÄ±cÄ±larÄ±
- Payment provider interface with ManualBankTransfer, iyzico, PayTR, Param, Stripe
- Default: MANUAL_BANK_TRANSFER (generates EFT instructions)
- POST /api/payment/manual route

### Phase TR-5 â€” KVKK AÃ§Ä±k RÄ±za
- `ConsentLog` and `DataDeletionRequest` Prisma models
- Booking schema: `privacyNoticeAcknowledged` required, marketing/notification consent optional
- Booking form: 3 KVKK checkboxes; submit disabled until privacy accepted
- POST /api/gdpr/deletion-request public endpoint

### Phase TR-6 â€” TÃ¼rkÃ§e Bildirim ÅablonlarÄ±
- Turkish SMS/email templates: appointment-reminder, appointment-confirmation, marketing
- Marketing gate: `getMarketingTemplate` returns null when consent missing (IYS)

### Phase TR-7 â€” TÃ¼rkiye Marketplace
- 12 Turkish service categories (`src/data/turkey-categories.ts`)
- Marketplace: category dropdown + province dropdown (81 il)
- Province-specific pages: `/marketplace/[province]` with Turkish SEO metadata

### Phase TR-8 â€” e-ArÅŸiv/e-Fatura Export HazÄ±rlÄ±ÄŸÄ±
- `InvoiceProfile` model: invoiceType, taxOffice, taxNumber, identityNumber, address fields
- GET/POST/PATCH /api/invoice-profile
- Revenue export: invoice profile columns in CSV, JSON format option

### Phase TR-9 â€” Resmi Tatiller ve Final QA
- `src/data/turkey-holidays.ts`: 2025-2027 Turkey public holidays (statik liste)
- `BusinessClosedDay` model with unique constraint per org+date
- `generateAvailableSlots` checks holidays and closed days â†’ returns `[]`
- GET/POST/DELETE /api/business-closed-days
- 188 tests passing, clean build, secret scan clean
- Tagged v1.1.0-turkiye

---

## [1.0.0-post-mvp] â€” 2026-05-08

### Phase 33 â€” Final Hardening
- Added `CHANGELOG.md`
- Updated `docs/deployment.md` with provider setup guides (SMS, WhatsApp, Calendar, AI)
- Updated `README.md` with all post-MVP features, updated test count (95 tests), and revised tech stack
- `.nvmrc` and `package.json#engines` enforce Node.js `>=20 <27`

### Phase 32 â€” Node.js Version Integration
- Added `.nvmrc` pinning Node.js 20
- Added `engines` field to `package.json` (`node >=20 <27`, `npm >=10`)
- Added `scripts/check-node.js` with colored warning output
- Added `check:node` script to `package.json`

### Phase 31 â€” Accounting Integration
- Added `RevenueLedger` model to Prisma schema with `organizationId`, `appointmentId`, `paymentId`, `type`, `amountCents`, `currency`, `recordedAt`
- `GET /api/revenue` â€” filtered ledger entries with aggregate total
- `GET /api/revenue/export` â€” CSV download with `Content-Disposition` header
- Stripe webhook `checkout.session.completed` now creates a `RevenueLedger` entry inside the payment transaction (idempotent)
- 3 tests: payment creates ledger, duplicate webhook skipped, tenant isolation

### Phase 30 â€” AI Booking Assistant
- Added `Organization.aiChatbotEnabled` and `Organization.faqText` fields
- `POST /api/booking/[slug]/chat` â€” per-business AI chatbot using Anthropic `claude-haiku-4-5-20251001`
- In-memory rate limiter: 30 req/min per slug
- Graceful fallback to mock response when `AI_PROVIDER=DISABLED` or API key missing
- System prompt includes org info, FAQ text, and strict guardrails (no customer data, no booking without confirmation)
- 3 tests: disabled org â†’ 404, AI disabled â†’ mock reply, missing message â†’ 400

### Phase 29 â€” React Native Mobile App
- Added `mobile/` directory with Expo blank-typescript template
- Login, Dashboard, Appointments, and Appointment Detail screens
- State-based navigation (no external router library)
- All data fetched from existing API routes â€” no duplicated backend logic

### Phase 28 â€” Public Marketplace
- Added `Organization.marketplaceEnabled`, `category`, `city`, `coverImageUrl` fields
- `GET /api/marketplace` â€” public listing with category/city/text search filters
- `src/app/marketplace/page.tsx` â€” client-side filtered business grid
- `src/app/marketplace/[slug]/page.tsx` â€” public business profile with booking CTA
- 5 tests: filtering, empty results, always guards `marketplaceEnabled`/`suspended`

### Phase 27 â€” Google Calendar Sync
- Added `Appointment.calendarEventId` field and `CalendarConnection` model
- Provider abstraction: `CalendarProvider` interface, `FakeCalendarProvider`, `GoogleCalendarProvider`
- `GET /api/calendar/connect` â€” generates OAuth URL
- `GET /api/calendar/callback` â€” exchanges code for tokens, saves connection
- `DELETE /api/calendar/disconnect` â€” deactivates connection
- Calendar event created on appointment confirmation (errors isolated, don't break booking)
- 10 tests: fake provider, factory singleton, appointment survives calendar failure

### Phase 26 â€” WhatsApp Integration
- Added `Organization.whatsappEnabled`, `Customer.whatsappOptIn`, `Reminder.channel` fields
- Provider abstraction: `WhatsAppProvider` interface, `FakeWhatsAppProvider`, `MetaWhatsAppProvider`
- `POST /api/webhooks/whatsapp` â€” Meta webhook verify + incoming message handler
- Opt-in guard prevents messages when `customer.whatsappOptIn=false`
- 9 tests: fake provider, factory singleton, opt-in guard, webhook verify

---

## [0.1.0] â€” MVP

### Phase 25 â€” Superadmin Panel
- Superadmin-only routes (`/api/superadmin/*`) with `platformRole: SUPERADMIN` guard
- User listing, organization suspension toggle, audit log view

### Phase 24 â€” Staff Portal
- Staff-specific routes and pages (`/staff/*`)
- Staff invite flow with expiring tokens

### Phase 23 â€” Deposit Payments (Stripe)
- `Service.depositRequired` + `depositAmountCents`
- Stripe Checkout session for deposit flow
- `Payment` model with idempotency via `stripeEventId`

### Phase 22 â€” Multi-Location Support
- `Location` model with default location support
- `Appointment.locationId` optional FK

### Phase 21 â€” SMS Reminders (Twilio)
- Provider abstraction: `SmsProvider` interface, `FakeSmsProvider`, `TwilioSmsProvider`
- Reminder worker dispatches SMS when `SMS_PROVIDER=TWILIO`

### Phases 1â€“20 â€” Core MVP
- Multi-tenant booking engine with slot generation and conflict prevention
- Public booking page (`/booking/[slug]`) with multi-step form
- Dashboard: appointments, services, staff, availability, analytics, billing
- Stripe subscription billing (FREE/STARTER/PRO) with webhook handling
- Email reminders (fake log + Resend)
- Audit logging
- NextAuth v5 credentials auth with JWT sessions







