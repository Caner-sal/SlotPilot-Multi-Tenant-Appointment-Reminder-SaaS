# SlotPilot Post-MVP Expansion Plan — Claude Code / Antigravity Update Brief

> Bu dosya, ana `SlotPilot_AGENT_PROJECT_BRIEF.md` tamamlandıktan sonra uygulanacak gelişmiş özellikler için hazırlanmıştır.  
> Amaç: SlotPilot projesini backend tarafı güçlü, gelir modeli olan, daha production-ready bir SaaS ürününe dönüştürmek.  
> Bu dosya Claude Code veya Google Antigravity’ye verilecek ikinci aşama güncelleme planıdır.

---

## 1. Bu Dosyanın Amacı

Ana SlotPilot MVP bittikten sonra aşağıdaki özellikler sırasıyla eklenecek:

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

En önemli kural:

```txt
Her özellik ayrı phase olarak eklenecek.
Her phase sonunda migration, seed, typecheck, build, unit test, integration test ve mümkünse e2e test çalıştırılacak.
Proje bozulursa bir sonraki phase’e geçilmeyecek.
```

---

## 2. Ana Strateji

Bu expansion plan tek seferde uygulanmamalı.

En doğru çalışma şekli:

```txt
1. Küçük feature branch aç.
2. Sadece tek özelliği uygula.
3. Database migration gerekiyorsa ayrı ve kontrollü yap.
4. Seed data güncelle.
5. Backend testleri çalıştır.
6. Frontend build çalıştır.
7. Playwright ile ana kullanıcı akışını test et.
8. Manuel QA checklist tamamla.
9. Commit at.
10. Bir sonraki phase’e geç.
```

Önerilen branch isimleri:

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

## 3. Genel Güvenlik Kuralları

Agent’lar şu kurallara uymalı:

- Ana proje klasörü dışında dosya değiştirme.
- Gerçek API secret, token, private key veya webhook secret commit’leme.
- Sadece `.env.example` güncelle.
- Production ödeme alma iddiası koyma.
- Stripe önce test mode ile kullanılmalı.
- SMS/WhatsApp gerçek gönderimlerinde provider approval, fiyatlandırma ve ülke regülasyonları dikkate alınmalı.
- Google Calendar için OAuth token güvenliği sağlanmalı.
- AI chatbot müşteri verisini gereksiz yere üçüncü tarafa göndermemeli.
- Accounting integration tarafında finansal kayıtlar dikkatli tutulmalı.
- Her external integration önce adapter/interface arkasına alınmalı.
- Webhook route’ları signature verification olmadan production-ready sayılmamalı.
- Her migration sonrası Prisma generate ve test çalıştırılmalı.

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

Bu expansion plan için `.claude/agents/` içine aşağıdaki agent dosyaları eklenecek.

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

## 5. Agent Tanımları

### 5.1 `superadmin-agent.md`

