# SlotPilot Türkiye Yerelleştirme Planı — Claude Code / Antigravity Update Brief

> Bu dosya, SlotPilot projesinin Türkiye pazarına uyarlanması için hazırlanmıştır.  
> Ana SlotPilot MVP ve Post-MVP expansion adımları tamamlandıktan sonra uygulanacak yeni güncelleme planıdır.  
> Amaç: Dil, para birimi, şehir/ilçe sistemi, yerel ödeme altyapısı, KVKK/İYS izinleri, Türkiye marketplace yapısı ve yerel faturalama hazırlığını planlı şekilde eklemek.

---

## 1. Ana Hedef

SlotPilot artık global/İngilizce bir SaaS MVP yerine Türkiye’de küçük işletmelerin kullanabileceği yerel bir randevu SaaS ürününe dönüştürülecek.

Ana hedefler:

```txt
- Arayüz tamamen Türkçe olacak.
- Varsayılan para birimi Türk lirası olacak.
- Türkiye şehirleri ve büyükşehir ilçeleri desteklenecek.
- Abonelik paketleri Türkiye fiyatlarına göre düzenlenecek.
- Başlangıç planı 40 TL / ay olacak.
- Pro planı 249 TL / ay olacak.
- Türkiye’ye uygun ödeme sağlayıcı altyapısı eklenecek.
- KVKK ve ticari ileti izinleri ayrıştırılacak.
- Türkiye’ye özel bildirim şablonları eklenecek.
- Marketplace şehir/kategori bazlı Türkçe çalışacak.
- Her phase sonunda test + commit + push yapılacak.
- En fazla 2 phase tamamlandıktan sonra compact protokolü çalışacak.
```

---

## 2. Türkiye Pazarına Göre Ürün Kararları

### 2.1 Hedef Müşteri

Türkiye versiyonu özellikle şu işletmeleri hedefler:

```txt
- Kuaförler
- Berberler
- Güzellik salonları
- Protez tırnak / nail art stüdyoları
- Diyetisyenler
- Psikolojik danışmanlık ofisleri
- Özel ders verenler
- Spor eğitmenleri
- Pilates/yoga stüdyoları
- Klinik dışı randevulu danışmanlık hizmetleri
- Kurs ve atölye merkezleri
- Oto bakım / ekspertiz randevu işletmeleri
- Pet kuaförleri
```

### 2.2 Türkiye’de Çözülmesi Gereken Sorun

Türkiye’de birçok küçük işletme randevuları şu kanallarla yönetir:

```txt
- WhatsApp
- Instagram DM
- Telefon araması
- Kağıt ajanda
- Excel
- Google Calendar
```

Bu yöntemlerde sık görülen problemler:

```txt
- Randevular karışır.
- Müşteri randevuyu unutur.
- Aynı saate iki kişi yazılır.
- Kapora takibi manuel yapılır.
- İşletme yoğun gün/saat raporu alamaz.
- Müşteri işletme kapalıyken randevu alamaz.
- Randevu iptali ve no-show oranı izlenemez.
```

### 2.3 Türkiye’ye Uygun Değer Önerisi

```txt
Küçük işletmeler için Türkçe, uygun fiyatlı, WhatsApp/SMS/e-posta hatırlatma altyapısına hazır, kapora ve randevu yönetimi odaklı SaaS randevu sistemi.
```

---

## 3. Araştırma Notları

Bu plan Türkiye pazarına uyarlanırken şu başlıklar dikkate alınmıştır:

```txt
- KVKK tarafında aydınlatma yükümlülüğü ve açık rıza süreçleri ayrı ele alınmalıdır.
- Ticari elektronik ileti izinleri İYS mantığına uygun ayrı consent alanlarıyla tutulmalıdır.
- Türkiye’de ödeme için Stripe dışında iyzico, PayTR, Param, Sipay, banka sanal POS ve manuel havale/EFT akışı düşünülmelidir.
- GİB e-Arşiv/e-Fatura tarafında doğrudan resmi entegrasyon yerine ilk aşamada export-ready veri yapısı yapılmalıdır.
- Türkiye’de adresleme il/ilçe temelli kurulmalıdır.
```

Kaynak notları:

```txt
- KVKK resmi sitesi: Aydınlatma yükümlülüğü ve açık rıza süreçlerinin ayrılığı.
- İYS resmi sitesi ve Ticaret Bakanlığı: Ticari elektronik ileti izinlerinin merkezi yönetimi.
- iyzico geliştirici dokümanları: Türkiye ödeme API entegrasyon seçenekleri.
- PayTR geliştirici dokümanları: Sanal POS / iFrame / direkt API entegrasyon akışları.
- GİB e-Arşiv / e-Fatura portalları: Elektronik belge süreçleri için resmi platformlar.
```

---

## 4. Türkiye Fiyatlandırması

### 4.1 Paketler

```txt
Ücretsiz Plan — 0 TL / ay
Başlangıç Planı — 40 TL / ay
Pro Plan — 249 TL / ay
Kurumsal Plan — Teklif al
```

### 4.2 Paket Limitleri

#### Ücretsiz Plan

```txt
- 1 işletme
- 1 çalışan
- 20 randevu / ay
- Public booking link
- Temel dashboard
- E-posta hatırlatma yok
- SMS/WhatsApp yok
- Marketplace görünürlüğü yok
```

#### Başlangıç Planı — 40 TL / ay

```txt
- 1 işletme
- 3 çalışan
- 300 randevu / ay
- Türkçe public booking sayfası
- E-posta hatırlatma
- Temel raporlar
- Türkiye il/ilçe adres desteği
- CSV export
```

