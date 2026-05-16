# SlotPilot / Randevo — Genişletilmiş Ek Dil Paketleri Güncelleme Planı

> Bu dosya, mevcut `SLOTPILOT_EXTRA_LANGUAGE_PACKS_UPDATE_PLAN.md` dosyasının güncellenmiş halidir.  
> Amaç: Projeye **İspanyolca, Fransızca, İtalyanca, Farsça, Rusça ve Hollandaca** dil paketlerini planlı, testli ve GitHub’a push edilecek şekilde eklemek.

---

## 1. Yeni Eklenecek Diller

Mevcut temel diller:

```txt
tr — Türkçe
en — English
de — Deutsch
ar — العربية
```

Önceki ek pakette planlanan diller:

```txt
es — Español
fr — Français
it — Italiano
fa — فارسی
```

Bu güncelleme ile eklenecek yeni diller:

```txt
ru — Русский
nl — Nederlands
```

Final desteklenen dil listesi:

```txt
tr — Türkçe
en — English
de — Deutsch
ar — العربية
es — Español
fr — Français
it — Italiano
fa — فارسی
ru — Русский
nl — Nederlands
```

Final locale kod listesi:

```txt
tr, en, de, ar, es, fr, it, fa, ru, nl
```

Önemli notlar:

```txt
- Farsça/fa RTL dildir.
- Arapça/ar RTL dildir.
- Rusça/ru LTR dildir ama Kiril karakter desteği test edilmelidir.
- Hollandaca/nl LTR dildir.
- Dil seçici artık 10 dili göstermelidir.
```

---

## 2. Dil Seçici Güncellemesi

Sitenin ve mobil uygulamanın bir köşesinde dil seçici bulunacak.

Dil seçici örneği:

```txt
🇹🇷 Türkçe
🇬🇧 English
🇩🇪 Deutsch
🇸🇦 العربية
🇪🇸 Español
🇫🇷 Français
🇮🇹 Italiano
🇮🇷 فارسی
🇷🇺 Русский
🇳🇱 Nederlands
```

Davranış:

```txt
1. Kullanıcı dil seçiciye tıklar.
2. Açılır menüde 10 dil görünür.
3. Kullanıcı dili seçer.
4. Mevcut sayfa korunur.
5. UI seçilen dile döner.
6. Dil tercihi cookie/localStorage içinde saklanır.
7. Sonraki girişte aynı dil açılır.
8. RTL dil seçilirse html dir="rtl" olur.
9. LTR dil seçilirse html dir="ltr" olur.
```

---

## 3. Locale Config Güncellemesi

`src/i18n/locales.ts` güncellenecek.

Örnek yapı:

```ts
export type AppLocale =
  | "tr"
  | "en"
  | "de"
  | "ar"
  | "es"
  | "fr"
  | "it"
  | "fa"
  | "ru"
  | "nl";

export const supportedLocales = [
  {
    code: "tr",
    label: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    direction: "ltr",
    dateLocale: "tr-TR",
    defaultCurrency: "TRY"
  },
  {
    code: "en",
    label: "English",
    nativeName: "English",
    flag: "🇬🇧",
    direction: "ltr",
    dateLocale: "en-US",
    defaultCurrency: "USD"
  },
  {
    code: "de",
    label: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    dateLocale: "de-DE",
    defaultCurrency: "EUR"
  },
  {
    code: "ar",
    label: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    dateLocale: "ar",
    defaultCurrency: "USD"
  },
  {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    direction: "ltr",
    dateLocale: "es-ES",
    defaultCurrency: "EUR"
  },
  {
    code: "fr",
    label: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    direction: "ltr",
    dateLocale: "fr-FR",
    defaultCurrency: "EUR"
  },
  {
    code: "it",
    label: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    direction: "ltr",
    dateLocale: "it-IT",
    defaultCurrency: "EUR"
  },
  {
    code: "fa",
    label: "Persian",
    nativeName: "فارسی",
    flag: "🇮🇷",
    direction: "rtl",
    dateLocale: "fa-IR",
    defaultCurrency: "USD"
  },
  {
    code: "ru",
    label: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    direction: "ltr",
    dateLocale: "ru-RU",
    defaultCurrency: "RUB"
  },
  {
    code: "nl",
    label: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    direction: "ltr",
    dateLocale: "nl-NL",
    defaultCurrency: "EUR"
  }
] as const;
```

Not:

