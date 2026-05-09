# Randevo — Claude Code / Antigravity Agent Project Brief

> Bu dosya Claude Code veya Google Antigravity içine verilecek ana proje talimatıdır.  
> Amaç: Backend tarafı güçlü, para kazanma ihtimali olan, GitHub’da ciddi portfolyo projesi gibi duracak bir SaaS MVP geliştirmek.

---

## 1. Proje Fikri

**Proje Adı:** Randevo  
**Alt Başlık:** Multi-Tenant Appointment & Reminder SaaS  
**Proje Türü:** Full-stack SaaS web uygulaması  
**Zorluk:** Orta - ileri seviye  
**Ana Hedef:** Küçük işletmelerin randevu, müşteri, hizmet, çalışan, müsaitlik, hatırlatma ve abonelik yönetimi yapabileceği çok kiracılı bir SaaS platformu geliştirmek.

Bu proje basit bir deneme projesinden daha detaylıdır. Backend tarafı özellikle güçlü tutulacaktır.

---

## 2. Para Kazanma Mantığı

Randevo küçük işletmelere aylık abonelik modeliyle satılabilecek bir SaaS olarak düşünülür.

### 2.1 Hedef Müşteriler

- Berberler
- Kuaförler
- Güzellik salonları
- Özel ders verenler
- Diyetisyen / danışman / koçluk hizmeti veren kişiler
- Spor eğitmenleri
- Küçük atölye ve kurs merkezleri
- Küçük randevulu hizmet işletmeleri

### 2.2 Problem

Küçük işletmelerin çoğu randevuları hâlâ şu yollarla takip eder:

- WhatsApp mesajı
- Telefon araması
- Not defteri
- Excel tablosu
- Instagram DM

Bu yöntemlerde sık görülen sorunlar:

- Randevular karışır.
- Aynı saate iki müşteri yazılabilir.
- Müşteri randevuyu unutabilir.
- İşletme gelir ve randevu yoğunluğunu analiz edemez.
- Müşteri randevu almak için işletmeye mesaj atmak zorunda kalır.
- İşletme kapalıyken müşteri randevu alamaz.

### 2.3 Çözüm

Randevo işletmeye özel public booking link verir.

Örnek public linkler:

```txt
randevo.app/barber-demo
randevo.app/ekin-beauty
randevo.app/caner-tutor
```

Müşteri bu link üzerinden:

1. Hizmet seçer.
2. Çalışan seçer.
3. Uygun tarih/saat seçer.
4. İsim, telefon ve e-posta girer.
5. Randevu oluşturur.
6. İşletme dashboard’dan randevuyu görür.
7. Sistem otomatik hatırlatma gönderir.

### 2.4 Ücretlendirme Fikri

İlk gerçek ürün planı:

```txt
Free Plan
- 1 işletme
- 1 çalışan
- 20 randevu / ay
- Temel public booking page

Starter Plan - 9 USD / ay
- 3 çalışan
- 300 randevu / ay
- Email hatırlatma
- Dashboard analytics

Pro Plan - 19 USD / ay
- Sınırsız çalışan
- Sınırsız randevu
- Email + SMS reminder altyapısına hazır yapı
- Özel public booking slug
- Gelişmiş analytics
```

MVP’de gerçek para alma sistemi Stripe test mode ile kurulabilir. Production’a geçmeden önce şirket, vergi, ödeme sağlayıcı şartları ve yaş/hesap gereklilikleri ayrıca kontrol edilmelidir.

---

## 3. Neden Bu Proje?

Bu proje GitHub’da güçlü görünür çünkü:

- Full-stack mimari içerir.
- Auth vardır.
- Multi-tenancy vardır.
- Database schema ciddidir.
- API route yapısı vardır.
- Subscription billing mantığı vardır.
- Webhook mantığı vardır.
- Public/private route ayrımı vardır.
- Scheduler/reminder sistemi vardır.
- Validation, rate limit, authorization gibi backend konuları vardır.
- Test yazılabilir.
- Gerçek müşteri problemine dokunur.

---

## 4. Kullanılacak Teknolojiler

Ana önerilen stack:

```txt
Next.js App Router
TypeScript
PostgreSQL
Prisma ORM
NextAuth veya Auth.js
Stripe Billing
Tailwind CSS
Zod
Resend veya benzeri email API
Vitest
Playwright
```

Alternatif kolay stack:

```txt
Next.js
TypeScript
Supabase Auth
Supabase Postgres
Supabase Row Level Security
Stripe
Tailwind CSS
```

Bu brief içinde ana plan şu stack’e göre yazılmıştır:

```txt
Next.js + TypeScript + Prisma + PostgreSQL + Auth.js + Stripe + Resend
```

Not:

- İlk MVP local PostgreSQL veya Docker PostgreSQL ile çalışabilir.
- Deploy için Vercel + managed PostgreSQL düşünülebilir.
- Email gönderimi için önce fake email log sistemi yapılabilir, sonra Resend benzeri servis eklenebilir.
- SMS için ilk sürümde gerçek entegrasyon yapılmayacak; sadece reminder job mimarisi kurulacak.

---

## 5. Ana Roller

### 5.1 Platform Owner

Projeyi geliştiren kişi. Sistem içindeki tüm tenantları görebilecek super admin panel MVP’de zorunlu değildir.

### 5.2 Business Owner

İşletme hesabını oluşturan kişi.

Yapabilecekleri:

- İşletme profilini düzenleme
- Hizmet oluşturma
- Çalışan oluşturma
- Müsaitlik ayarlama
- Randevu görüntüleme
- Randevu iptal/onaylama
- Müşteri listesi görme
- Abonelik planını görme

### 5.3 Staff

İşletme çalışanı.

Yapabilecekleri:

- Kendi randevularını görme
- Kendi müsaitliklerini yönetme
- Randevu durumunu değiştirme

MVP’de staff login opsiyonel olabilir. İlk sürümde owner tüm staff kayıtlarını yönetebilir.

### 5.4 Customer

Public booking page üzerinden randevu alan kişi.

Yapabilecekleri:

- İşletme public sayfasını görüntüleme
- Hizmet seçme
- Tarih/saat seçme
- Randevu oluşturma
- Randevu onay ekranı görme

