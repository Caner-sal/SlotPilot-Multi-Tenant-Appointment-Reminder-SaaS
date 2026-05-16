import { SignJWT, jwtVerify } from "jose";

/**
 * JWT-based booking management tokens.
 * These allow customers to view/cancel their appointment
 * via a unique link without needing to log in.
 */

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-booking-token-secret-change-me"
);

const ISSUER = "randevo-booking";
const AUDIENCE = "booking-manage";

/**
 * Generate a signed JWT token for appointment management.
 * Token expires in 30 days (appointments are usually within that window).
 */
export async function generateBookingToken(appointmentId: string): Promise<string> {
  return new SignJWT({ appointmentId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

/**
 * Verify and decode a booking management token.
 * Returns the appointmentId if valid, null otherwise.
 */
export async function verifyBookingToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return (payload.appointmentId as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Build the full management URL for a booking.
 */
export function getBookingManageUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/booking/manage/${token}`;
}

const PORTAL_AUDIENCE = "customer-portal";

export async function generateCustomerPortalToken(customerId: string, slug: string): Promise<string> {
  return new SignJWT({ customerId, slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(PORTAL_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30m") // 30 minutes for magic link
    .sign(SECRET);
}

export async function verifyCustomerPortalToken(token: string): Promise<{ customerId: string; slug: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: ISSUER,
      audience: PORTAL_AUDIENCE,
    });
    return { customerId: payload.customerId as string, slug: payload.slug as string };
  } catch {
    return null;
  }
}

export function getCustomerPortalMagicLinkUrl(slug: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/booking/${slug}/portal/verify?token=${token}`;
}
