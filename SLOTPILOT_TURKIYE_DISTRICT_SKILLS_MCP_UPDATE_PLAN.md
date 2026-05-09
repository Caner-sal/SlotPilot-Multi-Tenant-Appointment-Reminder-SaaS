# Randevo TÃ¼rkiye Ä°lÃ§e Tamamlama + Skills/MCP Entegrasyon PlanÄ±

> Bu dosya, Randevo TÃ¼rkiye yerelleÅŸtirmesi tamamlandÄ±ktan sonra uygulanacak yeni gÃ¼ncelleme planÄ±dÄ±r.  
> AmaÃ§: TÃ¼rkiye il/ilÃ§e verisindeki eksikleri tamamlamak, Anthropic Skills repo mantÄ±ÄŸÄ±ndan projeye uygun skill workflowâ€™larÄ± eklemek, Model Context Protocol reference serverâ€™larÄ±ndan gÃ¼venli ve faydalÄ± olanlarÄ± geliÅŸtirme ortamÄ±na dahil etmek, her phase sonunda test edip GitHubâ€™a pushlamak ve her 2 phase sonrasÄ± contextâ€™i compact etmektir.

---

## 1. GÃ¼ncellemenin Ana Hedefi

Bu gÃ¼ncellemede Ã¼Ã§ ana iÅŸ yapÄ±lacak:

```txt
1. TÃ¼rkiye Ã¶zelinde eksik ilÃ§eler tamamlanacak.
2. anthropics/skills reposu taranÄ±p Randevo iÃ§in faydalÄ± skill yapÄ±larÄ± eklenecek.
3. modelcontextprotocol/servers reposu taranÄ±p projeye faydalÄ± MCP server entegrasyonlarÄ± planlÄ± ÅŸekilde eklenecek.
```

Kritik Ã§alÄ±ÅŸma kurallarÄ±:

```txt
- Her phase ayrÄ± branch Ã¼zerinde yapÄ±lacak.
- Her phase merge edilmeden Ã¶nce test edilecek.
- Test geÃ§mezse merge ve push yapÄ±lmayacak.
- Her phase sonunda commit + push yapÄ±lacak.
- Her 2 phase sonrasÄ± COMPACT_STATE gÃ¼ncellenecek.
- COMPACT_STATE sonrasÄ± /compact Ã§alÄ±ÅŸtÄ±rÄ±lacak veya kullanÄ±cÄ±ya Ã§alÄ±ÅŸtÄ±rmasÄ± sÃ¶ylenecek.
```

---

## 2. AraÅŸtÄ±rma NotlarÄ±

### 2.1 TÃ¼rkiye Ä°l/Ä°lÃ§e Verisi

TÃ¼rkiye tarafÄ±nda proje artÄ±k yalnÄ±zca bÃ¼yÃ¼kÅŸehir ilÃ§eleriyle sÄ±nÄ±rlÄ± kalmamalÄ±. TÃ¼m 81 il ve gÃ¼ncel ilÃ§e listesi hedeflenmeli.

Referans alÄ±nacak kaynak yaklaÅŸÄ±mÄ±:

```txt
Primary official source:
- Ä°Ã§iÅŸleri BakanlÄ±ÄŸÄ± / TÃ¼rkiye MÃ¼lki Ä°dare BÃ¶lÃ¼mleri Envanteri

Secondary machine-readable sources:
- UlaÅŸtÄ±rma ve AltyapÄ± BakanlÄ±ÄŸÄ± teknik dokÃ¼manlarÄ±ndaki ilÃ§e listesi XLSX
- TÃœÄ°K ADNKS / nÃ¼fus veri portallarÄ±

Development convenience source:
- AÃ§Ä±k kaynak JSON il/ilÃ§e veri setleri
```

Hedef veri kalite kriteri:

```txt
- 81 il bulunmalÄ±.
- GÃ¼ncel ilÃ§e sayÄ±sÄ± resmi kaynaÄŸa gÃ¶re doÄŸrulanmalÄ±.
- Ä°l plakasÄ± doÄŸru olmalÄ±.
- Ä°l slug doÄŸru olmalÄ±.
- Ä°lÃ§e slug doÄŸru olmalÄ±.
- BÃ¼yÃ¼k/kÃ¼Ã§Ã¼k harf ve TÃ¼rkÃ§e karakter standardÄ± korunmalÄ±.
- Eski kayÄ±tlardaki province/district deÄŸerleri migration ile bozulmamalÄ±.
```

### 2.2 Anthropic Skills Repoâ€™dan AlÄ±nacak Fikirler

`anthropics/skills` reposu doÄŸrudan uygulama Ã¶zelliÄŸi deÄŸil, Claude/agent workflow kalitesini artÄ±racak skill yapÄ±larÄ± sunar.

Projeye eklenecek uygun fikirler:

```txt
- skill-creator yaklaÅŸÄ±mÄ±: Randevoâ€™a Ã¶zel tekrar kullanÄ±labilir skill yazma ve eval seti oluÅŸturma
- mcp-builder yaklaÅŸÄ±mÄ±: Randevo iÃ§in MCP server/tool tasarlama standardÄ±
- webapp-testing yaklaÅŸÄ±mÄ±: Playwright ile browser tabanlÄ± regression test akÄ±ÅŸÄ±
- frontend-design yaklaÅŸÄ±mÄ±: TÃ¼rkÃ§e SaaS dashboard ve public booking arayÃ¼zÃ¼nÃ¼ daha production-grade hale getirme
- doc-coauthoring yaklaÅŸÄ±mÄ±: README, deployment doc, KVKK placeholder doc ve release note iyileÅŸtirme
```

