import { PrismaClient, DayOfWeek, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Superadmin user
  const superadminHash = await bcrypt.hash("superadmin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@slotpilot.app" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@slotpilot.app",
      passwordHash: superadminHash,
      platformRole: "SUPERADMIN",
    },
  });

  // Demo user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@slotpilot.app" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "demo@slotpilot.app",
      passwordHash,
    },
  });

  // Demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "barber-demo" },
    update: {},
    create: {
      name: "Barber Demo",
      slug: "barber-demo",
      description: "A demo barber shop using SlotPilot",
      phone: "+90 555 000 0000",
      email: "hello@barberdemo.com",
      address: "Istanbul, Turkey",
      timezone: "Europe/Istanbul",
      bookingEnabled: true,
    },
  });

  // Default location for demo org
  await prisma.location.upsert({
    where: { id: "loc-barber-main" },
    update: {},
    create: {
      id: "loc-barber-main",
      organizationId: org.id,
      name: "Main Branch",
      address: "Istanbul, Turkey",
      phone: "+90 555 000 0000",
      timezone: "Europe/Istanbul",
      isDefault: true,
      isActive: true,
    },
  });

  // Organization member
  await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Subscription (free plan)
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  // Services
  const haircut = await prisma.service.upsert({
    where: { id: "service-haircut-demo" },
    update: {},
    create: {
      id: "service-haircut-demo",
      organizationId: org.id,
      name: "Haircut",
      description: "Classic haircut and styling",
      durationMinutes: 30,
      priceCents: 35000,
      currency: "TRY",
      isActive: true,
    },
  });

  const beard = await prisma.service.upsert({
    where: { id: "service-beard-demo" },
    update: {},
    create: {
      id: "service-beard-demo",
      organizationId: org.id,
      name: "Beard Trim",
      description: "Beard trimming and shaping",
      durationMinutes: 20,
      priceCents: 20000,
      currency: "TRY",
      isActive: true,
    },
  });

  const combo = await prisma.service.upsert({
    where: { id: "service-combo-demo" },
    update: {},
    create: {
      id: "service-combo-demo",
      organizationId: org.id,
      name: "Haircut + Beard",
      description: "Full grooming package",
      durationMinutes: 45,
      priceCents: 50000,
      currency: "TRY",
      isActive: true,
    },
  });

  // Staff
  const staffAli = await prisma.staff.upsert({
    where: { id: "staff-ali-demo" },
    update: {},
    create: {
      id: "staff-ali-demo",
      organizationId: org.id,
      name: "Ali Yilmaz",
      email: "ali@barberdemo.com",
      phone: "+90 555 111 1111",
      isActive: true,
    },
  });

  // Staff-service assignments
  for (const serviceId of [haircut.id, beard.id, combo.id]) {
    await prisma.staffService.upsert({
      where: { staffId_serviceId: { staffId: staffAli.id, serviceId } },
      update: {},
      create: { staffId: staffAli.id, serviceId },
    });
  }

  // Availability (Mon-Sat, 09:00-18:00)
  const workDays: DayOfWeek[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  for (const day of workDays) {
    await prisma.availabilityRule.upsert({
      where: { staffId_dayOfWeek: { staffId: staffAli.id, dayOfWeek: day } },
      update: {},
      create: {
        organizationId: org.id,
        staffId: staffAli.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
    });
  }

  console.log("Seed complete!");
  console.log(`\nDemo credentials:`);
  console.log(`  Email: demo@slotpilot.app`);
  console.log(`  Password: demo1234`);
  console.log(`\nPublic booking URL:`);
  console.log(`  /booking/barber-demo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
