# Randevo — Eksik Özellikler, Production Readiness ve Agent Yol Haritası

> Bu dosya, `https://github.com/Caner-sal/Randevo.git` reposunun mevcut README, package.json, CI, Prisma schema, docs ve mobile klasörü üzerinden çıkarılmış üretime hazırlık planıdır.  
> Amaç: Randevo’yu “çalışan güçlü MVP” seviyesinden “daha güvenilir, testli, production’a yaklaşan SaaS ürün” seviyesine taşımak.  
> Bu plan hem **Codex** hem de **Claude Code** ile phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Repo İnceleme Özeti

Repo adı:

```txt
Caner-sal/Randevo
```

README’ye göre proje, Türkiye’deki küçük işletmeler için çok kiracılı randevu SaaS platformudur. README’de şu özellikler açıkça listelenmiş durumda:

```txt
- Multi-tenant mimari
- Public booking page
- Slot generation
- Double booking prevention
- Appointment dashboard
- Analytics
- Staff management
- Availability management
- Subscription billing
- Plan limit enforcement
- SMS / WhatsApp reminder fake provider altyapısı
- WhatsApp auto booking link reply
- Google Calendar sync
- Marketplace
- AI booking assistant
- Revenue ledger
- Multi-location support
- Staff portal
- Deposit payments
- Superadmin panel
- KVKK altyapısı
```

Teknik stack README’de şu şekilde görünüyor:

```txt
- Next.js 15 App Router
- TypeScript
- Prisma 6
- SQLite local development
- PostgreSQL production hedefi
- NextAuth v5
- Tailwind CSS v4
- Zod
- Stripe test mode
- Resend/fake email
- Vitest
```

Repo içinde dikkat çeken güçlü taraflar:

```txt
- package.json içinde test, build, prisma, node check, secret check ve skill validation scriptleri var.
- Prisma schema geniş: Organization, Service, Staff, Appointment, Location, Reminder, Subscription, Payment, CalendarConnection, ConsentLog, WhatsAppAutoReply modelleri mevcut.
- docs klasörü oldukça dolu: architecture, api-contract, database-schema, deployment, MCP, QA, Türkiye ürün stratejisi, WhatsApp auto-link dokümanları var.
- mobile klasörü mevcut ve Expo mobile app foundation içeriyor.
- GitHub Actions CI mevcut.
```

Dikkat çeken riskler:

```txt
- CI içinde bazı kritik adımlar hata verse bile `|| echo skipped` ile geçiliyor olabilir.
- src/i18n içinde sadece tr.ts görülüyor; global i18n planları repo seviyesinde tam uygulanmamış olabilir.
- Payment tarafında Stripe model ağırlığı ile iyzico/PayTR/Param env planları arasında mimari ayrım netleştirilmeli.
- .env.example ham görüntüde encoding/mojibake bozulmaları taşıyor gibi görünüyor; dosya UTF-8 olarak temizlenmeli.
- Mobile app README future work kısmında push notification, React Navigation, offline support, staff-only mode ve calendar view hâlâ eksik olarak duruyor.
- CHANGELOG çok kısa; gerçek release geçmişini taşımıyor.
```

---

## 2. Olmazsa Olmaz Eksikler

Aşağıdaki başlıklar production’a yaklaşmadan önce mutlaka ele alınmalı.

---

### 2.1 CI Güvenilirliği

Mevcut CI’da şu tarz kalıplar varsa çok risklidir:

```bash
npx --no-install vitest run || echo "vitest skipped"
npx --no-install next build || echo "next build skipped"
```

Bu kalıp şuna yol açabilir:

```txt
Test fail olur ama CI yeşil görünür.
Build fail olur ama PR merge edilebilir.
Production’a bozuk kod gidebilir.
```

Olmazsa olmaz karar:

```txt
CI fail olan test/build durumunda kesinlikle fail etmeli.
```

---

### 2.2 Gerçek Çok Dilli i18n

`src/i18n/tr.ts` tek başına yeterli değil.

Eksik olması muhtemel alanlar:

```txt
- messages/*.json yapısı
- supportedLocales config
- dil + bayrak seçici
- locale persistence
- i18n missing key checker
- RTL desteği
- mobile i18n sync
- hreflang ve sitemap locale desteği
```

Olmazsa olmaz karar:

```txt
Tek dosyalı Türkçe yapı yerine production-ready i18n altyapısı kurulmalı.
```

---

### 2.3 Ödeme Platformu Birleştirme

Repo env yapısında Stripe, iyzico, PayTR, Param ve manuel banka havalesi izleri var. Prisma Payment modeli ise Stripe odaklı kalmış olabilir.

Olmazsa olmaz karar:

```txt
PaymentProvider abstraction kurulmalı.
Appointment deposit, SaaS subscription, manual transfer ve webhook reconciliation ayrı ama ortak state machine ile yönetilmeli.
```

---

### 2.4 PostgreSQL Production Hazırlığı

Schema local development için SQLite kullanıyor. README production için PostgreSQL hedefliyor.

Olmazsa olmaz karar:

```txt
SQLite ile çalışan schema production PostgreSQL’de ayrıca doğrulanmalı.
Staging migration, backup ve rollback planı hazırlanmalı.
```

---

### 2.5 E2E Test Kapsamı

