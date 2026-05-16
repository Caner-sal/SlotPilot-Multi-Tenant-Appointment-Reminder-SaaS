import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const TARGET_DIRS = [
  path.join(process.cwd(), "src", "app", "dashboard"),
  path.join(process.cwd(), "src", "app", "admin"),
  path.join(process.cwd(), "src", "app", "staff"),
];

const FORBIDDEN = [/bg-white/, /text-gray-\d{2,3}/, /border-gray-\d{2,3}/];

function collectTsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsxFiles(fullPath, acc);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith(".tsx")) {
      acc.push(fullPath);
    }
  }
  return acc;
}

describe("dashboard/admin/staff theme class audit", () => {
  it("avoids hard-coded light-mode gray/white utility classes", () => {
    const violations: string[] = [];

    for (const root of TARGET_DIRS) {
      for (const file of collectTsxFiles(root)) {
        const content = fs.readFileSync(file, "utf8");
        for (const rule of FORBIDDEN) {
          if (rule.test(content)) {
            violations.push(`${path.relative(process.cwd(), file)} -> ${rule}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
