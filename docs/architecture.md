# Randevo — Backend Architecture

## Overview

Randevo uses the Next.js App Router with a clear separation between:
- **Route Handlers** — request/response, validation, auth checks
- **Service Layer** — business logic
- **Prisma Layer** — database access

## API Route Structure

```
/api/
├── auth/
│   ├── [...nextauth]/   — NextAuth endpoints
│   └── register/        — User registration
├── organizations/
│   ├── route.ts         — POST (create org)
│   └── current/         — GET, PATCH (current org)
├── services/
│   ├── route.ts         — GET, POST
│   └── [id]/            — PATCH, DELETE
├── staff/
│   ├── route.ts         — GET, POST
│   └── [id]/            — PATCH, DELETE
├── availability/
│   ├── route.ts         — GET, POST
│   └── [id]/            — PATCH, DELETE
├── appointments/
│   ├── route.ts         — GET
│   └── [id]/status/     — PATCH
├── booking/[slug]/
│   ├── profile/         — GET (public)
│   ├── services/        — GET (public)
│   ├── slots/           — GET (public)
│   └── appointments/    — POST (public)
├── billing/
│   ├── subscription/    — GET
│   └── checkout/        — POST
├── webhooks/stripe/     — POST (raw, no auth)
├── reminders/
│   ├── route.ts         — GET
│   └── process/         — POST
├── analytics/           — GET
└── audit-logs/          — GET
```

## Tenant Isolation

**Core principle:** `organizationId` is NEVER trusted from the client.

Flow for every authenticated API request:
1. `requireAuth()` — extract user from JWT session
2. `requireOrganization(userId)` — look up org from DB membership
3. All queries include `{ where: { organizationId: org.id } }`
4. For mutations: verify resource ownership before update/delete

```typescript
// Example pattern
const { user, org } = await requireAuth();
const service = await db.service.findFirst({
  where: { id: params.id, organizationId: org.id }  // ownership check
});
if (!service) return 404;
```

## Service Layer

Business logic lives in `src/services/`:

| Service | Responsibility |
|---------|---------------|
| `booking.service.ts` | Slot generation, booking creation, conflict check |
| `availability.service.ts` | Day-of-week availability, appointment fetching |
| `reminder.service.ts` | Reminder scheduling, batch processing |
| `analytics.service.ts` | Dashboard metrics aggregation |
| `audit.service.ts` | Audit log creation |

## Error Handling

All API routes use this pattern:

```typescript
try {
  // business logic
  return NextResponse.json({ data: result });
} catch (err) {
  if (err instanceof TenantError) return 403;
  if (err instanceof z.ZodError) return 400;
  console.error(err);
  return 500;
}
```

## Validation

All POST/PATCH bodies validated with Zod schemas from `src/lib/validators.ts` before any DB operation.

## Plan Limits

Checked in `src/lib/billing.ts` before staff creation and appointment booking. Always server-side — no client enforcement.
