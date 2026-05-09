# SlotPilot WhatsApp Otomatik Link Gönderme Güncelleme Planı

> Bu dosya SlotPilot Türkiye sürümüne eklenecek WhatsApp otomasyon modülü için hazırlanmıştır.  
> Amaç: Müşteri işletmeye WhatsApp üzerinden yazdığında, sistemin otomatik olarak işletmenin SlotPilot randevu/website linkini göndermesi.  
> Bu güncelleme mevcut SMS/WhatsApp reminder altyapısından farklıdır; burada kullanıcı mesajı geldiğinde inbound webhook tetiklenir ve otomatik cevap verilir.

---

## 1. Özellik Özeti

Yeni özellik adı:

```txt
WhatsApp Auto Booking Link Reply
```

Kullanıcı senaryosu:

```txt
1. Müşteri işletmenin WhatsApp numarasına mesaj yazar.
2. WhatsApp Business Platform inbound webhook'u SlotPilot backend'e mesajı iletir.
3. SlotPilot mesajı kaydeder.
4. İşletmenin auto-reply ayarları kontrol edilir.
5. Uygunsa müşteriye otomatik Türkçe cevap gönderilir.
6. Cevabın içinde işletmenin public booking linki bulunur.
7. İşletme dashboard'da gelen mesaj ve gönderilen otomatik cevabı görebilir.
```

Örnek otomatik cevap:

```txt
Merhaba 👋
Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

---

## 2. Teknik Gerçekler ve Politika Notları

Bu özellik iki farklı WhatsApp kullanım şeklini ayırmalıdır:

### 2.1 WhatsApp Business App

Küçük işletmelerin telefonda kullandığı klasik WhatsApp Business uygulamasıdır.

Bu uygulamada:

```txt
- Greeting message / away message gibi basit otomasyonlar vardır.
- SlotPilot backend'e doğrudan inbound webhook bağlanamaz.
- Bizim sistemin otomatik link gönderebilmesi için WhatsApp Business Platform / Cloud API veya Twilio gibi provider gerekir.
```

### 2.2 WhatsApp Business Platform / Cloud API

SlotPilot'in backend üzerinden mesaj alıp gönderebilmesi için kullanılacak asıl yöntemdir.

Bu yapıda:

```txt
- Meta App ve WhatsApp Business Account gerekir.
- Business phone number bağlanır.
- Webhook verification endpoint gerekir.
- Inbound messages webhook ile alınır.
- Messages API ile cevap gönderilir.
- Testlerde gerçek mesaj gönderilmez; fake provider kullanılır.
```

### 2.3 24 Saat Kuralı

Kullanıcı işletmeye mesaj attığında 24 saatlik customer service window oluşur. Bu pencere içinde işletme serbest metinle cevap verebilir. Pencere dışında mesaj gönderilecekse approved message template gerekir.

Bu özellik inbound mesaja cevap verdiği için temel akışta 24 saatlik pencere içinde çalışmalıdır.

### 2.4 Opt-in ve İzin

SlotPilot bu modülde spam yapmamalıdır.

Kurallar:

```txt
- Otomatik cevap sadece müşteri işletmeye mesaj attıktan sonra tetiklenir.
- Toplu reklam mesajı gönderilmez.
- Kampanya/marketing mesajı ile randevu linki otomatik cevabı ayrılır.
- Kullanıcı çıkmak/istemiyorum/yazma gibi mesaj yazarsa auto-reply durdurulabilir.
- Müşteriye insan desteğine ulaşma yolu sunulur.
```

---

## 3. İş Kuralları

### 3.1 Auto Reply Aç/Kapat

Her işletme bu özelliği dashboard'dan açıp kapatabilmeli.

```txt
WhatsApp otomatik cevap: Açık / Kapalı
```

### 3.2 Mesaj Tekrarını Önleme

Aynı kişiye her mesajında link atmak rahatsız edici olabilir.

Varsayılan kural:

```txt
Aynı WhatsApp numarasına 24 saat içinde en fazla 1 otomatik booking link cevabı gönder.
```

Opsiyonel ayarlar:

```txt
- Her yeni konuşmada gönder
- 24 saatte bir gönder
- 7 günde bir gönder
- Sadece belirli anahtar kelimeler gelirse gönder
```

### 3.3 Anahtar Kelime Modu

İşletme isterse otomatik cevap sadece bazı kelimelerde çalışır.

Örnek tetikleyiciler:

```txt
randevu
randavu
fiyat
ücret
boş saat
müsaitlik
adres
link
```

MVP varsayılanı:

```txt
Her inbound mesajda, rate limit uygunsa booking link gönder.
```

Sonraki geliştirme:

```txt
Keyword-based mode eklenebilir.
```

### 3.4 İnsan Desteği Mesajı

Otomatik cevapta her zaman insan desteği seçeneği belirtilmeli.

Örnek:

```txt
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