```txt
Türkiye fiyatlandırması TRY kalacak.
Global fiyat gösterimi ayrı bir pricing/currency stratejisine bağlanabilir.
İlk aşamada interface dili değişir; ödeme para birimi backend pricing config tarafından belirlenir.
```

---

## 4. Translation Dosyaları

Web tarafında eklenecek veya güncellenecek dosyalar:

```txt
src/i18n/messages/es.json
src/i18n/messages/fr.json
src/i18n/messages/it.json
src/i18n/messages/fa.json
src/i18n/messages/ru.json
src/i18n/messages/nl.json
```

Mobil app varsa:

```txt
mobile/src/i18n/messages/es.json
mobile/src/i18n/messages/fr.json
mobile/src/i18n/messages/it.json
mobile/src/i18n/messages/fa.json
mobile/src/i18n/messages/ru.json
mobile/src/i18n/messages/nl.json
```

Tüm dil dosyaları source locale ile aynı keylere sahip olmalı.

Ana key grupları:

```txt
common
navigation
auth
dashboard
appointments
services
staff
customers
availability
booking
billing
payments
marketplace
notifications
validation
errors
settings
language
seo
onboarding
profile
address
consent
```

---

## 5. RTL ve Alfabe Desteği

RTL diller:

```txt
ar — Arabic
fa — Persian / Farsça
```

LTR ama özel karakter/alfabe kontrolü gereken diller:

```txt
ru — Kiril karakterler
nl — özel aksan/uzun kelime kontrolü
de — uzun kelime kontrolü
fr — aksan karakterleri
es — aksan ve ters soru/ünlem işaretleri
it — aksan karakterleri
```

Yapılacaklar:

```txt
- ar/fa için html dir="rtl" ayarlanmalı.
- ru için Kiril karakter render kontrolü yapılmalı.
- nl için uzun metinlerin buton/kart taşması test edilmeli.
- CSS içinde left/right yerine logical property tercih edilmeli.
- LTR diller RTL düzeninden etkilenmemeli.
- Farsça ve Arapça template değişken yerleşimleri test edilmeli.
```

Kontrol edilecek ekranlar:

```txt
Landing page
Public booking page
Booking form
Dashboard
Settings
Marketplace
Billing page
Payment success/fail pages
Notification preview
Mobile appointment list
Mobile settings screen
```

---

## 6. Dil Kalite Kuralları

### 6.1 Rusça için Kurallar

```txt
- Kiril karakterler düzgün render edilmeli.
- SaaS ve ödeme terimleri fazla teknikleşmeden çevrilmeli.
- Tarih formatı ru-RU olmalı.
- Para gösterimi gerekiyorsa RUB veya ürünün seçili currency stratejisi kullanılmalı.
- Uzun metinlerin dashboard kartlarında taşmadığı kontrol edilmeli.
```

Örnek UI terimleri:

```txt
Appointments -> Записи
Services -> Услуги
Staff -> Сотрудники
Customers -> Клиенты
Billing -> Подписка
Book Appointment -> Записаться
```

### 6.2 Hollandaca için Kurallar

```txt
- Nederlands native name kullanılmalı.
- nl-NL date locale kullanılmalı.
- EUR varsayılan global currency olabilir.
- Uzun compound kelimeler UI taşması yapabilir; buton genişlikleri test edilmeli.
```

Örnek UI terimleri:

```txt
Appointments -> Afspraken
Services -> Diensten
Staff -> Medewerkers
Customers -> Klanten
Billing -> Abonnement
Book Appointment -> Afspraak maken
```

---

## 7. Agent Listesi

Bu güncellemede kullanılacak agent’lar:

```txt
language-pack-agent.md
rtl-layout-agent.md
mobile-i18n-agent.md
i18n-qa-agent.md
compact-maintainer-agent.md
github-release-agent.md
```

Yeni veya güncellenmiş agent davranışları aşağıdaki gibi olmalı.

---

## 8. Agent Tanımları

### 8.1 `language-pack-agent.md`

```md
---
name: language-pack-agent
description: Use this agent to add new translation JSON files, check missing keys, keep terminology consistent, and prepare language pack QA reports.
tools: Read, Write, Edit, Bash
---

You are the Language Pack Agent.

Responsibilities:
- Add es, fr, it, fa, ru, and nl translation files.
- Compare all translation files against the source locale.
- Detect missing keys.
- Detect extra unused keys.
- Keep SaaS, booking, payment, dashboard, marketplace, and notification terminology consistent.
- Create docs/language-pack-audit.md.
- Mark uncertain translations with TODO_TRANSLATION_REVIEW.

Rules:
- Do not remove existing locale keys without approval.
- Keep JSON valid.
- Do not break existing Turkish localization.
- Do not break Arabic and Persian RTL support.
```

