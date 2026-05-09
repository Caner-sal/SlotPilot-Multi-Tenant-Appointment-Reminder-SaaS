import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { availabilitySchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const { org } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");

    const where: Record<string, unknown> = { organizationId: org.id };
    if (staffId) where.staffId = staffId;

    const rules = await db.availabilityRule.findMany({
      where,
      orderBy: [{ staffId: "asc" }, { dayOfWeek: "asc" }],
    });

    return NextResponse.json({ data: rules });
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
    const { org } = await requireAuth();
    const body = await req.json();
    const parsed = availabilitySchema.parse(body);

    const staffBelongsToOrg = await db.staff.findFirst({
      where: { id: parsed.staffId, organizationId: org.id },
    });
    if (!staffBelongsToOrg) {
      return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });
    }

    const [startH, startM] = parsed.startTime.split(":").map(Number);
    const [endH, endM] = parsed.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal >= endTotal) {
      return NextResponse.json({ error: "startTime must be before endTime" }, { status: 400 });
    }

    const rule = await db.availabilityRule.upsert({
      where: {
        staffId_dayOfWeek: {
          staffId: parsed.staffId,
          dayOfWeek: parsed.dayOfWeek,
        },
      },
      update: {
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive,
      },
      create: {
        organizationId: org.id,
        staffId: parsed.staffId,
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive,
      },
    });

    return NextResponse.json({ data: rule }, { status: 201 });
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

