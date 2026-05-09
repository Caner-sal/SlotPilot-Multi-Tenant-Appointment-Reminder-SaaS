import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional().default("UTC"),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const { org } = await requireAuth();

    const locations = await db.location.findMany({
      where: { organizationId: org.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: locations });
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
    const data = locationSchema.parse(body);

    if (data.isDefault) {
      await db.location.updateMany({
        where: { organizationId: org.id },
        data: { isDefault: false },
      });
    }

    const location = await db.location.create({
      data: { ...data, organizationId: org.id },
    });

    return NextResponse.json({ data: location }, { status: 201 });
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

