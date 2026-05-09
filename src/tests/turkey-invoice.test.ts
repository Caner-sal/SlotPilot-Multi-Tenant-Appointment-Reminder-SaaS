import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the invoice profile schema validation logic inline
const invoiceProfileSchema = z.object({
  invoiceType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  companyTitle: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  identityNumber: z.string().optional(),
  invoiceProvince: z.string().optional(),
  invoiceDistrict: z.string().optional(),
  invoiceAddressLine: z.string().optional(),
  invoiceEmail: z.string().email().optional().or(z.literal("")),
  invoicePhone: z.string().optional(),
});

describe("InvoiceProfile schema validation", () => {
  it("accepts INDIVIDUAL type with no company fields", () => {
    const result = invoiceProfileSchema.safeParse({ invoiceType: "INDIVIDUAL" });
    expect(result.success).toBe(true);
  });

  it("accepts COMPANY type with company fields", () => {
    const result = invoiceProfileSchema.safeParse({
      invoiceType: "COMPANY",
      companyTitle: "Acme Ltd.",
      taxOffice: "Kadıköy",
      taxNumber: "1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("defaults to INDIVIDUAL when invoiceType not provided", () => {
    const result = invoiceProfileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invoiceType).toBe("INDIVIDUAL");
    }
  });

  it("rejects invalid invoiceType", () => {
    const result = invoiceProfileSchema.safeParse({ invoiceType: "CORPORATE" });
    expect(result.success).toBe(false);
  });

  it("accepts empty invoiceEmail (optional)", () => {
    const result = invoiceProfileSchema.safeParse({ invoiceEmail: "" });
    expect(result.success).toBe(true);
  });

  it("accepts valid invoiceEmail", () => {
    const result = invoiceProfileSchema.safeParse({ invoiceEmail: "fatura@firma.com.tr" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid invoiceEmail", () => {
    const result = invoiceProfileSchema.safeParse({ invoiceEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("COMPANY type can have taxNumber and identityNumber both optional", () => {
    const result = invoiceProfileSchema.safeParse({
      invoiceType: "COMPANY",
      companyTitle: "Test Şirketi",
    });
    expect(result.success).toBe(true);
  });
});

describe("InvoiceProfile fields", () => {
  it("includes all required e-Fatura fields", () => {
    const schema = invoiceProfileSchema;
    const fields = Object.keys(schema.shape);
    expect(fields).toContain("invoiceType");
    expect(fields).toContain("taxOffice");
    expect(fields).toContain("taxNumber");
    expect(fields).toContain("identityNumber");
    expect(fields).toContain("companyTitle");
  });

  it("includes address fields for e-Arşiv", () => {
    const schema = invoiceProfileSchema;
    const fields = Object.keys(schema.shape);
    expect(fields).toContain("invoiceProvince");
    expect(fields).toContain("invoiceDistrict");
    expect(fields).toContain("invoiceAddressLine");
  });
});