### 3.5 Mesaj Döngüsünü Engelleme

Sistem başka botların veya kendi gönderdiği mesajların tekrar webhook'a düşmesiyle loop oluşturmamalı.

Kurallar:

```txt
- Sadece inbound user messages işlenir.
- Status webhook eventleri auto-reply tetiklemez.
- Business outbound messages auto-reply tetiklemez.
- Aynı WhatsApp messageId ikinci kez gelirse ignore edilir.
```

---

## 4. Yeni Database Modelleri

### 4.1 WhatsAppAutoReplySettings

```txt
id
organizationId
enabled
provider
phoneNumberId
businessPhoneDisplay
replyMode
cooldownHours
triggerKeywords
messageTemplate
includeBookingLink
includeMarketplaceLink
createdAt
updatedAt
```

`replyMode` seçenekleri:

```txt
ALWAYS
KEYWORD_ONLY
DISABLED
```

`provider` seçenekleri:

```txt
FAKE
META_CLOUD_API
TWILIO_WHATSAPP
```

### 4.2 WhatsAppInboundMessage

```txt
id
organizationId
provider
providerMessageId
fromPhone
toPhone
messageText
messageType
receivedAt
rawPayload
processedAt
createdAt
```

### 4.3 WhatsAppAutoReplyLog

```txt
id
organizationId
inboundMessageId
customerPhone
replyText
bookingUrl
provider
providerMessageId
status
errorMessage
sentAt
createdAt
```

Status seçenekleri:

```txt
PENDING
SENT
SKIPPED
FAILED
```

### 4.4 WhatsAppContactPreference

```txt
id
organizationId
phone
isBlocked
lastAutoReplyAt
marketingConsent
appointmentNotificationConsent
createdAt
updatedAt
```

Not:

```txt
Bu tablo KVKK/İYS consent sistemiyle uyumlu çalışmalı.
```

---

## 5. Yeni API Route Taslağı

### 5.1 Webhook Verification

```txt
GET /api/webhooks/whatsapp
```

Görev:

```txt
Meta webhook verification challenge cevaplanır.
```

### 5.2 Inbound Message Webhook

```txt
POST /api/webhooks/whatsapp
```

Görev:

```txt
Inbound mesajları ve status eventlerini alır.
Inbound user message ise auto-reply service'e iletir.
```

### 5.3 Dashboard Settings

```txt
GET    /api/whatsapp/auto-reply/settings
PATCH  /api/whatsapp/auto-reply/settings
```

### 5.4 Auto Reply Logs

```txt
GET /api/whatsapp/auto-reply/logs
```

### 5.5 Test Message Preview

```txt
POST /api/whatsapp/auto-reply/preview
```

Görev:

```txt
Gerçek WhatsApp mesajı göndermeden işletmeye mesaj önizlemesi gösterir.
```

### 5.6 Fake Provider Test Endpoint

```txt
POST /api/dev/fake-whatsapp/inbound
```

Sadece development ortamında çalışır.

Görev:

```txt
Gerçek WhatsApp webhook gelmeden local test için inbound message simüle eder.
```

---

## 6. Yeni Service Dosyaları

```txt
src/services/whatsapp-auto-reply.service.ts
src/services/whatsapp-provider.service.ts
src/services/whatsapp-webhook.service.ts
src/services/whatsapp-message-dedupe.service.ts
src/services/booking-link.service.ts
```