Unit/integration test sayısı iyi görünse bile kritik SaaS akışları browser seviyesinde test edilmeli.

Olmazsa olmaz E2E akışları:

```txt
- Owner register/login/onboarding
- Organization setup
- Service creation
- Staff creation
- Availability setup
- Public booking
- Payment fake/sandbox flow
- Staff portal
- Superadmin guard
- Marketplace search
- i18n language switch
- WhatsApp auto reply fake mode
```

---

### 2.6 Mobil App Olgunlaştırma

Mobile README future work tarafında şunları listeliyor:

```txt
- Push notifications
- React Navigation
- Offline support
- Staff-only mode
- Calendar view
```

Olmazsa olmaz karar:

```txt
Mobil app gerçek owner/staff kullanımına yaklaşmalı.
```

---

### 2.7 Security Hardening

Bu proje multi-tenant, ödeme ve kişisel veri içeriyor. Güvenlik tarafı production öncesi güçlendirilmeli.

Olmazsa olmazlar:

```txt
- API rate limiting
- Login brute-force protection
- Tenant isolation regression tests
- Webhook signature verification
- Secret scanning
- PII redaction
- Admin/staff route guard tests
- Payment status backend-only enforcement
```

---

### 2.8 Observability

Production’da sorun olduğunda sistemin ne yaptığını görebilmek gerekir.

Olmazsa olmazlar:

```txt
- Structured logging
- Request ID
- Error boundary
- Admin health dashboard
- Webhook failure logs
- Failed reminder/job diagnostics
- Optional Sentry adapter
```

---

### 2.9 Background Jobs

Reminder, ödeme reconciliation, subscription sync ve calendar sync gibi işler güvenilir job sistemine bağlanmalı.

Olmazsa olmazlar:

```txt
- Job abstraction
- Local fake worker
- Retry/backoff
- Idempotency
- Protected cron endpoints
- Failed job visibility
```

---

### 2.10 Agent Rehberleri

Repo büyük hale geldiği için Codex ve Claude Code için açık çalışma kuralları gerekli.

Oluşturulması gereken dosyalar:

```txt
AGENTS.md
CLAUDE.md
docs/agent-runbook.md
docs/code-review.md
docs/phase-execution-rules.md
```

---

## 3. Yeni Agent Listesi

Claude Code için `.claude/agents/` altına eklenebilir. Codex için aynı görevler `AGENTS.md`, phase promptları ve PR review checklistleriyle çalıştırılabilir.

```txt
repo-audit-agent.md
ci-hardening-agent.md
i18n-production-agent.md
payment-platform-agent.md
database-production-agent.md
e2e-testing-agent.md
mobile-product-agent.md
security-hardening-agent.md
observability-agent.md
background-jobs-agent.md
legal-compliance-agent.md
growth-product-agent.md
docs-agent-runbook-agent.md
release-manager-agent.md
codex-review-agent.md
```

---

## 4. Agent Tanımları

### 4.1 `repo-audit-agent.md`

```md
---
name: repo-audit-agent
description: Use this agent to inspect current Randevo repo state, compare implemented features with README claims, and produce a truthful gap report.
tools: Read, Write, Edit, Bash
---

You are the Repo Audit Agent.

Responsibilities:
- Inspect README, package.json, Prisma schema, src/app, src/lib, src/services, src/tests, mobile, docs, and CI files.
- Compare declared features with implemented files.
- Create docs/product-gap-analysis.md.
- Classify gaps as Critical, High, Medium, Low.
- Do not implement features in this phase.

Rules:
- Be honest about what is implemented vs only documented.
- Do not delete files.
- Do not change product behavior.
```

### 4.2 `ci-hardening-agent.md`

```md
---
name: ci-hardening-agent
description: Use this agent to make GitHub Actions fail correctly, add typecheck/lint/test/build/migration checks, and prevent broken merges.
tools: Read, Write, Edit, Bash
---

You are the CI Hardening Agent.

Responsibilities:
- Remove unsafe `|| echo skipped` patterns from CI.
- Add strict steps for install, Prisma generate, db push/migrate, tests, build, secret check, skill validation.
- Add mobile CI job if mobile package exists.
- Add pull request protection notes.
- Add docs/ci-quality-gates.md.

Rules:
- CI must fail on test/build errors.
- Do not hide failing tests.
- Do not skip build silently.
```

### 4.3 `i18n-production-agent.md`

```md
---
name: i18n-production-agent
description: Use this agent to implement production-ready i18n, locale routing, language selector, missing-key checks, RTL support, SEO hreflang, and mobile i18n sync.
tools: Read, Write, Edit, Bash
---

You are the i18n Production Agent.

Responsibilities:
- Convert single-language setup into scalable i18n.
- Add supportedLocales.
- Add message JSON files.
- Add language selector.
- Add i18n missing key checker.
- Add RTL support for ar/fa.
- Add SEO hreflang.
- Sync mobile i18n where possible.

Rules:
- Do not break existing Turkish UI.
- Missing translation keys must fail checks.
- RTL must not create horizontal overflow.
```

### 4.4 `payment-platform-agent.md`