DoÄŸrudan kopyalama kuralÄ±:

```txt
- Ã–nce license kontrol edilir.
- Source-available ama open-source olmayan document skill dosyalarÄ± doÄŸrudan vendoring yapÄ±lmaz.
- Bu projede asÄ±l amaÃ§ repo mantÄ±ÄŸÄ±nÄ± Ã¶rnek alarak Randevoâ€™a Ã¶zel skills yazmaktÄ±r.
```

### 2.3 Model Context Protocol Servers Repoâ€™dan AlÄ±nacak Fikirler

`modelcontextprotocol/servers` reposu MCP reference server Ã¶rnekleri iÃ§erir. Repo, reference serverâ€™larÄ±n production-ready Ã§Ã¶zÃ¼m deÄŸil, eÄŸitim ve Ã¶rnek amaÃ§lÄ± olduÄŸunu belirtir. Bu yÃ¼zden Randevoâ€™a direkt kÃ¶rlemesine production entegrasyonu yapÄ±lmayacak.

Projeye gÃ¼venli ÅŸekilde eklenebilecek reference server fikirleri:

```txt
- Filesystem MCP: sadece proje klasÃ¶rÃ¼yle sÄ±nÄ±rlÄ± dosya okuma/yazma
- Git MCP: repo status, diff, branch, commit/PR workflow yardÄ±mcÄ±larÄ±
- Time MCP: Europe/Istanbul timezone ve randevu tarih/saat testleri
- Fetch MCP: dokÃ¼mantasyon ve public web kaynaklarÄ±nÄ± kontrollÃ¼ okuma
- Memory MCP: agent Ã§alÄ±ÅŸma notlarÄ± ve proje kararlarÄ±nÄ±n knowledge graph gibi tutulmasÄ±
- Sequential Thinking MCP: bÃ¼yÃ¼k migration/booking engine/debug iÅŸlerinde planlÄ± dÃ¼ÅŸÃ¼nme
```

Dikkatli ele alÄ±nacak veya doÄŸrudan eklenmeyecek archived server fikirleri:

```txt
- GitHub MCP eski reference listede archived gÃ¶rÃ¼nÃ¼yor; doÄŸrudan vendoring yapÄ±lmaz.
- PostgreSQL MCP archived gÃ¶rÃ¼nÃ¼yor; production database iÃ§in read-only debug bile olsa ayrÄ±ca gÃ¼venlik tasarÄ±mÄ± gerekir.
- Google Maps MCP archived gÃ¶rÃ¼nÃ¼yor; TÃ¼rkiye adres/konum iÃ§in doÄŸrudan kullanÄ±lmaz.
- Puppeteer MCP archived gÃ¶rÃ¼nÃ¼yor; webapp-testing skill yaklaÅŸÄ±mÄ±yla Playwright tercih edilir.
```

---

## 3. Yeni Agent Listesi

`.claude/agents/` iÃ§ine ÅŸu agent dosyalarÄ± eklenecek:

```txt
turkey-district-auditor-agent.md
turkey-district-fixer-agent.md
randevo-skill-architect-agent.md
randevo-skill-builder-agent.md
mcp-research-agent.md
mcp-integration-agent.md
mcp-security-agent.md
regression-merge-agent.md
compact-state-agent.md
github-push-agent.md
```

---

# 4. Agent TanÄ±mlarÄ±

## 4.1 `turkey-district-auditor-agent.md`

```md
---
name: turkey-district-auditor-agent
description: Use this agent to audit Turkey province/district data, compare existing project data with official/reference sources, find missing districts, and produce a safe migration report.
tools: Read, Write, Edit, Bash
---

You are the Turkey District Auditor Agent for Randevo.

Responsibilities:
- Inspect current Turkey province/district data in the project.
- Count provinces and districts.
- Compare current data with official/reference datasets.
- Produce docs/turkiye-district-audit.md.
- List missing districts per province.
- List duplicate districts.
- List slug problems.
- List Turkish character normalization problems.
- Do not modify production data in this phase.

Rules:
- Do not assume current district data is correct.
- Prefer official sources when available.
- If using community JSON data, mark it as secondary/reference.
- Every finding must be testable.
```

## 4.2 `turkey-district-fixer-agent.md`

```md
---
name: turkey-district-fixer-agent
description: Use this agent to fix missing Turkey districts, update seed data, add migration scripts, and create validation tests for 81 provinces and all districts.
tools: Read, Write, Edit, Bash
---

You are the Turkey District Fixer Agent for Randevo.

Responsibilities:
- Add complete district dataset.
- Preserve province plate codes.
- Generate stable slugs.
- Add migration for existing Location and Organization address records.
- Add tests for district completeness.
- Add district dropdown UI tests.
- Update docs/turkiye-address-data.md.

Rules:
- Do not break existing province/district selections.
- Keep Turkish characters in display names.
- Use ASCII-safe slug values.
- Existing businesses must retain safe address data.
```

## 4.3 `randevo-skill-architect-agent.md`

```md
---
name: randevo-skill-architect-agent
description: Use this agent to design Randevo-specific Claude Skills inspired by anthropics/skills patterns, including trigger descriptions, folder structure, test prompts, and safe usage boundaries.
tools: Read, Write, Edit
---

You are the Randevo Skill Architect Agent.

Responsibilities:
- Review anthropics/skills structure and patterns.
- Design Randevo-specific skills.
- Create docs/randevo-skills-architecture.md.
- Define which skills should exist.
- Define when each skill should trigger.
- Define skill test prompts.
- Review license/sourcing risks before copying anything.

Rules:
- Prefer creating original Randevo skills instead of copying repo content.
- Do not vendor source-available document skills directly.
- Keep skills short and focused.
```