### 6.1 whatsapp-auto-reply.service.ts

Sorumluluk:

```txt
- Inbound mesajı analiz eder.
- Auto-reply açık mı kontrol eder.
- Cooldown/rate limit uygular.
- Keyword mode kontrol eder.
- Booking URL oluşturur.
- Provider ile mesaj gönderir.
- Log kaydı oluşturur.
```

### 6.2 whatsapp-provider.service.ts

Provider interface:

```ts
interface WhatsAppProvider {
  sendTextMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult>;
}
```

Provider implementasyonları:

```txt
FakeWhatsAppProvider
MetaCloudWhatsAppProvider
TwilioWhatsAppProvider
```

### 6.3 booking-link.service.ts

Görev:

```txt
organization slug veya location slug üzerinden doğru public booking linki üretir.
```

Örnek:

```txt
https://slotpilot.com/randevu/ekin-guzellik
https://slotpilot.com/randevu/halil-berber/kadikoy
```

---

## 7. Yeni Agent Listesi

`.claude/agents/` içine şu agent dosyaları eklenecek:

```txt
whatsapp-auto-link-agent.md
whatsapp-webhook-agent.md
whatsapp-policy-agent.md
whatsapp-dashboard-agent.md
whatsapp-provider-agent.md
whatsapp-qa-agent.md
compact-maintainer-agent.md
github-release-agent.md
```

---

# 8. Agent Tanımları

## 8.1 `whatsapp-auto-link-agent.md`

```md
---
name: whatsapp-auto-link-agent
description: Use this agent to implement automatic booking link replies when customers message a business on WhatsApp.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Auto Link Agent for SlotPilot.

Responsibilities:
- Implement WhatsApp auto-reply settings.
- Implement booking link generation.
- Implement cooldown rules.
- Implement keyword trigger logic.
- Implement auto-reply log creation.
- Make sure replies are Turkish.
- Make sure human support text is included.

Rules:
- Do not send spam.
- Do not send repeated auto-replies without cooldown.
- Do not reply to webhook status events.
- Do not reply to business outbound messages.
- Always log sent/skipped/failed reply attempts.
```

---

## 8.2 `whatsapp-webhook-agent.md`

```md
---
name: whatsapp-webhook-agent
description: Use this agent to implement WhatsApp webhook verification, inbound message parsing, signature validation planning, deduplication, and raw payload storage.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Webhook Agent.

Responsibilities:
- Implement GET webhook verification endpoint.
- Implement POST webhook receiver.
- Parse Meta Cloud API inbound message payloads.
- Parse Twilio inbound webhook payloads if provider is Twilio.
- Store raw payload safely.
- Deduplicate by providerMessageId.
- Ignore status events for auto-reply.
- Add tests with fixture payloads.

Rules:
- Webhook route must not crash on unknown payloads.
- Invalid verification token must be rejected.
- Sensitive payloads must not be printed in production logs.
```

---

## 8.3 `whatsapp-policy-agent.md`

```md
---
name: whatsapp-policy-agent
description: Use this agent to encode WhatsApp messaging policy rules, 24-hour customer service window logic, opt-out checks, and template planning notes.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Policy Agent.

Responsibilities:
- Add 24-hour service window notes to docs.
- Add approved template planning for outside-window messaging.
- Add opt-out keyword handling.
- Add communication preference checks.
- Add human escalation text rules.
- Add docs/whatsapp-policy-notes.md.

Rules:
- Auto link reply is allowed only as response to inbound user message.
- Outside service window, use template messages only.
- Marketing consent must not be confused with appointment link response.
- User opt-out must be respected.
```

---

## 8.4 `whatsapp-dashboard-agent.md`

```md
---
name: whatsapp-dashboard-agent
description: Use this agent to implement dashboard UI for WhatsApp auto-reply settings, message preview, logs, and provider status.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Dashboard Agent.

Responsibilities:
- Add dashboard settings page.
- Add enable/disable switch.
- Add message template editor.
- Add cooldown setting.
- Add keyword trigger editor.
- Add preview panel.
- Add auto-reply logs table.
- Add Turkish UI copy.

Rules:
- UI must be Turkish.
- Settings changes must be tenant-scoped.
- Preview must not send real WhatsApp messages.
```

