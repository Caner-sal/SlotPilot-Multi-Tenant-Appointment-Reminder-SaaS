# MASTER IMPLEMENTATION AUDIT

Date: 2026-05-15
Scope: Audit-only (no product behavior change, no refactor)
Audit source of truth: Current repository working tree (including uncommitted changes)

## 1. Executive summary
This audit reviewed roadmap/plan/update documents and verified implementation directly from code, Prisma schema, API routes, app routes, components, tests, CI workflows, mobile folder, and agent/MCP files.

Overall status:
- Large portion of planned scope is implemented and test-covered.
- Critical production risks remain in command reliability and missing scripts (`agent:check`, `mobile test`).
- `npx prisma validate/generate` fail in this Windows workspace path due command/path parsing risk; npm script based Prisma commands pass.
- Several items are intentionally placeholder or staged (iyzico/paytr/param live integrations, some provider adapters, deeper production operations hardening).

Status distribution:
- `DONE` ağırlıklı ana kapsam mevcut.
- `PARTIAL` ve `MISSING` maddeler çoğunlukla production hardening, mobile test altyapısı, ve bazı entegrasyonların canlılaştırılması tarafında kümeleniyor.
- `BROKEN` etiketleri ürün işlevinden çok kalite kapıları/komut güvenilirliği alanında toplanıyor.

## 2. Current project status
- Web app: operational, broad API and UI coverage, strict lint/type/test/build gates present.
- Multi-tenant model: strongly represented in schema and route-level org scoping.
- Payments: abstraction + Stripe/deposit + webhook idempotency implemented; non-Stripe providers mostly stubs/placeholders.
- Localization: 10 locales active on web and mobile, i18n parity checks in place.
- Marketplace/address: country-aware flow implemented, TR-specific behavior preserved for TR and gated for non-TR.
- Staff/Superadmin: substantial implementation with guards and tests.
- MCP/Agent skills: baseline docs and validation scripts implemented; dedicated `agent:check` script missing.

## 3. Audited documents list
### 3.1 Roadmap/plan/update files found and audited
- `RANDEVO_PRODUCTION_GAP_AND_FEATURE_ROADMAP (1).md`
- `RANDEVO_GLOBAL_LOCALIZATION_BUGFIX_PLAN (1).md`
- `RANDEVO_CALENDAR_UI_THEME_BUGFIX_PLAN.md`
- `RANDEVO_AGENT_SKILLS_AND_MCP_INTEGRATION_PLAN.md`
- `RANDEVO_STAFF_PORTAL_AND_SUPERADMIN_PLAN.md`
- `SLOTPILOT_TURKIYE_LOCALIZATION_PLAN.md`
- `SLOTPILOT_GLOBAL_I18N_LANGUAGE_PACK_PLAN.md`
- `SLOTPILOT_EXTRA_LANGUAGE_PACKS_EXPANDED_UPDATE_PLAN.md`
- `SLOTPILOT_GLOBAL_ADDRESS_LOCALIZATION_ROADMAP (1).md`
- `SLOTPILOT_WHATSAPP_AUTO_LINK_UPDATE_PLAN.md`
- `SlotPilot_POST_MVP_EXPANSION_PLAN.md`
- `SLOTPILOT_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md`

### 3.2 Equivalent/related plan docs also audited
- `docs/COMPACT_STATE.md`
- `docs/product-gap-analysis.md`
- `docs/agent-skills-and-mcp-plan.md`
- `docs/global-localization-bug-report.md`
- `docs/ui-calendar-i18n-bug-report.md`
- `docs/global-address-strategy.md`
- `docs/global-address-provider-setup.md`
- `docs/mcp-security-policy.md`
- `docs/mcp-local-setup.md`
- `docs/ci-quality-gates.md`
- `docs/deployment.md`

### 3.3 Requested plan files not found by exact name
- `SLOTPILOT_IYZICO_PAYMENT_INTEGRATION_PLAN.md` (exact file not found; payment planning covered across roadmap + payment docs)
- `SLOTPILOT_POST_MVP_EXPANSION_PLAN.md` (exact case variant not found; equivalent: `SlotPilot_POST_MVP_EXPANSION_PLAN.md`)

## 4. Feature-by-feature implementation table (A-L)
Status legend: `DONE`, `PARTIAL`, `MISSING`, `BROKEN`, `SUPERSEDED`, `NOT APPLICABLE`, `UNKNOWN`