```md
---
name: superadmin-agent
description: Use this agent to implement platform-level superadmin features, admin dashboard, tenant management, subscription overview, audit review, and safety controls.
tools: Read, Write, Edit, Bash
---

You are the Superadmin Agent for SlotPilot.

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
description: Use this agent to plan and implement a native mobile app using Expo/React Native connected to the SlotPilot API.
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

Her phase sonunda mümkün olduğunca şu komutlar çalıştırılmalı:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Eğer Playwright varsa:

```bash
npm run test:e2e
```

Eğer seed kontrolü gerekiyorsa:

```bash
npx prisma db seed
```

Eğer Stripe webhook test ediliyorsa:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Not:

- Stripe CLI komutları sadece local/test ortamı içindir.
- Gerçek secret kullanılmamalıdır.

---

## 7. Expansion Phase Sırası

```txt
Phase 20 — Regression Baseline
Phase 21 — Full Admin / Superadmin Panel
Phase 22 — Complex Staff Login
Phase 23 — Multi-Location Support
Phase 24 — Online Appointment Deposit Payments
Phase 25 — Real SMS Integration
Phase 26 — WhatsApp Integration
Phase 27 — Google Calendar Sync
Phase 28 — Marketplace
Phase 29 — Native Mobile App
Phase 30 — AI Chatbot
Phase 31 — Accounting Integration
Phase 32 — Node.js Version Integration
Phase 33 — Final Hardening and Release
```


---

## Phase 20 — Regression Baseline

Kullanılacak agent:

```txt
regression-qa-agent
```

Amaç:

Ana MVP bitmiş durumda mı, mevcut proje sağlam mı kontrol edilir.

Yapılacaklar:

1. Mevcut projeyi temiz branch üzerinde aç.
2. `.env.example` kontrol et.
3. Database migration durumunu kontrol et.
4. Seed data çalışıyor mu kontrol et.
5. Auth flow test et.
6. Public booking flow test et.
7. Dashboard flow test et.
8. Plan limit testlerini çalıştır.
9. Build çalıştır.
10. QA raporu oluştur.

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

- MVP sağlam olmalı.
- Bilinen bug listesi oluşturulmalı.
- Baseline commit atılmalı.

Commit:

```bash
git add .
git commit -m "test: establish post-mvp regression baseline"
```

---

## Phase 21 — Full Admin / Superadmin Panel

Kullanılacak agent:

```txt
superadmin-agent
```

Amaç:

Platform sahibinin tüm tenantları izleyebileceği güvenli admin panel eklenir.

Database değişiklikleri:

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

Yapılacaklar:

1. Superadmin role modeli ekle.
2. Superadmin seed user oluştur.
3. `/admin` route group oluştur.
4. Superadmin guard helper yaz.
5. Organization listesi oluştur.
6. Tenant usage metrikleri ekle:
   - appointment count
   - staff count
   - subscription plan
   - monthly usage
7. Subscription status overview ekle.
8. Audit log viewer ekle.
9. Organization suspend/activate alanı ekle.
10. Normal user erişimini engelle.
11. Testleri yaz.

Testler:

```txt
- Normal owner /admin sayfasına giremez.
- Superadmin /admin sayfasına girebilir.
- Superadmin organization list görebilir.
- Normal owner başka organization detayını göremez.
- Suspended organization public booking kapatılır.
```

Kabul kriteri:

- Admin panel sadece superadmin tarafından erişilebilir.
- Tenant data güvenliği bozulmaz.
- MVP booking flow hâlâ çalışır.

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

## Phase 22 — Complex Staff Login

Kullanılacak agent:

```txt
staff-portal-agent
```

Amaç:

Staff artık sadece owner tarafından yönetilen kayıt değil, sisteme giriş yapabilen sınırlı yetkili kullanıcı olur.

Database değişiklikleri:

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

Yapılacaklar:

1. Staff-user ilişkisini tasarla.
2. Staff invite sistemi ekle.
3. Owner staff invite oluşturabilsin.
4. Staff invite token ile hesap oluşturabilsin.
5. Staff dashboard route koruması ekle.
6. Staff sadece kendi appointments listesini görsün.
7. Staff kendi availability ayarını güncelleyebilsin.
8. Owner staff hesabını disable edebilsin.
9. Role/permission helperları yaz.
10. Testleri yaz.

Testler:

```txt
- Staff login olabilir.
- Staff sadece kendi randevularını görür.
- Staff başka staff randevusunu göremez.
- Disabled staff login olamaz.
- Owner staff invite oluşturabilir.
- Staff billing sayfasına erişemez.
```

Kabul kriteri:

- Staff portal çalışır.
- Tenant isolation bozulmaz.
- Owner dashboard hâlâ çalışır.

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

## Phase 23 — Multi-Location Support

Kullanılacak agent:

```txt
multi-location-agent
```

Amaç:

Bir işletmenin birden fazla şube/lokasyon yönetebilmesi sağlanır.

Database değişiklikleri:

```txt
Location model ekle.
Service.locationId opsiyonel veya service-location relation.
Staff.locationId veya StaffLocation relation.
AvailabilityRule.locationId ekle.
Appointment.locationId ekle.
```

Önemli migration kuralı:

```txt
Mevcut her organization için otomatik "Main Location" oluştur.
Eski services/staff/appointments bu default location’a bağlanır.
```

Yeni sayfalar:

```txt
/dashboard/locations
/booking/[slug]/locations
```

Yapılacaklar:

1. Location model ekle.
2. Migration script yaz.
3. Default location seed ekle.
4. Location CRUD API oluştur.
5. Services/staff/availability/appointments location-aware hale getir.
6. Public booking flow’da önce location seçtir.
7. Booking engine slot generation içinde location kontrolü yap.
8. Analytics location bazlı filtrelenebilsin.
9. Testleri yaz.

Testler:

```txt
- Existing organization migration sonrası default location alır.
- Location A staff slotları Location B’de görünmez.
- Appointment doğru location’a bağlanır.
- Location disabled ise public booking’de görünmez.
- Analytics location filter doğru çalışır.
```

Kabul kriteri:

- Single-location eski kullanım bozulmaz.
- Multi-location booking doğru çalışır.
- Double booking kontrolü location + staff bazında çalışır.

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

## Phase 24 — Online Appointment Deposit Payments

Kullanılacak agent:

```txt
deposit-payment-agent
```

Amaç:

Bazı hizmetler için müşteri randevu alırken kapora/deposit ödeyebilsin.

Database değişiklikleri:

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

Yapılacaklar:

1. Service deposit settings ekle.
2. Appointment payment status alanı ekle.
3. Public booking flow’da deposit gereken hizmetleri göster.
4. Appointment oluşturunca status `PENDING_PAYMENT` olabilir.
5. Stripe Checkout Session oluştur.
6. Checkout success/cancel URL ekle.
7. Stripe webhook ile payment success yakala.
8. Appointment paymentStatus `PAID` yap.
9. Deposit paid sonrası appointment confirm et.
10. Refund/cancellation policy dokümantasyonu yaz.
11. Testleri yaz.

Testler:

```txt
- Deposit gerekmeyen service normal booking yapar.
- Deposit gereken service checkout session oluşturur.
- Webhook success appointment paymentStatus PAID yapar.
- Failed/cancelled payment appointment confirm etmez.
- Webhook signature kontrol helperı test edilir.
```

Kabul kriteri:

- Stripe test mode ile çalışır.
- Gerçek secret commitlenmez.
- Appointment deposit flow booking’i bozmaz.

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

## Phase 25 — Real SMS Integration

Kullanılacak agent:

```txt
sms-integration-agent
```

Amaç:

Fake reminder sisteminden gerçek SMS provider entegrasyonuna geçiş yapılır. Local development hâlâ fake provider kullanır.

Database değişiklikleri:

```txt
Reminder.provider
Reminder.providerMessageId
Reminder.deliveryStatus
Customer.smsOptIn boolean
Organization.smsEnabled boolean
```

Yeni env değişkenleri:

```txt
SMS_PROVIDER=FAKE
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Yapılacaklar:

1. `SmsProvider` interface oluştur.
2. `FakeSmsProvider` oluştur.
3. `TwilioSmsProvider` oluştur.
4. Reminder service provider seçimini env üzerinden yapsın.
5. SMS template sistemi ekle.
6. Customer SMS opt-in alanı ekle.
7. Rate limit ve retry mantığı ekle.
8. SMS delivery log alanlarını ekle.
9. Testlerde provider mockla.
10. Dokümantasyon yaz.

Testler:

```txt
- Fake SMS provider localde çalışır.
- Twilio provider testte mocklanır.
- SMS opt-in yoksa SMS gönderilmez.
- Provider hata verirse reminder FAILED olur.
- Retry count doğru artar.
```

Kabul kriteri:

- Testlerde gerçek SMS gönderilmez.
- Production SMS açıkça env ile enable edilir.
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

## Phase 26 — WhatsApp Integration

Kullanılacak agent:

```txt
whatsapp-integration-agent
```

Amaç:

WhatsApp Business Cloud API uyumlu reminder/provider yapısı eklenir.

Database değişiklikleri:

```txt
Organization.whatsappEnabled
Organization.whatsappPhoneNumberId
Customer.whatsappOptIn
Reminder.channel = EMAIL | SMS | WHATSAPP
Reminder.templateName
Reminder.providerMessageId
```

