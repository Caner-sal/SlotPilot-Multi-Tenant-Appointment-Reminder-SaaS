import { auth } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/tenant";
import { getCalendarProvider } from "@/services/calendar/calendar.factory";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrganizationForUser(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  try {
    const provider = getCalendarProvider();
    const url = provider.getAuthUrl(org.id);
    return NextResponse.json({ data: { url } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
