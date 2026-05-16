import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function read(relPath: string) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("booking accessibility and theme audit", () => {
  it("keeps booking surfaces on tokenized classes and a11y markers", () => {
    const bookingPage = read("src/app/booking/[slug]/page.tsx");
    const calendar = read("src/components/ui/calendar.tsx");
    const datePicker = read("src/components/booking/BookingDatePicker.tsx");

    expect(bookingPage).toContain('aria-live="polite"');
    expect(bookingPage).toContain('aria-live="assertive"');
    expect(calendar).toContain("focus-visible:ring-2");
    expect(datePicker).toContain("modifiersClassNames");

    const forbidden = /(bg-white|text-gray-[0-9]{2,3}|border-gray-[0-9]{2,3})/;
    expect(forbidden.test(bookingPage)).toBe(false);
    expect(forbidden.test(calendar)).toBe(false);
    expect(forbidden.test(datePicker)).toBe(false);
  });
});
