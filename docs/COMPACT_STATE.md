# SlotPilot Compact State

## Last Completed Phases

### DS-0 through DS-9 (DONE — merged to main)
- 10 new agent files added to .claude/agents/
- Complete Turkey district data for all 81 provinces added to src/data/turkey-provinces.ts
- scripts/audit-turkey-districts.ts, docs/turkiye-district-audit.md, docs/repo-scan-report.md created
- Skills files, MCP config, security tests, and final QA completed
- 227 tests passing at merge time
- Commit: d7d16a2 (merge commit), b96adb5 (TypeScript fix)

### WA-0 — WhatsApp Auto Reply Baseline (DONE)
- Branch: feature/wa-auto-reply
- Created 6 agent files in .claude/agents/: whatsapp-auto-link-agent.md, whatsapp-webhook-agent.md, whatsapp-policy-agent.md, whatsapp-dashboard-agent.md, whatsapp-provider-agent.md, whatsapp-qa-agent.md
- Created docs/whatsapp-auto-reply-policy.md
- Created SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md (feature plan doc)
- Updated .env.example with 5 new WhatsApp auto-reply variables (see env section below)
- Tests: 227 passing
- Commit: f1bb4ff

### WA-1 — DB Models + Provider Text Abstraction (DONE)
- Added 4 new Prisma models: WhatsAppAutoReplySettings, WhatsAppInboundMessage, WhatsAppAutoReplyLog, WhatsAppContactPreference
- Added Organization relations for all 4 new models in schema.prisma
- Migration file: prisma/migrations/20260509150814_add_whatsapp_auto_reply_models/migration.sql
- New provider files created:
  - src/services/whatsapp/whatsapp-text-provider.interface.ts
  - src/services/whatsapp/fake-whatsapp-text.provider.ts
  - src/services/whatsapp/meta-whatsapp-text.provider.ts
  - src/services/whatsapp/twilio-whatsapp-text.provider.ts
  - src/services/whatsapp/whatsapp-text.factory.ts (singleton, WHATSAPP_TEXT_PROVIDER env, FAKE default)
- Updated prisma/seed.ts with WhatsAppAutoReplySettings default row for barber-demo org
- Updated src/tests/setup.ts with 4 new model mocks (WhatsAppAutoReplySettings, WhatsAppInboundMessage, WhatsAppAutoReplyLog, WhatsAppContactPreference)
- New test file: src/tests/whatsapp-text-provider.test.ts (10 tests)
- Tests: 237 passing
- Build: passing
- Commit: dd56016

### WA-2 — Webhook Receiver + Inbound Logging (DONE)
- Created src/services/whatsapp-webhook.service.ts:
  - parseMetaInboundPayload(rawBody): pure function, parses entry[].changes[].field==="messages"
  - findOrganizationByPhoneNumberId: queries WhatsAppAutoReplySettings by phoneNumberId where enabled=true
  - storeInboundMessage: creates WhatsAppInboundMessage, catches Prisma P2002 for dedup
  - processInboundWebhook: orchestrates all above, triggers auto-reply fire-and-forget via lazy import
- Updated src/app/api/webhooks/whatsapp/route.ts:
  - Existing POST delivery status handling is UNCHANGED
  - Added: calls processInboundWebhook(body) for messages[] entries
  - Always returns { received: true } with 200
- Created src/tests/whatsapp-webhook.test.ts (14 tests)
- Tests: 251 passing
- Commit: 60e582f

### WA-3 — Auto Booking Link Reply Service (DONE)
- Created src/services/booking-link.service.ts:
  - getBookingUrl(orgSlug): NEXT_PUBLIC_BOOKING_BASE_URL already includes /booking path (just append /slug). Falls back to NEXT_PUBLIC_APP_URL + /booking/ + slug. Falls back to localhost:3000
- Created src/services/whatsapp-auto-reply.service.ts:
  - Pure functions: buildReplyText, isOptOutMessage, matchesKeywords, checkCooldown
  - processAutoReply: full orchestration (settings → contact pref → blocked → opt-out → keyword → cooldown → send → log)
  - Turkish opt-out keywords: dur, durdurun, istemiyorum, hayir, iptal, stop, unsubscribe
  - Skip reasons enum: AUTO_REPLY_DISABLED, CONTACT_BLOCKED, OPT_OUT, COOLDOWN_ACTIVE, KEYWORD_NOT_MATCHED
  - WhatsAppAutoReplyLog created for every attempt (SENT/SKIPPED/FAILED)
  - getWhatsAppTextProvider() used for sending (FAKE by default)
