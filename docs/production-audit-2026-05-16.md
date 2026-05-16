# Production Audit — 2026-05-16

**Tarih**: 2026-05-16  
**Branch**: feature/global-address-locale  
**Baseline**: v1.6.3  
**Unit testler**: ~490 (tümü geçiyor)  
**E2E testler**: 15 adet, 1 kırık  
**Kaynak**: Codex proje geneli taraması  

---

## Bulgular

| ID | Sev | Dosya:Satır | Açıklama | Düzeltildiği Phase | Durum |
|---|---|---|---|---|---|
| F-001 | High | `src/middleware.ts:1,53` + `src/lib/auth.ts:3-4` | `auth()` wrapper üzerinden Prisma+bcrypt zinciri Edge runtime'a çekiliyor — Edge crash riski | PH-1 | Düzeltildi |
| F-002 | High | `src/lib/mobile-jwt.ts:18` | `"dev-mobile-secret-change-me"` hardcoded fallback — production'da secret yoksa sahte token üretilebilir | PH-2 | Düzeltildi |
| F-003 | High | `src/lib/tenant.ts:21-26` | `findFirst orderBy createdAt asc` — çoklu org üyesi kullanıcı için hatalı ilk org seçimi | PH-3 | Düzeltildi |
| F-004 | High | `tests/e2e/dark-select-phone-regression.spec.ts:52,63` | Onboarding E2E required alanlar doldurulmadan `nextBtn.click()` — HTML5 validation bloğu, test false-negative | PH-4 | Düzeltildi |
| F-005 | Medium | `src/app/api/staff/invite/route.ts:70` | `console.log(email, inviteUrl)` — PII (email) + güvenlik hassas URL (raw invite token) stdout'a yazılıyor | PH-5 | Düzeltildi |
| F-005b | Medium | `src/services/audit.service.ts:26` | `console.error("Failed to create audit log:", params)` — params içinde PII olabilir | PH-5 | Düzeltildi |
| F-006 | Medium | `src/app/dashboard/billing/page.tsx:64,77` | Mojibake encoding bozukluğu — `yapÄ±landÄ±rÄ±lmamÄ±ÅŸ` ve `â‚º0/ay` (UTF-8 bytes Latin-1 gibi okunmuş) | PH-6 | Düzeltildi |
| F-007 | Medium | `src/services/calendar/calendar.factory.ts` | `CALENDAR_PROVIDER ?? "FAKE"` — production'da env yoksa sessizce FAKE provider | PH-7 | Düzeltildi |
| F-007b | Medium | `src/services/whatsapp/whatsapp.factory.ts` | `WHATSAPP_PROVIDER ?? "FAKE"` — production'da env yoksa sessizce FAKE provider | PH-7 | Düzeltildi |
| F-008 | Medium | `src/app/api/auth/accept-invite/route.ts` | Rate limit yok — IP bazlı brute-force / token enumeration riski | PH-8 | Düzeltildi |

---

## Hardening Özellikleri (Eksik Altyapı)

Bu bölümdeki maddeler aynı risklerin tekrar çıkmaması için eklenmesi gereken altyapı araçlarıdır.

| Özellik | Phase | Yeni Dosyalar |
|---|---|---|
| Active Organization Selector | PH-3 | `src/lib/tenant/active-organization.ts`, `src/components/organization/OrganizationSwitcher.tsx`, `src/app/api/organization/active/route.ts` |
| Production Env Validation / Startup Guard | PH-2 | `src/lib/env/validate-env.ts`, `scripts/check-production-env.ts` |
| Invite Abuse Protection | PH-8 | `src/app/api/auth/accept-invite/route.ts` (mevcut `rate-limit.ts` kullanır) |
| E2E Stability Package | PH-4 | `tests/e2e/helpers/fill-onboarding.ts`, `tests/e2e/helpers/test-users.ts`, `tests/e2e/helpers/selectors.ts` |
| Logger Enforcement Script | PH-5 | `scripts/check-console-usage.ts` |
| Encoding Check Script | PH-6 | `scripts/check-encoding.ts` |
| Provider Health Check | PH-7 | `src/lib/providers/provider-health.ts` |
| Shared Auth/Tenant Guard Helpers | PH-9 | `src/lib/auth/guards.ts`, `src/lib/tenant/require-membership.ts` |

---

## Phase Planı

```
PH-0 — Audit Baseline Documentation          ✅ Tamamlandı
PH-1 — Edge Runtime Middleware Fix            ✅ Tamamlandı
PH-2 — Mobile JWT Secret Validation + Env Guard  ✅ Tamamlandı
PH-3 — Active Organization Tenant Context    ✅ Tamamlandı
PH-4 — E2E Stability Package + Onboarding Fix  ✅ Tamamlandı
PH-5 — Logger / PII Redaction + Console Guard  ✅ Tamamlandı
PH-6 — Encoding Cleanup + Encoding Check     ✅ Tamamlandı
PH-7 — Provider Factory Fail-fast + Health Check  ✅ Tamamlandı
PH-8 — Invite Abuse Protection               ✅ Tamamlandı
PH-9 — Shared Auth/Tenant Guard Helpers      ✅ Tamamlandı
PH-10 — Final Regression and Release         ✅ Tamamlandı
```

---

## Kritik Kurallar

- Middleware içine Prisma, bcrypt veya Node-only dependency girmeyecek.
- Production'da zayıf/mobile JWT fallback secret kullanılmayacak.
- Tenant seçimi client input'a körlemesine güvenmeyecek.
- E2E test false-positive/false-negative üretmeyecek.
- PII, email, phone, token, invite URL `console.*` ile loglanmayacak.
- Production'da provider env eksikse sessiz FAKE provider'a düşülmeyecek.
- Invite accept endpointi brute-force denemelerine açık kalmayacak.
- Test fail olursa push yapılmayacak.
