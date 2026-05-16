# Randevo — Billing Checkout ve Kalan Beyaz UI Temizliği Planı

> Amaç: Randevo projesinde hâlâ kalan **beyaz/okunmayan UI kalıntılarını** temizlemek ve **abonelik planı değiştirme / ödeme sayfası** akışını gerçek çalışan bir yapıya dönüştürmek.
>
> Bu plan **Codex**, **Claude Code** ve Antigravity ile phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Mevcut Sorunlar

Ekran görüntülerinden görülen ana problemler:

```txt
1. Dark theme içinde hâlâ beyaz native dropdownlar var.
   Örnek: WhatsApp otomatik yanıt ayarındaki "Yanıt Modu" select açılınca beyaz panel görünüyor.

2. Analytics sayfasında "Öne Çıkanlar" kartları açık/beyaz kalmış.
   Kart içindeki yazılar çok açık renkli, okunabilirlik düşük.

3. Abonelik sayfasında ödeme akışı eksik.
   "Başlangıç" planına geç dediğimizde buton "Yönlendiriliyor..." durumuna geçiyor ama ödeme sayfası yok veya boş dönüyor.

4. Billing sayfası sadece plan kartlarını gösteriyor, gerçek checkout flow yok.
   Plan seçimi, ödeme başlatma, ödeme callback/webhook, başarılı/başarısız ödeme sayfaları eksik veya tamamlanmamış.

5. UI genelinde bazı componentler shared design system yerine eski class/style kullanıyor.
```

---

## 2. Ana Hedef

Bu güncellemeden sonra:

```txt
- Native beyaz dropdown kalmayacak.
- Tüm select/dropdownlar ThemedSelect veya shared UI Select kullanacak.
- Analytics "Öne Çıkanlar" kartları dark theme ile uyumlu olacak.
- Dashboard, billing, analytics, WhatsApp ayarları aynı design system kullanacak.
- Abonelik planı seçince gerçek checkout sayfasına gidilecek.
- Checkout sayfası seçilen planı, fiyatı, ödeme sağlayıcısını ve ödeme durumunu gösterecek.
- Ödeme tamamlanmadan plan aktif edilmeyecek.
- Webhook/callback doğrulanmadan subscription güncellenmeyecek.
- Ödeme başarısız olursa kullanıcı anlamlı hata görecek.
- Billing sayfasında current subscription, invoices/payment history ve plan değiştirme akışı net olacak.
```

---

## 3. Kapsam

Bu plan iki ana modülden oluşur:

```txt
A) Global UI Remnant Cleanup
B) Subscription Checkout / Payment Page
```

---

# 4. Modül A — Global UI Remnant Cleanup

## 4.1 Düzeltilecek Görsel Hatalar

### 4.1.1 Native Select Dropdown Beyaz Kalıyor

Görülen örnek:

```txt
/dashboard/whatsapp veya benzeri ayar sayfasında:
"Yanıt Modu" dropdown açıldığında panel beyaz kalıyor.
Option yazıları dark theme içinde okunmuyor.
```

Muhtemel sebep:

```txt
Native <select> kullanılıyor.
Browser native dropdown panelini kendisi çiziyor.
Dark theme CSS option listesine güvenilir uygulanmıyor.
```

Çözüm:

```txt
- Native <select> kritik dashboard/public formlarda kaldırılacak.
- ThemedSelect / Radix Select / shadcn Select kullanılacak.
- Dropdown content, item, selected, hover, disabled state design token ile çizilecek.
```

---

### 4.1.2 Analytics "Öne Çıkanlar" Kartları Beyaz

Görülen örnek:

```txt
Analytics sayfasında "Öne Çıkanlar" bölümündeki kartlar açık beyaz.
Dark background üstünde tema kopuk duruyor.
Kart içindeki yazılar çok soluk.
```

Çözüm:

```txt
- FeaturedHighlightCard component varsa güncellenecek.
- Yoksa analytics sayfasındaki inline card classları shared Card componentine taşınacak.
- Light card yerine surface.card / surface.cardMuted kullanılacak.
- Title/subtitle text contrast düzeltilecek.
```

---

### 4.1.3 Genel UI Kalıntıları

Taranacak class/patternler:

```bash
grep -R "<select" src
grep -R "<option" src
grep -R "bg-white" src
grep -R "bg-slate-50" src
grep -R "bg-gray-50" src
grep -R "text-gray-100" src
grep -R "text-gray-200" src
grep -R "text-white/30" src
grep -R "text-white/40" src
grep -R "opacity-30" src
grep -R "opacity-40" src
grep -R "Yönlendiriliyor" src
grep -R "Öne Çıkanlar" src
grep -R "Yanıt Modu" src
```

---

## 4.2 Unified UI Kuralları

Tüm dashboard ve public sayfalarda şu componentler ortaklaştırılmalı:

```txt
Card
Button
Select
Input
Textarea
Switch
Badge
Table
PageHeader
StatCard
HighlightCard
PlanCard
CheckoutCard
EmptyState
LoadingState
ErrorState
```

### 4.2.1 Design Token Önerisi

```txt
surface.page
surface.card
surface.cardHover
surface.cardMuted
surface.input
surface.dropdown
text.primary
text.secondary
text.muted
text.disabled
border.default
border.focus
accent.primary
accent.soft
success
warning
danger
```

### 4.2.2 Yasaklanacak / Azaltılacak Kullanımlar

```txt
bg-white
bg-gray-50
bg-slate-50
text-gray-100 on white
text-white/20
text-white/30
hard-coded disabled button colors
native select for important UI
```

---

# 5. Modül B — Subscription Checkout / Payment Page

## 5.1 Mevcut Sorun

Abonelik sayfasında plan kartları görünüyor:

```txt
Ücretsiz
₺0/ay

Başlangıç
₺40/ay
```

Ancak:

```txt
- "Yükselt" / "Aboneliğe geç" tıklanınca checkout sayfası açılmıyor.
- Buton "Yönlendiriliyor..." durumunda kalabiliyor.
- Ödeme başlatma endpointi eksik veya UI ile bağlı değil.
- Success/cancel/failure sayfaları eksik olabilir.
- Webhook ile subscription güncelleme akışı yok veya tamamlanmamış.
```

---

## 5.2 Hedef Ödeme Akışı

Kullanıcı plan değiştirmek istediğinde:

```txt
1. Kullanıcı /dashboard/billing sayfasına gider.
2. Başlangıç / Pro gibi bir plan seçer.
3. Sistem /dashboard/billing/checkout?plan=starter sayfasına yönlendirir.
4. Checkout sayfası plan detaylarını gösterir.
5. Kullanıcı "Ödemeye devam et" der.
6. Backend payment provider checkout session oluşturur.
7. Kullanıcı iyzico/Stripe/ödeme sağlayıcı sayfasına veya embedded checkout’a gider.
8. Ödeme tamamlanır.
9. Provider callback/webhook gelir.
10. Backend ödeme durumunu doğrular.
11. Subscription sadece doğrulanmış ödeme sonrası aktif edilir.
12. Kullanıcı /dashboard/billing/success veya /dashboard/billing/failure sayfasına döner.
```

---

## 5.3 Önerilen Route Planı

### UI Pages

```txt
/dashboard/billing
/dashboard/billing/checkout
/dashboard/billing/success
/dashboard/billing/failure
/dashboard/billing/history
```

### API Routes

```txt
POST /api/billing/checkout
POST /api/billing/confirm
GET  /api/billing/subscription
GET  /api/billing/history
POST /api/billing/cancel
POST /api/billing/change-plan

POST /api/webhooks/iyzico
POST /api/webhooks/stripe
```

Not:

```txt
Stripe global ödeme için ileride kullanılabilir.
Türkiye pazarı için iyzico ana provider olabilir.
```

---

## 5.4 Payment Provider Strategy

Projede daha önce iyzico planlandığı için önerilen yapı:

```txt
TR market:
- iyzico Checkout Form / Subscription Checkout

Global market:
- Stripe Checkout veya ileride seçilecek global provider

Development/Test:
- FakePaymentProvider
```

### Provider Interface

```ts
export type CheckoutSessionInput = {
  organizationId: string;
  userId: string;
  planId: string;
  billingCycle: "MONTHLY" | "YEARLY";
  locale: string;
  currency: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResult = {
  provider: "IYZICO" | "STRIPE" | "FAKE";
  checkoutUrl?: string;
  checkoutHtml?: string;
  providerSessionId: string;
  conversationId: string;
};

export interface PaymentProvider {
  createSubscriptionCheckout(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  retrievePayment(providerPaymentId: string): Promise<PaymentStatusResult>;
  verifyWebhook(request: Request): Promise<VerifiedWebhookEvent>;
}
```

