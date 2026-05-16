# Randevo / SlotPilot — Global Adres & Localization Yol Haritası

> Amaç: Türkiye’deki il/ilçe seçimi mantığını global pazara taşımak; fakat bunu sürdürülebilir, ölçeklenebilir ve düşük bakım maliyetli bir sistemle yapmak.

---

## 1. Ana Karar

Dünya ülkeleri için şehir/ilçe/mahalle verisini tek tek elle girmek doğru yol değildir.

En mantıklı mimari:

```txt
Hibrit Adres Sistemi
= Harita/adres sağlayıcısı ile autocomplete + bizim normalize edilmiş adres modelimiz
```

Yani:

```txt
Kullanıcı adresi Google/Mapbox/Apple/OSM tabanlı aramayla seçer.
Biz seçilen sonucu normalize edip kendi veritabanımıza kaydederiz.
Çok aktif olduğumuz ülkeler için ayrıca local city/district cache tutarız.
```

---

## 2. Neden Elle Tüm Ülkeleri Girmemeliyiz?

Elle tüm ülkeler, şehirler ve ilçeler girilirse şu sorunlar çıkar:

```txt
- Dünya genelinde idari bölge yapıları aynı değil.
- Bazı ülkelerde state/province/county/district ayrımı var.
- Bazı ülkelerde mahalle/semt sistemi farklı.
- Veriler sürekli değişir.
- Yazım farkları ve çok dilli isimler karmaşa yaratır.
- Bakım maliyeti çok yükselir.
- Yanlış adres kullanıcı kaybına yol açar.
```

Örnek:

```txt
Türkiye: İl > İlçe > Mahalle
ABD: State > County > City > ZIP
İngiltere: Country > County/Region > City/Town > Postcode
Almanya: Bundesland > District > City
Fransa: Region > Department > Commune
İspanya: Comunidad Autónoma > Province > Municipality
İran: Province > County > District/City
```

Bu yüzden tek modelde sadece `city` ve `district` alanı kullanmak globalde yetersiz kalır.

---

## 3. Neden Sadece Google/Apple Maps’e Bağlamamalıyız?

Sadece tek harita sağlayıcısına bağlanmak da riskli.

Riskler:

```txt
- Maliyet zamanla artabilir.
- API kotası aşılabilir.
- Bazı ülkelerde kapsama kalitesi farklı olabilir.
- Vendor lock-in oluşur.
- KVKK/GDPR/privacy açısından adres datası üçüncü taraflara gider.
- China/region restrictions gibi özel pazar sorunları çıkabilir.
```

Bu yüzden uygulama içinde provider abstraction kurulmalıdır.

Doğru yapı:

```txt
AddressProvider interface
- GooglePlacesProvider
- MapboxProvider
- AppleMapKitProvider
- OSMProvider
- ManualFallbackProvider
```

---

## 4. Önerilen Provider Stratejisi

### 4.1 İlk Global MVP

Önerilen başlangıç:

```txt
Primary: Google Places Autocomplete veya Mapbox Search Box
Fallback: Manual address entry
Cache: Saved normalized addresses in our DB
```

### 4.2 Apple Maps Ne Zaman Kullanılır?

Apple Maps özellikle iOS/native app tarafında daha anlamlıdır.

Web’de kullanılabilir ama global SaaS web uygulamasında ilk tercih olarak Google/Mapbox daha pratik olabilir.

### 4.3 OpenStreetMap / Nominatim Ne Zaman Kullanılır?

OpenStreetMap tabanlı çözüm açık veri avantajı sağlar ama resmi public Nominatim sunucusu yüksek hacimli autocomplete kullanım için doğru değildir.

OSM tabanlı ilerlemek istiyorsak:

```txt
- Kendi Nominatim/Pelias/Photon server’ını host et
veya
- Ticari OSM tabanlı sağlayıcı kullan
```

---

## 5. Önerilen Nihai Mimari

```txt
User Address Form
        ↓
Address Autocomplete Component
        ↓
Address Provider Adapter
        ↓
Provider Result Normalizer
        ↓
NormalizedAddress Model
        ↓
Business / Location / Customer Address Records
```

---

## 6. Database Model Önerisi

### 6.1 NormalizedAddress

```txt
NormalizedAddress
- id
- organizationId nullable
- ownerType: ORGANIZATION | LOCATION | CUSTOMER | MARKETPLACE_PROFILE
- ownerId
- countryCode
- countryName
- adminLevel1
- adminLevel2
- adminLevel3
- locality
- subLocality
- postalCode
- street
- streetNumber
- formattedAddress
- latitude
- longitude
- provider
- providerPlaceId
- rawProviderPayloadSafe
- language
- createdAt
- updatedAt
```