---

## 8.5 `whatsapp-provider-agent.md`

```md
---
name: whatsapp-provider-agent
description: Use this agent to implement WhatsApp provider abstraction, fake provider, Meta Cloud API provider, Twilio provider placeholder, and env configuration.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Provider Agent.

Responsibilities:
- Implement provider interface.
- Implement Fake provider for local tests.
- Implement Meta Cloud API provider using env variables.
- Add Twilio provider placeholder if Twilio is configured.
- Update .env.example.
- Add provider tests with mocks.

Rules:
- Do not hardcode tokens.
- Do not send real messages in tests.
- FAKE provider must be default in development.
- Provider failures must not crash webhook processing.
```

---

## 8.6 `whatsapp-qa-agent.md`

```md
---
name: whatsapp-qa-agent
description: Use this agent to test WhatsApp webhook, auto-reply, cooldown, opt-out, provider mocks, dashboard settings, and GitHub readiness.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp QA Agent.

Responsibilities:
- Run all test suites after every phase.
- Add webhook fixture tests.
- Add auto-reply service tests.
- Add cooldown tests.
- Add opt-out tests.
- Add provider mock tests.
- Add dashboard UI tests if possible.
- Produce QA report.

Required commands:
- npm run typecheck
- npm run lint
- npm test
- npm run build
- npx prisma validate
- npx prisma generate
- npx prisma migrate status
```

---

# 9. Phase Sırası

Bu güncelleme 6 phase olarak yapılacak.

```txt
Phase WA-0 — WhatsApp Auto-Link Baseline and Policy Notes
Phase WA-1 — Database Models and Provider Abstraction
Phase WA-2 — Webhook Receiver and Inbound Message Logging
Phase WA-3 — Auto Booking Link Reply Service
Phase WA-4 — Dashboard Settings and Logs UI
Phase WA-5 — Final QA, Merge, Push, and Release Notes
```

Compact kuralı:

```txt
WA-0 + WA-1 sonrası compact
WA-2 + WA-3 sonrası compact
WA-4 + WA-5 sonrası final compact summary
```

Her phase sonunda:

```txt
1. Test çalıştır.
2. Build al.
3. Prisma kontrol et.
4. Commit at.
5. Feature branch'i GitHub'a push et.
6. Merge etmeden önce CI/test geçmesini bekle.
```

---

# 10. Global Test Komutları

Her phase sonunda çalıştırılacak komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Eğer e2e test varsa:

```bash
npm run test:e2e
```

GitHub push:

```bash
git status
git add .
git commit -m "PHASE_COMMIT_MESSAGE"
git push origin CURRENT_BRANCH
```

Merge öncesi:

```txt
- CI yeşil olmalı.
- Build geçmeli.
- Testler geçmeli.
- Prisma migration status temiz olmalı.
- Manual QA notu yazılmalı.
```

---

# 11. Compact Protokolü

Her 2 phase sonunda `compact-maintainer-agent` çalıştırılacak.

Yapılacaklar:

1. `docs/COMPACT_STATE.md` güncelle.
2. Tamamlanan phase'leri yaz.
3. Değişen database modellerini yaz.
4. Yeni env değişkenlerini yaz.
5. Test sonuçlarını yaz.
6. Bilinen riskleri yaz.
7. Sonraki phase prompt'unu hazırla.
8. Claude Code destekliyorsa `/compact` çalıştırılması istenir.
9. Antigravity kullanılıyorsa context summary artifact oluşturulur.

Compact sonrası prompt:

```txt
Read docs/COMPACT_STATE.md and SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md.
Continue from the next unfinished WhatsApp auto-link phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

# 12. Phase Detayları

---

## Phase WA-0 — WhatsApp Auto-Link Baseline and Policy Notes

Kullanılacak agent:

```txt
whatsapp-policy-agent
whatsapp-qa-agent
```

Amaç:

Mevcut WhatsApp/reminder altyapısı ve Türkiye yerelleştirme durumu bozulmadan bu yeni modül için policy ve teknik temel hazırlanır.

Yapılacaklar:

1. Mevcut WhatsApp provider/reminder kodunu tara.
2. Mevcut KVKK/İYS consent yapısını kontrol et.
3. `docs/whatsapp-auto-link-policy.md` oluştur.
4. 24 saat customer service window kuralını yaz.
5. Template message dış pencere notunu yaz.
6. Opt-out kelimelerini belirle.
7. Otomatik cevap metni için Türkçe copy hazırla.
8. Feature branch oluştur.
9. Baseline testleri çalıştır.

Opt-out kelime önerileri:

```txt
iptal
istemiyorum
yazma
mesaj gönderme
durdur
stop
unsubscribe
```

Default auto-reply copy:

```txt
Merhaba 👋
Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Kabul kriteri:

```txt
- Davranış değişikliği yok.
- Policy dokümanı hazır.
- Baseline testler geçiyor.
- Feature branch GitHub'a push edildi.
```

Commit:

```bash
git checkout -b feature/whatsapp-auto-link
git add .
git commit -m "docs: add WhatsApp auto-link policy notes"
git push origin feature/whatsapp-auto-link
```

---

## Phase WA-1 — Database Models and Provider Abstraction

Kullanılacak agent:

```txt
whatsapp-provider-agent
whatsapp-auto-link-agent
whatsapp-qa-agent
```

Amaç:

Database modelleri ve provider abstraction hazırlanır. Gerçek mesaj gönderimi henüz aktif edilmez.

Yapılacaklar:

1. Prisma modellerini ekle:
   - WhatsAppAutoReplySettings
   - WhatsAppInboundMessage
   - WhatsAppAutoReplyLog
   - WhatsAppContactPreference
2. Enumları ekle:
   - WhatsAppProviderType
   - AutoReplyMode
   - AutoReplyStatus
3. Migration oluştur.
4. Seed içine demo organization için default settings ekle.
5. Provider interface oluştur.
6. Fake provider oluştur.
7. Meta provider skeleton oluştur.
8. Twilio provider placeholder oluştur.
9. `.env.example` güncelle.
10. Unit testleri yaz.

Yeni env değişkenleri:

```env
WHATSAPP_AUTO_REPLY_ENABLED=false
WHATSAPP_PROVIDER=FAKE
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
META_WHATSAPP_APP_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

Testler:

```txt
- Default settings created.
- Fake provider returns success.
- Provider selection works.
- Missing real provider env does not crash dev mode.
- Prisma schema validates.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Kabul kriteri:

```txt
- Migration çalışıyor.
- Provider abstraction hazır.
- Default provider FAKE.
- GitHub push yapıldı.
```

Commit:

```bash
git add .
git commit -m "feat: add WhatsApp auto-reply models and provider abstraction"
git push origin feature/whatsapp-auto-link
```

Compact:

```txt
WA-0 ve WA-1 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase WA-2 — Webhook Receiver and Inbound Message Logging

Kullanılacak agent:

```txt
whatsapp-webhook-agent
whatsapp-qa-agent
```

Amaç:

WhatsApp inbound webhook endpointleri hazırlanır ve gelen mesajlar güvenli şekilde loglanır. Auto reply henüz gönderilmeyebilir veya feature flag kapalı kalır.

Yapılacaklar:

1. `GET /api/webhooks/whatsapp` verification endpoint oluştur.
2. `POST /api/webhooks/whatsapp` receiver oluştur.
3. Meta Cloud API payload parser yaz.
4. Status eventlerini inbound user message'lardan ayır.
5. Provider message ID ile deduplication yap.
6. Raw payload saklama stratejisini güvenli yap.
7. Organization mapping stratejisini belirle:
   - phoneNumberId -> organization
   - toPhone -> organization
8. Inbound message DB kaydı oluştur.
9. Unknown payload için safe no-op davranışı ekle.
10. Fixture testleri yaz.

Test fixture türleri:

```txt
- Valid inbound text message
- Duplicate message ID
- Status event payload
- Unknown payload shape
- Invalid verification token
- Valid verification token
```

Testler:

```txt
- Verification token doğruysa challenge döner.
- Verification token yanlışsa 403 döner.
- Inbound text message kaydedilir.
- Duplicate message ikinci kez kaydedilmez.
- Status event auto-reply tetiklemez.
- Unknown payload 200 veya safe response ile handled edilir.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Commit:

```bash
git add .
git commit -m "feat: add WhatsApp webhook receiver and inbound logging"
git push origin feature/whatsapp-auto-link
```

---

## Phase WA-3 — Auto Booking Link Reply Service

Kullanılacak agent:

```txt
whatsapp-auto-link-agent
whatsapp-policy-agent
whatsapp-qa-agent
```

Amaç:

Gelen WhatsApp mesajından sonra otomatik booking link cevabı gönderilir.

Yapılacaklar:

1. `booking-link.service.ts` oluştur.
2. Organization slug üzerinden booking URL üret.
3. Multi-location varsa location-aware URL destekle.
4. Auto-reply service oluştur.
5. Cooldown kuralını ekle.
6. Keyword mode ekle.
7. Opt-out kontrolü ekle.
8. Contact preference update et.
9. Fake provider ile mesaj gönderimini bağla.
10. Sent/skipped/failed log oluştur.
11. Webhook receiver ile service'i bağla.
12. Testleri yaz.

Skip sebepleri:

```txt
AUTO_REPLY_DISABLED
DUPLICATE_MESSAGE
COOLDOWN_ACTIVE
OPTED_OUT
KEYWORD_NOT_MATCHED
BOOKING_DISABLED
NO_BOOKING_URL
PROVIDER_ERROR
```

Testler:

```txt
- Auto reply enabled ise inbound mesaj sonrası fake message sent olur.
- Auto reply disabled ise skipped olur.
- Cooldown aktifse ikinci mesaj skipped olur.
- Opt-out mesajı gelirse kullanıcı blocked/preference updated olur.
- Booking disabled ise link gönderilmez.
- Keyword mode keyword yoksa göndermez.
- Generated booking URL doğru slug içerir.
- Provider hata verirse FAILED log oluşur.
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
git commit -m "feat: send automatic WhatsApp booking link replies"
git push origin feature/whatsapp-auto-link
```

Compact:

```txt
WA-2 ve WA-3 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Claude Code destekliyorsa /compact çalıştır.
```

---

## Phase WA-4 — Dashboard Settings and Logs UI

Kullanılacak agent:

```txt
whatsapp-dashboard-agent
whatsapp-qa-agent
```

Amaç:

İşletme dashboard'dan WhatsApp otomatik link özelliğini yönetebilir.

Yeni sayfa önerisi:

```txt
/dashboard/whatsapp
```

Yapılacaklar:

1. WhatsApp settings sayfası oluştur.
2. Auto-reply aç/kapat switch ekle.
3. Message template editor ekle.
4. Cooldown seçimi ekle:
   - 1 saat
   - 6 saat
   - 24 saat
   - 7 gün
5. Reply mode seçimi ekle:
   - Her mesajda
   - Anahtar kelime varsa
   - Kapalı
6. Keyword editor ekle.
7. Booking link preview ekle.
8. Message preview ekle.
9. Auto reply logs table ekle.
10. Provider status card ekle.
11. Türkçe UI copy kullan.
12. Tests/e2e ekle.

Türkçe UI metinleri:

```txt
WhatsApp Otomatik Yanıt
Randevu linkini otomatik gönder
Mesaj şablonu
Tekrar gönderim aralığı
Anahtar kelimeler
Önizleme
Gönderim geçmişi
Sağlayıcı durumu
```

Testler:

```txt
- Owner settings sayfasını görebilir.
- Staff billing/admin yetkisi yoksa settings değiştiremez.
- Settings update tenant-scoped çalışır.
- Preview gerçek mesaj göndermez.
- Logs sadece current organization kayıtlarını gösterir.
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
git commit -m "feat: add WhatsApp auto-reply dashboard settings"
git push origin feature/whatsapp-auto-link
```