### A) Core SaaS
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Multi-tenant organization model | DONE | `prisma/schema.prisma`, `src/lib/organization.ts`, `src/app/api/*` | `src/tests/multi-location.test.ts`, `src/tests/security.test.ts` | Low | `organizationId` scoping pervasive in schema/routes | Keep tenant leak regression tests in CI |
| Organization owner flow | DONE | `src/app/(auth)/onboarding/page.tsx`, `src/app/api/organizations/route.ts` | `tests/e2e/auth-and-guards.spec.ts` | Medium | Owner onboarding and org creation present | Add explicit owner-flow integration test (API + UI assertions) |
| Service CRUD | DONE | `src/app/api/services/route.ts`, `src/app/api/services/[id]/route.ts`, `src/app/dashboard/services/page.tsx` | `src/tests/service-content-preservation.test.ts` | Low | CRUD + content preservation | Keep regression tests for multilingual content |
| Staff CRUD | DONE | `src/app/api/staff/route.ts`, `src/app/api/staff/[id]/route.ts`, `src/app/dashboard/staff/page.tsx` | `src/tests/staff-authorization.test.ts` | Low | CRUD with org checks | Add negative tests for cross-org service assignment |
| Availability management | DONE | `src/app/api/availability/route.ts`, `src/app/api/availability/[id]/route.ts`, `src/app/dashboard/availability/page.tsx` | `src/tests/booking-engine.test.ts` | Low | Rule upsert + per-staff management active | Add e2e around availability edits |
| Public booking page | DONE | `src/app/booking/[slug]/page.tsx`, `src/app/api/booking/[slug]/profile/route.ts` | `tests/e2e/payment-flow.spec.ts` | Low | Public booking flow active | Keep smoke coverage on suspended/disabled orgs |
| Slot generation | DONE | `src/services/booking.service.ts`, `src/app/api/booking/[slug]/slots/route.ts` | `src/tests/booking-engine.test.ts`, `src/tests/booking-slots-route.test.ts` | Low | Date parsing and slot generation tested | Add timezone edge-case tests |
| Double booking prevention | DONE | `src/services/booking.service.ts` | `src/tests/booking-engine.test.ts` | Medium | Conflict checks exist; race window still operational risk | Add transaction/locking stress tests |
| Appointment dashboard | DONE | `src/app/dashboard/appointments/page.tsx`, `src/app/api/appointments/route.ts` | `tests/e2e/auth-and-guards.spec.ts` | Low | Filters + pagination present | Add e2e filter persistence checks |
| Reminder system | PARTIAL | `src/app/api/reminders/route.ts`, `src/app/api/reminders/process/route.ts`, `src/services/reminder.service.ts` | `src/tests/reminders-process-route.test.ts` | Medium | Processing/idempotency present; scheduler/queue operations limited | Add production worker orchestration + retries |
| Analytics dashboard | DONE | `src/app/dashboard/analytics/page.tsx`, `src/app/api/analytics/route.ts` | `src/tests/admin-usage-route.test.ts` | Low | Monthly/summary analytics active | Add correctness snapshot tests |
| Audit logs | DONE | `prisma/schema.prisma` (`AuditLog`), `src/services/audit.service.ts`, `src/app/api/audit-logs/route.ts` | `src/tests/admin-gdpr-requests-route.test.ts` | Low | Create and query paths present | Add immutable/audit-integrity tests |
| Plan limits | DONE | `src/lib/billing.ts`, `src/app/api/billing/checkout/route.ts` | `src/tests/plan-limits.test.ts`, `src/tests/turkey-pricing.test.ts` | Medium | Limits enforced in logic/tests | Add end-to-end enforcement test at UI actions |

### B) Turkey localization
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Turkish UI | DONE | `src/messages/tr.json`, `src/i18n/locales.ts` | `src/tests/landing-localization.test.ts` | Low | TR locale complete | Continue key parity checks |
| TRY currency | DONE | `src/i18n/locales.ts`, `src/config/pricing.tr.ts` | `src/tests/turkey-pricing.test.ts` | Low | TRY defaults and pricing aligned | Keep price regression tests |
| Turkey provinces | DONE | `src/data/turkey-provinces.ts` | `src/tests/turkey-data.test.ts` | Low | Province dataset active | Maintain data audit script usage |
| Turkey districts | DONE | `src/data/turkey-provinces.ts`, district audit scripts | `src/tests/turkey-districts.test.ts` | Medium | District dataset and tests exist | Keep DS audit in CI optional gate |
| +90 phone normalization | DONE | `src/lib/phone.ts` | `src/tests/turkey-data.test.ts` | Low | Normalize/display helpers verified | Reuse in all inbound channels |
| KVKK consent | DONE | `src/app/booking/[slug]/page.tsx`, `src/lib/validators.ts` | `src/tests/kvkk-consent.test.ts` | Low | Privacy acknowledgment and consent fields present | Add UI text legal review |
| Marketing consent separation | DONE | `prisma/schema.prisma` (`marketingConsent`), notification templates | `src/tests/notification-i18n.test.ts` | Low | Marketing gate separated from booking consent | Add per-channel consent audit |
| Turkish notification templates | DONE | `src/services/notifications/templates/tr/*` | `src/tests/notification-i18n.test.ts` | Low | TR templates ready | Add legal wording review |
| Turkish marketplace categories | DONE via newer implementation | `src/data/marketplace-categories.ts`, `src/app/marketplace/page.tsx` | `src/tests/marketplace-categories.test.ts` | Low | Canonical slug + localized labels replaced older hardcode | Keep alias compatibility tests |
| e-Arsiv/e-Fatura export preparation | PARTIAL | `src/app/api/revenue/export/route.ts`, `prisma/schema.prisma` | No dedicated e-invoice test | Medium | Export includes invoice fields but no official integration | Add formal e-document mapping/spec tests |
| Turkey holidays / closed days | DONE | `src/data/turkey-holidays.ts`, `src/services/booking.service.ts`, `src/app/api/business-closed-days/route.ts` | `src/tests/turkey-holidays.test.ts` | Low | Holiday + business closed-day checks active | Add UI visibility test for closed-day reason |

