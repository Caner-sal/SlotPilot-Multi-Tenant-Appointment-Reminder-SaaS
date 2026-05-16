import { describe, expect, it, vi } from "vitest";
import {
  buildOrganizationNormalizedAddressData,
  syncOrganizationNormalizedAddress,
} from "@/services/address/organization-address-sync.service";

describe("organization address sync service", () => {
  it("builds deterministic normalized address payload", () => {
    const data = buildOrganizationNormalizedAddressData({
      organizationId: "org_1",
      countryCode: "it",
      province: "Lazio",
      city: "Rome",
      locality: "Roma",
      formattedAddress: "Rome, Italy",
      latitude: 41.9,
      longitude: 12.49,
      locale: "it",
    });

    expect(data.ownerType).toBe("ORGANIZATION");
    expect(data.ownerId).toBe("org_1");
    expect(data.countryCode).toBe("IT");
    expect(data.provider).toBe("manual");
    expect(data.providerPlaceId).toBe("organization:org_1");
    expect(data.formattedAddress).toBe("Rome, Italy");
  });

  it("replaces existing organization normalized address rows", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const create = vi.fn().mockResolvedValue({ id: "na_1" });

    await syncOrganizationNormalizedAddress(
      {
        normalizedAddress: { deleteMany, create },
      },
      {
        organizationId: "org_2",
        countryCode: "TR",
        province: "Istanbul",
        city: "Istanbul",
        formattedAddress: "Istanbul, Turkey",
      },
    );

    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        ownerType: "ORGANIZATION",
        ownerId: "org_2",
      },
    });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