### Dosya Yapısı

```txt
src/lib/payment/payment-provider.ts
src/lib/payment/payment-provider.factory.ts
src/lib/payment/providers/iyzico-provider.ts
src/lib/payment/providers/stripe-provider.ts
src/lib/payment/providers/fake-payment-provider.ts
src/lib/payment/payment-status.ts
src/lib/payment/payment-security.ts
```

---

## 5.5 Plan ve Abonelik Modeli

### 5.5.1 Plan Config

```txt
Free
- ₺0/ay
- 1 çalışan
- 20 randevu/ay
- Temel kontrol paneli

Starter / Başlangıç
- ₺40/ay
- 3 çalışan
- 300 randevu/ay
- E-posta hatırlatmaları
- SMS hatırlatmaları
- Marketplace görünürlüğü
- Analitik paneli

Pro
- ₺249/ay öneri
- Daha fazla çalışan
- Daha yüksek randevu limiti
- WhatsApp otomasyon
- Gelişmiş analitik
- Öncelikli destek
```

Not:

```txt
Plan fiyatları config üzerinden yönetilmeli.
Hard-code UI içinde kalmamalı.
```

Dosya:

```txt
src/config/billing-plans.ts
```

Örnek:

```ts
export const BILLING_PLANS = [
  {
    id: "free",
    nameKey: "billing.plans.free.name",
    priceMonthly: 0,
    currency: "TRY",
    staffLimit: 1,
    appointmentLimitMonthly: 20
  },
  {
    id: "starter",
    nameKey: "billing.plans.starter.name",
    priceMonthly: 40,
    currency: "TRY",
    staffLimit: 3,
    appointmentLimitMonthly: 300
  }
];
```

---

## 5.6 Prisma Model Önerisi

Mevcut schema’ya göre uyarlanmalı. Eksikse şu modeller eklenmeli veya mevcutlar genişletilmeli.

### SubscriptionPlan

```prisma
model SubscriptionPlan {
  id              String   @id
  name            String
  currency        String
  priceMonthly    Int
  priceYearly     Int?
  staffLimit      Int
  appointmentLimitMonthly Int
  features        Json
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### OrganizationSubscription

```prisma
model OrganizationSubscription {
  id                  String   @id @default(cuid())
  organizationId      String
  planId              String
  status              String   // FREE | PENDING | ACTIVE | PAST_DUE | CANCELLED | EXPIRED
  provider            String?  // IYZICO | STRIPE | FAKE
  providerSubscriptionId String?
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([organizationId])
  @@index([planId])
  @@index([status])
}
```

### PaymentTransaction

```prisma
model PaymentTransaction {
  id                    String   @id @default(cuid())
  organizationId         String
  subscriptionId         String?
  provider               String
  providerPaymentId      String?
  providerSessionId      String?
  conversationId         String   @unique
  planId                 String
  amount                 Int
  currency               String
  status                 String   // INITIATED | PENDING | PAID | FAILED | CANCELLED | REFUNDED
  rawProviderPayload     Json?
  paidAt                 DateTime?
  failedAt               DateTime?
  failureReason          String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([organizationId])
  @@index([status])
  @@index([provider])
}
```

### PaymentWebhookEvent

```prisma
model PaymentWebhookEvent {
  id              String   @id @default(cuid())
  provider        String
  eventId         String?
  conversationId  String?
  paymentId       String?
  eventType       String
  status          String
  payloadHash     String
  rawPayload      Json?
  processedAt     DateTime?
  createdAt       DateTime @default(now())

  @@unique([provider, payloadHash])
  @@index([conversationId])
  @@index([paymentId])
}
```

---

## 5.7 Ödeme Sayfası UI

### `/dashboard/billing/checkout`

Gösterilecekler:

```txt
- Seçilen plan adı
- Aylık/yıllık fiyat
- Dahil olan özellikler
- Mevcut plan
- Yeni plan
- Ödenecek tutar
- KDV bilgisi, gerekiyorsa
- Ödeme sağlayıcısı
- Güvenli ödeme açıklaması
- Devam et butonu
- İptal / billing sayfasına dön
```

### Loading / Error States

```txt
- Checkout session oluşturuluyor...
- Ödeme sayfasına yönlendiriliyorsunuz...
- Ödeme başlatılamadı.
- Plan bulunamadı.
- Bu plan zaten aktif.
- Ücretsiz plana geçiş için ödeme gerekmez.
```

### Success Page

```txt
/dashboard/billing/success
```

Gösterilecekler:

```txt
- Ödeme alındı veya ödeme doğrulanıyor.
- Planınız aktif edildi / doğrulama bekleniyor.
- Dashboard’a dön.
- Billing geçmişini gör.
```

### Failure Page

```txt
/dashboard/billing/failure
```

Gösterilecekler:

```txt
- Ödeme tamamlanamadı.
- Hata nedeni, güvenli ve kullanıcı dostu şekilde.
- Tekrar dene.
- Billing’e dön.
```

---

## 5.8 Güvenlik Kuralları

```txt
- Plan aktif etme işlemi sadece provider doğrulaması sonrası yapılmalı.
- Client redirect tek başına ödeme başarılı sayılmamalı.
- Webhook idempotent olmalı.
- Aynı provider event iki kere gelirse çift subscription update olmamalı.
- Provider payload doğrulanmalı.
- Webhook secret/signature kontrol edilmeli.
- Amount/currency/planId backend tarafında doğrulanmalı.
- Kullanıcı client’tan amount gönderse bile güvenilmemeli.
- Organization membership kontrol edilmeli.
- Staff kullanıcı billing checkout başlatamamalı.
- Sadece owner/admin billing değiştirebilmeli.
```

---

## 5.9 Checkout Flow Detayı

### 5.9.1 Plan Upgrade

```txt
1. User clicks Starter plan.
2. Frontend calls:
   POST /api/billing/checkout
   body: { planId: "starter", billingCycle: "MONTHLY" }