```md
---
name: payment-platform-agent
description: Use this agent to unify Stripe, iyzico, PayTR, Param, manual transfer, deposits, subscriptions, and payment reconciliation behind a provider abstraction.
tools: Read, Write, Edit, Bash
---

You are the Payment Platform Agent.

Responsibilities:
- Design PaymentProvider interface.
- Separate appointment deposits from SaaS subscriptions.
- Add provider adapters: StripeTest, Iyzico, PayTR stub, Param stub, ManualBankTransfer, Fake.
- Add payment state machine.
- Add webhook idempotency.
- Add payment reconciliation job.
- Add tests for duplicate webhooks and failed payment cases.

Rules:
- Client must never mark payment as paid.
- Webhook must be idempotent.
- Real secrets must never be committed.
```

### 4.5 `database-production-agent.md`

```md
---
name: database-production-agent
description: Use this agent to prepare PostgreSQL production readiness, migrations, indexes, backup notes, schema validation, and SQLite-to-Postgres compatibility checks.
tools: Read, Write, Edit, Bash
---

You are the Database Production Agent.

Responsibilities:
- Audit Prisma schema for PostgreSQL compatibility.
- Add migration strategy.
- Add staging database instructions.
- Add indexes for high-volume queries.
- Add backup/restore docs.
- Add seed strategy.
- Add docs/database-production-readiness.md.

Rules:
- Do not break local SQLite development unless migration plan says so.
- Production migrations must be reviewed before merge.
```

### 4.6 `e2e-testing-agent.md`

```md
---
name: e2e-testing-agent
description: Use this agent to add Playwright/Cypress e2e tests for critical web flows, payments, booking, staff, admin, marketplace, i18n, and mobile smoke checks.
tools: Read, Write, Edit, Bash
---

You are the E2E Testing Agent.

Responsibilities:
- Add Playwright.
- Add seeded test data.
- Add critical e2e flows.
- Add CI e2e job.
- Add docs/e2e-testing-guide.md.

Required flows:
- owner onboarding
- service/staff/availability setup
- public booking
- payment fake flow
- staff portal
- superadmin guard
- marketplace search
- i18n language switch
```

### 4.7 `mobile-product-agent.md`

```md
---
name: mobile-product-agent
description: Use this agent to mature the Expo mobile app with navigation, push notifications, offline cache, staff mode, calendar view, and mobile tests.
tools: Read, Write, Edit, Bash
---

You are the Mobile Product Agent.

Responsibilities:
- Add React Navigation.
- Add owner/staff role-aware screens.
- Add appointment calendar view.
- Add offline cache for appointment list.
- Add Expo Notifications foundation.
- Add mobile tests and expo-doctor checks.
- Add docs/mobile-release-readiness.md.

Rules:
- Mobile must use existing API.
- Do not duplicate backend business logic in mobile.
```

### 4.8 `security-hardening-agent.md`

```md
---
name: security-hardening-agent
description: Use this agent to add rate limiting, auth hardening, tenant isolation checks, webhook verification, secret scanning, PII redaction, and security tests.
tools: Read, Write, Edit, Bash
---

You are the Security Hardening Agent.

Responsibilities:
- Add API rate limiting.
- Add login brute-force protection.
- Review session/auth config.
- Enforce webhook signatures.
- Add tenant isolation regression tests.
- Add PII redaction helpers.
- Add security checklist.

Rules:
- Never log secrets or raw tokens.
- Never trust organizationId from client.
- Payment and consent routes need extra protection.
```

### 4.9 `observability-agent.md`

```md
---
name: observability-agent
description: Use this agent to add structured logging, request IDs, error tracking adapter, webhook failure logs, job diagnostics, and admin health dashboard.
tools: Read, Write, Edit, Bash
---

You are the Observability Agent.

Responsibilities:
- Add structured logger.
- Add request id middleware.
- Add error boundary.
- Add server error tracking adapter.
- Add webhook/job diagnostic logs.
- Add /admin/health page.
- Add docs/observability.md.

Rules:
- Do not log sensitive data.
- Logs must be useful but safe.
```

### 4.10 `background-jobs-agent.md`

```md
---
name: background-jobs-agent
description: Use this agent to implement reliable background jobs for reminders, payment reconciliation, subscription sync, calendar sync, and failed job retry.
tools: Read, Write, Edit, Bash
---

You are the Background Jobs Agent.

Responsibilities:
- Add job abstraction.
- Add local fake worker.
- Add cron endpoint protection.
- Add retry strategy.
- Add payment reconciliation job.
- Add subscription sync job.
- Add reminder delivery job.
- Add tests for retry/idempotency.

Rules:
- Jobs must be idempotent.
- Failed jobs must be visible.
- Cron endpoints must be protected.
```

### 4.11 `legal-compliance-agent.md`

```md
---
name: legal-compliance-agent
description: Use this agent to complete KVKK, consent logs, data export/delete flows, cookie banner, terms, privacy placeholders, and communication permission separation.
tools: Read, Write, Edit, Bash
---

You are the Legal Compliance Agent.

Responsibilities:
- Add KVKK/Privacy placeholder pages.
- Add terms of service page.
- Add cookie banner if cookies/tracking exist.
- Add data export request.
- Add data deletion request flow.
- Separate transactional notification consent from marketing consent.
- Add tests for required consent in booking flow.

Rules:
- Do not claim legal compliance is guaranteed.
- Placeholder legal text must be clearly marked for lawyer review.
```

