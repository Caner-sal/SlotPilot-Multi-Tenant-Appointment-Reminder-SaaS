import { Prisma } from "@prisma/client";

interface OrganizationAddressSyncInput {
  organizationId: string;
  countryCode?: string | null;
  province?: string | null;
  city?: string | null;
  locality?: string | null;
  postalCode?: string | null;
  formattedAddress?: string | null;
  fallbackAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locale?: string | null;
}

export function buildOrganizationNormalizedAddressData(input: OrganizationAddressSyncInput): Prisma.NormalizedAddressUncheckedCreateInput {
  const resolvedCountryCode = (input.countryCode ?? "TR").toUpperCase();
  const resolvedLocality = input.locality ?? input.city ?? null;
  const fallbackComposedAddress = [resolvedLocality, input.province].filter(Boolean).join(", ");
  const resolvedFormattedAddress =
    input.formattedAddress ??
    input.fallbackAddress ??
    (fallbackComposedAddress.length > 0 ? fallbackComposedAddress : "Unknown address");

  return {
    organizationId: input.organizationId,
    ownerType: "ORGANIZATION",
    ownerId: input.organizationId,
    countryCode: resolvedCountryCode,
    adminLevel1: input.province ?? null,
    adminLevel2: input.city ?? null,
    locality: resolvedLocality,
    postalCode: input.postalCode ?? null,
    formattedAddress: resolvedFormattedAddress,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    provider: "manual",
    providerPlaceId: `organization:${input.organizationId}`,
    language: input.locale ?? null,
  };
}

export async function syncOrganizationNormalizedAddress(
  tx: {
    normalizedAddress: {
      deleteMany: (args: Prisma.NormalizedAddressDeleteManyArgs) => Promise<unknown>;
      create: (args: Prisma.NormalizedAddressCreateArgs) => Promise<unknown>;
    };
  },
  input: OrganizationAddressSyncInput,
): Promise<void> {
  const data = buildOrganizationNormalizedAddressData(input);

  await tx.normalizedAddress.deleteMany({
    where: {
      ownerType: "ORGANIZATION",
      ownerId: input.organizationId,
    },
  });

  await tx.normalizedAddress.create({ data });
}
