import { describe, it, expect, afterEach } from "vitest";
import { getBookingUrl } from "@/services/booking-link.service";

describe("getBookingUrl", () => {
  const originalBookingBase = process.env.NEXT_PUBLIC_BOOKING_BASE_URL;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (originalBookingBase !== undefined) {
      process.env.NEXT_PUBLIC_BOOKING_BASE_URL = originalBookingBase;
    } else {
      delete process.env.NEXT_PUBLIC_BOOKING_BASE_URL;
    }
    if (originalAppUrl !== undefined) {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    } else {
      delete process.env.NEXT_PUBLIC_APP_URL;
    }
  });

  it("uses NEXT_PUBLIC_BOOKING_BASE_URL when set", () => {
    process.env.NEXT_PUBLIC_BOOKING_BASE_URL = "https://randevo.com/booking";
    delete process.env.NEXT_PUBLIC_APP_URL;
    // Base already includes /booking; function appends /orgSlug directly
    expect(getBookingUrl("barber-demo")).toBe("https://randevo.com/booking/barber-demo");
  });

  it("falls back to NEXT_PUBLIC_APP_URL when NEXT_PUBLIC_BOOKING_BASE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_BASE_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app.randevo.com";
    expect(getBookingUrl("berber-istanbul")).toBe("https://app.randevo.com/booking/berber-istanbul");
  });

  it("falls back to localhost when neither env is set", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_BASE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getBookingUrl("test-shop")).toBe("http://localhost:3000/booking/test-shop");
  });

  it("appends org slug correctly to base URL", () => {
    process.env.NEXT_PUBLIC_BOOKING_BASE_URL = "http://localhost:3000/booking";
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getBookingUrl("ekin-guzellik")).toBe("http://localhost:3000/booking/ekin-guzellik");
  });
});
