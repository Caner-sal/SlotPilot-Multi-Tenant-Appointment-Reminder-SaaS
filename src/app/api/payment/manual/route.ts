import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/services/payment/payment.factory";
import { z } from "zod";

const manualPaymentSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().default("TRY"),
  description: z.string().min(1),
  customerEmail: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = manualPaymentSchema.parse(body);

    const provider = getPaymentProvider();

    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: "Ödeme sağlayıcısı yapılandırılmamış." },
        { status: 503 }
      );
    }

    const result = await provider.createPayment(parsed);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Ödeme oluşturulamadı." }, { status: 500 });
  }
}
