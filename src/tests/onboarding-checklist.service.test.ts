import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    organization: { count: vi.fn() },
    service: { count: vi.fn() },
    appointment: { count: vi.fn() },
    productEvent: { findMany: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { getOnboardingChecklistSnapshot } from "@/services/onboarding-checklist.service";

const mockDb = db as unknown as {
  organization: { count: ReturnType<typeof vi.fn> };
  service: { count: ReturnType<typeof vi.fn> };
  appointment: { count: ReturnType<typeof vi.fn> };
  productEvent: { findMany: ReturnType<typeof vi.fn> };
};

describe("onboarding checklist snapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty progress for an unknown organization", async () => {
    mockDb.organization.count.mockResolvedValueOnce(0);
    mockDb.service.count.mockResolvedValueOnce(0);
    mockDb.appointment.count.mockResolvedValueOnce(0);
    mockDb.productEvent.findMany.mockResolvedValueOnce([]);

    const snapshot = await getOnboardingChecklistSnapshot("org_unknown");
    expect(snapshot.completedCount).toBe(0);
    expect(snapshot.totalCount).toBe(4);
    expect(snapshot.progressPercent).toBe(0);
    expect(snapshot.items.every((item) => item.completed === false)).toBe(true);
  });

  it("returns service-only state deterministically", async () => {
    mockDb.organization.count.mockResolvedValueOnce(1);
    mockDb.service.count.mockResolvedValueOnce(1);
    mockDb.appointment.count.mockResolvedValueOnce(0);
    mockDb.productEvent.findMany.mockResolvedValueOnce([]);

    const snapshot = await getOnboardingChecklistSnapshot("org_service");
    expect(snapshot.completedCount).toBe(2);
    expect(snapshot.progressPercent).toBe(50);
    expect(snapshot.items).toMatchObject([
      { key: "organization_created", completed: true },
      { key: "service_created", completed: true },
      { key: "first_booking_created", completed: false },
      { key: "plan_upgrade_clicked", completed: false },
    ]);
  });

  it("marks first booking completed when appointment exists", async () => {
    mockDb.organization.count.mockResolvedValueOnce(1);
    mockDb.service.count.mockResolvedValueOnce(1);
    mockDb.appointment.count.mockResolvedValueOnce(1);
    mockDb.productEvent.findMany.mockResolvedValueOnce([]);

    const snapshot = await getOnboardingChecklistSnapshot("org_first_booking");
    expect(snapshot.completedCount).toBe(3);
    expect(snapshot.progressPercent).toBe(75);
    expect(
      snapshot.items.find((item) => item.key === "first_booking_created")?.completed
    ).toBe(true);
  });

  it("marks final step complete when plan upgrade click event exists", async () => {
    mockDb.organization.count.mockResolvedValueOnce(1);
    mockDb.service.count.mockResolvedValueOnce(1);
    mockDb.appointment.count.mockResolvedValueOnce(1);
    mockDb.productEvent.findMany.mockResolvedValueOnce([
      { eventName: "plan_upgrade_clicked" },
    ]);

    const snapshot = await getOnboardingChecklistSnapshot("org_plan_clicked");
    expect(snapshot.completedCount).toBe(4);
    expect(snapshot.progressPercent).toBe(100);
    expect(
      snapshot.items.find((item) => item.key === "plan_upgrade_clicked")?.completed
    ).toBe(true);
  });
});
