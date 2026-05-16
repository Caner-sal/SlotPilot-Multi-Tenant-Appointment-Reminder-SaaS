import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger redaction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redacts secret-like and pii keys recursively", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("payment failed", {
      requestId: "req_test_1",
      token: "tok_live_123",
      nested: {
        password: "my-password",
        customerEmail: "customer@example.com",
        customerPhone: "+905551112233",
        authorizationHeader: "Bearer super-secret",
      },
      rawHeaders: {
        cookie: "session=abc",
      },
    });

    expect(errorSpy).toHaveBeenCalledOnce();
    const line = String(errorSpy.mock.calls[0][0]);
    const payload = JSON.parse(line) as Record<string, unknown>;

    expect(payload.level).toBe("error");
    expect(payload.message).toBe("payment failed");
    expect(payload.requestId).toBe("req_test_1");
    expect(payload.token).toBe("[REDACTED]");

    const nested = payload.nested as Record<string, unknown>;
    expect(nested.password).toBe("[REDACTED]");
    expect(nested.authorizationHeader).toBe("[REDACTED]");
    expect(nested.customerEmail).toBe("[REDACTED]");
    expect(nested.customerPhone).toBe("[REDACTED]");

    const rawHeaders = payload.rawHeaders as Record<string, unknown>;
    expect(rawHeaders.cookie).toBe("[REDACTED]");
  });
});
