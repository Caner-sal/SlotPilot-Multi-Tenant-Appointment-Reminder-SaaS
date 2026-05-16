# Phase Execution Rules

## Scope Control

- Execute only one phase group at a time unless explicitly bundled.
- Do not include unrelated refactors in phase commits.

## Test Discipline

- Failing checks block commit/push for that phase.
- Never use `|| echo skipped` for quality gates.

## Security Discipline

- Verify tenant boundaries in changed queries/routes.
- Avoid logging raw request bodies for sensitive routes.
- Keep webhook and payment routes backend-authoritative.

## Documentation Discipline

- Update phase docs and compact state after completion.
- Document deferred work and rationale explicitly.
