import { auth } from "@/lib/auth";

export class SuperAdminError extends Error {
  constructor(message = "Superadmin access required") {
    super(message);
    this.name = "SuperAdminError";
  }
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new SuperAdminError("Not authenticated");
  if (session.user.platformRole !== "SUPERADMIN") throw new SuperAdminError("Superadmin access required");
  return { userId: session.user.id };
}
