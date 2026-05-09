# Randevo Türkiye Ürün Stratejisi

> Bu doküman, Randevo'un Türkiye pazarına uyarlanması için ürün kararlarını, hedef müşteri gruplarını, fiyatlandırma yapısını ve yerel gereksinimleri tanımlar.

---

## 1. Değer Önerisi

Küçük işletmeler için Türkçe, uygun fiyatlı, WhatsApp/SMS/e-posta hatırlatma altyapısına hazır, kapora ve randevu yönetimi odaklı SaaS randevu sistemi.

---

## 2. Hedef Müşteri Grupları

Randevo Türkiye versiyonu özellikle şu işletmeleri hedefler:

- Kuaförler
- Berberler
- Güzellik salonları
- Protez tırnak / nail art stüdyoları
- Diyetisyenler
- Psikolojik danışmanlık ofisleri
- Özel ders verenler
- Spor eğitmenleri
- Pilates/yoga stüdyoları
- Klinik dışı randevulu danışmanlık hizmetleri
- Kurs ve atölye merkezleri
- Oto bakım / ekspertiz randevu işletmeleri
- Pet kuaförleri

---

## 3. Çözülen Problem

Türkiye'de küçük işletmeler randevuları genellikle şu kanallarla yönetir: WhatsApp, Instagram DM, telefon araması, kağıt ajanda, Excel, Google Calendar.

Bu yöntemlerin yaygın sorunları:
- Randevular karışır
- Müşteri randevuyu unutur
- Aynı saate iki kişi yazılır
- Kapora takibi manuel yapılır
- İşletme yoğun gün/saat raporu alamaz
- Müşteri işletme kapalıyken randevu alamaz
- Randevu iptali ve no-show oranı izlenemez

---

## 4. Türkiye Fiyatlandırması

### Paketler

| Plan | Fiyat | Çalışan | Randevu/ay |
|------|-------|---------|------------|
| Ücretsiz | 0 TL / ay | 1 | 20 |
| Başlangıç | 40 TL / ay | 3 | 300 |
| Pro | 249 TL / ay | Sınırsız | 2.000 |
| Kurumsal | Teklif al | Sınırsız | Sınırsız |

### Yıllık İndirim (Placeholder)

- Başlangıç yıllık: 400 TL / yıl (2 ay ücretsiz)
- Pro yıllık: 2.490 TL / yıl (2 ay ücretsiz)

### Ücretsiz Plan

- 1 işletme, 1 çalışan, 20 randevu/ay
- Public booking link
- Temel dashboard
- E-posta hatırlatma yok
- SMS/WhatsApp yok
- Marketplace görünürlüğü yok

### Başlangıç Planı — 40 TL / ay

- 1 işletme, 3 çalışan, 300 randevu/ay
- Türkçe public booking sayfası
- E-posta hatırlatma
- Temel raporlar
- Türkiye il/ilçe adres desteği
- CSV export

### Pro Plan — 249 TL / ay

- Sınırsız çalışan, 2.000 randevu/ay
- SMS/WhatsApp provider altyapısı
- Kapora ödeme altyapısı
- Marketplace görünürlüğü
- Gelişmiş raporlar
- Çoklu şube desteği
- e-Arşiv/e-Fatura export hazırlığı

### Kurumsal Plan — Teklif al

- Çoklu işletme/şube, özel entegrasyon, özel destek
- Muhasebe entegrasyonu
- Yüksek hacimli randevu limiti
- SLA ve özel onboarding

> **Not:** Fiyatlar MVP denemesi içindir. Canlı ticari kullanım öncesi vergi, KDV, ödeme kuruluşu komisyonları ve faturalama süreçleri muhasebeciyle doğrulanmalıdır.

---

## 5. Türkiye'ye Özgü Gereksinimler

### 5.1 Ödeme Altyapısı

Stripe'a ek olarak desteklenecek Türkiye ödeme yöntemleri:
- Manuel havale / EFT (ilk aşamada aktif)
- iyzico (adapter stub — tam entegrasyon sonraki faz)
- PayTR (adapter stub)
- Param (adapter stub)
- Banka sanal POS (ileride)

### 5.2 KVKK ve İYS Uyumu

- Aydınlatma yükümlülüğü: booking formunda zorunlu checkbox
- Açık rıza: aydınlatmadan ayrı, opsiyonel
- Randevu bildirimleri: ayrı consent
- Ticari ileti (pazarlama): ayrı ve tamamen opsiyonel
- Veri silme talebi: endpoint hazır

> **Önemli:** Bu sistem KVKK compliance aracı değildir. Metinler placeholder'dır. Hukuki uyumluluk için avukat danışılmalıdır.

### 5.3 Fatura Hazırlığı

- İşletme fatura profili: VKN, vergi dairesi, ünvan
- e-Arşiv/e-Fatura export-ready CSV/JSON
- GİB doğrudan entegrasyonu YAPILMAMIŞTIR

### 5.4 Adres ve Telefon

- 81 il + büyükşehir ilçe desteği
- +90 telefon normalizasyonu
- Türkiye adres formatı (il/ilçe/mahalle)

### 5.5 Tatil ve Kapalı Gün

- Türkiye resmi tatilleri
- İşletme bazlı kapalı gün override

---

## 6. Rekabet Analizi (Özet)

Türkiye'de benzer çözümler: Randevu.com, Appointy, Fresha, Plandayı.

Randevo farkı:
- Tamamen Türkçe arayüz
- Türkiye ödeme sağlayıcıları
- KVKK uyumlu consent yapısı
- WhatsApp bildirim altyapısı hazır
- Açık kaynak potansiyeli / white-label imkanı

---

## 7. Teknik Notlar

- Veritabanı: SQLite (dev) / PostgreSQL (prod)
- Para birimi: TRY default tüm modellerde
- Timezone: Europe/Istanbul
- Dil: tr-TR (Intl API ile)
- Test ortamı: Vitest, tüm provider'lar FAKE default