### 4.12 `growth-product-agent.md`

```md
---
name: growth-product-agent
description: Use this agent to add onboarding checklist, demo mode, referral/waitlist, product analytics events, pricing experiments, and conversion tracking placeholders.
tools: Read, Write, Edit, Bash
---

You are the Growth Product Agent.

Responsibilities:
- Add onboarding checklist.
- Add demo workspace.
- Add referral/waitlist placeholder.
- Add product analytics event abstraction.
- Add conversion funnel events.
- Add docs/growth-analytics.md.

Rules:
- Analytics provider must be optional.
- Do not send personal data without consent.
```

### 4.13 `docs-agent-runbook-agent.md`

```md
---
name: docs-agent-runbook-agent
description: Use this agent to create AGENTS.md, CLAUDE.md, Codex guidance, code review checklist, and agent runbooks.
tools: Read, Write, Edit
---

You are the Docs Agent Runbook Agent.

Responsibilities:
- Create AGENTS.md for Codex.
- Create CLAUDE.md for Claude Code.
- Create docs/code-review.md.
- Create docs/agent-runbook.md.
- Add phase execution rules.
- Add tenant/payment/security guardrails.

Rules:
- Keep guidance actionable.
- Do not include secrets.
```

### 4.14 `release-manager-agent.md`

```md
---
name: release-manager-agent
description: Use this agent to manage changelog, release branches, tags, migration notes, rollback notes, and GitHub release readiness.
tools: Read, Write, Edit, Bash
---

You are the Release Manager Agent.

Responsibilities:
- Update CHANGELOG.md after every phase.
- Add rollback notes.
- Add migration notes.
- Tag stable milestones.
- Ensure tests pass before push.
- Prepare GitHub release notes.

Rules:
- Do not push failing builds.
- Do not force push without explicit approval.
```

### 4.15 `codex-review-agent.md`

```md
---
name: codex-review-agent
description: Use this agent to prepare Codex review instructions, GitHub PR review checks, and local /review workflow guidance.
tools: Read, Write, Edit
---

You are the Codex Review Agent.

Responsibilities:
- Add Codex-compatible AGENTS.md.
- Add docs/code-review.md.
- Add PR review checklist.
- Include instructions for Codex CLI `/review`.
- Include instructions for Codex GitHub PR review.
- Add high-signal review focus areas.

Rules:
- Focus on serious regressions, missing tests, tenant leaks, payment bugs, and security issues.
```

---

## 5. Phase Sırası

```txt
Phase PROD-0 — Repo Gap Audit
Phase PROD-1 — Agent Runbook, AGENTS.md ve CLAUDE.md
Phase PROD-2 — CI Hardening
Phase PROD-3 — Production Database Readiness
Phase PROD-4 — Payment Platform Unification
Phase PROD-5 — Real i18n Production System
Phase PROD-6 — Security Hardening
Phase PROD-7 — E2E Test Suite
Phase PROD-8 — Observability ve Diagnostics
Phase PROD-9 — Background Jobs
Phase PROD-10 — Mobile App Maturity
Phase PROD-11 — Legal / KVKK / Consent Completion
Phase PROD-12 — Growth and Onboarding Features
Phase PROD-13 — Release and Deployment Hardening
Phase PROD-14 — Final QA, Codex Review ve GitHub Release
```

Compact kuralı:

```txt
Her 2 phase sonrası docs/COMPACT_STATE.md güncellenecek.
Sonra Claude Code/Codex context azaltmak için compact özeti kullanılacak.
```

Her phase sonunda:

```txt
1. npm run check:node
2. npm run check:secrets
3. npm run validate:skills
4. npm run lint
5. npm test
6. npm run build
7. npx prisma validate
8. npx prisma generate
9. Gerekiyorsa mobile test
10. CHANGELOG güncelle
11. Commit
12. Push
```

---

## 6. Phase Detayları

---

## Phase PROD-0 — Repo Gap Audit

Kullanılacak agent:

```txt
repo-audit-agent
```

Amaç:

README’de yazan özelliklerle gerçek dosya yapısı ve test kapsamını karşılaştırmak.

Yapılacaklar:

1. README özelliklerini listele.
2. package.json scriptlerini incele.
3. Prisma schema modellerini incele.
4. src/app route gruplarını incele.
5. src/i18n yapısını incele.
6. mobile README ve package yapısını incele.
7. CI workflow’u incele.
8. docs klasörünü incele.
9. “Implemented / Partial / Missing / Risky” tablosu oluştur.
10. `docs/product-gap-analysis.md` dosyasını oluştur.

Testler:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Kabul kriteri:

```txt
- Gap analysis dosyası oluştu.
- Hiçbir ürün davranışı değişmedi.
- Test/build sonucu kaydedildi.
```

Commit:

```bash
git add .
git commit -m "docs: add production gap analysis"
git push
```

---

## Phase PROD-1 — Agent Runbook, AGENTS.md ve CLAUDE.md

Kullanılacak agent:

```txt
docs-agent-runbook-agent
codex-review-agent
```

Amaç:

Codex ve Claude Code’un projeyi güvenli ve tutarlı şekilde geliştirmesi için repo içi kurallar yazmak.

