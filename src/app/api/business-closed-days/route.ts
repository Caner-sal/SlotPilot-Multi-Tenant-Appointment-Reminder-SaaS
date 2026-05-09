import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrganizationForUser } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";

const closedDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır."),
  reason: z.string().optional(),
  isHolidayOverride: z.boolean().default(false),
});

async function getOrg(userId: string) {
  return getOrganizationForUser(userId);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const org = await getOrg(session.user.id);
  if (!org) return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });

  const closedDays = await db.businessClosedDay.findMany({
    where: { organizationId: org.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ data: closedDays });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const org = await getOrg(session.user.id);
  if (!org) return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = closedDaySchema.parse(body);

    const day = await db.businessClosedDay.create({
      data: { organizationId: org.id, ...parsed },
    });

    return NextResponse.json({ data: day }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Kapalı gün eklenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const org = await getOrg(session.user.id);
  if (!org) return NextResponse.json({ error: "Organizasyon bulunamadı" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Tarih belirtilmelidir." }, { status: 400 });

  await db.businessClosedDay.deleteMany({
    where: { organizationId: org.id, date },
  });

  return NextResponse.json({ success: true });
}
