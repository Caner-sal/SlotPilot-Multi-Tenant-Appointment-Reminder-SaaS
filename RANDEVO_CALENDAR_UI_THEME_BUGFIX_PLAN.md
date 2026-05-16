# Randevo — Takvim, UI Tema ve Localization Bugfix Planı

> Bu dosya Randevo projesindeki booking takvimi, dashboard arayüz tutarsızlığı, dil/localization karışıklığı ve tema uyumsuzluklarını düzeltmek için hazırlanmıştır.  
> Plan hem **Codex** hem de **Claude Code** ile phase phase uygulanacak şekilde yazılmıştır.

---

## 1. Görülen Sorunlar

Ekran görüntülerinden görülen başlıca problemler:

```txt
1. Randevu tarih seçimi gerçek takvim gibi çalışmıyor.
2. Sadece belirli gün kartları görünüyor.
3. Kullanıcı sonraki ayı veya istediği tarihi seçemiyor.
4. UI seçilen dile göre değişiyor gibi görünüyor ama data ve bazı metinler karışık kalıyor.
5. Almanca UI açıkken hizmet adları Türkçe kalıyor.
6. Dashboard karanlık temada ama tablo/kart beyaz ve uyumsuz duruyor.
7. Bazı yazılar çok düşük kontrastlı, okunmuyor.
8. Form/select/dropdown bileşenleri sitenin genel temasıyla uyumlu değil.
9. Public booking ekranı ile dashboard ekranı farklı tasarım sistemleri kullanıyor gibi görünüyor.
```

---

## 2. Kök Sebep Analizi

### 2.1 Takvim Neden Açılmıyor?

Muhtemel sebep:

```txt
Booking sayfasında gerçek Calendar/DatePicker component yok.
Bunun yerine backend veya frontend belirli bir tarih aralığı oluşturuyor.
Örneğin sonraki 14 günü kart olarak gösteriyor.
```

Bu nedenle kullanıcı:

```txt
- Gelecek aya geçemiyor.
- Takvim popup açamıyor.
- Sadece sistemin oluşturduğu günleri görebiliyor.
```

Doğru davranış:

```txt
Kullanıcı gerçek takvimden ay değiştirebilmeli.
Bir tarih seçebilmeli.
Sistem o tarih için uygun saatleri backend’den sorgulamalı.
```

---

### 2.2 Dil Karışıklığı Neden Oluyor?

Ekranda:

```txt
- UI Almanca: Leistungen, Datum auswählen, Bearbeiten
- Hizmet adı Türkçe: Sakal Tıraşı, Saç Kesimi
- Para birimi TL
```

Bu tamamen hata olmak zorunda değil.

Çünkü:

```txt
UI metinleri uygulamanın çeviri dosyalarından gelir.
Hizmet adları ise işletme sahibinin girdiği user-generated content'tir.
```

Yani Alman kullanıcı arayüzü Almanca olabilir ama işletmenin kendi hizmet adı Türkçe kalabilir.

Ama sistemde net ayrım yapılmalı:

```txt
1. UI strings -> i18n dictionary ile çevrilir.
2. Business data -> işletme ne girdiyse o kalır.
3. İstenirse service translation fields eklenir.
```

Eksik olan şey:

```txt
User-generated service data için multilingual content stratejisi yok.
```

---

### 2.3 Tema Neden Uyumlu Değil?

Ekranda dashboard koyu tema ama tablo beyaz. Bu şu anlama gelir:

```txt
Bazı componentler design system tokenlarını kullanmıyor.
Hard-coded bg-white, text-gray, border-gray gibi classlar var.
```

Doğru yaklaşım:

```txt
Card, Table, Button, Input, Select, Badge, Calendar gibi tüm componentler aynı design token sistemini kullanmalı.
```

---

## 3. Hedef Davranış

Bu güncellemeden sonra:

```txt
- Booking sayfasında gerçek calendar/date picker olacak.
- Kullanıcı ileri/geri ay değiştirebilecek.
- Kullanıcı istediği ay ve günden randevu seçebilecek.
- Seçilen tarih için uygun saatler ayrıca yüklenecek.
- Kapalı/uygun olmayan günler disabled görünecek.
- Dashboard ve public booking aynı tasarım dilini kullanacak.
- Dark theme ve light theme uyumlu olacak.
- i18n UI stringleri tutarlı olacak.
- User-generated content için çeviri stratejisi netleşecek.
- Düşük kontrastlı metinler düzeltilecek.
- Native select/dropdown yerine tema uyumlu componentler kullanılacak.
```

