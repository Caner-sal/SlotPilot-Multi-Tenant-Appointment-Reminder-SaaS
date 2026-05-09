import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    organization: { findUnique: vi.fn() },
    appointment: { findFirst: vi.fn(), update: vi.fn() },
    payment: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

// Mock stripe module
vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ id: "cs_test_123", url: "https://stripe.com/test" }) },
    },
    webhooks: { constructEvent: vi.fn() },
  })),
}));

import { db } from "@/lib/db";
import { POST as postCheckout } from "@/app/api/booking/[slug]/checkout-session/route";

const mockDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("Deposit payment — checkout session", () => {
  it("returns 403 for suspended business", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: true, name: "Test",
    });

    const req = new Request("http://localhost/api/booking/test/checkout-session", {
      method: "POST",
      body: JSON.stringify({ appointmentId: "apt1" }),
    });
    const res = await postCheckout(req, { params: Promise.resolve({ slug: "test" }) });
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown appointment", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: false, name: "Test",
    });
    (mockDb.appointment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/booking/test/checkout-session", {
      method: "POST",
      body: JSON.stringify({ appointmentId: "apt-missing" }),
    });
    const res = await postCheckout(req, { params: Promise.resolve({ slug: "test" }) });
    expect(res.status).toBe(404);
  });

  it("returns 400 when service has no deposit required", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: false, name: "Test",
    });
    (mockDb.appointment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "apt1",
      paymentStatus: "NOT_REQUIRED",
      service: { depositRequired: false, depositAmountCents: 0, name: "Saç Kesimi", currency: "TRY" },
      customer: { email: "c@test.com" },
    });

    const req = new Request("http://localhost/api/booking/test/checkout-session", {
      method: "POST",
      body: JSON.stringify({ appointmentId: "apt1" }),
    });
    const res = await postCheckout(req, { params: Promise.resolve({ slug: "test" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/(kapora gerekmiyor|No deposit)/i);
  });

  it("returns 400 when deposit already paid", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: false, name: "Test",
    });
    (mockDb.appointment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "apt1",
      paymentStatus: "PAID",
      service: { depositRequired: true, depositAmountCents: 5000, name: "Saç Kesimi", currency: "TRY" },
      customer: { email: "c@test.com" },
    });

    const req = new Request("http://localhost/api/booking/test/checkout-session", {
      method: "POST",
      body: JSON.stringify({ appointmentId: "apt1" }),
    });
    const res = await postCheckout(req, { params: Promise.resolve({ slug: "test" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/(zaten ödendi|already paid)/i);
  });

  it("returns mock session when Stripe key is placeholder", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: false, name: "Test",
    });
    (mockDb.appointment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "apt1",
      paymentStatus: "NOT_REQUIRED",
      service: { depositRequired: true, depositAmountCents: 5000, name: "Saç Kesimi", currency: "TRY" },
      customer: { email: "c@test.com" },
    });
    (mockDb.appointment.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    // Stripe key is the placeholder in test env
    const req = new Request("http://localhost/api/booking/test/checkout-session", {
      method: "POST",
      body: JSON.stringify({ appointmentId: "apt1" }),
    });
    const res = await postCheckout(req, { params: Promise.resolve({ slug: "test" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.mock).toBe(true);
  });
});
