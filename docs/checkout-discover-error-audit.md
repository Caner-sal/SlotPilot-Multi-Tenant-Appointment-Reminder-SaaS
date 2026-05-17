# Checkout + Discover Error Audit — FIXERR-0

Tarih: 2026-05-17  
Branch: feature/global-address-locale

---

## Hata 1 — Checkout "Oturum Doğrulanamadı"

### Kök Sebep

`src/lib/tenant.ts:14-15` — `getCurrentUser()` içinde:

```typescript
const session = await auth();
if (!session?.user?.id) {
  throw new TenantError("Oturum doğrulanamadı");
}
```

`src/app/api/billing/checkout/route.ts:144-147` — TenantError tüm statüsler için 403 dönüyor:

```typescript
if (err instanceof TenantError) {
  return NextResponse.json({ error: err.message }, { status: 403 });
}
```

`src/app/dashboard/billing/checkout/page.tsx:60-62` — Client UI hata mesajını direkt gösteriyor:

```typescript
if (!res.ok) {
  setError(json.error ?? t("checkoutError"));
  return;
}
```

### Sorunlar

1. **Loading guard yok** — `sessionStatus === "loading"` durumunda ödeme butonu aktif kalıyor. Kullanıcı session yüklenmeden butona basabilir.
2. **Unauthenticated guard yok** — `sessionStatus === "unauthenticated"` durumunda checkout page render ediliyor, login'e redirect yapılmıyor.
3. **401/403 ayrımı yok** — Session yoksa da, yetki yoksa da aynı 403 kodu dönüyor. Client hangi durumda ne yapacağını bilemiyor.
4. **Raw TenantError mesajı UI'a basılıyor** — "Oturum doğrulanamadı" server-side hata string'i direkt gösteriliyor.

### TenantError Mesaj Haritası (`src/lib/tenant.ts`)

| Mesaj | Durum | Doğru HTTP Status |
|-------|-------|-------------------|
| "Oturum doğrulanamadı" | Session null | 401 |
| "Erişim reddedildi: bu işletmenin üyesi değilsiniz" | Membership yok | 403 |
| "Erişim reddedildi: yetki seviyesi yetersiz" | Role yetersiz | 403 |
| "Bu kullanıcı için işletme bulunamadı" | Org yok | 404 |

---

## Hata 2 — Marketplace/Discover Prisma DATABASE_URL Hatası

### Kök Sebep A — addressProviderLog unhandled

`src/app/api/address/autocomplete/route.ts:37-45`:

```typescript
// try bloğu içinde, autocompleteAddress başarılı sonrası:
await db.addressProviderLog.create({ data: { ..., status: "SUCCESS" } });
return NextResponse.json({ data });
```

`addressProviderLog.create()` DATABASE_URL geçersizse Prisma datasource validation hatası fırlatıyor. Bu catch bloğuna düşüyor:

```typescript
} catch (error) {
  await db.addressProviderLog.create({ ... }).catch(() => undefined); // 2. deneme de fail
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Autocomplete failed" },
    { status: 500 },
  );
}
```

`error.message` = raw Prisma validation error. Bu JSON'a giriyor.

### Kök Sebep B — discover/search try-catch yok

`src/app/api/discover/search/route.ts` — tüm handler unprotected:

```typescript
export async function GET(req: Request) {
  // try-catch yok!
  const matches = await db.normalizedAddress.findMany({...}); // patlarsa unhandled
  const orgs = await db.organization.findMany({...});         // patlarsa unhandled
  return NextResponse.json({ data: orgs });
}
```

Prisma hatası fırlatırsa Next.js ham 500 yanıtı döner.

### Kök Sebep C — DATABASE_URL protocol validation yok

`scripts/check-production-env.ts:26-33` — sadece varlık kontrolü yapılıyor, protocol kontrolü yok:

```typescript
if (!process.env[v]) {
  console.error(`❌ FAIL: ${v} eksik`);
}
```

`file:./dev.db` gibi SQLite URL geçerli sayılıyor ama prisma/schema.prisma `provider = "postgresql"` bekliyor.

### Durum

- `.env.example` satır 3: `DATABASE_URL="file:./dev.db"` — SQLite format, schema PostgreSQL istiyor
- `prisma/schema.prisma:8`: `provider = "postgresql"` — mismatch

---

## Dosya Özeti

| Dosya | Sorun |
|-------|-------|
| `src/lib/tenant.ts:15` | "Oturum doğrulanamadı" tek mesajla 401+403+404 karışık |
| `src/app/api/billing/checkout/route.ts:145` | TenantError → 403, 401 ayrımı yok |
| `src/app/dashboard/billing/checkout/page.tsx:18-24` | Loading/unauthenticated guard yok |
| `src/app/dashboard/billing/checkout/page.tsx:61` | Raw server hata mesajı UI'a basılıyor |
| `src/app/api/address/autocomplete/route.ts:37` | addressProviderLog.create() try bloğu içinde blocking |
| `src/app/api/address/retrieve/route.ts:27` | addressProviderLog.create() try bloğu içinde blocking |
| `src/app/api/discover/search/route.ts` | try-catch yok |
| `scripts/check-production-env.ts:26` | DATABASE_URL protocol validation yok |
| `.env.example:3` | SQLite URL gösteriyor, schema PostgreSQL istiyor |

---

## FIXERR-0 Sonuç

Kod değiştirme yapılmadı. Tüm sorunlar belgelendi. FIXERR-1'e geçiliyor.