---

## 6. Ana Özellikler

### 6.1 Authentication

Kullanıcı kayıt/giriş yapabilmeli.

Gerekli sayfalar:

```txt
/register
/login
/logout
/dashboard
```

Gerekli özellikler:

- Email/password login
- Session yönetimi
- Protected dashboard routes
- Public booking routes ayrı olmalı
- Kullanıcı sadece kendi organization verisini görmeli

---

### 6.2 Multi-Tenant Organization Sistemi

Her işletme ayrı tenant/organization olarak tutulacak.

Örnek:

```txt
Organization A: Ekin Beauty
Organization B: Caner Tutoring
Organization C: Halil Barber
```

Her organization kendi verilerini görür:

- Services
- Staff
- Customers
- Appointments
- Availability
- Subscription

Kesin kural:

```txt
Bir organization başka organization’ın verisini göremez, düzenleyemez, silemez.
```

---

### 6.3 Business Profile

İşletme profilinde şunlar olacak:

- Business name
- Public slug
- Description
- Phone
- Email
- Address
- Timezone
- Logo URL, opsiyonel
- Booking page enabled/disabled

Public slug örneği:

```txt
/booking/ekin-beauty
/booking/caner-tutoring
```

---

### 6.4 Services

İşletme hizmet oluşturabilmeli.

Service alanları:

- Name
- Description
- Duration minutes
- Price
- Currency
- Is active

Örnek:

```txt
Haircut
30 minutes
350 TRY
```

---

### 6.5 Staff Management

İşletme çalışan ekleyebilmeli.

Staff alanları:

- Name
- Email
- Phone
- Role
- Is active
- Assigned services

MVP’de staff için ayrı login zorunlu değildir.

---

### 6.6 Availability Management

İşletme çalışanların haftalık müsaitlik saatlerini ayarlayabilmeli.

Örnek:

```txt
Monday: 09:00 - 18:00
Tuesday: 09:00 - 18:00
Wednesday: Closed
Thursday: 10:00 - 19:00
Friday: 09:00 - 17:00
Saturday: 10:00 - 15:00
Sunday: Closed
```

Backend slot üretirken şu verileri dikkate almalı:

- Staff availability
- Service duration
- Existing appointments
- Business timezone
- Cancelled appointments
- Buffer time, opsiyonel

---

### 6.7 Public Booking Page

Müşteri public linke girince işletmenin booking sayfasını görmeli.

Akış:

1. Business profile görüntülenir.
2. Hizmet seçilir.
3. Staff seçilir, opsiyonel.
4. Tarih seçilir.
5. Uygun saat slotları gösterilir.
6. Müşteri bilgileri girilir.
7. Randevu oluşturulur.
8. Confirmation screen gösterilir.

Customer alanları:

- Full name
- Email
- Phone
- Note, opsiyonel

---

### 6.8 Appointment Management

Dashboard’da randevular listelenmeli.

Appointment alanları:

- Organization
- Service
- Staff
- Customer
- Start time
- End time
- Status
- Notes
- CreatedAt
- UpdatedAt

Status seçenekleri:

```txt
Pending
Confirmed
Cancelled
Completed
No Show
```

Dashboard işlemleri:

- Randevu görüntüleme
- Status değiştirme
- Randevu iptal etme
- Tarihe göre filtreleme
- Staff’a göre filtreleme
- Service’e göre filtreleme

---

### 6.9 Reminder System

Sistem yaklaşan randevular için hatırlatma planlayabilmeli.

MVP’de iki aşama olacak:

#### Aşama 1: Fake Reminder Log

Gerçek email/SMS göndermeden reminder kayıtları oluşturulur.

Reminder alanları:

- Appointment ID
- Type: EMAIL / SMS
- ScheduledAt
- Status: PENDING / SENT / FAILED
- SentAt
- Error message

#### Aşama 2: Email Reminder

Resend veya benzeri email servisi ile gerçek email gönderimi eklenir.

MVP için SMS gerçek entegrasyon zorunlu değildir. SMS ileride yapılacak özellik olarak bırakılabilir.

---

### 6.10 Analytics Dashboard

Dashboard’da temel metrikler gösterilecek.

Metrikler:

- Today’s appointments
- This week’s appointments
- Monthly appointments
- Cancelled appointments
- Completed appointments
- No-show count
- Estimated monthly revenue
- Most booked service
- Busiest staff member

---

### 6.11 Subscription Billing

Stripe test mode ile abonelik mantığı kurulacak.

Planlar:

```txt
FREE
STARTER
PRO
```

Subscription alanları:

- Organization ID
- Stripe customer ID
- Stripe subscription ID
- Plan
- Status
- Current period end

Plan limitleri:

```txt
FREE:
- Max 1 staff
- Max 20 appointments per month

STARTER:
- Max 3 staff
- Max 300 appointments per month

PRO:
- Unlimited staff
- Unlimited appointments
```

Backend her kritik işlemde plan limitlerini kontrol etmeli.

Örnek:

```txt
Free plandaki organization 20. randevudan sonra yeni randevu alamaz.
```

MVP’de Stripe gerçek ödeme almak için değil, test mode ile subscription flow göstermek için kurulacak.

---

### 6.12 Admin Settings

İşletme ayarları:

- Business profile
- Booking page enabled/disabled
- Timezone
- Default reminder time
- Cancellation policy text
- Working days

---

### 6.13 Audit Logs

Backend’de önemli işlemler loglanmalı.

Loglanacak işlemler:

- Appointment created
- Appointment cancelled
- Appointment status changed
- Service created
- Staff created
- Subscription changed
- Reminder sent/failed

Audit log alanları:

- Organization ID
- Actor user ID
- Action
- Entity type
- Entity ID
- Metadata
- CreatedAt

---

## 7. MVP Kapsamı

### 7.1 MVP’de Yapılacaklar

- Auth
- Organization oluşturma
- Multi-tenant database schema
- Business profile
- Service CRUD
- Staff CRUD
- Availability CRUD
- Public booking page
- Slot generation
- Appointment creation
- Appointment dashboard
- Appointment status update
- Fake reminder log
- Email reminder altyapısına hazırlık
- Subscription plan modeli
- Stripe test checkout
- Stripe webhook handler
- Plan limit kontrolü
- Analytics dashboard
- Audit logs
- Basic tests
- README
- GitHub hazırlığı

