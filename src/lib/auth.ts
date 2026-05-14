import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Dinamik import: Edge Runtime'da middleware derleme aşamasında
        // PrismaClient yüklenmez, sadece gerçek authorize çağrısında yüklenir
        const { db } = await import("@/lib/db");
        const bcrypt = (await import("bcryptjs")).default;

        const user = await db.user.findUnique({
          where: { email },
          include: { staffProfile: { select: { id: true, organizationId: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified) {
          class UnverifiedEmailError extends CredentialsSignin {
            code = "unverified_email";
          }
          throw new UnverifiedEmailError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
        const u = user as { platformRole?: string; appRole?: string; staffId?: string | null; staffOrgId?: string | null };
        token.id = user.id;
        token.platformRole = u.platformRole ?? "USER";
        token.appRole = u.appRole ?? "OWNER";
        token.staffId = u.staffId ?? null;
        token.staffOrgId = u.staffOrgId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.platformRole) session.user.platformRole = token.platformRole as string;
      if (token.appRole) session.user.appRole = token.appRole as string;
      // staffId ve staffOrgId null olabilir — undefined yerine açıkça atanmalı
      session.user.staffId = (token.staffId as string) ?? undefined;
      session.user.staffOrgId = (token.staffOrgId as string) ?? undefined;
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
    };
  }
}