Oluşturulacak dosyalar:

```txt
AGENTS.md
CLAUDE.md
docs/agent-runbook.md
docs/code-review.md
docs/phase-execution-rules.md
```

AGENTS.md içinde olacaklar:

```txt
- Project summary
- Tech stack
- Critical invariants
- Commands to run before commit
- Tenant isolation rules
- Payment rules
- i18n rules
- Mobile rules
- Security rules
- Do-not-do list
```

Codex için özel notlar:

```txt
- Her değişiklik branchte yapılacak.
- PR açılmadan testler geçecek.
- /review ile local diff kontrol edilecek.
- GitHub Codex review için docs/code-review.md referans gösterilecek.
```

Claude Code için özel notlar:

```txt
- Phase dışına çıkılmayacak.
- Her 2 phase sonrası compact state güncellenecek.
- Büyük migration öncesi kullanıcıdan onay alınacak.
```

Testler:

```bash
npm run check:secrets
npm run validate:skills
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: add Codex and Claude Code agent runbooks"
git push
```

Compact:

```txt
PROD-0 ve PROD-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-2 — CI Hardening

Kullanılacak agent:

```txt
ci-hardening-agent
```

Amaç:

CI’ın gerçek kalite kapısı olmasını sağlamak.

Yapılacaklar:

1. `.github/workflows/ci.yml` içindeki `|| echo skipped` kalıplarını kaldır.
2. `npm ci` strict çalışsın.
3. `npm run check:node` ekle.
4. `npm run check:secrets` ekle.
5. `npm run validate:skills` ekle.
6. Prisma validate/generate/db push adımlarını strict yap.
7. `npm test` strict çalışsın.
8. `npm run build` strict çalışsın.
9. Mobile varsa ayrı mobile job ekle.
10. CI badge ve docs/ci-quality-gates.md ekle.

Önerilen CI jobları:

```txt
web-quality
database-validation
security-check
mobile-quality
e2e-smoke
```

Testler:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Kabul kriteri:

```txt
- CI fail eden testi saklamıyor.
- Build fail olursa workflow fail oluyor.
- Mobile job varsa mobile da kontrol ediliyor.
```

Commit:

```bash
git add .
git commit -m "ci: make quality gates strict"
git push
```

---

## Phase PROD-3 — Production Database Readiness

Kullanılacak agent:

```txt
database-production-agent
```

Amaç:

SQLite dev ortamı korunurken PostgreSQL production geçişi güvenli hale getirilir.

Yapılacaklar:

1. SQLite/PostgreSQL compatibility audit yap.
2. Json field ve string metadata alanlarını gözden geçir.
3. Büyük sorgular için index önerileri ekle:
   - appointments: organizationId + startTime + status
   - payments: organizationId + status + createdAt
   - auditLogs: organizationId + createdAt
   - reminders: status + scheduledAt
4. PostgreSQL staging migration rehberi yaz.
5. Backup/restore rehberi yaz.
6. Seed data idempotent hale getir.
7. `docs/database-production-readiness.md` oluştur.
8. Gerekirse `prisma/schema.postgres.prisma` veya provider switching notu ekle.

Testler:

```bash
npx prisma validate
npx prisma generate
npm test
npm run build
```

Opsiyonel Postgres smoke:

```bash
docker compose up -d db
DATABASE_URL=postgresql://... npx prisma migrate dev
DATABASE_URL=postgresql://... npm test
```

Commit:

```bash
git add .
git commit -m "docs: add production database readiness plan"
git push
```

Compact:

```txt
PROD-2 ve PROD-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-4 — Payment Platform Unification

Kullanılacak agent:

```txt
payment-platform-agent
security-hardening-agent
```

Amaç:

Stripe, iyzico, PayTR, Param, manuel havale ve fake provider yapısını tek payment platform altında toplamak.

Yapılacaklar:

1. `PaymentProvider` interface oluştur.
2. Provider listesi:
   - FAKE
   - STRIPE_TEST
   - IYZICO
   - PAYTR
   - PARAM
   - MANUAL_BANK_TRANSFER
3. Payment modelini provider bağımsız hale getir.
4. `PaymentAttempt` modeli ekle.
5. `WebhookEvent` modeli ekle.
6. Payment status state machine yaz.
7. Appointment deposit flow’u provider bağımsız yap.
8. Subscription billing flow’u provider bağımsız yap.
9. Manual bank transfer approval flow ekle.
10. Duplicate webhook idempotency testleri yaz.

Payment status:

```txt
PENDING
REQUIRES_ACTION
PAID
FAILED
CANCELLED
REFUNDED
MANUAL_REVIEW
```

Testler:

```txt
- Fake payment success appointment confirm eder.
- Failed payment appointment confirm etmez.
- Duplicate webhook ikinci payment oluşturmaz.
- Manual transfer pending_manual oluşturur.
- Tenant A payment Tenant B tarafından erişilemez.
```

Komutlar:

```bash
npm run check:secrets
npm test
npm run build
npx prisma validate
npx prisma generate
```

Commit:

```bash
git add .
git commit -m "feat: unify payment provider platform"
git push
```

---

## Phase PROD-5 — Real i18n Production System

Kullanılacak agent:

```txt
i18n-production-agent
```

Amaç:

Tek `tr.ts` yapısını üretime hazır çok dilli sisteme yükseltmek.

Yapılacaklar:

1. `src/i18n/messages/` oluştur.
2. `tr.json`, `en.json`, `de.json`, `ar.json`, `es.json`, `fr.json`, `it.json`, `fa.json`, `ru.json`, `nl.json` dosyalarını oluştur.
3. `supportedLocales` config ekle.
4. Language selector component ekle.
5. Locale persistence ekle.
6. i18n missing key checker script yaz.
7. RTL support ekle.
8. SEO hreflang ekle.
9. Mobile i18n sync planı uygula.
10. Translation QA raporu oluştur.

Testler:

```bash
npm run i18n:check
npm test
npm run build
```

Kabul kriteri:

```txt
- Dil seçici 10 dili gösteriyor.
- Missing key yok.
- ar/fa RTL çalışıyor.
- tr mevcut davranış bozulmadı.
```

Commit:

```bash
git add .
git commit -m "feat: add production i18n system"
git push
```

Compact:

```txt
PROD-4 ve PROD-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-6 — Security Hardening

Kullanılacak agent:

```txt
security-hardening-agent
```

Amaç:

Production güvenliğini yükseltmek.

Yapılacaklar:

1. Rate limit middleware ekle.
2. Login brute-force protection ekle.
3. Webhook signature verification zorunlu hale getir.
4. Tenant isolation helperlarını audit et.
5. `organizationId` client input güvenliğini test et.
6. PII redaction helper yaz.
7. Security headers ekle.
8. Admin/staff route guard testleri ekle.
9. Secret scan scriptini CI’a bağla.
10. `docs/security-hardening.md` oluştur.

Testler:

```txt
- Client farklı organizationId gönderse de veri sızmaz.
- Webhook invalid signature reddedilir.
- Login brute force rate limited olur.
- Admin route normal kullanıcıya kapalıdır.
- Staff billing’e erişemez.
```

Commit:

```bash
git add .
git commit -m "feat: harden security and tenant isolation"
git push
```

---

## Phase PROD-7 — E2E Test Suite

Kullanılacak agent:

```txt
e2e-testing-agent
```

Amaç:

Kritik kullanıcı akışlarını browser seviyesinde doğrulamak.

Yapılacaklar:

1. Playwright kur.
2. `tests/e2e/` klasörü oluştur.
3. Test seed setup yaz.
4. Owner onboarding flow yaz.
5. Service/staff/availability flow yaz.
6. Public booking flow yaz.
7. Payment fake flow yaz.
8. Staff portal flow yaz.
9. Superadmin guard flow yaz.
10. Marketplace search flow yaz.
11. i18n language switch flow yaz.
12. CI’a e2e smoke job ekle.

Test komutları:

```bash
npm run test:e2e
npm run build
```

Commit:

```bash
git add .
git commit -m "test: add critical e2e coverage"
git push
```

Compact:

```txt
PROD-6 ve PROD-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-8 — Observability ve Diagnostics

Kullanılacak agent:

```txt
observability-agent
```

Amaç:

Production’da hata ve davranışları izlenebilir hale getirmek.

Yapılacaklar:

1. Structured logger ekle.
2. Request ID middleware ekle.
3. API error format standardı oluştur.
4. Error boundary ekle.
5. Admin health page oluştur:
   - database status
   - queue status
   - provider status
   - last webhook failures
   - failed reminders
6. Webhook/job failure logs ekle.
7. Optional Sentry adapter placeholder ekle.
8. `docs/observability.md` oluştur.

Testler:

```txt
- Request id response header’da görünür.
- Hatalar safe JSON döner.
- Sensitive data loglanmaz.
- Admin health normal kullanıcıya kapalıdır.
```

Commit:

```bash
git add .
git commit -m "feat: add observability and diagnostics"
git push
```

---

## Phase PROD-9 — Background Jobs

Kullanılacak agent:

```txt
background-jobs-agent
```

Amaç:

Hatırlatma, ödeme reconciliation, subscription sync gibi işleri güvenilir job sistemine taşımak.

Yapılacaklar:

1. Job abstraction oluştur.
2. Local fake worker ekle.
3. Cron endpoint koruması ekle.
4. Reminder delivery job yaz.
5. Payment reconciliation job yaz.
6. Subscription sync job yaz.
7. Calendar sync retry job yaz.
8. Failed job logları ekle.
9. Retry/backoff stratejisi ekle.
10. Testleri yaz.

Testler:

```txt
- Reminder job idempotent çalışır.
- Payment reconciliation duplicate işlem yapmaz.
- Failed job retry count artırır.
- Cron secret olmadan endpoint çalışmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add background job system"
git push
```

Compact:

```txt
PROD-8 ve PROD-9 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-10 — Mobile App Maturity

Kullanılacak agent:

```txt
mobile-product-agent
```

Amaç:

Mobil uygulamayı demo seviyesinden gerçek kullanım temel seviyesine taşımak.

Yapılacaklar:

1. React Navigation ekle.
2. Login/session persistence ekle.
3. Owner dashboard flow’u iyileştir.
4. Staff-only mode ekle.
5. Calendar view ekle.
6. Appointment status update UX iyileştir.
7. Offline cache ekle.
8. Push notification foundation ekle.
9. Mobile i18n sync ekle.
10. Mobile tests ve expo-doctor CI ekle.

Testler:

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
```

