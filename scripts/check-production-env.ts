import * as fs from "fs";
import * as path from "path";

// Load .env if present (dev usage)
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const REQUIRED_VARS = ["AUTH_SECRET", "DATABASE_URL", "NEXTAUTH_URL"];
const RECOMMENDED_VARS = ["MOBILE_JWT_SECRET", "NEXT_PUBLIC_APP_URL", "CRON_SECRET"];

let failed = false;

console.log("🔍 Production env check başlatılıyor...\n");

for (const v of REQUIRED_VARS) {
  if (!process.env[v]) {
    console.error(`  ❌ FAIL: ${v} eksik (zorunlu)`);
    failed = true;
  } else {
    console.log(`  ✅ OK:   ${v}`);
  }
}

for (const v of RECOMMENDED_VARS) {
  if (!process.env[v]) {
    console.warn(`  ⚠️  WARN: ${v} eksik (önerilen)`);
  } else {
    console.log(`  ✅ OK:   ${v}`);
  }
}

console.log("");
if (failed) {
  console.error("❌ Env check BAŞARISIZ — zorunlu değişkenler eksik.");
  process.exit(1);
} else {
  console.log("✅ Env check geçti.");
  process.exit(0);
}