Yeni env değişkenleri:

```txt
WHATSAPP_PROVIDER=FAKE
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

Yapılacaklar:

1. `WhatsAppProvider` interface oluştur.
2. `FakeWhatsAppProvider` oluştur.
3. Meta Cloud API provider adapter yaz.
4. Template message yapısını ekle.
5. WhatsApp opt-in alanı ekle.
6. Reminder channel olarak WhatsApp ekle.
7. Webhook verification route planla.
8. Delivery status webhook handler ekle.
9. Testleri mock provider ile yaz.
10. Dokümantasyona business verification/template approval notları ekle.

Testler:

```txt
- Fake WhatsApp provider çalışır.
- Opt-in yoksa mesaj gönderilmez.
- Template name eksikse mesaj gönderilmez.
- Webhook verify token doğruysa doğrulama başarılı olur.
- Delivery webhook reminder status update eder.
```

Kabul kriteri:

- Gerçek WhatsApp mesajı testte gönderilmez.
- Provider adapter izole çalışır.
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

## Phase 27 — Google Calendar Sync

Kullanılacak agent:

```txt
calendar-sync-agent
```

Amaç:

İşletme veya staff Google Calendar bağlayabilsin; randevular calendar event olarak sync edilsin.

Database değişiklikleri:

```txt
CalendarConnection
CalendarEventSync
Staff.calendarConnectionId opsiyonel
Appointment.calendarEventId opsiyonel
```

CalendarConnection alanları:

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

Yapılacaklar:

1. Google OAuth flow planla.
2. CalendarConnection modelini ekle.
3. Token storage stratejisi yaz.
4. Connect/disconnect UI ekle.
5. Appointment confirmed olunca calendar event oluştur.
6. Appointment cancelled olunca calendar event update/delete et.
7. Sync failure appointment creation’ı bozmasın.
8. Sync status göster.
9. Testlerde Google API mockla.
10. Dokümantasyon yaz.

Testler:

```txt
- Calendar bağlı değilse appointment normal oluşur.
- Calendar bağlıysa event insert çağrılır.
- Appointment cancel olunca event update/delete çağrılır.
- Token expired durumda refresh flow çağrılır.
- Google API hata verirse appointment silinmez, sync failed olur.
```

Kabul kriteri:

- Calendar sync opsiyoneldir.
- Tokenlar client’a sızmaz.
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

## Phase 28 — Marketplace

Kullanılacak agent:

```txt
marketplace-agent
```

Amaç:

SlotPilot içindeki işletmeler public marketplace üzerinde bulunabilir hale gelir.

Database değişiklikleri:

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

Yapılacaklar:

1. Marketplace visibility setting ekle.
2. Organization kategori ve şehir alanları ekle.
3. Marketplace search/filter backend route oluştur.
4. Public marketplace sayfası oluştur.
5. Business profile public sayfası oluştur.
6. Booking CTA ekle.
7. SEO metadata ekle.
8. Review-ready schema ekle ama fake review üretme.
9. Testleri yaz.

Testler:

```txt
- marketplaceEnabled false işletme görünmez.
- marketplaceEnabled true işletme görünür.
- Category filter doğru çalışır.
- City filter doğru çalışır.
- Private customer data görünmez.
```

Kabul kriteri:

- Marketplace public çalışır.
- Sadece opt-in işletmeler görünür.
- Booking flow marketplace üzerinden çalışır.

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

## Phase 29 — Native Mobile App

Kullanılacak agent:

```txt
mobile-app-agent
```

Amaç:

Owner/staff için basit mobil uygulama hazırlanır.

Önerilen yapı:

```txt
slotpilot/
├── apps/
│   ├── web/
│   └── mobile/
```

Eğer mevcut proje monorepo değilse, ilk aşamada şu yapı kullanılabilir:

```txt
slotpilot/
├── mobile/
```

Teknoloji:

```txt
Expo + React Native + TypeScript
```

İlk mobil kapsam:

- Login
- Dashboard summary
- Appointment list
- Appointment detail
- Status update
- Staff own appointment view
- Basic settings link

Yapılacaklar:

1. Mobile app klasörü oluştur.
2. Expo TypeScript app kur.
3. API client oluştur.
4. Auth token/session stratejisi belirle.
5. Login screen oluştur.
6. Dashboard summary screen oluştur.
7. Appointment list screen oluştur.
8. Appointment detail/status update screen oluştur.
9. Staff view ekle.
10. Mobile README yaz.
11. Mobile test/smoke test ekle.

Testler:

```txt
- Mobile TypeScript check geçer.
- API client mock testleri geçer.
- Login form validation çalışır.
- Appointment list render olur.
- Status update request doğru endpoint’e gider.
```

Kabul kriteri:

- Mobil app backend logic kopyalamaz.
- API contracts web ile uyumludur.
- App store publish bu phase’te yapılmaz.

Phase sonu test:

```bash
npm run typecheck
npm test
npm run build
```

Mobil klasörde:

```bash
npx expo-doctor
```

Commit:

```bash
git add .
git commit -m "feat: add expo mobile app foundation"
```

---

## Phase 30 — AI Chatbot

Kullanılacak agent:

```txt
ai-chatbot-agent
```

Amaç:

Public booking sayfasında işletme bilgileri ve randevu akışı hakkında yardımcı olan sınırlı kapsamlı AI chatbot eklenir.

Database değişiklikleri:

```txt
Organization.aiChatbotEnabled
Organization.faqText
Organization.chatbotTone
ChatConversation
ChatMessage
```

AI kapsamı:

- Hizmet bilgisi anlatma
- Fiyat bilgisi anlatma
- Çalışma saatleri hakkında yardımcı olma
- Booking formuna yönlendirme
- Uygun slot sorgusunda backend booking API’den gerçek veri alma

AI kapsam dışı:

- Özel müşteri verisi açıklama
- Başka müşteri randevularını gösterme
- Kesin sağlık/hukuk/finans tavsiyesi
- Kullanıcı onayı olmadan randevu oluşturma
- Sahte müsaitlik uydurma

Yapılacaklar:

1. AI chatbot settings ekle.
2. Business FAQ alanı ekle.
3. Public booking sayfasına chat widget ekle.
4. Server-side AI route oluştur.
5. AI prompt guardrails yaz.
6. Booking API tool-like helper tasarla.
7. Chat history modelini ekle.
8. Rate limit ekle.
9. Safety fallback mesajları ekle.
10. Testleri yaz.

Testler:

```txt
- Chatbot disabled ise widget görünmez.
- Chatbot service bilgisi cevaplayabilir.
- Chatbot private appointment data açıklamaz.
- Chatbot booking yapmadan önce onay ister.
- Rate limit aşılırsa güvenli hata döner.
```

Kabul kriteri:

- AI opsiyoneldir.
- Tenant private data korunur.
- Chatbot public booking’i bozmaz.

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

## Phase 31 — Accounting Integration

Kullanılacak agent:

```txt
accounting-agent
```

Amaç:

Ödeme ve randevu gelirlerini düzenli kayıt altına alan muhasebe/export altyapısı eklenir.

Database değişiklikleri:

```txt
RevenueLedger
InvoiceRecord
AccountingConnection
```

RevenueLedger alanları:

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

İlk kapsam:

- Revenue ledger oluşturma
- Paid deposit kaydı
- Completed appointment revenue kaydı
- CSV export
- Date range filter
- Accounting provider adapter interface
- Xero/QuickBooks placeholder

Yapılacaklar:

1. RevenueLedger modelini ekle.
2. Payment success olduğunda ledger record oluştur.
3. Appointment completed olduğunda revenue record oluştur.
4. Dashboard revenue report ekle.
5. CSV export endpoint ekle.
6. Accounting provider adapter interface ekle.
7. Xero/QuickBooks entegrasyonu için placeholder tasarla.
8. Dokümantasyona “tax/legal compliance değildir” notu ekle.
9. Testleri yaz.

Testler:

```txt
- Payment success ledger oluşturur.
- Duplicate webhook duplicate ledger oluşturmaz.
- Date range revenue doğru hesaplanır.
- CSV export doğru kolonları içerir.
- Organization A ledger Organization B’ye görünmez.
```

Kabul kriteri:

- Finansal kayıtlar testlidir.
- CSV export çalışır.
- Vergi/muhasebe uyumluluğu iddiası yapılmaz.

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

## Phase 32 — Node.js Version Integration

Kullanılacak agent:

```txt
node-upgrade-agent
```

Amaç:

Yeni kurulan Node.js sürümü projeye kontrollü şekilde entegre edilir. Her geliştiricide ve deploy ortamında aynı Node politikası kullanılır.

Önemli not:

```txt
Next.js için minimum Node.js sürümü güncel dokümana göre kontrol edilmeli.
Production için mümkünse LTS Node tercih edilmeli.
Current Node kullanılacaksa risk notu README’ye yazılmalı.
```

Yapılacaklar:

1. Local Node sürümünü tespit et:

```bash
node -v
npm -v
```

2. Proje için Node policy seç:

Önerilen production policy:

```txt
Node.js 24 LTS
```

Eğer kullanıcı yeni kurduğu Current sürümü kullanmak istiyorsa:

```txt
Node.js 26 Current
```

Ama Current için not:

```txt
Current sürüm yeni özellikleri test etmek için uygundur; production için LTS daha güvenlidir.
```

3. `.nvmrc` oluştur:

```txt
24
```

veya kullanıcının kurduğu sürüm:

```txt
26
```

4. `package.json` içine engines ekle:

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

Not: NPM sürümü localde `npm -v` ile doğrulanmalı.

6. Optional environment check script ekle:

```txt
scripts/check-node.js
```

7. Package scripts içine ekle:

```json
{
  "scripts": {
    "check:node": "node scripts/check-node.js"
  }
}
```

8. CI için Node version matrix ekle, eğer GitHub Actions varsa:

```yaml
strategy:
  matrix:
    node-version: [24]
