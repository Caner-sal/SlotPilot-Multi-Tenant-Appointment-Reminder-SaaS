# GEOUI Bug Audit — Geo Locale & UI Consistency

> Tarih: 2026-05-15  
> Phase: GEOUI-0  
> Amaç: Hataların kaynaklarını belgelemek. Bu dosya kod değişikliği içermez.

---

## Bug 1 — Local Dev'de Almanca Açılma

**Belirti:** `npm run dev` sonrası uygulama TR/tr yerine DE/de ile açılıyor.

**Kök Neden:**  
`src/i18n/request-locale.ts:142` — `resolveFallback()` fonksiyonu `"en"` döndürüyor.  
Local dev'de IP geo header'ları (`x-vercel-ip-country`, `cf-ipcountry`) gelmez.  
Sıra 5'te Accept-Language devreye girer, tarayıcı `Accept-Language: de,en;q=0.9` gönderiyorsa `"de"` kazanır.  
Fallback hiç çalışmaz çünkü Accept-Language zaten bir sonuç üretir.

**Etkilenen dosya:** `src/i18n/request-locale.ts:142`
```ts
// Şu an (YANLIŞ):
function resolveFallback(fallbackLocale?: string | null): AppLocale {
  if (fallbackLocale && isAppLocale(fallbackLocale)) return fallbackLocale;
  return "en"; // ← DEĞİŞMELİ
}
```

**Fix:** `return "tr"` ve/veya `.env.local`'a `APP_GEO_FALLBACK_LOCALE=tr` ekle.

**Öncelik:** Kritik.

---

## Bug 2 — Login Sayfasında Hard-coded Türkiye Copy

**Belirti:** Almanya'dan veya İtalya'dan giren kullanıcı login sol panelinde Türkçe "Türkiye'nin akıllı randevu platformu" görüyor.

**Etkilenen dosya:** `src/app/(auth)/login/page.tsx`

| Satır | Hard-coded Türkiye İçerik |
|-------|--------------------------|
| 87–91 | `Türkiye'nin` + `akıllı randevu` + `platformu` — başlık |
| 98 | `"KVKK uyumlu, Türkiye'ye özel altyapı"` — feature listesi |
| 111 | Testimonial: `"Randevo ile randevu iptallerimiz %60 azaldı..."` (TR-only bağlam) |
| 116–117 | `"Kemal Arslan"`, `"Kuaför İşletmecisi, İzmir"` — Türkiye'ye özel kullanıcı |
| 52 | `"E-posta veya şifre hatalı."` — hard-coded Türkçe hata mesajı (useTranslations kullanmıyor) |

**Fix:** `useMarketContext()` hook'u ile `isTurkey` kontrolü; TR'de mevcut copy, non-TR'de global copy.

**Öncelik:** Yüksek.

---

## Bug 3 — Landing Page TR-Only Stat/Badge

**Belirti:** DE/IT/EN kullanıcı landing page'de "Türkiye MVP — Canlı" ve "Türkiye Desteği" statları görüyor.

**Etkilenen dosya:** `src/messages/tr.json` ve `src/app/page.tsx`

| Key (tr.json) | Değer | Sorun |
|---------------|-------|-------|
| `landing.heroBadge` | `"Türkiye MVP — Canlı"` | Diğer dil dosyalarında da TR-spesifik çeviri var olabilir |
| `landing.statSupport` | `"Türkiye Desteği"` | Non-TR pazarda anlamsız |
| `landing.f3Title` | `"Türkiye İl / İlçe Uyumlu"` | Non-TR'de gösterilmemeli |
| `landing.f3Desc` | `"81 il ve tüm ilçe yapısıyla..."` | Non-TR'de gösterilmemeli |

**Fix:** Bu stat ve badge'leri `isTurkey` koşuluyla sarmalamak.

**Öncelik:** Orta.

---

## Bug 4 — Booking Layout Hard-coded Renkler

**Belirti:** Public booking sayfası açık gri/beyaz arka plan kullanıyor; dark theme Randevo tasarımıyla uyumsuz.

**Etkilenen dosya:** `src/app/booking/[slug]/layout.tsx`

| Satır | Hard-coded Class | Doğru Token |
|-------|-----------------|-------------|
| 9 | `bg-gray-50` | `bg-background` |
| 10 | `bg-white` | `bg-card` |
| 10 | `border-gray-200` | `border-border` |
| 12 | `text-gray-900` | `text-foreground` |
| 13 | `text-blue-600` | `text-primary` |

**Öncelik:** Yüksek.

---

## Bug 5 — Marketplace Sayfası Hard-coded Renkler

**Belirti:** Marketplace listesi ve detay sayfaları açık gri/beyaz görünüyor.

**Etkilenen dosyalar:**
- `src/app/marketplace/page.tsx`
- `src/app/marketplace/[slug]/page.tsx`

Bunlarda `bg-gray-50`, `bg-white`, `text-gray-900`, `text-gray-500/600`, `text-blue-600` vb. yaygın.

**Öncelik:** Yüksek.

---

## Bug 6 — Booking Step Indicator Hard-coded Renkler

**Belirti:** Booking akışındaki step numaraları `bg-blue-600` ile gösteriliyor; primary tema tokenıyla uyumsuz.

**Etkilenen dosya:** `src/app/booking/[slug]/page.tsx`