---

## 4. Kritik Kurallar

```txt
- Booking engine mantığı bozulmayacak.
- Double booking prevention korunacak.
- Takvim sadece UI olmayacak; seçilen tarihte backend slot sorgusu çalışacak.
- Client tarafı slot varmış gibi davranmayacak.
- Disabled/closed/holiday günler doğru gösterilecek.
- UI stringleri hard-code edilmeyecek.
- Hizmet adı gibi işletme verileri otomatik çevrilmeyecek; translation field yoksa olduğu gibi kalacak.
- Theme classları hard-code edilmek yerine component/design token üzerinden gelecek.
```

---

# 5. Phase Planı

```txt
CALUI-0 — UI/Calendar/i18n Audit
CALUI-1 — Booking Calendar Component
CALUI-2 — Date-based Slot Fetching API Integration
CALUI-3 — Dashboard Design System Refactor
CALUI-4 — i18n Data vs UI Content Strategy
CALUI-5 — Accessibility, Contrast ve Responsive QA
CALUI-6 — E2E Regression, Release ve GitHub Push
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

E2E olan phase’lerde:

```bash
npm run test:e2e
```

Her 2 phase sonrası:

```txt
docs/COMPACT_STATE.md güncellenecek.
Claude Code kullanılıyorsa /compact çalıştırılacak veya kullanıcıdan istenecek.
```

---

# 6. Phase Detayları

---

## CALUI-0 — UI/Calendar/i18n Audit

Amaç:

Hatanın hangi dosyalardan kaynaklandığını net tespit etmek.

Yapılacaklar:

```txt
1. Public booking sayfasını incele.
2. Tarih kartlarının nerede üretildiğini bul.
3. Calendar/date picker component var mı kontrol et.
4. Dashboard services page componentlerini incele.
5. bg-white, text-gray, border-gray gibi hard-coded classları tara.
6. i18n stringlerin nereden geldiğini incele.
7. Service/user-generated content ile UI translation ayrımı var mı kontrol et.
8. docs/ui-calendar-i18n-bug-report.md oluştur.
```

Aranacak ifadeler:

```bash
grep -R "Datum auswählen" src
grep -R "Leistungen" src
grep -R "bg-white" src
grep -R "text-gray" src
grep -R "availableDates" src
grep -R "slice(0" src
grep -R "Mai" src
grep -R "Tarih" src
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: audit booking calendar and UI theme bugs"
git push
```

---

## CALUI-1 — Booking Calendar Component

Amaç:

Kart listesi yerine gerçek takvim/date picker eklemek.

Yapılacaklar:

```txt
1. Reusable Calendar component oluştur.
2. Ay ileri/geri navigation ekle.
3. Seçili tarih state’i ekle.
4. Bugünün öncesini disabled yap.
5. İşletmenin açık olmadığı günleri disabled göster.
6. Loading state ekle.
7. Empty state ekle.
8. Mobile responsive calendar grid oluştur.
9. Public booking sayfasındaki eski sabit tarih kartlarını kaldır.
```

Önerilen componentler:

```txt
src/components/ui/calendar.tsx
src/components/booking/BookingDatePicker.tsx
src/components/booking/BookingSlotList.tsx
```

Beklenen davranış:

```txt
- Kullanıcı Mayıs’tan Haziran’a geçebilir.
- Kullanıcı sonraki ay bir tarih seçebilir.
- Seçilen gün görsel olarak vurgulanır.
- Kapalı günler disabled görünür.
```

Testler:

```txt
- Calendar render olur.
- Next month butonu çalışır.
- Previous month butonu çalışır.
- Past dates disabled olur.
- Selected date state güncellenir.
```

Commit:

```bash
git add .
git commit -m "feat: add full booking calendar component"
git push
```

Compact:

```txt
CALUI-0 ve CALUI-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## CALUI-2 — Date-based Slot Fetching API Integration

Amaç:

Seçilen tarihe göre slotların backend’den gelmesini sağlamak.

Yapılacaklar:

```txt
1. Booking slot API’sini incele.
2. API date parametresi kabul ediyor mu kontrol et.
3. Gerekirse endpoint’i şu hale getir:
   GET /api/booking/[slug]/slots?serviceId=...&staffId=...&date=YYYY-MM-DD
4. Calendar date seçilince slot fetch tetikle.
5. Slot loading skeleton ekle.
6. Slot yoksa doğru empty state göster.
7. Kapalı günlerde API gereksiz çağrılmasın.
8. Error state ekle.
9. Booking engine regression testlerini güncelle.
```

Testler:

```txt
- 2026-06-10 seçilince API o tarih için çağrılır.
- Slot varsa listelenir.
- Slot yoksa "Uygun saat bulunamadı" gösterilir.
- Kapalı günlerde slot gösterilmez.
- Double booking prevention bozulmaz.
```

Commit:

```bash
git add .
git commit -m "feat: fetch booking slots by selected calendar date"
git push
```

---

## CALUI-3 — Dashboard Design System Refactor

Amaç:

Dashboard’un sitenin genel temasıyla uyumlu hale gelmesi.

Yapılacaklar:

```txt
1. Ortak design tokenları kontrol et.
2. Card, Table, Button, Input, Select, Badge componentlerini standardize et.
3. Services page tablosundaki beyaz/uyumsuz arka planı düzelt.
4. Dark theme kontrastlarını düzelt.
5. Status badge renklerini tema uyumlu yap.
6. Action linklerini button variant haline getir.
7. Table header/body spacing düzelt.
8. Dashboard page title görünürlüğünü düzelt.
9. Componentlerde hard-coded renkleri azalt.
```

Kontrol edilecek yerler:

```txt
/dashboard/services
/dashboard/staff
/dashboard/appointments
/dashboard/availability
/admin
/staff
```

Testler:

```txt
- Services page dark theme ile uyumlu görünür.
- Header text okunur.
- Table rows okunur.
- Active/Inactive badge okunur.
- Buttonlar tasarımla uyumludur.
```

Commit:

```bash
git add .
git commit -m "style: align dashboard tables with design system"
git push
```

Compact:

```txt
CALUI-2 ve CALUI-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## CALUI-4 — i18n Data vs UI Content Strategy

Amaç:

UI dili ile işletmenin girdiği içerik arasındaki ayrımı netleştirmek.

Yapılacaklar:

```txt
1. docs/i18n-content-strategy.md oluştur.
2. UI strings dictionary’den gelsin.
3. Business data olduğu gibi kalsın.
4. Service translation fields için opsiyonel plan yaz.
5. Eğer uygulanacaksa ServiceTranslation modeli planla:
   - serviceId
   - locale
   - name
   - description
6. Dashboard service table’da UI labels çevrilsin ama service data değişmesin.
7. Public booking’de hizmet adı için fallback stratejisi uygula.
```

İlk MVP kararı:

```txt
- UI çevrilir.
- Hizmet adı/işletme adı otomatik çevrilmez.
- İşletme isterse ileride çok dilli hizmet adı girer.
```

Testler:

```txt
- Almanca UI’da tablo başlıkları Almanca görünür.
- Türkçe hizmet adı korunur.
- İngilizce UI’da action label İngilizce görünür.
- Missing translation key yoktur.
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
git commit -m "docs: define UI translation and business content strategy"
git push
```

---

## CALUI-5 — Accessibility, Contrast ve Responsive QA

Amaç:

Arayüzün okunabilir ve kullanılabilir hale gelmesi.

Yapılacaklar:

```txt
1. Color contrast audit yap.
2. Low contrast text classlarını düzelt.
3. Focus ring ekle.
4. Keyboard navigation kontrol et.
5. Calendar keyboard selection kontrol et.
6. Mobile calendar responsive kontrol et.
7. Services table mobile görünümünü düzelt.
8. Empty/loading/error state tasarımlarını standardize et.
9. docs/ui-accessibility-qa.md oluştur.
```

Testler:

```txt
- Keyboard ile calendar date seçilebilir.
- Tab focus görünür.
- Mobilde tablo yatay taşmaz veya card layout’a döner.
- Low contrast text kalmaz.
- Error states okunur.
```

Commit:

```bash
git add .
git commit -m "fix: improve UI contrast accessibility and responsive states"
git push
```

Compact:

```txt
CALUI-4 ve CALUI-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## CALUI-6 — E2E Regression, Release ve GitHub Push