### C) Global localization
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Language selector | DONE | `src/components/i18n/LanguageSwitcher.tsx` | `tests/e2e/i18n-flow.spec.ts` | Low | Switcher and path-preserving behavior present | Add keyboard-only accessibility e2e |
| Supported languages tr/en/de/ar/es/fr/it/fa/ru/nl | DONE | `src/i18n/locales.ts`, `src/messages/*.json`, `mobile/src/i18n/config.ts` | `src/tests/i18n-rtl.test.ts`, `npm run i18n:check` | Low | 10-language list present on web+mobile | Keep parity checks mandatory |
| i18n message files | DONE | `src/messages/*.json` | `scripts/check-translations.ts` | Low | File parity gate exists | Add CI artifact for missing keys |
| Missing key checker | DONE | `package.json` (`i18n:check`), `scripts/check-translations.ts` | Command gate | Low | Script present and passing | Keep in CI hard gate |
| RTL for ar/fa | DONE | `src/i18n/locales.ts`, `src/app/layout.tsx` (`dir`) | `src/tests/i18n-rtl.test.ts` | Low | Direction metadata enforced | Add visual RTL snapshots |
| Russian Cyrillic render support | DONE | `src/messages/ru.json`, mobile RU strings | `src/tests/locale-formatting.test.ts` | Low | RU content present and formatted | Add screenshot regression |
| Dutch long-text overflow consideration | PARTIAL | `src/messages/nl.json`, UI components | No dedicated overflow test | Medium | NL text exists but overflow stress tests limited | Add viewport + long-label UI tests |
| hreflang / SEO locale support | DONE | `src/app/layout.tsx`, `src/lib/seo/i18n.ts`, `src/app/sitemap.ts` | `src/tests/request-locale.test.ts` | Low | Alternates/canonical helpers active | Add SEO snapshot test |
| Mobile i18n sync | DONE | `mobile/src/i18n/config.ts`, `mobile/src/i18n/index.tsx` | `cd mobile && npm run typecheck` | Medium | Locale list synchronized; mobile test script missing | Add mobile translation parity/test script |

### D) Global address / marketplace
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Country-aware marketplace filters | DONE | `src/app/marketplace/page.tsx`, `src/app/api/marketplace/route.ts` | `src/tests/marketplace.test.ts`, `tests/e2e/marketplace-localization.spec.ts` | Low | Country/locality logic implemented | Keep e2e on TR/non-TR flows |
| Italy must not show Turkey provinces | DONE | `src/lib/address/location-options.ts`, `src/app/marketplace/page.tsx` | `tests/e2e/marketplace-localization.spec.ts` | Low | TR provinces gated to TR | Maintain regression spec |
| Turkey must still show Turkey provinces | DONE | same as above | same as above | Low | TR path preserved | Maintain regression spec |
| Global provider/manual city search | DONE | `src/components/address/AddressAutocomplete.tsx`, address APIs | `src/tests/marketplace.test.ts` | Medium | Autocomplete + fallback path active | Add failure fallback e2e |
| NormalizedAddress model | DONE | `prisma/schema.prisma` (`NormalizedAddress`) | `src/tests/marketplace.test.ts` | Low | Model + usage implemented | Add migration/backfill verification test |
| AddressProvider abstraction | DONE | `src/services/address/address-provider.interface.ts`, factory | `src/tests/marketplace.test.ts` | Low | Interface + factory + fallback present | Add provider contract tests |
| Google/Mapbox/Apple/OSM plan or implementation | PARTIAL | provider files under `src/services/address/providers/*` | No live provider integration tests | Medium | Google active; Mapbox/Apple/OSM throw not implemented | Implement or mark disabled per environment |
| Country-specific address forms | DONE | `src/config/country-address-config.ts`, onboarding/booking forms | `src/tests/marketplace-filters.test.ts` | Medium | Country config drives labels/fields | Add form rendering tests per country |
| Mobile address picker (if planned) | MISSING | mobile screens | No tests | Low | No dedicated mobile address picker found | Define scope in next mobile phase |

