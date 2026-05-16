# Randevo — İlçe Datası, Şifremi Unuttum, UI Kalıntıları ve Kullanıcı Keşif Sayfası Planı

> Amaç: Randevo projesinde görülen dört önemli eksiği planlı şekilde düzeltmek:
>
> 1. Türkiye il/ilçe datasındaki eksikleri güncel veriyle tamamlamak  
> 2. `Şifremi unuttum` akışını gerçek ve güvenli hale getirmek  
> 3. Eski tasarımdan kalan beyaz/okunmayan UI kalıntılarını temizlemek  
> 4. İşletme panelinden ayrı olarak son kullanıcıların hizmet/konum bazlı işletme keşfedip randevu alabileceği bir kullanıcı sayfası oluşturmak  
>
> Bu dosya **Codex** ve **Claude Code** için phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Görülen Sorunlar

Ekran görüntülerinden ve mevcut davranıştan görülen problemler:

```txt
1. Türkiye ilçe datası eksik.
   Örnek: Kocaeli ilçelerinde Dilovası, Çayırova, Karamürsel gibi ilçeler görünmüyor.

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

## 2. Ana Hedef

Bu güncellemeden sonra:

```txt
- Türkiye 81 il ve güncel ilçeler eksiksiz kullanılacak.
- Kocaeli gibi illerde eksik ilçeler tamamlanacak.
- İl seçilince ilçe listesi doğru filtrelenecek.
- TR dışı ülkelerde Türkiye il/ilçe dropdownları görünmeyecek.
- Şifremi unuttum akışı gerçek email/token sistemiyle çalışacak.
- Reset token güvenli şekilde hashlenmiş ve süreli olacak.
- Eski beyaz UI kalıntıları temizlenecek.
- Tüm public/auth/customer ekranları aynı tasarım sistemiyle uyumlu olacak.
- Kullanıcılar işletme sahibi olmadan da hizmet/konum bazlı işletme keşfedip randevu alabilecek.
```

---

## 3. Kaynak ve Veri Stratejisi

Türkiye il/ilçe datası manuel ve parça parça tutulursa sürekli eksik kalır. Bu yüzden data yönetimi şu şekilde yapılmalı:

```txt
1. Projede tek bir canonical Türkiye lokasyon datası olmalı.
2. Bu data 81 il + güncel ilçeler şeklinde tutulmalı.
3. Kaynak dokümanı docs/turkey-location-data-source.md içinde açıkça belirtilmeli.
4. Data elle güncellense bile validate script ve testlerle korunmalı.
5. Kocaeli gibi eksik tespit edilen iller özel regression testlerine eklenmeli.
```

Önerilen resmi/otoriter doğrulama kaynakları:

```txt
- İçişleri Bakanlığı il/ilçe ve mülki idare değişiklikleri
- Harita Genel Müdürlüğü mülki idare bölümleri haritaları
- TÜİK/ADNKS veya belediye kaynakları, doğrulama amaçlı
```

Not:

```txt
Eğer resmi kaynak machine-readable değilse, proje içinde verified static dataset kullanılabilir.
Ama dataset kaynağı ve güncelleme tarihi dokümante edilmelidir.
```

---

## 4. Önemli Ürün Kararları

### 4.1 İlçe datası sadece Kocaeli için düzeltilmemeli

Sadece Kocaeli’ndeki eksikleri eklemek kısa vadede çözüm gibi görünür. Fakat başka illerde eksik varsa aynı hata tekrar çıkar.

Doğru yaklaşım:

```txt
- Tüm Türkiye dataset’i gözden geçir.
- Kocaeli özel regression testi ekle.
- Diğer büyükşehirler için de kontrol testleri ekle.
```

---

### 4.2 Şifremi unuttum için mail tabanlı reset zorunlu olmalı

Butona basınca sadece yeni sekme açmak yeterli değildir.

Doğru akış:

```txt
1. Kullanıcı email adresini girer.
2. Sistem generic response döner.
3. Kayıtlı kullanıcı varsa email ile reset linki gönderilir.
4. Reset token hashlenmiş şekilde saklanır.
5. Token kısa süreli ve tek kullanımlık olur.
6. Kullanıcı yeni şifre belirler.
```

---

### 4.3 Son kullanıcı keşif sayfası ayrı bir deneyim olmalı

İşletme paneli ve son kullanıcı deneyimi ayrılmalı.

```txt
İşletme sahibi/staff:
- Dashboard
- Hizmet yönetimi
- Randevu yönetimi
- Abonelik
- Staff yönetimi

