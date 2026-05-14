import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { organizationId, staffId } = await requireStaffAuth();

    const appointment = await db.appointment.findFirst({
      where: {
        id,
        organizationId,
        staffId,
      },
      include: {
        service: true,
        customer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ data: appointment });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
