# Randevo — Staff Portal ve Super Admin Panel Planı

> Amaç: Randevo projesine iki kritik yönetim modülü eklemek:
> 1. **Gelişmiş Personel Girişi ve /staff Portalı**
> 2. **Super Admin / Platform Yönetim Paneli**

Bu plan hem **Codex** hem de **Claude Code** için phase phase uygulanacak şekilde hazırlanmıştır.

---

## 1. Problem

Şu an platformda işletme sahibi neredeyse tüm yönetimi tek başına yapıyor. Bu yapı küçük demo için yeterli olsa da gerçek kullanımda kısıtlı kalır.

Eksikler:

```txt
- Çalışanlar kendi randevularını göremiyor.
- Çalışanlar kendi müsaitliklerini yönetemiyor.
- Staff invite / davet sistemi yok veya tamamlanmamış.
- Staff route yetkilendirmesi net değil.
- Platform sahibi tüm işletmeleri merkezi panelden yönetemiyor.
- Abonelik, kullanım limiti, suspend/activate gibi SaaS yönetim aksiyonları için /admin paneli gerekiyor.
```

---

## 2. Hedef Davranış

### 2.1 Staff Portal

Çalışan:

```txt
- Davet linki ile sisteme katılır.
- /staff paneline giriş yapar.
- Sadece kendi randevularını görür.
- Kendi müsaitliğini görüntüler/günceller.
- Kendisine atanmış hizmetleri görür.
- Kendi randevularında status güncelleyebilir.
- Billing, owner settings, superadmin paneli ve başka çalışan datalarına erişemez.
```

### 2.2 Super Admin Panel

Platform sahibi:

```txt
- /admin paneline girer.
- Tüm işletmeleri listeler.
- İşletme detaylarını görür.
- Abonelik planlarını ve kullanım limitlerini takip eder.
- İşletmeleri suspend/activate yapabilir.
- Audit logları ve sistem sağlık durumunu görebilir.
```

---

## 3. Temel Güvenlik Kuralları

```txt
- Staff sadece kendi organizationId + staffId kapsamındaki verileri görebilir.
- Client’tan gelen organizationId’ye güvenilmez.
- Owner başka organization verisini göremez.
- Staff billing ve admin route’larına erişemez.
- Superadmin route’ları platformRole === SUPERADMIN ile korunur.
- StaffInvite token düz metin database’de tutulmaz, hashlenir.
- Suspend/activate gibi kritik aksiyonlar audit log üretir.
```

---

## 4. Veri Modeli Planı

### 4.1 StaffInvite

```txt
StaffInvite
- id
- organizationId
- staffId nullable
- invitedEmail
- invitedName
- tokenHash
- role
- status: PENDING | ACCEPTED | EXPIRED | REVOKED
- expiresAt
- acceptedAt nullable
- createdByUserId
- createdAt
- updatedAt
```

Kurallar:

```txt
- Raw token sadece davet linkinde üretilir, database’e yazılmaz.
- tokenHash saklanır.
- Token tek kullanımlıktır.
- Süresi dolan davet kabul edilemez.
```

### 4.2 Staff - User Bağlantısı

Staff modelinde şu alanlar kontrol edilmeli:

```txt
Staff
- id
- organizationId
- userId nullable
- name
- email
- phone
- isActive
- createdAt
- updatedAt
```

### 4.3 Superadmin Role

User modeline veya ayrı role modeline:

```txt
platformRole: USER | SUPERADMIN
```

### 4.4 Organization Suspension

Organization modelinde:

```txt
status: ACTIVE | SUSPENDED | CANCELLED
suspendedAt nullable
suspendedReason nullable
suspendedByUserId nullable
```

---

## 5. Route Planı

### Staff Pages

```txt
/staff/login
/staff/invite/[token]
/staff/dashboard
/staff/appointments
/staff/appointments/[id]
/staff/availability
/staff/profile
```

### Staff API

```txt
POST /api/staff/invites
GET  /api/staff/invites
POST /api/staff/invites/[id]/revoke
POST /api/staff/accept-invite

GET   /api/staff/me
GET   /api/staff/me/appointments
PATCH /api/staff/me/appointments/[id]/status
GET   /api/staff/me/availability
PATCH /api/staff/me/availability
```

### Super Admin Pages

```txt
/admin
/admin/organizations
/admin/organizations/[id]
/admin/subscriptions
/admin/usage
/admin/audit-logs
/admin/health
```

### Super Admin API

