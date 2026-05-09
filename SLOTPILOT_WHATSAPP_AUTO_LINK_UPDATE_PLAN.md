# Randevo WhatsApp Otomatik Link GÃ¶nderme GÃ¼ncelleme PlanÄ±

> Bu dosya Randevo TÃ¼rkiye sÃ¼rÃ¼mÃ¼ne eklenecek WhatsApp otomasyon modÃ¼lÃ¼ iÃ§in hazÄ±rlanmÄ±ÅŸtÄ±r.  
> AmaÃ§: MÃ¼ÅŸteri iÅŸletmeye WhatsApp Ã¼zerinden yazdÄ±ÄŸÄ±nda, sistemin otomatik olarak iÅŸletmenin Randevo randevu/website linkini gÃ¶ndermesi.  
> Bu gÃ¼ncelleme mevcut SMS/WhatsApp reminder altyapÄ±sÄ±ndan farklÄ±dÄ±r; burada kullanÄ±cÄ± mesajÄ± geldiÄŸinde inbound webhook tetiklenir ve otomatik cevap verilir.

---

## 1. Ã–zellik Ã–zeti

Yeni Ã¶zellik adÄ±:

```txt
WhatsApp Auto Booking Link Reply
```

KullanÄ±cÄ± senaryosu:

```txt
1. MÃ¼ÅŸteri iÅŸletmenin WhatsApp numarasÄ±na mesaj yazar.
2. WhatsApp Business Platform inbound webhook'u Randevo backend'e mesajÄ± iletir.
3. Randevo mesajÄ± kaydeder.
4. Ä°ÅŸletmenin auto-reply ayarlarÄ± kontrol edilir.
5. Uygunsa mÃ¼ÅŸteriye otomatik TÃ¼rkÃ§e cevap gÃ¶nderilir.
6. CevabÄ±n iÃ§inde iÅŸletmenin public booking linki bulunur.
7. Ä°ÅŸletme dashboard'da gelen mesaj ve gÃ¶nderilen otomatik cevabÄ± gÃ¶rebilir.
```

Ã–rnek otomatik cevap:

```txt
Merhaba ğŸ‘‹
Randevu almak iÃ§in linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seÃ§ebilir, uygun saatleri gÃ¶rebilir ve randevunuzu oluÅŸturabilirsiniz.
Ä°nsan desteÄŸi iÃ§in bu mesaja yazmaya devam edebilirsiniz.
```

---

## 2. Teknik GerÃ§ekler ve Politika NotlarÄ±

Bu Ã¶zellik iki farklÄ± WhatsApp kullanÄ±m ÅŸeklini ayÄ±rmalÄ±dÄ±r:

### 2.1 WhatsApp Business App

KÃ¼Ã§Ã¼k iÅŸletmelerin telefonda kullandÄ±ÄŸÄ± klasik WhatsApp Business uygulamasÄ±dÄ±r.

Bu uygulamada:

```txt
- Greeting message / away message gibi basit otomasyonlar vardÄ±r.
- Randevo backend'e doÄŸrudan inbound webhook baÄŸlanamaz.
- Bizim sistemin otomatik link gÃ¶nderebilmesi iÃ§in WhatsApp Business Platform / Cloud API veya Twilio gibi provider gerekir.
```

### 2.2 WhatsApp Business Platform / Cloud API

Randevo'in backend Ã¼zerinden mesaj alÄ±p gÃ¶nderebilmesi iÃ§in kullanÄ±lacak asÄ±l yÃ¶ntemdir.

Bu yapÄ±da:

```txt
- Meta App ve WhatsApp Business Account gerekir.
- Business phone number baÄŸlanÄ±r.
- Webhook verification endpoint gerekir.
- Inbound messages webhook ile alÄ±nÄ±r.
- Messages API ile cevap gÃ¶nderilir.
- Testlerde gerÃ§ek mesaj gÃ¶nderilmez; fake provider kullanÄ±lÄ±r.
```

### 2.3 24 Saat KuralÄ±

KullanÄ±cÄ± iÅŸletmeye mesaj attÄ±ÄŸÄ±nda 24 saatlik customer service window oluÅŸur. Bu pencere iÃ§inde iÅŸletme serbest metinle cevap verebilir. Pencere dÄ±ÅŸÄ±nda mesaj gÃ¶nderilecekse approved message template gerekir.

