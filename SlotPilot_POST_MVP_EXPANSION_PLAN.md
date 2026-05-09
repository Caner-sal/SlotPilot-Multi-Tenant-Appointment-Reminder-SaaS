# Randevo Post-MVP Expansion Plan â€” Claude Code / Antigravity Update Brief

> Bu dosya, ana `Randevo_AGENT_PROJECT_BRIEF.md` tamamlandÄ±ktan sonra uygulanacak geliÅŸmiÅŸ Ã¶zellikler iÃ§in hazÄ±rlanmÄ±ÅŸtÄ±r.  
> AmaÃ§: Randevo projesini backend tarafÄ± gÃ¼Ã§lÃ¼, gelir modeli olan, daha production-ready bir SaaS Ã¼rÃ¼nÃ¼ne dÃ¶nÃ¼ÅŸtÃ¼rmek.  
> Bu dosya Claude Code veya Google Antigravityâ€™ye verilecek ikinci aÅŸama gÃ¼ncelleme planÄ±dÄ±r.

---

## 1. Bu DosyanÄ±n AmacÄ±

Ana Randevo MVP bittikten sonra aÅŸaÄŸÄ±daki Ã¶zellikler sÄ±rasÄ±yla eklenecek:

1. Full admin / superadmin panel
2. Complex staff login
3. Multi-location support
4. Online payment for appointment deposits
5. Real SMS integration
6. WhatsApp integration
7. Google Calendar sync
8. Marketplace
9. Native mobile app
10. AI chatbot
11. Accounting integration
12. Node.js version integration and environment hardening

En Ã¶nemli kural:

```txt
Her Ã¶zellik ayrÄ± phase olarak eklenecek.
Her phase sonunda migration, seed, typecheck, build, unit test, integration test ve mÃ¼mkÃ¼nse e2e test Ã§alÄ±ÅŸtÄ±rÄ±lacak.
Proje bozulursa bir sonraki phaseâ€™e geÃ§ilmeyecek.
```

---

## 2. Ana Strateji

Bu expansion plan tek seferde uygulanmamalÄ±.

En doÄŸru Ã§alÄ±ÅŸma ÅŸekli:

```txt
1. KÃ¼Ã§Ã¼k feature branch aÃ§.
2. Sadece tek Ã¶zelliÄŸi uygula.
3. Database migration gerekiyorsa ayrÄ± ve kontrollÃ¼ yap.
4. Seed data gÃ¼ncelle.
5. Backend testleri Ã§alÄ±ÅŸtÄ±r.
6. Frontend build Ã§alÄ±ÅŸtÄ±r.
7. Playwright ile ana kullanÄ±cÄ± akÄ±ÅŸÄ±nÄ± test et.
8. Manuel QA checklist tamamla.
9. Commit at.
10. Bir sonraki phaseâ€™e geÃ§.
```

Ã–nerilen branch isimleri:

```txt
feature/superadmin-panel
feature/staff-auth
feature/multi-location
feature/appointment-deposits
feature/sms-reminders
feature/whatsapp-reminders
feature/google-calendar-sync
feature/marketplace
feature/mobile-app
feature/ai-chatbot
feature/accounting-integration
chore/node-version-upgrade
```

---

## 3. Genel GÃ¼venlik KurallarÄ±

Agentâ€™lar ÅŸu kurallara uymalÄ±:

- Ana proje klasÃ¶rÃ¼ dÄ±ÅŸÄ±nda dosya deÄŸiÅŸtirme.
- GerÃ§ek API secret, token, private key veya webhook secret commitâ€™leme.
- Sadece `.env.example` gÃ¼ncelle.
- Production Ã¶deme alma iddiasÄ± koyma.
- Stripe Ã¶nce test mode ile kullanÄ±lmalÄ±.
- SMS/WhatsApp gerÃ§ek gÃ¶nderimlerinde provider approval, fiyatlandÄ±rma ve Ã¼lke regÃ¼lasyonlarÄ± dikkate alÄ±nmalÄ±.
- Google Calendar iÃ§in OAuth token gÃ¼venliÄŸi saÄŸlanmalÄ±.
- AI chatbot mÃ¼ÅŸteri verisini gereksiz yere Ã¼Ã§Ã¼ncÃ¼ tarafa gÃ¶ndermemeli.
- Accounting integration tarafÄ±nda finansal kayÄ±tlar dikkatli tutulmalÄ±.
- Her external integration Ã¶nce adapter/interface arkasÄ±na alÄ±nmalÄ±.
- Webhook routeâ€™larÄ± signature verification olmadan production-ready sayÄ±lmamalÄ±.
- Her migration sonrasÄ± Prisma generate ve test Ã§alÄ±ÅŸtÄ±rÄ±lmalÄ±.

Yasak komutlar:

```bash
rm -rf
del /s
rmdir /s
git reset --hard
git clean -fd
```

---

## 4. Yeni Agent Listesi

Bu expansion plan iÃ§in `.claude/agents/` iÃ§ine aÅŸaÄŸÄ±daki agent dosyalarÄ± eklenecek.

```txt
superadmin-agent.md
staff-portal-agent.md
multi-location-agent.md
deposit-payment-agent.md
sms-integration-agent.md
whatsapp-integration-agent.md
calendar-sync-agent.md
marketplace-agent.md
mobile-app-agent.md
ai-chatbot-agent.md
accounting-agent.md
node-upgrade-agent.md
regression-qa-agent.md
release-manager-agent.md
```

---

## 5. Agent TanÄ±mlarÄ±

### 5.1 `superadmin-agent.md`

```md
---
name: superadmin-agent
description: Use this agent to implement platform-level superadmin features, admin dashboard, tenant management, subscription overview, audit review, and safety controls.
tools: Read, Write, Edit, Bash
---

You are the Superadmin Agent for Randevo.

Responsibilities:
- Add platform-level superadmin role.
- Add protected /admin routes.
- Implement organization list for platform owner.
- Show tenant subscription status.
- Show tenant appointment usage.
- Show audit logs.
- Add tenant suspension/activation.
- Add read-only impersonation planning, but do not implement unsafe impersonation without explicit approval.
- Make sure normal business owners cannot access superadmin routes.

Rules:
- Superadmin routes must be strongly protected.
- Do not expose customer private data unnecessarily.
- Never allow cross-tenant mutation from normal users.
- Add tests for admin access control.
```

### 5.2 `staff-portal-agent.md`

