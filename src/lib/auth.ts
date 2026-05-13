import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          include: { staffProfile: { select: { id: true, organizationId: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          preferredLocale: user.preferredLocale ?? null,
          platformRole: user.platformRole,
          appRole: user.appRole,
          staffId: user.staffProfile?.id ?? null,
          staffOrgId: user.staffProfile?.organizationId ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          platformRole?: string;
          appRole?: string;
          staffId?: string | null;
          staffOrgId?: string | null;
          preferredLocale?: string | null;
        };
        token.id = user.id;
        token.platformRole = u.platformRole ?? "USER";
        token.appRole = u.appRole ?? "OWNER";
        token.staffId = u.staffId ?? null;
        token.staffOrgId = u.staffOrgId ?? null;
        token.preferredLocale = u.preferredLocale ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.platformRole) session.user.platformRole = token.platformRole as string;
      if (token.appRole) session.user.appRole = token.appRole as string;
      if (token.staffId) session.user.staffId = token.staffId as string;
      if (token.staffOrgId) session.user.staffOrgId = token.staffOrgId as string;
      if (token.preferredLocale) session.user.preferredLocale = token.preferredLocale as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      platformRole?: string;
      appRole?: string;
      staffId?: string;
      staffOrgId?: string;
      preferredLocale?: string;
    };
  }
}
