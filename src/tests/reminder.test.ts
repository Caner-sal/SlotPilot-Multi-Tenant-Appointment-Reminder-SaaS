import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { scheduleReminder, processPendingReminders } from "@/services/reminder.service";

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, mode: "fake" }),
  buildReminderEmail: vi.fn().mockReturnValue({
    subject: "Reminder",
    html: "<p>Reminder</p>",
  }),
}));

vi.mock("@/lib/billing", () => ({
  canUseEmailReminders: vi.fn().mockResolvedValue(true),
}));

const mockDb = db as unknown as {
  reminder: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.reminder.create.mockResolvedValue({ id: "rem-1" });
  mockDb.reminder.update.mockResolvedValue({ id: "rem-1", status: "SENT" });
});

describe("scheduleReminder", () => {
  it("creates a reminder 24h before appointment", async () => {
    const startTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await scheduleReminder("appt-1", "org-1", startTime);

    expect(mockDb.reminder.create).toHaveBeenCalledOnce();
    const callArg = mockDb.reminder.create.mock.calls[0][0];
    expect(callArg.data.appointmentId).toBe("appt-1");
    expect(callArg.data.organizationId).toBe("org-1");
    expect(callArg.data.status).toBe("PENDING");

    const expectedScheduledAt = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    expect(callArg.data.scheduledAt.getTime()).toBe(expectedScheduledAt.getTime());
  });

  it("creates reminder with EMAIL type by default", async () => {
    const startTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await scheduleReminder("appt-1", "org-1", startTime);

    const callArg = mockDb.reminder.create.mock.calls[0][0];
    expect(callArg.data.type).toBe("EMAIL");
  });
});

describe("processPendingReminders", () => {
  it("marks sent reminders as SENT", async () => {
    mockDb.reminder.findMany.mockResolvedValue([
      {
        id: "rem-1",
        appointment: {
          organizationId: "org-1",
          customer: { fullName: "Test User", email: "test@example.com" },
          service: { name: "Haircut" },
          staff: { name: "Ali" },
          organization: { name: "Demo Barber", slug: "demo-barber" },
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    ]);

    const stats = await processPendingReminders();
    expect(stats.processed).toBe(1);
    expect(stats.sent).toBe(1);
    expect(stats.failed).toBe(0);
  });

  it("marks reminder as FAILED when customer has no email", async () => {
    mockDb.reminder.findMany.mockResolvedValue([
      {
        id: "rem-2",
        appointment: {
          organizationId: "org-1",
          customer: { fullName: "No Email", email: null },
          service: { name: "Haircut" },
          staff: { name: "Ali" },
          organization: { name: "Demo Barber", slug: "demo-barber" },
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    ]);

    const stats = await processPendingReminders();
    expect(stats.failed).toBe(1);
    expect(stats.sent).toBe(0);
  });

  it("returns zero counts when no pending reminders", async () => {
    mockDb.reminder.findMany.mockResolvedValue([]);

    const stats = await processPendingReminders();
    expect(stats.processed).toBe(0);
    expect(stats.sent).toBe(0);
    expect(stats.failed).toBe(0);
  });
});
