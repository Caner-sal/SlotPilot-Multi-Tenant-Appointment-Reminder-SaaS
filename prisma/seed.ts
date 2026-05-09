import { PrismaClient, DayOfWeek, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Superadmin user
  const superadminHash = await bcrypt.hash("superadmin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@randevo.app" },
    update: {
      name: "Platform Yöneticisi",
      passwordHash: superadminHash,
      platformRole: "SUPERADMIN",
      appRole: "OWNER",
    },
    create: {
      name: "Platform Yöneticisi",
      email: "admin@randevo.app",
      passwordHash: superadminHash,
      platformRole: "SUPERADMIN",
      appRole: "OWNER",
    },
  });

  // Demo user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@randevo.app" },
    update: {
      name: "Demo İşletme Sahibi",
      passwordHash,
      appRole: "OWNER",
    },
    create: {
      name: "Demo İşletme Sahibi",
      email: "demo@randevo.app",
      passwordHash,
      appRole: "OWNER",
    },
  });

  // Demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "barber-demo" },
    update: {
      name: "Berber Demo",
      description: "Randevo için demo berber işletmesi",
      phone: "+90 555 000 0000",
      email: "hello@barberdemo.com",
      address: "İstanbul, Türkiye",
      timezone: "Europe/Istanbul",
      bookingEnabled: true,
    },
    create: {
      name: "Berber Demo",
      slug: "barber-demo",
      description: "Randevo için demo berber işletmesi",
      phone: "+90 555 000 0000",
      email: "hello@barberdemo.com",
      address: "İstanbul, Türkiye",
      timezone: "Europe/Istanbul",
      bookingEnabled: true,
    },
  });

  // Default location for demo org
  await prisma.location.upsert({
    where: { id: "loc-barber-main" },
    update: {
      organizationId: org.id,
      name: "Merkez Şube",
      address: "İstanbul, Türkiye",
      phone: "+90 555 000 0000",
      timezone: "Europe/Istanbul",
      isDefault: true,
      isActive: true,
    },
    create: {
      id: "loc-barber-main",
      organizationId: org.id,
      name: "Merkez Şube",
      address: "İstanbul, Türkiye",
      phone: "+90 555 000 0000",
      timezone: "Europe/Istanbul",
      isDefault: true,
      isActive: true,
    },
  });

  // Organization member
  await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {
      role: "OWNER",
    },
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Subscription (free plan)
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
    create: {
      organizationId: org.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  // Services
  const haircut = await prisma.service.upsert({
    where: { id: "service-haircut-demo" },
    update: {
      organizationId: org.id,
      name: "Saç Kesimi",
      description: "Klasik saç kesimi ve şekillendirme",
      durationMinutes: 30,
      priceCents: 35000,
      currency: "TRY",
      isActive: true,
    },
    create: {
      id: "service-haircut-demo",
      organizationId: org.id,
      name: "Saç Kesimi",
      description: "Klasik saç kesimi ve şekillendirme",
      durationMinutes: 30,
      priceCents: 35000,
      currency: "TRY",
      isActive: true,
    },
  });

  const beard = await prisma.service.upsert({
    where: { id: "service-beard-demo" },
    update: {
      organizationId: org.id,
      name: "Sakal Tıraşı",
      description: "Sakal kısaltma ve şekillendirme",
      durationMinutes: 20,
      priceCents: 20000,
      currency: "TRY",
      isActive: true,
    },
    create: {
      id: "service-beard-demo",
      organizationId: org.id,
      name: "Sakal Tıraşı",
      description: "Sakal kısaltma ve şekillendirme",
      durationMinutes: 20,
      priceCents: 20000,
      currency: "TRY",
      isActive: true,
    },
  });

  const combo = await prisma.service.upsert({
    where: { id: "service-combo-demo" },
    update: {
      organizationId: org.id,
      name: "Saç + Sakal",
      description: "Tam bakım paketi",
      durationMinutes: 45,
      priceCents: 50000,
      currency: "TRY",
      isActive: true,
    },
    create: {
      id: "service-combo-demo",
      organizationId: org.id,
      name: "Saç + Sakal",
      description: "Tam bakım paketi",
      durationMinutes: 45,
      priceCents: 50000,
      currency: "TRY",
      isActive: true,
    },
  });

  // Staff
  const staffAli = await prisma.staff.upsert({
    where: { id: "staff-ali-demo" },
    update: {
      organizationId: org.id,
      name: "Ali Yılmaz",
      email: "ali@barberdemo.com",
      phone: "+90 555 111 1111",
      isActive: true,
    },
    create: {
      id: "staff-ali-demo",
      organizationId: org.id,
      name: "Ali Yılmaz",
      email: "ali@barberdemo.com",
      phone: "+90 555 111 1111",
      isActive: true,
    },
  });

  // Staff-service assignments
  for (const serviceId of [haircut.id, beard.id, combo.id]) {
    await prisma.staffService.upsert({
      where: { staffId_serviceId: { staffId: staffAli.id, serviceId } },
      update: {
        staffId: staffAli.id,
        serviceId,
      },
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
      update: {
        organizationId: org.id,
        staffId: staffAli.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
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

  // WhatsApp Auto Reply Settings — default for demo org
  await prisma.whatsAppAutoReplySettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      enabled: false,
      provider: "FAKE",
      replyMode: "ALWAYS",
      cooldownHours: 24,
      triggerKeywords: "[]",
      includeBookingLink: true,
    },
  });

  console.log("Seed complete!");
  console.log(`\nDemo credentials:`);
  console.log(`  Email: demo@randevo.app`);
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
