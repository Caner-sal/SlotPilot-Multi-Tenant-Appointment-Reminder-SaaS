import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const deletionRequestSchema = z.object({
  organizationSlug: z.string().min(1),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = deletionRequestSchema.parse(body);

    const org = await db.organization.findUnique({
      where: { slug: parsed.organizationSlug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }

    const customer = await db.customer.findFirst({
      where: { organizationId: org.id, email: parsed.email },
      select: { id: true },
    });

    const request = await db.dataDeletionRequest.create({
      data: {
        organizationId: org.id,
        customerId: customer?.id,
        email: parsed.email,
        reason: parsed.reason,
        status: "pending",
      },
    });

    return NextResponse.json(
      { data: { id: request.id, status: request.status } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "İstek oluşturulamadı." }, { status: 500 });
  }
}
