import crypto from "crypto";
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  SubscriptionCheckoutInput,
  SubscriptionCheckoutResult,
} from "./payment-provider.interface";
import { IYZICO_PLAN_MAPPING } from "@/config/payment-provider-mapping";

// iyzico subscription checkout integration
// Docs: https://dev.iyzipay.com/tr/subscription
export class IyzicoProvider implements PaymentProvider {
  readonly name = "IYZICO";

  private get apiKey(): string {
    return process.env.IYZICO_API_KEY ?? "";
  }
  private get secretKey(): string {
    return process.env.IYZICO_SECRET_KEY ?? "";
  }
  private get baseUrl(): string {
    return process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
  }

  isConfigured(): boolean {
    return !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
  }

  // PKI string builder for iyzico request signature
  private buildAuthorizationHeader(requestBody: string): string {
    const randomKey = crypto.randomBytes(12).toString("hex");
    const dataToSign = this.apiKey + randomKey + this.secretKey + requestBody;
    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(dataToSign)
      .digest("base64");
    return `IYZWSv2 apiKey:${this.apiKey}&randomKey:${randomKey}&signature:${signature}`;
  }

  async createPayment(_params: CreatePaymentParams): Promise<PaymentResult> {
    throw new Error(
      "iyzico createPayment (appointment deposit) is not implemented. Use createSubscriptionCheckout for subscription billing."
    );
  }

  async createSubscriptionCheckout(
    input: SubscriptionCheckoutInput
  ): Promise<SubscriptionCheckoutResult> {
    if (!this.isConfigured()) {
      throw new Error(
        "iyzico is not configured. Set IYZICO_API_KEY and IYZICO_SECRET_KEY environment variables."
      );
    }

    const mapping = IYZICO_PLAN_MAPPING[input.planId];
    if (!mapping) {
      throw new Error(
        `No iyzico plan mapping found for plan: ${input.planId}. Add it to src/config/payment-provider-mapping.ts`
      );
    }

    // iyzico Subscription Checkout Form Initialize
    // API: POST /onboarding/v2/subscription/checkoutform/initialize
    const requestBody = JSON.stringify({
      locale: input.locale === "tr" ? "tr" : "en",
      conversationId: input.conversationId,
      callbackUrl: input.successUrl,
      pricingPlanReferenceCode: mapping.pricingPlanReferenceCode,
      subscriptionInitialStatus: "ACTIVE",
      customer: {
        name: "Customer",
        surname: "",
        email: input.customerEmail ?? "",
        gsmNumber: "",
        billingAddress: {
          contactName: "Customer",
          city: "Istanbul",
          country: "Turkey",
          address: "TR",
        },
        shippingAddress: {
          contactName: "Customer",
          city: "Istanbul",
          country: "Turkey",
          address: "TR",
        },
        identityNumber: "11111111111",
      },
    });

    const authHeader = this.buildAuthorizationHeader(requestBody);

    const response = await fetch(
      `${this.baseUrl}/onboarding/v2/subscription/checkoutform/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: requestBody,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`iyzico API error ${response.status}: ${text}`);
    }

    const data = await response.json() as {
      status: string;
      errorCode?: string;
      errorMessage?: string;
      checkoutFormContent?: string;
      token?: string;
    };

    if (data.status !== "success") {
      throw new Error(
        `iyzico checkout failed: [${data.errorCode ?? "UNKNOWN"}] ${data.errorMessage ?? "Unknown error"}`
      );
    }

    return {
      provider: "IYZICO",
      checkoutHtml: data.checkoutFormContent,
      providerSessionId: data.token ?? input.conversationId,
      conversationId: input.conversationId,
      mode: this.baseUrl.includes("sandbox") ? "test" : "live",
    };
  }
}
