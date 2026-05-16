# Randevo — Dark Select, Global Phone Codes ve Türkiye İlçe Data Fix Planı

> Amaç: Randevo projesindeki üç kritik problemi çözmek:
>
> 1. Dark theme içinde native select dropdown’ların beyaz kalması ve yazıların okunmaması  
> 2. Ülke seçimine rağmen telefon alan kodunun yanlış şekilde `+90` kalması  
> 3. Türkiye ilçe datasında eksik ilçelerin tamamlanması  
>
> Bu plan hem **Codex** hem de **Claude Code** ile phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Görülen Sorunlar

Ekran görüntülerinden görülen hatalar:

```txt
- Country select dark tema içinde kapalıyken iyi görünüyor ama açıldığında dropdown beyaz kalıyor.
- Dropdown içindeki yazılar çok açık renkli olduğu için okunmuyor.
- İl ve ilçe selectleri de aynı şekilde beyaz/native dropdown olarak açılıyor.
- Country olarak Germany / Netherlands / Spain seçilse bile telefon input placeholder/default değer +90 kalıyor.
- Ülke seçimine göre telefon alan kodu otomatik değişmiyor.
- Türkiye ilçe verilerinde bazı ilçeler eksik.
```

---

## 2. Kök Sebep Analizi

### 2.1 Select Dropdown Neden Beyaz Kalıyor?

Muhtemel sebep:

```txt
Native HTML <select> kullanılıyor.
Tarayıcı native dropdown paneli işletim sistemi/browser tarafından çiziliyor.
CSS ile tam kontrol edilemiyor.
Dark theme classları input alanına uygulanıyor ama açılan option listesine uygulanmıyor.
```

Doğru çözüm:

```txt
Native select yerine theme-aware custom Select/Listbox component kullanılmalı.
```

Öneri:

```txt
- shadcn/radix Select varsa onu kullan.
- Yoksa project içinde custom ThemedSelect/Listbox yaz.
- Country, province, district ve diğer kritik dropdownlar bu componenti kullanmalı.
```

---

### 2.2 Telefon Alan Kodu Neden +90 Kalıyor?

Muhtemel sebep:

```txt
Phone input default country TR olarak hard-code edilmiş.
Country değişince phoneDialCode state’i güncellenmiyor.
Placeholder direkt "+90 555 000 0000" yazılmış.
Country config içinde phoneCode var ama form componentine bağlanmamış.
```

Doğru çözüm:

```txt
Country değişince phoneDialCode da değişmeli.
Telefon placeholder ülkeye göre güncellenmeli.
Telefon normalize/validate işlemi selectedCountry üzerinden yapılmalı.
```

Örnek:

```txt
TR -> +90
DE -> +49
NL -> +31
ES -> +34
IT -> +39
US -> +1
GB -> +44
FR -> +33
```

---

## 3. Kritik Ürün Kararı

Tüm dünya ülkeleri için alan kodu datası manuel olarak da eklenebilir ama uzun vadede en sağlıklı yaklaşım:

```txt
ISO 3166 country code -> international calling code mapping
```

Önerilen teknik çözüm:

```txt
1. src/data/country-phone-codes.ts dosyasında tüm ISO ülkeleri için dialCode datası tutulur.
2. src/lib/phone/country-calling-code.ts helper ile ülkeye göre kod alınır.
3. Daha güçlü validate/format için libphonenumber-js entegrasyonu opsiyonel olarak eklenir.
4. Testler +90 hard-code bug’ını yakalayacak şekilde yazılır.
```

---

## 4. Hedef Davranış

Bu güncellemeden sonra:

```txt
- Select dropdown’lar dark theme içinde okunabilir olacak.
- Country select beyaz native dropdown olarak açılmayacak.
- İl/ilçe selectleri de aynı themed componenti kullanacak.
- Country değişince telefon alan kodu otomatik değişecek.
- Spain seçilince +34 görünecek.
- Germany seçilince +49 görünecek.
- Netherlands seçilince +31 görünecek.
- Turkey seçilince +90 görünecek.
- Telefon placeholder ülkeye göre değişecek.
- Telefon normalize fonksiyonu selectedCountry bazlı çalışacak.
- Türkiye ilçe datası tamamlanacak.
- İl seçilince sadece o ilin ilçeleri listelenecek.
- TR dışındaki ülkelerde Türkiye il/ilçe dropdownları görünmeyecek.
```