```md
---
name: staff-portal-agent
description: Use this agent to implement staff login, staff permissions, staff dashboard, staff availability, and staff appointment management.
tools: Read, Write, Edit, Bash
---

You are the Staff Portal Agent.

Responsibilities:
- Add staff user relationship.
- Allow staff login.
- Create /staff dashboard.
- Staff can view only their own appointments.
- Staff can update own availability.
- Staff can mark appointment completed/no-show if allowed.
- Owner can invite/disable staff.
- Add role-based access tests.

Rules:
- Staff must not access owner billing settings.
- Staff must not see other staff appointments unless permission allows.
- Staff route protection is required.
```

### 5.3 `multi-location-agent.md`

```md
---
name: multi-location-agent
description: Use this agent to implement multi-location business support, location-specific staff, services, availability, booking pages, and analytics.
tools: Read, Write, Edit, Bash
---

You are the Multi-Location Agent.

Responsibilities:
- Add Location model.
- Link services, staff, availability, and appointments to locations.
- Update public booking flow to select location first.
- Add location-specific booking slug support.
- Add location-level analytics.
- Add migration and seed updates.
- Add tests for location isolation.

Rules:
- Existing single-location businesses must keep working after migration.
- Every old organization should get a default location during migration/seed.
- Booking engine must check location when generating slots.
```

### 5.4 `deposit-payment-agent.md`

```md
---
name: deposit-payment-agent
description: Use this agent to implement appointment deposit payments using Stripe test mode, payment state, refund/cancel planning, and webhook handling.
tools: Read, Write, Edit, Bash
---

You are the Deposit Payment Agent.

Responsibilities:
- Add deposit settings per service.
- Add appointment payment status.
- Create Stripe Checkout Session for appointment deposit.
- Handle checkout.session.completed webhook.
- Link payment to appointment.
- Mark appointment as deposit_paid after successful payment.
- Add cancellation/refund planning documentation.
- Add tests for appointment creation with deposit required.

Rules:
- Use Stripe test mode.
- Never hardcode real Stripe secrets.
- Webhook signature verification must be included in design.
- Appointment should not be confirmed until required deposit is paid.
```

### 5.5 `sms-integration-agent.md`

```md
---
name: sms-integration-agent
description: Use this agent to implement real SMS reminder integration behind a provider abstraction with fake mode fallback.
tools: Read, Write, Edit, Bash
---

You are the SMS Integration Agent.

Responsibilities:
- Add SMS provider interface.
- Keep fake SMS provider as default for local development.
- Add Twilio-compatible provider implementation.
- Add SMS reminder templates.
- Add delivery status fields.
- Add retry rules.
- Add opt-out field planning.
- Add tests with mocked provider.

Rules:
- Do not send real SMS in tests.
- Use environment variables only.
- Add cost and rate-limit notes.
- Production mode must be explicitly enabled.
```

### 5.6 `whatsapp-integration-agent.md`

```md
---
name: whatsapp-integration-agent
description: Use this agent to implement WhatsApp Business reminder integration behind a provider abstraction with webhook-ready architecture.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Integration Agent.

Responsibilities:
- Add WhatsApp provider interface.
- Add Meta WhatsApp Cloud API compatible provider.
- Add template message support.
- Add WhatsApp reminder type.
- Add delivery status tracking.
- Add webhook route planning for message status updates.
- Add tests with mocked provider.

Rules:
- Do not send real WhatsApp messages in tests.
- Use provider abstraction.
- Use environment variables only.
- Add business verification/template approval notes.
```

### 5.7 `calendar-sync-agent.md`

```md
---
name: calendar-sync-agent
description: Use this agent to implement Google Calendar OAuth, calendar connection, event sync, conflict handling, and token refresh.
tools: Read, Write, Edit, Bash
---

You are the Calendar Sync Agent.

Responsibilities:
- Add CalendarConnection model.
- Add OAuth connection flow.
- Store encrypted access/refresh tokens or design secure token storage.
- Create calendar events after appointment confirmation.
- Update calendar events after appointment update/cancel.
- Add disconnect flow.
- Add sync status fields.
- Add mocked tests for calendar API calls.

Rules:
- Never expose tokens to client.
- Google Calendar sync must be optional.
- Failed sync should not break appointment creation.
```

### 5.8 `marketplace-agent.md`

```md
---
name: marketplace-agent
description: Use this agent to implement public marketplace listing, searchable businesses, categories, reviews-ready structure, and marketplace SEO pages.
tools: Read, Write, Edit, Bash
---

You are the Marketplace Agent.

Responsibilities:
- Add marketplace visibility settings.
- Add business category fields.
- Add public /marketplace page.
- Add business search/filter.
- Add category pages.
- Add location/city filter.
- Add basic SEO metadata.
- Add review-ready schema but do not implement fake reviews.
- Add tests for marketplace visibility.

Rules:
- Only show businesses that opted into marketplace.
- Do not expose private business/customer data.
- Marketplace pages must work without login.
```

### 5.9 `mobile-app-agent.md`

```md
---
name: mobile-app-agent
description: Use this agent to plan and implement a native mobile app using Expo/React Native connected to the Randevo API.
tools: Read, Write, Edit, Bash
---

You are the Mobile App Agent.

Responsibilities:
- Add apps/mobile workspace or separate mobile folder.
- Use Expo + React Native + TypeScript.
- Implement mobile auth.
- Implement owner dashboard summary.
- Implement appointment list.
- Implement appointment detail/status update.
- Implement staff view if staff login exists.
- Reuse API contracts from web app.
- Add mobile setup documentation.

Rules:
- Do not duplicate backend logic inside mobile app.
- Mobile app must call existing API routes.
- Keep first mobile version small.
- Do not publish to app stores in this phase.
```

### 5.10 `ai-chatbot-agent.md`

```md
---
name: ai-chatbot-agent
description: Use this agent to implement a safe AI assistant/chatbot for public booking support and business FAQ, with strict scope control.
tools: Read, Write, Edit, Bash
---

You are the AI Chatbot Agent.

Responsibilities:
- Add chatbot settings per organization.
- Add business FAQ knowledge fields.
- Add public booking assistant UI.
- Assistant can answer service, price, working hour, booking flow questions.
- Assistant can guide user to booking form.
- Assistant must not book appointment without explicit user confirmation.
- Add safety fallback messages.
- Add tests for scoped responses where feasible.

Rules:
- Do not expose private customer/appointment data.
- Do not provide medical/legal/financial advice.
- Do not invent availability; use booking API.
- Keep AI optional and disabled by default.
```

