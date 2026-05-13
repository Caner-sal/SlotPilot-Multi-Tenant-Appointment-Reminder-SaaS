# SlotPilot / Randevo Global Dil Paketi ve Locale Switcher Güncelleme Planı

> Bu dosya, Türkiye’ye adapte edilmiş SlotPilot / Randevo projesine global pazara açılma amacıyla çoklu dil sistemi eklemek için hazırlanmıştır.  
> Amaç: Web sitesi ve mobil uygulamada sağ üst/yan menüde dil + bayrak seçici göstermek, kullanıcı dil değiştirdiğinde tüm arayüzü seçilen dile çevirmek ve ileride yeni dil eklemeyi kontrollü, testli ve kolay hale getirmek.

---

## 1. Ana Hedef

Projeye gerçek bir globalleşme altyapısı eklenecek.

İstenen temel davranış:

```txt
1. Web uygulamasının bir köşesinde dil seçici olacak.
2. Mobil uygulamada profil/ayarlar veya header içinde dil seçici olacak.
3. Dil seçici üzerinde aktif dilin adı ve bayrağı görünecek.
4. Kullanıcı tıklayınca desteklenen diğer diller listelenecek.
5. Dil değiştirildiğinde tüm customer-facing UI seçilen dile dönecek.
6. Yeni dil eklendiğinde aynı sistem otomatik genişleyecek.
7. Dil tercihi kullanıcı hesabında, cookie’de veya local storage’da saklanacak.
8. Public booking linkleri locale destekli olacak.
9. SEO için locale route ve hreflang altyapısı hazırlanacak.
```

---

## 2. Kapsam

Bu güncelleme şu alanları kapsar:

```txt
- Web app i18n mimarisi
- Mobile app i18n mimarisi
- Dil seçici UI
- Bayrak + dil adı gösterimi
- Çeviri dosya yapısı
- Locale route yapısı
- Public booking sayfası locale desteği
- Dashboard locale desteği
- Form validation mesajları
- Email/SMS/WhatsApp template locale desteği
- Para birimi ve tarih formatlama
- Yeni dil ekleme standardı
- Translation completeness testleri
- E2E dil değiştirme testleri
- Her phase sonunda test + commit + GitHub push
- Her 2 phase sonrası compact protokolü
```

---

## 3. Teknik Karar

### 3.1 Web Uygulaması

Web tarafında önerilen yapı:

```txt
Next.js App Router + next-intl
```

Neden:

```txt
- Next.js App Router locale-based routing destekler.
- next-intl App Router ile Server Component tarafında request-scoped messages sağlayabilir.
- Locale switcher, middleware/proxy ve navigation wrapper yapısı kurulabilir.
- SEO için locale route ve hreflang üretimi daha rahat olur.
```

Örnek route yapısı:

```txt
/tr
/en
/de
/ar
/tr/dashboard
/en/dashboard
/tr/booking/[slug]
/en/booking/[slug]
```

Varsayılan dil:

```txt
tr
```

İlk desteklenecek diller:

```txt
tr — Türkçe
en — English
de — Deutsch
ar — العربية
```

İkinci dalga diller:

```txt
fr — Français
es — Español
ru — Русский
nl — Nederlands
```

### 3.2 Mobil Uygulama

Mobil tarafında önerilen yapı:

```txt
Expo / React Native + expo-localization + i18n-js veya react-i18next
```

İlk öneri:

```txt
i18n-js + expo-localization
```

Neden:

```txt
- İlk mobil sürüm için daha basit.
- Cihaz dilini okuyabilir.
- Kullanıcı seçimi AsyncStorage ile saklanabilir.
- Web dictionary yapısıyla benzer JSON mantığı kurulabilir.
```

---

## 4. Dil Seçici UI Davranışı

### 4.1 Web Dil Seçici

Konum:

```txt
- Public landing page: sağ üst header
- Public booking page: sağ üst header
- Dashboard: sidebar altı veya topbar sağ taraf
- Mobile web: hamburger menü veya topbar
```

Görünüm:

```txt
🇹🇷 Türkçe
```

Dropdown açıldığında:

```txt
🇹🇷 Türkçe
🇬🇧 English
🇩🇪 Deutsch
🇸🇦 العربية
```

Not:

```txt
Bayrak aslında ülkeyi temsil eder, dili değil. Ancak kullanıcı deneyimi için dil adı + temsilî bayrak birlikte gösterilecek. Çok ülkeli dillerde region seçimi ileride ayrıca yapılabilir.
```

### 4.2 Mobil Dil Seçici

Konum seçenekleri:

```txt
- Settings screen
- Profile screen
- Header language button
```

İlk mobil kapsam:

```txt
Settings > Dil seçimi
```

Davranış:

```txt
1. Kullanıcı dil seçer.
2. Dil AsyncStorage içine kaydedilir.
3. Uygulama anında seçilen dile döner.
4. API isteklerinde Accept-Language header gönderilir.
```

---

## 5. Dil ve Locale Config

Oluşturulacak dosya:

```txt
src/i18n/locales.ts
```

Örnek config:

```ts
export const locales = ['tr', 'en', 'de', 'ar'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'tr';

export const localeMetadata = {
  tr: {
    label: 'Türkçe',
    nativeLabel: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr',
    currency: 'TRY',
    dateLocale: 'tr-TR'
  },
  en: {
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    currency: 'USD',
    dateLocale: 'en-US'
  },
  de: {
    label: 'German',
    nativeLabel: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    currency: 'EUR',
    dateLocale: 'de-DE'
  },
  ar: {
    label: 'Arabic',
    nativeLabel: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    currency: 'USD',
    dateLocale: 'ar-SA'
  }
};
```

---

## 6. Çeviri Dosya Yapısı

Önerilen yapı:

```txt
src/messages/
├── tr.json
├── en.json
├── de.json
└── ar.json
```

Alternatif modüler yapı:

```txt
src/messages/
├── tr/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── booking.json
│   ├── billing.json
│   ├── notifications.json
│   └── validation.json
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── booking.json
│   ├── billing.json
│   ├── notifications.json
│   └── validation.json
└── ...
```

İlk phase için tek dosya yaklaşımı hızlıdır. Proje büyüdükçe modüler yapıya geçilir.

---

## 7. Translation Key Standardı

Ana kural:

```txt
UI içinde doğrudan kullanıcıya görünen string yazılmayacak.
Tüm müşteri/işletme arayüz metinleri translation key üzerinden gelecek.
```

Örnek key yapısı:

```json
{
  "common": {
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "loading": "Yükleniyor...",
    "language": "Dil"
  },
  "booking": {
    "bookAppointment": "Randevu Al",
    "selectService": "Hizmet Seç",
    "selectStaff": "Çalışan Seç",
    "selectDate": "Tarih Seç",
    "availableSlots": "Uygun Saatler",
    "appointmentCreated": "Randevunuz oluşturuldu"
  }
}
```

İngilizce örnek:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "language": "Language"
  },
  "booking": {
    "bookAppointment": "Book Appointment",
    "selectService": "Select Service",
    "selectStaff": "Select Staff",
    "selectDate": "Select Date",
    "availableSlots": "Available Slots",
    "appointmentCreated": "Your appointment has been created"
  }
}
```

---

## 8. Yeni Agent Listesi

Bu güncelleme için `.claude/agents/` içine şu agent dosyaları eklenecek:

```txt
i18n-architecture-agent.md
web-language-switcher-agent.md
mobile-language-switcher-agent.md
translation-migration-agent.md
locale-formatting-agent.md
rtl-accessibility-agent.md
notification-i18n-agent.md
seo-i18n-agent.md
i18n-qa-agent.md
compact-maintainer-agent.md
github-release-agent.md
```

---

# 9. Agent Tanımları

## 9.1 `i18n-architecture-agent.md`

```md
---
name: i18n-architecture-agent
description: Use this agent to design the global i18n architecture for web and mobile, locale routing, message files, fallback rules, and language config.
tools: Read, Write, Edit, Bash
---

You are the i18n Architecture Agent for Randevo / SlotPilot.

Responsibilities:
- Design global i18n architecture.
- Add supported locale config.
- Choose default locale as Turkish.
- Add message file structure.
- Add fallback locale rules.
- Add docs/i18n-architecture.md.
- Make sure adding a new language is easy.

Rules:
- Customer-facing strings must use translation keys.
- Internal variable names may remain English.
- Avoid hardcoded UI text.
- Do not break existing Turkish localization.
```

## 9.2 `web-language-switcher-agent.md`

```md
---
name: web-language-switcher-agent
description: Use this agent to implement web locale routing, header language dropdown, flag display, locale persistence, and language-aware navigation.
tools: Read, Write, Edit, Bash
---