## 4.4 `randevo-skill-builder-agent.md`

```md
---
name: randevo-skill-builder-agent
description: Use this agent to implement Randevo-specific skills, eval prompts, workflow references, and documentation for recurring development tasks.
tools: Read, Write, Edit, Bash
---

You are the Randevo Skill Builder Agent.

Responsibilities:
- Create .claude/skills/randevo-booking-regression/SKILL.md.
- Create .claude/skills/randevo-turkey-data/SKILL.md.
- Create .claude/skills/randevo-mcp-integration/SKILL.md.
- Create .claude/skills/randevo-release/SKILL.md.
- Add eval prompts under evals/skills/.
- Add docs/randevo-skills-usage.md.

Rules:
- Skills must not contain secrets.
- Skills must not execute destructive commands.
- Skills must point to test commands and safe workflows.
```

## 4.5 `mcp-research-agent.md`

```md
---
name: mcp-research-agent
description: Use this agent to inspect modelcontextprotocol/servers, identify useful MCP reference servers, classify risks, and document what should be adopted, wrapped, or avoided.
tools: Read, Write, Edit, Bash
---

You are the MCP Research Agent.

Responsibilities:
- Review modelcontextprotocol/servers README and reference server list.
- Identify useful MCP server ideas for Randevo development.
- Mark archived servers as avoid/direct-vendor-risk.
- Create docs/mcp-research-report.md.
- Recommend safe local-only MCP configuration.

Rules:
- Do not add production MCP access to sensitive services by default.
- Treat reference servers as examples, not production-ready services.
- Prefer minimal scoped tools.
```

## 4.6 `mcp-integration-agent.md`

```md
---
name: mcp-integration-agent
description: Use this agent to add safe MCP configuration examples for filesystem, git, time, fetch, memory, and sequential-thinking workflows.
tools: Read, Write, Edit, Bash
---

You are the MCP Integration Agent.

Responsibilities:
- Create .mcp.json.example.
- Add docs/mcp-local-setup.md.
- Add safe local MCP config examples.
- Scope filesystem access to project root only.
- Add MCP usage examples for Claude Code/Antigravity.
- Add test checklist for MCP setup.

Rules:
- Never commit user-specific tokens.
- Never add broad filesystem access.
- Never add production database MCP without explicit approval.
- Keep all MCP configs examples unless user confirms real local setup.
```

## 4.7 `mcp-security-agent.md`

```md
---
name: mcp-security-agent
description: Use this agent to review MCP integrations for permissions, token safety, filesystem scope, destructive tools, and production-readiness risks.
tools: Read, Write, Edit, Bash
---

You are the MCP Security Agent.

Responsibilities:
- Review .mcp.json.example.
- Check no secrets are committed.
- Check filesystem scope.
- Check destructive tool exposure.
- Write docs/mcp-security-checklist.md.
- Add CI secret scan notes.

Rules:
- Default MCP setup must be local-dev only.
- If any MCP touches GitHub, DB, payments, or files, permissions must be explicit.
- No force push or destructive git tool should be enabled by default.
```

## 4.8 `regression-merge-agent.md`

```md
---
name: regression-merge-agent
description: Use this agent before every merge to run tests, verify migrations, check build, run e2e smoke tests, and create a merge readiness report.
tools: Read, Write, Edit, Bash
---

You are the Regression Merge Agent.

Responsibilities:
- Run all required checks before merge.
- Create docs/qa/phase-merge-report.md or append to phase-specific report.
- Confirm test status.
- Confirm build status.
- Confirm migration status.
- Confirm GitHub push status.

Rules:
- If tests fail, do not merge.
- If build fails, do not merge.
- If Prisma validation fails, do not merge.
```

## 4.9 `compact-state-agent.md`

```md
---
name: compact-state-agent
description: Use this agent every 2 phases to update docs/COMPACT_STATE.md, summarize completed work, list changed files, record test results, and prepare the next prompt before /compact.
tools: Read, Write, Edit
---

You are the Compact State Agent.

Responsibilities:
- Update docs/COMPACT_STATE.md every 2 phases.
- Summarize completed phases.
- List changed files and migrations.
- List new environment variables.
- List test results.
- List known issues.
- Write the exact next prompt.
- Ask the user to run /compact if the environment cannot auto-run it.

Rules:
- Do not hide failures.
- Do not delete context docs.
- Keep summary short but complete.
```

## 4.10 `github-push-agent.md`

```md
---
name: github-push-agent
description: Use this agent after each tested phase to commit, push, create/update PRs, and merge only after tests pass.
tools: Read, Write, Edit, Bash
---

You are the GitHub Push Agent.

Responsibilities:
- Check git status.
- Ensure tests passed before commit.
- Commit with meaningful message.
- Push branch to GitHub.
- Create PR if GitHub CLI is available.
- Merge only after tests pass.
- Never force push without explicit approval.

Rules:
- Do not push broken code unless user explicitly asks for a WIP branch.
- Do not merge failing tests.
- Prefer squash merge for phase branches.
```

---

# 5. Branch, Test, Push ve Merge PolitikasÄ±

Her phase ÅŸu akÄ±ÅŸla yÃ¼rÃ¼tÃ¼lecek:

```bash
git checkout main
git pull
git checkout -b feature/phase-name
```

Phase iÅŸi yapÄ±lÄ±r.

