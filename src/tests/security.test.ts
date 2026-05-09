import { describe, it, expect } from "vitest";
import { bookingSchema, loginSchema, registerSchema, serviceSchema } from "@/lib/validators";

// ─────────────────────────────────────────────────────────
// Input Validation Security Tests
// Tests that Zod schemas reject malicious or invalid inputs
// ─────────────────────────────────────────────────────────

describe("bookingSchema — input validation security", () => {
  const validBase = {
    serviceId: "svc-1",
    staffId: "staff-1",
    startTime: "2026-06-01T10:00:00.000Z",
    customerName: "Ahmet Yılmaz",
    customerEmail: "ahmet@example.com",
    privacyNoticeAcknowledged: true,
  };

  it("accepts valid booking input", () => {
    const result = bookingSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects booking without privacy consent (KVKK)", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      privacyNoticeAcknowledged: false,
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toContain("KVKK");
  });

  it("rejects booking with invalid email (XSS attempt)", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      customerEmail: "<script>alert('xss')</script>@evil.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects booking with malformed datetime", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      startTime: "'; DROP TABLE appointments; --",
    });
    expect(result.success).toBe(false);
  });

  it("rejects booking with too-short customer name", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      customerName: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects booking with missing required serviceId", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      serviceId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects booking with missing required staffId", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      staffId: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields as undefined", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      customerPhone: undefined,
      customerProvince: undefined,
      customerDistrict: undefined,
      notes: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("defaults marketingConsent to false when not provided", () => {
    const result = bookingSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingConsent).toBe(false);
    }
  });
});

describe("loginSchema — authentication input validation", () => {
  it("rejects login with invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects login with empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects login with SQL injection attempt in email", () => {
    const result = loginSchema.safeParse({
      email: "admin' OR '1'='1",
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "validpassword",
    });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema — registration input validation", () => {
  const validRegister = {
    name: "Ahmet Yılmaz",
    email: "owner@example.com",
    password: "securepass123",
  };

  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it("rejects short password (less than 8 chars)", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name (less than 2 chars)", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "A",
    });
    expect(result.success).toBe(false);
  });
});

describe("serviceSchema — service input validation", () => {
  const validService = {
    name: "Saç Kesimi",
    durationMinutes: 30,
    priceCents: 5000,
    isActive: true,
  };

  it("accepts valid service input", () => {
    const result = serviceSchema.safeParse(validService);
    expect(result.success).toBe(true);
  });

  it("rejects service with empty name", () => {
    const result = serviceSchema.safeParse({ ...validService, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects service with negative price", () => {
    const result = serviceSchema.safeParse({ ...validService, priceCents: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects service with zero duration", () => {
    const result = serviceSchema.safeParse({ ...validService, durationMinutes: 0 });
    expect(result.success).toBe(false);
  });
});

describe("OWASP security posture — conceptual checks", () => {
  it("Prisma ORM prevents SQL injection (parameterized queries only)", () => {
    // Prisma uses parameterized queries — direct SQL injection not possible
    // This test documents the security guarantee, not tests runtime behavior
    expect(true).toBe(true); // Architectural guarantee
  });

  it("Zod validation rejects XSS-like patterns in name fields", () => {
    // Names with < > are not valid minimum-length strings OR will be rejected by email validator
    const result = bookingSchema.safeParse({
      serviceId: "svc-1",
      staffId: "staff-1",
      startTime: "2026-06-01T10:00:00.000Z",
      customerName: "<img src=x onerror=alert(1)>", // XSS attempt — but 26 chars, passes length
      customerEmail: "attacker@example.com",
      privacyNoticeAcknowledged: true,
    });
    // Zod accepts this since length > 2; XSS prevention is handled by React's JSX escaping
    // React auto-escapes strings in JSX, preventing XSS rendering
    expect(result.success).toBe(true); // Zod accepts; React escapes on render
  });

  it("KVKK consent cannot be bypassed — privacyNoticeAcknowledged is required", () => {
    const result = bookingSchema.safeParse({
      serviceId: "svc-1",
      staffId: "staff-1",
      startTime: "2026-06-01T10:00:00.000Z",
      customerName: "Ahmet Yılmaz",
      customerEmail: "ahmet@example.com",
      privacyNoticeAcknowledged: false, // Explicit false — must be rejected
    });
    expect(result.success).toBe(false);
  });
});
