# Türkiye İl/İlçe Data Audit Raporu

**Audit Tarihi:** 2026-05-16  
**Dosya:** `src/data/turkey-provinces.ts`  
**Toplam İl:** 81 ✅  
**Toplam Mevcut İlçe:** ~911  
**Eksik Resmi İlçe:** ~87  
**Hatalı Slug:** 2  

---

## Özet

| Durum | İl Sayısı |
|---|---|
| OK (tam ve doğru) | ~55 |
| FIX_REQUIRED — eksik ilçe | 13 |
| SLUG_BUG — slug yazım hatası | 2 |

**Temel sorun:** 2012 öncesi büyükşehir reformu görmezden gelinmiş. Büyük illerde sadece şehir merkezi ilçeleri mevcut; kırsal/çevresel idari ilçeler eksik.

---

## Kritik Eksikler — FIX_REQUIRED

### Ankara (06) — KRİTİK
- **Mevcut:** 8 | **Resmi:** 25 | **Eksik:** 17
- Mevcut: altindag, cankaya, etimesgut, kecioren, mamak, pursaklar, sincan, yenimahalle
- **Eklenecek:** akyurt, ayas, bala, beypazari, camlidere, cubuk, elmadag, evren, golbasi, gudul, haymana, kahramankazan, kalecik, kizilcahamam, nallihan, polatli, sereflikochisar

### İzmir (35) — KRİTİK
- **Mevcut:** 9 | **Resmi:** 30 | **Eksik:** 21
- Mevcut: bornova, buca, cigli, gaziemir, karsiyaka, karabaglar, konak, menemen, torbali
- **Eklenecek:** aliaga, balcova, bayindir, bayrakli, bergama, beydag, cesme, dikili, foca, guzelbahce, karaburun, kemalpasa, kinik, kiraz, menderes, narlidere, odemis, seferihisar, selcuk, tire, urla

### Bursa (16) — KRİTİK
- **Mevcut:** 4 (+1 geçersiz) | **Resmi:** 17 | **Eksik:** 13
- Mevcut: gorukle (geçersiz mahalle), nilufer, osmangazi, yildirim
- **Eklenecek:** buyukorhan, gemlik, gursu, harmancik, inegol, iznik, karacabey, keles, kestel, mudanya, mustafakemalpasa, orhaneli, orhangazi, yenisehir
- Not: `gorukle` Nilüfer ilçesi mahallesidır, resmi ilçe değildir. Backward compat için silinmeyecek.

### Antalya (07) — KRİTİK
- **Mevcut:** 5 | **Resmi:** 19 | **Eksik:** 14
- Mevcut: aksu, dosemealti, kepez, konyaalti, muratpasa
- **Eklenecek:** akseki, alanya, demre, elmali, finike, gazipasa, gundogmus, ibradi, kas, kemer, korkuteli, kumluca, manavgat, serik

### Mersin (33) — KRİTİK
- **Mevcut:** 4 | **Resmi:** 13 | **Eksik:** 9
- Mevcut: akdeniz, mezitli, toroslar, yenisehir
- **Eklenecek:** anamur, aydincik, bozyazi, camliyayla, erdemli, gulnar, mut, silifke, tarsus

### Konya (42)
- **Mevcut:** 27 | **Resmi:** 31 | **Eksik:** 4
- **Eklenecek:** ahirli, celtik, tuzlukcu, yalihuyuk

### Çankırı (18)
- **Mevcut:** 10 | **Resmi:** 12 | **Eksik:** 2
- **Eklenecek:** hanonu, yaprakli

### Manisa (45)
- **Mevcut:** 15 | **Resmi:** 17 | **Eksik:** 2
- **Eklenecek:** ahmetli, demirci

### Rize (53)
- **Mevcut:** 11 | **Resmi:** 12 | **Eksik:** 1
- **Eklenecek:** derepazari

### Aksaray (68)
- **Mevcut:** 7 | **Resmi:** 8 | **Eksik:** 1
- **Eklenecek:** sultanhani

