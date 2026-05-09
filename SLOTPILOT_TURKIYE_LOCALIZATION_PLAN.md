# Randevo TÃ¼rkiye YerelleÅŸtirme PlanÄ± â€” Claude Code / Antigravity Update Brief

> Bu dosya, Randevo projesinin TÃ¼rkiye pazarÄ±na uyarlanmasÄ± iÃ§in hazÄ±rlanmÄ±ÅŸtÄ±r.  
> Ana Randevo MVP ve Post-MVP expansion adÄ±mlarÄ± tamamlandÄ±ktan sonra uygulanacak yeni gÃ¼ncelleme planÄ±dÄ±r.  
> AmaÃ§: Dil, para birimi, ÅŸehir/ilÃ§e sistemi, yerel Ã¶deme altyapÄ±sÄ±, KVKK/Ä°YS izinleri, TÃ¼rkiye marketplace yapÄ±sÄ± ve yerel faturalama hazÄ±rlÄ±ÄŸÄ±nÄ± planlÄ± ÅŸekilde eklemek.

---

## 1. Ana Hedef

Randevo artÄ±k global/Ä°ngilizce bir SaaS MVP yerine TÃ¼rkiyeâ€™de kÃ¼Ã§Ã¼k iÅŸletmelerin kullanabileceÄŸi yerel bir randevu SaaS Ã¼rÃ¼nÃ¼ne dÃ¶nÃ¼ÅŸtÃ¼rÃ¼lecek.

Ana hedefler:

```txt
- ArayÃ¼z tamamen TÃ¼rkÃ§e olacak.
- VarsayÄ±lan para birimi TÃ¼rk lirasÄ± olacak.
- TÃ¼rkiye ÅŸehirleri ve bÃ¼yÃ¼kÅŸehir ilÃ§eleri desteklenecek.
- Abonelik paketleri TÃ¼rkiye fiyatlarÄ±na gÃ¶re dÃ¼zenlenecek.
- BaÅŸlangÄ±Ã§ planÄ± 40 TL / ay olacak.
- Pro planÄ± 249 TL / ay olacak.
- TÃ¼rkiyeâ€™ye uygun Ã¶deme saÄŸlayÄ±cÄ± altyapÄ±sÄ± eklenecek.
- KVKK ve ticari ileti izinleri ayrÄ±ÅŸtÄ±rÄ±lacak.
- TÃ¼rkiyeâ€™ye Ã¶zel bildirim ÅŸablonlarÄ± eklenecek.
- Marketplace ÅŸehir/kategori bazlÄ± TÃ¼rkÃ§e Ã§alÄ±ÅŸacak.
- Her phase sonunda test + commit + push yapÄ±lacak.
- En fazla 2 phase tamamlandÄ±ktan sonra compact protokolÃ¼ Ã§alÄ±ÅŸacak.
```

---

## 2. TÃ¼rkiye PazarÄ±na GÃ¶re ÃœrÃ¼n KararlarÄ±

### 2.1 Hedef MÃ¼ÅŸteri

TÃ¼rkiye versiyonu Ã¶zellikle ÅŸu iÅŸletmeleri hedefler:

```txt
- KuafÃ¶rler
- Berberler
- GÃ¼zellik salonlarÄ±
- Protez tÄ±rnak / nail art stÃ¼dyolarÄ±
- Diyetisyenler
- Psikolojik danÄ±ÅŸmanlÄ±k ofisleri
- Ã–zel ders verenler
- Spor eÄŸitmenleri
- Pilates/yoga stÃ¼dyolarÄ±
- Klinik dÄ±ÅŸÄ± randevulu danÄ±ÅŸmanlÄ±k hizmetleri
- Kurs ve atÃ¶lye merkezleri
- Oto bakÄ±m / ekspertiz randevu iÅŸletmeleri
- Pet kuafÃ¶rleri
```

### 2.2 TÃ¼rkiyeâ€™de Ã‡Ã¶zÃ¼lmesi Gereken Sorun

TÃ¼rkiyeâ€™de birÃ§ok kÃ¼Ã§Ã¼k iÅŸletme randevularÄ± ÅŸu kanallarla yÃ¶netir:

```txt
- WhatsApp
- Instagram DM
- Telefon aramasÄ±
- KaÄŸÄ±t ajanda
- Excel
- Google Calendar
```

Bu yÃ¶ntemlerde sÄ±k gÃ¶rÃ¼len problemler:

```txt
- Randevular karÄ±ÅŸÄ±r.
- MÃ¼ÅŸteri randevuyu unutur.
- AynÄ± saate iki kiÅŸi yazÄ±lÄ±r.
- Kapora takibi manuel yapÄ±lÄ±r.
- Ä°ÅŸletme yoÄŸun gÃ¼n/saat raporu alamaz.
- MÃ¼ÅŸteri iÅŸletme kapalÄ±yken randevu alamaz.
- Randevu iptali ve no-show oranÄ± izlenemez.
```

### 2.3 TÃ¼rkiyeâ€™ye Uygun DeÄŸer Ã–nerisi

```txt
KÃ¼Ã§Ã¼k iÅŸletmeler iÃ§in TÃ¼rkÃ§e, uygun fiyatlÄ±, WhatsApp/SMS/e-posta hatÄ±rlatma altyapÄ±sÄ±na hazÄ±r, kapora ve randevu yÃ¶netimi odaklÄ± SaaS randevu sistemi.
```