Hard-coded: `bg-blue-600`, `ring-blue-100`, `text-gray-300`, `text-gray-600`, `bg-blue-100 text-blue-700`, `hover:bg-gray-100`, `text-gray-400`.

**Öncelik:** Orta.

---

## Bug 7 — Takvim Grid Hizalama Sorunu

**Belirti:** Booking takviminde hafta günü başlıkları (Pzt, Sal...) ve tarih hücreleri tam hizalı değil; ay içindeki ilk gün yanlış sütunda başlayabiliyor.

**Kök Neden:**  
`src/components/ui/calendar.tsx` DayPicker v9 kullanıyor. `<table>` (`month_grid`) içindeki `<tr>` satırları ve `<thead>` satırları ayrı styling alıyor.

- `weekdays: "flex"` + `weekday: "w-9"` (sabit 36px) → toplam 252px
- `week: "mt-1 flex w-full"` + `day: "h-9 w-9"` (sabit 36px) → aynı sabit genişlik
- Container genişliği farklıysa (padding, margin) sabit `w-9` taşar veya eksik kalır

`src/components/booking/BookingDatePicker.tsx` bunu `w-[14.285%]` (yüzde) ile override ediyor ama `month_grid` table'ı `table-fixed` olmadığı için browser hücre genişliğini içeriğe göre ayarlayabiliyor.

**Etkilenen dosyalar:**
- `src/components/ui/calendar.tsx:36-41` — base classNames
- `src/components/booking/BookingDatePicker.tsx:56-63` — override classNames

**Fix:** `month_grid` → `"w-full border-collapse table-fixed"`, tüm `weekday` ve `day` class'ları → `flex-1`.

**Öncelik:** Yüksek.

---

## Bug 8 — Eksik Geo Yapı Dosyaları

**Belirti:** Plan `src/config/locale-market.ts` ve `src/lib/geo/` helper'larını gerektiriyor ama bu dosyalar mevcut değil.

**Mevcut:** `src/i18n/request-locale.ts` içinde `countryLocaleMap` ve `getCountryCodeFromHeaders` zaten var.

**Eksik dosyalar:**
- `src/config/locale-market.ts` — MARKET_DEFAULTS config, `landingVariant` bilgisi
- `src/lib/geo/detect-country.ts` — server component'ler için wrapper
- `src/lib/geo/detect-locale.ts` — resolveLocale wrapper
- `src/lib/geo/market-context.ts` — `getMarketConfig()` helper
- `src/lib/geo/use-market-context.ts` — client-side React hook

**Öncelik:** Orta (diğer bug fix'leri için ön koşul).

---

## Bug 9 — Eksik `randevo_country` ve `randevo_locale_source` Cookie'leri

**Belirti:** Sistem sadece `NEXT_LOCALE` cookie kullanıyor. Hangi ülkedeyiz ve kullanıcı manuel mi seçti bilgisi saklanmıyor.

**Etkilenen dosya:** `src/middleware.ts`

**Mevcut cookie:** `NEXT_LOCALE` (locale bilgisi)  
**Eksik cookie'ler:**
- `randevo_country` — `TR`, `DE`, `IT` vb. ülke kodu
- `randevo_locale_source` — `manual` | `ip` | `accept-language` | `default`

`randevo_locale_source=manual` olmadan IP geolocation'ın manuel seçimi ezip ezmediği takip edilemiyor.

**Öncelik:** Orta.

---

## Dashboard & Staff Sayfaları (Not: İkincil)

Aşağıdaki sayfalar da hard-coded class barındırıyor ancak kullanıcı akışında kritik değil:
- `src/app/dashboard/services/page.tsx`
- `src/app/dashboard/staff/page.tsx`
- `src/app/dashboard/analytics/page.tsx`
- `src/app/staff/dashboard/page.tsx`
- `src/app/admin/organizations/page.tsx`

Bunlar GEOUI-4 kapsamı dışında; ayrı bir UI cleanup phase'ine bırakılıyor.

---

## Özet Tablo

| Bug # | Açıklama | Dosya | Phase |
|-------|----------|-------|-------|
| 1 | Fallback locale `"en"` → local dev Almanca açılıyor | `src/i18n/request-locale.ts:142` | GEOUI-1 |
| 2 | Login sayfası hard-coded TR copy | `src/app/(auth)/login/page.tsx:87-120` | GEOUI-3 |
| 3 | Landing page TR-only stat/badge | `src/app/page.tsx` + `src/messages/tr.json` | GEOUI-3 |
| 4 | Booking layout `bg-white`/`bg-gray-50` | `src/app/booking/[slug]/layout.tsx:9-13` | GEOUI-4 |
| 5 | Marketplace hard-coded beyaz/gri | `src/app/marketplace/*.tsx` | GEOUI-4 |
| 6 | Booking step indicator `bg-blue-600` | `src/app/booking/[slug]/page.tsx` | GEOUI-6 |
| 7 | Takvim grid hizalama (`table-fixed` eksik) | `src/components/ui/calendar.tsx`, `BookingDatePicker.tsx` | GEOUI-5 |
| 8 | Eksik geo yapı dosyaları | — | GEOUI-1 |
| 9 | Eksik `randevo_country` / `randevo_locale_source` cookie | `src/middleware.ts` | GEOUI-2 |

---

*Kod değişikliği GEOUI-1'den itibaren başlayacak.*
