#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

const nextCliPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const nextArgs = [nextCliPath, "dev", ...process.argv.slice(2)];

let sawSpawnEperm = false;
let guidancePrinted = false;

const printSpawnEpermGuidance = () => {
  if (guidancePrinted) {
    return;
  }

  guidancePrinted = true;
  console.error("");
  console.error("[dev-runner] Hata: spawn EPERM algilandi.");
  console.error(
    "[dev-runner] Bu genellikle sandbox/izin kisitlarindan kaynaklanir; uygulama kodu hatasi olmayabilir.",
  );
  console.error(
    "[dev-runner] Kod sagligini dogrulamak icin su komutlari calistirin: npm run build && npm run start",
  );
  console.error(
    "[dev-runner] Gerekirse sandbox disi normal bir terminalde npm run dev komutunu deneyin.",
  );
};

let child;
try {
  child = spawn(process.execPath, nextArgs, {
    stdio: ["inherit", "pipe", "pipe"],
    windowsHide: false,
  });
} catch (error) {
  const text = error?.stack ?? error?.message ?? String(error);
  if (error?.code === "EPERM" || text.includes("spawn EPERM")) {
    printSpawnEpermGuidance();
    process.exit(1);
  }

  process.stderr.write(`${text}\n`);
  process.exit(1);
}

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
});

child.stderr.on("data", (chunk) => {
  const message = chunk.toString();
  if (message.includes("spawn EPERM")) {
    sawSpawnEperm = true;
  }
  process.stderr.write(chunk);
});

child.on("error", (error) => {
  const text = error?.stack ?? error?.message ?? String(error);
  if (error?.code === "EPERM" || text.includes("spawn EPERM")) {
    sawSpawnEperm = true;
    printSpawnEpermGuidance();
    process.exit(1);
  }

  process.stderr.write(`${text}\n`);
  process.exit(1);
});

child.on("close", (code, signal) => {
  if (sawSpawnEperm) {
    printSpawnEpermGuidance();
    process.exit(1);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