---

## 3. AraÅŸtÄ±rma NotlarÄ±

Bu plan TÃ¼rkiye pazarÄ±na uyarlanÄ±rken ÅŸu baÅŸlÄ±klar dikkate alÄ±nmÄ±ÅŸtÄ±r:

```txt
- KVKK tarafÄ±nda aydÄ±nlatma yÃ¼kÃ¼mlÃ¼lÃ¼ÄŸÃ¼ ve aÃ§Ä±k rÄ±za sÃ¼reÃ§leri ayrÄ± ele alÄ±nmalÄ±dÄ±r.
- Ticari elektronik ileti izinleri Ä°YS mantÄ±ÄŸÄ±na uygun ayrÄ± consent alanlarÄ±yla tutulmalÄ±dÄ±r.
- TÃ¼rkiyeâ€™de Ã¶deme iÃ§in Stripe dÄ±ÅŸÄ±nda iyzico, PayTR, Param, Sipay, banka sanal POS ve manuel havale/EFT akÄ±ÅŸÄ± dÃ¼ÅŸÃ¼nÃ¼lmelidir.
- GÄ°B e-ArÅŸiv/e-Fatura tarafÄ±nda doÄŸrudan resmi entegrasyon yerine ilk aÅŸamada export-ready veri yapÄ±sÄ± yapÄ±lmalÄ±dÄ±r.
- TÃ¼rkiyeâ€™de adresleme il/ilÃ§e temelli kurulmalÄ±dÄ±r.
```

Kaynak notlarÄ±:

```txt
- KVKK resmi sitesi: AydÄ±nlatma yÃ¼kÃ¼mlÃ¼lÃ¼ÄŸÃ¼ ve aÃ§Ä±k rÄ±za sÃ¼reÃ§lerinin ayrÄ±lÄ±ÄŸÄ±.
- Ä°YS resmi sitesi ve Ticaret BakanlÄ±ÄŸÄ±: Ticari elektronik ileti izinlerinin merkezi yÃ¶netimi.
- iyzico geliÅŸtirici dokÃ¼manlarÄ±: TÃ¼rkiye Ã¶deme API entegrasyon seÃ§enekleri.
- PayTR geliÅŸtirici dokÃ¼manlarÄ±: Sanal POS / iFrame / direkt API entegrasyon akÄ±ÅŸlarÄ±.
- GÄ°B e-ArÅŸiv / e-Fatura portallarÄ±: Elektronik belge sÃ¼reÃ§leri iÃ§in resmi platformlar.
```

---

## 4. TÃ¼rkiye FiyatlandÄ±rmasÄ±

### 4.1 Paketler

```txt
Ãœcretsiz Plan â€” 0 TL / ay
BaÅŸlangÄ±Ã§ PlanÄ± â€” 40 TL / ay
Pro Plan â€” 249 TL / ay
Kurumsal Plan â€” Teklif al
```

### 4.2 Paket Limitleri

#### Ãœcretsiz Plan

```txt
- 1 iÅŸletme
- 1 Ã§alÄ±ÅŸan
- 20 randevu / ay
- Public booking link
- Temel dashboard
- E-posta hatÄ±rlatma yok
- SMS/WhatsApp yok
- Marketplace gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼ yok
```

#### BaÅŸlangÄ±Ã§ PlanÄ± â€” 40 TL / ay

```txt
- 1 iÅŸletme
- 3 Ã§alÄ±ÅŸan
- 300 randevu / ay
- TÃ¼rkÃ§e public booking sayfasÄ±
- E-posta hatÄ±rlatma
- Temel raporlar
- TÃ¼rkiye il/ilÃ§e adres desteÄŸi
- CSV export
```

#### Pro Plan â€” 249 TL / ay

```txt
- SÄ±nÄ±rsÄ±z Ã§alÄ±ÅŸan
- 2.000 randevu / ay
- SMS/WhatsApp provider altyapÄ±sÄ±
- Kapora Ã¶deme altyapÄ±sÄ±
- Marketplace gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼
- GeliÅŸmiÅŸ raporlar
- Ã‡oklu ÅŸube desteÄŸi
- e-ArÅŸiv/e-Fatura export hazÄ±rlÄ±ÄŸÄ±
```

#### Kurumsal Plan â€” Teklif al

```txt
- Ã‡oklu iÅŸletme/ÅŸube
- Ã–zel entegrasyon
- Ã–zel destek
- Muhasebe entegrasyonu
- YÃ¼ksek hacimli randevu limiti
- SLA ve Ã¶zel onboarding
```

### 4.3 YÄ±llÄ±k Ä°ndirim Placeholder

```txt
YÄ±llÄ±k Ã¶demede 2 ay Ã¼cretsiz.
BaÅŸlangÄ±Ã§ yÄ±llÄ±k: 400 TL / yÄ±l
Pro yÄ±llÄ±k: 2.490 TL / yÄ±l
```

Not:

```txt
Fiyatlar MVP denemesi iÃ§indir. CanlÄ± ticari kullanÄ±m Ã¶ncesi vergi, KDV, Ã¶deme kuruluÅŸu komisyonlarÄ± ve faturalama sÃ¼reÃ§leri muhasebeciyle doÄŸrulanmalÄ±dÄ±r.
```

---

## 5. TÃ¼rkiyeâ€™ye Ã–zel Yeni Ã–zellikler