### 5.11 `accounting-agent.md`

```md
---
name: accounting-agent
description: Use this agent to implement accounting export and integration-ready revenue records without making legal/accounting claims.
tools: Read, Write, Edit, Bash
---

You are the Accounting Agent.

Responsibilities:
- Add revenue ledger model.
- Record paid deposits and completed appointment revenue.
- Add CSV export.
- Add invoice-ready data structure.
- Add accounting provider adapter interface.
- Add integration placeholder for providers like Xero/QuickBooks.
- Add tests for ledger calculations.

Rules:
- Do not claim official tax compliance.
- Do not auto-file taxes.
- Export should be clearly labeled as business records only.
- Financial calculations must be tested.
```

### 5.12 `node-upgrade-agent.md`

```md
---
name: node-upgrade-agent
description: Use this agent to pin and validate the project's Node.js version, package manager version, engines field, .nvmrc, CI matrix, and dependency compatibility.
tools: Read, Write, Edit, Bash
---

You are the Node Upgrade Agent.

Responsibilities:
- Detect current local Node version with node -v.
- Decide supported Node version policy.
- Add .nvmrc.
- Add package.json engines.
- Add packageManager field.
- Add preinstall or environment check script if needed.
- Run clean install.
- Run prisma generate.
- Run build/tests.
- Update docs/deployment.md and README Node version notes.

Rules:
- Prefer LTS for production stability.
- If using Current Node, document compatibility risk.
- Do not upgrade dependencies blindly.
- Commit lockfile changes only after tests pass.
```

### 5.13 `regression-qa-agent.md`

```md
---
name: regression-qa-agent
description: Use this agent after every expansion phase to run regression checks, tests, build, migration validation, and manual QA checklist.
tools: Read, Write, Edit, Bash
---

You are the Regression QA Agent.

Responsibilities:
- Run typecheck.
- Run lint.
- Run unit tests.
- Run integration tests.
- Run Playwright e2e tests if available.
- Run Prisma migration validation.
- Run seed validation.
- Test core booking flow manually or with browser automation.
- Create a phase QA report.

Required checks after each feature:
1. npm run typecheck
2. npm run lint
3. npm test
4. npm run build
5. npx prisma validate
6. npx prisma generate
7. npx prisma migrate status
8. Core booking e2e flow
```

### 5.14 `release-manager-agent.md`

```md
---
name: release-manager-agent
description: Use this agent to create changelogs, release notes, version tags, feature flags, rollback notes, and post-release checklists.
tools: Read, Write, Edit, Bash
---

You are the Release Manager Agent.

Responsibilities:
- Create changelog entries after each expansion phase.
- Add feature flag notes.
- Add rollback notes.
- Add migration notes.
- Add release checklist.
- Prepare Git tag suggestions.

Rules:
- Every major feature needs a release note.
- Database migrations need rollback notes.
- External integrations need env variable documentation.
```

---

## 6. Global Test Commands

Her phase sonunda mÃ¼mkÃ¼n olduÄŸunca ÅŸu komutlar Ã§alÄ±ÅŸtÄ±rÄ±lmalÄ±:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

EÄŸer Playwright varsa:

```bash
npm run test:e2e
```

EÄŸer seed kontrolÃ¼ gerekiyorsa:

```bash
npx prisma db seed
```

EÄŸer Stripe webhook test ediliyorsa:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Not:

- Stripe CLI komutlarÄ± sadece local/test ortamÄ± iÃ§indir.
- GerÃ§ek secret kullanÄ±lmamalÄ±dÄ±r.

---

## 7. Expansion Phase SÄ±rasÄ±

```txt
Phase 20 â€” Regression Baseline
Phase 21 â€” Full Admin / Superadmin Panel
Phase 22 â€” Complex Staff Login
Phase 23 â€” Multi-Location Support
Phase 24 â€” Online Appointment Deposit Payments
Phase 25 â€” Real SMS Integration
Phase 26 â€” WhatsApp Integration
Phase 27 â€” Google Calendar Sync
Phase 28 â€” Marketplace
Phase 29 â€” Native Mobile App
Phase 30 â€” AI Chatbot
Phase 31 â€” Accounting Integration
Phase 32 â€” Node.js Version Integration
Phase 33 â€” Final Hardening and Release
```


---

## Phase 20 â€” Regression Baseline

KullanÄ±lacak agent:

```txt
regression-qa-agent
```

AmaÃ§:

Ana MVP bitmiÅŸ durumda mÄ±, mevcut proje saÄŸlam mÄ± kontrol edilir.

YapÄ±lacaklar:

1. Mevcut projeyi temiz branch Ã¼zerinde aÃ§.
2. `.env.example` kontrol et.
3. Database migration durumunu kontrol et.
4. Seed data Ã§alÄ±ÅŸÄ±yor mu kontrol et.
5. Auth flow test et.
6. Public booking flow test et.
7. Dashboard flow test et.
8. Plan limit testlerini Ã§alÄ±ÅŸtÄ±r.
9. Build Ã§alÄ±ÅŸtÄ±r.
10. QA raporu oluÅŸtur.

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Manuel / e2e test:

```txt
1. Register business owner.
2. Create organization.
3. Add service.
4. Add staff.
5. Add availability.
6. Open public booking page.
7. Create appointment.
8. Confirm dashboard sees appointment.
9. Update status.
10. Confirm audit log exists.
```

Kabul kriteri:

- MVP saÄŸlam olmalÄ±.
- Bilinen bug listesi oluÅŸturulmalÄ±.
- Baseline commit atÄ±lmalÄ±.

Commit:

```bash
git add .
git commit -m "test: establish post-mvp regression baseline"
```

---

## Phase 21 â€” Full Admin / Superadmin Panel

KullanÄ±lacak agent:

```txt
superadmin-agent
```

AmaÃ§:

Platform sahibinin tÃ¼m tenantlarÄ± izleyebileceÄŸi gÃ¼venli admin panel eklenir.

Database deÄŸiÅŸiklikleri:

```txt
User.role veya PlatformRole enum eklenebilir:
- USER
- SUPERADMIN
```

Yeni sayfalar:

```txt
/admin
/admin/organizations
/admin/organizations/[id]
/admin/subscriptions
/admin/audit-logs
```

YapÄ±lacaklar:

1. Superadmin role modeli ekle.
2. Superadmin seed user oluÅŸtur.
3. `/admin` route group oluÅŸtur.
4. Superadmin guard helper yaz.
5. Organization listesi oluÅŸtur.
6. Tenant usage metrikleri ekle:
   - appointment count
   - staff count
   - subscription plan
   - monthly usage
