import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { whatsAppAutoReplySettingsSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

const DEFAULT_TEMPLATE =
  "Merhaba 👋\nRandevu almak için linkimizi kullanabilirsiniz:\n{{bookingUrl}}\n\nBu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.\nİnsan desteği için bu mesaja yazmaya devam edebilirsiniz.";

export async function GET() {
  try {
    const { org } = await requireAuth();
    const settings = await db.whatsAppAutoReplySettings.findUnique({
      where: { organizationId: org.id },
    });

    if (!settings) {
      return NextResponse.json({
        enabled: false,
        provider: "FAKE",
        phoneNumberId: null,
        replyMode: "ALWAYS",
        cooldownHours: 24,
        triggerKeywords: [],
        messageTemplate: DEFAULT_TEMPLATE,
        includeBookingLink: true,
      });
    }

    return NextResponse.json({
      ...settings,
      triggerKeywords: JSON.parse(settings.triggerKeywords) as string[],
    });
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
    const { org } = await requireAuth();
    const body = await req.json();
    const parsed = whatsAppAutoReplySettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.triggerKeywords !== undefined) {
      updateData.triggerKeywords = JSON.stringify(data.triggerKeywords);
    }

    const settings = await db.whatsAppAutoReplySettings.upsert({
      where: { organizationId: org.id },
      update: updateData,
      create: {
        organizationId: org.id,
        enabled: false,
        provider: "FAKE",
        replyMode: "ALWAYS",
        cooldownHours: 24,
        triggerKeywords: "[]",
        messageTemplate: DEFAULT_TEMPLATE,
        includeBookingLink: true,
        ...updateData,
      },
    });

    await db.auditLog.create({
      data: {
        organizationId: org.id,
        action: "WHATSAPP_AUTO_REPLY_SETTINGS_UPDATED",
        metadata: data as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      ...settings,
      triggerKeywords: JSON.parse(settings.triggerKeywords) as string[],
    });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