Sonra test:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

EÄŸer e2e varsa:

```bash
npm run test:e2e
```

Commit + push:

```bash
git status
git add .
git commit -m "meaningful phase commit"
git push -u origin feature/phase-name
```

Merge Ã¶ncesi:

```txt
- Testler geÃ§ti mi?
- Build geÃ§ti mi?
- Prisma validate geÃ§ti mi?
- Migration status temiz mi?
- QA raporu yazÄ±ldÄ± mÄ±?
- COMPACT_STATE gerekiyorsa gÃ¼ncellendi mi?
```

GitHub CLI varsa:

```bash
gh pr create --title "Phase: ..." --body "..."
gh pr merge --squash --delete-branch
```

GitHub CLI yoksa:

```txt
GitHub web UI Ã¼zerinden PR aÃ§.
Checks geÃ§ince squash merge yap.
Merge sonrasÄ± main branch'i pull et.
```

---

# 6. Phase SÄ±rasÄ±

```txt
Phase DS-0 â€” Baseline, Repo Scan ve Risk Raporu
Phase DS-1 â€” TÃ¼rkiye Ä°lÃ§e Data Audit
Phase DS-2 â€” Eksik Ä°lÃ§eleri Tamamlama ve Migration
Phase DS-3 â€” Ä°l/Ä°lÃ§e UI, API ve E2E Validation
Phase DS-4 â€” Anthropic Skills Mimari PlanÄ±
Phase DS-5 â€” Randevo Skills Implementasyonu
Phase DS-6 â€” MCP Servers AraÅŸtÄ±rma ve GÃ¼venlik TasarÄ±mÄ±
Phase DS-7 â€” GÃ¼venli MCP Local Dev Entegrasyonu
Phase DS-8 â€” Webapp Testing + Playwright Regression Workflow
Phase DS-9 â€” Final QA, GitHub Merge, Compact ve Release Notes
```

Compact kuralÄ±:

```txt
DS-0 + DS-1 sonrasÄ± compact
DS-2 + DS-3 sonrasÄ± compact
DS-4 + DS-5 sonrasÄ± compact
DS-6 + DS-7 sonrasÄ± compact
DS-8 + DS-9 sonrasÄ± final compact
```

---

# 7. Phase DetaylarÄ±

## Phase DS-0 â€” Baseline, Repo Scan ve Risk Raporu

KullanÄ±lacak agentler:

```txt
mcp-research-agent
randevo-skill-architect-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Mevcut Randevo TÃ¼rkiye projesini bozmadan baseline almak, iki repodan Ã§Ä±karÄ±lacak fikirleri dokÃ¼mante etmek.

YapÄ±lacaklar:

1. Mevcut proje testlerini Ã§alÄ±ÅŸtÄ±r.
2. `anthropics/skills` repo yapÄ±sÄ±nÄ± incele.
3. `modelcontextprotocol/servers` repo yapÄ±sÄ±nÄ± incele.
4. Projeye eklenecek / eklenmeyecek parÃ§alarÄ± belirle.
5. `docs/repo-scan-report.md` oluÅŸtur.
6. MCP ve Skills iÃ§in license/security notlarÄ± ekle.
7. QA baseline raporu oluÅŸtur.

OluÅŸturulacak dosyalar:

```txt
docs/repo-scan-report.md
docs/qa/ds-0-baseline.md
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Commit:

```bash
git add .
git commit -m "docs: add repo scan baseline for skills and MCP update"
git push -u origin feature/ds-0-repo-scan
```

Merge kriteri:

```txt
- Sadece dokÃ¼mantasyon deÄŸiÅŸti.
- Mevcut testler geÃ§ti.
- Build geÃ§ti.
```

---

## Phase DS-1 â€” TÃ¼rkiye Ä°lÃ§e Data Audit

KullanÄ±lacak agentler:

```txt
turkey-district-auditor-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Projede hangi il/ilÃ§e verilerinin eksik olduÄŸunu net bulmak. Bu phase data deÄŸiÅŸtirmez, sadece rapor Ã§Ä±karÄ±r.

YapÄ±lacaklar:

1. Mevcut `turkey-provinces`, `districts`, `Location`, `Address` kaynaklarÄ±nÄ± bul.
2. Ä°l sayÄ±sÄ±nÄ± kontrol et.
3. Ä°lÃ§e sayÄ±sÄ±nÄ± kontrol et.
4. Eksik ilÃ§eleri il bazÄ±nda listele.
5. Duplicate ilÃ§e var mÄ± kontrol et.
6. Slug Ã§akÄ±ÅŸmasÄ± var mÄ± kontrol et.
7. TÃ¼rkÃ§e karakter display sorunlarÄ± var mÄ± kontrol et.
8. `scripts/audit-turkey-districts.ts` oluÅŸtur.
9. `docs/turkiye-district-audit.md` oluÅŸtur.

Audit script beklenen Ã§Ä±ktÄ±sÄ±:

```txt
Province count: 81
District count: EXPECTED_COUNT
Missing districts:
- Ä°stanbul: ...
- Ankara: ...
Duplicate slugs:
- ...
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
npx tsx scripts/audit-turkey-districts.ts
```

Commit:

```bash
git add .
git commit -m "test: audit Turkey province and district data"
git push -u origin feature/ds-1-district-audit
```

Merge kriteri:

```txt
- Audit script Ã§alÄ±ÅŸÄ±yor.
- Eksikler raporlandÄ±.
- Uygulama davranÄ±ÅŸÄ± deÄŸiÅŸmedi.
```

Compact:

```txt
DS-0 ve DS-1 tamamlandÄ±ktan sonra compact-state-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
/compact Ã§alÄ±ÅŸtÄ±r veya kullanÄ±cÄ±dan Ã§alÄ±ÅŸtÄ±rmasÄ±nÄ± iste.
```

---

## Phase DS-2 â€” Eksik Ä°lÃ§eleri Tamamlama ve Migration

KullanÄ±lacak agentler:

```txt
turkey-district-fixer-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Eksik ilÃ§eleri tamamlamak, data kaynaÄŸÄ±nÄ± normalize etmek, migration ve seed yapÄ±sÄ±nÄ± gÃ¼venli hale getirmek.

