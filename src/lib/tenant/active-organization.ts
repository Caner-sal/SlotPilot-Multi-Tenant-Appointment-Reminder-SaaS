import { db } from "@/lib/db";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { Organization } from "@prisma/client";

export const ACTIVE_ORG_COOKIE = "randevo_active_org";

export function getActiveOrgIdFromCookies(
  cookieStore: ReadonlyRequestCookies,
): string | null {
  return cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;
}

/**
 * Resolves the active organization for a user.
 * Priority: cookie org (validated via membership check) → first membership fallback.
 * Cookie org is silently discarded if the user no longer has membership.
 */
export async function resolveActiveOrganization(
  userId: string,
  cookieStore: ReadonlyRequestCookies,
): Promise<Organization | null> {
  const cookieOrgId = getActiveOrgIdFromCookies(cookieStore);

  if (cookieOrgId) {
    const membership = await db.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: cookieOrgId } },
      include: { organization: true },
    });
    if (membership) return membership.organization;
  }

  // Fallback: first membership (same as legacy getOrganizationForUser)
  const firstMembership = await db.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return firstMembership?.organization ?? null;
}
