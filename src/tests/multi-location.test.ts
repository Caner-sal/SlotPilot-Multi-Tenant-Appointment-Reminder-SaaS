import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tenant", () => ({
  requireAuth: vi.fn(),
  TenantError: class TenantError extends Error {
    constructor(msg = "Unauthorized") { super(msg); this.name = "TenantError"; }
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    organization: { findUnique: vi.fn() },
    location: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { requireAuth, TenantError } from "@/lib/tenant";
import { db } from "@/lib/db";
import { GET as getLocations, POST as createLocation } from "@/app/api/locations/route";
import { PATCH as patchLocation, DELETE as deleteLocation } from "@/app/api/locations/[id]/route";
import { GET as getPublicLocations } from "@/app/api/booking/[slug]/locations/route";

const mockRequireAuth = vi.mocked(requireAuth);
const mockDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("Locations — tenant isolation", () => {
  it("returns 403 for unauthenticated user", async () => {
    mockRequireAuth.mockRejectedValueOnce(new TenantError("Unauthorized"));
    const res = await getLocations();
    expect(res.status).toBe(403);
  });

  it("returns locations for authenticated org", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    (mockDb.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "loc1", name: "Merkez Şube", organizationId: "org1", isDefault: true },
    ]);

    const res = await getLocations();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(mockDb.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org1" } })
    );
  });

  it("creates a location with correct org", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    (mockDb.location.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "loc2", name: "Branch 2", organizationId: "org1",
    });

    const req = new Request("http://localhost/api/locations", {
      method: "POST",
      body: JSON.stringify({ name: "Branch 2", timezone: "UTC" }),
    });
    const res = await createLocation(req);
    expect(res.status).toBe(201);
    expect(mockDb.location.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ organizationId: "org1" }) })
    );
  });

  it("cannot delete default location", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    (mockDb.location.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "loc1", isDefault: true, organizationId: "org1",
    });

    const req = new Request("http://localhost/api/locations/loc1", { method: "DELETE" });
    const res = await deleteLocation(req, { params: Promise.resolve({ id: "loc1" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("default");
  });

  it("returns 404 for location in another org", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    (mockDb.location.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/locations/loc-other", { method: "PATCH", body: JSON.stringify({ name: "X" }) });
    const res = await patchLocation(req, { params: Promise.resolve({ id: "loc-other" }) });
    expect(res.status).toBe(404);
  });
});

describe("Public booking — locations", () => {
  it("returns active locations for valid business", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: false,
    });
    (mockDb.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "loc1", name: "Merkez Şube", isDefault: true },
    ]);

    const req = new Request("http://localhost/api/booking/barber-demo/locations");
    const res = await getPublicLocations(req, { params: Promise.resolve({ slug: "barber-demo" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("returns 403 for suspended business", async () => {
    (mockDb.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "org1", bookingEnabled: true, suspended: true,
    });
    const req = new Request("http://localhost/api/booking/barber-demo/locations");
    const res = await getPublicLocations(req, { params: Promise.resolve({ slug: "barber-demo" }) });
    expect(res.status).toBe(403);
  });
});
