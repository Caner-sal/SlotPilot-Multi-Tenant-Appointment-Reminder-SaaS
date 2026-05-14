import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { globalRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 3, 60 * 1000)) { // 3 requests per minute
      return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
    }

    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "E-posta, kod ve yeni şifre gereklidir." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const existingToken = await db.passwordResetToken.findFirst({
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

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: true, message: "Şifreniz başarıyla değiştirildi." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
