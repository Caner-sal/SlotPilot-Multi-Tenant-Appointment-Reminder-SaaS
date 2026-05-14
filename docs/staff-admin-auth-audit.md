# SAP-0 Staff/Admin Auth Audit

Bu doküman `RANDEVO_STAFF_PORTAL_AND_SUPERADMIN_PLAN.md` içindeki SAP-0 fazı için mevcut yapının audit çıktısıdır.
Kapsam sadece analiz ve dokümantasyondur; ürün davranışı değiştirilmemiştir.

## Prisma Model Snapshot

### User
- `platformRole: PlatformRole @default(USER)` mevcut (`USER | SUPERADMIN`).
- `appRole: AppRole @default(OWNER)` mevcut (`OWNER | STAFF_MEMBER`).
- `staffProfile Staff?` ilişkisi mevcut.
- `memberships OrganizationMember[]` ile tenant üyeliği mevcut.

SAP planına göre durum:
- Superadmin role temeli mevcut.
- Staff kullanıcı bağlama temeli (`staffProfile`) mevcut.

### Staff
- `organizationId` zorunlu.
- `userId String? @unique` ile kullanıcıya bağlanabilir.
- `isActive` alanı mevcut.

SAP planına göre durum:
- Staff-User bağlantısı için temel alanlar mevcut.
- `userId` nullable ilişki beklentisi karşılanıyor.

### OrganizationMember
- `userId`, `organizationId`, `role` (OWNER|ADMIN|STAFF) mevcut.
- `@@unique([userId, organizationId])` ile üyelik tekilliği var.

SAP planına göre durum:
- Tenant üyelik modeli mevcut.
- API seviyesinde role enforcement tutarlılığı ayrı inceleme gerektiriyor.

### Organization
- `suspended Boolean @default(false)` mevcut.
- `bookingEnabled Boolean @default(true)` mevcut.
- `status`, `suspendedAt`, `suspendedReason`, `suspendedByUserId` alanları yok.

SAP planına göre durum:
- Basit suspension sinyali var (`suspended`).
- Planlanan detaylı lifecycle/suspension metadata henüz yok.

### AuditLog
- `organizationId`, `actorUserId`, `action`, `entityType`, `entityId`, `metadata`, `createdAt` mevcut.
- `organization` ve `actor` ilişkileri mevcut.

SAP planına göre durum:
- Kritik aksiyonlar için audit üretmeye uygun altyapı mevcut.

## Auth/Session Snapshot

Kaynak: `src/lib/auth.ts`

- NextAuth Credentials provider kullanılıyor.
- Login sırasında kullanıcı `staffProfile` ile birlikte yükleniyor.
- JWT claim'lere şu alanlar yazılıyor:
  - `id`
  - `platformRole`
  - `appRole`
  - `staffId`
  - `staffOrgId`
  - `preferredLocale`
- Session callback bu claim'leri `session.user` alanına taşıyor.

Değerlendirme:
- Staff ve superadmin ayrımı session katmanında taşınıyor.
- Staff scoping için gerekli `staffId/staffOrgId` claim'leri mevcut.

## Guard Snapshot

### Route-Level Guard (`src/middleware.ts`)
- `/admin` için:
  - login zorunlu
  - `platformRole === "SUPERADMIN"` zorunlu
- `/staff/dashboard`, `/staff/appointments`, `/staff/availability` için:
  - login zorunlu
  - burada `appRole` kontrolü middleware seviyesinde yapılmıyor (layout/helper seviyesine bırakılmış)
- `/dashboard` login koruması var.

### Staff Helper Guard (`src/lib/staff-auth.ts`)
- `requireStaffAuth()`:
  - oturum zorunlu
  - `appRole === "STAFF_MEMBER"` zorunlu
  - `staffId` ve `staffOrgId` zorunlu
- dönüşte `{ userId, staffId, organizationId }` veriyor.

### Superadmin Helper Guard (`src/lib/superadmin.ts`)
- `requireSuperAdmin()`:
  - oturum zorunlu
  - `platformRole === "SUPERADMIN"` zorunlu

### Page Guard
- `src/app/staff/layout.tsx`: `STAFF_MEMBER` değilse `/dashboard`’a yönlendiriyor.
- `src/app/admin/layout.tsx`: superadmin değilse `/dashboard`’a yönlendiriyor.

## Route Inventory

### Mevcut Staff Pages
- `/staff/accept-invite`
- `/staff/dashboard`
- `/staff/appointments`
- `/staff/availability`

Plan hedeflerine göre farklar:
- Eksik/isim farkı: `/staff/login`, `/staff/invite/[token]`, `/staff/appointments/[id]`, `/staff/profile`.
- Mevcut akış `/staff/accept-invite?token=...` query modeliyle çalışıyor.