Commit:

```bash
git add .
git commit -m "feat: mature mobile appointment app"
git push
```

---

## Phase PROD-11 — Legal / KVKK / Consent Completion

Kullanılacak agent:

```txt
legal-compliance-agent
```

Amaç:

KVKK ve ileti izin altyapısını ürün akışına bağlamak.

Yapılacaklar:

1. KVKK aydınlatma sayfası ekle.
2. Açık rıza sayfası ekle.
3. Kullanım şartları sayfası ekle.
4. Gizlilik politikası placeholder ekle.
5. Cookie banner gerekiyorsa ekle.
6. Data export request flow ekle.
7. Data deletion request flow UI ekle.
8. Consent log admin görünümü ekle.
9. Marketing vs transactional consent ayrımını test et.
10. Legal disclaimer ekle.

Testler:

```txt
- KVKK onayı olmadan public booking olmaz.
- Marketing consent false olsa da randevu alınabilir.
- Marketing mesajı consent olmadan gitmez.
- Data deletion request kaydı oluşur.
```

Commit:

```bash
git add .
git commit -m "feat: complete KVKK and consent flows"
git push
```

Compact:

```txt
PROD-10 ve PROD-11 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-12 — Growth and Onboarding Features

Kullanılacak agent:

```txt
growth-product-agent
```

Amaç:

Ürünün sadece teknik değil, satışa ve kullanıcı edinimine hazır hale gelmesi.

Yapılacaklar:

1. Onboarding checklist ekle.
2. Demo workspace flow ekle.
3. “İlk randevunu oluştur” guided flow ekle.
4. Empty state’leri satış/yardım odaklı yap.
5. Referral/waitlist placeholder ekle.
6. Product analytics event abstraction ekle.
7. Conversion funnel eventleri ekle:
   - signup_started
   - organization_created
   - service_created
   - first_booking_created
   - plan_upgrade_clicked
8. `docs/growth-analytics.md` oluştur.

Testler:

```txt
- Onboarding checklist doğru tamamlanır.
- Demo workspace gerçek ödeme yapmaz.
- Analytics disabled iken veri göndermez.
- Consent olmadan tracking yapılmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add onboarding and growth foundations"
git push
```

---

## Phase PROD-13 — Release and Deployment Hardening

Kullanılacak agent:

```txt
release-manager-agent
database-production-agent
security-hardening-agent
```

Amaç:

Deploy edilebilir stable sürüm hazırlamak.

Yapılacaklar:

1. README deploy adımlarını güncelle.
2. docs/deployment.md güncelle.
3. Staging/production env checklist ekle.
4. Database migration checklist ekle.
5. Rollback planı ekle.
6. Backup/restore planı ekle.
7. Release branch stratejisi yaz.
8. Version tag planı yaz.
9. GitHub release notes template oluştur.
10. Production readiness checklist oluştur.

Testler:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npm run test:e2e
```

Commit:

```bash
git add .
git commit -m "docs: harden deployment and release process"
git push
```

Compact:

```txt
PROD-12 ve PROD-13 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase PROD-14 — Final QA, Codex Review ve GitHub Release

Kullanılacak agent:

```txt
release-manager-agent
codex-review-agent
e2e-testing-agent
```

Amaç:

Tüm gelişmeleri final kalite kontrolünden geçirmek.

Yapılacaklar:

1. Tüm testleri çalıştır.
2. E2E testleri çalıştır.
3. Mobile smoke test çalıştır.
4. Secret scan çalıştır.
5. Migration dry-run raporu hazırla.
6. Codex CLI `/review` için yönerge ekle.
7. GitHub Codex PR review kullanım yönergesi ekle.
8. CHANGELOG’u tamamla.
9. README güncelle.
10. Stable tag oluştur.

Final komutlar:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npm run test:e2e
npx prisma validate
npx prisma generate
```

Codex local review:

```txt
/review
```

GitHub review:

```txt
@codex review
```

Commit ve tag:

```bash
git add .
git commit -m "chore: finalize production readiness roadmap implementation"
git push
git tag v2.0.0-production-readiness
git push origin v2.0.0-production-readiness
```

---

## 7. Olmazsa Olmaz Özellikler Checklist

```txt
[ ] CI fail olan test/build durumunda yeşil dönmüyor
[ ] AGENTS.md var
[ ] CLAUDE.md var
[ ] Codex review checklist var
[ ] Tenant isolation regression testleri var
[ ] Payment status sadece backend tarafından değişiyor
[ ] Webhook idempotency var
[ ] Webhook signature verification var
[ ] i18n missing key checker var
[ ] Dil seçici gerçek locale değiştiriyor
[ ] E2E public booking testi var
[ ] E2E owner onboarding testi var
[ ] E2E payment fake testi var
[ ] Mobile typecheck/test var
[ ] Security rate limit var
[ ] Login brute-force protection var
[ ] Secret scan CI’da var
[ ] Structured logging var
[ ] Admin health page var
[ ] Background job retry var
[ ] KVKK/consent flow testli
[ ] Deployment docs güncel
[ ] Migration rollback notları var
[ ] CHANGELOG dolu
```

---

