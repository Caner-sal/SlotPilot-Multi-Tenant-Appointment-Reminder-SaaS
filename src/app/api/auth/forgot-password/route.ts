import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const RESET_TOKEN_EXPIRES_MS = 30 * 60 * 1000; // 30 minutes
const RESET_TOKEN_EXPIRES_MINUTES = 30;

const schema = z.object({
  email: z.string().email(),
});

const GENERIC_RESPONSE = {
  message:
    "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
};

export async function POST(req: Request) {
  const ip = getClientIp(req.headers as Headers);
  const rateLimit = consumeRateLimit({
    key: `auth:forgot:${ip}`,
    limit: 5,
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

  let email: string;
  try {
    const body = await req.json();
    ({ email } = schema.parse(body));
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    // Delete any existing unused tokens for this user
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRES_MS),
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password/${rawToken}`;

    const { subject, html } = buildPasswordResetEmail({
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES,
    });

    await sendEmail({ to: email, subject, html });
  }

  // Always return generic response to prevent account enumeration
  return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
}
