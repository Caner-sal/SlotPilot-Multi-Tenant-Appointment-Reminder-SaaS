#!/usr/bin/env node

const { spawn } = require("node:child_process");
const fs = require("node:fs");
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

const passthroughArgs = process.argv.slice(2);

const isSpawnEperm = (errorOrText) => {
  const text =
    typeof errorOrText === "string"
      ? errorOrText
      : errorOrText?.stack ?? errorOrText?.message ?? String(errorOrText);
  return text.includes("spawn EPERM") || errorOrText?.code === "EPERM";
};

const runWithCapturedOutput = (args) =>
  new Promise((resolve) => {
    let sawSpawnEperm = false;
    let child;

    try {
      child = spawn(process.execPath, args, {
        stdio: ["inherit", "pipe", "pipe"],
        windowsHide: false,
      });
    } catch (error) {
      resolve({
        code: 1,
        signal: null,
        sawSpawnEperm: isSpawnEperm(error),
        error,
      });
      return;
    }

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      const message = chunk.toString();
      if (isSpawnEperm(message)) {
        sawSpawnEperm = true;
      }
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      resolve({
        code: 1,
        signal: null,
        sawSpawnEperm: sawSpawnEperm || isSpawnEperm(error),
        error,
      });
    });

    child.on("close", (code, signal) => {
      resolve({ code: code ?? 0, signal: signal ?? null, sawSpawnEperm });
    });
  });

const runForeground = (args) =>
  new Promise((resolve) => {
    let child;
    try {
      child = spawn(process.execPath, args, {
        stdio: "inherit",
        windowsHide: false,
      });
    } catch (error) {
      resolve({ code: 1, signal: null, error });
      return;
    }

    child.on("error", (error) => resolve({ code: 1, signal: null, error }));
    child.on("close", (code, signal) =>
      resolve({ code: code ?? 0, signal: signal ?? null }),
    );
  });

const printFallbackNotice = () => {
  console.error("");
  console.error("[dev-runner] Uyari: next dev asamasinda spawn EPERM algilandi.");
  console.error("[dev-runner] Otomatik fallback baslatiliyor: next start");
  console.error(
    "[dev-runner] Not: Bu fallback hot-reload saglamaz, ama uygulamayi ayaga kaldirir.",
  );
};

const hasProductionBuild = () => {
  const buildIdPath = path.resolve(__dirname, "..", ".next", "BUILD_ID");
  return fs.existsSync(buildIdPath);
};

const exitWithSignalOrCode = (result) => {
  if (result?.signal) {
    process.kill(process.pid, result.signal);
    return;
  }
  process.exit(result?.code ?? 1);
};

const main = async () => {
  const devArgs = [nextCliPath, "dev", ...passthroughArgs];
  const devResult = await runWithCapturedOutput(devArgs);

  if (devResult.signal || devResult.code === 0) {
    exitWithSignalOrCode(devResult);
    return;
  }

  if (!devResult.sawSpawnEperm && !isSpawnEperm(devResult.error)) {
    exitWithSignalOrCode(devResult);
    return;
  }

  printFallbackNotice();

  if (!hasProductionBuild()) {
    console.error(
      "[dev-runner] Uretim build'i bulunamadi (.next/BUILD_ID yok). Once 'npm run build' calistirin.",
    );
    process.exit(1);
    return;
  }

  const startResult = await runForeground([nextCliPath, "start", ...passthroughArgs]);
  exitWithSignalOrCode(startResult);
};

main().catch((error) => {
  const text = error?.stack ?? error?.message ?? String(error);
  process.stderr.write(`${text}\n`);
  process.exit(1);
});
