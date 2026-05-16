# Dark Select, Phone Dial Code ve Turkey District Bug Raporu

> Audit Tarihi: 2026-05-15  
> Branch: feature/global-address-locale  
> Baseline: 71 test dosyası, 457 test — tümü geçiyor

---

## 1. Native Select Dark Theme Sorunu

### Etkilenen Dosyalar ve Satırlar

| Dosya | Satır | Select Türü |
|---|---|---|
| `src/app/(auth)/onboarding/page.tsx` | 221 | Country select (inline style) |
| `src/app/(auth)/onboarding/page.tsx` | 251 | Timezone select (inline style) |
| `src/app/admin/subscriptions/page.tsx` | 99 | Plan select |
| `src/app/admin/subscriptions/page.tsx` | 109 | Status select |
| `src/app/booking/[slug]/page.tsx` | 673 | Country select (Tailwind) |
| `src/app/booking/[slug]/page.tsx` | 724 | Province select (TR only, Tailwind) |
| `src/app/booking/[slug]/page.tsx` | 744 | District select (TR only, Tailwind) |
| `src/app/dashboard/appointments/page.tsx` | 157, 169, 181, 257 | Filter selects |
| `src/app/dashboard/availability/page.tsx` | 154 | Time select |
| `src/app/dashboard/services/page.tsx` | 293 | Category/status select |
| `src/app/dashboard/settings/page.tsx` | 237 | Country select |
| `src/app/dashboard/settings/page.tsx` | 335 | Timezone select |
| `src/app/dashboard/whatsapp/page.tsx` | 214 | Option select |
| `src/app/marketplace/page.tsx` | 82, 92, 105 | Category/country/province selects |

### Kök Sebep

Native HTML `<select>` kullanılıyor. Tarayıcı native dropdown paneli OS/browser tarafından çizildiği için CSS `background-color` ve `color` ayarları açılan listeye uygulanmıyor. Dark theme içinde `<option>` listesi beyaz arka planla açılıyor.

### Çözüm Kapsamı (Bu PR)

DPD-0 → DPD-7 scope'u içindeki kritik düzeltmeler:
- `onboarding/page.tsx` — country + timezone selects
- `booking/[slug]/page.tsx` — country + province + district selects
- `dashboard/settings/page.tsx` — country select

Admin ve dashboard filter select'leri bu PR scope'u dışında.

### Mevcut Çözüm

`src/components/ui/select.tsx` zaten `@radix-ui/react-select` ile implement edilmiş, tam dark-theme uyumlu (`bg-popover`, `text-popover-foreground` CSS vars). Yeniden yazmaya gerek yok — bu bileşenler kullanılacak.

---

## 2. Telefon Alan Kodu +90 Hardcode Sorunu

### Kök Sebep

`src/config/country-address-config.ts`:

```ts
const defaultConfig: CountryAddressConfig = {
  countryCode: "TR",
  phoneCountryCode: "+90",  // ← BUG: tüm bilinmeyen ülkeler bu değeri alıyor
  ...
};
```

Mevcut config'de tanımlı ülkeler: TR, US, DE, FR, IT, ES  
**Eksik ülkeler:** NL, GB, CA, AU (COUNTRY_OPTIONS'da var ama config'de yok)

NL seçilince → config bulunamıyor → `defaultConfig` dönüyor → `phoneCountryCode: "+90"` → Bug.

### Etkilenen Satırlar

| Dosya | Satır | Problem |
|---|---|---|
| `src/config/country-address-config.ts` | 18 | `defaultConfig.phoneCountryCode: "+90"` |
| `src/app/(auth)/onboarding/page.tsx` | 208 | `placeholder="+90 555 000 00 00"` hardcoded |

**Not:** `src/app/booking/[slug]/page.tsx` line 666 dinamik: `${addressConfig.phoneCountryCode} 555 000 0000`. Config düzelince otomatik çalışır.

### Çözüm

1. `src/data/country-phone-codes.ts` — tüm ISO ülkeler için dial code mapping
2. `src/lib/phone/country-calling-code.ts` — `getCallingCodeForCountry(code)` helper (fallback: "" — asla "+90" değil)
3. `src/config/country-address-config.ts` — NL, GB, CA, AU ekle; `defaultConfig.phoneCountryCode` → `""`
4. `onboarding/page.tsx` line 208 — placeholder'ı dinamik yap

---

## 3. Turkey District Data Durumu

### Mevcut Durum: EKSİKSİZ

`src/data/turkey-provinces.ts`:
- 81 il ✓
- 903 ilçe ✓
- `getProvinceBySlug()` helper ✓
- `getDistrictsByProvince()` helper ✓

### Test Kapsamı: GEÇIYOR

- `src/tests/turkey-data.test.ts` — 81 il, plate code 1-81, helper fonksiyonlar ✓
- `src/tests/turkey-districts.test.ts` — tüm iller kapsamlı, ASCII sluglar, duplicate yok ✓
  - İstanbul: 39 ilçe ✓
  - Ankara: 8 ilçe ✓
  - Adana: 15 ilçe ✓
  - Büyükşehirler (Bursa, Antalya, Kocaeli, İzmir vs.) ✓

### Yapılacak

Sadece JSDoc yorumu ve `docs/turkey-district-data-audit.md` belgesi eklenecek. Veri değişikliği yok.

---

## 4. Mevcut Altyapı (Yeniden Kullanılacak)

| Bileşen | Konum | Durum |
|---|---|---|
| Radix UI Select | `src/components/ui/select.tsx` | Hazır, dark-theme uyumlu |
| Turkey provinces/districts | `src/data/turkey-provinces.ts` | Eksiksiz, testler geçiyor |
| TR-only phone normalize | `src/lib/phone.ts` | Çalışıyor, dokunulmayacak |
| Country options | `src/data/country-options.ts` | 10 ülke, CountrySelect'te kullanılacak |
| Address config | `src/config/country-address-config.ts` | Düzeltilecek (NL/GB/CA/AU + default) |

---

## 5. Fix Planı Özeti

```
DPD-1: CountrySelect + ProvinceSelect + DistrictSelect wrapper'lar
DPD-2: country-phone-codes.ts + calling-code helper + config fix
DPD-3: Onboarding placeholder + native select'ler → Radix
DPD-4: Turkey district data JSDoc + audit belgesi
DPD-5: Booking + settings native select'leri değiştir
DPD-6: E2E regression testleri
DPD-7: CHANGELOG + final QA + release tag
```