---

## Phase WA-5 — Final QA, Merge, Push, and Release Notes

Kullanılacak agent:

```txt
whatsapp-qa-agent
github-release-agent
compact-maintainer-agent
```

Amaç:

Özelliğin tamamı test edilir, merge öncesi güvenlik ve regression kontrolü yapılır, GitHub'a push edilir.

Yapılacaklar:

1. Full regression test çalıştır.
2. Webhook fixture testlerini çalıştır.
3. Dashboard e2e test çalıştır.
4. Fake provider ile local inbound simulation test et.
5. README güncelle.
6. `.env.example` kontrol et.
7. CHANGELOG güncelle.
8. `docs/whatsapp-auto-link.md` oluştur.
9. PR/Merge checklist oluştur.
10. Feature branch'i push et.
11. CI geçerse main'e merge et.
12. main branch push et.
13. Tag önerisi oluştur.

Final test komutları:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run test:e2e
```

Manual QA:

```txt
1. Dashboard'da WhatsApp auto-reply aç.
2. Mesaj şablonu düzenle.
3. Preview kontrol et.
4. Fake inbound endpoint ile müşteri mesajı simüle et.
5. Auto-reply log oluştuğunu kontrol et.
6. Aynı numaradan tekrar mesaj simüle et.
7. Cooldown nedeniyle skipped olduğunu kontrol et.
8. Opt-out mesajı simüle et.
9. Sonraki mesajda reply gönderilmediğini kontrol et.
10. Public booking linkinin doğru çalıştığını kontrol et.
```

Merge öncesi checklist:

```txt
[ ] Typecheck geçti
[ ] Lint geçti
[ ] Unit tests geçti
[ ] Build geçti
[ ] Prisma validate geçti
[ ] Migration status temiz
[ ] E2E geçti veya manuel QA raporu var
[ ] Gerçek secret commitlenmedi
[ ] Default provider FAKE
[ ] WhatsApp policy docs hazır
[ ] README güncellendi
[ ] CHANGELOG güncellendi
```

Commit:

```bash
git add .
git commit -m "docs: finalize WhatsApp auto-link release notes"
git push origin feature/whatsapp-auto-link
```

Merge:

```bash
git checkout main
git pull origin main
git merge feature/whatsapp-auto-link
npm run typecheck
npm run lint
npm test
npm run build
git push origin main
```

Tag önerisi:

```bash
git tag v1.2.0-whatsapp-auto-link
git push origin v1.2.0-whatsapp-auto-link
```

Final compact:

```txt
WA-4 ve WA-5 tamamlandıktan sonra compact-maintainer-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
Final summary oluştur.
```

---

# 13. Yeni Environment Variables

`.env.example` içine eklenecek alanlar:

```env
# WhatsApp Auto Link Reply
WHATSAPP_AUTO_REPLY_ENABLED=false
WHATSAPP_PROVIDER=FAKE
WHATSAPP_DEFAULT_COOLDOWN_HOURS=24

# Meta WhatsApp Cloud API
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
META_WHATSAPP_APP_SECRET=

# Twilio WhatsApp Optional Provider
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# Public URL
NEXT_PUBLIC_BOOKING_BASE_URL=http://localhost:3000/randevu
```

---

# 14. Türkçe Mesaj Şablonları

## 14.1 Default Auto Reply

```txt
Merhaba 👋
Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

## 14.2 Kısa Versiyon

```txt
Merhaba, randevu almak için linkimiz: {{bookingUrl}}
```

## 14.3 Kapalı Saat Mesajı

```txt
Merhaba 👋
Şu anda hızlıca dönüş yapamayabiliriz. Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}
```

## 14.4 Anahtar Kelime Yanıtı

```txt
Randevu ve uygun saatler için linkimiz:
{{bookingUrl}}
```

## 14.5 Opt-out Sonrası İç Not

Bu mesaj müşteriye gönderilmez, sistem logu olarak tutulur:

```txt
Müşteri WhatsApp otomatik mesajlarını almak istemediğini belirtti. Auto-reply devre dışı bırakıldı.
```

