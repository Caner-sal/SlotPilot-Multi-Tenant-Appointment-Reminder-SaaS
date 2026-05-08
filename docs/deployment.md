# SlotPilot — Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm

### Steps

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Verify it's running
docker-compose ps

# 3. Set up environment
cp .env.example .env
# Edit .env as needed

# 4. Generate Prisma client
npm run db:generate

# 5. Run migrations
npm run db:migrate

# 6. Seed demo data
npm run db:seed

# 7. Start dev server
npm run dev
```

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
