# Randevo — Agent Skills ve MCP Entegrasyon Planı

> Bu dosya Randevo projesine eklenmesi gereken **Agent Skills** ve **MCP server** entegrasyonlarını planlar.  
> Amaç: Claude Code, Codex, Antigravity veya MCP destekli başka bir coding agent ile projeyi daha güvenli, daha hızlı ve daha kontrollü geliştirmek.

---

## 1. Kısa Karar

Randevo için en doğru yaklaşım:

```txt
Agent Skills = Nasıl yapılacağını anlatan tekrar kullanılabilir proje prosedürleri
MCP Servers   = Agent'a güvenli şekilde dış araç/veri erişimi veren bağlantılar
```

Yani ikisi birbirinin yerine geçmez.

Örnek:

```txt
Skill:
"Payment provider değiştirirken şu testleri çalıştır, webhook idempotency kontrol et, client payment status değiştirmesin."

MCP:
"GitHub PR'larını oku, Playwright ile browser test çalıştır, Postgres staging şemasını read-only incele."
```

---

## 2. Araştırma Notları

### 2.1 Agent Skills

Anthropic Skills yaklaşımında her skill bir klasördür ve içinde `SKILL.md` bulunur. `SKILL.md` dosyasında YAML frontmatter ve iş akışı talimatları yer alır. Skill sadece gerektiğinde yüklendiği için uzun prosedürler `CLAUDE.md` içine gömülmek yerine skill olarak ayrılabilir.

Randevo için sonuç:

```txt
Genel repo kuralları AGENTS.md / CLAUDE.md içinde kalmalı.
Tekrarlanan operasyonel prosedürler .claude/skills altında skill olmalı.
```

### 2.2 MCP

Model Context Protocol, LLM uygulamalarını dış data ve araçlara bağlamak için standart bir protokoldür. MCP mimarisi tools, resources ve prompts gibi primitive'ler sağlar. Transport olarak stdio ve Streamable HTTP desteklenir.

Randevo için sonuç:

```txt
MCP sadece gerçekten gerekli araçlara bağlanmalı.
Her MCP server minimal izinle çalışmalı.
Production database veya secret taşıyan sistemler doğrudan açılmamalı.
```

### 2.3 Güvenlik

MCP server'lar dış sistemlere erişim verebildiği için yüksek riskli kabul edilmelidir. Özellikle filesystem, git, database, email, GitHub ve payment provider bağlantıları minimum yetkiyle kurulmalıdır.

Randevo için kural:

```txt
- MCP server kurulmadan önce risk seviyesi yazılacak.
- .mcp.json içinde secret tutulmayacak.
- Production database read/write açılmayacak.
- GitHub token minimum scope ile kullanılacak.
- Playwright testleri sadece local/staging URL'de çalışacak.
```

---

## 3. Önerilen Repo Yapısı

```txt
Randevo/
├── AGENTS.md
├── CLAUDE.md
├── .mcp.json.example
├── .claude/
│   ├── skills/
│   │   ├── randevo-phase-runner/
│   │   │   └── SKILL.md
│   │   ├── tenant-isolation-review/
│   │   │   └── SKILL.md
│   │   ├── payment-provider-guard/
│   │   │   └── SKILL.md
│   │   ├── booking-engine-regression/
│   │   │   └── SKILL.md
│   │   ├── i18n-localization-qa/
│   │   │   └── SKILL.md
│   │   ├── global-address-qa/
│   │   │   └── SKILL.md
│   │   ├── whatsapp-automation-review/
│   │   │   └── SKILL.md
│   │   ├── kvkk-consent-review/
│   │   │   └── SKILL.md
│   │   ├── prisma-migration-review/
│   │   │   └── SKILL.md
│   │   ├── e2e-playwright-qa/
│   │   │   └── SKILL.md
│   │   ├── mobile-expo-qa/
│   │   │   └── SKILL.md
│   │   ├── release-github-push/
│   │   │   └── SKILL.md
│   │   └── mcp-security-audit/
│   │       └── SKILL.md
│   └── agents/
│       └── optional-project-subagents.md
├── docs/
│   ├── agent-skills-and-mcp-plan.md
│   ├── mcp-security-policy.md
│   ├── mcp-installation-guide.md
│   ├── skills-index.md
│   └── COMPACT_STATE.md
└── scripts/
    ├── validate-skills.ts
    ├── check-mcp-config.ts
    └── check-agent-readiness.ts
```