### Mevcut Staff API
- `POST /api/staff/invite`
- `GET/POST /api/auth/accept-invite`
- `GET/PUT /api/staff-portal/availability`
- `GET /api/staff-portal/appointments`
- `GET/POST /api/staff`
- `PATCH/DELETE /api/staff/[id]`

Plan hedeflerine göre farklar:
- Yol isimleri hedef planla birebir değil (`/api/staff-portal/*` vs `/api/staff/me/*`).
- `PATCH /api/staff/me/appointments/[id]/status` benzeri owner-scope endpoint henüz ayrılaştırılmamış.
- `POST /api/staff/invites/[id]/revoke` benzeri explicit revoke endpoint yok.

### Mevcut Admin Pages
- `/admin`
- `/admin/organizations`
- `/admin/organizations/[id]`
- `/admin/audit-logs`
- `/admin/health`
- `/admin/product-events`

Plan hedeflerine göre farklar:
- `/admin/subscriptions` ve `/admin/usage` henüz yok.

### Mevcut Admin API
- `GET /api/admin/organizations`
- `GET/PATCH /api/admin/organizations/[id]`
- `GET /api/admin/audit-logs`
- `GET /api/admin/health`
- `GET /api/admin/failures`
- `GET /api/admin/gdpr/requests`
- `GET /api/admin/product-events`

Plan hedeflerine göre farklar:
- `/api/admin/subscriptions` ve `/api/admin/usage` henüz yok.
- `organizations/[id]` PATCH aksiyonu var, ancak model halen `suspended:boolean` seviyesinde.

## Security Findings (SAP-0)

1. StaffInvite token raw saklanıyor
- `prisma StaffInvite` modelinde `token String @unique` alanı var.
- `src/app/api/staff/invite/route.ts` raw token üretiyor ve DB’ye yazıyor.
- Plan hedefi (`tokenHash`) ile uyumlu değil.

2. Invite status/state machine eksik
- `PENDING | ACCEPTED | EXPIRED | REVOKED` benzeri enum/state alanı yok.
- Mevcut akış `usedAt` + `expiresAt` ile sınırlı.

3. Organization suspension modeli plan hedefinden dar
- `status/suspendedAt/suspendedReason/suspendedByUserId` yok.
- Mevcut model `suspended:boolean` + `bookingEnabled:boolean`.

4. Staff invite role seviyesi netleştirme ihtiyacı
- `POST /api/staff/invite` içinde `requireAuth()` üyelik doğruluyor.
- Owner/Admin ayrımı endpoint seviyesinde explicit enforced görünmüyor.
- SAP-1+ aşamasında role politikası netleştirilmeli.

5. Staff scope uygulaması kısmi olarak iyi, kısmi olarak geliştirmeye açık
- İyi örnek:
  - `requireStaffAuth()` ile `staffId + staffOrgId` alınıyor.
  - `api/staff-portal/appointments` query’si `organizationId` ve `staffId` ile filtreli.
  - `api/staff-portal/availability` PUT yazımı `staffId + organizationId` ile yapılıyor.
- Geliştirme alanı:
  - Middleware staff route kontrolü login ile sınırlı; rol/scope enforcement helper/layout katmanında.
  - Plan hedefindeki `/api/staff/me/*` şeklinde daha açık self-scope sözleşmesi henüz yok.

## SAP-1+ İçin Önerilen Takip Maddeleri

- StaffInvite token depolamasını `tokenHash` modeline taşı.
- Invite lifecycle için enum tabanlı state machine ekle (`PENDING/ACCEPTED/EXPIRED/REVOKED`).
- `Organization` için detaylı suspension alanlarını ekle ve audit ile bağla.
- Staff invite endpointinde OWNER/ADMIN yetki politikasını explicit hale getir.
- Staff API yüzeyini `/api/staff/me/*` sözleşmesine yaklaştırarak self-scope’ı sadeleştir.
- Middleware’de staff route korumasının kapsamını (rol/scope) bilinçli şekilde değerlendir.

## SAP-0 Komut Sonuç Notu

SAP-0 kalite kapısı komutları çalıştırılmıştır:
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `prisma validate`
- `prisma generate`

Ek not:
- Bu ortamda `npx prisma validate/generate`, çalışma yolu ve ağ/sandbox koşulları nedeniyle kararsız davranabildi.
- Fallback olarak `node .\\node_modules\\prisma\\build\\index.js validate|generate` kullanımı değerlendirildi.
- `prisma generate` sırasında olası dosya kilidi riski için aktif dev server süreci (port 3000) kontrol adımı SAP-0 doğrulama prosedürüne dahil edildi.
