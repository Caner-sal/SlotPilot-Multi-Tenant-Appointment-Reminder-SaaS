import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/booking/[slug]/chat/route";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

const mockFindUnique = vi.mocked(db.organization.findUnique);

const buildOrg = (overrides = {}) => ({
  name: "Test Salon",
  description: "A test salon",
  faqText: null,
  aiChatbotEnabled: true,
  suspended: false,
  bookingEnabled: true,
  phone: null,
  address: null,
  ...overrides,
});

function makeRequest(body: unknown, slug = "test-salon") {
  return new Request(`http://localhost/api/booking/${slug}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function callPOST(body: unknown, slug = "test-salon") {
  const req = makeRequest(body, slug);
  const params = Promise.resolve({ slug });
  return POST(req, { params });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("AI Chatbot API", () => {
  it("returns 404 when aiChatbotEnabled is false", async () => {
    mockFindUnique.mockResolvedValue(buildOrg({ aiChatbotEnabled: false }) as never);

    const res = await callPOST({ message: "Hello" });
    const json = await res.json() as { error: string };

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/not enabled/i);
  });

  it("returns mock reply when AI_PROVIDER is DISABLED", async () => {
    vi.stubEnv("AI_PROVIDER", "DISABLED");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    mockFindUnique.mockResolvedValue(buildOrg() as never);

    const res = await callPOST({ message: "What are your hours?" });
    const json = await res.json() as { data: { reply: string; mock: boolean } };

    expect(res.status).toBe(200);
    expect(json.data.mock).toBe(true);
    expect(typeof json.data.reply).toBe("string");
    expect(json.data.reply.length).toBeGreaterThan(0);
  });

  it("returns 400 when message is missing", async () => {
    mockFindUnique.mockResolvedValue(buildOrg() as never);

    const res = await callPOST({});
    const json = await res.json() as { error: string };

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/message/i);
  });
});
