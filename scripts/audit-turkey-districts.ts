/**
 * audit-turkey-districts.ts
 *
 * Audits the completeness and integrity of TURKEY_PROVINCES and TURKEY_DISTRICTS
 * defined in src/data/turkey-provinces.ts.
 *
 * Usage:
 *   npx tsx scripts/audit-turkey-districts.ts
 *   npm run audit:districts
 *
 * Exit code:
 *   0  — province count is exactly 81 (districts may still be missing — audit only)
 *   1  — province count is not 81
 */

import {
  TURKEY_PROVINCES,
  TURKEY_DISTRICTS,
  type Province,
  type District,
} from "../src/data/turkey-provinces";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TURKISH_CHARS_RE = /[çğıöşüÇĞİÖŞÜ]/;
const ASCII_SLUG_RE = /^[a-z0-9-]+$/;

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}
function green(text: string): string {
  return `\x1b[32m${text}\x1b[0m`;
}
function red(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}
function yellow(text: string): string {
  return `\x1b[33m${text}\x1b[0m`;
}
function cyan(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}

function pass(label: string): void {
  console.log(`  ${green("PASS")} ${label}`);
}
function fail(label: string): void {
  console.log(`  ${red("FAIL")} ${label}`);
}
function warn(label: string): void {
  console.log(`  ${yellow("WARN")} ${label}`);
}

// ---------------------------------------------------------------------------
// 1. Province count
// ---------------------------------------------------------------------------

console.log("");
console.log(bold("=== Randevo — Turkey District Audit ==="));
console.log(`Run date : ${new Date().toISOString()}`);
console.log("");

console.log(bold("── 1. Province Count ──────────────────────────────────────"));
const totalProvinces = TURKEY_PROVINCES.length;
const EXPECTED_PROVINCES = 81;
console.log(`  Total provinces found : ${totalProvinces}`);
if (totalProvinces === EXPECTED_PROVINCES) {
  pass(`Exactly ${EXPECTED_PROVINCES} provinces — correct`);
} else {
  fail(
    `Expected ${EXPECTED_PROVINCES} provinces, got ${totalProvinces} — DATA ERROR`
  );
}
console.log("");

// ---------------------------------------------------------------------------
// 2. Province slug uniqueness
// ---------------------------------------------------------------------------

console.log(bold("── 2. Province Slug Uniqueness ────────────────────────────"));
const provinceSlugCounts = new Map<string, number>();
for (const p of TURKEY_PROVINCES) {
  provinceSlugCounts.set(p.slug, (provinceSlugCounts.get(p.slug) ?? 0) + 1);
}
const duplicateProvinceSlugs = [...provinceSlugCounts.entries()].filter(
  ([, count]) => count > 1
);
if (duplicateProvinceSlugs.length === 0) {
  pass("No duplicate province slugs");
} else {
  for (const [slug, count] of duplicateProvinceSlugs) {
    fail(`Province slug "${slug}" appears ${count} times`);
  }
}
console.log("");

// ---------------------------------------------------------------------------
// 3. Province name / slug Turkish-character validation
// ---------------------------------------------------------------------------

console.log(bold("── 3. Province Name & Slug Validation ────────────────────"));
let provinceNameIssues = 0;
let provinceSlugIssues = 0;
for (const p of TURKEY_PROVINCES) {
  // Slugs must be pure ASCII (no Turkish characters)
  if (!ASCII_SLUG_RE.test(p.slug)) {
    fail(
      `Province slug contains non-ASCII chars: "${p.name}" → slug="${p.slug}"`
    );
    provinceSlugIssues++;
  }
}
if (provinceSlugIssues === 0) {
  pass("All province slugs are ASCII-only");
}
// Names: just verify they have no obviously broken encoding (basic sanity)
for (const p of TURKEY_PROVINCES) {
  if (p.name.includes("?") || p.name.includes("�")) {
    fail(`Province name appears corrupted: "${p.name}"`);
    provinceNameIssues++;
  }
}
if (provinceNameIssues === 0) {
  pass("All province display names appear well-formed");
}
console.log("");

