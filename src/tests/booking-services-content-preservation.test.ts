import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { GET } from "@/app/api/booking/[slug]/services/route";

const mockDb = db as unknown as {
  organization: { findUnique: ReturnType<typeof vi.fn> };
  service: { findMany: ReturnType<typeof vi.fn> };
};

describe("booking services content preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns business-entered service fields unchanged", async () => {
    mockDb.organization.findUnique.mockResolvedValue({
      id: "org_1",
      bookingEnabled: true,
      suspended: false,
    });
    mockDb.service.findMany.mockResolvedValue([
      {
        id: "svc_1",
        name: "Sakal Tirasi",
        description: "Klasik duzeltme",
        durationMinutes: 30,
        priceCents: 25000,
        currency: "TRY",
        staffServices: [],
      },
    ]);

    const res = await GET(new Request("http://localhost/api/booking/demo/services"), {
      params: Promise.resolve({ slug: "demo" }),
    });
    const body = (await res.json()) as {
      data: Array<{ name: string; description: string | null }>;
    };

    expect(res.status).toBe(200);
    expect(body.data[0]?.name).toBe("Sakal Tirasi");
    expect(body.data[0]?.description).toBe("Klasik duzeltme");
  });
});
