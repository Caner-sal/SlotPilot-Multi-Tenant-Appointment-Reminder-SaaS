import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/marketplace/route";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockFindMany = vi.mocked(db.organization.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

const buildOrg = (overrides = {}) => ({
  id: "org1",
  name: "Demo Barber",
  slug: "demo-barber",
  description: "A great barber",
  category: "salon",
  city: "Istanbul",
  coverImageUrl: null,
  logoUrl: null,
  _count: { services: 3 },
  ...overrides,
});

describe("Marketplace API", () => {
  it("returns organizations with marketplaceEnabled", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindMany.mockResolvedValue([buildOrg()] as any);

    const req = new Request("http://localhost/api/marketplace");
    const res = await GET(req);
    const json = await res.json() as { data: unknown[] };

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toMatchObject({ name: "Demo Barber", slug: "demo-barber" });
  });

  it("returns empty array when no businesses match", async () => {
    mockFindMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/marketplace?city=Ankara");
    const res = await GET(req);
    const json = await res.json() as { data: unknown[] };

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(0);
  });

  it("passes category filter to db query", async () => {
    mockFindMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/marketplace?category=salon");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: { contains: "salon" } }),
      })
    );
  });

  it("passes province filter to db query", async () => {
    mockFindMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/marketplace?province=istanbul");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ province: "istanbul" }),
      })
    );
  });

  it("always filters by marketplaceEnabled=true, bookingEnabled=true, suspended=false", async () => {
    mockFindMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/marketplace");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          marketplaceEnabled: true,
          bookingEnabled: true,
          suspended: false,
        }),
      })
    );
  });
});