Bu Ã¶zellik inbound mesaja cevap verdiÄŸi iÃ§in temel akÄ±ÅŸta 24 saatlik pencere iÃ§inde Ã§alÄ±ÅŸmalÄ±dÄ±r.

### 2.4 Opt-in ve Ä°zin

Randevo bu modÃ¼lde spam yapmamalÄ±dÄ±r.

Kurallar:

```txt
- Otomatik cevap sadece mÃ¼ÅŸteri iÅŸletmeye mesaj attÄ±ktan sonra tetiklenir.
- Toplu reklam mesajÄ± gÃ¶nderilmez.
- Kampanya/marketing mesajÄ± ile randevu linki otomatik cevabÄ± ayrÄ±lÄ±r.
- KullanÄ±cÄ± Ã§Ä±kmak/istemiyorum/yazma gibi mesaj yazarsa auto-reply durdurulabilir.
- MÃ¼ÅŸteriye insan desteÄŸine ulaÅŸma yolu sunulur.
```

---

## 3. Ä°ÅŸ KurallarÄ±

### 3.1 Auto Reply AÃ§/Kapat

Her iÅŸletme bu Ã¶zelliÄŸi dashboard'dan aÃ§Ä±p kapatabilmeli.

```txt
WhatsApp otomatik cevap: AÃ§Ä±k / KapalÄ±
```

### 3.2 Mesaj TekrarÄ±nÄ± Ã–nleme

AynÄ± kiÅŸiye her mesajÄ±nda link atmak rahatsÄ±z edici olabilir.

VarsayÄ±lan kural:

```txt
AynÄ± WhatsApp numarasÄ±na 24 saat iÃ§inde en fazla 1 otomatik booking link cevabÄ± gÃ¶nder.
```

Opsiyonel ayarlar:

```txt
- Her yeni konuÅŸmada gÃ¶nder
- 24 saatte bir gÃ¶nder
- 7 gÃ¼nde bir gÃ¶nder
- Sadece belirli anahtar kelimeler gelirse gÃ¶nder
```

### 3.3 Anahtar Kelime Modu

Ä°ÅŸletme isterse otomatik cevap sadece bazÄ± kelimelerde Ã§alÄ±ÅŸÄ±r.

Ã–rnek tetikleyiciler:

```txt
randevu
randavu
fiyat
Ã¼cret
boÅŸ saat
mÃ¼saitlik
adres
link
```

MVP varsayÄ±lanÄ±:

```txt
Her inbound mesajda, rate limit uygunsa booking link gÃ¶nder.
```

Sonraki geliÅŸtirme:

```txt
Keyword-based mode eklenebilir.
```

### 3.4 Ä°nsan DesteÄŸi MesajÄ±

Otomatik cevapta her zaman insan desteÄŸi seÃ§eneÄŸi belirtilmeli.

Ã–rnek:

```txt
Ä°nsan desteÄŸi iÃ§in bu mesaja yazmaya devam edebilirsiniz.
```

### 3.5 Mesaj DÃ¶ngÃ¼sÃ¼nÃ¼ Engelleme

Sistem baÅŸka botlarÄ±n veya kendi gÃ¶nderdiÄŸi mesajlarÄ±n tekrar webhook'a dÃ¼ÅŸmesiyle loop oluÅŸturmamalÄ±.

Kurallar:

```txt
- Sadece inbound user messages iÅŸlenir.
- Status webhook eventleri auto-reply tetiklemez.
- Business outbound messages auto-reply tetiklemez.
- AynÄ± WhatsApp messageId ikinci kez gelirse ignore edilir.
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

`replyMode` seÃ§enekleri:

```txt
ALWAYS
KEYWORD_ONLY
DISABLED
```

`provider` seÃ§enekleri:

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

Status seÃ§enekleri:

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
Bu tablo KVKK/Ä°YS consent sistemiyle uyumlu Ã§alÄ±ÅŸmalÄ±.
```

---

## 5. Yeni API Route TaslaÄŸÄ±

### 5.1 Webhook Verification

```txt
GET /api/webhooks/whatsapp
```

GÃ¶rev:

```txt
Meta webhook verification challenge cevaplanÄ±r.
```

### 5.2 Inbound Message Webhook

```txt
POST /api/webhooks/whatsapp
```

GÃ¶rev:

```txt
Inbound mesajlarÄ± ve status eventlerini alÄ±r.
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

GÃ¶rev:

```txt
GerÃ§ek WhatsApp mesajÄ± gÃ¶ndermeden iÅŸletmeye mesaj Ã¶nizlemesi gÃ¶sterir.
```

### 5.6 Fake Provider Test Endpoint

```txt
POST /api/dev/fake-whatsapp/inbound
```

Sadece development ortamÄ±nda Ã§alÄ±ÅŸÄ±r.

GÃ¶rev:

```txt
GerÃ§ek WhatsApp webhook gelmeden local test iÃ§in inbound message simÃ¼le eder.
```

---

## 6. Yeni Service DosyalarÄ±

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
- Inbound mesajÄ± analiz eder.
- Auto-reply aÃ§Ä±k mÄ± kontrol eder.
- Cooldown/rate limit uygular.
- Keyword mode kontrol eder.
- Booking URL oluÅŸturur.
- Provider ile mesaj gÃ¶nderir.
- Log kaydÄ± oluÅŸturur.
```

### 6.2 whatsapp-provider.service.ts

Provider interface:

```ts
interface WhatsAppProvider {
  sendTextMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult>;
}
```

Provider implementasyonlarÄ±:

```txt
FakeWhatsAppProvider
MetaCloudWhatsAppProvider
TwilioWhatsAppProvider
```

### 6.3 booking-link.service.ts

GÃ¶rev:

```txt
organization slug veya location slug Ã¼zerinden doÄŸru public booking linki Ã¼retir.
```

Ã–rnek:

```txt
https://randevo.com/randevu/ekin-guzellik
https://randevo.com/randevu/halil-berber/kadikoy
```

---

## 7. Yeni Agent Listesi

`.claude/agents/` iÃ§ine ÅŸu agent dosyalarÄ± eklenecek:

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

# 8. Agent TanÄ±mlarÄ±

## 8.1 `whatsapp-auto-link-agent.md`

