import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(process.cwd(), "src");

// Known mojibake patterns: UTF-8 multi-byte sequences misread as Latin-1
const MOJIBAKE_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /Ä[±ğıÅÇğşİÜÖ]/g, description: "Turkish letter (Ä prefix)" },
  { pattern: /Ã[¼üöÖÜçÇ]/g, description: "Turkish/German vowel (Ã prefix)" },
  { pattern: /â€[œ"™]/g, description: "Smart quote corruption" },
  { pattern: /â‚[ºĞŞşİıÜü]/g, description: "Currency/special char corruption" },
  { pattern: /ÅŸ/g, description: "ş corruption (ÅŸ)" },
  { pattern: /Å/g, description: "ş corruption (Å + control)" },
  { pattern: /â€™/g, description: "Apostrophe corruption" },
  { pattern: /�/g, description: "Unicode replacement character (�)" },
];

function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".spec.ts")
    ) {
      files.push(full);
    }
  }
  return files;
}

let failCount = 0;

console.log("🔍 Encoding check başlatılıyor...\n");

const files = walkDir(ROOT);

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");

  lines.forEach((line, idx) => {
    for (const { pattern, description } of MOJIBAKE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        console.error(`  ❌ FAIL [${description}]  ${rel}:${idx + 1}`);
        console.error(`       ${line.trim().slice(0, 120)}`);
        failCount++;
        break;
      }
    }
  });
}

console.log("");
if (failCount > 0) {
  console.error(`❌ ${failCount} encoding bozukluğu bulundu.`);
  process.exit(1);
} else {
  console.log("✅ Encoding check geçti — bozuk karakter yok.");
  process.exit(0);
}
