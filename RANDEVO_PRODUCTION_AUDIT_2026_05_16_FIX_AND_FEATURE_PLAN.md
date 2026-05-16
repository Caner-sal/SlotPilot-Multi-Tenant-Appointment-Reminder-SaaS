# Randevo — 16 Mayıs 2026 Production Audit Bugfix + Eklenmesi Gereken Özellikler Planı

> Kaynak: 16 Mayıs 2026 tarihli Codex proje geneli taraması  
> Durum: `phase:gate` geçti, E2E tarafında 15 testten 1 test kırık  
> Amaç: Codex’in bulduğu mevcut hata/riskleri düzeltmek ve bu riskleri kalıcı olarak önlemek için gerekli hardening özelliklerini eklemek.

---

## 1. Kapsam

Bu plan iki parçadan oluşur:

```txt
A) Mevcut hata ve risklerin düzeltilmesi
B) Aynı hataların tekrar çıkmasını engelleyecek gerekli özelliklerin eklenmesi
```

Bu dosya büyük ürün özelliği ekleme planı değildir. Ama production güvenliği için gerekli olan bazı altyapı özellikleri eklenmelidir.

---

## 2. Codex Audit Özeti

Codex taramasına göre:

```txt
- phase:gate geçti
- E2E’de 15 testten 1’i kırık
- Production için bazı güvenlik, runtime, tenant ve test stabilite riskleri var
```

Ana bulgular:

```txt
1. Middleware Edge runtime uyumluluk riski
2. Mobile JWT secret için güvensiz fallback
3. Multi-tenant context’in ilk üyelik üzerinden seçilmesi
4. E2E onboarding testinde required alan eksikliği
5. Logger yerine console.* kullanımı
6. Encoding bozulmaları
7. Provider factory’lerde production’da FAKE fallback riski
8. Invite accept endpointinde rate limit eksikliği
```

---

## 3. Bulgu Tablosu

| ID | Bulgu | Etki | Dosya / Satır | Aksiyon |
|---|---|---|---|---|
| F-001 | Middleware, `auth` üzerinden Prisma/bcrypt zincirini Edge runtime’a taşıyor | High | `src/middleware.ts:1`, `src/lib/auth.ts:3-4` | Edge-safe middleware auth ayrımı |
| F-002 | Mobile JWT secret güvensiz fallback kullanıyor | High | `src/lib/mobile-jwt.ts:18` | Production fail-fast secret validation |
| F-003 | Tenant context ilk üyeliği seçiyor | High | `src/lib/tenant.ts:21` | Aktif organization seçimi ve membership validation |
| F-004 | E2E onboarding testinde required field eksik | High | `tests/e2e/dark-select-phone-regression.spec.ts:52,63`, `src/app/(auth)/onboarding/page.tsx:201` | Testi gerçek akışa uygun düzelt |
| F-005 | `console.*` PII/log sızıntısı riski | Medium | `src/services/audit.service.ts:26`, `src/app/api/staff/invite/route.ts:70` | Redacted logger kullanımı |
| F-006 | Encoding bozulmaları | Medium | `src/app/dashboard/billing/page.tsx:64,77`, `src/app/api/payment/manual/route.ts:33` | UTF-8/metin düzeltmesi |
| F-007 | Provider factory default `FAKE` fallback | Medium | `src/services/calendar/calendar.factory.ts:10`, `src/services/whatsapp/whatsapp.factory.ts:10` | Production fail-fast provider validation |
| F-008 | Invite accept endpointinde rate limit yok | Medium | `src/app/api/auth/accept-invite/route.ts:33` | IP/token bazlı rate limit |

---

# 4. Eklenmesi Gereken Özellikler

Bu bölümdeki maddeler “nice-to-have” değildir. Codex auditinde bulunan riskleri kalıcı olarak azaltmak için eklenmesi gereken altyapı özellikleridir.

---

## 4.1 Active Organization Selector

### Neden Gerekli?

Şu an tenant context ilk üyelik üzerinden seçiliyor. Çoklu organizasyon üyeliğinde bu riskli.

```txt
Mevcut risk:
User -> Organization A ve Organization B üyesi
Sistem -> createdAt asc ile ilk üyeliği seçiyor
Sonuç -> kullanıcı yanlış organizasyonda işlem yapabilir
```

