import { auth } from "@/lib/auth-server";

export class AuthGuardError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthGuardError";
  }
}

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  platformRole?: string;
  appRole?: string;
  staffId?: string;
  staffOrgId?: string;
  preferredLocale?: string;
};

/**
 * Returns the authenticated user or throws AuthGuardError(401).
 * Use in API routes and server actions that require any login.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthGuardError("Oturum açmanız gerekiyor", 401);
  }
  return session.user as SessionUser;
}

/**
 * Returns the authenticated SUPERADMIN user or throws:
 * - AuthGuardError(401) if not logged in
 * - AuthGuardError(403) if not SUPERADMIN
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireSession();
  if (user.platformRole !== "SUPERADMIN") {
    throw new AuthGuardError("Bu işlem için platform yöneticisi yetkisi gerekiyor", 403);
  }
  return user;
}

/**
 * Returns staff session info or throws:
 * - AuthGuardError(401) if not logged in
 * - AuthGuardError(403) if appRole !== STAFF_MEMBER
 */
export async function requireStaffSession(): Promise<{
  userId: string;
  staffId: string;
  staffOrgId: string;
}> {
  const user = await requireSession();
  if (user.appRole !== "STAFF_MEMBER") {
    throw new AuthGuardError("Bu işlem için personel yetkisi gerekiyor", 403);
  }
  if (!user.staffId || !user.staffOrgId) {
    throw new AuthGuardError("Personel profili bulunamadı", 403);
  }
  return { userId: user.id, staffId: user.staffId, staffOrgId: user.staffOrgId };
}
