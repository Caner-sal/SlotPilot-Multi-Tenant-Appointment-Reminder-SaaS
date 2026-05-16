# Billing Checkout Security Review — BILLUI-9

**Tarih:** 2026-05-17  
**Kapsam:** BILLUI-0 → BILLUI-9 implementasyonu

---

## Güvenlik Kontrol Listesi

### 1. Amount/Currency Backend'den Geliyor

- [x] `/api/billing/checkout` — `amountCents` ve `currency` her zaman `TURKEY_PLANS[plan].priceCentsMonthly` config'inden alınıyor
- [x] Client body'deki `plan` değeri `z.enum(["STARTER", "PRO"])` ile validate ediliyor
- [x] Client hiçbir zaman amount, currency veya priceId belirleyemiyor
- [x] iyzico webhook: `price` alanı server-side plan config ile karşılaştırılıyor; uyumsuzlukta 400 dönüyor

### 2. Staff Checkout Başlatamıyor

- [x] `/api/billing/checkout` — `assertMembership(userId, orgId, [MemberRole.OWNER, MemberRole.ADMIN])` guard
- [x] `/dashboard/billing/checkout` — `session?.user?.appRole === "STAFF_MEMBER"` kontrolü ile redirect
- [x] `/api/billing/history` — aynı guard
- [x] `/api/billing/confirm` — aynı guard

### 3. Subscription Sadece Webhook/Confirm Sonrası Aktif

- [x] Client `/dashboard/billing/success` sayfasına geldiğinde subscription **otomatik aktif edilmiyor**
- [x] Aktivasyon yalnızca:
  - iyzico webhook (`/api/webhooks/iyzico`) ile `SUCCESS` eventi alındığında
  - Stripe webhook (`/api/webhooks/stripe`) ile `checkout.session.completed` eventi alındığında
  - `FakePaymentProvider` için `/api/billing/confirm?fake=1` ile (sadece dev/test)
- [x] `conversationId` parametresi client'tan gelse de, transaction organizationId ile doğrulanıyor

### 4. Webhook Idempotency

- [x] iyzico webhook: `WebhookEvent.eventId = SHA256(body)` ile `@@unique([provider, eventId])` — duplicate body aynı işlemi tekrarlamıyor
- [x] Stripe webhook: `WebhookEvent.@@unique([provider, eventId])` ile eventId = Stripe event ID
- [x] Duplicate webhook: `processedAt` kontrolü ile erken return

### 5. Webhook Signature Doğrulaması

- [x] iyzico webhook: HMAC-SHA256 (`IYZICO_WEBHOOK_SECRET` veya `IYZICO_SECRET_KEY`)
- [x] Stripe webhook: `stripe.webhooks.constructEvent()` ile signature doğrulama
- [x] Geçersiz signature → 400 response

### 6. Provider Secrets Güvenliği

- [x] `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_WEBHOOK_SECRET` — `.env`'de, commit'te yok
- [x] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — `.env`'de
- [x] `npm run check:secrets` PASS (her commit sonrası çalıştırıldı)
- [x] `FakePaymentProvider.isConfigured()` — `process.env.NODE_ENV !== "production"` kontrolü

### 7. Production Fail-Fast

- [x] `/api/billing/checkout` — STRIPE path: Stripe key yoksa production'da 500 döner
- [x] `/api/billing/checkout` — Generic provider path: `createSubscriptionCheckout` yoksa production'da 500 döner
- [x] `IyzicoProvider.isConfigured()` — key yoksa `createSubscriptionCheckout` throw eder
- [x] `FakePaymentProvider` — sadece `NODE_ENV !== "production"` ortamında kullanılabilir

### 8. Client organizationId Güveni Yok

- [x] Tüm billing API'leri `requireAuth()` ve `assertMembership()` ile organizasyonu server-side belirliyor
- [x] Client'tan gelen `organizationId` kabul edilmiyor

### 9. OrganizationId İzolasyonu (Multi-Tenant)

- [x] `SubscriptionPaymentTransaction.findFirst` — her zaman `{ organizationId: org.id }` filter'ı ile
- [x] `Subscription.upsert` — `organizationId: transaction.organizationId`
- [x] Başka organizasyonun transaction'ına erişim engelleniyor

---

## Bilinen Sınırlamalar

| Alan | Durum | Not |
|---|---|---|
| iyzico amount webhook doğrulama | ✅ | Webhook'ta `price` alanı varsa kontrol ediliyor |
| iyzico retrievePayment | ⚠️ | `createSubscriptionCheckout`'a karşılık gelen retrieval endpoint implement edilmedi (ileride eklenebilir) |
| Stripe subscription cancel | ⚠️ | Cancel akışı mevcut webhook handler'da mevcut |
| Rate limiting (billing API) | ℹ️ | Genel middleware rate limiting devreye giriyor; billing-specific limit eklenmedi |

---

## Sonuç

BILLUI-0 → BILLUI-9 implementasyonu kritik güvenlik kurallarına uyuyor:
- Ödeme aktivasyonu sadece provider tarafından doğrulanmış event ile yapılıyor
- Staff kullanıcılar checkout başlatamıyor
- Amount/currency server-side config'den geliyor
- Webhook idempotency ve signature doğrulama mevcut
- Provider secrets commit'te bulunmuyor
