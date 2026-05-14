# Randevo

**Türkiye'nin akıllı randevu platformu — yerel işletmeler için çok kiracılı (multi-tenant) SaaS.**

Berberler, kuaförler, güzellik salonları, koçlar ve diğer hizmet işletmeleri için 5 dakikada kurulum.

---

## Özellikler

- **Çok kiracılı mimari** — her işletme tamamen izole veriyle çalışır
- **Herkese açık rezervasyon sayfası** — `/booking/[slug]` adresinde müşteri self-booking
- **Akıllı slot üretimi** — personel müsaitliği, hizmet süresi ve mevcut randevulara göre
- **Çift rezervasyon önleme** — yarış koşuluna (race condition) karşı güvenli çakışma kontrolü
- **Otomatik hatırlatmalar** — e-posta, SMS, WhatsApp (yerel geliştirmede FAKE modu)
- **Randevu paneli** — durum güncelleme, filtreleme ve yönetim
- **Analitik panel** — ciro, randevu sayıları, en çok tercih edilen hizmet, en yoğun personel
- **Personel yönetimi** — hizmet atamalı çoklu personel desteği
- **Müsaitlik yönetimi** — personel başına haftalık program
- **Abonelik ve faturalama** — Ücretsiz / Başlangıç / Pro planları (Stripe test modu)
- **Plan limiti zorlama** — backend tarafında uygulanır, istemci tarafında değil
- **Denetim günlüğü (Audit log)** — tüm önemli işlemlerin değiştirilemez kaydı
- **Kimlik doğrulama** — credentials tabanlı giriş, JWT oturumları, korumalı rotalar
- **SMS hatırlatmaları** — Twilio entegrasyonu (varsayılan: FAKE)
- **WhatsApp hatırlatmaları** — Meta Cloud API (varsayılan: FAKE)
- **WhatsApp otomatik rezervasyon linki yanıtı** — gelen mesaj → otomatik booking URL yanıtı (cooldown, opt-out, anahtar kelime filtresi)
- **Google Takvim senkronizasyonu** — OAuth 2.0 ile çift yönlü (varsayılan: FAKE)
- **Herkese açık market** — kategori/şehir filtrelemeli işletme dizini
- **AI rezervasyon asistanı** — Claude (Anthropic API) ile işletme başına chatbot
- **Gelir muhasebesi** — ledger takibi ve CSV dışa aktarma
- **Çoklu şube desteği** — organizasyon başına birden fazla konum
- **Personel portalı** — personele özel giriş ve randevu görünümü
- **Depozito ödemeleri** — hizmet depozitolarında Stripe checkout
- **Süper yönetici paneli** — platform düzeyinde kullanıcı ve organizasyon yönetimi
- **KVKK uyumlu altyapı** — Türkiye'ye özel veri işleme yapısı

---

## Dil Deste?i (I18N)

Web ve mobil uygulama art?k 10 locale destekler:

- `tr` (Turkce)
- `en` (English)
- `de` (Deutsch)
- `ar` (???????, RTL)
- `es` (Espa?ol)
- `fr` (Fran?ais)
- `it` (Italiano)
- `fa` (?????, RTL)
- `ru` (???????)
- `nl` (Nederlands)

Dil se?ici mevcut route'u koruyarak locale de?i?tirir ve se?im cookie/AsyncStorage ile kal?c?d?r.

---

## Fiyatlandırma

| Plan | Fiyat | Personel | Aylık Randevu | E-posta Hatırlatma |
|------|-------|----------|---------------|--------------------|
| Ücretsiz | ₺0 | 1 | 20 | Hayır |
| Başlangıç | ₺40/ay | 3 | 300 | Evet |
| Pro | ₺249/ay | Sınırsız | Sınırsız | Evet |

Hedef kitle: berberler, güzellik salonları, özel ders veren öğretmenler, koçlar, fitness eğitmenleri ve küçük hizmet işletmeleri.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript |
| Veritabanı | SQLite (geliştirme) / PostgreSQL (üretim) |
| ORM | Prisma 6 |
| Kimlik Doğrulama | NextAuth v5 (Auth.js) |
| Stil | Tailwind CSS v4 + Inline Styles |
| Fontlar | Outfit (başlık) + Nunito (gövde) |
| Doğrulama | Zod |
| Faturalama | Stripe (test modu) |
| E-posta | Resend / fake log modu |
| Test | Vitest |