Son kullanıcı:
- Hizmet arar
- Konum seçer
- İşletme karşılaştırır
- Randevu alır
- Kendi randevularını görür
```

---

# 5. Modül 1 — Türkiye İlçe Datası Güncellemesi

## 5.1 Gereksinimler

```txt
- Türkiye 81 il desteklenmeli.
- Her ilde ilçe listesi olmalı.
- Kocaeli ilçeleri eksiksiz olmalı.
- İl seçilince sadece o ilin ilçeleri görünmeli.
- İlçe verisi duplicate/bozuk slug içermemeli.
- TR dışındaki ülkelerde Türkiye il/ilçe seçimi görünmemeli.
```

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

## 5.2 Önerilen Dosya Yapısı

```txt
src/data/turkey/provinces.ts
src/data/turkey/districts.ts
src/data/turkey/turkey-location-data.ts
src/lib/address/turkey-location.ts
src/lib/address/normalize-turkish-slug.ts
scripts/validate-turkey-location-data.ts
docs/turkey-location-data-source.md
docs/turkey-district-data-audit.md
```

## 5.3 Data Model

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

export const TURKEY_PROVINCES: TurkeyProvince[] = [];

export const TURKEY_DISTRICTS: TurkeyDistrict[] = [];
```

## 5.4 Helper Fonksiyonlar

```ts
export function getTurkeyDistrictsByProvinceCode(provinceCode: string): TurkeyDistrict[] {}

export function getTurkeyDistrictsByProvinceName(provinceName: string): TurkeyDistrict[] {}

export function hasTurkeyDistrict(provinceName: string, districtName: string): boolean {}

export function validateTurkeyLocationData(): ValidationResult {}
```

## 5.5 Testler

```txt
- Türkiye il sayısı 81.
- Her ilde en az 1 ilçe var.
- Kocaeli içinde Dilovası var.
- Kocaeli içinde Çayırova var.
- Kocaeli içinde Karamürsel var.
- Kocaeli içinde Başiskele var.
- Kocaeli içinde Darıca var.
- İstanbul, Ankara, İzmir, Bursa, Antalya ilçeleri eksiksiz kontrol ediliyor.
- Duplicate province code yok.
- Duplicate district slug aynı il içinde yok.
- İlçe dropdown province değişince temizleniyor.
```

---

# 6. Modül 2 — Şifremi Unuttum / Password Reset

## 6.1 Gereksinimler

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

## 6.2 Route Planı

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

## 6.3 Prisma Model Önerisi

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

## 6.4 Email İçeriği

```txt
Konu:
Randevo şifre sıfırlama isteği

İçerik:
Merhaba,
Randevo hesabınız için şifre sıfırlama isteği aldık.
Yeni şifre belirlemek için aşağıdaki bağlantıyı kullanın.
Bu bağlantı kısa süre içinde geçersiz olacaktır.
Eğer bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.
```

## 6.5 Güvenlik Kuralları

```txt
- Reset token database’de hashlenmiş tutulur.
- Raw token sadece email linkinde bulunur.
- Token süresi öneri: 30 dakika.
- Token kullanıldıktan sonra usedAt set edilir.
- Aynı token tekrar kullanılamaz.
- Email gönderimi fake provider ile test edilebilir.
- Production’da email provider yoksa fail-fast veya admin warning olmalı.
- Response her zaman generic olmalı:
  "Eğer bu email kayıtlıysa şifre sıfırlama bağlantısı gönderildi."
```

## 6.6 Testler

```txt
- Kayıtlı email reset request oluşturur.
- Kayıtlı olmayan email aynı generic response döner.
- Token hashlenir.
- Raw token database’de görünmez.
- Expired token reddedilir.
- Used token tekrar kullanılamaz.
- Weak password reddedilir.
- Successful reset sonrası eski şifre çalışmaz.
- Yeni şifre ile login olunur.
- Rate limit çalışır.
```

---

# 7. Modül 3 — Eski UI Kalıntıları / Dark Theme Temizliği

## 7.1 Görülen Hatalar

Ekran görüntüsündeki örnekler:

```txt
- Öne Çıkanlar kartları açık/beyaz kalmış.
- Kart içindeki metin beyaz veya çok soluk olduğu için okunmuyor.
- Dark tema içinde light component kalıntısı var.
- Form/select/dropdownlar bazı yerlerde dark token kullanmıyor.
```

## 7.2 Hedef

```txt
- Public landing, auth, discover, booking, dashboard aynı tasarım sistemini kullanmalı.
- Açık kalan eski card/table/select komponentleri güncellenmeli.
- White-on-white veya low contrast text kalmamalı.
- Dark/light tokenlar merkezi olmalı.
```

## 7.3 Taranacak Classlar

