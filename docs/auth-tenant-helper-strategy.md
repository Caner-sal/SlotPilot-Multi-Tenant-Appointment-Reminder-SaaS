# Auth & Tenant Guard Helper Strategy

## Neden Bu Ayrım?

| Dosya | Ne Zaman Import Edilir |
|-------|----------------------|
| `src/lib/auth-edge.ts` | Middleware (Edge runtime) — sadece JWT decode, Prisma/bcrypt yok |
| `src/lib/auth-server.ts` | Server Components, Route Handlers, Server Actions — tam NextAuth |
| `src/lib/auth/guards.ts` | Herhangi bir route'da hızlı auth check |
| `src/lib/tenant/require-membership.ts` | Dashboard API route'larında owner/admin guard |

## auth-edge.ts Kuralları

- `next-auth/jwt`'nin `getToken()` fonksiyonunu kullanır (Web Crypto — Edge uyumlu)
- Prisma, bcryptjs veya başka Node.js-only modüller import edilmez
- Sadece middleware için kullanılır

## auth-server.ts Kuralları

- `src/lib/auth.ts`'nin re-export'u
- Server Component ve Route Handler'larda kullanılır
- Middleware'de asla kullanılmaz

## guards.ts Kullanımı

```typescript
import { requireSession, requireSuperAdmin, requireStaffSession } from "@/lib/auth/guards";

// Herhangi bir login gerektiren route
const user = await requireSession();

// Sadece SUPERADMIN
const admin = await requireSuperAdmin();

// Sadece STAFF_MEMBER
const { userId, staffId, staffOrgId } = await requireStaffSession();
```

Hata durumunda `AuthGuardError` throw eder:
- `status: 401` → oturum açılmamış
- `status: 403` → yetersiz yetki

Route handler'da:
```typescript
try {
  const user = await requireSession();
} catch (err) {
  if (err instanceof AuthGuardError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
```

## require-membership.ts Kullanımı

```typescript
import { requireOwnerOrAdmin } from "@/lib/tenant/require-membership";

const { userId, orgId, role } = await requireOwnerOrAdmin();
// veya sadece OWNER için:
const { userId, orgId } = await requireOwnerOrAdmin(["OWNER"]);
```

## Active Organization Cookie Protokolü

- Cookie adı: `randevo_active_org`
- Değer: `organizationId` (string)
- TTL: 30 gün
- Flags: `httpOnly: true, sameSite: "lax", path: "/"`
- Sunucu tarafı: `resolveActiveOrganization(userId, cookieStore)` membership'i her seferinde doğrular
- Client tarafı: `OrganizationSwitcher` component'i `POST /api/organization/active` ile cookie'yi günceller

## Mevcut Route Migration Adayları

Bu route'lar gelecek PR'larda `requireOwnerOrAdmin()` kullanacak şekilde refactor edilebilir:

- `src/app/api/staff/route.ts`
- `src/app/api/services/route.ts`
- `src/app/api/availability/route.ts`
- `src/app/api/appointments/route.ts`
- `src/app/api/analytics/route.ts`
- `src/app/api/locations/route.ts`
- `src/app/api/invoices/route.ts`