```md
---
name: whatsapp-auto-link-agent
description: Use this agent to implement automatic booking link replies when customers message a business on WhatsApp.
tools: Read, Write, Edit, Bash
---

You are the WhatsApp Auto Link Agent for Randevo.

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

# 9. Phase SÄ±rasÄ±

Bu gÃ¼ncelleme 6 phase olarak yapÄ±lacak.

```txt
Phase WA-0 â€” WhatsApp Auto-Link Baseline and Policy Notes
Phase WA-1 â€” Database Models and Provider Abstraction
Phase WA-2 â€” Webhook Receiver and Inbound Message Logging
Phase WA-3 â€” Auto Booking Link Reply Service
Phase WA-4 â€” Dashboard Settings and Logs UI
Phase WA-5 â€” Final QA, Merge, Push, and Release Notes
```

Compact kuralÄ±:

```txt
WA-0 + WA-1 sonrasÄ± compact
WA-2 + WA-3 sonrasÄ± compact
WA-4 + WA-5 sonrasÄ± final compact summary
```

Her phase sonunda:

```txt
1. Test Ã§alÄ±ÅŸtÄ±r.
2. Build al.
3. Prisma kontrol et.
4. Commit at.
5. Feature branch'i GitHub'a push et.
6. Merge etmeden Ã¶nce CI/test geÃ§mesini bekle.
```

---

# 10. Global Test KomutlarÄ±

Her phase sonunda Ã§alÄ±ÅŸtÄ±rÄ±lacak komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

EÄŸer e2e test varsa:

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

Merge Ã¶ncesi:

```txt
- CI yeÅŸil olmalÄ±.
- Build geÃ§meli.
- Testler geÃ§meli.
- Prisma migration status temiz olmalÄ±.
- Manual QA notu yazÄ±lmalÄ±.
```

---

# 11. Compact ProtokolÃ¼

Her 2 phase sonunda `compact-maintainer-agent` Ã§alÄ±ÅŸtÄ±rÄ±lacak.

YapÄ±lacaklar:

1. `docs/COMPACT_STATE.md` gÃ¼ncelle.
2. Tamamlanan phase'leri yaz.
3. DeÄŸiÅŸen database modellerini yaz.
4. Yeni env deÄŸiÅŸkenlerini yaz.
5. Test sonuÃ§larÄ±nÄ± yaz.
6. Bilinen riskleri yaz.
7. Sonraki phase prompt'unu hazÄ±rla.
8. Claude Code destekliyorsa `/compact` Ã§alÄ±ÅŸtÄ±rÄ±lmasÄ± istenir.
9. Antigravity kullanÄ±lÄ±yorsa context summary artifact oluÅŸturulur.

Compact sonrasÄ± prompt:

```txt
Read docs/COMPACT_STATE.md and RANDEVO_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md.
Continue from the next unfinished WhatsApp auto-link phase only.
Do not re-implement completed phases.
Run tests before commit and push.
```

---

# 12. Phase DetaylarÄ±

---

## Phase WA-0 â€” WhatsApp Auto-Link Baseline and Policy Notes

KullanÄ±lacak agent:

```txt
whatsapp-policy-agent
whatsapp-qa-agent
```

AmaÃ§:

Mevcut WhatsApp/reminder altyapÄ±sÄ± ve TÃ¼rkiye yerelleÅŸtirme durumu bozulmadan bu yeni modÃ¼l iÃ§in policy ve teknik temel hazÄ±rlanÄ±r.

YapÄ±lacaklar:

1. Mevcut WhatsApp provider/reminder kodunu tara.
2. Mevcut KVKK/Ä°YS consent yapÄ±sÄ±nÄ± kontrol et.
3. `docs/whatsapp-auto-link-policy.md` oluÅŸtur.
4. 24 saat customer service window kuralÄ±nÄ± yaz.
5. Template message dÄ±ÅŸ pencere notunu yaz.
6. Opt-out kelimelerini belirle.
7. Otomatik cevap metni iÃ§in TÃ¼rkÃ§e copy hazÄ±rla.
8. Feature branch oluÅŸtur.
9. Baseline testleri Ã§alÄ±ÅŸtÄ±r.

Opt-out kelime Ã¶nerileri:

```txt
iptal
istemiyorum
yazma
mesaj gÃ¶nderme
durdur
stop
unsubscribe
```

Default auto-reply copy:

```txt
Merhaba ğŸ‘‹
Randevu almak iÃ§in linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seÃ§ebilir, uygun saatleri gÃ¶rebilir ve randevunuzu oluÅŸturabilirsiniz.
Ä°nsan desteÄŸi iÃ§in bu mesaja yazmaya devam edebilirsiniz.
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
- DavranÄ±ÅŸ deÄŸiÅŸikliÄŸi yok.
- Policy dokÃ¼manÄ± hazÄ±r.
- Baseline testler geÃ§iyor.
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

## Phase WA-1 â€” Database Models and Provider Abstraction

KullanÄ±lacak agent:

```txt
whatsapp-provider-agent
whatsapp-auto-link-agent
whatsapp-qa-agent
```

AmaÃ§:

Database modelleri ve provider abstraction hazÄ±rlanÄ±r. GerÃ§ek mesaj gÃ¶nderimi henÃ¼z aktif edilmez.

YapÄ±lacaklar:

1. Prisma modellerini ekle:
   - WhatsAppAutoReplySettings
   - WhatsAppInboundMessage
   - WhatsAppAutoReplyLog
   - WhatsAppContactPreference
2. EnumlarÄ± ekle:
   - WhatsAppProviderType
   - AutoReplyMode
   - AutoReplyStatus
3. Migration oluÅŸtur.
4. Seed iÃ§ine demo organization iÃ§in default settings ekle.
5. Provider interface oluÅŸtur.
6. Fake provider oluÅŸtur.
7. Meta provider skeleton oluÅŸtur.
8. Twilio provider placeholder oluÅŸtur.
9. `.env.example` gÃ¼ncelle.
10. Unit testleri yaz.

Yeni env deÄŸiÅŸkenleri:

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
- Migration Ã§alÄ±ÅŸÄ±yor.
- Provider abstraction hazÄ±r.
- Default provider FAKE.
- GitHub push yapÄ±ldÄ±.
```

Commit:

```bash
git add .
git commit -m "feat: add WhatsApp auto-reply models and provider abstraction"
git push origin feature/whatsapp-auto-link
```

Compact:

```txt
WA-0 ve WA-1 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase WA-2 â€” Webhook Receiver and Inbound Message Logging

KullanÄ±lacak agent:

```txt
whatsapp-webhook-agent
whatsapp-qa-agent
```

AmaÃ§:

WhatsApp inbound webhook endpointleri hazÄ±rlanÄ±r ve gelen mesajlar gÃ¼venli ÅŸekilde loglanÄ±r. Auto reply henÃ¼z gÃ¶nderilmeyebilir veya feature flag kapalÄ± kalÄ±r.

YapÄ±lacaklar:

1. `GET /api/webhooks/whatsapp` verification endpoint oluÅŸtur.
2. `POST /api/webhooks/whatsapp` receiver oluÅŸtur.
3. Meta Cloud API payload parser yaz.
4. Status eventlerini inbound user message'lardan ayÄ±r.
5. Provider message ID ile deduplication yap.
6. Raw payload saklama stratejisini gÃ¼venli yap.
7. Organization mapping stratejisini belirle:
   - phoneNumberId -> organization
   - toPhone -> organization
8. Inbound message DB kaydÄ± oluÅŸtur.
9. Unknown payload iÃ§in safe no-op davranÄ±ÅŸÄ± ekle.
10. Fixture testleri yaz.

Test fixture tÃ¼rleri:

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
- Verification token doÄŸruysa challenge dÃ¶ner.
- Verification token yanlÄ±ÅŸsa 403 dÃ¶ner.
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

## Phase WA-3 â€” Auto Booking Link Reply Service

KullanÄ±lacak agent:

```txt
whatsapp-auto-link-agent
whatsapp-policy-agent
whatsapp-qa-agent
```

AmaÃ§:

Gelen WhatsApp mesajÄ±ndan sonra otomatik booking link cevabÄ± gÃ¶nderilir.

YapÄ±lacaklar:

1. `booking-link.service.ts` oluÅŸtur.
2. Organization slug Ã¼zerinden booking URL Ã¼ret.
3. Multi-location varsa location-aware URL destekle.
4. Auto-reply service oluÅŸtur.
5. Cooldown kuralÄ±nÄ± ekle.
6. Keyword mode ekle.
7. Opt-out kontrolÃ¼ ekle.
8. Contact preference update et.
9. Fake provider ile mesaj gÃ¶nderimini baÄŸla.
10. Sent/skipped/failed log oluÅŸtur.
11. Webhook receiver ile service'i baÄŸla.
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
- Auto reply enabled ise inbound mesaj sonrasÄ± fake message sent olur.
- Auto reply disabled ise skipped olur.
- Cooldown aktifse ikinci mesaj skipped olur.
- Opt-out mesajÄ± gelirse kullanÄ±cÄ± blocked/preference updated olur.
- Booking disabled ise link gÃ¶nderilmez.
- Keyword mode keyword yoksa gÃ¶ndermez.
- Generated booking URL doÄŸru slug iÃ§erir.
- Provider hata verirse FAILED log oluÅŸur.
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
WA-2 ve WA-3 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Claude Code destekliyorsa /compact Ã§alÄ±ÅŸtÄ±r.
```

---

## Phase WA-4 â€” Dashboard Settings and Logs UI

KullanÄ±lacak agent:

```txt
whatsapp-dashboard-agent
whatsapp-qa-agent
```

AmaÃ§:

Ä°ÅŸletme dashboard'dan WhatsApp otomatik link Ã¶zelliÄŸini yÃ¶netebilir.

Yeni sayfa Ã¶nerisi:

```txt
/dashboard/whatsapp
```

YapÄ±lacaklar:

1. WhatsApp settings sayfasÄ± oluÅŸtur.
2. Auto-reply aÃ§/kapat switch ekle.
3. Message template editor ekle.
4. Cooldown seÃ§imi ekle:
   - 1 saat
   - 6 saat
   - 24 saat
   - 7 gÃ¼n
5. Reply mode seÃ§imi ekle:
   - Her mesajda
   - Anahtar kelime varsa
   - KapalÄ±
6. Keyword editor ekle.
7. Booking link preview ekle.
8. Message preview ekle.
9. Auto reply logs table ekle.
10. Provider status card ekle.
11. TÃ¼rkÃ§e UI copy kullan.
12. Tests/e2e ekle.

TÃ¼rkÃ§e UI metinleri:

```txt
WhatsApp Otomatik YanÄ±t
Randevu linkini otomatik gÃ¶nder
Mesaj ÅŸablonu
Tekrar gÃ¶nderim aralÄ±ÄŸÄ±
Anahtar kelimeler
Ã–nizleme
GÃ¶nderim geÃ§miÅŸi
SaÄŸlayÄ±cÄ± durumu
```

Testler:

```txt
- Owner settings sayfasÄ±nÄ± gÃ¶rebilir.
- Staff billing/admin yetkisi yoksa settings deÄŸiÅŸtiremez.
- Settings update tenant-scoped Ã§alÄ±ÅŸÄ±r.
- Preview gerÃ§ek mesaj gÃ¶ndermez.
- Logs sadece current organization kayÄ±tlarÄ±nÄ± gÃ¶sterir.
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