You are the Web Language Switcher Agent.

Responsibilities:
- Add web language selector component.
- Show active language and flag.
- Show dropdown with supported languages.
- Change route locale when language changes.
- Preserve current pathname when switching locale.
- Store user language preference in cookie.
- Add tests for locale switching.

Rules:
- Public booking links must remain valid after switching language.
- Locale switch must not log user out.
- Dashboard route must remain protected.
```

## 9.3 `mobile-language-switcher-agent.md`

```md
---
name: mobile-language-switcher-agent
description: Use this agent to implement mobile language settings, expo-localization setup, AsyncStorage locale persistence, and mobile translation loading.
tools: Read, Write, Edit, Bash
---

You are the Mobile Language Switcher Agent.

Responsibilities:
- Add mobile i18n setup.
- Use expo-localization to detect device locale.
- Save selected locale with AsyncStorage.
- Add language selector in Settings screen.
- Send Accept-Language header with API requests.
- Add mobile tests where feasible.

Rules:
- Do not duplicate backend logic.
- Mobile must use same locale codes as web.
- Locale change should update UI without reinstalling app.
```

## 9.4 `translation-migration-agent.md`

```md
---
name: translation-migration-agent
description: Use this agent to migrate hardcoded UI strings to translation keys and create initial translation dictionaries.
tools: Read, Write, Edit, Bash
---

You are the Translation Migration Agent.

Responsibilities:
- Find hardcoded customer-facing strings.
- Replace them with translation keys.
- Create tr/en/de/ar message files.
- Keep Turkish as source language.
- Add translation coverage report.
- Add missing key tests.

Rules:
- Do not translate code identifiers.
- Do not change business logic while migrating strings.
- If translation is uncertain, use clear placeholder and mark TODO.
```

## 9.5 `locale-formatting-agent.md`

```md
---
name: locale-formatting-agent
description: Use this agent to implement locale-aware date, time, number, currency, phone, and timezone formatting.
tools: Read, Write, Edit, Bash
---

You are the Locale Formatting Agent.

Responsibilities:
- Add formatting helpers.
- Use Intl.DateTimeFormat and Intl.NumberFormat.
- Format currency per locale.
- Use Europe/Istanbul for Turkish default.
- Keep appointment times timezone-safe.
- Add formatting tests.

Rules:
- Do not hardcode currency symbols manually.
- Always use locale config.
- Appointment storage should stay timezone-safe.
```

## 9.6 `rtl-accessibility-agent.md`

```md
---
name: rtl-accessibility-agent
description: Use this agent to add RTL layout support for Arabic, accessibility checks, keyboard navigation, and screen reader labels for the language selector.
tools: Read, Write, Edit, Bash
---

You are the RTL and Accessibility Agent.

Responsibilities:
- Add dir="rtl" support for Arabic.
- Add dir="ltr" for other languages.
- Check layout mirroring.
- Add aria-labels to language selector.
- Add keyboard navigation for dropdown.
- Add accessibility tests where feasible.

Rules:
- Arabic must not break dashboard layout.
- Language selector must be keyboard accessible.
- Do not use flag-only labels; include text labels.
```

## 9.7 `notification-i18n-agent.md`

```md
---
name: notification-i18n-agent
description: Use this agent to localize email, SMS, WhatsApp, payment, and appointment notification templates.
tools: Read, Write, Edit, Bash
---

You are the Notification i18n Agent.

Responsibilities:
- Add locale-aware notification templates.
- Add template files for tr/en/de/ar.
- Use customer's preferred locale.
- Use organization's default locale if customer preference is missing.
- Add tests for template rendering.

Rules:
- Do not mix marketing and transactional notifications.
- Respect consent rules.
- Fake providers must remain default for tests.
```

## 9.8 `seo-i18n-agent.md`

```md
---
name: seo-i18n-agent
description: Use this agent to implement locale-aware metadata, hreflang, sitemap updates, localized marketplace pages, and canonical URLs.
tools: Read, Write, Edit, Bash
---

You are the SEO i18n Agent.

Responsibilities:
- Add localized metadata.
- Add hreflang alternates.
- Update sitemap generation.
- Add canonical URLs.
- Localize marketplace SEO titles/descriptions.
- Add tests for metadata helpers.

