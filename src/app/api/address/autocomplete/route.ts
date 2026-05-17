import { NextResponse } from "next/server";
import { z } from "zod";
import { autocompleteAddress, enforceAutocompleteRateLimit } from "@/services/address/address-search.service";
import { db } from "@/lib/db";

const querySchema = z.object({
  q: z.string().min(1),
  countryCode: z.string().length(2).optional(),
  locale: z.string().min(2).max(10).optional(),
  sessionToken: z.string().min(1).max(200).optional(),
});

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    countryCode: searchParams.get("countryCode") ?? undefined,
    locale: searchParams.get("locale") ?? undefined,
    sessionToken: searchParams.get("sessionToken") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid autocomplete query" }, { status: 400 });
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";
    enforceAutocompleteRateLimit(ip);

    const data = await autocompleteAddress({
      query: parsed.data.q,
      countryCode: parsed.data.countryCode,
      locale: parsed.data.locale,
      sessionToken: parsed.data.sessionToken,
    });
    // Non-blocking log — DB yazma hatası arama sonucunu engellemesin
    db.addressProviderLog
      .create({
        data: {
          provider: process.env.ADDRESS_PROVIDER ?? "manual",
          query: parsed.data.q,
          countryCode: parsed.data.countryCode,
          status: "SUCCESS",
          resultCount: data.length,
        },
      })
      .catch((logErr: unknown) => {
        console.warn(
          "[address/autocomplete] log write failed",
          logErr instanceof Error ? logErr.message : logErr,
        );
      });
    return NextResponse.json({ data });
  } catch (error) {
    // Non-blocking error log — ikinci DB hatası olsa bile yanıt dönülür
    db.addressProviderLog
      .create({
        data: {
          provider: process.env.ADDRESS_PROVIDER ?? "manual",
          query: parsed.data.q,
          countryCode: parsed.data.countryCode,
          status: error instanceof Error && error.message === "RATE_LIMITED" ? "RATE_LIMITED" : "ERROR",
          resultCount: 0,
          errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Autocomplete failed",
        },
      })
      .catch((logErr: unknown) => {
        console.warn(
          "[address/autocomplete] error log write failed",
          logErr instanceof Error ? logErr.message : logErr,
        );
      });

    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return NextResponse.json({ error: "Konum önerileri şu anda alınamadı." }, { status: 500 });
  }
}