### 8.2 `rtl-layout-agent.md`

```md
---
name: rtl-layout-agent
description: Use this agent to implement and test RTL layout support for Arabic and Persian across web and mobile.
tools: Read, Write, Edit, Bash
---

You are the RTL Layout Agent.

Responsibilities:
- Ensure ar and fa use dir="rtl".
- Check dashboard layout in RTL.
- Check public booking page in RTL.
- Check marketplace in RTL.
- Check payment pages in RTL.
- Fix CSS logical properties.
- Avoid hardcoded left/right when possible.
- Add RTL visual QA notes.

Rules:
- LTR languages must not break.
- RTL must not create horizontal overflow.
- Russian and Dutch must remain LTR.
```

### 8.3 `mobile-i18n-agent.md`

```md
---
name: mobile-i18n-agent
description: Use this agent to add the new language packs to the Expo mobile app, including locale persistence and RTL handling.
tools: Read, Write, Edit, Bash
---

You are the Mobile i18n Agent.

Responsibilities:
- Add es/fr/it/fa/ru/nl to mobile i18n config.
- Add mobile translation files.
- Add mobile language selector if missing.
- Persist selected mobile language.
- Test RTL layout for Persian and Arabic.
- Test Cyrillic rendering for Russian.
- Add mobile i18n QA notes.

Rules:
- Mobile app must not duplicate backend translation logic.
- Keep translation files aligned with web where possible.
```

### 8.4 `i18n-qa-agent.md`

```md
---
name: i18n-qa-agent
description: Use this agent to test locale routing, translation completeness, missing keys, RTL layout, Cyrillic rendering, date/currency formatting, web build, mobile build, and e2e language switching.
tools: Read, Write, Edit, Bash
---

You are the i18n QA Agent.

Responsibilities:
- Run missing translation key checks.
- Run JSON validity checks.
- Run locale route tests.
- Run language selector tests.
- Run RTL layout checks.
- Run Russian Cyrillic render smoke test.
- Run Dutch long-text overflow smoke test.
- Run build/tests.
- Create docs/i18n-qa-report.md.

Required checks:
- npm run i18n:check
- npm run typecheck
- npm run lint
- npm test
- npm run build
- npm run test:e2e if available
```

---

## 9. Phase Sırası

Bu güncelleme 6 phase halinde yapılacak.

```txt
Phase LANG-0 — Baseline ve Translation Key Audit
Phase LANG-1 — Locale Config ve Dil Seçici Güncellemesi
Phase LANG-2 — İspanyolca ve Fransızca Dil Paketleri
Phase LANG-3 — İtalyanca ve Farsça Dil Paketleri
Phase LANG-4 — Rusça ve Hollandaca Dil Paketleri
Phase LANG-5 — RTL, Mobil, SEO, Notification ve Final QA
```

Compact kuralı:

```txt
LANG-0 + LANG-1 sonrası compact
LANG-2 + LANG-3 sonrası compact
LANG-4 + LANG-5 sonrası final compact
```

Her phase sonunda:

```txt
1. Translation check çalıştır.
2. Test çalıştır.
3. Build al.
4. Commit at.
5. GitHub push yap.
6. Eğer 2 phase tamamlandıysa docs/COMPACT_STATE.md güncelle.
```

---

## 10. Phase Detayları

### Phase LANG-0 — Baseline ve Translation Key Audit

Kullanılacak agent:

```txt
language-pack-agent
i18n-qa-agent
```

Yapılacaklar:

1. Mevcut dil dosyalarını kontrol et.
2. Source locale seç:
   - öneri: `en`
   - Türkiye önceliği varsa: `tr`
3. Tüm mevcut translation keylerini listele.
4. Eksik key kontrol script’i oluştur veya güncelle.
5. `docs/language-pack-audit.md` oluştur.
6. Baseline test çalıştır.
7. Henüz yeni dil davranışı değiştirme.

