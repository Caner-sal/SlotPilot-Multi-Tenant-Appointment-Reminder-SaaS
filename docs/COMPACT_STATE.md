# Randevo Compact State

_Last updated: 2026-05-09_

## Current Branch: main

## Completed Feature Sets

### DS-0 through DS-9 (merged to main, commit d7d16a2)
- 81 Turkey province/district data complete
- Skills architecture, MCP config, security tests
- 227 tests at merge

### WA-0 through WA-5 (merged to main, commit 57f26ee, tag v1.3.0-whatsapp-auto-reply)
WhatsApp Auto Booking Link Reply fully implemented.

New DB models:
- WhatsAppAutoReplySettings
- WhatsAppInboundMessage
- WhatsAppAutoReplyLog
- WhatsAppContactPreference

New services:
- `src/services/whatsapp-webhook.service.ts`
- `src/services/whatsapp-auto-reply.service.ts`
- `src/services/booking-link.service.ts`
- `src/services/whatsapp/whatsapp-text-provider.interface.ts` (+ fake/meta/twilio/factory)

New API routes:
- `/api/whatsapp/auto-reply/settings` (GET/PATCH)
- `/api/whatsapp/auto-reply/logs` (GET paginated)
- `/api/whatsapp/auto-reply/preview` (POST, no DB write)
- `/api/dev/fake-whatsapp/inbound` (POST, dev only)
- `/api/webhooks/whatsapp` updated to handle inbound messages

New UI:
- `src/app/dashboard/whatsapp/page.tsx` (Turkish dashboard)

Sidebar:
- WhatsApp nav item added to `src/components/dashboard/sidebar.tsx`

Tests:
- 28 test files, 280 tests, all passing locally

Docs:
- `docs/whatsapp-auto-link.md`
- `docs/whatsapp-auto-reply-policy.md`

### Post-WA Fixes (main, commits 87e7884 and 4b8f1f9)
- Unused imports removed from test files (ESLint warnings)
- Turkish UI and DS/TR localization changes committed

## CI Status (No-DB Safe + Node20)

CI is standardized to stay stable even before production DB is ready.

Current CI workflow (`.github/workflows/ci.yml`):
```yaml
- setup-node with .nvmrc (Node 20)
- npm ci --ignore-scripts
- ./node_modules/.bin/prisma generate (DATABASE_URL=file:./test.db)
- ./node_modules/.bin/prisma db push --skip-generate (DATABASE_URL=file:./test.db)
- ./node_modules/.bin/vitest run (DATABASE_URL=file:./test.db)
- ./node_modules/.bin/next build (DATABASE_URL=file:./test.db, AUTH_SECRET=..., NEXTAUTH_SECRET=..., NEXTAUTH_URL=...)
```

Local Windows run note (safe path handling):
```powershell
Set-Location -LiteralPath "C:\Users\caner\Randevo — Multi-Tenant Appointment & Reminder SaaS"
```

## Key Files
| File | Purpose |
|------|---------|
| prisma/schema.prisma | WA models + Organization relations |
| src/services/whatsapp-auto-reply.service.ts | Auto-reply logic |
| src/services/whatsapp-webhook.service.ts | Inbound webhook handler |
| src/app/dashboard/whatsapp/page.tsx | Turkish dashboard UI |
| src/app/api/webhooks/whatsapp/route.ts | Inbound + delivery status handling |
| .github/workflows/ci.yml | CI pipeline |

## Env Variables (new in WA phases)
```
WHATSAPP_TEXT_PROVIDER=FAKE
WHATSAPP_AUTO_REPLY_ENABLED=false
META_WHATSAPP_APP_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
NEXT_PUBLIC_BOOKING_BASE_URL=http://localhost:3000/booking
```

## Next Steps
- Confirm GitHub Actions returns 1/1 pass on main and PR workflows
- Keep DB integration checks separate/non-blocking until production `DATABASE_URL` is available