### Eklenmesi Gereken Özellik

```txt
- Kullanıcı aktif organizasyon seçebilmeli.
- Seçilen organization session/cookie/profile içinde saklanmalı.
- Her request’te membership doğrulanmalı.
- Cookie’deki orgId tek başına güvenilir kabul edilmemeli.
```

### UI Etkisi

Dashboard header veya sidebar içinde küçük bir organization switcher olmalı:

```txt
Aktif İşletme: Berber Demo ▼
```

### Teknik Dosyalar

```txt
src/components/organization/OrganizationSwitcher.tsx
src/lib/tenant/active-organization.ts
src/lib/tenant/require-active-organization.ts
src/app/api/organization/active/route.ts
```

### Kabul Kriterleri

```txt
- Çoklu organizasyon üyesi kullanıcı aktif organization seçebilir.
- Seçim cookie/session içinde korunur.
- Yetkisi olmayan organization seçilemez.
- Tenant isolation testleri geçer.
```

---

## 4.2 Production Env Validation / Startup Guard

### Neden Gerekli?

Mobile JWT secret, provider seçimi ve benzeri kritik env eksiklerinde uygulama sessizce zayıf fallback’e düşebiliyor.

### Eklenmesi Gereken Özellik

```txt
- Production startup sırasında zorunlu env kontrolü yapılmalı.
- Eksik veya zayıf secret varsa uygulama fail-fast yapmalı.
- Provider env eksikse production’da FAKE provider’a düşülmemeli.
```

### Kontrol Edilecek Env’ler

```txt
MOBILE_JWT_SECRET
NEXTAUTH_SECRET / AUTH_SECRET
DATABASE_URL
WHATSAPP_PROVIDER
CALENDAR_PROVIDER
PAYMENT_PROVIDER
CRON_SECRET
APP_URL
```

### Teknik Dosyalar

```txt
src/lib/env/validate-env.ts
src/lib/env/production-guard.ts
src/lib/env/provider-env.ts
scripts/check-production-env.ts
```

### Package Script

```json
{
  "scripts": {
    "env:check": "tsx scripts/check-production-env.ts"
  }
}
```

### Kabul Kriterleri

```txt
- Production’da MOBILE_JWT_SECRET yoksa build/start fail olur.
- Production’da provider eksikse fail olur.
- Development/test ortamında fake provider kontrollü şekilde kullanılabilir.
- CI içinde env check çalışır.
```

---

## 4.3 Invite Abuse Protection

### Neden Gerekli?

Invite accept endpointinde rate limit yoksa token brute-force veya abuse riski oluşur.

### Eklenmesi Gereken Özellik

```txt
- IP bazlı rate limit
- Token bazlı başarısız deneme limiti
- Çok fazla başarısız denemede temporary lock
- Güvenli hata mesajları
- Audit log
```

### Teknik Dosyalar

```txt
src/lib/rate-limit/rate-limit.ts
src/lib/rate-limit/invite-rate-limit.ts
src/app/api/auth/accept-invite/route.ts
```

### Önerilen Limitler

```txt
IP: 10 deneme / 10 dakika
Token: 5 başarısız deneme / 15 dakika
Lock: 15 dakika temporary lock
```

### Kabul Kriterleri

```txt
- Limit aşılınca 429 döner.
- Hata response token/email/PII sızdırmaz.
- Valid token normal çalışır.
- Accepted token tekrar kullanılamaz.
```

---

## 4.4 E2E Stability Package

### Neden Gerekli?

Codex çıktısında E2E testlerden biri kırık. Sorun uygulamadan çok testin required alanları doldurmadan ilerlemesi.

### Eklenmesi Gereken Özellik

```txt
- E2E test helperları
- Deterministic onboarding data factory
- Stable selectors
- Required field validation testleri
- Flaky retry politikası
```

### Teknik Dosyalar

```txt
tests/e2e/helpers/fill-onboarding.ts
tests/e2e/helpers/test-users.ts
tests/e2e/helpers/selectors.ts
tests/e2e/dark-select-phone-regression.spec.ts
playwright.config.ts
```

