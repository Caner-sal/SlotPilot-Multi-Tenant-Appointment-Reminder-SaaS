# Randevo Mobile

React Native / Expo mobile app for the Randevo SaaS platform.

## Prerequisites

- Node.js 20+
- Expo Go on your device (iOS or Android)
- Randevo backend running locally (`npm run dev` in repo root)

## Setup

```bash
cd mobile
npm install
```

Create `.env.local` (not committed):

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000
```

Use your machine local IP (for example `192.168.1.x`) when testing on a physical device.

## Running

```bash
npm start
```

## Mobile Auth Bridge (JWT)

Mobile app authenticates via:

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/refresh`
- `POST /api/mobile/auth/logout`

Session payload is stored as `slotpilot_mobile_session_v2` and refresh rotation is handled by backend token revocation logic.

## Screens

| Screen | Description |
|--------|-------------|
| Login | Email + password login via Mobile JWT Bridge |
| Dashboard | Analytics summary + role indicator (owner/staff) |
| Appointments | Appointment list with offline read-cache fallback |
| Appointment Detail | Full details; status update owner/admin only |
| Calendar | Daily/weekly calendar list view |

## Foundations Implemented

- React Navigation stack (auth + app flow)
- Mobile role/staff mode capability gating
- Offline read-cache for appointments (stale-while-revalidate)
- Push foundation endpoints:
  - `POST /api/mobile/push/register`
  - `POST /api/mobile/push/dev-trigger` (non-production)

## Notes

- Current offline support is read-cache only (no write queue in this sprint).
- Production push provider delivery binding is scheduled for a later sprint.

