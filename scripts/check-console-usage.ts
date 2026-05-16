import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(process.cwd(), "src");
const SKIP_PATTERNS = [
  "src/lib/logger.ts",
  "src/lib/logger.js",
];

function isFakeFile(filePath: string): boolean {
  const base = path.basename(filePath);
  return base.startsWith("fake-") || base.startsWith("fake.");
}

function isSkipped(filePath: string): boolean {
  const rel = filePath.replace(/\\/g, "/").replace(process.cwd().replace(/\\/g, "/") + "/", "");
  if (SKIP_PATTERNS.some((p) => rel.endsWith(p) || rel.includes(p))) return true;
  if (isFakeFile(filePath)) return true;
  return false;
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(full);
    }
  }
  return files;
}

const SCAN_DIRS = [
  path.join(ROOT, "app", "api"),
  path.join(ROOT, "services"),
];

let failCount = 0;
let warnCount = 0;

console.log("🔍 Console usage check başlatılıyor...\n");

for (const scanDir of SCAN_DIRS) {
  if (!fs.existsSync(scanDir)) continue;
  const files = walkDir(scanDir);

  for (const file of files) {
    if (isSkipped(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");

    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      // Skip import lines and comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) return;
      if (/console\.log\s*\(/.test(line)) {
        console.error(`  ❌ FAIL [console.log]  ${rel}:${lineNo}`);
        console.error(`       ${line.trim()}`);
        failCount++;
      } else if (/console\.error\s*\(/.test(line) || /console\.warn\s*\(/.test(line)) {
        console.warn(`  ⚠️  WARN [console.error/warn]  ${rel}:${lineNo}`);
        console.warn(`       ${line.trim()}`);
        warnCount++;
      }
    });
  }
}

console.log("");
console.log(`Sonuç: ${failCount} FAIL, ${warnCount} WARN`);

if (failCount > 0) {
  console.error("\n❌ console.log kullanımı tespit edildi — logger kullanın.");
  process.exit(1);
} else {
  console.log("\n✅ Console usage check geçti.");
  process.exit(0);
}
