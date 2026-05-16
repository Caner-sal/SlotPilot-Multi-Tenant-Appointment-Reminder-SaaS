# Randevo — Geo Locale, Global Copy ve Unified UI Fix Planı

> Amaç: Randevo’da yanlış otomatik dil/ülke seçimi, Türkiye’ye hard-code bağlı landing/login metinleri, bozuk booking takvimi ve sayfalar arası tasarım tutarsızlığını düzeltmek.
> Bu dosya Codex ve Claude Code ile phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Görülen Sorunlar

Ekran görüntülerinden görülen problemler:

- Local ortamda uygulama Almanca açılıyor.
- Kullanıcı Türkiye’den girse bile sistem otomatik TR/tr seçmiyor.
- Landing/login ekranlarında hangi dil olursa olsun “Türkiye’nin akıllı randevu platformu”, “Türkiye’ye özel altyapı”, “KVKK uyumlu” gibi Türkiye-only copy görünüyor.
- Booking takviminde hafta günleri ve tarih grid’i kaymış.
- Slot butonları ve başlıklar çok soluk, okunabilirlik düşük.
- Public booking, auth, dashboard ve landing sayfaları aynı design system’i kullanmıyor.
- Bazı sayfalar dark tema, bazı componentler light tema gibi kalıyor.
- Kullanıcı manuel dil/ülke seçtiğinde bu seçim IP/Accept-Language tarafından ezilebiliyor.

---

## 2. Hedef Davranış

Bu güncellemeden sonra:

- İlk ziyaret sırasında kullanıcı ülkesine göre market ve locale seçilir.
- Türkiye’den gelen kullanıcı varsayılan olarak `TR/tr` görür.
- Almanya’dan gelen kullanıcı varsayılan olarak `DE/de` görür.
- İtalya’dan gelen kullanıcı varsayılan olarak `IT/it` görür.
- Kullanıcı manuel dil/ülke seçerse bu seçim cookie/localStorage ile korunur.
- Manuel tercih, IP geolocation ve browser `Accept-Language` bilgisinden daha öncelikli olur.
- Local development ortamında cookie yoksa default `TR/tr` olur.
- Türkiye’ye özel copy sadece `countryCode === "TR"` veya `marketVariant === "turkey"` iken görünür.
- Non-TR ülkelerde global/metne özel copy görünür.
- Booking takvimi düzgün hizalanmış 7 kolon grid kullanır.
- Tüm sayfalar ortak UI tokenları ve componentlerini kullanır.
- Kontrast ve responsive hataları düzelir.

---

## 3. Locale / Country Öncelik Sırası

Sistem locale ve market seçerken şu sırayı takip etmeli:

```txt
1. URL locale/country parametresi
2. Kullanıcının manuel cookie/localStorage tercihi
3. Authenticated user profile preference
4. IP geolocation country
5. Accept-Language browser header
6. Default fallback: TR/tr
```

Kural:

```txt
IP geolocation sadece ilk varsayılan seçim içindir.
Kullanıcı manuel seçim yaptıysa IP bir daha bunu ezmemeli.
```

---

## 4. IP Country Detection Stratejisi

Production provider zinciri:

```txt
1. Vercel header: x-vercel-ip-country
2. Cloudflare header: cf-ipcountry
3. Custom provider: MaxMind GeoLite2 / GeoIP veya başka geo provider
4. Accept-Language fallback
5. TR/tr fallback
```

Local development:

```env
NEXT_PUBLIC_DEFAULT_COUNTRY=TR
NEXT_PUBLIC_DEFAULT_LOCALE=tr
GEO_LOCALE_DEBUG=true
```

Local kural:

```txt
NODE_ENV=development ve manuel cookie yoksa default TR/tr.
```

---

## 5. Cookie ve Local Storage Kuralı

Önerilen cookie’ler:

```txt
NEXT_LOCALE=tr
randevo_country=TR
randevo_locale_source=manual | ip | accept-language | default
```

Davranış:

- Dil seçici manuel değişiklik yaparsa `NEXT_LOCALE` güncellenir.
- Ülke/market seçici manuel değişiklik yaparsa `randevo_country` güncellenir.
- `randevo_locale_source=manual` ise IP tespiti bu tercihi ezmez.
- Cookie yoksa middleware/server ilk açılışta IP/Accept-Language/default sıralamasını uygular.