Rules:
- Public pages must expose correct locale metadata.
- Dashboard pages should not be indexed.
- Canonical URLs must avoid duplicate SEO issues.
```

## 9.9 `i18n-qa-agent.md`

```md
---
name: i18n-qa-agent
description: Use this agent to test locale switching, missing translations, formatting, RTL layout, notification templates, and regression flows.
tools: Read, Write, Edit, Bash
---

You are the i18n QA Agent.

Responsibilities:
- Run all tests after each phase.
- Add missing translation tests.
- Add locale switch e2e tests.
- Add date/currency formatting tests.
- Add RTL smoke tests.
- Add mobile locale smoke tests if mobile app exists.
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

## 9.10 `compact-maintainer-agent.md`

```md
---
name: compact-maintainer-agent
description: Use this agent every 2 phases to summarize current project state, update compact files, reduce context size, and prepare the next phase prompt.
tools: Read, Write, Edit
---

You are the Compact Maintainer Agent.

Responsibilities:
- After every 2 phases, update docs/COMPACT_STATE.md.
- Summarize completed i18n phases.
- List changed route structure.
- List new locale files.
- List passing/failing tests.
- List known translation gaps.
- Create next phase prompt.
- Ask the user to run /compact if supported.

Rules:
- Do not delete project files.
- Do not hide unresolved issues.
```

## 9.11 `github-release-agent.md`

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

Rules:
- Never push broken build intentionally.
- Do not force push without explicit approval.
```

---

# 10. Phase Sırası

Bu güncelleme 9 phase halinde yapılacak.

```txt
Phase I18N-0 — Baseline, Audit ve Mimari Karar
Phase I18N-1 — Web i18n Routing ve Message Yapısı
Phase I18N-2 — Web Dil + Bayrak Seçici
Phase I18N-3 — Translation Migration: Dashboard + Booking
Phase I18N-4 — Locale Formatting: Para, Tarih, Saat, Timezone
Phase I18N-5 — Mobil Uygulama Dil Desteği
Phase I18N-6 — RTL ve Accessibility
Phase I18N-7 — Notification Template i18n
Phase I18N-8 — SEO, QA, Docs ve GitHub Release
```

Compact kuralı:

```txt
I18N-0 + I18N-1 sonrası compact
I18N-2 + I18N-3 sonrası compact
I18N-4 + I18N-5 sonrası compact
I18N-6 + I18N-7 sonrası compact
I18N-8 sonrası final compact summary
```

Her phase sonunda:

```txt
1. Test çalıştır.
2. Build al.
3. Prisma kontrol et.
4. CHANGELOG güncelle.
5. Commit at.
6. GitHub remote varsa push yap.
```

---

# 11. Global Test Komutları

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

Mobil app varsa:

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
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

# 12. Phase Detayları

## Phase I18N-0 — Baseline, Audit ve Mimari Karar

Kullanılacak agent:

```txt
i18n-architecture-agent
i18n-qa-agent
```

Amaç:

Mevcut projede Türkçe yerelleştirme var mı, hardcoded string yoğunluğu ne kadar, web/mobile route yapısı ne durumda kontrol edilir.

Yapılacaklar:

1. Mevcut testleri çalıştır.
2. Web route yapısını analiz et.
3. Mobile app varsa klasör yapısını analiz et.
4. Hardcoded customer-facing string audit yap.
5. Mevcut Türkçe dictionary varsa kontrol et.
6. i18n mimari kararını yaz.
7. Desteklenecek ilk dilleri belirle.
8. `docs/i18n-architecture.md` oluştur.
9. `docs/i18n-string-audit.md` oluştur.
10. `CHANGELOG.md` güncelle.

Oluşturulacak dosyalar:

```txt
docs/i18n-architecture.md
docs/i18n-string-audit.md
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
- Mevcut proje bozulmadı.
- i18n mimari kararı yazıldı.
- Hardcoded string audit raporu hazır.
- Henüz büyük route değişikliği yapılmadı.
- GitHub push yapıldı.
```

Commit:

```bash
git add .
git commit -m "docs: add global i18n architecture plan"
git push
```

---

## Phase I18N-1 — Web i18n Routing ve Message Yapısı

Kullanılacak agent:

```txt
i18n-architecture-agent
i18n-qa-agent
```

Amaç:

Next.js App Router içinde locale route ve message loading sistemi kurulur.

Yapılacaklar:

1. `next-intl` kurulumu yap.
2. `src/i18n/routing.ts` oluştur.
3. `src/i18n/request.ts` oluştur.
4. `src/i18n/navigation.ts` oluştur.
5. `src/messages/tr.json` oluştur.
6. `src/messages/en.json` oluştur.
7. `src/messages/de.json` oluştur.
8. `src/messages/ar.json` oluştur.
9. App route yapısını `[locale]` segmentine taşı.
10. Default locale redirect ayarla.
11. Middleware/proxy locale negotiation kur.
12. Testleri çalıştır.

Önerilen route yapısı:

```txt
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/dashboard/...
src/app/[locale]/booking/[slug]/...
```

Testler:

```txt
- /tr açılır.
- /en açılır.
- /de açılır.
- /ar açılır.
- / route default locale’e yönlenir.
- Dashboard auth protection bozulmaz.
- Booking public route bozulmaz.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Kabul kriteri:

```txt
- Locale route sistemi çalışıyor.
- Message dosyaları yükleniyor.
- Eski Türkçe akış bozulmadı.
- GitHub push yapıldı.
```

Commit:

```bash
git add .
git commit -m "feat: add locale routing and message structure"
git push
```

Compact:

```txt
I18N-0 ve I18N-1 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase I18N-2 — Web Dil + Bayrak Seçici

Kullanılacak agent:

```txt
web-language-switcher-agent
i18n-qa-agent
```

Amaç:

Web uygulamasına dil ve bayrak dropdown’u eklenir.

Yapılacaklar:

1. `LanguageSwitcher.tsx` component oluştur.
2. Aktif dili ve bayrağı göster.
3. Dropdown’da desteklenen dilleri listele.
4. Dil değişince mevcut path korunarak yeni locale’e geç.
5. Locale cookie kaydet.
6. Dashboard topbar’a ekle.
7. Public landing page header’a ekle.
8. Public booking page header’a ekle.
9. Mobile web responsive davranışını ayarla.
10. Keyboard accessibility ekle.
11. Testleri yaz.

Component konumu:

```txt
src/components/i18n/LanguageSwitcher.tsx
```

Davranış örneği:

```txt
/tr/dashboard/services -> English seçilince /en/dashboard/services
/tr/booking/ekin-beauty -> Deutsch seçilince /de/booking/ekin-beauty
```

Testler:

```txt
- Dropdown açılır.
- Aktif dil doğru görünür.
- Dil değişince route locale değişir.
- Path korunur.
- Cookie yazılır.
- Keyboard ile aç/kapat çalışır.
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
git commit -m "feat: add language and flag switcher"
git push
```

---

## Phase I18N-3 — Translation Migration: Dashboard + Booking

Kullanılacak agent:

```txt
translation-migration-agent
i18n-qa-agent
```

Amaç:

En kritik customer-facing ekranlardaki hardcoded stringler translation key sistemine taşınır.

Öncelik sırası:

```txt
1. Public booking page
2. Landing page
3. Auth pages
4. Dashboard navigation
5. Services page
6. Staff page
7. Appointments page
8. Billing page
9. Marketplace page
10. Settings page
```

Yapılacaklar:

1. Public booking stringlerini taşı.
2. Dashboard nav stringlerini taşı.
3. Auth screen stringlerini taşı.
4. Appointment status label çevirilerini ekle.
5. Billing plan label çevirilerini ekle.
6. Validation mesajlarını taşı.
7. Translation coverage test ekle.
8. Missing key script ekle.

Script önerisi:

```txt
scripts/check-translations.ts
```

Testler:

```txt
- tr/en/de/ar dosyalarında aynı key seti var.
- Missing translation key yok.
- Public booking Türkçe ve İngilizce çalışır.
- Dashboard nav locale değiştirince çevrilir.
- Validation mesajları çevrilir.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
node scripts/check-translations.ts
```

Commit:

```bash
git add .
git commit -m "feat: migrate core UI strings to translations"
git push
```

Compact:

```txt
I18N-2 ve I18N-3 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
```

---

## Phase I18N-4 — Locale Formatting: Para, Tarih, Saat, Timezone

Kullanılacak agent:

```txt
locale-formatting-agent
i18n-qa-agent
```

Amaç:

Para, tarih, saat, sayı ve timezone gösterimleri seçilen dile göre formatlanır.

Yapılacaklar:

1. `src/lib/locale/format.ts` oluştur.
2. Currency formatting helper yaz.
3. Date formatting helper yaz.
4. Time formatting helper yaz.
5. DateTime formatting helper yaz.
6. Appointment timezone display kontrol et.
7. Billing fiyatları locale-aware göster.
8. Dashboard analytics sayıları locale-aware göster.
9. Tests yaz.

Örnekler:

```txt
tr: 249,00 ₺
en: $249.00 veya configured currency
de: 249,00 €
ar: locale config’e göre
```

Önemli karar:

```txt
Türkiye paketleri TRY kalabilir.
Global market için currency mapping ayrıca planlanabilir.
Bu phase, UI formatlamayı locale-aware yapar; gerçek multi-currency billing ayrı phase olabilir.
```

Testler:

```txt
- tr-TR currency doğru formatlanır.
- en-US date doğru formatlanır.
- de-DE date doğru formatlanır.
- ar-SA display crash etmez.
- Appointment time Europe/Istanbul için doğru görünür.
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
git commit -m "feat: add locale aware formatting"
git push
```

---

## Phase I18N-5 — Mobil Uygulama Dil Desteği

Kullanılacak agent:

```txt
mobile-language-switcher-agent
i18n-qa-agent
```

Amaç:

Mobil uygulama varsa aynı dil sistemine bağlanır.

Yapılacaklar:

1. Mobil app var mı kontrol et.
2. `expo-localization` ekle.
3. `i18n-js` veya mevcut i18n kütüphanesini kur.
4. Mobile messages dosyalarını oluştur.
5. Web locale config ile aynı locale kodlarını kullan.
6. Settings screen’e language selector ekle.
7. AsyncStorage ile tercih sakla.
8. API client’a `Accept-Language` header ekle.
9. Mobil test/smoke test yaz.

Paketler:

```bash
npx expo install expo-localization
npm install i18n-js
```

Testler:

```txt
- Cihaz dili okunur.
- Kullanıcı dili değiştirir.
- Dil tercihi saklanır.
- App restart sonrası seçili dil korunur.
- API request Accept-Language gönderir.
```

Komutlar:

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
```

