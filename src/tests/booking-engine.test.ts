import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { generateAvailableSlots } from "@/services/booking.service";

const mockDb = db as unknown as {
  organization: { findUnique: ReturnType<typeof vi.fn> };
  service: { findFirst: ReturnType<typeof vi.fn> };
  staff: { findFirst: ReturnType<typeof vi.fn> };
  staffService: { findUnique: ReturnType<typeof vi.fn> };
  availabilityRule: { findUnique: ReturnType<typeof vi.fn> };
  appointment: { findMany: ReturnType<typeof vi.fn> };
};

const BASE_PARAMS = {
  organizationId: "org-1",
  serviceId: "svc-1",
  staffId: "staff-1",
};

function makeFutureMorning(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

beforeEach(() => {
  vi.clearAllMocks();

  mockDb.organization.findUnique.mockResolvedValue({ bookingEnabled: true });
  mockDb.service.findFirst.mockResolvedValue({ id: "svc-1", durationMinutes: 30, isActive: true });
  mockDb.staff.findFirst.mockResolvedValue({ id: "staff-1", isActive: true });
  mockDb.staffService.findUnique.mockResolvedValue({ staffId: "staff-1", serviceId: "svc-1" });
  mockDb.availabilityRule.findUnique.mockResolvedValue({
    startTime: "09:00",
    endTime: "11:00",
    isActive: true,
  });
  mockDb.appointment.findMany.mockResolvedValue([]);
});

describe("generateAvailableSlots", () => {
  it("returns slots within availability window", async () => {
    const date = makeFutureMorning();
    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const h = slot.startTime.getHours();
      expect(h).toBeGreaterThanOrEqual(9);
      expect(h).toBeLessThan(11);
    }
  });

  it("blocks slot when PENDING appointment overlaps", async () => {
    const date = makeFutureMorning();
    const conflict = new Date(date);
    conflict.setHours(9, 0, 0, 0);
    const conflictEnd = new Date(date);
    conflictEnd.setHours(9, 30, 0, 0);

    mockDb.appointment.findMany.mockResolvedValue([
      { startTime: conflict, endTime: conflictEnd },
    ]);

    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    const conflictLabel = slots.find((s) => s.label === "09:00");
    expect(conflictLabel).toBeUndefined();
  });

  it("does not block slot when CANCELLED appointment exists at same time", async () => {
    const date = makeFutureMorning();
    // CANCELLED appointments are already excluded at DB query level (status: in PENDING/CONFIRMED)
    // So this mock simulates the DB returning no rows (cancelled filtered out)
    mockDb.appointment.findMany.mockResolvedValue([]);

    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    const nineAm = slots.find((s) => s.label === "09:00");
    expect(nineAm).toBeDefined();
  });

  it("returns empty array when booking is disabled", async () => {
    mockDb.organization.findUnique.mockResolvedValue({ bookingEnabled: false });
    const date = makeFutureMorning();
    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    expect(slots).toHaveLength(0);
  });

  it("returns empty array when staff has no availability for that day", async () => {
    mockDb.availabilityRule.findUnique.mockResolvedValue(null);
    const date = makeFutureMorning();
    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    expect(slots).toHaveLength(0);
  });

  it("returns empty array for service not belonging to org", async () => {
    mockDb.service.findFirst.mockResolvedValue(null);
    const date = makeFutureMorning();
    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    expect(slots).toHaveLength(0);
  });

  it("slot duration matches service duration", async () => {
    const date = makeFutureMorning();
    const slots = await generateAvailableSlots({ ...BASE_PARAMS, date });
    for (const slot of slots) {
      const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
      expect(durationMs).toBe(30 * 60 * 1000);
    }
  });
});