### Kabul Kriterleri

```txt
- Onboarding required fields boşsa ilerlemez.
- Required fields doldurulunca ilerler.
- Phone country code regression testleri stabil çalışır.
- E2E 15/15 geçer.
```

---

## 4.5 Logger Enforcement Script

### Neden Gerekli?

Redaction logger olmasına rağmen production kodunda `console.*` kalabiliyor.

### Eklenmesi Gereken Özellik

```txt
- src altında production kodunda console.* kullanımını yakalayan script
- Test dosyaları ve local dev scriptleri için istisna listesi
- CI gate’e bağlama
```

### Teknik Dosyalar

```txt
scripts/check-console-usage.ts
src/lib/logger/redact.ts
src/lib/logger/logger.ts
```

### Package Script

```json
{
  "scripts": {
    "check:logs": "tsx scripts/check-console-usage.ts"
  }
}
```

### Kabul Kriterleri

```txt
- Production route/service dosyalarında console.* kalmaz.
- Logger email/token/phone/invite URL redact eder.
- CI console usage bulursa fail olur.
```

---

## 4.6 Encoding Check Script

### Neden Gerekli?

Projede `Ã`, `Ä`, `â‚º` gibi encoding bozuklukları var.

### Eklenmesi Gereken Özellik

```txt
- Kaynak dosyalarda mojibake karakterleri yakalayan script
- Türkçe karakterlerin doğru kalmasını sağlayan kontrol
- CI gate’e bağlama
```

### Teknik Dosyalar

```txt
scripts/check-encoding.ts
```

### Package Script

```json
{
  "scripts": {
    "check:encoding": "tsx scripts/check-encoding.ts"
  }
}
```

### Kabul Kriterleri

```txt
- Ã, Ä, â‚º, � gibi bozuk karakterler yakalanır.
- Billing/payment copy düzeltilir.
- CI encoding bozukluğu bulursa fail olur.
```

---

## 4.7 Provider Health Check

### Neden Gerekli?

Provider factory production’da sessizce FAKE provider’a düşerse kullanıcı sistemin çalıştığını sanabilir ama gerçek entegrasyon çalışmaz.

### Eklenmesi Gereken Özellik

```txt
- Provider config validation
- Admin/health ekranında provider status görünümü
- Production’da fake provider warning/fail-fast
```

### Teknik Dosyalar

```txt
src/services/calendar/calendar.factory.ts
src/services/whatsapp/whatsapp.factory.ts
src/lib/providers/provider-health.ts
src/app/admin/health/page.tsx
src/app/api/admin/health/route.ts
```

### Kabul Kriterleri

```txt
- Production’da provider eksikse fail olur.
- Development/test ortamında fake provider kontrollü çalışır.
- Admin health provider durumlarını gösterir.
```

---

## 4.8 Shared Auth / Tenant Guard Helpers

### Neden Gerekli?

Route’larda dağınık `auth()+getOrganizationForUser()` tekrarları güvenlik açığına sebep olabilir.

### Eklenmesi Gereken Özellik

```txt
- requireAuth()
- requireActiveOrganization()
- assertMembership()
- requireOwner()
- requireStaff()
- requireSuperAdmin()
```

### Teknik Dosyalar

```txt
src/lib/auth/require-auth.ts
src/lib/tenant/require-membership.ts
src/lib/auth/guards.ts
```

### Kabul Kriterleri

```txt
- Kritik route’lar ortak helper kullanır.
- Tenant isolation testleri geçer.
- Staff billing/admin erişemez.
- Owner sadece kendi org’una erişir.
```

---

# 5. Kritik Kurallar

Bu düzeltmeler ve ek altyapılar yapılırken:

```txt
- Gereksiz ürün özelliği eklenmeyecek.
- Mevcut kullanıcı akışı gereksiz yere değiştirilmeyecek.
- Middleware içine Prisma, bcrypt veya Node-only dependency girmeyecek.
- Production’da zayıf/mobile JWT fallback secret kullanılmayacak.
- Tenant seçimi client input’a körlemesine güvenmeyecek.
- E2E test false-positive/false-negative üretmeyecek.
- PII, email, phone, token, invite URL console.* ile loglanmayacak.
- Production’da provider env eksikse sessiz FAKE provider’a düşülmeyecek.
- Invite accept endpointi brute-force denemelerine açık kalmayacak.
- Test fail olursa push yapılmayacak.
```

