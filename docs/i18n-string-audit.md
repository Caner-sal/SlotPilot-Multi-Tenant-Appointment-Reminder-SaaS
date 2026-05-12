# I18N String Audit (Phase I18N-0)

## Scope
- Scanned customer-facing surfaces in:
  - `src/app` (excluding API routes for UI concerns)
  - `src/components`
  - `mobile/src`
- Used targeted grep sampling for:
  - hardcoded Turkish UI labels
  - hardcoded English mobile labels
  - booking/dashboard/auth visible strings

## Findings Summary
- Current state: mixed hardcoded Turkish (web) + hardcoded English (mobile)
- Existing dictionary file: `src/i18n/tr.ts` exists, but app-wide keyed i18n usage is not yet integrated
- Locale routing is not yet prefix-based (`/tr`, `/en`, `/de`, `/ar`)

## High-Priority Hardcoded Areas
1. Public booking flow
- File: `src/app/booking/[slug]/page.tsx`
- Contains many customer-facing labels and helper texts directly in JSX

2. Dashboard navigation and page headers
- Files include:
  - `src/components/dashboard/sidebar.tsx`
  - `src/components/dashboard/header.tsx`
  - `src/app/dashboard/*/page.tsx`

3. Auth screens
- Files:
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/register/page.tsx`

4. Landing and public marketing pages
- Files:
  - `src/app/page.tsx`
  - `src/app/ozellikler/page.tsx`
  - `src/app/marketplace/[slug]/page.tsx`

5. Mobile app screens
- Files:
  - `mobile/src/screens/LoginScreen.tsx`
  - `mobile/src/screens/DashboardScreen.tsx`
  - `mobile/src/screens/AppointmentsScreen.tsx`
  - `mobile/src/screens/AppointmentDetailScreen.tsx`

## API/Service Text Notes
- API routes include Turkish error strings (e.g. `"Çalışan bulunamadı"`, `"Sunucu hatası"`).
- These should be localized in later phases where API response localization is required.
- In phase-0, this is documented only (no behavior change).

## Migration Priority for Next Phases
1. Booking UI strings
2. Landing/public pages
3. Auth UI
4. Dashboard nav + core pages (appointments/services/staff)
5. Mobile UI strings
6. Notification templates

## Risk Notes
- Locale migration will touch many files; regression risk highest in booking and auth flows.
- Existing middleware currently enforces auth without locale awareness; this must be combined carefully with locale routing.
- Because of workspace path containing `&`, direct CLI commands should be used for reliable CI-like checks in local execution.

## Baseline Outcome
- String hotspots identified.
- Architecture decisions documented in `docs/i18n-architecture.md`.
- Ready to start phase I18N-1 (routing + message bootstrap).
