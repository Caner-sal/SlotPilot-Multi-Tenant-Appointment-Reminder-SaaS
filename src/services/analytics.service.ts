import { db } from "@/lib/db";

export async function getAnalytics(organizationId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    todayCount,
    weekCount,
    monthCount,
    cancelledCount,
    completedCount,
    noShowCount,
    revenueAgg,
    topService,
    busiestStaff,
  ] = await Promise.all([
    db.appointment.count({ where: { organizationId, startTime: { gte: startOfToday, lte: endOfToday } } }),
    db.appointment.count({ where: { organizationId, startTime: { gte: startOfWeek } } }),
    db.appointment.count({ where: { organizationId, startTime: { gte: startOfMonth, lte: endOfMonth } } }),
    db.appointment.count({ where: { organizationId, status: "CANCELLED", startTime: { gte: startOfMonth, lte: endOfMonth } } }),
    db.appointment.count({ where: { organizationId, status: "COMPLETED", startTime: { gte: startOfMonth, lte: endOfMonth } } }),
    db.appointment.count({ where: { organizationId, status: "NO_SHOW", startTime: { gte: startOfMonth, lte: endOfMonth } } }),
    db.appointment.findMany({
      where: { organizationId, status: "COMPLETED", startTime: { gte: startOfMonth, lte: endOfMonth } },
      include: { service: { select: { priceCents: true } } },
    }),
    db.appointment.groupBy({
      by: ["serviceId"],
      where: { organizationId, startTime: { gte: startOfMonth, lte: endOfMonth }, status: { notIn: ["CANCELLED"] } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    db.appointment.groupBy({
      by: ["staffId"],
      where: { organizationId, startTime: { gte: startOfMonth, lte: endOfMonth }, status: { notIn: ["CANCELLED"] } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ]);

  const estimatedRevenueCents = revenueAgg.reduce((sum, a) => sum + a.service.priceCents, 0);

  let topServiceName: string | null = null;
  if (topService.length > 0) {
    const svc = await db.service.findUnique({ where: { id: topService[0].serviceId }, select: { name: true } });
    topServiceName = svc?.name ?? null;
  }

  let busiestStaffName: string | null = null;
  if (busiestStaff.length > 0) {
    const st = await db.staff.findUnique({ where: { id: busiestStaff[0].staffId }, select: { name: true } });
    busiestStaffName = st?.name ?? null;
  }

  return {
    todayAppointments: todayCount,
    weekAppointments: weekCount,
    monthAppointments: monthCount,
    cancelledCount,
    completedCount,
    noShowCount,
    estimatedRevenueCents,
    topServiceName,
    busiestStaffName,
  };
}
