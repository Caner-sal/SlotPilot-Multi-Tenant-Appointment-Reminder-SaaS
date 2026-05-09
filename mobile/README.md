# Randevo Mobile

React Native / Expo mobile app for the Randevo SaaS platform.

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/client) app on your device (iOS or Android)
- Randevo backend running locally (`npm run dev` in the root)

## Setup

```bash
cd mobile
npm install
```

Create `.env.local` (not committed):
```
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000
```

> **Note:** Use your machine's local IP (e.g. `192.168.1.x`), not `localhost`, when testing on a physical device.

## Running

```bash
npm start
```

Scan the QR code with Expo Go on your device.

## Screens

| Screen | Description |
|--------|-------------|
| Login | Email + password sign-in |
| Dashboard | Analytics summary (today / week / month / pending) |
| Appointments | Scrollable appointment list with status badges |
| Appointment Detail | Full details + status update (Confirm, Complete, Cancel, No-Show) |

## Architecture

- **No backend logic** — all data is fetched from the Randevo web API
- **State-based navigation** — no navigation library required for this MVP foundation
- **API client** — `src/api/client.ts` handles all fetch calls

## Future Work

- Push notifications via Expo Notifications
- React Navigation for proper stack/tab navigation
- Offline support
- Staff-only mode
- Calendar view