---

## 6. Market Defaults Config

Oluşturulacak dosya:

```txt
src/config/locale-market.ts
```

Örnek yapı:

```ts
export const MARKET_DEFAULTS = {
  TR: { countryCode: "TR", defaultLocale: "tr", currency: "TRY", landingVariant: "turkey", phoneCode: "+90" },
  DE: { countryCode: "DE", defaultLocale: "de", currency: "EUR", landingVariant: "global", phoneCode: "+49" },
  IT: { countryCode: "IT", defaultLocale: "it", currency: "EUR", landingVariant: "global", phoneCode: "+39" },
  US: { countryCode: "US", defaultLocale: "en", currency: "USD", landingVariant: "global", phoneCode: "+1" },
  GB: { countryCode: "GB", defaultLocale: "en", currency: "GBP", landingVariant: "global", phoneCode: "+44" },
  FR: { countryCode: "FR", defaultLocale: "fr", currency: "EUR", landingVariant: "global", phoneCode: "+33" },
  ES: { countryCode: "ES", defaultLocale: "es", currency: "EUR", landingVariant: "global", phoneCode: "+34" },
  NL: { countryCode: "NL", defaultLocale: "nl", currency: "EUR", landingVariant: "global", phoneCode: "+31" },
  RU: { countryCode: "RU", defaultLocale: "ru", currency: "RUB", landingVariant: "global", phoneCode: "+7" }
} as const;

export const DEFAULT_COUNTRY = "TR";
export const DEFAULT_LOCALE = "tr";
```

---

## 7. Geo Helper Planı

Oluşturulacak dosyalar:

```txt
src/lib/geo/detect-country.ts
src/lib/geo/detect-locale.ts
src/lib/geo/locale-preference.ts
src/lib/geo/market-context.ts
```

`detect-country.ts` örnek mantık:

```ts
export function detectCountryFromHeaders(headers: Headers): string | null {
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry) return vercelCountry.toUpperCase();

  const cloudflareCountry = headers.get("cf-ipcountry");
  if (cloudflareCountry && cloudflareCountry !== "XX") {
    return cloudflareCountry.toUpperCase();
  }

  return null;
}
```

`resolveLocale` kuralı:

```txt
1. URL locale varsa onu kullan.
2. Cookie NEXT_LOCALE varsa onu kullan.
3. randevo_country varsa market mapping ile locale bul.
4. IP country varsa market mapping ile locale bul.
5. Accept-Language varsa supported locale seç.
6. tr dön.
```

---

## 8. Landing/Login Copy Refactor

Yanlış davranış:

```txt
Her ülkede "Türkiye'nin akıllı randevu platformu"
Her ülkede "KVKK uyumlu, Türkiye'ye özel altyapı"
```

Doğru davranış:

TR market:

```txt
Türkiye'nin akıllı randevu platformu
KVKK uyumlu, Türkiye'ye özel altyapı
```

Global market:

```txt
Smart booking platform for local businesses
Localized booking, reminders and payments for growing teams
```

DE market:

```txt
Intelligente Terminplattform für lokale Unternehmen
```

IT market:

```txt
La piattaforma intelligente per gestire appuntamenti locali
```

Kural:

```txt
Türkiye-only copy sadece TR market context’te görünür.
Non-TR context’te global veya o dile özel copy görünür.
```

---

## 9. Unified UI Design System Kuralları

Tüm sayfalarda şu componentler ortak token kullanmalı:

```txt
Button
Card
Table
Input
Select
Badge
Stepper
Calendar
SlotButton
PageHeader
EmptyState
LoadingState
ErrorState
```

Temizlenecek problemli kalıplar:

```txt
bg-white
text-gray-* yanlış kontrastlı kullanımlar
border-gray-* yanlış kontrastlı kullanımlar
text-black
çok açık opacity/text renkleri
sayfa bazlı hard-coded background
```

Önerilen token mantığı:

```txt
surface.page
surface.card
surface.cardMuted
text.primary
text.secondary
text.muted
border.default
border.strong
accent.primary
accent.soft
danger
success
warning
```

---

## 10. Booking Calendar Layout Fix

Takvim için zorunlu kurallar:

- Hafta günleri 7 eşit kolonda olmalı.
- Gün hücreleri 7 eşit kolonda olmalı.
- Header grid ve date grid aynı column template kullanmalı.
- Gün kısa adları locale’e göre gelmeli.
- Seçili gün, bugün, disabled gün ve normal gün net ayrılmalı.
- Mobilde taşma olmamalı.
- Slot butonları okunabilir kontrasta sahip olmalı.

Örnek layout:

```tsx
<div className="grid grid-cols-7 gap-2">
  {weekdays.map(day => <div className="text-center">{day}</div>)}
</div>

<div className="grid grid-cols-7 gap-2">
  {calendarDays.map(day => <button className="aspect-square">{day.number}</button>)}
</div>
```

---

# 11. Phase Planı

```txt
GEOUI-0 — Audit ve Bug Reproduction
GEOUI-1 — Geo Locale Detection Core
GEOUI-2 — Locale/Country Preference Middleware
GEOUI-3 — Landing/Login Global Copy Refactor
GEOUI-4 — Unified UI Design System Fix
GEOUI-5 — Booking Calendar Layout Fix
GEOUI-6 — Public Booking Flow Theme Alignment
GEOUI-7 — E2E Geo Locale ve UI Regression
GEOUI-8 — Final QA, Docs, Release
```

Her phase sonunda çalıştırılacak komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Varsa ayrıca:

```bash
npm run i18n:check
npm run test:e2e
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
Claude Code kullanılıyorsa /compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 12. Phase Detayları

## GEOUI-0 — Audit ve Bug Reproduction

Amaç: Hataların kaynaklarını belgelemek.

Yapılacaklar:

```txt
1. Landing page’i incele.
2. Login/register page’i incele.
3. Public booking step 1/2/3/4 ekranlarını incele.
4. Dashboard services/staff/appointments sayfalarını incele.
5. Takvim componentini incele.
6. Locale detection kodunu incele.
7. Cookie/localStorage locale kullanımını incele.
8. Türkiye-only copy metinlerini ara.
9. Theme-breaking classları ara.
10. docs/geoui-bug-audit.md oluştur.
```

Arama komutları:

```bash
grep -R "Türkiye" src
grep -R "Türkiye'nin" src
grep -R "Türkiye'ye özel" src
grep -R "KVKK" src
grep -R "NEXT_LOCALE" src
grep -R "localStorage" src
grep -R "Accept-Language" src
grep -R "bg-white" src
grep -R "grid-cols-7" src
```

Kabul kriteri:

```txt
- Ürün davranışı değişmedi.
- Bug audit dosyası oluştu.
- Hangi dosyaların düzeltileceği netleşti.
```

Commit:

```bash
git add .
git commit -m "docs: audit geo locale and UI consistency bugs"
git push
```

---

## GEOUI-1 — Geo Locale Detection Core

Amaç: IP country header ve fallback locale sistemini kurmak.

Yapılacaklar:

```txt
1. src/config/locale-market.ts oluştur.
2. src/lib/geo/detect-country.ts oluştur.
3. src/lib/geo/detect-locale.ts oluştur.
4. x-vercel-ip-country desteği ekle.
5. cf-ipcountry desteği ekle.
6. development fallback TR/tr yap.
7. Accept-Language fallback ekle.
8. Unit test yaz.
```

Testler:

```txt
- x-vercel-ip-country=TR -> TR/tr
- x-vercel-ip-country=DE -> DE/de
- cf-ipcountry=IT -> IT/it
- no headers + development -> TR/tr
- cookie locale varsa IP override etmez
```

Commit:

```bash
git add .
git commit -m "feat: add geo-based locale detection core"
git push
```

Compact:

```txt
GEOUI-0 ve GEOUI-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## GEOUI-2 — Locale/Country Preference Middleware

Amaç: İlk girişte otomatik seçim, manuel seçimde kalıcı tercih.

Yapılacaklar:

```txt
1. middleware.ts veya mevcut middleware’i güncelle.
2. NEXT_LOCALE cookie kullanımını netleştir.
3. randevo_country cookie ekle.
4. randevo_locale_source cookie ekle.
5. URL locale varsa onu öncelikli yap.
6. Kullanıcı manuel dil seçerse IP tekrar override etmesin.
7. LocaleSwitcher ve MarketSwitcher davranışını güncelle.
8. Localde Almanca açılma bug’ını düzelt.
```