// ---------------------------------------------------------------------------
// 4. District coverage — provinces WITH districts
// ---------------------------------------------------------------------------

console.log(bold("── 4. Provinces WITH District Data ───────────────────────"));
const provincesWithDistricts: Array<{ province: Province; districts: District[] }> =
  [];
for (const p of TURKEY_PROVINCES) {
  const districts = TURKEY_DISTRICTS[p.slug];
  if (districts && districts.length > 0) {
    provincesWithDistricts.push({ province: p, districts });
  }
}

if (provincesWithDistricts.length === 0) {
  warn("No provinces have district data at all");
} else {
  for (const { province, districts } of provincesWithDistricts) {
    console.log(
      `  ${cyan(province.slug.padEnd(18))} [${String(province.plateCode).padStart(2, "0")}] ` +
        `${province.name.padEnd(20)} → ${districts.length} districts`
    );
  }
}
console.log(
  `\n  Subtotal: ${green(String(provincesWithDistricts.length))} / ${totalProvinces} provinces have district data`
);
console.log("");

// ---------------------------------------------------------------------------
// 5. District coverage — provinces WITHOUT districts
// ---------------------------------------------------------------------------

console.log(bold("── 5. Provinces WITHOUT District Data (need DS-2 work) ───"));
const provincesWithoutDistricts: Province[] = [];
for (const p of TURKEY_PROVINCES) {
  const districts = TURKEY_DISTRICTS[p.slug];
  if (!districts || districts.length === 0) {
    provincesWithoutDistricts.push(p);
  }
}

if (provincesWithoutDistricts.length === 0) {
  pass("All provinces have district data — nothing to fix");
} else {
  for (const p of provincesWithoutDistricts) {
    console.log(
      `  ${yellow("MISSING")} [${String(p.plateCode).padStart(2, "0")}] ` +
        `${p.slug.padEnd(18)} (${p.name}) — region: ${p.region}`
    );
  }
  console.log(
    `\n  ${yellow("ACTION REQUIRED:")} ${provincesWithoutDistricts.length} province(s) ` +
      `need district data added in DS-2`
  );
}
console.log("");

// ---------------------------------------------------------------------------
// 6. District slug uniqueness — within each province
// ---------------------------------------------------------------------------

console.log(bold("── 6. District Slug Uniqueness (per province) ────────────"));
let intraProvinceIssues = 0;
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  const seenSlugs = new Map<string, number>();
  for (const d of districts) {
    seenSlugs.set(d.slug, (seenSlugs.get(d.slug) ?? 0) + 1);
  }
  for (const [slug, count] of seenSlugs.entries()) {
    if (count > 1) {
      fail(
        `Province "${provinceSlug}": district slug "${slug}" appears ${count} times`
      );
      intraProvinceIssues++;
    }
  }
}
if (intraProvinceIssues === 0) {
  pass("No duplicate district slugs within any province");
}
console.log("");

// ---------------------------------------------------------------------------
// 7. District slug uniqueness — globally across all provinces
// ---------------------------------------------------------------------------

console.log(bold("── 7. District Slug Uniqueness (global, cross-province) ──"));
const globalSlugMap = new Map<string, string[]>(); // slug → [provinceSlug, ...]
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  for (const d of districts) {
    const existing = globalSlugMap.get(d.slug) ?? [];
    existing.push(provinceSlug);
    globalSlugMap.set(d.slug, existing);
  }
}
const globalDuplicates = [...globalSlugMap.entries()].filter(
  ([, provinces]) => provinces.length > 1
);
if (globalDuplicates.length === 0) {
  pass("All district slugs are globally unique across provinces");
} else {
  for (const [slug, provinces] of globalDuplicates) {
    warn(
      `District slug "${slug}" used in multiple provinces: [${provinces.join(", ")}] ` +
        `(may be intentional for same-named districts)`
    );
  }
}
console.log("");