### 7.2 MVP’de Yapılmayacaklar

- Native mobile app
- SMS gerçek entegrasyon
- WhatsApp entegrasyonu
- Google Calendar sync
- Full admin/superadmin panel
- Complex staff login
- Multi-location support
- Online payment for appointment deposits
- Marketplace
- AI chatbot
- Accounting integration

---

## 8. Beklenen Dosya Yapısı

```txt
randevo/
├── .claude/
│   └── agents/
│       ├── product-strategist.md
│       ├── backend-architect.md
│       ├── database-architect.md
│       ├── auth-security-agent.md
│       ├── api-builder.md
│       ├── booking-engine-agent.md
│       ├── billing-agent.md
│       ├── reminder-agent.md
│       ├── frontend-dashboard-agent.md
│       ├── public-booking-agent.md
│       ├── qa-tester.md
│       ├── devops-agent.md
│       └── docs-github-agent.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── organizations/
│   │   │   ├── services/
│   │   │   ├── staff/
│   │   │   ├── availability/
│   │   │   ├── appointments/
│   │   │   ├── booking/
│   │   │   ├── billing/
│   │   │   ├── reminders/
│   │   │   └── webhooks/
│   │   ├── dashboard/
│   │   ├── booking/
│   │   │   └── [slug]/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── booking/
│   │   ├── forms/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── tenant.ts
│   │   ├── rate-limit.ts
│   │   └── validators.ts
│   ├── services/
│   │   ├── appointment.service.ts
│   │   ├── availability.service.ts
│   │   ├── booking.service.ts
│   │   ├── billing.service.ts
│   │   ├── reminder.service.ts
│   │   └── audit.service.ts
│   ├── jobs/
│   │   └── reminder-worker.ts
│   ├── tests/
│   │   ├── booking-engine.test.ts
│   │   ├── appointment.service.test.ts
│   │   ├── plan-limits.test.ts
│   │   └── tenant-security.test.ts
│   └── types/
│       └── index.ts
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-contract.md
│   ├── billing-flow.md
│   └── deployment.md
├── README.md
├── package.json
├── docker-compose.yml
├── .env.example
├── next.config.ts
└── PROJECT_BRIEF.md
```

---

## 9. Database Model Taslağı

Prisma schema’da şu modeller yer almalı:

```txt
User
Organization
OrganizationMember
Service
Staff
StaffService
AvailabilityRule
Customer
Appointment
Reminder
Subscription
AuditLog
```

### 9.1 User

Alanlar:

- id
- name
- email
- passwordHash
- createdAt
- updatedAt

### 9.2 Organization

Alanlar:

- id
- name
- slug
- description
- phone
- email
- address
- timezone
- bookingEnabled
- createdAt
- updatedAt

### 9.3 OrganizationMember

Alanlar:

- id
- userId
- organizationId
- role: OWNER / ADMIN / STAFF
- createdAt

### 9.4 Service

Alanlar:

- id
- organizationId
- name
- description
- durationMinutes
- priceCents
- currency
- isActive
- createdAt
- updatedAt

### 9.5 Staff

Alanlar:

- id
- organizationId
- name
- email
- phone
- isActive
- createdAt
- updatedAt

### 9.6 AvailabilityRule

Alanlar:

- id
- organizationId
- staffId
- dayOfWeek
- startTime
- endTime
- isActive

### 9.7 Customer

Alanlar:

- id
- organizationId
- fullName
- email
- phone
- createdAt
- updatedAt

### 9.8 Appointment

Alanlar:

- id
- organizationId
- serviceId
- staffId
- customerId
- startTime
- endTime
- status
- notes
- createdAt
- updatedAt

### 9.9 Reminder

Alanlar:

- id
- organizationId
- appointmentId
- type
- scheduledAt
- status
- sentAt
- errorMessage
- createdAt

### 9.10 Subscription

Alanlar:

- id
- organizationId
- plan
- status
- stripeCustomerId
- stripeSubscriptionId
- currentPeriodEnd
- createdAt
- updatedAt

### 9.11 AuditLog

Alanlar:

- id
- organizationId
- actorUserId
- action
- entityType
- entityId
- metadata
- createdAt

---

## 10. Ana Claude Code Prompt’u

Claude Code’a verilecek ana prompt:

```txt
You are building a full-stack SaaS MVP called "Randevo".

Read PROJECT_BRIEF.md completely before editing code.

Use the custom subagents inside .claude/agents when appropriate.

Main goal:
Build a multi-tenant appointment booking and reminder SaaS for local businesses.

Core requirements:
1. Next.js App Router + TypeScript.
2. PostgreSQL + Prisma.
3. Authentication with protected dashboard routes.
4. Multi-tenant organization data isolation.
5. Service, staff, availability, customer, appointment models.
6. Public booking page by organization slug.
7. Slot generation based on availability and existing appointments.
8. Appointment dashboard and status updates.
9. Reminder log system and email reminder-ready architecture.
10. Subscription plan model and Stripe test checkout/webhook structure.
11. Plan limits for Free, Starter, and Pro.
12. Audit logs for important actions.
13. Tests for booking engine, plan limits, and tenant security.
14. Clean README and GitHub-ready documentation.

Important safety rules:
- Work only inside this project folder.
- Do not delete files outside the workspace.
- Do not use destructive terminal commands.
- Never commit real secrets or API keys.
- Create .env.example only.
- Use test mode for billing.
- Do not implement real SMS in MVP.
- Ask for review before major destructive changes.
- After each major phase, run build/tests where relevant and summarize changed files.
```

---

## 11. Agent Tanımları

Aşağıdaki agent dosyaları `.claude/agents/` klasörüne oluşturulmalıdır.

---

### 11.1 `product-strategist.md`