#### Pro Plan — 249 TL / ay

```txt
- Sınırsız çalışan
- 2.000 randevu / ay
- SMS/WhatsApp provider altyapısı
- Kapora ödeme altyapısı
- Marketplace görünürlüğü
- Gelişmiş raporlar
- Çoklu şube desteği
- e-Arşiv/e-Fatura export hazırlığı
```

#### Kurumsal Plan — Teklif al

```txt
- Çoklu işletme/şube
- Özel entegrasyon
- Özel destek
- Muhasebe entegrasyonu
- Yüksek hacimli randevu limiti
- SLA ve özel onboarding
```

### 4.3 Yıllık İndirim Placeholder

```txt
Yıllık ödemede 2 ay ücretsiz.
Başlangıç yıllık: 400 TL / yıl
Pro yıllık: 2.490 TL / yıl
```

Not:

```txt
Fiyatlar MVP denemesi içindir. Canlı ticari kullanım öncesi vergi, KDV, ödeme kuruluşu komisyonları ve faturalama süreçleri muhasebeciyle doğrulanmalıdır.
```

---

## 5. Türkiye’ye Özel Yeni Özellikler

```txt
1. Türkçe UI ve i18n
2. tr-TR tarih/saat/para formatı
3. TRY para birimi
4. Türkiye il/ilçe verisi
5. Türkiye adres formatı
6. +90 telefon normalizasyonu
7. Türkiye abonelik paketleri
8. Yerel ödeme sağlayıcı abstraction
9. Havale/EFT manuel ödeme akışı
10. iyzico/PayTR/Param adapter placeholder
11. KVKK aydınlatma metni alanları
12. Açık rıza ve aydınlatma ayrımı
13. Ticari ileti / pazarlama izni ayrımı
14. İYS uyumlu izin mimarisi
15. Türkçe SMS/e-posta/WhatsApp şablonları
16. Türkiye marketplace kategori ve şehir filtreleri
17. e-Arşiv/e-Fatura export hazırlığı
18. Resmi tatil ve özel gün desteği
19. Her 2 phase sonrası compact protokolü
20. Her phase sonunda GitHub commit + push
```

---

## 6. Yeni Agent Listesi

`.claude/agents/` klasörüne şu agent dosyaları eklenecek:

```txt
turkey-product-agent.md
i18n-localization-agent.md
turkey-data-agent.md
turkey-pricing-agent.md
local-payment-agent.md
kvkk-compliance-agent.md
turkey-notification-agent.md
turkey-marketplace-agent.md
turkey-invoice-agent.md
turkey-holiday-agent.md
turkey-qa-agent.md
compact-maintainer-agent.md
github-release-agent.md
```

---

# 7. Agent Tanımları

## 7.1 `turkey-product-agent.md`

```md
---
name: turkey-product-agent
description: Use this agent to adapt SlotPilot product strategy, Turkish pricing, packaging, target users, and local feature priorities.
tools: Read, Write, Edit
---

You are the Turkey Product Agent for SlotPilot.

Responsibilities:
- Rewrite product assumptions for the Turkish market.
- Define Turkish target customers.
- Define Turkish pricing packages.
- Update package limits.
- Create docs/turkiye-product-strategy.md.
- Keep monetization realistic for small Turkish businesses.

Rules:
- Customer-facing copy must be Turkish.
- Use TRY prices.
- Keep package limits enforceable by backend.
- Do not claim legal, tax, accounting, or compliance guarantees.
```

## 7.2 `i18n-localization-agent.md`

```md
---
name: i18n-localization-agent
description: Use this agent to implement Turkish UI language, i18n dictionaries, tr-TR date/time/currency formatting, and Turkish copy review.
tools: Read, Write, Edit, Bash
---

You are the i18n Localization Agent.

Responsibilities:
- Add i18n dictionary structure.
- Translate customer-facing UI strings to Turkish.
- Format dates with tr-TR locale.
- Format currency with TRY.
- Use Europe/Istanbul timezone.
- Replace English dashboard labels with Turkish equivalents.
- Add Turkish validation messages.
- Add tests for formatting helpers.

Rules:
- Do not hardcode random UI strings.
- Prefer dictionary keys.
- Developer/internal code names can stay English.
- Public UI must be Turkish.
```

## 7.3 `turkey-data-agent.md`

```md
---
name: turkey-data-agent
description: Use this agent to add Turkey province/city seed data, district support, address model updates, phone normalization, and related tests.
tools: Read, Write, Edit, Bash
---

You are the Turkey Data Agent.

Responsibilities:
- Add Province model or static province data.
- Add 81 Turkish provinces.
- Add district support for major cities first.
- Update business address model.
- Add +90 phone normalization.
- Add Turkish postal/address validation helpers.
- Add tests for province, district, and phone formatting.

Rules:
- Existing organizations must get safe default address data.
- Do not break multi-location support.
- Phone should be stored normalized and displayed localized.
```

## 7.4 `turkey-pricing-agent.md`

```md
---
name: turkey-pricing-agent
description: Use this agent to implement Turkish subscription plans, TRY pricing, package limits, price display, and migration from global plans.
tools: Read, Write, Edit, Bash
---

You are the Turkey Pricing Agent.

Responsibilities:
- Add Turkey-specific pricing configuration.
- Implement Ücretsiz, Başlangıç, Pro, Kurumsal plans.
- Set Başlangıç to 40 TRY/month.
- Set Pro to 249 TRY/month.
- Add annual discount placeholders.
- Update backend plan limit checks.
- Update billing UI in Turkish.
- Add tests for plan limits and price formatting.

Rules:
- Backend must enforce plan limits.
- Price display must use Turkish Lira.
- Do not remove old global plan code unless migration is safe.
```

