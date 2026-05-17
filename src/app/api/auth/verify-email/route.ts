import { NextResponse } from "next/server";
import { globalRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!globalRateLimiter.isAllowed(ip, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Bu doğrulama akışı şu anda devre dışı.",
        message: "E-posta doğrulama endpointi bu sürümde kullanılmıyor.",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