```md
---
name: product-strategist
description: Use this agent to define SaaS requirements, target customer, monetization model, MVP scope, user stories, and acceptance criteria.
tools: Read, Write, Edit
---

You are the Product Strategist Agent for Randevo.

Responsibilities:
- Read PROJECT_BRIEF.md.
- Turn the idea into clear SaaS requirements.
- Define target users and core workflows.
- Define Free, Starter, and Pro plan limits.
- Create docs/requirements.md.
- Keep MVP realistic.
- Prevent scope creep.
- Make sure SMS, mobile app, Google Calendar sync, marketplace, and AI chatbot stay out of MVP.

Output:
1. Product summary
2. Target customers
3. Monetization model
4. User stories
5. Acceptance criteria
6. Out-of-scope features
7. MVP risks
```

---

### 11.2 `backend-architect.md`

```md
---
name: backend-architect
description: Use this agent to design the full-stack backend architecture, service layer, route structure, tenant boundaries, and core backend flow.
tools: Read, Write, Edit, Bash
---

You are the Backend Architect Agent.

Responsibilities:
- Design backend architecture for Next.js App Router.
- Define API route groups.
- Define service layer structure.
- Define tenant isolation approach.
- Define error-handling pattern.
- Define validation strategy with Zod.
- Create docs/architecture.md.
- Avoid business logic directly inside UI components.
- Keep backend maintainable.

Output:
1. Backend architecture overview
2. API route structure
3. Service layer design
4. Tenant isolation rules
5. Error-handling rules
6. Validation rules
7. Notes for future agents
```

---

### 11.3 `database-architect.md`

```md
---
name: database-architect
description: Use this agent to design Prisma schema, relationships, indexes, seed data, and migration plan.
tools: Read, Write, Edit, Bash
---

You are the Database Architect Agent.

Responsibilities:
- Create prisma/schema.prisma.
- Model User, Organization, OrganizationMember, Service, Staff, AvailabilityRule, Customer, Appointment, Reminder, Subscription, AuditLog.
- Add relations and indexes.
- Add enums for roles, appointment status, reminder status, subscription plan.
- Create seed data for demo organization.
- Create docs/database-schema.md.
- Make sure every tenant-owned table includes organizationId.
- Use sensible cascading behavior.

Output:
1. Prisma schema
2. Relationship notes
3. Index notes
4. Seed data
5. Migration instructions
```

---

### 11.4 `auth-security-agent.md`

```md
---
name: auth-security-agent
description: Use this agent to implement authentication, protected routes, role checks, tenant isolation checks, password hashing, and security review.
tools: Read, Write, Edit, Bash
---

You are the Auth and Security Agent.

Responsibilities:
- Implement auth flow.
- Protect dashboard routes.
- Add tenant access helpers.
- Add role checks.
- Make sure users cannot access another organization’s data.
- Add password hashing if credentials auth is used.
- Create safe .env.example.
- Review API routes for authorization checks.
- Add tests for tenant isolation where possible.

Rules:
- Never commit real secrets.
- Never expose password hashes to the client.
- Never trust organizationId from the client without checking membership.
- Always resolve current organization from authenticated user context.
```

---

### 11.5 `api-builder.md`

```md
---
name: api-builder
description: Use this agent to implement backend API routes, request validation, service calls, error handling, and audit logging.
tools: Read, Write, Edit, Bash
---

You are the API Builder Agent.

Responsibilities:
- Implement API routes for organizations, services, staff, availability, customers, appointments, booking, billing, and reminders.
- Use Zod validation.
- Call service layer functions.
- Add audit logs for important actions.
- Return consistent JSON responses.
- Handle errors safely.
- Do not leak cross-tenant data.

Required route groups:
- /api/organizations
- /api/services
- /api/staff
- /api/availability
- /api/appointments
- /api/booking/[slug]
- /api/billing
- /api/reminders
- /api/webhooks/stripe
```

---

### 11.6 `booking-engine-agent.md`

```md
---
name: booking-engine-agent
description: Use this agent to implement appointment slot generation, conflict prevention, public booking flow, and booking service tests.
tools: Read, Write, Edit, Bash
---

You are the Booking Engine Agent.

Responsibilities:
- Implement slot generation.
- Use staff availability rules.
- Use service duration.
- Prevent overlapping appointments.
- Ignore cancelled appointments when checking conflicts.
- Create public booking APIs.
- Create tests for slot generation.
- Create tests for conflict prevention.

Rules:
- Never allow double booking for the same staff and time.
- Validate service belongs to organization.
- Validate staff belongs to organization.
- Validate booking page is enabled.
- Use timezone consistently.
```

---

### 11.7 `billing-agent.md`

```md
---
name: billing-agent
description: Use this agent to implement Stripe test billing, subscription models, plan limits, checkout session route, webhook handler, and billing documentation.
tools: Read, Write, Edit, Bash
---

You are the Billing Agent.

Responsibilities:
- Implement subscription plan model.
- Add plan limit checks.
- Create Stripe test checkout route.
- Create Stripe webhook route.
- Update subscription status from webhook events.
- Create docs/billing-flow.md.
- Add tests for plan limits.

Rules:
- Use Stripe test mode only.
- Never hardcode real Stripe secrets.
- Use .env.example placeholders.
- Webhook handler must verify webhook signature in production-ready design.
- Free plan limits must be enforced by backend.
```

---

### 11.8 `reminder-agent.md`

```md
---
name: reminder-agent
description: Use this agent to implement reminder records, reminder scheduling logic, fake reminder worker, and email-ready architecture.
tools: Read, Write, Edit, Bash
---

You are the Reminder Agent.

Responsibilities:
- Create reminder service.
- Create reminder records after appointment creation.
- Implement fake reminder worker.
- Mark reminders as SENT or FAILED.
- Add email provider abstraction.
- Prepare Resend integration but keep fake mode as default.
- Add tests for reminder scheduling.

Rules:
- Do not send real SMS in MVP.
- Do not require real email keys for local dev.
- Fake mode must work without external services.
```

---

### 11.9 `frontend-dashboard-agent.md`

```md
---
name: frontend-dashboard-agent
description: Use this agent to implement authenticated business dashboard UI for services, staff, availability, appointments, analytics, and billing.
tools: Read, Write, Edit, Bash
---

You are the Frontend Dashboard Agent.

Responsibilities:
- Build dashboard layout.
- Build services CRUD UI.
- Build staff CRUD UI.
- Build availability UI.
- Build appointment list and filters.
- Build appointment status update UI.
- Build analytics cards.
- Build billing page.
- Keep UI simple and responsive.
- Use server actions or API calls consistently.

Visual style:
- SaaS dashboard
- Clean sidebar
- Cards
- Tables
- Forms
- Responsive mobile layout
```

