import { auth } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrganizationForUser(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  await db.calendarConnection.updateMany({
    where: { organizationId: org.id },
    data: { isActive: false },
  });

  return NextResponse.json({ data: { disconnected: true } });
}
