import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const { staffId } = await requireStaffAuth();

    const availability = await db.availabilityRule.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ data: availability });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const availabilitySchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().optional().default(true),
});

export async function PUT(req: Request) {
  try {
    const { staffId, organizationId } = await requireStaffAuth();
    const body = await req.json();
    const rules = z.array(availabilitySchema).parse(body);

    const updated = await db.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({ where: { staffId } });
      return tx.availabilityRule.createMany({
        data: rules.map((r) => ({ ...r, staffId, organizationId })),
      });
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