```

9. Clean install yap:

```bash
npm install
```

Eğer `node_modules` temizlenecekse önce kullanıcı onayı alınmalı. Bu plan destructive temizleme komutunu otomatik çalıştırmaz.

10. Prisma ve build kontrolü:

```bash
npx prisma generate
npm run typecheck
npm run lint
npm test
npm run build
```

11. README’ye Node requirement ekle.

12. `.env.example` güncel mi kontrol et.

Testler:

```txt
- node -v beklenen aralığı karşılıyor.
- npm install sorunsuz çalışıyor.
- prisma generate çalışıyor.
- build geçiyor.
- testler geçiyor.
- Next.js dev server açılıyor.
```

Kabul kriteri:

- Node sürümü repoda açıkça belirtilmiş.
- Farklı geliştiriciler aynı Node politikasını görebiliyor.
- Build/test yeni Node ile geçiyor.
- README güncel.

Commit:

```bash
git add .
git commit -m "chore: pin node version and validate environment"
```

---

## Phase 33 — Final Hardening and Release

Kullanılacak agent:

```txt
release-manager-agent
```

Amaç:

Tüm expansion özellikleri sonrası proje release-ready hale getirilir.

Yapılacaklar:

1. Changelog oluştur.
2. Migration listesi çıkar.
3. Env variable listesi güncelle.
4. External provider setup dokümantasyonunu güncelle.
5. Feature flag listesini yaz.
6. Security review checklist oluştur.
7. Performance checklist oluştur.
8. Final regression test çalıştır.
9. README güncelle.
10. GitHub release notes hazırla.

Final test komutları:

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

- Build geçer.
- Testler geçer.
- Kritik user flow bozulmaz.
- README ve docs günceldir.
- Secret yoktur.
- Production checklist hazırdır.

Commit:

```bash
git add .
git commit -m "chore: finalize post-mvp expansion release"
```

Tag önerisi:

```bash
git tag v1.0.0-post-mvp
```

---

## 9. Güncellenmiş Environment Variables

`.env.example` içine şu yeni alanlar eklenecek:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/slotpilot

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

Bu expansion sonrası eklenmesi muhtemel modeller:

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

Her yeni model için dikkat:

```txt
Tenant-owned ise organizationId bulunmalı.
Indexler eklenmeli.
Sensitive token alanları encrypted tutulmalı.
Webhook idempotency için unique event id alanı düşünülmeli.
```

---

## 11. Global Regression Checklist

Her phase sonunda bu checklist doldurulmalı:

```txt
[ ] TypeScript errors yok
[ ] Lint errors yok
[ ] Unit tests geçiyor
[ ] Integration tests geçiyor
[ ] Build başarılı
[ ] Prisma schema valid
[ ] Migration status temiz
[ ] Seed çalışıyor
[ ] Auth flow bozulmadı
[ ] Tenant isolation bozulmadı
[ ] Public booking bozulmadı
[ ] Dashboard bozulmadı
[ ] Billing test mode çalışıyor
[ ] Reminder fake mode çalışıyor
[ ] External provider gerçek secret istemiyor
[ ] README/env docs güncel
[ ] Yeni feature için tests eklendi
[ ] Commit atıldı
```

---

## 12. Claude Code Ana Güncelleme Prompt’u

Bu dosyayı Claude Code’a verdikten sonra şu prompt kullanılabilir:

```txt
Read SLOTPILOT_POST_MVP_EXPANSION_PLAN.md carefully.

This is a post-MVP expansion plan for SlotPilot. Do not implement all features at once.

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

## 13. Antigravity Ana Güncelleme Prompt’u

Antigravity için:

```txt
Read SLOTPILOT_POST_MVP_EXPANSION_PLAN.md.

Create the new expansion agents first.

Then start with Phase 20 Regression Baseline.
Use browser automation to verify the current SlotPilot MVP flow:
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

## 15. En Önemli Teknik Kural

```txt
Client tarafı sadece UI’dır.
Para, tenant security, booking conflict, plan limit, staff permission, payment confirmation ve accounting kayıtları mutlaka backend tarafında doğrulanır.
```

---

## 16. Final Hedef

Bu güncelleme planı tamamlandığında SlotPilot şu seviyeye gelir:

```txt
Multi-tenant,
multi-location,
subscription-based,
deposit payment destekli,
SMS/WhatsApp/Calendar entegrasyonlu,
staff portalı olan,
marketplace sayfası bulunan,
mobil uygulama temeli atılmış,
AI destekli public booking assistant içeren,
accounting export yapabilen,
Node sürümü sabitlenmiş,
testli ve GitHub’da güçlü görünen bir SaaS MVP.
```