---

### 11.10 `public-booking-agent.md`

```md
---
name: public-booking-agent
description: Use this agent to implement public booking page, service/staff/time selection, customer form, booking confirmation, and UX validation.
tools: Read, Write, Edit, Bash
---

You are the Public Booking Agent.

Responsibilities:
- Build /booking/[slug] page.
- Show business profile.
- Show active services.
- Show staff options.
- Show available slots.
- Build customer information form.
- Submit appointment request.
- Show confirmation screen.
- Handle booking disabled state.
- Handle no slots available state.

Rules:
- Public user must not access dashboard data.
- Public API must expose only necessary booking data.
- Customer form must validate email/phone/basic required fields.
```

---

### 11.11 `qa-tester.md`

```md
---
name: qa-tester
description: Use this agent to write unit/integration/e2e tests, run build/test commands, inspect likely bugs, and produce QA reports.
tools: Read, Write, Edit, Bash
---

You are the QA Tester Agent.

Responsibilities:
- Add tests for booking engine.
- Add tests for appointment conflict prevention.
- Add tests for plan limits.
- Add tests for tenant access helpers.
- Add tests for reminder scheduling.
- Add basic Playwright flow if feasible.
- Run build and tests.
- Produce QA summary.

Minimum tests:
- Slot generation returns valid slots.
- Existing appointment blocks overlapping slot.
- Cancelled appointment does not block slot.
- Free plan appointment limit is enforced.
- Organization A cannot access Organization B service.
- Reminder record is created after appointment.
- Public booking disabled returns safe error.
```

---

### 11.12 `devops-agent.md`

```md
---
name: devops-agent
description: Use this agent to prepare environment variables, Docker Postgres, scripts, deployment notes, and production-readiness checklist.
tools: Read, Write, Edit, Bash
---

You are the DevOps Agent.

Responsibilities:
- Create docker-compose.yml for local Postgres.
- Create .env.example.
- Add useful package scripts.
- Write docs/deployment.md.
- Add production readiness checklist.
- Make sure secrets are not committed.
- Add basic logging notes.

Output:
1. Local setup instructions
2. Env variable list
3. Docker Postgres instructions
4. Deployment notes
5. Production checklist
```

---

### 11.13 `docs-github-agent.md`

```md
---
name: docs-github-agent
description: Use this agent to prepare README, architecture docs, API docs, screenshots checklist, GitHub description, and publishing steps.
tools: Read, Write, Edit, Bash
---

You are the Docs and GitHub Agent.

Responsibilities:
- Create professional README.md.
- Explain project features.
- Add installation steps.
- Add environment setup.
- Add database migration steps.
- Add seed command.
- Add screenshots section.
- Add architecture overview.
- Add API summary.
- Add monetization explanation.
- Add future improvements.
- Add license recommendation.

README must be GitHub portfolio friendly.
```

---

## 12. Proje Aşamaları

Claude Code veya Antigravity bu sırayı takip etmeli.

---

### Phase 0 — Güvenli Başlangıç

Amaç: Proje klasörünü ve temel kurulumu hazırlamak.

```bash
mkdir randevo
cd randevo
git init
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install
npm install prisma @prisma/client zod bcryptjs
npm install -D vitest tsx @types/bcryptjs
npm install stripe
npm install resend
npm run build
git add .
git commit -m "chore: initialize nextjs project"
```

Kabul kriteri:

- Next.js projesi kurulmuş olmalı.
- Build çalışmalı.
- Git repo oluşmalı.
- İlk commit atılmalı.

---

### Phase 1 — Product Requirements

Agent:

```txt
product-strategist
```

Yapılacaklar:

1. PROJECT_BRIEF.md oku.
2. SaaS gereksinimlerini yaz.
3. User story oluştur.
4. Plan limitlerini netleştir.
5. Out-of-scope listesini yaz.
6. `docs/requirements.md` oluştur.

Commit:

```bash
git add .
git commit -m "docs: define randevo product requirements"
```

---

### Phase 2 — Backend Architecture

Agent:

```txt
backend-architect
```

Yapılacaklar:

1. Backend route yapısını planla.
2. Service layer yapısını oluştur.
3. Tenant isolation kurallarını yaz.
4. Validation ve error handling standardı belirle.
5. `docs/architecture.md` oluştur.
6. Gerekli klasörleri oluştur.

Commit:

```bash
git add .
git commit -m "docs: add backend architecture"
```

---

### Phase 3 — Database Schema

Agent:

```txt
database-architect
```

Yapılacaklar:

1. Prisma başlat.
2. `schema.prisma` oluştur.
3. Tüm modelleri ekle.
4. Enumları ekle.
5. Indexleri ekle.
6. Seed dosyası oluştur.
7. Migration çalıştır.
8. `docs/database-schema.md` oluştur.

