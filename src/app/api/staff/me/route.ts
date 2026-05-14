import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { staffId, organizationId, userId } = await requireStaffAuth();

    const staff = await db.staff.findFirst({
      where: {
        id: staffId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [todayCount, weekCount, nextAppointment, completedCount, noShowCount] = await Promise.all([
      db.appointment.count({
        where: {
          organizationId,
          staffId,
          startTime: { gte: today, lt: tomorrow },
        },
      }),
      db.appointment.count({
        where: {
          organizationId,
          staffId,
          startTime: { gte: today, lt: weekEnd },
        },
      }),
      db.appointment.findFirst({
        where: {
          organizationId,
          staffId,
          startTime: { gte: new Date() },
        },
        select: {
          id: true,
          startTime: true,
          status: true,
          customer: { select: { fullName: true } },
          service: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
      }),
      db.appointment.count({
        where: { organizationId, staffId, status: "COMPLETED" },
      }),
      db.appointment.count({
        where: { organizationId, staffId, status: "NO_SHOW" },
      }),
    ]);

    return NextResponse.json({
      data: {
        ...staff,
        userId,
        metrics: {
          todayAppointments: todayCount,
          weekAppointments: weekCount,
          completedAppointments: completedCount,
          noShowAppointments: noShowCount,
        },
        nextAppointment,
      },
    });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