Testler:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
```

Ek test:

```txt
- JSON dosyaları parse edilebiliyor.
- Source locale keyleri eksiksiz.
- Mevcut tr/en/de/ar dosyalarında missing key raporu var.
```

Commit:

```bash
git add .
git commit -m "docs: audit existing language packs"
git push
```

---

### Phase LANG-1 — Locale Config ve Dil Seçici Güncellemesi

Kullanılacak agent:

```txt
language-pack-agent
i18n-qa-agent
```

Yapılacaklar:

1. `supportedLocales` içine `es`, `fr`, `it`, `fa`, `ru`, `nl` ekle.
2. `AppLocale` type içine yeni locale kodlarını ekle.
3. Dil seçici dropdown’ını 10 dil gösterecek şekilde güncelle.
4. Bayrak + native name göster.
5. Locale persistence kontrol et.
6. URL locale routing destekliyorsa yeni route’ları aç.
7. SEO hreflang config’e yeni dilleri ekle.
8. Unsupported locale fallback test et.

Testler:

```txt
- Language dropdown 10 dili gösterir.
- es/fr/it/fa/ru/nl seçildiğinde locale state değişir.
- ru seçilince Kiril metinler render olur.
- nl seçilince LTR layout korunur.
- Geçersiz locale fallback çalışır.
- Mevcut sayfa korunarak dil değişir.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add expanded locale options to language selector"
git push
```

Compact:

```txt
LANG-0 ve LANG-1 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
```

---

### Phase LANG-2 — İspanyolca ve Fransızca Dil Paketleri

Kullanılacak agent:

```txt
language-pack-agent
i18n-qa-agent
```

Yapılacaklar:

1. `es.json` oluştur veya güncelle.
2. `fr.json` oluştur veya güncelle.
3. Tüm source locale keylerini bu dosyalara ekle.
4. Dashboard, booking, billing, payment, marketplace çevirilerini tamamla.
5. Validation mesajlarını çevir.
6. Notification template placeholder çevirilerini ekle.
7. Missing key checker çalıştır.
8. UI smoke test yap.

Testler:

```txt
- es.json valid JSON.
- fr.json valid JSON.
- es/fr missing key yok.
- es/fr UI render oluyor.
- Billing fiyatları formatlanıyor.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Spanish and French language packs"
git push
```

---

### Phase LANG-3 — İtalyanca ve Farsça Dil Paketleri

Kullanılacak agent:

```txt
language-pack-agent
rtl-layout-agent
i18n-qa-agent
```

Yapılacaklar:

1. `it.json` oluştur veya güncelle.
2. `fa.json` oluştur veya güncelle.
3. Tüm source locale keylerini bu dosyalara ekle.
4. İtalyanca UI çevirilerini tamamla.
5. Farsça UI çevirilerini tamamla.
6. `fa` locale için `direction: "rtl"` ayarla.
7. Farsça font/rendering kontrol et.
8. Missing key checker çalıştır.
9. RTL smoke test yap.

Testler:

```txt
- it.json valid JSON.
- fa.json valid JSON.
- it/fa missing key yok.
- fa seçilince html dir="rtl" olur.
- fa layout yatay taşma yapmaz.
- LTR diller bozulmaz.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Italian and Persian language packs"
git push
```

Compact:

```txt
LANG-2 ve LANG-3 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
```

---

### Phase LANG-4 — Rusça ve Hollandaca Dil Paketleri

Kullanılacak agent:

```txt
language-pack-agent
i18n-qa-agent
```

Yapılacaklar:

1. `ru.json` oluştur.
2. `nl.json` oluştur.
3. Tüm source locale keylerini bu dosyalara ekle.
4. Rusça dashboard, booking, billing, payments, marketplace çevirilerini tamamla.
5. Hollandaca dashboard, booking, billing, payments, marketplace çevirilerini tamamla.
6. Rusça notification template placeholder çevirilerini ekle.
7. Hollandaca notification template placeholder çevirilerini ekle.
8. Kiril render smoke test yap.
9. Hollandaca uzun metin overflow smoke test yap.
10. Missing key checker çalıştır.

Testler:

```txt
- ru.json valid JSON.
- nl.json valid JSON.
- ru/nl missing key yok.
- ru seçilince Kiril karakterler doğru görünür.
- ru LTR kalır.
- nl seçilince LTR kalır.
- nl uzun kelimeler buton/kart taşması yapmaz.
- Billing fiyatları ve tarih formatları locale helper’dan geçer.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add Russian and Dutch language packs"
git push
```

---

### Phase LANG-5 — RTL, Mobil, SEO, Notification ve Final QA

Kullanılacak agent:

```txt
rtl-layout-agent
mobile-i18n-agent
i18n-qa-agent
github-release-agent
compact-maintainer-agent
```

Yapılacaklar:

1. Arapça ve Farsça RTL layout kontrol et.
2. Web dashboard RTL kontrol et.
3. Public booking RTL kontrol et.
4. Marketplace RTL kontrol et.
5. Payment pages RTL kontrol et.
6. Mobil app içine es/fr/it/fa/ru/nl ekle.
7. Mobil language selector 10 dili gösterecek şekilde güncelle.
8. Mobil RTL/Farsça smoke test yap.
9. Mobil Rusça Kiril render smoke test yap.
10. Date/currency format helperlarını test et.
11. E2E language switch test yaz.
12. SEO hreflang listesini 10 dile göre güncelle.
13. Notification template language coverage güncelle.
14. README i18n bölümünü güncelle.
15. CHANGELOG güncelle.
16. Final GitHub release tag oluştur.

Testler:

```txt
- Web language selector 10 dili gösterir.
- Mobile language selector 10 dili gösterir.
- fa mobile RTL bozulmaz.
- ar mobile RTL bozulmaz.
- ru mobile Kiril render eder.
- es/fr/it/ru/nl LTR düzgün görünür.
- Date formatting locale bazlı çalışır.
- Currency formatting locale bazlı çalışır.
- hreflang listesi 10 dili içerir.
- Missing translation key yok.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Mobil varsa:

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
```

Commit ve tag:

```bash
git add .
git commit -m "docs: finalize 10-language i18n support"
git push
git tag v1.3.1-expanded-language-packs
git push origin v1.3.1-expanded-language-packs
```

Final compact:

```txt
LANG-4 ve LANG-5 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Final summary oluştur.
```

---

## 11. Translation Completeness Test Script

Önerilen script:

```txt
scripts/check-translations.ts
```

Görevi:

```txt
- Source locale JSON oku.
- Diğer tüm locale JSON dosyalarını oku.
- Missing key bul.
- Extra key bul.
- JSON parse hatalarını yakala.
- RTL locale direction kontrolü yap.
- supportedLocales ile message dosyalarının eşleşmesini kontrol et.
- CI içinde fail ettir.
```

Package script:

```json
{
  "scripts": {
    "i18n:check": "tsx scripts/check-translations.ts"
  }
}
```

Her phase testlerine eklenecek:

```bash
npm run i18n:check
```

Kontrol edilecek locale dosyaları:

```txt
tr.json
en.json
de.json
ar.json
es.json
fr.json
it.json
fa.json
ru.json
nl.json
```

---

## 12. E2E Language Switch Test

E2E test senaryosu:

```txt
1. Ana sayfayı aç.
2. Dil seçiciye tıkla.
3. Español seç.
4. UI’da İspanyolca bir metin gör.
5. Français seç.
6. UI’da Fransızca bir metin gör.
7. Italiano seç.
8. UI’da İtalyanca bir metin gör.
9. فارسی seç.
10. html dir="rtl" kontrol et.
11. Русский seç.
12. UI’da Kiril metin gör.
13. Nederlands seç.
14. UI’da Hollandaca bir metin gör.
15. Sayfayı yenile.
16. Seçilen dilin korunduğunu kontrol et.
```

---

## 13. SEO Güncellemesi

Yeni hreflang listesi:

```txt
tr
en
de
ar
es
fr
it
fa
ru
nl
x-default
```

Kontrol edilecekler:

```txt
- Canonical URL doğru.
- Locale route doğru.
- Sitemap yeni locale route’ları içeriyor.
- Marketplace locale route’ları destekliyor.
- Public booking sayfaları locale ile açılabiliyor.
- ru ve nl locale route’ları 404 vermiyor.
```

---

## 14. Notification Template Güncellemesi

Yeni dillerde eklenecek notification template grupları:

```txt
appointment_created
appointment_confirmed
appointment_cancelled
appointment_reminder_24h
appointment_reminder_3h
payment_pending
payment_success
payment_failed
subscription_active
subscription_failed
```

Kurallar:

```txt
- Farsça RTL template preview düzgün görünmeli.
- Arapça ve Farsça metinlerde değişken yerleşimi test edilmeli.
- Rusça Kiril karakterler email/SMS/WhatsApp preview’da doğru görünmeli.
- Hollandaca uzun metinler bildirim preview’da taşmamalı.
- Değişkenler çevrilmemeli:
  {{customerName}}
  {{businessName}}
  {{date}}
  {{time}}
  {{serviceName}}