### 6.2 CountryConfig

```txt
CountryConfig
- countryCode
- countryName
- defaultLocale
- defaultCurrency
- addressFormat
- phoneCountryCode
- enabled
- marketplaceEnabled
```

### 6.3 AddressProviderLog

```txt
AddressProviderLog
- id
- provider
- query
- countryCode
- status
- resultCount
- errorMessage
- createdAt
```

Not:

```txt
rawProviderPayloadSafe içinde hassas kullanıcı verisi gereksiz tutulmamalı.
Provider payload mümkünse minimize edilmeli.
```

---

## 7. Address Model Neden Esnek Olmalı?

Global sistemde şu alanlar sabit olmamalı:

```txt
city
district
neighborhood
```

Bunların yerine daha esnek yapı kullanılmalı:

```txt
adminLevel1
adminLevel2
adminLevel3
locality
subLocality
postalCode
formattedAddress
```

Türkiye için mapping:

```txt
countryCode = TR
adminLevel1 = İl
adminLevel2 = İlçe
subLocality = Mahalle
```

ABD için mapping:

```txt
countryCode = US
adminLevel1 = State
adminLevel2 = County
locality = City
postalCode = ZIP
```

Fransa için mapping:

```txt
countryCode = FR
adminLevel1 = Region
adminLevel2 = Department
locality = Commune/City
postalCode = Postal Code
```

---

## 8. Ülke Bazlı Aşamalı Yayılım

Başta tüm dünyayı aynı kalitede desteklemeye çalışmak yerine, ülke ülke açmak daha mantıklıdır.

### Tier 1 — İlk Global Paket

```txt
Türkiye
ABD
Birleşik Krallık
Almanya
Fransa
İtalya
İspanya
Hollanda
Kanada
Avustralya
```

### Tier 2 — Genişleme

```txt
BAE
Suudi Arabistan
İran
Brezilya
Meksika
Polonya
Portekiz
İsveç
Norveç
Danimarka
```

### Tier 3 — Sonraki Pazarlar

```txt
Hindistan
Endonezya
Japonya
Güney Kore
Güney Afrika
Arjantin
Şili
Kolombiya
```

---

## 9. UI/UX Kararı

Adres formu ülkeye göre değişmeli.

### Türkiye

```txt
Ülke
İl
İlçe
Mahalle
Açık adres
Telefon +90
```

### ABD

```txt
Country
State
City
ZIP Code
Street address
Phone +1
```

### Almanya

```txt
Country
Bundesland
City
Postal code
Street address
Phone +49
```

### Fransa

```txt
Country
Region
Department/City
Postal code
Street address
Phone +33
```

Ama kullanıcıya her ülkede aynı karmaşık form gösterilmemeli.

Önerilen UX:

```txt
1. Önce ülke seç.
2. Sonra adres arama/autocomplete aç.
3. Seçilen adres otomatik parse edilsin.
4. Kullanıcı isterse manuel düzenleyebilsin.
```

---

## 10. Roadmap

---

## Phase ADDR-0 — Global Address Strategy Baseline

Amaç:

Mevcut Türkiye adres sistemini analiz etmek ve global sisteme geçiş planını netleştirmek.

Yapılacaklar:

1. Mevcut Türkiye il/ilçe modelini incele.
2. Organization, Location, Customer adres alanlarını çıkar.
3. Hangi alanların global modele taşınacağını belirle.
4. `docs/global-address-strategy.md` oluştur.
5. Test baseline çalıştır.
6. GitHub push yap.

Testler:

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
git commit -m "docs: add global address strategy"
git push
```

---

## Phase ADDR-1 — Address Provider Abstraction

Amaç:

Google/Mapbox/Apple/OSM gibi sağlayıcıları tek interface arkasına almak.

Yapılacaklar:

1. `AddressProvider` interface oluştur.
2. `GoogleAddressProvider` skeleton oluştur.
3. `MapboxAddressProvider` skeleton oluştur.
4. `AppleMapKitAddressProvider` skeleton oluştur.
5. `ManualAddressProvider` oluştur.
6. Provider selection config ekle.
7. `.env.example` güncelle.
8. Unit test yaz.

Interface örneği:

```ts
interface AddressProvider {
  autocomplete(input: AddressAutocompleteInput): Promise<AddressSuggestion[]>;
  retrieve(input: AddressRetrieveInput): Promise<NormalizedAddressResult>;
  reverseGeocode?(input: ReverseGeocodeInput): Promise<NormalizedAddressResult>;
}
```

Testler:

```txt
- Manual provider çalışır.
- Provider env eksikse güvenli hata döner.
- Provider result normalize edilir.
- Client API key server secret ile karışmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add address provider abstraction"
git push
```

Compact:

```txt
ADDR-0 ve ADDR-1 sonrası docs/COMPACT_STATE.md güncelle.
Sonra /compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase ADDR-2 — Normalized Address Database Model

