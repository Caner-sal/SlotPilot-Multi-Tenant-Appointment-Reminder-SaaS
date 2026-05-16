# CALUI-0 Audit Report: Calendar, Theme, i18n/Data Boundaries

Date: 2026-05-15

## 1) Root Cause Map

- Public booking date selection is card-list based, not calendar based:
  - `src/app/booking/[slug]/page.tsx`
  - Uses `getNext14Days()` and renders fixed day cards (`grid-cols-3 sm:grid-cols-4`).
  - No month navigation, no arbitrary future date selection.
- Booking slot API is date-param driven but parsing is loose:
  - `src/app/api/booking/[slug]/slots/route.ts`
  - `date` is required but currently parsed via `new Date(dateParam)`, which is permissive and timezone-sensitive.
- Booking engine integrity protections are present and must be preserved:
  - `src/services/booking.service.ts`
  - Closed-day/holiday/availability checks plus race-condition conflict recheck in `createBooking`.
- Theme mismatch is caused by local hard-coded light classes across dashboard/admin/staff pages:
  - Widespread `bg-white`, `text-gray-*`, `border-gray-*` usage.
  - Existing shared UI primitives already use theme tokens:
    - `src/components/ui/card.tsx`
    - `src/components/ui/table.tsx`
    - `src/components/ui/button.tsx`
    - `src/components/ui/input.tsx`
    - `src/components/ui/select.tsx`
    - `src/components/ui/badge.tsx`
- i18n/data confusion source:
  - UI labels are dictionary-driven (`src/messages/*.json`).
  - Service/business content comes from DB and is rendered as entered (not auto-translated), which is expected unless translation model exists.

## 2) Affected Routes and Components

### Public Booking

- `src/app/booking/[slug]/layout.tsx`
  - Hard-coded light shell classes (`bg-gray-50`, `bg-white`, `text-gray-*`, `border-gray-*`).
- `src/app/booking/[slug]/page.tsx`
  - Fixed 14-day selection (`getNext14Days`) and card-picker rendering.
  - Many hard-coded color classes and low-contrast text classes.

### Dashboard

- `src/app/dashboard/services/page.tsx`
- `src/app/dashboard/staff/page.tsx`
- `src/app/dashboard/appointments/page.tsx`
- `src/app/dashboard/availability/page.tsx`
- Additional dashboard surfaces with hard-coded light tokens found by scan.

### Staff

- `src/app/staff/layout.tsx`
- `src/app/staff/dashboard/page.tsx`
- `src/app/staff/appointments/page.tsx`
- `src/app/staff/appointments/[id]/page.tsx`
- `src/app/staff/availability/page.tsx`
- `src/app/staff/accept-invite/page.tsx`

### Admin

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/audit-logs/page.tsx`
- `src/app/admin/health/page.tsx`
- `src/app/admin/organizations/page.tsx`
- `src/app/admin/organizations/[id]/page.tsx`
- `src/app/admin/subscriptions/page.tsx`
- `src/app/admin/usage/page.tsx`
- `src/app/admin/product-events/page.tsx`

## 3) Hard-coded Theme Class Hotspots

Patterns found in target surfaces:

- `bg-white`
- `text-gray-*`
- `border-gray-*`
- `bg-gray-*`

These bypass the active design token system in `globals.css` (`--background`, `--foreground`, `--card`, `--muted`, `--border`, etc.) and create dark-theme inconsistency.

## 4) i18n vs Business Data Findings

- UI translation keys for booking/services/common exist in all active locales (`src/messages/*.json`).
- Business-entered fields such as `service.name` and `service.description` are rendered directly from DB in public booking and dashboard tables.
- This mixed-language output is expected behavior without a dedicated service-translation model.
- Required product rule is therefore:
  - Translate UI labels and statuses.
  - Preserve business-entered content exactly as entered.

## 5) Booking Integrity Risk Notes

- Must not alter server-side ownership derivation (`organizationId` server-derived).
- Must not alter race-condition guard in booking creation:
  - `src/services/booking.service.ts` conflict recheck before create.
- Must not introduce client-side slot fabrication:
  - Availability must continue to come from `/api/booking/[slug]/slots`.
- Calendar UI upgrade must remain a pure selection layer over existing booking engine rules.

## 6) CALUI Implementation Entry Criteria (from audit)

- Introduce reusable calendar component for month navigation and arbitrary future date selection.
- Normalize slots API date input handling to first-class `YYYY-MM-DD` with compatibility.
- Refactor dashboard/admin/staff visual surfaces onto shared design tokens/primitives.
- Keep UI translation and business data boundaries explicit and documented.
