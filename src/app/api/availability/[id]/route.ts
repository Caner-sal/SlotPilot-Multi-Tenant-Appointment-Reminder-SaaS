import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { availabilitySchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { org } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = availabilitySchema.partial().parse(body);

    const existing = await db.availabilityRule.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Müsaitlik kuralı bulunamadı" }, { status: 404 });
    }

    if (parsed.startTime !== undefined || parsed.endTime !== undefined) {
      const startTime = parsed.startTime ?? existing.startTime;
      const endTime = parsed.endTime ?? existing.endTime;
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (sh * 60 + sm >= eh * 60 + em) {
        return NextResponse.json({ error: "startTime must be before endTime" }, { status: 400 });
      }
    }

    const updated = await db.availabilityRule.update({ where: { id }, data: parsed });

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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { org } = await requireAuth();
    const { id } = await params;

    const existing = await db.availabilityRule.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Müsaitlik kuralı bulunamadı" }, { status: 404 });
    }

    await db.availabilityRule.delete({ where: { id } });

    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

