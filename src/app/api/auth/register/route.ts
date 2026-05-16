import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { trackProductEvent } from "@/services/product-event.service";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    await trackProductEvent({
      eventName: "signup_started",
      userId: user.id,
      payloadSafe: { channel: "web" },
    });

    return NextResponse.json({ data: { user } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues, message: "Geçersiz form verisi" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası", message: "Sunucu hatası" }, { status: 500 });
  }
}

