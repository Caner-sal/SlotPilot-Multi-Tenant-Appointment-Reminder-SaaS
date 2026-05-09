# Randevo

**A full-stack multi-tenant appointment booking and reminder SaaS MVP for local businesses.**

Built with Next.js 15, Prisma, SQLite/PostgreSQL, Auth.js, Stripe (test mode), and TypeScript.

---

## Features

- **Multi-tenant architecture** — each business has fully isolated data
- **Public booking page** — `/booking/[slug]` for customer self-booking
- **Smart slot generation** — respects staff availability, service duration, and existing bookings
- **Double-booking prevention** — race condition-safe conflict checking
- **Automated reminders** — email reminder scheduling (fake mode for local dev, Resend for production)
- **Appointment dashboard** — manage, filter, and update appointment statuses
- **Analytics dashboard** — revenue, appointment counts, top services, busiest staff
- **Staff management** — multi-staff with service assignments
- **Availability management** — weekly schedule per staff
- **Subscription billing** — Free/Starter/Pro plans with Stripe test mode
- **Plan limit enforcement** — backend-enforced limits (not client-side)
- **Audit logs** — immutable log of all important actions
- **Auth** — credentials-based login, JWT sessions, protected routes
- **SMS reminders** — Twilio integration (FAKE mode by default)
- **WhatsApp reminders** — Meta Cloud API (FAKE mode by default)
- **WhatsApp auto booking link reply** — inbound message → automatic booking URL reply with cooldown, opt-out, and keyword filtering
- **Google Calendar sync** — two-way sync via OAuth 2.0 (FAKE mode by default)
- **Public marketplace** — searchable business directory with category/city filters
- **AI booking assistant** — per-business chatbot powered by Claude (Anthropic API)
- **Revenue accounting** — ledger tracking with CSV export
- **Multi-location support** — multiple locations per organization
- **Staff portal** — staff-specific login with appointment view
- **Deposit payments** — Stripe checkout for service deposits
- **Superadmin panel** — platform-level user and org management
- **React Native mobile app** — Expo app for iOS/Android (staff dashboard)

---

## Monetization Model

| Plan | Price | Staff | Appts/month | Email Reminders |
|------|-------|-------|-------------|-----------------|
| Free | $0 | 1 | 20 | No |
| Starter | $9/mo | 3 | 300 | Yes |
| Pro | $19/mo | Unlimited | Unlimited | Yes |

Target customers: barbers, beauty salons, tutors, coaches, fitness trainers, small service businesses.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Auth.js) |
| Styling | Tailwind CSS + Radix UI |
| Validation | Zod |
| Billing | Stripe (test mode) |
| Email | Resend / fake log mode |
| Testing | Vitest |
| Dev DB | Docker Compose |

---

## Architecture

```
src/
├── app/
│   ├── api/              # API route handlers (Next.js)
│   ├── (auth)/           # Login, register, onboarding
│   ├── dashboard/        # Protected business dashboard
│   └── booking/[slug]/   # Public booking page
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma singleton
│   ├── tenant.ts         # Tenant isolation helpers
│   ├── billing.ts        # Plan limit enforcement
│   ├── stripe.ts         # Stripe client
│   └── email.ts          # Email abstraction (fake/Resend)
├── services/             # Business logic layer
│   ├── booking.service.ts
│   ├── availability.service.ts
│   ├── reminder.service.ts
│   ├── analytics.service.ts
│   └── audit.service.ts
└── tests/                # Vitest unit tests
```

**Tenant isolation:** `organizationId` is always resolved from the authenticated session, never trusted from client input. Every tenant-scoped query includes `{ where: { organizationId } }`.

---

## Database Schema

19 Prisma models:

- **User** — platform accounts
- **Organization** — business tenants with unique slug
- **OrganizationMember** — user-org relationship with roles (OWNER, ADMIN, STAFF)
- **Service** — bookable services with duration and price
- **Staff** — employees with assigned services
- **StaffInvite** — invite tokens for staff onboarding
- **StaffService** — many-to-many service assignments
- **AvailabilityRule** — weekly schedule per staff
- **Customer** — booking customers (upserted on email)
- **Appointment** — bookings with status tracking
- **Location** — physical locations per organization
- **Reminder** — scheduled email/SMS/WhatsApp notifications
- **Subscription** — plan and billing info
- **AuditLog** — immutable action history
- **Payment** — Stripe payment records (idempotent)
- **CalendarConnection** — Google Calendar OAuth tokens
- **RevenueLedger** — accounting entries for payments


---

## Getting Started

### Prerequisites

- Node.js 20+ 
- Docker Desktop (for local PostgreSQL)
- Git

### 1. Clone and install

```bash
git clone https://github.com/Caner-sal/Randevo-Multi-Tenant-Appointment-Reminder-SaaS.git
cd Randevo-Multi-Tenant-Appointment-Reminder-SaaS
npm install --legacy-peer-deps --ignore-scripts
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` — the Docker defaults work out of the box for local development.

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run migrations and seed

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Load demo data
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

See [.env.example](.env.example) for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite (default: `file:./dev.db`) or PostgreSQL URL |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Stripe test key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `RESEND_API_KEY` | Leave empty for fake email mode |
| `SMS_PROVIDER` | `FAKE` (default) or `TWILIO` |
| `WHATSAPP_PROVIDER` | `FAKE` (default) or `META` |
| `CALENDAR_PROVIDER` | `FAKE` (default) or `GOOGLE` |
| `AI_PROVIDER` | `DISABLED` (default) or `ANTHROPIC` |
| `ANTHROPIC_API_KEY` | Required when `AI_PROVIDER=ANTHROPIC` |

---

## Demo Account

After seeding:

```
Email:    demo@randevo.app
Password: demo1234
```

Public booking URL: `http://localhost:3000/booking/barber-demo`

---

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test coverage (95 tests across 14 suites):
- Booking engine (slot generation, conflict prevention)
- Tenant isolation (cross-org access blocked)
- Plan limit enforcement (FREE/STARTER/PRO)
- Reminder scheduling and processing
- SMS/WhatsApp provider (fake + opt-in guard)
- Google Calendar sync (fake provider + error isolation)
- Marketplace filtering
- Deposit payments (Stripe idempotency)
- Multi-location support
- Staff portal access
- Superadmin operations
- AI chatbot (disabled mode, missing message, disabled org)
- Accounting / revenue ledger (idempotency guard)

---

## Screenshots

> Add screenshots of your running app here.

- [ ] Landing page
- [ ] Register / Login
- [ ] Organization onboarding
- [ ] Dashboard overview
- [ ] Services management
- [ ] Staff management
- [ ] Availability settings
- [ ] Public booking page
- [ ] Slot selection
- [ ] Appointment confirmation
- [ ] Appointment dashboard
- [ ] Analytics cards
- [ ] Billing page
- [ ] Reminder logs

---

## Future Improvements

- [ ] Customer cancellation self-service link
- [ ] Coupon/discount system
- [ ] Email template editor
- [ ] Calendar drag-and-drop UI
- [ ] Custom domain per business
- [ ] AI-powered no-show prediction
- [ ] Push notifications in mobile app
- [ ] Offline support in mobile app

---

## Author

Built by [Caner Sal](https://github.com/Caner-sal) as a full-stack SaaS portfolio project.

---

## License

MIT
