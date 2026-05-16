# Randevo — Global Localization Bug Fix Plan

> Amaç: Randevo projesindeki Türkiye’ye hard-code bağlı marketplace/adres filtrelerini düzeltmek.  
> Sorun: Kullanıcı ülke olarak Italy seçtiğinde hâlâ Türkiye illeri çıkıyor. Landing page ve bazı metinler de hâlâ Türkiye odaklı görünüyor.

---

## 1. Görülen Hata

Ekran görüntüsünde:

```txt
- Ülke dropdown'ında Italy seçilmiş.
- İl/şehir dropdown'ında hâlâ "Tüm İller, Adana, Adıyaman..." görünüyor.
- Landing page hâlâ "Türkiye MVP — CANLI" ve "81 Türkiye Desteği" yazıyor.
```

Bu şu anlama geliyor:

```txt
Global localization planı kısmen uygulanmış ama UI tarafında Türkiye datasına hard-code bağlı kalan yerler var.
```

---

## 2. Kök Sebep

Marketplace sayfası hâlâ şu dataları direkt import ediyor:

```ts
import { TURKEY_CATEGORIES } from "@/data/turkey-categories";
import { TURKEY_PROVINCES } from "@/data/turkey-provinces";
```

Bu hatalı çünkü:

```txt
- Ülke değişince province/city listesi değişmiyor.
- Italy seçilse bile Türkiye il listesi render ediliyor.
- Provider abstraction marketplace UI’a bağlanmamış.
- Country state ile province/city state arasında doğru ilişki yok.
```

Doğru yaklaşım:

```txt
Country seçilince:
1. Türkiye ise local TURKEY_PROVINCES kullanılabilir.
2. Global ülke ise provider/manual city list kullanılmalı.
3. Eğer country != TR ise "Tüm İller" değil "All cities / Tutte le città" gibi locale-aware label görünmeli.
4. Türkiye’ye özel metinler landing ve marketplace UI’dan ayrılmalı.
```

---

## 3. Hedef Davranış

### 3.1 Türkiye Seçilince

```txt
Country: Türkiye
City/Province dropdown:
- Tüm İller
- Adana
- Ankara
- İstanbul
- İzmir
...
```

### 3.2 Italy Seçilince

```txt
Country: Italy
City/locality field:
- All cities veya Tutte le città
- Roma
- Milano
- Napoli
- Torino
- Firenze
...
```

Eğer provider aktifse:

```txt
Kullanıcı şehir/locality araması yapar.
Provider autocomplete sonuçları gelir.
Seçilen şehir/locality filtreye uygulanır.
```

### 3.3 Provider Çalışmıyorsa

```txt
Manual fallback açılır.
Kullanıcı şehir/locality text search yapabilir.
Türkiye il listesi gösterilmez.
```

---

## 4. Kritik Kural

```txt
TURKEY_PROVINCES sadece countryCode === "TR" iken kullanılmalı.
```

Şu kesinlikle olmamalı:

```txt
Global marketplace page doğrudan TURKEY_PROVINCES import edip tüm ülkeler için göstermemeli.
```

---

## 5. Önerilen Yeni Veri Yapısı

### 5.1 Country Config

Yeni dosya:

```txt
src/config/countries.ts
```

Örnek:

```ts
export type CountryCode = "TR" | "IT" | "US" | "DE" | "FR" | "ES" | "GB" | "NL";

export const COUNTRIES = [
  {
    code: "TR",
    name: "Türkiye",
    nativeName: "Türkiye",
    locale: "tr-TR",
    currency: "TRY",
    addressMode: "structured-local",
    cityLabelKey: "address.province",
    allCitiesLabelKey: "marketplace.allProvinces"
  },
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    locale: "it-IT",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.locality",
    allCitiesLabelKey: "marketplace.allCities"
  }
] as const;
```

---

### 5.2 Country-aware Location Options

Yeni helper:

```txt
src/lib/address/location-options.ts
```

Örnek:

```ts
import { TURKEY_PROVINCES } from "@/data/turkey-provinces";

export function getLocationOptionsForCountry(countryCode: string) {
  if (countryCode === "TR") {
    return TURKEY_PROVINCES.map((province) => ({
      value: province.name,
      label: province.name,
      type: "province"
    }));
  }

  return [];
}
```

Not:

```txt
Global ülkeler için boş liste dönmek hata değildir.
Bu durumda UI select yerine autocomplete/manual search göstermelidir.
```

---

## 6. UI Davranış Değişikliği

Marketplace filter component şu şekilde ayrılmalı:

```txt
CountrySelect
CategorySelect
LocationFilter
SearchInput
```

`LocationFilter` country-aware olmalı.

Pseudo-code:

```tsx
function LocationFilter({ countryCode, value, onChange }) {
  const options = getLocationOptionsForCountry(countryCode);

  if (countryCode === "TR") {
    return (
      <select value={value} onChange={...}>
        <option value="">Tüm İller</option>
        {options.map(...)}
      </select>
    );
  }

  return (
    <AddressAutocomplete
      countryCode={countryCode}
      value={value}
      onSelect={(place) => onChange(place.locality)}
      fallbackPlaceholder="Şehir/locality ara"
    />
  );
}
```

---

## 7. Landing Page Türkiye Hard-code Temizliği

Şu metinler sadece TR locale veya TR market segmentinde görünmeli:

```txt
Türkiye MVP — CANLI
81 Türkiye Desteği
Türkiye'nin akıllı randevu platformu
```

Global görünümde örnek:

```txt
Global MVP — Live
Smart booking platform for local businesses
Multi-country support
```

İtalyanca görünümde örnek:

```txt
MVP globale — live
La soluzione intelligente per gli appuntamenti della tua attività locale
Supporto multi-paese
```

---

## 8. API Query Güncellemesi

Marketplace API şu parametreleri desteklemeli:

```txt
country
province
city
locality
category
q
```

Mevcut `province` parametresi sadece TR için kullanılmalı.

Yeni filtre mantığı:

```ts
if (country) {
  where.countryCode = country;
}

if (country === "TR" && province) {
  where.province = province;
}

if (country !== "TR" && locality) {
  where.OR = [
    { city: { contains: locality, mode: "insensitive" } },
    { locality: { contains: locality, mode: "insensitive" } },
    { formattedAddress: { contains: locality, mode: "insensitive" } }
  ];
}
```

---

## 9. Database Kontrolü

Organization / Location / MarketplaceProfile modellerinde şunlar kontrol edilmeli:

```txt
countryCode
province
city
locality
formattedAddress
latitude
longitude
```

Eğer yoksa migration planı:

```txt
1. countryCode default TR olarak ekle.
2. Mevcut province/city alanlarını koru.
3. Global adresler için locality/formattedAddress alanı ekle.
4. Turkey local data backward compatible kalsın.
```

---

# 10. Phase Planı

---

## Phase GLF-0 — Bug Reproduction ve Audit

Kullanılacak agent:

```txt
repo-audit-agent
i18n-qa-agent
```

Yapılacaklar:

1. Marketplace sayfasında Italy seçildiğinde Türkiye illerinin çıktığını testte yakala.
2. `TURKEY_PROVINCES` importlarını ara.
3. `TURKEY_CATEGORIES` importlarını ara.
4. Landing page Türkiye hard-code metinlerini ara.
5. `docs/global-localization-bug-report.md` oluştur.

Komutlar:

```bash
grep -R "TURKEY_PROVINCES" src
grep -R "Tüm İller" src
grep -R "Türkiye MVP" src
grep -R "81 Türkiye" src
npm run typecheck
npm run lint
npm test
npm run build
```

Kabul kriteri:

```txt
- Bug belgelenmiş.
- Hangi dosyaların Türkiye’ye hard-code bağlı olduğu listelenmiş.
- Henüz davranış değişmemiş.
```

Commit:

```bash
git add .
git commit -m "docs: document global localization hard-code issues"
git push
```

---

## Phase GLF-1 — Country Config ve Location Helper

Kullanılacak agent:

```txt
global-address-agent
```

Yapılacaklar:

1. `src/config/countries.ts` oluştur.
2. `CountryCode` type ekle.
3. TR, IT, US, DE, FR, ES, GB, NL başlangıç ülkelerini ekle.
4. `src/lib/address/location-options.ts` oluştur.
5. `getLocationOptionsForCountry(countryCode)` helper yaz.
6. Test yaz.

Testler:

```txt
- TR için Türkiye il listesi döner.
- IT için Türkiye il listesi dönmez.
- Unknown country için boş liste/fallback döner.
```

Komutlar:

```bash
npm run typecheck
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "feat: add country-aware location options"
git push
```

Compact:

```txt
GLF-0 ve GLF-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase GLF-2 — Marketplace Filter Refactor

Kullanılacak agent:

```txt
marketplace-agent
global-address-agent
```

Yapılacaklar:

1. Marketplace page içindeki direkt `TURKEY_PROVINCES` importunu kaldır.
2. `CountrySelect` component oluştur.
3. `LocationFilter` component oluştur.
4. Country state ekle.
5. Country değişince province/locality state temizlensin.
6. TR seçilince il dropdown göster.
7. IT ve diğer ülkeler seçilince autocomplete/manual city search göster.
8. Placeholder locale-aware olsun.

Beklenen davranış:

```txt
TR -> Tüm İller dropdown
IT -> Şehir/locality ara
US -> City/state ara
DE -> Stadt suchen
```

Testler:

```txt
- Italy seçilince Adana/Ankara görünmez.
- Türkiye seçilince Türkiye illeri görünür.
- Country değişince eski province filtresi temizlenir.
- Location input API query’ye doğru parametre gönderir.
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
git commit -m "fix: make marketplace location filter country-aware"
git push
```

---

## Phase GLF-3 — Marketplace API Country-aware Query

Kullanılacak agent:

```txt
api-builder-agent
database-production-agent
```

Yapılacaklar:

1. `/api/marketplace` route’unu kontrol et.
2. `country` parametresi ekle.
3. TR için `province` filtresi uygula.
4. Global ülkeler için `city/locality/formattedAddress` filtresi uygula.
5. CountryCode database field yoksa migration planla.
6. Tenant/private data sızmadığını kontrol et.
7. Testleri yaz.

Testler:

```txt
- country=TR&province=Ankara sadece TR Ankara döndürür.
- country=IT&locality=Roma sadece IT Roma işletmelerini döndürür.
- country=IT iken province=Ankara yok sayılır.
- marketplaceEnabled=false işletme dönmez.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Commit:

```bash
git add .
git commit -m "fix: add country-aware marketplace API filtering"
git push
```

Compact:

```txt
GLF-2 ve GLF-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase GLF-4 — Landing Page Global Copy

Kullanılacak agent:

```txt
i18n-production-agent
growth-product-agent
```

Yapılacaklar:

1. Landing page hard-code Türkiye metinlerini bul.
2. `Türkiye MVP — CANLI` metnini locale/market segment bazlı yap.
3. `81 Türkiye Desteği` metric’ini global metric ile değiştir veya sadece TR locale’de göster.
4. Hero başlığını i18n dictionary’den okut.
5. CTA metinlerini dictionary’ye taşı.
6. Italy/English locale testleri yap.

Önerilen global metin:

```txt
Smart booking platform for local businesses
Multi-country ready appointment, payment and reminder infrastructure.
```

Türkçe metin:

```txt
Yerel işletmeniz için akıllı randevu çözümü
```

İtalyanca metin:

```txt
La piattaforma intelligente per gestire gli appuntamenti della tua attività
```

Testler:

```txt
- TR locale’de Türkçe metin görünür.
- IT locale’de Türkiye MVP yazmaz.
- EN locale’de 81 Türkiye Desteği yazmaz.
- Dil değişince hero metni değişir.
```

Komutlar:

```bash
npm run i18n:check
npm run typecheck
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "fix: remove Turkey-only copy from global landing page"
git push
```

---

## Phase GLF-5 — Provider Fallback Integration

Kullanılacak agent:

```txt
global-address-agent
```

Yapılacaklar:

1. Address provider abstraction’ın gerçekten kullanıldığı yerleri kontrol et.
2. Marketplace `LocationFilter` içine provider autocomplete bağla.
3. Provider env yoksa manual fallback göster.
4. Address search minimum 3 karakter + debounce ile çalışsın.
5. Rate limit endpoint kullan.
6. Provider hata verirse dropdown yerine manual input açık kalsın.

Testler:

```txt
- Provider disabled iken app crash olmaz.
- Manual city search çalışır.
- Provider enabled mock response döner.
- Italy search query Roma döndürür.
- Türkiye select davranışı bozulmaz.
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
git commit -m "feat: connect global address provider to marketplace filters"
git push
```

Compact:

```txt
GLF-4 ve GLF-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase GLF-6 — E2E Regression ve Release

Kullanılacak agent:

```txt
e2e-testing-agent
release-manager-agent
```

Yapılacaklar:

1. E2E test ekle:
   - Türkiye seç -> Adana görünür.
   - Italy seç -> Adana görünmez.
   - Italy seç -> Roma search çalışır.
   - Dil Italy/Italian seç -> Türkiye MVP yazmaz.
2. Screenshot regression artifact oluştur.
3. README global address bölümünü güncelle.
4. CHANGELOG güncelle.
5. GitHub tag oluştur.

Final test komutları:

```bash
npm run i18n:check
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npx prisma validate
npx prisma generate
```

Commit/tag:

```bash
git add .
git commit -m "fix: complete global marketplace localization regression"
git push
git tag v1.4.1-global-localization-fix
git push origin v1.4.1-global-localization-fix
```

---

# 11. Codex Prompt

```txt
Read RANDEVO_GLOBAL_LOCALIZATION_BUGFIX_PLAN.md.

We have a regression: selecting Italy still shows Turkey provinces in the marketplace filter.

Start with Phase GLF-0 only:
- Reproduce and document the hard-coded Turkey localization issue.
- Search for TURKEY_PROVINCES, Tüm İller, Türkiye MVP, 81 Türkiye.
- Create docs/global-localization-bug-report.md.
- Do not change product behavior yet.
- Run tests/build.
- Commit and push only if tests pass.

Then stop for review.
```

---

# 12. Claude Code Prompt

```txt
Read RANDEVO_GLOBAL_LOCALIZATION_BUGFIX_PLAN.md carefully.

Start with Phase GLF-0 only.

Important:
- Do not implement all phases at once.
- Do not remove Turkey structured data.
- TURKEY_PROVINCES must only be used when countryCode === "TR".
- Italy and other global countries must use provider/manual city search.
- Every phase must run tests/build.
- Every 2 phases update docs/COMPACT_STATE.md and run/request /compact.
```

---

# 13. Final Definition of Done

```txt
- Italy seçildiğinde Türkiye illeri görünmüyor.
- Türkiye seçildiğinde Türkiye illeri görünmeye devam ediyor.
- Country değişince eski province/city state temizleniyor.
- Marketplace API country-aware filtreliyor.
- Landing page global locale’de Türkiye hard-code metin göstermiyor.
- Provider disabled olsa bile manual fallback çalışıyor.
- i18n keyler eksiksiz.
- E2E regression testleri var.
- Build geçiyor.
- GitHub push ve tag tamamlandı.
```