### E) Payment
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| PaymentProvider abstraction | DONE | `src/services/payment/payment-provider.interface.ts`, `payment.factory.ts` | `src/tests/turkey-payment.test.ts` | Low | Provider interface/factory in place | Keep contract tests for each provider |
| Stripe test billing | DONE | `src/app/api/billing/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts` | `src/tests/accounting.test.ts`, `src/tests/deposit-payment.test.ts` | Medium | Stripe paths implemented | Add staging live-webhook smoke |
| iyzico integration plan/implementation | PARTIAL | `src/services/payment/iyzico.provider.ts` | `src/tests/turkey-payment.test.ts` | High | Stub throws unless configured; no full flow | Implement end-to-end iyzico adapter |
| Appointment deposit payment | DONE | `src/app/api/booking/[slug]/checkout-session/route.ts` | `src/tests/deposit-payment.test.ts`, `tests/e2e/payment-flow.spec.ts` | Medium | Deposit status and checkout flow present | Add refund/cancel edge tests |
| Subscription payment | DONE | billing routes + Stripe webhook | `src/tests/accounting.test.ts` | Medium | Subscription checkout + status update present | Add upgrade/downgrade lifecycle tests |
| Manual bank transfer flow | PARTIAL | `src/services/payment/manual-bank-transfer.provider.ts`, `src/app/api/payment/manual/route.ts` | `src/tests/turkey-payment.test.ts` | Medium | Provider exists, mostly instruction-based | Add reconciliation/admin approval flow |
| PayTR/Param placeholders | DONE | `paytr.provider.ts`, `param.provider.ts` | `src/tests/turkey-payment.test.ts` | Medium | Placeholder adapters intentionally present | Mark as non-production in docs/UI |
| Webhook idempotency | DONE | `src/app/api/webhooks/stripe/route.ts`, `WebhookEvent` model | `src/tests/accounting.test.ts` | Low | Duplicate event guard active | Keep permanent idempotency coverage |
| Backend-only payment status updates | DONE | webhook + server routes | `src/tests/deposit-payment.test.ts` | Medium | Payment status mutated server-side | Add explicit test ensuring no client override route |
| Duplicate webhook protection | DONE | `WebhookEvent` unique `(provider,eventId)` | `src/tests/accounting.test.ts` | Low | DB+logic protection | Keep observability on duplicate frequency |
| Payment tests | DONE | payment tests under `src/tests` + e2e payment spec | multiple | Medium | Good coverage for Stripe/deposit | Add provider-specific suites for non-Stripe |

### F) WhatsApp automation
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| WhatsApp inbound webhook | DONE | `src/app/api/webhooks/whatsapp/route.ts`, `src/services/whatsapp-webhook.service.ts` | `src/tests/whatsapp-webhook.test.ts`, `src/tests/whatsapp-integration.test.ts` | Medium | Inbound parse/store pipeline implemented | Add signature validation hardening |
| Auto booking link reply | DONE | `src/services/whatsapp-auto-reply.service.ts` | `src/tests/whatsapp-auto-reply.test.ts` | Low | Auto-reply logic active | Add multilingual reply-mode tests |
| Cooldown | DONE | `WhatsAppAutoReplySettings.cooldownHours`, service logic | `src/tests/whatsapp-auto-reply.test.ts` | Low | Cooldown enforced | Add org-level override e2e |
| Opt-out keywords | DONE | auto-reply service + contact preferences | `src/tests/whatsapp-auto-reply.test.ts` | Low | Opt-out behavior implemented | Add localized keyword packs |
| Fake provider mode | DONE | `fake-whatsapp*.provider.ts`, dev inbound route | `src/tests/whatsapp-integration.test.ts` | Low | Development simulation supported | Keep dev-only guard strict |
| Provider failure handling | PARTIAL | webhook and auto-reply error logging | tests cover no-crash paths | Medium | Failures logged, retry orchestration limited | Add retry/backoff policy |
| Marketing vs transactional separation | DONE | notification templates + consent gates | `src/tests/notification-i18n.test.ts`, `src/tests/kvkk-consent.test.ts` | Low | Consent split implemented | Add audit log for marketing sends |