## 7.5 `local-payment-agent.md`

```md
---
name: local-payment-agent
description: Use this agent to implement Turkish payment provider abstraction, manual bank transfer, iyzico/PayTR placeholders, and local payment tests.
tools: Read, Write, Edit, Bash
---

You are the Local Payment Agent.

Responsibilities:
- Create PaymentProvider abstraction for Turkey.
- Add providers: MANUAL_BANK_TRANSFER, IYZICO, PAYTR, PARAM, STRIPE_TEST.
- Implement manual bank transfer flow.
- Add payment instructions page.
- Add payment proof upload placeholder.
- Add iyzico/PayTR adapter stubs.
- Update .env.example.
- Add tests for provider selection and manual payment status.

Rules:
- Do not use real API keys.
- Do not implement real production payments without explicit approval.
- Use fake provider in tests.
- All payment confirmations must be backend-controlled.
```

## 7.6 `kvkk-compliance-agent.md`

```md
---
name: kvkk-compliance-agent
description: Use this agent to implement KVKK consent structure, Turkish privacy copy placeholders, consent logs, marketing permission separation, and data deletion request flow.
tools: Read, Write, Edit, Bash
---

You are the KVKK Compliance Agent.

Responsibilities:
- Add KVKK consent fields.
- Separate privacy notice acknowledgement from explicit consent.
- Separate appointment notifications from marketing consent.
- Add consent log model.
- Add customer data deletion request model.
- Add Turkish placeholder texts for KVKK and açık rıza.
- Add tests for consent requirements.

Rules:
- Do not present placeholder legal text as final legal advice.
- Marketing consent must be optional and separate.
- Appointment creation should require privacy notice acknowledgement.
- Consent logs should be auditable.
```

## 7.7 `turkey-notification-agent.md`

```md
---
name: turkey-notification-agent
description: Use this agent to add Turkish email/SMS/WhatsApp templates, appointment notification vs marketing distinction, and localized reminder timing.
tools: Read, Write, Edit, Bash
---

You are the Turkey Notification Agent.

Responsibilities:
- Add Turkish notification templates.
- Add reminder timing presets common in Turkey.
- Separate transactional appointment reminders from marketing messages.
- Add opt-in checks.
- Add provider fake mode tests.
- Add Turkish copy for reminders.
- Update reminder docs.

Rules:
- Do not send real SMS/WhatsApp in tests.
- Marketing messages require marketing consent.
- Appointment reminders should not be mixed with campaign messages.
```

## 7.8 `turkey-marketplace-agent.md`

```md
---
name: turkey-marketplace-agent
description: Use this agent to localize marketplace categories, city filters, business profile copy, SEO metadata, and Turkey-specific service categories.
tools: Read, Write, Edit, Bash
---

You are the Turkey Marketplace Agent.

Responsibilities:
- Add Turkish marketplace categories.
- Add city/province filters.
- Add Turkish SEO metadata.
- Add local business category pages.
- Add Turkish landing page copy.
- Add tests for city/category filtering.

Rules:
- Only show marketplaceEnabled businesses.
- Do not expose private customer data.
- Public pages must be Turkish.
```

## 7.9 `turkey-invoice-agent.md`

```md
---
name: turkey-invoice-agent
description: Use this agent to add e-Arşiv/e-Fatura ready export fields, invoice information forms, tax office/VKN/TCKN fields, and accounting export notes.
tools: Read, Write, Edit, Bash
---

You are the Turkey Invoice Agent.

Responsibilities:
- Add invoice profile fields.
- Add VKN/TCKN optional fields.
- Add tax office field.
- Add company title field.
- Add e-Arşiv/e-Fatura export-ready CSV/JSON.
- Add invoice address fields.
- Add tests for invoice data validation.

Rules:
- Do not claim official GİB integration unless actually implemented.
- Do not validate/store unnecessary sensitive identity data by default.
- Invoice information must be optional unless business enables invoicing.
```

## 7.10 `turkey-holiday-agent.md`

```md
---
name: turkey-holiday-agent
description: Use this agent to add Turkey public holidays, special closed days, national holiday scheduling rules, and booking exclusions.
tools: Read, Write, Edit, Bash
---

You are the Turkey Holiday Agent.

Responsibilities:
- Add Turkey public holiday data source.
- Add BusinessClosedDay model or equivalent.
- Add holiday-aware slot generation.
- Allow businesses to override holidays.
- Add Turkish labels for official holidays.
- Add tests for closed-day booking exclusion.

Rules:
- Do not hardcode only one year unless documented.
- Business override must be possible.
- Holiday closure must be visible in dashboard and public booking UI.
```

## 7.11 `turkey-qa-agent.md`

```md
---
name: turkey-qa-agent
description: Use this agent to run Turkish localization regression tests, province/currency/payment/KVKK tests, build checks, browser QA, and GitHub readiness checks.
tools: Read, Write, Edit, Bash
---

You are the Turkey QA Agent.

Responsibilities:
- Run all test suites after each phase.
- Add Turkish-specific tests.
- Verify Turkish UI copy.
- Verify TRY formatting.
- Verify city filters.
- Verify phone normalization.
- Verify KVKK consent flow.
- Verify payment provider fake/manual flow.
- Create QA reports.

Required checks:
- npm run typecheck
- npm run lint
- npm test
- npm run build
- npx prisma validate
- npx prisma generate
- npx prisma migrate status
```

