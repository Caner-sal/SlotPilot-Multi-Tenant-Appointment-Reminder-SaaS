import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/marketplace/route";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findMany: vi.fn(),
    },
    normalizedAddress: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockOrgFindMany = vi.mocked(db.organization.findMany);
const mockNormalizedAddressFindMany = vi.mocked(db.normalizedAddress.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

const buildOrg = (overrides = {}) => ({
  id: "org1",
  name: "Berber Demo",
  slug: "demo-barber",
  description: "Demo business",
  category: "salon",
  city: "Istanbul",
  province: "istanbul",
  coverImageUrl: null,
  logoUrl: null,
  _count: { services: 3 },
  ...overrides,
});

describe("Marketplace API", () => {
  it("returns organizations with baseline marketplace guards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOrgFindMany.mockResolvedValue([buildOrg()] as any);

    const req = new Request("http://localhost/api/marketplace");
    const res = await GET(req);
    const json = (await res.json()) as { data: unknown[] };

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          marketplaceEnabled: true,
          bookingEnabled: true,
          suspended: false,
        }),
      }),
    );
  });

  it("applies province filter only when country is TR", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?country=TR&province=ankara");
    await GET(req);

    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ province: "ankara" }),
      }),
    );
  });

  it("ignores province for non-TR countries and uses locality search ids", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org_it_1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request(
      "http://localhost/api/marketplace?country=IT&locality=Roma&province=ankara",
    );
    await GET(req);

    expect(mockNormalizedAddressFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerType: "ORGANIZATION",
          countryCode: "IT",
        }),
      }),
    );
    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ province: "ankara" }),
      }),
    );
  });

  it("returns empty list when country/locality filter has no normalized address matches", async () => {
    mockNormalizedAddressFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?country=IT&locality=Roma");
    const res = await GET(req);
    const json = (await res.json()) as { data: unknown[] };

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(mockOrgFindMany).not.toHaveBeenCalled();
  });

  it("accepts countryCode as backward-compatible alias for country", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org_us_1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?countryCode=US");
    await GET(req);

    expect(mockNormalizedAddressFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ countryCode: "US" }),
      }),
    );
  });
});