YapÄ±lacaklar:

1. Canonical district dataset oluÅŸtur:

```txt
src/data/turkey/districts.ts
src/data/turkey/provinces.ts
src/data/turkey/regions.ts
```

2. Display name + slug standardÄ± belirle:

```txt
Display: Ã‡ankaya
Slug: cankaya
Province code: 06
```

3. Eksik ilÃ§eleri ekle.
4. District schema/type gÃ¼ncelle.
5. Seed script gÃ¼ncelle.
6. Migration script yaz.
7. Existing address kayÄ±tlarÄ± iÃ§in safe fallback Ã¼ret.
8. Unit tests ekle.

Beklenen test dosyalarÄ±:

```txt
src/tests/turkey-districts.test.ts
src/tests/turkey-address-migration.test.ts
src/tests/turkey-slug.test.ts
```

Testler:

```txt
- 81 il var.
- Her ilin en az 1 ilÃ§esi var.
- Toplam ilÃ§e sayÄ±sÄ± official/reference expected count ile eÅŸleÅŸiyor.
- Sluglar unique.
- TÃ¼rkÃ§e karakter display kaybolmuyor.
- Existing business address migration bozulmuyor.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma db seed
npx tsx scripts/audit-turkey-districts.ts
```

Commit:

```bash
git add .
git commit -m "feat: complete Turkey district dataset"
git push -u origin feature/ds-2-complete-districts
```

Merge kriteri:

```txt
- District audit PASS.
- Seed PASS.
- Migration PASS.
- Build PASS.
```

---

## Phase DS-3 â€” Ä°l/Ä°lÃ§e UI, API ve E2E Validation

KullanÄ±lacak agentler:

```txt
turkey-district-fixer-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Tamamlanan ilÃ§e datasÄ±nÄ±n UI, API ve public booking tarafÄ±nda doÄŸru Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ± doÄŸrulamak.

YapÄ±lacaklar:

1. Dashboard iÅŸletme adres formunu gÃ¼ncelle.
2. Location formunda il/ilÃ§e dropdownlarÄ±nÄ± gÃ¼ncelle.
3. Marketplace ÅŸehir/ilÃ§e filtrelerini gÃ¼ncelle.
4. Public booking adres gÃ¶sterimini test et.
5. API endpointleri district validation kullansÄ±n.
6. E2E test ekle.

E2E akÄ±ÅŸ:

```txt
1. Login ol.
2. Ä°ÅŸletme adresinde Ä°stanbul seÃ§.
3. Ä°lÃ§e olarak eksik olan ve yeni eklenen bir ilÃ§eyi seÃ§.
4. Kaydet.
5. Marketplace filtresinde aynÄ± il/ilÃ§eyi seÃ§.
6. Ä°ÅŸletmenin gÃ¶rÃ¼ndÃ¼ÄŸÃ¼nÃ¼ doÄŸrula.
7. Public booking sayfasÄ±nda adresin doÄŸru gÃ¶rÃ¼ndÃ¼ÄŸÃ¼nÃ¼ doÄŸrula.
```

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Commit:

```bash
git add .
git commit -m "feat: validate Turkey districts in UI and API"
git push -u origin feature/ds-3-district-ui-validation
```

Compact:

```txt
DS-2 ve DS-3 tamamlandÄ±ktan sonra compact-state-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
/compact Ã§alÄ±ÅŸtÄ±r veya kullanÄ±cÄ±dan Ã§alÄ±ÅŸtÄ±rmasÄ±nÄ± iste.
```

---

## Phase DS-4 â€” Anthropic Skills Mimari PlanÄ±

KullanÄ±lacak agentler:

```txt
randevo-skill-architect-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Anthropic Skills repo yapÄ±sÄ±ndan ilham alarak Randevoâ€™a Ã¶zel skill mimarisi tasarlamak.

Eklenecek Randevo skill adaylarÄ±:

```txt
1. randevo-booking-regression
2. randevo-turkey-data
3. randevo-mcp-integration
4. randevo-payment-safety
5. randevo-release-manager
6. randevo-kvkk-review
7. randevo-ui-polish
```

YapÄ±lacaklar:

1. `docs/randevo-skills-architecture.md` oluÅŸtur.
2. Her skill iÃ§in trigger aÃ§Ä±klamasÄ± yaz.
3. Her skill iÃ§in test promptlarÄ± yaz.
4. Skill folder standardÄ±nÄ± belirle:

```txt
.claude/skills/skill-name/SKILL.md
.claude/skills/skill-name/references/
.claude/skills/skill-name/scripts/
```

5. License note yaz.
6. Kopyalanmayacak kaynaklarÄ± belirt.
7. Skill eval stratejisini yaz.

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: design Randevo custom skills architecture"
git push -u origin feature/ds-4-skills-architecture
```

Merge kriteri:

```txt
- Sadece docs/skill planÄ± eklendi.
- Kopyalanan lisanslÄ± iÃ§erik yok.
- Build/test geÃ§iyor.
```

---

## Phase DS-5 â€” Randevo Skills Implementasyonu

KullanÄ±lacak agentler:

```txt
randevo-skill-builder-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Randevoâ€™a Ã¶zel tekrar kullanÄ±labilir skills eklemek.