---

## Mimari

```
src/
├── app/
│   ├── api/              # API route handler'ları (Next.js)
│   ├── (auth)/           # Giriş, kayıt, onboarding
│   ├── dashboard/        # Korumalı işletme paneli
│   └── booking/[slug]/   # Herkese açık rezervasyon sayfası
├── lib/
│   ├── auth.ts           # NextAuth yapılandırması
│   ├── db.ts             # Prisma singleton
│   ├── tenant.ts         # Tenant izolasyon yardımcıları
│   ├── billing.ts        # Plan limiti zorlama
│   ├── stripe.ts         # Stripe istemcisi
│   └── email.ts          # E-posta soyutlaması (fake/Resend)
├── services/             # İş mantığı katmanı
│   ├── booking.service.ts
│   ├── availability.service.ts
│   ├── reminder.service.ts
│   ├── analytics.service.ts
│   └── audit.service.ts
└── tests/                # Vitest birim testleri
```

**Tenant izolasyonu:** `organizationId` her zaman kimlik doğrulanmış oturumdan çözümlenir, istemci girdisine güvenilmez. Her tenant kapsamlı sorgu `{ where: { organizationId } }` içerir.

---

## Veritabanı Şeması

19 Prisma modeli:

- **User** — platform hesapları
- **Organization** — benzersiz slug'a sahip işletme kiracıları
- **OrganizationMember** — kullanıcı-organizasyon ilişkisi (OWNER, ADMIN, STAFF rolleri)
- **Service** — süre ve fiyat bilgisiyle rezerve edilebilir hizmetler
- **Staff** — atanmış hizmetlere sahip çalışanlar
- **StaffInvite** — personel onboarding için davet token'ları
- **StaffService** — çoka-çok hizmet atamaları
- **AvailabilityRule** — personel başına haftalık program
- **Customer** — rezervasyon müşterileri (e-posta ile upsert)
- **Appointment** — durum takibiyle rezervasyonlar
- **Location** — organizasyon başına fiziksel konumlar
- **Reminder** — zamanlanmış e-posta/SMS/WhatsApp bildirimleri
- **Subscription** — plan ve faturalama bilgisi
- **AuditLog** — değiştirilemez işlem geçmişi
- **Payment** — Stripe ödeme kayıtları (idempotent)
- **CalendarConnection** — Google Takvim OAuth token'ları
- **RevenueLedger** — ödemeler için muhasebe girdileri

---

## Kurulum

### Gereksinimler

- Node.js 20+
- Git

### 1. Klonla ve yükle

```bash
git clone https://github.com/Caner-sal/Randevo.git
cd Randevo
npm install
```

### 2. Ortam değişkenlerini ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle — SQLite için varsayılan değerler yerel geliştirmede olduğu gibi çalışır.

### 3. Prisma istemcisini oluştur ve seed yükle

```bash
npm run db:generate    # Prisma istemcisini oluştur
npm run db:push        # Veritabanı şemasını uygula
npm run db:seed        # Demo verilerini yükle
```

### 4. Geliştirme sunucusunu başlat

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç.

---

## Ortam Değişkenleri

