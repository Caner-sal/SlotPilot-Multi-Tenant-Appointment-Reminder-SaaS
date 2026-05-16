# Randevo — Tüm Türkiye İlçe Datası, Şifremi Unuttum, UI Kalıntıları ve Kullanıcı Keşif Sayfası Planı

> Amaç: Randevo projesinde görülen dört önemli eksiği planlı şekilde düzeltmek:
>
> 1. **Türkiye’deki tüm illerin ilçe datasını güncel ve eksiksiz hale getirmek**  
> 2. `Şifremi unuttum` akışını gerçek ve güvenli hale getirmek  
> 3. Eski tasarımdan kalan beyaz/okunmayan UI kalıntılarını temizlemek  
> 4. İşletme panelinden ayrı olarak son kullanıcıların hizmet/konum bazlı işletme keşfedip randevu alabileceği bir kullanıcı sayfası oluşturmak  
>
> Bu dosya **Codex** ve **Claude Code** için phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Önemli Düzeltme

Önceki planda Kocaeli örneği fazla öne çıkıyordu. Bu doğru kapsam değil.

Doğru kapsam:

```txt
Sadece Kocaeli değil, Türkiye’deki 81 ilin tamamı için ilçe datası audit edilecek, eksikler bulunacak ve güncellenecek.
```

Kocaeli sadece örnek olarak kullanılır çünkü ekranda eksikliği görülen il odur.

Ama aynı problem diğer illerde de olabilir:

```txt
- İstanbul
- Ankara
- İzmir
- Bursa
- Antalya
- Konya
- Adana
- Gaziantep
- Şanlıurfa
- Mersin
- Diyarbakır
- Kayseri
- Eskişehir
- Sakarya
- Trabzon
- Erzurum
- Van
- ve diğer tüm iller
```

Bu yüzden planın ana hedefi:

```txt
81 il + güncel tüm ilçeler + validation script + regression test
```

---

## 2. Görülen Sorunlar

```txt
1. Türkiye ilçe datası parça parça ve eksik.
   Kocaeli örneğinde Dilovası, Çayırova, Karamürsel gibi ilçeler eksik görünüyor.
   Benzer eksiklikler diğer illerde de olabilir.

2. Şifremi unuttum butonu çalışmıyor.
   Kullanıcı şifresini sıfırlamak için mail alamıyor veya reset sayfasına yönlenemiyor.

3. UI’da eski tasarımdan kalan kalıntılar var.
   Bazı kartlar açık/beyaz kalıyor.
   Yazılar beyaza yakın olduğu için okunmuyor.
   Dark theme ile uyumlu olmayan componentler var.

4. Platformda işletme tarafı güçlü ama son kullanıcı için ayrı keşif/randevu deneyimi eksik.
   Kullanıcı hizmet ve konum seçip uygun işletmeleri karşılaştırarak randevu alamıyor.
```

---

## 3. Ana Hedef

Bu güncellemeden sonra:

```txt
- Türkiye 81 il datası eksiksiz olacak.
- 81 ilin tüm güncel ilçeleri tek canonical dataset içinde olacak.
- Kocaeli dahil hiçbir ilde bilinen ilçe eksikliği kalmayacak.
- İl seçilince ilçe listesi doğru filtrelenecek.
- TR dışı ülkelerde Türkiye il/ilçe dropdownları görünmeyecek.
- Dataset validation script ile korunacak.
- Şifremi unuttum akışı gerçek email/token sistemiyle çalışacak.
- Reset token güvenli şekilde hashlenmiş ve süreli olacak.
- Eski beyaz UI kalıntıları temizlenecek.
- Tüm public/auth/customer ekranları aynı tasarım sistemiyle uyumlu olacak.
- Kullanıcılar işletme sahibi olmadan da hizmet/konum bazlı işletme keşfedip randevu alabilecek.
```

---

## 4. Türkiye İlçe Datası İçin Ana Strateji

### 4.1 Tek tek il düzeltme yapılmayacak

Yanlış yaklaşım:

```txt
Kocaeli eksiklerini elle ekle, bırak.
```

Doğru yaklaşım:

```txt
Tüm Türkiye datasını tek seferde audit et.
81 il için beklenen ilçe listesini oluştur.
Mevcut dataset ile beklenen dataset’i karşılaştır.
Eksik/fazla/yanlış yazılmış ilçeleri raporla.
Sonra canonical dataset’i güncelle.
```

---

### 4.2 Canonical dataset yaklaşımı

Projede tek bir gerçek kaynak dosyası olmalı:

```txt
src/data/turkey/turkey-location-data.ts
```

Bu dosyadan şu exportlar üretilebilir:

```txt
TURKEY_PROVINCES
TURKEY_DISTRICTS
TURKEY_LOCATION_TREE
```

Önerilen yapı:

```ts
export type TurkeyProvince = {
  code: string;
  name: string;
  slug: string;
};

export type TurkeyDistrict = {
  provinceCode: string;
  provinceName: string;
  name: string;
  slug: string;
};

export type TurkeyProvinceWithDistricts = {
  code: string;
  name: string;
  slug: string;
  districts: {
    name: string;
    slug: string;
  }[];
};
```

---

### 4.3 Data source dokümantasyonu zorunlu

Oluşturulacak dosya:

```txt
docs/turkey-location-data-source.md
```

Bu dosyada şunlar yazacak:

```txt
- Dataset hangi kaynağa göre oluşturuldu?
- Güncelleme tarihi nedir?
- Hangi iller ve ilçeler kontrol edildi?
- Resmi kaynakta farklı yazılan ilçe adları nasıl normalize edildi?
- Türkçe karakter / slug standardı nedir?
- Yeni ilçe eklenirse dataset nasıl güncellenecek?
```

---

### 4.4 Validation script zorunlu

Oluşturulacak script:

```txt
scripts/validate-turkey-location-data.ts
```

Bu script şunları kontrol etmeli:

```txt
- Tam olarak 81 il var mı?
- Province code unique mi?
- Province slug unique mi?
- Her ilin en az 1 ilçesi var mı?
- Her ilçe bağlı olduğu provinceCode ile geliyor mu?
- Aynı il içinde duplicate district slug var mı?
- Boş ilçe adı var mı?
- Bozuk karakter var mı?
- Kocaeli gibi regression illerindeki kritik ilçeler var mı?
- Büyükşehirler için expected district snapshot geçiyor mu?
```

Package script:

```json
{
  "scripts": {
    "check:turkey-locations": "tsx scripts/validate-turkey-location-data.ts"
  }
}
```

---

## 5. Tüm İller İçin Kontrol Yaklaşımı

### 5.1 81 ilin tamamı audit edilecek

Audit raporu şu formatta olmalı:

```txt
İl adı
- Mevcut ilçe sayısı
- Beklenen ilçe sayısı
- Eksik ilçeler
- Fazla/yanlış ilçeler
- Yazım/slug sorunları
- Durum: OK / FIXED / NEEDS REVIEW
```

Oluşturulacak dosya:

```txt
docs/turkey-district-data-audit.md
```

---

### 5.2 Kritik regression illeri

Tüm iller kontrol edilecek ama bazı iller için özel testler yazılacak:

```txt
Kocaeli
İstanbul
Ankara
İzmir
Bursa
Antalya
Konya
Adana
Mersin
Gaziantep
Şanlıurfa
Diyarbakır
Kayseri
Sakarya
Trabzon
Erzurum
Van
Muğla
Balıkesir
Tekirdağ
Hatay
Manisa
Aydın
Denizli
Samsun
```

Bu iller özel testlerde kullanılacak çünkü nüfus, kullanım ve marketplace açısından kritik olma ihtimalleri yüksek.

---

### 5.3 Kocaeli sadece örnek regression testi olacak

Kocaeli için zorunlu test listesi:

```txt
Başiskele
Çayırova
Darıca
Derince
Dilovası
Gebze
Gölcük
İzmit
Kandıra
Karamürsel
Kartepe
Körfez
```

Ama plan sadece Kocaeli ile sınırlı değildir.

---

## 6. Şifremi Unuttum / Password Reset

### 6.1 Gereksinimler