- Created src/tests/whatsapp-auto-reply.test.ts (25 tests)
- Created src/tests/booking-link.test.ts (4 tests)
- Tests: 280 passing
- Commit: d6dd070

## Branch / GitHub Status

- Active branch: feature/wa-auto-reply
- Last commits: 60e582f (WA-2), d6dd070 (WA-3)
- main branch has DS-0 through DS-9 merged at b96adb5

## Key Files Changed

### WA-0 and WA-1 files (on feature/wa-auto-reply)
- .claude/agents/whatsapp-auto-link-agent.md (new)
- .claude/agents/whatsapp-webhook-agent.md (new)
- .claude/agents/whatsapp-policy-agent.md (new)
- .claude/agents/whatsapp-dashboard-agent.md (new)
- .claude/agents/whatsapp-provider-agent.md (new)
- .claude/agents/whatsapp-qa-agent.md (new)
- docs/whatsapp-auto-reply-policy.md (new)
- SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md (new)
- .env.example (updated — 5+ new vars)
- prisma/schema.prisma (4 new models + Organization relations)
- prisma/seed.ts (WhatsAppAutoReplySettings seed row added)
- prisma/migrations/20260509150814_add_whatsapp_auto_reply_models/migration.sql (new)
- src/services/whatsapp/whatsapp-text-provider.interface.ts (new)
- src/services/whatsapp/fake-whatsapp-text.provider.ts (new)
- src/services/whatsapp/meta-whatsapp-text.provider.ts (new)
- src/services/whatsapp/twilio-whatsapp-text.provider.ts (new)
- src/services/whatsapp/whatsapp-text.factory.ts (new)
- src/tests/setup.ts (4 new model mocks added)
- src/tests/whatsapp-text-provider.test.ts (new — 10 tests)

### WA-2 and WA-3 files (on feature/wa-auto-reply)
- src/services/whatsapp-webhook.service.ts (new)
- src/app/api/webhooks/whatsapp/route.ts (updated — messages[] handling added)
- src/tests/whatsapp-webhook.test.ts (new — 14 tests)
- src/services/booking-link.service.ts (new)
- src/services/whatsapp-auto-reply.service.ts (new)
- src/tests/whatsapp-auto-reply.test.ts (new — 25 tests)
- src/tests/booking-link.test.ts (new — 4 tests)

## Database / Migration Changes

- Migration: 20260509150814_add_whatsapp_auto_reply_models
- 4 new models (SQLite — all enum-like fields use String, not enum keyword):
  - WhatsAppAutoReplySettings: per-org auto-reply config (enabled, cooldownHours, messageTemplate, phoneNumberId, etc.)
  - WhatsAppInboundMessage: stores every inbound WhatsApp message (waMessageId unique for dedup)
  - WhatsAppAutoReplyLog: records each auto-reply attempt and outcome
  - WhatsAppContactPreference: per-contact opt-in/opt-out tracking
- No new migrations in WA-2 or WA-3

## New Environment Variables

Added in WA-0 / WA-1 (all present in .env.example):
- WHATSAPP_TEXT_PROVIDER=FAKE — selects auto-reply text provider (FAKE | META | TWILIO)
- WHATSAPP_AUTO_REPLY_ENABLED=false — global feature flag
- WHATSAPP_DEFAULT_COOLDOWN_HOURS=24 — default cooldown between auto-replies per contact
- META_WHATSAPP_APP_SECRET= — for webhook signature verification (Meta inbound)
- TWILIO_WHATSAPP_FROM= — Twilio WhatsApp sender number (new, for auto-reply)
- NEXT_PUBLIC_BOOKING_BASE_URL=http://localhost:3000/booking — base URL for booking link in auto-reply

Note: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN were already present for SMS; now also used for WhatsApp text provider.
Note: WHATSAPP_PROVIDER (existing) is for reminder templates — do not confuse with WHATSAPP_TEXT_PROVIDER.

## New Scripts

- scripts/audit-turkey-districts.ts (run with: node node_modules/tsx/dist/cli.mjs scripts/audit-turkey-districts.ts)

## New Skills

- .claude/skills/slotpilot-booking-regression/SKILL.md
- .claude/skills/slotpilot-turkey-data/SKILL.md
- .claude/skills/slotpilot-mcp-integration/SKILL.md
- .claude/skills/slotpilot-payment-safety/SKILL.md
- .claude/skills/slotpilot-release-manager/SKILL.md

## MCP Config Status

