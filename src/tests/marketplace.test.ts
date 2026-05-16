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
  countryCode: "TR",
  locality: "Istanbul",
  formattedAddress: "Istanbul, Turkey",
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
        where: expect.objectContaining({
          AND: expect.arrayContaining([expect.objectContaining({ province: "ankara" })]),
        }),
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

  it("falls back to organization geo fields when normalized address matches are missing", async () => {
    mockNormalizedAddressFindMany.mockResolvedValueOnce([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOrgFindMany.mockResolvedValueOnce([buildOrg({ countryCode: "IT", city: "Roma", locality: "Roma" })] as any);

    const req = new Request("http://localhost/api/marketplace?country=IT&locality=Roma");
    const res = await GET(req);
    const json = (await res.json()) as { data: unknown[] };

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          countryCode: "IT",
        }),
      }),
    );
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

  it("accepts canonical category slug and resolves localized aliases", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOrgFindMany.mockResolvedValueOnce([] as any);
    const req = new Request("http://localhost/api/marketplace?category=hair-salon");
    await GET(req);

    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  category: expect.objectContaining({ contains: "Kuafor" }),
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });
});

// ─── TR-only copy: marketplace API market-aware filtering ───────────────────

describe("Marketplace API — TR market assertions", () => {
  it("TR country query includes countryCode filter in organization lookup", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org_tr_1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?country=TR");
    await GET(req);

    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          countryCode: "TR",
        }),
      }),
    );
  });

  it("non-TR country query includes its own countryCode filter (not TR)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org_de_1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?country=DE");
    await GET(req);

    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          countryCode: "DE",
        }),
      }),
    );
    expect(mockOrgFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ countryCode: "TR" }),
      }),
    );
  });

  it("TR + province applies province filter; non-TR + province does not", async () => {
    // Non-TR with same province param — province must NOT appear as a direct filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org_fr_1" }] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?country=FR&province=ankara");
    await GET(req);

    const callArgs = mockOrgFindMany.mock.calls[0]?.[0] as { where?: Record<string, unknown> } | undefined;
    const where = callArgs?.where ?? {};
    // province filter must NOT be a top-level key for non-TR
    expect(where).not.toHaveProperty("province");
  });

  it("query parameter q filters by business name across all markets", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([] as any);
    mockOrgFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/marketplace?q=testbiz");
    await GET(req);

    expect(mockOrgFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ name: { contains: "testbiz" } }),
          ]),
        }),
      }),
    );
  });

  it("TR market result set includes province field in org data", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockNormalizedAddressFindMany.mockResolvedValueOnce([{ ownerId: "org1" }] as any);
    const trOrg = {
      id: "org1",
      name: "İstanbul Berber",
      slug: "istanbul-berber",
      description: null,
      category: "Kuafor",
      city: "İstanbul",
      province: "istanbul",
      coverImageUrl: null,
      logoUrl: null,
      phone: null,
      _count: { services: 2 },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockOrgFindMany.mockResolvedValueOnce([trOrg] as any);

    const req = new Request("http://localhost/api/marketplace?country=TR");
    const res = await GET(req);
    const json = (await res.json()) as { data: Array<{ province?: string }> };

    expect(json.data[0]).toHaveProperty("province", "istanbul");
  });
});