```txt
- Login sayfasında "Şifremi unuttum" butonu çalışmalı.
- Kullanıcı email girerek reset isteği oluşturmalı.
- Kullanıcı varsa reset email gönderilmeli.
- Kullanıcı yoksa da aynı generic response dönmeli.
- Account enumeration yapılmamalı.
- Reset token raw olarak database’e yazılmamalı.
- Token hashlenmeli.
- Token süresi kısa olmalı.
- Kullanıcı maildeki linkten yeni şifre belirlemeli.
- Token tek kullanımlık olmalı.
- Reset request rate limited olmalı.
```

### 6.2 Route Planı

Sayfalar:

```txt
/forgot-password
/reset-password/[token]
```

API:

```txt
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### 6.3 Prisma Model Önerisi

```prisma
model PasswordResetToken {
  id              String   @id @default(cuid())
  userId          String
  tokenHash       String   @unique
  expiresAt       DateTime
  usedAt          DateTime?
  requestedIpHash String?
  userAgentHash   String?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

### 6.4 Güvenlik Kuralları

```txt
- Reset token database’de hashlenmiş tutulur.
- Raw token sadece email linkinde bulunur.
- Token süresi öneri: 30 dakika.
- Token kullanıldıktan sonra usedAt set edilir.
- Aynı token tekrar kullanılamaz.
- Response her zaman generic olmalı:
  "Eğer bu email kayıtlıysa şifre sıfırlama bağlantısı gönderildi."
- Forgot/reset endpointleri rate limited olmalı.
```

---

## 7. UI Kalıntıları / Dark Theme Temizliği

### 7.1 Görülen UI Hataları

```txt
- Öne Çıkanlar kartları açık/beyaz kalmış.
- Kart içindeki metin çok soluk.
- Dark tema içinde light component kalıntısı var.
- Form/select/dropdownlar bazı yerlerde dark token kullanmıyor.
- Disabled button yazıları okunmuyor.
```

### 7.2 Taranacak Classlar

```bash
grep -R "bg-white" src
grep -R "text-white" src
grep -R "text-gray" src
grep -R "bg-slate-50" src
grep -R "bg-gray-50" src
grep -R "border-gray" src
grep -R "opacity-" src/components src/app
```

### 7.3 Düzeltilecek Alanlar

```txt
/
/login
/register
/forgot-password
/reset-password/[token]
/booking/[slug]
/discover
/marketplace
/dashboard
/dashboard/services
/dashboard/appointments
/staff
/admin
```

---

## 8. Son Kullanıcı Keşif ve Randevu Sayfası

### 8.1 Problem

Mevcut yapı daha çok işletme yönetimi odaklı. Son kullanıcı için ana keşif deneyimi eksik.

Son kullanıcı şunu yapabilmeli:

```txt
1. Hizmet arar.
2. Konum seçer.
3. Uygun işletmeleri görür.
4. İşletmeleri karşılaştırır.
5. Randevu alır.
6. Kendi randevularını takip eder.
```

### 8.2 Route Planı

```txt
/discover
/discover/search
/discover/business/[slug]
/discover/booking/[businessSlug]
/customer/appointments
/customer/profile
```

### 8.3 Filtreler

```txt
- Hizmet adı
- Kategori
- Ülke
- Şehir / İl
- İlçe / Locality
- Tarih
- Fiyat aralığı
- Puan
- Açık/uygun saat var
- En yakın
- En erken randevu
```

### 8.4 API Planı

```txt
GET /api/discover/search
GET /api/discover/businesses/[slug]
GET /api/discover/businesses/[slug]/availability
POST /api/discover/bookings

GET /api/customer/appointments
GET /api/customer/profile
PATCH /api/customer/profile
```

### 8.5 Güvenlik Kuralları

```txt
- Discover sadece public marketplace-enabled işletmeleri gösterir.
- Private organization data görünmez.
- Staff özel bilgileri public görünmez.
- Customer başka customer’ın randevusunu göremez.
- Guest booking destekleniyorsa minimum PII alınır.
- KVKK/consent akışı booking sırasında korunur.
```

---

# 9. Phase Planı

```txt
UCF-0 — Audit ve Bug Reproduction
UCF-1 — Tüm Türkiye İlçe Dataset Audit
UCF-2 — Canonical Türkiye Lokasyon Datası
UCF-3 — Province/District UI Data Binding
UCF-4 — Forgot Password Backend
UCF-5 — Forgot Password UI ve Email Provider
UCF-6 — UI Theme Remnant Cleanup
UCF-7 — Customer Discover MVP
UCF-8 — Customer Booking and Appointment Panel
UCF-9 — E2E Regression, Docs and Release
```

Her phase sonunda:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Varsa:

```bash
npm run i18n:check
npm run test:e2e
npm run phase:gate
npm run check:turkey-locations
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
/compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 10. Phase Detayları

---

## UCF-0 — Audit ve Bug Reproduction

Amaç:

Mevcut eksikleri belgelemek.

Yapılacaklar:

```txt
1. Türkiye il/ilçe data dosyalarını incele.
2. Sadece Kocaeli değil, tüm il datasının eksik olup olmadığını kontrol et.
3. Forgot password button/component/route var mı incele.
4. Eski UI kalıntılarını ara.
5. Marketplace/discover/customer route var mı incele.
6. docs/user-customer-fixes-audit.md oluştur.
```

Arama komutları:

```bash
grep -R "forgot" src
grep -R "reset-password" src
grep -R "PasswordReset" prisma src
grep -R "Kocaeli" src
grep -R "Dilovası" src
grep -R "Çayırova" src
grep -R "Karamürsel" src
grep -R "bg-white" src
grep -R "text-gray" src
grep -R "Öne Çıkanlar" src
grep -R "Featured" src
grep -R "discover" src
grep -R "customer" src/app src/components
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
git commit -m "docs: audit nationwide district password UI and discovery gaps"
git push
```

---

## UCF-1 — Tüm Türkiye İlçe Dataset Audit

Amaç:

Mevcut dataset ile beklenen güncel Türkiye il/ilçe datasını karşılaştırmak.

Yapılacaklar:

```txt
1. Mevcut TURKEY_PROVINCES ve TURKEY_DISTRICTS dosyalarını bul.
2. 81 ilin tamamını audit et.
3. Her il için mevcut ilçe listesini çıkar.
4. Beklenen güncel ilçe listesiyle karşılaştır.
5. Eksik ilçeleri raporla.
6. Yanlış yazım/slug sorunlarını raporla.
7. docs/turkey-district-data-audit.md oluştur.
8. Kocaeli dahil kritik iller için regression listesi oluştur.
```

Audit çıktısı formatı:

```txt
İl: Kocaeli
Durum: FIX_REQUIRED
Eksik: Dilovası, Çayırova, Karamürsel, ...
Fazla/Yanlış: ...
Not: ...
```

Komutlar:

```bash
npm run typecheck
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: audit all Turkey province district data"
git push
```

Compact:

```txt
UCF-0 ve UCF-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-2 — Canonical Türkiye Lokasyon Datası

Amaç:

Tüm iller ve ilçeler için eksiksiz canonical dataset oluşturmak.

Yapılacaklar:

```txt
1. src/data/turkey/turkey-location-data.ts oluştur veya güncelle.
2. 81 ilin tamamını ekle.
3. 81 ilin güncel tüm ilçelerini ekle.
4. Kocaeli tüm ilçelerini ekle.
5. Diğer illerde auditte bulunan tüm eksikleri tamamla.
6. validate-turkey-location-data scriptini ekle.
7. npm run check:turkey-locations scriptini ekle.
8. Unit testleri yaz.
9. docs/turkey-location-data-source.md oluştur.
```

Kocaeli regression listesi:

```txt
Başiskele
Çayırova
Darıca
Derince
Dilovası
Gebze
Gölcük
İzmit
Kandıra
Karamürsel
Kartepe
Körfez
```

Genel testler:

```txt
- 81 il var.
- Her ilde en az 1 ilçe var.
- Audit raporundaki tüm eksikler giderildi.
- Kocaeli 12 ilçeyi içeriyor.
- İstanbul/Ankara/İzmir/Bursa/Antalya/Konya/Adana gibi kritik iller snapshot testinden geçiyor.
- Duplicate district slug aynı il içinde yok.
```

Komutlar:

```bash
npm run check:turkey-locations
npm run typecheck
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "data: add canonical Turkey province and district dataset"
git push
```

---

## UCF-3 — Province/District UI Data Binding

Amaç:

UI’ın güncel ilçe datasını doğru kullanmasını sağlamak.

Yapılacaklar:

```txt
1. ProvinceSelect componentini canonical data ile bağla.
2. DistrictSelect componentini seçili province’e göre filtrele.
3. Province değişince district state temizlensin.
4. TR dışı ülkelerde province/district yerine locality input veya provider autocomplete göster.
5. Dark theme select okunabilirliği korunmalı.
6. Tests yaz.
```

Testler:

```txt
- Kocaeli seçilince Dilovası görünür.
- Kocaeli seçilince Çayırova görünür.
- Kocaeli seçilince Karamürsel görünür.
- Auditte eksik çıkan diğer illerdeki ilçeler görünür.
- İl değişince eski ilçe temizlenir.
- Germany/Netherlands seçilince Türkiye ilçeleri görünmez.
```

Komutlar:

```bash
npm run check:turkey-locations
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Commit:

```bash
git add .
git commit -m "fix: bind province and district selectors to canonical dataset"
git push
```

Compact:

```txt
UCF-2 ve UCF-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-4 — Forgot Password Backend

Amaç:

Şifre sıfırlama backend akışını kurmak.

Yapılacaklar:

```txt
1. PasswordResetToken modelini ekle.
2. Token generate/hash helper yaz.
3. POST /api/auth/forgot-password route ekle.
4. POST /api/auth/reset-password route ekle.
5. Token expiry ve usedAt kontrolü ekle.
6. Rate limit ekle.
7. Generic response kullan.
8. Tests yaz.
```

Testler:

```txt
- Existing user reset token oluşturur.
- Non-existing user generic response döner.
- Raw token database’de tutulmaz.
- Expired token reddedilir.
- Used token reddedilir.
- New password hashlenir.
```

Komutlar:

```bash
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add password reset backend flow"
git push
```

---

## UCF-5 — Forgot Password UI ve Email Provider

Amaç:

Kullanıcıya çalışan şifremi unuttum UI’ı sunmak.

Yapılacaklar:

```txt
1. Login sayfasındaki Şifremi unuttum linkini /forgot-password’a bağla.
2. /forgot-password sayfası oluştur.
3. /reset-password/[token] sayfası oluştur.
4. Email provider abstraction oluştur veya mevcut notification provider’a bağla.
5. Development için fake email log paneli veya preview ekle.
6. Production için env validation ekle.
7. UI metinlerini i18n dictionary’ye taşı.
8. Tests yaz.
```

Email provider:

```txt
- FakeEmailProvider for dev/test
- SMTP/Resend/Postmark adapter placeholder
```

Testler:

```txt
- Forgot password form email alır.
- Submit sonrası generic success mesajı görünür.
- Reset link valid token ile açılır.
- New password validation çalışır.
- Successful reset sonrası login yapılır.
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

Commit:

```bash
git add .
git commit -m "feat: add forgot password UI and email reset flow"
git push
```

Compact:

```txt
UCF-4 ve UCF-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-6 — UI Theme Remnant Cleanup

Amaç:

Eski tasarımdan kalan beyaz/okunmayan componentleri temizlemek.

Yapılacaklar:

```txt
1. Featured cards / Öne Çıkanlar componentini düzelt.
2. Light card kalıntılarını design token’a taşı.
3. Form labels ve optional text kontrastını düzelt.
4. Button disabled state okunabilirliğini düzelt.
5. Select dropdown dark theme uyumunu kontrol et.
6. Auth/booking/discover/dashboard sayfalarında ortak card/button/input kullan.
7. docs/ui-remnant-cleanup-report.md oluştur.
```

Testler:

```txt
- Öne Çıkanlar kartı okunur.
- Disabled Confirm button okunur ama disabled olduğu anlaşılır.
- Form label optional text okunur.
- Dark background üstünde beyaz kart kalmaz veya bilinçli variant olur.
- Public booking ve discover UI uyumludur.
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
git commit -m "style: remove legacy UI remnants and fix contrast"
git push
```

---

## UCF-7 — Customer Discover MVP

Amaç:

Son kullanıcı için hizmet/konum bazlı işletme keşif sayfası oluşturmak.

Yapılacaklar:

```txt
1. /discover route oluştur.
2. Search/filter UI ekle:
   - Hizmet
   - Kategori
   - Ülke
   - İl/şehir
   - İlçe/locality
   - Tarih
3. Public marketplace-enabled işletmeleri listele.
4. BusinessCard component oluştur.
5. Empty/loading/error state ekle.
6. /api/discover/search endpoint oluştur.
7. Tenant/private data sızıntısını engelle.
8. Tests yaz.
```

BusinessCard:

```txt
- İşletme adı
- Kategori
- Konum
- Başlangıç fiyatı
- En erken uygun randevu
- Puan veya "Henüz değerlendirme yok"
- Randevu al butonu
```

Testler:

```txt
- Discover sadece marketplaceEnabled işletmeleri gösterir.
- Hizmet araması çalışır.
- Tüm Türkiye il/ilçe datası filtrelerde çalışır.
- Kocaeli + Dilovası filtreleri çalışır.
- Non-TR country locality input kullanır.
- Private data görünmez.
```

Komutlar:

```bash
npm run check:turkey-locations
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Commit:

```bash
git add .
git commit -m "feat: add customer discovery marketplace MVP"
git push
```

Compact:

```txt
UCF-6 ve UCF-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-8 — Customer Booking and Appointment Panel

Amaç:

Kullanıcının keşif sonrası randevu alması ve randevularını takip etmesi.

Yapılacaklar:

```txt
1. /discover/business/[slug] sayfasını oluştur.
2. /discover/booking/[businessSlug] sayfasını mevcut booking flow’a bağla.
3. /customer/appointments sayfası oluştur.
4. GET /api/customer/appointments endpoint ekle.
5. Guest booking ve logged-in customer booking ayrımını netleştir.
6. Customer sadece kendi randevularını görsün.
7. Tests yaz.
```

Testler:

```txt
- Kullanıcı discover’dan işletme detayına gider.
- Kullanıcı randevu akışına geçer.
- Login olmuş customer kendi randevularını görür.
- Customer başka customer randevusunu göremez.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Commit:

```bash
git add .
git commit -m "feat: add customer booking and appointment panel"
git push
```

---

## UCF-9 — E2E Regression, Docs and Release

Amaç:

Tüm düzeltmeleri final testten geçirip release etmek.

Yapılacaklar:

```txt
1. E2E test: 81 il dataset validation geçer.
2. E2E test: Kocaeli -> Dilovası görünür.
3. E2E test: Auditte eksik çıkan diğer il/ilçeler görünür.
4. E2E test: Forgot password flow çalışır.
5. E2E test: Reset password valid token ile çalışır.
6. E2E test: UI contrast smoke testi.
7. E2E test: Discover search çalışır.
8. README güncelle.
9. CHANGELOG güncelle.
10. Final release tag oluştur.
```

Final komutlar:

```bash
npm run phase:gate
npm run check:turkey-locations
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
git commit -m "chore: finalize nationwide district password UI and discovery release"
git push
git tag v1.6.5-customer-discovery-fixes
git push origin v1.6.5-customer-discovery-fixes
```

---

# 11. Codex Ana Prompt

```txt
Read RANDEVO_ALL_TURKEY_DISTRICTS_PASSWORD_UI_CUSTOMER_DISCOVERY_PLAN.md completely.

We need to fix and add the following:
1. Turkey district data is incomplete across multiple provinces, not only Kocaeli.
2. Kocaeli is only one visible example; all 81 provinces must be audited and completed.
3. Forgot password button does not work.
4. Old UI remnants remain; some cards/text are white or unreadable in dark theme.
5. We need a customer-facing discovery page where users choose service + location, compare businesses, and book appointments.

Do not implement everything randomly.
Follow UCF-0 through UCF-9 in order.

Start with UCF-0 only:
- Audit all Turkey province/district data, not just Kocaeli.
- Audit forgot password routes/UI/backend.
- Audit old UI remnants and low contrast cards.
- Audit existing marketplace/discover/customer routes.
- Create docs/user-customer-fixes-audit.md.
- Do not change product behavior yet.
- Run tests/build.
- Commit and push only if checks pass.
- Stop after UCF-0 and summarize.
```

---

# 12. Full Auto Prompt

```txt
Read RANDEVO_ALL_TURKEY_DISTRICTS_PASSWORD_UI_CUSTOMER_DISCOVERY_PLAN.md completely.

Implement all phases from UCF-0 to UCF-9 in order.

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
- Do not only fix Kocaeli.
- Audit and complete Turkey district data for all 81 provinces.
- Complete Turkey district data, including but not limited to Kocaeli: Dilovası, Çayırova, Karamürsel, Başiskele, Darıca and all other Kocaeli districts.
- Add validation script for 81 provinces and all district lists.
- Do not show Turkey province/district selectors for non-TR countries.
- Forgot password must use secure email reset token flow.
- Reset token must be hashed, expiring and single-use.
- Do not allow account enumeration.
- Add rate limits for forgot/reset flows.
- Remove old white/unreadable UI remnants.
- All public/auth/customer pages must use the shared design system.
- Customer discovery must show only public marketplace-enabled businesses.
- Customer must not see private tenant data.
- Customer appointment panel must be scoped to the logged-in customer.
- Do not commit secrets.
- Do not force push.
```

---

# 13. Final Definition of Done

```txt
- Turkey district data is audited for all 81 provinces.
- Turkey district data is updated for all 81 provinces.
- Validation script exists and passes.
- Kocaeli includes Dilovası, Çayırova, Karamürsel and all other districts.
- Other provinces are checked for missing districts.
- Province -> district filtering works.
- Non-TR countries do not show Turkey province/district dropdowns.
- Forgot password button works.
- /forgot-password page exists.
- /reset-password/[token] page exists.
- Password reset token is hashed.
- Password reset token expires.
- Password reset token is single-use.
- Forgot/reset flow is rate limited.
- Email reset provider/fake provider works.
- Old white/unreadable UI remnants are removed.
- Featured cards are readable in dark theme.
- User-facing /discover page exists.
- Users can search by service and location.
- Users can compare public businesses.
- Users can continue to booking flow.
- Customer appointment panel exists or is documented as MVP scope.
- Private tenant data is not exposed.
- E2E regression tests exist.
- Build passes.
- Tests pass.
- GitHub push and tag completed.
```

---

# 14. Final Review Prompt

```txt
Review the nationwide district data, forgot password, UI cleanup and customer discovery implementation.

Check:
1. Did you audit all 81 provinces, not only Kocaeli?
2. Does the validation script check all 81 provinces?
3. Does every province have districts?
4. Does Kocaeli include Dilovası?
5. Does Kocaeli include Çayırova?
6. Does Kocaeli include Karamürsel?
7. Are all Kocaeli districts present?
8. Are other provinces checked for missing districts?
9. Does province -> district filtering work?
10. Are Turkey districts hidden for non-TR countries?
11. Does the forgot password button work?
12. Does /forgot-password exist?
13. Does /reset-password/[token] exist?
14. Are reset tokens hashed?
15. Are reset tokens expiring and single-use?
16. Does the forgot/reset response avoid account enumeration?
17. Are forgot/reset routes rate limited?
18. Are old white/unreadable UI remnants removed?
19. Are featured cards readable in dark theme?
20. Does /discover exist?
21. Can users search by service + location?
22. Are only public marketplace-enabled businesses shown?
23. Can users continue to booking?
24. Is customer appointment data scoped safely?
25. Do E2E tests pass?
26. Does build pass?
27. Has everything been committed and pushed?

Fix only small issues.
Do not add unrelated features.
Create final release notes.
```
