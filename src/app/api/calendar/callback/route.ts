import { db } from "@/lib/db";
import { getCalendarProvider } from "@/services/calendar/calendar.factory";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // organizationId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/settings?calendarError=access_denied", req.url));
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const org = await db.organization.findUnique({ where: { id: state } });
  if (!org) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  try {
    const provider = getCalendarProvider();
    const tokens = await provider.exchangeCode(code);

    const providerName = process.env.CALENDAR_PROVIDER ?? "FAKE";
    const existing = await db.calendarConnection.findFirst({
      where: { organizationId: state, provider: providerName },
    });

    if (existing) {
      await db.calendarConnection.update({
        where: { id: existing.id },
        data: {
          accessTokenEncrypted: tokens.accessToken,
          refreshTokenEncrypted: tokens.refreshToken ?? undefined,
          expiresAt: tokens.expiresAt,
          isActive: true,
        },
      });
    } else {
      await db.calendarConnection.create({
        data: {
          organizationId: state,
          provider: providerName,
          accessTokenEncrypted: tokens.accessToken,
          refreshTokenEncrypted: tokens.refreshToken ?? null,
          expiresAt: tokens.expiresAt,
          calendarId: "primary",
          isActive: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard/settings?calendarConnected=true", req.url));
  } catch (err) {
    console.error("Calendar callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings?calendarError=token_exchange_failed", req.url));
  }
}