- .mcp.json.example: created in DS-7
- docs/mcp-research-report.md: created in DS-6
- docs/mcp-security-checklist.md: created in DS-7

## Tests Passed

- 280/280 tests passing after WA-3
- Build passing after WA-3

## Tests Failed / Known Issues

None currently.

## Next Phase

### WA-4 — Dashboard UI + API Routes

Implement in this order:

1. Add whatsAppAutoReplySettingsSchema to src/lib/validators.ts:
   - Fields: enabled, provider, phoneNumberId, replyMode, cooldownHours, triggerKeywords (array), messageTemplate, includeBookingLink

2. Create src/app/api/whatsapp/auto-reply/settings/route.ts:
   - GET: requireAuth() → WhatsAppAutoReplySettings.findUnique → return defaults if not found, JSON.parse triggerKeywords before returning
   - PATCH: requireAuth() → Zod validate with whatsAppAutoReplySettingsSchema → JSON.stringify triggerKeywords → upsert → write audit log

3. Create src/app/api/whatsapp/auto-reply/logs/route.ts:
   - GET: requireAuth() → paginated WhatsAppAutoReplyLog query (include inboundMessage relation)

4. Create src/app/api/whatsapp/auto-reply/preview/route.ts:
   - POST: requireAuth() → load settings → getBookingUrl → buildReplyText → return { previewText, bookingUrl }
   - MUST NOT write to DB or call any provider

5. Create src/app/api/dev/fake-whatsapp/inbound/route.ts:
   - POST: if NODE_ENV !== "development" return 403 immediately
   - Otherwise: build synthetic Meta inbound payload → call processInboundWebhook

6. Create src/app/dashboard/whatsapp/page.tsx:
   - "use client", Turkish UI labels
   - Sections: settings form, preview panel, auto-reply logs table

7. Update src/components/dashboard/sidebar.tsx:
   - Add WhatsApp nav item (follow existing sidebar item pattern)

Key constraints:
- triggerKeywords is stored as a JSON string in DB — parse on GET, stringify on PATCH
- Preview endpoint: no DB writes, no provider calls — pure computation only
- Dev inbound endpoint: hard 403 guard on non-development NODE_ENV
- requireAuth pattern: reference src/app/api/reminders/route.ts
- Sidebar pattern: reference src/components/dashboard/sidebar.tsx

## Next Prompt

Read docs/COMPACT_STATE.md and SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md.
The active branch is feature/wa-auto-reply. WA-0 through WA-3 are complete (280 tests passing).
Continue from Phase WA-4: Dashboard UI + API Routes.
Key files to reference for patterns: src/app/api/reminders/route.ts (requireAuth), src/components/dashboard/sidebar.tsx (nav item pattern), src/lib/validators.ts (Zod schema location), src/services/whatsapp-auto-reply.service.ts (buildReplyText, getBookingUrl).
Key constraint: triggerKeywords stored as JSON string — parse on GET, stringify on PATCH. Preview endpoint must NOT write to DB or call provider. Dev inbound endpoint must return 403 in non-development.
Run tests with: ./node_modules/.bin/vitest run
Run build with: ./node_modules/.bin/next build
Run prisma with: ./node_modules/.bin/prisma
After WA-4 is done, update COMPACT_STATE.md and ask user to run /compact.

## Do Not Forget

- SQLite is the dev database — Prisma schema uses String for all enum-like fields, not the enum keyword
- WHATSAPP_TEXT_PROVIDER is new (auto-reply text); WHATSAPP_PROVIDER is existing (reminder templates) — do not mix them up
- npm test has a PATH issue on Windows — use: ./node_modules/.bin/vitest run
- npm run build has a PATH issue on Windows — use: ./node_modules/.bin/next build
- prisma commands: ./node_modules/.bin/prisma migrate dev, ./node_modules/.bin/prisma generate
- Active branch: feature/wa-auto-reply (do not merge to main until WA phases are complete)
- Dedup for inbound messages uses waMessageId unique constraint — catch P2002 Prisma error code
- whatsapp-text.factory.ts uses a module-level singleton (_provider) — resetWhatsAppTextProvider() exists for test teardown
- NEXT_PUBLIC_BOOKING_BASE_URL already includes /booking path — booking-link.service.ts appends /slug directly, does not add /booking again
- Auto-reply skip reasons: AUTO_REPLY_DISABLED, CONTACT_BLOCKED, OPT_OUT, COOLDOWN_ACTIVE, KEYWORD_NOT_MATCHED
- processInboundWebhook triggers auto-reply as fire-and-forget (lazy import to avoid circular deps)
