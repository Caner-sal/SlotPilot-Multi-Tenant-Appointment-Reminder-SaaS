import { describe, expect, it } from "vitest";
import { parseIsoDate } from "@/components/booking/BookingDatePicker";

describe("booking date picker helpers", () => {
  it("parses yyyy-mm-dd into local calendar date", () => {
    const value = parseIsoDate("2026-06-10");
    expect(value.getFullYear()).toBe(2026);
    expect(value.getMonth()).toBe(5);
    expect(value.getDate()).toBe(10);
  });
});
