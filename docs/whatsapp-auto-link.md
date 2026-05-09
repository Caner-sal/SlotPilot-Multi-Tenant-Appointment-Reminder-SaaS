# WhatsApp Auto Booking Link Reply

Müşteri bir işletmenin WhatsApp numarasına mesaj yazdığında, sistem otomatik olarak işletmenin public booking URL'sini içeren Türkçe bir yanıt mesajı gönderir.

## Nasıl Çalışır

1. Müşteri işletmenin WhatsApp'ına mesaj yazar
2. Meta Cloud API webhook olayı `/api/webhooks/whatsapp` endpointine gelir
3. Sistem mesajı kaydeder (deduplication: her `providerMessageId` yalnızca bir kez işlenir)
4. Otomatik yanıt kuralları kontrol edilir (aktif mi, cooldown, keyword filtresi, opt-out)
5. Kurallara uyan mesajlara booking linki içeren yanıt gönderilir
6. Tüm gönderimler `WhatsAppAutoReplyLog` tablosuna yazılır

## Dashboard Kullanımı

`/dashboard/whatsapp` sayfasından:

- **Otomatik Yanıt Aktif**: Özelliği açıp kapatın
- **Yanıt Modu**: Her zaman / Anahtar kelimede / Kapalı
- **Soğuma Süresi**: Aynı kişiye tekrar yanıt göndermeden önce beklenecek saat (1–168)
- **Anahtar Kelimeler**: `KEYWORD_ONLY` modunda tetikleyici kelimeler (virgülle ayrılır)
- **Mesaj Şablonu**: `{{bookingUrl}}` placeholder'ı otomatik doldurulur
- **Önizleme**: Gerçek mesaj göndermeden şablonu test edin
- **Gönderim Geçmişi**: SENT / SKIPPED / FAILED durumlu log tablosu

## Environment Variables

```env
WHATSAPP_TEXT_PROVIDER=FAKE          # FAKE | META_CLOUD_API | TWILIO_WHATSAPP
WHATSAPP_AUTO_REPLY_ENABLED=false    # Genel özellik flag (opsiyonel)
META_WHATSAPP_ACCESS_TOKEN=          # Meta Graph API token
META_WHATSAPP_PHONE_NUMBER_ID=       # İşletme telefon numarası ID
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=  # Webhook doğrulama token
META_WHATSAPP_APP_SECRET=            # Webhook imza doğrulama (opsiyonel)
TWILIO_ACCOUNT_SID=                  # Twilio hesap SID
TWILIO_AUTH_TOKEN=                   # Twilio auth token
TWILIO_WHATSAPP_FROM=                # Twilio WhatsApp numarası (whatsapp:+14155...)
NEXT_PUBLIC_BOOKING_BASE_URL=http://localhost:3000/booking
```

## Fake Provider ile Test

Geliştirme ortamında gerçek mesaj göndermeden test edin:

```bash
curl -X POST http://localhost:3000/api/dev/fake-whatsapp/inbound \
  -H "Content-Type: application/json" \
  -d '{"fromPhone": "+905001234567", "messageText": "Merhaba"}'
```

Konsolda `[FAKE WA TEXT]` logu görünür, veritabanına SENT kaydı düşer.

Opt-out testi:
```bash
curl -X POST http://localhost:3000/api/dev/fake-whatsapp/inbound \
  -H "Content-Type: application/json" \
  -d '{"fromPhone": "+905001234567", "messageText": "dur"}'
```
Bu numara artık engellidir ve sonraki mesajlar SKIPPED olarak kaydedilir.

## Meta Cloud API Bağlama

1. [Meta for Developers](https://developers.facebook.com/) → WhatsApp Business App oluşturun
2. `META_WHATSAPP_ACCESS_TOKEN` ve `META_WHATSAPP_PHONE_NUMBER_ID` alın
3. Webhook URL'yi `https://yourdomain.com/api/webhooks/whatsapp` olarak kaydedin
4. Webhook `messages` eventine subscribe olun
5. Dashboard → WhatsApp → Provider: `META_CLOUD_API` seçin, Phone Number ID girin

## Cooldown ve Opt-Out

- Cooldown: Aynı telefon numarasına belirlenen saat içinde tekrar yanıt verilmez (varsayılan 24 saat)
- Opt-out kelimeleri: `dur`, `durdurun`, `istemiyorum`, `hayır`, `iptal`, `stop`, `unsubscribe` — bu kelimeleri gönderen numara kalıcı olarak engellenir (`WhatsAppContactPreference.isBlocked = true`)

## Veri Modelleri

| Model | Açıklama |
|-------|----------|
| `WhatsAppAutoReplySettings` | İşletme başına ayarlar (1:1 org) |
| `WhatsAppInboundMessage` | Gelen mesaj kaydı (providerMessageId ile dedup) |
| `WhatsAppAutoReplyLog` | Her yanıt denemesinin sonucu |
| `WhatsAppContactPreference` | Telefon bazlı tercihler ve cooldown takibi |