```txt
1. TÃ¼rkÃ§e UI ve i18n
2. tr-TR tarih/saat/para formatÄ±
3. TRY para birimi
4. TÃ¼rkiye il/ilÃ§e verisi
5. TÃ¼rkiye adres formatÄ±
6. +90 telefon normalizasyonu
7. TÃ¼rkiye abonelik paketleri
8. Yerel Ã¶deme saÄŸlayÄ±cÄ± abstraction
9. Havale/EFT manuel Ã¶deme akÄ±ÅŸÄ±
10. iyzico/PayTR/Param adapter placeholder
11. KVKK aydÄ±nlatma metni alanlarÄ±
12. AÃ§Ä±k rÄ±za ve aydÄ±nlatma ayrÄ±mÄ±
13. Ticari ileti / pazarlama izni ayrÄ±mÄ±
14. Ä°YS uyumlu izin mimarisi
15. TÃ¼rkÃ§e SMS/e-posta/WhatsApp ÅŸablonlarÄ±
16. TÃ¼rkiye marketplace kategori ve ÅŸehir filtreleri
17. e-ArÅŸiv/e-Fatura export hazÄ±rlÄ±ÄŸÄ±
18. Resmi tatil ve Ã¶zel gÃ¼n desteÄŸi
19. Her 2 phase sonrasÄ± compact protokolÃ¼
20. Her phase sonunda GitHub commit + push
```

---

## 6. Yeni Agent Listesi

`.claude/agents/` klasÃ¶rÃ¼ne ÅŸu agent dosyalarÄ± eklenecek:

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

# 7. Agent TanÄ±mlarÄ±

## 7.1 `turkey-product-agent.md`

```md
---
name: turkey-product-agent
description: Use this agent to adapt Randevo product strategy, Turkish pricing, packaging, target users, and local feature priorities.
tools: Read, Write, Edit
---

You are the Turkey Product Agent for Randevo.

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
- Implement Ãœcretsiz, BaÅŸlangÄ±Ã§, Pro, Kurumsal plans.
- Set BaÅŸlangÄ±Ã§ to 40 TRY/month.
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
- Add Turkish placeholder texts for KVKK and aÃ§Ä±k rÄ±za.
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
description: Use this agent to add e-ArÅŸiv/e-Fatura ready export fields, invoice information forms, tax office/VKN/TCKN fields, and accounting export notes.
tools: Read, Write, Edit, Bash
---

You are the Turkey Invoice Agent.

Responsibilities:
- Add invoice profile fields.
- Add VKN/TCKN optional fields.
- Add tax office field.
- Add company title field.
- Add e-ArÅŸiv/e-Fatura export-ready CSV/JSON.
- Add invoice address fields.
- Add tests for invoice data validation.

Rules:
- Do not claim official GÄ°B integration unless actually implemented.
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

# 8. Phase SÄ±rasÄ±

Bu adaptasyon 10 phase halinde yapÄ±lacak.

```txt
Phase TR-0 â€” TÃ¼rkiye Baseline ve AraÅŸtÄ±rma NotlarÄ±
Phase TR-1 â€” TÃ¼rkÃ§e UI ve i18n
Phase TR-2 â€” TÃ¼rkiye il/ilÃ§e, adres ve telefon desteÄŸi
Phase TR-3 â€” TRY fiyatlandÄ±rma ve TÃ¼rkiye abonelik paketleri
Phase TR-4 â€” Yerel Ã¶deme saÄŸlayÄ±cÄ±larÄ± ve manuel Ã¶deme
Phase TR-5 â€” KVKK, aÃ§Ä±k rÄ±za ve Ä°YS ayrÄ±mÄ±
Phase TR-6 â€” TÃ¼rkÃ§e bildirim ÅŸablonlarÄ±
Phase TR-7 â€” TÃ¼rkiye marketplace ve yerel SEO
Phase TR-8 â€” e-ArÅŸiv/e-Fatura export hazÄ±rlÄ±ÄŸÄ±
Phase TR-9 â€” TÃ¼rkiye resmi tatilleri ve final QA
```

Compact kuralÄ±:

```txt
TR-0 + TR-1 sonrasÄ± compact
TR-2 + TR-3 sonrasÄ± compact
TR-4 + TR-5 sonrasÄ± compact
TR-6 + TR-7 sonrasÄ± compact
TR-8 + TR-9 sonrasÄ± final compact summary
```

Her phase sonunda:

```txt
1. Test Ã§alÄ±ÅŸtÄ±r.
2. Build al.
3. Migration kontrol et.
4. CHANGELOG gÃ¼ncelle.
5. Commit at.
6. GitHub remote varsa push yap.
```

---

# 9. Global Test KomutlarÄ±

Her phase sonunda Ã§alÄ±ÅŸtÄ±rÄ±lacak komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

EÄŸer e2e test varsa:

```bash
npm run test:e2e
```

EÄŸer seed deÄŸiÅŸtiyse:

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
Testler baÅŸarÄ±sÄ±zsa push yapÄ±lmaz.
KullanÄ±cÄ± Ã¶zellikle isterse broken branch olarak farklÄ± branchâ€™e push yapÄ±labilir.
```

---

# 10. Compact ProtokolÃ¼

AmaÃ§:

```txt
Token/context dolmasÄ±nÄ± engellemek ve uzun geliÅŸtirme sÃ¼recinde Claude Code / Antigravityâ€™nin kafasÄ±nÄ±n karÄ±ÅŸmasÄ±nÄ± azaltmak.
```

Her 2 phase sonunda `compact-maintainer-agent` Ã§alÄ±ÅŸtÄ±rÄ±lacak.

YapÄ±lacaklar:

```txt
1. docs/COMPACT_STATE.md gÃ¼ncelle.
2. Son 2 phaseâ€™te yapÄ±lanlarÄ± Ã¶zetle.
3. DeÄŸiÅŸen dosya gruplarÄ±nÄ± listele.
4. Yeni env deÄŸiÅŸkenlerini listele.
5. Yeni database modellerini listele.
6. Test sonuÃ§larÄ±nÄ± yaz.
7. Bilinen bug/riskleri yaz.
8. Bir sonraki phase iÃ§in kÄ±sa prompt hazÄ±rla.
9. Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±rÄ±lmasÄ± istenir.
10. Antigravity destekliyorsa context summary artifact oluÅŸturulur.
```

`docs/COMPACT_STATE.md` ÅŸablonu:

```md
# Randevo TÃ¼rkiye Compact State

## Last Completed Phases

## Current System State

## Changed Database Models

## New Environment Variables

## Passing Tests

## Failing Tests / Known Issues

## Next Phase Prompt

## Do Not Forget
```

Compact sonrasÄ± kullanÄ±lacak prompt:

```txt
Read docs/COMPACT_STATE.md and RANDEVO_TURKIYE_LOCALIZATION_PLAN.md.
Continue from the next unfinished phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

# 11. Phase DetaylarÄ±

## Phase TR-0 â€” TÃ¼rkiye Baseline ve AraÅŸtÄ±rma NotlarÄ±

KullanÄ±lacak agent:

```txt
turkey-product-agent
turkey-qa-agent
```

AmaÃ§:

```txt
Mevcut Randevo projesi bozulmadan TÃ¼rkiye adaptasyonuna hazÄ±r mÄ± kontrol edilir.
```

YapÄ±lacaklar:

```txt
1. Mevcut branch temiz mi kontrol et.
2. Mevcut testleri Ã§alÄ±ÅŸtÄ±r.
3. TÃ¼rkiye Ã¼rÃ¼n stratejisi dokÃ¼manÄ± oluÅŸtur.
4. Hedef mÃ¼ÅŸteri gruplarÄ±nÄ± yaz.
5. TÃ¼rkiye fiyatlandÄ±rmasÄ±nÄ± netleÅŸtir.
6. TÃ¼rkiye Ã¶deme saÄŸlayÄ±cÄ±larÄ±nÄ± not et.
7. KVKK/Ä°YS gereksinimlerini Ã¼rÃ¼n seviyesinde listele.
8. TÃ¼rkiye ÅŸehir/adres ihtiyacÄ±nÄ± planla.
9. GitHub iÃ§in changelog baÅŸlat.
```

OluÅŸturulacak dosya:

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
- Mevcut proje build alÄ±yor.
- TÃ¼rkiye strateji dokÃ¼manÄ± oluÅŸtu.
- HenÃ¼z davranÄ±ÅŸ deÄŸiÅŸikliÄŸi yapÄ±lmadÄ±.
- GitHub commit + push yapÄ±ldÄ±.
```

Commit:

```bash
git add .
git commit -m "docs: add Turkey localization product strategy"
git push
```

---

## Phase TR-1 â€” TÃ¼rkÃ§e UI ve i18n

KullanÄ±lacak agent:

```txt
i18n-localization-agent
turkey-qa-agent
```

AmaÃ§:

```txt
ArayÃ¼zÃ¼n TÃ¼rkÃ§eleÅŸtirilmesi ve gelecekte Ã§oklu dil desteÄŸi iÃ§in i18n yapÄ±sÄ±nÄ±n kurulmasÄ±.
```

YapÄ±lacaklar:

```txt
1. src/i18n/ klasÃ¶rÃ¼ oluÅŸtur.
2. tr.ts dictionary oluÅŸtur.
3. Gerekirse en.ts fallback dictionary oluÅŸtur.
4. UI stringlerini dictionary keyâ€™lerine taÅŸÄ±.
5. Dashboard menÃ¼lerini TÃ¼rkÃ§eleÅŸtir.
6. Public booking sayfasÄ±nÄ± TÃ¼rkÃ§eleÅŸtir.
7. Form validation mesajlarÄ±nÄ± TÃ¼rkÃ§eleÅŸtir.
8. Date format helper ekle.
9. Currency format helper ekle.
10. Timezone default olarak Europe/Istanbul ayarla.
```

Ã–rnek TÃ¼rkÃ§e UI metinleri:

```txt
Randevular
Hizmetler
Ã‡alÄ±ÅŸanlar
MÃ¼saitlik
MÃ¼ÅŸteriler
Abonelik
Ayarlar
BugÃ¼nkÃ¼ Randevular
Yeni Hizmet Ekle
Randevu Al
Uygun Saatler
Randevunuz oluÅŸturuldu
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
- TRY formatÄ± tutarlÄ± Ã§alÄ±ÅŸÄ±r.
- Tarih tr-TR formatÄ±nda gÃ¶sterilir.
- Ä°ngilizce public UI string kalmadÄ±ÄŸÄ± kontrol edilir.
- Validation mesajlarÄ± TÃ¼rkÃ§e gÃ¶rÃ¼nÃ¼r.
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
TR-0 ve TR-1 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase TR-2 â€” TÃ¼rkiye Ä°l/Ä°lÃ§e, Adres ve Telefon DesteÄŸi

KullanÄ±lacak agent:

```txt
turkey-data-agent
turkey-qa-agent
```

YapÄ±lacaklar:

```txt
1. src/data/turkey-provinces.ts oluÅŸtur.
2. 81 ili ekle.
3. Ä°l plaka kodu alanÄ± ekle.
4. BÃ¼yÃ¼kÅŸehir ilÃ§eleri iÃ§in baÅŸlangÄ±Ã§ district datasÄ± ekle.
5. BusinessProfile address alanlarÄ±nÄ± gÃ¼ncelle:
   - province
   - district
   - neighborhood
   - addressLine
   - postalCode
6. Location model varsa location address alanlarÄ±nÄ± gÃ¼ncelle.
7. Public booking business address gÃ¶sterimini TÃ¼rkÃ§e yap.
8. Phone normalization helper oluÅŸtur.
9. +90 default Ã¼lke kodu desteÄŸi ekle.
10. Telefon display formatÄ± ekle.
```

Telefon Ã¶rneÄŸi:

```txt
Input: 0532 123 45 67
Stored: +905321234567
Displayed: 0532 123 45 67
```

Testler:

```txt
- 81 il datasÄ± eksiksiz.
- Ä°stanbul/Ankara/Ä°zmir district datasÄ± dÃ¶nÃ¼yor.
- +90 telefon normalize ediliyor.
- HatalÄ± telefon reddediliyor.
- Existing organization migration safe default deÄŸer Ã¼retiyor.
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

## Phase TR-3 â€” TRY FiyatlandÄ±rma ve TÃ¼rkiye Abonelik Paketleri

KullanÄ±lacak agent:

```txt
turkey-pricing-agent
turkey-qa-agent
```

YapÄ±lacaklar:

```txt
1. src/config/pricing.tr.ts oluÅŸtur.
2. Plan isimlerini TÃ¼rkÃ§eleÅŸtir:
   - Ãœcretsiz
   - BaÅŸlangÄ±Ã§
   - Pro
   - Kurumsal
3. BaÅŸlangÄ±Ã§ planÄ± 40 TL / ay olarak ayarla.
4. Pro planÄ± 249 TL / ay olarak ayarla.
5. Plan limitlerini backendâ€™e baÄŸla.
6. Billing UI TÃ¼rkÃ§eleÅŸtir.
7. Subscription modelinde currency TRY destekle.
8. Plan migration stratejisi yaz.
9. Annual discount placeholder ekle.
10. Tests gÃ¼ncelle.
```

Testler:

```txt
- BaÅŸlangÄ±Ã§ planÄ± 40 TRY dÃ¶ner.
- Pro planÄ± 249 TRY dÃ¶ner.
- Ãœcretsiz plan staff/randevu limitleri enforce edilir.
- BaÅŸlangÄ±Ã§ planÄ± 3 staff ve 300 randevu limiti uygular.
- Pro planÄ± 2.000 randevu limiti uygular.
- Currency display TRY formatÄ±nda gÃ¶rÃ¼nÃ¼r.
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
TR-2 ve TR-3 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase TR-4 â€” Yerel Ã–deme SaÄŸlayÄ±cÄ±larÄ± ve Manuel Ã–deme

KullanÄ±lacak agent:

```txt
local-payment-agent
turkey-qa-agent
```

YapÄ±lacaklar:

```txt
1. Payment provider enum ekle:
   - STRIPE_TEST
   - MANUAL_BANK_TRANSFER
   - IYZICO
   - PAYTR
   - PARAM
2. PaymentProviderAdapter interface oluÅŸtur.
3. ManualBankTransferProvider oluÅŸtur.
4. iyzico adapter stub oluÅŸtur.
5. PayTR adapter stub oluÅŸtur.
6. Param adapter stub oluÅŸtur.
7. Ã–deme talimatlarÄ± sayfasÄ± oluÅŸtur.
8. IBAN bilgileri ayarÄ± ekle.
9. Dekont yÃ¼kleme placeholder ekle.
10. Backend-controlled payment approval alanÄ± ekle.
11. .env.example gÃ¼ncelle.
```

Manuel Ã¶deme akÄ±ÅŸÄ±:

```txt
1. MÃ¼ÅŸteri/iÅŸletme Ã¶deme seÃ§er.
2. Sistem havale/EFT talimatÄ± gÃ¶sterir.
3. KullanÄ±cÄ± aÃ§Ä±klama kodunu gÃ¶rÃ¼r.
4. Ã–deme status PENDING_MANUAL olur.
5. Ä°ÅŸletme/admin manuel onaylar.
6. Status PAID olur.
```

Testler:

```txt
- Provider selection doÄŸru Ã§alÄ±ÅŸÄ±r.
- Manual payment PENDING_MANUAL oluÅŸturur.
- Manual approve sonrasÄ± PAID olur.
- Fake provider testte kullanÄ±lÄ±r.
- Real provider secrets olmadan build geÃ§er.
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

## Phase TR-5 â€” KVKK, AÃ§Ä±k RÄ±za ve Ä°YS AyrÄ±mÄ±