---

# 4. Eklenmesi Gereken Agent Skills

Aşağıdaki skills Randevo projesine özel yazılmalı. Dışarıdan rastgele skill kopyalamak yerine, resmi skills reposundaki format ve template mantığı referans alınmalı.

---

## 4.1 `randevo-phase-runner`

Amaç:

Her plan dosyasındaki phase’i kontrollü şekilde uygulatmak.

Kullanım:

```txt
/randevo-phase-runner Phase GLF-2
/randevo-phase-runner Phase PROD-4
```

`SKILL.md`:

```md
---
name: randevo-phase-runner
description: Use this skill when implementing any Randevo roadmap phase. It enforces phase scope, test commands, commit rules, compact rules, and GitHub push safety.
---

# Randevo Phase Runner

## When to use

Use this skill before starting any phase from Randevo roadmap files.

## Rules

- Read the relevant roadmap file first.
- Implement only the requested phase.
- Do not jump to future phases.
- Do not remove existing Turkey support.
- Do not commit secrets.
- Do not force push.
- If 2 phases have completed since last compact, update `docs/COMPACT_STATE.md`.

## Required checks

Run available commands:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

If a command does not exist, document it clearly instead of hiding it.

## Commit rule

Only commit and push when checks pass.

## Output

1. Phase completed
2. Files changed
3. Tests run
4. Failures fixed
5. Push status
6. Next phase
```

---

## 4.2 `tenant-isolation-review`

Amaç:

Multi-tenant güvenliğini korumak.

Kullanım:

```txt
/tenant-isolation-review payment changes
/tenant-isolation-review marketplace API
```

`SKILL.md`:

```md
---
name: tenant-isolation-review
description: Use this skill when changing API routes, Prisma queries, dashboard pages, marketplace filters, staff routes, admin routes, payment routes, or any organization-scoped data.
---

# Tenant Isolation Review

## Core invariant

A user from Organization A must never read, update, delete, or infer private data from Organization B.

## Checklist

- Every tenant-owned model has `organizationId`.
- API routes resolve organization from authenticated session.
- Client-provided `organizationId` is not trusted.
- Staff can only see allowed staff-scoped data.
- Superadmin routes are protected by superadmin guard.
- Public booking exposes only public business data.
- Marketplace returns only marketplace-enabled public records.

## Required tests

Add or update tests for:

- Cross-tenant read denial
- Cross-tenant update denial
- Staff route restrictions
- Admin route restrictions
- Marketplace private data leakage
```

---

## 4.3 `payment-provider-guard`

Amaç:

Stripe/iyzico/PayTR/Param/manuel havale gibi ödeme akışlarının güvenli kalmasını sağlamak.

`SKILL.md`:

```md
---
name: payment-provider-guard
description: Use this skill when editing payment, subscription, deposit, webhook, invoice, manual bank transfer, iyzico, PayTR, Param, or Stripe code.
---

# Payment Provider Guard

## Non-negotiable rules

- Client must never mark a payment as paid.
- Payment status changes must happen on backend only.
- Callback alone is not enough; retrieve/reconcile result must verify payment.
- Webhooks must be idempotent.
- Duplicate webhook must not create duplicate ledger/payment state changes.
- Secrets must not enter client bundle or git.
- Provider-specific code must stay behind `PaymentProvider` interface.

## Required tests

- Fake payment success
- Fake payment failure
- Duplicate webhook
- Invalid webhook signature
- Manual transfer pending/approved
- Appointment deposit paid -> appointment confirmed
- Failed deposit -> appointment not confirmed
- Subscription paid -> plan active
```