---

# 6. Phase Planı

```txt
PH-0 — Audit Baseline Documentation
PH-1 — Edge Runtime Middleware Fix
PH-2 — Mobile JWT Secret Validation + Env Guard
PH-3 — Active Organization Tenant Context
PH-4 — E2E Stability Package + Onboarding Test Fix
PH-5 — Logger / PII Redaction + Console Guard
PH-6 — Encoding Cleanup + Encoding Check
PH-7 — Provider Factory Fail-fast + Provider Health Check
PH-8 — Invite Abuse Protection
PH-9 — Shared Auth/Tenant Guard Helpers
PH-10 — Final Regression and Release
```

Her phase sonunda:

```bash
npm run phase:gate
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

E2E ilgili phase’lerde:

```bash
npm run test:e2e
```

Varsa:

```bash
npm run check:secrets
npm run i18n:check
```

Yeni eklenecek scriptler tamamlandıktan sonra:

```bash
npm run env:check
npm run check:logs
npm run check:encoding
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
Claude Code kullanılıyorsa /compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 7. Phase Detayları

---

## PH-0 — Audit Baseline Documentation

Amaç:

Codex bulgularını repo içinde belgelemek. Ürün davranışı değişmeyecek.

Yapılacaklar:

```txt
1. docs/production-audit-2026-05-16.md oluştur.
2. Codex bulgularını tablo halinde ekle.
3. Risk seviyelerini yaz.
4. Etkilenen dosya/satırları yaz.
5. Eklenmesi gereken hardening özelliklerini ayrı bölümde yaz.
6. Ürün davranışı değiştirme.
```

Komutlar:

```bash
npm run phase:gate
npm run test:e2e
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Commit:

```bash
git add .
git commit -m "docs: add 2026-05-16 production audit and hardening plan"
git push
```

---

## PH-1 — Edge Runtime Middleware Fix

Bulgu:

```txt
src/middleware.ts, auth importu üzerinden Prisma/bcrypt zincirini Edge runtime’a çekiyor.
```

Yapılacaklar:

```txt
1. src/middleware.ts import zincirini incele.
2. Middleware’den Prisma/bcrypt/Node-only auth zincirini çıkar.
3. Edge-safe auth helper oluştur.
4. Full DB lookup gereken kontrolleri route handler/server component tarafına taşı.
5. Protected route redirect davranışını koru.
6. Build uyarılarını gider.
```

Önerilen ayrım:

```txt
src/lib/auth-edge.ts
src/lib/auth-server.ts
```

Testler:

```txt
- Build Edge runtime uyarısı üretmez.
- Login olmayan protected route redirect olur.
- Login olan dashboard’a erişir.
- Middleware import graph içinde Prisma/bcrypt yoktur.
```

Commit:

```bash
git add .
git commit -m "fix: make middleware edge-runtime safe"
git push
```

---

## PH-2 — Mobile JWT Secret Validation + Env Guard

Bulgu:

```txt
src/lib/mobile-jwt.ts içinde dev-mobile-secret-change-me fallback var.
```

Eklenmesi gereken özellik:

```txt
Production Env Validation / Startup Guard
```

Yapılacaklar:

```txt
1. Güvensiz fallback’i kaldır.
2. MOBILE_JWT_SECRET env validation ekle.
3. Production’da secret yoksa throw et.
4. Production’da weak secret varsa throw et.
5. Minimum length kuralı ekle.
6. scripts/check-production-env.ts oluştur.
7. npm run env:check scriptini ekle.
8. .env.example güncelle.
9. Test yaz.
```

Kural:

```txt
Production:
- MOBILE_JWT_SECRET zorunlu
- minimum 32 karakter

Development:
- sessiz zayıf fallback kullanılmaz
```

Testler:

```txt
- production + missing secret -> fail
- production + weak secret -> fail
- valid secret -> token sign/verify çalışır
- env:check eksik env’i yakalar
```

Commit:

```bash
git add .
git commit -m "fix: enforce secure mobile jwt secret and env validation"
git push
```

Compact:

```txt
PH-1 ve PH-2 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## PH-3 — Active Organization Tenant Context

