import crypto from "node:crypto";

export type MobileAccessTokenClaims = {
  sub: string;
  organizationId: string;
  role: "OWNER" | "STAFF_MEMBER";
  scope: string[];
  exp: number;
  jti: string;
  email: string;
  platformRole: "USER" | "SUPERADMIN";
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

function getJwtSecret(): string {
  const secret = process.env.MOBILE_JWT_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "[mobile-jwt] MOBILE_JWT_SECRET (veya AUTH_SECRET) zorunludur. " +
        "Secret olmadan çalışmak yasaktır.",
    );
  }
  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer.toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function hmacSha256(input: string) {
  return crypto.createHmac("sha256", getJwtSecret()).update(input).digest("base64url");
}

export function buildMobileScope(role: "OWNER" | "STAFF_MEMBER"): string[] {
  if (role === "STAFF_MEMBER") {
    return ["appointments:read", "analytics:read", "calendar:read", "push:write"];
  }
  return [
    "appointments:read",
    "appointments:write",
    "analytics:read",
    "calendar:read",
    "push:write",
    "admin:mobile",
  ];
}

export function issueMobileAccessToken(input: {
  userId: string;
  email: string;
  organizationId: string;
  role: "OWNER" | "STAFF_MEMBER";
  platformRole: "USER" | "SUPERADMIN";
}): { accessToken: string; expiresIn: number; claims: MobileAccessTokenClaims } {
  const now = Math.floor(Date.now() / 1000);
  const claims: MobileAccessTokenClaims = {
    sub: input.userId,
    email: input.email,
    organizationId: input.organizationId,
    role: input.role,
    platformRole: input.platformRole,
    scope: buildMobileScope(input.role),
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signature = hmacSha256(`${encodedHeader}.${encodedPayload}`);

  return {
    accessToken: `${encodedHeader}.${encodedPayload}.${signature}`,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    claims,
  };
}

export function verifyMobileAccessToken(token: string): MobileAccessTokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expected = hmacSha256(`${encodedHeader}.${encodedPayload}`);
  if (signature !== expected) return null;

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string };
    if (header.alg !== "HS256") return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as MobileAccessTokenClaims;
    if (!payload?.sub || !payload.organizationId || !payload.role || !Array.isArray(payload.scope)) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateRefreshToken() {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
  return { refreshToken, jti, expiresAt };
}

export function hashRefreshToken(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}