Amaç:

Ülke fark etmeksizin adresleri standart modelde kaydetmek.

Yapılacaklar:

1. `NormalizedAddress` modelini ekle.
2. `CountryConfig` modelini veya config dosyasını ekle.
3. `AddressProviderLog` modelini ekle.
4. Eski Türkiye adres alanları için migration stratejisi yaz.
5. Prisma migration oluştur.
6. Seed güncelle.
7. Test yaz.

Testler:

```txt
- Türkiye adresi normalize edilir.
- ABD adresi normalize edilir.
- Eski organization adresi kaybolmaz.
- Tenant isolation korunur.
```

Commit:

```bash
git add .
git commit -m "feat: add normalized global address model"
git push
```

---

## Phase ADDR-3 — Country-Specific Address Forms

Amaç:

Ülkeye göre değişen adres formu yapısını oluşturmak.

Yapılacaklar:

1. `CountryAddressConfig` yapısı oluştur.
2. Türkiye, ABD, Almanya, Fransa, İtalya, İspanya için başlangıç config ekle.
3. Form label’larını locale ile bağla.
4. Form validation country-specific hale getir.
5. Telefon ülke kodu desteği ekle.
6. Postal code validation placeholder ekle.
7. UI testleri yaz.

Testler:

```txt
- TR seçilince İl/İlçe/Mahalle görünür.
- US seçilince State/ZIP görünür.
- DE seçilince postal code/street formatı çalışır.
- Locale değişince form label’ları değişir.
```

Commit:

```bash
git add .
git commit -m "feat: add country-specific address forms"
git push
```

Compact:

```txt
ADDR-2 ve ADDR-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ADDR-4 — Autocomplete Component

Amaç:

Web ve app için reusable adres arama componenti eklemek.

Yapılacaklar:

1. `AddressAutocomplete` component oluştur.
2. Debounce ekle.
3. Provider API endpoint oluştur.
4. Suggestion list UI oluştur.
5. Selected result normalize edilip formu doldursun.
6. Manual fallback ekle.
7. Rate-limit ekle.
8. Tests yaz.

Testler:

```txt
- 3 karakterden önce provider çağrılmaz.
- Debounce çalışır.
- Suggestion seçilince form dolar.
- Provider hata verirse manual fallback görünür.
- Rate limit çalışır.
```

Commit:

```bash
git add .
git commit -m "feat: add global address autocomplete component"
git push
```

---

## Phase ADDR-5 — Google / Mapbox Provider Implementation

Amaç:

İlk gerçek provider entegrasyonunu yapmak.

Yapılacaklar:

1. Google Places provider implement et veya Mapbox Search provider implement et.
2. Provider seçimi config ile yapılabilsin.
3. Field mask/minimum data prensibi uygula.
4. API key server/client ayrımını yap.
5. Billing/cost guard dokümanı oluştur.
6. Tests mock provider ile yaz.

Önerilen başlangıç:

```txt
Eğer hızlı MVP isteniyorsa: Google Places
Eğer cost/özelleştirme dengesi isteniyorsa: Mapbox Search
Eğer open data öncelikliyse: self-hosted OSM/Pelias sonraki faza bırakılır
```

Testler:

```txt
- Provider mock autocomplete döner.
- Retrieve result normalize edilir.
- Provider timeout safe error döner.
- API key client bundle’a sızmaz.
```

Commit:

```bash
git add .
git commit -m "feat: add first real address search provider"
git push
```

Compact:

```txt
ADDR-4 ve ADDR-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ADDR-6 — Marketplace Country/City Search

Amaç:

Marketplace’i global ülke/şehir aramaya uygun hale getirmek.

Yapılacaklar:

1. Marketplace country filter ekle.
2. City/locality filter ekle.
3. Provider place ID ile arama desteği ekle.
4. Nearby businesses query hazırla.
5. Geo index planı yaz.
6. SEO locale/country route planı oluştur.

Route örnekleri:

```txt
/marketplace/tr/istanbul
/marketplace/de/berlin
/marketplace/fr/paris
/marketplace/es/madrid
```

Testler:

```txt
- Türkiye İstanbul işletmeleri listelenir.
- Almanya Berlin işletmeleri listelenir.
- Disabled marketplace işletmesi görünmez.
- Private customer data görünmez.
```

Commit:

```bash
git add .
git commit -m "feat: add global marketplace location filters"
git push
```

---

## Phase ADDR-7 — Mobile Address Picker

Amaç:

Mobil uygulamaya global adres seçimi eklemek.

Yapılacaklar:

1. Mobile address autocomplete screen oluştur.
2. Country selector ekle.
3. Provider API client ekle.
4. Manual fallback ekle.
5. RTL dillerde layout kontrol et.
6. Mobile tests/smoke test ekle.

Testler:

```bash
cd mobile
npm run typecheck
npm test
npx expo-doctor
```

Commit:

```bash
git add .
git commit -m "feat: add mobile global address picker"
git push
```

Compact:

```txt
ADDR-6 ve ADDR-7 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## Phase ADDR-8 — QA, Cost Guard, Docs

Amaç:

Global adres sistemi release-ready hale getirilir.

Yapılacaklar:

1. `docs/global-address-provider-setup.md` oluştur.
2. Provider cost/rate-limit notlarını yaz.
3. Env değişkenlerini dokümante et.
4. E2E testleri çalıştır.
5. README güncelle.
6. CHANGELOG güncelle.
7. GitHub tag oluştur.

Final testler:

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

Commit/tag:

```bash
git add .
git commit -m "docs: finalize global address localization support"
git push
git tag v1.4.0-global-address
git push origin v1.4.0-global-address
```

---

## 11. Env Değişkenleri

```env
# Address Provider
ADDRESS_PROVIDER=manual
ADDRESS_PROVIDER_FALLBACK=manual

# Google Places
GOOGLE_MAPS_API_KEY=
GOOGLE_PLACES_API_KEY=

# Mapbox
MAPBOX_ACCESS_TOKEN=

# Apple MapKit
APPLE_MAPKIT_TEAM_ID=
APPLE_MAPKIT_KEY_ID=
APPLE_MAPKIT_PRIVATE_KEY=

# OSM / Self-hosted Nominatim
NOMINATIM_BASE_URL=
NOMINATIM_USER_AGENT=RandevoAddressSearch/1.0

# Address Search Safety
ADDRESS_AUTOCOMPLETE_MIN_CHARS=3
ADDRESS_AUTOCOMPLETE_DEBOUNCE_MS=350
ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE=30
```

---

## 12. Provider Seçimi İçin Karar Tablosu

| Seçenek | Avantaj | Dezavantaj | Öneri |
|---|---|---|---|
| Google Places | Kapsama güçlü, autocomplete iyi | Maliyet/vendor lock-in | İlk global MVP için iyi |
| Mapbox Search | Modern autocomplete, web/mobile iyi | Yine ücretli ve kota var | Google alternatifi olarak iyi |
| Apple MapKit | Apple ekosisteminde iyi | Web/global SaaS için daha sınırlı pratik | iOS app tarafında düşün |
| OSM/Nominatim public | Açık veri | Public server yoğun autocomplete için uygun değil | Production için doğrudan kullanma |
| Self-hosted OSM/Pelias | Kontrol yüksek | DevOps maliyeti yüksek | Büyüyünce değerlendir |

---

## 13. Final Tavsiye

Bu proje için en mantıklı yol:

```txt
1. Türkiye gibi ana pazarlarda local structured data tut.
2. Global pazarda provider-based autocomplete kullan.
3. Seçilen adresi normalize edip kendi DB’ne kaydet.
4. Tüm sağlayıcıları AddressProvider interface arkasına al.
5. Başta Google Places veya Mapbox ile çık.
6. Maliyet büyürse OSM tabanlı self-hosted çözüme geçmeyi değerlendir.
```

Kesinlikle önerilmeyen yol:

```txt
Tüm dünya ülkelerini, şehirlerini, ilçelerini ve mahallelerini elle girmek.
```

---

## 14. Claude Code Ana Prompt

```txt
Read SLOTPILOT_GLOBAL_ADDRESS_LOCALIZATION_ROADMAP.md carefully.

We are adding global address localization to Randevo/SlotPilot.
Do not implement all phases at once.

Start with Phase ADDR-0 only:
- Audit current Turkey address system.
- Create docs/global-address-strategy.md.
- Run baseline tests.
- Do not change product behavior yet.
- Commit and push only if tests pass.

Important:
- Do not manually hardcode every city/district in the world.
- Use provider abstraction.
- Keep Turkey structured data working.
- Every phase must run tests/build.
- Every 2 phases update docs/COMPACT_STATE.md and run/request /compact.
```

---

## 15. Final Definition of Done

```txt
- Global address strategy documented.
- AddressProvider abstraction exists.
- NormalizedAddress model exists.
- Country-specific address forms exist.
- Address autocomplete component works.
- At least one real provider is implemented behind adapter.
- Manual fallback exists.
- Turkey il/ilçe system still works.
- Global marketplace location filters work.
- Mobile address picker exists.
- Tests pass.
- Build passes.
- GitHub push and tag completed.
```