### G) Staff portal
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| StaffInvite model | DONE | `prisma/schema.prisma` (`StaffInvite`) | `src/tests/staff-portal.test.ts` | Low | Model exists with statuses | Keep migration compatibility tests |
| Token hash storage | DONE | `tokenHash` field + invite service | `src/tests/staff-invite-token.test.ts` | Low | Secure token-hash path present | Remove any legacy raw-token fallback if any |
| Invite accept flow | DONE | `src/app/api/auth/accept-invite/route.ts`, `/staff/invite/[token]` | `src/tests/staff-portal.test.ts` | Medium | Accept/invalidate/revoke flow active | Add expiry race tests |
| Staff-user link | DONE | `Staff.userId`, invite accept updates | `src/tests/staff-authorization.test.ts` | Low | Linking logic exists | Add unlink/deactivate lifecycle tests |
| `/staff` routes | DONE | `src/app/staff/*` | `tests/e2e/auth-and-guards.spec.ts` | Low | Staff pages available | Add route-level SSR guard tests |
| Staff dashboard | DONE | `src/app/staff/dashboard/page.tsx` | `tests/e2e/auth-and-guards.spec.ts` | Low | Dashboard implemented | Add KPI rendering assertions |
| Staff appointment list | DONE | `src/app/staff/appointments/page.tsx`, staff APIs | `src/tests/staff-authorization.test.ts` | Low | Scoped list implemented | Add pagination tests |
| Staff availability | DONE | `src/app/staff/availability/page.tsx`, staff availability APIs | `src/tests/staff-authorization.test.ts` | Low | Staff self-availability implemented | Add conflict validation tests |
| Staff authorization tests | DONE | `src/tests/staff-authorization.test.ts` | same | Low | Critical auth assertions present | Keep in mandatory CI |
| Staff blocked from billing/admin | PARTIAL | superadmin guard + staff auth patterns | no direct staff-vs-billing negative e2e | Medium | Guards exist but explicit billing denial test not found | Add explicit unauthorized access tests |

### H) Super admin
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| `platformRole` or equivalent | DONE | `prisma/schema.prisma` (`PlatformRole`, `User.platformRole`) | admin route tests | Low | Role model implemented | Keep role enum migration safety |
| `/admin` route guard | DONE | `src/lib/superadmin.ts`, admin APIs/pages | `src/tests/admin-*.test.ts` | Low | Superadmin requirement enforced | Add end-to-end unauthorized redirect checks |
| Organization list | DONE | `src/app/api/admin/organizations/route.ts`, admin page | `src/tests/admin-usage-route.test.ts` | Low | List endpoints present | Add filter/search tests |
| Subscription/usage view | DONE | `src/app/api/admin/subscriptions/route.ts`, `usage/route.ts` | `src/tests/admin-subscriptions-route.test.ts`, `admin-usage-route.test.ts` | Low | Usage + subscription metrics active | Add load/perf baseline tests |
| Suspend/activate organization | DONE | `src/app/api/admin/organizations/[id]/route.ts` | `src/tests/deposit-payment.test.ts`, `src/tests/multi-location.test.ts` | Medium | Lifecycle toggles present | Add dedicated suspend/reactivate API tests |
| Suspended org blocks public booking | DONE | booking public APIs guard on suspended | `src/tests/deposit-payment.test.ts`, `src/tests/multi-location.test.ts` | Low | Booking/services/slots blocked when suspended | Keep as critical regression gate |
| Admin audit logs | DONE | `src/app/api/admin/audit-logs/route.ts` | `src/tests/admin-gdpr-requests-route.test.ts` | Low | Audit access provided | Add immutability checks |
| Admin tests | DONE | multiple `src/tests/admin-*.test.ts` | same | Low | Broad admin API coverage | Add admin page UI e2e smoke |

### I) Calendar/UI/theme bugfix
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Real calendar/date picker | DONE | `src/components/booking/BookingDatePicker.tsx`, `src/components/ui/calendar.tsx` | `src/tests/booking-date-picker.test.ts`, `tests/e2e/calui-regression.spec.ts` | Low | Replaced manual date input | Keep e2e month navigation test |
| Month navigation | DONE | calendar component + booking picker | `tests/e2e/calui-regression.spec.ts` | Low | Next-month navigation validated | Add previous-month boundary checks |
| Future date selection | DONE | booking date picker disabled logic | `tests/e2e/calui-regression.spec.ts` | Low | Future selectable + past disabled | Add timezone boundary e2e |
| Date-based slot fetch | DONE | `src/app/booking/[slug]/page.tsx`, slots API | `src/tests/booking-slots-route.test.ts` | Low | Query includes date parameter | Add malformed locale-date UI tests |
| Closed/past/unavailable disabled states | DONE | picker disabled callbacks + booking service closed-day checks | `src/tests/turkey-holidays.test.ts`, `src/tests/booking-engine.test.ts` | Medium | States implemented across layers | Add UI visible reason labels |
| Dashboard dark theme consistency | PARTIAL | dashboard pages + theme class audits | `src/tests/dashboard-theme-class-audit.test.ts` | Medium | Improvements present, but mixed hard-coded classes still exist | Add central design token audit |
| Table/card design system consistency | PARTIAL | mixed custom + shared UI components | no dedicated snapshot suite | Medium | Not fully standardized | Add visual regression suite |
| Contrast/accessibility | PARTIAL | ARIA and focus ring present in many components | `src/tests/booking-accessibility-theme-audit.test.ts` | Medium | Baseline exists; full WCAG audit missing | Run automated a11y checks (axe/playwright) |
| UI strings vs business-entered content strategy | DONE | docs + content-preservation tests | `src/tests/booking-services-content-preservation.test.ts` | Low | Strategy and safeguards visible | Keep locale/business content split rules |
| E2E regression tests | DONE | `tests/e2e/*` | Playwright suite | Medium | E2E exists and runs | Expand failures to block release on critical specs |