OluÅŸturulacak skills:

```txt
.claude/skills/randevo-booking-regression/SKILL.md
.claude/skills/randevo-turkey-data/SKILL.md
.claude/skills/randevo-mcp-integration/SKILL.md
.claude/skills/randevo-payment-safety/SKILL.md
.claude/skills/randevo-release-manager/SKILL.md
```

Her skill iÃ§in:

```txt
- name
- description
- ne zaman kullanÄ±lÄ±r
- adÄ±m adÄ±m workflow
- Ã§alÄ±ÅŸtÄ±rÄ±lacak testler
- yasak iÅŸlemler
- beklenen Ã§Ä±ktÄ± formatÄ±
```

Eval prompt dosyalarÄ±:

```txt
evals/skills/booking-regression.json
evals/skills/turkey-data.json
evals/skills/mcp-integration.json
evals/skills/payment-safety.json
evals/skills/release-manager.json
```

Testler:

```txt
- Skill dosyalarÄ±nda name/description var.
- SKILL.md dosyalarÄ± 500 satÄ±rÄ± aÅŸmÄ±yor veya references kullanÄ±yor.
- Eval promptlarÄ± JSON valid.
- Yasak destructive command yok.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
node scripts/validate-skills.js
```

EÄŸer `scripts/validate-skills.js` yoksa bu phase iÃ§inde basit validator oluÅŸtur.

Commit:

```bash
git add .
git commit -m "feat: add Randevo custom Claude skills"
git push -u origin feature/ds-5-randevo-skills
```

Compact:

```txt
DS-4 ve DS-5 tamamlandÄ±ktan sonra compact-state-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
/compact Ã§alÄ±ÅŸtÄ±r veya kullanÄ±cÄ±dan Ã§alÄ±ÅŸtÄ±rmasÄ±nÄ± iste.
```

---

## Phase DS-6 â€” MCP Servers AraÅŸtÄ±rma ve GÃ¼venlik TasarÄ±mÄ±

KullanÄ±lacak agentler:

```txt
mcp-research-agent
mcp-security-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

MCP reference serverâ€™lardan hangilerinin Randevo geliÅŸtirme workflowâ€™una alÄ±nacaÄŸÄ±nÄ± seÃ§mek.

SeÃ§ilecek gÃ¼venli MCP fikirleri:

```txt
- filesystem: proje klasÃ¶rÃ¼yle sÄ±nÄ±rlÄ±
- git: status/diff/branch/commit yardÄ±mÄ±
- time: Europe/Istanbul timezone testleri
- fetch: dokÃ¼mantasyon okuma
- memory: karar kayÄ±tlarÄ±
- sequential-thinking: migration/debug planlama
```

DoÄŸrudan eklenmeyecekler:

```txt
- Production DBâ€™ye write eriÅŸimli MCP
- Payment provider MCP
- GeniÅŸ filesystem eriÅŸimi
- GitHub tokenlÄ± geniÅŸ yetkili MCP
- Archived serverâ€™larÄ±n direkt production kullanÄ±mÄ±
```

YapÄ±lacaklar:

1. `docs/mcp-research-report.md` oluÅŸtur.
2. GÃ¼venli/riski/kaÃ§Ä±nÄ±lacak MCP listesini yaz.
3. `docs/mcp-security-checklist.md` oluÅŸtur.
4. MCP permission modelini yaz.
5. Local-only yaklaÅŸÄ±mÄ± belirle.
6. Token/secret politikasÄ± yaz.

Testler:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

```bash
git add .
git commit -m "docs: add MCP research and security plan"
git push -u origin feature/ds-6-mcp-research
```

---

## Phase DS-7 â€” GÃ¼venli MCP Local Dev Entegrasyonu

KullanÄ±lacak agentler:

```txt
mcp-integration-agent
mcp-security-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

GerÃ§ek secret iÃ§ermeyen, sadece local development iÃ§in kullanÄ±lacak MCP config Ã¶rneÄŸi eklemek.

OluÅŸturulacak dosyalar:

```txt
.mcp.json.example
docs/mcp-local-setup.md
docs/mcp-usage-examples.md
```

`.mcp.json.example` kurallarÄ±:

```txt
- GerÃ§ek token yok.
- Filesystem sadece proje root ile sÄ±nÄ±rlÄ±.
- Git sadece read/status/diff aÄŸÄ±rlÄ±klÄ± kullanÄ±lacak.
- Time server Europe/Istanbul kullanÄ±m Ã¶rneÄŸi iÃ§erecek.
- Fetch server yalnÄ±zca dokÃ¼mantasyon iÃ§in Ã¶nerilecek.
- Production deploy config deÄŸildir.
```

MCP kullanÄ±m Ã¶rnekleri:

```txt
- "Git diffâ€™i kontrol et ve phase merge raporu Ã§Ä±kar."
- "Europe/Istanbul timezone ile randevu slot testlerini incele."
- "docs/COMPACT_STATE.md dosyasÄ±na gÃ¶re bir sonraki phase promptunu hazÄ±rla."
- "Sadece proje klasÃ¶rÃ¼ iÃ§inde district data dosyalarÄ±nÄ± oku."
```

Testler:

```txt
- .mcp.json.example JSON valid.
- Secret placeholder dÄ±ÅŸÄ±nda gerÃ§ek secret yok.
- Docs iÃ§inde production uyarÄ±sÄ± var.
- Filesystem path geniÅŸ deÄŸil.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
node scripts/check-no-secrets.js
```

EÄŸer `scripts/check-no-secrets.js` yoksa basit secret scan scripti ekle.

Commit:

```bash
git add .
git commit -m "chore: add safe local MCP configuration examples"
git push -u origin feature/ds-7-mcp-local-config
```

Compact:

```txt
DS-6 ve DS-7 tamamlandÄ±ktan sonra compact-state-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md gÃ¼ncelle.
/compact Ã§alÄ±ÅŸtÄ±r veya kullanÄ±cÄ±dan Ã§alÄ±ÅŸtÄ±rmasÄ±nÄ± iste.
```

---

## Phase DS-8 â€” Webapp Testing + Playwright Regression Workflow

KullanÄ±lacak agentler:

```txt
randevo-skill-builder-agent
regression-merge-agent
github-push-agent
```

AmaÃ§:

Anthropic webapp-testing skill yaklaÅŸÄ±mÄ±nÄ± Randevoâ€™a uyarlayÄ±p local browser regression workflowâ€™u oluÅŸturmak.

YapÄ±lacaklar:

1. Playwright helper scriptleri ekle.
2. Local server lifecycle helper ekle.
3. `tests/e2e/turkey-booking-flow.spec.ts` gÃ¼ncelle.
4. `tests/e2e/district-selection.spec.ts` ekle.
5. `tests/e2e/mcp-safe-config.spec.ts` gerekirse docs validation olarak ekle.
6. Browser screenshot artifact klasÃ¶rÃ¼ ekle.
7. `docs/webapp-testing-workflow.md` oluÅŸtur.

E2E test akÄ±ÅŸlarÄ±:

```txt
1. TÃ¼rkÃ§e login/register.
2. Ä°ÅŸletme adresinde eksik tamamlanan ilÃ§eyi seÃ§.
3. Hizmet oluÅŸtur.
4. MÃ¼saitlik ekle.
5. Public booking aÃ§.
6. Randevu oluÅŸtur.
7. Dashboardâ€™da randevuyu gÃ¶r.
8. Marketplace il/ilÃ§e filtresini doÄŸrula.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Commit:

```bash
git add .
git commit -m "test: add Playwright regression workflow for Turkey data"
git push -u origin feature/ds-8-playwright-regression
```

---

## Phase DS-9 â€” Final QA, GitHub Merge, Compact ve Release Notes

KullanÄ±lacak agentler:

```txt
regression-merge-agent
compact-state-agent
github-push-agent
```

AmaÃ§:

TÃ¼m deÄŸiÅŸiklikleri final testten geÃ§irmek, GitHubâ€™a pushlamak, release notu oluÅŸturmak.

YapÄ±lacaklar:

1. Full test Ã§alÄ±ÅŸtÄ±r.
2. Full e2e Ã§alÄ±ÅŸtÄ±r.
3. District audit script tekrar Ã§alÄ±ÅŸtÄ±r.
4. Skill validator Ã§alÄ±ÅŸtÄ±r.
5. MCP config validator Ã§alÄ±ÅŸtÄ±r.
6. README gÃ¼ncelle.
7. CHANGELOG gÃ¼ncelle.
8. `docs/COMPACT_STATE.md` final gÃ¼ncelle.
9. GitHubâ€™a push yap.
10. Stable tag oluÅŸtur.

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npx prisma validate
npx prisma generate
npx prisma migrate status
npx tsx scripts/audit-turkey-districts.ts
node scripts/validate-skills.js
node scripts/check-no-secrets.js
```

Final acceptance checklist:

```txt
[ ] 81 il var.
[ ] Eksik ilÃ§eler tamamlandÄ±.
[ ] Ä°lÃ§e audit PASS.
[ ] Ä°l/ilÃ§e UI PASS.
[ ] Marketplace il/ilÃ§e filter PASS.
[ ] Public booking adres display PASS.
[ ] Randevo custom skills eklendi.
[ ] Skill validator PASS.
[ ] MCP research docs eklendi.
[ ] Safe .mcp.json.example eklendi.
[ ] Secret scan PASS.
[ ] Playwright regression PASS.
[ ] Build PASS.
[ ] GitHub push tamamlandÄ±.
[ ] Final compact state gÃ¼ncellendi.
```

Commit + tag:

```bash
git add .
git commit -m "chore: finalize district skills and MCP update"
git push
git tag v1.2.0-district-skills-mcp
git push origin v1.2.0-district-skills-mcp
```

Compact:

```txt
DS-8 ve DS-9 tamamlandÄ±ktan sonra compact-state-agent Ã§alÄ±ÅŸtÄ±r.
docs/COMPACT_STATE.md final hale getir.
/compact Ã§alÄ±ÅŸtÄ±r veya kullanÄ±cÄ±dan Ã§alÄ±ÅŸtÄ±rmasÄ±nÄ± iste.
```

---

# 8. Yeni Script Ã–nerileri

Bu update iÃ§inde eklenebilecek scriptler:

```txt
scripts/audit-turkey-districts.ts
scripts/validate-skills.js
scripts/check-no-secrets.js
scripts/validate-mcp-config.js
scripts/generate-district-slugs.ts
```

Package scripts Ã¶nerisi:

```json
{
  "scripts": {
    "audit:districts": "tsx scripts/audit-turkey-districts.ts",
    "validate:skills": "node scripts/validate-skills.js",
    "validate:mcp": "node scripts/validate-mcp-config.js",
    "check:secrets": "node scripts/check-no-secrets.js",
    "test:full": "npm run typecheck && npm run lint && npm test && npm run build"
  }
}
```

---

# 9. District Dataset Teknik StandardÄ±

Ã–nerilen type yapÄ±sÄ±:

```ts
export interface TurkeyProvince {
  id: string;
  plateCode: string;
  name: string;
  slug: string;
  region: TurkeyRegion;
}

export interface TurkeyDistrict {
  id: string;
  provincePlateCode: string;
  name: string;
  slug: string;
  isCentralDistrict?: boolean;
}
```

Slug standardÄ±:

```txt
Ã‡ankaya -> cankaya
ÃœskÃ¼dar -> uskudar
ÅiÅŸli -> sisli
KeÃ§iÃ¶ren -> kecioren
```

Test standardÄ±:

```txt
- Display name TÃ¼rkÃ§e kalÄ±r.
- Slug ASCII olur.
- provincePlateCode doÄŸru baÄŸlanÄ±r.
- AynÄ± ilde duplicate slug olmaz.
- Global district id unique olur.
```

---

# 10. MCP Config GÃ¼venlik StandardÄ±

`.mcp.json.example` iÃ§ine sadece Ã¶rnek config konur.

Yasaklar:

```txt
- GerÃ§ek token
- GeniÅŸ filesystem root eriÅŸimi
- Production DB connection string
- Stripe secret
- Google OAuth secret
- WhatsApp token
- SMS provider token
- Force push tool
- Destructive file deletion tool
```

Ä°zin verilen local kullanÄ±m:

```txt
- Project-scoped filesystem
- Git status/diff aÄŸÄ±rlÄ±klÄ± workflow
- Time/timezone helper
- Fetch public docs helper
- Memory local notes
- Sequential planning helper
```

---

# 11. COMPACT_STATE Åablonu

`docs/COMPACT_STATE.md`:

```md
# Randevo Compact State

## Last Completed Phases

## Branch / GitHub Status

## Key Files Changed

## Database / Migration Changes

## New Scripts

## New Skills

## MCP Config Status

## Tests Passed

## Tests Failed / Known Issues

## Next Phase

## Next Prompt

## Do Not Forget
```

Her compact sonrasÄ± kullanÄ±lacak prompt:

```txt
Read docs/COMPACT_STATE.md and RANDEVO_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md.
Continue only from the next unfinished phase.
Do not redo completed work.
Run tests before commit, push, and merge.
After 2 more phases, update COMPACT_STATE and run/request /compact.
```

---

# 12. Claude Code Ana Promptâ€™u

```txt
Read RANDEVO_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md carefully.

This update has three goals:
1. Complete missing Turkey district data.
2. Add Randevo-specific Claude Skills inspired by anthropics/skills.
3. Add safe local MCP development integration inspired by modelcontextprotocol/servers.

Do not implement all phases at once.

Start with Phase DS-0 only:
- Run baseline tests.
- Scan the two repos conceptually using the plan.
- Create docs/repo-scan-report.md.
- Do not change app behavior yet.
- Run tests/build.
- Commit and push the phase branch if tests pass.
- Do not merge until tests pass.

After DS-0, stop and summarize.

Important:
- Every phase must be tested before merge.
- Every phase must be pushed to GitHub.
- Every 2 phases update docs/COMPACT_STATE.md and run/request /compact.
- Never commit secrets.
- Do not add production MCP access to sensitive systems.
- Keep filesystem MCP scoped to project root only.
```

---

# 13. Antigravity Ana Promptâ€™u

```txt
Read RANDEVO_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md.

Create the new agents first.
Then start with Phase DS-0 only.

Use browser automation only for verification, not for destructive actions.
Run baseline tests.
Create docs/repo-scan-report.md.
Commit and push only if tests pass.
Do not merge until the regression-merge-agent report says PASS.

After DS-0, stop and create an artifact with QA notes.
```

---

# 14. Final Definition of Done

Bu update bitmiÅŸ sayÄ±lmasÄ± iÃ§in:

```txt
- TÃ¼rkiye ilÃ§e eksikleri tamamlandÄ±.
- District audit PASS.
- District UI/API/e2e tests PASS.
- Randevo custom skills eklendi.
- Skill validator PASS.
- MCP research report eklendi.
- Safe .mcp.json.example eklendi.
- MCP security checklist eklendi.
- Playwright regression workflow gÃ¼ncellendi.
- Her phase test edildi.
- Her phase GitHubâ€™a pushlandÄ±.
- Her phase merge edilmeden Ã¶nce test edildi.
- Her 2 phase sonrasÄ± COMPACT_STATE gÃ¼ncellendi.
- Final tag oluÅŸturuldu.
```

---

# 15. Final Kontrol Promptâ€™u

```txt
Review the whole district + skills + MCP update.

Check:
1. Are all Turkey provinces present?
2. Are missing districts fixed?
3. Does the district audit script pass?
4. Do business address forms support completed district data?
5. Does marketplace city/district filtering work?
6. Are Randevo custom skills present and valid?
7. Are skill eval prompts valid JSON?
8. Is .mcp.json.example safe and free of secrets?
9. Are MCP integrations local-dev only?
10. Does Playwright regression pass?
11. Do unit tests pass?
12. Does build pass?
13. Was every phase pushed to GitHub?
14. Was every phase tested before merge?
15. Was docs/COMPACT_STATE.md updated after every 2 phases?

Fix small issues only.
Do not add new major features.
Create final release notes and push them.
```

