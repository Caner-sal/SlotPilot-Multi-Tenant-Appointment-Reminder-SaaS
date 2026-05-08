import { auth } from "@/lib/auth";

export class StaffAuthError extends Error {
  constructor(message = "Staff access required") {
    super(message);
    this.name = "StaffAuthError";
  }
}

export async function requireStaffAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new StaffAuthError("Not authenticated");
  if (session.user.appRole !== "STAFF_MEMBER") throw new StaffAuthError("Staff access required");
  if (!session.user.staffId || !session.user.staffOrgId) throw new StaffAuthError("Staff profile not linked");

  return {
    userId: session.user.id,
    staffId: session.user.staffId,
    organizationId: session.user.staffOrgId,
  };
}