```txt
GET   /api/admin/organizations
GET   /api/admin/organizations/[id]
PATCH /api/admin/organizations/[id]/status
GET   /api/admin/subscriptions
GET   /api/admin/usage
GET   /api/admin/audit-logs
GET   /api/admin/health
```

---

## 6. Kullanılacak Agent / Skill Önerileri

```txt
repo-audit-agent
tenant-isolation-review
prisma-migration-review
security-hardening-agent
booking-engine-regression
e2e-playwright-qa
observability-agent
release-github-push
```

Codex için:

```txt
AGENTS.md içindeki tenant, payment, auth ve test kurallarına uy.
Her phase ayrı branch/commit ile ilerlesin.
```

Claude Code için:

```txt
Her 2 phase sonrası docs/COMPACT_STATE.md güncelle.
Gerekirse /compact çalıştır.
```

---

# 7. Phase Planı

```txt
SAP-0 — Mevcut Role/Auth Audit
SAP-1 — StaffInvite ve Staff-User Data Model
SAP-2 — Staff Invite Accept Flow
SAP-3 — Staff Portal UI ve Staff API
SAP-4 — Staff Authorization Tests
SAP-5 — Super Admin Role, Organization Suspension ve Guard
SAP-6 — Super Admin Panel UI ve API
SAP-7 — Final E2E, Security Review ve Release
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

E2E eklenen phase’lerde:

```bash
npm run test:e2e
```

Her phase sonunda:

```bash
git add .
git commit -m "meaningful commit message"
git push
```

Test fail olursa push yapılmaz.

---

# 8. Phase Detayları

---

## SAP-0 — Mevcut Role/Auth Audit

Amaç: Mevcut auth, role ve route guard yapısını bozmadan analiz etmek.

Yapılacaklar:

```txt
1. Prisma schema içinde User, Staff, OrganizationMember, Organization ve AuditLog modellerini incele.
2. Auth/session helperlarını incele.
3. Mevcut /staff ve /admin route var mı kontrol et.
4. Existing route guards var mı kontrol et.
5. Staff ile User arasında bağlantı var mı belirle.
6. Superadmin role var mı belirle.
7. docs/staff-admin-auth-audit.md oluştur.
```

Testler:

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
git commit -m "docs: audit staff and admin auth model"
git push
```

---

## SAP-1 — StaffInvite ve Staff-User Data Model

Amaç: Staff invite sistemi için database ve servis temelini kurmak.

Yapılacaklar:

```txt
1. StaffInvite modelini ekle.
2. Staff modeline userId nullable relation ekle, yoksa.
3. StaffInvite status enum ekle.
4. Token üretme ve hashleme helperı yaz.
5. Staff invite service/repository skeleton oluştur.
6. Migration oluştur.
7. Seed data etkisini kontrol et.
8. Unit test yaz.
```

Testler:

```txt
- StaffInvite oluşturulur.
- Token hashlenir.
- Raw token database’e kaydedilmez.
- Expiry tarihi set edilir.
- OrganizationId zorunludur.
```

Commit:

```bash
git add .
git commit -m "feat: add staff invite data model"
git push
```

Compact:

```txt
SAP-0 ve SAP-1 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## SAP-2 — Staff Invite Accept Flow

Amaç: Owner’ın staff davet etmesi ve staff’ın token ile sisteme katılması.

Yapılacaklar:

```txt
1. Owner için invite create API yaz.
2. Davet linki oluştur: /staff/invite/[token]
3. Accept invite sayfası oluştur.
4. Token doğrulama servisi yaz.
5. Token süresi/iptal/tekrar kullanım kontrollerini ekle.
6. Kullanıcı yoksa register/login yönlendirmesi yap.
7. Kullanıcı varsa Staff.userId ile bağla.
8. Invite status ACCEPTED yap.
9. Audit log üret.
```

Testler:

```txt
- Owner invite oluşturabilir.
- Staff olmayan kullanıcı invite oluşturamaz.
- Expired invite kabul edilmez.
- Revoked invite kabul edilmez.
- Accept sonrası Staff.userId bağlanır.
- Aynı token ikinci kez kabul edilmez.
```

Commit:

```bash
git add .
git commit -m "feat: add staff invite acceptance flow"
git push
```

---

## SAP-3 — Staff Portal UI ve Staff API

Amaç: Staff’ın kendi panelini kullanabilmesi.

Yapılacaklar:

```txt
1. /staff/dashboard oluştur.
2. /staff/appointments oluştur.
3. /staff/appointments/[id] oluştur.
4. /staff/availability oluştur.
5. GET /api/staff/me yaz.
6. GET /api/staff/me/appointments yaz.
7. PATCH /api/staff/me/appointments/[id]/status yaz.
8. GET/PATCH /api/staff/me/availability yaz.
9. Staff layout ve navigation ekle.
10. Loading, empty ve error state ekle.
```

Staff dashboard metrikleri:

```txt
Bugünkü randevularım
Bu haftaki randevularım
Sıradaki randevum
Tamamlanan randevular
No-show randevular
```

Testler:

```txt
- Staff kendi dashboardunu görür.
- Staff kendi randevularını görür.
- Staff başka staff randevusunu göremez.
- Staff kendi availability bilgisini görür.
- Staff kendi randevu statusunu günceller.
```

Commit:

```bash
git add .
git commit -m "feat: add staff portal dashboard and APIs"
git push
```

Compact:

```txt
SAP-2 ve SAP-3 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## SAP-4 — Staff Authorization Tests