7. Subscription status overview ekle.
8. Audit log viewer ekle.
9. Organization suspend/activate alanÄ± ekle.
10. Normal user eriÅŸimini engelle.
11. Testleri yaz.

Testler:

```txt
- Normal owner /admin sayfasÄ±na giremez.
- Superadmin /admin sayfasÄ±na girebilir.
- Superadmin organization list gÃ¶rebilir.
- Normal owner baÅŸka organization detayÄ±nÄ± gÃ¶remez.
- Suspended organization public booking kapatÄ±lÄ±r.
```

Kabul kriteri:

- Admin panel sadece superadmin tarafÄ±ndan eriÅŸilebilir.
- Tenant data gÃ¼venliÄŸi bozulmaz.
- MVP booking flow hÃ¢lÃ¢ Ã§alÄ±ÅŸÄ±r.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma migrate status
```

Commit:

```bash
git add .
git commit -m "feat: add superadmin panel"
```

---

## Phase 22 â€” Complex Staff Login

KullanÄ±lacak agent:

```txt
staff-portal-agent
```

AmaÃ§:

Staff artÄ±k sadece owner tarafÄ±ndan yÃ¶netilen kayÄ±t deÄŸil, sisteme giriÅŸ yapabilen sÄ±nÄ±rlÄ± yetkili kullanÄ±cÄ± olur.

Database deÄŸiÅŸiklikleri:

```txt
Staff.userId nullable relation
StaffInvite model
StaffPermission enum, opsiyonel
```

Yeni sayfalar:

```txt
/staff/login
/staff/dashboard
/staff/appointments
/staff/availability
```

YapÄ±lacaklar:

1. Staff-user iliÅŸkisini tasarla.
2. Staff invite sistemi ekle.
3. Owner staff invite oluÅŸturabilsin.
4. Staff invite token ile hesap oluÅŸturabilsin.
5. Staff dashboard route korumasÄ± ekle.
6. Staff sadece kendi appointments listesini gÃ¶rsÃ¼n.
7. Staff kendi availability ayarÄ±nÄ± gÃ¼ncelleyebilsin.
8. Owner staff hesabÄ±nÄ± disable edebilsin.
9. Role/permission helperlarÄ± yaz.
10. Testleri yaz.

Testler:

```txt
- Staff login olabilir.
- Staff sadece kendi randevularÄ±nÄ± gÃ¶rÃ¼r.
- Staff baÅŸka staff randevusunu gÃ¶remez.
- Disabled staff login olamaz.
- Owner staff invite oluÅŸturabilir.
- Staff billing sayfasÄ±na eriÅŸemez.
```

Kabul kriteri:

- Staff portal Ã§alÄ±ÅŸÄ±r.
- Tenant isolation bozulmaz.
- Owner dashboard hÃ¢lÃ¢ Ã§alÄ±ÅŸÄ±r.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add staff login and staff portal"
```

---

## Phase 23 â€” Multi-Location Support

KullanÄ±lacak agent:

```txt
multi-location-agent
```

AmaÃ§:

Bir iÅŸletmenin birden fazla ÅŸube/lokasyon yÃ¶netebilmesi saÄŸlanÄ±r.

Database deÄŸiÅŸiklikleri:

```txt
Location model ekle.
Service.locationId opsiyonel veya service-location relation.
Staff.locationId veya StaffLocation relation.
AvailabilityRule.locationId ekle.
Appointment.locationId ekle.
```

Ã–nemli migration kuralÄ±:

```txt
Mevcut her organization iÃ§in otomatik "Main Location" oluÅŸtur.
Eski services/staff/appointments bu default locationâ€™a baÄŸlanÄ±r.
```

Yeni sayfalar:

```txt
/dashboard/locations
/booking/[slug]/locations
```

YapÄ±lacaklar:

1. Location model ekle.
2. Migration script yaz.
3. Default location seed ekle.
4. Location CRUD API oluÅŸtur.
5. Services/staff/availability/appointments location-aware hale getir.
6. Public booking flowâ€™da Ã¶nce location seÃ§tir.
7. Booking engine slot generation iÃ§inde location kontrolÃ¼ yap.
8. Analytics location bazlÄ± filtrelenebilsin.
9. Testleri yaz.

Testler:

```txt
- Existing organization migration sonrasÄ± default location alÄ±r.
- Location A staff slotlarÄ± Location Bâ€™de gÃ¶rÃ¼nmez.
- Appointment doÄŸru locationâ€™a baÄŸlanÄ±r.
- Location disabled ise public bookingâ€™de gÃ¶rÃ¼nmez.
- Analytics location filter doÄŸru Ã§alÄ±ÅŸÄ±r.
```

Kabul kriteri:

- Single-location eski kullanÄ±m bozulmaz.
- Multi-location booking doÄŸru Ã§alÄ±ÅŸÄ±r.
- Double booking kontrolÃ¼ location + staff bazÄ±nda Ã§alÄ±ÅŸÄ±r.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Commit:

```bash
git add .
git commit -m "feat: add multi-location support"
```

---

## Phase 24 â€” Online Appointment Deposit Payments

KullanÄ±lacak agent:

```txt
deposit-payment-agent
```

AmaÃ§:

BazÄ± hizmetler iÃ§in mÃ¼ÅŸteri randevu alÄ±rken kapora/deposit Ã¶deyebilsin.

Database deÄŸiÅŸiklikleri:

```txt
Service.depositRequired boolean
Service.depositAmountCents int
Appointment.paymentStatus enum
Appointment.depositPaymentIntentId veya checkoutSessionId
Payment model
```

Payment status:

```txt
NOT_REQUIRED
PENDING
PAID
FAILED
REFUNDED
```

YapÄ±lacaklar:

1. Service deposit settings ekle.
2. Appointment payment status alanÄ± ekle.
3. Public booking flowâ€™da deposit gereken hizmetleri gÃ¶ster.
4. Appointment oluÅŸturunca status `PENDING_PAYMENT` olabilir.
5. Stripe Checkout Session oluÅŸtur.
6. Checkout success/cancel URL ekle.
7. Stripe webhook ile payment success yakala.
8. Appointment paymentStatus `PAID` yap.
9. Deposit paid sonrasÄ± appointment confirm et.
10. Refund/cancellation policy dokÃ¼mantasyonu yaz.
11. Testleri yaz.