Testler:

```txt
- Cookie yok + dev -> TR/tr
- Cookie NEXT_LOCALE=de -> de kalır
- User manually selects tr -> cookie tr olur
- IP DE ama manual tr cookie varsa tr kalır
- Unsupported locale -> tr fallback
```

Commit:

```bash
git add .
git commit -m "fix: persist locale and country preferences correctly"
git push
```

---

## GEOUI-3 — Landing/Login Global Copy Refactor

Amaç: Türkiye-only copy’leri market-aware hale getirmek.

Yapılacaklar:

```txt
1. Landing page copylerini dictionary/config’e taşı.
2. Login/register sol panel copylerini market-aware yap.
3. TR markette Türkiye-specific copy göster.
4. Global/non-TR markette global copy göster.
5. KVKK gibi Türkiye-only selling point’leri sadece TR’de göster.
6. Globalde privacy-ready/multi-country/localized booking gibi copy kullan.
7. Translation keyleri ekle.
8. Tests yaz.
```

Testler:

```txt
- TR country -> Türkiye copy görünür.
- DE country -> Türkiye copy görünmez.
- IT country -> Türkiye copy görünmez.
- Login page global copy gösterir.
```

Commit:

```bash
git add .
git commit -m "fix: make landing and auth copy market-aware"
git push
```

Compact:

```txt
GEOUI-2 ve GEOUI-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## GEOUI-4 — Unified UI Design System Fix

Amaç: Tüm sayfaların aynı arayüz sistemine bağlanması.

Yapılacaklar:

```txt
1. Common UI componentleri audit et.
2. Public booking page shell’i düzelt.
3. Dashboard shell’i düzelt.
4. Auth shell’i düzelt.
5. Card/table/button/input/select/badge stillerini standardize et.
6. Hard-coded theme-breaking classları azalt.
7. Light/dark theme contrast fix yap.
8. PageHeader component standardı ekle.
9. Empty/loading/error state standardı ekle.
```

Kontrol edilecek route’lar:

```txt
/
/login
/register
/booking/[slug]
/dashboard
/dashboard/services
/dashboard/staff
/dashboard/appointments
/staff
/admin
/marketplace
```

Commit:

```bash
git add .
git commit -m "style: unify Randevo UI design system across pages"
git push
```

---

## GEOUI-5 — Booking Calendar Layout Fix

Amaç: Takvimdeki yazı kayması ve grid bozukluğunu düzeltmek.

Yapılacaklar:

```txt
1. Booking calendar componentini bul.
2. Weekday header grid ve date grid’i aynı 7 kolon sistemine bağla.
3. Weekday label’ları locale-aware yap.
4. Gün hücrelerini aspect-square veya tutarlı height ile düzelt.
5. Month navigation UI’ını tema ile uyumlu yap.
6. Selected/disabled/today states’i netleştir.
7. Mobile responsive kontrol et.
8. Keyboard/focus states ekle.
```

Testler:

```txt
- Weekday labels üst üste binmez.
- 7 kolon hizası doğru.
- Mayıs 2026 doğru günlere hizalanır.
- Next month çalışır.
- Selected date görünür.
- Disabled dates okunur ama tıklanmaz.
```

Commit:

```bash
git add .
git commit -m "fix: repair booking calendar grid layout"
git push
```

Compact:

```txt
GEOUI-4 ve GEOUI-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## GEOUI-6 — Public Booking Flow Theme Alignment

Amaç: Booking stepper, service cards, staff/date section ve slot buttons’u aynı tasarıma almak.

Yapılacaklar:

```txt
1. BookingStepper componentini standardize et.
2. Service card seçili/seçili değil state’lerini düzelt.
3. Staff card contrast’ını düzelt.
4. Calendar card contrast’ını düzelt.
5. Slot button text contrast’ını düzelt.
6. Header/business info contrast’ını düzelt.
7. Back button ve step labels hizasını düzelt.
8. Powered by Randevo alanını tema ile uyumlu yap.
```

Testler:

```txt
- Step 1 service cards okunur.
- Step 2 staff/date başlığı okunur.
- Step 3 slot buttons okunur.
- Stepper tüm steplerde tutarlı görünür.
- Back button görünür ve çalışır.
```

