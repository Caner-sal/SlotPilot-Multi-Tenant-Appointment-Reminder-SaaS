import { requireSession } from "@/lib/auth/guards";
import { assertMembership, requireOrganization } from "@/lib/tenant";
import type { MemberRole } from "@prisma/client";

/**
 * Combined auth + membership guard for owner/admin API routes.
 *
 * Replaces the repetitive pattern:
 *   const { user } = await requireAuth();
 *   await assertMembership(user.id, org.id, ["OWNER", "ADMIN"]);
 *
 * Migration candidates:
 *   - src/app/api/staff/route.ts
 *   - src/app/api/services/route.ts
 *   - src/app/api/availability/route.ts
 *   - src/app/api/appointments/route.ts
 *   (and ~30 other dashboard API routes)
 */
export async function requireOwnerOrAdmin(
  allowedRoles: MemberRole[] = ["OWNER", "ADMIN"],
): Promise<{ userId: string; orgId: string; role: MemberRole }> {
  const user = await requireSession();
  const org = await requireOrganization(user.id);
  const membership = await assertMembership(user.id, org.id, allowedRoles);
  return { userId: user.id, orgId: org.id, role: membership.role };
}
