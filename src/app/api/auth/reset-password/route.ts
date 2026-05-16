import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

export async function POST(req: Request) {
  const ip = getClientIp(req.headers as Headers);
  const rateLimit = consumeRateLimit({
    key: `auth:reset:${ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Çok fazla istek. Lütfen bekleyin." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  let token: string;
  let password: string;
  try {
    const body = await req.json();
    ({ token, password } = schema.parse(body));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Geçersiz istek" }, { status: 400 });
    }
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı" }, { status: 400 });
  }

  if (resetToken.usedAt !== null) {
    return NextResponse.json({ error: "Bu bağlantı daha önce kullanılmış" }, { status: 400 });
  }

  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message: "Şifreniz başarıyla sıfırlandı" }, { status: 200 });
}
