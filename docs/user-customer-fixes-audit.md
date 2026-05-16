# UCF Audit: İlçe Datası, Şifremi Unuttum, UI Kalıntıları, Kullanıcı Keşif

Audit tarihi: 2026-05-16  
Branch: `feature/global-address-locale`  
Tag: `v1.6.4`

---

## 1. Türkiye İlçe Datası

**Dosya:** `src/data/turkey-provinces.ts`

### Kocaeli (plate: 41) — EKSIK

Mevcut (4 ilçe, satır 174-179):
- Darıca, Gebze, İzmit, Körfez

Eksik (8 ilçe):
- Başiskele, Çayırova, Derince, Dilovası, Gölcük, Kandıra, Karamürsel, Kartepe

### Diğer İller

Audit kapsamındaki büyükşehirler:
- İstanbul: 39 ✓
- Ankara: 8 ✓
- Adana: 15 ✓
- Düzce: 8 ✓
- Bayburt: 3 ✓
- Hatay: Antakya + İskenderun ✓
- Muğla: Bodrum + Fethiye + Marmaris ✓
- Şanlıurfa: Halfeti + Harran ✓

### Test Dosyaları

- `src/tests/turkey-districts.test.ts` — genel bütünlük testleri mevcut
- `src/tests/turkey-data.test.ts` — helper fonksiyon testleri mevcut
- Kocaeli özel spot-check testi YOK → UCF-1'de eklenecek

---

## 2. Şifremi Unuttum / Password Reset

**Login sayfası:** `src/app/(auth)/login/page.tsx:197`

```tsx
<a href="#" style={{ fontSize: 12, color: "#a59cf0" }}>{t("forgotPassword")}</a>
```

- Link `href="#"` ile non-functional.
- `/forgot-password` sayfası YOK
- `/reset-password/[token]` sayfası YOK
- `POST /api/auth/forgot-password` API YOK
- `POST /api/auth/reset-password` API YOK
- `PasswordResetToken` Prisma modeli YOK

**Mevcut altyapı (yeniden kullanılacak):**
- Email servisi: `src/lib/email.ts` — `sendEmail()` + Resend/fake mode
- Rate limit: `src/lib/rate-limit.ts` — `consumeRateLimit()` + `getClientIp()`
- Password hash pattern: `src/app/api/auth/register/route.ts` — bcryptjs

---

## 3. UI Theme Kalıntıları

### `src/app/booking/[slug]/page.tsx`

| Satır | Sorun |
|---|---|
| 627 | `bg-red-50 border-red-200 text-red-700` — hardcoded light |
| 944 | `bg-green-100 text-green-600` — hardcoded light |
| 463 | `hover:border-blue-300` — hardcoded blue |

### `src/app/marketplace/location/[country]/[city]/page.tsx`

- `bg-white`, `bg-gray-50`, `text-gray-900`, `text-gray-500` kalıntıları
- `bg-blue-50 text-blue-700` badge'ler

### `src/app/dashboard/page.tsx` + `OnboardingChecklistCard.tsx`

- Inline `style={{ background: "#111120" }}` — Tailwind class yerine hardcoded
- `rgba(119,104,212,...)` — hardcoded primary color

### Design System Referansı (`src/app/globals.css`)

```
--card: hsl(242 30% 10%)
--foreground: hsl(246 60% 96%)
--destructive: hsl(350 94% 60%)
--primary: hsl(249 44% 61%)
```

---

## 4. Marketplace / Discover / Customer Sayfaları

### Mevcut

- `/marketplace` → `src/app/marketplace/page.tsx` ✓
- `/marketplace/location/[country]/[city]` → server-side listing ✓
- `/marketplace/[slug]` → işletme detay ✓
- `/booking/[slug]` → randevu wizard ✓
- `GET /api/marketplace` → `src/app/api/marketplace/route.ts` ✓

### Eksik

- `/discover` → YOK (plan: UCF-6)
- `/discover/business/[slug]` → YOK (plan: UCF-7)
- `/customer/appointments` → YOK (plan: UCF-7)
- `GET /api/discover/search` → YOK (plan: UCF-6)
- `GET /api/customer/appointments` → YOK (plan: UCF-7)

---

## 5. Non-TR Ülke Province/District Görünürlüğü

`src/lib/address/location-options.ts:10-12` — non-TR için zaten boş dönüyor.

Booking sayfasında (`src/app/booking/[slug]/page.tsx`) doğrulanacak:
- Country TR olmadığında ProvinceSelect/DistrictSelect gizleniyor mu?
- UCF-2'de kontrol edilecek.

---

## 6. Mevcut Test Sonuçları

```
Test Files: 72 passed
Tests:      488 passed
```

Tüm testler geçiyor. UCF-1 sonrası Kocaeli spot-check eklenerek tekrar çalıştırılacak.
