# SlotPilot Türkiye İlçe Tamamlama + Skills/MCP Entegrasyon Planı

> Bu dosya, SlotPilot Türkiye yerelleştirmesi tamamlandıktan sonra uygulanacak yeni güncelleme planıdır.  
> Amaç: Türkiye il/ilçe verisindeki eksikleri tamamlamak, Anthropic Skills repo mantığından projeye uygun skill workflow’ları eklemek, Model Context Protocol reference server’larından güvenli ve faydalı olanları geliştirme ortamına dahil etmek, her phase sonunda test edip GitHub’a pushlamak ve her 2 phase sonrası context’i compact etmektir.

---

## 1. Güncellemenin Ana Hedefi

Bu güncellemede üç ana iş yapılacak:

```txt
1. Türkiye özelinde eksik ilçeler tamamlanacak.
2. anthropics/skills reposu taranıp SlotPilot için faydalı skill yapıları eklenecek.
3. modelcontextprotocol/servers reposu taranıp projeye faydalı MCP server entegrasyonları planlı şekilde eklenecek.
```

Kritik çalışma kuralları:

```txt
- Her phase ayrı branch üzerinde yapılacak.
- Her phase merge edilmeden önce test edilecek.
- Test geçmezse merge ve push yapılmayacak.
- Her phase sonunda commit + push yapılacak.
- Her 2 phase sonrası COMPACT_STATE güncellenecek.
- COMPACT_STATE sonrası /compact çalıştırılacak veya kullanıcıya çalıştırması söylenecek.
```

---

## 2. Araştırma Notları

### 2.1 Türkiye İl/İlçe Verisi

Türkiye tarafında proje artık yalnızca büyükşehir ilçeleriyle sınırlı kalmamalı. Tüm 81 il ve güncel ilçe listesi hedeflenmeli.

Referans alınacak kaynak yaklaşımı:

```txt
Primary official source:
- İçişleri Bakanlığı / Türkiye Mülki İdare Bölümleri Envanteri

Secondary machine-readable sources:
- Ulaştırma ve Altyapı Bakanlığı teknik dokümanlarındaki ilçe listesi XLSX
- TÜİK ADNKS / nüfus veri portalları

Development convenience source:
- Açık kaynak JSON il/ilçe veri setleri
```

Hedef veri kalite kriteri:

```txt
- 81 il bulunmalı.
- Güncel ilçe sayısı resmi kaynağa göre doğrulanmalı.
- İl plakası doğru olmalı.
- İl slug doğru olmalı.
- İlçe slug doğru olmalı.
- Büyük/küçük harf ve Türkçe karakter standardı korunmalı.
- Eski kayıtlardaki province/district değerleri migration ile bozulmamalı.
```

### 2.2 Anthropic Skills Repo’dan Alınacak Fikirler

`anthropics/skills` reposu doğrudan uygulama özelliği değil, Claude/agent workflow kalitesini artıracak skill yapıları sunar.

Projeye eklenecek uygun fikirler:

```txt
- skill-creator yaklaşımı: SlotPilot’a özel tekrar kullanılabilir skill yazma ve eval seti oluşturma
- mcp-builder yaklaşımı: SlotPilot için MCP server/tool tasarlama standardı
- webapp-testing yaklaşımı: Playwright ile browser tabanlı regression test akışı
- frontend-design yaklaşımı: Türkçe SaaS dashboard ve public booking arayüzünü daha production-grade hale getirme
- doc-coauthoring yaklaşımı: README, deployment doc, KVKK placeholder doc ve release note iyileştirme
```

Doğrudan kopyalama kuralı:

```txt
- Önce license kontrol edilir.
- Source-available ama open-source olmayan document skill dosyaları doğrudan vendoring yapılmaz.
- Bu projede asıl amaç repo mantığını örnek alarak SlotPilot’a özel skills yazmaktır.
```

### 2.3 Model Context Protocol Servers Repo’dan Alınacak Fikirler

`modelcontextprotocol/servers` reposu MCP reference server örnekleri içerir. Repo, reference server’ların production-ready çözüm değil, eğitim ve örnek amaçlı olduğunu belirtir. Bu yüzden SlotPilot’a direkt körlemesine production entegrasyonu yapılmayacak.

Projeye güvenli şekilde eklenebilecek reference server fikirleri:

```txt
- Filesystem MCP: sadece proje klasörüyle sınırlı dosya okuma/yazma
- Git MCP: repo status, diff, branch, commit/PR workflow yardımcıları
- Time MCP: Europe/Istanbul timezone ve randevu tarih/saat testleri
- Fetch MCP: dokümantasyon ve public web kaynaklarını kontrollü okuma
- Memory MCP: agent çalışma notları ve proje kararlarının knowledge graph gibi tutulması
- Sequential Thinking MCP: büyük migration/booking engine/debug işlerinde planlı düşünme
```

Dikkatli ele alınacak veya doğrudan eklenmeyecek archived server fikirleri:

```txt
- GitHub MCP eski reference listede archived görünüyor; doğrudan vendoring yapılmaz.
- PostgreSQL MCP archived görünüyor; production database için read-only debug bile olsa ayrıca güvenlik tasarımı gerekir.
- Google Maps MCP archived görünüyor; Türkiye adres/konum için doğrudan kullanılmaz.
- Puppeteer MCP archived görünüyor; webapp-testing skill yaklaşımıyla Playwright tercih edilir.
```

---

## 3. Yeni Agent Listesi

`.claude/agents/` içine şu agent dosyaları eklenecek:

```txt
turkey-district-auditor-agent.md
turkey-district-fixer-agent.md
slotpilot-skill-architect-agent.md
slotpilot-skill-builder-agent.md
mcp-research-agent.md
mcp-integration-agent.md
mcp-security-agent.md
regression-merge-agent.md
compact-state-agent.md
github-push-agent.md
```

---

# 4. Agent Tanımları

## 4.1 `turkey-district-auditor-agent.md`

```md
---
name: turkey-district-auditor-agent
description: Use this agent to audit Turkey province/district data, compare existing project data with official/reference sources, find missing districts, and produce a safe migration report.
tools: Read, Write, Edit, Bash
---

You are the Turkey District Auditor Agent for SlotPilot.

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

You are the Turkey District Fixer Agent for SlotPilot.

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

## 4.3 `slotpilot-skill-architect-agent.md`

```md
---
name: slotpilot-skill-architect-agent
description: Use this agent to design SlotPilot-specific Claude Skills inspired by anthropics/skills patterns, including trigger descriptions, folder structure, test prompts, and safe usage boundaries.
tools: Read, Write, Edit
---

You are the SlotPilot Skill Architect Agent.

Responsibilities:
- Review anthropics/skills structure and patterns.
- Design SlotPilot-specific skills.
- Create docs/slotpilot-skills-architecture.md.
- Define which skills should exist.
- Define when each skill should trigger.
- Define skill test prompts.
- Review license/sourcing risks before copying anything.

Rules:
- Prefer creating original SlotPilot skills instead of copying repo content.
- Do not vendor source-available document skills directly.
- Keep skills short and focused.
```

## 4.4 `slotpilot-skill-builder-agent.md`

```md
---
name: slotpilot-skill-builder-agent
description: Use this agent to implement SlotPilot-specific skills, eval prompts, workflow references, and documentation for recurring development tasks.
tools: Read, Write, Edit, Bash
---

You are the SlotPilot Skill Builder Agent.

Responsibilities:
- Create .claude/skills/slotpilot-booking-regression/SKILL.md.
- Create .claude/skills/slotpilot-turkey-data/SKILL.md.
- Create .claude/skills/slotpilot-mcp-integration/SKILL.md.
- Create .claude/skills/slotpilot-release/SKILL.md.
- Add eval prompts under evals/skills/.
- Add docs/slotpilot-skills-usage.md.

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
- Identify useful MCP server ideas for SlotPilot development.
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

# 5. Branch, Test, Push ve Merge Politikası

Her phase şu akışla yürütülecek:

```bash
git checkout main
git pull
git checkout -b feature/phase-name
```

Phase işi yapılır.

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

Eğer e2e varsa:

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

Merge öncesi:

```txt
- Testler geçti mi?
- Build geçti mi?
- Prisma validate geçti mi?
- Migration status temiz mi?
- QA raporu yazıldı mı?
- COMPACT_STATE gerekiyorsa güncellendi mi?
```

GitHub CLI varsa:

```bash
gh pr create --title "Phase: ..." --body "..."
gh pr merge --squash --delete-branch
```

GitHub CLI yoksa:

```txt
GitHub web UI üzerinden PR aç.
Checks geçince squash merge yap.
Merge sonrası main branch'i pull et.
```

---

# 6. Phase Sırası