3. API:
   - requireAuth()
   - requireOwnerOrBillingAdmin()
   - getActiveOrganization()
   - validate plan server-side
   - create PaymentTransaction status INITIATED
   - call PaymentProvider.createSubscriptionCheckout()
   - save providerSessionId/conversationId
   - return checkoutUrl or checkoutHtml

4. UI:
   - redirect to checkoutUrl
   - or render embedded checkoutHtml safely if provider requires
```

### 5.9.2 Payment Completion

```txt
1. Provider redirects user to success/callback URL.
2. UI shows "Ödeme doğrulanıyor".
3. Backend waits for webhook or calls retrievePayment.
4. If payment verified:
   - PaymentTransaction -> PAID
   - OrganizationSubscription -> ACTIVE
   - Plan limits updated
5. If failed:
   - PaymentTransaction -> FAILED
   - Subscription unchanged
```

---

## 5.10 Billing History

`/dashboard/billing/history` veya billing sayfasında section:

```txt
- Tarih
- Plan
- Tutar
- Durum
- Provider
- Fatura/dekont linki, ileride
```

API:

```txt
GET /api/billing/history
```

---

## 5.11 Manual Bank Transfer Opsiyonu

Türkiye pazarı için ileri aşama:

```txt
- Manuel havale/EFT seçeneği
- Admin approval flow
- Pending subscription
- Dekont upload, opsiyonel
```

Bu phase içinde zorunlu değil. Ancak payment architecture buna açık olmalı.

---

# 6. Kullanılacak Agentlar / Skills

## 6.1 `ui-remnant-audit-agent`

Görev:

```txt
- Beyaz kalan componentleri tarar.
- Native select kullanımını bulur.
- Low contrast textleri listeler.
- Screenshot’taki analytics/WhatsApp/billing problemlerini eşler.
```

## 6.2 `design-system-refactor-agent`

Görev:

```txt
- Shared Card/Button/Select/StatCard/HighlightCard componentlerini düzeltir.
- Eski classları design token sistemine taşır.
- Dark/light theme uyumunu sağlar.
```

## 6.3 `billing-flow-architect-agent`

Görev:

```txt
- Plan seçimi, checkout, success/failure, billing history akışını tasarlar.
- Route/API/model planını uygular.
```

## 6.4 `payment-provider-agent`

Görev:

```txt
- iyzico/Stripe/Fake provider abstraction kurar.
- Checkout session başlatma ve provider response normalize eder.
```

## 6.5 `webhook-security-agent`

Görev:

```txt
- Webhook idempotency, signature doğrulama ve amount/currency validation ekler.
- Client redirect ile ödeme başarılı sayılmasını engeller.
```

## 6.6 `tenant-billing-auth-agent`

Görev:

```txt
- Billing aksiyonlarında organization owner/admin guard ekler.
- Staff kullanıcıların checkout başlatmasını engeller.
```

## 6.7 `e2e-billing-qa-agent`

Görev:

```txt
- Playwright ile billing checkout, success/failure ve dark UI regression testleri yazar.
```

## 6.8 `release-manager-agent`

Görev:

```txt
- Tüm phase sonlarında test/build çalıştırır.
- CHANGELOG/README günceller.
- GitHub push ve release tag yapar.
```

---

# 7. Phase Planı

```txt
BILLUI-0 — Audit ve Bug Reproduction
BILLUI-1 — Global UI Remnant Cleanup
BILLUI-2 — Themed Select Migration
BILLUI-3 — Billing Data Model ve Plan Config
BILLUI-4 — Checkout Page UI
BILLUI-5 — Payment Provider Abstraction
BILLUI-6 — iyzico Checkout / Subscription Integration
BILLUI-7 — Webhook, Confirm ve Subscription Activation
BILLUI-8 — Billing History ve Failure/Success States
BILLUI-9 — E2E Regression, Security Review ve Release
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
npm run check:secrets
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
/compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 8. Phase Detayları