Root testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add mobile language switching"
git push
```

Compact:

```txt
I18N-4 ve I18N-5 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
```

---

## Phase I18N-6 — RTL ve Accessibility

Kullanılacak agent:

```txt
rtl-accessibility-agent
i18n-qa-agent
```

Amaç:

Arabic gibi RTL diller için temel layout ve erişilebilirlik desteği eklenir.

Yapılacaklar:

1. Locale metadata içine `direction` ekle.
2. `[locale]/layout.tsx` içinde `html lang` ve `dir` set et.
3. Arabic için `dir="rtl"` uygula.
4. Sidebar ve dropdown layout kontrol et.
5. Form input hizalamalarını kontrol et.
6. Language switcher aria-label ekle.
7. Keyboard navigation test et.
8. Screen reader label ekle.
9. RTL smoke test yaz.

Testler:

```txt
- /ar route html dir="rtl" üretir.
- /tr route html dir="ltr" üretir.
- Language switcher keyboard ile kullanılabilir.
- Flag-only button yoktur; text label vardır.
- Arabic route build sırasında kırılmaz.
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
git commit -m "feat: add RTL and accessible language selector support"
git push
```

---

## Phase I18N-7 — Notification Template i18n

Kullanılacak agent:

```txt
notification-i18n-agent
i18n-qa-agent
```

Amaç:

Email, SMS, WhatsApp ve payment notification template’leri seçilen dile göre gönderilir.

Yapılacaklar:

1. `src/messages/{locale}/notifications.json` yapısı oluştur.
2. Appointment created template çevir.
3. Appointment reminder template çevir.
4. Appointment cancelled template çevir.
5. Payment pending template çevir.
6. Payment successful template çevir.
7. Subscription active template çevir.
8. Customer preferred locale alanı ekle, yoksa organization default locale kullan.
9. Template render testleri yaz.
10. Fake SMS/WhatsApp/email provider testlerini güncelle.

Locale seçme sırası:

```txt
1. Customer preferredLocale
2. Organization defaultLocale
3. User account locale
4. System defaultLocale = tr
```

Testler:

```txt
- Türkçe reminder Türkçe gelir.
- İngilizce customer için İngilizce template render edilir.
- Missing locale fallback tr çalışır.
- Marketing consent ayrımı bozulmaz.
- Fake providers testte çalışır.
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
git commit -m "feat: add localized notification templates"
git push
```

Compact:

```txt
I18N-6 ve I18N-7 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
```

---

## Phase I18N-8 — SEO, QA, Docs ve GitHub Release

Kullanılacak agent:

```txt
seo-i18n-agent
i18n-qa-agent
github-release-agent
compact-maintainer-agent
```

Amaç:

Global dil sistemi release-ready hale getirilir.

Yapılacaklar:

1. Locale-aware metadata ekle.
2. hreflang alternates ekle.
3. Canonical URL helper yaz.
4. Sitemap locale route’ları desteklesin.
5. Public marketplace metadata çevir.
6. Dashboard noindex korumasını kontrol et.
7. README i18n bölümünü ekle.
8. `docs/adding-new-language.md` oluştur.
9. Final translation coverage raporu oluştur.
10. Final e2e test çalıştır.
11. GitHub release tag oluştur.

Oluşturulacak doküman:

```txt
docs/adding-new-language.md
```

Yeni dil ekleme rehberi içeriği:

```txt
1. Locale code ekle.
2. localeMetadata içine label, flag, direction, currency, dateLocale ekle.
3. messages dosyasını kopyala.
4. Tüm translation keyleri doldur.
5. Notification templates ekle.
6. Formatting testlerini güncelle.
7. E2E locale switch testine dili ekle.
8. Build/test çalıştır.
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
node scripts/check-translations.ts
```

Final E2E akış:

```txt
1. /tr açılır.
2. Language selector görünür.
3. English seçilir.
4. Route /en olur.
5. Public booking metinleri İngilizce olur.
6. Dashboard login sonrası İngilizce nav görünür.
7. German seçilir.
8. Route /de olur.
9. Arabic seçilir.
10. Route /ar olur ve dir=rtl çalışır.
11. Booking flow herhangi bir dilde bozulmaz.
12. Payment flow dil değişince bozulmaz.
13. Notification template selected locale ile render edilir.
```

Commit:

```bash
git add .
git commit -m "chore: finalize global i18n release"
git push
git tag v1.3.0-global-i18n
git push origin v1.3.0-global-i18n
```

Final compact:

```txt
docs/COMPACT_STATE.md güncelle.
Global i18n release özetini yaz.
Sonraki geliştirme önerilerini listele.
```

---

# 13. Environment Variables

Gerekirse `.env.example` içine eklenecek alanlar:

```env
# Locale
APP_DEFAULT_LOCALE=tr
APP_SUPPORTED_LOCALES=tr,en,de,ar
APP_FALLBACK_LOCALE=tr
APP_ENABLE_LOCALE_DETECTION=true
NEXT_PUBLIC_DEFAULT_LOCALE=tr
```

---

# 14. Database Güncellemeleri

Muhtemel model güncellemeleri:

```txt
User.preferredLocale
Organization.defaultLocale
Customer.preferredLocale
NotificationTemplate.locale
MarketplaceProfile.localizedTitle optional
MarketplaceProfile.localizedDescription optional
```

Önerilen Prisma alanları:

```txt
preferredLocale String @default("tr")
defaultLocale String @default("tr")
```

Kural:

```txt
Locale alanları serbest string gibi görünse bile backend valid locale listesine göre validate edilmeli.
```

---

# 15. Dil Seçici Tasarım Kuralları

```txt
- Sadece bayrak gösterme; dil adı da göster.
- Aktif dili net göster.
- Dropdown mobile’da taşmamalı.
- Keyboard ile açılıp kapanabilmeli.
- Screen reader için aria-label olmalı.
- RTL dilde dropdown layout bozulmamalı.
```

Örnek:

```tsx
<LanguageSwitcher />
```

Görünüm:

```txt
🇹🇷 Türkçe  v
```

Dropdown:

```txt
🇹🇷 Türkçe
🇬🇧 English
🇩🇪 Deutsch
🇸🇦 العربية
```

---

# 16. Yeni Dil Ekleme Standardı

Yeni bir dil eklemek için yapılacaklar:

```txt
1. src/i18n/locales.ts içinde locale kodunu ekle.
2. localeMetadata içine dil adı, native label, flag, direction, currency, dateLocale ekle.
3. src/messages/{locale}.json oluştur.
4. Notification templates ekle.
5. Validation messages ekle.
6. Locale formatting testini ekle.
7. check-translations scriptini çalıştır.
8. E2E switcher testine ekle.
9. Build/test çalıştır.
10. Commit + push yap.
```

Örnek Fransızca ekleme:

```txt
locale: fr
nativeLabel: Français
flag: 🇫🇷
direction: ltr
dateLocale: fr-FR
currency: EUR
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

