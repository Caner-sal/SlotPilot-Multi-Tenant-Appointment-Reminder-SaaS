# Randevo MCP Güvenlik Politikası (ASM-0)

Bu politika ASM-0 kapsamında MCP entegrasyonu için zorunlu güvenlik kurallarını tanımlar.

## 1. Temel Prensipler

- Minimum yetki: Her MCP yalnızca gerekli en dar izinle tanımlanır.
- Secret güvenliği: Token, şifre ve gerçek credential değerleri repoya yazılmaz.
- Ortam ayrımı: MCP konfigürasyonu local/staging geliştirme içindir.
- Production koruması: Production sistemlere write etkisi yaratacak MCP kullanılamaz.

## 2. Secret Yönetimi

- Gerçek `.mcp.json` dosyası repoya commit edilmez.
- Repoda yalnızca `.mcp.json.example` bulunur.
- Örnek dosyada gerçek token yerine env placeholder kullanılır:
  - `${GITHUB_PERSONAL_ACCESS_TOKEN}`
  - `${DATABASE_READONLY_URL}`
- Secret taraması zorunludur: `npm run check:secrets`

## 3. İzin ve Erişim Kuralları

- GitHub MCP:
  - Token minimum scope ile kullanılmalıdır.
  - Başlangıçta read odaklı kullanım tercih edilir.
- Playwright MCP:
  - Yalnızca localhost/staging hedeflerinde kullanılmalıdır.
  - Production üzerinde destructive test çalıştırılamaz.
- Postgres/Prisma MCP:
  - Yalnızca read-only bağlantı URL'si ile kullanılmalıdır.
  - Varsayılan olarak kapalı (`disabledByDefault`) tutulmalıdır.

## 4. Açıkça Yasak Olanlar

Bu maddeler explicit onay olmadan ve ayrı güvenlik değerlendirmesi yapılmadan eklenemez:

- Payment provider write-capable MCP
- Email gönderimi yapan MCP
- WhatsApp gönderimi yapan MCP
- Production database write erişimi sağlayan MCP
- Repo dışı sınırsız filesystem erişimi sağlayan MCP

## 5. Onay Gerektiren Durumlar

Aşağıdaki değişiklikler pull request içinde açık gerekçe ve reviewer onayı gerektirir:

- Yeni MCP sunucusu eklemek
- Mevcut MCP için izin kapsamını genişletmek
- Disabled MCP'yi default aktif hale getirmek
- Token/scope modelini değiştirmek

## 6. Review Checklist

Her MCP değişikliğinde aşağıdaki kontrol listesi uygulanır:

- [ ] `.mcp.json` gitignore içinde mi?
- [ ] `.mcp.json.example` secret içermiyor mu?
- [ ] Production bağlantısı veya write yetkisi var mı?
- [ ] Erişim kapsamı minimum yetki prensibine uygun mu?
- [ ] Komutlar geçti mi?
  - [ ] `npm run check:secrets`
  - [ ] `npm run validate:skills`
  - [ ] `npm test`
  - [ ] `npm run build`

## 7. ASM-0 Kuralı

Bu fazda MCP sunucusu kurulumu ve aktif kullanım yapılmaz. Yalnızca politika ve örnek konfigürasyon hazırlanır.