---

# 15. Güvenlik ve Uyumluluk Kuralları

```txt
- Webhook verify token env değişkeninden okunmalı.
- Meta app secret varsa signature validation planlanmalı.
- Raw payload production loglarına açık yazılmamalı.
- Customer phone tenant-scoped tutulmalı.
- Başka organization'ın WhatsApp mesajları görünmemeli.
- Marketing mesajı bu auto-reply modülüyle karıştırılmamalı.
- Opt-out mesajları saygıyla işlenmeli.
- Gerçek WhatsApp tokenları commitlenmemeli.
- Testlerde gerçek mesaj gönderilmemeli.
```

---

# 16. GitHub Push Politikası

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful message"
git push origin feature/whatsapp-auto-link
```

Main merge sadece şu şartlarda yapılır:

```txt
- Typecheck geçti.
- Lint geçti.
- Unit tests geçti.
- Build geçti.
- Prisma validation geçti.
- Migration status temiz.
- WhatsApp fake provider testleri geçti.
- Webhook fixture testleri geçti.
- Secret scan manuel kontrol edildi.
```

Force push yasaktır:

```txt
git push --force kullanılmayacak.
```

---

# 17. Claude Code Ana Prompt'u

```txt
Read SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md carefully.

This update adds WhatsApp automatic booking link replies to SlotPilot.
Do not implement all phases at once.

Start with Phase WA-0 only:
- Create missing WhatsApp auto-link agents.
- Add policy docs.
- Run baseline tests.
- Create feature/whatsapp-auto-link branch.
- Commit and push only if tests pass.

Important:
- Default provider must be FAKE.
- Do not send real WhatsApp messages in tests.
- Do not commit secrets.
- Customer-facing language must be Turkish.
- Respect cooldown and opt-out rules.
- After every 2 phases update docs/COMPACT_STATE.md and run or request /compact.
```

---

# 18. Antigravity Ana Prompt'u

```txt
Read SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md.

Create the WhatsApp auto-link agents first.
Then start Phase WA-0 only.

Use browser automation to verify the current SlotPilot flow before changing behavior:
1. Owner login.
2. Open dashboard.
3. Open public booking link.
4. Create test appointment.
5. Confirm dashboard still works.

Do not start WA-1 until WA-0 tests pass.
Commit and push only if tests pass.
```

---

# 19. Final Definition of Done

Bu güncelleme bitmiş sayılması için:

```txt
- WhatsApp webhook verification endpoint çalışıyor.
- Inbound WhatsApp mesajları loglanıyor.
- Duplicate webhook eventleri tekrar işlenmiyor.
- Auto-reply settings tenant-scoped çalışıyor.
- Fake provider ile otomatik booking link mesajı gönderiliyor.
- Meta Cloud API provider env ile hazırlanmış durumda.
- Cooldown kuralı çalışıyor.
- Opt-out kuralı çalışıyor.
- Keyword mode çalışıyor.
- Booking URL doğru üretiliyor.
- Dashboard settings Türkçe.
- Auto-reply logs dashboard'da görünüyor.
- Testler geçiyor.
- Build geçiyor.
- README/CHANGELOG/docs güncel.
- GitHub feature branch push edildi.
- Merge öncesi testler geçti.
- Main branch'e merge ve push yapıldı.
- docs/COMPACT_STATE.md güncel.
```

---

# 20. Final Kontrol Prompt'u

```txt
Review the WhatsApp auto-link update for SlotPilot.

Check:
1. Does webhook verification work?
2. Are inbound messages logged safely?
3. Are duplicate message IDs ignored?
4. Does auto-reply send booking link only when allowed?
5. Does cooldown prevent spam?
6. Does opt-out stop future replies?
7. Is default provider FAKE?
8. Are real secrets avoided?
9. Is dashboard UI Turkish?
10. Are logs tenant-scoped?
11. Do all tests pass?
12. Does build pass?
13. Was the feature branch pushed?
14. Was main merge tested before push?
15. Is docs/COMPACT_STATE.md updated?

Fix small issues only. Do not add new major features.
Create final release notes.
```