```bash
grep -R "bg-white" src
grep -R "text-white" src
grep -R "text-gray" src
grep -R "bg-slate-50" src
grep -R "bg-gray-50" src
grep -R "border-gray" src
grep -R "opacity-" src/components src/app
```

## 7.4 Düzeltilecek Alanlar

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

## 7.5 Testler

```txt
- Featured cards dark theme’de okunur.
- Form input/select text okunur.
- Booking confirmation form okunur.
- Customer discover page okunur.
- Login/register/forgot-password aynı tema sistemini kullanır.
- Contrast QA raporu oluşturulur.
```

---

# 8. Modül 4 — Son Kullanıcı Keşif ve Randevu Sayfası

## 8.1 Problem

Mevcut yapı daha çok işletmelerin yönetim paneli gibi çalışıyor.

Eksik olan son kullanıcı deneyimi:

```txt
Kullanıcı sisteme girer.
İstediği hizmeti seçer.
Konum seçer.
Yakındaki veya uygun işletmeleri görür.
İşletmeleri değerlendirir.
Randevu alır.
```

## 8.2 İlk MVP Route Planı

```txt
/discover
/discover/search
/discover/business/[slug]
/discover/booking/[businessSlug]
/customer/appointments
/customer/profile
```

Alternatif:

```txt
/app
/app/search
/app/business/[slug]
```

Öneri:

```txt
MVP için /discover kullan.
Müşteri hesabı işlemleri için /customer kullan.
```

## 8.3 Kullanıcı Akışı

```txt
1. Kullanıcı /discover sayfasına girer.
2. Hizmet kategorisi veya hizmet adı arar.
3. Ülke/şehir/ilçe/locality seçer.
4. Sistem uygun işletmeleri listeler.
5. Kullanıcı işletme kartlarını karşılaştırır.
6. İşletme detayına girer.
7. Hizmet/personel/tarih/saat seçer.
8. Randevu oluşturur.
9. İsterse hesabına giriş yapıp randevularını takip eder.
```

## 8.4 Filtreler

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

## 8.5 Business Card Alanları

```txt
- İşletme adı
- Kategori
- Şehir/ilçe
- Ortalama puan
- Başlangıç fiyatı
- En erken uygun randevu
- Popüler hizmet
- Randevu al CTA
```

## 8.6 Review / Rating Sistemi

İlk MVP için:

```txt
- Yorum göstermek opsiyonel.
- Fake rating gösterilmemeli.
- Rating yoksa "Henüz değerlendirme yok" yazmalı.
```

Sonraki aşama:

```txt
Review
- id
- appointmentId
- customerId
- organizationId
- rating
- comment
- status: PENDING | PUBLISHED | HIDDEN
- createdAt
```

Kural:

```txt
Sadece tamamlanmış randevudan sonra yorum yapılabilir.
```

## 8.7 Customer Appointment Panel

```txt
/customer/appointments
```

Gösterecekleri:

```txt
- Yaklaşan randevular
- Geçmiş randevular
- Randevu durumu
- İşletme adı
- Hizmet
- Tarih/saat
- İptal et, kurallara göre
```

## 8.8 API Planı

```txt
GET /api/discover/search
GET /api/discover/businesses/[slug]
GET /api/discover/businesses/[slug]/availability
POST /api/discover/bookings

GET /api/customer/appointments
GET /api/customer/profile
PATCH /api/customer/profile
```

## 8.9 Güvenlik / Privacy Kuralları

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
UCF-1 — Türkiye İlçe Data Güncellemesi
UCF-2 — Province/District UI Data Binding
UCF-3 — Forgot Password Backend
UCF-4 — Forgot Password UI ve Email Provider
UCF-5 — UI Theme Remnant Cleanup
UCF-6 — Customer Discover MVP
UCF-7 — Customer Booking and Appointment Panel
UCF-8 — E2E Regression, Docs and Release
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
2. Kocaeli ilçelerinin eksik olduğunu testle yakala.
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

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: audit district password UI and customer discovery gaps"
git push
```

---

## UCF-1 — Türkiye İlçe Data Güncellemesi

Amaç:

Türkiye ilçe datasını güncel ve eksiksiz hale getirmek.

Yapılacaklar:

```txt
1. src/data/turkey/provinces.ts düzenle.
2. src/data/turkey/districts.ts oluştur veya güncelle.
3. Kocaeli eksiklerini ekle:
   - Başiskele
   - Çayırova
   - Darıca
   - Derince
   - Dilovası
   - Gebze
   - Gölcük
   - İzmit
   - Kandıra
   - Karamürsel
   - Kartepe
   - Körfez