Komut örnekleri:

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma db seed
```

Commit:

```bash
git add .
git commit -m "feat: add prisma database schema"
```

---

### Phase 4 — Auth ve Tenant Security

Agent:

```txt
auth-security-agent
```

Yapılacaklar:

1. Auth kurulumu yap.
2. Register/login sayfaları oluştur.
3. Session helper yaz.
4. Protected dashboard route ekle.
5. Organization membership kontrol helperları oluştur.
6. Tenant access helper yaz.
7. Tenant güvenlik testi ekle.

Kabul kriteri:

- Login olmadan dashboard’a girilememeli.
- Kullanıcı sadece kendi organization verisini çekebilmeli.
- API route’larda authorization kontrolü olmalı.

Commit:

```bash
git add .
git commit -m "feat: add auth and tenant security"
```

---

### Phase 5 — Organization Onboarding

Agent:

```txt
api-builder
```

Yapılacaklar:

1. Kullanıcı register sonrası organization oluşturabilsin.
2. Business profile formu oluştur.
3. Public slug validation ekle.
4. Organization settings API oluştur.
5. Audit log ekle.

Kabul kriteri:

- Kullanıcı işletme oluşturabilmeli.
- Slug unique olmalı.
- Organization owner ilişkisi oluşmalı.

Commit:

```bash
git add .
git commit -m "feat: add organization onboarding"
```

---

### Phase 6 — Services CRUD

Agent:

```txt
api-builder
```

Yapılacaklar:

1. Service API route oluştur.
2. Service create/update/delete/list işlemleri ekle.
3. Zod validation ekle.
4. Dashboard service UI oluştur.
5. Tenant access kontrolü yap.
6. Audit log ekle.

Kabul kriteri:

- İşletme hizmet ekleyebilmeli.
- Hizmet düzenleyebilmeli.
- Hizmet pasif hale getirilebilmeli.
- Başka tenant verisi görünmemeli.

Commit:

```bash
git add .
git commit -m "feat: add service management"
```

---

### Phase 7 — Staff CRUD

Agent:

```txt
api-builder
```

Yapılacaklar:

1. Staff API route oluştur.
2. Staff create/update/delete/list işlemleri ekle.
3. Staff-service relation oluştur.
4. Dashboard staff UI oluştur.
5. Plan limit kontrolü ekle.
6. Audit log ekle.

Kabul kriteri:

- Staff eklenebilmeli.
- Free plan 1 staff limitini aşmamalı.
- Starter plan 3 staff limitini aşmamalı.
- Pro plan unlimited kabul edilmeli.

Commit:

```bash
git add .
git commit -m "feat: add staff management and plan limits"
```

---

### Phase 8 — Availability Management

Agent:

```txt
booking-engine-agent
```

Yapılacaklar:

1. AvailabilityRule API oluştur.
2. Staff haftalık müsaitlik ayarları oluştur.
3. Dashboard availability UI oluştur.
4. Time validation ekle.
5. Booking engine için availability service yaz.

Kabul kriteri:

- Staff için haftalık çalışma saatleri girilebilmeli.
- Kapalı gün desteklenmeli.
- Geçersiz saat aralığı kabul edilmemeli.

Commit:

```bash
git add .
git commit -m "feat: add staff availability management"
```

---

### Phase 9 — Booking Engine

Agent:

```txt
booking-engine-agent
```

Yapılacaklar:

1. Slot generation fonksiyonu yaz.
2. Service duration dikkate al.
3. Staff availability dikkate al.
4. Existing appointment çakışmalarını engelle.
5. Cancelled appointmentları çakışma dışında tut.
6. Testleri yaz.

Kabul kriteri:

- Uygun slotlar üretilebilmeli.
- Aynı staff aynı saate iki randevu alamamalı.
- Testler geçmeli.

Commit:

```bash
git add .
git commit -m "feat: implement booking slot engine"
```

---

### Phase 10 — Public Booking Page

Agent:

```txt
public-booking-agent
```

Yapılacaklar:

1. `/booking/[slug]` sayfasını oluştur.
2. Business profile göster.
3. Active service listesi göster.
4. Staff seçimi ekle.
5. Tarih seçimi ekle.
6. Available slotları göster.
7. Customer form oluştur.
8. Booking confirmation ekranı oluştur.

Kabul kriteri:

- Public customer randevu oluşturabilmeli.
- Booking disabled ise uygun mesaj gösterilmeli.
- No slots varsa uygun mesaj gösterilmeli.

Commit:

```bash
git add .
git commit -m "feat: add public booking flow"
```

---

### Phase 11 — Appointment Dashboard

Agent:

```txt
frontend-dashboard-agent
```

Yapılacaklar:

1. Appointment listesi oluştur.
2. Date/status/staff/service filtreleri ekle.
3. Appointment detail paneli oluştur.
4. Status update UI ekle.
5. Cancel/complete/no-show işlemleri ekle.
6. Audit log ekle.

Kabul kriteri:

- İşletme randevuları görebilmeli.
- Status güncelleyebilmeli.
- Başka tenant randevuları görünmemeli.

Commit:

```bash
git add .
git commit -m "feat: add appointment dashboard"
```

---

### Phase 12 — Reminder System

Agent:

```txt
reminder-agent
```

Yapılacaklar:

1. Appointment oluşunca reminder record oluştur.
2. Fake reminder worker yaz.
3. Pending reminderları işleyen service yaz.
4. SENT/FAILED durumlarını güncelle.
5. Email provider abstraction oluştur.
6. Local fake email log yapısı oluştur.
7. Test yaz.

Kabul kriteri:

- Randevu sonrası reminder oluşturulmalı.
- Fake worker reminder status güncellemeli.
- Gerçek email key olmadan local çalışmalı.

Commit:

```bash
git add .
git commit -m "feat: add reminder scheduling system"
```

---

### Phase 13 — Analytics Dashboard

Agent:

```txt
frontend-dashboard-agent
```

Yapılacaklar:

1. Analytics service yaz.
2. Dashboard kartları oluştur.
3. Tarih bazlı filtre ekle.
4. Most booked service hesapla.
5. Estimated revenue hesapla.
6. Busiest staff hesapla.

Kabul kriteri:

- Dashboard gerçek verilerle güncellenmeli.
- Boş data durumunda bozulmamalı.

Commit:

```bash
git add .
git commit -m "feat: add appointment analytics dashboard"
```

---

### Phase 14 — Billing and Subscription

Agent:

```txt
billing-agent
```

Yapılacaklar:

1. Subscription modelini kullan.
2. Plan limit helper yaz.
3. Billing page oluştur.
4. Stripe checkout route oluştur.
5. Stripe customer oluşturma logic’i yaz.
6. Stripe webhook route tasarla.
7. Webhook ile subscription status update et.
8. Billing flow dokümantasyonu yaz.
9. Plan limit testleri yaz.

Kabul kriteri:

- Free/Starter/Pro planları görünmeli.
- Test checkout flow oluşturulmalı.
- Webhook handler yapısı hazır olmalı.
- Plan limitleri backend’de enforce edilmeli.

Commit:

```bash
git add .
git commit -m "feat: add subscription billing foundation"
```

---

### Phase 15 — Audit Logs

Agent:

```txt
api-builder
```

Yapılacaklar:

1. Audit service’i tamamla.
2. Kritik işlemlere audit log ekle.
3. Dashboard’da basit audit log listesi göster.
4. Metadata güvenli formatta tutulmalı.

Kabul kriteri:

- Kritik işlemler loglanmalı.
- Tenant kendi loglarını görmeli.
- Başka tenant logları görünmemeli.

Commit:

```bash
git add .
git commit -m "feat: add audit logging"
```

---

### Phase 16 — QA Tests

Agent:

```txt
qa-tester
```

Yapılacaklar:

1. Booking engine testleri yaz.
2. Appointment conflict testleri yaz.
3. Tenant security testleri yaz.
4. Plan limit testleri yaz.
5. Reminder scheduling testleri yaz.
6. Build çalıştır.
7. Test çalıştır.
8. QA raporu oluştur.

Komutlar:

```bash
npm run build
npm test
```

Commit:

```bash
git add .
git commit -m "test: add core backend tests"
```

---

### Phase 17 — DevOps and Environment

Agent:

```txt
devops-agent
```

Yapılacaklar:

1. `.env.example` oluştur.
2. `docker-compose.yml` oluştur.
3. Package scripts düzenle.
4. Deployment dokümanı oluştur.
5. Production readiness checklist yaz.
6. Secret güvenliği kontrol et.

Commit:

```bash
git add .
git commit -m "chore: add devops setup and deployment docs"
```

---

### Phase 18 — UI Polish

Agent:

```txt
frontend-dashboard-agent
```

Yapılacaklar:

1. Dashboard layout temizle.
2. Sidebar/nav oluştur.
3. Public booking sayfasını güzelleştir.
4. Form hatalarını kullanıcı dostu yap.
5. Loading/empty/error state ekle.
6. Mobile responsive kontrol et.

Commit:

```bash
git add .
git commit -m "style: polish randevo interface"
```

---

### Phase 19 — README and GitHub

Agent:

```txt
docs-github-agent
```

Yapılacaklar:

1. README.md oluştur.
2. Kurulum adımlarını yaz.
3. Env setup yaz.
4. Database migration yaz.
5. Seed komutu yaz.
6. Demo user bilgisi yaz.
7. SaaS özelliklerini anlat.
8. Monetization modelini anlat.
9. Screenshot placeholder ekle.
10. Future improvements yaz.

README başlıkları:

```md
# Randevo

