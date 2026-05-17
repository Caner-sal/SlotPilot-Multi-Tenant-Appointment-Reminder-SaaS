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

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { bookingEnabled: true },
  });
  if (!org?.bookingEnabled) return [];

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (isTurkeyHoliday(dateStr)) return [];

  const closedDay = await db.businessClosedDay.findUnique({
    where: { organizationId_date: { organizationId, date: dateStr } },
  });
  if (closedDay) return [];

  const service = await db.service.findFirst({
    where: { id: serviceId, organizationId, isActive: true },
  });
  if (!service) return [];

  const staff = await db.staff.findFirst({
    where: { id: staffId, organizationId, isActive: true },
  });
  if (!staff) return [];

  const staffService = await db.staffService.findUnique({
    where: { staffId_serviceId: { staffId, serviceId } },
  });
  if (!staffService) return [];

  const availability = await getStaffAvailabilityForDay(staffId, date);
  if (!availability) return [];

  const startMinutes = timeToMinutes(availability.startTime);
  const endMinutes = timeToMinutes(availability.endTime);
  const duration = service.durationMinutes;

  const existing = await getExistingAppointmentsForStaff(staffId, date);

  const now = new Date();
  const slots: TimeSlot[] = [];

  for (let slotStart = startMinutes; slotStart + duration <= endMinutes; slotStart += 30) {
    const slotEnd = slotStart + duration;

    const slotStartDate = new Date(date);
    slotStartDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);

    const slotEndDate = new Date(date);
    slotEndDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

    if (slotStartDate <= now) continue;

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
  customerCountryCode?: string;
  customerAddressLine?: string;
  customerPostalCode?: string;
  notes?: string;
}) {
  const {
    organizationId,
    serviceId,
    staffId,
    startTime,
    customerName,
    customerEmail,
    customerPhone,
    customerProvince,
    customerDistrict,
    customerCountryCode,
    customerAddressLine,
    customerPostalCode,
    notes,
  } = params;

  const service = await db.service.findFirst({
    where: { id: serviceId, organizationId, isActive: true },
  });
  if (!service) throw new Error("Service not found or inactive");

  const staff = await db.staff.findFirst({
    where: { id: staffId, organizationId, isActive: true },
  });
  if (!staff) throw new Error("Staff not found or inactive in this organization");

  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

  const appointment = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT 1 FROM "Staff" WHERE id = ${staffId} FOR UPDATE`;

    const conflict = await tx.appointment.findFirst({
      where: {
        staffId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
      },
    });
    if (conflict) throw new Error("This time slot is no longer available");

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
    } else {
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          fullName: customerName,
          phone: customerPhone ?? customer.phone,
          province: customerProvince ?? customer.province,
          district: customerDistrict ?? customer.district,
        },
      });
    }

    if (customerAddressLine || customerCountryCode || customerProvince || customerDistrict || customerPostalCode) {
      await tx.normalizedAddress.create({
        data: {
          organizationId,
          ownerType: "CUSTOMER",
          ownerId: customer.id,
          countryCode: customerCountryCode,
          adminLevel1: customerProvince,
          adminLevel2: customerDistrict,
          locality: customerDistrict,
          postalCode: customerPostalCode,
          formattedAddress: customerAddressLine ?? [customerDistrict, customerProvince].filter(Boolean).join(", "),
          provider: "manual",
          providerPlaceId: `customer:${customer.id}:${Date.now()}`,
          language: undefined,
        },
      });
    }

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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            bookingEnabled: true,
            suspended: true,
            timezone: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    });
  });

  return appointment;
}
