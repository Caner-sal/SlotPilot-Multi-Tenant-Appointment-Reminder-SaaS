import fs from "node:fs";
import path from "node:path";

type Dict = Record<string, unknown>;

function flattenKeys(obj: Dict, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Dict, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function readJson(filePath: string): Dict {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Dict;
}

const messagesDir = path.join(process.cwd(), "src", "messages");
const localeFiles = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

if (localeFiles.length === 0) {
  console.error("No locale files found in src/messages");
  process.exit(1);
}

const baseFile = "tr.json";
if (!localeFiles.includes(baseFile)) {
  console.error("Base locale file tr.json is required.");
  process.exit(1);
}

const baseKeys = new Set(flattenKeys(readJson(path.join(messagesDir, baseFile))));
let hasError = false;

for (const file of localeFiles) {
  const locale = file.replace(".json", "");
  const keys = new Set(flattenKeys(readJson(path.join(messagesDir, file))));

  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`Locale ${locale} key mismatch:`);
    if (missing.length) {
      console.error(`  Missing (${missing.length}): ${missing.join(", ")}`);
    }
    if (extra.length) {
      console.error(`  Extra (${extra.length}): ${extra.join(", ")}`);
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`Translation key parity PASS (${localeFiles.join(", ")})`);