### J) Mobile app
| Item | Status | Evidence files | Related tests | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Expo app exists | DONE | `mobile/package.json`, `mobile/App.tsx` | `npx expo-doctor` | Low | Expo project active | Keep SDK upgrades planned |
| Login | DONE | `mobile/src/screens/LoginScreen.tsx`, mobile auth APIs | `mobile typecheck` | Medium | Login implemented; no mobile test script | Add mobile auth unit/integration tests |
| Dashboard summary | DONE | `mobile/src/screens/DashboardScreen.tsx` | `mobile typecheck` | Medium | Summary cards/stats implemented | Add snapshot tests |
| Appointment list | DONE | `mobile/src/screens/AppointmentsScreen.tsx`, `/api/mobile/appointments` | `mobile typecheck` | Medium | List + filtering path exists | Add API contract tests |
| Appointment detail | DONE | `mobile/src/screens/AppointmentDetailScreen.tsx`, `/api/mobile/appointments/[id]` | `mobile typecheck` | Medium | Detail + status update paths exist | Add detail rendering tests |
| Staff mode | DONE | dashboard/staff-mode toggles + scoped APIs | `mobile typecheck` | Medium | Staff-owner mode differentiation present | Add role-based mobile e2e |
| Navigation | DONE | mobile navigation stack files | `mobile typecheck` | Low | Navigation implemented | Add deep-link tests |
| Offline cache (if planned) | PARTIAL | AsyncStorage + offline banners | runtime-only | Medium | Foundation exists, broader offline scenarios limited | Add offline test matrix |
| Push notification foundation (if planned) | DONE | `MobilePushToken` model, `/api/mobile/push/register` | no dedicated mobile push tests | Medium | Foundation implemented server-side | Add push registration/invalidation tests |
| Mobile i18n | DONE | `mobile/src/i18n/config.ts`, `mobile/src/i18n/index.tsx` | `mobile typecheck` | Medium | 10-locale sync present | Add parity checker for mobile dictionaries |
| Expo doctor/test scripts | PARTIAL | `mobile/package.json` | `expo-doctor PASS`, `mobile test MISSING` | High | Typecheck present, test script missing | Add `mobile test` and baseline suite |

### K) Production readiness
| Item | Status | Evidence files | Related tests/commands | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| Strict CI | DONE | `.github/workflows/ci.yml` | CI workflow | Low | Fail-fast gates configured | Keep mandatory branch protection |
| No `|| echo skipped` masking | DONE | scripts/workflows audit | command audit | Low | No masking pattern observed in gates | Keep lint rule for scripts |
| Secret scan | DONE | `scripts/check-no-secrets.js`, `check:secrets` | command | Low | Script exists and passes | Keep as pre-commit/CI gate |
| Node version pin | DONE | `.nvmrc`, `package.json engines` | `check:node` | Low | Version policy defined | Ensure team tooling alignment |
| Prisma validate/generate in CI | DONE | workflow + npm prisma scripts | CI workflow | Low | CI uses npm scripts (works) | Keep avoiding raw `npx` in this workspace |
| PostgreSQL production readiness | PARTIAL | `docs/database-production-readiness.md` | docs/manual | Medium | Plan/docs exist; runtime target still mixed | Add staging Postgres rehearsal evidence |
| E2E tests | DONE | `tests/e2e/*`, `npm run test:e2e` | command | Medium | Suite exists (11 pass, 1 skipped) | Reduce skip and enforce critical tags |
| Observability/admin health | PARTIAL | `src/app/api/admin/health/route.ts`, `docs/observability.md` | `src/tests/admin-health-route.test.ts` | Medium | Health endpoints and failure feeds exist | Add alerting/threshold policies |
| Background jobs | PARTIAL | reminders process + webhook-event tracking | `src/tests/reminders-process-route.test.ts` | High | No robust queue/retry/worker orchestration | Add queue + retry strategy |
| Deployment docs | DONE | `docs/deployment.md` | doc review | Low | Deployment checklist present | Add environment-specific runbooks |
| Rollback notes | PARTIAL | scattered notes in docs | manual | Medium | No single rollback playbook | Create explicit rollback SOP |
| CHANGELOG | DONE | `CHANGELOG.md` | doc review | Low | Changelog maintained | Enforce release-entry checklist |

