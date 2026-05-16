import { db } from "@/lib/db";
import { requireAuth, getCurrentUser, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { trackProductEvent } from "@/services/product-event.service";
import { syncOrganizationNormalizedAddress } from "@/services/address/organization-address-sync.service";
import { organizationSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = organizationSchema.parse(body);

    const slugTaken = await db.organization.findUnique({ where: { slug: parsed.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: "Bu kısa ad zaten kullanımda" }, { status: 409 });
    }

    const org = await db.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: {
          ...parsed,
          countryCode: parsed.countryCode?.toUpperCase() ?? "TR",
          locality: parsed.locality ?? parsed.city ?? null,
          formattedAddress: parsed.formattedAddress ?? parsed.address ?? null,
        },
      });

      await tx.organizationMember.create({
        data: { organizationId: created.id, userId: user.id, role: "OWNER" },
      });

      await tx.subscription.create({
        data: { organizationId: created.id, plan: "FREE" },
      });

      await syncOrganizationNormalizedAddress(tx, {
        organizationId: created.id,
        countryCode: created.countryCode,
        province: created.province,
        city: created.city,
        locality: created.locality,
        postalCode: created.postalCode,
        formattedAddress: created.formattedAddress,
        fallbackAddress: created.address,
        latitude: created.latitude,
        longitude: created.longitude,
        locale: created.defaultLocale,
      });

      return created;
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "ORGANIZATION_CREATED",
      entityType: "Organization",
      entityId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    await trackProductEvent({
      eventName: "organization_created",
      userId: user.id,
      organizationId: org.id,
      payloadSafe: { slug: org.slug },
    });

    return NextResponse.json({ data: org }, { status: 201 });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    const memberships = await db.organizationMember.findMany({
      where: { userId: user.id },
      include: { organization: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "asc" },
    });
    const data = memberships.map((m) => ({ ...m.organization, role: m.role }));
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