Tüm değişkenler için [.env.example](.env.example) dosyasına bak. Temel olanlar:

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | SQLite (varsayılan: `file:./dev.db`) veya PostgreSQL URL |
| `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32` ile oluştur) |
| `STRIPE_SECRET_KEY` | Stripe test anahtarı (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe yayınlanabilir anahtar |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook imza secret'ı |
| `RESEND_API_KEY` | Fake e-posta modu için boş bırak |
| `SMS_PROVIDER` | `FAKE` (varsayılan) veya `TWILIO` |
| `WHATSAPP_PROVIDER` | `FAKE` (varsayılan) veya `META` |
| `CALENDAR_PROVIDER` | `FAKE` (varsayılan) veya `GOOGLE` |
| `AI_PROVIDER` | `DISABLED` (varsayılan) veya `ANTHROPIC` |
| `ANTHROPIC_API_KEY` | `AI_PROVIDER=ANTHROPIC` olduğunda gerekli |

---

## Demo Hesabı

Seed sonrası:

```
E-posta:  demo@randevo.app
Şifre:    demo1234
```

Herkese açık rezervasyon URL'i: `http://localhost:3000/booking/barber-demo`

---

## Testler

```bash
npm test              # Tüm testleri çalıştır
npm run test:watch    # İzleme modu
```

Test kapsamı (95 test, 14 suite):
- Rezervasyon motoru (slot üretimi, çakışma önleme)
- Tenant izolasyonu (organizasyonlar arası erişim engelleme)
- Plan limiti zorlama (FREE/STARTER/PRO)
- Hatırlatma zamanlama ve işleme
- SMS/WhatsApp sağlayıcı (fake + opt-in koruması)
- Google Takvim senkronizasyonu (fake sağlayıcı + hata izolasyonu)
- Market filtreleme
- Depozito ödemeleri (Stripe idempotency)
- Çoklu şube desteği
- Personel portalı erişimi
- Süper yönetici işlemleri
- AI chatbot (devre dışı modu, eksik mesaj, devre dışı org)
- Muhasebe / gelir ledger (idempotency koruması)

---

## Yazar

[Caner Sal](https://github.com/Caner-sal) tarafından full-stack SaaS portföy projesi olarak geliştirildi.

---

## Lisans

MIT

---

## Global Address & Marketplace Localization

Randevo marketplace global localization akışı ülke bazlı filtre davranışı ile çalışır.

### Marketplace Query Contract

`GET /api/marketplace` aşağıdaki parametreleri destekler:

- `country` (primary)
- `countryCode` (backward-compatible alias)
- `province` (TR-only)
- `locality` (non-TR)
- `city`
- `category`
- `q`

Davranış kuralları:

- `country=TR` ise `province` filtresi uygulanır.
- `country!=TR` ise `province` yok sayılır.
- `country!=TR` için `locality` araması `normalizedAddress` + organization geo alanları üzerinden çalışır.
- `countryCode` query parametresi mevcut client compatibility için korunur.

### TR vs Non-TR Location Flow

- TR seçiliyse marketplace location filtresi Türkiye il dropdown'u gösterir (`TURKEY_PROVINCES`).
- Non-TR seçiliyse city/locality autocomplete + manual input akışı açılır.
- Ülke değişiminde eski `province/locality` state temizlenir.

### Address Provider + Manual Fallback

Address provider abstraction autocomplete/retrieve akışında runtime fallback içerir:

- Primary provider hata verirse fallback provider çalışır.
- Provider env eksikse manuel provider devreye girer.
- Marketplace non-TR locality filtresi provider kapalıyken de kullanılabilir kalır.

### Legacy Route Redirect

Legacy province slug uyumluluğu korunur:

- `/marketplace/[slug]` artık business detail route olarak kullanılır.
- Province slug geldiğinde canonical route'a redirect uygulanır:
  - `/marketplace/location/tr/[provinceSlug]`

### Geo Migration / Backfill Summary

Global address kalıcılığı için model alanları eklendi:

- `Organization`: `countryCode`, `locality`, `formattedAddress`, `latitude`, `longitude`
- `Location`: `countryCode`, `locality`, `formattedAddress`, `latitude`, `longitude`

Backfill davranışı:

- Legacy kayıtlar için `countryCode` default/backfill `TR`
- `formattedAddress` yoksa `address` üzerinden doldurma
- Organization için `NormalizedAddress(ownerType="ORGANIZATION")` bootstrap

### Windows Prisma Command Note

Bu workspace path içinde `&` bulunduğundan bazı PowerShell çağrılarında `npx prisma ...` komutu parse hatası verebilir.

Bu durumda eşdeğer Prisma CLI çağrıları kullanılmalıdır:

```powershell
node .\node_modules\prisma\build\index.js validate
node .\node_modules\prisma\build\index.js generate
```
