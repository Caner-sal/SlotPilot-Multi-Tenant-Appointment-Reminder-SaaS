# Agent Runbook

## Purpose

This runbook aligns Codex/Claude execution with production-readiness goals and prevents scope drift.

## Standard Flow Per Phase

1. Read target plan section and prior `docs/COMPACT_STATE.md`.
2. Confirm in-scope files and avoid cross-phase changes.
3. Implement with tenant/payment/security guardrails.
4. Run required quality gates.
5. Update docs for decisions, residual risks, and next step.

## Guardrails

- No hidden CI skips.
- No client-trusted payment updates.
- No cross-tenant access paths.
- No unredacted secrets/PII in logs.

## Required Outputs

- Code changes
- Test evidence
- Documentation updates
- Compact state update (every two phases)
