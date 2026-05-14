import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { globalRateLimiter } from "@/lib/rate-limit";

function generateToken() {
  // Use crypto for cryptographically secure random number generation
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 5, 60 * 1000)) { // 5 requests per minute
      return NextResponse.json({ error: "Too many requests", message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda", message: "Bu e-posta zaten kullanımda" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await db.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    const token = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await db.verificationToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    await sendVerificationEmail(user.email, token, baseUrl);

    return NextResponse.json({ 
      data: { user }, 
      message: "Kayıt başarılı. Lütfen e-postanıza gönderilen bağlantıya tıklayarak hesabınızı doğrulayın." 
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues, message: "Geçersiz form verisi" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası", message: "Sunucu hatası" }, { status: 500 });
  }
}