Bulgu:

```txt
src/lib/tenant.ts, findFirst createdAt asc ile ilk üyeliği seçiyor.
```

Eklenmesi gereken özellik:

```txt
Active Organization Selector
```

Yapılacaklar:

```txt
1. Mevcut tenant context mantığını incele.
2. İlk üyelik fallbackini güvenli hale getir.
3. Aktif organization seçimi için cookie/session tercihi ekle.
4. OrganizationSwitcher componenti ekle.
5. Cookie’deki org id membership ile doğrulansın.
6. Membership yoksa reddedilsin veya güvenli default seçilsin.
7. Test yaz.
```

Teknik dosyalar:

```txt
src/components/organization/OrganizationSwitcher.tsx
src/lib/tenant/active-organization.ts
src/lib/tenant/require-active-organization.ts
src/app/api/organization/active/route.ts
```

Testler:

```txt
- User iki organization üyesiyse aktif org kullanılır.
- Cookie’deki org user’a ait değilse reddedilir.
- Organization switcher aktif org’u değiştirir.
- Staff/owner tenant isolation bozulmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add validated active organization context"
git push
```

---

## PH-4 — E2E Stability Package + Onboarding Test Fix

Bulgu:

```txt
Onboarding E2E required alanları doldurmadan ilerliyor.
```

Eklenmesi gereken özellik:

```txt
E2E Stability Package
```

Yapılacaklar:

```txt
1. Onboarding page required alanlarını çıkar.
2. Testte required alanları deterministik doldur.
3. E2E helperları oluştur.
4. Stable selectors ekle.
5. Phone country code regression akışını koru.
6. Kırık E2E testi düzelt.
```

Teknik dosyalar:

```txt
tests/e2e/helpers/fill-onboarding.ts
tests/e2e/helpers/test-users.ts
tests/e2e/helpers/selectors.ts
tests/e2e/dark-select-phone-regression.spec.ts
```

Testler:

```txt
- Required alanlar boşken ilerlemez.
- Required alanlar doluyken ilerler.
- Country Spain -> +34
- Country Turkey -> +90
- E2E 15/15 geçer.
```

Commit:

```bash
git add .
git commit -m "test: stabilize onboarding e2e flow"
git push
```

Compact:

```txt
PH-3 ve PH-4 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## PH-5 — Logger / PII Redaction + Console Guard

Bulgu:

```txt
console.* kullanımı PII/log sızıntısı riski oluşturuyor.
```

Eklenmesi gereken özellik:

```txt
Logger Enforcement Script
```

Yapılacaklar:

```txt
1. console.log/error/warn kullanımını tara.
2. Production route/service içinde console.* kullanımını kaldır.
3. Redacted logger kullan.
4. Email, token, invite URL, phone gibi PII alanlarını redact et.
5. scripts/check-console-usage.ts oluştur.
6. npm run check:logs scriptini ekle.
7. Test yaz.
```

Arama:

```bash
grep -R "console.log" src
grep -R "console.error" src
grep -R "console.warn" src
```

Testler:

```txt
- Invite URL loglanmaz.
- Token loglanmaz.
- Email masked görünür.
- Production route console.* içermez.
- check:logs console kullanımını yakalar.
```

Commit:

```bash
git add .
git commit -m "fix: enforce redacted logging and block unsafe console logs"
git push
```

---

## PH-6 — Encoding Cleanup + Encoding Check

Bulgu:

```txt
Billing/payment copy içinde encoding bozulmaları var.
```

Eklenmesi gereken özellik:

```txt
Encoding Check Script
```

Yapılacaklar:

```txt
1. Encoding bozuk karakterleri tara.
2. Billing page metinlerini düzelt.
3. Manual payment response metnini düzelt.
4. TRY sembolünü doğru kullan: ₺
5. scripts/check-encoding.ts oluştur.
6. npm run check:encoding scriptini ekle.
7. Test/snapshot varsa güncelle.
```

Arama:

```bash
grep -R "Ã" src
grep -R "Ä" src
grep -R "â" src
grep -R "â‚º" src
grep -R "�" src
```

Testler:

```txt
- Bozuk karakter kalmaz.
- ₺ doğru görünür.
- Türkçe karakterler doğru görünür.
- check:encoding bozuk karakterleri yakalar.
```

Commit:

```bash
git add .
git commit -m "fix: repair encoding issues and add encoding check"
git push
```

Compact:

```txt
PH-5 ve PH-6 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## PH-7 — Provider Factory Fail-fast + Provider Health Check