A full-stack appointment booking and reminder SaaS MVP for local businesses.

## Features

## Monetization Model

## Tech Stack

## Architecture

## Database Schema

## Getting Started

## Environment Variables

## Running Locally

## Testing

## Screenshots

## Future Improvements

## Author

## License
```

Commit:

```bash
git add .
git commit -m "docs: prepare randevo for GitHub"
```

---

## 13. API Route Taslağı

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### Organizations

```txt
GET    /api/organizations/current
POST   /api/organizations
PATCH  /api/organizations/current
```

### Services

```txt
GET    /api/services
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id
```

### Staff

```txt
GET    /api/staff
POST   /api/staff
PATCH  /api/staff/:id
DELETE /api/staff/:id
```

### Availability

```txt
GET    /api/availability
POST   /api/availability
PATCH  /api/availability/:id
DELETE /api/availability/:id
```

### Public Booking

```txt
GET  /api/booking/:slug/profile
GET  /api/booking/:slug/services
GET  /api/booking/:slug/slots
POST /api/booking/:slug/appointments
```

### Appointments

```txt
GET   /api/appointments
PATCH /api/appointments/:id/status
```

### Billing

```txt
GET  /api/billing/subscription
POST /api/billing/checkout
POST /api/webhooks/stripe
```

### Reminders

```txt
GET  /api/reminders
POST /api/reminders/process
```

---

## 14. Plan Limit Kuralları

Backend plan limitlerini client’a güvenmeden kontrol etmeli.

### Free

```txt
maxStaff = 1
maxAppointmentsPerMonth = 20
emailReminders = false
analytics = basic
```

### Starter

```txt
maxStaff = 3
maxAppointmentsPerMonth = 300
emailReminders = true
analytics = basic
```

### Pro

```txt
maxStaff = unlimited
maxAppointmentsPerMonth = unlimited
emailReminders = true
analytics = advanced
```

Limit kontrol fonksiyonları:

```ts
canCreateStaff(organizationId)
canCreateAppointment(organizationId)
canUseEmailReminders(organizationId)
getPlanLimits(plan)
```

---

## 15. Booking Engine Kuralları

Slot üretirken:

1. Organization booking enabled olmalı.
2. Service aktif olmalı.
3. Staff aktif olmalı.
4. Staff ilgili service’i verebilmeli.
5. Staff availability içinde olmalı.
6. Mevcut confirmed/pending appointment ile çakışmamalı.
7. Cancelled appointment slotu bloklamamalı.
8. Start time geçmişte olmamalı.
9. Appointment end time service duration’a göre hesaplanmalı.

---

## 16. Test Planı

Minimum testler:

```txt
Booking Engine:
- Availability içinden doğru slot üretir.
- Existing appointment çakışan slotu kaldırır.
- Cancelled appointment slotu bloklamaz.
- Geçmiş saate booking yapılmaz.

Tenant Security:
- User A, Organization A verisini görür.
- User A, Organization B verisini göremez.
- API route organizationId manipülasyonunu kabul etmez.

Plan Limits:
- Free plan 1 staff sonrası staff oluşturamaz.
- Free plan monthly appointment limit sonrası booking engeller.
- Pro plan limitlere takılmaz.

Reminder:
- Appointment sonrası reminder record oluşur.
- Fake worker pending reminderı sent yapar.
- Failed email durumunda status failed olur.