## Phase WA-5 â€” Final QA, Merge, Push, and Release Notes

KullanÄ±lacak agent:

```txt
whatsapp-qa-agent
github-release-agent
compact-maintainer-agent
```

AmaÃ§:

Ã–zelliÄŸin tamamÄ± test edilir, merge Ã¶ncesi gÃ¼venlik ve regression kontrolÃ¼ yapÄ±lÄ±r, GitHub'a push edilir.

YapÄ±lacaklar:

1. Full regression test Ã§alÄ±ÅŸtÄ±r.
2. Webhook fixture testlerini Ã§alÄ±ÅŸtÄ±r.
3. Dashboard e2e test Ã§alÄ±ÅŸtÄ±r.
4. Fake provider ile local inbound simulation test et.
5. README gÃ¼ncelle.
6. `.env.example` kontrol et.
7. CHANGELOG gÃ¼ncelle.
8. `docs/whatsapp-auto-link.md` oluÅŸtur.
9. PR/Merge checklist oluÅŸtur.
10. Feature branch'i push et.
11. CI geÃ§erse main'e merge et.
12. main branch push et.
13. Tag Ã¶nerisi oluÅŸtur.

Final test komutlarÄ±:

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
1. Dashboard'da WhatsApp auto-reply aÃ§.
2. Mesaj ÅŸablonu dÃ¼zenle.
3. Preview kontrol et.
4. Fake inbound endpoint ile mÃ¼ÅŸteri mesajÄ± simÃ¼le et.
5. Auto-reply log oluÅŸtuÄŸunu kontrol et.
6. AynÄ± numaradan tekrar mesaj simÃ¼le et.
7. Cooldown nedeniyle skipped olduÄŸunu kontrol et.
8. Opt-out mesajÄ± simÃ¼le et.
9. Sonraki mesajda reply gÃ¶nderilmediÄŸini kontrol et.
10. Public booking linkinin doÄŸru Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ± kontrol et.
```

Merge Ã¶ncesi checklist:

```txt
[ ] Typecheck geÃ§ti
[ ] Lint geÃ§ti
[ ] Unit tests geÃ§ti
[ ] Build geÃ§ti
[ ] Prisma validate geÃ§ti
[ ] Migration status temiz
[ ] E2E geÃ§ti veya manuel QA raporu var
[ ] GerÃ§ek secret commitlenmedi
[ ] Default provider FAKE
[ ] WhatsApp policy docs hazÄ±r
[ ] README gÃ¼ncellendi
[ ] CHANGELOG gÃ¼ncellendi
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

Tag Ã¶nerisi:

```bash
git tag v1.2.0-whatsapp-auto-link
git push origin v1.2.0-whatsapp-auto-link
```

Final compact:

```txt
WA-4 ve WA-5 tamamlandÄ±ktan sonra compact-maintainer-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
Final summary oluÅŸtur.
```

---

# 13. Yeni Environment Variables

`.env.example` iÃ§ine eklenecek alanlar:

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

# 14. TÃ¼rkÃ§e Mesaj ÅablonlarÄ±

## 14.1 Default Auto Reply

```txt
Merhaba ğŸ‘‹
Randevu almak iÃ§in linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seÃ§ebilir, uygun saatleri gÃ¶rebilir ve randevunuzu oluÅŸturabilirsiniz.
Ä°nsan desteÄŸi iÃ§in bu mesaja yazmaya devam edebilirsiniz.
```

## 14.2 KÄ±sa Versiyon

```txt
Merhaba, randevu almak iÃ§in linkimiz: {{bookingUrl}}
```

## 14.3 KapalÄ± Saat MesajÄ±

```txt
Merhaba ğŸ‘‹
Åu anda hÄ±zlÄ±ca dÃ¶nÃ¼ÅŸ yapamayabiliriz. Randevu almak iÃ§in linkimizi kullanabilirsiniz:
{{bookingUrl}}
```