## 7.12 `compact-maintainer-agent.md`

```md
---
name: compact-maintainer-agent
description: Use this agent every 2 phases to summarize current project state, update compact files, reduce context size, and prepare the next phase prompt.
tools: Read, Write, Edit
---

You are the Compact Maintainer Agent.

Responsibilities:
- After every 2 phases, update docs/COMPACT_STATE.md.
- Summarize completed phases.
- List changed database models.
- List new env variables.
- List passing/failing tests.
- List known risks.
- Create the exact next prompt for Claude Code / Antigravity.
- If Claude Code supports /compact, ask the user to run /compact after writing the summary.
- If automatic compact is available in the environment, trigger compact after saving state.

Rules:
- Do not delete project files.
- Do not hide unresolved issues.
- Keep summary short but complete.
```

## 7.13 `github-release-agent.md`

```md
---
name: github-release-agent
description: Use this agent to commit, push, create changelog entries, tag stable releases, and update GitHub release notes after each phase.
tools: Read, Write, Edit, Bash
---

You are the GitHub Release Agent.

Responsibilities:
- Make sure tests pass before commit.
- Create meaningful commit messages.
- Push after each phase if remote exists.
- Update CHANGELOG.md.
- Add release notes.
- Create tags only for stable milestones.

Rules:
- Never push broken build intentionally.
- If tests fail, do not push unless user explicitly asks.
- Do not force push without explicit approval.
```

---

# 8. Phase Sırası

Bu adaptasyon 10 phase halinde yapılacak.

```txt
Phase TR-0 — Türkiye Baseline ve Araştırma Notları
Phase TR-1 — Türkçe UI ve i18n
Phase TR-2 — Türkiye il/ilçe, adres ve telefon desteği
Phase TR-3 — TRY fiyatlandırma ve Türkiye abonelik paketleri
Phase TR-4 — Yerel ödeme sağlayıcıları ve manuel ödeme
Phase TR-5 — KVKK, açık rıza ve İYS ayrımı
Phase TR-6 — Türkçe bildirim şablonları
Phase TR-7 — Türkiye marketplace ve yerel SEO
Phase TR-8 — e-Arşiv/e-Fatura export hazırlığı
Phase TR-9 — Türkiye resmi tatilleri ve final QA
```

Compact kuralı:

```txt
TR-0 + TR-1 sonrası compact
TR-2 + TR-3 sonrası compact
TR-4 + TR-5 sonrası compact
TR-6 + TR-7 sonrası compact
TR-8 + TR-9 sonrası final compact summary
```

Her phase sonunda:

```txt
1. Test çalıştır.
2. Build al.
3. Migration kontrol et.
4. CHANGELOG güncelle.
5. Commit at.
6. GitHub remote varsa push yap.
```

---

# 9. Global Test Komutları

Her phase sonunda çalıştırılacak komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Eğer e2e test varsa:

```bash
npm run test:e2e
```

Eğer seed değiştiyse:

```bash
npx prisma db seed
```

GitHub push:

```bash
git status
git add .
git commit -m "PHASE_COMMIT_MESSAGE"
git push
```

Not:

```txt
Testler başarısızsa push yapılmaz.
Kullanıcı özellikle isterse broken branch olarak farklı branch’e push yapılabilir.
```

---

# 10. Compact Protokolü

Amaç:

```txt
Token/context dolmasını engellemek ve uzun geliştirme sürecinde Claude Code / Antigravity’nin kafasının karışmasını azaltmak.
```

Her 2 phase sonunda `compact-maintainer-agent` çalıştırılacak.

Yapılacaklar:

```txt
1. docs/COMPACT_STATE.md güncelle.
2. Son 2 phase’te yapılanları özetle.
3. Değişen dosya gruplarını listele.
4. Yeni env değişkenlerini listele.
5. Yeni database modellerini listele.
6. Test sonuçlarını yaz.
7. Bilinen bug/riskleri yaz.
8. Bir sonraki phase için kısa prompt hazırla.
9. Claude Code destekliyorsa /compact çalıştırılması istenir.
10. Antigravity destekliyorsa context summary artifact oluşturulur.
```

`docs/COMPACT_STATE.md` şablonu:

```md
# SlotPilot Türkiye Compact State

## Last Completed Phases

## Current System State

## Changed Database Models

## New Environment Variables

## Passing Tests

## Failing Tests / Known Issues

## Next Phase Prompt

## Do Not Forget
```

Compact sonrası kullanılacak prompt:

```txt
Read docs/COMPACT_STATE.md and SLOTPILOT_TURKIYE_LOCALIZATION_PLAN.md.
Continue from the next unfinished phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

# 11. Phase Detayları

## Phase TR-0 — Türkiye Baseline ve Araştırma Notları

Kullanılacak agent:

```txt
turkey-product-agent
turkey-qa-agent
```

Amaç:

```txt
Mevcut SlotPilot projesi bozulmadan Türkiye adaptasyonuna hazır mı kontrol edilir.
```

Yapılacaklar:

```txt
1. Mevcut branch temiz mi kontrol et.
2. Mevcut testleri çalıştır.
3. Türkiye ürün stratejisi dokümanı oluştur.
4. Hedef müşteri gruplarını yaz.
5. Türkiye fiyatlandırmasını netleştir.
6. Türkiye ödeme sağlayıcılarını not et.
7. KVKK/İYS gereksinimlerini ürün seviyesinde listele.
8. Türkiye şehir/adres ihtiyacını planla.
9. GitHub için changelog başlat.
```

Oluşturulacak dosya:

```txt
docs/turkiye-product-strategy.md
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Kabul kriteri:

```txt
- Mevcut proje build alıyor.
- Türkiye strateji dokümanı oluştu.
- Henüz davranış değişikliği yapılmadı.
- GitHub commit + push yapıldı.
```

Commit:

```bash
git add .
git commit -m "docs: add Turkey localization product strategy"
git push
```

---

## Phase TR-1 — Türkçe UI ve i18n

Kullanılacak agent:

```txt
i18n-localization-agent
turkey-qa-agent
```

Amaç:

```txt
Arayüzün Türkçeleştirilmesi ve gelecekte çoklu dil desteği için i18n yapısının kurulması.
```

Yapılacaklar:

```txt
1. src/i18n/ klasörü oluştur.
2. tr.ts dictionary oluştur.
3. Gerekirse en.ts fallback dictionary oluştur.
4. UI stringlerini dictionary key’lerine taşı.
5. Dashboard menülerini Türkçeleştir.
6. Public booking sayfasını Türkçeleştir.
7. Form validation mesajlarını Türkçeleştir.
8. Date format helper ekle.
9. Currency format helper ekle.
10. Timezone default olarak Europe/Istanbul ayarla.
```

Örnek Türkçe UI metinleri:

```txt
Randevular
Hizmetler
Çalışanlar
Müsaitlik
Müşteriler
Abonelik
Ayarlar
Bugünkü Randevular
Yeni Hizmet Ekle
Randevu Al
Uygun Saatler
Randevunuz oluşturuldu
```

Helper fonksiyonlar:

```ts
formatCurrencyTRY(amountCents)
formatDateTR(date)
formatTimeTR(date)
formatDateTimeTR(date)
```

Testler:

```txt
- TRY formatı tutarlı çalışır.
- Tarih tr-TR formatında gösterilir.
- İngilizce public UI string kalmadığı kontrol edilir.
- Validation mesajları Türkçe görünür.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Turkish localization and formatting"
git push
```

Compact:

```txt
TR-0 ve TR-1 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase TR-2 — Türkiye İl/İlçe, Adres ve Telefon Desteği

Kullanılacak agent:

```txt
turkey-data-agent
turkey-qa-agent
```

Yapılacaklar:

```txt
1. src/data/turkey-provinces.ts oluştur.
2. 81 ili ekle.
3. İl plaka kodu alanı ekle.
4. Büyükşehir ilçeleri için başlangıç district datası ekle.
5. BusinessProfile address alanlarını güncelle:
   - province
   - district
   - neighborhood
   - addressLine
   - postalCode
6. Location model varsa location address alanlarını güncelle.
7. Public booking business address gösterimini Türkçe yap.
8. Phone normalization helper oluştur.
9. +90 default ülke kodu desteği ekle.
10. Telefon display formatı ekle.
```

Telefon örneği:

```txt
Input: 0532 123 45 67
Stored: +905321234567
Displayed: 0532 123 45 67
```

Testler:

```txt
- 81 il datası eksiksiz.
- İstanbul/Ankara/İzmir district datası dönüyor.
- +90 telefon normalize ediliyor.
- Hatalı telefon reddediliyor.
- Existing organization migration safe default değer üretiyor.
```

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

Commit:

```bash
git add .
git commit -m "feat: add Turkey province district address and phone support"
git push
```

---

## Phase TR-3 — TRY Fiyatlandırma ve Türkiye Abonelik Paketleri

Kullanılacak agent:

```txt
turkey-pricing-agent
turkey-qa-agent
```

Yapılacaklar:

```txt
1. src/config/pricing.tr.ts oluştur.
2. Plan isimlerini Türkçeleştir:
   - Ücretsiz
   - Başlangıç
   - Pro
   - Kurumsal
3. Başlangıç planı 40 TL / ay olarak ayarla.
4. Pro planı 249 TL / ay olarak ayarla.
5. Plan limitlerini backend’e bağla.
6. Billing UI Türkçeleştir.
7. Subscription modelinde currency TRY destekle.
8. Plan migration stratejisi yaz.
9. Annual discount placeholder ekle.
10. Tests güncelle.
```

Testler:

```txt
- Başlangıç planı 40 TRY döner.
- Pro planı 249 TRY döner.
- Ücretsiz plan staff/randevu limitleri enforce edilir.
- Başlangıç planı 3 staff ve 300 randevu limiti uygular.
- Pro planı 2.000 randevu limiti uygular.
- Currency display TRY formatında görünür.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Turkey pricing plans in TRY"
git push
```

Compact:

```txt
TR-2 ve TR-3 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase TR-4 — Yerel Ödeme Sağlayıcıları ve Manuel Ödeme

Kullanılacak agent:

```txt
local-payment-agent
turkey-qa-agent
```

Yapılacaklar:

```txt
1. Payment provider enum ekle:
   - STRIPE_TEST
   - MANUAL_BANK_TRANSFER
   - IYZICO
   - PAYTR
   - PARAM
2. PaymentProviderAdapter interface oluştur.
3. ManualBankTransferProvider oluştur.
4. iyzico adapter stub oluştur.
5. PayTR adapter stub oluştur.
6. Param adapter stub oluştur.
7. Ödeme talimatları sayfası oluştur.
8. IBAN bilgileri ayarı ekle.
9. Dekont yükleme placeholder ekle.
10. Backend-controlled payment approval alanı ekle.
11. .env.example güncelle.
```

