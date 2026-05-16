import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { syncOrganizationNormalizedAddress } from "@/services/address/organization-address-sync.service";
import { organizationSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const { org } = await requireAuth();

    const result = await db.organization.findUnique({
      where: { id: org.id },
      include: { subscription: true },
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, org } = await requireAuth();
    const body = await req.json();
    const parsed = organizationSchema.partial().parse(body);

    if (parsed.slug && parsed.slug !== org.slug) {
      const slugTaken = await db.organization.findFirst({
        where: { slug: parsed.slug, id: { not: org.id } },
      });
      if (slugTaken) {
        return NextResponse.json({ error: "Bu kısa ad zaten kullanımda" }, { status: 409 });
      }
    }

    const updated = await db.$transaction(async (tx) => {
      const next = await tx.organization.update({
        where: { id: org.id },
        data: {
          ...parsed,
          ...(parsed.countryCode ? { countryCode: parsed.countryCode.toUpperCase() } : {}),
          ...(parsed.city || parsed.locality ? { locality: parsed.locality ?? parsed.city ?? null } : {}),
          ...(parsed.formattedAddress || parsed.address
            ? { formattedAddress: parsed.formattedAddress ?? parsed.address ?? null }
            : {}),
        },
      });

      await syncOrganizationNormalizedAddress(tx, {
        organizationId: next.id,
        countryCode: next.countryCode,
        province: next.province,
        city: next.city,
        locality: next.locality,
        postalCode: next.postalCode,
        formattedAddress: next.formattedAddress,
        fallbackAddress: next.address,
        latitude: next.latitude,
        longitude: next.longitude,
        locale: next.defaultLocale,
      });

      return next;
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "ORGANIZATION_UPDATED",
      entityType: "Organization",
      entityId: org.id,
      metadata: parsed,
    });

    return NextResponse.json({ data: updated });
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