Amaç: Staff portal güvenliğini testle garantiye almak.

Yapılacaklar:

```txt
1. Staff auth helper unit testleri ekle.
2. Staff appointment API cross-staff testleri yaz.
3. Staff billing/admin erişim testleri yaz.
4. Disabled staff erişim testleri yaz.
5. Playwright staff login smoke test ekle.
6. Status update testleri yaz.
```

Testler:

```txt
- Staff A, Staff B randevusunu göremez.
- Disabled staff /staff erişemez.
- Staff /dashboard/billing erişemez.
- Staff /admin erişemez.
- Staff kendi randevusunu completed yapabilir.
- Staff kendi randevusunu no-show yapabilir.
```

Commit:

```bash
git add .
git commit -m "test: add staff portal authorization coverage"
git push
```

---

## SAP-5 — Super Admin Role, Organization Suspension ve Guard

Amaç: Platform owner erişimi için güvenli admin altyapısını kurmak.

Yapılacaklar:

```txt
1. User platformRole alanını kontrol et, yoksa ekle.
2. platformRole enum: USER | SUPERADMIN.
3. Organization status alanını kontrol et, yoksa ekle.
4. ACTIVE | SUSPENDED | CANCELLED enum ekle.
5. suspendedAt, suspendedReason, suspendedByUserId alanlarını ekle.
6. requireSuperAdmin() helper yaz.
7. /admin route guard oluştur.
8. Superadmin seed user stratejisi yaz.
9. Tests ekle.
```

Testler:

```txt
- SUPERADMIN /admin erişebilir.
- USER /admin erişemez.
- STAFF /admin erişemez.
- Login olmayan /admin erişemez.
- Suspended organization public booking kabul etmez.
```

Commit:

```bash
git add .
git commit -m "feat: add superadmin role and organization suspension model"
git push
```

Compact:

```txt
SAP-4 ve SAP-5 sonrası docs/COMPACT_STATE.md güncelle.
```

---

## SAP-6 — Super Admin Panel UI ve API

Amaç: Platform sahibinin sistemi yönetebileceği paneli oluşturmak.

Yapılacaklar:

```txt
1. /admin dashboard oluştur.
2. /admin/organizations listesi oluştur.
3. /admin/organizations/[id] detay sayfası oluştur.
4. /admin/subscriptions sayfası oluştur.
5. /admin/usage sayfası oluştur.
6. /admin/audit-logs sayfası oluştur.
7. /admin/health sayfası oluştur.
8. Admin API route’larını yaz.
9. Suspend/activate action ekle.
10. Audit log ekle.
```

Admin dashboard metrikleri:

```txt
Toplam işletme
Aktif işletme
Askıya alınan işletme
Bu ay toplam randevu
Aktif abonelikler
Free/Starter/Pro dağılımı
Ödeme bekleyen hesaplar
Son audit loglar
```

Testler:

```txt
- Superadmin organization list görebilir.
- Superadmin organization suspend edebilir.
- Suspend sonrası public booking kapanır.
- Activate sonrası public booking tekrar açılır.
- Normal owner admin API’den 403 alır.
```

Commit:

```bash
git add .
git commit -m "feat: add superadmin management panel"
git push
```

---

## SAP-7 — Final E2E, Security Review ve Release

Amaç: Staff portal ve superadmin panelini final kalite kontrolünden geçirmek.

Yapılacaklar:

```txt
1. E2E owner staff invite flow yaz.
2. E2E staff accept invite flow yaz.
3. E2E staff appointment view yaz.
4. E2E superadmin organization suspend flow yaz.
5. Suspended organization booking blocked test yaz.
6. Security review raporu oluştur.
7. README/docs güncelle.
8. CHANGELOG güncelle.
9. Release tag oluştur.
```

