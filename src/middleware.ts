import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
  runtime: "nodejs",
  matcher: ["/admin/:path*"],
};
