import { auth } from "@/lib/auth";

export class StaffAuthError extends Error {
  constructor(message = "Çalışan erişimi gerekli") {
    super(message);
    this.name = "StaffAuthError";
  }
}

export async function requireStaffAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new StaffAuthError("Oturum doğrulanamadı");
  if (session.user.appRole !== "STAFF_MEMBER") throw new StaffAuthError("Çalışan erişimi gerekli");
  if (!session.user.staffId || !session.user.staffOrgId) throw new StaffAuthError("Çalışan profili bağlı değil");

  return {
    userId: session.user.id,
    staffId: session.user.staffId,
    organizationId: session.user.staffOrgId,
  };
}