Testler:

```txt
- Deposit gerekmeyen service normal booking yapar.
- Deposit gereken service checkout session oluÅŸturur.
- Webhook success appointment paymentStatus PAID yapar.
- Failed/cancelled payment appointment confirm etmez.
- Webhook signature kontrol helperÄ± test edilir.
```

Kabul kriteri:

- Stripe test mode ile Ã§alÄ±ÅŸÄ±r.
- GerÃ§ek secret commitlenmez.
- Appointment deposit flow bookingâ€™i bozmaz.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add appointment deposit payments"
```

---

## Phase 25 â€” Real SMS Integration

KullanÄ±lacak agent:

```txt
sms-integration-agent
```

AmaÃ§:

Fake reminder sisteminden gerÃ§ek SMS provider entegrasyonuna geÃ§iÅŸ yapÄ±lÄ±r. Local development hÃ¢lÃ¢ fake provider kullanÄ±r.

Database deÄŸiÅŸiklikleri:

```txt
Reminder.provider
Reminder.providerMessageId
Reminder.deliveryStatus
Customer.smsOptIn boolean
Organization.smsEnabled boolean
```

Yeni env deÄŸiÅŸkenleri:

```txt
SMS_PROVIDER=FAKE
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

YapÄ±lacaklar:

1. `SmsProvider` interface oluÅŸtur.
2. `FakeSmsProvider` oluÅŸtur.
3. `TwilioSmsProvider` oluÅŸtur.
4. Reminder service provider seÃ§imini env Ã¼zerinden yapsÄ±n.
5. SMS template sistemi ekle.
6. Customer SMS opt-in alanÄ± ekle.
7. Rate limit ve retry mantÄ±ÄŸÄ± ekle.
8. SMS delivery log alanlarÄ±nÄ± ekle.
9. Testlerde provider mockla.
10. DokÃ¼mantasyon yaz.

Testler:

```txt
- Fake SMS provider localde Ã§alÄ±ÅŸÄ±r.
- Twilio provider testte mocklanÄ±r.
- SMS opt-in yoksa SMS gÃ¶nderilmez.
- Provider hata verirse reminder FAILED olur.
- Retry count doÄŸru artar.
```

Kabul kriteri:

- Testlerde gerÃ§ek SMS gÃ¶nderilmez.
- Production SMS aÃ§Ä±kÃ§a env ile enable edilir.
- Reminder sistemi bozulmaz.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add sms reminder provider integration"
```

---

## Phase 26 â€” WhatsApp Integration

KullanÄ±lacak agent:

```txt
whatsapp-integration-agent
```

AmaÃ§:

WhatsApp Business Cloud API uyumlu reminder/provider yapÄ±sÄ± eklenir.

Database deÄŸiÅŸiklikleri:

```txt
Organization.whatsappEnabled
Organization.whatsappPhoneNumberId
Customer.whatsappOptIn
Reminder.channel = EMAIL | SMS | WHATSAPP
Reminder.templateName
Reminder.providerMessageId
```

Yeni env deÄŸiÅŸkenleri:

```txt
WHATSAPP_PROVIDER=FAKE
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

YapÄ±lacaklar:

1. `WhatsAppProvider` interface oluÅŸtur.
2. `FakeWhatsAppProvider` oluÅŸtur.
3. Meta Cloud API provider adapter yaz.
4. Template message yapÄ±sÄ±nÄ± ekle.
5. WhatsApp opt-in alanÄ± ekle.
6. Reminder channel olarak WhatsApp ekle.
7. Webhook verification route planla.
8. Delivery status webhook handler ekle.
9. Testleri mock provider ile yaz.
10. DokÃ¼mantasyona business verification/template approval notlarÄ± ekle.

Testler:

```txt
- Fake WhatsApp provider Ã§alÄ±ÅŸÄ±r.
- Opt-in yoksa mesaj gÃ¶nderilmez.
- Template name eksikse mesaj gÃ¶nderilmez.
- Webhook verify token doÄŸruysa doÄŸrulama baÅŸarÄ±lÄ± olur.
- Delivery webhook reminder status update eder.
```

Kabul kriteri:

- GerÃ§ek WhatsApp mesajÄ± testte gÃ¶nderilmez.
- Provider adapter izole Ã§alÄ±ÅŸÄ±r.
- Reminder sistemi email/sms/whatsapp channel destekler.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add whatsapp reminder integration"
```

---

## Phase 27 â€” Google Calendar Sync

KullanÄ±lacak agent:

```txt
calendar-sync-agent
```

AmaÃ§:

Ä°ÅŸletme veya staff Google Calendar baÄŸlayabilsin; randevular calendar event olarak sync edilsin.

Database deÄŸiÅŸiklikleri:

```txt
CalendarConnection
CalendarEventSync
Staff.calendarConnectionId opsiyonel
Appointment.calendarEventId opsiyonel
```

CalendarConnection alanlarÄ±:

```txt
id
organizationId
staffId
provider
accessTokenEncrypted
refreshTokenEncrypted
expiresAt
calendarId
isActive
createdAt
updatedAt
```

YapÄ±lacaklar:

1. Google OAuth flow planla.
2. CalendarConnection modelini ekle.
3. Token storage stratejisi yaz.
4. Connect/disconnect UI ekle.
5. Appointment confirmed olunca calendar event oluÅŸtur.
6. Appointment cancelled olunca calendar event update/delete et.
7. Sync failure appointment creationâ€™Ä± bozmasÄ±n.
8. Sync status gÃ¶ster.
9. Testlerde Google API mockla.
10. DokÃ¼mantasyon yaz.

Testler:

```txt
- Calendar baÄŸlÄ± deÄŸilse appointment normal oluÅŸur.
- Calendar baÄŸlÄ±ysa event insert Ã§aÄŸrÄ±lÄ±r.
- Appointment cancel olunca event update/delete Ã§aÄŸrÄ±lÄ±r.
- Token expired durumda refresh flow Ã§aÄŸrÄ±lÄ±r.
- Google API hata verirse appointment silinmez, sync failed olur.
```

Kabul kriteri:

- Calendar sync opsiyoneldir.
- Tokenlar clientâ€™a sÄ±zmaz.
- Booking flow bozulmaz.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add google calendar sync"
```


---

## Phase 28 â€” Marketplace

KullanÄ±lacak agent:

```txt
marketplace-agent
```

AmaÃ§:

Randevo iÃ§indeki iÅŸletmeler public marketplace Ã¼zerinde bulunabilir hale gelir.