Billing:
- Checkout session route test mode ile session oluşturur.
- Webhook subscription status update eder.
```

---

## 17. Antigravity Kullanım Akışı

### 17.1 Workspace

1. Antigravity aç.
2. `randevo` klasörünü workspace olarak seç.
3. Güvenli ayarları seç:
   - Terminal commands: Request Review
   - Review policy: Request Review
   - Browser JS execution: Request Review
   - Terminal Sandbox: Açık

### 17.2 İlk Görev

Agent’a şu prompt’u ver:

```txt
Read PROJECT_BRIEF.md. Create the required .claude/agents files first. Then follow the project phases in order. Start with Phase 0 and stop after the first successful build so I can review.
```

### 17.3 Phase Phase İlerleme

Örnek:

```txt
Continue with Phase 9 from PROJECT_BRIEF.md. Use the booking-engine-agent. Implement only this phase, add tests, run build/test, and summarize changed files.
```

### 17.4 Browser ile Test Akışı

UI ve public booking tamamlanınca:

```txt
Open the local app in the browser and test:
1. Register a business owner.
2. Create organization profile.
3. Add a service.
4. Add staff.
5. Set weekly availability.
6. Open public booking link.
7. Select service and time slot.
8. Create a customer appointment.
9. Go back to dashboard.
10. Confirm appointment appears.
11. Change appointment status.
12. Check analytics cards.
13. Check reminder log.
14. Try another booking at the same time and confirm conflict is blocked.
Create screenshots and a QA artifact.
```

---

## 18. Claude Code Kullanım Akışı

Terminal:

```bash
cd randevo
claude
```

İlk prompt:

```txt
Read PROJECT_BRIEF.md carefully. Create the custom subagents in .claude/agents. Then start from Phase 0 and proceed phase by phase. After each phase, run build or tests where relevant and ask for review before continuing.
```

Agent çağırma örnekleri:

```txt
Use the database-architect agent to create Prisma schema, relations, indexes, and seed data.
```

```txt
Use the booking-engine-agent to implement slot generation, conflict prevention, and booking tests.
```

```txt
Use the billing-agent to implement Stripe test billing, plan limits, and billing-flow documentation.
```

```txt
Use the qa-tester agent to run core tests and create a QA report.
```

---

## 19. Güvenlik Kuralları

Agent’lar şu kurallara uymalı:

- Sadece proje klasörü içinde çalış.
- Başka repo veya sistem dosyalarına dokunma.
- Gerçek secret yazma.
- `.env` dosyasını commit’leme.
- Sadece `.env.example` commit’le.
- Stripe test mode kullan.
- Production ödeme alma iddiası koyma.
- Gerçek SMS gönderme.
- Kullanıcı şifrelerini düz metin saklama.
- API route’larda tenant kontrolünü atlama.
- Client’tan gelen organizationId’ye doğrudan güvenme.

Yasak komutlar:

```bash
rm -rf
del /s
rmdir /s
git reset --hard
git clean -fd
```

---

## 20. Definition of Done

Proje bitmiş sayılması için:

- Auth çalışıyor.
- Organization onboarding çalışıyor.
- Tenant data isolation çalışıyor.
- Services CRUD çalışıyor.
- Staff CRUD çalışıyor.
- Availability CRUD çalışıyor.
- Public booking page çalışıyor.
- Booking engine slot üretiyor.
- Double booking engelleniyor.
- Appointment dashboard çalışıyor.
- Reminder log sistemi çalışıyor.
- Subscription plan modeli var.
- Stripe test checkout/webhook yapısı var.
- Plan limitleri backend’de enforce ediliyor.
- Analytics dashboard çalışıyor.
- Audit logs çalışıyor.
- Build başarılı.
- Testler başarılı.
- README hazır.
- GitHub’a yüklenecek durumda.

Kontrol komutları:

```bash
npm run build
npm test
```

Beklenen sonuç:

```txt
No TypeScript errors.
No failing tests.
Production build generated successfully.
```

---

## 21. GitHub’a Yükleme

```bash
git status
git add .
git commit -m "chore: finalize randevo mvp"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

GitHub repo açıklaması:

```txt
A full-stack multi-tenant appointment booking and reminder SaaS MVP built with Next.js, Prisma, PostgreSQL, Auth, Stripe test billing, and TypeScript.
```

GitHub topics:

```txt
nextjs
typescript
prisma
postgresql
saas
appointment-booking
stripe
multi-tenant
scheduler
portfolio
```

---

## 22. Screenshot Checklist

README için şu ekran görüntülerini al:

- Landing page
- Register/login
- Organization onboarding
- Dashboard
- Services page
- Staff page
- Availability page
- Public booking page
- Slot selection
- Appointment confirmation
- Appointment dashboard
- Analytics cards
- Billing page
- Reminder logs
- Mobile public booking screen

---

## 23. Future Improvements

İlk MVP’den sonra eklenebilecek özellikler:

- Real SMS integration
- WhatsApp reminder integration
- Google Calendar sync
- Multi-location support
- Staff login
- Customer cancellation link
- Appointment deposit payments
- Coupon/discount system
- Email template editor
- Calendar drag/drop UI
- Admin super panel
- AI-powered no-show prediction
- Public review collection
- Custom domain support
- White-label plan

---

## 24. Son Kontrol Prompt’u

Proje bittiğinde Claude Code / Antigravity’ye şu prompt ver:

```txt
Review the entire Randevo project as if it will be published on GitHub and shown as a SaaS portfolio project.

Check:
1. Does npm run build pass?
2. Do tests pass?
3. Is tenant data isolated?
4. Are API routes protected correctly?
5. Does public booking work?
6. Does booking engine prevent double booking?
7. Are plan limits enforced on backend?
8. Does Stripe test billing structure look correct?
9. Are real secrets avoided?
10. Is README clear?
11. Are there unused files or unnecessary dependencies?
12. Is the UI understandable?
13. Is the project suitable as a monetizable SaaS MVP?

Fix small issues only. Do not add new major features.
Create a final summary.
```

---

## 25. Kısa Özet

Randevo basit bir deneme projesi değil; gerçek SaaS mantığı olan, backend tarafı güçlü bir MVP projesidir.

Öğreneceğin şeyler:

- Next.js full-stack mimari
- PostgreSQL + Prisma
- Multi-tenant SaaS data model
- Auth ve role-based access
- Tenant data isolation
- Service layer pattern
- Public booking flow
- Slot generation algorithm
- Appointment conflict prevention
- Reminder job architecture
- Stripe subscription billing
- Webhook mantığı
- Plan limit enforcement
- Audit logging
- Backend testleri
- GitHub portfolyo dokümantasyonu

Final hedef:

```txt
GitHub’da paylaşılabilecek, backend tarafı güçlü, para kazanma potansiyeli olan Randevo SaaS MVP.
```