## 14.4 Anahtar Kelime YanÄ±tÄ±

```txt
Randevu ve uygun saatler iÃ§in linkimiz:
{{bookingUrl}}
```

## 14.5 Opt-out SonrasÄ± Ä°Ã§ Not

Bu mesaj mÃ¼ÅŸteriye gÃ¶nderilmez, sistem logu olarak tutulur:

```txt
MÃ¼ÅŸteri WhatsApp otomatik mesajlarÄ±nÄ± almak istemediÄŸini belirtti. Auto-reply devre dÄ±ÅŸÄ± bÄ±rakÄ±ldÄ±.
```

---

# 15. GÃ¼venlik ve Uyumluluk KurallarÄ±

```txt
- Webhook verify token env deÄŸiÅŸkeninden okunmalÄ±.
- Meta app secret varsa signature validation planlanmalÄ±.
- Raw payload production loglarÄ±na aÃ§Ä±k yazÄ±lmamalÄ±.
- Customer phone tenant-scoped tutulmalÄ±.
- BaÅŸka organization'Ä±n WhatsApp mesajlarÄ± gÃ¶rÃ¼nmemeli.
- Marketing mesajÄ± bu auto-reply modÃ¼lÃ¼yle karÄ±ÅŸtÄ±rÄ±lmamalÄ±.
- Opt-out mesajlarÄ± saygÄ±yla iÅŸlenmeli.
- GerÃ§ek WhatsApp tokenlarÄ± commitlenmemeli.
- Testlerde gerÃ§ek mesaj gÃ¶nderilmemeli.
```

---

# 16. GitHub Push PolitikasÄ±

Her phase sonunda:

```bash
git status
git add .
git commit -m "meaningful message"
git push origin feature/whatsapp-auto-link
```

Main merge sadece ÅŸu ÅŸartlarda yapÄ±lÄ±r:

```txt
- Typecheck geÃ§ti.
- Lint geÃ§ti.
- Unit tests geÃ§ti.
- Build geÃ§ti.
- Prisma validation geÃ§ti.
- Migration status temiz.
- WhatsApp fake provider testleri geÃ§ti.
- Webhook fixture testleri geÃ§ti.
- Secret scan manuel kontrol edildi.
```

Force push yasaktÄ±r:

```txt
git push --force kullanÄ±lmayacak.
```

---

# 17. Claude Code Ana Prompt'u

```txt
Read RANDEVO_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md carefully.

This update adds WhatsApp automatic booking link replies to Randevo.
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
Read RANDEVO_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md.

Create the WhatsApp auto-link agents first.
Then start Phase WA-0 only.

Use browser automation to verify the current Randevo flow before changing behavior:
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

Bu gÃ¼ncelleme bitmiÅŸ sayÄ±lmasÄ± iÃ§in:

```txt
- WhatsApp webhook verification endpoint Ã§alÄ±ÅŸÄ±yor.
- Inbound WhatsApp mesajlarÄ± loglanÄ±yor.
- Duplicate webhook eventleri tekrar iÅŸlenmiyor.
- Auto-reply settings tenant-scoped Ã§alÄ±ÅŸÄ±yor.
- Fake provider ile otomatik booking link mesajÄ± gÃ¶nderiliyor.
- Meta Cloud API provider env ile hazÄ±rlanmÄ±ÅŸ durumda.
- Cooldown kuralÄ± Ã§alÄ±ÅŸÄ±yor.
- Opt-out kuralÄ± Ã§alÄ±ÅŸÄ±yor.
- Keyword mode Ã§alÄ±ÅŸÄ±yor.
- Booking URL doÄŸru Ã¼retiliyor.
- Dashboard settings TÃ¼rkÃ§e.
- Auto-reply logs dashboard'da gÃ¶rÃ¼nÃ¼yor.
- Testler geÃ§iyor.
- Build geÃ§iyor.
- README/CHANGELOG/docs gÃ¼ncel.
- GitHub feature branch push edildi.
- Merge Ã¶ncesi testler geÃ§ti.
- Main branch'e merge ve push yapÄ±ldÄ±.
- docs/COMPACT_STATE.md gÃ¼ncel.
```

---

# 20. Final Kontrol Prompt'u

```txt
Review the WhatsApp auto-link update for Randevo.

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