---

## BILLUI-0 — Audit ve Bug Reproduction

Amaç:

Beyaz UI kalıntılarını ve boş ödeme akışının nereden kaynaklandığını bulmak.

Yapılacaklar:

```txt
1. WhatsApp/otomatik yanıt ayar sayfasındaki select componentini bul.
2. Analytics "Öne Çıkanlar" kartlarını bul.
3. Billing plan kartlarını ve buton click handlerlarını bul.
4. "Yönlendiriliyor..." state’inin nerede kaldığını tespit et.
5. Checkout route/API var mı kontrol et.
6. Payment provider abstraction var mı kontrol et.
7. Webhook/callback route var mı kontrol et.
8. docs/billing-ui-audit.md oluştur.
```

Arama komutları:

```bash
grep -R "Yanıt Modu" src
grep -R "Her zaman yanıtla" src
grep -R "Öne Çıkanlar" src
grep -R "EN ÇOK TERCİH" src
grep -R "Yönlendiriliyor" src
grep -R "checkout" src
grep -R "billing" src/app src/components src/lib
grep -R "<select" src
grep -R "<option" src
grep -R "bg-white" src
grep -R "bg-gray-50" src
grep -R "bg-slate-50" src
```

Kabul kriteri:

```txt
- Ürün davranışı değişmedi.
- Hangi componentlerin düzeltileceği belgelendi.
- Ödeme akışındaki boşluklar belgelendi.
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
git commit -m "docs: audit billing checkout and UI remnants"
git push
```

---

## BILLUI-1 — Global UI Remnant Cleanup

Amaç:

Analytics ve billing başta olmak üzere beyaz/okunmayan kartları temizlemek.

Yapılacaklar:

```txt
1. Analytics "Öne Çıkanlar" kartlarını shared HighlightCard componentine taşı.
2. Light card classlarını dark token ile değiştir.
3. Billing plan kartlarını shared PlanCard componentine bağla.
4. Disabled button state okunabilir hale getir.
5. Low contrast textleri düzelt.
6. Page spacing ve card background tutarlılığını düzelt.
7. docs/ui-remnant-cleanup-report.md oluştur.
```

Testler:

```txt
- Analytics "Öne Çıkanlar" kartları dark theme’de okunur.
- Billing plan kartları theme ile uyumludur.
- Disabled button text okunur.
- bg-white/bg-gray-50 kalıntıları kritik sayfalarda kalmaz.
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
git commit -m "style: remove remaining white UI remnants"
git push
```

Compact:

```txt
BILLUI-0 ve BILLUI-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## BILLUI-2 — Themed Select Migration

Amaç:

Dashboard’da kalan native selectleri ThemedSelect/shared Select componentine taşımak.

Yapılacaklar:

```txt
1. ThemedSelect/shared Select componentinin mevcut durumunu kontrol et.
2. WhatsApp "Yanıt Modu" selectini taşı.
3. Billing ve dashboard içindeki diğer native selectleri tara.
4. Option list white dropdown bug’ını bitir.
5. Keyboard/focus/hover state ekle.
6. Tests yaz.
```

Testler:

```txt
- Yanıt Modu dropdown açıldığında beyaz panel görünmez.
- Option yazıları okunur.
- Keyboard ile seçim yapılır.
- Disabled option okunur ama disabled olduğu anlaşılır.
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
git commit -m "fix: replace remaining native selects with themed select"
git push
```

---

## BILLUI-3 — Billing Data Model ve Plan Config

Amaç:

Plan ve subscription datasını merkezi hale getirmek.

Yapılacaklar:

```txt
1. Mevcut billing/subscription Prisma modellerini incele.
2. Eksikse SubscriptionPlan, OrganizationSubscription, PaymentTransaction, PaymentWebhookEvent modellerini ekle.
3. src/config/billing-plans.ts oluştur.
4. Plan limitlerini configten okut.
5. Seed data veya migration ekle.
6. Tests yaz.
```

Testler:

```txt
- Free plan config doğru.
- Starter plan ₺40/ay doğru.
- Plan ids unique.
- Subscription organization ile bağlanır.
- PaymentTransaction conversationId unique olur.
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
git commit -m "feat: add billing plans and subscription data model"
git push
```

Compact:

```txt
BILLUI-2 ve BILLUI-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## BILLUI-4 — Checkout Page UI

Amaç:

Plan seçimi sonrası boş dönmek yerine gerçek checkout sayfası göstermek.

Yapılacaklar:

```txt
1. /dashboard/billing/checkout route oluştur.
2. plan query parametresini oku.
3. Plan server-side doğrulansın.
4. Checkout summary component oluştur.
5. "Ödemeye devam et" butonu ekle.
6. Already active plan durumunu göster.
7. Free plan geçiş davranışını netleştir.
8. Loading/error states ekle.
9. Tests yaz.
```

Sayfa alanları:

```txt
- Mevcut plan
- Seçilen plan
- Fiyat
- Özellikler
- Billing cycle
- Ödeme sağlayıcısı
- Güvenli ödeme açıklaması
- Devam et / İptal butonları
```

Testler:

```txt
- /dashboard/billing/checkout?plan=starter açılır.
- Geçersiz plan friendly error gösterir.
- Aktif plan tekrar seçilirse ödeme başlatmaz.
- Staff kullanıcı erişemez.
- Owner erişebilir.
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
git commit -m "feat: add subscription checkout page"
git push
```

---

## BILLUI-5 — Payment Provider Abstraction

Amaç:

Ödeme sağlayıcısını soyutlamak ve fake/iyzico/stripe adaptörlerine açık yapı kurmak.

Yapılacaklar:

```txt
1. PaymentProvider interface oluştur.
2. FakePaymentProvider ekle.
3. Payment provider factory ekle.
4. Production’da provider env yoksa fail-fast yap.
5. /api/billing/checkout endpointini oluştur.
6. PaymentTransaction INITIATED oluştur.
7. Tests yaz.
```

Env örneği:

```env
PAYMENT_PROVIDER=IYZICO
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
APP_URL=http://localhost:3000
```

Testler:

```txt
- Development/test fake provider çalışır.
- Production provider eksikse fail-fast.
- /api/billing/checkout auth ister.
- Staff checkout başlatamaz.
- Owner checkout başlatır ve PaymentTransaction oluşur.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check:secrets
```

Commit:

```bash
git add .
git commit -m "feat: add payment provider abstraction for billing"
git push
```

Compact:

```txt
BILLUI-4 ve BILLUI-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## BILLUI-6 — iyzico Checkout / Subscription Integration

Amaç:

Türkiye pazarı için iyzico ile gerçek ödeme/abonelik checkout başlatmak.

Yapılacaklar:

```txt
1. iyzico provider adapter oluştur.
2. Subscription checkout form initialize endpointini kullan.
3. Plan id -> iyzico product/pricing plan mapping ekle.
4. conversationId olarak internal PaymentTransaction id veya güvenli unique id kullan.
5. successUrl/failureUrl/callbackUrl ayarla.
6. checkoutUrl veya checkoutHtml response’unu UI’a bağla.
7. Sandbox test flow ekle.
8. Tests yaz.
```

Config dosyası:

```txt
src/config/payment-provider-mapping.ts
```

Örnek mapping:

```ts
export const IYZICO_PLAN_MAPPING = {
  starter: {
    productReferenceCode: "randevo_starter",
    pricingPlanReferenceCode: "randevo_starter_monthly"
  },
  pro: {
    productReferenceCode: "randevo_pro",
    pricingPlanReferenceCode: "randevo_pro_monthly"
  }
};
```

Testler:

```txt
- Starter checkout iyzico provider çağrısı oluşturur.
- Mapping olmayan plan hata verir.
- Amount/currency backendden gelir.
- Client amount gönderemez veya dikkate alınmaz.
- Checkout response kullanıcıyı ödeme sayfasına yönlendirir.
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
git commit -m "feat: integrate iyzico subscription checkout"
git push
```

---

## BILLUI-7 — Webhook, Confirm ve Subscription Activation

Amaç:

Ödeme doğrulanmadan plan aktif edilmesini engellemek ve webhook ile güvenli aktivasyon yapmak.

Yapılacaklar:

```txt
1. /api/webhooks/iyzico route oluştur.
2. Webhook signature/secret doğrulaması ekle.
3. PaymentWebhookEvent idempotency ekle.
4. Provider event conversationId/paymentId ile PaymentTransaction’a bağlansın.
5. Amount/currency/plan doğrulaması yapılsın.
6. Ödeme başarılıysa subscription ACTIVE yap.
7. Ödeme başarısızsa transaction FAILED yap.
8. /api/billing/confirm endpointini ekle, gerekiyorsa retrievePayment ile doğrula.
9. Tests yaz.
```

Kritik kural:

```txt
Client /success sayfasına geldi diye plan aktif edilmez.
Plan sadece webhook/retrievePayment doğrulaması sonrası aktif edilir.
```

Testler:

```txt
- Valid webhook subscription active eder.
- Duplicate webhook ikinci kez işlem yapmaz.
- Invalid signature 401/400 döner.
- Wrong amount/currency reject edilir.
- Failed payment subscription değiştirmez.
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
git commit -m "feat: activate subscriptions from verified payment webhooks"
git push
```

Compact:

```txt
BILLUI-6 ve BILLUI-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## BILLUI-8 — Billing History ve Failure/Success States

Amaç:

Ödeme sonrası kullanıcı deneyimini tamamlamak.

Yapılacaklar:

```txt
1. /dashboard/billing/success sayfası oluştur.
2. /dashboard/billing/failure sayfası oluştur.
3. /dashboard/billing/history veya billing history section ekle.
4. GET /api/billing/history endpointi ekle.
5. Current subscription status göster.
6. Pending payment state göster.
7. Retry payment butonu ekle.
8. Tests yaz.
```

Testler:

```txt
- Success page ödeme doğrulama bekliyor/aktif durumunu gösterir.
- Failure page tekrar dene sunar.
- Billing history transactionları listeler.
- Pending transaction kullanıcıya gösterilir.
- Active subscription billing sayfasında güncellenir.
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
git commit -m "feat: add billing success failure and payment history"
git push
```

---

## BILLUI-9 — E2E Regression, Security Review ve Release

Amaç:

UI ve billing ödeme akışını final kalite kontrolünden geçirmek.

Yapılacaklar:

```txt
1. E2E test: WhatsApp Yanıt Modu dropdown dark theme okunur.
2. E2E test: Analytics Öne Çıkanlar kartları dark theme okunur.
3. E2E test: Billing Starter checkout sayfasına gider.
4. E2E test: Staff billing checkout başlatamaz.
5. E2E test: Owner fake provider ile checkout başlatır.
6. E2E test: Fake provider success subscription active eder.
7. E2E test: Failed payment subscription değiştirmez.
8. Security review dokümanı oluştur.
9. README/CHANGELOG güncelle.
10. Release tag oluştur.
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
npm run check:secrets
npx prisma validate
npx prisma generate
```

Commit/tag:

```bash
git add .
git commit -m "chore: finalize billing checkout and UI cleanup release"
git push
git tag v1.7.1-billing-checkout-ui-fix
git push origin v1.7.1-billing-checkout-ui-fix
```