KullanÄ±lacak agent:

```txt
kvkk-compliance-agent
turkey-qa-agent
```

Database deÄŸiÅŸiklikleri:

```txt
ConsentLog
CustomerConsent
DataDeletionRequest
```

Consent alanlarÄ±:

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

YapÄ±lacaklar:

```txt
1. KVKK placeholder metni ekle.
2. AÃ§Ä±k rÄ±za metni placeholder ekle.
3. Ticari ileti izni metni placeholder ekle.
4. Public booking formuna checkboxlar ekle.
5. AydÄ±nlatma ve aÃ§Ä±k rÄ±za checkboxlarÄ±nÄ± ayrÄ± tut.
6. Pazarlama iznini opsiyonel yap.
7. Randevu bilgilendirme iznini ayrÄ± tut.
8. ConsentLog kaydÄ± oluÅŸtur.
9. Data deletion request endpoint ekle.
10. Tests ekle.
```

Form checkbox Ã¶nerisi:

```txt
[Zorunlu] KVKK AydÄ±nlatma Metniâ€™ni okudum.
[Opsiyonel] Randevu hatÄ±rlatmalarÄ± almak istiyorum.
[Opsiyonel] Kampanya ve duyuru mesajlarÄ± almak istiyorum.
[KoÅŸula baÄŸlÄ±] AÃ§Ä±k rÄ±za metnini onaylÄ±yorum.
```

Testler:

```txt
- KVKK aydÄ±nlatma onayÄ± olmadan appointment oluÅŸturulmaz.
- Marketing consent false olsa da appointment oluÅŸturulabilir.
- Marketing mesajÄ± marketingConsent yoksa gÃ¶nderilmez.
- Consent log oluÅŸturulur.
- Data deletion request oluÅŸturulur.
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
TR-4 ve TR-5 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase TR-6 â€” TÃ¼rkÃ§e Bildirim ÅablonlarÄ±

KullanÄ±lacak agent:

```txt
turkey-notification-agent
turkey-qa-agent
```

YapÄ±lacaklar:

```txt
1. TÃ¼rkÃ§e email template oluÅŸtur.
2. TÃ¼rkÃ§e SMS template oluÅŸtur.
3. TÃ¼rkÃ§e WhatsApp template placeholder oluÅŸtur.
4. Appointment reminder ile marketing message ayrÄ±mÄ±nÄ± kodda belirt.
5. Notification templates versiyonlanabilir hale getir.
6. VarsayÄ±lan reminder zamanlarÄ±nÄ± ekle:
   - 24 saat Ã¶nce
   - 3 saat Ã¶nce
   - 1 saat Ã¶nce
7. Ä°ÅŸletme adÄ±, hizmet, tarih, saat, adres deÄŸiÅŸkenlerini templateâ€™e baÄŸla.
8. Tests yaz.
```

Ã–rnek randevu hatÄ±rlatma:

```txt
Merhaba {{customerName}}, {{businessName}} randevunuz {{date}} saat {{time}} iÃ§in planlandÄ±. Hizmet: {{serviceName}}. Adres: {{address}}.
```

Testler:

```txt
- TÃ¼rkÃ§e template deÄŸiÅŸkenleri doÄŸru replace edilir.
- Marketing consent yoksa kampanya mesajÄ± hazÄ±rlanmaz.
- Appointment reminder transactional channel olarak Ã§alÄ±ÅŸÄ±r.
- Fake SMS/WhatsApp provider testleri geÃ§er.
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

## Phase TR-7 â€” TÃ¼rkiye Marketplace ve Yerel SEO

KullanÄ±lacak agent:

```txt
turkey-marketplace-agent
turkey-qa-agent
```

TÃ¼rkiye kategori Ã¶nerileri:

```txt
KuafÃ¶r
Berber
GÃ¼zellik Salonu
Nail Art
Diyetisyen
Spor EÄŸitmeni
Pilates/Yoga
Ã–zel Ders
DanÄ±ÅŸmanlÄ±k
Kurs ve AtÃ¶lye
Oto BakÄ±m
Pet KuafÃ¶r
```

YapÄ±lacaklar:

```txt
1. TÃ¼rkÃ§e category enum/config oluÅŸtur.
2. Marketplace UI TÃ¼rkÃ§eleÅŸtir.
3. Ä°l/ilÃ§e filtreleri ekle.
4. Åehir bazlÄ± landing page ekle:
   - /marketplace/istanbul
   - /marketplace/izmir
   - /marketplace/ankara
5. Kategori bazlÄ± landing page ekle.
6. SEO metadata TÃ¼rkÃ§e yap.
7. Business cardâ€™da adres TÃ¼rkÃ§e gÃ¶ster.
8. Booking CTA TÃ¼rkÃ§eleÅŸtir.
9. Tests yaz.
```

Testler:

```txt
- marketplaceEnabled false iÅŸletme gÃ¶rÃ¼nmez.
- Ä°stanbul filtresi Ä°stanbul iÅŸletmelerini dÃ¶ndÃ¼rÃ¼r.
- Kategori filtresi doÄŸru Ã§alÄ±ÅŸÄ±r.
- Public marketplace TÃ¼rkÃ§e gÃ¶rÃ¼nÃ¼r.
- Private customer data gÃ¶rÃ¼nmez.
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
TR-6 ve TR-7 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase TR-8 â€” e-ArÅŸiv/e-Fatura Export HazÄ±rlÄ±ÄŸÄ±

KullanÄ±lacak agent:

```txt
turkey-invoice-agent
turkey-qa-agent
```

Database alanlarÄ±:

```txt
InvoiceProfile
InvoiceExport
```

Invoice profile alanlarÄ±:

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

YapÄ±lacaklar:

```txt
1. InvoiceProfile modelini ekle.
2. Business invoice settings formu oluÅŸtur.
3. Customer invoice info formu oluÅŸtur.
4. Export-ready CSV oluÅŸtur.
5. Export-ready JSON oluÅŸtur.
6. e-ArÅŸiv/e-Fatura placeholder dokÃ¼manÄ± yaz.
7. GÄ°B entegrasyonu yapÄ±lmadÄ±ÄŸÄ±nÄ± aÃ§Ä±kÃ§a belirt.
8. Tests ekle.
```

Testler:

```txt
- Åirket fatura bilgileri validasyon Ã§alÄ±ÅŸÄ±r.
- Bireysel fatura bilgileri opsiyonel alanlarla Ã§alÄ±ÅŸÄ±r.
- CSV export kolonlarÄ± doÄŸru.
- JSON export schema doÄŸru.
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

## Phase TR-9 â€” TÃ¼rkiye Resmi Tatilleri ve Final QA

KullanÄ±lacak agent:

```txt
turkey-holiday-agent
turkey-qa-agent
github-release-agent
compact-maintainer-agent
```

YapÄ±lacaklar:

```txt
1. TÃ¼rkiye resmi tatil data yapÄ±sÄ± oluÅŸtur.
2. BusinessClosedDay modelini ekle.
3. Ä°ÅŸletme tatil gÃ¼nÃ¼nÃ¼ aÃ§Ä±k/kapalÄ± override edebilsin.
4. Booking engine holiday-aware hale gelsin.
5. Public bookingâ€™de kapalÄ± gÃ¼n mesajÄ± gÃ¶ster.
6. Dashboardâ€™da tatil gÃ¼nleri gÃ¶ster.
7. Final Turkish QA Ã§alÄ±ÅŸtÄ±r.
8. README gÃ¼ncelle.
9. CHANGELOG gÃ¼ncelle.
10. GitHub push yap.
11. Stable tag oluÅŸtur.
```

Testler:

```txt
- Resmi tatil gÃ¼nÃ¼nde slot Ã¼retilmez.
- Ä°ÅŸletme override ederse slot Ã¼retilebilir.
- BusinessClosedDay custom kapalÄ± gÃ¼n slotu engeller.
- Public UI TÃ¼rkÃ§e kapalÄ± gÃ¼n mesajÄ± gÃ¶sterir.
- Existing booking flow bozulmaz.
```

Final test komutlarÄ±:

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

E2E final test akÄ±ÅŸÄ±:

```txt
1. TÃ¼rkÃ§e register/login.
2. Ä°ÅŸletme profili oluÅŸtur.
3. Ä°l/ilÃ§e/adres gir.
4. Hizmet oluÅŸtur.
5. Ã‡alÄ±ÅŸan oluÅŸtur.
6. MÃ¼saitlik ayarla.
7. TÃ¼rkÃ§e public booking sayfasÄ±nÄ± aÃ§.
8. Randevu oluÅŸtururken KVKK checkboxÄ±nÄ± kontrol et.
9. Randevu oluÅŸtur.
10. Dashboardâ€™da randevuyu gÃ¶r.
11. TRY fiyat gÃ¶rÃ¼ntÃ¼sÃ¼nÃ¼ kontrol et.
12. Marketplace ÅŸehir filtresini kontrol et.
13. KapalÄ±/resmi tatil gÃ¼nÃ¼nde slot Ã§Ä±kmadÄ±ÄŸÄ±nÄ± kontrol et.
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
TR-8 ve TR-9 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Final summary oluÅŸtur.
```

---

# 12. GÃ¼ncellenmiÅŸ Environment Variables

`.env.example` iÃ§ine eklenecek alanlar:

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
BANK_TRANSFER_DESCRIPTION_PREFIX=RANDEVO

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

# 13. Yeni / GÃ¼ncellenen Database Modelleri

OlasÄ± yeni modeller:

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

GÃ¼ncellenecek modeller:

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

Ã–nemli kural:

```txt
Tenant-owned tÃ¼m tablolarda organizationId bulunmalÄ±.
KVKK/consent kayÄ±tlarÄ± audit amaÃ§lÄ± silinmeden Ã¶nce anonymization stratejisi dÃ¼ÅŸÃ¼nÃ¼lmeli.
```

---

# 14. TÃ¼rkÃ§e UI Copy Guide

KullanÄ±lacak temel Ã§eviriler:

```txt
Dashboard -> Kontrol Paneli
Appointments -> Randevular
Services -> Hizmetler
Staff -> Ã‡alÄ±ÅŸanlar
Customers -> MÃ¼ÅŸteriler
Availability -> MÃ¼saitlik
Billing -> Abonelik
Settings -> Ayarlar
Marketplace -> Ä°ÅŸletme Rehberi
Book Appointment -> Randevu Al
Available Slots -> Uygun Saatler
No Slots Available -> Uygun saat bulunamadÄ±
Payment Pending -> Ã–deme Bekleniyor
Confirmed -> OnaylandÄ±
Cancelled -> Ä°ptal Edildi
Completed -> TamamlandÄ±
No Show -> Gelmedi
```