# 18. Compact Protokolü

Her 2 phase sonrası:

```txt
1. docs/COMPACT_STATE.md güncelle.
2. Son phase’lerde yapılanları yaz.
3. Yeni locale dosyalarını yaz.
4. Yeni route değişikliklerini yaz.
5. Translation coverage durumunu yaz.
6. Test durumunu yaz.
7. Bilinen riskleri yaz.
8. Sonraki phase prompt’unu hazırla.
9. Claude Code destekliyorsa /compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

Compact sonrası prompt:

```txt
Read docs/COMPACT_STATE.md and SLOTPILOT_GLOBAL_I18N_LANGUAGE_PACK_PLAN.md.
Continue from the next unfinished I18N phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

# 19. Claude Code Ana Prompt’u

```txt
Read SLOTPILOT_GLOBAL_I18N_LANGUAGE_PACK_PLAN.md carefully.

This is the global i18n and language pack update plan for Randevo / SlotPilot.
Do not implement all phases at once.

Start with Phase I18N-0 only:
- Create missing i18n agents under .claude/agents.
- Audit current hardcoded UI strings.
- Create docs/i18n-architecture.md.
- Create docs/i18n-string-audit.md.
- Run baseline tests.
- Do not change route structure yet.
- Commit and push only if tests pass.

Important:
- Default locale is Turkish.
- First locales are tr, en, de, ar.
- Customer-facing strings must use translation keys.
- The language switcher must show flag + language name.
- Adding a new language later must be easy.
- After every phase run tests/build.
- After every 2 phases update docs/COMPACT_STATE.md and run or request /compact.
```