---

## 5. Kritik Kurallar

```txt
- Native select problemliyse global formlarda ThemedSelect kullanılmalı.
- UI select stilleri dark/light theme ile uyumlu olmalı.
- Country seçimi sadece UI’da kalmamalı, form state ve phone state’i güncellemeli.
- +90 global default olarak kullanılmamalı.
- +90 sadece countryCode === "TR" iken kullanılmalı.
- Kullanıcının daha önce yazdığı telefon numarası ülke değişince tamamen silinmemeli; mümkünse national number kısmı korunmalı.
- Telefon validasyonu country-aware olmalı.
- Türkiye ilçe datası güvenilir kaynak datasına göre tamamlanmalı.
- Eksik ilçe testleri yazılmalı.
```

---

## 6. Yeni / Güncellenecek Dosyalar

Önerilen dosyalar:

```txt
src/components/ui/themed-select.tsx
src/components/forms/CountrySelect.tsx
src/components/forms/ProvinceSelect.tsx
src/components/forms/DistrictSelect.tsx
src/components/forms/PhoneInput.tsx

src/data/country-phone-codes.ts
src/data/turkey-districts.ts
src/data/turkey-provinces.ts

src/lib/phone/country-calling-code.ts
src/lib/phone/phone-format.ts
src/lib/phone/phone-normalize.ts

src/lib/address/turkey-location.ts

docs/dark-select-phone-district-bug-report.md
docs/global-phone-code-strategy.md
docs/turkey-district-data-audit.md
```

---

## 7. Country Phone Code Data Model

`src/data/country-phone-codes.ts` için önerilen yapı:

```ts
export type CountryPhoneCode = {
  iso2: string;
  name: string;
  dialCode: string;
  flag?: string;
  example?: string;
};

export const COUNTRY_PHONE_CODES: CountryPhoneCode[] = [
  { iso2: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷", example: "+90 555 000 0000" },
  { iso2: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", example: "+49 1512 3456789" },
  { iso2: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", example: "+31 6 12345678" },
  { iso2: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", example: "+34 612 34 56 78" }
];
```

Final beklenti:

```txt
Bu dosya sadece örnek ülkelerle kalmayacak.
Tüm ISO ülkeleri için dialCode datası eklenecek.
```

---

## 8. Phone Helper Mantığı

`src/lib/phone/country-calling-code.ts`:

```ts
import { COUNTRY_PHONE_CODES } from "@/data/country-phone-codes";

export function getCallingCodeForCountry(countryCode: string): string {
  const country = COUNTRY_PHONE_CODES.find(
    (item) => item.iso2.toUpperCase() === countryCode.toUpperCase()
  );

  return country?.dialCode ?? "";
}
```

Kural:

```txt
Fallback olarak körlemesine +90 dönme.
Eğer country bilinmiyorsa boş değer veya app default market kodu controlled şekilde dönmeli.
```

---

## 9. Phone Input UX Kararı

En iyi UX:

```txt
[+49] [telefon numarası]
```

Yani:

```txt
- Dial code ayrı küçük select/gösterge
- National number ayrı input
```

Country değişince:

```txt
1. selectedCountry güncellenir.
2. phoneDialCode güncellenir.
3. placeholder güncellenir.
4. national number mümkünse korunur.
```

Örnek:

```txt
Country TR, phone: +90 555 000 0000
Country DE seçildi
Yeni görünüm: +49 555 000 0000 veya national number kısmı korunur.
```

---

## 10. Türkiye İlçe Data Model

Önerilen yapı:

```ts
export type TurkeyDistrict = {
  provinceCode: string;
  provinceName: string;
  districtName: string;
  slug: string;
};

export const TURKEY_DISTRICTS: TurkeyDistrict[] = [
  { provinceCode: "34", provinceName: "İstanbul", districtName: "Kadıköy", slug: "kadikoy" },
  { provinceCode: "35", provinceName: "İzmir", districtName: "Konak", slug: "konak" }
];
```

