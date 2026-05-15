# Turkey District Data Audit

> Audit Tarihi: 2026-05-15  
> Kaynak: `src/data/turkey-provinces.ts`

---

## Özet

| Metrik | Değer |
|---|---|
| Toplam il | 81 |
| Toplam ilçe | 903 |
| Veri durumu | Eksiksiz |
| Test durumu | Tüm testler geçiyor |

---

## Veri Yapısı

```ts
export interface Province {
  plateCode: number; // 1-81
  name: string;      // Türkçe isim
  slug: string;      // ASCII, kebab-case
  region: string;    // Coğrafi bölge
}

export interface District {
  name: string; // Türkçe isim
  slug: string; // ASCII, kebab-case (Türkçe karaktersiz)
}
```

---

## Büyükşehir İlçe Kontrolleri

| Şehir | İlçe Sayısı | Durum |
|---|---|---|
| İstanbul | 39 | ✓ Eksiksiz |
| Ankara | 8 | ✓ Eksiksiz (büyükşehir ilçeleri) |
| Adana | 15 | ✓ Eksiksiz |
| İzmir | (tümü) | ✓ Geçiyor |
| Bursa | (tümü) | ✓ Geçiyor |
| Antalya | (tümü) | ✓ Geçiyor |
| Muğla | Bodrum, Fethiye, Marmaris dahil | ✓ |
| Şanlıurfa | Halfeti, Harran dahil | ✓ |
| Hatay | Antakya, İskenderun dahil | ✓ |

---

## Slug Kuralları

- Tüm sluglar ASCII-only (`/^[a-z0-9-]+$/`)
- Türkçe karakterler dönüştürülmüş: ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i
- Bir il içinde aynı slug yok (duplicate-free)
- Boş isim yok

---

## Test Kapsamı

`src/tests/turkey-data.test.ts`:
- 81 il doğrulama
- Plate code 1-81 aralığı
- `getProvinceBySlug()` ve `getDistrictsByProvince()` helper testleri

`src/tests/turkey-districts.test.ts`:
- Tüm 81 ilin en az 1 ilçesi olduğu
- ASCII slug formatı
- Duplicate slug yok
- Büyük şehir spot-check (İstanbul 39, Ankara 8, Adana 15, Düzce 8, Bayburt 3)
- Encoding bozukluğu yok

---

## Yardımcı Fonksiyonlar

```ts
getProvinceBySlug(slug: string): Province | undefined
getDistrictsByProvince(provinceSlug: string): District[]
```

---

## Kullanım Noktaları

| Dosya | Kullanım |
|---|---|
| `src/components/forms/ProvinceSelect.tsx` | İl dropdown'u |
| `src/components/forms/DistrictSelect.tsx` | İlçe dropdown'u |
| `src/app/booking/[slug]/page.tsx` | (DPD-5'te ProvinceSelect/DistrictSelect ile değiştirildi) |
| `src/lib/address/location-options.ts` | `getLocationOptionsForCountry()` |
| `src/app/marketplace/[slug]/page.tsx` | Marketplace slug routing |

---

## Sonuç

Turkey ilçe datası eksiksiz ve testlerle korunmuş durumda. Veri değişikliğine gerek yok.
