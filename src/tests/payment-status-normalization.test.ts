import { describe, expect, it } from "vitest";
import { normalizePaymentStatus } from "@/services/payment/payment-status";

describe("normalizePaymentStatus", () => {
  it("keeps canonical uppercase states", () => {
    expect(normalizePaymentStatus("PENDING")).toBe("PENDING");
    expect(normalizePaymentStatus("PAID")).toBe("PAID");
    expect(normalizePaymentStatus("MANUAL_REVIEW")).toBe("MANUAL_REVIEW");
  });

  it("maps legacy lowercase states", () => {
    expect(normalizePaymentStatus("pending")).toBe("PENDING");
    expect(normalizePaymentStatus("success")).toBe("PAID");
    expect(normalizePaymentStatus("failed")).toBe("FAILED");
  });

  it("maps requires-action variants", () => {
    expect(normalizePaymentStatus("requires_action")).toBe("REQUIRES_ACTION");
    expect(normalizePaymentStatus("requires-action")).toBe("REQUIRES_ACTION");
  });

  it("falls back to pending for unknown values", () => {
    expect(normalizePaymentStatus("something_new")).toBe("PENDING");
  });
});
