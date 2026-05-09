import { auth } from "@/lib/auth";

export class SuperAdminError extends Error {
  constructor(message = "Süper yönetici erişimi gerekli") {
    super(message);
    this.name = "SuperAdminError";
  }
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new SuperAdminError("Oturum doğrulanamadı");
  if (session.user.platformRole !== "SUPERADMIN") throw new SuperAdminError("Süper yönetici erişimi gerekli");
  return { userId: session.user.id };
}
