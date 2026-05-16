# Randevo Agent Run Rules (Claude Code)

Use this guide for safe, phase-based implementation.

## Execution Principles

- Implement only the target phase scope.
- Keep local SQLite development intact unless migration scope says otherwise.
- Prefer additive, reversible changes for production hardening.
- Avoid hidden skips in CI and scripts.

## Quality Gates (Required)

```bash
npm run check:node
npm run check:secrets
npm run validate:skills
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
```

Optional by phase:

- `npm run test:e2e` for web flow changes
- `cd mobile && npm run typecheck` for mobile changes

## Safety Guardrails

- Never log secrets, raw tokens, or full PII payloads.
- Webhook routes must verify signature and be idempotent.
- Payment confirmation must come from backend events only.
- Never trust client-provided `organizationId`.

## Handover

- Update changelog and compact state after meaningful phase completion.
- Summarize: what changed, tests run, risks left, next phase input.