Validation mesajlarÄ±:

```txt
Bu alan zorunludur.
GeÃ§erli bir e-posta adresi girin.
GeÃ§erli bir telefon numarasÄ± girin.
LÃ¼tfen il seÃ§in.
LÃ¼tfen ilÃ§e seÃ§in.
KVKK AydÄ±nlatma Metniâ€™ni okuyup onaylamanÄ±z gerekir.
```

---

# 15. TÃ¼rkiye Telefon FormatÄ±

Input kabul Ã¶rnekleri:

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
- Harf iÃ§eren numara reddedilir.
- +90 tekrarlarÄ± temizlenir.
- BaÅŸÄ±ndaki 0 doÄŸru ele alÄ±nÄ±r.
```

---

# 16. TÃ¼rkiye Åehir DatasÄ±

Ä°lk etapta 81 il zorunludur.

Seed data minimum alanlarÄ±:

```ts
{
  plateCode: "35",
  name: "Ä°zmir",
  slug: "izmir",
  region: "Ege"
}
```

BÃ¼yÃ¼kÅŸehir ilÃ§e desteÄŸi Ã¶nceliÄŸi:

```txt
Ä°stanbul
Ankara
Ä°zmir
Bursa
Antalya
Kocaeli
Konya
Adana
Gaziantep
Kayseri
Mersin
EskiÅŸehir
DiyarbakÄ±r
Samsun
MuÄŸla
```

---

# 17. GitHub Push PolitikasÄ±

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful message"
git push
```

Ama sadece ÅŸu ÅŸartlarda push yapÄ±lÄ±r:

```txt
- Typecheck geÃ§ti.
- Lint geÃ§ti.
- Testler geÃ§ti.
- Build geÃ§ti.
- Prisma validation geÃ§ti.
- Migration status temiz.
```

Test fail olursa:

```txt
1. Fail raporu oluÅŸtur.
2. Bug fix yap.
3. Testleri tekrar Ã§alÄ±ÅŸtÄ±r.
4. Sonra commit + push yap.
```

---

# 18. Claude Code Ana Promptâ€™u

Bu dosyayÄ± Claude Codeâ€™a verdikten sonra ÅŸu prompt kullanÄ±labilir:

```txt
Read RANDEVO_TURKIYE_LOCALIZATION_PLAN.md carefully.

This is a Turkey localization update plan for Randevo. Do not implement all features at once.

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

# 19. Antigravity Ana Promptâ€™u

Antigravity iÃ§in:

```txt
Read RANDEVO_TURKIYE_LOCALIZATION_PLAN.md.

Create the new Turkey localization agents first.

Then start with Phase TR-0 only.
Use browser automation to verify the current Randevo MVP before localization:
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

TÃ¼rkiye adaptasyonu bitmiÅŸ sayÄ±lmasÄ± iÃ§in:

```txt
- UI TÃ¼rkÃ§e.
- Tarih/saat tr-TR formatÄ±nda.
- Para birimi TRY.
- BaÅŸlangÄ±Ã§ planÄ± 40 TL.
- Pro planÄ± 249 TL.
- 81 il datasÄ± var.
- BÃ¼yÃ¼kÅŸehir ilÃ§e desteÄŸi var.
- +90 telefon normalizasyonu var.
- TÃ¼rkiye adres formatÄ± var.
- KVKK aydÄ±nlatma checkbox yapÄ±sÄ± var.
- Marketing consent ayrÄ±.
- Appointment notification consent ayrÄ±.
- TÃ¼rkÃ§e bildirim ÅŸablonlarÄ± var.
- TÃ¼rkiye marketplace kategori/ÅŸehir filtreleri var.
- Yerel Ã¶deme provider abstraction var.
- Manuel havale/EFT flow var.
- e-ArÅŸiv/e-Fatura export hazÄ±rlÄ±ÄŸÄ± var.
- TÃ¼rkiye resmi tatil/kapalÄ± gÃ¼n desteÄŸi var.
- Her phase test edildi.
- Her phase commit + push edildi.
- Her 2 phase sonrasÄ± compact state gÃ¼ncellendi.
- Final README ve CHANGELOG gÃ¼ncel.
```

---

# 21. Final Kontrol Promptâ€™u

TÃ¼m phaseâ€™ler bittikten sonra:

```txt
Review the whole Randevo Turkey localization update.

Check:
1. Is the customer-facing UI fully Turkish?
2. Are TRY prices displayed correctly?
3. Is the BaÅŸlangÄ±Ã§ plan exactly 40 TL/month?
4. Is the Pro plan 249 TL/month?
5. Are Turkey provinces available?
6. Does phone normalization work for +90 numbers?
7. Does KVKK consent flow work?
8. Are marketing and appointment notification consents separate?
9. Does manual bank transfer payment flow work?
10. Are iyzico/PayTR adapters safely stubbed?
11. Does marketplace city/category filtering work?
12. Is invoice export clearly marked as export-ready, not official GÄ°B integration?
13. Do all tests pass?
14. Does build pass?
15. Has everything been committed and pushed to GitHub?
16. Is docs/COMPACT_STATE.md updated?

Fix small issues only. Do not add new major features.
Create final release notes.
```

