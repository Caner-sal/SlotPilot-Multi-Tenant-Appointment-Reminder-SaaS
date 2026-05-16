import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { globalRateLimiter } from "@/lib/rate-limit";
import { generateCustomerPortalToken, getCustomerPortalMagicLinkUrl } from "@/lib/booking-token";
import { buildCustomerPortalMagicLinkEmail, sendEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 3, 60 * 1000)) {
      return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
    }

    const { slug } = await params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gereklidir." }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }

    // Find customer by email in this org
    const customer = await db.customer.findFirst({
      where: { organizationId: org.id, email },
    });

    if (!customer) {
      // Return success even if not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "Eğer bu e-posta adresiyle kayıtlı bir randevunuz varsa, giriş bağlantısı gönderildi." });
    }

    const token = await generateCustomerPortalToken(customer.id, slug);
    const magicLink = getCustomerPortalMagicLinkUrl(slug, token);

    const { subject, html } = buildCustomerPortalMagicLinkEmail({
      customerName: customer.fullName,
      businessName: org.name,
      magicLink,
    });

    await sendEmail({ to: customer.email!, subject, html });

    return NextResponse.json({ success: true, message: "Giriş bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    console.error("Portal login error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