Manuel ödeme akışı:

```txt
1. Müşteri/işletme ödeme seçer.
2. Sistem havale/EFT talimatı gösterir.
3. Kullanıcı açıklama kodunu görür.
4. Ödeme status PENDING_MANUAL olur.
5. İşletme/admin manuel onaylar.
6. Status PAID olur.
```

Testler:

```txt
- Provider selection doğru çalışır.
- Manual payment PENDING_MANUAL oluşturur.
- Manual approve sonrası PAID olur.
- Fake provider testte kullanılır.
- Real provider secrets olmadan build geçer.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Turkey local payment provider abstraction"
git push
```

---

## Phase TR-5 — KVKK, Açık Rıza ve İYS Ayrımı

Kullanılacak agent:

```txt
kvkk-compliance-agent
turkey-qa-agent
```

Database değişiklikleri:

```txt
ConsentLog
CustomerConsent
DataDeletionRequest
```

Consent alanları:

```txt
privacyNoticeAcknowledged
explicitConsentGiven
appointmentNotificationConsent
marketingConsent
consentVersion
consentIp
consentUserAgent
consentCreatedAt
```

Yapılacaklar:

```txt
1. KVKK placeholder metni ekle.
2. Açık rıza metni placeholder ekle.
3. Ticari ileti izni metni placeholder ekle.
4. Public booking formuna checkboxlar ekle.
5. Aydınlatma ve açık rıza checkboxlarını ayrı tut.
6. Pazarlama iznini opsiyonel yap.
7. Randevu bilgilendirme iznini ayrı tut.
8. ConsentLog kaydı oluştur.
9. Data deletion request endpoint ekle.
10. Tests ekle.
```

Form checkbox önerisi:

```txt
[Zorunlu] KVKK Aydınlatma Metni’ni okudum.
[Opsiyonel] Randevu hatırlatmaları almak istiyorum.
[Opsiyonel] Kampanya ve duyuru mesajları almak istiyorum.
[Koşula bağlı] Açık rıza metnini onaylıyorum.
```

Testler:

```txt
- KVKK aydınlatma onayı olmadan appointment oluşturulmaz.
- Marketing consent false olsa da appointment oluşturulabilir.
- Marketing mesajı marketingConsent yoksa gönderilmez.
- Consent log oluşturulur.
- Data deletion request oluşturulur.
```

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

Commit:

```bash
git add .
git commit -m "feat: add KVKK consent and communication permissions"
git push
```

Compact:

```txt
TR-4 ve TR-5 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase TR-6 — Türkçe Bildirim Şablonları

Kullanılacak agent:

```txt
turkey-notification-agent
turkey-qa-agent
```

Yapılacaklar:

```txt
1. Türkçe email template oluştur.
2. Türkçe SMS template oluştur.
3. Türkçe WhatsApp template placeholder oluştur.
4. Appointment reminder ile marketing message ayrımını kodda belirt.
5. Notification templates versiyonlanabilir hale getir.
6. Varsayılan reminder zamanlarını ekle:
   - 24 saat önce
   - 3 saat önce
   - 1 saat önce
7. İşletme adı, hizmet, tarih, saat, adres değişkenlerini template’e bağla.
8. Tests yaz.
```

Örnek randevu hatırlatma:

```txt
Merhaba {{customerName}}, {{businessName}} randevunuz {{date}} saat {{time}} için planlandı. Hizmet: {{serviceName}}. Adres: {{address}}.
```

Testler:

```txt
- Türkçe template değişkenleri doğru replace edilir.
- Marketing consent yoksa kampanya mesajı hazırlanmaz.
- Appointment reminder transactional channel olarak çalışır.
- Fake SMS/WhatsApp provider testleri geçer.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Turkish notification templates"
git push
```

---

## Phase TR-7 — Türkiye Marketplace ve Yerel SEO

Kullanılacak agent:

```txt
turkey-marketplace-agent
turkey-qa-agent
```

Türkiye kategori önerileri:

```txt
Kuaför
Berber
Güzellik Salonu
Nail Art
Diyetisyen
Spor Eğitmeni
Pilates/Yoga
Özel Ders
Danışmanlık
Kurs ve Atölye
Oto Bakım
Pet Kuaför
```

Yapılacaklar:

```txt
1. Türkçe category enum/config oluştur.
2. Marketplace UI Türkçeleştir.
3. İl/ilçe filtreleri ekle.
4. Şehir bazlı landing page ekle:
   - /marketplace/istanbul
   - /marketplace/izmir
   - /marketplace/ankara
5. Kategori bazlı landing page ekle.
6. SEO metadata Türkçe yap.
7. Business card’da adres Türkçe göster.
8. Booking CTA Türkçeleştir.
9. Tests yaz.
```

Testler:

```txt
- marketplaceEnabled false işletme görünmez.
- İstanbul filtresi İstanbul işletmelerini döndürür.
- Kategori filtresi doğru çalışır.
- Public marketplace Türkçe görünür.
- Private customer data görünmez.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: localize marketplace for Turkey"
git push
```

Compact:

```txt
TR-6 ve TR-7 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase TR-8 — e-Arşiv/e-Fatura Export Hazırlığı

Kullanılacak agent:

```txt
turkey-invoice-agent
turkey-qa-agent
```

Database alanları:

```txt
InvoiceProfile
InvoiceExport
```

Invoice profile alanları:

```txt
invoiceType: INDIVIDUAL | COMPANY
companyTitle
taxOffice
taxNumber
identityNumberOptional
invoiceProvince
invoiceDistrict
invoiceAddressLine
email
phone
```

