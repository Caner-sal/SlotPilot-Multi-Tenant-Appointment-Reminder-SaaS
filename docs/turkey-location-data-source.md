# Türkiye Lokasyon Datası — Kaynak ve Güncelleme Prosedürü

## Dataset Bilgisi

| Alan | Değer |
|---|---|
| Dosya | `src/data/turkey-provinces.ts` |
| Toplam İl | 81 |
| Son Güncelleme | 2026-05-16 |
| Sürüm | v1.8.0 |

## Veri Kaynağı

Dataset aşağıdaki resmi kaynaklara göre oluşturulmuş ve doğrulanmıştır:

- **T.C. İçişleri Bakanlığı** — Türkiye idari bölünüm listesi (81 il, resmi ilçe sayıları)
- **TÜİK (Türkiye İstatistik Kurumu)** — Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) idari birim listesi
- **6360 sayılı Kanun** (2012) — Büyükşehir belediyesi düzenlemesi: bazı illerde eski "merkez" ilçeleri yeni adlandırılmış ilçelere bölündü

## Kapsam

```
81 il × tüm resmi ilçeler (district / ilçe belediyesi)
```

**Dahil olanlar:** Resmi idari ilçeler (ilçe müdürlüğü düzeyinde)  
**Dahil olmayanlar:** Alt birimler (mahalle, köy, belde)

## Slug Standardı

Türkçe karakterler ASCII'ye dönüştürülür:

| Türkçe | ASCII |
|---|---|
| ç | c |
| ş | s |
| ğ | g |
| ü | u |
| ö | o |
| ı | i |
| İ | i |
| Ü | u |

**Format:** lowercase, tire ile birleşik, harf ve rakam — `^[a-z0-9-]+$`

**Örnekler:**
- Şereflikoçhisar → `sereflikochisar`
- Mustafakemalpaşa → `mustafakemalpasa`
- İbradı → `ibradi`

## Backward Compatibility Notları

Bazı girdiler teknik olarak yanlış olsa da mevcut veri bütünlüğü için silinmemiştir:

| İl | Slug | Durum | Neden korunuyor |
|---|---|---|---|
| Bursa | `gorukle` | Mahalle, resmi ilçe değil | Mevcut booking verisi referans alıyor olabilir |
| Konya | `merkez` | 2012 reformu sonrası kalktı | Mevcut booking verisi referans alıyor olabilir |
| Çeşitli | `merkez` | Büyükşehir reformu kalıntısı | Aynı sebep |

## Validation

### Otomatik Kontrol

```bash
npm run check:turkey-locations
```

Şunları doğrular:
- 81 il mevcut
- Her il ≥ 3 ilçe
- Büyük iller için minimum threshold (Ankara ≥ 20, İzmir ≥ 25, vb.)
- Slug format: ASCII-only
- İl içi duplicate slug yok
- Regression: Kocaeli → dilovasi, cayirova, karamursel, basiskele

### Kapsamlı Audit

```bash
npm run audit:districts
```

Raporlama amaçlı — tüm ilçeleri listeler, cross-province çakışmaları gösterir.

## Güncelleme Prosedürü

Yeni ilçe eklendiğinde (resmi idari değişiklik):

1. `src/data/turkey-provinces.ts` dosyasındaki ilgili il bloğuna yeni ilçeyi alfabetik sırayla ekle
2. `docs/turkey-district-data-audit.md` dosyasını güncelle
3. `docs/turkey-location-data-source.md` — Son Güncelleme tarihini değiştir
4. Validation'ı çalıştır: `npm run check:turkey-locations`
5. Testleri çalıştır: `npm test`
6. Commit: `data: add [ilçe adı] district to [il adı] dataset`

## Büyük Güncelleme Geçmişi

| Sürüm | Tarih | Değişiklik |
|---|---|---|
| v1.6.3 | 2026-05 | Kocaeli 4 → 12 ilçe (DPD fix) |
| v1.7.0 | 2026-05 | Kocaeli ilçeleri tamamlandı, test coverage eklendi |
| v1.8.0 | 2026-05-16 | Tüm 81 il kapsamlı audit; Ankara +17, İzmir +21, Bursa +13, Antalya +14, Mersin +9 ve diğer 8 ilde eksikler giderildi. Toplam ~87 ilçe eklendi. |
