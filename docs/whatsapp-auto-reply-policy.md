# WhatsApp Otomatik Yanıt — Politika Notları

> Bu doküman SlotPilot'un WhatsApp Auto Booking Link Reply modülü için geçerlidir.
> Son güncelleme: 2026-05-09

---

## 1. Özellik Tanımı

**WhatsApp Auto Booking Link Reply** modülü, bir müşteri işletmenin WhatsApp Business numarasına mesaj yazdığında sistematik ve otomatik bir şekilde işletmenin public randevu linkini içeren Türkçe bir yanıt gönderir.

Bu özellik:
- Toplu mesaj göndermez (spam değildir)
- Sadece inbound mesaja yanıt verir
- Her zaman insan desteği seçeneği sunar

---

## 2. Teknik Altyapı Gereksinimleri

Bu özelliğin çalışması için **WhatsApp Business Platform (Cloud API)** gereklidir.

### 2.1 WhatsApp Business App (Telefon uygulaması) — Desteklenmez

Klasik WhatsApp Business telefon uygulaması aşağıdaki kısıtlamalara sahiptir:
- Backend webhook bağlantısı yapılamaz
- SlotPilot sistemi inbound mesajları alamaz
- Otomatik link gönderimi mümkün değildir

### 2.2 WhatsApp Business Platform (Cloud API) — Desteklenir

SlotPilot entegrasyonu için gereklidir:
- Meta Business hesabı ve WhatsApp Business Account
- Business phone number bağlantısı
- Webhook verification endpoint
- Inbound messages webhook
- Messages API

### 2.3 Test Ortamı

Geliştirme ortamında gerçek mesaj gönderilmez:
- `WHATSAPP_TEXT_PROVIDER=FAKE` varsayılan ayardır
- Fake provider konsola `[FAKE WA TEXT]` logu yazar
- Test endpoint: `POST /api/dev/fake-whatsapp/inbound` (sadece NODE_ENV=development)

---

## 3. 24 Saat Müşteri Hizmetleri Penceresi

### Kural

WhatsApp Business Platform politikasına göre:

```
Müşteri işletmeye mesaj atarsa → 24 saatlik customer service window açılır.
Bu pencere içinde işletme serbest metin (freeform text) ile yanıt verebilir.
```

### SlotPilot Uygulaması

- Auto Booking Link Reply sadece inbound mesaja yanıt olarak tetiklenir.
- Bu nedenle her zaman 24 saatlik pencere içinde çalışır.
- Pencere dışı mesaj gönderimi için Meta tarafından onaylı mesaj şablonu (template) gerekir.
- Şu aşamada SlotPilot pencere dışı otomatik mesaj göndermez.

---

## 4. Opt-out (Çıkış) Kuralları

### 4.1 Müşteri Opt-out Hakkı

Müşteri her zaman otomatik mesajlardan çıkma hakkına sahiptir.

### 4.2 Opt-out Anahtar Kelimeleri

Aşağıdaki kelimeler veya bunları içeren mesajlar opt-out olarak tanınır:

**Türkçe:**
- `dur`
- `durdurun`
- `istemiyorum`
- `hayır`
- `çık`
- `iptal`

**İngilizce (uluslararası standart):**
- `stop`
- `unsubscribe`

### 4.3 Opt-out Sonrası Davranış

1. `WhatsAppContactPreference.isBlocked = true` olarak güncellenir.
2. Söz konusu numaraya bir daha otomatik yanıt gönderilmez.
3. İşletme dashboard üzerinden bu tercihi görebilir (gelecek özellik).
4. Manuel unblock için yönetici müdahalesi gerekebilir.

### 4.4 Opt-in Koşulu

Bu modülde opt-in açık iletişim başlatmaktır: müşteri işletmeye mesaj yazmıştır. Bu nedenle KVKK hükümleri açısından müşteri tarafından başlatılmış bir iletişim söz konusudur.

---

