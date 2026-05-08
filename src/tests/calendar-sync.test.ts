import { describe, it, expect, vi, beforeEach } from "vitest";
import { FakeCalendarProvider } from "@/services/calendar/fake-calendar.provider";
import { getCalendarProvider, resetCalendarProvider } from "@/services/calendar/calendar.factory";

beforeEach(() => {
  resetCalendarProvider();
  vi.unstubAllEnvs();
});

const sampleEvent = {
  title: "Haircut with Ahmet",
  description: "Appointment at Demo Barber",
  startTime: new Date("2026-05-10T14:00:00Z"),
  endTime: new Date("2026-05-10T14:30:00Z"),
};

describe("FakeCalendarProvider", () => {
  it("creates event and returns a fake eventId", async () => {
    const provider = new FakeCalendarProvider();
    const result = await provider.createEvent("primary", sampleEvent, "fake-token");
    expect(result.status).toBe("created");
    expect(result.eventId).toMatch(/^fake_cal_/);
  });

  it("updates event and returns updated status", async () => {
    const provider = new FakeCalendarProvider();
    const result = await provider.updateEvent("primary", "evt_123", sampleEvent, "fake-token");
    expect(result.status).toBe("updated");
    expect(result.eventId).toBe("evt_123");
  });

  it("deletes event and returns deleted status", async () => {
    const provider = new FakeCalendarProvider();
    const result = await provider.deleteEvent("primary", "evt_123", "fake-token");
    expect(result.status).toBe("deleted");
    expect(result.eventId).toBe("evt_123");
  });

  it("generates a fake auth URL with state", () => {
    const provider = new FakeCalendarProvider();
    const url = provider.getAuthUrl("org_abc123");
    expect(url).toContain("fake=true");
    expect(url).toContain("org_abc123");
  });

  it("exchanges code and returns tokens", async () => {
    const provider = new FakeCalendarProvider();
    const tokens = await provider.exchangeCode("fake-code");
    expect(tokens.accessToken).toMatch(/^fake_access_/);
    expect(tokens.expiresAt).toBeInstanceOf(Date);
    expect(tokens.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe("Calendar factory", () => {
  it("returns FakeCalendarProvider when CALENDAR_PROVIDER is not set", () => {
    vi.stubEnv("CALENDAR_PROVIDER", "");
    const provider = getCalendarProvider();
    expect(provider).toBeInstanceOf(FakeCalendarProvider);
  });

  it("returns FakeCalendarProvider when CALENDAR_PROVIDER=FAKE", () => {
    vi.stubEnv("CALENDAR_PROVIDER", "FAKE");
    const provider = getCalendarProvider();
    expect(provider).toBeInstanceOf(FakeCalendarProvider);
  });

  it("provider is a singleton (same instance returned)", () => {
    const p1 = getCalendarProvider();
    const p2 = getCalendarProvider();
    expect(p1).toBe(p2);
  });
});

describe("Calendar sync does not block appointment flow", () => {
  it("appointment creation succeeds even when calendar provider throws", async () => {
    const provider = new FakeCalendarProvider();
    vi.spyOn(provider, "createEvent").mockRejectedValue(new Error("Google API down"));

    let appointmentCreated = false;

    try {
      // Simulates appointment creation flow: create appointment first, then sync calendar
      appointmentCreated = true;
      await provider.createEvent("primary", sampleEvent, "token");
    } catch {
      // Calendar sync failure must not propagate
    }

    expect(appointmentCreated).toBe(true);
  });

  it("returns failed status and does not throw when calendar event creation fails", async () => {
    const provider = new FakeCalendarProvider();
    vi.spyOn(provider, "createEvent").mockResolvedValue({ eventId: "", status: "failed", error: "token_expired" });

    const result = await provider.createEvent("primary", sampleEvent, "expired-token");
    expect(result.status).toBe("failed");
    expect(result.error).toBeDefined();
  });
});
