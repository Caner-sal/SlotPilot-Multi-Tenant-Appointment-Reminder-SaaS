import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { globalRateLimiter } from "@/lib/rate-limit";

function generateToken() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 3, 60 * 1000)) { // 3 requests per minute
      return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gereklidir." }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "Şifre sıfırlama kodu gönderildi (eğer sistemde kayıtlıysanız)." });
    }

    // Delete any existing tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true, message: "Şifre sıfırlama kodu başarıyla gönderildi." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