Test hedefi:

```txt
- Türkiye 81 il desteklenmeli.
- Her ilin en az bir ilçesi olmalı.
- İstanbul, Ankara, İzmir, Bursa, Antalya gibi büyükşehirlerde tüm ilçeler bulunmalı.
- İlçe seçimi il seçimine göre filtrelenmeli.
- Duplicate slug varsa provinceCode ile ayrıştırılmalı.
```

---

# 11. Phase Planı

```txt
DPD-0 — Audit ve Bug Reproduction
DPD-1 — Themed Select Component
DPD-2 — Country Phone Code Data ve Helper
DPD-3 — Phone Input Country Binding
DPD-4 — Türkiye İlçe Datası Tamamlama
DPD-5 — Province/District Select Refactor
DPD-6 — E2E Regression ve UI QA
DPD-7 — Docs, Final QA ve Release
```

Her phase sonunda:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Varsa:

```bash
npm run i18n:check
npm run test:e2e
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
/compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 12. Phase Detayları

---

## DPD-0 — Audit ve Bug Reproduction

Amaç:

Sorunun hangi componentlerden kaynaklandığını bulmak.

Yapılacaklar:

```txt
1. Country select componentini bul.
2. Province select componentini bul.
3. District select componentini bul.
4. Phone input componentini bul.
5. +90 hard-code kullanımını ara.
6. Native <select> kullanımını ara.
7. turkey-provinces/turkey-districts datasını incele.
8. Eksik ilçe kaynaklarını belgelemek için docs/dark-select-phone-district-bug-report.md oluştur.
```

Arama komutları:

```bash
grep -R "<select" src
grep -R "option" src
grep -R "+90" src
grep -R "555 000" src
grep -R "phone" src/components src/app src/lib
grep -R "TURKEY_PROVINCES" src
grep -R "district" src/data src/lib src/components
```

Kabul kriteri:

```txt
- Ürün davranışı değişmedi.
- Hangi dosyaların düzeltileceği belgelendi.
- +90 hard-code noktaları listelendi.
- Native select noktaları listelendi.
```

Commit:

```bash
git add .
git commit -m "docs: audit select phone code and district data bugs"
git push
```

---

## DPD-1 — Themed Select Component

Amaç:

Native select yerine dark/light theme ile uyumlu ortak select componenti eklemek.

Yapılacaklar:

```txt
1. src/components/ui/themed-select.tsx oluştur.
2. Keyboard accessible listbox mantığı ekle.
3. Dark/light theme tokenlarını kullan.
4. Selected, hover, focus state ekle.
5. Scrollable dropdown max height ekle.
6. Country/province/district selectlere uyarlanabilir API tasarla.
7. Test ekle.
```

Component API önerisi:

```ts
type ThemedSelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
};