Database deÄŸiÅŸiklikleri:

```txt
Organization.marketplaceEnabled
Organization.category
Organization.city
Organization.coverImageUrl
Organization.ratingAverage nullable
Organization.reviewCount int
```

Yeni sayfalar:

```txt
/marketplace
/marketplace/[category]
/marketplace/business/[slug]
```

YapÄ±lacaklar:

1. Marketplace visibility setting ekle.
2. Organization kategori ve ÅŸehir alanlarÄ± ekle.
3. Marketplace search/filter backend route oluÅŸtur.
4. Public marketplace sayfasÄ± oluÅŸtur.
5. Business profile public sayfasÄ± oluÅŸtur.
6. Booking CTA ekle.
7. SEO metadata ekle.
8. Review-ready schema ekle ama fake review Ã¼retme.
9. Testleri yaz.

Testler:

```txt
- marketplaceEnabled false iÅŸletme gÃ¶rÃ¼nmez.
- marketplaceEnabled true iÅŸletme gÃ¶rÃ¼nÃ¼r.
- Category filter doÄŸru Ã§alÄ±ÅŸÄ±r.
- City filter doÄŸru Ã§alÄ±ÅŸÄ±r.
- Private customer data gÃ¶rÃ¼nmez.
```

Kabul kriteri:

- Marketplace public Ã§alÄ±ÅŸÄ±r.
- Sadece opt-in iÅŸletmeler gÃ¶rÃ¼nÃ¼r.
- Booking flow marketplace Ã¼zerinden Ã§alÄ±ÅŸÄ±r.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add public marketplace"
```

---

## Phase 29 â€” Native Mobile App

KullanÄ±lacak agent:

```txt
mobile-app-agent
```

AmaÃ§:

Owner/staff iÃ§in basit mobil uygulama hazÄ±rlanÄ±r.

Ã–nerilen yapÄ±:

```txt
randevo/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/
â”‚   â””â”€â”€ mobile/
```

EÄŸer mevcut proje monorepo deÄŸilse, ilk aÅŸamada ÅŸu yapÄ± kullanÄ±labilir:

```txt
randevo/
â”œâ”€â”€ mobile/
```

Teknoloji:

```txt
Expo + React Native + TypeScript
```

Ä°lk mobil kapsam:

- Login
- Dashboard summary
- Appointment list
- Appointment detail
- Status update
- Staff own appointment view
- Basic settings link

YapÄ±lacaklar:

1. Mobile app klasÃ¶rÃ¼ oluÅŸtur.
2. Expo TypeScript app kur.
3. API client oluÅŸtur.
4. Auth token/session stratejisi belirle.
5. Login screen oluÅŸtur.
6. Dashboard summary screen oluÅŸtur.
7. Appointment list screen oluÅŸtur.
8. Appointment detail/status update screen oluÅŸtur.
9. Staff view ekle.
10. Mobile README yaz.
11. Mobile test/smoke test ekle.

Testler:

```txt
- Mobile TypeScript check geÃ§er.
- API client mock testleri geÃ§er.
- Login form validation Ã§alÄ±ÅŸÄ±r.
- Appointment list render olur.
- Status update request doÄŸru endpointâ€™e gider.
```

Kabul kriteri:

- Mobil app backend logic kopyalamaz.
- API contracts web ile uyumludur.
- App store publish bu phaseâ€™te yapÄ±lmaz.

Phase sonu test:

```bash
npm run typecheck
npm test
npm run build
```

Mobil klasÃ¶rde:

```bash
npx expo-doctor
```

Commit:

```bash
git add .
git commit -m "feat: add expo mobile app foundation"
```

---

## Phase 30 â€” AI Chatbot

KullanÄ±lacak agent:

```txt
ai-chatbot-agent
```

AmaÃ§:

Public booking sayfasÄ±nda iÅŸletme bilgileri ve randevu akÄ±ÅŸÄ± hakkÄ±nda yardÄ±mcÄ± olan sÄ±nÄ±rlÄ± kapsamlÄ± AI chatbot eklenir.

Database deÄŸiÅŸiklikleri:

```txt
Organization.aiChatbotEnabled
Organization.faqText
Organization.chatbotTone
ChatConversation
ChatMessage
```

AI kapsamÄ±:

- Hizmet bilgisi anlatma
- Fiyat bilgisi anlatma
- Ã‡alÄ±ÅŸma saatleri hakkÄ±nda yardÄ±mcÄ± olma
- Booking formuna yÃ¶nlendirme
- Uygun slot sorgusunda backend booking APIâ€™den gerÃ§ek veri alma

AI kapsam dÄ±ÅŸÄ±:

- Ã–zel mÃ¼ÅŸteri verisi aÃ§Ä±klama
- BaÅŸka mÃ¼ÅŸteri randevularÄ±nÄ± gÃ¶sterme
- Kesin saÄŸlÄ±k/hukuk/finans tavsiyesi
- KullanÄ±cÄ± onayÄ± olmadan randevu oluÅŸturma
- Sahte mÃ¼saitlik uydurma

YapÄ±lacaklar:

1. AI chatbot settings ekle.
2. Business FAQ alanÄ± ekle.
3. Public booking sayfasÄ±na chat widget ekle.
4. Server-side AI route oluÅŸtur.
5. AI prompt guardrails yaz.
6. Booking API tool-like helper tasarla.
7. Chat history modelini ekle.
8. Rate limit ekle.
9. Safety fallback mesajlarÄ± ekle.
10. Testleri yaz.

Testler:

```txt
- Chatbot disabled ise widget gÃ¶rÃ¼nmez.
- Chatbot service bilgisi cevaplayabilir.
- Chatbot private appointment data aÃ§Ä±klamaz.
- Chatbot booking yapmadan Ã¶nce onay ister.
- Rate limit aÅŸÄ±lÄ±rsa gÃ¼venli hata dÃ¶ner.
```

Kabul kriteri:

- AI opsiyoneldir.
- Tenant private data korunur.
- Chatbot public bookingâ€™i bozmaz.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add scoped ai booking assistant"
```

---

## Phase 31 â€” Accounting Integration

KullanÄ±lacak agent:

```txt
accounting-agent
```

AmaÃ§:

Ã–deme ve randevu gelirlerini dÃ¼zenli kayÄ±t altÄ±na alan muhasebe/export altyapÄ±sÄ± eklenir.

Database deÄŸiÅŸiklikleri:

```txt
RevenueLedger
InvoiceRecord
AccountingConnection
```

RevenueLedger alanlarÄ±:

```txt
id
organizationId
appointmentId
paymentId
type
amountCents
currency
status
recordedAt
metadata
```

Ä°lk kapsam:

- Revenue ledger oluÅŸturma
- Paid deposit kaydÄ±
- Completed appointment revenue kaydÄ±
- CSV export
- Date range filter
- Accounting provider adapter interface
- Xero/QuickBooks placeholder

YapÄ±lacaklar:

1. RevenueLedger modelini ekle.
2. Payment success olduÄŸunda ledger record oluÅŸtur.
3. Appointment completed olduÄŸunda revenue record oluÅŸtur.
4. Dashboard revenue report ekle.
5. CSV export endpoint ekle.
6. Accounting provider adapter interface ekle.
7. Xero/QuickBooks entegrasyonu iÃ§in placeholder tasarla.
8. DokÃ¼mantasyona â€œtax/legal compliance deÄŸildirâ€ notu ekle.
9. Testleri yaz.

Testler:

```txt
- Payment success ledger oluÅŸturur.
- Duplicate webhook duplicate ledger oluÅŸturmaz.
- Date range revenue doÄŸru hesaplanÄ±r.
- CSV export doÄŸru kolonlarÄ± iÃ§erir.
- Organization A ledger Organization Bâ€™ye gÃ¶rÃ¼nmez.
```

Kabul kriteri:

- Finansal kayÄ±tlar testlidir.
- CSV export Ã§alÄ±ÅŸÄ±r.
- Vergi/muhasebe uyumluluÄŸu iddiasÄ± yapÄ±lmaz.

Phase sonu test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add accounting export foundation"
```

---

## Phase 32 â€” Node.js Version Integration

KullanÄ±lacak agent:

```txt
node-upgrade-agent
```

AmaÃ§:

Yeni kurulan Node.js sÃ¼rÃ¼mÃ¼ projeye kontrollÃ¼ ÅŸekilde entegre edilir. Her geliÅŸtiricide ve deploy ortamÄ±nda aynÄ± Node politikasÄ± kullanÄ±lÄ±r.

Ã–nemli not:

```txt
Next.js iÃ§in minimum Node.js sÃ¼rÃ¼mÃ¼ gÃ¼ncel dokÃ¼mana gÃ¶re kontrol edilmeli.
Production iÃ§in mÃ¼mkÃ¼nse LTS Node tercih edilmeli.
Current Node kullanÄ±lacaksa risk notu READMEâ€™ye yazÄ±lmalÄ±.
```

YapÄ±lacaklar:

1. Local Node sÃ¼rÃ¼mÃ¼nÃ¼ tespit et:

```bash
node -v
npm -v
```

2. Proje iÃ§in Node policy seÃ§:

Ã–nerilen production policy:

```txt
Node.js 24 LTS
```

EÄŸer kullanÄ±cÄ± yeni kurduÄŸu Current sÃ¼rÃ¼mÃ¼ kullanmak istiyorsa:

```txt
Node.js 26 Current
```

Ama Current iÃ§in not:

```txt
Current sÃ¼rÃ¼m yeni Ã¶zellikleri test etmek iÃ§in uygundur; production iÃ§in LTS daha gÃ¼venlidir.
```

3. `.nvmrc` oluÅŸtur:

```txt
24
```

veya kullanÄ±cÄ±nÄ±n kurduÄŸu sÃ¼rÃ¼m:

```txt
26
```

4. `package.json` iÃ§ine engines ekle:

```json
{
  "engines": {
    "node": ">=24 <27",
    "npm": ">=10"
  }
}
```

5. Package manager sabitle:

```json
{
  "packageManager": "npm@11.0.0"
}
```

Not: NPM sÃ¼rÃ¼mÃ¼ localde `npm -v` ile doÄŸrulanmalÄ±.

6. Optional environment check script ekle:

```txt
scripts/check-node.js
```

7. Package scripts iÃ§ine ekle:

```json
{
  "scripts": {
    "check:node": "node scripts/check-node.js"
  }
}
```

8. CI iÃ§in Node version matrix ekle, eÄŸer GitHub Actions varsa:

```yaml
strategy:
  matrix:
    node-version: [24]
```

9. Clean install yap:

```bash
npm install
```

EÄŸer `node_modules` temizlenecekse Ã¶nce kullanÄ±cÄ± onayÄ± alÄ±nmalÄ±. Bu plan destructive temizleme komutunu otomatik Ã§alÄ±ÅŸtÄ±rmaz.

10. Prisma ve build kontrolÃ¼:

```bash
npx prisma generate
npm run typecheck
npm run lint
npm test
npm run build
```

11. READMEâ€™ye Node requirement ekle.

12. `.env.example` gÃ¼ncel mi kontrol et.

Testler:

```txt
- node -v beklenen aralÄ±ÄŸÄ± karÅŸÄ±lÄ±yor.
- npm install sorunsuz Ã§alÄ±ÅŸÄ±yor.
- prisma generate Ã§alÄ±ÅŸÄ±yor.
- build geÃ§iyor.
- testler geÃ§iyor.
- Next.js dev server aÃ§Ä±lÄ±yor.
```

Kabul kriteri:

- Node sÃ¼rÃ¼mÃ¼ repoda aÃ§Ä±kÃ§a belirtilmiÅŸ.
- FarklÄ± geliÅŸtiriciler aynÄ± Node politikasÄ±nÄ± gÃ¶rebiliyor.
- Build/test yeni Node ile geÃ§iyor.
- README gÃ¼ncel.

Commit:

```bash
git add .
git commit -m "chore: pin node version and validate environment"
```

---

## Phase 33 â€” Final Hardening and Release

KullanÄ±lacak agent:

```txt
release-manager-agent
```

AmaÃ§:

TÃ¼m expansion Ã¶zellikleri sonrasÄ± proje release-ready hale getirilir.

YapÄ±lacaklar:

1. Changelog oluÅŸtur.
2. Migration listesi Ã§Ä±kar.
3. Env variable listesi gÃ¼ncelle.
4. External provider setup dokÃ¼mantasyonunu gÃ¼ncelle.
5. Feature flag listesini yaz.
6. Security review checklist oluÅŸtur.
7. Performance checklist oluÅŸtur.
8. Final regression test Ã§alÄ±ÅŸtÄ±r.
9. README gÃ¼ncelle.
10. GitHub release notes hazÄ±rla.

Final test komutlarÄ±:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

E2E testler:

```txt
1. Owner register/login
2. Organization create
3. Multi-location create
4. Service create with deposit
5. Staff invite/login
6. Availability create
7. Public booking create
8. Deposit checkout test flow
9. Reminder fake/send flow
10. Calendar sync mocked flow
11. Marketplace listing
12. Admin panel check
13. Accounting CSV export
14. Mobile smoke test
15. AI chatbot disabled/enabled test
```

Kabul kriteri:

- Build geÃ§er.
- Testler geÃ§er.
- Kritik user flow bozulmaz.
- README ve docs gÃ¼nceldir.
- Secret yoktur.
- Production checklist hazÄ±rdÄ±r.

Commit:

```bash
git add .
git commit -m "chore: finalize post-mvp expansion release"
```

Tag Ã¶nerisi:

```bash
git tag v1.0.0-post-mvp
```

---

## 9. GÃ¼ncellenmiÅŸ Environment Variables

`.env.example` iÃ§ine ÅŸu yeni alanlar eklenecek:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/randevo

# Auth
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# SMS
SMS_PROVIDER=FAKE
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp
WHATSAPP_PROVIDER=FAKE
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# Email
EMAIL_PROVIDER=FAKE
RESEND_API_KEY=

# AI
AI_PROVIDER=DISABLED
OPENAI_API_KEY=

# Accounting
ACCOUNTING_PROVIDER=NONE
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
```