---

# 9. Codex Ana Prompt

```txt
Read RANDEVO_BILLING_CHECKOUT_AND_UI_CLEANUP_PLAN.md completely.

We need to fix:
1. White/unreadable UI remnants still exist in dark theme.
2. Native select dropdowns are still white in some dashboard pages, especially WhatsApp auto reply response mode.
3. Analytics "Öne Çıkanlar" highlight cards are white/unreadable.
4. Billing subscription upgrade flow has no real payment/checkout page.
5. Clicking "Başlangıç / Starter" plan gets stuck or returns blank.
6. Subscription must only activate after verified provider confirmation/webhook.

Do not implement everything randomly.
Follow BILLUI-0 through BILLUI-9 in order.

Start with BILLUI-0 only:
- Audit WhatsApp auto reply select.
- Audit Analytics highlight cards.
- Audit Billing plan cards and click handlers.
- Audit checkout/payment routes and APIs.
- Audit native selects and white UI remnants.
- Create docs/billing-ui-audit.md.
- Do not change behavior yet.
- Run tests/build.
- Commit and push only if checks pass.
- Stop after BILLUI-0 and summarize.
```

---

# 10. Full Auto Prompt

```txt
Read RANDEVO_BILLING_CHECKOUT_AND_UI_CLEANUP_PLAN.md completely.

Implement all phases from BILLUI-0 to BILLUI-9 in order.

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
- Do not leave native white select dropdowns in dashboard/public critical flows.
- Do not leave white/unreadable cards in dark theme.
- Analytics highlight cards must be readable.
- Billing plan upgrade must go to a real checkout page.
- Do not activate subscription from client redirect alone.
- Subscription activates only after verified provider webhook or confirmed retrievePayment.
- Staff users must not start billing checkout.
- Only owner/billing admin can change subscription.
- Client must not control amount/currency/plan price.
- Payment webhooks must be idempotent.
- Duplicate webhook must not double-activate or double-charge.
- Provider secrets must not be committed.
- Production must fail fast if payment provider config is missing.
- Use FakePaymentProvider only in development/test.
- Add E2E tests for UI cleanup and billing checkout.
- Do not force push.
```

---

# 11. Final Definition of Done

```txt
- WhatsApp response mode dropdown is theme-aware.
- No white native select dropdown remains in critical dashboard forms.
- Analytics highlight cards are dark theme compatible.
- Billing plan cards are readable and consistent.
- Billing checkout page exists.
- Starter plan click opens checkout flow.
- Payment provider abstraction exists.
- Fake provider works in dev/test.
- iyzico provider integration exists or is correctly scaffolded.
- PaymentTransaction records are created.
- Subscription does not activate before provider verification.
- Webhook idempotency exists.
- Billing success/failure pages exist.
- Billing history exists.
- Staff cannot start checkout.
- Owner/billing admin can start checkout.
- E2E tests cover UI cleanup and checkout.
- Build passes.
- Tests pass.
- GitHub push and release tag completed.
```

---

# 12. Final Review Prompt

```txt
Review the billing checkout and UI cleanup implementation.

Check:
1. Are there any remaining native select dropdowns in critical dashboard/public flows?
2. Is the WhatsApp response mode dropdown theme-aware?
3. Are Analytics "Öne Çıkanlar" cards readable in dark theme?
4. Are billing plan cards readable?
5. Does clicking Starter/Başlangıç open /dashboard/billing/checkout?
6. Does checkout page show selected plan details?
7. Does checkout start a server-side payment session?
8. Is amount/currency controlled by backend config?
9. Does staff checkout attempt fail?
10. Can owner/billing admin start checkout?
11. Does FakePaymentProvider work in dev/test?
12. Does iyzico provider scaffold or integration exist?
13. Are provider secrets protected?
14. Does production fail fast if payment provider config is missing?
15. Does webhook verification exist?
16. Is webhook processing idempotent?
17. Does subscription activate only after verified payment?
18. Do success/failure pages exist?
19. Does billing history exist?
20. Are E2E tests added?
21. Do all tests pass?
22. Does build pass?
23. Has everything been committed and pushed?

Fix small issues only.
Do not add unrelated features.
Create final release notes.
```