```txt
Phase DS-0 — Baseline, Repo Scan ve Risk Raporu
Phase DS-1 — Türkiye İlçe Data Audit
Phase DS-2 — Eksik İlçeleri Tamamlama ve Migration
Phase DS-3 — İl/İlçe UI, API ve E2E Validation
Phase DS-4 — Anthropic Skills Mimari Planı
Phase DS-5 — SlotPilot Skills Implementasyonu
Phase DS-6 — MCP Servers Araştırma ve Güvenlik Tasarımı
Phase DS-7 — Güvenli MCP Local Dev Entegrasyonu
Phase DS-8 — Webapp Testing + Playwright Regression Workflow
Phase DS-9 — Final QA, GitHub Merge, Compact ve Release Notes
```

Compact kuralı:

```txt
DS-0 + DS-1 sonrası compact
DS-2 + DS-3 sonrası compact
DS-4 + DS-5 sonrası compact
DS-6 + DS-7 sonrası compact
DS-8 + DS-9 sonrası final compact
```

---

# 7. Phase Detayları

## Phase DS-0 — Baseline, Repo Scan ve Risk Raporu

Kullanılacak agentler:

```txt
mcp-research-agent
slotpilot-skill-architect-agent
regression-merge-agent
github-push-agent
```

Amaç:

Mevcut SlotPilot Türkiye projesini bozmadan baseline almak, iki repodan çıkarılacak fikirleri dokümante etmek.

Yapılacaklar:

1. Mevcut proje testlerini çalıştır.
2. `anthropics/skills` repo yapısını incele.
3. `modelcontextprotocol/servers` repo yapısını incele.
4. Projeye eklenecek / eklenmeyecek parçaları belirle.
5. `docs/repo-scan-report.md` oluştur.
6. MCP ve Skills için license/security notları ekle.
7. QA baseline raporu oluştur.

Oluşturulacak dosyalar:

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
- Sadece dokümantasyon değişti.
- Mevcut testler geçti.
- Build geçti.
```

---

## Phase DS-1 — Türkiye İlçe Data Audit

Kullanılacak agentler:

```txt
turkey-district-auditor-agent
regression-merge-agent
github-push-agent
```

Amaç:

Projede hangi il/ilçe verilerinin eksik olduğunu net bulmak. Bu phase data değiştirmez, sadece rapor çıkarır.

Yapılacaklar:

1. Mevcut `turkey-provinces`, `districts`, `Location`, `Address` kaynaklarını bul.
2. İl sayısını kontrol et.
3. İlçe sayısını kontrol et.
4. Eksik ilçeleri il bazında listele.
5. Duplicate ilçe var mı kontrol et.
6. Slug çakışması var mı kontrol et.
7. Türkçe karakter display sorunları var mı kontrol et.
8. `scripts/audit-turkey-districts.ts` oluştur.
9. `docs/turkiye-district-audit.md` oluştur.

Audit script beklenen çıktısı:

```txt
Province count: 81
District count: EXPECTED_COUNT
Missing districts:
- İstanbul: ...
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
- Audit script çalışıyor.
- Eksikler raporlandı.
- Uygulama davranışı değişmedi.
```

Compact:

```txt
DS-0 ve DS-1 tamamlandıktan sonra compact-state-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
/compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase DS-2 — Eksik İlçeleri Tamamlama ve Migration

Kullanılacak agentler:

```txt
turkey-district-fixer-agent
regression-merge-agent
github-push-agent
```

Amaç:

Eksik ilçeleri tamamlamak, data kaynağını normalize etmek, migration ve seed yapısını güvenli hale getirmek.

Yapılacaklar:

1. Canonical district dataset oluştur:

```txt
src/data/turkey/districts.ts
src/data/turkey/provinces.ts
src/data/turkey/regions.ts
```

2. Display name + slug standardı belirle:

```txt
Display: Çankaya
Slug: cankaya
Province code: 06
```

3. Eksik ilçeleri ekle.
4. District schema/type güncelle.
5. Seed script güncelle.
6. Migration script yaz.
7. Existing address kayıtları için safe fallback üret.
8. Unit tests ekle.

Beklenen test dosyaları:

```txt
src/tests/turkey-districts.test.ts
src/tests/turkey-address-migration.test.ts
src/tests/turkey-slug.test.ts
```

Testler:

```txt
- 81 il var.
- Her ilin en az 1 ilçesi var.
- Toplam ilçe sayısı official/reference expected count ile eşleşiyor.
- Sluglar unique.
- Türkçe karakter display kaybolmuyor.
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

## Phase DS-3 — İl/İlçe UI, API ve E2E Validation

Kullanılacak agentler:

```txt
turkey-district-fixer-agent
regression-merge-agent
github-push-agent
```

Amaç:

Tamamlanan ilçe datasının UI, API ve public booking tarafında doğru çalıştığını doğrulamak.

Yapılacaklar:

1. Dashboard işletme adres formunu güncelle.
2. Location formunda il/ilçe dropdownlarını güncelle.
3. Marketplace şehir/ilçe filtrelerini güncelle.
4. Public booking adres gösterimini test et.
5. API endpointleri district validation kullansın.
6. E2E test ekle.

E2E akış:

```txt
1. Login ol.
2. İşletme adresinde İstanbul seç.
3. İlçe olarak eksik olan ve yeni eklenen bir ilçeyi seç.
4. Kaydet.
5. Marketplace filtresinde aynı il/ilçeyi seç.
6. İşletmenin göründüğünü doğrula.
7. Public booking sayfasında adresin doğru göründüğünü doğrula.
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
DS-2 ve DS-3 tamamlandıktan sonra compact-state-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
/compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase DS-4 — Anthropic Skills Mimari Planı

Kullanılacak agentler:

```txt
slotpilot-skill-architect-agent
regression-merge-agent
github-push-agent
```

Amaç:

Anthropic Skills repo yapısından ilham alarak SlotPilot’a özel skill mimarisi tasarlamak.

Eklenecek SlotPilot skill adayları:

```txt
1. slotpilot-booking-regression
2. slotpilot-turkey-data
3. slotpilot-mcp-integration
4. slotpilot-payment-safety
5. slotpilot-release-manager
6. slotpilot-kvkk-review
7. slotpilot-ui-polish
```

Yapılacaklar:

1. `docs/slotpilot-skills-architecture.md` oluştur.
2. Her skill için trigger açıklaması yaz.
3. Her skill için test promptları yaz.
4. Skill folder standardını belirle:

```txt
.claude/skills/skill-name/SKILL.md
.claude/skills/skill-name/references/
.claude/skills/skill-name/scripts/
```

5. License note yaz.
6. Kopyalanmayacak kaynakları belirt.
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
git commit -m "docs: design SlotPilot custom skills architecture"
git push -u origin feature/ds-4-skills-architecture
```

Merge kriteri:

```txt
- Sadece docs/skill planı eklendi.
- Kopyalanan lisanslı içerik yok.
- Build/test geçiyor.
```

---

## Phase DS-5 — SlotPilot Skills Implementasyonu

Kullanılacak agentler:

```txt
slotpilot-skill-builder-agent
regression-merge-agent
github-push-agent
```

Amaç:

SlotPilot’a özel tekrar kullanılabilir skills eklemek.

Oluşturulacak skills:

```txt
.claude/skills/slotpilot-booking-regression/SKILL.md
.claude/skills/slotpilot-turkey-data/SKILL.md
.claude/skills/slotpilot-mcp-integration/SKILL.md
.claude/skills/slotpilot-payment-safety/SKILL.md
.claude/skills/slotpilot-release-manager/SKILL.md
```

Her skill için:

```txt
- name
- description
- ne zaman kullanılır
- adım adım workflow
- çalıştırılacak testler
- yasak işlemler
- beklenen çıktı formatı
```

Eval prompt dosyaları:

```txt
evals/skills/booking-regression.json
evals/skills/turkey-data.json
evals/skills/mcp-integration.json
evals/skills/payment-safety.json
evals/skills/release-manager.json
```

Testler:

```txt
- Skill dosyalarında name/description var.
- SKILL.md dosyaları 500 satırı aşmıyor veya references kullanıyor.
- Eval promptları JSON valid.
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

Eğer `scripts/validate-skills.js` yoksa bu phase içinde basit validator oluştur.

Commit:

```bash
git add .
git commit -m "feat: add SlotPilot custom Claude skills"
git push -u origin feature/ds-5-slotpilot-skills
```

Compact:

```txt
DS-4 ve DS-5 tamamlandıktan sonra compact-state-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
/compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase DS-6 — MCP Servers Araştırma ve Güvenlik Tasarımı

Kullanılacak agentler:

```txt
mcp-research-agent
mcp-security-agent
regression-merge-agent
github-push-agent
```

Amaç:

MCP reference server’lardan hangilerinin SlotPilot geliştirme workflow’una alınacağını seçmek.

Seçilecek güvenli MCP fikirleri:

```txt
- filesystem: proje klasörüyle sınırlı
- git: status/diff/branch/commit yardımı
- time: Europe/Istanbul timezone testleri
- fetch: dokümantasyon okuma
- memory: karar kayıtları
- sequential-thinking: migration/debug planlama
```

Doğrudan eklenmeyecekler:

```txt
- Production DB’ye write erişimli MCP
- Payment provider MCP
- Geniş filesystem erişimi
- GitHub tokenlı geniş yetkili MCP
- Archived server’ların direkt production kullanımı
```

Yapılacaklar:

1. `docs/mcp-research-report.md` oluştur.
2. Güvenli/riski/kaçınılacak MCP listesini yaz.
3. `docs/mcp-security-checklist.md` oluştur.
4. MCP permission modelini yaz.
5. Local-only yaklaşımı belirle.
6. Token/secret politikası yaz.

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

## Phase DS-7 — Güvenli MCP Local Dev Entegrasyonu

Kullanılacak agentler:

```txt
mcp-integration-agent
mcp-security-agent
regression-merge-agent
github-push-agent
```

Amaç:

Gerçek secret içermeyen, sadece local development için kullanılacak MCP config örneği eklemek.

Oluşturulacak dosyalar:

```txt
.mcp.json.example
docs/mcp-local-setup.md
docs/mcp-usage-examples.md
```

`.mcp.json.example` kuralları:

```txt
- Gerçek token yok.
- Filesystem sadece proje root ile sınırlı.
- Git sadece read/status/diff ağırlıklı kullanılacak.
- Time server Europe/Istanbul kullanım örneği içerecek.
- Fetch server yalnızca dokümantasyon için önerilecek.
- Production deploy config değildir.
```

MCP kullanım örnekleri:

```txt
- "Git diff’i kontrol et ve phase merge raporu çıkar."
- "Europe/Istanbul timezone ile randevu slot testlerini incele."
- "docs/COMPACT_STATE.md dosyasına göre bir sonraki phase promptunu hazırla."
- "Sadece proje klasörü içinde district data dosyalarını oku."
```

Testler:

```txt
- .mcp.json.example JSON valid.
- Secret placeholder dışında gerçek secret yok.
- Docs içinde production uyarısı var.
- Filesystem path geniş değil.
```

Komutlar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
node scripts/check-no-secrets.js
```

Eğer `scripts/check-no-secrets.js` yoksa basit secret scan scripti ekle.

Commit:

```bash
git add .
git commit -m "chore: add safe local MCP configuration examples"
git push -u origin feature/ds-7-mcp-local-config
```

Compact:

```txt
DS-6 ve DS-7 tamamlandıktan sonra compact-state-agent çalıştır.
docs/COMPACT_STATE.md güncelle.
/compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

## Phase DS-8 — Webapp Testing + Playwright Regression Workflow

Kullanılacak agentler:

```txt
slotpilot-skill-builder-agent
regression-merge-agent
github-push-agent
```

Amaç:

Anthropic webapp-testing skill yaklaşımını SlotPilot’a uyarlayıp local browser regression workflow’u oluşturmak.

Yapılacaklar:

1. Playwright helper scriptleri ekle.
2. Local server lifecycle helper ekle.
3. `tests/e2e/turkey-booking-flow.spec.ts` güncelle.
4. `tests/e2e/district-selection.spec.ts` ekle.
5. `tests/e2e/mcp-safe-config.spec.ts` gerekirse docs validation olarak ekle.
6. Browser screenshot artifact klasörü ekle.
7. `docs/webapp-testing-workflow.md` oluştur.

E2E test akışları:

```txt
1. Türkçe login/register.
2. İşletme adresinde eksik tamamlanan ilçeyi seç.
3. Hizmet oluştur.
4. Müsaitlik ekle.
5. Public booking aç.
6. Randevu oluştur.
7. Dashboard’da randevuyu gör.
8. Marketplace il/ilçe filtresini doğrula.
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

## Phase DS-9 — Final QA, GitHub Merge, Compact ve Release Notes

Kullanılacak agentler:

```txt
regression-merge-agent
compact-state-agent
github-push-agent
```

Amaç:

Tüm değişiklikleri final testten geçirmek, GitHub’a pushlamak, release notu oluşturmak.

Yapılacaklar:

1. Full test çalıştır.
2. Full e2e çalıştır.
3. District audit script tekrar çalıştır.
4. Skill validator çalıştır.
5. MCP config validator çalıştır.
6. README güncelle.
7. CHANGELOG güncelle.
8. `docs/COMPACT_STATE.md` final güncelle.
9. GitHub’a push yap.
10. Stable tag oluştur.

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
[ ] Eksik ilçeler tamamlandı.
[ ] İlçe audit PASS.
[ ] İl/ilçe UI PASS.
[ ] Marketplace il/ilçe filter PASS.
[ ] Public booking adres display PASS.
[ ] SlotPilot custom skills eklendi.
[ ] Skill validator PASS.
[ ] MCP research docs eklendi.
[ ] Safe .mcp.json.example eklendi.
[ ] Secret scan PASS.
[ ] Playwright regression PASS.
[ ] Build PASS.
[ ] GitHub push tamamlandı.
[ ] Final compact state güncellendi.
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
DS-8 ve DS-9 tamamlandıktan sonra compact-state-agent çalıştır.
docs/COMPACT_STATE.md final hale getir.
/compact çalıştır veya kullanıcıdan çalıştırmasını iste.
```

---

# 8. Yeni Script Önerileri

Bu update içinde eklenebilecek scriptler:

```txt
scripts/audit-turkey-districts.ts
scripts/validate-skills.js
scripts/check-no-secrets.js
scripts/validate-mcp-config.js
scripts/generate-district-slugs.ts
```

Package scripts önerisi:

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

# 9. District Dataset Teknik Standardı

Önerilen type yapısı:

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

Slug standardı:

```txt
Çankaya -> cankaya
Üsküdar -> uskudar
Şişli -> sisli
Keçiören -> kecioren
```

Test standardı:

```txt
- Display name Türkçe kalır.
- Slug ASCII olur.
- provincePlateCode doğru bağlanır.
- Aynı ilde duplicate slug olmaz.
- Global district id unique olur.
```

---

# 10. MCP Config Güvenlik Standardı

`.mcp.json.example` içine sadece örnek config konur.

Yasaklar:

```txt
- Gerçek token
- Geniş filesystem root erişimi
- Production DB connection string
- Stripe secret
- Google OAuth secret
- WhatsApp token
- SMS provider token
- Force push tool
- Destructive file deletion tool
```

İzin verilen local kullanım:

```txt
- Project-scoped filesystem
- Git status/diff ağırlıklı workflow
- Time/timezone helper
- Fetch public docs helper
- Memory local notes
- Sequential planning helper
```

---

# 11. COMPACT_STATE Şablonu

`docs/COMPACT_STATE.md`:

```md
# SlotPilot Compact State

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

Her compact sonrası kullanılacak prompt:

```txt
Read docs/COMPACT_STATE.md and SLOTPILOT_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md.
Continue only from the next unfinished phase.
Do not redo completed work.
Run tests before commit, push, and merge.
After 2 more phases, update COMPACT_STATE and run/request /compact.
```

---

# 12. Claude Code Ana Prompt’u

```txt
Read SLOTPILOT_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md carefully.

This update has three goals:
1. Complete missing Turkey district data.
2. Add SlotPilot-specific Claude Skills inspired by anthropics/skills.
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

# 13. Antigravity Ana Prompt’u

```txt
Read SLOTPILOT_TURKIYE_DISTRICT_SKILLS_MCP_UPDATE_PLAN.md.

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

Bu update bitmiş sayılması için:

```txt
- Türkiye ilçe eksikleri tamamlandı.
- District audit PASS.
- District UI/API/e2e tests PASS.
- SlotPilot custom skills eklendi.
- Skill validator PASS.
- MCP research report eklendi.
- Safe .mcp.json.example eklendi.
- MCP security checklist eklendi.
- Playwright regression workflow güncellendi.
- Her phase test edildi.
- Her phase GitHub’a pushlandı.
- Her phase merge edilmeden önce test edildi.
- Her 2 phase sonrası COMPACT_STATE güncellendi.
- Final tag oluşturuldu.
```

---

# 15. Final Kontrol Prompt’u

```txt
Review the whole district + skills + MCP update.

Check:
1. Are all Turkey provinces present?
2. Are missing districts fixed?
3. Does the district audit script pass?
4. Do business address forms support completed district data?
5. Does marketplace city/district filtering work?
6. Are SlotPilot custom skills present and valid?
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