Bulgu:

```txt
Provider factory defaultta FAKE’e düşüyor.
```

Eklenmesi gereken özellik:

```txt
Provider Health Check
```

Yapılacaklar:

```txt
1. calendar.factory ve whatsapp.factory fallback mantığını incele.
2. production ortamında FAKE fallback’i engelle.
3. Development/test ortamında FAKE provider kullanılabilir kalsın.
4. Production env validation ekle.
5. Provider health helper ekle.
6. Admin health ekranı veya API provider durumunu gösterebiliyorsa bağla.
7. Test yaz.
```

Testler:

```txt
- production + missing provider -> throw
- production + fake provider -> throw veya explicit flag ister
- development + missing provider -> fake allowed
- provider health status döner
```

Commit:

```bash
git add .
git commit -m "fix: prevent silent fake providers and add provider health checks"
git push
```

---

## PH-8 — Invite Abuse Protection

Bulgu:

```txt
Invite accept endpointinde rate limit yok.
```

Eklenmesi gereken özellik:

```txt
Invite Abuse Protection
```

Yapılacaklar:

```txt
1. Mevcut rate limit helper var mı incele.
2. Yoksa reusable basit rate limit abstraction ekle.
3. accept-invite route’a IP bazlı limit ekle.
4. Token bazlı başarısız deneme limiti ekle.
5. Çok fazla denemede 429 dön.
6. Güvenli hata mesajı dön.
7. Audit log ekle.
8. Test yaz.
```

Önerilen limitler:

```txt
IP: 10 deneme / 10 dakika
Token: 5 başarısız deneme / 15 dakika
Lock: 15 dakika temporary lock
```

Testler:

```txt
- Limit aşılınca 429 döner.
- Invalid token denemeleri sayılır.
- Valid token kabul edilir.
- Accepted token tekrar kullanılamaz.
- Error response token/PII sızdırmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add invite acceptance abuse protection"
git push
```

Compact:

```txt
PH-7 ve PH-8 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## PH-9 — Shared Auth/Tenant Guard Helpers

Eklenmesi gereken özellik:

```txt
Shared Auth / Tenant Guard Helpers
```

Yapılacaklar:

```txt
1. Route’larda auth + tenant tekrarlarını listele.
2. requireAuth helper oluştur.
3. requireActiveOrganization helper oluştur.
4. assertMembership helper oluştur.
5. requireOwner / requireStaff / requireSuperAdmin helperları oluştur.
6. En kritik route’ları helperlara taşı.
7. docs/auth-tenant-helper-strategy.md oluştur.
8. Test yaz.
```

Testler:

```txt
- Login olmayan kullanıcı reddedilir.
- Üyeliği olmayan organization reddedilir.
- Staff billing/admin erişemez.
- Owner kendi org’una erişir.
- Superadmin admin route’a erişir.
```

Commit:

```bash
git add .
git commit -m "refactor: add shared auth and tenant guard helpers"
git push
```

---

## PH-10 — Final Regression and Release

Amaç:

Tüm düzeltmeleri final testten geçirmek.

Yapılacaklar:

```txt
1. docs/production-audit-2026-05-16.md güncelle.
2. CHANGELOG güncelle.
3. Final testleri çalıştır.
4. E2E 15/15 geçtiğini doğrula.
5. Yeni scriptleri gate’e bağla.
6. Release tag oluştur.
```

Final komutlar:

```bash
npm run phase:gate
npm run test:e2e
npm run check:secrets
npm run i18n:check
npm run env:check
npm run check:logs
npm run check:encoding
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Commit/tag:

```bash
git add .
git commit -m "chore: finalize production audit fixes and hardening"
git push
git tag v1.6.4-production-audit-hardening
git push origin v1.6.4-production-audit-hardening
```

