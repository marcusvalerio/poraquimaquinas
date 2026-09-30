import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config shared by the middleware and the full server
 * config in auth.ts. It must not import Prisma, bcrypt or any Node-only
 * module: the middleware only needs to verify the JWT session cookie.
 */
export const authConfig = {
  // Vercel is detected automatically; any other host behind a reverse proxy
  // needs AUTH_TRUST_HOST=true so cookie/callback URLs resolve correctly.
  trustHost: process.env.AUTH_TRUST_HOST === "true" || Boolean(process.env.VERCEL),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
