import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export type EdgeSession = {
  id: string;
  email: string;
  platformRole: string;
  appRole: string;
  staffId: string | null;
  staffOrgId: string | null;
  preferredLocale: string | null;
} | null;

export async function getEdgeSession(req: NextRequest): Promise<EdgeSession> {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) return null;
  return {
    id: (token.id as string) ?? "",
    email: (token.email as string) ?? "",
    platformRole: (token.platformRole as string) ?? "USER",
    appRole: (token.appRole as string) ?? "OWNER",
    staffId: (token.staffId as string | null) ?? null,
    staffOrgId: (token.staffOrgId as string | null) ?? null,
    preferredLocale: (token.preferredLocale as string | null) ?? null,
  };
}
