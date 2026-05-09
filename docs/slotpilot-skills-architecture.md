# SlotPilot — Custom Claude Skills Architecture

> Phase DS-4: Skills architecture design inspired by anthropics/skills patterns.

## Overview

SlotPilot defines reusable Claude skills that encode recurring development workflows. Each skill is a SKILL.md file under `.claude/skills/skill-name/`.

## Skill Folder Structure

```
.claude/
  skills/
    slotpilot-booking-regression/
      SKILL.md
    slotpilot-turkey-data/
      SKILL.md
    slotpilot-mcp-integration/
      SKILL.md
    slotpilot-payment-safety/
      SKILL.md
    slotpilot-release-manager/
      SKILL.md
```

## Skills Catalog

### 1. slotpilot-booking-regression
**Trigger:** After any change to booking engine, slot generation, availability rules, or appointment creation.
**Workflow:** Run booking-engine.test.ts, tenant-security.test.ts, plan-limits.test.ts. Verify build. Report pass/fail.
**Test prompt:** "Run booking regression after changes to slot generation."

### 2. slotpilot-turkey-data
**Trigger:** After any change to turkey-provinces.ts, district data, or Turkey localization files.
**Workflow:** Run audit-turkey-districts.ts. Run turkey-districts.test.ts and turkey-data.test.ts. Report province/district counts.
**Test prompt:** "Validate Turkey district data after changes."

### 3. slotpilot-mcp-integration
**Trigger:** When setting up or reviewing MCP configuration.
**Workflow:** Check .mcp.json.example for secrets. Verify filesystem scope. Run check-no-secrets.js. Report safety.
**Test prompt:** "Review MCP configuration for security issues."

### 4. slotpilot-payment-safety
**Trigger:** After any change to Stripe integration, billing routes, or payment webhooks.
**Workflow:** Run deposit-payment.test.ts, plan-limits.test.ts, accounting.test.ts. Check for hardcoded keys. Report.
**Test prompt:** "Run payment safety review after billing changes."

### 5. slotpilot-release-manager
**Trigger:** When preparing a new release or version tag.
**Workflow:** Run all tests. Run build. Run audit-turkey-districts.ts. Run validate-skills.js. Run check-no-secrets.js. Update CHANGELOG.md. Create git tag. Push.
**Test prompt:** "Prepare release v1.x.y with full QA checklist."

## Eval Strategy

Each skill has a corresponding eval prompt in `evals/skills/` as a JSON file. Evals test that the skill correctly triggers on the right events and produces the expected output.

## License Notes

- All skills are original SlotPilot content.
- No content copied from anthropics/skills verbatim.
- Skills are inspired by the pattern of trigger → workflow → expected output.
