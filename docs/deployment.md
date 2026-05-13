# Randevo - Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+
- npm

> **No Docker needed!** The project uses SQLite for local development (zero setup).

### Steps

```bash
# 1. Clone and install
npm install --legacy-peer-deps --ignore-scripts

# 2. Set up environment
cp .env.example .env
# DATABASE_URL is already set to file:./dev.db - no changes needed

# 3. Run migrations (creates dev.db automatically)
npm run db:migrate

# 4. Seed demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

### Demo giris bilgileri (seed sonrasi)
- Email: `demo@randevo.app`
- Password: `DEMO_OWNER_PASSWORD` env degeri (set edilmezse seed fallback kullanir)
- Public booking: `http://localhost:3000/booking/barber-demo`

## Production Deployment (Vercel)

### Database
Use a managed PostgreSQL provider:
- Neon (recommended for Vercel)
- Supabase
- Railway
- PlanetScale (MySQL alternative)

### Steps

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - All variables from .env.example with production values
   - `NEXTAUTH_URL` = your production URL
   - `AUTH_SECRET` = generated secret (not the dev one)
4. Deploy

### Stripe Production Setup

1. Create live Stripe products
2. Replace test keys with live keys
3. Create webhook endpoint pointing to your production URL
4. Subscribe to: `customer.subscription.updated`, `customer.subscription.deleted`

## Optional Provider Setup

### SMS (Twilio)
Set `SMS_PROVIDER=TWILIO` and fill in:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### WhatsApp (Meta Cloud API)
Set `WHATSAPP_PROVIDER=META` and fill in:
- `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Requires a Meta Business account with approved WhatsApp Business API and message templates.

### Google Calendar Sync
Set `CALENDAR_PROVIDER=GOOGLE` and fill in:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com) with Calendar API enabled.
- Add `{NEXT_PUBLIC_APP_URL}/api/calendar/callback` as an authorized redirect URI.

### AI Booking Assistant (Anthropic)
Set `AI_PROVIDER=ANTHROPIC` and fill in:
- `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com)
- Enable per-organization in dashboard -> Settings -> AI Chatbot.

## Production Checklist

- [ ] AUTH_SECRET is a strong random secret (not dev placeholder)
- [ ] DATABASE_URL points to production database
- [ ] .env is NOT committed to git
- [ ] Stripe keys are live mode keys
- [ ] Stripe webhook secret is set
- [ ] RESEND_API_KEY is set for real email sending
- [ ] NEXTAUTH_URL is the production URL
- [ ] PostgreSQL SSL is enabled (`?sslmode=require`)
- [ ] Run `npm run build` successfully before deploying
- [ ] Run database migrations before going live
- [ ] SMS_PROVIDER, WHATSAPP_PROVIDER, CALENDAR_PROVIDER, AI_PROVIDER set appropriately

## Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm test             # Run unit tests

npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio UI
npm run db:reset     # Reset DB (dev only!)

docker-compose up -d    # Start local PostgreSQL
docker-compose down     # Stop local PostgreSQL
docker-compose logs -f  # View DB logs
```

## Sprint-3 / Wave Release Addendum (2026-05-13)

### Mobile Auth Bridge Checklist
- Ensure `MOBILE_JWT_SECRET` is set in all deployed environments.
- Verify mobile auth routes are reachable:
  - `POST /api/mobile/auth/login`
  - `POST /api/mobile/auth/refresh`
  - `POST /api/mobile/auth/logout`
- Validate refresh-token revoke table growth policy (`MobileRefreshToken`) and retention policy.

### GDPR + Legal Checklist
- Verify legal routes are public and reachable:
  - `/legal/privacy`, `/legal/kvkk`, `/legal/terms`, `/legal/cookies`
- Keep legal pages explicitly marked as placeholders requiring lawyer review; do not claim legal compliance completeness from placeholder text.
- Verify export/deletion request ingestion endpoints:
  - `POST /api/gdpr/export-request`
  - `POST /api/gdpr/deletion-request`
- Verify superadmin status visibility endpoint:
  - `GET /api/admin/gdpr/requests`

### Staging Smoke (minimum)
1. Mobile login with valid credentials returns access/refresh token pair.
2. Refresh rotates token and old refresh token becomes invalid.
3. Staff mobile token cannot update appointment status (403 expected).
4. GDPR export request is accepted and visible in admin request list.
5. `npm run test:e2e` and `cd mobile && npm run typecheck` pass on release branch.


## PROD-12/13/14 Closeout Addendum (2026-05-14)

### Demo Seed Invariants
- Demo workspace remains seed-only.
- Set `DEMO_OWNER_PASSWORD` and `DEMO_SUPERADMIN_PASSWORD` in staging/production seed jobs.
- Verify seed smoke summary includes:
  - `organizationSlug=barber-demo`
  - `plan=FREE status=ACTIVE`
  - `paymentCountDelta=0`
  - `safety=PASS`

### Onboarding Checklist Smoke
1. Login as owner and open dashboard.
2. Confirm onboarding card loads from `GET /api/dashboard/onboarding-checklist`.
3. Confirm deterministic progress states:
   - no service/booking => initial progress
   - service created => service step completed
   - first booking created => booking step completed
   - plan upgrade click event => final step completed.

### Product Events Read API Smoke
1. Call `GET /api/admin/product-events?limit=20` with superadmin session and confirm 200.
2. Call same endpoint with non-superadmin and confirm 403.
3. Confirm filtered query works:
   - `eventName=service_created`
   - `organizationId=<orgId>`
4. Confirm cursor pagination returns stable `nextCursor` behavior.