### L) Agent Skills and MCP
| Item | Status | Evidence files | Related tests/commands | Risk | Notes | Recommended next action |
|---|---|---|---|---|---|---|
| AGENTS.md | DONE | `AGENTS.md` | doc review | Low | Guardrails and gates documented | Keep synced with CI scripts |
| CLAUDE.md | DONE | `CLAUDE.md` | doc review | Low | Agent execution rules present | Keep phase discipline updates |
| `.claude/skills/*/SKILL.md` | DONE | skill files under `.claude/skills` | `validate:skills` | Low | Skill docs present and validated | Add per-skill smoke checks |
| validate-skills script | DONE | `scripts/validate-skills.js`, `package.json` | `npm run validate:skills` | Low | Works and passing | Keep as CI gate |
| `.mcp.json.example` | DONE | `.mcp.json.example` | doc review | Low | Example config present | Keep provider/security comments updated |
| real `.mcp.json` ignored | DONE | `.gitignore` | doc review | Low | `.mcp.json` ignored | Add pre-commit guard for accidental commits |
| MCP security policy | DONE | `docs/mcp-security-policy.md` | doc review | Low | Security boundaries documented | Add periodic policy checklist |
| GitHub MCP docs | DONE | `docs/mcp-local-setup.md`, `.mcp.json.example` | doc review | Low | Github MCP usage documented | Add token-scope examples |
| Playwright MCP docs | DONE | `docs/mcp-local-setup.md`, `.mcp.json.example` | doc review | Low | Playwright MCP documented | Add test-runbook examples |
| Read-only DB MCP policy | DONE | `.mcp.json.example` (`postgres-readonly-local` disabled by default), policy docs | doc review | Low | Read-only posture explicitly documented | Add automated config linter |
| Agent readiness check | MISSING | `package.json` (no `agent:check`) | `npm run agent:check` fails | High | Missing required script/gate | Implement `agent:check` script and CI hook |

## 5. Phase-by-phase status table
| Phase | Status | Evidence summary | Risk | Next action |
|---|---|---|---|---|
| TR | DONE | TR locale, phone, KVKK, holidays, pricing, tests | Low | Maintain legal text updates |
| WA | DONE | Inbound webhook, auto reply, cooldown/opt-out, logs/tests | Medium | Add retry + signature hardening |
| DS | DONE | District data/tests/audit scripts present | Medium | Promote district audit as strict CI job |
| I18N | DONE | next-intl wiring, locale routing, parity checks | Low | Add visual RTL snapshots |
| LANG | DONE | 10 locales web+mobile+templates | Medium | Add mobile translation parity script |
| ADDR | PARTIAL | Global address abstraction active; some providers stubbed | Medium | Implement or disable stub providers per env |
| GLF | DONE via newer implementation | Country-aware marketplace + TR/non-TR e2e | Low | Keep regression tests mandatory |
| CALUI | DONE | Date picker/nav/fetch fixes + e2e spec | Medium | Expand accessibility visual tests |
| SAP | DONE | Staff portal + superadmin flows largely complete | Medium | Add explicit staff-denied billing/admin tests |
| ASM | PARTIAL | Skills/MCP baseline complete; `agent:check` missing | High | Add script and CI gate |
| PROD | PARTIAL | CI strong, but job ops/rollback/prisma command reliability risks | High | Close operational hardening gaps |
| Post-MVP | PARTIAL | Plans and foundations exist | Medium | Convert roadmap items into tracked execution phases |

## 6. Missing features
- `agent:check` script and gate (`MISSING`, High).
- `mobile` test script (`npm test`) and automated mobile test suite (`MISSING`, High).
- Full live iyzico integration (currently stub/placeholder) (`PARTIAL/MISSING`, High).
- Complete non-Google address providers (Mapbox/Apple/OSM not implemented) (`PARTIAL`, Medium).
- Dedicated mobile address picker (if required by roadmap) (`MISSING`, Low).
- Central rollback playbook (`PARTIAL/MISSING`, Medium).

## 7. Partially implemented features
- Reminder/background job operations (idempotent endpoint exists; queue/retry/ops maturity incomplete).
- Production observability and incident operations depth.
- Dashboard design-system consistency and full accessibility coverage.
- Manual bank transfer reconciliation lifecycle.
- Staff-denied access explicit test coverage for billing/admin boundaries.

## 8. Fully implemented features
- Multi-tenant org scoping across schema/routes.
- Core CRUD flows (service/staff/availability) and public booking.
- Slot generation + booking conflict checks.
- Staff portal and superadmin core flows.
- 10-language i18n stack (web/mobile) with parity checker.
- Country-aware marketplace filters with TR/non-TR regression tests.
- WhatsApp auto-reply core module with cooldown/opt-out.
- Stripe webhook signature + duplicate-event idempotency.
- CI quality gates (lint/test/build/prisma scripts/skills/secret checks).

## 9. Superseded / replaced features
- Older Turkey-only marketplace listing behavior replaced by country-aware route/filter model (`DONE via newer implementation`).
- Province slug listing page behavior replaced by redirect model for legacy compatibility (`SUPERSEDED`).
- Earlier limited locale scope superseded by 10-locale wave (`DONE via newer implementation`).
- Earlier plan references naming/case variants replaced by current file names (document-level supersession).