---

# 8. Codex Ana Prompt

```txt
Read RANDEVO_PRODUCTION_AUDIT_2026_05_16_FIX_AND_FEATURE_PLAN.md completely.

We have a production audit from 16 May 2026.
phase:gate passed, but E2E has 1 failing test out of 15.

This plan includes both:
1. Fixes for current bugs/risks
2. Required hardening features to prevent the same risks from coming back

Do not add unrelated features.
Follow PH-0 through PH-10 in order.

Start with PH-0 only:
- Create docs/production-audit-2026-05-16.md from the audit findings.
- Include both current findings and required hardening features.
- Do not change product behavior yet.
- Run available checks:
  npm run phase:gate
  npm run test:e2e
  npm run typecheck
  npm run lint
  npm test
  npm run build
  npx prisma validate
  npx prisma generate
- If a command does not exist, document it.
- Commit and push only if checks pass.
- Stop after PH-0 and summarize.
```

---

# 9. Full Auto Prompt

```txt
Read RANDEVO_PRODUCTION_AUDIT_2026_05_16_FIX_AND_FEATURE_PLAN.md completely.

Implement all phases from PH-0 to PH-10 in order.

After each phase:
- Run all available checks.
- Fix failures before continuing.
- Commit with a meaningful message.
- Push only if checks pass.
- Update CHANGELOG.md if it exists.

After every 2 phases:
- Update docs/COMPACT_STATE.md.
- Run/request /compact.

Critical rules:
- Do not add unrelated features.
- Do not break existing auth flows.
- Do not import Prisma/bcrypt into Edge middleware.
- Do not allow unsafe JWT secret fallback in production.
- Add production env validation.
- Add active organization selection and membership validation.
- Stabilize the broken E2E onboarding flow.
- Do not log PII, invite URLs, tokens, emails, or phone numbers with console.*.
- Add console usage guard.
- Fix encoding issues and add encoding guard.
- Do not silently use FAKE providers in production.
- Add provider health validation.
- Add invite abuse protection.
- Add shared auth/tenant guard helpers.
- Do not hide failing tests.
- Do not commit secrets.
- Do not force push.
```

---

# 10. Final Definition of Done

```txt
- Middleware is Edge-safe.
- Prisma/bcrypt are not pulled into Edge middleware.
- MOBILE_JWT_SECRET is required and strong in production.
- Production env validation exists.
- Active organization context exists.
- Organization switcher or equivalent active org mechanism exists.
- Tenant membership is validated for active org.
- E2E onboarding regression is fixed.
- E2E stability helpers exist.
- E2E passes 15/15.
- Unsafe console.* logs are removed or blocked.
- check:logs script exists.
- Invite email/url/token are not leaked in logs.
- Encoding issues are fixed.
- check:encoding script exists.
- Provider factories fail fast in production.
- Provider health check exists.
- Invite accept endpoint has rate limiting and abuse protection.
- Shared auth/tenant helpers exist.
- phase:gate passes.
- Build passes.
- Tests pass.
- GitHub push and release tag completed.
```

---

# 11. Final Review Prompt

```txt
Review the production audit fixes and required hardening features.

Check:
1. Is middleware Edge-runtime safe?
2. Are Prisma and bcrypt absent from middleware import chain?
3. Does production fail without MOBILE_JWT_SECRET?
4. Is the mobile JWT secret length validated?
5. Does production env validation exist?
6. Does tenant context use active organization selection?
7. Is membership validated for selected active org?
8. Is there an organization switcher or equivalent active org mechanism?
9. Is the broken onboarding E2E fixed?
10. Do all E2E tests pass?
11. Are E2E helpers stable and deterministic?
12. Are console.* PII logs removed?
13. Does check:logs exist and pass?
14. Are invite URL/token/email redacted?
15. Are encoding issues fixed?
16. Does check:encoding exist and pass?
17. Do provider factories fail fast in production instead of silently using FAKE?
18. Does provider health validation exist?
19. Is invite accept rate limited?
20. Are auth/tenant helpers consolidated?
21. Does phase:gate pass?
22. Does build pass?
23. Has everything been committed and pushed?

Fix only small issues.
Do not add unrelated features.
Create final release notes.
```