Commit:

```bash
git add .
git commit -m "style: align public booking flow with design system"
git push
```

---

## GEOUI-7 — E2E Geo Locale ve UI Regression

Amaç: Bu hataların geri gelmesini engellemek.

Yapılacaklar:

```txt
1. Geo locale unit/integration tests ekle.
2. E2E test: no cookie + dev -> Türkçe/TR.
3. E2E test: header x-vercel-ip-country=DE -> DE/de context.
4. E2E test: manual tr selection IP DE’yi override eder.
5. E2E test: non-TR landing’de Türkiye copy yok.
6. E2E test: booking calendar grid görünür.
7. E2E test: next month navigation çalışır.
8. E2E test: booking slot buttons okunur.
```

Commit:

```bash
git add .
git commit -m "test: add geo locale and UI regression coverage"
git push
```

Compact:

```txt
GEOUI-6 ve GEOUI-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## GEOUI-8 — Final QA, Docs, Release

Amaç: Düzeltmeleri dokümante edip release etmek.

Yapılacaklar:

```txt
1. docs/geo-locale-strategy.md oluştur/güncelle.
2. docs/unified-ui-audit.md oluştur/güncelle.
3. docs/booking-calendar-layout-report.md oluştur/güncelle.
4. README’ye geo locale ve market-aware copy notu ekle.
5. CHANGELOG güncelle.
6. Final testleri çalıştır.
7. Release tag oluştur.
```

Final komutlar:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npx prisma validate
npx prisma generate
```

Commit/tag:

```bash
git add .
git commit -m "chore: finalize geo locale and unified UI fixes"
git push
git tag v1.6.2-geo-ui-fix
git push origin v1.6.2-geo-ui-fix
```

---

# 13. Codex Ana Prompt

```txt
Read RANDEVO_GEO_LOCALE_UI_FIX_PLAN.md completely.

We need to fix:
1. Wrong automatic locale/country selection.
2. Local dev opening in German even for a Turkey-based user.
3. Turkey-only copy appearing on landing/login regardless of market/language.
4. Booking calendar layout broken.
5. UI pages not sharing one design system.

Do not implement everything randomly.
Follow phases GEOUI-0 through GEOUI-8 in order.

Start with GEOUI-0 only:
- Audit landing, login/register, public booking, dashboard, marketplace, staff/admin if present.
- Audit locale detection, cookies, localStorage, Accept-Language handling.
- Audit calendar grid/layout.
- Audit Turkey-only copy.
- Audit theme-breaking classes.
- Create docs/geoui-bug-audit.md.
- Do not change behavior yet.
- Run tests/build.
- Commit and push only if checks pass.

Stop after GEOUI-0 and summarize.
```

---

# 14. Full Auto Prompt

Bu prompt tüm phase’leri yaptırmak içindir:

```txt
Read RANDEVO_GEO_LOCALE_UI_FIX_PLAN.md completely.

Implement all phases from GEOUI-0 to GEOUI-8 in order.

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
- Do not break existing Turkey support.
- Do not remove manual locale selector.
- Manual user preference overrides IP geolocation.
- Local dev default must be TR/tr unless cookie says otherwise.
- IP detection is only first-visit default.
- Turkey-only copy only appears for TR market.
- Global/non-TR market must not show Turkey-only copy.
- Booking calendar grid must be fixed.
- All UI pages must use one design system.
- Do not commit secrets.
- Do not force push.
```

---

# 15. Final Definition of Done

```txt
- Local dev opens TR/tr by default.
- User in Turkey gets TR/tr on first visit.
- User in Germany gets DE/de on first visit.
- User in Italy gets IT/it on first visit.
- Manual user locale/country choice persists.
- Manual choice overrides IP country.
- Landing page no longer shows Turkey-only copy in non-TR context.
- Login/register no longer show Turkey-only copy in non-TR context.
- TR context still shows Turkey-specific copy.
- Booking calendar weekday labels are aligned.
- Booking calendar date grid is aligned.
- Calendar next/previous month works.
- Slot buttons are readable.
- Public booking flow uses unified theme.
- Dashboard/services/auth/landing pages use shared design tokens.
- Contrast issues are fixed.
- E2E regression tests exist.
- Build passes.
- Tests pass.
- GitHub push and tag completed.
```
