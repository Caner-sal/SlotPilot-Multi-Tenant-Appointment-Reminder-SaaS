import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export type ProductEventName =
  | "signup_started"
  | "organization_created"
  | "service_created"
  | "first_booking_created"
  | "plan_upgrade_clicked";

export async function trackProductEvent(input: {
  eventName: ProductEventName;
  userId?: string | null;
  organizationId?: string | null;
  payloadSafe?: Record<string, unknown>;
}) {
  try {
    await db.productEvent.create({
      data: {
        eventName: input.eventName,
        userId: input.userId ?? null,
        organizationId: input.organizationId ?? null,
        payloadSafe: input.payloadSafe
          ? (input.payloadSafe as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (err) {
    logger.warn("product event write failed", {
      route: "product-event",
      outcome: "write_failed",
      eventName: input.eventName,
      err,
    });
  }
}