---

# 20. Antigravity Ana Prompt’u

```txt
Read SLOTPILOT_GLOBAL_I18N_LANGUAGE_PACK_PLAN.md.

Create the new i18n agents first.

Then start with Phase I18N-0 only.
Use browser automation to verify current project still works:
1. Open the Turkish landing page.
2. Register/login.
3. Create or open a business.
4. Open dashboard.
5. Open public booking page.
6. Create a booking.
7. Confirm appointment appears in dashboard.

Do not start Phase I18N-1 until I18N-0 tests pass.
Create an artifact with screenshots and QA notes.
Commit and push only if tests pass.
```

---

# 21. Final Definition of Done

Global i18n güncellemesi bitmiş sayılması için:

```txt
- Web route yapısı locale destekli.
- tr/en/de/ar message files var.
- Dil seçici webde çalışıyor.
- Dil seçici mobile appte çalışıyor, mobile app varsa.
- Aktif dil bayrak + dil adı ile görünüyor.
- Dil değişince mevcut path korunuyor.
- Dashboard UI çevriliyor.
- Public booking UI çevriliyor.
- Form validation mesajları çevriliyor.
- Para/tarih/saat locale-aware formatlanıyor.
- Arabic için RTL smoke test geçiyor.
- Notification templates locale-aware çalışıyor.
- SEO hreflang/canonical yapısı hazır.
- Yeni dil ekleme dokümanı hazır.
- Translation coverage script geçiyor.
- Testler geçiyor.
- Build geçiyor.
- GitHub push yapıldı.
```

---

# 22. Final Kontrol Prompt’u

```txt
Review the whole global i18n implementation.

Check:
1. Does /tr work?
2. Does /en work?
3. Does /de work?
4. Does /ar work with RTL?
5. Does the language switcher show flag and language name?
6. Does changing language preserve the current path?
7. Are dashboard strings translated?
8. Are public booking strings translated?
9. Are validation messages translated?
10. Are dates/currencies locale-aware?
11. Do notification templates use selected locale?
12. Are there missing translation keys?
13. Does mobile language selection work if mobile exists?
14. Do all tests pass?
15. Does build pass?
16. Has everything been committed and pushed?

Fix small issues only.
Do not add new major features.
Create final release notes.
```
