import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { buildReplyText } from "@/services/whatsapp-auto-reply.service";
import { getBookingUrl } from "@/services/booking-link.service";
import { NextResponse } from "next/server";

const DEFAULT_TEMPLATE =
  "Merhaba 👋\nRandevu almak için linkimizi kullanabilirsiniz:\n{{bookingUrl}}\n\nBu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.\nİnsan desteği için bu mesaja yazmaya devam edebilirsiniz.";

export async function POST() {
  try {
    const { org } = await requireAuth();

    const settings = await db.whatsAppAutoReplySettings.findUnique({
      where: { organizationId: org.id },
    });

    const template = settings?.messageTemplate ?? DEFAULT_TEMPLATE;
    const bookingUrl = getBookingUrl(org.slug);
    const previewText = buildReplyText(template, bookingUrl);

    // No DB write, no provider call — preview only
    return NextResponse.json({ previewText, bookingUrl });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