Yapılacaklar:

```txt
1. InvoiceProfile modelini ekle.
2. Business invoice settings formu oluştur.
3. Customer invoice info formu oluştur.
4. Export-ready CSV oluştur.
5. Export-ready JSON oluştur.
6. e-Arşiv/e-Fatura placeholder dokümanı yaz.
7. GİB entegrasyonu yapılmadığını açıkça belirt.
8. Tests ekle.
```

Testler:

```txt
- Şirket fatura bilgileri validasyon çalışır.
- Bireysel fatura bilgileri opsiyonel alanlarla çalışır.
- CSV export kolonları doğru.
- JSON export schema doğru.
- Tenant isolation bozulmaz.
```

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

Commit:

```bash
git add .
git commit -m "feat: add Turkey invoice export foundation"
git push
```

---

## Phase TR-9 — Türkiye Resmi Tatilleri ve Final QA

Kullanılacak agent:

```txt
turkey-holiday-agent
turkey-qa-agent
github-release-agent
compact-maintainer-agent
```

Yapılacaklar:

```txt
1. Türkiye resmi tatil data yapısı oluştur.
2. BusinessClosedDay modelini ekle.
3. İşletme tatil gününü açık/kapalı override edebilsin.
4. Booking engine holiday-aware hale gelsin.
5. Public booking’de kapalı gün mesajı göster.
6. Dashboard’da tatil günleri göster.
7. Final Turkish QA çalıştır.
8. README güncelle.
9. CHANGELOG güncelle.
10. GitHub push yap.
11. Stable tag oluştur.
```

Testler:

```txt
- Resmi tatil gününde slot üretilmez.
- İşletme override ederse slot üretilebilir.
- BusinessClosedDay custom kapalı gün slotu engeller.
- Public UI Türkçe kapalı gün mesajı gösterir.
- Existing booking flow bozulmaz.
```

Final test komutları:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run test:e2e
```

E2E final test akışı:

```txt
1. Türkçe register/login.
2. İşletme profili oluştur.
3. İl/ilçe/adres gir.
4. Hizmet oluştur.
5. Çalışan oluştur.
6. Müsaitlik ayarla.
7. Türkçe public booking sayfasını aç.
8. Randevu oluştururken KVKK checkboxını kontrol et.
9. Randevu oluştur.
10. Dashboard’da randevuyu gör.
11. TRY fiyat görüntüsünü kontrol et.
12. Marketplace şehir filtresini kontrol et.
13. Kapalı/resmi tatil gününde slot çıkmadığını kontrol et.
14. Manual payment flow test et.
15. Bildirim template preview kontrol et.
```

Commit:

```bash
git add .
git commit -m "chore: finalize Turkey localization release"
git push
git tag v1.1.0-turkiye
git push origin v1.1.0-turkiye
```

Final compact:

```txt
TR-8 ve TR-9 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Final summary oluştur.
```

---

# 12. Güncellenmiş Environment Variables

`.env.example` içine eklenecek alanlar:

```env
# Locale
APP_LOCALE=tr
APP_TIMEZONE=Europe/Istanbul
APP_CURRENCY=TRY

# Turkish Payment Providers
PAYMENT_PROVIDER=MANUAL_BANK_TRANSFER
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
PARAM_CLIENT_CODE=
PARAM_CLIENT_USERNAME=
PARAM_CLIENT_PASSWORD=
PARAM_GUID=

# Manual Bank Transfer
BANK_TRANSFER_ENABLED=true
BANK_TRANSFER_IBAN=
BANK_TRANSFER_ACCOUNT_HOLDER=
BANK_TRANSFER_BANK_NAME=
BANK_TRANSFER_DESCRIPTION_PREFIX=SLOTPILOT

# KVKK / Consent
KVKK_NOTICE_VERSION=2026-01
EXPLICIT_CONSENT_VERSION=2026-01
MARKETING_CONSENT_VERSION=2026-01

# Notifications
DEFAULT_NOTIFICATION_LOCALE=tr
SMS_PROVIDER=FAKE
WHATSAPP_PROVIDER=FAKE
EMAIL_PROVIDER=FAKE