4. Diğer iller için güncel ilçe datasını tamamla.
5. validate-turkey-location-data scriptini ekle.
6. Unit testleri yaz.
7. docs/turkey-district-data-audit.md oluştur.
```

Testler:

```txt
- 81 il var.
- Kocaeli 12 ilçeyi içeriyor.
- Dilovası, Çayırova, Karamürsel var.
- İstanbul/Ankara/İzmir/Bursa/Antalya büyükşehir testleri var.
- Her ilin district listesi boş değil.
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
git commit -m "data: update Turkey province and district dataset"
git push
```

Compact:

```txt
UCF-0 ve UCF-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-2 — Province/District UI Data Binding

Amaç:

UI’ın güncel ilçe datasını doğru kullanmasını sağlamak.

Yapılacaklar:

```txt
1. ProvinceSelect componentini güncel data ile bağla.
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
- İl değişince eski ilçe temizlenir.
- Germany/Netherlands seçilince Türkiye ilçeleri görünmez.
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
git commit -m "fix: bind province and district selects to updated data"
git push
```

---

## UCF-3 — Forgot Password Backend

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

Compact:

```txt
UCF-2 ve UCF-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-4 — Forgot Password UI ve Email Provider

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

---

## UCF-5 — UI Theme Remnant Cleanup

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

Compact:

```txt
UCF-4 ve UCF-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-6 — Customer Discover MVP

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
- Kocaeli + Dilovası filtreleri çalışır.
- Non-TR country locality input kullanır.
- Private data görünmez.
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
git commit -m "feat: add customer discovery marketplace MVP"
git push
```

---

## UCF-7 — Customer Booking and Appointment Panel

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

Compact:

```txt
UCF-6 ve UCF-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## UCF-8 — E2E Regression, Docs and Release

Amaç:

Tüm düzeltmeleri final testten geçirip release etmek.

Yapılacaklar:

```txt
1. E2E test: Kocaeli -> Dilovası görünür.
2. E2E test: Forgot password flow çalışır.
3. E2E test: Reset password valid token ile çalışır.
4. E2E test: UI contrast smoke testi.
5. E2E test: Discover search çalışır.
6. README güncelle.
7. CHANGELOG güncelle.
8. Final release tag oluştur.
```

Final komutlar:

```bash
npm run phase:gate
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
git commit -m "chore: finalize district password UI and customer discovery release"
git push
git tag v1.6.5-customer-discovery-fixes
git push origin v1.6.5-customer-discovery-fixes
```

---

# 11. Codex Ana Prompt

```txt
Read RANDEVO_DISTRICT_PASSWORD_UI_CUSTOMER_DISCOVERY_PLAN.md completely.

We need to fix and add the following:
1. Turkey district data is incomplete. Kocaeli is missing Dilovası, Çayırova, Karamürsel and other districts.
2. Forgot password button does not work.
3. Old UI remnants remain; some cards/text are white or unreadable in dark theme.
4. We need a customer-facing discovery page where users choose service + location, compare businesses, and book appointments.

Do not implement everything randomly.
Follow UCF-0 through UCF-8 in order.

Start with UCF-0 only:
- Audit Turkey province/district data.
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
Read RANDEVO_DISTRICT_PASSWORD_UI_CUSTOMER_DISCOVERY_PLAN.md completely.

Implement all phases from UCF-0 to UCF-8 in order.

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
- Complete Turkey district data, especially Kocaeli: Dilovası, Çayırova, Karamürsel, Başiskele, Darıca and all other Kocaeli districts.
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
- Turkey district data is updated.
- Kocaeli includes Dilovası, Çayırova, Karamürsel and all other districts.
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
Review the district data, forgot password, UI cleanup and customer discovery implementation.

Check:
1. Does Kocaeli include Dilovası?
2. Does Kocaeli include Çayırova?
3. Does Kocaeli include Karamürsel?
4. Are all Kocaeli districts present?
5. Are other provinces checked for missing districts?
6. Does province -> district filtering work?
7. Are Turkey districts hidden for non-TR countries?
8. Does the forgot password button work?
9. Does /forgot-password exist?
10. Does /reset-password/[token] exist?
11. Are reset tokens hashed?
12. Are reset tokens expiring and single-use?
13. Does the forgot/reset response avoid account enumeration?
14. Are forgot/reset routes rate limited?
15. Are old white/unreadable UI remnants removed?
16. Are featured cards readable in dark theme?
17. Does /discover exist?
18. Can users search by service + location?
19. Are only public marketplace-enabled businesses shown?
20. Can users continue to booking?
21. Is customer appointment data scoped safely?
22. Do E2E tests pass?
23. Does build pass?
24. Has everything been committed and pushed?

Fix only small issues.
Do not add unrelated features.
Create final release notes.
```