type ThemedSelectProps = {
  value: string;
  options: ThemedSelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
```

Testler:

```txt
- Dropdown dark theme’de beyaz açılmaz.
- Option text okunur.
- Keyboard ile seçim yapılabilir.
- Focus state görünür.
- Uzun listede scroll çalışır.
```

Commit:

```bash
git add .
git commit -m "feat: add theme-aware select component"
git push
```

Compact:

```txt
DPD-0 ve DPD-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## DPD-2 — Country Phone Code Data ve Helper

Amaç:

Tüm dünya ülkeleri için country -> dial code mapping oluşturmak.

Yapılacaklar:

```txt
1. src/data/country-phone-codes.ts oluştur.
2. Tüm ISO ülke kodları için dialCode verisi ekle.
3. Flag ve example alanlarını mümkünse ekle.
4. src/lib/phone/country-calling-code.ts helper yaz.
5. src/lib/phone/phone-format.ts helper yaz.
6. Tests yaz.
7. docs/global-phone-code-strategy.md oluştur.
```

Minimum test ülkeleri:

```txt
TR -> +90
DE -> +49
NL -> +31
ES -> +34
IT -> +39
FR -> +33
GB -> +44
US -> +1
CA -> +1
AU -> +61
RU -> +7
IR -> +98
SA -> +966
AE -> +971
BR -> +55
MX -> +52
JP -> +81
KR -> +82
IN -> +91
CN -> +86
```

Testler:

```txt
- Her ülke iso2 unique.
- Her dialCode + ile başlar.
- TR +90 döner.
- Spain +34 döner.
- Germany +49 döner.
- Netherlands +31 döner.
- Unknown country fallback güvenli çalışır.
```

Commit:

```bash
git add .
git commit -m "feat: add global country calling code data"
git push
```

---

## DPD-3 — Phone Input Country Binding

Amaç:

Country seçimi ile phone input alan kodunu bağlamak.

Yapılacaklar:

```txt
1. CountrySelect componentini ThemedSelect ile yenile.
2. PhoneInput componentini country-aware yap.
3. Country değişince dialCode güncellensin.
4. Placeholder ülkeye göre değişsin.
5. +90 hard-code placeholderları kaldır.
6. Register/login/profile/booking forms içinde phone input kullanımını güncelle.
7. Telefon normalize helperını selectedCountry ile çalıştır.
```

Beklenen davranış:

```txt
Country Turkey -> +90
Country Spain -> +34
Country Germany -> +49
Country Netherlands -> +31
```

Testler:

```txt
- Spain seçilince phone prefix +34 olur.
- Germany seçilince phone prefix +49 olur.
- Netherlands seçilince phone prefix +31 olur.
- Turkey seçilince phone prefix +90 olur.
- Form submit selectedCountry + nationalNumber ile doğru normalize eder.
- Country değişince eski +90 kalmaz.
```

Commit:

```bash
git add .
git commit -m "fix: bind phone country code to selected country"
git push
```

Compact:

```txt
DPD-2 ve DPD-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## DPD-4 — Türkiye İlçe Datası Tamamlama

Amaç:

Türkiye’de eksik ilçeleri tamamlamak ve testle korumak.

Yapılacaklar:

```txt
1. Mevcut turkey-provinces/turkey-districts datasını audit et.
2. Eksik ilçeleri tespit et.
3. Türkiye 81 il datasını koru.
4. Tüm ilçeleri provinceCode ile ekle.
5. Slug normalize helper kullan.
6. Duplicate kontrol et.
7. docs/turkey-district-data-audit.md oluştur.
```

Önemli testler:

```txt
- 81 il var.
- Her ilin district listesi boş değil.
- İstanbul ilçeleri eksiksiz.
- Ankara ilçeleri eksiksiz.
- İzmir ilçeleri eksiksiz.
- Bursa, Antalya, Kocaeli, Konya, Adana, Mersin gibi büyükşehirlerde ilçe datası eksiksiz.
- Duplicate district slug yok veya aynı isim farklı illerde provinceCode ile ayrışıyor.
```

Commit:

```bash
git add .
git commit -m "data: complete Turkey district dataset"
git push
```

---

## DPD-5 — Province/District Select Refactor

Amaç:

İl ve ilçe selectlerini ThemedSelect ve eksiksiz data ile çalıştırmak.

Yapılacaklar:

```txt
1. ProvinceSelect componentini ThemedSelect ile yenile.
2. DistrictSelect componentini ThemedSelect ile yenile.
3. Country TR değilse province/district dropdownlarını gizle veya global locality input göster.
4. Province seçilince district listesi filtrelensin.
5. Province değişince eski district state temizlensin.
6. İl/ilçe dropdownları dark theme’de okunabilir olsun.
```

Beklenen davranış:

```txt
Country TR -> İl seç + İlçe seç görünür.
Country DE/NL/ES -> İl/ilçe yerine city/locality input veya provider autocomplete görünür.
```

Testler:

```txt
- TR seçiliyken il dropdown dark theme’de okunur.
- İl seçilince ilçe dropdown doğru filtrelenir.
- Province değişince district temizlenir.
- NL/DE/ES seçiliyken Türkiye ilçeleri görünmez.
- Native select beyaz dropdown bug’ı kalmaz.
```

Commit:

```bash
git add .
git commit -m "fix: make province and district selects theme-aware"
git push
```

Compact:

```txt
DPD-4 ve DPD-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## DPD-6 — E2E Regression ve UI QA

Amaç:

Hataların geri gelmemesi için E2E test eklemek.

Yapılacaklar:

```txt
1. E2E test: Country Spain seç -> phone +34.
2. E2E test: Country Germany seç -> phone +49.
3. E2E test: Country Netherlands seç -> phone +31.
4. E2E test: Country Turkey seç -> phone +90.
5. E2E test: Province select dark theme’de okunabilir.
6. E2E test: Turkey province -> district filter çalışır.
7. E2E test: Non-TR country -> Turkey provinces/districts görünmez.
```

Commit:

```bash
git add .
git commit -m "test: add phone code and dark select regression coverage"
git push
```

---

## DPD-7 — Docs, Final QA ve Release

Amaç:

Düzeltmeleri dokümante edip release etmek.

Yapılacaklar:

```txt
1. docs/global-phone-code-strategy.md güncelle.
2. docs/turkey-district-data-audit.md güncelle.
3. docs/dark-select-phone-district-bug-report.md güncelle.
4. README’ye country phone code ve themed select notu ekle.
5. CHANGELOG güncelle.
6. Final testleri çalıştır.
7. Release tag oluştur.
```

Final komutlar:

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
git commit -m "chore: finalize phone code district and select fixes"
git push
git tag v1.6.3-phone-district-select-fix
git push origin v1.6.3-phone-district-select-fix
```

---

# 13. Codex Ana Prompt

```txt
Read RANDEVO_DARK_SELECT_PHONE_DISTRICT_FIX_PLAN.md completely.

We need to fix:
1. Native select dropdowns are white and unreadable in dark theme.
2. Country selection does not update phone dialing code.
3. Spain/Germany/Netherlands still show or keep +90 incorrectly.
4. All world country phone codes must be integrated.
5. Turkey district dataset has missing districts.

Do not implement everything randomly.
Follow DPD-0 through DPD-7 in order.

Start with DPD-0 only:
- Audit country/province/district select components.
- Audit phone input components and +90 hard-codes.
- Audit Turkey province/district data.
- Create docs/dark-select-phone-district-bug-report.md.
- Do not change behavior yet.
- Run tests/build.
- Commit and push only if checks pass.

Stop after DPD-0 and summarize.
```

---

# 14. Full Auto Prompt

```txt
Read RANDEVO_DARK_SELECT_PHONE_DISTRICT_FIX_PLAN.md completely.

Implement all phases from DPD-0 to DPD-7 in order.

After each phase:
- Run all available checks.
- Fix failures before continuing.
- Commit with a meaningful message.
- Push only if checks pass.
- Update CHANGELOG.md if it exists.

After every 2 phases:
- Update docs/COMPACT_STATE.md.
- Run/request /compact.

Critical rules:
- Do not break existing Turkey support.
- Do not keep +90 as global hard-coded phone prefix.
- +90 only appears for TR.
- Country selection must update phone dialing code.
- All ISO countries must have dialCode data.
- Native select white dropdown bug must be fixed using a themed component.
- TR shows province/district selects.
- Non-TR countries do not show Turkey province/district lists.
- Turkey district data must be complete and tested.
- Do not commit secrets.
- Do not force push.
```

---

# 15. Final Definition of Done

```txt
- Country dropdown is readable in dark theme.
- Province dropdown is readable in dark theme.
- District dropdown is readable in dark theme.
- Native white dropdown bug is fixed or avoided.
- Spain selected -> phone code +34.
- Germany selected -> phone code +49.
- Netherlands selected -> phone code +31.
- Turkey selected -> phone code +90.
- All ISO countries have phone dial code mapping.
- +90 hard-code placeholders are removed.
- Phone normalization uses selected country.
- Turkey 81 province data still works.
- Turkey district dataset is completed.
- Province -> district filtering works.
- Non-TR countries do not show Turkey province/district dropdowns.
- E2E regression tests exist.
- Build passes.
- Tests pass.
- GitHub push and tag completed.
```