## 5. Mesaj Tekrarını Önleme (Rate Limiting)

### 5.1 Varsayılan Kural

```
Aynı WhatsApp numarasına aynı organizasyon adına 24 saat içinde en fazla 1 otomatik booking link yanıtı gönderilir.
```

### 5.2 Konfigürasyon

`WhatsAppAutoReplySettings.cooldownHours` alanı ile her organizasyon kendi cooldown süresini ayarlayabilir:
- 1 saat
- 6 saat  
- 24 saat (varsayılan)
- 168 saat (7 gün)

### 5.3 Cooldown Başlangıcı

`WhatsAppContactPreference.lastAutoReplyAt` güncellendikten sonra cooldown başlar. Bir sonraki otomatik yanıt ancak `cooldownHours` süresi geçtikten sonra gönderilebilir.

---

## 6. Mesaj Döngüsü Engelleme

Sistem kendi gönderdiği mesajları tekrar işlememelidir.

Kurallar:
- Sadece `entry[].changes[].value.messages[]` içindeki inbound user messages işlenir.
- `entry[].changes[].value.statuses[]` içindeki status event'leri otomatik yanıt tetiklemez.
- Aynı `providerMessageId` ikinci kez gelirse ignore edilir (`WhatsAppInboundMessage.providerMessageId @unique`).
- Business outbound messages auto-reply tetiklemez.

---

## 7. İnsan Desteği Zorunluluğu

Her otomatik yanıt mesajında aşağıdaki veya eşdeğeri bir metin bulunmalıdır:

```
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

Bu kural kaldırılmaz ve özelleştirilemez — şablon her zaman bu ifadeyi içermeli veya işletme şablonu düzenlerken bu bilgiyi korumalıdır.

---

## 8. Güvenlik ve Uyumluluk

### 8.1 Token Güvenliği

- `META_WHATSAPP_ACCESS_TOKEN` → process.env, commit edilmez
- `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` → process.env
- `META_WHATSAPP_APP_SECRET` → process.env (gelecekte signature validation için)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` → process.env

### 8.2 Tenant İzolasyonu

- Her `WhatsAppAutoReplySettings` kaydı bir `organizationId` ile bağlıdır.
- Her `WhatsAppInboundMessage` `organizationId` içerir.
- Her `WhatsAppAutoReplyLog` `organizationId` içerir.
- Bir organizasyonun webhook'u başka bir organizasyonun verilerine erişemez.

### 8.3 Raw Payload Saklama

- İnbound webhook raw payload'ı `WhatsAppInboundMessage.rawPayload` içinde `JSON.stringify` ile saklanır.
- Production loglarına ham payload yazılmaz (müşteri telefon numarası ve mesaj içeriği hassastır).

### 8.4 KVKK Uyumu

- Bu modül appointment notification consent kapsamında değerlendirilebilir (randevu almayı kolaylaştıran bilgi).
- Marketing mesajı ile appointment link yanıtı ayrılır.
- `WhatsAppContactPreference` tablosu kişi bazlı consent ve opt-out bilgisi tutar.
- Veri silme talebi geldiğinde bu tablo da temizlenmelidir.

---

## 9. Anahtar Kelime Modu

İşletme isterse yanıt sadece belirli kelimeleri içeren mesajlarda gönderilir.

Örnek tetikleyiciler:
- randevu, randavu
- fiyat, ücret
- boş saat, müsaitlik
- adres, link

MVP varsayılanı: `ALWAYS` — her inbound mesajda, rate limit uygunsa link gönder.

Keyword modu için `WhatsAppAutoReplySettings.replyMode = "KEYWORD_ONLY"` ve `triggerKeywords` dizisi ayarlanmalıdır.

---

## 10. Varsayılan Mesaj Şablonu

```
Merhaba 👋
Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.
```

`{{bookingUrl}}` çalışma zamanında organizasyonun public booking URL'siyle değiştirilir.

Örnek:
```
https://slotpilot.com/booking/berber-demo
```
