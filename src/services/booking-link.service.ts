// NEXT_PUBLIC_BOOKING_BASE_URL already includes the /booking path segment.
// NEXT_PUBLIC_APP_URL is the raw app root, so /booking is appended.
export function getBookingUrl(orgSlug: string): string {
  if (process.env.NEXT_PUBLIC_BOOKING_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BOOKING_BASE_URL}/${orgSlug}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/booking/${orgSlug}`;
}