## 8. Codex Kullanım Rehberi

Codex için önerilen kullanım:

```txt
1. Her phase için ayrı branch aç.
2. AGENTS.md dosyasını oku.
3. Sadece ilgili phase’i uygula.
4. Testleri çalıştır.
5. /review ile diff’i kontrol et.
6. PR aç.
7. @codex review iste.
8. Merge öncesi CI yeşil olmalı.
```

Codex prompt örneği:

```txt
Read RANDEVO_PRODUCTION_GAP_AND_FEATURE_ROADMAP.md and AGENTS.md.

Implement Phase PROD-2 only.

Scope:
- Harden .github/workflows/ci.yml.
- Remove skipped test/build behavior.
- Add strict quality gates.
- Update docs/ci-quality-gates.md.

Before committing:
- Run npm run check:node
- Run npm run check:secrets
- Run npm run validate:skills
- Run npm run lint
- Run npm test
- Run npm run build
- Run npx prisma validate
- Run npx prisma generate

Do not touch payment logic or product behavior in this phase.
```

---

## 9. Claude Code Kullanım Rehberi

Claude Code için önerilen kullanım:

```txt
1. Bu dosyayı oku.
2. CLAUDE.md ve AGENTS.md dosyalarını oluştur.
3. Phase phase ilerle.
4. Her 2 phase sonrası docs/COMPACT_STATE.md güncelle.
5. /compact çalıştır veya kullanıcıdan çalıştırmasını iste.
6. Testleri geçirmeden commit/push yapma.
```

Claude Code prompt örneği:

```txt
Read RANDEVO_PRODUCTION_GAP_AND_FEATURE_ROADMAP.md carefully.

Start with Phase PROD-0 only.

Tasks:
- Audit README, package.json, prisma schema, src/app, src/i18n, mobile, docs, and CI.
- Create docs/product-gap-analysis.md.
- Do not change product behavior.
- Run all baseline commands.
- Commit and push only if tests pass.

Stop after Phase PROD-0 and summarize.
```

---

## 10. Compact Protokolü

Her 2 phase sonunda:

```txt
1. docs/COMPACT_STATE.md güncelle.
2. Son 2 phase’te yapılanları yaz.
3. Değişen dosyaları listele.
4. Yeni testleri listele.
5. Kalan riskleri yaz.
6. Sonraki phase prompt’unu hazırla.
7. Claude Code/Codex context azaltmak için compact iste.
```

Compact sonrası prompt:

```txt
Read docs/COMPACT_STATE.md and RANDEVO_PRODUCTION_GAP_AND_FEATURE_ROADMAP.md.
Continue from the next unfinished PROD phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

## 11. GitHub Push Politikası

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful commit message"
git push
```

Ama sadece şu şartlarda:

```txt
- check:node geçti
- check:secrets geçti
- validate:skills geçti
- lint geçti
- test geçti
- build geçti
- prisma validate/generate geçti
- mobile ilgiliyse mobile checks geçti
```

Test fail olursa:

```txt
1. Fail raporu oluştur.
2. Bug fix yap.
3. Testleri tekrar çalıştır.
4. Sonra commit + push yap.
```

---

## 12. Final Kontrol Prompt’u

```txt
Review the entire Randevo production readiness update.

Check:
1. Is CI strict?
2. Are AGENTS.md and CLAUDE.md present?
3. Are Codex review instructions present?
4. Are tenant isolation tests strong?
5. Is payment provider abstraction safe?
6. Are webhooks idempotent and signature-verified?
7. Is i18n production-ready?
8. Do e2e tests cover critical flows?
9. Is mobile app more than a basic demo?
10. Are security and rate limits implemented?
11. Is observability available?
12. Are background jobs reliable?
13. Are KVKK/consent flows complete?
14. Are deployment docs realistic?
15. Do all tests pass?
16. Does build pass?
17. Has everything been committed and pushed?

Fix small issues only.
Do not add new major features.
Create final release notes.
```

---

## 13. Final Hedef

Bu roadmap tamamlandığında Randevo şu seviyeye gelir:

```txt
- CI güvenilir
- Codex/Claude Code için agent yönergeleri hazır
- Çok dilli sistem gerçek
- Ödeme platformu provider bağımsız
- PostgreSQL production geçişi planlı
- E2E testler kritik akışları koruyor
- Mobil app olgun
- Security hardening yapılmış
- Observability var
- Background jobs güvenilir
- KVKK ve consent akışları testli
- Deployment ve release süreci net
```

Bu seviyeden sonra proje sadece portfolyo değil, gerçek SaaS ürününe yaklaşan ciddi bir sistem olur.

---

## 14. Kaynak Notları

Bu dosya şu repo içi alanların incelenmesine göre hazırlanmıştır:

```txt
- README.md
- package.json
- prisma/schema.prisma
- .env.example
- .github/workflows/ci.yml
- docs/
- src/app/
- src/i18n/
- mobile/README.md
```

Codex tarafında ayrıca şu çalışma mantığı dikkate alınmıştır:

```txt
- Codex CLI lokal dizinde kodu okuyup değiştirebilir ve komut çalıştırabilir.
- Codex CLI /review ile local diff review yapılabilir.
- GitHub PR üzerinde Codex review kullanılabilir.
```
