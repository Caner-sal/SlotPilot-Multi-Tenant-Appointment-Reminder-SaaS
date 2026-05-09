import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { org } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await db.location.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Şube bulunamadı" }, { status: 404 });
    }

    if (data.isDefault) {
      await db.location.updateMany({
        where: { organizationId: org.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const location = await db.location.update({ where: { id }, data });
    return NextResponse.json({ data: location });
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

    const existing = await db.location.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Şube bulunamadı" }, { status: 404 });
    }
    if (existing.isDefault) {
      return NextResponse.json({ error: "Cannot delete the default location" }, { status: 400 });
    }

    await db.location.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