---

## 4.4 `booking-engine-regression`

Amaç:

Randevu slot üretimi, çakışma ve availability mantığını bozmamak.

`SKILL.md`:

```md
---
name: booking-engine-regression
description: Use this skill when editing booking engine, availability, staff, location, public booking, closed days, holidays, Google Calendar sync, or appointment status code.
---

# Booking Engine Regression

## Required rules

- Same staff cannot be double booked.
- Cancelled appointments do not block slots.
- Service duration determines end time.
- Staff availability controls slots.
- Closed days and holidays block slots unless overridden.
- Multi-location slot generation must respect location.
- Timezone must be explicit.

## Required tests

- Slot generation
- Overlap prevention
- Cancelled appointment ignored
- Past time blocked
- Holiday/closed day blocked
- Location-specific availability
- Staff-specific appointment conflict
```

---

## 4.5 `i18n-localization-qa`

Amaç:

Dil paketleri, locale routing, RTL ve missing key kontrollerini standartlaştırmak.

`SKILL.md`:

```md
---
name: i18n-localization-qa
description: Use this skill when editing translations, language selector, locale routing, landing copy, marketplace copy, notification templates, SEO hreflang, or RTL layout.
---

# i18n Localization QA

## Rules

- No customer-facing hard-coded strings.
- Translation files must have the same keys as source locale.
- `ar` and `fa` must use RTL.
- `ru` must render Cyrillic correctly.
- Global locale must not show Turkey-only copy.
- Turkey-specific copy appears only in TR context.

## Required checks

```bash
npm run i18n:check
npm run typecheck
npm test
npm run build
```

## E2E examples

- Select Italy -> Turkey provinces not visible.
- Select Turkey -> Turkey provinces visible.
- Select Farsi -> `dir="rtl"`.
- Select Russian -> Cyrillic text visible.
```

---

## 4.6 `global-address-qa`

Amaç:

Türkiye local data + global provider autocomplete sistemini korumak.

`SKILL.md`:

```md
---
name: global-address-qa
description: Use this skill when editing country, province, district, address provider, marketplace location filters, global address autocomplete, or mobile address picker.
---

# Global Address QA

## Rules

- `TURKEY_PROVINCES` is used only when `countryCode === "TR"`.
- Non-TR countries use provider/manual locality search.
- Country change clears stale province/city/locality state.
- Provider disabled must not crash app.
- Manual fallback must work.

## Required tests

- TR -> Adana visible.
- IT -> Adana not visible.
- IT -> city/locality input visible.
- Provider mock returns Roma/Milano.
- Manual fallback works.
```

---

## 4.7 `whatsapp-automation-review`

Amaç:

WhatsApp auto booking link reply güvenliğini sağlamak.

`SKILL.md`:

```md
---
name: whatsapp-automation-review
description: Use this skill when editing WhatsApp webhook, auto reply, booking link automation, opt-out, cooldown, or notification providers.
---

# WhatsApp Automation Review

## Rules

- Respect opt-out keywords.
- Cooldown prevents repeated spam.
- Do not send marketing without consent.
- Appointment transactional messages are separate from marketing.
- Webhook verification must be safe.
- Provider must be fake/mock in tests.

## Required tests

- First inbound message -> booking link sent.
- Repeated message within cooldown -> no duplicate reply.
- STOP/istemiyorum/yazma -> opt-out.
- Marketing consent false -> no campaign message.
- Provider failure -> safe log, no crash.
```

---

## 4.8 `kvkk-consent-review`

Amaç:

KVKK, açık rıza, pazarlama izni ve data deletion akışlarını korumak.

`SKILL.md`:

```md
---
name: kvkk-consent-review
description: Use this skill when editing KVKK, consent logs, privacy notice, explicit consent, marketing permission, data export, data deletion, or customer data flows.
---

# KVKK Consent Review

## Rules

- Privacy notice acknowledgement is separate from explicit consent.
- Marketing consent is optional and separate.
- Appointment reminders are transactional and separate.
- Placeholder legal texts must be marked for lawyer review.
- Consent logs must be auditable.

## Required tests

- Booking blocked without privacy acknowledgement.
- Marketing false does not block booking.
- Marketing message blocked without marketing consent.
- ConsentLog created.
- Data deletion request created.
```

---

## 4.9 `prisma-migration-review`

Amaç:

Prisma migration ve database değişikliklerini güvenli yapmak.

`SKILL.md`:

```md
---
name: prisma-migration-review
description: Use this skill when editing prisma/schema.prisma, migrations, seed scripts, database indexes, PostgreSQL readiness, or tenant-owned models.
---

# Prisma Migration Review

## Rules

- Tenant-owned models need `organizationId`.
- Add indexes for high-volume queries.
- Migration must be reviewed before merge.
- Seed must be idempotent.
- SQLite dev and Postgres production differences must be considered.

## Required checks

```bash
npx prisma validate
npx prisma generate
npm test
npm run build
```

## Output

- Schema changes
- Migration name
- Backward compatibility risks
- Seed impact
- Rollback notes
```

---

## 4.10 `e2e-playwright-qa`

Amaç:

Playwright MCP ve/veya Playwright testleriyle kritik UI akışlarını korumak.

`SKILL.md`:

```md
---
name: e2e-playwright-qa
description: Use this skill when testing web UI, marketplace filters, public booking, payment flow, language selector, staff portal, admin guard, or user onboarding.
---

# E2E Playwright QA

## Critical flows

- Register/login
- Organization onboarding
- Service/staff/availability setup
- Public booking
- Fake payment success/failure
- Staff portal
- Superadmin guard
- Marketplace country filter
- Language switch
- WhatsApp auto link settings

## Rule

If the UI bug was reported with screenshots, add a regression test before closing.
```

---

## 4.11 `mobile-expo-qa`

Amaç:

Expo mobil app değişikliklerini kontrol etmek.

`SKILL.md`:

```md
---
name: mobile-expo-qa
description: Use this skill when editing the Expo mobile app, mobile auth, appointment screens, staff mode, mobile language selector, mobile address picker, or push notification foundation.
---

# Mobile Expo QA

## Required checks

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
```

## Manual smoke

- App starts in Expo.
- Login screen opens.
- Appointment list renders.
- Staff mode respects permissions.
- Language selector works.
- API URL is not localhost when running on phone.
```

---

## 4.12 `release-github-push`

Amaç:

Her phase sonunda güvenli commit/push süreci.

`SKILL.md`:

```md
---
name: release-github-push
description: Use this skill after a completed Randevo phase to run final checks, update changelog, commit, push, and optionally tag stable releases.
---

# Release GitHub Push

## Checks before commit

Run available commands:

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run i18n:check
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

## Rules

- Do not push failing build.
- Do not force push.
- Update CHANGELOG.md if present.
- Add tag only for stable milestone.
```

---

## 4.13 `mcp-security-audit`

Amaç:

MCP eklemeden önce risk kontrolü yapmak.

`SKILL.md`:

```md
---
name: mcp-security-audit
description: Use this skill before adding, enabling, or changing any MCP server configuration.
---

# MCP Security Audit

## Checklist

- What data can this MCP access?
- Is it read-only or read/write?
- Does it touch GitHub, filesystem, database, payments, email, or secrets?
- Can permissions be scoped?
- Are tokens stored in env vars only?
- Is it needed for local dev only or CI/staging?
- Is there a safer manual alternative?
- Is production data blocked?

## Rule

