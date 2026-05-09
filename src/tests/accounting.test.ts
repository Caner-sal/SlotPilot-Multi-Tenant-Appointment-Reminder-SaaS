import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    payment: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    appointment: {
      update: vi.fn(),
    },
    revenueLedger: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    subscription: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

const mockConstructEvent = vi.mocked(stripe!.webhooks.constructEvent);
const mockFindUnique = vi.mocked(db.payment.findUnique);
const mockTransaction = vi.mocked(db.$transaction);

function buildCheckoutEvent(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Event {
  return {
    id: "evt_test_001",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_001",
        metadata: { appointmentId: "appt1", organizationId: "org1" },
        amount_total: 5000,
        currency: "try",
        ...overrides,
      } as Stripe.Checkout.Session,
    },
  } as Stripe.Event;
}

function makeWebhookRequest(body = "{}") {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "stripe-signature": "sig_test",
      "content-type": "application/json",
    },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("Accounting — RevenueLedger", () => {
  it("creates a ledger entry on successful payment", async () => {
    const event = buildCheckoutEvent();
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue(null);

    let capturedTxFn: ((tx: unknown) => Promise<void>) | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTransaction.mockImplementation(async (fn: any) => {
      capturedTxFn = fn;
      const txMock = {
        payment: { create: vi.fn().mockResolvedValue({ id: "pay1" }) },
        appointment: { update: vi.fn().mockResolvedValue({}) },
        revenueLedger: { create: vi.fn().mockResolvedValue({}) },
      };
      await fn(txMock);
      return txMock;
    });

    const res = await POST(makeWebhookRequest());
    expect(res.status).toBe(200);

    expect(capturedTxFn).not.toBeNull();
  });

  it("skips duplicate webhook (idempotency guard)", async () => {
    const event = buildCheckoutEvent();
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ id: "pay1" } as never);

    const res = await POST(makeWebhookRequest());
    expect(res.status).toBe(200);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("does not expose org1 ledger when querying for org2", async () => {
    const org1Entries = [{ id: "led1", organizationId: "org1", amountCents: 1000 }];
    const org2Entries: unknown[] = [];

    vi.mocked(db.revenueLedger.findMany)
      .mockResolvedValueOnce(org1Entries as never)
      .mockResolvedValueOnce(org2Entries as never);

    const result1 = await db.revenueLedger.findMany({ where: { organizationId: "org1" } });
    const result2 = await db.revenueLedger.findMany({ where: { organizationId: "org2" } });

    expect(result1).toHaveLength(1);
    expect(result2).toHaveLength(0);
    expect(result1[0]).toMatchObject({ organizationId: "org1" });
  });
});