# Marketplace
MARKETPLACE_DEFAULT_COUNTRY=TR
MARKETPLACE_DEFAULT_LOCALE=tr
```

---

# 13. Yeni / Güncellenen Database Modelleri

Olası yeni modeller:

```txt
Province
District
ConsentLog
CustomerConsent
DataDeletionRequest
InvoiceProfile
InvoiceExport
BusinessClosedDay
PaymentProviderConfig
ManualPaymentInstruction
```

Güncellenecek modeller:

```txt
Organization
Location
Customer
Appointment
Subscription
Payment
Reminder
MarketplaceProfile
```

Önemli kural:

```txt
Tenant-owned tüm tablolarda organizationId bulunmalı.
KVKK/consent kayıtları audit amaçlı silinmeden önce anonymization stratejisi düşünülmeli.
```

---

# 14. Türkçe UI Copy Guide

Kullanılacak temel çeviriler:

```txt
Dashboard -> Kontrol Paneli
Appointments -> Randevular
Services -> Hizmetler
Staff -> Çalışanlar
Customers -> Müşteriler
Availability -> Müsaitlik
Billing -> Abonelik
Settings -> Ayarlar
Marketplace -> İşletme Rehberi
Book Appointment -> Randevu Al
Available Slots -> Uygun Saatler
No Slots Available -> Uygun saat bulunamadı
Payment Pending -> Ödeme Bekleniyor
Confirmed -> Onaylandı
Cancelled -> İptal Edildi
Completed -> Tamamlandı
No Show -> Gelmedi
```

Validation mesajları:

```txt
Bu alan zorunludur.
Geçerli bir e-posta adresi girin.
Geçerli bir telefon numarası girin.
Lütfen il seçin.
Lütfen ilçe seçin.
KVKK Aydınlatma Metni’ni okuyup onaylamanız gerekir.
```

---

# 15. Türkiye Telefon Formatı

Input kabul örnekleri:

```txt
0532 123 45 67
5321234567
+90 532 123 45 67
0090 532 123 45 67
```

Normalize output:

```txt
+905321234567
```

Display output:

```txt
0532 123 45 67
```

Test edge case:

```txt
- Eksik numara reddedilir.
- Harf içeren numara reddedilir.
- +90 tekrarları temizlenir.
- Başındaki 0 doğru ele alınır.
```

---

# 16. Türkiye Şehir Datası

İlk etapta 81 il zorunludur.

Seed data minimum alanları:

```ts
{
  plateCode: "35",
  name: "İzmir",
  slug: "izmir",
  region: "Ege"
}
```

Büyükşehir ilçe desteği önceliği:

```txt
İstanbul
Ankara
İzmir
Bursa
Antalya
Kocaeli
Konya
Adana
Gaziantep
Kayseri
Mersin
Eskişehir
Diyarbakır
Samsun
Muğla
```

---

# 17. GitHub Push Politikası

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful message"
git push
```

Ama sadece şu şartlarda push yapılır:

```txt
- Typecheck geçti.
- Lint geçti.
- Testler geçti.
- Build geçti.
- Prisma validation geçti.
- Migration status temiz.
```

Test fail olursa:

```txt
1. Fail raporu oluştur.
2. Bug fix yap.
3. Testleri tekrar çalıştır.
4. Sonra commit + push yap.
```

---

# 18. Claude Code Ana Prompt’u

Bu dosyayı Claude Code’a verdikten sonra şu prompt kullanılabilir:

```txt
Read SLOTPILOT_TURKIYE_LOCALIZATION_PLAN.md carefully.

This is a Turkey localization update plan for SlotPilot. Do not implement all features at once.

Start with Phase TR-0 only:
- Run baseline tests.
- Create missing Turkey localization agents under .claude/agents.
- Create docs/turkiye-product-strategy.md.
- Do not change product behavior yet.
- Run tests/build.
- Commit and push if everything passes.

After Phase TR-0, stop and summarize.

Important:
- Customer-facing language must be Turkish.
- Currency must be TRY.
- Use Europe/Istanbul timezone.
- Do not commit secrets.
- Use fake providers by default.
- After every phase run tests/build.
- After every 2 phases update docs/COMPACT_STATE.md and run or request /compact.
```

---

# 19. Antigravity Ana Prompt’u

Antigravity için:

```txt
Read SLOTPILOT_TURKIYE_LOCALIZATION_PLAN.md.

Create the new Turkey localization agents first.

Then start with Phase TR-0 only.
Use browser automation to verify the current SlotPilot MVP before localization:
1. Register/login.
2. Create organization.
3. Add service.
4. Add staff.
5. Add availability.
6. Create public booking.
7. Confirm appointment appears in dashboard.
8. Update appointment status.

Do not start Phase TR-1 until TR-0 tests pass.
Create an artifact with screenshots and QA notes.
Commit and push only if tests pass.
```

---

# 20. Final Definition of Done

Türkiye adaptasyonu bitmiş sayılması için:

```txt
- UI Türkçe.
- Tarih/saat tr-TR formatında.
- Para birimi TRY.
- Başlangıç planı 40 TL.
- Pro planı 249 TL.
- 81 il datası var.
- Büyükşehir ilçe desteği var.
- +90 telefon normalizasyonu var.
- Türkiye adres formatı var.
- KVKK aydınlatma checkbox yapısı var.
- Marketing consent ayrı.
- Appointment notification consent ayrı.
- Türkçe bildirim şablonları var.
- Türkiye marketplace kategori/şehir filtreleri var.
- Yerel ödeme provider abstraction var.
- Manuel havale/EFT flow var.
- e-Arşiv/e-Fatura export hazırlığı var.
- Türkiye resmi tatil/kapalı gün desteği var.
- Her phase test edildi.
- Her phase commit + push edildi.
- Her 2 phase sonrası compact state güncellendi.
- Final README ve CHANGELOG güncel.
```

---

# 21. Final Kontrol Prompt’u

Tüm phase’ler bittikten sonra:

```txt
Review the whole SlotPilot Turkey localization update.

Check:
1. Is the customer-facing UI fully Turkish?
2. Are TRY prices displayed correctly?
3. Is the Başlangıç plan exactly 40 TL/month?
4. Is the Pro plan 249 TL/month?
5. Are Turkey provinces available?
6. Does phone normalization work for +90 numbers?
7. Does KVKK consent flow work?
8. Are marketing and appointment notification consents separate?
9. Does manual bank transfer payment flow work?
10. Are iyzico/PayTR adapters safely stubbed?
11. Does marketplace city/category filtering work?
12. Is invoice export clearly marked as export-ready, not official GİB integration?
13. Do all tests pass?
14. Does build pass?
15. Has everything been committed and pushed to GitHub?
16. Is docs/COMPACT_STATE.md updated?

Fix small issues only. Do not add new major features.
Create final release notes.
```