Do not enable a new MCP server until `docs/mcp-security-policy.md` is updated.
```

---

# 5. Önerilen MCP Server’lar

Bu sırayla eklenmeli. Hepsi aynı anda kurulmayacak.

---

## 5.1 GitHub MCP Server

Amaç:

```txt
- Repo okuma
- Issue/PR inceleme
- PR review checklist
- Release notes
- Changelog
- Branch/PR durumlarını görme
```

Öneri:

```txt
Gerekli ama dikkatli kullanılmalı.
Token minimum yetkiyle verilmeli.
İlk kurulum read-only ağırlıklı olmalı.
```

Kullanım alanları:

```txt
- PR review
- GitHub issue üretme
- Release note hazırlama
- CI failure inceleme
```

Risk:

```txt
Yanlış izinle repo değiştirebilir.
```

Kural:

```txt
Write permission sadece kullanıcı onayıyla.
Force push yok.
```

---

## 5.2 Playwright MCP

Amaç:

```txt
- Browser üzerinden gerçek UI testi
- Marketplace bug reproducing
- Public booking test
- Language selector test
- Payment fake flow test
```

Randevo için en faydalı MCP budur.

Örnek testler:

```txt
- Italy seç -> Adana görünmesin
- Türkiye seç -> Adana görünsün
- Public booking randevu oluştursun
- Dashboard appointment göstersin
- Farsça seç -> RTL çalışsın
```

Risk:

```txt
Yanlış URL’de test koşabilir.
```

Kural:

```txt
Sadece localhost veya staging URL.
Production üzerinde destructive test yok.
```

---

## 5.3 Prisma / PostgreSQL MCP

Amaç:

```txt
- Database schema inceleme
- Staging/local database read-only query
- Prisma/Postgres readiness kontrolü
- Migration risk analizi
```

Öneri:

```txt
Production database'e bağlama.
Local veya staging read-only connection kullan.
```

Kullanım alanları:

```txt
- Tenant isolation query kontrolü
- Marketplace country filtering data kontrolü
- Payment state audit
- Consent logs audit
```

Risk:

```txt
Database yazma/silme riski.
PII sızıntısı.
```

Kural:

```txt
Read-only user.
Masked seed/staging data.
```

---

## 5.4 Filesystem MCP

Amaç:

```txt
- Repo dosyalarını kapsamlı okumak/yazmak
- Bazı MCP client’larda Claude Code benzeri dosya erişimi sağlamak
```

Randevo için durum:

```txt
Claude Code zaten repo dosyalarını okuyup yazabiliyorsa şart değil.
Codex/başka client için gerekebilir.
```

Risk:

```txt
Yanlış path ile proje dışı dosyalara erişim.
```

Kural:

```txt
Root sadece Randevo repo klasörü.
Home/Desktop/Downloads erişimi yok.
```

---

## 5.5 Fetch / Docs MCP

Amaç:

```txt
- Next.js, Prisma, iyzico, PayTR, Google Maps, MCP docs gibi dokümanları çekmek
```

Öneri:

```txt
Opsiyonel.
Web search zaten varsa şart değil.
Kullanılacaksa domain allowlist ile kullan.
```

Allowlist örnekleri:

```txt
nextjs.org
prisma.io
docs.iyzico.com
developers.google.com
docs.github.com
modelcontextprotocol.io
playwright.dev
docs.expo.dev
```

Risk:

```txt
Prompt injection içeren web sayfası agent’ı yanıltabilir.
```

Kural:

```txt
Fetched docs untrusted kabul edilecek.
Kod değişikliği yapmadan önce official docs ile doğrulanacak.
```

---

## 5.6 Time MCP

Amaç:

```txt
- Timezone testleri
- Europe/Istanbul
- Booking slot zaman hesapları
- Reminder job zamanlaması
```

Öneri:

```txt
Düşük riskli, opsiyonel.
```

---

## 5.7 Memory MCP

Amaç:

```txt
- Uzun proje contextini saklama
```

Randevo için öneri:

```txt
İlk etapta kullanma.
Bunun yerine docs/COMPACT_STATE.md kullan.
```

Sebep:

```txt
Memory MCP yanlış veya eski bilgiyi kalıcı tutabilir.
Sensitive proje bilgisini gereksiz saklayabilir.
```

---

## 5.8 Önerilmeyen MCP’ler

Şu MCP’ler ilk aşamada eklenmemeli:

```txt
- Email sending MCP
- WhatsApp sending MCP
- Payment provider write-capable MCP
- Production database write MCP
- Shell/terminal unrestricted MCP
- Browser automation production URL üzerinde destructive test
```

Sebep:

```txt
Randevo ödeme, müşteri, randevu ve KVKK verisi içeriyor.
Bu yüzden write-capable external MCP’ler en sona bırakılmalı.
```

---

# 6. .mcp.json.example

Repo içine gerçek secret içermeyen örnek dosya eklenecek.

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    },
    "postgres-readonly-local": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-postgres",
        "${DATABASE_READONLY_URL}"
      ],
      "env": {
        "DATABASE_READONLY_URL": "${DATABASE_READONLY_URL}"
      },
      "disabledByDefault": true
    }
  }
}
```

