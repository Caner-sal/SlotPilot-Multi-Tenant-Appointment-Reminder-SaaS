import type { OrganizationStatus } from "@prisma/client";

export type OrganizationLifecycleLike = {
  bookingEnabled: boolean;
  status?: OrganizationStatus | null;
  suspended?: boolean | null;
};

export function resolveOrganizationStatus(input: Pick<OrganizationLifecycleLike, "status" | "suspended">): OrganizationStatus {
  if (input.status) return input.status;
  return input.suspended ? "SUSPENDED" : "ACTIVE";
}

export function isOrganizationSuspended(input: Pick<OrganizationLifecycleLike, "status" | "suspended">): boolean {
  return resolveOrganizationStatus(input) !== "ACTIVE";
}

export function isOrganizationPubliclyAvailable(input: OrganizationLifecycleLike): boolean {
  return input.bookingEnabled && !isOrganizationSuspended(input);
}