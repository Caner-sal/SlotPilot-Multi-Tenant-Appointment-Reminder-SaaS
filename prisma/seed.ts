import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_WORKSPACE, validateDemoWorkspaceSafety } from "./demo-workspace";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const superadminHash = await bcrypt.hash(DEMO_WORKSPACE.superadmin.password, 12);
  await prisma.user.upsert({
    where: { email: DEMO_WORKSPACE.superadmin.email },
    update: {
      name: "Platform Yoneticisi",
      passwordHash: superadminHash,
      platformRole: "SUPERADMIN",
      appRole: "OWNER",
    },
    create: {
      name: "Platform Yoneticisi",
      email: DEMO_WORKSPACE.superadmin.email,
      passwordHash: superadminHash,
      platformRole: "SUPERADMIN",
      appRole: "OWNER",
    },
  });

  const ownerPasswordHash = await bcrypt.hash(DEMO_WORKSPACE.owner.password, 12);
  const ownerUser = await prisma.user.upsert({
    where: { email: DEMO_WORKSPACE.owner.email },
    update: {
      name: "Demo Isletme Sahibi",
      passwordHash: ownerPasswordHash,
      appRole: "OWNER",
    },
    create: {
      name: "Demo Isletme Sahibi",
      email: DEMO_WORKSPACE.owner.email,
      passwordHash: ownerPasswordHash,
      appRole: "OWNER",
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: DEMO_WORKSPACE.organization.slug },
    update: {
      name: DEMO_WORKSPACE.organization.name,
      description: "Randevo icin demo berber isletmesi",
      phone: "+90 555 000 0000",
      email: "hello@barberdemo.com",
      address: "Istanbul, Turkiye",
      timezone: "Europe/Istanbul",
      bookingEnabled: true,
    },
    create: {
      name: DEMO_WORKSPACE.organization.name,
      slug: DEMO_WORKSPACE.organization.slug,
      description: "Randevo icin demo berber isletmesi",
      phone: "+90 555 000 0000",
      email: "hello@barberdemo.com",
      address: "Istanbul, Turkiye",
      timezone: "Europe/Istanbul",
      bookingEnabled: true,
    },
  });

  const paymentCountBefore = await prisma.payment.count({
    where: { organizationId: org.id },
  });

  const tier1CountryConfigs = [
    { countryCode: "TR", countryName: "Turkey", defaultLocale: "tr", defaultCurrency: "TRY", phoneCountryCode: "+90", marketplaceEnabled: true },
    { countryCode: "US", countryName: "United States", defaultLocale: "en", defaultCurrency: "USD", phoneCountryCode: "+1", marketplaceEnabled: true },
    { countryCode: "GB", countryName: "United Kingdom", defaultLocale: "en", defaultCurrency: "GBP", phoneCountryCode: "+44", marketplaceEnabled: true },
    { countryCode: "DE", countryName: "Germany", defaultLocale: "de", defaultCurrency: "EUR", phoneCountryCode: "+49", marketplaceEnabled: true },
    { countryCode: "FR", countryName: "France", defaultLocale: "fr", defaultCurrency: "EUR", phoneCountryCode: "+33", marketplaceEnabled: true },
    { countryCode: "IT", countryName: "Italy", defaultLocale: "it", defaultCurrency: "EUR", phoneCountryCode: "+39", marketplaceEnabled: true },
    { countryCode: "ES", countryName: "Spain", defaultLocale: "es", defaultCurrency: "EUR", phoneCountryCode: "+34", marketplaceEnabled: true },
    { countryCode: "NL", countryName: "Netherlands", defaultLocale: "nl", defaultCurrency: "EUR", phoneCountryCode: "+31", marketplaceEnabled: true },
    { countryCode: "CA", countryName: "Canada", defaultLocale: "en", defaultCurrency: "CAD", phoneCountryCode: "+1", marketplaceEnabled: true },
    { countryCode: "AU", countryName: "Australia", defaultLocale: "en", defaultCurrency: "AUD", phoneCountryCode: "+61", marketplaceEnabled: true },
  ] as const;

  for (const country of tier1CountryConfigs) {
    await prisma.countryConfig.upsert({
      where: { countryCode: country.countryCode },
      update: {
        countryName: country.countryName,
        defaultLocale: country.defaultLocale,
        defaultCurrency: country.defaultCurrency,
        phoneCountryCode: country.phoneCountryCode,
        enabled: true,
        marketplaceEnabled: country.marketplaceEnabled,
      },
      create: {
        countryCode: country.countryCode,
        countryName: country.countryName,
        defaultLocale: country.defaultLocale,
        defaultCurrency: country.defaultCurrency,
        phoneCountryCode: country.phoneCountryCode,
        enabled: true,
        marketplaceEnabled: country.marketplaceEnabled,
      },
    });
  }

  await prisma.location.upsert({
    where: { id: DEMO_WORKSPACE.ids.location },
    update: {
      organizationId: org.id,
      name: "Merkez Sube",
      address: "Istanbul, Turkiye",
      phone: "+90 555 000 0000",
      timezone: "Europe/Istanbul",
      isDefault: true,
      isActive: true,
    },
    create: {
      id: DEMO_WORKSPACE.ids.location,
      organizationId: org.id,
      name: "Merkez Sube",
      address: "Istanbul, Turkiye",
      phone: "+90 555 000 0000",
      timezone: "Europe/Istanbul",
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: ownerUser.id,
        organizationId: org.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: ownerUser.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {
      plan: DEMO_WORKSPACE.subscription.plan,
      status: DEMO_WORKSPACE.subscription.status,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
    create: {
      organizationId: org.id,
      plan: DEMO_WORKSPACE.subscription.plan,
      status: DEMO_WORKSPACE.subscription.status,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });

  const haircut = await prisma.service.upsert({
    where: { id: DEMO_WORKSPACE.ids.serviceHaircut },
    update: {
      organizationId: org.id,
      name: "Sac Kesimi",
      description: "Klasik sac kesimi ve sekillendirme",
      durationMinutes: 30,
      priceCents: 35000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
    create: {
      id: DEMO_WORKSPACE.ids.serviceHaircut,
      organizationId: org.id,
      name: "Sac Kesimi",
      description: "Klasik sac kesimi ve sekillendirme",
      durationMinutes: 30,
      priceCents: 35000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
  });

  const beard = await prisma.service.upsert({
    where: { id: DEMO_WORKSPACE.ids.serviceBeard },
    update: {
      organizationId: org.id,
      name: "Sakal Tirasi",
      description: "Sakal kisaltma ve sekillendirme",
      durationMinutes: 20,
      priceCents: 20000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
    create: {
      id: DEMO_WORKSPACE.ids.serviceBeard,
      organizationId: org.id,
      name: "Sakal Tirasi",
      description: "Sakal kisaltma ve sekillendirme",
      durationMinutes: 20,
      priceCents: 20000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
  });

  const combo = await prisma.service.upsert({
    where: { id: DEMO_WORKSPACE.ids.serviceCombo },
    update: {
      organizationId: org.id,
      name: "Sac + Sakal",
      description: "Tam bakim paketi",
      durationMinutes: 45,
      priceCents: 50000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
    create: {
      id: DEMO_WORKSPACE.ids.serviceCombo,
      organizationId: org.id,
      name: "Sac + Sakal",
      description: "Tam bakim paketi",
      durationMinutes: 45,
      priceCents: 50000,
      currency: "TRY",
      depositRequired: false,
      depositAmountCents: 0,
      isActive: true,
    },
  });

  const staffAli = await prisma.staff.upsert({
    where: { id: DEMO_WORKSPACE.ids.staffAli },
    update: {
      organizationId: org.id,
      name: "Ali Yilmaz",
      email: "ali@barberdemo.com",
      phone: "+90 555 111 1111",
      isActive: true,
    },
    create: {
      id: DEMO_WORKSPACE.ids.staffAli,
      organizationId: org.id,
      name: "Ali Yilmaz",
      email: "ali@barberdemo.com",
      phone: "+90 555 111 1111",
      isActive: true,
    },
  });

  for (const serviceId of [haircut.id, beard.id, combo.id]) {
    await prisma.staffService.upsert({
      where: {
        staffId_serviceId: {
          staffId: staffAli.id,
          serviceId,
        },
      },
      update: {
        staffId: staffAli.id,
        serviceId,
      },
      create: {
        staffId: staffAli.id,
        serviceId,
      },
    });
  }

  const workDays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ] as const;

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

  const paymentCountAfter = await prisma.payment.count({
    where: { organizationId: org.id },
  });

  const safety = validateDemoWorkspaceSafety({
    subscriptionPlan: subscription.plan,
    subscriptionStatus: subscription.status,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    paymentCountDelta: paymentCountAfter - paymentCountBefore,
  });

  console.log("Seed complete!");
  console.log("Demo workspace smoke summary:");
  console.log(`  ownerEmail=${DEMO_WORKSPACE.owner.email}`);
  console.log(`  organizationSlug=${DEMO_WORKSPACE.organization.slug}`);
  console.log(`  plan=${subscription.plan} status=${subscription.status}`);
  console.log(`  paymentCountDelta=${paymentCountAfter - paymentCountBefore}`);
  if (!safety.ok) {
    for (const issue of safety.issues) {
      console.error(`  [safety-issue] ${issue}`);
    }
    throw new Error("Demo workspace safety assertions failed");
  }
  console.log("  safety=PASS");
  console.log(`\nDemo credentials:`);
  console.log(`  Email: ${DEMO_WORKSPACE.owner.email}`);
  console.log(`  Password: ${DEMO_WORKSPACE.owner.password}`);
  console.log("\nPublic booking URL:");
  console.log(`  /booking/${DEMO_WORKSPACE.organization.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
