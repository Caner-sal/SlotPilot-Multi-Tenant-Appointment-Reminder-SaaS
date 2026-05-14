import { db } from "@/lib/db";
import {
  getStaffAvailabilityForDay,
  getExistingAppointmentsForStaff,
  timeToMinutes,
} from "./availability.service";
import { isTurkeyHoliday } from "@/data/turkey-holidays";

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  label: string;
}

export async function generateAvailableSlots(params: {
  organizationId: string;
  serviceId: string;
  staffId: string;
  date: Date;
}): Promise<TimeSlot[]> {
  const { organizationId, serviceId, staffId, date } = params;

  // Validate organization booking is enabled
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { bookingEnabled: true },
  });
  if (!org?.bookingEnabled) return [];

  // Check Turkey public holidays
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (isTurkeyHoliday(dateStr)) return [];

  // Check business-specific closed days
  const closedDay = await db.businessClosedDay.findUnique({
    where: { organizationId_date: { organizationId, date: dateStr } },
  });
  if (closedDay) return [];

  // Validate service belongs to org and is active
  const service = await db.service.findFirst({
    where: { id: serviceId, organizationId, isActive: true },
  });
  if (!service) return [];

  // Validate staff belongs to org and is active
  const staff = await db.staff.findFirst({
    where: { id: staffId, organizationId, isActive: true },
  });
  if (!staff) return [];

  // Validate staff can provide this service
  const staffService = await db.staffService.findUnique({
    where: { staffId_serviceId: { staffId, serviceId } },
  });
  if (!staffService) return [];

  // Get staff availability for the given day
  const availability = await getStaffAvailabilityForDay(staffId, date);
  if (!availability) return [];

  const startMinutes = timeToMinutes(availability.startTime);
  const endMinutes = timeToMinutes(availability.endTime);
  const duration = service.durationMinutes;

  // Get existing confirmed/pending appointments
  const existing = await getExistingAppointmentsForStaff(staffId, date);

  const now = new Date();
  const slots: TimeSlot[] = [];

  for (let slotStart = startMinutes; slotStart + duration <= endMinutes; slotStart += 30) {
    const slotEnd = slotStart + duration;

    // Build actual Date objects for this slot
    const slotStartDate = new Date(date);
    slotStartDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);

    const slotEndDate = new Date(date);
    slotEndDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

    // Skip past times
    if (slotStartDate <= now) continue;

    // Check conflict with existing appointments
    const hasConflict = existing.some((appt) => {
      const apptStart = appt.startTime.getTime();
      const apptEnd = appt.endTime.getTime();
      const sStart = slotStartDate.getTime();
      const sEnd = slotEndDate.getTime();
      return sStart < apptEnd && sEnd > apptStart;
    });

    if (hasConflict) continue;

    const h = Math.floor(slotStart / 60).toString().padStart(2, "0");
    const m = (slotStart % 60).toString().padStart(2, "0");

    slots.push({
      startTime: slotStartDate,
      endTime: slotEndDate,
      label: `${h}:${m}`,
    });
  }

  return slots;
}

export async function createBooking(params: {
  organizationId: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerProvince?: string;
  customerDistrict?: string;
  notes?: string;
}) {
  const { organizationId, serviceId, staffId, startTime, customerName, customerEmail, customerPhone, customerProvince, customerDistrict, notes } = params;

  const service = await db.service.findFirst({
    where: { id: serviceId, organizationId, isActive: true },
  });
  if (!service) throw new Error("Service not found or inactive");

  const staff = await db.staff.findFirst({
    where: { id: staffId, organizationId, isActive: true },
  });
  if (!staff) throw new Error("Staff not found or inactive in this organization");

  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

  // Use a transaction to prevent race conditions during booking
  const appointment = await db.$transaction(async (tx) => {
    // 1. Acquire row-level lock on the staff member
    // This ensures only one booking process can happen for a specific staff member at a time
    await tx.$executeRaw`SELECT 1 FROM "Staff" WHERE id = ${staffId} FOR UPDATE`;

    // 2. Re-check for conflicts while the lock is held
    const conflict = await tx.appointment.findFirst({
      where: {
        staffId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });
    if (conflict) throw new Error("This time slot is no longer available");

    // 3. Upsert customer
    let customer = await tx.customer.findFirst({
      where: { organizationId, email: customerEmail },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          organizationId,
          fullName: customerName,
          email: customerEmail,
          phone: customerPhone,
          province: customerProvince,
          district: customerDistrict,
        },
      });
    }

    // 4. Create appointment
    return await tx.appointment.create({
      data: {
        organizationId,
        serviceId,
        staffId,
        customerId: customer.id,
        startTime,
        endTime,
        status: "PENDING",
        notes,
      },
      include: {
        service: true,
        staff: true,
        customer: true,
        organization: true,
      },
    });
  });

  return appointment;
}
