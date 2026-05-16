import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { GET } from "@/app/api/booking/[slug]/slots/route";
import { generateAvailableSlots } from "@/services/booking.service";

vi.mock("@/services/booking.service", () => ({
  generateAvailableSlots: vi.fn(),
}));

const mockDb = db as unknown as {
  organization: { findUnique: ReturnType<typeof vi.fn> };
};

const mockGenerateAvailableSlots = generateAvailableSlots as unknown as ReturnType<
  typeof vi.fn
>;

describe("GET /api/booking/[slug]/slots date parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.organization.findUnique.mockResolvedValue({
      id: "org_1",
      bookingEnabled: true,
      suspended: false,
    });
    mockGenerateAvailableSlots.mockResolvedValue([]);
  });

  it("accepts YYYY-MM-DD and returns slot payload", async () => {
    const req = new Request(
      "http://localhost/api/booking/barber-demo/slots?serviceId=svc_1&staffId=stf_1&date=2026-06-10"
    );

    const res = await GET(req, { params: Promise.resolve({ slug: "barber-demo" }) });
    const body = (await res.json()) as { data: unknown[]; meta: { date: string; isUnavailableDay: boolean } };

    expect(res.status).toBe(200);
    expect(body.meta.date).toBe("2026-06-10");
    expect(body.meta.isUnavailableDay).toBe(true);
    expect(mockGenerateAvailableSlots).toHaveBeenCalledTimes(1);
    const payload = mockGenerateAvailableSlots.mock.calls[0][0] as { date: Date };
    expect(payload.date.getFullYear()).toBe(2026);
    expect(payload.date.getMonth()).toBe(5);
    expect(payload.date.getDate()).toBe(10);
    expect(payload.date.getHours()).toBe(0);
  });

  it("keeps backward compatibility with ISO datetime values", async () => {
    const req = new Request(
      "http://localhost/api/booking/barber-demo/slots?serviceId=svc_1&staffId=stf_1&date=2026-06-10T14:45:00.000Z"
    );

    const res = await GET(req, { params: Promise.resolve({ slug: "barber-demo" }) });

    expect(res.status).toBe(200);
    expect(mockGenerateAvailableSlots).toHaveBeenCalledTimes(1);
    const payload = mockGenerateAvailableSlots.mock.calls[0][0] as { date: Date };
    expect(payload.date.getHours()).toBe(0);
    expect(payload.date.getMinutes()).toBe(0);
  });

  it("rejects invalid dates", async () => {
    const req = new Request(
      "http://localhost/api/booking/barber-demo/slots?serviceId=svc_1&staffId=stf_1&date=not-a-date"
    );

    const res = await GET(req, { params: Promise.resolve({ slug: "barber-demo" }) });

    expect(res.status).toBe(400);
    expect(mockGenerateAvailableSlots).not.toHaveBeenCalled();
  });
});
