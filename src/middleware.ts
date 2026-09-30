import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Runs on the default (Edge) middleware runtime: it only verifies the JWT
// cookie, so it uses the edge-safe config without Prisma/bcrypt. Every admin
// page and mutation also re-checks the session on the server (requireAdmin).
const { auth } = NextAuth(authConfig);

// Only the admin area is protected; /equipamento/{qr} stays public.
export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
