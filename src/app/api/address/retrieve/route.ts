import { NextResponse } from "next/server";
import { z } from "zod";
import { retrieveAddress } from "@/services/address/address-search.service";
import { db } from "@/lib/db";

const bodySchema = z.object({
  placeId: z.string().min(1),
  locale: z.string().min(2).max(10).optional(),
  sessionToken: z.string().min(1).max(200).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid retrieve payload" }, { status: 400 });
  }

  try {
    const data = await retrieveAddress(parsed.data);
    // Non-blocking log — DB yazma hatası adres alımını engellemesin
    db.addressProviderLog
      .create({
        data: {
          provider: process.env.ADDRESS_PROVIDER ?? "manual",
          query: parsed.data.placeId,
          countryCode: data.countryCode,
          status: "RETRIEVE_SUCCESS",
          resultCount: 1,
        },
      })
      .catch((logErr: unknown) => {
        console.warn(
          "[address/retrieve] log write failed",
          logErr instanceof Error ? logErr.message : logErr,
        );
      });
    return NextResponse.json({ data });
  } catch (error) {
    // Non-blocking error log
    db.addressProviderLog
      .create({
        data: {
          provider: process.env.ADDRESS_PROVIDER ?? "manual",
          query: parsed.data.placeId,
          status: "RETRIEVE_ERROR",
          resultCount: 0,
          errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Retrieve failed",
        },
      })
      .catch((logErr: unknown) => {
        console.warn(
          "[address/retrieve] error log write failed",
          logErr instanceof Error ? logErr.message : logErr,
        );
      });
    return NextResponse.json({ error: "Adres bilgisi şu anda alınamadı." }, { status: 500 });
  }
}
