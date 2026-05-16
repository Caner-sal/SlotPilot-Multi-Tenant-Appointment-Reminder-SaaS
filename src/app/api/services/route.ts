import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { trackProductEvent } from "@/services/product-event.service";
import { serviceSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const { org } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get("isActive");

    const where: Record<string, unknown> = { organizationId: org.id };
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === "true";
    }

    const services = await db.service.findMany({ where, orderBy: { name: "asc" } });

    return NextResponse.json({ data: services });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, org } = await requireAuth();
    const body = await req.json();
    const parsed = serviceSchema.parse(body);

    const service = await db.service.create({
      data: { ...parsed, organizationId: org.id },
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "SERVICE_CREATED",
      entityType: "Service",
      entityId: service.id,
      metadata: { name: service.name },
    });

    await trackProductEvent({
      eventName: "service_created",
      userId: user.id,
      organizationId: org.id,
      payloadSafe: { serviceId: service.id, name: service.name },
    });

    return NextResponse.json({ data: service }, { status: 201 });
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

