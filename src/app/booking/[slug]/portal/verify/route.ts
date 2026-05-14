import { verifyCustomerPortalToken } from "@/lib/booking-token";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL(`/booking/${slug}/portal?error=MissingToken`, req.url));
  }

  const payload = await verifyCustomerPortalToken(token);

  if (!payload || payload.slug !== slug) {
    return NextResponse.redirect(new URL(`/booking/${slug}/portal?error=InvalidToken`, req.url));
  }

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(`randevo_customer_session_${slug}`, payload.customerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/booking/${slug}`,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.redirect(new URL(`/booking/${slug}/portal/dashboard`, req.url));
}
