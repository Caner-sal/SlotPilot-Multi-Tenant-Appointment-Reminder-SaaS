import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { globalRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 5, 60 * 1000)) { // 5 requests per minute
      return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
    }

    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "E-posta veya kod eksik." }, { status: 400 });
    }

    const existingToken = await db.verificationToken.findFirst({
      where: { email, token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Geçersiz doğrulama kodu." }, { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return NextResponse.json({ error: "Doğrulama kodunun süresi dolmuş." }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 400 });
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
      },
    });

    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: true, message: "Hesabınız başarıyla doğrulandı." });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
