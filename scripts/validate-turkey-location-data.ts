/**
 * validate-turkey-location-data.ts
 *
 * Strict validation of TURKEY_PROVINCES and TURKEY_DISTRICTS.
 * Unlike audit-turkey-districts.ts (which is report-only), this script
 * FAILS with exit code 1 on any data-quality violation.
 *
 * Usage:
 *   npx tsx scripts/validate-turkey-location-data.ts
 *   npm run check:turkey-locations
 */

import {
  TURKEY_PROVINCES,
  TURKEY_DISTRICTS,
} from "../src/data/turkey-provinces";

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

let failures = 0;
let warnings = 0;

function pass(msg: string) {
  console.log(`  ${green("PASS")} ${msg}`);
}
function fail(msg: string) {
  console.log(`  ${red("FAIL")} ${msg}`);
  failures++;
}
function warn(msg: string) {
  console.log(`  ${yellow("WARN")} ${msg}`);
  warnings++;
}

// ---------------------------------------------------------------------------
// Minimum district thresholds for major provinces
// Based on official Turkish administrative divisions (İçişleri Bakanlığı)
// ---------------------------------------------------------------------------

const MIN_DISTRICTS: Record<string, number> = {
  istanbul: 35,
  ankara: 20,
  izmir: 25,
  bursa: 12,
  antalya: 15,
  mersin: 10,
  konya: 28,
  adana: 14,
  gaziantep: 8,
  sanliurfa: 12,
  samsun: 15,
  kocaeli: 10,
  trabzon: 15,
  sakarya: 14,
};

// ---------------------------------------------------------------------------
// Regression slugs that MUST exist (canonical correctness tests)
// ---------------------------------------------------------------------------

const REGRESSION_CHECKS: Record<string, string[]> = {
  kocaeli: ["dilovasi", "cayirova", "karamursel", "basiskele", "darica"],
  istanbul: ["kadikoy", "besiktas", "uskudar", "beyoglu", "fatih"],
  ankara: ["cankaya", "kecioren", "etimesgut", "sincan", "polatli", "golbasi"],
  izmir: ["konak", "bornova", "karsiyaka", "cesme", "selcuk", "bergama"],
  bursa: ["osmangazi", "nilufer", "inegol", "gemlik", "karacabey"],
  antalya: ["alanya", "manavgat", "serik", "kemer", "kas"],
  mersin: ["tarsus", "erdemli", "silifke", "anamur"],
};

// ---------------------------------------------------------------------------
// Run validations
// ---------------------------------------------------------------------------

console.log("");
console.log(bold("=== Randevo — Turkey Location Data Validator ==="));
console.log(`Run date: ${new Date().toISOString()}`);
console.log("");

// 1. Province count
console.log(bold("── 1. Province Count ──────────────────────────────────────"));
if (TURKEY_PROVINCES.length === 81) {
  pass("Exactly 81 provinces");
} else {
  fail(`Expected 81 provinces, got ${TURKEY_PROVINCES.length}`);
}
console.log("");

// 2. Province slug uniqueness
console.log(bold("── 2. Province Slug Uniqueness ────────────────────────────"));
const slugsSeen = new Set<string>();
const codesSeen = new Set<number>();
for (const p of TURKEY_PROVINCES) {
  if (slugsSeen.has(p.slug)) {
    fail(`Duplicate province slug: "${p.slug}"`);
  }
  slugsSeen.add(p.slug);
  if (codesSeen.has(p.plateCode)) {
    fail(`Duplicate plate code: ${p.plateCode} (${p.slug})`);
  }
  codesSeen.add(p.plateCode);
  if (p.plateCode < 1 || p.plateCode > 81) {
    fail(`Plate code out of range 1-81: ${p.plateCode} (${p.slug})`);
  }
  if (!/^[a-z0-9-]+$/.test(p.slug)) {
    fail(`Non-ASCII province slug: "${p.slug}"`);
  }
}
if (failures === 0) pass("All province slugs and plate codes are unique and valid");
console.log("");