Amaç:

Hataların geri gelmemesi için E2E test eklemek.

Yapılacaklar:

```txt
1. Booking calendar e2e testi ekle.
2. Next month navigation testi ekle.
3. Selected date slot fetching testi ekle.
4. Dashboard services UI smoke testi ekle.
5. i18n UI/data ayrımı testi ekle.
6. CHANGELOG güncelle.
7. README kısa not ekle.
8. Release tag oluştur.
```

E2E test senaryoları:

```txt
1. Public booking sayfasını aç.
2. Hizmet/personel seç.
3. Calendar next month butonuna bas.
4. Sonraki aydan bir tarih seç.
5. Slot request’in seçilen tarihle gittiğini doğrula.
6. Slot yoksa empty state görünür.
7. Dashboard services sayfasını aç.
8. Services table dark theme ile uyumlu görünür.
9. UI Almanca seçiliyken hizmet adının user data olarak korunduğunu doğrula.
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
git commit -m "fix: finalize booking calendar and UI theme regression"
git push
git tag v1.6.1-calendar-ui-fix
git push origin v1.6.1-calendar-ui-fix
```

---

# 7. Codex Prompt

```txt
Read RANDEVO_CALENDAR_UI_THEME_BUGFIX_PLAN.md completely.

We have UI and booking bugs:
1. Public booking date selection is not a real calendar.
2. Users cannot select next month or arbitrary future dates.
3. Dashboard services page does not match the dark theme/design system.
4. Some UI strings are translated but business content remains Turkish, causing confusion.
5. Some text has poor contrast.

Start with CALUI-0 only:
- Audit public booking date selection.
- Find where available date cards are generated.
- Search for hard-coded UI/theme classes.
- Search for i18n/data mixing.
- Create docs/ui-calendar-i18n-bug-report.md.
- Do not change behavior yet.
- Run tests/build.
- Commit and push only if checks pass.

Stop after CALUI-0 and summarize.
```

---

# 8. Claude Code Prompt

```txt
Read RANDEVO_CALENDAR_UI_THEME_BUGFIX_PLAN.md carefully.

Start with CALUI-0 only.

Tasks:
- Inspect public booking date selection.
- Inspect dashboard services UI.
- Inspect design system components.
- Inspect i18n usage.
- Create docs/ui-calendar-i18n-bug-report.md.
- Do not change behavior yet.
- Run:
  npm run typecheck
  npm run lint
  npm test
  npm run build
  npx prisma validate
  npx prisma generate

Rules:
- Do not implement all phases at once.
- Calendar must eventually support month navigation.
- Do not break booking engine or double booking prevention.
- Do not auto-translate business data.
- Every phase must have tests.
- Every 2 phases update docs/COMPACT_STATE.md and run/request /compact.

Stop after CALUI-0 and summarize.
```

---

# 9. Final Definition of Done

```txt
- Booking page has real calendar/date picker.
- User can navigate to next/previous month.
- User can select future dates beyond current fixed range.
- Slot API fetches by selected date.
- Closed/past/unavailable days are disabled.
- Double booking prevention still works.
- Dashboard tables match the theme.
- Services page text contrast is fixed.
- UI strings are translated through i18n.
- Business-entered service names are intentionally preserved.
- Optional service translation strategy is documented.
- Mobile/responsive view works.
- E2E calendar regression tests exist.
- Build passes.
- Tests pass.
- GitHub push and tag are completed.
```

---

# 10. Final Review Prompt

```txt
Review the calendar and UI theme bugfix implementation.

Check:
1. Does booking date selection use a real calendar?
2. Can users navigate to next month?
3. Can users select future dates beyond the initial visible range?
4. Does selected date fetch slots from backend?
5. Are closed/past days disabled?
6. Did double booking prevention remain intact?
7. Does dashboard services page match the dark theme?
8. Is text contrast readable?
9. Are UI strings translated correctly?
10. Are business service names intentionally preserved?
11. Are E2E regression tests added?
12. Do all tests pass?
13. Does build pass?
14. Has everything been committed and pushed?

Fix only small issues.
Do not add unrelated features.
Create final release notes.
```
