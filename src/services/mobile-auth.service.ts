import bcrypt from "bcryptjs";
import { AppRole, MemberRole, PlatformRole } from "@prisma/client";
import { db } from "@/lib/db";
import { generateRefreshToken, hashRefreshToken, issueMobileAccessToken } from "@/lib/mobile-jwt";
import { TenantError } from "@/lib/tenant";

export type MobileAuthUser = {
  id: string;
  email: string;
  name: string;
  appRole: AppRole;
  platformRole: PlatformRole;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  membershipRole: MemberRole;
};

function resolveEffectiveAppRole(membershipRole: MemberRole, appRole: AppRole): AppRole {
  if (membershipRole === "OWNER" || membershipRole === "ADMIN") return "OWNER";
  if (membershipRole === "STAFF") return "STAFF_MEMBER";
  return appRole;
}

export async function validateMobileCredentials(email: string, password: string): Promise<MobileAuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      memberships: {
        include: {
          organization: {
            select: { id: true, slug: true, name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) throw new TenantError("Geçersiz giriş bilgileri");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new TenantError("Geçersiz giriş bilgileri");
  const membership = user.memberships[0];
  if (!membership) throw new TenantError("Kullanıcı için işletme üyeliği bulunamadı");

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    appRole: resolveEffectiveAppRole(membership.role, user.appRole),
    platformRole: user.platformRole,
    organizationId: membership.organization.id,
    organizationSlug: membership.organization.slug,
    organizationName: membership.organization.name,
    membershipRole: membership.role,
  };
}

export async function issueMobileTokenPair(input: {
  user: MobileAuthUser;
  requestMeta?: { deviceId?: string; userAgent?: string | null; ipAddress?: string | null };
}) {
  const { accessToken, expiresIn, claims } = issueMobileAccessToken({
    userId: input.user.id,
    email: input.user.email,
    organizationId: input.user.organizationId,
    role: input.user.appRole,
    platformRole: input.user.platformRole,
  });
  const { refreshToken, jti, expiresAt } = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await db.mobileRefreshToken.create({
    data: {
      userId: input.user.id,
      organizationId: input.user.organizationId,
      tokenHash,
      jti,
      expiresAt,
      deviceId: input.requestMeta?.deviceId,
      userAgent: input.requestMeta?.userAgent ?? null,
      ipAddress: input.requestMeta?.ipAddress ?? null,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn,
    claims,
  };
}

export async function rotateMobileRefreshToken(input: {
  refreshToken: string;
  requestMeta?: { deviceId?: string; userAgent?: string | null; ipAddress?: string | null };
}) {
  const tokenHash = hashRefreshToken(input.refreshToken);
  const existing = await db.mobileRefreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
      organization: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    throw new TenantError("Refresh token geçersiz veya iptal edilmiş");
  }

  const membership = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: existing.userId,
        organizationId: existing.organizationId,
      },
    },
    select: { role: true },
  });
  if (!membership) {
    throw new TenantError("Kullanıcı üyeliği doğrulanamadı");
  }

  const user: MobileAuthUser = {
    id: existing.user.id,
    email: existing.user.email,
    name: existing.user.name,
    appRole: resolveEffectiveAppRole(membership.role, existing.user.appRole),
    platformRole: existing.user.platformRole,
    organizationId: existing.organization.id,
    organizationSlug: existing.organization.slug,
    organizationName: existing.organization.name,
    membershipRole: membership.role,
  };

  const { accessToken, expiresIn, claims } = issueMobileAccessToken({
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.appRole,
    platformRole: user.platformRole,
  });

  const next = generateRefreshToken();
  const nextTokenHash = hashRefreshToken(next.refreshToken);

  await db.$transaction(async (tx) => {
    await tx.mobileRefreshToken.update({
      where: { id: existing.id },
      data: {
        revokedAt: new Date(),
        replacedByJti: next.jti,
      },
    });
    await tx.mobileRefreshToken.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        tokenHash: nextTokenHash,
        jti: next.jti,
        expiresAt: next.expiresAt,
        deviceId: input.requestMeta?.deviceId ?? existing.deviceId,
        userAgent: input.requestMeta?.userAgent ?? existing.userAgent,
        ipAddress: input.requestMeta?.ipAddress ?? existing.ipAddress,
      },
    });
  });

  return {
    user,
    accessToken,
    refreshToken: next.refreshToken,
    expiresIn,
    claims,
  };
}

export async function revokeMobileRefreshToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const token = await db.mobileRefreshToken.findUnique({ where: { tokenHash }, select: { id: true, revokedAt: true } });
  if (!token || token.revokedAt) return false;
  await db.mobileRefreshToken.update({
    where: { id: token.id },
    data: { revokedAt: new Date() },
  });
  return true;
}