// 3. Every province has at least 3 districts
console.log(bold("── 3. Minimum District Coverage ───────────────────────────"));
let missingDistricts = 0;
for (const p of TURKEY_PROVINCES) {
  const districts = TURKEY_DISTRICTS[p.slug];
  if (!districts || districts.length < 3) {
    fail(
      `Province "${p.slug}" has ${districts?.length ?? 0} districts (minimum 3 required)`
    );
    missingDistricts++;
  }
}
if (missingDistricts === 0) pass("Every province has at least 3 districts");
console.log("");

// 4. Minimum thresholds for major provinces
console.log(bold("── 4. Major Province District Thresholds ──────────────────"));
for (const [provinceSlug, minCount] of Object.entries(MIN_DISTRICTS)) {
  const districts = TURKEY_DISTRICTS[provinceSlug];
  const count = districts?.length ?? 0;
  if (count < minCount) {
    fail(
      `"${provinceSlug}" has ${count} districts — requires ≥ ${minCount}`
    );
  } else {
    pass(`"${provinceSlug}" has ${count} districts (≥ ${minCount}) ✓`);
  }
}
console.log("");

// 5. Duplicate district slugs within same province
console.log(bold("── 5. Intra-Province District Slug Uniqueness ─────────────"));
let intraDuplicates = 0;
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  const seen = new Set<string>();
  for (const d of districts) {
    if (seen.has(d.slug)) {
      fail(
        `Province "${provinceSlug}": duplicate district slug "${d.slug}"`
      );
      intraDuplicates++;
    }
    seen.add(d.slug);
  }
}
if (intraDuplicates === 0) pass("No duplicate district slugs within any province");
console.log("");

// 6. District slug format validation
console.log(bold("── 6. District Slug Format ────────────────────────────────"));
const ASCII_RE = /^[a-z0-9-]+$/;
let slugFormatIssues = 0;
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  for (const d of districts) {
    if (!ASCII_RE.test(d.slug)) {
      fail(
        `[${provinceSlug}] District slug "${d.slug}" contains non-ASCII characters`
      );
      slugFormatIssues++;
    }
    if (d.name.includes("?") || d.name.includes("�")) {
      fail(
        `[${provinceSlug}] District name appears corrupted: "${d.name}"`
      );
      slugFormatIssues++;
    }
  }
}
if (slugFormatIssues === 0) pass("All district slugs are ASCII-only, all names well-formed");
console.log("");

// 7. Regression checks — critical districts must exist
console.log(bold("── 7. Regression Slug Checks ──────────────────────────────"));
for (const [provinceSlug, requiredSlugs] of Object.entries(REGRESSION_CHECKS)) {
  const districts = TURKEY_DISTRICTS[provinceSlug];
  if (!districts) {
    fail(`Province "${provinceSlug}" has no district data`);
    continue;
  }
  const existingSlugs = new Set(districts.map((d) => d.slug));
  for (const slug of requiredSlugs) {
    if (!existingSlugs.has(slug)) {
      fail(`Province "${provinceSlug}" is missing required district slug: "${slug}"`);
    }
  }
}
if (failures === 0) pass("All regression slug checks passed");
console.log("");

// 8. Cross-province slug collision warnings (informational)
console.log(bold("── 8. Cross-Province Slug Collisions (informational) ──────"));
const globalSlugMap = new Map<string, string[]>();
for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
  for (const d of districts) {
    const list = globalSlugMap.get(d.slug) ?? [];
    list.push(provinceSlug);
    globalSlugMap.set(d.slug, list);
  }
}
let collisions = 0;
for (const [slug, provinces] of globalSlugMap.entries()) {
  if (provinces.length > 1) {
    warn(
      `Slug "${slug}" shared by: [${provinces.join(", ")}] — intentional for common names like "merkez"`
    );
    collisions++;
  }
}
if (collisions === 0) pass("No cross-province slug collisions");
console.log("");

// ---------------------------------------------------------------------------
// Final result
// ---------------------------------------------------------------------------

console.log(bold("── Result ─────────────────────────────────────────────────"));
console.log(`  FAIL  : ${failures}`);
console.log(`  WARN  : ${warnings}`);
console.log("");

if (failures > 0) {
  console.log(bold(red(`  OVERALL: FAIL (${failures} validation error(s))`)));
  console.log("");
  process.exit(1);
} else {
  console.log(bold(green("  OVERALL: PASS")));
  console.log("  Turkey location data meets all quality requirements.");
  console.log("");
  process.exit(0);
}
