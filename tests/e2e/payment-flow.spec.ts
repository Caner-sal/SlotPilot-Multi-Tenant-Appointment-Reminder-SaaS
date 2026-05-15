import { expect, test } from "@playwright/test";

type BookingService = {
  id: string;
  depositRequired?: boolean;
  staffServices?: Array<{ staff?: { id?: string; isActive?: boolean } }>;
};

type Slot = {
  startTime: string;
  endTime: string;
  label: string;
};

const slug = "barber-demo";

test.describe("Payment fake/sandbox smoke", () => {
  test("creates a public booking and starts checkout session", async ({ request }) => {
    const servicesRes = await request.get(`/api/booking/${slug}/services`);
    expect(servicesRes.ok()).toBeTruthy();
    const servicesBody = (await servicesRes.json()) as { data?: BookingService[] };

    const services = servicesBody.data ?? [];
    const service = services.find(
      (s) => s.depositRequired && (s.staffServices ?? []).some((ss) => !!ss.staff?.id && ss.staff?.isActive !== false)
    );
    const fallbackService = services.find((s) =>
      (s.staffServices ?? []).some((ss) => !!ss.staff?.id && ss.staff?.isActive !== false)
    );
    const selectedService = service ?? fallbackService;
    expect(selectedService).toBeTruthy();

    const staffId = selectedService!.staffServices?.find((ss) => !!ss.staff?.id)?.staff?.id;
    expect(staffId).toBeTruthy();

    let chosenSlot: string | null = null;
    for (let offset = 0; offset < 14 && !chosenSlot; offset++) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const slotsRes = await request.get(
        `/api/booking/${slug}/slots?serviceId=${selectedService!.id}&staffId=${staffId}&date=${date.toISOString()}`
      );
      if (!slotsRes.ok()) continue;
      const slotsBody = (await slotsRes.json()) as { data?: Slot[] };
      const first = slotsBody.data?.[0]?.startTime;
      if (first) chosenSlot = first;
    }

    expect(chosenSlot).toBeTruthy();

    const bookingRes = await request.post(`/api/booking/${slug}/appointments`, {
      data: {
        serviceId: selectedService!.id,
        staffId,
        startTime: chosenSlot,
        customerName: "Playwright Test Customer",
        customerEmail: `pw-${Date.now()}@example.com`,
        privacyNoticeAcknowledged: true,
        appointmentNotificationConsent: true,
        marketingConsent: false,
      },
    });
    if (bookingRes.status() === 403) {
      const bookingError = (await bookingRes.json()) as { error?: string };
      expect(typeof bookingError.error).toBe("string");
      return;
    }
    expect(bookingRes.status()).toBe(201);
    const bookingBody = (await bookingRes.json()) as { data?: { id?: string } };
    const appointmentId = bookingBody.data?.id;
    expect(appointmentId).toBeTruthy();

    const checkoutRes = await request.post(`/api/booking/${slug}/checkout-session`, {
      data: { appointmentId },
    });
    expect([200, 400]).toContain(checkoutRes.status());
    const checkoutBody = (await checkoutRes.json()) as { data?: { sessionId?: string; url?: string } };

    if (service) {
      expect(checkoutRes.status()).toBe(200);
      expect(checkoutBody.data?.sessionId).toBeTruthy();
      expect(checkoutBody.data?.url).toBeTruthy();
      return;
    }

    expect(checkoutRes.status()).toBe(400);
  });
});
