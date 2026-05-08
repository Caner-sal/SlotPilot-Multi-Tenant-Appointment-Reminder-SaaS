import { db } from "@/lib/db";
import { DayOfWeek } from "@prisma/client";

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export function getDayOfWeekEnum(date: Date): DayOfWeek {
  return DAY_MAP[date.getDay()];
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getStaffAvailabilityForDay(
  staffId: string,
  date: Date
): Promise<{ startTime: string; endTime: string } | null> {
  const dayOfWeek = getDayOfWeekEnum(date);

  const rule = await db.availabilityRule.findUnique({
    where: { staffId_dayOfWeek: { staffId, dayOfWeek } },
  });

  if (!rule || !rule.isActive) return null;
  return { startTime: rule.startTime, endTime: rule.endTime };
}

export async function getExistingAppointmentsForStaff(
  staffId: string,
  date: Date
): Promise<Array<{ startTime: Date; endTime: Date }>> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db.appointment.findMany({
    where: {
      staffId,
      startTime: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startTime: true, endTime: true },
  });
}
