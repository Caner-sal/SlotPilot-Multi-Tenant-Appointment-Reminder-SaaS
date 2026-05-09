# Randevo — Deployment Guide

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
# DATABASE_URL is already set to file:./dev.db — no changes needed

# 3. Run migrations (creates dev.db automatically)
npm run db:migrate

# 4. Seed demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

### Demo giriş bilgileri (seed sonrası)
- Email: `demo@randevo.app`
- Password: `demo1234`
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
