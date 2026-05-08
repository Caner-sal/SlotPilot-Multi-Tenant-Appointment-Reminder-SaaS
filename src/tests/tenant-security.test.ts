import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";

vi.mock("next-auth", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { assertMembership, requireOrganization, getOrganizationForUser, TenantError } from "@/lib/tenant";

const mockDb = db as unknown as {
  organizationMember: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("assertMembership", () => {
  it("throws TenantError when user is not a member", async () => {
    mockDb.organizationMember.findUnique.mockResolvedValue(null);

    await expect(assertMembership("user-A", "org-B")).rejects.toThrow(TenantError);
    await expect(assertMembership("user-A", "org-B")).rejects.toThrow("Access denied");
  });

  it("returns membership when user is a valid member", async () => {
    mockDb.organizationMember.findUnique.mockResolvedValue({
      id: "m1",
      userId: "user-A",
      organizationId: "org-A",
      role: "OWNER",
    });

    const membership = await assertMembership("user-A", "org-A");
    expect(membership.role).toBe("OWNER");
  });

  it("throws TenantError when user has insufficient role", async () => {
    mockDb.organizationMember.findUnique.mockResolvedValue({
      id: "m1",
      userId: "user-A",
      organizationId: "org-A",
      role: "STAFF",
    });

    await expect(assertMembership("user-A", "org-A", ["OWNER"])).rejects.toThrow(TenantError);
    await expect(assertMembership("user-A", "org-A", ["OWNER"])).rejects.toThrow("insufficient role");
  });
});

describe("getOrganizationForUser", () => {
  it("returns null when user has no organization", async () => {
    mockDb.organizationMember.findFirst.mockResolvedValue(null);

    const org = await getOrganizationForUser("user-no-org");
    expect(org).toBeNull();
  });

  it("returns organization when user has one", async () => {
    mockDb.organizationMember.findFirst.mockResolvedValue({
      organization: { id: "org-A", name: "Org A", slug: "org-a" },
    });

    const org = await getOrganizationForUser("user-A");
    expect(org?.id).toBe("org-A");
  });
});

describe("requireOrganization", () => {
  it("throws TenantError when user has no organization", async () => {
    mockDb.organizationMember.findFirst.mockResolvedValue(null);

    await expect(requireOrganization("user-no-org")).rejects.toThrow(TenantError);
    await expect(requireOrganization("user-no-org")).rejects.toThrow("No organization found");
  });
});

describe("Tenant data isolation (conceptual)", () => {
  it("user A cannot see org B data (assertMembership blocks)", async () => {
    mockDb.organizationMember.findUnique.mockResolvedValue(null);

    let accessGranted = false;
    try {
      await assertMembership("user-A", "org-B");
      accessGranted = true;
    } catch {
      accessGranted = false;
    }

    expect(accessGranted).toBe(false);
  });
});