---

## 10. Updated Database Models Summary

Bu expansion sonrasÄ± eklenmesi muhtemel modeller:

```txt
PlatformRole
StaffInvite
Location
Payment
CalendarConnection
CalendarEventSync
MarketplaceProfile
ChatConversation
ChatMessage
RevenueLedger
InvoiceRecord
AccountingConnection
```

Her yeni model iÃ§in dikkat:

```txt
Tenant-owned ise organizationId bulunmalÄ±.
Indexler eklenmeli.
Sensitive token alanlarÄ± encrypted tutulmalÄ±.
Webhook idempotency iÃ§in unique event id alanÄ± dÃ¼ÅŸÃ¼nÃ¼lmeli.
```

---

## 11. Global Regression Checklist

Her phase sonunda bu checklist doldurulmalÄ±:

```txt
[ ] TypeScript errors yok
[ ] Lint errors yok
[ ] Unit tests geÃ§iyor
[ ] Integration tests geÃ§iyor
[ ] Build baÅŸarÄ±lÄ±
[ ] Prisma schema valid
[ ] Migration status temiz
[ ] Seed Ã§alÄ±ÅŸÄ±yor
[ ] Auth flow bozulmadÄ±
[ ] Tenant isolation bozulmadÄ±
[ ] Public booking bozulmadÄ±
[ ] Dashboard bozulmadÄ±
[ ] Billing test mode Ã§alÄ±ÅŸÄ±yor
[ ] Reminder fake mode Ã§alÄ±ÅŸÄ±yor
[ ] External provider gerÃ§ek secret istemiyor
[ ] README/env docs gÃ¼ncel
[ ] Yeni feature iÃ§in tests eklendi
[ ] Commit atÄ±ldÄ±
```

---

## 12. Claude Code Ana GÃ¼ncelleme Promptâ€™u

Bu dosyayÄ± Claude Codeâ€™a verdikten sonra ÅŸu prompt kullanÄ±labilir:

```txt
Read RANDEVO_POST_MVP_EXPANSION_PLAN.md carefully.

This is a post-MVP expansion plan for Randevo. Do not implement all features at once.

Start with Phase 20 only:
- Run regression baseline checks.
- Create missing expansion agents under .claude/agents.
- Do not change product behavior yet.
- Produce a QA baseline report.

After Phase 20, stop and wait for review.

Important:
- Work only inside this project folder.
- Never commit secrets.
- Use fake providers by default for SMS, WhatsApp, Email, and AI.
- Use Stripe test mode only.
- Keep every feature behind safe backend validation.
- After every phase, run tests/build and summarize changed files.
```

---

## 13. Antigravity Ana GÃ¼ncelleme Promptâ€™u

Antigravity iÃ§in:

```txt
Read RANDEVO_POST_MVP_EXPANSION_PLAN.md.

Create the new expansion agents first.

Then start with Phase 20 Regression Baseline.
Use browser automation to verify the current Randevo MVP flow:
1. Register/login.
2. Create organization.
3. Add service.
4. Add staff.
5. Add availability.
6. Create public booking.
7. Confirm appointment appears in dashboard.
8. Update appointment status.
9. Check audit log.

Do not start Phase 21 until baseline passes.
Create an artifact with screenshots and QA notes.
```

---

## 14. Feature-by-Feature Risk Level

```txt
Superadmin Panel: Medium risk
Staff Login: High risk
Multi-Location: Very high risk
Deposit Payments: High risk
SMS Integration: Medium-high risk
WhatsApp Integration: High risk
Google Calendar Sync: High risk
Marketplace: Medium risk
Native Mobile App: Medium-high risk
AI Chatbot: High risk
Accounting Integration: High risk
Node Version Integration: Medium risk
Final Hardening: Medium risk
```

En riskli alanlar:

```txt
1. Multi-location migration
2. Payment deposits
3. Staff role permissions
4. Google Calendar token security
5. Accounting ledger correctness
6. AI privacy boundaries
```

---

## 15. En Ã–nemli Teknik Kural

```txt
Client tarafÄ± sadece UIâ€™dÄ±r.
Para, tenant security, booking conflict, plan limit, staff permission, payment confirmation ve accounting kayÄ±tlarÄ± mutlaka backend tarafÄ±nda doÄŸrulanÄ±r.
```

---

## 16. Final Hedef

Bu gÃ¼ncelleme planÄ± tamamlandÄ±ÄŸÄ±nda Randevo ÅŸu seviyeye gelir:

```txt
Multi-tenant,
multi-location,
subscription-based,
deposit payment destekli,
SMS/WhatsApp/Calendar entegrasyonlu,
staff portalÄ± olan,
marketplace sayfasÄ± bulunan,
mobil uygulama temeli atÄ±lmÄ±ÅŸ,
AI destekli public booking assistant iÃ§eren,
accounting export yapabilen,
Node sÃ¼rÃ¼mÃ¼ sabitlenmiÅŸ,
testli ve GitHubâ€™da gÃ¼Ã§lÃ¼ gÃ¶rÃ¼nen bir SaaS MVP.
```