Final E2E akışı:

```txt
1. Owner login olur.
2. Staff invite oluşturur.
3. Staff invite linkini açar.
4. Staff hesabıyla giriş yapar.
5. Staff kendi randevusunu görür.
6. Staff başka staff randevusunu göremez.
7. Superadmin login olur.
8. Organization list görür.
9. Organization suspend eder.
10. Public booking sayfası randevu kabul etmez.
11. Superadmin activate eder.
12. Public booking tekrar çalışır.
```

Final komutlar:

```bash
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
git commit -m "chore: finalize staff portal and superadmin release"
git push
git tag v1.6.0-staff-admin
git push origin v1.6.0-staff-admin
```

---

# 9. Codex Ana Prompt

```txt
Read RANDEVO_STAFF_PORTAL_AND_SUPERADMIN_PLAN.md completely.

We are adding two missing features:
1. Complex Staff Login and Staff Portal
2. Super Admin Platform Management Panel

Do not implement everything at once.

Start with Phase SAP-0 only:
- Audit current User, Staff, OrganizationMember, Organization, AuditLog, auth/session, route guards, and existing /staff or /admin routes.
- Create docs/staff-admin-auth-audit.md.
- Do not change product behavior yet.
- Run:
  - npm run typecheck
  - npm run lint
  - npm test
  - npm run build
  - npx prisma validate
  - npx prisma generate
- Commit and push only if checks pass.

Important:
- Staff must only access their own organization and own staff-scoped data.
- Normal owner must not access /admin.
- Staff must not access billing or admin.
- Superadmin must be strongly guarded.
- Do not trust organizationId from client.
- Do not commit secrets.
- Every 2 phases update docs/COMPACT_STATE.md.
```

---

# 10. Claude Code Ana Prompt

```txt
Read RANDEVO_STAFF_PORTAL_AND_SUPERADMIN_PLAN.md carefully.

Start with Phase SAP-0 only.

Tasks:
- Inspect Prisma schema for User, Staff, OrganizationMember, Organization, AuditLog.
- Inspect auth/session helpers.
- Inspect existing route guards.
- Inspect existing /staff and /admin routes if present.
- Create docs/staff-admin-auth-audit.md.
- Do not change behavior yet.
- Run tests/build/prisma checks.
- Commit and push only if everything passes.

Stop after SAP-0 and summarize.

Rules:
- Do not implement all phases at once.
- Staff data must be scoped by staffId and organizationId.
- Superadmin access must use platformRole or equivalent.
- Payment/billing must not be accessible by staff.
- Every phase must have tests.
- Every 2 phases update docs/COMPACT_STATE.md and run/request /compact.
```

---

# 11. Final Definition of Done

```txt
- Owner staff invite oluşturabiliyor.
- Staff invite token güvenli şekilde hashleniyor.
- Staff invite kabul edilebiliyor.
- Staff user hesabı staff kaydına bağlanıyor.
- Staff /staff portalına girebiliyor.
- Staff sadece kendi randevularını görebiliyor.
- Staff kendi müsaitliğini yönetebiliyor.
- Staff billing/admin erişemiyor.
- Disabled staff erişemiyor.
- Superadmin /admin paneline girebiliyor.
- Normal owner /admin paneline giremiyor.
- Superadmin işletmeleri listeleyebiliyor.
- Superadmin işletmeyi suspend/activate yapabiliyor.
- Suspended işletme public booking kabul etmiyor.
- Admin aksiyonları audit log üretiyor.
- Tenant isolation testleri geçiyor.
- E2E staff invite flow geçiyor.
- E2E superadmin suspend flow geçiyor.
- Build geçiyor.
- Testler geçiyor.
- GitHub push ve tag tamamlandı.
```

---

# 12. Final Kontrol Prompt’u

```txt
Review the staff portal and superadmin implementation.

Check:
1. Can owner invite staff?
2. Are invite tokens hashed?
3. Can staff accept invite?
4. Is Staff.userId linked correctly?
5. Can staff access only their own appointments?
6. Can staff update only allowed availability/status?
7. Is staff blocked from billing and admin?
8. Can superadmin access /admin?
9. Are normal users blocked from /admin?
10. Can superadmin suspend and activate organizations?
11. Does suspended organization block public booking?
12. Are audit logs created?
13. Are tenant isolation tests passing?
14. Are e2e tests passing?
15. Does build pass?
16. Has everything been committed and pushed?

Fix small issues only.
Do not add unrelated features.
Create final release notes.
```
