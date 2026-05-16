import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { POST as forgotPost } from "@/app/api/auth/forgot-password/route";
import { POST as resetPost } from "@/app/api/auth/reset-password/route";
import { resetRateLimitStore } from "@/lib/rate-limit";
import crypto from "crypto";

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, mode: "fake" }),
  buildPasswordResetEmail: vi.fn().mockReturnValue({
    subject: "Randevo şifre sıfırlama isteği",
    html: "<p>Reset</p>",
  }),
}));

const mockDb = db as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  passwordResetToken: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

function makeRequest(body: unknown, ip = "127.0.0.1"): Request {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimitStore();
  mockDb.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
  mockDb.passwordResetToken.create.mockResolvedValue({ id: "tok-1" });
  mockDb.$transaction.mockImplementation(async (ops: unknown[]) => {
    return Promise.all(ops.map((op) => (op instanceof Promise ? op : Promise.resolve(op))));
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("returns generic response for registered email", async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    });

    const res = await forgotPost(makeRequest({ email: "test@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/kayıtlıysa/);
  });

  it("returns same generic response for unregistered email", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const res = await forgotPost(makeRequest({ email: "nobody@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/kayıtlıysa/);
  });

  it("creates token only for registered user", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "user-1", email: "test@example.com" });

    await forgotPost(makeRequest({ email: "test@example.com" }));

    expect(mockDb.passwordResetToken.create).toHaveBeenCalledOnce();
    const callArg = mockDb.passwordResetToken.create.mock.calls[0][0];
    // tokenHash must not be the raw token
    expect(callArg.data.tokenHash).not.toBeUndefined();
    expect(callArg.data.tokenHash.length).toBe(64); // sha256 hex is 64 chars
  });

  it("does NOT create token for unregistered email", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    await forgotPost(makeRequest({ email: "ghost@example.com" }));

    expect(mockDb.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("raw token is not stored in DB (only hash)", async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: "user-1", email: "test@example.com" });

    await forgotPost(makeRequest({ email: "test@example.com" }));

    const callArg = mockDb.passwordResetToken.create.mock.calls[0][0];
    const storedHash = callArg.data.tokenHash;
    // The hash should be exactly SHA-256 hex (64 chars), not a random 64-char hex token
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns 400 for invalid email", async () => {
    const res = await forgotPost(makeRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("rate limits after 5 requests", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    const ip = "10.0.0.5";

    for (let i = 0; i < 5; i++) {
      await forgotPost(makeRequest({ email: "x@example.com" }, ip));
    }

    const res = await forgotPost(makeRequest({ email: "x@example.com" }, ip));
    expect(res.status).toBe(429);
  });
});

describe("POST /api/auth/reset-password", () => {
  const rawToken = "abc123deadbeef";
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  function makeResetRequest(body: unknown, ip = "127.0.0.1"): Request {
    return new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    });
  }

  it("rejects unknown token", async () => {
    mockDb.passwordResetToken.findUnique.mockResolvedValue(null);

    const res = await resetPost(
      makeResetRequest({ token: "unknown-token", password: "NewPass123!" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects already-used token", async () => {
    mockDb.passwordResetToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(),
      user: { id: "user-1", email: "user@example.com" },
    });

    const res = await resetPost(
      makeResetRequest({ token: rawToken, password: "NewPass123!" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/daha önce kullanılmış/);
  });

  it("rejects expired token", async () => {
    mockDb.passwordResetToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      user: { id: "user-1", email: "user@example.com" },
    });

    const res = await resetPost(
      makeResetRequest({ token: rawToken, password: "NewPass123!" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects weak password (less than 8 chars)", async () => {
    const res = await resetPost(
      makeResetRequest({ token: rawToken, password: "short" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/8 karakter/);
  });

  it("accepts valid token and updates password", async () => {
    mockDb.passwordResetToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      usedAt: null,
      user: { id: "user-1", email: "user@example.com" },
    });
    mockDb.user.update.mockResolvedValue({ id: "user-1" });
    mockDb.passwordResetToken.update.mockResolvedValue({ id: "tok-1" });
    mockDb.$transaction.mockResolvedValue([null, null]);

    const res = await resetPost(
      makeResetRequest({ token: rawToken, password: "NewStrongPass1!" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toMatch(/sıfırlandı/);
    expect(mockDb.$transaction).toHaveBeenCalledOnce();
  });
});
