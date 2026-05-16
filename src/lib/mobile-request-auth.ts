import { AppRole, MemberRole, PlatformRole } from "@prisma/client";
import { db } from "@/lib/db";
import { TenantError } from "@/lib/tenant";
import { verifyMobileAccessToken } from "@/lib/mobile-jwt";

export type MobileRequestAuth = {
  user: {
    id: string;
    email: string;
    appRole: AppRole;
    platformRole: PlatformRole;
  };
  org: {
    id: string;
    slug: string;
    name: string;
  };
  membership: {
    role: MemberRole;
  };
  scope: string[];
};

export function readBearerToken(headers: Headers): string | null {
  const raw = headers.get("authorization");
  if (!raw) return null;
  const [scheme, token] = raw.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export async function requireMobileRequestAuth(req: Request): Promise<MobileRequestAuth> {
  const bearer = readBearerToken(req.headers);
  if (!bearer) {
    throw new TenantError("Bearer token gerekli");
  }

  const claims = verifyMobileAccessToken(bearer);
  if (!claims) {
    throw new TenantError("Geçersiz veya süresi dolmuş erişim belirteci");
  }

  const [user, membership] = await Promise.all([
    db.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        email: true,
        appRole: true,
        platformRole: true,
      },
    }),
    db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: claims.sub,
          organizationId: claims.organizationId,
        },
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    }),
  ]);

  if (!user || !membership) {
    throw new TenantError("Mobil oturum yetkisi doğrulanamadı");
  }

  return {
    user,
    org: membership.organization,
    membership: { role: membership.role },
    scope: claims.scope,
  };
}

export function assertMobileScope(scope: string[], required: string) {
  if (!scope.includes(required)) {
    throw new TenantError("Bu işlem için mobil kapsam yetkisi yetersiz");
  }
}