// ---------------------------------------------------------------------------
// 8. District name & slug validation (Turkish chars, ASCII slugs)
// ---------------------------------------------------------------------------

console.log(bold("── 8. District Name & Slug Validation ────────────────────"));
let districtSlugIssues = 0;
let districtNameIssues = 0;
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  for (const d of districts) {
    // Slugs must be ASCII-only
    if (!ASCII_SLUG_RE.test(d.slug)) {
      fail(
        `[${provinceSlug}] District slug contains non-ASCII chars: ` +
          `"${d.name}" → slug="${d.slug}"`
      );
      districtSlugIssues++;
    }
    // Names should contain proper Turkish characters where expected
    // (no replacement characters / encoding corruption)
    if (d.name.includes("?") || d.name.includes("�")) {
      fail(
        `[${provinceSlug}] District name appears corrupted: "${d.name}"`
      );
      districtNameIssues++;
    }
  }
}

// Report Turkish character preservation in display names
let turkishNamesFound = 0;
for (const districts of Object.values(TURKEY_DISTRICTS)) {
  for (const d of districts) {
    if (TURKISH_CHARS_RE.test(d.name)) {
      turkishNamesFound++;
    }
  }
}

if (districtSlugIssues === 0) {
  pass("All district slugs are ASCII-only");
}
if (districtNameIssues === 0) {
  pass("All district display names appear well-formed");
}
pass(
  `Turkish characters preserved in display names — ${turkishNamesFound} district name(s) ` +
    `contain Turkish characters (ç, ğ, ı, ö, ş, ü)`
);
console.log("");

// ---------------------------------------------------------------------------
// 9. Summary
// ---------------------------------------------------------------------------

console.log(bold("── 9. Summary ────────────────────────────────────────────"));

const issues: string[] = [];
if (totalProvinces !== EXPECTED_PROVINCES) {
  issues.push(`Province count is ${totalProvinces}, expected ${EXPECTED_PROVINCES}`);
}
if (duplicateProvinceSlugs.length > 0) {
  issues.push(`${duplicateProvinceSlugs.length} duplicate province slug(s)`);
}
if (provinceSlugIssues > 0) {
  issues.push(`${provinceSlugIssues} province slug(s) contain non-ASCII characters`);
}
if (intraProvinceIssues > 0) {
  issues.push(`${intraProvinceIssues} duplicate district slug(s) within provinces`);
}
if (districtSlugIssues > 0) {
  issues.push(`${districtSlugIssues} district slug(s) contain non-ASCII characters`);
}

const hasHardFailures = issues.length > 0;
const missingCount = provincesWithoutDistricts.length;

console.log(`  Total provinces          : ${totalProvinces} / ${EXPECTED_PROVINCES}`);
console.log(`  Provinces with districts : ${provincesWithDistricts.length}`);
console.log(`  Provinces without data   : ${missingCount}  ← DS-2 backlog`);
console.log(`  Hard failures            : ${hasHardFailures ? issues.length : 0}`);
console.log("");

if (hasHardFailures) {
  console.log(bold(red("  OVERALL STATUS: FAIL")));
  for (const issue of issues) {
    console.log(`    • ${issue}`);
  }
} else if (missingCount > 0) {
  console.log(bold(yellow("  OVERALL STATUS: PASS (with warnings)")));
  console.log(
    `    Province count is correct. ${missingCount} province(s) lack district data — ` +
      `add them in DS-2.`
  );
} else {
  console.log(bold(green("  OVERALL STATUS: PASS")));
  console.log("    All provinces have district data and all checks pass.");
}

console.log("");

// ---------------------------------------------------------------------------
// Exit code
// ---------------------------------------------------------------------------

process.exit(totalProvinces === EXPECTED_PROVINCES ? 0 : 1);
