import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MemberRole } from "@prisma/client";

export class TenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantError";
  }
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new TenantError("Oturum doğrulanamadı");
  }
  return session.user;
}

export async function getOrganizationForUser(userId: string) {
  const membership = await db.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.organization ?? null;
}

export async function assertMembership(
  userId: string,
  organizationId: string,
  allowedRoles?: MemberRole[]
) {
  const membership = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });

  if (!membership) {
    throw new TenantError("Erişim reddedildi: bu işletmenin üyesi değilsiniz");
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new TenantError("Erişim reddedildi: yetki seviyesi yetersiz");
  }

  return membership;
}

export async function requireOrganization(userId: string) {
  const org = await getOrganizationForUser(userId);
  if (!org) {
    throw new TenantError("Bu kullanıcı için işletme bulunamadı");
  }
  return org;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  const org = await requireOrganization(user.id);
  return { user, org };
}
