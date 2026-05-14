import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export class StaffAuthError extends Error {
  constructor(message = "Staff access required") {
    super(message);
    this.name = "StaffAuthError";
  }
}

export async function requireStaffAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new StaffAuthError("Session is not authenticated");
  if (session.user.appRole !== "STAFF_MEMBER") throw new StaffAuthError("Staff access required");
  if (!session.user.staffId || !session.user.staffOrgId) {
    throw new StaffAuthError("Staff profile is not linked");
  }

  const activeStaff = await db.staff.findFirst({
    where: {
      id: session.user.staffId,
      organizationId: session.user.staffOrgId,
      userId: session.user.id,
      isActive: true,
    },
    select: { id: true },
  });

  if (!activeStaff) {
    throw new StaffAuthError("Staff account is disabled");
  }

  return {
    userId: session.user.id,
    staffId: session.user.staffId,
    organizationId: session.user.staffOrgId,
  };
}