```

---

## 15. GitHub Push Politikası

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful message"
git push
```

Ama sadece şu şartlarda push yapılır:

```txt
- i18n:check geçti.
- Typecheck geçti.
- Lint geçti.
- Testler geçti.
- Build geçti.
- Translation check geçti.
```

Test fail olursa:

```txt
1. Fail raporu oluştur.
2. Bug fix yap.
3. Testleri tekrar çalıştır.
4. Sonra commit + push yap.
```

---

## 16. Compact Protokolü

Her 2 phase sonrası:

```txt
1. docs/COMPACT_STATE.md güncelle.
2. Son phase’lerde yapılanları yaz.
3. Yeni dil dosyalarını yaz.
4. Yeni test durumunu yaz.
5. Bilinen riskleri yaz.
6. Sonraki phase prompt’unu hazırla.
7. Claude Code destekliyorsa /compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

Compact sonrası prompt:

```txt
Read docs/COMPACT_STATE.md and SLOTPILOT_EXTRA_LANGUAGE_PACKS_EXPANDED_UPDATE_PLAN.md.
Continue from the next unfinished LANG phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

## 17. Final Definition of Done

Bu güncelleme bitmiş sayılması için:

```txt
- Dil seçicide 10 dil görünüyor.
- es/fr/it/fa/ru/nl locale config’e eklendi.
- es/fr/it/fa/ru/nl translation JSON dosyaları var.
- Missing translation key yok.
- JSON parse hatası yok.
- Farsça RTL çalışıyor.
- Arapça RTL bozulmadı.
- Rusça Kiril karakterler doğru render oluyor.
- Hollandaca LTR ve uzun metinler UI taşması yapmıyor.
- Web build geçiyor.
- Mobil app dil listesi güncellendi.
- Locale persistence çalışıyor.
- SEO hreflang 10 dili kapsıyor.
- Notification template language coverage güncellendi.
- Yeni dil ekleme dokümanı hazır.
- CHANGELOG güncel.
- GitHub push yapıldı.
```