Not:

```txt
Paket isimleri kurulmadan önce güncel dokümandan doğrulanmalı.
Bu dosya sadece example olmalı.
Gerçek .mcp.json gitignore içinde kalmalı.
```

---

# 7. AGENTS.md Güncellemesi

`AGENTS.md` içine şu MCP/Skill kuralları eklenecek:

```md
# MCP and Skills Rules

## Skills

Use `.claude/skills/*/SKILL.md` for repeatable workflows.

Before modifying:
- payments -> use payment-provider-guard
- tenant API -> use tenant-isolation-review
- booking engine -> use booking-engine-regression
- i18n/address -> use i18n-localization-qa or global-address-qa
- Prisma -> use prisma-migration-review
- mobile -> use mobile-expo-qa
- MCP config -> use mcp-security-audit

## MCP

Allowed initial MCP servers:
- GitHub MCP
- Playwright MCP
- local/staging read-only Postgres/Prisma MCP
- optional Fetch docs MCP with allowlist
- optional Time MCP

Forbidden without explicit approval:
- production database write access
- payment provider write MCP
- email/WhatsApp sending MCP
- unrestricted filesystem outside repo
- force push automation

## Required before push

Run:
- npm run check:node
- npm run check:secrets
- npm run validate:skills
- npm run i18n:check if translations changed
- npm run lint
- npm test
- npm run build
- npx prisma validate
- npx prisma generate
```

---

# 8. Phase Planı

---

## Phase ASM-0 — Audit ve Politika

Kullanılacak skill/agent:

```txt
mcp-security-audit
repo-audit-agent
```

Yapılacaklar:

1. Mevcut `.claude`, `.mcp`, `AGENTS.md`, `CLAUDE.md` dosyalarını kontrol et.
2. Mevcut scripts:
   - validate:skills
   - check:secrets
   - check:node
   - test/build
3. `docs/agent-skills-and-mcp-plan.md` ekle.
4. `docs/mcp-security-policy.md` oluştur.
5. `.mcp.json.example` oluştur.
6. Gerçek `.mcp.json` dosyasını `.gitignore` içine al.

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
git commit -m "docs: add agent skills and MCP integration policy"
git push
```

---

## Phase ASM-1 — Core Skills Skeleton

Kullanılacak skill/agent:

```txt
randevo-phase-runner
```

Yapılacaklar:

1. `.claude/skills/` klasörünü oluştur.
2. İlk core skill dosyalarını ekle:
   - randevo-phase-runner
   - tenant-isolation-review
   - payment-provider-guard
   - booking-engine-regression
   - prisma-migration-review
   - mcp-security-audit
3. `scripts/validate-skills.ts` skill frontmatter kontrolünü güncelle.
4. `docs/skills-index.md` oluştur.

Testler:

```bash
npm run validate:skills
npm run check:secrets
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add core Randevo agent skills"
git push
```

Compact:

```txt
ASM-0 ve ASM-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ASM-2 — Product Workflow Skills

Yapılacaklar:

1. Şu skills dosyalarını ekle:
   - i18n-localization-qa
   - global-address-qa
   - whatsapp-automation-review
   - kvkk-consent-review
   - e2e-playwright-qa
   - mobile-expo-qa
   - release-github-push
2. `docs/skills-index.md` güncelle.
3. Her skill için ne zaman kullanılacağına örnek prompt ekle.

Testler:

```bash
npm run validate:skills
npm run check:secrets
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add product workflow skills"
git push
```

---

## Phase ASM-3 — GitHub MCP ve Playwright MCP

Yapılacaklar:

1. GitHub MCP kurulumu için dokümantasyon ekle.
2. Playwright MCP kurulumu için dokümantasyon ekle.
3. `.mcp.json.example` güncelle.
4. `docs/mcp-installation-guide.md` oluştur.
5. Playwright smoke test planı ekle.
6. GitHub token scope notlarını yaz.

Testler:

```bash
npm run check:secrets
npm test
npm run build
```

Manual MCP test:

```txt
- GitHub MCP repo read yapabiliyor mu?
- Playwright MCP localhost açabiliyor mu?
- Playwright MCP marketplace page'de country dropdown görebiliyor mu?
```

Commit:

```bash
git add .
git commit -m "docs: add GitHub and Playwright MCP setup"
git push
```

Compact:

```txt
ASM-2 ve ASM-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ASM-4 — Database MCP / Prisma Read-only Plan

Yapılacaklar:

1. Prisma MCP ve Postgres read-only seçeneklerini dokümante et.
2. Production database’e bağlanmama kuralını yaz.
3. Local/staging read-only connection string yapısını yaz.
4. `DATABASE_READONLY_URL` env örneği ekle.
5. `docs/database-mcp-policy.md` oluştur.
6. Tenant isolation read-only query örnekleri ekle.

Testler:

```bash
npm run check:secrets
npx prisma validate
npx prisma generate
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: add read-only database MCP policy"
git push
```

---

## Phase ASM-5 — Optional Docs/Time MCP

Yapılacaklar:

1. Fetch/docs MCP gerekli mi değerlendir.
2. Domain allowlist yaz.
3. Time MCP için timezone testing notları ekle.
4. `docs/optional-mcp-servers.md` oluştur.
5. Hangi MCP’lerin şimdilik yasak olduğunu netleştir.

Testler:

```bash
npm run check:secrets
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: add optional MCP server guidance"
git push
```

Compact:

```txt
ASM-4 ve ASM-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ASM-6 — Agent Readiness CI

Yapılacaklar:

1. `scripts/check-agent-readiness.ts` ekle.
2. Kontrol etsin:
   - AGENTS.md var mı?
   - CLAUDE.md var mı?
   - .claude/skills altında SKILL.md dosyaları valid mi?
   - .mcp.json commitlenmemiş mi?
   - .mcp.json.example var mı?
   - docs/mcp-security-policy.md var mı?
3. package.json script ekle:
   - `agent:check`
4. CI içine ekle.

Testler:

```bash
npm run agent:check
npm run validate:skills
npm run check:secrets
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "ci: add agent readiness checks"
git push
```

---

## Phase ASM-7 — Final QA ve Release

Yapılacaklar:

1. Tüm skills testlerini çalıştır.
2. MCP example dosyasını secret scan’den geçir.
3. README’ye Agent Skills + MCP bölümü ekle.
4. CHANGELOG güncelle.
5. Release tag oluştur.

Final testler:

```bash
npm run agent:check
npm run validate:skills
npm run check:secrets
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Commit/tag:

```bash
git add .
git commit -m "docs: finalize agent skills and MCP integration"
git push
git tag v1.5.0-agent-skills-mcp
git push origin v1.5.0-agent-skills-mcp
```

---

# 9. Claude Code Ana Prompt

```txt
Read RANDEVO_AGENT_SKILLS_AND_MCP_INTEGRATION_PLAN.md completely.

We are adding project-specific Agent Skills and MCP setup guidance to Randevo.

Do not implement all phases at once.

Start with Phase ASM-0 only:
- Audit existing .claude, AGENTS.md, CLAUDE.md, MCP, package scripts, and docs.
- Create docs/agent-skills-and-mcp-plan.md.
- Create docs/mcp-security-policy.md.
- Create .mcp.json.example with no real secrets.
- Ensure real .mcp.json is gitignored.
- Do not install MCP servers yet.
- Do not change product behavior.
- Run:
  - npm run check:secrets
  - npm run validate:skills
  - npm test
  - npm run build
- If any command does not exist, document it clearly.
- Commit and push only if checks pass.

Important:
- MCP servers are high-trust tools. Use minimum permissions.
- Do not commit secrets.
- Do not enable production database write access.
- Do not add email/WhatsApp/payment write MCPs.
- After every 2 phases update docs/COMPACT_STATE.md and run/request /compact.
```

---

# 10. Codex Ana Prompt

```txt
Read RANDEVO_AGENT_SKILLS_AND_MCP_INTEGRATION_PLAN.md and AGENTS.md.

Implement Phase ASM-0 only.

Scope:
- Add docs/agent-skills-and-mcp-plan.md.
- Add docs/mcp-security-policy.md.
- Add .mcp.json.example.
- Ensure .mcp.json is ignored.
- Do not install or run external MCP servers.
- Do not change app behavior.

Before commit:
- Run npm run check:secrets
- Run npm run validate:skills
- Run npm test
- Run npm run build

Commit and push only if checks pass.
Stop after Phase ASM-0 and summarize.
```

---

# 11. Uygulama Sonrası Kullanım Promptları

## Payment değişikliği yaparken

```txt
Use payment-provider-guard.

I am changing appointment deposit payment logic.
Review webhook idempotency, backend-only payment status updates, fake provider tests, and tenant isolation before making changes.
```

## Marketplace localization bug fix yaparken

```txt
Use global-address-qa and i18n-localization-qa.

I am changing marketplace country/location filters.
Ensure TURKEY_PROVINCES is only used for countryCode === "TR".
Italy must not show Turkey provinces.
Add regression tests.
```

## E2E test yazarken

```txt
Use e2e-playwright-qa.

Add a Playwright regression test for:
- Turkey selected -> Adana visible
- Italy selected -> Adana not visible
- Italy selected -> city/locality fallback works
```

## MCP eklerken

```txt
Use mcp-security-audit.

I want to add a new MCP server.
Assess data access, permissions, secret handling, allowed environment, and whether it should be read-only or disabled by default.
Do not edit .mcp.json until the policy is updated.
```

---

# 12. Final Definition of Done

```txt
- AGENTS.md MCP/Skills kurallarını içeriyor.
- CLAUDE.md varsa Claude Code kuralları güncel.
- .claude/skills altında Randevo-specific skills var.
- Her skill geçerli SKILL.md frontmatter içeriyor.
- docs/skills-index.md var.
- docs/mcp-security-policy.md var.
- docs/mcp-installation-guide.md var.
- .mcp.json.example var.
- Gerçek .mcp.json gitignore içinde.
- GitHub MCP kurulumu dokümante edildi.
- Playwright MCP kurulumu dokümante edildi.
- Database MCP sadece read-only/local-staging olarak planlandı.
- Fetch/docs MCP allowlist ile sınırlandı.
- Agent readiness script CI’a bağlandı.
- Testler geçiyor.
- Build geçiyor.
- GitHub push ve tag tamamlandı.
```