## 10. Broken or risky implementations
- `npx prisma validate` / `npx prisma generate` in current Windows workspace path (`BROKEN` command reliability risk, not code logic failure).
- Missing `agent:check` gate (`BROKEN` production-readiness workflow gap).
- Missing `mobile test` script (`BROKEN` mobile quality gate gap).
- Non-Stripe providers are present but not production-complete (`PARTIAL` high business risk if expected live).

## 11. Tests that exist
- Unit/integration: broad `src/tests/*` coverage (auth, booking, staff/admin, payments, i18n, security, marketplace, WhatsApp, reminders).
- E2E: Playwright specs including auth/guards, payment flow, i18n flow, calendar regression, marketplace localization.
- Mobile quality checks: `mobile typecheck`, `expo-doctor`.
- Data/locale audits: district, holiday, translation parity scripts.

## 12. Tests that are missing
- Mobile automated test suite (`mobile npm test` missing).
- Dedicated tests for live non-Stripe payment providers.
- Explicit staff user denied access tests for dashboard billing/admin surfaces.
- Visual regression/accessibility suite covering all dashboard pages.
- End-to-end queue/retry resilience tests for reminders/webhook failure recovery.

## 13. UI bugs still visible from code structure
- Mixed direct utility styling and custom color usage across dashboard surfaces may cause theme inconsistency.
- Long localized strings (especially NL/DE/AR) lack dedicated overflow snapshot tests.
- Some page-level components still mix semantic patterns inconsistently (table/card sections).
- Accessibility is improved but not comprehensively enforced with automated a11y scans.

## 14. Production readiness status
Overall production readiness: `PARTIAL`

Strengths:
- Strong CI and quality gates.
- Good core domain coverage and tests.
- Security-oriented patterns (tenant scoping, webhook verification, idempotency).

Blocking/near-blocking risks:
- Missing `agent:check` script.
- Missing mobile `test` script and suite.
- `npx prisma` command reliability issue in this workspace path.
- Incomplete operational maturity for background jobs and non-Stripe payment rollout.

## 15. Recommended next 10 tasks (priority order)
1. Add `agent:check` script and include it in CI + local phase gates.
2. Add `mobile` test script and baseline mobile test suite.
3. Standardize Prisma command usage to npm scripts only in docs/gates; document Windows path-safe execution.
4. Implement explicit staff-denied access tests for billing/admin areas.
5. Implement retry/backoff and operational controls for reminder/background jobs.
6. Harden WhatsApp webhook security (signature verification + stronger failure policies).
7. Decide and implement live Turkey payment provider (iyzico) end-to-end or formally de-scope.
8. Add visual regression/a11y checks for dashboard and localized long-text cases.
9. Complete/disable non-Google address providers with clear environment gating.
10. Create unified rollback runbook (DB + app + webhook/provider failures).

## Command and verification matrix (pass/fail + script existence)
### First run (pre-report)
| Command | Result |
|---|---|
| `npm run check:node` | PASS |
| `npm run check:secrets` | PASS |
| `npm run validate:skills` | PASS |
| `npm run agent:check` | MISSING SCRIPT |
| `npm run i18n:check` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS |
| `npm run build` | PASS |
| `npx prisma validate` | FAIL (workspace path parsing risk) |
| `npx prisma generate` | FAIL (workspace path parsing risk) |
| `npm run test:e2e` | PASS (11 passed, 1 skipped) |
| `cd mobile && npm run typecheck` | PASS |
| `cd mobile && npm test` | MISSING SCRIPT |
| `cd mobile && npx expo-doctor` | PASS |

### Second run (post-report rerun)
| Command | Result |
|---|---|
| `npm run check:node` | PASS |
| `npm run check:secrets` | PASS |
| `npm run validate:skills` | PASS |
| `npm run agent:check` | MISSING SCRIPT |
| `npm run i18n:check` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS (69 files, 403 tests) |
| `npm run build` | PASS |
| `npx prisma validate` | FAIL (workspace path parsing risk: `'Reminder' is not recognized...` + wrong module path) |
| `npx prisma generate` | FAIL (workspace path parsing risk: `'Reminder' is not recognized...` + wrong module path) |
| `npm run test:e2e` | PASS (11 passed, 1 skipped) |
| `cd mobile && npm run typecheck` | PASS |
| `cd mobile && npm test` | MISSING SCRIPT |
| `cd mobile && npx expo-doctor` | PASS |

## Post-report rerun notes
- `npm run test:e2e` first attempt failed with `spawn EPERM` under sandbox; rerun outside sandbox succeeded.
- `npx expo-doctor` first attempt failed with `ENOTCACHED` (registry cache restriction in sandbox); rerun outside sandbox succeeded.
- `npx prisma validate/generate` failed consistently and reproducibly in this workspace due command/path parsing behavior.