### Hakkari (30)
- **Mevcut:** 4 | **Resmi:** 5 | **Eksik:** 1
- **Eklenecek:** derecik (2016'da kuruldu)

### Trabzon (61)
- **Mevcut:** 17 | **Resmi:** 18 | **Eksik:** 1
- **Eklenecek:** dernekpazari
- Not: `merkez` girdi Ortahisar olarak yeniden adlandırıldı; backward compat için silinmeyecek.

### Sakarya (54)
- **Mevcut:** 16 | **Resmi:** 17 | **Net Eksik:** 1
- Doğrulama gerekiyor (mevcut liste incelenmeli).

---

## Slug Hataları — SLUG_BUG

| İl | İlçe | Mevcut Slug | Doğru Slug | Hata |
|---|---|---|---|---|
| Nevşehir (50) | Hacıbektaş | `hacibiktas` | `hacibektas` | `bik` yerine `bek` |
| Sivas (58) | Akıncılar | `akincolar` | `akincilar` | `o` yerine `i` |

---

## Geçersiz Ama Silinmeyecek Girdiler (Backward Compat)

2012 büyükşehir reformu öncesinden kalan eski "merkez" girdileri bazı illerde var. Bunlar teknik olarak yanlış olsa da mevcut kullanıcı/randevu verisi referans alıyor olabileceğinden silinmeyecek:

- Bursa: `gorukle` (Nilüfer mahallesinin adı)
- Konya, Trabzon, Gaziantep, Diyarbakır, Samsun, Şanlıurfa vb: `merkez`

---

## İl Bazlı Tam Durum

| Plaka | İl | Mevcut | Durum |
|---|---|---|---|
| 01 | Adana | 15 | ✅ OK |
| 02 | Adıyaman | 9 | ✅ OK |
| 03 | Afyonkarahisar | 18 | ✅ OK |
| 04 | Ağrı | 8 | ✅ OK |
| 05 | Amasya | 8 | ✅ OK |
| 06 | Ankara | 8 | ❌ FIX_REQUIRED (-17) |
| 07 | Antalya | 5 | ❌ FIX_REQUIRED (-14) |
| 08 | Artvin | 8 | ✅ OK |
| 09 | Aydın | 17 | ✅ OK |
| 10 | Balıkesir | 20 | ✅ OK |
| 11 | Bilecik | 8 | ✅ OK |
| 12 | Bingöl | 9 | ✅ OK |
| 13 | Bitlis | 7 | ✅ OK |
| 14 | Bolu | 9 | ✅ OK |
| 15 | Burdur | 11 | ✅ OK |
| 16 | Bursa | 4 | ❌ FIX_REQUIRED (-13) |
| 17 | Çanakkale | 12 | ✅ OK |
| 18 | Çankırı | 10 | ❌ FIX_REQUIRED (-2) |
| 19 | Çorum | 14 | ✅ OK |
| 20 | Denizli | 21 | ✅ OK |
| 21 | Diyarbakır | 18 | ✅ OK |
| 22 | Edirne | 9 | ✅ OK |
| 23 | Elazığ | 13 | ✅ OK |
| 24 | Erzincan | 9 | ✅ OK |
| 25 | Erzurum | 21 | ✅ OK |
| 26 | Eskişehir | 15 | ✅ OK |
| 27 | Gaziantep | 10 | ✅ OK |
| 28 | Giresun | 16 | ✅ OK |
| 29 | Gümüşhane | 6 | ✅ OK |
| 30 | Hakkari | 4 | ❌ FIX_REQUIRED (-1) |
| 31 | Hatay | 17 | ✅ OK |
| 32 | Isparta | 14 | ✅ OK |
| 33 | Mersin | 4 | ❌ FIX_REQUIRED (-9) |
| 34 | İstanbul | 39 | ✅ OK |
| 35 | İzmir | 9 | ❌ FIX_REQUIRED (-21) |
| 36 | Kars | 8 | ✅ OK |
| 37 | Kastamonu | 20 | ✅ OK |
| 38 | Kayseri | 17 | ✅ OK |
| 39 | Kırklareli | 8 | ✅ OK |
| 40 | Kırşehir | 7 | ✅ OK |
| 41 | Kocaeli | 12 | ✅ OK (düzeltildi v1.7.0) |
| 42 | Konya | 27 | ❌ FIX_REQUIRED (-4) |
| 43 | Kütahya | 15 | ✅ OK |
| 44 | Malatya | 14 | ✅ OK |
| 45 | Manisa | 15 | ❌ FIX_REQUIRED (-2) |
| 46 | Kahramanmaraş | 12 | ✅ OK |
| 47 | Mardin | 10 | ✅ OK |
| 48 | Muğla | 14 | ✅ OK |
| 49 | Muş | 6 | ✅ OK |
| 50 | Nevşehir | 8 | ⚠️ SLUG_BUG (hacibektas) |
| 51 | Niğde | 6 | ✅ OK |
| 52 | Ordu | 20 | ✅ OK |
| 53 | Rize | 11 | ❌ FIX_REQUIRED (-1) |
| 54 | Sakarya | 16 | ❌ FIX_REQUIRED (-1) |
| 55 | Samsun | 18 | ✅ OK |
| 56 | Siirt | 7 | ✅ OK |
| 57 | Sinop | 9 | ✅ OK |
| 58 | Sivas | 18 | ⚠️ SLUG_BUG (akincilar) |
| 59 | Tekirdağ | 12 | ✅ OK |
| 60 | Tokat | 12 | ✅ OK |
| 61 | Trabzon | 17 | ❌ FIX_REQUIRED (-1) |
| 62 | Tunceli | 8 | ✅ OK |
| 63 | Şanlıurfa | 14 | ✅ OK |
| 64 | Uşak | 6 | ✅ OK |
| 65 | Van | 14 | ✅ OK |
| 66 | Yozgat | 14 | ✅ OK |
| 67 | Zonguldak | 8 | ✅ OK |
| 68 | Aksaray | 7 | ❌ FIX_REQUIRED (-1) |
| 69 | Bayburt | 3 | ✅ OK |
| 70 | Karaman | 6 | ✅ OK |
| 71 | Kırıkkale | 9 | ✅ OK |
| 72 | Batman | 6 | ✅ OK |
| 73 | Şırnak | 7 | ✅ OK |
| 74 | Bartın | 4 | ✅ OK |
| 75 | Ardahan | 6 | ✅ OK |
| 76 | Iğdır | 4 | ✅ OK |
| 77 | Yalova | 6 | ✅ OK |
| 78 | Karabük | 6 | ✅ OK |
| 79 | Kilis | 4 | ✅ OK |
| 80 | Osmaniye | 7 | ✅ OK |
| 81 | Düzce | 8 | ✅ OK |

---

## UCF-2 Aksiyon Planı

1. **Büyük eklemeler:** Ankara +17, İzmir +21, Bursa +13, Antalya +14, Mersin +9
2. **Küçük eklemeler:** Konya +4, Çankırı +2, Manisa +2, Rize +1, Aksaray +1, Hakkari +1, Trabzon +1, Sakarya +1
3. **Slug düzeltmeleri:** Nevşehir hacibiktas→hacibektas, Sivas akincolar→akincilar
4. **Silinmeyecek:** gorukle, merkez girdileri (backward compat)
5. **Yeni:** `scripts/validate-turkey-location-data.ts` + `npm run check:turkey-locations`
