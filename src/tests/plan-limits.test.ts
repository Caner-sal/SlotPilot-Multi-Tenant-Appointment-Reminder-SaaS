import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { canCreateStaff, canCreateAppointment, getPlanLimits } from "@/lib/billing";
import { SubscriptionPlan } from "@prisma/client";

const mockDb = db as unknown as {
  subscription: { findUnique: ReturnType<typeof vi.fn> };
  staff: { count: ReturnType<typeof vi.fn> };
  appointment: { count: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPlanLimits", () => {
  it("returns correct limits for FREE plan", () => {
    const limits = getPlanLimits(SubscriptionPlan.FREE);
    expect(limits.maxStaff).toBe(1);
    expect(limits.maxAppointmentsPerMonth).toBe(20);
    expect(limits.emailReminders).toBe(false);
  });

  it("returns correct limits for STARTER plan", () => {
    const limits = getPlanLimits(SubscriptionPlan.STARTER);
    expect(limits.maxStaff).toBe(3);
    expect(limits.maxAppointmentsPerMonth).toBe(300);
    expect(limits.emailReminders).toBe(true);
  });

  it("returns correct limits for PRO plan", () => {
    const limits = getPlanLimits(SubscriptionPlan.PRO);
    expect(limits.maxStaff).toBe(Infinity);
    expect(limits.maxAppointmentsPerMonth).toBe(2000);
    expect(limits.emailReminders).toBe(true);
  });
});

describe("canCreateStaff", () => {
  it("blocks FREE plan when already at 1 staff", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "FREE" });
    mockDb.staff.count.mockResolvedValue(1);

    const result = await canCreateStaff("org-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("FREE");
  });

  it("allows FREE plan when at 0 staff", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "FREE" });
    mockDb.staff.count.mockResolvedValue(0);

    const result = await canCreateStaff("org-1");
    expect(result.allowed).toBe(true);
  });

  it("blocks STARTER plan when already at 3 staff", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "STARTER" });
    mockDb.staff.count.mockResolvedValue(3);

    const result = await canCreateStaff("org-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("STARTER");
  });

  it("PRO plan always allows staff creation", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "PRO" });

    const result = await canCreateStaff("org-1");
    expect(result.allowed).toBe(true);
  });
});

describe("canCreateAppointment", () => {
  it("blocks FREE plan at 20 appointments this month", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "FREE" });
    mockDb.appointment.count.mockResolvedValue(20);

    const result = await canCreateAppointment("org-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("20");
  });

  it("allows FREE plan at 19 appointments", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "FREE" });
    mockDb.appointment.count.mockResolvedValue(19);

    const result = await canCreateAppointment("org-1");
    expect(result.allowed).toBe(true);
  });

  it("PRO plan always allows appointment creation", async () => {
    mockDb.subscription.findUnique.mockResolvedValue({ plan: "PRO" });

    const result = await canCreateAppointment("org-1");
    expect(result.allowed).toBe(true);
  });

  it("defaults to FREE plan when no subscription record", async () => {
    mockDb.subscription.findUnique.mockResolvedValue(null);
    mockDb.appointment.count.mockResolvedValue(20);

    const result = await canCreateAppointment("org-1");
    expect(result.allowed).toBe(false);
  });
});
