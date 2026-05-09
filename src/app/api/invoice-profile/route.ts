import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const invoiceProfileSchema = z.object({
  invoiceType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  companyTitle: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  identityNumber: z.string().optional(),
  invoiceProvince: z.string().optional(),
  invoiceDistrict: z.string().optional(),
  invoiceAddressLine: z.string().optional(),
  invoiceEmail: z.string().email().optional().or(z.literal("")),
  invoicePhone: z.string().optional(),
});

async function getOrgId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const membership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });
  return membership?.organizationId ?? null;
}

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const profile = await db.invoiceProfile.findUnique({ where: { organizationId: orgId } });
  return NextResponse.json({ data: profile });
}

export async function POST(req: Request) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = invoiceProfileSchema.parse(body);

    const profile = await db.invoiceProfile.create({
      data: { organizationId: orgId, ...parsed, invoiceEmail: parsed.invoiceEmail || null },
    });
    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Fatura profili oluşturulamadı." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = invoiceProfileSchema.partial().parse(body);

    const profile = await db.invoiceProfile.upsert({
      where: { organizationId: orgId },
      update: { ...parsed, invoiceEmail: parsed.invoiceEmail || null },
      create: { organizationId: orgId, ...parsed, invoiceEmail: parsed.invoiceEmail || null },
    });
    return NextResponse.json({ data: profile });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Fatura profili güncellenemedi." }, { status: 500 });
  }
}
