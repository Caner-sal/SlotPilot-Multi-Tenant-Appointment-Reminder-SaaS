# Randevo ASM-0: Agent Skills ve MCP Planı

Bu doküman yalnızca **ASM-0** fazını kapsar.

## Amaç

- Agent Skills ve MCP için güvenli başlangıç çerçevesini yazılı hale getirmek
- Mevcut repo durumunu audit edip boşlukları kapatmak
- Ürün davranışına dokunmadan dokümantasyon ve örnek konfigürasyon hazırlamak

## ASM-0 Kapsamı

- `docs/agent-skills-and-mcp-plan.md` oluşturulması
- `docs/mcp-security-policy.md` oluşturulması
- `.mcp.json.example` dosyasının güvenli başlangıç şablonuna hizalanması
- Gerçek `.mcp.json` dosyasının git tarafından dışlanmasının doğrulanması

## Audit Özeti (Mevcut Durum)

- `.claude/skills` altında çalışan skill yapısı mevcut
- `AGENTS.md` ve `CLAUDE.md` içinde faz disiplini ve güvenlik kapıları tanımlı
- `package.json` içinde gerekli ASM-0 komutları mevcut:
  - `check:secrets`
  - `validate:skills`
  - `test`
  - `build`
- `.mcp.json.example` mevcut ama ASM-0 başlangıç yaklaşımına göre sadeleştirilmeye ihtiyaç duyuyor
- `.gitignore` içinde `.mcp.json` satırı mevcut (doğru)

## ASM-0 Kararları

- Bu fazda MCP sunucuları **kurulmaz** ve **çalıştırılmaz**
- Gerçek secret değerleri hiçbir dosyaya yazılmaz
- Production veritabanına write erişimi verecek hiçbir MCP tanımlanmaz
- Commit kapsamı yalnızca ASM-0 dosyaları ile sınırlanır

## Güvenlik Sınırları (ASM-0)

- MCP yapılandırmaları minimum yetki ile tanımlanır
- Read-only olmayan veritabanı erişimleri varsayılan olarak kapalı tutulur
- Örnek yapılandırma yalnızca local/staging geliştirme hedefler
- Ürün kodu, API davranışı, ödeme ve tenant kuralları bu fazda değiştirilmez

## ASM-0 Çıkış Kriteri

Bu faz tamamlanmış sayılmak için aşağıdaki komutların başarıyla geçmesi gerekir:

```bash
npm run check:secrets
npm run validate:skills
npm test
npm run build
```

Komutlardan biri bulunamazsa veya başarısız olursa durum açıkça raporlanır; gizli geçiş yapılmaz.
