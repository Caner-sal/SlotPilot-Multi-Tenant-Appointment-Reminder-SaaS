# Billing Checkout & UI Remnant Audit — BILLUI-0

**Tarih:** 2026-05-17  
**Branch:** feature/global-address-locale  
**Audit kapsamı:** WhatsApp, Analytics, Billing sayfaları ve ödeme akışı

---

## 1. Native Select Beyaz Dropdown

**Dosya:** `src/app/dashboard/whatsapp/page.tsx`  
**Satır:** 214–225

```tsx
<select
  value={settings.replyMode}
  onChange={(e) => setSettings((s) => ({ ...s, replyMode: e.target.value as WaSettings["replyMode"] }))}
  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
>
  <option value="ALWAYS">{t("modeAlways")}</option>
  <option value="KEYWORD_ONLY">{t("modeKeyword")}</option>
  <option value="DISABLED">{t("modeOff")}</option>
</select>
```

**Sorun:** Native `<select>` kullanılıyor. Tarayıcı kendi dropdown panelini çiziyor; dark theme CSS native option listesine güvenilir biçimde uygulanmıyor — açılınca beyaz panel görünüyor.

**Çözüm (BILLUI-2):** `src/components/ui/select.tsx` (Radix Select) ile değiştir.

---

## 2. Analytics "Öne Çıkanlar" Kartları Beyaz

**Dosya:** `src/app/dashboard/analytics/page.tsx`  
**Satır:** 151, 162

```tsx
<div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">   {/* L151 */}
<div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg"> {/* L162 */}
```

**Sorun:** `bg-blue-50` ve `bg-indigo-50` light mode renkleridir; dark background üstünde beyaz/açık görünür. i18n anahtarı: `t("highlights")` → "Öne Çıkanlar".

**Çözüm (BILLUI-1):**
- `bg-blue-50` → `bg-blue-500/10 border border-blue-500/20`
- `bg-indigo-50` → `bg-indigo-500/10 border border-indigo-500/20`

---

## 3. Billing Sayfası Açık Renk Badge ve Alert'ler

**Dosya:** `src/app/dashboard/billing/page.tsx`

### 3a. Plan badge renkleri (L22–26)
```ts
const PLAN_BADGE_COLORS: Record<TurkeyPlanId, string> = {
  FREE: "bg-muted text-muted-foreground",           // OK
  STARTER: "bg-blue-100 text-blue-700",             // PROBLEM
  PRO: "bg-purple-100 text-purple-700",             // PROBLEM
  ENTERPRISE: "bg-slate-100 text-slate-700",        // PROBLEM
};
```
`bg-blue-100`, `bg-purple-100`, `bg-slate-100` → dark theme'de açık görünür.

**Çözüm (BILLUI-1):**
- STARTER: `bg-blue-500/15 text-blue-400`
- PRO: `bg-purple-500/15 text-purple-400`
- ENTERPRISE: `bg-muted text-muted-foreground`

### 3b. Success alert (L99–103)
```tsx
<div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
```
**Çözüm:** `bg-green-500/10 text-green-400 border-green-500/20`

### 3c. Cancelled alert (L105–109)
```tsx
<div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
```
**Çözüm:** `bg-yellow-500/10 text-yellow-400 border-yellow-500/20`

### 3d. Demo mode alert (L111–115)
```tsx
<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
```
**Çözüm:** `bg-amber-500/10 text-amber-400 border-amber-500/20`

---

## 4. Billing Checkout Akışı Eksikliği

**Mevcut durum:**
- Kullanıcı plan butonuna tıklar → `handleUpgrade("STARTER")`
- `POST /api/billing/checkout` çağrılır
- Stripe yapılandırılmışsa → `window.location.href = json.data.url` (Stripe hosted checkout)
- Stripe yapılandırılmamışsa → `demoMessage` gösterilir ("Yönlendiriliyor..." durumunda kalabilir)

**Eksik sayfalar:**
- ❌ `/dashboard/billing/checkout` — dedicated checkout preview sayfası yok
- ❌ `/dashboard/billing/success` — ödeme başarılı sayfası yok
- ❌ `/dashboard/billing/failure` — ödeme başarısız sayfası yok
- ❌ `/dashboard/billing/history` — ödeme geçmişi sayfası yok

**Eksik API'ler:**
- ❌ `GET /api/billing/history`
- ❌ `POST /api/billing/confirm`
- ❌ `POST /api/webhooks/iyzico`

**Mevcut çalışan altyapı:**
- ✅ `POST /api/billing/checkout` (Stripe, OWNER+ADMIN guard)
- ✅ `GET /api/billing/subscription`
- ✅ `POST /api/webhooks/stripe` (signature, idempotency)
- ✅ `WebhookEvent` Prisma modeli (idempotency için)
- ✅ `Subscription` Prisma modeli (plan/status/stripeCustomerId)
- ✅ `src/config/pricing.tr.ts` (TURKEY_PLANS)
- ✅ `src/services/payment/payment.factory.ts` (5 provider desteği)

---

## 5. iyzico Provider Stub

**Dosya:** `src/services/payment/iyzico.provider.ts`

Tüm methodlar `throw new Error("Not implemented")` döndürüyor. Türkiye pazarı için entegrasyon gerekiyor.

**Çözüm (BILLUI-6):** iyzico Subscription API entegrasyonu.

---

## 6. SubscriptionPaymentTransaction Modeli Eksik

Mevcut `Payment` modeli appointment deposit'lere bağlıdır (`appointmentId` required, `stripeEventId` UNIQUE). Subscription ödemeleri için ayrı bir model gerekiyor.

**Çözüm (BILLUI-3):** Yeni `SubscriptionPaymentTransaction` modeli ekle.

---

## 7. Güvenlik Durumu

| Kural | Durum |
|---|---|
| Staff billing checkout başlatamaz | ✅ `assertMembership([OWNER, ADMIN])` mevcut |
| Amount/currency backend'den gelir | ✅ Stripe priceId backend'de tanımlı |
| Webhook signature doğrulaması | ✅ Stripe webhook'ta mevcut |
| Webhook idempotency | ✅ `WebhookEvent.@@unique([provider, eventId])` |
| Client redirect ile aktivasyon yok | ⚠️ Şu an Stripe callback `?success=true` parametresi ile geri dönüyor, plan aktivasyonu webhook'ta yapılıyor — kontrol edilmeli |
| iyzico webhook | ❌ Route yok |

---

## 8. Düzeltme Öncelik Sırası

| Öncelik | Faz | Konu |
|---|---|---|
| 1 | BILLUI-1 | Analytics highlight kartlar dark token |
| 2 | BILLUI-1 | Billing badge/alert dark token |
| 3 | BILLUI-2 | WhatsApp native select → Radix |
| 4 | BILLUI-3 | SubscriptionPaymentTransaction modeli |
| 5 | BILLUI-4 | Checkout sayfası |
| 6 | BILLUI-5 | Provider abstraction + fake checkout |
| 7 | BILLUI-6 | iyzico entegrasyonu |
| 8 | BILLUI-7 | iyzico webhook + aktivasyon |
| 9 | BILLUI-8 | Success/failure/history sayfaları |
| 10 | BILLUI-9 | E2E testler + release |