---

## 18. Claude Code Ana Prompt’u

```txt
Read SLOTPILOT_EXTRA_LANGUAGE_PACKS_EXPANDED_UPDATE_PLAN.md carefully.

This update adds Spanish, French, Italian, Persian, Russian, and Dutch language packs to the existing SlotPilot/Randevo i18n system.

Do not implement all phases at once.

Start with Phase LANG-0 only:
- Audit current translation keys.
- Create docs/language-pack-audit.md.
- Add or verify i18n check script.
- Run tests/build.
- Commit and push only if tests pass.

Important:
- Farsi/fa must be RTL.
- Arabic/ar must remain RTL.
- Russian/ru must remain LTR and render Cyrillic correctly.
- Dutch/nl must remain LTR.
- Do not remove existing Turkish localization.
- After every phase run tests/build.
- After every 2 phases update docs/COMPACT_STATE.md and run or request /compact.
```

---

## 19. Antigravity Ana Prompt’u

```txt
Read SLOTPILOT_EXTRA_LANGUAGE_PACKS_EXPANDED_UPDATE_PLAN.md.

Create or update the required i18n agents first.

Then start with Phase LANG-0 only.
Use browser automation to verify the existing language selector before changes.

Do not start Phase LANG-1 until LANG-0 tests pass.
Create an artifact with screenshots and QA notes.
Commit and push only if tests pass.
```

---

## 20. Final Kontrol Prompt’u

```txt
Review the entire expanded language pack update.

Check:
1. Are Spanish, French, Italian, Persian, Russian, and Dutch added?
2. Does language selector show all 10 languages?
3. Does Farsi use RTL?
4. Did Arabic RTL remain working?
5. Does Russian render Cyrillic correctly?
6. Does Dutch stay LTR and avoid layout overflow?
7. Are missing translation keys zero?
8. Are JSON translation files valid?
9. Does locale persistence work?
10. Are date/currency formatters still working?
11. Are mobile translations updated?
12. Are hreflang and sitemap updates included?
13. Do all tests pass?
14. Does build pass?
15. Was everything committed and pushed?

Fix small issues only.
Do not add new major features.
Create final release notes.
```
