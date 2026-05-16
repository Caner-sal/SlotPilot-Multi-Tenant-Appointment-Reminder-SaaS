import crypto from "crypto";

export function generateInviteTokenRaw(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function hashInviteToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
